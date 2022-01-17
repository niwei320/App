import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, FlatList, DeviceEventEmitter,
} from 'react-native';
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {isNotEmpty, itemAddKey, kScreenWidth, isEmpty} from "../../PublicModule/Util/YFWPublicFunction";
import AndroidHeaderBottomLine from "../../widget/AndroidHeaderBottomLine";
import StatusView from "../../widget/StatusView";
import {pushNavigation} from "../../Utils/YFWJumpRouting";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import YFWImageExampleDialog from "../../widget/YFWImageExampleDialog";
import YFWHandleRequest from '../../Utils/YFWHandleRequest';

export default class YFWRefundNegotiationPage extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "协商详情",
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item,{width:50,height:40}]}
                              onPress={()=>{
                                  navigation.goBack();
                              }}>
                <Image style={{width:10,height:16,resizeMode:'stretch'}}
                       source={ require('../../../img/icon_back_gray.png')}/>
            </TouchableOpacity>
        ),
        headerRight: <View/>
    });

    constructor(parameters) {
        super(parameters);
        this.state = {
            loading: false,
            orderNo:'',
            dataArray:[],
        }
    }

//----------------------------------------------LIFECYCLE-------------------------------------------
    componentWillMount() {
        this.state.orderNo    = this.props.navigation.state.params.state.orderNo;
        this._requestData();
    }

    componentDidMount() {
    }

    componentWillUnmount() {

    }

//-----------------------------------------------METHOD---------------------------------------------
    _onRefresh() {
        this.setState({
            loading: true
        });
        this._requestData();

    }

    _requestData(){
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.getNegotiatedDetail');
        paramMap.set('orderno', this.state.orderNo);
        viewModel.TCPRequest(paramMap, (res)=> {
            let dataArray = []
            res.result.map((item)=>{
                let hasVoucheImage = false
                let hasReportImage = false
                let detailInfo = {}
                if (item.status_id == 21) {
                    hasVoucheImage = item.voucher_images&&item.voucher_images.length>0
                    hasReportImage = item.report_images&&item.report_images.length>0
                    detailInfo = {
                        type:item.return_type,
                        reason:item.description,
                        price:item.return_money
                    }
                }
                let voucher_images = hasVoucheImage?item.voucher_images.split('|'):[]
                let report_images = hasReportImage?item.report_images.split('|'):[]
                let handle = new YFWHandleRequest()
                voucher_images = voucher_images.map((url)=>{
                    return handle.convertImg(url)
                })
                report_images = report_images.map((url)=>{
                    return handle.convertImg(url)
                })
                dataArray.push(
                    {   title:item.status_name,
                        timeString:item.create_time,
                        detail:detailInfo,
                        hasVoucheImage:hasVoucheImage,
                        voucher_images:voucher_images,
                        hasReportImage:hasReportImage,
                        report_images:report_images,
                    }
                )
            })
            dataArray = itemAddKey(dataArray);
            this.setState({
                loading: false,
                dataArray:dataArray
            })
        })
    }

    _showAlert(imageArray){
        if (isEmpty(imageArray) || imageArray.length == 0) {
            return
        }
        this._imageDialog.show(imageArray)
    }

//-----------------------------------------------RENDER---------------------------------------------

    _renderItem(item){
        let title = item.item.title
        let timeString = item.item.timeString
        let detail = item.item.detail
        let hasVoucheImage = item.item.hasVoucheImage
        let voucher_images = item.item.voucher_images
        let hasReportImage = item.item.hasReportImage
        let report_images = item.item.report_images
        let detailText=[]
        if(isNotEmpty(detail)){
            isNotEmpty(detail.type) && detailText.push(
                <View style={{flexDirection: 'row', marginTop:16*rpx}}>
                    <Text style={style.msg}>退款类型：</Text>
                    <Text style={style.msg}>{detail.type}</Text>
                </View>
            )
            isNotEmpty(detail.reason) && detailText.push(
                <View style={{flexDirection: 'row'}}>
                    <Text style={style.msg}>退款原因：</Text>
                    <Text style={style.msg}>{detail.reason}</Text>
                </View>
            )
            isNotEmpty(detail.price) && detailText.push(
                <View style={{flexDirection: 'row'}}>
                    <Text style={style.msg}>退款金额：</Text>
                    <Text style={style.msg}>{detail.price}</Text>
                </View>
            )
        }
        return(
            <View style={style.listItem}>
                <Text style={style.title}>{title}</Text>
                <Text style={style.msg}>{timeString}</Text>
                {detailText}
                {hasVoucheImage?<TouchableOpacity style={{marginTop:16*rpx,width:100}}
                                        hitSlop={{left:10,top:10,bottom:10,right:10}}
                                        onPress={()=>{this._showAlert(voucher_images)}}>
                    <Text style={[style.msg, {color:'#1fdb9b'}]}>查看上传凭证</Text>
                </TouchableOpacity>:<View />}
                {hasReportImage?<TouchableOpacity style={{marginTop:16*rpx,width:100}}
                                        hitSlop={{left:10,top:10,bottom:10,right:10}}
                                        onPress={()=>{this._showAlert(report_images)}}>
                    <Text style={[style.msg, {color:'#1fdb9b'}]}>查看检验报告</Text>
                </TouchableOpacity>:<View />}
            </View>
        )
    }

    _renderFooter(){
            return (
                <View style={{alignItems: 'center', marginTop:20*rpx}}>
                    <Text style={style.msg}>没有更多了</Text>
                </View>
            )
    }

    render() {
        return (
            <View style={{flex:1}}>
                <FlatList
                    ref={(flatList)=>this._flatList = flatList}
                    contentContainerStyle={style.list}
                    data={this.state.dataArray}
                    onRefresh={() => this._onRefresh()}
                    refreshing={this.state.loading}
                    renderItem={this._renderItem.bind(this)}
                    ListFooterComponent={this._renderFooter.bind(this)}
                />
                <YFWImageExampleDialog ref={(Dialog)=>this._imageDialog = Dialog}
                                       title={'凭证照片'}
                />
            </View>
        )
    }


}
const rpx = kScreenWidth/375  //设计稿显示单位（IOS，x3）
const style = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    list: {
        paddingHorizontal: 13*rpx,
    },
    listItem: {
        marginTop:20*rpx,
        paddingHorizontal: 13*rpx,
        paddingTop: 20*rpx,
        paddingBottom: 18*rpx,
        borderRadius: 7*rpx,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(204, 204, 204, 0.3)",
        shadowOffset: {
            width: 0,
            height: 3
        },
        elevation:3,
        shadowRadius: 8*rpx,
        shadowOpacity: 1
    },
    title:{
        fontSize: 13*rpx,
        fontWeight: '500',
        color: "#333333"
    },
    msg:{
        fontSize: 12*rpx,
        color: "#999999"
    },
});