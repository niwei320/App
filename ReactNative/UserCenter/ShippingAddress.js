/**
 * Created by admin on 2018/7/19.
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    TextInput,
    FlatList, DeviceEventEmitter,
    NativeModules,
    Platform,
    Alert
} from 'react-native';
const width = Dimensions.get('window').width;
import {
    darkStatusBar,
    iphoneBottomMargin,
    itemAddKey,
    kScreenWidth,
    mapToJson,
    secretPhone,
    isIphoneX,
    isNotEmpty
} from "../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import YFWAddressModel from '../UserCenter/Model/YFWAddressModel'
import YFWToast from "../Utils/YFWToast";
import {darkNomalColor,darkTextColor,backGroundColor,yfwGreenColor} from '../Utils/YFWColor'
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import YFWNativeManager from "../Utils/YFWNativeManager";
import YFWTouchableOpacity from '../widget/YFWTouchableOpacity'
import YFWEmptyView from '../widget/YFWEmptyView';
import { pushNavigation } from '../Utils/YFWJumpRouting';
const {StatusBarManager} = NativeModules;

export default class ShippingAddress extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "收货地址",
        headerTransparent: true,
        headerTitleStyle: {
            color: 'white',textAlign: 'center',flex: 1
        },
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item,{width:50,height:40}]}
                            onPress={() => {navigation.goBack()}}>
                <Image style={{width:11,height:19,resizeMode:'stretch'}}
                        source={ require('../../img/top_back_white.png')}/>
            </TouchableOpacity>
        ),
        headerRight: <View style={{width:50}}/>,
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            backgroundColor:'transparent',
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : {borderBottomWidth: 0, backgroundColor:'transparent'},
        headerBackground: <Image source={require('../../img/order_detail_header.png')} style={{width:kScreenWidth, flex:1, resizeMode:'cover'}} opacity={0}/>
    });

    constructor(props) {
        super(props);
        this.state = {
            dataArray: [],
            pageIndex: 1,
            loading: false,
            showFoot: 2,
        };

    }

    componentWillMount(){

        this.props.navigation.setParams({ backMethod:this._backMethod });

    }

    _backMethod=()=>{

        if (this.props.navigation.state.params && this.props.navigation.state.params.state.returnBack) {
            this.props.navigation.state.params.state.returnBack();
        }

        this.props.navigation.goBack();

    }

    requestAddressData(){
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.address.getReceiptAddress');
        paramMap.set('pageSize', 10);
        paramMap.set('pageIndex', this.state.pageIndex);

        viewModel.TCPRequest(paramMap, (res) => {
            if (res.code === '1' || res.code === 1) {
                let showFoot = 0;
                let dataArray = YFWAddressModel.getModelArray(res.result);
                if (dataArray.length === 0) {
                    showFoot = 1;
                }
                if (this.state.pageIndex > 1) {
                    dataArray = this.state.dataArray.concat(dataArray);
                }
                dataArray = itemAddKey(dataArray);
                this.setState({
                    dataArray: dataArray,
                    loading: false,
                    showFoot: showFoot
                });
            } else {

            }
        }, (error) => {
        });
    }
    componentDidMount() {
        darkStatusBar();
        this.requestAddressData();
    }

    render() {
        return (
            <View style={{flex:1, backgroundColor:backGroundColor()}}>
                <Image source={require('../../img/order_detail_header.png')} style={{width:kScreenWidth, height:173/375.0*kScreenWidth, resizeMode:'stretch'}}/>
                <View style={{flex:1,position:'absolute', left:0, right:0, bottom:0, top:isIphoneX() ? 88 : 64, paddingTop:20}}>
                    {this.state.dataArray.length > 0?<FlatList
                        style={{flex:1, paddingHorizontal:13, }}
                        data={this.state.dataArray}
                        renderItem={this._renderItem.bind(this)}
                        keyExtractor={(item, index) => index}
                    />:<YFWEmptyView image = {require('../../img/ic_no_address.png')} bgColor={'transparent'} title={'暂无收货地址'}/>}

                    <View style={{paddingBottom:isIphoneX()? 60 : 40, paddingHorizontal:13}}>
                        <YFWTouchableOpacity title={'+新建地址'} style_title={{width:kScreenWidth-26, height:44, fontSize:17}} isEnableTouch={true} callBack={this._editAddress.bind(this)}/>
                    </View>
                </View>
            </View>
        )
    }

    _renderItem({item}) {
        let isDefault = item.is_default=='1' ? true : false
        return(
            <TouchableOpacity activeOpacity={1} onPress={()=>{this._chooseAddress(item)}} style={[styles.content, {flexDirection:'row', alignItems:'flex-start'}]}>
                <Text accessibilityLabel='address_name' style={{width:62, color:darkTextColor(), fontSize:15,marginTop:2}} numberOfLines={1}>{item.name}</Text>
                <View style={{flex:1, justifyContent:'space-between',marginLeft:8}}>
                    <Text style={{color:darkTextColor(), fontSize:15}} numberOfLines={1}>{secretPhone(item.mobile)}</Text>
                    <View style={{paddingTop:10, flex:1, flexDirection:'row', alignItems:'flex-start'}}>
                        <View style={{opacity:isDefault ? 1 : 0,borderColor:yfwGreenColor(), borderWidth:1, borderRadius:7, height:14, paddingLeft:3,paddingRight:2, justifyContent:'center', alignItems:'center', marginRight:2, marginTop:2}}>
                            <Text accessibilityLabel='address_default' style={{color:yfwGreenColor(), fontSize:10, includeFontPadding:false}}>默认</Text>
                        </View>
                        <View style={{position:'absolute', left:0, right:0, top:10, bottom:0, flex:1}}>
                            <Text style={{flex:1, color:darkNomalColor(), fontSize:12, lineHeight:18}} numberOfLines={2}>
                                {isDefault ? '          '+item.address : item.address}
                            </Text>
                        </View>
                    </View>
                    <View style={{justifyContent:'flex-end', flexDirection:'row'}}>
                        <TouchableOpacity hitSlop={{left:0,top:10,bottom:10,right:0}} activeOpacity={1} style={[styles.button,{borderColor:yfwGreenColor(), marginRight:20}]} onPress={() => {this._editAddress(item)}}>
                            <Text style={{color:yfwGreenColor(), fontSize:12}}>编辑</Text>
                        </TouchableOpacity>
                        <TouchableOpacity hitSlop={{left:0,top:10,bottom:10,right:0}} activeOpacity={1} style={[styles.button,{borderColor:darkNomalColor()}]} onPress={() => {this._deletAddress(item)}}>
                            <Text style={{color:darkNomalColor(), fontSize:12}}>删除</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    /** Method */
    /** 下单时选择地址 */
    _chooseAddress(item){
        if (this.props.navigation.state.params && this.props.navigation.state.params.state.callBack) {
            this.props.navigation.state.params.state.callBack(item);
            this.props.navigation.goBack();
        }
    }

    /** 新增、编辑地址 */
    _editAddress(item) {
        const {navigate} = this.props.navigation
        if (isNotEmpty(item)) {
            YFWNativeManager.mobClick('address-edit')
            pushNavigation(navigate,{type:'address_edit',editType:'update',addressData:item,callBack:()=>{
                this.requestAddressData();
            }});
        }else {
            YFWNativeManager.mobClick('address-add')
            pushNavigation(navigate,{type:'address_edit',editType:'new',callBack:()=>{
                this.requestAddressData();
            }});
        }
    }

    /** 删除地址 */
    _deletAddress(item) {
        Alert.alert('确认删除地址','',[{
            text:'取消',
            onPress:()=>{},
        },{
            text:'确认',
            onPress:()=>{
                let paramMap = new Map();
                paramMap.set('__cmd', 'person.address.delete');
                paramMap.set('id', item.id);
                let viewModel = new YFWRequestViewModel();
                viewModel.TCPRequest(paramMap, (res) => {
                    YFWToast("删除成功")
                    this.requestAddressData()
                    DeviceEventEmitter.emit('kChangeAddress')
                }, (error) => {
                })
            },
        }],{
            cancelable: false
        });
    }

}
const styles = StyleSheet.create({
    content: {
        height:150,
        marginBottom:17,
        paddingTop:27,
        paddingBottom:20,
        paddingHorizontal:20,
        borderRadius: 7,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(204, 204, 204, 0.6)",
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowRadius: 8,
        shadowOpacity: 1,
        elevation:2
    },
    button: {
        paddingHorizontal:15,
        height:24,
        borderRadius:12,
        borderWidth:1,
        justifyContent:'center',
        alignItems:'center'
    }
})