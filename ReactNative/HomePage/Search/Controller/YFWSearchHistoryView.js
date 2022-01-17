import React, {Component} from 'react';
import {
    Platform,
    ScrollView,
    View,
    Image,
    Text,
    TouchableOpacity,Alert
} from 'react-native';
import {
    itemAddKey,
    isEmpty,
    kScreenWidth,
    isNotEmpty,
    safeArray,
    safeObj
} from "../../../PublicModule/Util/YFWPublicFunction";
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import {getItem, setItem, removeItem, kSearchHistoryKey} from '../../../Utils/YFWStorage'
import {yfwGreenColor, darkNomalColor, darkLightColor, yfwRedColor} from '../../../Utils/YFWColor'
import YFWRequestViewModel from "../../../Utils/YFWRequestViewModel";
import YFWHotWordsModel from "../Model/YFWHotWordsModel";
import YFWTitleView from '../../../PublicModule/Widge/YFWTitleView'


export default class YFWSearchHistoryView extends Component {


    constructor(props, context) {

        super(props, context);
        this.state = {
            hotWords: [],
            hotWordItems: [],
            historyWords: [],
            clearStatus:false,
        }
        this._requestHotWordsData();
        this._requestHistoryData();
    }

    //@ Request

    _requestHotWordsData() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.sitemap.getHotKeywords');
        paramMap.set('limit', 10);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            let dataArray = itemAddKey(YFWHotWordsModel.getModelArray(res.result));
            this.state.hotWordItems = safeArray(res.result)
            this.setState({
                hotWords: dataArray,
            });
        }, (error)=> {

        }, false);

    }

    _requestHistoryData() {

        getItem(kSearchHistoryKey).then((array)=> {
            if (isNotEmpty(array)) {

                let dataArray = array;
                if (isNotEmpty(this.props.shop_id)) {
                    dataArray = dataArray.filter(item => item.showType === 'goods');
                }
                dataArray = itemAddKey(dataArray);
                this.setState({
                    historyWords: dataArray,
                });
            }
        });

    }

    //@ Action

    clickHotItemMethod(words) {

        if (this.props.clickHotItem) {
            this.props.clickHotItem(words);
        }

    }

    clickHistoryItemMethod(item,index) {
        // let historyArray = this.state.historyWords
        //   historyArray.splice(index,1)
        //   historyArray.unshift(item)
        if (this.state.clearStatus) {
            this.removeHistory(item);
        } else {
            if (this.props.clickHistoryItem) {
                this.props.clickHistoryItem(item);
            }
        }
        
        // this.setState({
        //     historyWords:historyArray
        // })
    }

    removeHistory(info){

        if (isEmpty(info)|| isEmpty(info.value)) return;
        let showType = info.showType
        let value = info.value
        getItem(kSearchHistoryKey).then((id)=> {
            var array = id;
            if(isEmpty(array)){
                array = [];
            }
            let repeat = array.some(function(item){return item.showType == showType && item.value == value});
            if (repeat){
                array.splice(array.findIndex(item => item.showType == showType && item.value == value), 1);
            }
            setItem(kSearchHistoryKey,array);
            this.setState({
                historyWords:itemAddKey(array),
                clearStatus:array.length > 0
            })
        });

    }

    clearHistoryMethod() {

        Alert.alert('','是否全部删除搜索历史',[
            {
                text:'确定',
                onPress:()=>{
                    removeItem(kSearchHistoryKey);
                    this.setState({
                        historyWords: [],
                        clearStatus:false
                    });
                }},
            {
                text:'取消',
                onPress:()=>{}
            }
        ])



    }

    //@ View

    render() {

        return (
            <View style={{flex:1}}>
                 <Image source={require('../../../../img/Status_bar.png')}
                    style={{width:kScreenWidth,height:7,resizeMode:'stretch'}}
                 />
                <View style={[BaseStyles.container,{backgroundColor:'white',top:-7,borderTopLeftRadius:7,borderTopRightRadius:7}]}>
                    <ScrollView style={{flex:1}} keyboardShouldPersistTaps={'always'}>
                        {this._renderHotWordsView()}
                        {this._renderHistoryView()}
                    </ScrollView>
                </View>
            </View>
        );

    }

    _renderHotWordsView() {

        if (isNotEmpty(this.state.hotWords) && safeArray(this.state.hotWords).length > 0) {

            return (
                <View >
                    <View style={[BaseStyles.leftCenterView,{width:kScreenWidth}]}>
                        <View style={[BaseStyles.titleWordStyle,{marginLeft:11,marginTop:26}]}>
                            <YFWTitleView title={'热门搜索'}/>
                        </View>
                    </View>
                    <View style={{flexDirection:'row', flexWrap:'wrap',paddingRight: 5, paddingLeft:13, paddingTop:3,marginBottom:20,marginTop:0}}>
                        {this._renderHotItem()}
                    </View>
                </View>
            );

        }

    }

    _renderHistoryView() {

        if (isNotEmpty(this.state.historyWords) && safeArray(this.state.historyWords).length > 0) {

            return (
                <View >
                    <View style={[BaseStyles.leftCenterView,{width:kScreenWidth,justifyContent:'space-between'}]}>
                        <View style={[BaseStyles.titleWordStyle,{marginLeft:11,marginTop:26,}]}>
                            <YFWTitleView title={'历史搜索'}/>
                        </View>
                        {
                        this.state.clearStatus?
                        <View style={{...BaseStyles.leftCenterView,...BaseStyles.centerItem,marginTop:21,marginRight:15}}>
                            <TouchableOpacity activeOpacity={1}
                                        hitSlop={{left:10,top:10,bottom:10,right:10}}
                                        onPress={()=>this.clearHistoryMethod()}>
                                <Text style={{fontSize:12,color:'#666'}}>{'全部删除'}</Text>
                            </TouchableOpacity>
                            <View style={{width:1,height:9,borderRadius:2,backgroundColor:'#999',marginHorizontal:6}}/>
                            <TouchableOpacity activeOpacity={1}
                                        hitSlop={{left:10,top:10,bottom:10,right:10}}
                                        onPress={()=>this.setState({clearStatus:false})}>
                                <Text style={{fontSize:12,color:yfwRedColor()}}>{'完成'}</Text>
                            </TouchableOpacity>
                        </View>:
                        <TouchableOpacity activeOpacity={1}
                                          style={[{marginRight:15,marginTop:21}]}
                                          hitSlop={{left:10,top:10,bottom:10,right:10}}
                                          onPress={()=>this.setState({clearStatus:true})}>
                            <Image style={{height:19,width:18,resizeMode: 'stretch'}}
                                   source={require('../../../../img/ico_delete.png')}/>
                        </TouchableOpacity>
                        }
                    </View>
                    <View style={{flexDirection:'row', flexWrap:'wrap',paddingRight: 5, paddingLeft:13,paddingTop:3,marginBottom:20}}>
                        {this._renderHistoryItem()}
                    </View>
                </View>
            );

        }

    }

    _renderHotItem() {

        var allBadge = [];
        let menuaArray = safeArray(this.state.hotWords);
        for (let i = 0; i < menuaArray.length; i++) {

            let badge = menuaArray[i];

            allBadge.push(
                <TouchableOpacity activeOpacity={1} key={'hot'+i} style={{marginLeft:0,marginTop:0,marginBottom:8,marginRight:8}}
                                  onPress={()=>this.clickHotItemMethod(safeObj(this.state.hotWordItems[i]))}>
                    <View style={{borderRadius:17,backgroundColor:'#fafafa'}}>
                        <Text
                            style={[{color:'#666666',fontSize:12,},{marginLeft:20,marginRight:19,marginTop:10,marginBottom:10,maxWidth:12*14}]}>
                            {badge}
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        }

        return allBadge;
    }


    _renderHistoryItem() {

        var allBadge = [];
        let historyArray = safeArray(this.state.historyWords);

        for (var i = 0; i < historyArray.length; i++) {

            let badge = historyArray[i];
            allBadge.push(
                <TouchableOpacity activeOpacity={1} key={'history'+i} style={{marginLeft:0,marginTop:0,marginBottom:8,marginRight:8}}
                                  onPress={()=>this.clickHistoryItemMethod(badge,badge.key)}>
                    <View style={{borderRadius:17,backgroundColor:'#fafafa',flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                        <Text
                            style={[{color:'#666666',fontSize:12},{marginLeft:20,marginRight:19,marginTop:10,marginBottom:10,maxWidth:12*14}]} numberOfLines={2}>
                            <Text style={{color:'#666666'}}>
                                {badge.showType == 'goods' ? '商品' : '商家'}
                            </Text>
                            {' ' + badge.value}
                        </Text>
                        {this.state.clearStatus&&<Image style={{width:8,height:8,marginRight:9,marginLeft:-10}} source={require('../../../../img/icon_delect_history.png')}></Image>}
                    </View>
                </TouchableOpacity>
            );
        }

        return allBadge;

    }


}

