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
    View,
    ImageBackground,
} from 'react-native';
import YFWWDBaseView from '../../Base/YFWWDBaseView';
import { kScreenWidth, tcpImage, safe, adaptSize } from '../../../PublicModule/Util/YFWPublicFunction';
import YFWWDMedicineInfoModel from '../Model/YFWWDMedicineInfoModel';
import YFWWDComplaintListItemModel from '../Model/YFWWDComplaintListItemModel';
import YFWWDQualificationInfoModel from '../Model/YFWWDQualificationInfoModel';
import {darkTextColor,yfwGreenColor,darkLightColor,darkNomalColor} from '../../../Utils/YFWColor'
import { toDecimal } from '../../../Utils/ConvertUtils';
import { BaseStyles } from '../../../Utils/YFWBaseCssStyle';
import YFWUserInfoManager from '../../../Utils/YFWUserInfoManager';
import {yfwOrangeColor} from '../../../Utils/YFWColor'
import { YFWImageConst } from '../../Images/YFWImageConst';
import LinearGradient from 'react-native-linear-gradient';
import YFWDiscountText from "../../../PublicModule/Widge/YFWDiscountText";
import YFWWDMessageHomeItemModel from '../Model/YFWWDMessageHomeItemModel';
import { kList_from } from '../../Base/YFWWDBaseModel';
import YFWWDMessageListItemModel from '../Model/YFWWDMessageListItemModel';
import YFWWDCouponModel from '../Model/YFWWDCouponModel';
import YFWBaseSwipeRow from '../../../widget/YFWBaseSwipeRow';

export default class YFWWDListItem extends YFWWDBaseView {

    constructor(props) {
        super(props);
        this.itemType = this.props.itemType || 'list'               // list     collection
        this.data = YFWWDMedicineInfoModel.initWithModel(this.props.model)
        this.numColumns = this.props.numColumns || 1
        this.offset = this.props.offset
        this.hasLogin = YFWUserInfoManager.ShareInstance().hasLogin()
        this.from = this.props.from
    }

    componentWillReceiveProps(props) {
        this.props = props
        this.data = YFWWDMedicineInfoModel.initWithModel(props.model)
        this.itemType = props.itemType
        this.numColumns = props.numColumns || 1
        this.offset = props.offset
        this.from = props.from
    }

