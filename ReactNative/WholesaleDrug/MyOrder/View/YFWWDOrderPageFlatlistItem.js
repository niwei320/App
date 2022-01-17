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
import {isEmpty, isNotEmpty, safeObj, tcpImage} from '../../../PublicModule/Util/YFWPublicFunction'
import {toDecimal} from "../../../Utils/ConvertUtils";
import {TYPE_DOUBLE, TYPE_NOMAL, TYPE_SINGLE, TYPE_OTC} from "../../../widget/YFWPrescribedGoodsTitle";
import YFWPrescribedGoodsTitle from "../../../widget/YFWPrescribedGoodsTitle";
import YFWDiscountText from "../../../PublicModule/Widge/YFWDiscountText"
import LinearGradient from "react-native-linear-gradient";
import {YFWImageConst} from "../../Images/YFWImageConst";
import {kRoute_goods_detail, kRoute_order_detail, pushWDNavigation} from "../../YFWWDJumpRouting";
export default class YFWWDOrderPageFlatlistItem extends Component {
    constructor(props) {
        super(props);
        this.medicineData = [];
        this.state = {
            imgUrl: undefined,
            error:false,
        }
    }

    _onItemClick(item){
        if(isNotEmpty(this.props.from)&&this.props.from == 'orderDetail'){
            let {navigate} = this.props.navigation
            pushWDNavigation(navigate, {type: kRoute_goods_detail, value: item.item.shop_goods_id,img_url:tcpImage(item.item.img_url)})
        }else {
            let orderData = this.props.orderData;
            const {navigate} = this.props.navigation;
            pushWDNavigation(navigate, {
                type: kRoute_order_detail,
                value: orderData.item.order_no,
                pageSource: this.props.pageSource,
                position: orderData.index,
                refreshAction:(index)=>{
                    this.props._refreshItemStatus(index)
                },
            })
        }
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
                        }}
                    >
                        <Text style={{fontSize: 10, color: "#ffffff"}}>
                            {item.section.package_type==0?'套餐':'疗程装'}
                        </Text>
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
            return (
                <View style={{marginLeft:10,flex:1,marginTop:7}}>
                    <View style={{flexDirection:'row',justifyContent:'space-around',}}>
                        <View flex={1} style={{marginTop:2,marginBottom:2}}>
                            {this._renderTitleView(item.item)}
                        </View>
                        <View style={{marginRight:13,marginTop:2}}>
                         <YFWDiscountText  navigation={this.props.navigation}
                                           style_view={{width:79,justifyContent:'flex-end'}}
                                           style_text={{color:'#333333',fontSize:16,fontWeight:'500',}}
                                           value={'¥'+toDecimal(item.item.price)} discount={item.discount} />
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
    }

    _renderTitleView(item) {
        if(safeObj(item).PrescriptionType+"" === "1"){
            return this._renderPrescriptionLabel(TYPE_SINGLE,item.title)
        }
        else if(safeObj(item).PrescriptionType+"" === "2"){
            return this._renderPrescriptionLabel(TYPE_DOUBLE,item.title)
        }
        else if(safeObj(item).PrescriptionType+"" === "0") {
            return this._renderPrescriptionLabel(TYPE_OTC,item.title)
        }
        else {
            return this._renderPrescriptionLabel(TYPE_NOMAL,item.title)
        }
    }

    _renderPrescriptionLabel(type,title){
        return (
            <YFWPrescribedGoodsTitle
                type={type}
                title={title}
                style={{color:'black',fontSize:13,lineHeight:16,fontWeight:'500'}}
                numberOfLines={2}
            />
        )
    }

    _renderOrderImage(){
        if(this.state.error){
            return(<Image style={{marginLeft:20,width:70,height:70,resizeMode:'contain',backgroundColor:'red'}} source={YFWImageConst.Icon_no_pic}/>)
        }else {
            if (isEmpty(this.state.imgUrl)) {
                return (<Image style={{marginLeft:20,width:70,height:70,resizeMode:'contain',backgroundColor:'red'}} source={YFWImageConst.Icon_default_pic}/>)
            } else {
                return (<Image style={{marginLeft:20,width:70,height:70,resizeMode:'contain'}}
                               source={this.state.imgUrl}
                               onError={()=>{this.setState({error:true})}}
                />)
            }
        }
    }

    _renderItemFlatItem(item) {
        if(isNotEmpty(item.item.img_url)){
            this.state.imgUrl = {uri:tcpImage(item.item.img_url)};
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

    render() {
        let medicineData = this.props.medicineData;
        return (
            <SectionList
                style={{width:width,backgroundColor:'#FFFFFF'}}
                keyExtractor={(item, index) => index}
                sections={medicineData}
                renderItem={this._renderItemFlatItem.bind(this)}
                renderSectionHeader={this._renderSectionHeader.bind(this)}
            />

        )
    }
}