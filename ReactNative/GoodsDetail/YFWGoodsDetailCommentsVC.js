import React, {Component} from 'react';
import {
    Text,
    View,
    FlatList,
    Dimensions,
} from 'react-native';


import {
    backGroundColor,
    darkLightColor,
    darkNomalColor,
    separatorColor,
    yfwOrangeColor,
    darkTextColor
} from '../Utils/YFWColor'
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import YFWListFooterComponent from '../PublicModule/Widge/YFWListFooterComponent'
import {isEmpty, itemAddKey, safeObj, strMapToObj, safe} from "../PublicModule/Util/YFWPublicFunction";
import {isNotEmpty} from "../PublicModule/Util/YFWPublicFunction";
import StartScore from "../UserCenter/StartScore";
import YFWGoodsEavluationListModel from "./Model/YFWGoodsEavluationListModel";
import {convertStar} from "../Utils/ConvertUtils";
import YFWRequestParam from "../Utils/YFWRequestParam";
import YFWNativeManager from "../Utils/YFWNativeManager";
import YFWGoodsDetailCommentCell from '../GoodsDetail/YFWGoodsDetailCommentCell'


const width = Dimensions.get('window').width;
export default class YFWGoodsDetailCommentsVC extends Component {

    static defaultProps = {
        data:undefined,
    }

    constructor(...args) {
        super(...args);
        this.state = {
            dataInfo:{},
            pageIndex:1,
            loading:false,
            showFoot:2,
        };
    }

    componentWillReceiveProps(props){
        this.props = props
        if (isNotEmpty(props.data)&& Object.getOwnPropertyNames(props.data).length > 0 ){
            //避免多次加载
            if(this.shop_id!=this.props.data.shop_id || this.shop_goods_id!=this.props.data.shop_goods_id){
                this.shop_id = this.props.data.shop_id
                this.shop_goods_id= this.props.data.shop_goods_id

                this.fetchAllDataFromServer()

            }
        }
    }

