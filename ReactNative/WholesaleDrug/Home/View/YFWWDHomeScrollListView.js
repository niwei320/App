import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Image,
    View,
    Text,
    TouchableOpacity,
    ScrollView, DeviceEventEmitter
} from 'react-native';
import {yfwOrangeColor} from '../../../Utils/YFWColor'
import {isNotEmpty, mobClick, tcpImage,isEmpty, iphoneTopMargin, adaptSize, convertImg, safeObj} from "../../../PublicModule/Util/YFWPublicFunction";
import YFWUserInfoManager from '../../../Utils/YFWUserInfoManager'
import { doAfterLogin, kRoute_category, pushWDNavigation} from '../../YFWWDJumpRouting';

export default class YFWWDHomeScrollListView extends Component {

    static defaultProps = {
        Data:new Array(),
    }

    constructor(props) {
        super(props);
        this.state = {
            noLocationHidePrice: YFWUserInfoManager.ShareInstance().getNoLocationHidePrice(),
        }
    }

    componentDidMount() {
        let that = this
        //定位相关显示状态监听
        this.locationListener = DeviceEventEmitter.addListener('NO_LOCATION_HIDE_PRICE',(isHide)=>{
            that.setState({
                noLocationHidePrice:isHide
            })
        })
    }

    componentWillUnmount() {
        // 移除
        this.locationListener && this.locationListener.remove()
    }

    render() {
        return (
            <ScrollView style={styles.scrollViewStyle} horizontal={true} showsHorizontalScrollIndicator={false}>
                {this.renderItem()}
            </ScrollView>
        );

    }

    renderItem() {
        // 数组
        var itemAry = [];
        if (!this.props.Data) {
            return itemAry
        }
        // 遍历
        for (let i = 0; i<this.props.Data.length; i++) {
            let dataItem = safeObj(this.props.Data[i]);
            let width_one = this.dealPix(dataItem.img_width)
            let height_one = this.dealPix(dataItem.img_height)
            width_one = 109
            height_one = 129
            let img_url = dataItem.img_url
            let marginLeft = 12
            itemAry.push(
                <View key={i} style={[styles.itemStyle,{marginLeft:adaptSize(marginLeft)},{width:adaptSize(width_one),height:adaptSize(height_one)} ]}>
                    <TouchableOpacity activeOpacity={1} style={{flex:1}}  onPress={()=>this._onShroundItemClick(dataItem)}>
                        <Image style={[styles.imgStyle,{width:adaptSize(width_one),height:adaptSize(height_one)} ]} resizeMode={'contain'} source={{uri:img_url}}/>
                    </TouchableOpacity>
                </View>
            );
        }
        return itemAry;
    }

    dealPix(sizeInfo){
        return isNaN(parseInt(safeObj(sizeInfo).replace('px',''))/2)?0:parseInt(safeObj(sizeInfo).replace('px',''))/2;
    }

    doAfterLogin(){

        let {navigate} = this.props.navigation;
        doAfterLogin(navigate,()=>{});

    }

    _onShroundItemClick(badge){
        if(isNotEmpty(safeObj(safeObj(badge)).type)){
            const { navigate } = this.props.navigation;
            pushWDNavigation(navigate, badge)
        }
    }

}

var styles = StyleSheet.create({
    scrollViewStyle: {
        // 背景色
        backgroundColor:'rgb(250,250,250)',
        // height:adaptSize(130),
    },

    itemStyle: {
        marginLeft:1

    },
    imgStyle:{
        backgroundColor:'rgb(250,250,250)',
        width: adaptSize(92),
        height:adaptSize(92),
        resizeMode:'contain',

    },
    textStyle:{
        color:'#333',
        marginTop:11,
        fontSize:11,
        fontWeight:'400',
        textAlign:'left'
    },
    priceStyle:{
        fontSize: 12,
        color:yfwOrangeColor(),
        textAlign: 'right',
    },
});
