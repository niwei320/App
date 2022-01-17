/**
 * Created by 12345 on 2018/4/20.
 */
import React, {Component} from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity,
    ImageBackground, Modal, NativeModules, FlatList, TextInput, DeviceEventEmitter, Platform
} from 'react-native';
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {
    kScreenWidth,
    mobClick,
    kScreenScaling,
    kScreenHeight,
    isNotEmpty,
    isEmpty,
    deepCopyObj,
    safeArray
} from "../../PublicModule/Util/YFWPublicFunction";
import {darkNomalColor , yfwGreenColor , darkTextColor , separatorColor} from '../../Utils/YFWColor'
import YFWToast from "../../Utils/YFWToast";
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';
import { EMOJIS } from '../../PublicModule/Util/RuleString';
const {StatusBarManager} = NativeModules;


export default class YFWSubCategoryMenuView extends Component {

    static defaultProps = {
        hasPriceCount : false,
        hasScreening  : true,
        isSearch  : true,
    }

    constructor(...args) {

        super(...args);

        this.state = {
            defaultBtnIsCheck: true,
            priceBtnIsCheck: false,
            countBtnIsCheck: false,
            priceBtnIsPlus: true,
            countBtnIsPlus: true,
            selectStandard:false,
            selectStandardTitle:'',
            showStandard:false,
            standardArray:[],
            searchText:'',
        }
        this.marginTop = 180
        this.moveY = 0
        this._addListener()
    }

    _addListener() {
        this.changeListener = DeviceEventEmitter.addListener('kStandardChange',(value)=>{
            this._setSelectStatus(value)
        })
        this.searchListener = DeviceEventEmitter.addListener('kSearchTextChange',(value)=>{
            this._fetchDataFromServer(value)
        })
        this.positionListener = DeviceEventEmitter.addListener('kStandardPositionChange',(value)=>{
            if (value.isUp) {

            } else {
            }
            let moveY = parseInt(value.moveY)
            if (isNaN(moveY)) {
                moveY = 0
            }
            this.moveY = moveY
        })
    }

    componentWillUnmount() {
        this.changeListener&&this.changeListener.remove()
        this.searchListener&&this.searchListener.remove()
        this.positionListener&&this.positionListener.remove()
    }

    render() {
        let anotherType = this.props.showType == 'section'
        return (
            <View >
                <ImageBackground source={require('../../../img/Status_bar.png')}
                       style={{resizeMode:'stretch'}} opacity={anotherType?0:1}>
                    <View style={{height: 50, width: kScreenWidth, flexDirection: "row", alignItems:'center', backgroundColor: "white", borderTopLeftRadius: this.props.isSearch?7:0, borderTopRightRadius: this.props.isSearch?7:0}}>

                        {this._renderButtonItem('默认',this.state.defaultBtnIsCheck)}
                        {this._renderButtonItem('价格',this.state.priceBtnIsCheck)}
                        {this._renderPriceCountItem('报价数',this.state.countBtnIsCheck)}
                        {/*翻转*/}
                        <TouchableOpacity activeOpacity={1} style={[BaseStyles.item,{flex:1}]} hitSlop={{left:0,top:10,bottom:10,right:0}} onPress={() => {
                            if (this.props.hasPriceCount){
                                mobClick('search-result-switch');
                            }
                            if (this.props.onShowTypeChange){
                                this.props.onShowTypeChange();
                            }
                        }}>
                            <Image style={{height: 18, width: 18, resizeMode: 'contain'}}
                                   source={this.props.tableStyle?require('../../../img/medicine_map_gray.png'):require('../../../img/medicine_list_gray.png')}/>
                        </TouchableOpacity>
                        <View style={{height:25,width:1,backgroundColor:separatorColor()}}/>
                        {this._renderScreeningItem()}

                    </View>
                </ImageBackground>
                {this._renderStandardView(anotherType)}
                {this._renderStandardSelectView()}
            </View>

        );
    }

