/**
 * Created by 12345 on 2018/4/20.
 */
import React, {Component} from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity,
    ImageBackground, DeviceEventEmitter,
} from 'react-native';
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {darkLightColor, darkTextColor,darkNomalColor, separatorColor} from '../../Utils/YFWColor'
import {
    itemAddKey,
    kScreenWidth,
    isEmpty,
    tcpImage,
    safe,
    isAndroid
} from "../../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import YFWToast from "../../Utils/YFWToast";
import {doAfterLogin} from "../../Utils/YFWJumpRouting";


export default class YFWShopDetailHeaderView extends Component {


    static defaultProps = {
        Data:undefined,
    }


    constructor(props) {
        super(props)
        this.toDetail = this.props.toDetail
        this.state = {
            is_favorite:this.props.Data.is_favorite=='0'?false:true,
        };

    }



    //@ Request
    _requestFavoriteMethod(){

        let service = 'person.favorite.collectStore';
        let toastType = '收藏';
        if (this.state.is_favorite) {
            service = 'person.favorite.cancelCollectStore';
            toastType = '取消收藏';
        }

        let paramMap = new Map();
        paramMap.set('__cmd', service);
        paramMap.set('storeid', this.props.Data.shop_id);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            YFWToast(toastType + '成功');
            this.setState({
                is_favorite: !this.state.is_favorite,
            });
        }, ((error) => {
            // YFWToast(toastType + '失败');
        }));

    }



    //@ Action
    _changeFavoriteMethod(){

        let {navigate} = this.props.navigation;
        doAfterLogin(navigate,()=>{this._requestFavoriteMethod()});

    }


    //@ View
    render() {

        let item = this.props.Data;
        let collectImg = require('../../../img/sx_image_collect.png')
        if (this.state.is_favorite) {
            collectImg = require('../../../img/sx_image_collect_sellected.png')
        }
        let hasLogo = safe(item.logo_img_url).indexOf('noyaodian_logo.png') == -1
        return(
            <View style={{width:kScreenWidth}}>
                <View style={[{marginTop:5,marginBottom:11,flexDirection:'row',alignItems:'stretch'}]}>
                    {hasLogo?<Image style={{height: 35, width: 70, resizeMode: "contain",marginLeft:12}} source={{uri: item.logo_img_url}}/>:null}
                    <View style={{flex:1,justifyContent:'center'}}>
                        <Text numberOfLines={2} style={{color: "white",fontSize:15,fontWeight:'700',marginLeft:hasLogo?10:12,marginRight:32,lineHeight:isAndroid()?undefined:16}}>{item.title}</Text>
                    </View>
                    <TouchableOpacity style={{width:65,height:35,marginRight:13,justifyContent:'center'}} onPress={()=>this._changeFavoriteMethod()}>
                        <View style={[{flexDirection:'row',width:65,height:23}]}>
                            <Image style={{height: 23, width:65,borderRadius:11.5}} source={collectImg}/>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{flexDirection: "row", backgroundColor: "white",height:50,marginLeft:13,width:kScreenWidth-26,borderRadius:10}}>
                    {this._renderItemView('客户服务',item.service_star)}
                    <View style={[BaseStyles.verticalSeparatorStyle,{height:50}]}/>
                    {this._renderItemView('发货速度',item.delivery_star)}
                    <View style={[BaseStyles.verticalSeparatorStyle,{height:50}]}/>
                    {this._renderItemView('物流速度',item.shipping_star)}
                    <View style={[BaseStyles.verticalSeparatorStyle,{height:50}]}/>
                    {this._renderItemView('商品包装',item.package_star)}
                </View>
            </View>
        );

    }

    _renderItemView(title , score){

        return(
            <View style={[BaseStyles.centerItem,{flex:1}]}>
                <View style={[BaseStyles.leftCenterView]}>
                    <Text style={{color:'rgb(255,51,0)',fontSize:15}}>{score}</Text>
                    <Text style={{color:'rgb(255,51,0)',fontSize:12,marginTop:4}}>分</Text>
                </View>
                <Text style={[{marginTop:5,color:'rgb(51,51,51)',fontSize:12}]}>{title}</Text>
            </View>
        );

    }

}


