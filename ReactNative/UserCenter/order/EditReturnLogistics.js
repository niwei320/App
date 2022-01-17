import React from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Dimensions, DeviceEventEmitter
} from 'react-native'
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import {isEmpty, isNotEmpty, safe} from "../../PublicModule/Util/YFWPublicFunction";
import YFWToast from "../../Utils/YFWToast";
import BaseTipsDialog from "../../PublicModule/Widge/BaseTipsDialog"
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
import AndroidHeaderBottomLine from '../../widget/AndroidHeaderBottomLine'
import YFWTouchableOpacity from '../../widget/YFWTouchableOpacity';
export default class EditReturnLogistics extends React.Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: `${navigation.state.params.state.value.type == 'order_return_send' ? '寄回商品' : '变更退货信息'}`,
        headerRight: <View/>
    });

    constructor(props) {
        super(props)
        this.orderNo = this.props.navigation.state.params.state.value.orderNo;
        this.type = this.props.navigation.state.params.state.value.type;
        this.state = {
            logisticsName: '',
            logisticsNum: ''

        }
    }


    render() {
        return (
            <View style={{width:width,height:height,backgroundColor:'#F5F5F5'}}>
                <AndroidHeaderBottomLine/>
                <View style={{backgroundColor:'#fdf8c5',height:50,width:width,alignItems:'center',flexDirection:'row'}}>
                    <Text
                        style={{fontSize:12,color:'#FF6E40',marginLeft:10}}>{this.type == 'order_return_send' ? '请填写真实的退货信息。' : '商家已同意您的退货申请，请在7个工作日内退回商品'}</Text>
                </View>
                <View style={{flexDirection:'row',backgroundColor:'#FFF',alignItems:'center',width:width,height:50}}>
                    <Text style={{fontSize:14,color:'#333333',marginLeft:10,marginRight:10}}>发货物流</Text>
                    <TextInput underlineColorAndroid='transparent'
                               placeholder="请填写物流名称"
                               placeholderTextColor="#999999"
                               multiline={true}
                               onChangeText={this.onTextChange.bind(this)}
                               value={this.state.logisticsName}
                               autoFocus={true}
                               style={{color:'#333333',fontSize:14,padding:0,textAlign:'right',flex:1,height:50, paddingRight:10,backgroundColor:'#FFF',borderRadius:3}}>

                    </TextInput>
                </View>
                <View style={{backgroundColor:'#fff',marginTop:10,height:50,alignItems:'center'}}>
                    <TextInput underlineColorAndroid='transparent'
                               placeholder="请填写寄回的物流单号"
                               placeholderTextColor="#999999"
                               multiline={true}
                               onChangeText={this.onNumTextChange.bind(this)}
                               value={this.state.logisticsNum}
                               style={{color:'#333333',fontSize:14,width:width-20,marginRight:10,marginLeft:10}}>

                    </TextInput>
                </View>
                <TouchableOpacity style={{width:width,alignItems:'center',marginTop:20}}>
                    <YFWTouchableOpacity style_title={{width:width-20,height:45,fontSize: 16,}} title={'提交'}
                                                    callBack={()=>{this._commit()}}
                                                    isEnableTouch={true}/>
                </TouchableOpacity>
                <BaseTipsDialog ref={(item) => {this.tipsDialog = item}}/>
            </View>
        )
    }

    onTextChange(text) {
        this.setState({
            logisticsName: text
        })
    }

    onNumTextChange(text) {
        this.setState({
            logisticsNum: text
        })
    }

    _commit() {
        if (isEmpty(this.state.logisticsName)) {
            YFWToast("发货物流不能为空")
        }
        if (isEmpty(this.state.logisticsNum)) {
            YFWToast("寄回物流单号不能为空")
        }
        let leftClick = ()=> {
            let {goBack} = this.props.navigation
            goBack()
        }
        //order_return_send_update、order_return_send
        let item = {
            title: this.type == 'order_return_send' ? '录入成功，商家确认收货后将\n为您操作退款，请耐心等待。' : '更新成功，商家确认收货后将\n为您操作退款，请耐心等待。',
            leftText: "确定",
            leftClick: leftClick
        }
        DeviceEventEmitter.emit('LoadProgressShow');
        let viewModel = new YFWRequestViewModel();
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.order.sendReturnGoods');
        paramMap.set('orderno', this.orderNo);
        paramMap.set('trafficName', safe(this.state.logisticsName));
        paramMap.set('trafficNo', safe(this.state.logisticsNum));
        viewModel.TCPRequest(paramMap, (res) => {
            DeviceEventEmitter.emit('LoadProgressClose');
            this.tipsDialog && this.tipsDialog._show(item)
        })
    }
}
