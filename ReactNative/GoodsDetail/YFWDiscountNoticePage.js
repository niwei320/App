import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    TextInput,
    DeviceEventEmitter,
    Platform,
    AppState,
    ScrollView,
} from 'react-native';
import YFWNativeManager from "../Utils/YFWNativeManager";
import {toDecimal} from "../Utils/ConvertUtils";
import {
    isEmpty,
    kScreenWidth,
    safe,
} from "../PublicModule/Util/YFWPublicFunction";
import {DECIMAL, NUMBERS, TEXT_COMMA} from "../PublicModule/Util/RuleString";
import YFWTouchableOpacity from "../widget/YFWTouchableOpacity";
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import BaseTipsDialog from "../PublicModule/Widge/BaseTipsDialog";
import YFWToast from "../Utils/YFWToast";
import {postPushDeviceInfo} from "../Utils/YFWInitializeRequestFunction";
import YFWHeaderLeft from "../WholesaleDrug/Widget/YFWHeaderLeft";

export default class YFWDiscountNoticePage extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: '我的提醒',
        headerRight: <View style={{width:50}}/>
    });

    constructor(props) {
        super(props);
        this.state = {
            data:'',
            price:'',
            isOpenNotification:true,
        }
    }

//----------------------------------------------LIFECYCLE-------------------------------------------

    componentWillMount() {
        let data = this.props.navigation.state.params.state.data
        console.log(JSON.stringify(data))
        YFWNativeManager.isOpenNotification((openStatus)=>{
            this.setState({
                isOpenNotification: openStatus
            })
        })

        this.setState({
            data:data,
        })
    }


    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);
    }

    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

//-----------------------------------------------METHOD---------------------------------------------

    _handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'active') {
            YFWNativeManager.isOpenNotification((openStatus)=>{
                this.setState({
                    isOpenNotification:openStatus
                })
            })
        }
    }
    inputClear(){
        this.setState({
            price:''
        })
    }
    /**
     * 校验输入
     */
    verifyInput(txt) {
        if (isEmpty(txt)) {
            return txt
        }
        txt = txt.replace(DECIMAL, '')
        let arr = txt.split('.')
        if(arr.length >= 2){
            if(arr[1].length > 2){
                return this.state.price
            }
            if(arr.length > 2){
                return this.state.price
            }
        }
        if(txt.startsWith('.')){
            return '0' + txt
        }
        if(txt === '0'){
            if(this.state.price === '0.'){
                return txt
            }
            return '0.'
        }
        if(
            txt.startsWith('00')
            || (txt.startsWith('0') && !txt.startsWith('0.'))
        ){
            return this.floorFun(parseFloat(txt),2) + ''
        }
        return txt
    }

    floorFun(value, n) {
        return Math.floor(value*Math.pow(10,n))/Math.pow(10,n);
    }

    _verifyConfirmOK() {
        if(!this.state.isOpenNotification){
            let bean = {
                title: "您还未开启通知权限。",
                leftText: "取消",
                rightText: "去开启",
                rightClick: ()=>{YFWNativeManager.openSetting()}
            }
            this.tipsDialog && this.tipsDialog._show(bean)
            return false
        }
        if(isEmpty(this.state.price) || parseFloat(this.state.price) === 0){
            YFWToast('您输入有误，请重新输入')
            return false
        }
        if(parseFloat(this.state.data.price) <= parseFloat(this.state.price)){
            YFWToast('您输入的价格必须低于当前价，请重新输入')
            return false
        }
        return true
    }

    _confirm() {
        DeviceEventEmitter.emit('LoadProgressShow');
        YFWNativeManager.isOpenNotification((openStatus) => {
            this.state.isOpenNotification = openStatus
            this.setState()
            if (!this._verifyConfirmOK()) {
                DeviceEventEmitter.emit('LoadProgressClose');
                return
            }
            let paramMap = new Map();
            let viewModel = new YFWRequestViewModel();
            paramMap.set('__cmd', 'person.account.setPriceOffNotice');
            paramMap.set('store_medicineid', this.state.data.shop_goods_id);
            paramMap.set('price', this.state.data.price);
            paramMap.set('expect_price', this.state.price);
            paramMap.set("idfa", safe(YFWUserInfoManager.ShareInstance().idfa))//设备唯一标识符
            console.log(JSON.stringify(paramMap))
            viewModel.TCPRequest(paramMap, (res) => {
                YFWToast('收藏成功，一旦降价后会及时通知')
                this.props.navigation.state.params.state.collectionRefreshCallback && this.props.navigation.state.params.state.collectionRefreshCallback(true);
                this.props.navigation && this.props.navigation.goBack();
            }, (error) => {
            }, true)
        })
    }

