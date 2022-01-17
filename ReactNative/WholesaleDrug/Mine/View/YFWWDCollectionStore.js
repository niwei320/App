/**
 * Created by admin on 2018/6/5.
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    TextInput,
    FlatList, DeviceEventEmitter, Alert
} from 'react-native';
const width = Dimensions.get('window').width;
import YFWEmptyView from '../../../widget/YFWEmptyView'
import YFWListFooterComponent from '../../../PublicModule/Widge/YFWListFooterComponent'
import YFWRequestViewModel from '../../../Utils/YFWRequestViewModel';
import {
    itemAddKey,
    tcpImage,
    isIphoneX,
    isEmpty,
    kStyleWholesale
} from "../../../PublicModule/Util/YFWPublicFunction";
import YFWWDCollectionStoreModel from "../Model/YFWWDCollectionStoreModel";
import {backGroundColor,darkNomalColor,darkTextColor,} from '../../../Utils/YFWColor'
import YFWToast from "../../../Utils/YFWToast";
import BaseTipsDialog from '../../../PublicModule/Widge/BaseTipsDialog'
import YFWWDCollectionBottomView from "./YFWWDCollectionBottomView"
import {YFWImageConst} from "../../Images/YFWImageConst";
import { pushWDNavigation, kRoute_shop_detail } from '../../YFWWDJumpRouting';
import YFWWDCheckButtonView from '../../Widget/YFWWDCheckButtonView';
import YFWUserInfoManager from '../../../Utils/YFWUserInfoManager';

export default class YFWWDCollectionStore extends Component {

    static navigationOptions = ({navigation}) => ({
        header: null,
        tabBarVisible: false,

    });

    constructor(props) {
        super(props);
        this.state = {
            dataArray: [],
            pageIndex: 1,
            loading: false,
            showFoot: 2,
            selectData: []
        }

        this.listener();
        this.showCount = 1;
    }

    listener(){
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                if(this.showCount != 1){
                    this.state.pageIndex = 1
                    this.requestData()
                }else{
                    this.showCount++
                }
            }
        );
    }

    componentDidMount() {
        this.requestData();
    }

    componentWillUnmount() {
        // 移除
        this.didFocus && this.didFocus.remove();
    }

    requestData() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'store.account.getUserCollectionStore');
        paramMap.set('pageIndex', this.state.pageIndex);
        paramMap.set('pageSize', '20');
        viewModel.TCPRequest(paramMap, (res)=> {
            let showFoot = 0;
            let dataArray = YFWWDCollectionStoreModel.getModelArray(res.result.dataList);
            if (dataArray.length === 0) {
                showFoot = 1;
            }
            if (this.state.pageIndex > 1) {
                dataArray = this.state.dataArray.concat(dataArray);
            }
            dataArray = itemAddKey(dataArray);
            this.setState({
                dataArray: dataArray,
                loading: false,
                showFoot: showFoot,
            });
        },()=>{},this.state.pageIndex==1?true:false);
    }

    requestDelCollection_TCP(storeIDs){
        if (!YFWUserInfoManager.ShareInstance().hasLogin()) return;
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'store.account.cancelCollectStore');
        paramMap.set('storeid', storeIDs);
        viewModel.TCPRequest(paramMap, (res) => {
            YFWToast("删除成功");
            this.state.pageIndex=1
            this.requestData();
        },(error)=>{
        })
    }

    _onEndReached() {

        if (this.state.showFoot != 0) {
            return;
        }
        this.state.pageIndex++;
        this.setState({
            showFoot: 2
        });
        this.requestData();
    }

    //是否选择
    _isSelectItem(item){
        let dataArray = this.state.selectData;
        if (dataArray.some(function (value) {
            return item.shop_id == value.shop_id
        })){
        return true;
        }
    }

    //是否选择全部
    _isSelectAll(){
        return this.state.dataArray.length === this.state.selectData.length;
    }

    //选择items
    _selectItem(item){
        let items = [];
        if(this._isSelectItem(item)){
            let b = [item];
            let dataArray = this.state.selectData;
            let set = new Set(dataArray.filter(
                x => !b.some((item)=>{return item.shop_id == x.shop_id})
                ));
            items = Array.from(set);
        }else{
            items = this.state.isEdit?this.state.editSelectData:this.state.selectData;
            items.push(item);
        }

        this.setState({
            selectData:items,
        });
    }

    //选择全部items
    _selectAllItems(){
        let selectItems = [];
        if (!this._isSelectAll()){
            for (let i  =0 ;i < this.state.dataArray.length;i++){
                let shopItems = this.state.dataArray[i];
                selectItems.push(shopItems)
            }
        }
        this.setState({
            selectData:selectItems,
        });
    }

    _DelGoods(){
        let dataArray = this.state.selectData;
        let storeStr = ''
        dataArray.forEach((item,index)=>{
            let str = item.shop_id
            if (index == 0){
                storeStr +=str
            }else {
                storeStr += ','+str;
            }

        });
        if(isEmpty(storeStr)){
          YFWToast('请至少选择一家商家')
          return
        }
        this.requestDelCollection_TCP(storeStr)
    }


    _jumpToShopDetail(shop_id) {
        const {navigate} = this.props.navigation;
        pushWDNavigation(navigate,{type:kRoute_shop_detail,value:shop_id})
    }

    _cancelShopCollection(item) {
        let _rightClick = ()=>{
            this.deleteCollection(item)
            this.state.dataArray.splice(item.index,1)
            this.setState({})
        }
        let bean = {
            title: "是否取消收藏该商家?",
            leftText: "取消",
            rightText: "确定",
            rightTextColor:'#416dff',
            rightClick: _rightClick
        }
        this.tipsDialog&&this.tipsDialog._show(bean);
    }

    /**
     * 取消收藏
     */
    deleteCollection(item){

        if (!YFWUserInfoManager.ShareInstance().hasLogin()) return;

        let paramMap = new Map();
        paramMap.set('__cmd', 'store.account.cancelCollectStore');
        paramMap.set('storeid', item.item.shop_id);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            YFWToast(  '取消收藏成功');
        }, ((error) => {}));

    }

    onClicked(item) {
        if (this.props.isShow) {
            this._selectItem(item.item)
        } else {
            this._jumpToShopDetail(item.item.shop_id)
        }
    }

    _renderItem = (item)=> {
        return (
            <TouchableOpacity activeOpacity={1} onPress = {()=> this.onClicked(item)}
                              onLongPress={()=>this._cancelShopCollection(item)}>
                <View style={{backgroundColor:'#FFFFFF'}}>
                    <View style={{flexDirection:'row',flex:1,alignItems:'center',paddingVertical:18}}>
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            {this.props.isShow?<View style={styles.checkButton}>
                                <YFWWDCheckButtonView from={kStyleWholesale}
                                                selectFn={()=>this._selectItem(item.item)}
                                                select={this._isSelectItem(item.item)}/>
                            </View>:<View/>}
                            <Image style={{width:65,height:27,resizeMode:'contain',marginLeft:15}}
                                   source={{uri:this.state.dataArray[item.index].intro_image}}
                            />
                        </View>
                        <View style={{flex:1,paddingLeft:10,paddingRight:12,justifyContent:'center'}}>
                            <Text style={{fontSize:15,color:darkTextColor()}}>
                                {this.state.dataArray[item.index].shop_title}
                            </Text>
                            <Text style={{fontSize:12,color:darkNomalColor(),marginTop:12}}>
                                {this.state.dataArray[item.index].address}
                            </Text>
                        </View>
                    </View>
                    <View style={{height:0.5,flex:1,marginLeft:this.props.isShow?122:90,backgroundColor:'#f5f5f5'}}>

                    </View>
                </View>
            </TouchableOpacity>
        )
    };

    _renderFooter() {
        return <YFWListFooterComponent showFoot={this.state.showFoot}/>
    }

    //底边
    _renderBottomView(){
        if(this.props.isShow&&this.state.dataArray.length>0){
            return(
                <View style={{
                    marginBottom:(isIphoneX())?34:0,
                    height:50,
                    width:width,
                    backgroundColor:'white',}}>
                    <YFWWDCollectionBottomView
                        style={{flex:1}} selectAll={this._isSelectAll()}
                        delFn={(items)=>this._DelGoods()}
                        selectAllFn={()=>this._selectAllItems()}/>
                </View>
            )
        }else{
            return(
                <View/>
            )
        }
    }

    render() {
        if (this.state.dataArray.length > 0) {
            return (
                <View style={styles.container}>
                    <FlatList style={{width:width,marginTop:15}}
                              ItemSeparatorComponent={this._splitView}
                              renderItem={this._renderItem}
                              keyExtractor={(item, index) => item.key}
                              data={this.state.dataArray}
                              listKey={(item, index) => item.key}
                              ListFooterComponent={this._renderFooter.bind(this)}
                              onEndReached={this._onEndReached.bind(this)}
                              onEndReachedThreshold={0.1}
                    />
                    <BaseTipsDialog ref={(item) => {this.tipsDialog = item}}/>
                    {this._renderBottomView()}
                </View>
            )
        } else {
            return (
                <YFWEmptyView image = {YFWImageConst.Bg_collection_empty} title={'暂无收藏商家'}/>
            )
        }
    }

}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: backGroundColor()
    },
    headerView: {
        flex: 1,
        backgroundColor: 'skyblue',
        justifyContent: 'center',
        alignItems: 'center'
    },
    pagerView: {
        flex: 6,
        backgroundColor: 'white'
    },

    lineStyle: {
        // width:ScreenWidth/3,
        height: 2,
        backgroundColor: '#FF0000',
    },
    textMainStyle: {
        flex: 1,
        fontSize: 40,
        marginTop: 10,
        textAlign: 'center',
        color: 'black'
    },

    textHeaderStyle: {
        fontSize: 40,
        color: 'white',
    },

    checkButton:{
        marginLeft:12,
        width:22,
        height:22,
    },
})
