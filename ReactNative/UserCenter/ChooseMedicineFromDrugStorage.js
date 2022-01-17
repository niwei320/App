import React from 'react'
import {
    View,
    Dimensions,
    FlatList,
    Platform,
    TouchableOpacity,
    Text,
    Image,
    TouchableWithoutFeedback
} from 'react-native'


const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
import ChooseMedicineDrugStorageHead from './View/ChooseMedicineDrugStorageHead'
import YFWRequestViewModel from '../Utils/YFWRequestViewModel'
import YFWListFooterComponent from '../PublicModule/Widge/YFWListFooterComponent'
import {itemAddKey, isNotEmpty, safe, tcpImage} from '../PublicModule/Util/YFWPublicFunction'
import YFWEmptyView from '../widget/YFWEmptyView'
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import RNFS from 'react-native-fs';
import YFWNativeManager from "../Utils/YFWNativeManager";
import YFWShopDetailGoodsListModel from "../FindYao/Model/YFWShopDetailGoodsListModel";
import YFWUserInfoManager from '../Utils/YFWUserInfoManager';
export default class ChooseMedicineFromDrugStorage extends React.Component {

    static navigationOptions = ({navigation}) => ({
        header: null,
        tabBarVisible: false,
    });

    constructor(props) {
        super(props)
        this.state = {
            pageIndex: 1,
            loading: false,
            showFoot: 2,
            dataArray: [],
            isAfterSearch: false,
            keyWord: undefined,
            historyWords:[]
        }
    }

    componentDidMount(){
        this._readHistory()
    }

    _readHistory(){
        const path = RNFS.DocumentDirectoryPath + '/addDrugMeidcine.txt';

        return RNFS.readFile(path)
            .then((result) => {
                const dataArray = result.split("\r\n");
                dataArray.splice(dataArray.length - 1, 1);
                let data =this._dataHandling(dataArray);
                this.setState({
                    historyWords: data,
                })
            })
            .catch((err) => {
                console.log(err.message);
            });
    }


    _dataHandling(dataArray) {
        if (isNotEmpty(dataArray) && dataArray.length > 0) {
            var temp = [];
            for (let i = 0; i < dataArray.length; i++) {
                let data = dataArray[i]//将item转换成json对象
                let added = false;
                for (let j = 0; j < temp.length; j++) {
                    if (data == temp[j]) {
                        added = true
                    }
                }
                if (!added) {
                    temp.push(data)
                }
            }
            return temp;
        }
    }


    render() {
        return (
            <View style={{width:width,height:height,backgroundColor:'#F5F5F5'}}>
                <ChooseMedicineDrugStorageHead navigation={this.props.navigation}
                                               searchMedicien={(keyWord)=>this._searchMedicien(keyWord)} ref = 'search_head'/>
                {this._renderContentView()}
            </View>
        )
    }

    writeFileHistory(text) {
        // create a path you want to write to
        const path = RNFS.DocumentDirectoryPath + '/addDrugMeidcine.txt';
        return RNFS.appendFile(path, text + '\r\n', 'utf8')
            .then((success) => {
            })
            .catch((err) => {
            });

    }


    _searchMedicien(keyWord) {
        this.state.keyWord = keyWord;
        this.state.isAfterSearch = true;
        this.requestMedicineMessage(keyWord);
        this.writeFileHistory(keyWord)
    }

