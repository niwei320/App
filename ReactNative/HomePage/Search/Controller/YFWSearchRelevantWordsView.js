import React, {Component} from 'react';
import {
    View,
    Image,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import {
    itemAddKey,
    isEmpty,
    kScreenWidth,
    dismissKeyboard_yfw,
    isNotEmpty, safeArray, safeObj
} from "../../../PublicModule/Util/YFWPublicFunction";
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import {yfwGreenColor, separatorColor, darkLightColor} from '../../../Utils/YFWColor'
import YFWRequestViewModel from "../../../Utils/YFWRequestViewModel";
import YFWUserInfoManager from '../../../Utils/YFWUserInfoManager';


export default class YFWSearchRelevantWordsView extends Component {


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
        //关键字是否确定，确定请求规格数据，否则请求联想关键字数据
        if(this.props.keyWordsConfirmed){
            this._requestStandardData(this.props.keyWords)
        } else {
            this._requestRelevantData(this.props.keyWords)
        }

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
            if(res.result && callback && safeArray(res.result).length > 0){
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
        // 1 == 展示规格选择    其他 == 直接搜索
        let showStandardType = parseInt(safeObj(YFWUserInfoManager.ShareInstance().getSystemConfig()).search_standard_type) == 1
        if (!showStandardType) {
            this.clickGoodsItemMethod('')
            return
        }
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.medicine.getSearchStandard');
        paramMap.set('keywords', keyWords);
        paramMap.set('top', '10');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            res.result = safeArray(res.result)
            if(res.result && res.result.length === 0){
                this.clickGoodsItemMethod('')
            } else if (isNotEmpty(res.result)) {
                res.result.unshift('所有规格>>')
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
                 <Image source={require('../../../../img/Status_bar.png')}
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
                        <Image style={{height:18, width:18}} source={require('../../../../img/shops.png')} defaultSource={require('../../../../img/shops.png')}/>
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

    _renderListItem = (item) => {
        let name = item.item
        let fontWeightStyle = 'normal'
        if (name == '所有规格>>') {
            name = ''
            fontWeightStyle = 'bold'
        }
        return (
            <View key={this.props.keyWords+'item'+item.index} style={{height:43}}>
                <TouchableOpacity activeOpacity={1} style={[BaseStyles.leftCenterView,{flex:1}]}
                                  onPress={()=>{this.clickGoodsItemMethod(name)}}>
                    <Text style={[BaseStyles.titleWordStyle,{marginLeft:13,fontSize:15,fontWeight:fontWeightStyle}]}>{item.item}</Text>
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

