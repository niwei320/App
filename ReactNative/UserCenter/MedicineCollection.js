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
    FlatList, DeviceEventEmitter, BackAndroid, Platform, Alert
} from 'react-native';
const width = Dimensions.get('window').width;
import {backGroundColor,separatorColor,yfwOrangeColor,darkNomalColor,darkLightColor,darkTextColor} from '../Utils/YFWColor'
import YFWEmptyView from '../widget/YFWEmptyView'
import YFWListFooterComponent from '../PublicModule/Widge/YFWListFooterComponent'
import YFWRequestViewModel from '../Utils/YFWRequestViewModel';
import {isEmpty, isNotEmpty, itemAddKey, tcpImage,isIphoneX,adaptSize} from "../PublicModule/Util/YFWPublicFunction";
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import YFWGoodsCollectionModel from './Model/YFWCollectionModel'
import {pushNavigation} from '../Utils/YFWJumpRouting'
import {toDecimal} from "../Utils/ConvertUtils";
import YFWToast from "../Utils/YFWToast";
import BaseTipsDialog from "../PublicModule/Widge/BaseTipsDialog";
import YFWCheckButton from '../PublicModule/Widge/YFWCheckButtonView';
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import YFWDiscountText from "../PublicModule/Widge/YFWDiscountText"
import YFWCollectionBottomView from "./View/YFWCollectionBottomView"
import YFWNoLocationHint from "../widget/YFWNoLocationHint";

