import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    NativeModules,
    DeviceEventEmitter
} from 'react-native';
import {
    isIphoneX,
    isNotEmpty,
    kScreenHeight,
    kScreenWidth,
    kStyleWholesale
} from "../../PublicModule/Util/YFWPublicFunction";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import YFWTitleView from "../../PublicModule/Widge/YFWTitleView";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import StatusView from "../../widget/StatusView";
import {YFWImageConst} from "../Images/YFWImageConst";
import YFWWDMore from '../Widget/View/YFWWDMore';
const {StatusBarManager} = NativeModules;

export default class YFWWDOrderReportTypePage extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        // headerTitle: "申请投诉",
        header: null
    });

    constructor(props) {
        super(props);
        this.state = {
            /**
             *
            data: [
                {id:3, text: '发货问题', msg: '发货延迟/缺货/拒发/错发/漏发/少发/异地等'},
                {id:4, text: '商品问题', msg: '退款退货/破损/信息不符/效期问题/刮损涂改等'},
                {id:5, text: '发票问题', msg: '未提供发票/使用其他发票/虚假发票等'},
                {id:6, text: '商家问题', msg: '辱骂/诅咒/威胁/无法联系商家'},
                {id:7, text: '其他', msg: ''},
            ],
             orderNo:'C2002271556531709',
             itemPosition:'123',
             pageSource:'abc'

             */
            typeData: [],
            reasonData: new Map(),

            orderNo : this.props.navigation.state.params.state.value.mOrderNo,
            itemPosition:this.props.navigation.state.params.state.value.itemPosition,
            pageSource:this.props.navigation.state.params.state.value.pageSource,
        }
    }

//----------------------------------------------LIFECYCLE-------------------------------------------

    componentWillMount() {

    }

    componentDidMount() {
        this._fetchData()
    }

    componentWillUnmount() {

    }

//-----------------------------------------------METHOD---------------------------------------------

    _fetchData(){
        let viewModel = new YFWRequestViewModel();
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.whole.order.getComplaintConfig');
        viewModel.TCPRequest(paramMap, (res) => {
            this.status && this.status.dismiss();
            let typeDataArray = []
            let complaintDataArray = []
            if(res.result.TypeInfo instanceof Array){
                res.result.TypeInfo.map((item,index)=>{
                    let data = {
                        id: item.dict_complaints_type,
                        text:item.complaints_name,
                        msg:item.description
                    }
                    typeDataArray.push(data)
                    if(res.result.ComplaintInfo[item.dict_complaints_type] instanceof Array) {
                        let cDataArray = []
                        res.result.ComplaintInfo[item.dict_complaints_type].map((item, index) => {
                            if( item.complaints_reason !== ''){
                                let data = {
                                    id: item.id,
                                    text: item.complaints_reason
                                }
                                cDataArray.push(data)
                            }
                        })
                        complaintDataArray[item.dict_complaints_type] = cDataArray
                    }
                })
            }
            this.setState({
                typeData:typeDataArray,
                reasonData:complaintDataArray,
            })
        }, (error) => {
            this.status && this.status.showNetError()
            console.log(error)
        }, false)
    }

    _onTypeClicked(item){
        this.props.navigation.replace(
            'YFWWDOrderReportDetailPage',
            {
                selectType:item,
                orderNo:this.state.orderNo,
                typeData:this.state.typeData,
                reasonData:this.state.reasonData,
                itemPosition:this.state.itemPosition,
                pageSource:this.state.pageSource,
                goBackKey: this.props.navigation.state.key,
            }
        )
    }
