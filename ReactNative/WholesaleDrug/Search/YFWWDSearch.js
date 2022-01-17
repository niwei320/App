import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Animated,
    Platform,
    Keyboard,
    DeviceEventEmitter, ImageBackground, StatusBar, TextInput, NativeModules, Easing,
} from 'react-native';
import {
    darkStatusBar,
    iphoneTopMargin,
    isEmpty,
    isNotEmpty, kScreenWidth, mobClick
} from "../../PublicModule/Util/YFWPublicFunction";
import {EMOJIS} from "../../PublicModule/Util/RuleString";
import {getItem, kSearchHistoryKey, setItem} from "../../Utils/YFWStorage";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import YFWNativeManager from "../../Utils/YFWNativeManager";
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import {YFWImageConst} from "../Images/YFWImageConst";
import YFWHeaderLeft from "../Widget/YFWHeaderLeft";
import YFWWDSearchRelevantWordsView from "./View/YFWWDSearchRelevantWordsView";
import YFWWDSearchHistoryView from "./View/YFWWDSearchHistoryView";
import YFWWDSearchDetailListView from "./View/YFWWDSearchDetailListView";
import { pushWDNavigation, kRoute_goods_detail, kRoute_search, kRoute_shop_goods_detail, kRoute_html, kRoute_category, kRoute_shoppingcar } from '../YFWWDJumpRouting';
import YFWWDMore from '../Widget/View/YFWWDMore';

const {StatusBarManager} = NativeModules;

export default class YFWWDSearch extends Component {

    static navigationOptions = ({navigation}) => {
        if (navigation.state.params.state.value){
            return {
                tabBarVisible: false,
                headerTitle:navigation.state.params.state.value,
            }
        } else {
            return {
                tabBarVisible: false,
                header:null,
            }
        }
    };


    constructor(props, context) {

        super(props, context);

        this.shopID = this.props.navigation.state.params.state.shop_id;
        this.searchText = this.props.navigation.state.params.state.value;
        this.preSearchText = this.props.navigation.state.params.state.searchText;
        this.autoFocus = isEmpty(this.props.navigation.state.params.state.searchText)
        this.state = {
            type:1,
            searchText:'',
            edit:true,
            resetFilter:false,
            showType:'goods',
            searchEndtype:0,   //0代表搜索框无二维码，1代表有
            _scrollY:new Animated.Value(0),
            _fadeInOpacity:new Animated.Value(1),
        }
        this.headerH = (Platform.OS === 'ios') ? (44+iphoneTopMargin()-20) + 7 :Platform.Version > 19? 50+StatusBarManager.HEIGHT + 7:50+7
    }

    componentDidMount(){

        darkStatusBar();
        if (isNotEmpty(this.searchText)){

            this.state.searchText = this.searchText;
            this.state.edit = false;
            this.searchMethod(this.searchText);

        } else if (isNotEmpty(this.preSearchText)) {
            this.state.searchText = this.preSearchText;
            this.state.edit = true;
            this.searchMethod(this.preSearchText);
        }

        YFWNativeManager.mobClick('b2b-seach-1')
    }


    //@ Action

    dismissKeyboard(){
        const dismissKeyboard = require('dismissKeyboard');
        dismissKeyboard();
    }


    //搜索框变化
    onChangeText(text){
        text = text.replace(EMOJIS,'')
        this.setState({
            searchText:text,
            edit:true,
        });

        if (text.length > 0){

            mobClick('search-input');
            if (this.state.type == 1 || this.state.type == 3){
                this.setState({
                    type:2,
                });
            }
            if (isNotEmpty(this._relevant)) {
                this._relevant._requestRelevantData(text);
            }


        }else {
            this.setState({
                type:1,
                resetFilter:true,
                showType :'goods',
                searchEndtype:0
            });
        }

    }

    onEndEditing(text){

        if (this.state.type == 2){

            if (isNotEmpty(this._relevant)) {
                 this._relevant && this._relevant._requestRelevantData(text);
            }

        }
        if(this.state.type == 1){
            this.setState({
                searchEndtype:1
            })
        }

    }