    _renderStandardView(anotherType) {
        if (anotherType) {
            let StandardStyle = {
                backgroundColor:this.state.selectStandard&&!this.state.showStandard?'#e8fbf5':'#f5f5f5',
                borderColor:this.state.selectStandard&&!this.state.showStandard?'#1fdb9b':'#f5f5f5',
                textColor:this.state.selectStandard||this.state.showStandard?'#1fdb9b':'#333',
                tintColor:this.state.selectStandard||this.state.showStandard?'#1fdb9b':'#333',
            }
            let selectTitle = this.state.selectStandard&&!this.state.showStandard&&isNotEmpty(this.state.selectStandardTitle)?this.state.selectStandardTitle:'选择规格'
            return (
                <View style={{paddingVertical:12,paddingLeft:20,backgroundColor:'white'}} >
                    <TouchableOpacity style={{...BaseStyles.centerItem,height:30,width:168,
                                        borderTopLeftRadius:15,
                                        borderTopRightRadius:15,
                                        borderBottomLeftRadius:this.state.showStandard?0:15,
                                        borderBottomRightRadius:this.state.showStandard?0:15,
                                        flexDirection:'row',backgroundColor:StandardStyle.backgroundColor,borderStyle: "solid",borderWidth: 1,borderColor: StandardStyle.borderColor}}
                                        activeOpacity={1}
                                        onPress={()=>{this.showStandardAlert()}}
                                        onLayout={(event)=>{
                                            NativeModules.UIManager.measure(event.target, (x, y, width, height, pageX, pageY) => {
                                                this.marginTop = pageY + height - (Platform.OS === "android" && Platform.Version > 19?StatusBarManager.HEIGHT:0)
                                            });
                                        }}
                                        >
                        <Text style={{color:StandardStyle.textColor,fontSize:12,fontWeight:'500'}}>{selectTitle}</Text>
                        <Image style={{width:10,height:6,marginLeft:2,tintColor:StandardStyle.tintColor,transform:[this.state.showStandard?{rotate:'-180deg'}:{rotate:'0deg'}]}} source={require('../../../img/icon_arrow_down.png')}></Image>
                    </TouchableOpacity>
                </View>
            )
        }
        return null
    }

    _renderStandardSelectView() {

        if (!this.state.showStandard ) {
            return null
        }

        return (
            <Modal animationType={'fade'}
                        visible={true}
                        transparent={true}
                       // ref={(c) => this.modalView = c}
                >
                    <View style={{width:kScreenWidth,height:kScreenHeight}} activeOpacity={1} >
                        <TouchableOpacity style={{height:this.marginTop+this.moveY}} onPress={()=>this.showStandardAlert()}></TouchableOpacity>
                        <View style={[{backgroundColor:'rgba(0,0,0,0.5)',width:kScreenWidth,flex:1}]}>
                                <View style={[{backgroundColor:'#f5f5f5',paddingBottom:0,}]}>
                                    {this._renderSearchView()}
                                    <FlatList
                                        style={{marginTop:10,marginLeft:35,height:200*kScreenScaling,}}
                                        ref={(flatList)=>this._flatList = flatList}
                                        extraData={this.state}
                                        data={this.state.standardArray.filter((item)=>{return item.show})}
                                        numColumns={2}
                                        renderItem={this._renderItem.bind(this)}
                                    />
                                </View>
                                {this._renderBottomView()}
                                <TouchableOpacity style={{flex:1}} onPress={()=>this.showStandardAlert()}></TouchableOpacity>
                        </View>
                    </View>
                </Modal>
        )
    }

    _renderSearchView() {
        return (
            <View style={[BaseStyles.centerItem,{marginHorizontal:0,height:50}]}>
                <View style={{width:kScreenWidth-35*2,height:33,borderRadius:17,backgroundColor:'#ffffff',alignItems:'center',flexDirection:'row',resizeMode:'stretch'}}>
                    <Image style={{width: 16, height: 16, marginLeft:24,marginTop:9,marginBottom:10}}
                            source={require('../../../img/top_bar_search.png')}
                            defaultSource={require('../../../img/top_bar_search.png')}/>
                    <TextInput ref={(searchInput)=>this._searchInput = searchInput}
                                placeholder={'输入规格'}
                                placeholderTextColor="#999"
                                onChange={(event) => this.onChangeText(event.nativeEvent.text)}
                                onChangeText={(text) => {this.onChangeText(text)}}
                                onEndEditing={(event) => this.onEndEditing(event.nativeEvent.text)}
                                onSubmitEditing={(event) => {this.searchClick(event.nativeEvent.text)}}
                                value = {this.state.searchText}
                                returnKeyType={'search'}
                                autoFocus={false}
                                // onFocus={()=>{this._onFocus()}}
                                selectionColor={'#1fdb9b'}
                                underlineColorAndroid='transparent'
                                style={{padding:0,flex:1,marginLeft:5,marginRight:5,fontSize:14}}
                    >
                    </TextInput>
                    {this._renderDelectView()}
                </View>
            </View>
        )
    }