    fetchAllDataFromServer(){
        let paramMap = new Map();
        let cmd = 'guest.evaluation.getEvaluationByStoreId as getEvaluationByStoreId'
        paramMap.set('getEvaluationByStoreId',{'storeid':this.props.data.shop_id,'pageIndex':this.state.pageIndex,'pageSize':10})
        if (!isEmpty(safeObj(this.props.data).shop_id)) {
            //TCP独有请求商品分数的接口
            cmd += ',guest.evaluation.getEvaluationTotalByStoreId as getEvaluationTotalByStoreId'
            paramMap.set('getEvaluationTotalByStoreId',{'storeid':this.props.data.shop_id})
        }
        paramMap.set('__cmd',cmd)
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap,(res)=>{
            let commentInfo = res['result']['getEvaluationByStoreId']
            if (commentInfo) {
                this.dealCommentsData({result:commentInfo,code:1})
            } else {
                this.dealCommentsError(commentInfo.error)
            }

            let shopEvaluationInfo = res['result']['getEvaluationTotalByStoreId']
            if (shopEvaluationInfo) {
                this.dealShopEvalueationData({result:shopEvaluationInfo})
            }
        },()=>{},false)

    }


    //@ Action
    _onRefresh(){

        this.state.pageIndex = 1;
        this.setState({
            loading:true
        });
        this._requestCommentsMethod();

    }

    _onEndReached(){

        if(this.state.showFoot != 0 ){
            return ;
        }
        this.state.pageIndex ++;
        this.setState({
            showFoot:2
        });
        this._requestCommentsMethod();

    }

    dealShopEvalueationData(res){
        if (res.result) {
            this.state.dataInfo.evaluation_total = convertStar(safe(res.result.total_star))//总评
            this.state.dataInfo.evaluation_service_score = convertStar(safe(res.result.service_star))//服务
            this.state.dataInfo.evaluation_send_score = convertStar(safe(res.result.send_star))//发货
            this.state.dataInfo.evaluation_logistics_score = convertStar(safe(res.result.logistics_star))//物流
            this.state.dataInfo.evaluation_package_score = convertStar(safe(res.result.package_star))//包装
            this.state.dataInfo.evaluation_total = convertStar(safe(res.result.total_star))//好评度
            this.state.dataInfo.evaluation_count = safe(res.result.evaluation_count)//评论总数
            this.setState({})
        }
    }
    //数据请求
    _requestCommentsMethod(){
        if (isEmpty(safeObj(this.props.data).shop_id)) {
            return
        }
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.evaluation.getEvaluationByStoreId');
        paramMap.set('storeid', safe(this.props.data.shop_id));
        paramMap.set('pageIndex', this.state.pageIndex);
        paramMap.set('pageSize', 10);

        let paramObj = new YFWRequestParam();
        let params = paramObj.getBaseParam(paramMap);

        try {
            YFWNativeManager.TCPRequest(strMapToObj(params), (res) => {
                this.dealCommentsData(res)
            }, (error) => {
                this.dealCommentsError(error)
            });
        } catch (error) {
            this.dealCommentsError(error)
        }
    }

    dealCommentsData(res){
        if (isNotEmpty(res) && isNotEmpty(res.code)) {
            if (String(res.code) == '1') {
                let showFoot = 0;
                let dataArray = YFWGoodsEavluationListModel.getModelArray(isEmpty(safeObj(res.result).dataList)?[]:safeObj(res.result).dataList);

                if (dataArray.length === 0) {
                    showFoot = 1;
                }
                if (this.state.pageIndex > 1) {
                    dataArray = this.state.dataInfo.evaluation.concat(dataArray);
                }
                dataArray = itemAddKey(dataArray);
                this.state.dataInfo.evaluation = dataArray;
                this.setState({
                    loading: false,
                    showFoot: showFoot,
                });
            } else {
                this.dealCommentsError()
            }
        }
    }

    dealCommentsError(error){
        this.setState({
            loading: false,
            showFoot: 0,
        });
    }


    //@ View
    render() {
        return (
            <View style={{backgroundColor:backGroundColor() , flex:1}}>
                <FlatList
                    ref={(flatList)=>this._flatList = flatList}
                    extraData={this.state}
                    data={this.state.dataInfo.evaluation}
                    onRefresh={() => this._onRefresh()}
                    refreshing={this.state.loading}
                    renderItem = {this._renderItem.bind(this)}
                    // ListHeaderComponent = {this._renderHeader.bind(this)}
                    ListFooterComponent={this._renderFooter.bind(this)}
                    onEndReached={this._onEndReached.bind(this)}
                    onEndReachedThreshold={0.1}
                />
            </View>
        );
    }


    _renderItem = (item,index) => {

        return (
            // <View key={{index}}  style={{backgroundColor:'white'}}>
            //     <View key={index} style={{flexDirection:'row',alignItems:'center',height:30,flex:1,paddingLeft:15,paddingRight:15}} >
            //         <StartScore  currentScore={item.item.send_star}/>
            //         <View style={{flex:1}}/>
            //         <Text numberOfLines={1} style={{color:darkNomalColor(),fontSize:12}}>{item.item.eval_account_name}</Text>
            //     </View>
            //     <View style={{flex:1,marginLeft:15,marginRight:15}}>
            //         <Text style={{color:darkNomalColor(),fontSize:13}}>{item.item.eval_content}</Text>
            //     </View>
            //     {this._renderReply("商家回复：",item.item.reply_content)}
            //     {this._renderReply("商城回复：",item.item.admin_reply_content)}
            //     <Text style={{color:darkLightColor(),fontSize:11,marginLeft:15,marginTop:5,height:15}}>{item.item.eval_create_time}</Text>
            //     <View style={{backgroundColor:separatorColor(),height:1,marginTop:9,marginLeft:15,width:Dimensions.get('window').width}}/>
            // </View>
            <YFWGoodsDetailCommentCell model = {item.item} index={index}/>
        );
    }

    /**
     * 商家或商城回复
     * @private
     */
    _renderReply(type,content){
        if(isNotEmpty(content)){
            return(
                <View style={{backgroundColor:backGroundColor(),marginTop:10,marginLeft:15,marginRight:15,padding:10}}>
                    <Text >
                        <Text style={{fontSize:13,color:darkLightColor()}}>{type}</Text>
                        <Text style={{fontSize:13,color:darkNomalColor()}}>{content}</Text>
                    </Text>
                </View>
            )
        }
    }

    _renderHeader(){

        return(
            <View style={{flex:1,backgroundColor:'white'}}>
                <View style={{width:width,height:1,backgroundColor:backGroundColor()}}/>
                <View style={{backgroundColor:backGroundColor(),height:10,width:Dimensions.get('window').width}}/>
                <View style={{height:50,flexDirection: 'row', alignItems: 'center',paddingRight:15}}>
                    <Text style={{fontSize:13,color:darkTextColor(),marginLeft:15,flex:1}}>店铺总评</Text>
                    <Text style={{fontSize:13,color:yfwOrangeColor(),width:40,textAlign: 'right',paddingRight:5}}>{this.state.dataInfo.evaluation_total}分</Text>
                    <StartScore currentScore={this.state.dataInfo.evaluation_total} />
                </View>
                <View style={{backgroundColor:backGroundColor(),height:10,width:Dimensions.get('window').width}}/>
                <View style={{height:60,flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{flex:1,alignItems: "center", justifyContent: "center"}}>
                        <Text style={{fontSize:15,color:darkTextColor()}}>{this.state.dataInfo.evaluation_service_score}分</Text>
                        <Text style={{fontSize:11,color:darkLightColor(),marginTop:5}}>客户服务</Text>
                    </View>
                    <View style={{backgroundColor:separatorColor(),width:1,height:50}}/>
                    <View style={{flex:1,alignItems: "center", justifyContent: "center"}}>
                        <Text style={{fontSize:15,color:darkTextColor()}}>{this.state.dataInfo.evaluation_send_score}分</Text>
                        <Text style={{fontSize:11,color:darkLightColor(),marginTop:5}}>发货速度</Text>
                    </View>
                    <View style={{backgroundColor:separatorColor(),width:1,height:50}}/>
                    <View style={{flex:1,alignItems: "center", justifyContent: "center"}}>
                        <Text style={{fontSize:15,color:darkTextColor()}}>{this.state.dataInfo.evaluation_logistics_score}分</Text>
                        <Text style={{fontSize:11,color:darkLightColor(),marginTop:5}}>物流速度</Text>
                    </View>
                    <View style={{backgroundColor:separatorColor(),width:1,height:50}}/>
                    <View style={{flex:1,alignItems: "center", justifyContent: "center"}}>
                        <Text style={{fontSize:15,color:darkTextColor()}}>{this.state.dataInfo.evaluation_package_score}分</Text>
                        <Text style={{fontSize:11,color:darkLightColor(),marginTop:5}}>商品包装</Text>
                    </View>
                </View>
                <View style={{backgroundColor:backGroundColor(),height:10,width:Dimensions.get('window').width}}/>
                <View style={{height:50,flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{fontSize:13,color:darkLightColor(),marginLeft:15,flex:1}}>评论（{this.state.dataInfo.evaluation_count}）</Text>
                    <Text style={{fontSize:13,color:darkLightColor(),width:40,marginRight:5}}>好评度</Text>
                    <Text style={{fontSize:13,color:yfwOrangeColor(),width:20,marginRight:15}}>{this.state.dataInfo.evaluation_total}</Text>
                </View>
                <View style={{backgroundColor:separatorColor(),height:1,width:Dimensions.get('window').width}}/>
            </View>
        );


    }

    _renderFooter(){

        return <YFWListFooterComponent showFoot={this.state.showFoot}/>

    }


}