//-----------------------------------------------RENDER---------------------------------------------
    _renderContent() {
        return (
            <View >
                <View style={style.content}>
                    <View style={{ marginLeft: 17, marginTop: 24 }}>
                        <YFWTitleView title={'投诉类型'} from={kStyleWholesale} />
                    </View>
                    {this.state.typeData.map((item, index) => {
                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={1}
                                style={{paddingHorizontal:15,flexDirection: 'row',alignItems:'center'}}
                                onPress={() => this._onTypeClicked(item)}>
                                <View style={style.itemView} overflow='hidden'>
                                    <Text style={{fontSize: 14, color: "#333333"}}>{item.text}</Text>
                                    {isNotEmpty(item.msg)? <Text style={{fontSize: 12, color: "#999999",marginTop:6,includeFontPadding:false}}>{item.msg}</Text>:null}
                                    {index+1!==this.state.typeData.length?<View style={style.dividingLine}/>:null}
                                </View >
                                <Image style={style.arrowImg}
                                       source={YFWImageConst.Icon_message_next} />
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </View>
        )
    }

    _renderHeaderView() {
        let marginTop
        if (Platform.OS === 'ios') {
            marginTop = isIphoneX() ? 44 + 2 : 20 + 2
        } else if (Platform.Version > 19) {
            marginTop = StatusBarManager.HEIGHT
        }
        return (
            <View style={{ width: kScreenWidth, height: 173, resizeMode: 'contain', flexDirection: 'row' }} >
                <Image style={{ height: 173, width: kScreenWidth, position: 'absolute', top: 0, left: 0, right: 0, resizeMode: 'stretch' }} source={YFWImageConst.Bg_page_header_h} />
                <TouchableOpacity onPress={() => this.props.navigation.goBack()} activeOpacity={1}
                                  style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: marginTop }}>
                    <Image style={{ width: 11, height: 19, resizeMode: 'contain' }}
                           source={YFWImageConst.Nav_back_white} />
                </TouchableOpacity>
                <View style={{ flex: 1, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: marginTop }}>
                    <Text style={{ textAlign: 'center', fontSize: 17, color: '#FFF', fontWeight: 'bold' }}>申请投诉</Text>
                </View>
                <View style={{ width: 50, height: 50, justifyContent: 'center', marginTop: marginTop }} activeOpacity={1}>
                    <YFWWDMore/>
                </View>
            </View>
        )
    }

    render() {
        let magin_top
        if (Platform.OS === 'ios') {
            magin_top = isIphoneX() ? 44 + 2 +50: 20 + 2 +50
        } else if (Platform.Version > 19) {
            magin_top = StatusBarManager.HEIGHT+50
        }
        return (
            <View style={{ flex: 1 }}>
                {this._renderHeaderView()}
                {
                    Platform.OS === 'android'?
                        <KeyboardAvoidingView
                            style={{ position: 'absolute', top: magin_top, height: kScreenHeight - magin_top }}
                            behavior='padding'
                            keyboardVerticalOffset={20}
                        >
                            <ScrollView showsVerticalScrollIndicator={false} >
                                {this._renderContent()}
                            </ScrollView>
                        </KeyboardAvoidingView>
                        :
                        <KeyboardAwareScrollView
                            style={{ position: 'absolute', top: magin_top, height: kScreenHeight - magin_top }}
                            extraScrollHeight={100}
                            keyboardDismissMode='on-drag'
                            keyboardShouldPersistTaps='never'
                            showsVerticalScrollIndicator={true}
                            scrollEnabled={true}
                            pagingEnabled={false}
                            horizontal={false}
                        >
                            {this._renderContent()}
                        </KeyboardAwareScrollView>
                }
                <StatusView marginTop={magin_top} ref={(item)=>this.status = item} retry={()=>{this._fetchData()}} navigation={this.props.navigation}/>
            </View>
        )
    }

}

const style = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    content: {
        width:kScreenWidth-24,
        marginHorizontal:12,
        marginVertical:25,
        borderRadius: 10,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(204, 204, 204, 0.6)",
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowRadius: 10,
        shadowOpacity: 1,
        elevation: 2
    },
    itemView: {
        flex:1,
        marginLeft:6,
        justifyContent: 'center',
        height: 72,
    },
    arrowImg: {
        width: 11,
        height: 11,
        resizeMode: 'contain'
    },
    dividingLine: {
        width:kScreenWidth,
        position:'absolute',
        bottom:1,
        opacity: 0.2,
        height:1,
        backgroundColor:'rgb(204,204,204)'
    }
});