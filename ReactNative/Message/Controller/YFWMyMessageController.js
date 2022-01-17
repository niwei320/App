import React, {Component} from 'react';
import {
    Platform,
    View,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import {BaseStyles} from '../../Utils/YFWBaseCssStyle'
import {darkStatusBar, itemAddKey, kScreenWidth,} from "../../PublicModule/Util/YFWPublicFunction";
import YFWMyMessageItemView from '../View/YFWMyMessageItemView'
import YFWToast from "../../Utils/YFWToast";
import YFWMessageListController from './YFWMessageListController'
import YFWNativeManager from "../../Utils/YFWNativeManager";
import AndroidHeaderBottomLine from '../../widget/AndroidHeaderBottomLine'

export default class YFWMyMessageController extends Component {

    static navigationOptions = ({navigation}) => ({

        tabBarVisible: false,
        title: '我的消息',
    });

    constructor(...args) {
        super(...args);
        this.state = {
            data: [],
            isFirst: true
        };
        this._requestMyMessageData()
        this.listener()
        darkStatusBar();
    }


    listener() {
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                if (this.state.isFirst) {
                    this.state.isFirst = false;
                    return
                }
                this._requestMyMessageData()
            }
        );
    }

    componentWillUnmount(){
        this.didFocus.remove()

    }

    //@ handle Data
    _requestMyMessageData() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.common.app.getMessageHome');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            let dataArray = itemAddKey(res.result);
            this.setState({
                data: dataArray,
            });
        }, (error)=> {
            YFWToast(error.msg.toString())
        }, true);

    }

    //@ Action
    _selectMessageItemMethod(item) {

        if (item.msg_type_id === '-1') {
            YFWToast('进入客服');
            YFWNativeManager.openZCSobot();
        } else {
            this._markMessagereaded_tcp(item)
            const {navigate} = this.props.navigation;
            navigate('YFWMessageListController', {state: item});
        }

    }


    //@ View
    render() {

        return (
            <View style={BaseStyles.container}>
                <AndroidHeaderBottomLine/>
                <FlatList
                    style={{marginTop:6}}
                    ref={(flatList)=>this._flatList = flatList}
                    extraData={this.state}
                    data={this.state.data}
                    renderItem={this._renderItem.bind(this)}
                    ListFooterComponent={this._renderSpaceView()}
                />
            </View>
        );

    }

    _renderSpaceView(){
        return(
            <View style={{width:kScreenWidth,height:13}}/>
        )
    }

    _renderItem = (item) => {

        return (
            <View style={[BaseStyles.rowItem]}>
                {this._renderSpaceView()}
                <TouchableOpacity activeOpacity={1} style={{flex:1}}
                                  onPress={()=>this._selectMessageItemMethod(item.item)}>
                    <YFWMyMessageItemView style={{flex:1}} Data={item.item}/>
                </TouchableOpacity>
            </View>
        );

    }

    /**
     * 取消栏目消息红点
     * @param data
     * @private
     */
    _markMessagereaded_tcp(item) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.message.typeMarkRead');
        paramMap.set('msg_type_id', item.msg_type_id);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
        }, (erros)=> {
        }, false)
    }

}

