import React, {Component} from 'react';
import {
    DeviceEventEmitter,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform
} from 'react-native';
import {darkLightColor, darkNomalColor, darkTextColor, separatorColor,backGroundColor} from "../../../Utils/YFWColor";
import {
    isEmpty,
    isNotEmpty,
    kScreenWidth,
    safe,
    safeObj,
    tcpImage,
    convertImg,coverAuthorizedTitle
} from '../../../PublicModule/Util/YFWPublicFunction'
import YFWUserInfoManager from '../../../Utils/YFWUserInfoManager'
import YFWToast from "../../../Utils/YFWToast";
import YFWPrescribedGoodsTitle, {
    TYPE_DOUBLE,
    TYPE_NOMAL,
    TYPE_PRESCRIPTION,
    TYPE_SINGLE,
    TYPE_OTC
} from "../../../widget/YFWPrescribedGoodsTitle";
import FastImage from 'react-native-fast-image'
import YFWOpenText from '../../../widget/YFWOpenText';
import { pushWDNavigation, kRoute_html, kRoute_big_picture } from '../../YFWWDJumpRouting';

export default class YFWWDSellersListGoodsHeaderView extends Component {

    static defaultProps = {
        Data: undefined,
        shopCount: '0',
    }

    constructor(props) {
        super(props);
        this.state = {
            sameShopPic: [],
            deleteIconVisibility: false,
            hidePrice: YFWUserInfoManager.ShareInstance().getNoLocationHidePrice()
        };
        this.addListener()
    }

