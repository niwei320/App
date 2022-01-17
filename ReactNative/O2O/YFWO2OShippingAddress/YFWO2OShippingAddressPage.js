import React, {Component} from 'react';
import {
    View,
    Text,
    TextInput,
    Image,
    TouchableOpacity,
    Keyboard,
    FlatList,
    DeviceEventEmitter,
    NativeModules,
    NativeEventEmitter,
} from 'react-native';
import {
    adaptSize, darkStatusBar, dismissKeyboard_yfw,
    getStatusBarHeight, iphoneBottomMargin,
    iphoneTopMargin, isAndroid, isNotEmpty, kScreenHeight, kScreenScaling, kScreenWidth, safeArray
} from "../../PublicModule/Util/YFWPublicFunction";
import YFWTouchableOpacity from "../../widget/YFWTouchableOpacity";
import {Header} from "react-navigation";
import YFWO2OAddressListItemView from "./YFWO2OAddressListItemView";
import YFWToast from "../../Utils/YFWToast";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import YFWNativeManager from "../../Utils/YFWNativeManager";
import {JOSN} from "../../PublicModule/Util/RuleString";
import YFWOTONativeMapView from './YFWOTONativeMapView';
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import * as BackHandler from "react-native/Libraries/Utilities/BackHandler.android";
import {kO2OCityListCacheData, removeItem} from "../../Utils/YFWStorage";
import {pushNavigation} from "../../Utils/YFWJumpRouting";
const {YFWEventManager} = NativeModules;
const iOSManagerEmitter = new NativeEventEmitter(YFWEventManager);
export default class YFWO2OShippingAddressPage extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header:null,
    });

    constructor(props) {
        super(props);
        this.state = {
            keyword:'',
            isKeyboardShow:false,
            city:YFWUserInfoManager.ShareInstance().O2Ocity??'上海市',
            location:'',
            selectData:{
                latitude:YFWUserInfoManager.ShareInstance().O2Olatitude,
                longitude:YFWUserInfoManager.ShareInstance().O2Olongitude,
                city:YFWUserInfoManager.ShareInstance().O2Ocity??'上海市',
                address :YFWUserInfoManager.ShareInstance().O2Oaddress,
            },
            searchResult:[],
            locationAddress:[],
            from:this.props.navigation.state.params?.state?.from??''
        }
    }

//----------------------------------------------LIFECYCLE-------------------------------------------

    componentWillMount() {
        //清除O2O城市选择列表缓存数据
        removeItem(kO2OCityListCacheData);
        this.mapView && this.mapView.mapViewWillAppear()
    }

    componentDidMount() {
        darkStatusBar()
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
        this._reLocate()
        this.AddressListener = isAndroid()?
            DeviceEventEmitter.addListener('androidLocationOpen', ()=> this._reLocate()):
            iOSManagerEmitter.addListener('addressNotification', (value)=> {this._reLocate()});
    }
    componentWillUnmount() {
        this.mapView && this.mapView.mapViewWillDisappear()
        this.AddressListener && this.AddressListener.remove()
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
        YFWNativeManager.destroyPOI()
    }

//-----------------------------------------------METHOD---------------------------------------------

    _keyboardDidShow(){
        this.setState({
            isKeyboardShow:true
        })
        this._searchPoi(this.state.keyword)
    }

    _keyboardDidHide(){
        this.setState({
            isKeyboardShow:false
        })
    }

    _textChange(text){
        this.setState({
            keyword:text
        })
        this._searchPoi(text)
    }

    _searchPoi(keyword){
        YFWNativeManager.getSearchPOIInCity(this.state.city,keyword).then(
            success => {
                let array = safeArray(success?.poiList)
                array.sort(function(a,b){
                    return a.distance - b.distance
                })
                this.setState({
                    searchResult:array
                })
            },
            error => {
                this.setState({
                    searchResult:[]
                })
            })
    }

    _nearbyPoi(){
        YFWNativeManager.getPOINearby().then(
            success => {
                this.setState({
                    locationAddress:safeArray(success?.poiList)
                })
            },
            error => {
                YFWToast('获取附近地址失败，检查定位是否开启')
            })
    }

    _onClicked(item){
        if(isNotEmpty(item)){
            this.state.selectData = {
                latitude:item.latitude??item.lat,
                longitude:item.longitude??item.lng,
                city:item.city,
                address:item.name,
                province:item.province,
                area:item.area,
                street:item.address,

            }
            let {selectData} = this.state
            if(this.state.from === 'O2OSelectAddress' || this.state.from === 'Home'){
                if(isNotEmpty(item.latitude??item.lat)){
                    YFWUserInfoManager.ShareInstance().O2Olatitude = item.latitude??item.lat
                }
                if(isNotEmpty(item.longitude??item.lng)){
                    YFWUserInfoManager.ShareInstance().O2Olongitude = item.longitude??item.lng
                }
                YFWUserInfoManager.ShareInstance().O2Ocity = item.city
                YFWUserInfoManager.ShareInstance().O2Oaddress = item.name
                DeviceEventEmitter.emit('O2OAddressSelected',selectData)
            }
            if(this.props.navigation.state.params?.state?.callback && typeof this.props.navigation.state.params?.state?.callback == 'function'){
                this.props.navigation.state.params?.state?.callback(selectData)
            }
            this.props.navigation.goBack();
        }
    }

    _selectCity(){
        pushNavigation(this.props.navigation.navigate, {type: 'O2O_City_List', callback:(data)=>{
                this.setState({
                    city:data.region_name
                })
            }})
    }

    _reLocate(){
        this.setState({location:''})
        YFWNativeManager.isLocationServiceOpen((isOpen)=>{
            if(!isOpen) {
                DeviceEventEmitter.emit("OPEN_LOCATION_DIALOG",'oto')
            } else {
                YFWNativeManager.startUpdatingLocationWithComplection((location)=>{
                    this.setState({
                        location:location,
                        city:location.city,
                    })
                    this._nearbyPoi()
                })
            }
        })
    }

    _onGetReverseGeoCodeResult(info) {
        this.setState({
            locationAddress:safeArray(info.nativeEvent.data)
        })
    }

