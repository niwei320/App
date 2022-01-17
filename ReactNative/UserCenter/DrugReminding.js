/**
 * Created by admin on 2018/5/22.
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    FlatList,
    ImageBackground,
    Platform, AppState, DeviceEventEmitter
} from 'react-native';
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
import {getItem, setItem, kAccountKey} from '../Utils/YFWStorage'
import YFWUserInfoManager from '../Utils/YFWUserInfoManager'
import YFWEmptyView from '../widget/YFWEmptyView'
import YFWRequestViewModel from '../Utils/YFWRequestViewModel'
import {pushNavigation} from '../Utils/YFWJumpRouting'
import {SwipeListView} from 'react-native-swipe-list-view';
import {darkStatusBar, iphoneBottomMargin, itemAddKey} from "../PublicModule/Util/YFWPublicFunction";
import YFWNativeManager from "../Utils/YFWNativeManager";
import {yfwOrangeColor} from "../Utils/YFWColor";
import DrugRemidingItemView from './View/DrugRemidingItemView'
import AndroidHeaderBottomLine from '../widget/AndroidHeaderBottomLine'
import DrugRemindListModel from "./Model/DrugRemindListModel";
export default class DrugReminding extends Component {
    static navigationOptions = ({navigation}) => ({

        headerRight: <View style={{width:50}}/>,
        tabBarVisible: false,
        headerTitle: "用药提醒",

    });

    constructor(props) {
        super(props);
        _this = this;
        this.state = {
            dataArray: [],
            value:false,
            isOpenRemind:true,
        }
        this.listener();
    }

    listener() {
        //监听屏幕正在显示
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                this._requestDrugRemindData(true);
            }
        );
        this.appStateListener = AppState.addEventListener('change', (state)=>{
            if (state == 'active'){
                this._pushPermissin()
            }
        })
    }
    componentWillUnmount(){
        this.appStateListener&&this.appStateListener.removeEventListener()
        this.didFocus&&this.didFocus.remove()
    }
    componentDidMount() {

        darkStatusBar();
        getItem(kAccountKey).then((id)=> {
            if (id) {
                this._requestDrugRemindData(false);
            } else {
                this.setState(()=>({
                        //跳转登录页面
                    }
                    )
                )
            }
        });
    }

    _requestDrugRemindData(refresh){
        YFWNativeManager.isOpenNotification((openStatus) => {
                this.setState(() => ({ isOpenRemind: openStatus, }))
        });

        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.common.app.getUseMedicineList');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            this.setState(()=>({
                        dataArray: DrugRemindListModel.getModelData(res.result.items)
                    }
                )
            )
        },()=>{},refresh);

    }

    _pushPermissin = ()=> {
        if (!this.state.isOpenRemind) {
            return (
                <View style={{flexDirection:'row',backgroundColor:'#fdf8c5',padding:10,alignItems:'center'}}>
                    <Text style={{fontSize:14,color:yfwOrangeColor()}}>未开启通知，收不到提醒哦</Text>
                    <View style={{flex:1}}/>
                    <TouchableOpacity onPress={()=>{YFWNativeManager.openSetting()}}
                                      style={{borderWidth:1,borderColor:yfwOrangeColor(),paddingLeft:15,paddingRight:15,backgroundColor:'rgba(255,110,64,0.2)',paddingBottom:8,paddingTop:8}}>
                        <Text style={{fontSize:14,color:yfwOrangeColor()}}>去设置</Text>
                    </TouchableOpacity>
                </View>
            )
        }
    }
    render() {
        const bottom = iphoneBottomMargin();
        let cartItems = itemAddKey(this.state.dataArray);
        if (this.state.dataArray.length > 0) {
            return (
                <View style={[styles.container,{justifyContent:'space-between'}]}>
                    <AndroidHeaderBottomLine/>
                    {this._pushPermissin()}
                    <SwipeListView
                        style={{backgroundColor:'#FFF'}}
                        useFlatList={true}
                        data={cartItems}
                        extraData={this.state}
                        keyExtractor={(item, index) => item.id}
                        renderItem={this._renderItem.bind(this)}
                        renderHiddenItem={this._renderQuickActions.bind(this)}
                        disableRightSwipe={true}
                        rightOpenValue={-60}
                        previewOpenValue={-40}
                        previewOpenDelay={3000}
                        closeOnRowBeginSwipe={true}
                    />
                    <TouchableOpacity onPress={() => _this.onRightTvClick()}>
                        <View style={{height:50,backgroundColor:'#16c08e',alignItems:"center",justifyContent:'center',marginBottom:bottom}}>
                            <Text style={{fontSize:16,color:'white'}}>添加药品</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <View style={{width:width,flex:1,justifyContent:'space-between'}}>
                    {this._pushPermissin()}
                    <YFWEmptyView image={require('../../img/ic_no_remind.png')} title="暂无提醒"/>
                    <TouchableOpacity onPress={() => _this.onRightTvClick()}>
                        <View style={{height:50,backgroundColor:'#16c08e',alignItems:"center",justifyContent:'center',marginBottom:bottom}}>
                            <Text style={{fontSize:16,color:'white'}}>添加药品</Text>
                        </View>
                    </TouchableOpacity>
                </View>)
        }
    }


    onRightTvClick() {
        YFWNativeManager.mobClick('account-drug reminding-add');
        let {navigate} = this.props.navigation;
        pushNavigation(navigate, {type: 'drug_remidingdetail',action:'creat'})
    }

    _renderItem = (item)=> {
        return (<DrugRemidingItemView  data={this.state.dataArray[item.index]} navigation={this.props.navigation}/>);
    };



    /**
     * 侧滑删除按钮
     * @returns {*}
     * @private
     */
    _renderQuickActions = (item)=> {
        return (
            <View style={styles.quickAContent}>
                <TouchableOpacity style={[styles.quick,{backgroundColor:'#ff6e40'}]}
                                  onPress={()=>{this.onDelGoods(item)}}>
                    <Text style={{color:"#fff",textAlign:'center'}}>删除</Text>
                </TouchableOpacity>
            </View>
        )
    }

    onDelGoods(item) {

        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.common.app.deleteUseMedicineById');
        paramMap.set('remindId', item.item.id);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            if (res.code == '1') {
                DeviceEventEmitter.emit('changeDrugRemind')
                this._requestDrugRemindData(true);
            }
        })

    }


}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#F5F5F5'
    },
    //侧滑菜单的样式
    quickAContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    quick: {
        width: 60,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center'
    }
})