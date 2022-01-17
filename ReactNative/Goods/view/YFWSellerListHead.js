/**
 * Created by admin on 2018/8/2.
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    TextInput,
    DeviceEventEmitter,
    Platform
} from 'react-native';
import {kScreenWidth, checkAuditStatus} from "../../PublicModule/Util/YFWPublicFunction";
import {pushNavigation} from "../../Utils/YFWJumpRouting";

import {doAfterLogin} from '../../Utils/YFWJumpRouting'
import YFWNativeManager from "../../Utils/YFWNativeManager";
import {yfwOrangeColor,yfwRedColor} from "../../Utils/YFWColor";
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager'
export  default class YFWSellerListHead extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            keyWord: '',
            redPointShow: false,
            hidePrice: YFWUserInfoManager.ShareInstance().getNoLocationHidePrice()
        }
    }

    keyWordTextChange(text) {
        if (this.mounted) {
            this.setState(()=>({
                    keyWord: text
                }
                )
            )
        }
    }

    componentDidMount() {
        this.mounted = true;
        DeviceEventEmitter.addListener('SHOW_SAME_SHOP_RED_POINT', (info)=> {
            this.setState({
                redPointShow: info.value
            })
        })
        this.priceListener = DeviceEventEmitter.addListener('NO_LOCATION_HIDE_PRICE',(isHide)=>{
            this.setState({
                hidePrice: isHide
            })
        })
    }

    componentWillUnmount() {
        // 移除
        if (this.subscription) {
            this.subscription.remove();
        }
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove();
        }
        this.priceListener&&this.priceListener.remove()
        this.mounted = false;
    }

    pushKeyWord() {
        let keyWord = this.state.keyWord;
        return keyWord;
    }


    _searchMethod() {

        let {navigate} = this.props.navigation;
        pushNavigation(navigate, {type: 'get_search'});

    }

    _sameStoreMethod() {
        let {navigate} = this.props.navigation;
        doAfterLogin(navigate,()=>{
            DeviceEventEmitter.emit('SameStorClick',{});
        })
    }

    _shareMethod(){

        if (this.props.shareMethod){
            this.props.shareMethod();
        }

    }


    _renderSameShopTips() {
        return (
            <View style={{width: 48,
                height: 24,
                borderRadius: 7,
                borderStyle: "solid",
                borderWidth: 1,
                borderColor: "#ffffff",justifyContent: 'center',alignItems: 'center'}}>
                <Text style={{color:'white',fontWeight:'bold',fontSize:12}}>同店购</Text>
                {this.state.redPointShow?<View style={{position: 'absolute',width:12,height:12,borderRadius:12,backgroundColor:yfwRedColor(),right:-6,top:-6}}/>:null}
            </View>
        )
    }

    render() {
        return (
            <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                <View style={{flex:1}}/>
                {this.state.hidePrice ? <View/> :
                <TouchableOpacity activeOpacity={1}  hitSlop={{left:5,top:10,bottom:10,right:5}}style={{marginRight:15}} onPress={()=>{
                    this._sameStoreMethod()
                    YFWNativeManager.mobClick('price page-same store')
                }}>
                    {this._renderSameShopTips()}
                </TouchableOpacity>}
                <TouchableOpacity hitSlop={{left:5,top:10,bottom:10,right:5}} activeOpacity={1} style={{marginRight:15}} onPress={()=>{
                    this._searchMethod()
                    YFWNativeManager.mobClick('price page-search')
                }}>
                    <Image style={{width:18,height:18,resizeMode:'contain'}}
                           source={require('./../../../img/kind_search_white.png')}/>
                </TouchableOpacity>
                {this.renderShareView()}
            </View>
        )
    }

    renderShareView(){
        if (!checkAuditStatus()) {
            return (
                <TouchableOpacity activeOpacity={1} hitSlop={{left:5,top:10,bottom:10,right:5}} style={{marginRight:15}} onPress={()=>{
                    this._shareMethod()
                    YFWNativeManager.mobClick('price page-share')
                }}>
                    <Image source={require('../../../img/icon_share_white.png')}
                        style={{width:17,height: 17}}/>
                </TouchableOpacity>
            )
        }

        return (<View/>)
    }
}