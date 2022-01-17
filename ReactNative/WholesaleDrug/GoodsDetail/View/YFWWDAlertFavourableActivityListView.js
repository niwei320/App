import React, {Component} from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';


import {
    backGroundColor,
    darkLightColor,
    darkNomalColor,
    separatorColor,
    darkTextColor
} from '../../../Utils/YFWColor'
import ModalView from "../../../widget/ModalView";
import {isEmpty, safeObj, kScreenHeight,kScreenWidth} from "../../../PublicModule/Util/YFWPublicFunction";
import LinearGradient from "react-native-linear-gradient";


export default class YFWWDAlertFavourableActivityListView extends Component {

    static defaultProps = {
        data:undefined,
    }

    constructor(...args) {
        super(...args);
        this.state = {

        };
    }


    render() {
        var shop_promotion = {};
        var sub_items = [];
        if (this.props.data.shop_promotion != null) {
            shop_promotion = this.props.data.shop_promotion[0];
            if (shop_promotion.sub_items != null){
                sub_items = shop_promotion.sub_items;
            }
        }
        return (
            <ModalView ref={(c) => this.modalView = c} animationType="slide" onRequestClose={()=>{
                this.props.onRequestClose && this.props.onRequestClose()
                this.dismiss()
            }} >
                <TouchableOpacity activeOpacity={1} style={{flex:1}} onPress={()=>this.dismiss()}/>
                <View style={{backgroundColor:'white',height:sub_items.length*37+58+kScreenHeight*0.3,borderTopLeftRadius: 7,borderTopRightRadius: 7}}>
                    <View style = {{height: 48,justifyContent:'center',alignItems:'center'}}>
                        <Text style = {{color: '#000', fontSize: 15,fontWeight:'bold',lineHeight: 20}}>促销</Text>
                        <TouchableOpacity activeOpacity = {1} style = {{width: 15, height: 15,position:'absolute', right: 19,top:16}} hitSlop={{top:20,left:20,bottom:20,right:20}} onPress = {() => this.dismiss()}>
                            <Image style = {{width: 15, height: 15}} source = {require('../../../../img/close_button.png')} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={{flex:1,marginTop:10}}>
                        {this.activeValidity()}
                        {this.rendercontentView()}
                    </ScrollView>
                    <View style={{height:10}}/>
                </View>
            </ModalView>
        );
    }

    activeValidity(){
        var shop_promotion = {};
        if (this.props.data.shop_promotion != null) {
            shop_promotion = safeObj(this.props.data.shop_promotion)[0];
        }
        if(isEmpty(shop_promotion.start_time) || isEmpty(shop_promotion.end_time)){
            return<View/>
        }
        return (
           <View>
               <View style={{height:70,justifyContent: 'center',flex:1}}>
                   <Text style={{color:darkNomalColor(),fontSize:14,marginLeft:15}}>{shop_promotion.title}</Text>
                   <Text style={{color:darkLightColor(),fontSize:13,marginLeft:15,marginTop:5}}>
                       有效期：{shop_promotion.start_time} - {shop_promotion.end_time}
                   </Text>
               </View>
               <View style={{backgroundColor:separatorColor(),height:1,width:Dimensions.get('window').width,marginTop:0}}/>
           </View>
        )
    }

    show(){
        this.modalView && this.modalView.show()
    }

    //关闭弹框
    dismiss(){
        this.modalView && this.modalView.disMiss()
        this.props.dismiss && this.props.dismiss()
    }


    rendercontentView(){

        var shop_promotion = {};
        var sub_items = [];
        if (this.props.data.shop_promotion != null) {
            shop_promotion = this.props.data.shop_promotion[0];
            if (shop_promotion.sub_items != null){
                sub_items = shop_promotion.sub_items;
            }
        }

        // 数组
        var itemAry = [];

        // 遍历
        var dataitems = sub_items;
        for (let i = 0; i<dataitems.length; i++) {
            let dataItem = dataitems[i];
            let content1 = dataItem.name;
            if (dataItem.shipping_desc.length > 0){
                content1 += ''+dataItem.shipping_desc;
            }
            let content2 = '';
            if (dataItem.shipping_explain.length > 0) {
                content2 += '('+(<Text style={{color:darkTextColor(),fontSize:13}}>
                    {dataItem.shipping_explain}
                </Text>)+')';
            }
            let content3 = '';
            if (dataItem.money_desc.length > 0){
                content3 += ''+dataItem.money_desc;
            }
            if (dataItem.coupon_desc.length > 0){
                content3 += ''+dataItem.coupon_desc;
            }
            if (dataItem.coupon_explain.length > 0) {
                content3 += '('+dataItem.coupon_explain+')';
            }
            itemAry.push(
                <View key={'favourable'+i} style={{width:kScreenWidth,flex:1,padding:11}}>
                    {/* <View style={{marginTop:10,,
                        borderWidth:1,borderColor:'#F7EDCC',backgroundColor:'#FFFFF2'}}>

                    </View> */}
                    <View style={{flexDirection:'row',alignItems:'center',flex:1}}>
                        {dataItem.type==0? <LinearGradient colors={['rgb(250,171,129)','rgb(250,209,110)']}
                                            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                            locations={[0,1]}
                                            style={{width: 42,height: 15,borderRadius:7,justifyContent:'center',alignItems:'center',}}>
                                <Text style={{fontSize:10,color:'white'}}>满减</Text>
                        </LinearGradient>:<LinearGradient colors={['rgb(44,92,241)','rgb(124,100,247)']}
                                            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                            locations={[0,1]}
                                            style={{width: 42,height: 15,borderRadius:7,justifyContent:'center',alignItems:'center',}}>
                                <Text style={{fontSize:10,color:'white'}}>包邮</Text>
                        </LinearGradient>}
                        <Text style={{width: kScreenWidth-42-5-22,marginLeft:5,color:darkTextColor(),fontSize:13}}>
                            {content1}
                            {
                                dataItem.shipping_explain.length > 0 ?(<Text style={{color:darkTextColor(),fontSize:13}}>
                            ({dataItem.shipping_explain})
                                </Text>):(null)
                            }
                            {content3}
                        </Text>


                    </View>

                </View>
            );
        }

        return itemAry;

    }

}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        backgroundColor: backGroundColor()
    },
    text: {
        fontSize: 20,
        textAlign: 'center'
    },
    item: {
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'

    },
    shareImage: {
        width: 40,
        height: 40
    },
    shareView: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    }
});