//-----------------------------------------------RENDER---------------------------------------------

    render() {
        let msg
        if(isEmpty(this.state.price)){
            msg = ''
        } else if(parseFloat(this.state.data.price) <= parseFloat(this.state.price)){
            msg = '必须低于当前价'
        } else {
            if((parseFloat(this.state.price)/parseFloat(this.state.data.price) *10) < 0.1){
                msg = '低于0.1折'
            } else {
                msg = this.floorFun((parseFloat(this.state.price)/parseFloat(this.state.data.price) *10),1) + '' + '折'
            }
        }
        return (
            <View style = {{flex: 1}}>
                {!this.state.isOpenNotification?
                    <View style={{flexDirection:'row',backgroundColor:'#fdf8c5',padding:10,alignItems:'center'}}>
                        <Text style={{fontSize:12,color:'#feac4c'}}>您还未开启通知，无法收到降价推送通知</Text>
                        <View style={{flex:1}}/>
                        <TouchableOpacity onPress={()=>{YFWNativeManager.openSetting()}}
                                          style={{borderBottomWidth:1,borderColor:'#1fdb9b',paddingBottom:4,}}>
                            <Text style={{fontSize:12,color:'#1fdb9b'}}>去开启</Text>
                        </TouchableOpacity>
                    </View>:
                    null}
                <View style={{marginHorizontal:13, marginTop:20,paddingHorizontal:17,paddingVertical:19,borderRadius: 7, backgroundColor: "#f5f5f5", flexDirection:'row'}}>
                    <Text style={{fontSize: 13, color: "#333333"}}>当前价格: </Text>
                    <Text style={{fontSize: 13, color: "#ff3300"}}>¥{toDecimal(this.state.data.price)}</Text>
                </View>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={()=>{this.input && this.input.focus()}}
                    style={{marginHorizontal:13, marginTop:14,paddingHorizontal:17,paddingVertical:18,borderRadius: 7, backgroundColor: "#ffffff", flexDirection:'row',alignItems:'center'}}>
                    <Text style={{fontSize: 13, fontWeight: 'bold', color: "#333333"}}>期望价格: ¥</Text>
                    <TextInput
                        autoFocus
                        ref={(ref)=>{this.input = ref}}
                        returnKeyType={'done'}
                        maxLength={10}
                        keyboardType={'decimal-pad'}
                        underlineColorAndroid='transparent'
                        placeholderTextColor="#cccccc"
                        placeholder={'低于此价格会通知您'}
                        style={{flex:1,fontSize: 13, fontWeight: 'bold'}}
                        value={this.state.price}
                        onChangeText={(text) => {
                            if (text) {
                                this.setState({
                                    price:this.verifyInput(text),
                                })
                            } else {
                                this.setState({
                                    price: '',
                                })
                            }
                        }}
                    />
                    <Text >{msg}</Text>
                    {this.state.price !== ''?<TouchableOpacity activeOpacity={1} style={{marginHorizontal:5}} hitslop={{top:15,left:15,bottom:15,right:15}}  onPress={()=>{this.inputClear()}}>
                        <Image style={{width:16,height:16}} source={require('../../img/icon_delect.png')}/>
                    </TouchableOpacity>:null}
                </TouchableOpacity>
                <Text style={{fontSize: 12, color: "#999999", marginTop:8,marginHorizontal:30,}}>低于此价格我们会通知你</Text>

                <View style={{
                    width:kScreenWidth,
                    backgroundColor:'rgba(239,239,239,0.8)',
                    marginTop:30,
                    justifyContent:'flex-end',
                    alignItems: 'center',}}
                >
                    <YFWTouchableOpacity
                        style_title={{ height: 44, width: kScreenWidth - 13 * 2, fontSize: 17 }}
                        title={'确定'}
                        callBack={this._confirm.bind(this)}
                        isEnableTouch={true}
                    />
                </View>

                <BaseTipsDialog ref={(item) => {this.tipsDialog = item}}/>
            </View>
        )
    }

}

const style = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    }
});