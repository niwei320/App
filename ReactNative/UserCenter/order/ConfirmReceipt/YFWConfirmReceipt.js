import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    DeviceEventEmitter
} from 'react-native';
import {
    isAndroid, isEmpty,
    isIphoneX, isNotEmpty, kScreenHeight,
    kScreenWidth, safe, safeArray, safeObj, tcpImage
} from "../../../PublicModule/Util/YFWPublicFunction";
import YFWTouchableOpacity from "../../../widget/YFWTouchableOpacity";
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import {IDENTITY_CODE, TEXT_COMMA} from "../../../PublicModule/Util/RuleString";
import YFWNativeManager from "../../../Utils/YFWNativeManager";
import YFWToast from "../../../Utils/YFWToast";
import YFWRequestViewModel from "../../../Utils/YFWRequestViewModel";
import {pushNavigation} from "../../../Utils/YFWJumpRouting";
import {KIsShowReceiptLottery, kLastDateLaunchApp, setItem} from "../../../Utils/YFWStorage";

export default class YFWConfirmReceipt extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: '确认收货',
        headerRight: <View style={{width:50}}/>
    });

    constructor(props) {
        super(props);
        this.state = {
            data:[],
            batch_code:new Map(),
            batch_code_state:new Map(),
        }
    }

//----------------------------------------------LIFECYCLE-------------------------------------------

    componentWillMount() {

    }

    componentDidMount() {
        let item = this.props.navigation.state.params.data
        let dataArray =[]
        let {batch_code_state} = this.state
        item.data.goods_items.map((data)=>{
            console.log(JSON.stringify(data))
            safeArray(data.data).map((goodsItem)=>{
                if(!batch_code_state.has(goodsItem.shop_goods_id)){
                    batch_code_state.set(goodsItem.shop_goods_id,true)
                    dataArray.push(goodsItem)
                }
            })
        })
        this.setState({
            data:dataArray,
            orderno:item.data.order_no,
            pageSource:item.pageSource,
        })
        YFWNativeManager.changeIQKeyboardManagerEnable(true)
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                YFWNativeManager.changeIQKeyboardManagerEnable(true)
            }
        );

        this.willBlur = this.props.navigation.addListener('willBlur', payload => {
            YFWNativeManager.changeIQKeyboardManagerEnable(false)
        });

    }

    componentWillUnmount() {
        YFWNativeManager.changeIQKeyboardManagerEnable(false)

    }

//-----------------------------------------------METHOD---------------------------------------------
    _confirm() {
        let {batch_code} = this.state
        let {batch_code_state} = this.state
        let {orderno} = this.state
        let {pageSource} = this.state
        let submitState = true   //是否可提交
        let submitDataArray = [] //提交数据
        batch_code.forEach((value,key,map)=>{
            submitDataArray.push({'medicineid':key,'batchno':value})
            let isOk = true
            //判断批号空情况
            if(value.trim().length === 0){
                batch_code.delete(key)
                isOk = true
            }
            if(!isOk){
                submitState = false
            }
            batch_code_state.set(key, isOk)
        })
        if(batch_code.size === 0 ) {
            this.setState({})
            YFWToast('您还未填写产品批号请确认')
            return
        }
        if(!submitState) {
            this.setState({})
            YFWToast('您填写的产品批号有误，请重新填写')
            return
        }
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.SaveOrderBatchNo');
        paramMap.set('orderno', orderno);
        paramMap.set('list', JSON.stringify(submitDataArray));
        viewModel.TCPRequest(paramMap, (res)=> {
            //刷新列表状态
            DeviceEventEmitter.emit('order_status_refresh', pageSource);
            setItem(KIsShowReceiptLottery, true);
            this.props.navigation.replace('YFWWebView',{state: {type:'YFWWebView',value:safeObj(res.result),isHiddenShare:true,title:'赢取优惠券'}})
        }, (error)=> {
            let errorMessaege = '';
            if (isNotEmpty(error) && isNotEmpty(error.msg)) {
                errorMessaege = error.msg;
                YFWToast(errorMessaege)
            }
        },false)
    }

    _jumpToExamples() {
        this.props.navigation.navigate('YFWBatchNumberExamples',{})
    }

