/**
 * Created by 12345 on 2018/4/20.
 */
import React, {Component} from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity,
    StyleSheet, Platform, ImageBackground, NativeModules
} from 'react-native';
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import YFWToast from "../../Utils/YFWToast";
import {
    backGroundColor,
    yfwGreenColor,
    darkLightColor,
    darkNomalColor,
    darkTextColor,
    separatorColor
} from "../../Utils/YFWColor";
import {
    iphoneTopMargin,
    isNotEmpty,
    itemAddKey,
    kScreenWidth,
    safe,
    isEmpty,
    iphoneBottomMargin,
    isAndroid, safeArray
} from "../Util/YFWPublicFunction";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import YFWFilterBoxDetailView from './YFWFilterBoxDetailView'
import YFWNativeManager from '../../Utils/YFWNativeManager'
import LinearGradient from "react-native-linear-gradient";

const {StatusBarManager} = NativeModules;

export default class YFWFilterBoxView extends Component {


    static defaultProps = {
        category_id: '',
        keywords: '',
        paramJson: {},
    }

    constructor(props, context) {

        super(props, context);
        this.state = {
            selectName: isNotEmpty(props.paramJson?.selectName) ? props.paramJson.selectName : [],
            selectForm: isNotEmpty(props.paramJson?.selectForm) ? props.paramJson.selectForm : [],
            selectStand: isNotEmpty(props.paramJson?.selectStand) ? props.paramJson.selectStand : [],
            selectProduce: isNotEmpty(props.paramJson?.selectProduce) ? props.paramJson.selectProduce : [],

            showDetail: false,
            selectDataArray: [],
            DrugNameDataArray:[],//商品名/品牌
            ManufacturerDataArray:[],//厂家
            StandardDataArray:[],//规格
            selectTitle: '',
            selectIndex: 0,
        }

        this.isFormWD = !(this.props.from === 'YFWSearchDetailListView'||this.props.from === 'YFWSubCategoryController')
    }

    componentDidMount(){


        this._requestSelectItem(0)
        this._requestSelectItem(1)
        if (this.props.from == "YFWSearchDetailListView") {
            this._requestSelectItem(2)
        }

    }


    /*
    *  {this._renderDrawerContentItem('规格', this.state.selectStand.join(), ()=> {
     this._requestSelectItem(2);
     })}
     {
     this._renderDrawerContentItem('剂型', this.state.selectProduce.join(), ()=> {
     this._requestSelectItem(3);
     })}*/

    render() {

        if (this.state.showDetail) {

            var selectData = this.getSelectDataArray(this.state.selectIndex)
            let originDataArray = this.getOriginDataArray()

            return (
                <View style={{flex:1,backgroundColor:'white'}}>
                    <YFWFilterBoxDetailView dataArray={originDataArray} title={this.state.selectTitle}
                                        backMethod={()=>{this.setState({showDetail:false}) }}
                                        saveMethod={(array)=>this._detailSaveBackMethod(array)}
                                        selectData={selectData} from={this.props.from}/>
                    {this._renderBottomView()}
                </View>

            );

        } else {
            let headerH = (Platform.OS === 'ios') ? (7 + iphoneTopMargin() - 20) : 29;

            return (
                <View style={{flex: 1, backgroundColor: 'white'}}>
                    <View style={{height:headerH}}/>
                    {
                        this._renderDrawerContentItemTwo('商品名/品牌', this.state.DrugNameDataArray, 0,3)
                    }
                    <View style={{height:30}}/>
                    {
                        this._renderDrawerContentItemTwo('厂家', this.state.ManufacturerDataArray, 1,2,9)
                    }
                    <View style={{height:30}}/>
                    {
                        this.props.from == 'YFWSearchDetailListView'?this._renderDrawerContentItemTwo('规格', this.state.StandardDataArray, 2,2,17):null
                    }
                    <View style={{flex:1}}/>
                    {this._renderBottomView()}
                </View>
            )
        }
    }