    addListener(){
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                this.getSameData()
            }
        );
    }

    getSameData(){
    }

    componentDidMount() {
        this.priceListener = DeviceEventEmitter.addListener('NO_LOCATION_HIDE_PRICE',(isHide)=>{
            this.setState({
                hidePrice: isHide
            })
        })
    }

    componentWillUnmount(){
        if(isNotEmpty(this.sameStoreListener)){
            this.sameStoreListener.remove()
        }
        this.didFocus && this.didFocus.remove()
        this.priceListener&&this.priceListener.remove()
    }

    componentWillReceiveProps(){
    }

    render() {
        if(isEmpty(this.props.Data) || Object.keys(isEmpty(this.props.Data)?{}:this.props.Data).length === 0){
            return<View />
        }
        let explainTitle = safe(this.props.Data.applicability).replace(/<[^>]+>/g,"").replace(/(↵|\r|\n)/g,"").trim()
        return (
            <View style={{backgroundColor:backGroundColor()}}>
                <View style={[styles.container,{backgroundColor:'#FFFFFF'}]}>
                    <View style={styles.content}>
                        <View style={{flexDirection:'row'}}>
                            <TouchableOpacity activeOpacity={1} onPress={()=>this.showAllBigImage()}>
                                {this.renderGoodsImage()}
                            </TouchableOpacity>
                            <View style={{flex:1,marginLeft:11}}>
                                {this.renderTitleView()}
                                <View style={[styles.container4]}>
                                    <Text style={styles.smrollSizeText}>产品规格:<Text style={{color:this.props.Data.isCanSale?darkTextColor():darkLightColor()}}>{this.props.Data.standard}</Text></Text>
                                </View>
                                <View style={[styles.container4,{marginTop:7}]}>
                                    <Text style={styles.smrollSizeText}>{this.props.Data.authorizedCode_title}:<Text style={{color:this.props.Data.isCanSale?darkTextColor():darkLightColor()}}>{this.props.Data.authorized_code}</Text></Text>
                                </View>
                                {isNotEmpty(this.props.Data.bentrusted_store_name) && (this.props.Data.name_path && this.props.Data.name_path.indexOf('保健') !== -1)?<View style={[styles.container4]}>
                                    <Text style={styles.smrollSizeText}>委托企业:<Text style={{color:this.props.Data.isCanSale?darkTextColor():darkLightColor()}}>{this.props.Data.bentrusted_store_name}</Text></Text>
                                </View>:<View />}
                                <View style={{marginTop:9,flexDirection:'row'}}>
                                    <View style={{flex:1}}></View>
                                </View>
                                {explainTitle.length>0&&explainTitle.length < 22?<Text style={[styles.smrollSizeBlackText,{flex:1,marginTop:22}]} numberOfLines={1}>{explainTitle}</Text>:null}
                            </View>
                        </View>
                        {explainTitle.length > 22?<YFWOpenText style={{fontSize:12,width:kScreenWidth-44,marginHorizontal:22,color: '#999',lineHeight:14,marginTop:15}}
                            expandTextStyle={{color:'#1fdb9b',fontSize:12}}
                            numberOfLines={2}>{explainTitle}</YFWOpenText>:null}
                    </View>
                </View>
            </View>
        );
    }

    renderGoodsImage(){
        if (Platform.OS == 'ios') {
            return (
                <FastImage
                style={styles.iconStyle}
                source={{uri:tcpImage(safeObj(safeObj(this.props.Data).img_url))}}
                resizeMode={FastImage.resizeMode.contain}
                />
            )
        }
        return (
            <Image
            style={[styles.iconStyle,{resizeMode: 'contain'}]}
            source={{uri:tcpImage(safeObj(safeObj(this.props.Data).img_url))}}/>
        )
    }

    /**
     * 返回处方药提示
     * YFW-3715 比价页改动 去除该功能
     */
    renderPrescribedTips(){
        //3.1.00版本才有，并且现阶段只有HTTP才有
        if(safeObj(this.props.Data).prompt_info){
            return (
                <TouchableOpacity activeOpacity={1} style={{backgroundColor:'#f9f9f9',paddingLeft:15,paddingRight:15,paddingTop:10,paddingBottom:10}}>
                    <Text style={{color:darkLightColor(),fontSize:14}}>{safeObj(this.props.Data).prompt_info}</Text>
                </TouchableOpacity>
            )
        }
    }

    /**
     * 跳转H5单双轨说明
     */
    showPrescribedTips(){
        if(isNotEmpty(this.props.Data.prompt_url)){
            pushWDNavigation(this.props.navigation.navigate,{type:kRoute_html,value:this.props.Data.prompt_url,title:'H5单双轨说明页'})
        }
    }

    showAllBigImage(){
        if (isNotEmpty(this.props.Data.image_list)) {
            let allImageUrls = this.props.Data.image_list.map((imageUrl)=>{
                return convertImg(imageUrl)
            })
            pushWDNavigation(this.props.navigation.navigate,{type:kRoute_big_picture,value:{imgs:allImageUrls,index:0}})
        }
    }

    convertShopCout(count){
        try{
            count = parseInt(count)
            if(count > 999){
                count = "999+"
            }
        }catch (e) {}
        return count
    }

    renderTitleView() {
        //单双轨3.1.00版本才有，并且现阶段只有HTTP才有
        //单轨药
        if(safeObj(this.props.Data).PrescriptionType+"" === "1"){
            return this.rednerPrescriptionLabel(TYPE_SINGLE,this.props.Data.title,()=>{this.showPrescribedTips()})
        }
        //双轨药
        else if(safeObj(this.props.Data).PrescriptionType+"" === "2"){
            return this.rednerPrescriptionLabel(TYPE_DOUBLE,this.props.Data.title,()=>{this.showPrescribedTips()})
        }
        //OTC
        else if(safeObj(this.props.Data).PrescriptionType+"" === "0"){
            return this.rednerPrescriptionLabel(TYPE_OTC,this.props.Data.title,()=>{this.showPrescribedTips()})
        }
        //处方药
        else {
            return this.rednerPrescriptionLabel(TYPE_NOMAL,safeObj(this.props.Data).title)
        }
    }

    /**
     * 返回处方标签
     * @param img
     * @returns {*}
     */
    rednerPrescriptionLabel(type,title,onClick){

        return <YFWPrescribedGoodsTitle
            type={type}
            title={title}
            style={{
                fontSize: 15,
                lineHeight:18,
                color: safeObj(this.props.Data).isCanSale?darkTextColor():darkLightColor(),
                fontWeight:'bold',
                marginLeft: 2,
            }}
            onClick={()=>{onClick && onClick()}}
        />
    }
}


