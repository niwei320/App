import React, { Component } from 'react';
import {
    DeviceEventEmitter,
    Image,
    NativeEventEmitter,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,ScrollView
} from 'react-native';
import YFWWDBaseView, { kNav_Bg } from '../../Base/YFWWDBaseView';
import { kNavigationHeight, kScreenWidth } from '../../../PublicModule/Util/YFWPublicFunction';
import { YFWImageConst } from '../../Images/YFWImageConst';
import { BaseStyles } from '../../../Utils/YFWBaseCssStyle';
import YFWWDBigPictureView from '../../Widget/YFWWDBigPictureView';
import YFWWDStartScore from '../../Widget/View/YFWWDStartScore'

export default class YFWWDStoreIntroductionView extends YFWWDBaseView {

    constructor(props) {
        super(props);
        this.model = this.props.father.model
    }

    componentWillReceiveProps(props) {
        this.props =  props
    }


    render() {
        return (
            <View style={styles.container_style}>
                {this.renderNavigationView(kNav_Bg, '店铺详情', kNavigationHeight + 200, YFWImageConst.Bg_shop_bg_wd)}
                <ScrollView style={{ flex: 1 }}>
                    {this._renderHeaderView()}
                    {this._renderEvaluationView()}
                    {this._renderSingleBackView()}
                    {this._renderQualificationItemView()}
                    {this._renderSceneItemView()}
                </ScrollView>
                <YFWWDBigPictureView ref={(view)=>{this.picView = view}}/>
            </View>
        )
    }

     //头部视图
     _renderHeaderView(){
        let item = this.model;
        return(
            <View style={{minHeight:84,paddingHorizontal:13}}>
                <View style={[{flex:1,backgroundColor:'white',borderRadius:10}]}>
                    <View style={[BaseStyles.leftCenterView,{height:35,marginTop:12}]}>
                        <Text style={[BaseStyles.titleWordStyle,{marginLeft:9,marginRight:17,flex:1,fontSize:15,color:'rgb(51,51,51)',fontWeight:'500'}]} numberOfLines={2}>{item.title}</Text>
                        { this.model.dict_store_status?<View style={{alignItems:'center',justifyContent:'center',width:65,height:23,borderRadius:11.5,borderWidth:1,borderColor:'rgb(65,109,255)',marginRight:10}}>
                            <Text style={{fontSize:12,color:'rgb(65,109,255)'}}>已签约</Text>
                        </View>:null}
                    </View>
                    <Text style={{marginHorizontal:8,marginTop:13,marginBottom:8,fontSize:12,color:'rgb(102,102,102)'}} numberOfLines={2}>{item.address}</Text>
                </View>
            </View>
        );
     }

    //服务评价
    _renderEvaluationView(){
        let item = this.model;
        return(
            <View style={{marginTop:10,paddingHorizontal:13,alignItems:'stretch'}}>
                <View style={[{flex:1,backgroundColor:'white',borderRadius:10}]}>
                    <View style={[BaseStyles.leftCenterView,{marginLeft:20,marginTop:16}]}>
                        <Text style={{fontSize:12,color:'rgb(153,153,153)'}}>{'服务总评'}</Text>
                        <YFWWDStartScore style={{marginLeft:23}} starSize={13} total={5} stars={item.total_star} starSpacing={1}/>
                        <Text style={{fontSize:12,color:'rgb(153,153,153)',marginLeft:5}}>(共{item.evaluation_count}人参加评分)</Text>
                    </View>
                    <View style={{marginLeft:20}}>
                        {this._renderEvaluationItem('客户服务',item.service_star,item.service_rate,{marginTop:7})}
                        {this._renderEvaluationItem('发货速度',item.delivery_star,item.send_rate,{marginTop:7})}
                        {this._renderEvaluationItem('物流速度',item.shipping_star,item.logistics_rate,{marginTop:7})}
                        {this._renderEvaluationItem('商品包装',item.package_star,item.package_rate,{marginTop:7,marginBottom:16,})}
                    </View>
                </View>
            </View>
        );
    }

    _renderEvaluationItem(title,star,percent,style){
        return (
            <View style={[BaseStyles.leftCenterView,style]}>
                <Text style={{fontSize:12,color:'rgb(153,153,153)'}}>{title}</Text>
                <Text style={{fontSize:15,color:'rgb(255,51,0)',marginLeft:23}}>{star}
                    <Text style={{fontSize:12}}>分</Text>
                </Text>
                <Text style={{fontSize:12,color:'rgb(102,102,102)',marginLeft:11}}>领先{percent}的商家</Text>
            </View>
        );

    }

