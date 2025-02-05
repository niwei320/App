import React, {Component} from 'react';
import {
    Platform,
    StyleSheet,
    Image,
    View,
    Text,
    TextInput,
    Dimensions,
    TouchableOpacity,
    NativeModules, NativeEventEmitter,
    DeviceEventEmitter, ImageBackground,Animated
} from 'react-native';
import {yfwGreenColor, darkLightColor} from '../Utils/YFWColor'
import YFWToast from '../Utils/YFWToast'
import YFWMyMessageController from '../Message/Controller/YFWMyMessageController'
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import YFWNativeManager from "../Utils/YFWNativeManager";
import {
    iphoneTopMargin,
    isIphoneX,
    isNotEmpty,
    itemAddKey,
    kScreenWidth,
    mobClick,
    isEmpty, safeObj, safe, min,
} from "../PublicModule/Util/YFWPublicFunction";
import {doAfterLogin, pushNavigation} from "../Utils/YFWJumpRouting";
const {YFWEventManager} = NativeModules;
import YFWUserInfoManager from '../Utils/YFWUserInfoManager'
import {getCityRegionId} from "../Utils/YFWInitializeRequestFunction";
const iOSManagerEmitter = new NativeEventEmitter(YFWEventManager);
import LinearGradient from 'react-native-linear-gradient';
import YFWMessageRedPointView from '../widget/YFWMessageRedPointView';


export default class YFWHomeSearchHeaderView extends Component {

    static defaultProps = {
        canChangeColor: true,
        bgStyle: {}
    }

    constructor(props) {
        super(props);
        this.state = {
            text: '',
            address: '定位失败',
            refreshRotateY: new Animated.Value(0),
        };
    }

    componentDidMount() {
        let that = this;
        this._getAddress();
        this.AddressListener = iOSManagerEmitter.addListener('addressNotification', (data)=> {
            that.setState({
                address: data.name,
            });
            YFWUserInfoManager.ShareInstance().setAddress(data.name)
            YFWNativeManager.getLongitudeAndLatitude((data)=> {
                YFWUserInfoManager.ShareInstance().setApplocation(data);
            });
        });

        if (Platform.OS == 'android') {
            this.getLocationData = DeviceEventEmitter.addListener('locationData', (msg)=> {
                let address = ''
                if (isNotEmpty(JSON.parse(msg).name)) {
                    address = JSON.parse(msg).name;
                } else {
                    address = '上海市'
                }
                this.setState({
                    address: address
                })
            });
        } else {

        }


        DeviceEventEmitter.addListener('get_change_location',(data)=>{

            let address = safeObj(data.address);
            let lat = safeObj(data.lat);
            let lng = safeObj(data.lng);

            this._changeAddress(address, lat, lng);

        });

        DeviceEventEmitter.addListener('refresh_location',(data)=>{
            this._locationRefresh()
        });


    }

    componentWillUnmount() {
        this.getLocationData && this.getLocationData.remove();
        this.AddressListener.remove();
    }