//设置样式
const styles = StyleSheet.create({
    content:{
        paddingTop:26,
        paddingBottom:19,
        backgroundColor: "#ffffff",
    },
    container: {
        //    确定主轴的方向
        flexDirection: 'column',
        width: Dimensions.get('window').width,
        backgroundColor: 'white',

    },
    container2: {
        //    确定主轴的方向
        flexDirection: 'column',
        height: 50,
        width: Dimensions.get('window').width,
        backgroundColor: 'white',
        marginTop: 10,

    },
    container3: {
        //    确定主轴的方向
        flexDirection: 'column',
        height: 50,
        width: Dimensions.get('window').width,
        backgroundColor: 'white',
    },
    iconStyle: {
        width: 107,
        height: 107,
        marginLeft: 17,
    },
    icon2Style: {
        width: 40,
        marginBottom: 10,
        marginTop: 0,
        resizeMode: 'contain',
    },
    cfyIconStyle: {
        resizeMode:'contain',
        height:15,
        width:35,
        marginTop:2,
        marginLeft:5
    },
    separatorStyle: {
        backgroundColor: separatorColor(),
        height: 1,
        width: Dimensions.get('window').width - 100,
        marginLeft: 100,
    },
    titleStyle: {
        fontSize: 14,
        width: Dimensions.get('window').width - 120,
        color: darkTextColor(),
        marginLeft: 5,
        marginRight: 10,
        marginBottom: 5,
    },
    textStyle: {
        fontSize: 13,
        textAlign: 'left',
        color: darkNomalColor(),
        width: Dimensions.get('window').width - 120,
        marginLeft: 10,
        marginTop: 5,
    },
    contentStyle: {
        fontSize: 13,
        textAlign: 'left',
        color: darkNomalColor(),
        width: Dimensions.get('window').width - 60,
        marginLeft: 15,
        marginTop: 10,
    },

    shopCountStyle: {

        width: 120,
        marginTop: 15,
        color: darkNomalColor(),
        textAlign: 'center',
        fontSize: 13,
    },
    shopCountseparatorStyle: {
        backgroundColor: separatorColor(),
        height: 30,
        width: 0.5,
        marginTop: 10,
    },
    goodsStandardStyle: {

        width: 200,
        marginTop: 15,
        marginLeft: 30,
        color: darkNomalColor(),
        textAlign: 'left',
        fontSize: 13,
    },
    clickItemStyle: {

        flex: 1,
        marginTop: 15,
        textAlign: 'center',
        fontSize: 13,
        color: darkNomalColor(),
    },
    container4: {
        flexDirection: 'row',
        marginTop:9,
        alignItems: 'center'
    },
    smrollSizeText: {
        fontSize: 12,
        minWidth:60,
        color: darkLightColor()
    },
    smrollSizeTextColorGreen: {
        fontSize: 13,
        color: '#16c08e'
    },
    smrollSizeTextColorYellow: {
        fontSize: 13,
        color: '#FF9100',
        marginLeft: 5
    },
    smrollSizeTextWithRadio: {

    },
    smrollSizeBlackText: {
        fontSize: 12,
        color: '#999',
        lineHeight:14
    },
    dashedBorder:{
        borderRadius: 7,
        borderStyle: "dashed",
        borderWidth: 1,
        borderColor: "#ccc",
    },
    shadowStyle:{
        backgroundColor: "#fff",
	    shadowColor: "rgba(204, 204, 204, 0.5)",
	    shadowOffset: {
		    width: 0,
		    height: 4
	    },
	    shadowRadius: 8,
        shadowOpacity: 1,
        borderRadius: 7,
    }

});