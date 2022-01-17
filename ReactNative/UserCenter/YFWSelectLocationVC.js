import React from 'react'
import {
    Dimensions,
    Text,
    View,
    TouchableOpacity,
    Image,
    ScrollView,
    NativeModules,
    NativeEventEmitter,
    FlatList,
    Platform,
    DeviceEventEmitter
} from 'react-native'
import {backGroundColor, darkLightColor, separatorColor,yfwGreenColor,darkTextColor,darkNomalColor} from "../Utils/YFWColor";
import {doAfterLogin, pushNavigation} from "../Utils/YFWJumpRouting";
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import LoadProgress from "../widget/LoadProgress";
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import YFWNativeManager from "../Utils/YFWNativeManager";
import StatusView from '../widget/StatusView'
import {isNotEmpty, itemAddKey, kScreenWidth, kScreenHeight, darkStatusBar, safe} from '../PublicModule/Util/YFWPublicFunction'
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
const { YFWEventManager } = NativeModules;
const  iOSManagerEmitter = new NativeEventEmitter(YFWEventManager);

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
import AndroidHeaderBottomLine from '../widget/AndroidHeaderBottomLine'
import YFWAddressModel from "./Model/YFWAddressModel";
import YFWToast from '../Utils/YFWToast'
import {getCityRegionId} from "../Utils/YFWInitializeRequestFunction";


/**
 * 首页选择地址页面
 */