    //点击查询
    clickSearchMethod(text){
        let searchKey = text.toString().trim()
        if(isEmpty(searchKey)){
            return
        }
        this.searchMethod(searchKey);
        this.addHistory('goods',searchKey);
    }

    searchMethod(text){

        this.dismissKeyboard();
        if (text.toString().trim().length > 0){

            this.setState({
                type:3,
                resetFilter:false,
                showType:'goods',
                searchText: text.toString().trim(),
            });
        }

    }

    //热门搜索
    clickHotItemMethod(item){

        mobClick('search-hot');
        let searchKey = item.keywords_name?item.keywords_name:item
        this.setState({
            searchText: searchKey,
            type:2,
        })
        if (isNotEmpty(this._relevant)) {
            this._relevant && this._relevant._requestRelevantData(searchKey);
        }
    }

    clickItemMethod(item){
            let {navigate} = this.props.navigation;
            if(item.url_type == 2){              //比价
                pushWDNavigation(navigate,{type:kRoute_goods_detail,value:item.keywords_value})
            }else if(item.url_type == 3){          //  详情
                pushWDNavigation(navigate,{type:kRoute_shop_goods_detail,value:item.keywords_value})
            }else if(item.url_type == 4 || item.url_type == 6){            //  专题、外链
                pushWDNavigation(navigate,{type:kRoute_html,value:item.keywords_value})
            }else if(item.url_type == 5){              // 分类
                pushWDNavigation(navigate,{type:kRoute_category,value:item.keywords_value,name:item.keywords_name});
            }else{                          //搜索
                let searchKey = item
                this.hotItemMethod(searchKey);
                this.addHistory('goods',searchKey);
            }
    }

    hotItemMethod(text){

        this.setState({
            searchText:text,
            edit:false,
            showType:'goods',
        });

        this.searchMethod(text);
    }


    //搜索店铺
    clickSearchShopMethod(text){
        let searchText = text.toString().trim()
        this.searchShopMethod(searchText);
        this.addHistory('shop',searchText);
        Keyboard.dismiss()
    }

    searchShopMethod(text){

        this.setState({
            searchText:text,
            showType:'shop',
            edit:false,
            type:3,
        });
        if (isNotEmpty(this._detailList)){
            this._detailList._handleData(text,'click');
        }
    }

    //历史搜索(不能重复加入历史记录)
    clickHistoryItemMethod(item){

        mobClick('search-result');
        this.dismissKeyboard();
        var text = item.value;

        if (item.showType == 'shop'){

            this.searchShopMethod(text);

        } else if(item.showType == 'goods') {

            this.hotItemMethod(text);

        }

    }



    addHistory(showType,value){

        if (isEmpty(value)) return;

        getItem(kSearchHistoryKey).then((id)=> {
            var array = id;
            if(isEmpty(array)){
                array = [];
            }
            var object = {
                showType:showType,
                value:value
            };

            //判断历史记录是否有重复记录
            let repeat = array.some(function(item){return item.showType == showType && item.value == value});
            if (repeat){
                array.splice(array.findIndex(item => item.showType == showType && item.value == value), 1);
                array.unshift(object);
            } else {
                array.unshift(object);
            }

            setItem(kSearchHistoryKey,array);
        });

    }

    _AnimatedUp(){

        if (this.scrollUP) {
            return
        }
        this.scrollUP = true
        let upHeight = 50
        Animated.spring(this.state._scrollY, {
            toValue: - upHeight,
            duration: 300,
            easing: Easing.linear,// 线性的渐变函数
        }).start();

        Animated.timing(this.state._fadeInOpacity, {
            toValue: 0,
            duration: 300,
            easing: Easing.linear,// 线性的渐变函数
        }).start();
    }

