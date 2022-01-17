import React, {Component} from 'react';
import {
    View,  StyleSheet, FlatList, ImageBackground,Platform,NativeModules, TextInput, StatusBar,Image, TouchableOpacity,Text
} from 'react-native';
import {itemAddKey, kScreenWidth, iphoneTopMargin, isNotEmpty, safeArray} from "../../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import YFWToast from "../../Utils/YFWToast";
import YFWWDSearchShopItemVIew from "../Search/View/YFWWDSearchShopItemVIew";
import StatusView from "../../widget/StatusView";
import YFWListFooterComponent from "../../PublicModule/Widge/YFWListFooterComponent";
import YFWWDMySupplierModel from "./Model/YFWWDMySupplierModel";
import { YFWImageConst } from '../Images/YFWImageConst';
import YFWHeaderLeft from '../Widget/YFWHeaderLeft';
import { BaseStyles } from '../../Utils/YFWBaseCssStyle';
import { EMOJIS } from '../../PublicModule/Util/RuleString';
const {StatusBarManager} = NativeModules;

export default class YFWWDAllSupplier extends Component {
    static navigationOptions = ({navigation}) => ({
        header: null,
        tabBarVisible: false,
    });

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            pageIndex:1,
            loading:false,
            showFoot: 2,
            searchText:''
        }
        this.headerH = (Platform.OS === 'ios') ? (44+iphoneTopMargin()-20) + 7 :Platform.Version > 19? 50+StatusBarManager.HEIGHT + 7:50+7
    }

//----------------------------------------------LIFECYCLE-------------------------------------------

    componentWillMount() {

    }

    componentDidMount() {
        this._requestShopData()
    }

    componentWillUnmount() {

    }

//-----------------------------------------------METHOD---------------------------------------------

    _requestShopData() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.whole.app.getSearchShop');
        paramMap.set('pageSize', 10);
        paramMap.set('pageIndex', this.state.pageIndex);
        paramMap.set('shoptype', 3);
        paramMap.set('regionid', 0);
        paramMap.set('keywords', this.state.searchText);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap , (res)=>{
            console.log(JSON.stringify(res))
                this.statusView&&this.statusView.dismiss();
                let showFoot = 0;
                let responseArray = YFWWDMySupplierModel.getAllSupplierArray(safeArray(res.result.dataList));
                if (this.state.pageIndex === 1 && responseArray.length === 0) {
                    this.statusView&&this.statusView.showEmptyWIthTips('暂无数据');
                    return;
                }
                if(responseArray.length < 10){
                    showFoot = 1;
                }
                responseArray = itemAddKey(responseArray, this.state.pageIndex.toString());
                this.setState({
                    data: this.state.pageIndex === 1 ? responseArray : this.state.data.concat(responseArray),
                    loading:false,
                    showFoot:showFoot,
                });
            },
            (error)=>{
                this.statusView&&this.statusView.showNetError();
                if(error&&error.msg){
                    YFWToast(error.msg)
                }
            },false)

    }

    _onRefresh(){
        this.state.pageIndex = 1;
        this.setState({
            loading:true
        });
        this._requestShopData();

    }

    _onEndReached(){

        if(this.state.showFoot != 0 ){
            return ;
        }
        this.state.pageIndex ++;
        this.setState({
            showFoot:2
        });
        this._requestShopData();

    }
//-----------------------------------------------RENDER---------------------------------------------
    _renderListItem = (item) => {
        item.item.index = item.index;
        return (
            <YFWWDSearchShopItemVIew model = {item.item} navigation = {this.props.navigation} />)
    }

    _renderFooter(){
        return <YFWListFooterComponent showFoot={this.state.showFoot}/>
    }

    render() {
        return (
            <View style={[style.center, { flex: 1, width: kScreenWidth, backgroundColor: '#fafafa' }]}>
                {this._renderSearchHeader()}
                <View style={{ flex: 1 }}>    
                    <FlatList
                        ref={(flatList)=>this._flatList = flatList}
                        style={{flex:1, width:kScreenWidth-12,marginTop:10}}
                        extraData={this.state}
                        data={this.state.data}
                        numColumns={1}
                        onRefresh={() => this._onRefresh()}
                        refreshing={this.state.loading}
                        renderItem = {this._renderListItem.bind(this)}
                        ListFooterComponent={this._renderFooter.bind(this)}
                        ListEmptyComponent={this._emptyView.bind(this)}
                        onEndReached={this._onEndReached.bind(this)}
                        onEndReachedThreshold={0.1}
                        keyboardShouldPersistTaps={'always'}
                    />
                    <StatusView ref={(m)=>{this.statusView = m}} retry={()=>{
                        this.setState({pageIndex:1});
                        this._requestShopData();
                    }}/>
                </View>
            </View>
        )
    }

    _emptyView() {
        return (
            <View style={{flex:1, justifyContent:'center', alignItems:'center', paddingTop:20}}>
                <Text style={{fontSize:12, color:'#999999'}}>暂无数据</Text>
            </View>)
    }

    _renderSearchHeader(){
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
                                        placeholder={''}
                                        placeholderTextColor="#cccccc"
                                        onChange={(event) => this.onChangeText(event.nativeEvent.text)}
                                        onChangeText={(text) => {this.onChangeText(text)}}
                                        onSubmitEditing={(event) => {this.searchClick(event.nativeEvent.text)}}
                                        value = {this.state.searchText}
                                        returnKeyType={'search'}
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
        )

    }

    _renderSearchTitleAndIcon(){
        return(<View style={{height:34,width:61,paddingRight:13,paddingLeft:17}} >
                <TouchableOpacity style={[BaseStyles.centerItem,{flex:1}]} onPress={()=>this.searchClick()}>
                    <Text style={{fontSize:15,color:'#ffffff',}}>搜索</Text>
                </TouchableOpacity>
            </View>)
        }


    _renderDeletIcon() { 
        if (isNotEmpty(this.state.searchText) && this.state.searchText.length > 0) {
            return(<TouchableOpacity activeOpacity={1} onPress = {()=>this._removeKeywords()}>
                <Image style={{width:16,height:16,resizeMode:'contain',marginRight:5,opacity:0.4}} source={YFWImageConst.Btn_input_del}/>
            </TouchableOpacity>)
        }
    }

    _removeKeywords() { 
        this.setState({
            searchText:'',
        });
    }

    onChangeText(text) { 
        text = text.replace(EMOJIS,'')
        this.setState({
            searchText:text,
        });
    }

    searchClick() { 
        this.state.pageIndex = 1
        this.state.data = []
        this._requestShopData()
    }

}

const style = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    }
});