    render() {
        if (this.itemType == 'list') {       //一行一个item
            if (this.from == 'storeList') {                    //商家全部商品
                return (
                    <TouchableOpacity activeOpacity={1} onPress={() => this.toDetail(this.data)} style={{backgroundColor:"#fff"}}>
                        <View style={[BaseStyles.item, {backgroundColor:'white'}]}>
                            <View style={{justifyContent:'center',height:80}}>
                                <Image style={[BaseStyles.imageStyle,{height:60,width:60,alignItems:'center'}]} source={{uri: tcpImage(this.data.image)}}/>
                            </View>
                            <View style={{flex:1, paddingTop:10, paddingLeft:10}}>
                                <View style={[BaseStyles.leftCenterView]}>
                                    <Text style={[BaseStyles.titleStyle,{width:kScreenWidth - 110,}]} numberOfLines={1}>{this.data.mname}</Text>
                                </View>
                                <View style={[BaseStyles.leftCenterView]}>
                                    <Text style={[BaseStyles.contentStyle,{marginTop:5,color:'#999999'}]}>{this.data.standard}</Text>
                                </View>
                                <View style={[BaseStyles.leftCenterView]}>
                                    <Text style={[BaseStyles.contentStyle,{marginTop:5,color:'#999999'}]}>{this.data.authorized_code}</Text>
                                </View>
                                <View style={[BaseStyles.leftCenterView]}>
                                    <Text style={[BaseStyles.contentStyle, { marginTop: 5, color: '#999999' }]}>{'库存'+ this.data.reserve +'  有效期至:'+this.data.period_to}</Text>
                                </View>
                                <View style={{paddingLeft:10}}>
                                    {this.priceView(false,false,true,this.data)}
                                </View>

                                <View style={[BaseStyles.separatorStyle,{width:kScreenWidth,marginLeft:10}]}/>
                            </View>
                        </View>
                    </TouchableOpacity>
                )
            } else if (this.from == 'frequentlygoods') {            //常购商品
                return (
                    <TouchableOpacity activeOpacity={1} onPress={() => this.toDetail(this.data)} style={{backgroundColor:"#fff"}}>
                        <View style={[BaseStyles.item, {backgroundColor:'white'}]}>
                            <View style={{justifyContent:'center',height:80}}>
                                <Image style={[BaseStyles.imageStyle,{height:60,width:60,alignItems:'center'}]} source={{uri: tcpImage(this.data.image)}}/>
                            </View>
                            <View style={{flex:1, paddingTop:10, paddingLeft:10}}>
                                <View style={[BaseStyles.leftCenterView]}>
                                    <Text style={[BaseStyles.titleStyle,{width:kScreenWidth - 110,}]} numberOfLines={1}>{this.data.mname}</Text>
                                </View>
                                <View style={[BaseStyles.leftCenterView]}>
                                    <Text style={[BaseStyles.contentStyle,{marginTop:5,color:'#999999'}]}>{this.data.standard}</Text>
                                </View>
                                <View style={[BaseStyles.leftCenterView]}>
                                    <View style={[BaseStyles.leftCenterView, {flex:2}]}>
                                        <Text style={[BaseStyles.contentStyle,{marginTop:5,color:'#999999'}]}>{'最近采购'+this.data.recently_purchased}</Text>
                                    </View>
                                    <View style={[BaseStyles.leftCenterView, {flex:3}]}>
                                        <Text style={[BaseStyles.contentStyle,{marginTop:5,color:'#999999'}]}>{ '采购数量'+this.data.purchased_count+this.data.unit}</Text>
                                    </View>
                                </View>
                                <View style={[BaseStyles.leftCenterView]}>
                                    <View style={[BaseStyles.leftCenterView, {flex:2}]}>
                                        <Text style={[BaseStyles.contentStyle,{marginTop:5,color:'#999999'}]}>{'最近销售'+this.data.recently_sold}</Text>
                                    </View>
                                    <View style={[BaseStyles.leftCenterView, {flex:3}]}>
                                        <Text style={[BaseStyles.contentStyle,{marginTop:5,color:'#999999'}]}>{'剩余库存'+this.data.reserve}</Text>
                                    </View>
                                </View>
                                {/* <View style={{paddingLeft:10}}>
                                    {this.priceView()}
                                </View> */}
                                <View style={[BaseStyles.separatorStyle,{width:kScreenWidth,marginLeft:10,marginTop:10}]}/>
                            </View>
                        </View>
                    </TouchableOpacity>
                )
            } else if (this.from == 'history') {        //浏览历史
                return (
                    <TouchableOpacity activeOpacity={1} onPress={() => this.toDetail(this.data)} style={{backgroundColor:"#fff"}}>
                        <View style={[BaseStyles.item, {backgroundColor:'white'}]}>
                            <View style={{justifyContent:'center',height:80}}>
                                <Image style={[BaseStyles.imageStyle,{height:60,width:60,alignItems:'center'}]} source={{uri: tcpImage(this.data.image)}}/>
                            </View>
                            <View style={{flex:1, paddingTop:10, paddingLeft:10}}>
                                <View style={[BaseStyles.leftCenterView]}>
                                    <Text style={[BaseStyles.titleStyle]} numberOfLines={2}>{this.data.mname}</Text>
                                </View>
                                <View style={[BaseStyles.leftCenterView]}>
                                    <Text style={[BaseStyles.contentStyle,{marginTop:5,color:'#999999'}]}>{this.data.title}</Text>
                                </View>
                                <View style={{paddingLeft:10}}>
                                    {this.priceView(false,true)}
                                </View>
                                <View style={[BaseStyles.separatorStyle,{width:kScreenWidth,marginLeft:10}]}/>
                            </View>
                        </View>
                    </TouchableOpacity>
                )
            } else if (this.from == 'khzz') {         //开户资质
                let instance = YFWWDQualificationInfoModel.init(this.props.model)
                return (
                    <TouchableOpacity activeOpacity={1} onPress={() => this.toDetail(instance)} style={{backgroundColor:"rgb(245,245,245)",marginBottom:13}}>
                        <View style={[BaseStyles.item]}>
                            <View style={{justifyContent:'center',height:80}}>
                                <Image style={[BaseStyles.imageStyle,{height:60,width:60,alignItems:'center'}]} source={{uri: tcpImage(instance.image)}}/>
                            </View>
                            <View style={{flex:1, paddingVertical:10, paddingLeft:10}}>
                                <View style={[BaseStyles.leftCenterView]}>
                                    <Text style={[BaseStyles.titleStyle]} numberOfLines={2}>{instance.name}</Text>
                                </View>
                                {safe(instance.licence_code) == '' ? null :
                                    <View style={[BaseStyles.leftCenterView]}>
                                        <Text style={[BaseStyles.contentStyle, { marginTop: 5, color: '#999999' }]}>{instance.licence_code}</Text>
                                    </View>}
                                <View style={[BaseStyles.leftCenterView]}>
                                    <Text style={[BaseStyles.contentStyle,{marginTop:5,color:'#999999'}]}>{'有效期至：'+(instance.expiration_date.length>0?instance.expiration_date:instance.expiry_desc)}</Text>
                                </View>
                                {safe(instance.isReadOnly) == 1 ? null :
                                    <View style={[BaseStyles.leftCenterView]}>
                                        <TouchableOpacity onPress={() => this.subMethods('change', instance)} activeOpacity={1} style={{marginTop:8,marginLeft:10,width:75,height:20,borderRadius:10,borderWidth:1,borderColor:'rgb(65,109,255)',alignItems:'center',justifyContent:'center'}}>
                                            <Text style={{fontSize:13,color:'rgb(65,109,255)'}}>更换证件</Text>
                                        </TouchableOpacity>
                                    </View>
                                }
                            </View>
                        </View>
                    </TouchableOpacity>
                )
            } else if (this.from == 'wdts') {       //我的投诉
                let instance = YFWWDComplaintListItemModel.initWithModel(this.props.model)
                return (
                    <TouchableOpacity activeOpacity={1} onPress={()=>this.toDetail(instance)}>
                        <View style={{backgroundColor:'white',marginTop:adaptSize(17),paddingBottom:adaptSize(19),borderRadius:10,shadowOffset:{width: 0,height:5},shadowColor:'black',shadowOpacity:0.2,elevation:10}}>
                            <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:adaptSize(19),marginHorizontal:adaptSize(21)}}>
                                <Text style={{fontSize:13,color:'rgb(153,153,153)'}}>订单:
                                    <Text style={{fontSize:13,color:'rgb(51,51,51)'}}> {instance.orderno}</Text>
                                </Text>
                                <Text style={{color:instance.dict_complaints_color,fontSize:13}}>{instance.dict_complaints_name}</Text>
                            </View>
                            <Text style={{fontSize:13,color:'rgb(153,153,153)',marginTop:adaptSize(19),marginHorizontal:adaptSize(21)}}>投诉:
                                <Text style={{fontSize:13,color:'rgb(51,51,51)'}}> {instance.title}</Text>
                            </Text>
                            <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:adaptSize(10),marginHorizontal:adaptSize(21)}}>
                                <View style={{flexDirection:'row',flex:1}}>
                                    <Text style={{fontSize:13,color:'rgb(153,153,153)'}}>内容:</Text>
                                    <Text numberOfLines={1} style={{fontSize:13,color:'rgb(51,51,51)',flex:1}}> {instance.content}</Text>
                                </View>
                                <Image style={{width:adaptSize(8),height:adaptSize(14),resizeMode:'contain',marginLeft:10}} source={ YFWImageConst.Icon_message_next}></Image>
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            } else if (this.from == kList_from.kList_from_message_home) {           //消息首页
                let instance = YFWWDMessageHomeItemModel.initWithModel(this.props.model)
                return (
                    <TouchableOpacity activeOpacity={1} onPress={() => this.toDetail(instance)} style={[{paddingHorizontal:13,marginTop:20,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}]}>
                        <View style={[BaseStyles.item,BaseStyles.radiusShadow,{backgroundColor:'#FFF',}]}>
                            <View style={{justifyContent:'center',height:90}}>
                                <Image source={instance.image} style={[BaseStyles.imageStyle,{alignItems:'flex-end',height:43,width:43,marginLeft:15}]}/>
                            </View>
                            <View style={{flex:1,justifyContent:'center'}}>
                                <View style={[BaseStyles.leftCenterView]}>
                                    <Text style={[BaseStyles.titleStyle, { width: kScreenWidth - 220, marginLeft: 16, fontSize: 15, marginTop: 0 }]} numberOfLines={1}>{instance.itemTitle}</Text>
                                </View>
                                <View style={[BaseStyles.leftCenterView,{paddingRight:77,paddingLeft:16}]}>
                                    {instance.count>0?<View style={{width:8,height:8,marginTop:12,borderRadius:4,backgroundColor:'rgba(254,119,55,0.8)'}}/>:<View/>}
                                    <Text style={[BaseStyles.contentStyle,{marginTop:12,marginLeft:instance.count>0?2:0,color:'#999999',fontSize:12}]}
                                        numberOfLines={1}>{instance.itemContent}</Text>
                                </View>
                                <Image style={{position:'absolute',right:23,width:25,height:25,resizeMode:'stretch'}} source={YFWImageConst.Icon_nextroung_message}/>
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            } else if (this.from == kList_from.kList_from_message_list) {               //消息列表
                let instance = YFWWDMessageListItemModel.initWithModel(this.props.model)
                return (
                    <View style={[BaseStyles.rowItem]}>
                        <TouchableOpacity activeOpacity={1} style={{flex:1}}>
                            <View style={[BaseStyles.item , {height:51} ]}>
                                <View style={[BaseStyles.item , {height:20,width:134,backgroundColor:'#cccccc',borderRadius:10,marginTop:3} ]}>
                                    <Text style={{fontSize:12,color:'white'}}>{instance.create_time}</Text>
                                </View>
                            </View>
                            <View style={[BaseStyles.item]}>
                            <View style={[BaseStyles.radiusShadow,{width:kScreenWidth - 26,backgroundColor:'#ffffff'}]}>
                                <Text style={[BaseStyles.titleStyle,{width:kScreenWidth - 220,fontWeight:'bold',marginLeft:20}]} numberOfLines={1}>{instance.msg_type_desc}</Text>
                                <View style={{flexDirection:'row',alignItems:'center',paddingBottom:3,paddingRight:24,paddingLeft:21}}>
                                    <Text style={[{fontSize:12,color:'#999999',lineHeight:18,marginLeft:0,}]} numberOfLines={2}>{instance.content}</Text>
                                </View>
                                <View style={[{marginTop:5,marginHorizontal:22,height:1,backgroundColor: "rgb(235,235,235)"}]}/>
                                    <TouchableOpacity onPress={() => this.toDetail(instance)} activeOpacity={1} style={[BaseStyles.leftCenterView,{height:32,justifyContent:'space-around'}]}>
                                    <Text style={[{marginLeft:22,width:kScreenWidth-70,color:'#333333'}]}>查看详情</Text>
                                    {instance.jumptype!=''?<Image source={YFWImageConst.Icon_message_next} resizeMode='contain'style={{ width: 12, height: 12,marginRight:24 }} />:<View/>}
                                </TouchableOpacity>
                            </View>
                        </View>
                        </TouchableOpacity>
                    </View>
                )
            }else if (this.from == kList_from.kList_from_mycoupon) {               //我的优惠券
                let instance = YFWWDCouponModel.initWithModel(this.props.model)
                let img = (instance.status == '1'||instance.status == '2')?YFWImageConst.Icon_icon_coupon_grayimage:YFWImageConst.Icon_icon_coupon_backimage
                let time_start = instance.time_start.split(" ")[0]
                let start_time = time_start.replace(/\-/g,'.')
                let time_end = instance.time_end.split(" ")[0]
                let end_time = time_end.replace(/\-/g,'.')
                let scale = kScreenWidth/375
                let imageIcon = null
                if (instance.expiring_soon == 1&&instance.status == '0') {
                    imageIcon = YFWImageConst.Icon_coupon_willoverdue
                }else if (instance.status== '1') {
                    imageIcon = YFWImageConst.Icon_coupon_used
                }else if (instance.status == '2') {
                    imageIcon = YFWImageConst.Icon_coupon_overdue
                }
                let view = <View style={{backgroundColor:'white',marginLeft:10,marginRight:10,marginTop:10,shadowOffset:{width: 0,height:5},shadowColor:'black',shadowOpacity:0.2,elevation:10}}>
                    <View style={{flexDirection:'row',flex:1}}>
                        <ImageBackground style={{width:112*scale,height:101*scale,alignItems:'center',paddingTop:14}} source={img} imageStyle={{resizeMode:'stretch'}}>
                            <View style={{width:112*scale,paddingHorizontal:10*scale, flexDirection:'row', flexWrap: 'nowrap', justifyContent:'center', alignItems:'center'}}>
                                <Text style={{color:'white',fontSize:21*scale,fontWeight:'bold', includeFontPadding:false}}>¥ </Text>
                                <Text style={{color:'white',fontSize:40*scale,fontWeight:'bold', includeFontPadding:false}} numberOfLines={1}>{parseInt(instance.price.split(".")[0])}</Text>
                            </View>
                            <Text style={{fontSize:13,color:'white',marginBottom:18,marginTop:4}}>{instance.min_order_total}</Text>
                        </ImageBackground>
                        <View style={{flex:1}}>
                            <View style={{marginLeft:13,flexDirection:'row',marginTop:15,alignItems:'center'}}>
                                <View style={{height:18,borderRadius:9,borderStyle: "solid",borderWidth: 1,borderColor:instance.status == '0'?'rgb(84,124,255)':darkTextColor(),paddingHorizontal:7,justifyContent:"center"}}>
                                    <Text style={{fontSize:12,color:instance.status == '0'?'rgb(84,124,255)':darkTextColor()}}>{instance.type=='1'?'店铺':instance.type=='2'?'单品':'平台'}</Text>
                                </View>
                                <Text style={{marginLeft:5,textAlign:'center',fontSize:15,color:this.props.type == '0'?darkTextColor():darkNomalColor()}} numberOfLines={1}>{instance.desc}</Text>
                            </View>
                            <View style={{flex:1}}>
                                <View style={{flex:1,paddingRight:5,paddingLeft:14,paddingBottom:10}}>
                                    <Text style={{fontSize:13,color:darkNomalColor(),marginTop:8}} numberOfLines={1}>{instance.shop_title}</Text>
                                    <Text style={{marginTop:17,fontSize:12,color:darkLightColor()}}>{start_time}{instance.time_start == '' ? "" : '-'}{end_time}</Text>
                                </View>
                                <LinearGradient
                                    style={{width:63,height:22,right:7,bottom:10,position:'absolute',alignItems: 'center',justifyContent: 'center',borderRadius: 21,justifyContent:'center',elevation:2}}
                                    colors={instance.status == '0'?['#5242ff','#416dff']:['#cccccc','#cccccc']}
                                    start={{x: 0, y: 1}}
                                    end={{x: 1, y: 0}}
                                    locations={[0,1]}>
                                        <Text style={{color:'white',fontSize:12}}>{instance.btn_name}</Text>
                                </LinearGradient>
                            </View>
                        </View>
                    </View>
                    {imageIcon?<Image style={{width:45,height:45,resizeMode:'contain',top:10,right:15,position:'absolute'}} source={imageIcon}/>:null}
                </View>
                if (instance.status == '0') {
                    return <TouchableOpacity activeOpacity={1} onPress={() => this.toDetail(instance)}>{view}</TouchableOpacity>
                } else {
                    return <YFWBaseSwipeRow deleleStyle={{marginTop:10}} style={{borderTopRightRadius:7,borderBottomRightRadius:7,paddingHorizontal:12}} selectItemMethod={() => this.toDetail(instance)} delFn={() => this.subMethods('delete',instance)}>{view}</YFWBaseSwipeRow>
                }
            }else {
                return (
                    <TouchableOpacity activeOpacity={1} onPress={() => this.toDetail(this.data)} style={{backgroundColor:"#fff"}}>
                        <View style={[BaseStyles.item, {backgroundColor:'white'}]}>
                            <View style={{justifyContent:'center',height:80}}>
                                <Image style={[BaseStyles.imageStyle,{height:60,width:60,alignItems:'center'}]} source={{uri: tcpImage(this.data.image)}}/>
                            </View>
                            <View style={{flex:1, paddingTop:10, paddingLeft:10}}>
                                <View style={[BaseStyles.leftCenterView]}>
                                    <Text style={[BaseStyles.titleStyle,{width:kScreenWidth - 110,}]} numberOfLines={1}>{this.data.mname}</Text>
                                </View>
                                <View style={[BaseStyles.leftCenterView]}>
                                    <Text style={[BaseStyles.contentStyle,{marginTop:5,color:'#999999'}]}>{this.data.standard}</Text>
                                </View>
                                <View style={[BaseStyles.leftCenterView]}>
                                    <Text style={[BaseStyles.contentStyle,{marginTop:5,color:'#999999'}]}>{this.data.authorized_code}</Text>
                                </View>
                                <View style={{paddingLeft:10}}>
                                    {this.priceView()}
                                </View>
                                <View style={[BaseStyles.separatorStyle,{width:kScreenWidth,marginLeft:10}]}/>
                            </View>
                        </View>
                    </TouchableOpacity>
                )

            }
        } else {            //一行多个item
            let width = (this.props.father.self_width -this.offset*(this.numColumns+1))/this.numColumns
            if (this.from == 'storehome') {                     //商家首页
                let goodType = this.data.medicine_status + ''
                let color = 'rgb(255,51,0)'
                switch (goodType) {
                    case '精选':
                        color = 'rgb(255,51,0)'
                        break;
                    case '促销':
                        color = 'rgb(254,172,76)'
                        break;
                    case '新品':
                        color = 'rgb(31,219,155)'
                        break;
                    case '推荐':
                        color = 'rgb(72,139,255)'
                        break;
                    default:
                        color = 'rgb(255,51,0)'
                        break;
                }
                return (
                    <TouchableOpacity style={[{ width: width }, styles.content, styles.radiusShadow]} activeOpacity={1} onPress={() => this.toDetail(this.data)}>
                        <View style={{ alignItems: 'center', paddingTop: 8 }}>
                            <Image style={styles.image} source={{ uri: tcpImage(safe(this.data.image)) }} defaultSource={YFWImageConst.Icon_default_pic} />
                        </View>
                        <View style={[styles.nameStandardsView, styles.paddingView]}>
                            <Text style={styles.name} numberOfLines={1}>{safe(this.data.mname)}</Text>
                            <Text style={styles.standard} numberOfLines={1}>{safe(this.data.standard)}</Text>
                            <View style={styles.priceView}>
                                {this.priceView(true)}
                            </View>
                        </View>
                        {goodType.length > 0 ? <View style={{
                            height: adaptSize(18), paddingHorizontal: adaptSize(6), flex: 1, justifyContent: 'center', position: 'absolute', top: adaptSize(10), right: adaptSize(8)
                            , borderRadius: adaptSize(9), borderColor: color, borderWidth: 1
                        }}>
                            <Text style={{ color: color, fontSize: 11 }}>{this.data.medicine_status}</Text>
                        </View> : null}
                    </TouchableOpacity>
                )
            } else if (this.from == 'storeList') {                  //商家全部商品
                return (
                    <TouchableOpacity style={[{ width: width ,flex:1}, styles.content, styles.radiusShadow]} activeOpacity={1} onPress={() => this.toDetail(this.data)}>
                        <View style={{ alignItems: 'center', paddingTop: 8 }}>
                            <Image style={styles.image} source={{ uri: tcpImage(safe(this.data.image)) }} defaultSource={YFWImageConst.Icon_default_pic} />
                        </View>
                        <View style={[styles.nameStandardsView, styles.paddingView]}>
                            <Text style={styles.name} numberOfLines={2}>{safe(this.data.mname)}</Text>
                            <Text style={styles.standard} numberOfLines={1}>{safe(this.data.standard)}</Text>
                            {/* {this.freeShippingLabel()} */}
                            <View style={styles.priceView}>
                                {this.priceView(false,false,true,this.data)}
                            </View>
                        </View>
                    </TouchableOpacity>
                )
            }else {
                return (
                    <TouchableOpacity style={[{ width: width }, styles.content, styles.radiusShadow]} activeOpacity={1} onPress={() => this.toDetail(this.data)}>
                        <View style={{ alignItems: 'center', paddingTop: 8 }}>
                            <Image style={styles.image} source={{ uri: tcpImage(safe(this.data.image)) }} defaultSource={YFWImageConst.Icon_default_pic} />
                        </View>
                        <View style={[styles.nameStandardsView, styles.paddingView]}>
                            <Text style={styles.name} numberOfLines={1}>{safe(this.data.mname)}</Text>
                            <Text style={styles.standard} numberOfLines={1}>{safe(this.data.standard)}</Text>
                            <View style={styles.priceView}>
                                {this.priceView()}
                            </View>
                        </View>
                    </TouchableOpacity>
                )
            }

        }
    }

    /**
     *
     * @param {*} showPifa 是否显示批发价
     * @param {*} priceRight 价格是否在右边
     */
    priceView(showPifa,priceRight,showAddCar,instance) {
        return (
            this.hidePrice ?
                <Text style={{color:"#999", fontSize:13, fontWeight:'500',marginVertical:10}}>仅做信息展示</Text>:
                this.hasLogin?<View style={[priceRight ? BaseStyles.rightCenterView : BaseStyles.leftCenterView, {paddingVertical:7,justifyContent:'space-between'}]}>
                    <View style={[BaseStyles.leftCenterView, {flex:1}]}>
                        {showPifa?<Text style={styles.standard} numberOfLines={1}>批发价</Text>:null}
                        <YFWDiscountText navigation={this.props.navigation} style_view={{}} style_text={{fontSize:15,fontWeight:'500'}}
                                        value={'¥'+toDecimal(this.data.wPrice)} discount={this.data.discount}/>
                    </View>
                    {showAddCar ?
                        <TouchableOpacity onPress={() => this.subMethods('addcar',instance)} activeOpacity={1}>
                            <Image style={{ width: 20, height: 20, resizeMode: 'contain', marginRight: 15 }} source={YFWImageConst.List_icon_add_cart} />
                        </TouchableOpacity>
                        :<View/>
                    }
                </View>:
                    <TouchableOpacity activeOpacity={1} onPress={() => { }} style={[priceRight?BaseStyles.rightCenterView:BaseStyles.leftCenterView, {paddingVertical:7,justifyContent:'space-between'}]}>
                    <Text style={{fontSize: 12,color:yfwOrangeColor(),textAlign: 'left'}}>{"价格登录可见"}</Text>
                </TouchableOpacity>
        )
    }


    /**包邮标签 */
    freeShippingLabel() {
        return (
            <LinearGradient style={styles.free_shipping_label_style} colors={['rgb(255,154,103)','rgb(255,96,94)']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} locations={[0,1]}>
                <View style={{ flex: 1,alignItems:'center',justifyContent:'center'}}>
                    <Text style={{ fontSize: 10, color: 'white', fontWeight: 'bold' }}>{50+'元包邮'}</Text>
                </View>
            </LinearGradient>
        )
    }

    toDetail(medicine) {
        this.props.father&&this.props.father.toDetail&&this.props.father.toDetail(medicine)
    }

    subMethods(key,item) {
        this.props.father&&this.props.father.subMethods&&this.props.father.subMethods(key,item)
    }
}

const styles = StyleSheet.create({
    content: {
        backgroundColor: '#fff',
        marginBottom: 5
    },
    radiusShadow:{
        shadowColor: "rgba(206, 206, 206, 0.28)",
        shadowOffset: {width: 1, height: 1},
        elevation: 2,
        shadowRadius: 4,
        shadowOpacity: 1,
        borderRadius: 7
    },
    image: {
        width: 130,
        height: 130,
        resizeMode:'stretch',
    },
    nameStandardsView: {
        flex: 1,
        paddingTop:10,
        justifyContent:'space-between',
        alignItems: 'flex-start',
    },
    name: {
        fontSize: 15,
        fontWeight: 'normal',
        color: darkTextColor(),
    },
    standard: {
        marginTop: 3,
        fontSize: 12,
        color: darkLightColor(),
    },
    free_shipping_label_style: {
        height: 13, borderRadius: 3,marginTop: 3,paddingHorizontal:3
    },
    priceView: {
        marginTop: 6,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceStroiesView: {
        flex: 1,
        justifyContent: 'space-between',
    },
    stories: {
        flex:1,
        fontSize: 12,
        color: yfwGreenColor(),
    },
    paddingView: {
        paddingHorizontal:8,
    }
})