    _renderDrawerContentItemTwo(title, dataArray,typeIndex,lineCount,maxTextLength) {

        if (isEmpty(lineCount) || isNaN(parseInt(lineCount)) || parseInt(lineCount) <= 0) {
            lineCount = 3
        }
        if (isEmpty(maxTextLength) || isNaN(parseInt(maxTextLength)) || parseInt(maxTextLength) <= 0) {
            maxTextLength = 4
        }
        let views = []
        let copyedArray = dataArray.slice()
        let maxCount = lineCount * 3
        if (copyedArray.length > maxCount) {
            copyedArray = copyedArray.slice(0,maxCount-1)
            copyedArray.push({title:'查看全部...',typeIndex:typeIndex,typeTitle:title,id:'noID'})
        }

        let selectData = this.getSelectDataArray(typeIndex)
        let fatherViewMarginH = 8
        let viewMargin = 5
        let themeBorderColor = this.isFormWD?"#416dff":'#1fdb9b'
        let themeBgColor = this.isFormWD?"#f4f6ff":'#e8fbf5'
        //kScreenWidth*0.8是整个view的宽度
        let viewWidth = parseInt((kScreenWidth*0.8 - fatherViewMarginH*2-viewMargin*2*lineCount)/lineCount)
        copyedArray.map((item,index)=>{
            let isSelect = this._includeItem(item,selectData)
            let title = this.getItemTitle(item)
            let bgColor = item.title=='查看全部...'?'white':isSelect?themeBgColor:'#fafafa'
            let borderColor = isSelect?themeBorderColor:item.title=='查看全部...'?'#999':'#fafafa'
            let textColor = isSelect?themeBorderColor:'#333'
            if (title&&title.length > maxTextLength) {
                title = title.substr(0,maxTextLength) + '...'
            }
            views.push(
                <TouchableOpacity activeOpacity={1}
                                onPress={()=>{this.changeStatus(item,typeIndex)}}
                                style={{backgroundColor:bgColor,borderColor:borderColor,borderWidth:1,height:30,width:viewWidth,justifyContent:'center',alignItems:'center',margin:viewMargin,borderRadius:15}}>
                    <Text style={[{color:textColor,fontSize:13,textAlign:'center',lineHeight:isAndroid()?undefined:14,width:viewWidth}]}
                                numberOfLines={1}>{title}</Text>
                </TouchableOpacity>
            )
        })

        return (
            <View >
                <Text style={[{marginLeft:18,color:'#333',fontSize:15,lineHeight:16,fontWeight:'bold'}]}>{title}</Text>
                <View style={[{marginHorizontal:fatherViewMarginH,flexDirection:'row',flexWrap:'wrap',marginTop:12}]}>
                    {views}
                </View>
            </View>
        );
    }

    getItemTitle(item){
        let value;
        if (this.props.from == 'YFWSubCategoryController' || this.props.from == "YFWWDSubCategoryList") {
            if (isNotEmpty(item.short_title)) {
                value = item.short_title
            } else if (isNotEmpty(item.title)) {
                value = item.title
            }
            else if (isNotEmpty(item.trochetype)) {
                value = item.trochetype
            } else if (isNotEmpty(item.aliascn)) {
                value = item.aliascn
            }
        } else {
            if (typeof item == 'string') {
                value = item;
            } else if (isNotEmpty(item.short_title)) {
                value = item.short_title
            } else if (isNotEmpty(item.title)) {
                value = item.title
            } else {
                value = item.name;
            }
        }
        return value
    }

    getSelectDataArray(typeIndex){
        let selectData = []
        if (typeIndex == 0) {
            selectData = this.state.selectName;
        } else if (typeIndex == 1) {
            selectData = this.state.selectForm;
        } else if (typeIndex == 2) {
            selectData = this.state.selectStand;
        } else if (typeIndex == 3) {
            selectData = this.state.selectProduce;
        }
        return selectData
    }

    getOriginDataArray(){
        let dataArray = []
        if (this.state.selectIndex == 0) {
            dataArray = this.state.DrugNameDataArray;
        } else if (this.state.selectIndex == 1) {
            dataArray = this.state.ManufacturerDataArray;
        } else if (this.state.selectIndex == 2) {
            dataArray = this.state.StandardDataArray;
        } else if (this.state.selectIndex == 3) {
            dataArray = this.state.selectDataArray;
        }
        return dataArray
    }

    changeStatus(item,typeIndex){
        if (item.title == '查看全部...') {
            this.setState({
                showDetail:true,
                selectIndex:item.typeIndex,
                selectTitle:item.typeTitle,
            })
        } else {
            let selectData = this.getSelectDataArray(typeIndex)
            this.selectItem(item,selectData)
            this.setState({})
        }
    }

