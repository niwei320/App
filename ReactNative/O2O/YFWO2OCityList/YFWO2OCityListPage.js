import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    DeviceEventEmitter,
    TextInput,
    Platform,
    Keyboard, FlatList, Alert,
} from 'react-native';
import {
    adaptSize,
    darkStatusBar,
    dismissKeyboard_yfw,
    getFirstLetterPinYin,
    getStatusBarHeight,
    isEmpty,
    isNotEmpty,
    kScreenHeight,
    kScreenWidth, objToStrMap,
    safe,
    safeArray,
    safeObj,
    strMapToObj
} from "../../PublicModule/Util/YFWPublicFunction";
import YFWNativeManager from "../../Utils/YFWNativeManager";
import YFWToast from "../../Utils/YFWToast";
import {LargeList} from "react-native-largelist-v3";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import {
    getItem,
    kO2OCityListCacheData,
    kO2OCitySearchHistoryKeyword, kSearchHistoryKey,
    LOGIN_TOKEN, removeItem,
    setItem
} from "../../Utils/YFWStorage";

export default class YFWO2OCityListPage extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            isKeyboardShow: false,
            searchText: '',
            searchResult: [],
            cityListArray: [],
            cityListSectionArray: [],
            historyItem: new Map()
        }
    }

//----------------------------------------------LIFECYCLE-------------------------------------------

    UNSAFE_componentWillMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
    }

    componentDidMount() {
        darkStatusBar()
        YFWNativeManager.getLocationAddress((location)=>{
            this.setState({location:location})
        })
        this._initData()
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

//-----------------------------------------------METHOD---------------------------------------------
    _keyboardDidShow(){
        this.setState({
            isKeyboardShow:true
        })
        this._searchData(this.state.keyword)
    }

    _keyboardDidHide(){
        this.setState({
            isKeyboardShow:false
        })
    }

    _textChange(text){
        this.setState({
            searchText:text
        })
        this._searchData(text)
    }

    _initData(){
        DeviceEventEmitter.emit('LoadProgressShow');
        getItem(kO2OCityListCacheData).then((data)=> {
            if(isNotEmpty(data?.cityListArray) && isNotEmpty(data?.cityListSectionArray)){
                this.setState({
                    cityListArray:safeArray(data?.cityListArray),
                    cityListSectionArray:safeArray(data?.cityListSectionArray),
                })
            } else {
                this._fetchAllData()
            }
        }).catch(error=>{
            this._fetchAllData()
        })

        getItem(kO2OCitySearchHistoryKeyword).then(data=>{
            if(isNotEmpty(data)){
                this.setState({
                    historyItem:objToStrMap(data)
                })
            }
            DeviceEventEmitter.emit('LoadProgressClose');
        })
    }

    _fetchAllData(){
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.common.app.oto.getAllDistrictPath');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            if(safeArray(res.result).length > 0){
                let data = [];
                let sectionData = [];
                let dataMap = new Map();
                res.result.map((item,index)=>{
                    let key = getFirstLetterPinYin(item?.region_name).charAt(0);
                    item.key = key
                    if(dataMap.has(key)){
                        dataMap.get(key).push(item)
                    } else {
                        dataMap.set(key,[item])
                    }
                })
                sectionData = [...dataMap.keys()]
                sectionData = sectionData.sort(function(a,b){
                    return a.charCodeAt() - b.charCodeAt()
                })
                for (let i = 0; i < sectionData.length; i++) {
                    data.push({ items: safeArray(dataMap.get(sectionData[i])) });
                }
                this.setState({
                    cityListArray:data,
                    cityListSectionArray:sectionData
                })
                setItem(kO2OCityListCacheData,{
                    cityListArray:data,
                    cityListSectionArray:sectionData
                })
            }
        }, (res) => {
        }, true);
    }

    _searchData(text){
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.common.app.oto.getAllDistrictPath');
        paramMap.set('type', 'search');
        paramMap.set('region_name', text);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            this.setState({
                searchResult:safeArray(res?.result)
            })
        }, (res) => {
        }, false);
    }

    _scrollToIndex(index){
            this._sectionList && this._sectionList.scrollToIndexPath({section:index, row:-1},true)
    }

    _onClick(item){
        if(isNotEmpty(item.region_name) ){
            let {historyItem} = this.state
            this.props.navigation.state.params?.state?.callback
            && typeof this.props.navigation.state.params?.state?.callback == 'function'
            && this.props.navigation.state.params.state.callback(item)
            if(historyItem instanceof Map && !historyItem.has(item.regionid+'')){
                historyItem.set(item.regionid, item)
                this.setState({})
                setItem(kO2OCitySearchHistoryKeyword, strMapToObj(historyItem)).then(()=>{
                    this.props.navigation.goBack();
                })
            } else {
                this.props.navigation.goBack();
            }
        }
    }

    _historyClear(){
        Alert.alert('','是否全部删除搜索历史',[
            {
                text:'确定',
                onPress:()=>{
                    removeItem(kO2OCitySearchHistoryKeyword);
                    this.setState({
                        historyItem:new Map()
                    });
                }},
            {
                text:'取消',
                onPress:()=>{}
            }
        ])
    }