    _AnimatedDown() {

        if (!this.scrollUP) {
            return
        }
        this.scrollUP = false
        Animated.timing(this.state._scrollY, {
            toValue: 0,
            duration: 200,
            easing: Easing.linear,// 线性的渐变函数
        }).start();
        Animated.timing(this.state._fadeInOpacity, {
            toValue: 1,
            duration: 200,
            easing: Easing.linear,// 线性的渐变函数
        }).start();
    }
    //@ View

    render() {

        return(
            <View style={[BaseStyles.container]}>
                <Animated.View style={{width:kScreenWidth,backgroundColor:'white',top:this.state._scrollY,flex:1}}>
                    <Animated.View style={{opacity:this.state._fadeInOpacity}}>
                        {this._renderSearchHeader()}
                    </Animated.View>
                    {this._renderBodyView()}
                </Animated.View>

            </View>
        );

    }

    _renderBodyView(){

        if (this.state.type == 1){

            return <YFWWDSearchHistoryView key={'History'} shop_id={this.shopID}
                                         clickHotItem={(words)=>{this.clickHotItemMethod(words)}}
                                         clickHistoryItem={(item)=>{this.clickHistoryItemMethod(item)}}/>;

        } else if(this.state.type == 2){

            return <YFWWDSearchRelevantWordsView key={'Relevant'}
                                                 ref={(relevant)=>this._relevant = relevant}
                                                 shop_id={this.shopID}
                                                 clickShopMethod={()=>{this.clickSearchShopMethod(this.state.searchText)}}
                                                 clickGoodsMethod={(item)=>{this.clickItemMethod(item)}}
                                                 keyWords={this.state.searchText}
                                                 navigation={this.props.navigation}/>;

        } else if(this.state.type == 3){
            let isShopMember = this.props.navigation.state.params.state.isShopMember
            return <YFWWDSearchDetailListView key={'DetailList'} ref={(detailList)=>this._detailList = detailList} type={this.state.showType}
                                            shop_id={this.shopID}
                                            keyWords={this.state.searchText}
                                            resetFilter={this.state.resetFilter}
                                            isShopMember = {isShopMember}
                                            navigation={this.props.navigation}
                                            animatedUp={()=>this._AnimatedUp()}
                                            animatedDown={()=>this._AnimatedDown()}
            />

        }

    }

    _renderDeletIcon(){
        if(isNotEmpty(this.state.searchText)&&this.state.searchText.length>0){
            if(this.state.type!=3){
                return(<TouchableOpacity activeOpacity={1} onPress = {()=>this._removeKeywords()}>
                    <Image style={{width:16,height:16,resizeMode:'contain',marginRight:5,opacity:0.4}} source={YFWImageConst.Btn_input_del}/>
                </TouchableOpacity>)
            }else{
                return(<TouchableOpacity
                    onPress={() => {this.qr_search()}}>
                    <Image key={'scan'} style={{width:16,height:16,marginRight:16}}
                           source={YFWImageConst.Btn_qr_scan}
                           defaultSource={YFWImageConst.Btn_qr_scan}
                    />
                </TouchableOpacity>)
            }
        }
        if(this.state.searchEndtype==1){
            return(<TouchableOpacity
                onPress={() => {this.qr_search()}}>
                <Image key={'scan'} style={{width:16,height:16,marginRight:16}}
                       source={YFWImageConst.Btn_qr_scan}
                       defaultSource={YFWImageConst.Btn_qr_scan}
                />
            </TouchableOpacity>)
        }
    }

    _removeKeywords(){
        this.setState({
            searchText:'',
            type:1,
            resetFilter:true,
            showType :'goods',
        });
    }

    _renderSearchTitleAndIcon(){
        if(isNotEmpty(this.state.searchText)&&this.state.searchText.length>0&&this.state.type==3){
            return (
                <View style={{width:61,paddingLeft:17}}>
                    <YFWWDMore onPress={()=>{
                        DeviceEventEmitter.emit('OpenWDUtilityMenu', {type: 'move'});
                    }} />
                </View>
            )
        }else{
            return(<View style={{height:34,width:61,paddingRight:13,paddingLeft:17}} >
                <TouchableOpacity style={[BaseStyles.centerItem,{flex:1}]} onPress={()=>this.searchClick(this.state.searchText)}>
                    <Text style={{fontSize:15,color:'#ffffff',}}>搜索</Text>
                </TouchableOpacity>
            </View>)
        }

    }