    selectItem(item,selectData){
        if (this.props.from == 'YFWSearchDetailListView'||this.props.from == 'YFWWDSearchDetailListView') {
            // if (this._includeItem(item.title,selectData)) {
            //     selectData.splice(selectData.findIndex(x => x === item.title), 1)
            // } else {
            //     selectData.push(item.title);
            // }
            if (this._includeItem(item,selectData)) {
                selectData.splice(selectData.findIndex(x => x === item), 1)
            } else {
                selectData.push(item);
            }
        } else {
            if (this._includeItem(item,selectData)) {
                let index =  this._getIndexInArray(item,selectData);
                selectData.splice(index, 1)
            } else {
                selectData.push({title: item.title, id: item.id, value: this.getItemTitle(item)});
            }
        }
    }

    _getIndexInArray(item,selectData){
        let i = -1;
        for(let j = 0;j<selectData.length;j++){
            if(selectData[j].id == item.id){
                i = j
            }
        }
        return i ;
    }

    _includeItem(item,selectData) {
        if (typeof item == 'string') {
            if (isEmpty(item.id)) {
                return selectData.includes(item); //检测是否包含
            } else {
                {this.checkId(item,selectData)}
            }
        } else {
            return selectData.some(function (x) { //方法用于检测数组中的元素是否满足指定条件
                return x.id == item.id
            });
        }

    }

    checkId(item,selectData){
        let has = false;
        for(let i = 0;i<selectData.length;i++){
            if(selectData[i].id == item.id){
                has = true
            }
        }
        return has;
    }

    _renderDrawerContentItem(title, content, onPress) {
        return (
            <View>
                <TouchableOpacity activeOpacity={1}
                                  style={[BaseStyles.leftCenterView,{height:50,justifyContent:'space-between'}]}
                                  onPress={() => {
                    if (onPress){onPress()}
                }}>
                    <Text style={[BaseStyles.titleWordStyle,{width:80,marginLeft:15}]}>{title}</Text>
                    <View style={[BaseStyles.rightCenterView]}>
                        <Image style={{width: 10, height: 10, marginRight: 10}}
                               source={require('../../../img/around_detail_icon.png')}/>
                        <Text style={[BaseStyles.contentWordStyle,{color:darkLightColor(),fontSize:14,
                            width:kScreenWidth*0.8 - 130,marginRight:10,textAlign:'right'}]}
                              numberOfLines={1}>{content}</Text>
                    </View>
                </TouchableOpacity>
                <View style={[BaseStyles.separatorStyle]}/>
            </View>
        );

    }


    _renderBottomView() {

        let colors = this.isFormWD?['#416dff','#5242ff']:['#1FDB9B','#00C891']
        return (

            <View
                style={[BaseStyles.centerItem , {height:51,marginBottom:iphoneBottomMargin(),flexDirection:'row'}]}>

                <TouchableOpacity style={[BaseStyles.centerItem,{flex:1,height:51}]}
                                  onPress={()=>this._resetMethod()}>
                    <Text style={{color:'#333',fontSize:17}}>重置</Text>
                    <View style={{position:'absolute',top:0,left:0,right:0,height:0.5,backgroundColor:'#ccc'}}></View>
                    <View style={{position:'absolute',bottom:0,left:0,right:0,height:0.5,backgroundColor:'#ccc'}}></View>
                </TouchableOpacity>

                <TouchableOpacity style={[{flex:1,height:51}]}
                                  onPress={()=>this._saveMethod()}>
                    <LinearGradient colors={colors}
                                    start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                    locations={[0,1]}
                                    style={[BaseStyles.centerItem,{flex:1,height:51}]}>
                        <Text style={{color:'white',fontSize:17}}>确定</Text>
                    </LinearGradient>
                </TouchableOpacity>

            </View>

        );

    }

    _requestSelectItem(index) {
        this.props.father._requestSelectItem(index, (data) => {
            let dataArray = data
            let selectTitle;
            let key;
            if (index == 0) {
                key = 'alias_cn'
                selectTitle = '商品名/品牌';
            } else if (index == 1) {
                key = 'brand'
                selectTitle = '厂家';
            } else if (index == 2) {
                key = 'standard'
                selectTitle = '规格';
            } else if (index == 3) {
                key = 'troche_type'
                selectTitle = '剂型';
            }
            if (dataArray.length > 0) {
                dataArray = itemAddKey(dataArray, key);

                if (index == 0) {
                    this.setState({
                        DrugNameDataArray: dataArray,
                        selectTitle: selectTitle,
                        selectIndex: index,
                    });
                } else if (index == 1) {
                    this.setState({
                        ManufacturerDataArray: dataArray,
                        selectTitle: selectTitle,
                        selectIndex: index,
                    });
                } else if (index == 2) {
                    this.setState({
                        StandardDataArray: dataArray,
                        selectTitle: selectTitle,
                        selectIndex: index,
                    });
                } else if (index == 3) {
                    this.setState({
                        selectDataArray: dataArray,
                        selectTitle: selectTitle,
                        selectIndex: index,
                    });
                }
            } else {

                YFWToast('无此筛选项数据');
            }
        })
    }


