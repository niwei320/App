import React, {Component} from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    DeviceEventEmitter
} from 'react-native';
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import {BaseStyles} from '../../Utils/YFWBaseCssStyle'
import {itemAddKey, isEmpty, isNotEmpty, safeObj} from "../../PublicModule/Util/YFWPublicFunction";
import YFWMessageNoticeItemView from '../View/YFWMessageNoticeItemView'
import YFWMessageCouponItemView from '../View/YFWMessageCouponItemView'
import YFWListFooterComponent from '../../PublicModule/Widge/YFWListFooterComponent'
import YFWMessageCouponItemModel from "../../Message/Model/YFWMessageCouponItemModel";
import {pushNavigation} from "../../Utils/YFWJumpRouting";
import StatusView from '../../widget/StatusView'
import AndroidHeaderBottomLine from '../../widget/AndroidHeaderBottomLine'
import { getAuthUrlWithCallBack } from '../../Utils/YFWInitializeRequestFunction';
export default class YFWMessageListController extends Component {

    static navigationOptions = ({navigation}) => ({

        tabBarVisible: false,
        headerTitle: `${navigation.state.params.state.msg_type}`,
    });

    constructor(...args) {
        super(...args);
        this.state = {
            data: [],
            param: [],
            pageIndex: 1,
            loading: false,
            showFoot: 2,
            isAfterNet: false,
            jumpType: '',
        };
        this.canClick = true
        this.setState({
            data: []
        });
    }

    //视图加载完成
    componentDidMount() {
        this.state.param = this.props.navigation.state.params.state;
        this._requestMessageListData();
    }

    _markMessagereaded_tcp(data) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.message.markRead');
        paramMap.set('id', data.message_id);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
        }, (erros)=> {
        }, false)
    }

    //@ handle Data
    _requestMessageListData() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.message.getMessageByType');
        paramMap.set('type', safeObj(this.state.param.msg_type_id) + '');
        paramMap.set('pageIndex', safeObj(this.state.pageIndex) + '');
        viewModel.TCPRequest(paramMap, (res)=> {
            this.status && this.status.dismiss()
            this.setState({isAfterNet: true})
            let showFoot = 0;
            if (isEmpty(res.result)) {
                return
            }
            let dataArray = YFWMessageCouponItemModel.getModelArray(res.result.dataList);
            if (dataArray.length === 0) {
                showFoot = 1;
            }
            if (this.state.pageIndex > 1) {
                dataArray = this.state.data.concat(dataArray);
            }
            dataArray = itemAddKey(dataArray);
            let jumpType = res.result.jumpType;
            this.setState({
                data: dataArray,
                loading: false,
                showFoot: showFoot,
                jumpType: jumpType,
            });
            this.state.data = dataArray
            if (this.state.pageIndex == 1 && this.state.data.length == 0) {
                let type_id = this.state.param.msg_type_id;
                let title = type_id === '1' ? '系统消息' : type_id === '2' ? '订单消息' : '优惠消息';
                this.status && this.status.showEmptyWIthTips('没有最新' + title,require('../../../img/ic_no_message.png'))
            }
        }, (error) => {
            this.setState({
                loading: false,
                showFoot: 0,
            });
            this.status && this.status.showNetError()
        }, false);

    }

    //@ Action
    _selectMessageItemMethod(item) {
        this._markMessagereaded_tcp(item);
        let {navigate} = this.props.navigation;
        if(item.jumptype == 'get_order_list'){
            pushNavigation(navigate, {type: 'get_order', value: item.jumpvalue});
        }else if(item.jumptype == 'get_order_detail'){
            pushNavigation(navigate, {type: 'get_order_detail', value: item.jumpvalue});
        }else if(item.jumptype == 'get_my_coupon'){
            pushNavigation(navigate, {type: 'get_coupon'});
        } else if(item.jumptype == 'get_order_advisory'){
            if (!this.canClick) {
                return
            }
            this.canClick = false
            getAuthUrlWithCallBack({value:item.advisory_link},(authUrl)=>{
                this.canClick = true
                pushNavigation(navigate, {type: 'get_h5', token_value:authUrl,isHiddenShare:true,blueHeader:true});
            })
        } else if(item.jumptype == 'get_h5'){
            pushNavigation(navigate, {type: 'get_h5', value: item.jumpvalue, title: '系统消息'});
        }

    }

    _onRefresh() {

        this.state.pageIndex = 1;
        this.setState({
            loading: true
        });
        this._requestMessageListData();

    }

    _onEndReached() {

        if (this.state.showFoot != 0) {
            return;
        }
        this.state.pageIndex++;
        this.setState({
            showFoot: 2
        });
        this._requestMessageListData();

    }

    _renderFooter() {

        return <YFWListFooterComponent showFoot={this.state.showFoot}/>

    }

    //@ View
    render() {
        return (
            <View style={BaseStyles.container}>
                <AndroidHeaderBottomLine/>
                <FlatList
                    ref={(flatList)=>this._flatList = flatList}
                    extraData={this.state}
                    data={this.state.data}
                    onRefresh={() => this._onRefresh()}
                    refreshing={this.state.loading}
                    renderItem={this._renderItem.bind(this)}
                    ListFooterComponent={this._renderFooter.bind(this)}
                    onEndReached={this._onEndReached.bind(this)}
                    onEndReachedThreshold={0.1}
                />
                <StatusView ref={(item)=>this.status = item} retry={()=>{
                    this._requestMessageListData() }} navigation={this.props.navigation}/>
            </View>
        );
    }


    _renderItem = (item) => {

        if (this.state.param.msg_type_id === '3') {
            return (
                <View style={[BaseStyles.rowItem]}>
                    <TouchableOpacity activeOpacity={1} style={{flex:1}}
                                      onPress={()=>this._selectMessageItemMethod(item.item)}>
                        {this._renderSectionHeaderItem(item.item)}
                        <YFWMessageCouponItemView style={{flex:1}} Data={item.item}/>
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <View style={[BaseStyles.rowItem]}>
                    <TouchableOpacity activeOpacity={1} style={{flex:1}}
                                      onPress={()=>this._selectMessageItemMethod(item.item)}>
                        {this._renderSectionHeaderItem(item.item)}
                        <YFWMessageNoticeItemView style={{flex:1}} Data={item.item} isJump={isNotEmpty(this.state.jumpType)?true:false}/>
                    </TouchableOpacity>
                </View>
            );
        }

    }


    _renderSectionHeaderItem(item) {

        return (
            <View style={[BaseStyles.item , {height:51} ]}>
                <View
                    style={[BaseStyles.item , {height:20,width:134,backgroundColor:'#cccccc',borderRadius:10,marginTop:3} ]}>
                    <Text style={{fontSize:12,color:'white'}}>{item.create_time}</Text>
                </View>
            </View>

        );
    }


}