    requestMedicineMessage(keyWord) {

        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.medicine.getSearchPageData');
        paramMap.set("ip",YFWUserInfoManager.ShareInstance().deviceIp)//设备IP
        paramMap.set('pageIndex', this.state.pageIndex);
        paramMap.set('pageSize', 10);
        paramMap.set("keywords", keyWord);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            let showFoot = 0;
            let dataArray = []
            if (isNotEmpty(res.result)&&isNotEmpty(res.result.dataList)) {
                dataArray = YFWShopDetailGoodsListModel.getModelArray(res.result.dataList);
            }
            if (dataArray.length === 0) {
                showFoot = 1;
            }
            if (this.state.pageIndex > 1) {
                dataArray = this.state.dataArray.concat(dataArray);
            }
            dataArray = itemAddKey(dataArray);
            this.setState({
                dataArray: dataArray,
                loading: false,
                showFoot: showFoot,
            });
        });

    }

    _splitView() {
        return (<View style={{width:width-10,height:1,marginLeft:10,backgroundColor:'#F5F5F5'}}></View>)
    }

    _renderItem = (item)=> {
        return (
            <View style={{width:width-15,marginLeft:10,height:100,padding:10,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                <Image style={{width:60,height:60,resizeMode:'contain'}} source={{uri:tcpImage(item.item.img_url)}}/>
                <View style={{marginLeft:20,justifyContent:'center',height:60,flex:1}}>
                    <Text style={{color:"#333333",fontSize:14,}} numberOfLines={1}>{item.item.title}</Text>
                    <Text style={{color:"#999999",fontSize:12,marginTop:10}} numberOfLines={2}>{item.item.applicability.replace('<\p>', '').replace('</p>', '')}</Text>
                </View>
                <TouchableWithoutFeedback onPress = {()=>this._addMedicienToDrugList(item.index)} >
                    <View style={{width:80,alignItems:'flex-end'}}>
                        <Text style={{borderColor:'#16c08e',borderWidth:1,paddingLeft:13,paddingRight:13,paddingTop:3,paddingBottom:3,fontSize:14,color:'#16c08e'}}>添加</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>)
    }

    _renderFooter() {
        return <YFWListFooterComponent showFoot={this.state.showFoot}/>
    }

    _onEndReached() {
        if (this.state.showFoot != 0) {
            return;
        }
        this.state.pageIndex++;
        this.setState({
            showFoot: 2
        });
        this.requestMedicineMessage(this.state.keyWord);
    }

    _renderContentView() {
        if (this.state.isAfterSearch) {
            if (this.state.dataArray.length > 0) {
                return (<FlatList style={{width:width,backgroundColor:'#FFF'}}
                                  ItemSeparatorComponent={this._splitView}
                                  data={this.state.dataArray}
                                  renderItem={this._renderItem}
                                  keyExtractor={(item, index) => item.key}
                                  listKey={(item, index) => item.key}
                                  ListFooterComponent={this._renderFooter.bind(this)}
                                  onEndReached={this._onEndReached.bind(this)}
                                  onEndReachedThreshold={0.1}>

                </FlatList>)
            } else {
                return (<View style={{width:width,height:(Platform.OS === 'ios') ? height-116 : height-100}}>
                    <YFWEmptyView title="暂无内容"/>
                </View>)
            }
        } else {
            return (<View
                style={{width:width,height:(Platform.OS === 'ios') ? height-116 : height-100,backgroundColor:'#F5F5F5'}}>
                {this._renderHistoryView()}
            </View>)
        }
    }

    _renderHistoryView(){

        if (this.state.historyWords.length > 0){

            return(
                <View >
                    <View style={[BaseStyles.leftCenterView,{height:50,width:width-25}]}>
                        <Text style={[BaseStyles.titleWordStyle,{fontWeight:'bold',marginLeft:10}]}>历史搜索</Text>
                        <View style={{flex:1}}/>
                        <TouchableWithoutFeedback style={[BaseStyles.centerItem,{width:40,height:40}]}
                                          onPress={()=>this.clearHistoryMethod()}>
                            <Image style={{height:12,width:12,resizeMode: "contain"}} source={require('../../img/ico_dustbin.png')}/>
                        </TouchableWithoutFeedback>
                    </View>
                    <View style={{flexDirection:'row', flexWrap:'wrap'}}>
                        {this._renderHistoryItem()}
                    </View>
                </View>
            );

        }

    }

    _renderHistoryItem(){
        var allBadge = [];
        let historyArray = this.state.historyWords;
        for (var i=0;i<historyArray.length;i++){
            let badge = historyArray[i];
            allBadge.push(
                <TouchableOpacity key={'history'+i} style={{marginLeft:10,marginTop:8}}  onPress={()=>this.clickHistoryItemMethod(badge)}>
                    <View style={{borderWidth:0.5,borderRadius:2,borderColor:'#bbb'}}>
                        <Text style={[BaseStyles.contentWordStyle,{marginLeft:10,marginRight:10,marginTop:7,marginBottom:7}]}>
                            {badge.showType =  '商品'}  {badge}
                        </Text>
                    </View>
                </TouchableOpacity>

            );
        }
        return allBadge;
    }

    clickHistoryItemMethod(text){
        this.refs.search_head._setKeyWord(text);
        this._searchMedicien(text)
    }



    clearHistoryMethod(){
        const path = RNFS.DocumentDirectoryPath + '/addDrugMeidcine.txt';
        return RNFS.unlink(path)
            .then(() => {
                this.setState({
                    historyWords: []
                })
            })
            .catch((err) => {
            });
    }


    _addMedicienToDrugList(index) {
        YFWNativeManager.mobClick('account-drug reminding-info-add from drug store-search-add');
        let dataItem =  this.state.dataArray[index];
        let {goBack} = this.props.navigation
        this.props.navigation.state.params.state.callback(dataItem);
        goBack();
    }
}
