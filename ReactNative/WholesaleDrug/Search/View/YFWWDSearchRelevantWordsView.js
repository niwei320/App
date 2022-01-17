import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, FlatList,
} from 'react-native';
import YFWRequestViewModel from "../../../Utils/YFWRequestViewModel";
import {
    dismissKeyboard_yfw, isEmpty,
    itemAddKey,
    kScreenWidth, safeArray
} from "../../../PublicModule/Util/YFWPublicFunction";
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import {YFWImageConst} from "../../Images/YFWImageConst";

export default class YFWWDSearchRelevantWordsView extends Component {


    static defaultProps = {
        keyWords: '',
    }

    constructor(props, context) {

        super(props, context);
        this.state = {
            data: [],
            type:'',
        }
    }

    componentDidMount() {
         this._requestRelevantData(this.props.keyWords)
    }

    //@ Request

    _requestRelevantData(keyWords, callback) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.medicine.getAssociateKeywords');
        paramMap.set('keyword', keyWords);
        paramMap.set('limit', '20');
        paramMap.set('type', 'medicine');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            if(res.result && callback && res.result.length > 0){
                let isDrug = keyWords.trim() === res.result[0]
                callback && callback(isDrug)
            } else {
                callback && callback(false)
            }
            let dataArray = itemAddKey(res.result, 'relevant');
            this.setState({
                data: dataArray,
                type: 'Keywords',
            });

        }, ()=> {
        }, false);

    }

    _requestStandardData(keyWords) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.medicine.getSearchStandard');
        paramMap.set('keywords', keyWords);
        paramMap.set('top', '10');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            res.result = safeArray(res.result)
            if(res.result && res.result.length === 0){
                this.clickGoodsItemMethod('')
            }
            let dataArray = itemAddKey(res.result, 'relevant');
            this.setState({
                data: dataArray,
                type: 'Stander',
            });

        }, ()=> {
        }, true);

    }


    //@ Action

    clickShopItemMethod() {

        if (this.props.clickShopMethod) {
            this.props.clickShopMethod();
        }

    }

    clickGoodsItemMethod(item) {

        if (this.props.clickGoodsMethod) {
            this.props.clickGoodsMethod(item);
        }

    }


    //@ View

    render() {

        return (
            <View style={{flex:1}}>
                <Image source={YFWImageConst.Nav_header_background_blue}
                       style={{width:kScreenWidth,height:7,resizeMode:'stretch'}}
                />
                <View style={[BaseStyles.container,{backgroundColor:'white',top:-7,borderTopLeftRadius:7,borderTopRightRadius:7}]}>
                    <FlatList
                        ref={(flatList)=>this._flatList = flatList}
                        extraData={this.state}
                        data={this.state.data}
                        onScroll={()=>{dismissKeyboard_yfw();}}
                        renderItem={this._renderListItem.bind(this)}
                        ListHeaderComponent={this._renderHeader.bind(this)}
                        ListFooterComponent={this._renderFooter.bind(this)}
                        keyboardShouldPersistTaps={'always'}
                    />
                </View>
            </View>
        );

    }

    _renderHeader() {

        if (isEmpty(this.props.shop_id)) {
            return (
                <View key={'header'}>
                    <TouchableOpacity activeOpacity={1}
                                      style={[BaseStyles.leftCenterView,styles.headerImage]}
                                      onPress={()=>{this.clickShopItemMethod()}}>
                        <Image style={{height:18, width:18}} source={YFWImageConst.Icon_store}/>
                        <Text numberOfLines={4}
                              style={{marginLeft:9,marginRight:15,fontSize:15,color:'#666666'}}>搜索 “{this.props.keyWords}” 的商家</Text>
                    </TouchableOpacity>
                    <View style={{backgroundColor:'#f5f5f5',height:1,width:kScreenWidth}}/>
                </View>
            );
        } else {
            return (<View/>);
        }


    }

    _renderFooter() {

        if(this.state.type === 'Stander') {
            return (
                <View style={{height:43}}>
                    <TouchableOpacity activeOpacity={1} style={[BaseStyles.leftCenterView,{flex:1}]}
                                      onPress={()=>{this.clickGoodsItemMethod('')}}>
                        <Text style={[BaseStyles.titleWordStyle,{marginLeft:13,fontSize:15,fontWeight:'bold'}]}>{'所有规格>>'}</Text>
                    </TouchableOpacity>
                    <View style={{backgroundColor:'#f5f5f5',height:1,width:kScreenWidth-13,marginLeft:13}}/>
                </View>
            );
        } else {
            return (<View/>);
        }
    }

    _renderListItem = (item) => {

        return (
            <View key={this.props.keyWords+'item'+item.index} style={{height:43}}>
                <TouchableOpacity activeOpacity={1} style={[BaseStyles.leftCenterView,{flex:1}]}
                                  onPress={()=>{this.clickGoodsItemMethod(item.item)}}>
                    <Text style={[BaseStyles.titleWordStyle,{marginLeft:13,fontSize:15}]}>{item.item}</Text>
                </TouchableOpacity>
                <View style={{backgroundColor:'#f5f5f5',height:1,width:kScreenWidth-13,marginLeft:13}}/>
            </View>
        );

    }


}

const styles = StyleSheet.create({
    headerImage:{
        flex:1,
        paddingRight:15,
        paddingLeft:13,
        paddingBottom:18,
        paddingTop:19
    }
})