    getparamValue(data){
        let dataId = []
        for(let i = 0;i<data.length;i++){
            dataId.push(data[i].id)
        }
        return dataId
    }

    //Action

    _getParamMap(index) {

        if (this.props.from == 'YFWSubCategoryController' ) {
            let paramMap = new Map();
            if (safeArray(this.state.selectName).length > 0 && index != 0) {
                paramMap.set('aliascn', this.state.selectName.map(function (x) {
                    return x.id;
                }).join());
            }
            if (safeArray(this.state.selectForm).length > 0 && index != 1) {
                paramMap.set('titleAbb', this.state.selectForm.map(function (x) {
                    return x.id;
                }).join());
            }
            if (safeArray(this.state.selectStand).length > 0 && index != 2) {
                paramMap.set('standard', safe(this.state.selectStand.join()));
            }
            if (safeArray(this.state.selectProduce).length > 0 && index != 3) {
                paramMap.set('trocheType', this.state.selectProduce.map(function (x) {
                    return x.id;
                }).join());
            }

            return paramMap;
        } else if(this.props.from == 'YFWWDSubCategoryList'){

            let paramMap = new Map();
            if (safeArray(this.state.selectName).length > 0 && index != 0) {
                paramMap.set('aliascn', this.state.selectName.map(function (x) {
                    return x.value;
                }).join());
            }
            if (safeArray(this.state.selectForm).length > 0 && index != 1) {
                paramMap.set('titleAbb', this.state.selectForm.map(function (x) {
                    return x.id;
                }).join());
            }
            if (safeArray(this.state.selectStand).length > 0 && index != 2) {
                paramMap.set('standard', safe(this.state.selectStand.join()));
            }
            if (safeArray(this.state.selectProduce).length > 0 && index != 3) {
                paramMap.set('trocheType', this.state.selectProduce.map(function (x) {
                    return x.id;
                }).join());
            }

            return paramMap;
        }
        else {
            let paramMap = new Map();

            if (safeArray(this.state.selectName).length > 0 && index != 0) {
                paramMap.set('aliascn', safe(this.state.selectName.join()));
            }
            if (safeArray(this.state.selectForm).length > 0 && index != 1) {
                paramMap.set('titleAbb', safe(this.state.selectForm.join()));
            }
            if (safeArray(this.state.selectStand).length > 0 && index != 2) {
                paramMap.set('standard', safe(this.state.selectStand.join()));
            }
            if (safeArray(this.state.selectProduce).length > 0 && index != 3) {
                paramMap.set('trocheType', safe(this.state.selectProduce.join()));
            }

            return paramMap;
        }

    }

    _detailSaveBackMethod(array) {

        if (this.state.selectIndex == 0) {
            this.setState({
                selectName: array,
            });
        } else if (this.state.selectIndex == 1) {
            this.setState({
                selectForm: array,
            });
        } else if (this.state.selectIndex == 2) {
            this.setState({
                selectStand: array,
            });
        } else if (this.state.selectIndex == 3) {
            this.setState({
                selectProduce: array,
            });
        }


    }


    _resetMethod() {
        if(this.state.showDetail) {
            if (this.state.selectIndex == 0) {
                this.setState({
                    selectName: [],
                });
            } else if (this.state.selectIndex == 1) {
                this.setState({
                    selectForm: [],
                });
            } else if (this.state.selectIndex == 2) {
                this.setState({
                    selectStand: [],
                });
            } else if (this.state.selectIndex == 3) {
                this.setState({
                    selectProduce: [],
                });
            }
        }else {
            this.setState({
                selectName: [],
                selectForm: [],
                selectStand: [],
                selectProduce: [],

                selectDataArray: [],
            });
        }

    }

    _saveMethod() {

        let param = this._getParamMap(99);
        let paramJson = {
            selectName: this.state.selectName,
            selectForm: this.state.selectForm,
            selectStand: this.state.selectStand,
            selectProduce: this.state.selectProduce,
        };

        if (this.props.saveMethod) {
            this.props.saveMethod(param, paramJson);
        }

    }

    _openMethod() {

        this.setState({
            showDetail: false,
        });

    }


}
