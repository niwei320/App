/**
 * Created by admin on 2018/6/6.
 */
/**
 * Created by admin on 2018/6/5.
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
    FlatList,
    ImageBackground,
    SectionList,
} from 'react-native';
const width = Dimensions.get('window').width;
import {isEmpty, isNotEmpty, safeObj, tcpImage} from '../PublicModule/Util/YFWPublicFunction'
import {toDecimal} from "../Utils/ConvertUtils";
import {pushNavigation} from '../Utils/YFWJumpRouting'
import {TYPE_DOUBLE, TYPE_NOMAL, TYPE_SINGLE, TYPE_OTC} from "../widget/YFWPrescribedGoodsTitle";
import YFWPrescribedGoodsTitle from "../widget/YFWPrescribedGoodsTitle";
import YFWDiscountText from "../PublicModule/Widge/YFWDiscountText"
import LinearGradient from "react-native-linear-gradient";
export default class OderPageFlatlistItem extends Component {
    constructor(props) {
        super(props);
        this.medicienData = [];
        this.state = {
            imgUrl: undefined,
            error:false,
        }
    }

    _onItemClick(item){
        if(isNotEmpty(this.props.from)&&this.props.from == 'orderDetail'){
            let {navigate} = this.props.navigation
            pushNavigation(navigate, {type: 'get_shop_goods_detail', value: item.item.shop_goods_id,img_url:tcpImage(item.item.img_url)})
        }else {
            let orderData = this.props.orderData;
            const {navigate} = this.props.navigation;
            const OTOOrder = orderData.item.dict_order_sub_type === '2'
            if (OTOOrder) {

                pushNavigation(navigate, {
                    type: 'O2O_order_detail',
                    orderNo: orderData.item.order_no,
                    position: orderData.index,
                    pageSource: this.props.pageSource
                })
            } else {

                pushNavigation(navigate, {
                    type: 'get_order_detail',
                    value: orderData.item.order_no,
                    pageSource: this.props.pageSource,
                    position: orderData.index,
                    isERPOrder:isNotEmpty(this.props.from)&&this.props.from == 'erpOrderList',
                    refreshAction:(index)=>{
                        this.props._refreshItemStatus(index)
                    },
                })
            }
        }
    }


    _renderItemFlatItem(item) {
        if(isNotEmpty(item.item.img_url)){
            if(isNotEmpty(this.props.from)&&this.props.from === 'erpOrderList'){
                this.state.imgUrl = {uri:safeObj(item.item.img_url)};
            } else {
                this.state.imgUrl = {uri:tcpImage(item.item.img_url)};
            }
        }
        return (
            <View>
                <TouchableOpacity style={{flexDirection:'row',alignItems:'center',paddingBottom:10}} onPress = {()=>this._onItemClick(item)} activeOpacity={1} >
                    {this._renderOrderImage()}

                    {this._renderOrderInfo(item)}
                </TouchableOpacity>
            </View>

        )
    };
    _renderOrderImage(){
        if(this.state.error){
            return(<Image style={{marginLeft:20,width:70,height:70,resizeMode:'contain',backgroundColor:'red'}} source={require('../../img/nopic.png')}/>)
        }else {
            if (isEmpty(this.state.imgUrl)) {
                return (<Image style={{marginLeft:20,width:70,height:70,resizeMode:'contain',backgroundColor:'red'}} source={require('../../img/default_img.png')}/>)
            } else {
                return (<Image style={{marginLeft:20,width:70,height:70,resizeMode:'contain'}}
                               source={this.state.imgUrl}
                               onError={()=>{this.setState({error:true})}}
                />)
            }
        }
    }


    _splitView() {
        return (
            <View style={{width:0,height:0}}/>
        );
    }

    render() {
        let medicienData = this.props.medicienData;
        return (
            <SectionList
                style={{width:width,backgroundColor:'#FFFFFF'}}
                sections={medicienData}
                renderItem={this._renderItemFlatItem.bind(this)}
                renderSectionHeader={this._renderSectionHeader.bind(this)}

                keyExtractor={(item, index) => index}
        />

        )
    }
    _renderSectionHeader(item) {
        if(item.section.package_type != -1) {
            return(
                <View style={{flex:1,paddingTop:3,paddingBottom:9,flexDirection:'row',alignItems:'center'}}>
                    <LinearGradient
                        colors={item.section.package_type==0?['rgb(255,136,129)','rgb(234,80,101)']:['rgb(122,219,255)','rgb(72,139,255)']}
                        start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                        locations={[0,1]}
                        style={{
                        width: 42,
                        height: 15,
                        borderRadius: 7,
                        shadowOpacity: 1,
                        justifyContent:'center',
                        alignItems:'center',
                        marginLeft:33,
                    }}>
                        <Text style={{
                            fontSize: 10,
                            color: "#ffffff"
                        }}>{item.section.package_type==0?'套餐':'多件装'}</Text>
                    </LinearGradient>
                    <Text style={{color:'#666666',marginLeft:11,fontSize:12,flex:1}}>
                         {item.section.package_name}
                     </Text>
                </View>

             )
        }else{
            return<View/>
        }

    }

    _renderOrderInfo(item) {
        // if (isEmpty(item.item.package_name)) {
            return (
                <View style={{marginLeft:10,flex:1,marginTop:7}}>
                    <View style={{flexDirection:'row',justifyContent:'space-around',}}>
                        <View flex={1} style={{marginTop:2,marginBottom:2}}>
                            {this.renderTitleView(item.item)}

                        </View>
                        <View style={{marginRight:13,marginTop:2}}>
                         <YFWDiscountText  navigation={this.props.navigation}  style_view={{width:79,justifyContent:'flex-end'}} style_text={{color:'#333333',fontSize:16,fontWeight:'500',}} value={'¥'+toDecimal(item.item.price)} discount={item.discount} />
                        </View>

                    </View>
                    <View style={{flexDirection:'row',marginTop:9,justifyContent:'space-between'}}>
                        <Text style={{color:'#999999',fontSize:13,}}>
                            {item.item.standard}
                        </Text>
                        <Text style={{color:'#999999',fontSize:13,marginRight:13}}>
                            {"x" + item.item.quantity}
                        </Text>
                    </View>
                </View>
            )

        // } else {
        //     return (
        //         <View>
        //             <View style={{flexDirection:'row',marginLeft:10}}>
        //                 <Text style={{color:'black',width:width-20-80-70,fontSize:14}}>
        //                     {"【套餐】"+item.item.package_name}
        //                 </Text>
        //                 <View style={{flex:1}}/>
        //                 <Text style={{fontWeight:'bold',color:'black',fontSize:14}}>
        //                     { "¥" + toDecimal(item.item.price)}
        //                 </Text>
        //             </View>
        //             <View style={{flexDirection:'row',marginTop:2,marginBottom:2}}>
        //                 <View flex={1}>
        //                     {this.renderTitleView(item.item)}
        //                 </View>
        //             </View>
        //             <View style={{flexDirection:'row',width:width-100}}>
        //                 <Text style={{color:'#999999',fontSize:14}}>
        //                     {item.item.standard}
        //                 </Text>
        //                 <View style={{flex:1}}/>
        //                 <Text style={{color:'#999999',fontSize:14}}>
        //                     {"x" + item.item.quantity}
        //                 </Text>
        //             </View>
        //         </View>
        //     )
        // }
    }

    renderTitleView(item) {
        //单双轨3.1.00版本才有，并且现阶段只有HTTP才有
        //单轨药
        if(safeObj(item).PrescriptionType+"" === "1"){
            return this.rednerPrescriptionLabel(TYPE_SINGLE,item.title)
        }
        //双轨药
        else if(safeObj(item).PrescriptionType+"" === "2"){
            return this.rednerPrescriptionLabel(TYPE_DOUBLE,item.title)
        }
        else if(safeObj(item).PrescriptionType+"" === "0") {
            return this.rednerPrescriptionLabel(TYPE_OTC,item.title)
        }
        //这里没有处方药的判断
        else {
            return this.rednerPrescriptionLabel(TYPE_NOMAL,item.title)
        }
    }

    /**
     * 返回处方标签
     * @param img
     * @returns {*}
     */
    rednerPrescriptionLabel(type,title){
        return <YFWPrescribedGoodsTitle
            type={type}
            title={title}
            style={{color:'black',fontSize:13,lineHeight:16,fontWeight:'normal'}}
            numberOfLines={2}
        />
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white'
    },
    headerView: {
        flex: 1,
        backgroundColor: 'skyblue',
        justifyContent: 'center',
        alignItems: 'center'
    },
    pagerView: {
        flex: 6,
        backgroundColor: 'white'
    },

    lineStyle: {
        // width:ScreenWidth/3,
        height: 2,
        backgroundColor: '#FF0000',
    },
    textMainStyle: {
        flex: 1,
        fontSize: 40,
        marginTop: 10,
        textAlign: 'center',
        color: 'black'
    },

    textHeaderStyle: {
        fontSize: 40,
        color: 'white',
    }
})