//-----------------------------------------------RENDER---------------------------------------------
    _renderHeaderView() {
        return(
            <View style={{flexDirection: 'row',justifyContent:'space-evenly',alignItems:'center', height:67,backgroundColor: '#ffffff'}}>
                <View style={{alignItems:'center',flexDirection: 'row'}}>
                    <Image style={{height:24,width:19}} resizeMode='stretch' source={require('../../../../img/icon_form.png')}/>
                    <Text style={{marginLeft:6,color:'#1fdb9b',fontSize:14,fontWeight:'bold'}}>填写批号    ></Text>
                </View>
                <View style={{alignItems:'center',flexDirection: 'row'}}>
                    <Image style={{height:22,width:22}} resizeMode='stretch' source={require('../../../../img/icon_receipt.png')}/>
                    <Text style={{marginLeft:6,color:'#1fdb9b',fontSize:14,fontWeight:'bold'}}>确认收货    ></Text>
                </View>
                <View style={{alignItems:'center',flexDirection: 'row'}}>
                    <Image style={{height:23,width:23}} resizeMode='stretch' source={require('../../../../img/icon_award.png')}/>
                    <Text style={{marginLeft:6,color:'#1fdb9b',fontSize:14,fontWeight:'bold'}}>翻牌抽奖</Text>
                </View>
            </View>
        )
    }

    _renderPromptView() {
        return (
            <TouchableOpacity
                activeOpacity={1}
                onPress={this._jumpToExamples.bind(this)}
                style={{alignItems:'center',justifyContent:'space-between',flexDirection: 'row',paddingVertical: 8, paddingHorizontal: 14, backgroundColor: "#faf8dc"}}
            >
                <Text style={{fontSize: 13, color: "#feac4c"}}>彰显平台规范和监管责任，提高商家服务质量，请如实根据商品包装盒上的【产品批号】填写</Text>
                <Image style={{height:9,width:6,marginRight:9,marginLeft:3}} source={require('../../../../img/icon_arrow_y.png')}/>
                <Text style={{fontSize: 13, color: "#378cff",position:'absolute',bottom:6,right:isAndroid()?23:15}} >查看批号说明</Text>
            </TouchableOpacity>
        )
    }

    _renderContent() {
        let {data} = this.state
        return (
            <KeyboardAvoidingView style={{flex:1}} behavior="padding" keyboardVerticalOffset={80}>
                <FlatList
                    style={{paddingTop:19,flex:1}}
                    ListFooterComponent={<View style={{height:200}} />}
                    renderItem={(item)=>this._renderItem(item)}
                    keyExtractor={(item, index) => index+""}
                    data={data}
                />
            </KeyboardAvoidingView>
        )
    }

    _renderItem(item) {
        let id = item.item.shop_goods_id
        let image = item.item.img_url
        let name = item.item.title
        let standard = item.item.standard
        let inputColor = this.state.batch_code_state.get(id) !== undefined && !this.state.batch_code_state.get(id)?"#ff0000":"#333333"
        let inputBorderColor = this.state.batch_code_state.get(id) !== undefined && !this.state.batch_code_state.get(id)?"#ff0000":"#b5b5b5"
        return (
            <View style={[{width:kScreenWidth-40, flexDirection:'row', borderRadius: 7, backgroundColor: "#ffffff", marginBottom: 18, marginLeft:20},BaseStyles.radiusShadow]}>
                <Image
                    style={{height:103, width:103, marginLeft:9, marginRight:11, marginTop:12, marginBottom:14, resizeMode:'contain'}}
                    source={{uri:tcpImage(image)}}
                />
                <View >
                    <Text style={{fontSize: 15, color: "#000000", fontWeight:'bold', marginTop:20, width:kScreenWidth-136-31}} numberOfLines={1} ellipsizeMode={'tail'}>
                        {name}
                    </Text>
                    <Text style={{fontSize: 11, color: "#666666", marginTop:8,}} numberOfLines={1}>{standard}</Text>
                    <TextInput
                        returnKeyType={'done'}
                        maxLength={50}
                        multiline
                        underlineColorAndroid='transparent'
                        placeholder={'请如实填写，若有多个逗号分开'}
                        placeholderTextColor="#cccccc"
                        style={[styles.input,{
                            color:inputColor,
                            borderColor: inputBorderColor,}]}
                        value={this.state.batch_code.get(id)}
                        onChangeText={(text) => {
                            this.state.batch_code_state.set(id, true)
                            if (text) {
                                this.state.batch_code.set(id, safeObj(this.verifyInput(text)))
                                this.setState({})
                            } else {
                                this.state.batch_code.set(id, '')
                                this.setState(() => ({
                                    batch_code: this.state.batch_code,
                                }))
                            }
                        }}
                    />
                </View>
            </View>
        )
    }

    /**
     * 校验输入
     */
    verifyInput(txt) {
        if (isEmpty(txt)) {
            return txt
        }
        return txt.trim()
    }

    _renderBottomButton() {
        return (
            <View style={{
                position:'absolute',
                width:kScreenWidth,
                backgroundColor:'rgba(239,239,239,0.8)',
                bottom:0,
                paddingBottom:isIphoneX()?46:26,
                justifyContent:'flex-end',
                alignItems: 'center',}}
            >
                <YFWTouchableOpacity
                    style_title={{ height: 44, width: kScreenWidth - 13 * 2, fontSize: 17 }}
                    title={'确认收货'}
                    callBack={this._confirm.bind(this)}
                    isEnableTouch={true}
                />
            </View>
        )
    }

    render() {
        return (
            <View style = {{flex: 1}}>
                {this._renderPromptView()}
                {this._renderHeaderView()}
                {this._renderContent()}
                {this._renderBottomButton()}
            </View>
        )
    }

}

const styles = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    input: {
        marginTop:16,
        fontSize: 12,
        fontWeight:'bold',
        width:kScreenWidth-136-41,
        marginBottom:14,
        paddingVertical:3,
        minHeight:27,
        paddingHorizontal:3,
        borderRadius: 3,
        borderStyle: "solid",
        borderWidth: 1,
    },
});