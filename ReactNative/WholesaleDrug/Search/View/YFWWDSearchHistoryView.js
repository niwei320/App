import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, Alert, ScrollView,
} from 'react-native';
import YFWRequestViewModel from "../../../Utils/YFWRequestViewModel";
import {
    isNotEmpty,
    itemAddKey,
    kScreenWidth, kStyleWholesale,
    safeArray
} from "../../../PublicModule/Util/YFWPublicFunction";
import YFWHotWordsModel from "../../../HomePage/Search/Model/YFWHotWordsModel";
import {getItem, kSearchHistoryKey, removeItem} from "../../../Utils/YFWStorage";
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import YFWTitleView from "../../../PublicModule/Widge/YFWTitleView";
import {YFWImageConst} from "../../Images/YFWImageConst";
import YFWWDHotWordsModel from "../Model/YFWWDHotWordsModel";

export default class YFWWDSearchHistoryView extends Component {


    constructor(props, context) {

        super(props, context);
        this.state = {
            hotWords: [],
            hotWordItems: [],
            historyWords: [],
        }
        this._requestHotWordsData();
        this._requestHistoryData();
    }

    //@ Request

    _requestHotWordsData() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.sitemap.getHotKeywords_whole');
        paramMap.set('limit', 10);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            let dataArray = itemAddKey(YFWWDHotWordsModel.getModelArray(res.result));
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
        if (this.props.clickHistoryItem) {
            this.props.clickHistoryItem(item);

        }
        // this.setState({
        //     historyWords:historyArray
        // })
    }

    clearHistoryMethod() {

        Alert.alert('','是否删除搜索历史',[
            {
                text:'确定',
                onPress:()=>{
                    removeItem(kSearchHistoryKey);
                    this.setState({
                        historyWords: [],
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
                <Image source={YFWImageConst.Nav_header_background_blue}
                       style={{width:kScreenWidth,height:7,resizeMode:'stretch'}}
                />
                <View style={[BaseStyles.container,{backgroundColor:'white',top:-7,borderTopLeftRadius:7,borderTopRightRadius:7}]}>
                    <ScrollView style={{flex:1}} keyboardShouldPersistTaps={'always'}>
                        {this._renderHistoryView()}
                        {this._renderHotWordsView()}
                    </ScrollView>
                </View>
            </View>
        );

    }

    _renderHotWordsView() {

        if (isNotEmpty(this.state.hotWords) && this.state.hotWords.length > 0) {

            return (
                <View >
                    <View style={[BaseStyles.leftCenterView,{width:kScreenWidth}]}>
                        <View style={[BaseStyles.titleWordStyle,{marginLeft:11,marginTop:26}]}>
                            <YFWTitleView title={'热门搜索'} from={kStyleWholesale}/>
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

        if (this.state.historyWords.length > 0) {

            return (
                <View >
                    <View style={[BaseStyles.leftCenterView,{width:kScreenWidth,justifyContent:'space-between'}]}>
                        <View style={[BaseStyles.titleWordStyle,{marginLeft:11,marginTop:26,}]}>
                            <YFWTitleView title={'历史搜索'} from={kStyleWholesale}/>
                        </View>
                        <TouchableOpacity activeOpacity={1}
                                          style={[{marginRight:15,marginTop:21}]}
                                          onPress={()=>this.clearHistoryMethod()}>
                            <Image style={{height:19,width:18,resizeMode: 'stretch'}}
                                   source={YFWImageConst.Icon_ashcan}/>
                        </TouchableOpacity>
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
        let menuaArray = this.state.hotWords;

        for (let i = 0; i < menuaArray.length; i++) {

            let badge = menuaArray[i];

            allBadge.push(
                <TouchableOpacity activeOpacity={1} key={'hot'+i} style={{marginLeft:0,marginTop:0,marginBottom:8,marginRight:8}}
                                  onPress={()=>this.clickHotItemMethod(this.state.hotWordItems[i])}>
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
        let historyArray = this.state.historyWords;

        for (var i = 0; i < historyArray.length; i++) {

            let badge = historyArray[i];
            allBadge.push(
                <TouchableOpacity activeOpacity={1} key={'history'+i} style={{marginLeft:0,marginTop:0,marginBottom:8,marginRight:8}}
                                  onPress={()=>this.clickHistoryItemMethod(badge,badge.key)}>
                    <View style={{borderRadius:17,backgroundColor:'#fafafa'}}>
                        <Text
                            style={[{color:'#666666',fontSize:12},{marginLeft:20,marginRight:19,marginTop:10,marginBottom:10,maxWidth:12*14}]} numberOfLines={2}>
                            <Text style={{color:'#547cff'}}>
                                {badge.showType == 'goods' ? '' : '商家'}
                            </Text>
                            <Text style={{color:'#666666'}}>
                                {badge.showType == 'goods' ? '' : ' | '}
                            </Text>
                            {' ' + badge.value}
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        }

        return allBadge;

    }


}