    setOffsetProps(newOffsetY) {
        if (this.props.from&&(this.props.from == 'findyao')){
            return
        }
        if (newOffsetY < 30) {
            opacity = newOffsetY * (1 / 30);
        }

        let allH = 60 + iphoneTopMargin();
        if (this.props.from&&(this.props.from == 'home_member')){
            allH = 70 + iphoneTopMargin()
        }
        let margiT = iphoneTopMargin() + 20;
        let criticalPoint = this.props.canChangeColor ? 60 : 60;

        if (newOffsetY > criticalPoint) {
            if (newOffsetY - criticalPoint > 33) {
                DeviceEventEmitter.emit('kStatusChange',true)
                allH = 33 + iphoneTopMargin();
                this.positionView.setNativeProps({
                    style: {height: allH},
                    opacity: 1,
                })
                this.contentView.setNativeProps({
                    style: {height: allH},
                })
                this.locationText.setNativeProps({
                    style:{maxWidth:70}
                })
                margiT = iphoneTopMargin() - 10;
                this.searchView.setNativeProps({
                    style: {marginTop: margiT,marginLeft:13,width:kScreenWidth-13-44,paddingTop:0},
                })

            } else {
                DeviceEventEmitter.emit('kStatusChange',false)
                let someOp = (criticalPoint + 33 - newOffsetY) / 33;
                allH = allH - (newOffsetY - criticalPoint);
                margiT = iphoneTopMargin() + 20 - (newOffsetY - criticalPoint);
                this.positionView.setNativeProps({
                    style: {height: allH},
                    opacity: this.props.canChangeColor?(1-someOp):1,
                })
                this.contentView.setNativeProps({
                    style: {height: allH},
                })
                let leftOp = 13
                let rightOp = 34*(1-someOp)+13
                this.searchView.setNativeProps({
                    style: {marginTop: margiT,marginLeft:leftOp,width:kScreenWidth-leftOp-rightOp,paddingTop:someOp*4},
                })
            }
        } else if (newOffsetY < 0) {
            DeviceEventEmitter.emit('kStatusChange',false)
            this.contentView.setNativeProps({
                opacity: this.props.canChangeColor?0:1,
            })
            this.positionView.setNativeProps({
                style: {height: allH},
                opacity: this.props.canChangeColor?0:1,
            })
            this.searchView.setNativeProps({
                style: {marginTop: margiT,marginLeft:13,width:kScreenWidth-26},
            })
            this.locationText.setNativeProps({
                style:{maxWidth:kScreenWidth*0.5}
            })

        } else {
            DeviceEventEmitter.emit('kStatusChange',false)
            if (this.props.canChangeColor) {


            }
            this.searchView.setNativeProps({
                style: {marginTop: margiT,marginLeft:13,width:kScreenWidth-26,paddingTop:4},
            })
            this.locationText.setNativeProps({
                style:{maxWidth:kScreenWidth*0.5}
            })
            this.positionView.setNativeProps({
                style: {height: allH},
                opacity: this.props.canChangeColor?0:1,
            })
            this.contentView.setNativeProps({
                style: {height: allH},
                opacity: 1,
            })


        }

    }