//-----------------------------------------------RENDER---------------------------------------------
    _renderHeader(){
        let {searchText} = this.state
        return (
            <View
                style={{
                    flexDirection:'row',
                    alignItems:'center',
                    marginTop:getStatusBarHeight(),
                    paddingRight:adaptSize(11),
                    height:adaptSize(50)}}
            >
                <TouchableOpacity
                    style={{width:adaptSize(50),height:adaptSize(40), justifyContent:'center', alignItems:'center'}}
                    onPress={()=>{
                        dismissKeyboard_yfw();
                        this.props.navigation.goBack()
                        DeviceEventEmitter.emit('LoadProgressClose');
                    }}
                >
                    <Image style={{width:adaptSize(11),height:adaptSize(19),resizeMode:'stretch'}}
                         source={ require('../../../img/top_back_green.png')}/>
                </TouchableOpacity>
                <View
                    style={{
                        flex:1,
                        flexDirection:'row',
                        alignItems:'center',
                        height: adaptSize(33),
                        borderRadius: adaptSize(17),
                        backgroundColor: "#f5f5f5",
                        paddingHorizontal:adaptSize(25)}}
                >
                    <Image style={{position:'absolute',left:adaptSize(10),width: adaptSize(13), height: adaptSize(13), resizeMode: 'contain',}}
                           source={require('../../../img/top_bar_search.png')} />
                    <TextInput
                        style={{flex:1,fontSize:adaptSize(14)}}
                        placeholderTextSize
                        placeholderTextColor="#ccc"
                        placeholder="输入城市名进行搜索"
                        value={searchText}
                        onChangeText={this._textChange.bind(this)}
                    />
                    {isNotEmpty(searchText)?
                        <TouchableOpacity
                            hitSlop={{left:10,top:10,bottom:10,right:0}}
                            activeOpacity={1}
                            style={{position:'absolute',right:adaptSize(10)}}
                            onPress={() => {this._textChange('')}}
                        >
                            <Image style={{ width: adaptSize(13), height: adaptSize(13), resizeMode: 'contain',}} source={require('../../../img/search_del.png')} />
                        </TouchableOpacity>:<></>
                    }
                </View>
            </View>
        )
    }

    _renderLocationAddress() {
        let {location} = this.state
        return (
            <TouchableOpacity onPress={()=>{
                if(isNotEmpty(location?.city)){
                    this._onClick({region_name:location.city,})
                }
            }}>
                <View style={{width:kScreenWidth,height:adaptSize(60),paddingVertical:adaptSize(10),backgroundColor:'#fff', paddingHorizontal:adaptSize(13)}}>
                    <View style={{flexDirection:'row',alignItems:'center',paddingLeft:adaptSize(21)}}>
                        <Image style={{position:'absolute',left:0,width: adaptSize(15), height: adaptSize(15), resizeMode: 'contain',}}
                               source={require('../../../img/icon_location_point.png')} />
                        <Text style={{fontSize: adaptSize(12), color: "#666666"}}>当前定位</Text>
                        <Text style={{fontSize: adaptSize(16),fontWeight:'bold',color: "#333333", marginLeft:adaptSize(14)}}>{location?.city??'...'}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    _renderHistory() {
        let {historyItem} = this.state
        if(historyItem.size === 0 || typeof(historyItem.values) != "function"){
            return <></>
        }
        let views = []
        safeArray([...historyItem.values()]).map((item, index)=>{
            views.push(this._renderHistoryItem(item, index))
        })
        return (
            <View>
                <View style={{width:kScreenWidth,height:1,backgroundColor:'#f5f5f5'}}/>
                <View style={{height:adaptSize(35),alignItems:'center',flexDirection:'row',justifyContent:'space-between', paddingHorizontal:adaptSize(12)}}>
                    <Text style={{fontSize: adaptSize(12), color: "#666666"}}>历史搜索城市</Text>
                    <TouchableOpacity style={{width:adaptSize(20), height:adaptSize(17)}}
                                      hitSlop={{left:10,top:15,bottom:15,right:10}}
                                      onPress={()=>{this._historyClear()}}>
                        <Image style={{ height: adaptSize(17), width: adaptSize(14), resizeMode: 'stretch' }}
                               source={require('../Image/deleteAll_icon.png')} />
                    </TouchableOpacity>
                </View>
                <View style={{paddingBottom:adaptSize(15),flexWrap:'wrap', flexDirection:'row', paddingHorizontal:adaptSize(12)}} >
                    {views}
                </View>
            </View>
        )
    }

    _renderHistoryItem(item, index) {
        return (
            <TouchableOpacity
                onPress={()=>{this._onClick(item)}}
                key={'item' + index}
                style={{
                    borderRadius: adaptSize(3),
                    backgroundColor: "#f5f5f5",
                    paddingHorizontal:adaptSize(5),
                    marginHorizontal:adaptSize(8),
                    marginBottom:adaptSize(10),
                    height:adaptSize(34),
                    width:adaptSize(90),
                    justifyContent:'center',
                    alignItems:'center'
                }}
            >
                <Text style={{fontSize: adaptSize(14), color: "#666666",}} numberOfLines={1}>{item?.region_name}</Text>
            </TouchableOpacity>
        )
    }

    _renderSectionHeader = (section: number) => {
        let {cityListSectionArray} = this.state
        return (
            <View style={[BaseStyles.leftCenterView,{height:adaptSize(20), paddingLeft:adaptSize(10), backgroundColor:'#fff'}]}>
                <Text style={{fontSize:adaptSize(12),color:'#666666'}}>{cityListSectionArray[section]}</Text>
            </View>
        );

    }

    _renderListItem = (value) => {
        let {cityListArray} = this.state
        let item = cityListArray[value.section]?.items[value.row]
        return (
            <TouchableOpacity onPress={()=>{this._onClick(item)}} style={{height:adaptSize(45),marginHorizontal:adaptSize(12), paddingHorizontal:adaptSize(8),borderBottomWidth:1,borderColor: '#bfbfbf', justifyContent:'center'}}>
                 <Text style={{fontSize: adaptSize(14), color: "#666666"}}>{item?.region_name}</Text>
            </TouchableOpacity>
        );

    }

    _renderIndexView(){
        let {cityListSectionArray} = this.state
        if (!cityListSectionArray||cityListSectionArray.length===0) {
            return null
        }
        let indexs = []
        cityListSectionArray.map((item,index)=>{
            indexs.push(
                <TouchableOpacity key={'index'+index} hitSlop={{top:0,left:15,bottom:0,right:5}} onPress={()=>{this._scrollToIndex(index)}}>
                    <Text style={{color:'white',fontSize:12,lineHeight:15,textAlign:'center'}}>{cityListSectionArray[index]}</Text>
                </TouchableOpacity>
            )
        })

        return (
            <TouchableOpacity activeOpacity={1} onPress={()=>{}} hitSlop={{right:40}} style={{position:'absolute',width:30,height:kScreenHeight,top:0,right:2,alignItems:'center',justifyContent:"center"}}>
                <View style={{backgroundColor:'#aaa',width:22,borderRadius:11, paddingVertical:11}}>
                    {indexs}
                </View>
            </TouchableOpacity>
        )
    }

    _renderSearchResultView(){
        let {isKeyboardShow,searchResult} = this.state
        let isShowList = safeArray(searchResult).length > 0
        return (
            <>
                {isKeyboardShow || isShowList ?
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={()=>{dismissKeyboard_yfw()}}
                        style={{flex:1,position:'absolute',top:getStatusBarHeight()+adaptSize(50),height:kScreenHeight-getStatusBarHeight()-adaptSize(50),width:kScreenWidth,backgroundColor:isShowList?'#f5f5f5':'rgba(0,0,0,0.5)'}}
                    >
                        {isShowList?
                            this._renderCityList(searchResult)
                            :<></>
                        }
                    </TouchableOpacity>
                    :<></>
                }
            </>
        )
    }

    _renderCityList(data){
        return (
            <View style = {{paddingTop:1,flex:1}}>
                {safeArray(data).length === 0?
                    <></>
                    :
                    <FlatList
                        data={data}
                        keyboardShouldPersistTaps={'always'}
                        keyboardDismissMode={'on-drag'}
                        keyExtractor={(item, index)=>{return index+'Item'}}
                        renderItem={(item)=>this._renderCityItem(item)}
                    />
                }
            </View>
        )
    }

    _renderCityItem(item){
        return (
            <TouchableOpacity onPress={()=>{this._onClick(item.item)}} style={{height:adaptSize(50), backgroundColor:'#fff', marginTop:1, paddingLeft:adaptSize(12), justifyContent:'center'}}>
                <Text style={{fontsize:adaptSize(14),color:'#333'}}>{item?.item?.region_name}</Text>
            </TouchableOpacity>
        )
    }

    render() {
        let data = this.state.cityListArray
        return (
            <View style = {{flex: 1, backgroundColor:'#fff'}}>
                {this._renderHeader()}
                <LargeList
                    renderHeader={()=>{
                        return (
                            <>
                                {this._renderLocationAddress()}
                                {this._renderHistory()}
                            </>
                        )
                    }}
                    bounces={false}
                    ref={(list)=>this._sectionList = list}     //后面在滚动时，用它来做标识，明确操作的是哪一个
                    data={data}         //传入的数据
                    // numberOfSections={()=>this.state.groupArray?this.state.groupArray.length:0}    //本数据中有多少个组
                    // numberOfRowsInSection={section => this.state.groupArray[section].data?this.state.groupArray[section].data.length:0}    //某一组中，有多少条数据
                    renderSection={this._renderSectionHeader.bind(this)}           //组名的渲染方法
                    renderIndexPath={this._renderListItem.bind(this)}                //组内数据的渲染方法
                    heightForIndexPath={()=>adaptSize(45)}            //渲染每一条数据时，所占的高是多少
                    heightForSection={()=>adaptSize(20)}      //渲染时，每个组名所占的高是多少
                />
                {this._renderIndexView()}
                {this._renderSearchResultView()}
            </View>
        )
    }

}
