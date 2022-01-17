import React from 'react'
import {
    Dimensions,
    Text,
    View,
    TouchableOpacity,
    Image,
    TextInput,
    NativeModules,
    NativeEventEmitter,
    Platform,
    DeviceEventEmitter
} from 'react-native'
import {backGroundColor, darkLightColor, separatorColor,yfwGreenColor,darkTextColor,darkNomalColor} from "../Utils/YFWColor";
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import YFWNativeManager from "../Utils/YFWNativeManager";
import {isNotEmpty, safeObj, darkStatusBar, safe} from '../PublicModule/Util/YFWPublicFunction'
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
const { YFWEventManager } = NativeModules;
const  iOSManagerEmitter = new NativeEventEmitter(YFWEventManager);

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
import AndroidHeaderBottomLine from '../widget/AndroidHeaderBottomLine'
import YFWToast from '../Utils/YFWToast'
import {getCityRegionId} from "../Utils/YFWInitializeRequestFunction";


/**
 * 首页选择地址页面
 */
export default class YBTestChangeLocation extends React.Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "修改定位",
        headerRight:<View style={{width:50}}/>,
    });

    constructor(props) {
        super(props)
        this.state = {
            data : null,
            location:'上海市',
            isFirst:true,
            inputValue: '',
            lon: '',
            lat: '',
            city: '',
            address: ''
        }
    }

    componentDidMount(){
        this.statusView&&this.statusView.dismiss();
        this.state.isFirst = false;
        let that = this;
        darkStatusBar();
        this.fixedPosition()
        this.AddressListener = iOSManagerEmitter.addListener('addressNotification',(data)=>{
            that.props.navigation.goBack();
            YFWToast('修改定位成功')
        });
        if (Platform.OS == 'android') {
            this.getLocationData = DeviceEventEmitter.addListener('locationData', (msg)=> {
                that.props.navigation.pop();
                YFWToast('修改定位成功')
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

    render() {
        return (
            <View style = {[BaseStyles.container]}>
                <AndroidHeaderBottomLine/>
                {this._renderHeaderView()}
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
                    <TouchableOpacity activeOpacity={1} style={{flex:2}}>
                        <Text style = {{fontSize: 14, color: darkTextColor()}}>{this.state.location}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} style={{flex:1}} onPress={this._startResetLocaiton}>
                        <View style = {{flexDirection: 'row', alignItems:'center'}}>
                            <View style={{flex:1}}/>
                            <Image source = {require('../../img/location_icon.png')} style={{resizeMode:'contain',width:16,height:16}} />
                            <Text style = {{marginLeft:5,fontSize: 14, color:yfwGreenColor()}}>选择地址</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                {this._renderTitleHeader('输入位置')}
                {this._renderInputLocation()}
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

    _renderInputLocation() {
      return( 
        <View style={{flex: 1}}> 
          <TextInput 
            style={{marginHorizontal: 10, marginBottom: 10, height: 40, fontSize: 15, color: '#333', backgroundColor: '#fff', borderRadius: 5}} 
            placeholder={'请输入地址'}
            placeholderTextColor={'#ccc'}
            onChangeText={this.handleTextValueChange.bind(this)}
            onBlur={this.handleEndEditing.bind(this)}
          />
          <Text style={{marginHorizontal: 15, marginVertical: 10, fontSize: 15, fontWeight: '500', color: '#333'}}>经度：<Text style={{fontWeight: '300'}}>{this.state.lon}</Text></Text>
          <Text style={{marginHorizontal: 15, marginVertical: 10, fontSize: 15, fontWeight: '500', color: '#333'}}>维度：<Text style={{fontWeight: '300'}}>{this.state.lat}</Text></Text>
          <Text style={{marginHorizontal: 15, marginVertical: 10, fontSize: 15, fontWeight: '500', color: '#333'}}>城市：<Text style={{fontWeight: '300'}}>{this.state.city}</Text></Text>
          <Text style={{marginHorizontal: 15, marginVertical: 10, fontSize: 15, fontWeight: '500', color: '#333'}}>地址：<Text style={{fontWeight: '300'}}>{this.state.address}</Text></Text>
          <TouchableOpacity onPress={this.handleSaveLocation.bind(this)} activeOpacity={1} style={{marginHorizontal: 20, marginTop: 40, height: 44, borderRadius: 22, backgroundColor: '#1fdb9b', justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontWeight: '500', fontSize: 15, color: '#fff'}}>检索并保存地址</Text>
          </TouchableOpacity>
        </View> 
      )
    }

    clickMyLocation(){

        let lat = YFWUserInfoManager.ShareInstance().latitude;
        let lng = YFWUserInfoManager.ShareInstance().longitude;

        this._saveLocation(this.state.location,lat,lng);

    }

    /**
     * 保存地址
     * @private
     */
    _saveLocation=(address,lat,lng)=>{
        let {goBack} = this.props.navigation

        let data = {address:safe(address) , lat:safe(lat) , lng:safe(lng)};
        DeviceEventEmitter.emit('get_change_location',data);

        YFWToast('修改位置成功')
        goBack()
    }

    handleEndEditing() {
        const { inputValue } = this.state
        if (inputValue.length==0) return;
        YFWNativeManager.getGeoCodeResult('全国', inputValue, res => {
        if (isNotEmpty(res)) {
            if (safe(res.code) != '1') {
                YFWToast('地址检索失败，请重新输入')
                return
            }
            const longitude = safe(safeObj(res).longitude)
            const latitude = safe(safeObj(res).latitude)
            this.setState({ lon: longitude, lat: latitude })
        } else {
            YFWToast('地址检索失败，请重新输入')
        }
        })
    }

    handleSaveLocation() {
        const { lat, lon } = this.state
        if (lat.length==0) {
            YFWToast('请输入正确的地址')
            return
        }

        YFWNativeManager.getGeoReverseCodeResult(lon, lat, result => {
            if (isNotEmpty(result)) {
                if (safe(result.code) != '1') {
                    YFWToast('地址检索失败，请重新输入')
                    return
                }
                const city = safe(result.city)
                const address = safe(result.address)
                YFWUserInfoManager.ShareInstance().setAddress(address)
                YFWUserInfoManager.ShareInstance().setCity(city)
                getCityRegionId(city)

                let data = {
                    address: address,
                    lat: YFWUserInfoManager.ShareInstance().latitude,
                    lng: YFWUserInfoManager.ShareInstance().longitude,
                }
                DeviceEventEmitter.emit('get_change_location',data);
                this.setState({ city: city, address: address })
                YFWToast('修改定位成功')
                let {goBack} = this.props.navigation
                goBack()

            } else {
                YFWToast('地址检索失败，请重新输入')
            }
        })
    }

    handleTextValueChange(text) {
        this.state.inputValue = text
    }


    /**
     * 跳转重新定位
     * @private
     */
    _startResetLocaiton=()=>{
        YFWNativeManager.jumpToChooseAddress();
    }
}