    _renderDelectView() {
        if(isNotEmpty(this.state.searchText)&&this.state.searchText.length>0){
            return (
                <TouchableOpacity activeOpacity={1} onPress = {()=>this._removeKeywords()}>
                        <Image style={{width:16,height:16,resizeMode:'contain',marginRight:5,opacity:0.4}} source={require('../../../img/search_del.png')}/>
                </TouchableOpacity>
            )
        }
        return null
    }

    _renderItem(info) {
        return (
            <TouchableOpacity activeOpacity={1} onPress={()=>{info.item.select = !info.item.select;this.setState({})}} style={{flexDirection:'row',alignItems:'center',paddingVertical:5,flex:1}}>
                {info.item.select?<Image style={{width:19.5,height:13.5}} source={require('../../../img/icon_select_check.png')}></Image>:null}
                <Text style={{color:'#333',fontSize:14}}>{info.item.title}</Text>
            </TouchableOpacity>
        )
    }

    _renderBottomView() {
        return (
            <View
                style={[BaseStyles.centerItem , {height:51,flexDirection:'row'}]}>
                <TouchableOpacity activeOpacity={1} style={[BaseStyles.centerItem,{flex:1,height:51,backgroundColor:'white'}]}
                                  onPress={()=>this._resetMethod()}>
                    <Text style={{color:'#333',fontSize:17}}>重置</Text>
                    <View style={{position:'absolute',top:0,left:0,right:0,height:0.5,backgroundColor:'#ccc'}}></View>
                    <View style={{position:'absolute',bottom:0,left:0,right:0,height:0.5,backgroundColor:'#ccc'}}></View>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={1} style={[{flex:1,height:51}]}
                                  onPress={()=>this._saveMethod()}>
                    <ImageBackground style={[BaseStyles.centerItem,{flex:1,height:51}]} imageStyle={{resizeMode:'stretch'}} source={require('../../../img/filter_bottom_button.png')}>
                        <Text style={{color:'white',fontSize:17}}>确定</Text>
                    </ImageBackground>
                </TouchableOpacity>
            </View>

        );
    }

    _renderPriceCountItem(title,select){

        if (this.props.hasPriceCount){
            return this._renderButtonItem(title,select)
        }

    }

    _renderButtonItem(title,select){

        let is_up = true;
        if(title==='价格'){
            is_up = this.state.priceBtnIsPlus;
        }else if(title==='报价数'){
            is_up = this.state.countBtnIsPlus;
        }
        let type = this.props.hasPriceCount ? '' : 'default';

        return(

            <TouchableOpacity activeOpacity={1} style={[BaseStyles.item,{flex:1}]} hitSlop={{left:0,top:10,bottom:10,right:0}} onPress={() => {

                if(title==='价格'){
                    if (this.props.hasPriceCount){
                        mobClick('search-result-price');
                    }
                    this.state.priceBtnIsPlus = !this.state.priceBtnIsPlus;
                    if (this.state.priceBtnIsPlus){
                        type = 'pricedesc';
                    } else {
                        type = 'priceasc';
                    }
                }else if(title==='报价数'){
                    if (this.props.hasPriceCount){
                        mobClick('search-result-offer');
                    }
                    this.state.countBtnIsPlus = !this.state.countBtnIsPlus;
                    if (this.state.countBtnIsPlus){
                        type = 'shopcountasc';
                    } else {
                        type = 'shopcoundesc';
                    }
                }else if (title === '默认'){
                    if (this.props.hasPriceCount){
                        mobClick('search-result-default');
                    }
                    this.setState(() => ({
                            priceBtnIsPlus: true,
                            countBtnIsPlus: true
                            }
                        )
                    )
                }

                this.setState(() => ({
                            defaultBtnIsCheck: title==='默认',
                            priceBtnIsCheck: title==='价格',
                            countBtnIsCheck: title==='报价数',
                        }
                    )
                )
                if (this.props.refreshData){
                    this.props.refreshData(type);
                }
            }}>
                <Text style={{color: select ? yfwGreenColor() : darkTextColor() , fontSize:14, fontWeight: 'bold'}}>{title}</Text>
                {this._renderOrderImage(is_up,select,title)}
            </TouchableOpacity>
        );


    }