    _renderSearchHeader(){

        if (isEmpty(this.searchText)){

            return(
                <ImageBackground style={{width:kScreenWidth,height:this.headerH,alignItems:'flex-end',justifyContent:'flex-end',resizeMode:'stretch'}}
                                 source={YFWImageConst.Nav_header_background_blue}
                >
                    <StatusBar barStyle="light-content" />
                    <View style={[BaseStyles.leftCenterView,{height:51}]}>
                        <YFWHeaderLeft navigation={this.props.navigation}/>
                        <View style={[BaseStyles.centerItem,{flex:1,marginLeft:0}]}>
                            <View style={{width:kScreenWidth-100,height:34,borderRadius:17,backgroundColor:'#ffffff',alignItems:'center',flexDirection:'row',resizeMode:'stretch'}}>
                                <Image style={{width: 16, height: 16, marginLeft:14,marginTop:9,marginBottom:10,tintColor:'#cccccc'}}
                                       source={YFWImageConst.Btn_bar_search}
                                       defaultSource={YFWImageConst.Btn_bar_search}/>
                                <TextInput ref={(searchInput)=>this._searchInput = searchInput}
                                           placeholder={isEmpty(this.shopID)?'搜索症状、药品、药店、品牌':'搜索症状、药品、品牌'}
                                           placeholderTextColor="#cccccc"
                                           onChange={(event) => this.onChangeText(event.nativeEvent.text)}
                                           onEndEditing={(event) => this.onEndEditing(event.nativeEvent.text)}
                                           onSubmitEditing={(event) => {this.searchClick(event.nativeEvent.text)}}
                                           value = {this.state.searchText}
                                           returnKeyType={'search'}
                                           autoFocus={this.autoFocus}
                                           onFocus={()=>{this._onFocus()}}
                                           selectionColor={'#3369ff'}
                                           underlineColorAndroid='transparent'
                                           style={{padding:0,flex:1,marginLeft:5,marginRight:5,fontSize:14}}
                                >
                                </TextInput>
                                {this._renderDeletIcon()}
                            </View>
                        </View>
                        {this._renderSearchTitleAndIcon()}
                    </View>
                </ImageBackground>
            );

        } else {

            return (<View/>);

        }


    }

    _onFocus(){
        if(this.state.type == 1){
            this.setState({
                searchEndtype:0
            })
        }
        this.setState({
            type:this.state.searchText.length > 0?2:1
        })
    }

    qr_search() {
        YFWNativeManager.openSaoyisao((value)=> {
            if (Platform.OS == 'ios') {

                if (this.onSaoyisaoClick) {
                    this.onSaoyisaoClick(value);
                }

            } else {
                let QrcodeData = JSON.parse(value);
                if (isEmpty(QrcodeData.name) && isEmpty(QrcodeData.value)) {
                    return
                }
                this.onSaoyisaoClick(QrcodeData)
            }
        });
    }

    //扫一扫
    onSaoyisaoClick(value) {
        let { navigate } = this.props.navigation;
        if (value.name == 'get_shop_goods_detail') {
            value.name = kRoute_shop_goods_detail
        } else if (value.name == 'get_goods_detail') {
            value.name = kRoute_goods_detail
        }else if (value.name == 'get_shopping_car') {
            value.name = kRoute_shoppingcar
        }
        pushWDNavigation(navigate, {type: value.name, value: value.value});

    }

    searchClick(text){
        if(this.state.showType === 'shop'){
            this.clickSearchShopMethod(text)
        }else if(this.state.showType === 'goods'){
            this.clickSearchMethod(text)
        }
    }
}