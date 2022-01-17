import React, {Component} from 'react';
import {
    Platform,
    View,
    TextInput,
    Image,
    Text,
    TouchableOpacity,
    NativeModules,
    ImageBackground,
    StatusBar,
    DeviceEventEmitter,Keyboard,Animated,
} from 'react-native';
import {
    itemAddKey,
    isEmpty,
    kScreenWidth,
    isNotEmpty,
    isIphoneX,
    iphoneTopMargin, mobClick, darkStatusBar, dismissKeyboard_yfw
} from "../../../PublicModule/Util/YFWPublicFunction";
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import {yfwGreenColor,darkNomalColor} from '../../../Utils/YFWColor'
import YFWSearchHistoryView from '../Controller/YFWSearchHistoryView'
import YFWSearchRelevantWordsView from '../Controller/YFWSearchRelevantWordsView'
import YFWSearchDetailListView from '../Controller/YFWSearchDetailListView'
import {getItem,setItem,kSearchHistoryKey} from '../../../Utils/YFWStorage'

const {StatusBarManager} = NativeModules;
import AndroidHeaderBottomLine from '../../../widget/AndroidHeaderBottomLine'
import YFWNativeManager from "../../../Utils/YFWNativeManager";
import {pushNavigation} from "../../../Utils/YFWJumpRouting"
import { EMOJIS } from '../../../PublicModule/Util/RuleString';
import YFWMore from '../../../widget/YFWMore';
import YFWUserInfoManager from '../../../Utils/YFWUserInfoManager';
import { addLogPage } from '../../../Utils/YFWInitializeRequestFunction';
export default class YFWSearchRootController extends Component {

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
            searchTextConfirmed:false,
            searchStandard:'',
            edit:true,
            resetFilter:false,
            showType:'goods',
            searchEndtype:0,   //0代表搜索框无二维码，1代表有
            containerStyle:{marginTop:new Animated.Value(0)},
            searchHeaderMargin: new Animated.Value(0),
        }
        this.currentScrollY = 0
        this.headerH = (Platform.OS === 'ios') ? (44+iphoneTopMargin()-20) + 7 :Platform.Version > 19? 50+StatusBarManager.HEIGHT + 7:50+7
    }

    componentWillMount() {
        addLogPage(4)
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

    }


    //@ Action

    dismissKeyboard(){
        const dismissKeyboard = require('dismissKeyboard');
        dismissKeyboard();
    }


    //搜索框变化
    onChangeText(text){
        this.state.searchTextConfirmed = false
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
                if(this.state.searchTextConfirmed){
                    this._relevant && this._relevant._requestStandardData(text);
                } else  {
                    this._relevant && this._relevant._requestRelevantData(text);
                }
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
        //关键词是否确认。是，直接搜索全部规格。否，查询联想词
        let searchKey = text.toString().trim()
        if(isEmpty(searchKey)){
            return
        }
        if(this.state.searchTextConfirmed) {
            this.searchMethod(searchKey);
            this.addHistory('goods',searchKey);
        }else {
            mobClick('search-input-search');
            if (isNotEmpty(this._relevant)) {
                this._relevant._requestRelevantData(searchKey, (isDrug)=>{
                    if(isDrug){
                        this.state.searchTextConfirmed = true;
                        this.setState({
                            searchText: searchKey,
                            type:2,
                        })
                        this._relevant && this._relevant._requestStandardData(searchKey)
                    } else {
                        this.searchMethod(searchKey);
                        this.addHistory('goods',searchKey);
                    }
                });
            } else {
                this.state.searchTextConfirmed = true;
                this.setState({
                    searchText: searchKey,
                    type:2,
                })
            }
        }
    }

    searchMethod(text,standard){

        this.dismissKeyboard();
        if (text.toString().trim().length > 0){

            this.setState({
                type:3,
                resetFilter:false,
                showType:'goods',
                searchText: text.toString().trim(),
                searchStandard:standard,
                searchTextConfirmed:false,
            });
        }

    }

    //热门搜索
    clickHotItemMethod(item){

        mobClick('search-hot');
        this.state.searchTextConfirmed = true;
        let searchKey = item.keywords_name?item.keywords_name:item
        this.setState({
            searchText: searchKey,
            type:2,
        })
        if (isNotEmpty(this._relevant)) {
            this._relevant && this._relevant._requestStandardData(searchKey);
        }
    }

    clickItemMethod(item){
        //关键词是否确定,是item为规格，否item为搜索联想关键字。
        if(this.state.searchTextConfirmed){
            let {navigate} = this.props.navigation;
            let isShopMember = this.props.navigation.state.params.state.isShopMember
            if (isShopMember) {
                let searchKey = this.state.searchText
                let standard = item
                this.hotItemMethod(searchKey,standard);
                this.addHistory('goods',searchKey);
                return
            }
            if(item.url_type == 2){              //比价
                pushNavigation(navigate,{type:'get_goods_detail',value:item.keywords_value})
            }else if(item.url_type == 3){          //  详情
                pushNavigation(navigate,{type:'get_shop_goods_detail',value:item.keywords_value})
            }else if(item.url_type == 4 || item.url_type == 6){            //  专题、外链
                pushNavigation(navigate,{type:'get_h5',value:item.keywords_value})
            }else if(item.url_type == 5){              // 分类
                pushNavigation(navigate,{type:'get_category',value:item.keywords_value,name:item.keywords_name});
            }else{                          //搜索
                let searchKey = this.state.searchText
                let standard = item
                this.hotItemMethod(searchKey,standard);
                this.addHistory('goods',searchKey);
            }
        } else {
            this.state.searchTextConfirmed = true
            let searchKey = item.keywords_name?item.keywords_name:item
            this.state.searchText = searchKey
            this.setState({
                searchText: searchKey,
                type:2,
            })
            if (isNotEmpty(this._relevant)) {
                this._relevant && this._relevant._requestStandardData(searchKey);
            }
        }
    }

    hotItemMethod(text,standard){

        this.setState({
            searchText:text,
            edit:false,
            showType:'goods',
            searchStandard:standard,
        });

        this.searchMethod(text,standard);
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


    //@ View

    render() {

        return(
            <Animated.View style={[BaseStyles.container,this.state.containerStyle]}>
                {this._renderAminationSearchHeader()}
                {this._renderBodyView()}
            </Animated.View>
        );

    }

    _renderBodyView(){

        if (this.state.type == 1){

            return <YFWSearchHistoryView key={'History'} shop_id={this.shopID}
                                         clickHotItem={(words)=>{this.clickHotItemMethod(words)}}
                                         clickHistoryItem={(item)=>{this.clickHistoryItemMethod(item)}}/>;

        } else if(this.state.type == 2){

            return <YFWSearchRelevantWordsView key={'Relevant'} ref={(relevant)=>this._relevant = relevant} shop_id={this.shopID}
                                               clickShopMethod={()=>{this.clickSearchShopMethod(this.state.searchText)}}
                                               clickGoodsMethod={(item)=>{this.clickItemMethod(item)}}
                                               keyWords={this.state.searchText} keyWordsConfirmed={this.state.searchTextConfirmed} navigation={this.props.navigation}/>;

        } else if(this.state.type == 3){
            let isShopMember = this.props.navigation.state.params.state.isShopMember
            return <YFWSearchDetailListView key={'DetailList'} ref={(detailList)=>this._detailList = detailList} type={this.state.showType}
                                            shop_id={this.shopID}
                                            keyWords={this.state.searchText}
                                            keyWordsStandard={this.state.searchStandard}
                                            resetFilter={this.state.resetFilter}
                                            isShopMember = {isShopMember}
                                            navigation={this.props.navigation}
                                            _onSrollStart={(event)=>{this._dealOnScrollBegin(event)}}
                                            _onSrollEnd={(event)=>{this._dealOnScrollEnd(event)}}
                                            _onScroll={(event)=>{this._dealOnScroll(event)}}
                                            />

        }

    }

    _renderDeletIcon(){
        if(isNotEmpty(this.state.searchText)&&this.state.searchText.length>0){
            if(this.state.type!=3){
                return(<TouchableOpacity activeOpacity={1} onPress = {()=>this._removeKeywords()} hitSlop={{left:10,top:10,bottom:10,right:0}}>
                    <Image style={{width:16,height:16,resizeMode:'contain',marginRight:5,opacity:0.4}} source={require('../../../../img/search_del.png')}/>
                </TouchableOpacity>)
            }else{
                return this._renderQRScanIcon()
            }
        }
        if(this.state.searchEndtype==1){
            return this._renderQRScanIcon()
        }
    }

    _renderQRScanIcon() {
        return(
            <TouchableOpacity
                hitSlop={{left:10,top:10,bottom:10,right:0}}
                onPress={() => {this.qr_search()}}>
                <Image key={'scan'} style={{width:16,height:16,marginRight:16}}
                    source={require('../../../../img/qr_sys.png')}
                    defaultSource={require('../../../../img/qr_sys.png')}
                    />
            </TouchableOpacity>
        )
    }

    _removeKeywords(){
        this.setState({
            searchText:'',
            type:1,
            resetFilter:true,
            showType :'goods',
            searchTextConfirmed:false,
            searchStandard:'',
        });
    }

    _renderSearchTitleAndIcon(){
        if(isNotEmpty(this.state.searchText)&&this.state.searchText.length>0&&this.state.type==3){
            return (
                <View style={{width:61,paddingLeft:17}}>
                    <YFWMore onPress={()=>{
                        DeviceEventEmitter.emit('OpenUtilityMenu', {type: 'move'});
                    }} />
                </View>
                )
        }else{
            return(<View style={{height:34,width:61,paddingRight:13,paddingLeft:17}} >
                <TouchableOpacity style={[BaseStyles.centerItem,{flex:1}]} onPress={()=>this.searchClick(this.state.searchText)} hitSlop={{left:15,top:10,bottom:10,right:10}}>
                    <Text style={{fontSize:15,color:'#ffffff',}}>搜索</Text>
                </TouchableOpacity>
            </View>)
        }

    }

    _renderAminationSearchHeader() {
        return (
            <Animated.View style={{width:kScreenWidth,backgroundColor:'white',paddingBottom: this.state.searchHeaderMargin}}>
                {this._renderSearchHeader()}
            </Animated.View>
        )
    }

    _renderSearchHeader(){

        if (isEmpty(this.searchText)){

            return(
                <ImageBackground style={{width:kScreenWidth,height:this.headerH,alignItems:'flex-end',justifyContent:'flex-end',resizeMode:'stretch'}}
                    source={require('../../../../img/Status_bar.png')}
                >
                    <StatusBar barStyle="light-content" />
                    <View style={[BaseStyles.leftCenterView,{height:51}]}>
                        <View>
                            <TouchableOpacity style={[BaseStyles.item,{width:42}]}
                                                hitSlop={{left:0,top:15,bottom:15,right:0}}
                                              onPress={()=>{
                                                  dismissKeyboard_yfw();
                                                  this.props.navigation.goBack();
                                              }}>
                                <Image style={{width:11,height:19,resizeMode:'stretch'}}
                                       source={ require('../../../../img/top_back_white.png')}/>
                            </TouchableOpacity>
                        </View>
                        <View style={[BaseStyles.centerItem,{flex:1,marginLeft:0}]}>
                            <View style={{width:kScreenWidth-100,height:34,borderRadius:17,backgroundColor:'#ffffff',alignItems:'center',flexDirection:'row',resizeMode:'stretch'}}>
                                <Image style={{width: 16, height: 16, marginLeft:14,marginTop:9,marginBottom:10}}
                                       source={require('../../../../img/top_bar_search.png')}
                                       defaultSource={require('../../../../img/top_bar_search.png')}/>
                                <TextInput ref={(searchInput)=>this._searchInput = searchInput}
                                           placeholder={isEmpty(this.shopID)?'搜索症状、药品、药店、品牌':'搜索症状、药品、品牌'}
                                           placeholderTextColor="#cccccc"
                                           onChange={(event) => this.onChangeText(event.nativeEvent.text)}
                                           onChangeText={(text) => {this.onChangeText(text)}}
                                           onEndEditing={(event) => this.onEndEditing(event.nativeEvent.text)}
                                           onSubmitEditing={(event) => {this.searchClick(event.nativeEvent.text)}}
                                           value = {this.state.searchText}
                                           returnKeyType={'search'}
                                           autoFocus={this.autoFocus}
                                           onFocus={()=>{this._onFocus()}}
                                           selectionColor={'#1fdb9b'}
                                           underlineColorAndroid='transparent'
                                           style={{padding:0,flex:1,marginLeft:5,marginRight:5,fontSize:14}}
                                >
                                    {/* {this._textInputText()} */}
                                </TextInput>
                                {this._renderDeletIcon()}
                            </View>
                        </View>
                        {this._renderSearchTitleAndIcon()}
                    </View>
                    {/* <View style={{width:kScreenWidth,marginBottom:0,height:7,backgroundColor:'white',borderTopLeftRadius:7,borderTopRightRadius:7}}></View> */}
                </ImageBackground>
            );

        } else {

            return (<View/>);

        }


    }

    _dealOnScrollBegin(event) {
        console.log(event.nativeEvent,'start')
        let contentY = event.nativeEvent.contentOffset.y;
        this.listViewH = event.nativeEvent.layoutMeasurement.height
        this.renderdViewH = event.nativeEvent.contentSize.height
        this.startScrollY = contentY
    }

    _dealOnScrollEnd(event) {
        if (event) {
            console.log(event.nativeEvent,'end')
        }
    }

    _dealOnScroll(event) {
        console.log(event.nativeEvent)
        if  (isNotEmpty(event.nativeEvent.loadingStatus) && event.nativeEvent.loadingStatus != 'waiting') {
            return
        }
        let headerH = this.headerH
        let currentScrollY = event.nativeEvent.contentOffset.y
        if (currentScrollY+this.listViewH > this.renderdViewH) {//处理底部问题
            return
        }
        let topValue = this.state.containerStyle.marginTop._value
        if (this.listViewH > (this.renderdViewH - 2) || currentScrollY < 0) {
            if (topValue < 0) {
                Animated.timing(this.state.containerStyle.marginTop, {
                    toValue: 0,
                    duration: 100,
                }).start(()=>{
                    DeviceEventEmitter.emit('kStandardPositionChange',{isUp:false,moveY:0})
                })
                Animated.timing(this.state.searchHeaderMargin,{
                    toValue:0,
                    duration:100,
                }).start(()=>{})
            }
            return
        }
        let marginH = 40
        if (this.startScrollY < currentScrollY && currentScrollY - this.startScrollY > marginH &&  topValue >= 0 ) {
            let headerMargin = iphoneTopMargin()-20
            Animated.timing(this.state.containerStyle.marginTop, {
                toValue: - headerH,
                duration: 100,
            }).start(()=>{
                DeviceEventEmitter.emit('kStandardPositionChange',{isUp:true,moveY:-headerH+headerMargin})
            })
            Animated.timing(this.state.searchHeaderMargin,{
                toValue:headerMargin,
                duration:100,
            }).start(()=>{})
            // this.setState({
            //     containerStyle:{
            //         marginTop:-headerH + 20
            //     }
            // })
        } else if (this.startScrollY > currentScrollY && currentScrollY - this.startScrollY < -marginH && topValue < 0 ) {
            // this.setState({
            //     containerStyle:{
            //         marginTop:0
            //     }
            // })
            Animated.timing(this.state.containerStyle.marginTop, {
                toValue: 0,
                duration: 100,
            }).start(()=>{
                DeviceEventEmitter.emit('kStandardPositionChange',{isUp:false,moveY:0})
            })
            Animated.timing(this.state.searchHeaderMargin,{
                toValue:0,
                duration:100,
            }).start(()=>{})
        }

        if (Math.abs(currentScrollY - this.startScrollY) >= marginH) {
            this.startScrollY = currentScrollY
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
        if (value.name == 'get_goods_detail' && YFWUserInfoManager.ShareInstance().isShopMember()) {

            if (isNotEmpty(value.scan_code) && !isNaN(parseInt(value.scan_code))) {
                let {navigate} = this.props.navigation;
                let params = {
                    type: 'get_search',
                    searchText:value.scan_code
                }
                params.shop_id = YFWUserInfoManager.ShareInstance().getErpShopID()
                params.isShopMember = true
                pushNavigation(navigate, params);
                return
            }
        }
        let {navigate} = this.props.navigation;
        pushNavigation(navigate, {type: value.name, value: value.value});

    }

    searchClick(text){
        if(this.state.showType === 'shop'){
            this.clickSearchShopMethod(text)
        }else if(this.state.showType === 'goods'){
            this.clickSearchMethod(text)
        }
    }

    _textInputText(){

        return (
            <Text>{this.state.searchText}</Text>
        );

    }

}