    _renderScreeningItem(){

        if (this.props.hasScreening){
            return (
                <TouchableOpacity activeOpacity={1} style={[BaseStyles.item,{flex:1}]} hitSlop={{left:0,top:10,bottom:10,right:0}} onPress={() => {
                    if (this.props.hasPriceCount){
                        mobClick('search-result-screen');
                    }
                    if (this.props.onScreen){
                        this.props.onScreen();
                    }
                }}>
                    <Text style={{fontSize:14,color:darkTextColor(),fontWeight:'500'}}>筛选</Text>
                    <Image style={{height: 12, width: 12,marginLeft:5, resizeMode: 'contain'}} source={require('../../../img/choose_kind.png')}/>
                </TouchableOpacity>
            );
        }

    }


    _renderOrderImage(is_up,select,title) {
        if(title){
            if(title == '默认'){
                return(<View/>)
            }
        }

        let imagIcon = require("../../../img/order_by_default.png");
        if (select) {
            if (is_up){
                imagIcon = require("../../../img/order_by_minus.png")
            }else{
                imagIcon =  require("../../../img/order_by_plus.png")

            }
        }

        return <Image style={{marginLeft: 5, height: 10, width: 5, resizeMode: 'contain'}} source={imagIcon}/>

    }

    showStandardAlert() {
        this.setState({
            showStandard:!this.state.showStandard
        })
    }

    _removeKeywords(){
        this.state.standardArray.map((item)=>{
            item.show = true
        })
        this.setState({
            searchText:'',
        });
    }
    onChangeText(text){
        this.state.searchTextConfirmed = false
        text = text.replace(EMOJIS,'')
        this.setState({
            searchText:text,
        });
        if (text.length > 0){

        }else {

        }

    }
    searchClick(text){

    }
    onEndEditing(text){
        this.state.standardArray.map((item)=>{
            item.show = isEmpty(text)||(isNotEmpty(text)&&item.title.includes(text))
        })
        this.setState({})
    }

    _resetMethod() {
        this.state.standardArray.map((item)=>{
            item.select = false
            item.show = true
        })
        let selectStandards = []
        this.currentSelectStandard = selectStandards
        this.setState({searchText:'',selectStandardTitle:'',selectStandard:selectStandards.length > 0,})
        this.props.standardChange&&this.props.standardChange(selectStandards.join(','))
    }

    _saveMethod() {
        let selectStandards = []
        this.state.standardArray.map((item,index)=>{
            if (item.select) {
                selectStandards.push(item.title)
            }
        })
        this.currentSelectStandard = selectStandards
        this.setState({
            showStandard:false,
            selectStandard:selectStandards.length > 0,
            selectStandardTitle:(selectStandards.length > 0 )? selectStandards[0]:'',
        })

        this.props.standardChange&&this.props.standardChange(selectStandards.join(','))
    }

    _setSelectStatus(currentSelectStandard) {
        if (isEmpty(currentSelectStandard)) {
            currentSelectStandard = []
        }
        currentSelectStandard = deepCopyObj(currentSelectStandard)
        this.currentSelectStandard = currentSelectStandard
        this.state.standardArray.map((item,index)=>{
            let select = currentSelectStandard.some((info)=>{
                return info == item.title
            })
            item.select = select
        })
        this.setState({
            selectStandard:currentSelectStandard.length > 0,
            selectStandardTitle:(currentSelectStandard.length > 0 )? currentSelectStandard[0]:'',
        })
    }

    _fetchDataFromServer(keywords) {
        if (isEmpty(keywords)) {
            return
        }
        let request = new YFWRequestViewModel()
        let params = new Map()
        params.set('__cmd','guest.medicine.getSearchStandard')
        params.set('keywords',keywords)
        request.TCPRequest(params,(res)=>{
            let currentSelectStandard = this.currentSelectStandard
            if (isEmpty(currentSelectStandard)) {
                currentSelectStandard = []
            }
            currentSelectStandard = deepCopyObj(currentSelectStandard)
            res.result = safeArray(res.result)
            this.setState({
                standardArray:res.result.map((item,index)=>{
                    let select = currentSelectStandard.some((info)=>{
                        return info == item
                    })
                    return {title:item,select:select,show:true}
                })
            })
        },(error)=>{

        },false)

    }

}