//-----------------------------------------------RENDER---------------------------------------------

    _renderHeader(){
        let pageTitle = '定位地址'
        let city = this.state.city
        let {keyword,isKeyboardShow, searchResult,from} = this.state
        let isMap = from == 'map'
        return (
            <View style={{paddingTop:getStatusBarHeight(),backgroundColor:isMap?'#5799f7':'white',}}>
                <View
                    style={{
                        flexDirection:'row',
                        alignItems:'center',
                        justifyContent:'space-between',
                        paddingHorizontal:adaptSize(11),
                        height:adaptSize(50),
                        backgroundColor:isMap?'#5799f7':'white'
                    }}
                >
                    <TouchableOpacity
                        style={{width:adaptSize(50),height:adaptSize(40), justifyContent:'center'}}
                        onPress={()=>{
                            dismissKeyboard_yfw();
                            this.props.navigation.goBack();
                            DeviceEventEmitter.emit('LoadProgressClose');
                        }}
                    >
                        <Image style={{width:adaptSize(11),height:adaptSize(19),resizeMode:'stretch'}}
                               source={isMap?require('../../../img/top_back_white.png'):require('../../../img/top_back_green.png')}/>
                    </TouchableOpacity>
                    <Text style={{fontSize: adaptSize(16), color:isMap?'white':'#333333',fontWeight:'bold'}}>{pageTitle}</Text>
                    <View style={{width:adaptSize(50)}}/>
                </View>
                <View
                    style={{
                        flexDirection:'row',
                        alignItems:'center',
                        backgroundColor:'white',
                        paddingHorizontal:adaptSize(11),
                        height:adaptSize(50)}}
                >
                    <TouchableOpacity onPress={()=>{this._selectCity()}} style={{flexDirection:'row', alignItems:'center',}}>
                        <Text style={{fontSize: adaptSize(14), color: "#333333"}}>{city}</Text>
                        <Image
                            source={require('../../../img/around_detail_icon.png')}
                            style={{
                                marginHorizontal:adaptSize(7),
                                height:adaptSize(9),
                                width:adaptSize(9),
                                tintColor:'#333333',
                                transform: [{ rotateZ: '90deg'}]
                            }}
                        />
                    </TouchableOpacity>
                    <View
                        style={{
                            flex:1,
                            flexDirection:'row',
                            alignItems:'center',
                            height: adaptSize(33),
                            borderRadius: adaptSize(17),
                            backgroundColor: "#f5f5f5",
                            paddingHorizontal:adaptSize(25)}}
                    >
                        <Image style={{position:'absolute',left:adaptSize(10),width: adaptSize(13), height: adaptSize(13), resizeMode: 'contain',}}
                               source={require('../../../img/top_bar_search.png')} />
                        <TextInput
                            style={{flex:1,fontSize:adaptSize(14)}}
                            placeholderTextSize
                            placeholderTextColor="#ccc"
                            placeholder="小区/写字楼/学校等"
                            value={keyword}
                            onChangeText={this._textChange.bind(this)}
                        />
                        {isNotEmpty(keyword)?
                            <TouchableOpacity
                                hitSlop={{left:10,top:10,bottom:10,right:0}}
                                activeOpacity={1}
                                style={{position:'absolute',right:adaptSize(10)}}
                                onPress={() => {this._textChange('')}}
                            >
                                <Image style={{ width: adaptSize(13), height: adaptSize(13), resizeMode: 'contain',}} source={require('../../../img/search_del.png')} />
                            </TouchableOpacity>:<></>
                        }
                    </View>
                    {isKeyboardShow || safeArray(searchResult).length > 0?
                        <TouchableOpacity style = {{marginLeft: adaptSize(14)}} onPress={()=>{dismissKeyboard_yfw();this.setState({searchResult:''})}}>
                            <Text style = {{fontSize: adaptSize(14), color: '#5799f7'}}>取消</Text>
                        </TouchableOpacity>
                        : <></>
                    }
                </View>
            </View>
        )
    }

    _renderResultList() {
        let {isKeyboardShow,searchResult} = this.state
        let isShowList = safeArray(searchResult).length > 0
        return (
            <>
            {isKeyboardShow || isShowList ?
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={()=>{dismissKeyboard_yfw()}}
                        style={{flex:1,position:'absolute',top:getStatusBarHeight()+adaptSize(100),height:kScreenHeight-getStatusBarHeight()-adaptSize(100),width:kScreenWidth,backgroundColor:isShowList?'#f5f5f5':'rgba(0,0,0,0.5)'}}
                    >
                        {isShowList?
                            this._renderAddressList(searchResult, true, true)
                            :<></>
                        }
                    </TouchableOpacity>
                    :<></>
            }
            </>
        )
    }

    _renderSearchFooter(){
        return (
            <View style={{width:kScreenWidth,height:adaptSize(110),justifyContent:'center',alignItems:'center', backgroundColor:'#fff'}}>
                <View style={{alignItems:'center'}}>
                    <Text style={{fontSize: adaptSize(16), color: "#ccc", paddingBottom:adaptSize(5)}}>找不到地址？</Text>
                    <Text style={{fontSize: adaptSize(13), color: "#ccc"}}>请尝试只输入小区、写字楼或学校名，</Text>
                    <Text style={{fontSize: adaptSize(13), color: "#ccc"}}>门牌号等可稍后在详细地址中输入。</Text>
                </View>
            </View>
        )
    }
    _renderLocationAddress() {
        let {locationAddress, location} = this.state
        return (
            <View style={{flex:1}}>
                <View style={{width:kScreenWidth,height:adaptSize(60),justifyContent:'space-between',paddingVertical:adaptSize(10),backgroundColor:'#fff', paddingHorizontal:adaptSize(13)}}>
                    <Text style={{fontSize: adaptSize(12), color: "#666666"}}>当前定位</Text>
                    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingLeft:adaptSize(21)}}>
                        <Image style={{position:'absolute',left:0,width: adaptSize(15), height: adaptSize(15), resizeMode: 'contain',}}
                               source={require('../../../img/icon_location_point.png')} />
                        <TouchableOpacity onPress={()=>{isNotEmpty(location) && this._onClicked(location)}}>
                            <Text style={{fontSize: adaptSize(13),color: "#333333"}}>{(location?.name??'...')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>{this._reLocate()}}>
                            <Text style={{fontSize: adaptSize(12), color: "#5799f7"}}>重新定位</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{height:adaptSize(40), paddingLeft:adaptSize(13), paddingBottom:adaptSize(10), justifyContent:'flex-end'}}>
                    <Text style={{fontSize: adaptSize(12), color: "#666666"}}>附近地址</Text>
                </View>
                {safeArray(locationAddress).length === 0?
                    <View style={{paddingTop:1,flex:1, justifyContent:'center',alignItems:'center', backgroundColor:'#fff'}}>
                        <Text style={{}}>附近暂无地址</Text>
                    </View>
                    :this._renderAddressList(locationAddress)}
            </View>
        )
    }

    _renderMap() {
        let {locationAddress} = this.state
        return (
            <View style={{flex:1}}>
                <YFWOTONativeMapView
                    ref={(e)=>{this.mapView=e}}
                    style={{width:kScreenWidth,height:280*kScreenScaling}}
                    onGetReverseGeoCodeResult={(info)=>this._onGetReverseGeoCodeResult(info)}
                />
                {this._renderAddressList(locationAddress)}
            </View>
        )
    }

    _renderAddressList(data, showFooter, showDistance){
        return(
            <View style = {{paddingTop:1,flex:1}}>
                {safeArray(data).length === 0?
                    <View style={{flex:1,justifyContent:'center',alignItems:'center', backgroundColor:'#fff'}}>
                        <Text>暂无结果</Text>
                    </View>
                    :
                    <FlatList
                        data={data}
                        onScrollBeginDrag={()=>{dismissKeyboard_yfw()}}
                        keyExtractor={(item, index)=>{return index+'leftItem'}}
                        renderItem={(item)=>this._renderAddressItem(item,showDistance)}
                        ListFooterComponent={showFooter && this._renderSearchFooter()}
                    />
                }
            </View>
        )
    }

    _renderAddressItem(item, showDistance) {
        let {name,address,latitude,longitude} = item.item
        if(name && address && latitude && longitude){
            return <YFWO2OAddressListItemView {...item.item} onClick={this._onClicked.bind(this)} showDistance={showDistance}/>
        }
    }

    render() {
        return (
            <View style = {{flex: 1, backgroundColor:'#f5f5f5'}}>
                {this._renderHeader()}
                {this.state.from == 'map'?this._renderMap():this._renderLocationAddress()}
                {this._renderResultList()}
            </View>
        )
    }

}