    render() {


        let bgHeight = 60 + iphoneTopMargin();
        let marginTop = iphoneTopMargin() + 20;
        let bgOpacity = this.props.canChangeColor?0:1
        let searchViewW = kScreenWidth-26
        let searchViewLeft = 13
        let searchViewTop = 4
        let contentViewH =60 + iphoneTopMargin()
        if (this.props.from&&this.props.from == 'findyao'){
            bgHeight = 33 + iphoneTopMargin()
            marginTop = iphoneTopMargin()-10;
            searchViewW = kScreenWidth-44-13
            searchViewLeft = 13
            searchViewTop = 0
            contentViewH = 30+iphoneTopMargin()
        }
        if (this.props.from&&this.props.from == 'home_member'){
            bgHeight = 70 + iphoneTopMargin()
            contentViewH = 70 + iphoneTopMargin()
        }
        return (
            <View ref={(e)=>{this.contentView = e}}
                  style={[styles.backStyle,this.props.bgStyle,{backgroundColor:'rgba(0,0,0,0)',height:contentViewH}]}>
                {
                    this.props.from == 'home_member'?
                    <Image ref={(e)=>{this.positionView = e}} style={{position:'absolute',width:kScreenWidth,height:bgHeight}} source={require('../../img/search_top_bg.png')}/>:
                    <View ref={(e)=>{this.positionView = e}}
                            style={{width:kScreenWidth,height:bgHeight,position:'absolute',opacity:bgOpacity}}>
                        {this._renderMaskView()}
                    </View>
                }
                {this._renderTopView()}
                <View ref={(e)=>{this.searchView = e}}
                      style={{position: 'absolute',width:searchViewW,paddingTop:searchViewTop, marginLeft: searchViewLeft, marginRight: 10, height: 35,marginTop:marginTop}}>
                    <TouchableOpacity activeOpacity={1} style={{flex:1}} onPress={()=>this._searchMethod()}>
                        <View style={{flexDirection: 'row', backgroundColor: 'white',
                            borderRadius:17,height:34, justifyContent: 'space-between', alignItems: 'center'}}>
                            <View style={[BaseStyles.leftCenterView,{flex:1}]}>
                                <Image style={{width: 15, height: 15, marginLeft:9,overflow:'visible'}}
                                       source={require('../../img/top_bar_search.png')}
                                       defaultSource={require('../../img/top_bar_search.png')}/>
                                <Text style={{marginLeft:5,color:'#ccc',fontSize:14,flex:1}} numberOfLines={1}>批准文号、通用名、商品名、症状</Text>
                            </View>
                            <TouchableOpacity style={[BaseStyles.centerItem,{width:34,height:34}]}
                                              onPress={() => {this.qr_search()}}>
                                <Image key={'scan'} style={{width:16,height:16}}
                                       source={require('../../img/qr_sys.png')}
                                       defaultSource={require('../../img/qr_sys.png')}
                                />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    _renderMaskView(){
        return (
            <LinearGradient colors={['rgb(79,218,206)','rgb(74,221,189)','rgb(69,223,171)']}
                            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                            locations={[0,0.3,1]}
                            style={{flex:1}}/>
        )
    }

    _renderTopView() {
        let styleJustifyContent = 'space-between'
        let marginT = iphoneTopMargin()-10
        let textMaxW = kScreenWidth*0.5
        if (this.props.from&&this.props.from == 'findyao'){
            textMaxW = 70
        }

        return (
            <View ref={(e)=>{this.topView = e}}
                  style={[BaseStyles.leftCenterView,{marginTop:marginT,paddingBottom:10,justifyContent: styleJustifyContent}]}>
                <TouchableOpacity style={[BaseStyles.leftCenterView,{top:5}]} activeOpacity={1}
                                  onPress={this._startSelectLocation}>
                    <Image source={require('../../img/sy_location_icon.png')}
                           defaultSource={require('../../img/sy_location_icon.png')}
                           style={{marginLeft:16,height:18,width:13,resizeMode:'contain'}}/>
                    <Text ref={(e)=>this.locationText=e} style={{color:'white',fontSize:14,marginLeft:5,maxWidth:textMaxW}}
                          numberOfLines={1}>{this.state.address}</Text>
                    {this.renderAddressArrowIcon()}
                    <TouchableOpacity activeOpacity={1} onPress={()=>{this._locationRefresh()}}>
                        <Animated.Image source={require('../../img/refresh.png')}
                               defaultSource={require('../../img/refresh.png')}
                               style={{marginLeft:6,height:18,width:13,resizeMode:'contain',
                                   transform: [
                                       { rotateZ: this.state.refreshRotateY.interpolate({
                                               inputRange: [0, 1],
                                               outputRange: ['360deg', '0deg']}) },{ perspective: 1000 }
                                   ]}}/>
                    </TouchableOpacity>
                </TouchableOpacity>
                <View style={[BaseStyles.leftCenterView,{top:5, marginLeft:20}]}>
                    <TouchableOpacity style={[BaseStyles.centerItem]}
                                      onPress={this._startMsg}>
                        {this.renderMessageRedpoint()}
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    /** 点击刷新icon*/
    _locationRefresh() {
        this.state.refreshRotateY.stopAnimation(value => {
            Animated.spring(this.state.refreshRotateY, {
                toValue: Math.round(value) + 1,
                duration: 500,
            }).start(()=>{
                YFWNativeManager.isLocationServiceOpen((isOpen)=>{
                    if(!isOpen) {
                        DeviceEventEmitter.emit("OPEN_LOCATION_DIALOG")
                    } else {
                        this._getAddress(true)
                    }
                })
            })
        })
    }

    /**
     * 返回地址三角图标
     * @returns {*}
     */
    renderAddressArrowIcon(){
        if(safeObj(YFWUserInfoManager.ShareInstance().getSystemConfig()).hide_user_location != 'false'){
            return <View/>
        }
        return <Image source={require('../../img/xiala.png')} defaultSource={require('../../img/xiala.png')}
                      style={{height:8,width:8,resizeMode:'contain',marginLeft:5,marginTop:3}}/>
    }

    renderMessageRedpoint() {

        return (
            <YFWMessageRedPointView isWhiteBg={true} navigation={this.props.navigation} callBack={()=>{}} />
        )
    }

    _startSelectLocation = ()=> {

        if (this.props.from == 'home') {
            mobClick('home-loacation');
        } else {
            mobClick('seek medicine-location');
        }

        //false = 可点击，其余都不可点击
        if(safeObj(YFWUserInfoManager.ShareInstance().getSystemConfig()).hide_user_location != 'false'){
            return
        }

        const {navigate} = this.props.navigation;
        pushNavigation(navigate, {
            type: 'select_location'
        })
    }

    _changeAddress(address, lat, lng) {
        this.setState({
            address: address
        })
        let userInfo = new YFWUserInfoManager();
        userInfo.latitude = lat
        userInfo.longitude = lng
    }

    _searchMethod() {

        if (this.props.from == 'home') {
            mobClick('home-search');
        } else {
            mobClick('seek medicine-search');
        }

        if (this.props.onSearchClick) {
            this.props.onSearchClick();
        }

    }

    _getAddress(isRefresh) {
        let locationStasus =  YFWUserInfoManager.ShareInstance().getLocationStasus();
        if(locationStasus == 'success' && !isRefresh){
            let address =  YFWUserInfoManager.ShareInstance().getAddress();
            this.setState({
                address: address
            })
        }else {
            YFWNativeManager.getLocationAddress((locationData)=> {

                if (Platform.OS == 'android') {
                    let city = locationData.city;

                    let address = '';
                    if (isNotEmpty(locationData)) {
                        address = locationData.name;
                    } else {
                        address = '上海市'
                    }
                    //根据城市中文名获取ID
                    getCityRegionId(city);
                    YFWUserInfoManager.ShareInstance().setAddress(address)
                    YFWUserInfoManager.ShareInstance().setCity(city)
                    this.setState({
                        address: address
                    })
                    if(isNotEmpty(locationData.lat)||isNotEmpty(locationData.lng)) {
                        YFWUserInfoManager.ShareInstance().setApplocation({
                            city:city,
                            latitude:locationData.lat,
                            longitude:locationData.lng
                        })
                        if(!isRefresh){
                            YFWUserInfoManager.ShareInstance().O2Olatitude = locationData.lat
                            YFWUserInfoManager.ShareInstance().O2Olongitude = locationData.lng
                        }
                    }
                } else {

                    let city = locationData.city;
                    let address = '';
                    if (isNotEmpty(locationData)) {
                        address = locationData.address;
                    } else {
                        address = '上海市'
                    }
                    //根据城市中文名获取ID
                    getCityRegionId(city);
                    YFWUserInfoManager.ShareInstance().setAddress(address)
                    YFWUserInfoManager.ShareInstance().setCity(city)
                    this.setState({
                        address: address
                    })
                }
            })
        }
    }


    clickShareMethod() {

        if (this.props.from == 'home') {
            mobClick('home-share');
        } else {
            mobClick('seek medicine-share');
        }

        if (this.props.onShareClick) {
            this.props.onShareClick();
        }

    }

    qr_search() {

        if (this.props.from == 'home') {
            mobClick('home-scan');
        } else {
            mobClick('');
        }

        YFWNativeManager.openSaoyisao((value)=> {
            if (Platform.OS == 'ios') {

                if (this.props.onSaoyisaoClick) {
                    this.props.onSaoyisaoClick(value);
                }

            } else {
                let QrcodeData = JSON.parse(value);
                if (isEmpty(QrcodeData.name) && isEmpty(QrcodeData.value)) {
                    return
                }
                this.props.onSaoyisaoClick(QrcodeData)
            }
        });
    }

    /**
     * 跳转消息
     * @private
     */
    _startMsg = ()=> {
        if (this.props.from == 'home') {
            mobClick('home-message');
        } else {
            mobClick('seek medicine-message');
        }

        const {navigate} = this.props.navigation;
        doAfterLogin(navigate, ()=> {
            let badge = new Map();
            DeviceEventEmitter.emit('ShowInviteView', {value: false});
            navigate('YFWMyMessageController', {state: badge});
        })
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "flex-start",
        alignItems: 'stretch',
        backgroundColor: '#16c08e',
    },
    backStyle: {
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        width: kScreenWidth,
        // backgroundColor: 'rgba(255,255,255,0.2)',
        backgroundColor: yfwGreenColor(),
    },
    inputStyle: {
        height: 30,
        width: Dimensions.get('window').width - 20,
        borderRadius: 5,
        borderColor: 'white',
        backgroundColor: 'white',
    },
    titleStyle: {
        flexDirection: 'row',
        backgroundColor: '#16c08e',
        padding: 10
    },
    textStyle: {
        fontSize: 16,
        textAlign: 'center',
        color: 'white',
        marginLeft: 30,
        width: Dimensions.get('window').width - 120,
    },
    imgTouchStyle: {
        height: 30,
        width: 30,
    },
    imgStyle: {
        height: 18,
        width: 18,
    },
});