export default class YFWSelectLocationVC extends React.Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "选择收货地址",
        headerRight:<View style={{width:50}}/>,
    });

    constructor(props) {
        super(props)
        this.state = {
            data : null,
            location:'上海市',
            isFirst:true
        }
        this._request()
        this.listener();
    }

    listener() {
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                if(this.state.isFirst)
                    return
                this._request();
            }
        );
    }

    componentDidMount(){
        this.statusView&&this.statusView.dismiss();
        this.state.isFirst = false;
        let that = this;
        darkStatusBar();
        this.fixedPosition()
        this.AddressListener = iOSManagerEmitter.addListener('addressNotification',(data)=>{
            that.props.navigation.goBack();
        });
        if (Platform.OS == 'android') {
            this.getLocationData = DeviceEventEmitter.addListener('locationData', (msg)=> {
                that.props.navigation.pop();
            });
        }
    }

    componentWillUnmount() {
        this.AddressListener.remove();
        this.getLocationData&&this.getLocationData.remove();
    }

    /**
     * 是否定位成功
     */
    fixedPosition(){
        YFWNativeManager.chooseLocationData((locationData)=>{
            let address = ''
            if (isNotEmpty(locationData.name)) {
                address = locationData.name;
            } else {
                address = '上海市'
            }
            //根据城市中文名获取ID
            getCityRegionId(address)
            YFWUserInfoManager.ShareInstance().setAddress(address)
            this.setState({
                location: address
            })
        },()=>{
            YFWToast('获取定位失败，请开启定位权限')
        })
    }

    /**
     * 如果已登录获取收获地址
     * @private
     */
    _request(){
        let userInfo = YFWUserInfoManager.ShareInstance();
        if(!userInfo.hasLogin()){
            this.statusView&&this.statusView.dismiss();
            return
        }
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.address.getReceiptAddress');
        paramMap.set('pageSize', 20);
        paramMap.set('pageIndex', 1);
        viewModel.TCPRequest(paramMap, (res) => {
            this.statusView && this.statusView.dismiss();
            let data = itemAddKey(YFWAddressModel.getModelArray(res.result));
            this.setState({
                data: data,
            })
        }, (error) => {
            this.statusView && this.statusView.dismiss()
        }, false)
    }

    render() {
        return (
            <View style = {[BaseStyles.container]}>
                <AndroidHeaderBottomLine/>
                <FlatList
                    data={this.state.data}
                    renderItem={this._renderItem}
                    ListHeaderComponent={this._renderHeaderView.bind(this)}
                    ListFooterComponent={this._renderButton.bind(this)}
                />

                <StatusView ref={(m)=>{this.statusView = m}} retry={()=>{this._request();}}/>
            </View>
        )
    }

    _renderHeaderView(){

        return (
            <View style={{flex:1}}>
                {this._renderTitleHeader('当前位置')}
                <View style = {{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: "center",
                    backgroundColor:'white',
                    paddingLeft: 10,
                    paddingRight: 10,
                    height: 50,
                    width: width
                }}>
                    <TouchableOpacity activeOpacity={1} style={{flex:2}} onPress={()=>{this.clickMyLocation()}} >
                        <Text style = {{fontSize: 14, color: darkTextColor()}}>{this.state.location}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} style={{flex:1}} onPress={this._startResetLocaiton}>
                        <View style = {{flexDirection: 'row', alignItems:'center'}}>
                            <View style={{flex:1}}/>
                            <Image source = {require('../../img/location_icon.png')} style={{resizeMode:'contain',width:16,height:16}} />
                            <Text style = {{marginLeft:5,fontSize: 14, color:yfwGreenColor()}}>重新定位</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                {this._renderTitleHeader('收货地址')}
            </View>
        );

    }


    _renderTitleHeader(title){

        return (
            <View style={[BaseStyles.leftCenterView,{height: 40, width: width,backgroundColor: backGroundColor()}]}>
                <Text style={{paddingLeft:10,fontSize:14,textAlignVertical: 'center',color:darkLightColor()}}>{title}</Text>
            </View>
        );

    }

    _renderItem=(item)=>{
        return (
            <TouchableOpacity activeOpacity={1} onPress={()=>this.clicCityItem(item.item)}>
                <View style={{height:70,backgroundColor:'white',justifyContent:'center'}}>
                    <View style={{flexDirection:'row',marginLeft:10,width:kScreenWidth-20}}>
                        <Text style={{color:darkTextColor(),fontSize:14}}>{item.item.name}</Text>
                        <Text style={{color:darkTextColor(),fontSize:14,marginLeft:10}}>{item.item.mobile}</Text>
                    </View>
                    <Text style={{color:darkLightColor(),marginTop: 10,marginLeft:10,fontSize:14,width:kScreenWidth-20}} numberOfLines={1}>{item.item.address}</Text>
                </View>
                <View style={[BaseStyles.separatorStyle]}/>
            </TouchableOpacity>
        )
    }

    _renderButton() {
        let userInfo = YFWUserInfoManager.ShareInstance();
        if (userInfo.hasLogin()) {
            //登录
            return this._renderHasLogin()
        } else {
            //未登录
            return this._renderNotLogin()
        }
    }

    _renderHasLogin() {
        return (
            <TouchableOpacity activeOpacity={1} style={[BaseStyles.centerItem,{height:70}]} onPress = {this._startAddressManage}>
                <View style={[BaseStyles.centerItem,{borderRadius: 4,backgroundColor:yfwGreenColor(),width: width-60,height: 40,}]}>
                    <Text style={{textAlign: 'center',color:'white'}}>管理收货地址</Text>
                </View>
            </TouchableOpacity>
        )
    }

    _renderNotLogin() {
        return (
            <View style={{flex:1}}>
                <View style = {{height: 250, backgroundColor: '#fff',justifyContent:'center', alignItems: 'center'}}>
                    <View style = {{flexDirection: 'row',justifyContent:'center',alignItems:'center', height: 50}}>
                        <Image source = {require("../../img/uc_tousu.png")} style = {{width: 35, height: 35, resizeMode: 'contain'}} />
                        <View style = {{marginLeft: 10, justifyContent:'space-between'}}>
                            <Text style = {{color: darkLightColor(), fontSize: 16}}>您还没有登录!</Text>
                            <Text style = {{color: darkLightColor(), fontSize: 13,marginTop:8}}>登录即可自动获取您的收货地址。</Text>
                        </View>
                    </View>
                    <TouchableOpacity activeOpacity={1} onPress = {this._startLogin}>
                        <View style={[BaseStyles.centerItem,{width: 120,marginTop:15 ,height: 35,backgroundColor: '#16c08e',borderRadius: 3}]}>
                            <Text style = {{color:'white',fontSize:16}}>登录</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{height:kScreenHeight-400,backgroundColor:'white'}}/>
            </View>

        )
    }


    clickMyLocation(){

        let lat = YFWUserInfoManager.ShareInstance().latitude;
        let lng = YFWUserInfoManager.ShareInstance().longitude;

        this._saveLocation(this.state.location,lat,lng);

    }


    clicCityItem(item){

        let lat = item.address_latitude?item.address_latitude:item.lat;
        let lng = item.address_longitude?item.address_longitude:item.lng;

        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'guest.sys_region.getSiblingOrChildrenListById');
        paramMap.set('regionid', item.region_id);
        viewModel.TCPRequest(paramMap, (res) => {

            let result = res.result;
            let city = '';
            if (isNotEmpty(result) && result.length > 0) {
                result.forEach((region_item, index) => {
                    if (region_item.id == item.region_id) {
                        city = region_item.region_name;
                    }
                });
                if (city.length == 0) {
                    let region = result[0];
                    city = region.region_name;
                }

            }

            this._saveLocation(city, lat, lng);
        });
    }

    _startLogin=()=>{
        let {navigate} = this.props.navigation
        doAfterLogin(navigate)
    }

    _startAddressManage = () => {
        let {navigate} = this.props.navigation
        pushNavigation(navigate, {type: 'address_manager'})
    }

    /**
     * 保存地址
     * @private
     */
    _saveLocation=(address,lat,lng)=>{
        let {goBack} = this.props.navigation

        let data = {address:safe(address) , lat:safe(lat) , lng:safe(lng)};
        DeviceEventEmitter.emit('get_change_location',data);

        goBack()
    }


    /**
     * 跳转重新定位
     * @private
     */
    _startResetLocaiton=()=>{
        YFWNativeManager.jumpToChooseAddress();
    }
}