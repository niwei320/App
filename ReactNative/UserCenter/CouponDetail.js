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
    FlatList,
    ImageBackground
} from 'react-native';
import {NavigationActions} from 'react-navigation'
import {getItem, setItem, kAccountKey} from '../Utils/YFWStorage'
import {log, logErr, logWarm} from '../Utils/YFWLog'
const width = Dimensions.get('window').width;
import {
    itemAddKey,
    isEmpty,
    kScreenWidth,
    isNotEmpty
} from "../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from '../Utils/YFWRequestViewModel';
import YFWListFooterComponent from '../PublicModule/Widge/YFWListFooterComponent'
import CouponDetailModel from "./Model/CouponDetailModel";
import {pushNavigation} from '../Utils/YFWJumpRouting'
import {backGroundColor,darkLightColor,darkTextColor} from '../Utils/YFWColor';
import YFWEmptyView from '../widget/YFWEmptyView';
import YFWRxInfoTipsAlert from '../OrderPay/View/YFWRxInfoTipsAlert';
import YFWToast from '../Utils/YFWToast';
import YFWBaseSwipeRow from '../widget/YFWBaseSwipeRow';
import DashLine from "../widget/DashLine";
import {toDecimal} from "../Utils/ConvertUtils";
export default class CouponDetail extends Component {

    static navigationOptions = ({navigation}) => ({
        header: null,
        tabBarVisible: false

    });

    constructor(props) {
        super(props);
        this.status = 0; //区分状态 默认为0加载未使用视图
        this.state = {
            dataArray: [],
            pageIndex: 1,
            loading: false,
            showFoot: 2,
            color: '#16c08e',
            firstGetIn:true,
        }
        this.currentLongClickItem = null
    }


    componentDidMount() {

        this.status = this.props.type;
        this.dict_coupons_type = this.props.couponType;
        this._requestMessageListData();

    }


    _deleteCoupon(){
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.usercoupons.delete');
        paramMap.set('id', this.currentLongClickItem.item.id);
        viewModel.TCPRequest(paramMap, (res)=> {
            this.state.dataArray.splice(this.currentLongClickItem.index,1)
            this.setState({})
            YFWToast('删除成功')
        }, (error)=> {

        }, true);
    }