    //退单栏
    _renderSingleBackView(){
        let item = this.model;
        return(
            <View style={{height:70,paddingHorizontal:13,justifyContent:'center',marginTop:10}}>
                <View style={[{flex:1,justifyContent:'center',backgroundColor:'white',borderRadius:10}]}>
                    <View style={[BaseStyles.leftCenterView]}>
                        <Text style={{fontSize:12,color:'rgb(153,153,153)',width:133,marginLeft:20}}>退单率：</Text>
                        <Text style={{fontSize:12,color:'rgb(65,109,255)'}}>{item.return_rate}</Text>
                    </View>
                    <View style={[BaseStyles.leftCenterView,{marginTop:10}]}>
                        <Text style={{fontSize:12,color:'rgb(153,153,153)',width:133,marginLeft:20}}>平均发货时长：</Text>
                        <Text style={{fontSize:12,color:'rgb(65,109,255)'}}>{item.avg_send_time}</Text>
                    </View>
                </View>
            </View>
        );

    }

    //资质栏
    _renderQualificationItemView(){

        if (this.model.qualificationItems.length > 0){

            return(
                <View style={{paddingHorizontal:13}}>
                    <View style={[BaseStyles.leftCenterView,{height:40}]}>
                        <Text style={[{fontSize:13,fontWeight:'500',color:'rgb(51,51,51)'}]}>商家资质</Text>
                    </View>
                    <View style={{flexDirection:'row', flexWrap:'wrap'}}>
                        {this._renderShopImagesView(this.model.qualificationItems,1)}
                    </View>
                </View>
            );

        }

    }

    //实景栏
    _renderSceneItemView(){

        if (this.model.sceneItems.length > 0){

            return(
                <View style={{paddingHorizontal:13}}>
                    <View style={[BaseStyles.leftCenterView,{height:40}]}>
                        <Text style={[{fontSize:13,fontWeight:'500',color:'rgb(51,51,51)'}]}>商家实景</Text>
                    </View>
                    <View style={{flexDirection:'row', flexWrap:'wrap'}}>
                        {this._renderShopImagesView(this.model.sceneItems,2)}
                    </View>
                </View>
            );

        }

    }

    //商家资质、实景视图
    _renderShopImagesView(array,type){
        let items = [];
        for (let i = 0 ;i<array.length;i++){
            let imageItem = array[i]
            if (type == 1) {
                let img = imageItem.image_file
                items.push(
                    <TouchableOpacity key={'qualification'+i} style={[styles.outViewStyle,{marginTop:i*2>2?10:0,marginLeft:i%2==1?10:0,borderRadius:10}]}
                        onPress = {()=>{this.picView.showView(this.model.qualificationItems,i)}} activeOpacity={1}>
                        <View style={{flex:1 , backgroundColor:'white' , alignItems:'center',borderRadius:10}} >
                            <Image source={{uri:img}}
                                style={styles.iconStyle} resizeMode={'contain'}/>
                            <Text style={[styles.visitedTitleStyle,{fontSize:11,marginTop:5}]}>
                                {imageItem.image_name}
                            </Text>
                        </View>
                    </TouchableOpacity>
                );
            }else{
                let img = imageItem.image_file
                items.push(
                    <TouchableOpacity style={{width:kScreenWidth-26,height:171*kScreenWidth/375,justifyContent:'center', alignItems:'center',marginTop:i==0?0:10,borderRadius:10,overflow:'hidden'}}
                        onPress = {()=>{this.picView.showView(this.model.sceneItems,i)}} activeOpacity={1}>
                        <Image source={{uri:img}}
                                style={{width:kScreenWidth-26,height:171*kScreenWidth/375}} resizeMode={'stretch'}/>
                    </TouchableOpacity>
                );
            }
        }

        return items;
    }





    updateViews() {
        this.model = this.props.father.model
        this.setState({})
    }
}
var boxW = (kScreenWidth-36) / 2;
var vMargin = 10
var hMargin = 0;
const styles = StyleSheet.create({
    container_style: { flex: 1, backgroundColor: '#FAFAFA' },
    outViewStyle:{
        //    设置侧轴的对齐方式
        alignItems:'center',
        width:boxW,
        height:boxW,
        marginLeft:hMargin,
        marginTop:vMargin,
    },
    iconStyle:{
        width:boxW - 50,
        height:boxW - 50,
        marginTop:10,
    },
    visitedTitleStyle:{

        width:boxW,
        textAlign:'center',
        fontSize: 14,
        color:'rgb(51,51,51)',
        marginTop:15,
    },
});
