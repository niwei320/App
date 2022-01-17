import React from 'react'
import {
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    FlatList,
    TextInput,
    Image,StyleSheet
} from 'react-native'
const width = Dimensions.get('window').width;
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';
import {itemAddKey, isEmpty, isNotEmpty, safe, deepCopyObj} from "../../PublicModule/Util/YFWPublicFunction";
import ReturnGoodsReasonItem from './ReturnGoodsReasonItem'
import UploadVoucher from './UploadVoucher'
import UpLoadInspectionReport from './UpLoadInspectionReport'
import YFWTitleView from '../../PublicModule/Widge/YFWTitleView';
import YFWAlertSheetView from '../View/YFWAlertSheetView';
import { toDecimal } from '../../Utils/ConvertUtils';
import YFWDiscountText from '../../PublicModule/Widge/YFWDiscountText';
import {yfwOrangeColor, yfwRedColor} from '../../Utils/YFWColor'

export default class ReturnGoodsReseon extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selectType: 1,
            reasonType: [],
            dataArray: [],
            mSelectedIndex: 0,
            tips: '',
            report_tips: '',
            is_upload_img: true,
            reason: '',
            promptinfo:'',
            is_show_upload_img_report: 'false',
            selectTypeTcp: 'a',
            orderTotal:'',
            packageShippingPrice:'',
            inputMoney:''
        },
        this.allReason = []
        this.noReceviceReason = []
    }

    componentWillReceiveProps(newProps,oldProps) {
        if (newProps.type == 1) {
            if (this.noReceviceReason.length == 0) {
                this.setState({
                    reason:'',
                    promptinfo:'',
                    tips: '',
                    report_tips: '',
                    is_upload_img: true,
                    is_show_upload_img_report: 'false',
                })
                return
            }
            let selectIndex = 0
            this.noReceviceReason.some((item,index)=>{
                if (item.select) {
                    selectIndex = index
                }
                return item.select
            })
            let info = this.noReceviceReason[selectIndex]
            this.setState({
                reason:info.reason,
                promptinfo:info.promptinfo,
                tips: '',
                report_tips: '',
                is_upload_img: true,
                is_show_upload_img_report: 'false',
                packageShippingPrice:info.logisticsPrice + info.packagePrice,
                orderTotal:info.total_price,
                inputMoney:toDecimal(info.total_price+'')
            })
        } else {
            if (this.allReason.length == 0) {
                return
            }
            let selectIndex = 0
            this.allReason.some((item,index)=>{
                if (item.select) {
                    selectIndex = index
                }
                return item.select
            })
            this._requestReturnGoodsReason(this.allReason[selectIndex].title)
        }
    }

    componentDidMount() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.getReturnGoodsReasonType');
        paramMap.set('orderno', this.props.orderNo);
        viewModel.TCPRequest(paramMap, (res)=> {
            this.setState({
                reasonType: res.result
            });
            this._requestAllReason(res.result)
        });
        if(this.props.returnType == 1) {
            this._requestNoReceviceReason()
        }

    }

    _requestNoReceviceReason() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.getReturnReason');
        paramMap.set('orderno', this.props.orderNo);
        viewModel.TCPRequest(paramMap, (res)=> {
            if (isEmpty(res.result) || res.result.length == 0) {
                return
            }
            let dataArray = itemAddKey(res.result);
            dataArray[0].select = true
            this.noReceviceReason = dataArray
            let info = dataArray[0]
            this.setState({
                dataArray: dataArray,
                reason:info.reason,
                promptinfo:info.promptinfo,
                packageShippingPrice:info.logisticsPrice + info.packagePrice,
                orderTotal:info.total_price,
                inputMoney:toDecimal(info.total_price+'')
            });
        })
    }

    _requestAllReason(fatherReason) {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.getReturnGoodsReason as reasonA,person.order.getReturnGoodsReason as reasonB,person.order.getReturnGoodsReason as reasonD');
        paramMap.set('reasonA',{
            orderno:this.props.orderNo,
            type:fatherReason['a']
        })
        paramMap.set('reasonB',{
            orderno:this.props.orderNo,
            type:fatherReason['b']
        })
        paramMap.set('reasonD',{
            orderno:this.props.orderNo,
            type:fatherReason['d']
        })
        viewModel.TCPRequest(paramMap, (res)=> {
            res.result.reasonA[0].select = true
            res.result.reasonB[0].select = true
            res.result.reasonD[0].select = true
            let seactionArray = [
                {title:fatherReason['a'],select:true,items:res.result.reasonA},
                {title:fatherReason['b'],select:false,items:res.result.reasonB},
                {title:fatherReason['d'],select:false,items:res.result.reasonD},
            ]
            this.allReason = seactionArray
            if(this.props.returnType != 1) {
                this._requestReturnGoodsReason(seactionArray[0].title)
            }
        });
    }

    getReason() {
        return this.state.reason;
    }

    getReturnMoney() {
        return this.state.inputMoney
    }

    getUploadImage_tcp() {
        return this.refs.upload_img&&this.refs.upload_img.getImageDataArray_tcp()
    }

    upLoadImageAgain_tcp() {
        return this.refs.upload_img&&this.refs.upload_img._upLoadPicAgain()
    }

    getUserChoosePicStatus_tcp() {
        return this.refs.upload_img&&this.refs.upload_img.getUserChoosePicStatus_tcp()
    }

    getUpLoadReport_tcp() {
        return this.refs.upload_report&&this.refs.upload_report.getImageDataArray_tcp()
    }

    getUpLoadReportPicAgain_tcp() {
        return this.refs.upload_report&&this.refs.upload_report.getUpLoadReportPicAgain_tcp();
    }

    getUpLoadReportStatus_tcp() {
        return this.refs.upload_report&&this.refs.upload_report.getUserChoosePicStatus_tcp();
    }


    _requestReturnGoodsReason(reason) {
        let items = []
        let have = this.allReason.some((info)=>{
            let exit = info.title == reason
            if (exit) {
                items = info.items
            }
            return exit
        })
        if (!have) {
            return
        }
        let initTips = items[0].promptinfo
        let initReportTips = items[0].prompt_info_report
        let initIs_upload_img = items[0].is_upload_img;
        let initIs_upload_report = items[0].is_show_upload_img_report;
        let initReason = items[0].reason
        let initPromptinfo = items[0].promptinfo
        this.setState({
            dataArray: items,
            tips: initTips,
            report_tips: initReportTips,
            is_upload_img: initIs_upload_img + '',
            reason: initReason,
            promptinfo:initPromptinfo,
            is_show_upload_img_report: initIs_upload_report + '',
            orderTotal:this.props.orderTotal,
            inputMoney:toDecimal(this.props.orderTotal+''),
            packageShippingPrice:this.props.packageShippingPrice,
        })

    }

    render() {
        let titleOne = isEmpty(this.state.reasonType['a']) ? this.state.reasonType[0] : this.state.reasonType['a']
        let titleTwo = isEmpty(this.state.reasonType['b']) ? this.state.reasonType[1] : this.state.reasonType['b']
        let titleThree = isEmpty(this.state.reasonType['d']) ? this.state.reasonType[2] : this.state.reasonType['d']
        return (
            <View>
                <View style={[styles.content,{marginTop:17,backgroundColor:'white'}]}>
                    <TouchableOpacity activeOpacity={1} hitSlop={{left:0,top:10,bottom:10,right:0}} style={{justifyContent:'space-between',alignItems:'center',flexDirection:'row',height:27}}
                                        onPress={()=>this._showReasonSelect()}>
                            <Text style={{color:'#333',fontSize:13,fontWeight:'500',marginLeft:12,flex:1}}>{'退款原因'}</Text>
                            <Text style={{color:'#666',fontSize:13}}>{this.state.reason}</Text>
                            <Image source={require('../../../img/message_next.png')} style={{width:9,height:12,marginRight:13,marginLeft:7}}></Image>
                    </TouchableOpacity>
                </View>
                <Text style={{marginTop:10,marginBottom:17,color:'#999',fontSize:12,marginHorizontal:25}}>{this.state.promptinfo}</Text>
                <View style={{backgroundColor:'#ccc',height:0.5,marginHorizontal:13,flex:1}}></View>
                <View style={{marginLeft:28,marginRight:20}}>
                    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:10,marginBottom:3}}>
                        <Text style={{fontSize:13,color:"#333",fontWeight:'500',marginRight:13}}>退款金额:</Text>
                        {this.props.returnType == 1 && this.props.type == 1?
                        <YFWDiscountText value={'￥'+toDecimal(this.state.orderTotal)} ></YFWDiscountText>:
                        <View style={{flexDirection:'row',alignItems:'center',flex:1}}>
                            <Text style={{color:yfwRedColor(),fontSize:12,textAlign:'right',flex:1,marginBottom:-2.5}}>{'￥'}</Text>
                            <TextInput style={{fontSize:16,marginLeft:1,color:yfwRedColor()}}
                                        underlineColorAndroid='transparent'
                                        keyboardType='numeric'
                                        value={this.state.inputMoney}
                                        onChangeText={(text)=>this._onTextChange(text)}
                                        onEndEditing={(text)=>this._onEndEditing(text)}
                                        >

                            </TextInput>
                        </View>
                        }

                    </View>
                    <Text style={{fontSize:12,color:'#999'}}>{'最多'+toDecimal(this.state.orderTotal)+'元（含运费及包装费）'}</Text>
                </View>
                {this._renderUploadVoucher()}
                {this._renderUpLoadInspectionReport()}
                <YFWAlertSheetView ref={(e)=>this.sheetView = e}></YFWAlertSheetView>
            </View>
        )
    }

    _renderUploadVoucher(){
        if (this.state.is_upload_img == 'true') {
            return (
                <View style={[styles.otherContent,{marginTop:17}]}>
                    <UploadVoucher tips={this.state.tips} is_upload_img={this.state.is_upload_img} ref='upload_img'/>
                </View>
            )
        }

        return null
    }

    _renderUpLoadInspectionReport(){
        if (this.state.is_show_upload_img_report == 'true') {
            return (
                <View style={[styles.otherContent,{marginTop:17}]}>
                    <UpLoadInspectionReport tips={this.state.report_tips} is_upload_report={this.state.is_show_upload_img_report}
                                        ref='upload_report'/>
                </View>
            )
        }

        return null
    }

    _renderItem = (item) => {
        return (
            <ReturnGoodsReasonItem itemData={item} _stateChanged={this.itemStateChange.bind(this)}
                                   selected={this.state.mSelectedIndex} dataLength={this.state.dataArray.length}/>
        )
    };

    _onTextChange(text) {
        this.setState({
            inputMoney:text
        })

    }

    _onEndEditing() {
        let text = toDecimal(this.state.inputMoney)
        let newNumber = parseFloat(text)
        let maxMoney = parseFloat(this.state.orderTotal)
        if (isNaN(newNumber) || newNumber > maxMoney) {
            newNumber = maxMoney
        } else if (newNumber < 0) {
            newNumber = 0
        }
        this.setState({
            inputMoney:toDecimal(newNumber)
        })
    }

    /*
     *  切换退款原因的
     * */
    _oneTypeOfReasonSelected(number) {
        switch (number) {
            case 1:
                this.state.selectTypeTcp = 'a'
                break;
            case 2:
                this.state.selectTypeTcp = 'b'
                break;
            case 3:
                this.state.selectTypeTcp = 'd'
                break
        }
        this.state.selectType = number
        if (number == 1) {
            this.setState({
                mSelectedIndex: 0
            })
        }
        if (number == 2) {
            this.setState({
                mSelectedIndex: 0
            })
        }
        if (number == 3) {
            this.setState({
                mSelectedIndex: 0
            })
        }
        this._requestReturnGoodsReason(this.state.reasonType[this.state.selectTypeTcp])

    }

    _showReasonSelect() {
        if (this.props.returnType == 1 && this.props.type == 1) {
            this.sheetView.showView(this.noReceviceReason,(allReason)=>{
                this.noReceviceReason = deepCopyObj(allReason)
                let selectIndex = 0
                allReason.some((item,index)=>{
                    if (item.select) {
                        selectIndex = index
                    }
                    return item.select
                })
                let info = allReason[selectIndex]
                this.setState({
                    dataArray:deepCopyObj(allReason),
                    reason:info.reason,
                    promptinfo:info.promptinfo,
                    orderTotal:info.total_price,
                    inputMoney:toDecimal(info.total_price+''),
                    packageShippingPrice:info.logisticsPrice + info.packagePrice,
                })
            })
            return
        }
        this.sheetView.showView(this.allReason,(allReason)=>{
            this.allReason = deepCopyObj(allReason)
            let fatherIndex = 0
            this.allReason.some((item,index)=>{
                if (item.select) {
                    fatherIndex = index
                }
                return item.select
            })
            let selectIndex = 0
            this.allReason[fatherIndex].items.some((item,index)=>{
                if (item.select) {
                    selectIndex = index
                }
                return item.select
            })
            this.setState({
                selectReason:this.allReason[fatherIndex].items[selectIndex]
            })
            this.itemStateChange({index:fatherIndex,item:this.allReason[fatherIndex].items[selectIndex]})
        })
    }

    _underLine(number) {
        if (this.state.selectType == number)
            return (
                <View style={{backgroundColor:'#16c08e',height:2,marginTop:14,flex:1,width:width/3}}/>
            )
    }

    itemStateChange(itemData) {
        this.setState({
            mSelectedIndex: itemData.index,
            tips: itemData.item.promptinfo,
            is_upload_img: itemData.item.is_upload_img + '',
            reason: itemData.item.reason,
            promptinfo:itemData.item.promptinfo,
            is_show_upload_img_report: itemData.item.is_show_upload_img_report + ''
        });

    }
}
const styles = StyleSheet.create({
    container: {

    },
    content: {
        flex:1,
        borderRadius: 7,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(204, 204, 204, 0.6)",
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowRadius: 8,
        shadowOpacity: 1,
        paddingVertical:10,
        marginHorizontal: 13,
    },
    otherContent:{
        flex:1,
        paddingVertical:10,
        marginHorizontal: 23,
    }
})