    _requestMessageListData() {

        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.usercoupons.getPageData');
        paramMap.set('pageSize', 10);
        paramMap.set('pageIndex', this.state.pageIndex);
        paramMap.set('status', this.status + '');
        isNotEmpty(this.dict_coupons_type) && paramMap.set('dict_coupons_type', this.dict_coupons_type + '');

        viewModel.TCPRequest(paramMap, (res)=> {
            // console.log(JSON.stringify(res))
            this.state.firstGetIn = false
            let showFoot = 0;
            let dataArray = CouponDetailModel.getModelArray(res.result.dataList);
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
                showFoot: showFoot
            });
            let tabData = {
                countAll:res.result.unUseCount,
                countDanpin:res.result.danpinquanCount,
                countDianpu:res.result.dianpuquanCount,
                countPintai:res.result.pingtaiquanCount,
            }
            this.props.refreshTab && this.props.refreshTab(tabData)
        }, (error)=> {
            this.state = {
                loading: false,
                showFoot: 0,
            };
        }, this.state.pageIndex == 1 ? true : false);

    }

    deleteCoupon(item){
        if (this.status == '0') {
            return
        }
        this.currentLongClickItem = item
        this.rxInfoAlert.showTitle = false
        this.rxInfoAlert&&this.rxInfoAlert.showView('确定删除吗？')
    }

    clickItem(item) {
        if (item.item.btn_name == '已使用'||item.item.btn_name == '已过期')
            return
        let {navigate} = this.props.navigation;

        switch (item.item.type) {
            case '1':
                pushNavigation(navigate, {type: 'get_shop_detail', value: item.item.shop_id})
                break
            case '2':
                if(!isEmpty(item.item.goods_id)){
                    pushNavigation(navigate, {type: 'get_goods_detail', value: item.item.goods_id})
                }else{
                    pushNavigation(navigate, {type: 'get_shop_goods_detail', value: item.item.shop_goods_id})

                }
                break
            case '3':
                this.props.navigation.popToTop();
                const resetActionTab = NavigationActions.navigate({routeName: 'HomePageNav'});
                this.props.navigation.dispatch(resetActionTab);
                break
        }

    }

    _renderItem = (item)=> {
        let {use_price} = this.state.dataArray[item.index]
        let {type} = this.state.dataArray[item.index]
        let {coupon_title} = this.state.dataArray[item.index]
        let {image_url} = this.state.dataArray[item.index]
        let {money} = this.state.dataArray[item.index]
        let {min_order_total} = this.state.dataArray[item.index]
        let {status} = this.state.dataArray[item.index]
        let {price_after_coupon} = this.state.dataArray[item.index]

        let color = status==0?'#1fdb9b':'#999999';

        let time_start = this.state.dataArray[item.index].time_start.split(" ")[0]
        let start_time = time_start.replace(/\-/g,'.')
        let time_end = this.state.dataArray[item.index].time_end.split(" ")[0]
        let end_time =time_end.replace(/\-/g,'.')

        let scale = kScreenWidth/375

        let imageIcon = null
        if (status == '1') {
            imageIcon = require('../../img/coupon_used.png')
        }else if (status == '2') {
            imageIcon = require('../../img/coupon_overdue.png')
        }
        return (
            <YFWBaseSwipeRow disable={status==0} deleleStyle={{marginTop:10}} style={{borderTopRightRadius:7,borderBottomRightRadius:7,paddingHorizontal:12}} Data={item} selectItemMethod={() => this.clickItem(item)} delFn={() => this.deleteCoupon(item) }>
                <TouchableOpacity activeOpacity={1} onPress={this.clickItem.bind(this,item)}>
                    <CouponView>
                        <View style={{flex:1,flexDirection:'row'}}>
                            {
                                type == 3 ?
                                    <View style={{width:100,height:100,marginRight:8,justifyContent:'center',alignItems:'center',borderTopLeftRadius:7,borderBottomLeftRadius:7,backgroundColor:color}} >
                                        <View style={{width:100, flexDirection:'row', flexWrap: 'nowrap', justifyContent:'center', alignItems:'flex-end'}}>
                                            <Text style={{color:'white',fontSize:21*scale,fontWeight:'bold', includeFontPadding:false}}>¥ </Text>
                                            <Text style={{top:5*scale,color:'white',fontSize:40*scale,fontWeight:'bold', includeFontPadding:false, textAlignVertical:'bottom'}} numberOfLines={1}>{parseInt(this.state.dataArray[item.index].money.split(".")[0])}</Text>
                                        </View>
                                        <Text style={{fontSize:13,color:'white',marginTop:4, marginBottom: 5}}>
                                            {min_order_total}
                                        </Text>
                                    </View>
                                    :
                                    <View style={{borderStyle: "solid", borderWidth: 1, borderColor: "#eeeeee", marginHorizontal: 8, marginVertical: 6}}>
                                        <Image style = {{width: 86, height: 86}} source = {{uri: image_url}} resizeMode={'contain'}/>
                                    </View>
                            }
                            <View style={{flex:1,}}>
                                <View style={{flexDirection:'row',alignItems:'flex-end',marginTop:12}}>
                                    <Text style={{fontSize:11,color:status==0?'rgb(229,0,0)':'#999999',includeFontPadding:false,fontWeight:'bold'}}>¥</Text>
                                    <Text style={{fontSize:20,color:status==0?'rgb(229,0,0)':'#999999',includeFontPadding:false,top:2,fontWeight:'bold'}}>{money}</Text>
                                    <Text style={{fontSize:14,color:status==0?'rgb(229,0,0)':'#999999',includeFontPadding:false}}>{use_price==0?' 无门槛券':' 满'+use_price+'减'+money}</Text>
                                </View>
                                <View style={{flexDirection:'row',alignItems:'center'}}>
                                    <View style={{position:'absolute',left:0,top:2,borderRadius:9,paddingHorizontal:3,backgroundColor:color,addingHorizontal:7,justifyContent:"center"}}>
                                        <Text style={{fontSize:11,color:'#fff', includeFontPadding:false}}>
                                            {this._setType(type)}
                                        </Text>
                                    </View>
                                    <Text style={{marginLeft:5,fontSize:12,color:darkTextColor()}} numberOfLines={2}>
                                        {'        ' + (coupon_title)}
                                    </Text>
                                </View>
                                {type==2 && use_price==0?<Text style={{fontSize: 11, color: "#666666"}}>领券后 ¥{toDecimal(price_after_coupon)}</Text>:null}
                                <View style={{position:'absolute',left:0, bottom:5,flexDirection:'row',}}>
                                    <Text style={{fontSize:12,color:darkLightColor()}}>{start_time}</Text>
                                    <Text style={{fontSize:12,color:darkLightColor()}}>{this.state.dataArray[item.index].time_start == '' ? "" : '-'}</Text>
                                    <Text style={{fontSize:12,color:darkLightColor()}}>{end_time}</Text>
                                </View>

                            </View>
                        </View>
                        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                            {isEmpty(imageIcon)?
                                <ImageBackground
                                    style={{width:79,height:39,alignItems: 'center',justifyContent: 'center'}}
                                    source={require('../../img/button_djlq.png')}>
                                    <Text style={{color:'white',fontSize:12,top:-4}}>{item.item.btn_name}</Text>
                                </ImageBackground>
                                :
                                <Image style = {{width: 60, height: 47}} source = {imageIcon} resizeMode={'contain'}/>
                            }
                        </View>
                    </CouponView>
                </TouchableOpacity>
            </YFWBaseSwipeRow>
        )
    };

    _setType(type) {

        switch (type) {
            case '1':
                return '店铺';
                break;
            case '2':
                return '单品';
                break;
            case '3':
                return '平台';
                break
        }

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
        this._requestMessageListData();

    }

    render() {
        if(this.state.dataArray.length > 0 || this.state.firstGetIn){
            return (
                <View style={[styles.container,{backgroundColor:backGroundColor()}]}>
                    <FlatList
                        style={{width:width}}
                        keyExtractor={(item, index) => item.key}
                        listKey={(item, index) => item.key}
                        data={this.state.dataArray}
                        renderItem={this._renderItem}
                        ListFooterComponent={this._renderFooter.bind(this)}
                        onEndReached={this._onEndReached.bind(this)}
                        onEndReachedThreshold={0.1}
                    />
                    <YFWRxInfoTipsAlert ref = {(item) => {this.rxInfoAlert = item}}  actions={[{title:'取消',callBack:()=>{}},{title:'确定',callBack:()=>{this._deleteCoupon()}}]}/>
                </View>
            )
        }else{
            return (
                <YFWEmptyView showGetCoupon navigation={this.props.navigation} image = {require('../../img/ic_no_coupon.png')} bgColor={'white'} title={'暂无优惠券'}/>
            )
        }
    }


}

class CouponView extends Component{

    _children(children = this.props.children) {
        return React.Children.map(children, (child) => child);
    }

    render() {
        let childrenView = this._children()
        return (
            <View style={{flexDirection:'row',backgroundColor:'#FFF',height:100,borderRadius:7, marginTop:10}}>
                <View style={{flex:26}}>
                    {childrenView[0]}
                </View>
                <View style={{alignItems:'center'}}>
                    <View style={{borderBottomLeftRadius: 7,borderBottomRightRadius: 7, height: 7, width: 14, backgroundColor: backGroundColor()}}/>
                    <DashLine height={86} backgroundColor={backGroundColor()} len={13} flexD={1}/>
                    <View style={{borderTopLeftRadius: 7,borderTopRightRadius:7, height: 7, width: 14, backgroundColor: backGroundColor()}}/>
                </View>
                <View style={{flex:9}}>
                    {childrenView[1]}
                </View>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'rgba(178,178,178,0.2)'
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
        backgroundColor: '#FF0000'
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
        color: 'white'
    }
})
