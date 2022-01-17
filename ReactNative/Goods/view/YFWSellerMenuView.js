import React, {Component} from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    Image,
    StyleSheet,
} from 'react-native'
import {darkNomalColor, separatorColor, yfwGreenColor,darkTextColor} from "../../Utils/YFWColor";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {isNotEmpty, kScreenWidth, kScreenScaling} from "../../PublicModule/Util/YFWPublicFunction";
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import ModalDropdown from "../../widget/YFWMenuList";
import YFWNativeManager from "../../Utils/YFWNativeManager";
import {pushNavigation} from "../../Utils/YFWJumpRouting";

export default class YFWSellerMenuView extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isHeightPrice: null,
            isPackage: false,
            priceString: '价格',
            selectIndex: -1,
            isShow:(this.props.isShow === false)?false : true,
            isActive: false // 915活动选中
        };
    }
    static defaultProps = {
        isPromotion: false, // 915活动筛选条件
    }

    // ===== Action ======
    clickItems(index,subIndex) {

        let {orderType,isPackage} = this.changeState(index,subIndex)
        const { isActive } = this.state
        let param = {
            sort : orderType ,
            sorttype : isPackage,
            medicineid : isPackage,
            isPackage:isPackage,
            isPromotionActivity: isActive ? 1 : 0
        }

        if (this.props.getOrdertype){
            this.props.getOrdertype(param,index);
        }

    }

    changeState(index,subIndex){
        let priceString = '价格';
        let selectIndex = index;
        let isHeightPrice = this.state.isHeightPrice;
        let orderType = this.state.orderType;
        let isPackage = this.state.isPackage;

        if (index === 0) {
            orderType = 'distanceasc';
            YFWNativeManager.mobClick('price page-distance')
            isHeightPrice = null
        }
        else if (index === 1) {

            if (this.state.isHeightPrice) {

                priceString = '价格(降)';
                isHeightPrice = false;
                orderType = 'pricedesc';

            } else {

                priceString = '价格(升)';
                isHeightPrice = true;
                orderType = 'priceasc';

            }
            YFWNativeManager.mobClick('price page-price')
        } else if (index === 2) {
            orderType = '';
            YFWNativeManager.mobClick('price page-result')
            isHeightPrice = null
        } else if (index === 3){
            orderType = 'filter'
            return ({orderType})
            // priceString = this.state.priceString;
            // selectIndex = this.state.selectIndex;
            // isPackage = !this.state.isPackage;

        }
        this.setState({
            priceString:priceString,
            selectIndex : selectIndex ,
            isHeightPrice : isHeightPrice,
            orderType : orderType,
            isPackage : isPackage
        });
        return {orderType,isPackage}
    }

    show(is){
        this.setState({
            isShow:is
        })
    }

    handleActivityClick () {
        let { isActive } = this.state
        isActive = !isActive
        this.setState({ isActive: isActive })

        const { isPackage, orderType } = this.state
        let param = {
            sort : orderType ,
            sorttype : isPackage,
            medicineid : isPackage,
            isPackage:isPackage,
            isPromotionActivity: isActive ? 1 : 0
        }

        if (this.props.getOrdertype){
            this.props.getOrdertype(param,0);
        }
    }



    // ====== View =====

    render() {
        if(this.state.isShow){
            const { isPromotion } = this.props
            const { isActive } = this.state
            const backColor = isActive ? '#dc3a34' : '#fff'
            const activeColor = isActive ? '#fff' : '#dc3a34'
            const activeIcon = isActive ? require('../../../img/icon_915_white.png') : require('../../../img/icon_915_red.png')
            return (
                <View style={{backgroundColor:'white'}}>
                    <View flexDirection={'row'} height={49} paddingHorizontal={25*kScreenScaling} justifyContent={'space-between'}>
                        {this.renderItem()}
                    </View>
                    <View style={{height:0.5,marginLeft:0,marginRight:0,backgroundColor:'#ccc',opacity:0.5}} />
                    <TouchableOpacity activeOpacity={1} onPress={()=>{}} style={{backgroundColor:'#fff3e1',flexDirection:'row',alignItems:'center',paddingVertical:8}} >
                        <Image style={{width:13,height:13,marginLeft:17}} source={require('../../../img/icon_tip_yellow.png')}></Image>
                        <Text style={{marginLeft:6,fontSize:13,color:'#eba963'}}>{'满9.9元包邮，多买更优惠'}</Text>
                    </TouchableOpacity>
                    {isPromotion && <TouchableOpacity onPress={this.handleActivityClick.bind(this)} activeOpacity={1} style={{height: 40, marginHorizontal: 12, marginTop: 12, marginBottom: 6, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#dc3a34', borderRadius: 7, backgroundColor: backColor}}>
                        <Image source={require('../../../img/icon_915_select.png')} style={{width: 16, height: 12, marginRight: 3}} />
                        <Text style={{fontSize: 14, color: activeColor, fontWeight: '500'}}>筛选</Text>
                        <Image source={activeIcon} style={{width: 22, height: 14, marginHorizontal: 2}} />
                        <Text style={{fontSize: 14, color: activeColor, fontWeight: '500'}}>商品</Text>
                    </TouchableOpacity>}
                </View>
            )
        }else{
            return <View/>
        }
    }


    renderItem() {
        // 数组
        var itemAry = [];
        // 遍历
        var dataitems = ['距离', this.state.priceString,'综合','筛选'];
        for (let i = 0; i < dataitems.length; i++) {
            var dataItem = dataitems[i];

            let color = this.state.selectIndex == i ? yfwGreenColor() : darkTextColor();
            if(i==0) {
                itemAry.push(
                    <TouchableOpacity hitSlop={{left:10,top:0,bottom:0,right:10}} activeOpacity={1} key={'cli'+i} style={[BaseStyles.centerItem]} onPress={()=>this.clickItems(i)}>
                        <Text style={[{color:color},styles.textStyle]}> {dataItem} </Text>
                    </TouchableOpacity>
                );
            }else if(i==1){
                let   imageSource =require('../../../img/order_by_default.png')

                if(!(this.state.isHeightPrice === null)){
                    if(this.state.isHeightPrice){
                        imageSource = require('../../../img/order_by_plus.png')
                    }else{
                        imageSource = require('../../../img/order_by_minus.png')
                    }
                }
                itemAry.push(
                    <TouchableOpacity hitSlop={{left:10,top:0,bottom:0,right:10}} activeOpacity={1} key={'cli'+i} style={[BaseStyles.centerItem,{flexDirection:'row'}]} onPress={()=>this.clickItems(i)}>
                        <Text style={[{color:color},styles.textStyle]}> {dataItem} </Text>
                        <Image source={imageSource} style={{height:10,width:5,resizeMode:'contain'}}></Image>
                    </TouchableOpacity>
                );
            } else if (i==2){
                itemAry.push(
                    <TouchableOpacity hitSlop={{left:10,top:0,bottom:0,right:10}} activeOpacity={1} key={'cli'+i} style={[BaseStyles.centerItem]} onPress={()=>this.clickItems(i)}>
                        <Text style={[{color:color},styles.textStyle]}> {dataItem} </Text>
                    </TouchableOpacity>
                );
            } else if (i==3){
                itemAry.push(
                    <TouchableOpacity hitSlop={{left:10,top:0,bottom:0,right:10}} activeOpacity={1} key={'cli'+i} style={[BaseStyles.centerItem,{flexDirection:'row'}]} onPress={()=>this.clickItems(i)}>
                        <Image style={{height: 12, width: 12,marginLeft:5, resizeMode: 'contain'}} source={require('../../../img/choose_kind.png')}/>
                        <Text style={[{color:color},styles.textStyle]}> {dataItem} </Text>
                    </TouchableOpacity>
                )
            } 

        }

        return itemAry;
    }

}

const styles = StyleSheet.create({
    textStyle:{
        fontWeight:'500',
        fontSize:15,
    }
})