export default class MedicineCollection extends Component {

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
            selectData: [],
            noLocationHidePrice: YFWUserInfoManager.ShareInstance().getNoLocationHidePrice(),
        }
        this.listener();
        this.showCount = 1;
    }

    listener(){
        this.didFocus = this.props.navigation.addListener('didFocus',
            payload => {
                if(this.showCount != 1){
                    this.state.pageIndex = 1
                    this.handleData()
                }else{
                    this.showCount++
                }
            }
        );
    }

    componentDidMount() {
        this.handleData();
        let that = this
        //定位相关显示状态监听
        this.locationListener = DeviceEventEmitter.addListener('NO_LOCATION_HIDE_PRICE',(isHide)=>{
            that.setState({
                noLocationHidePrice:isHide
            })
        })
    }

    componentWillUnmount() {
        // 移除
        this.didFocus && this.didFocus.remove();
        this.locationListener && this.locationListener.remove()
    }

    handleData() {
        this.requestMyCollection_TCP();
    }

    requestMyCollection_TCP() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.favorite.getUserCollectionStoreGoods');
        paramMap.set('pageIndex', this.state.pageIndex);
        paramMap.set('pageSize', '20');
        viewModel.TCPRequest(paramMap, (res)=> {
            let showFoot = 0;
            let dataArray = YFWGoodsCollectionModel.getModelArray(res.result.dataList);
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

    requestDelCollection_TCP(IDs,storeIDs){
        if (!YFWUserInfoManager.ShareInstance().hasLogin()) return;
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.favorite.cancelCollectStoreGoods');
        paramMap.set('medicineid', IDs);
        paramMap.set('storeid', storeIDs);
        viewModel.TCPRequest(paramMap, (res) => {
            YFWToast("删除成功");
            this.state.selectData=[]
            this.state.pageIndex=1
            this.requestMyCollection_TCP();
        },(error)=>{
        })
    }

    _renderFooter() {

        return <YFWListFooterComponent showFoot={this.state.showFoot}/>

    }

    _onEndReached() {

        if (this.state.showFoot != 0) {
            return;
        }
        this.state.pageIndex++;
        this.setState({
            showFoot: 2
        });
        this.handleData();

    }

    _renderItem = (item)=> {
        return (
            <TouchableOpacity activeOpacity={1} onPress={()=> {
                if (this.props.isShow) {
                    this._selectItem(item.item)
                } else {
                    this._jumpToMedicineDetail(item.item)
                }
            }}
                              onLongPress={()=> this._deletCollection(item)}>
                <View style={{backgroundColor:'#FFFFFF'}}>
                    <View style={{flexDirection:'row',flex:1,alignItems:'center',paddingTop:10,paddingBottom:12}}>
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            {this.props.isShow?<View accessibilityLabel={'collection_select_'+item.index} style={styles.checkButton}>
                                <YFWCheckButton selectFn={()=>this._selectItem(item.item)}
                                                select={this._isSelectItem(item.item)}/>
                            </View>:<View/>}
                            <Image style={[BaseStyles.imageStyle,{}]}
                                source={{uri:tcpImage(this.state.dataArray[item.index].img_url)}}/>
                        </View>
                        <View style={{flex:1,paddingLeft:10,paddingRight:25}}>
                            <Text numberOfLines={1} style={{fontSize:15,color:item.item.is_invalid=='0'?darkTextColor():darkLightColor(),marginTop:10}}>
                                {this.state.dataArray[item.index].title}
                            </Text>
                            <Text numberOfLines={1} style={{fontSize:12,color:item.item.is_invalid=='0'?darkLightColor():'#cccccc',marginTop:6}}>
                                    {this.state.dataArray[item.index].shop_title}
                            </Text>
                            {
                                this.state.noLocationHidePrice?<Text style={{fontSize: 12,color: "#999999",marginRight:18}}>仅做信息展示</Text>:
                                    <View style={{flexDirection:'row',alignItems:'center',marginTop:10}}>
                                        {item.item.is_invalid=='0'?<YFWDiscountText  navigation={this.props.navigation}
                                            style_view={{}} style_text={{fontSize:17, fontWeight:'500'}}
                                            value={'¥'+toDecimal(this.state.dataArray[item.index].price)}
                                            discount={item.discount}/>:<YFWDiscountText  navigation={this.props.navigation}
                                            style_view={{}} style_text={{fontSize:17, fontWeight:'500',color:darkLightColor()}}
                                            value={'¥'+toDecimal(this.state.dataArray[item.index].price)}
                                            discount={item.discount}/>}
                                            {item.item.is_invalid=='1'?<View style={{height:adaptSize(14),paddingHorizontal:5,justifyContent:'center',backgroundColor:'#cccccc',borderRadius:adaptSize(7),marginLeft:10}}>
                                                <Text style={{fontSize:10,color:'white'}}>失效</Text>
                                            </View>:<View/>}
                                    </View>
                            }

                        </View>

                    </View>
                    <View style={{marginLeft:this.props.isShow?126:94,height:0.5,backgroundColor:'#f5f5f5',flex:1}}/>
                </View>

            </TouchableOpacity>
        )
    };


    render() {
        if (this.state.dataArray.length > 0) {
            return (
                <View style={styles.container}>
                    <YFWNoLocationHint />
                    <FlatList style={{width:width,marginTop:15}}
                              renderItem={this._renderItem}
                              keyExtractor={(item, index) => item.key}
                              data={this.state.dataArray}
                              listKey={(item, index) => item.key}
                              ListFooterComponent={this._renderFooter.bind(this)}
                              onEndReached={this._onEndReached.bind(this)}
                              onEndReachedThreshold={0.1}
                    >

                    </FlatList>
                    <BaseTipsDialog ref={(item) => {this.tipsDialog = item}}/>
                    {this._renderBottomView()}
                </View>
            )
        } else {
            return (
                <YFWEmptyView image = {require('../../img/ic_no_collection.png')} title={'暂无收藏商品'}/>
            )
        }
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
                        <YFWCollectionBottomView
                    style={{flex:1}} selectAll={this._isSelectAll()}
                    delFn={(items)=>this.onDelGoos()}
                    selectAllFn={()=>this._selectAllItems()}/>
                </View>
                )
        }else{
            return(
                <View/>
            )
        }
    }

    onDelGoos(){
        let dataArray = this.state.selectData;
        let medicineStr = '';
        let storeStr = ''
        dataArray.forEach((item,index)=>{
            let str = ''
            let str1 = ''
            str = item.medicineid;
            str1 = item.storeid
            if (index == 0){
                medicineStr += str;
                storeStr +=str1
            }else {
                medicineStr += ','+str;
                storeStr += ','+str1;
            }

        });
        if(isEmpty(medicineStr)){
          YFWToast('请至少选择一件商品')
          return
        }
        this.requestDelCollection_TCP(medicineStr,storeStr)
    }

    //是否选择
    _isSelectItem(item){
        let dataArray = this.state.selectData;
        return dataArray.some(function (value) {
            return item.shop_goods_id == value.shop_goods_id
        })
    }

    //选择items
    _selectItem(item){
        let items = [];
        if(this._isSelectItem(item)){

            let b = [item];
            let dataArray = this.state.selectData;
            let set = new Set(dataArray.filter(
                x => !b.some((item)=>{return item.shop_goods_id == x.shop_goods_id})
                ));
            items = Array.from(set);


        }else{

            items = this.state.selectData;
            items.push(item);
        }

        this.setState({
            selectData:items,
        });
    }

    //是否选择全部
    _isSelectAll(){
        let count = 0
        for (let i  =0 ;i < this.state.dataArray.length;i++){
            count++;
        }
        let dataArray = this.state.selectData;
        if (count === dataArray.length){
            return true;
        }else{
            return false;
        }
    }
    //选择全部items
    _selectAllItems(){
        let selectItems = [];
        if (!this._isSelectAll()){
            for (let i  =0 ;i < this.state.dataArray.length;i++){
                let goodsItems = this.state.dataArray[i];
                selectItems.push(goodsItems)

            }
        }
        this.setState({
            selectData:selectItems,
        });

    }
    _jumpToMedicineDetail(item) {
        const {navigate} = this.props.navigation;
        pushNavigation(navigate, {type: 'get_shop_goods_detail', value: item.shop_goods_id,img_url:tcpImage(item.img_url)})
    }

    _deletCollection(item){
        let _rightClick = ()=>{
            this.deleteConllect(item)
            this.state.dataArray.splice(item.index,1)
            this.setState({})
        }
        let bean = {
            title: "是否取消收藏该商品?",
            leftText: "取消",
            rightText: "确定",
            rightClick: _rightClick
        }
        this.tipsDialog&&this.tipsDialog._show(bean);
    }
    /**
     * 取消收藏
     */
    deleteConllect(item){

        if (!YFWUserInfoManager.ShareInstance().hasLogin()) return;

        let viewModel = new YFWRequestViewModel();
        let paramMap = new Map();
        paramMap.set('__cmd', 'person.favorite.cancelCollectStoreGoods');
        paramMap.set('medicineid', item.item.medicineid);
        paramMap.set('storeid', item.item.storeid);
        viewModel.TCPRequest(paramMap, (res) => {
            YFWToast("取消收藏成功");},(error)=>{
        })

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
