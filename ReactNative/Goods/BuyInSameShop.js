import React from 'react'
import {
    View,
    Dimensions,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    DeviceEventEmitter
} from 'react-native'
const width = Dimensions.get('window').width;
import YFWRequestViewModel from '../Utils/YFWRequestViewModel';
import {isEmpty, isNotEmpty, safe, safeObj} from '../PublicModule/Util/YFWPublicFunction'
import YFWListFooterComponent from '../PublicModule/Widge/YFWListFooterComponent'
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import YFWEmptyView from "../widget/YFWEmptyView";
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import {pushNavigation} from "../Utils/YFWJumpRouting";
import YFWToast from "../Utils/YFWToast";
import YFWNativeManager from "../Utils/YFWNativeManager";
import StatusView from "../widget/StatusView";
import {darkNomalColor, darkTextColor, yfwGreenColor} from "../Utils/YFWColor";
import {toDecimal} from "../Utils/ConvertUtils";
import AndroidHeaderBottomLine from '../widget/AndroidHeaderBottomLine'
import BuyInSameShopModel from "./Model/BuyInSameShopModel";
import NavigationActions from "../../node_modules_local/react-navigation/src/NavigationActions";
export default class BuyInSameShop extends React.Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: '选择店铺'
    });

    constructor(props) {
        super(props)
        this.state = {
            dataArray: [],
            pageIndex: 1,
            orderBy: '',
            dafalut: '默认',
            distance: '距离',
            evaluation: '评价',
            price: '价格',
            defalutColor: yfwGreenColor(),
            distanceColor: '#333333',
            evaluationColor: '#333333',
            priceColor: '#333333',
            realOrderBy:'',
            loading: false,
            showFoot: 2,
            showLoading : false
        }
    }

    componentDidMount() {
        this.requestDataFromNet();
    }

    _renderItem = (item)=> {
        return (
            <View style={[BaseStyles.container,{minHeight:80,backgroundColor:'white',justifyContent:'flex-end'}]}>
                <Text numberOfLines={2} style={{marginTop:8,textAlign:'auto',fontSize:16,height:40,color:darkTextColor(),marginLeft:14,marginRight:14,marginBottom:10}}>{item.item.title}</Text>
                <View style={[BaseStyles.centerItem,{flexDirection:'row',marginLeft:14,marginRight:10,marginBottom:8,backgroundColor:'white'}]}>
                    <Text style={{fontSize:13,color:darkNomalColor()}}>商品总价：</Text>
                    <Text style={{fontSize:16,color:'#FF5F1A',marginLeft:0}}>{'¥'+ toDecimal(item.item.total_price)}</Text>
                    {this.renderLogisticsPrice(item.item)}
                    <View style={{flex:1}}></View>
                    <TouchableOpacity onPress={()=>this._addSomeGoodsToCard(item)}>
                        <Image style = {{width:20,height:22,resizeMode:'contain',marginRight:5}} source={ require('../../img/compare_cart.png')}></Image>
                    </TouchableOpacity>

                </View>
                <View style={[BaseStyles.separatorStyle]}></View>
            </View>
        )
    }

    renderLogisticsPrice(item){
        if(isEmpty(item.shipping_price)){
            return
        }
        return(
            <View style={{flexDirection:'row'}} >
                <Text style={{fontSize:13,color:darkNomalColor(),marginLeft:10}}>运费：</Text>
                <Text style={{fontSize:13,color:darkNomalColor(),marginLeft:0}}>{toDecimal(item.shipping_price)+'元'}</Text>
            </View>
        )
    }

    render() {
        return (
            <View flex={1}>
                <AndroidHeaderBottomLine/>
                <View style={{flexDirection:'row',width:width,height:50,padding:10,backgroundColor:'white'}}>
                    <TouchableOpacity style={[BaseStyles.centerItem,{flex:1}]} onPress={()=>this._onTypeChange(1)}>
                        <Text
                            style={{fontSize:14,color:this.state.defalutColor,textAlign:'center'}}>{this.state.dafalut}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[BaseStyles.centerItem,{flex:1}]} onPress={()=>this._onTypeChange(2)}>
                        <Text
                            style={{fontSize:14,color:this.state.distanceColor,textAlign:'center'}}>{this.state.distance}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[BaseStyles.centerItem,{flex:1}]} onPress={()=>this._onTypeChange(3)}>
                        <Text
                            style={{fontSize:14,color:this.state.evaluationColor,textAlign:'center'}}>{this.state.evaluation}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[BaseStyles.centerItem,{flex:1}]} onPress={()=>this._onTypeChange(4)}>
                        <Text
                            style={{fontSize:14,color:this.state.priceColor,textAlign:'center'}}>{this.state.price}</Text>
                    </TouchableOpacity>
                </View>
                <View style={[BaseStyles.separatorStyle]}></View>
                {this.renderList()}
                <StatusView ref={(item)=>{this.statusView = item}} retry={()=>{
                    this.state.pageIndex= 1
                    this.requestDataFromNet()
                }}/>
            </View>
        )
    }

    renderList(){
        if (this.state.dataArray.length > 0) {
            return <FlatList style={{flex:1,backgroundColor:'#FFFFFF'}}
                             renderItem={this._renderItem}
                             keyExtractor={(item, index) => index+''}
                             data={this.state.dataArray}
                             ListFooterComponent={this._renderFooter.bind(this)}
                             onEndReached={this._onEndReached.bind(this)}
                             onEndReachedThreshold={0.1}>

            </FlatList>
        } else {
            return (<YFWEmptyView title={'暂时没有同店购买方案'}/>)
        }
    }

    _renderFooter(){
        return <YFWListFooterComponent showFoot={this.state.showFoot}/>
    }

    _onEndReached(){
        if(this.state.showFoot != 0 ){
            return ;
        }
        this.state.pageIndex ++;
        this.setState({
            showFoot:2
        });
        this.requestDataFromNet();

    }

    requestDataFromNet() {
        let order = this.state.realOrderBy
        let conditions = {
            "sort": "",
            "sorttype": "",
        }
        switch (order) {
            case "distancedesc":
                conditions.sort = "distance"
                conditions.sorttype = "asc"//距离固定为近到远
                break
            case "distanceasc":
                conditions.sort = "distance"
                conditions.sorttype = "asc"
                break
            case "evaluationdesc":
                conditions.sort = "level"
                conditions.sorttype = "desc"
                break
            case "evaluationasc":
                conditions.sort = "level"
                conditions.sorttype = "desc"//评价等级高到低
                break
            case "pricedesc":
                conditions.sort = "total_price"
                conditions.sorttype = "desc"
                break
            case "priceasc":
                conditions.sort = "total_price"
                conditions.sorttype = "asc"
                break
        }

        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'guest.medicine.getShopMedicinesByMids');
        paramMap.set('mids', this.props.navigation.state.params.state.ids);
        paramMap.set('pageSize', 10);
        paramMap.set('pageIndex', this.state.pageIndex);
        paramMap.set('conditions', conditions);
        viewModel.TCPRequest(paramMap, (res) => {
            this.statusView && this.statusView.dismiss()
            let showFoot = 0;
            let dataArray = BuyInSameShopModel.getModelArray(safeObj(res.result).dataList);
            if (safeObj(dataArray).length === 0) {
                showFoot = 1;
            }
            if (this.state.pageIndex > 1) {
                dataArray = this.state.dataArray.concat(dataArray);
            }
            this.setState({
                dataArray: dataArray,
                loading: false,
                showFoot: showFoot,
            })
        }, (error) => {
            this.statusView && this.statusView.showNetError()
        }, this.state.showLoading);
    }

    _addSomeGoodsToCard(item){
        let allDataArr = item.item.items;
        let shop_goods_ids = '';
        for (let i = 0; i < allDataArr.length; i++) {
            let aGoods = allDataArr[i];
            shop_goods_ids += aGoods.shop_goods_id + ',';
            YFWUserInfoManager.ShareInstance().addCarIds.set(aGoods.shop_goods_id+'','id')
        }
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.cart.addCart');
        paramMap.set('storeMedicineId', shop_goods_ids);
        paramMap.set('quantity', 1);
        viewModel.TCPRequest(paramMap, (res) => {
            if (res.code == '1') {
                //随便传个空值
                DeviceEventEmitter.emit("SHOPCAR_INFO_CHANGE",item.item.shop_id)//通知购物车 该商家商品发生变化  刷新凑单数据
                this.props.navigation.replace('YFWShopCarVC',{state:{car:""}});
            } else {
                YFWToast(res.msg);
            }
        }, (error) => {
        }, false);
    }

    _onTypeChange(number) {
        switch (number) {
            case 1:
                this.state.orderBy = '';
                this.state.realOrderBy='';
                this.setState({
                    distance: "距离",
                    evaluation: '评价',
                    price: '价格',
                    defalutColor: "#16c08e",
                    distanceColor: "#333333",
                    evaluationColor: '#333333',
                    priceColor: "#333333"
                });
                YFWNativeManager.mobClick('price page-same store-choose a shop-default')
                break;
            case 2:
                if (this.state.orderBy == 'distance') {
                    if (this.state.distance == '距离（升）') {
                        this.state.realOrderBy = 'distancedesc';
                        this.setState({
                            distance: "距离"
                        })
                    } else {
                        this.state.realOrderBy = 'distanceasc';
                        this.setState({
                            distance: "距离"
                        })
                    }
                } else {
                    this.state.orderBy = 'distance';
                    this.state.realOrderBy = 'distanceasc';
                    this.setState({
                        distance: "距离",
                        evaluation: '评价',
                        price: '价格'
                    })
                }
                this.setState({
                    defalutColor: "#333333",
                    distanceColor: "#16c08e",
                    evaluationColor: '#333333',
                    priceColor: "#333333"
                });
                YFWNativeManager.mobClick('price page-same store-choose a shop-distance')
                break;
            case 3:
                if (this.state.orderBy == 'evaluation') {
                    if (this.state.evaluation == '评价（升）') {
                        this.state.realOrderBy='evaluationdesc'
                        this.setState({
                            evaluation: "评价"
                        })
                    } else {
                        this.state.realOrderBy='evaluationasc'
                        this.setState({
                            evaluation: "评价"
                        })
                    }
                } else {
                    this.state.orderBy = 'evaluation';
                    this.state.realOrderBy='evaluationasc'
                    this.setState({
                        evaluation: "评价",
                        distance: "距离",
                        price: '价格'
                    })
                }
                this.setState({
                    defalutColor: "#333333",
                    distanceColor: "#333333",
                    evaluationColor: '#16c08e',
                    priceColor: "#333333"
                });
                YFWNativeManager.mobClick('price page-same store-choose a shop-rate')
                break;
            case 4:
                if (this.state.orderBy == 'price') {
                    if (this.state.price == '价格（升）') {
                        this.state.realOrderBy= 'pricedesc'
                        this.setState({
                            price: "价格（降）"
                        })
                    } else {
                        this.state.realOrderBy= 'pricedasc'
                        this.setState({
                            price: "价格（升）"
                        })
                    }
                } else {
                    this.state.realOrderBy= 'priceasc'
                    this.state.orderBy = 'price';
                    this.setState({
                        price: "价格（升）",
                        evaluation: "评价",
                        distance: "距离",
                    })
                }
                this.setState({
                    defalutColor: "#333333",
                    distanceColor: "#333333",
                    evaluationColor: '#333333',
                    priceColor: "#16c08e"
                });
                YFWNativeManager.mobClick('price page-same store-choose a shop-price')
                break;
        }
        this.state.showLoading = true
        this.state.pageIndex = 1;
        this.requestDataFromNet()
    }
}
