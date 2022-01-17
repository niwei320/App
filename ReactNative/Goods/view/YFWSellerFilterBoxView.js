import React, {Component} from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity,
    StyleSheet, Platform, ImageBackground, NativeModules, TextInput
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
    isAndroid, safeArray, min
} from "../../PublicModule/Util/YFWPublicFunction";
import LinearGradient from "react-native-linear-gradient";
import YFWSellerFilterBoxDetailView from './YFWSellerFilterBoxDetailView';
import { DECIMAL } from '../../PublicModule/Util/RuleString';

const {StatusBarManager} = NativeModules;

export default class YFWSellerFilterBoxView extends Component {


    static defaultProps = {
        category_id: '',
        keywords: '',
        paramJson: {},
    }

    constructor(props, context) {

        super(props, context);
        this.state = {
            selectName: isNotEmpty(props.paramJson.selectName) ? props.paramJson.selectName : [],
            selectForm: isNotEmpty(props.paramJson.selectForm) ? props.paramJson.selectForm : [],
            selectStand: isNotEmpty(props.paramJson.selectStand) ? props.paramJson.selectStand : [],
            selectProduce: isNotEmpty(props.paramJson.selectProduce) ? props.paramJson.selectProduce : [],
            minPrice: isNotEmpty(props.paramJson.minPrice) ? props.paramJson.minPrice : '',
            maxPrice: isNotEmpty(props.paramJson.maxPrice) ? props.paramJson.maxPrice : '',
            showDetail: false,
            selectDataArray: [],
            DrugNameDataArray:[],//效期
            ManufacturerDataArray:[],//优惠活动
            StandardDataArray:[],//所在地
            selectTitle: '',
            selectIndex: 0,
        }
    }

    componentDidMount(){


        this._requestSelectItem(0)
        this._requestSelectItem(1)
        this._requestSelectItem(2)
    }

    render() {

        if (this.state.showDetail) {

            var selectData = this.getSelectDataArray(this.state.selectIndex)
            let originDataArray = this.getOriginDataArray()

            return (
                <View style={{flex:1,backgroundColor:'white'}}>
                    <YFWSellerFilterBoxDetailView dataArray={originDataArray} title={this.state.selectTitle}
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
                        this._renderPriceView()
                    }
                    <View style={{height:30}}/>
                    {
                        this._renderDrawerContentItemTwo('剩余效期', this.state.DrugNameDataArray, 0,3,9)
                    }
                    <View style={{height:30}}/>
                    {
                        this._renderDrawerContentItemTwo('优惠活动', this.state.ManufacturerDataArray, 1,3,9)
                    }
                    <View style={{height:30}}/>
                    {
                        this._renderDrawerContentItemTwo('所在地', this.state.StandardDataArray, 2,3,4)
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
        let themeBorderColor = '#1fdb9b'
        let themeBgColor = '#e8fbf5'
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

    _renderPriceView() {
        let fatherViewMarginH = 8
        return (
            <View>
                <Text style={[{marginLeft:18,color:'#333',fontSize:15,lineHeight:16,fontWeight:'bold'}]}>{'价格区间'}</Text>
                <View style={[{marginHorizontal:fatherViewMarginH,flexDirection:'row',marginTop:12,alignItems:'center'}]}>
                    <View style={{backgroundColor:'#fafafa',height:30,flex:1,borderRadius:15,...BaseStyles.centerItem}}>
                        <TextInput
                            style={{minWidth: 80, textAlign: 'center'}}
                            placeholder={'最低价'}
                            keyboardType={'numeric'}
                            underlineColorAndroid='transparent'
                            placeholderTextColor="#cccccc"
                            maxLength={8}
                            value={this.state.minPrice}
                            onChangeText={(text)=>{
                                this.setState({
                                    minPrice:this.verifyInput(text,this.state.minPrice)
                                })
                            }}
                            onEndEditing={()=>{}}
                        />
                    </View>
                    <Text style={{width:40,fontSize:14,textAlign:'center'}}>{'—'}</Text>
                    <View style={{backgroundColor:'#fafafa',height:30,flex:1,borderRadius:15,...BaseStyles.centerItem}}>
                        <TextInput
                            style={{minWidth: 80, textAlign: 'center'}}
                            placeholder={'最高价'}
                            keyboardType={'numeric'}
                            value={this.state.maxPrice}
                            onChangeText={(text)=>{
                                this.setState({
                                    maxPrice:this.verifyInput(text,this.state.maxPrice)
                                })
                            }}
                            onEndEditing={()=>{}}
                        />
                    </View>
                </View>
            </View>
        )
    }

    /**
     * 校验输入
     */
    verifyInput(txt,originPrice) {
        if (isEmpty(txt)) {
            return ''
        }
        txt = txt.replace(DECIMAL, '')
        let arr = txt.split('.')
        if(arr.length >= 2){
            if(arr[1].length > 2){
                return originPrice
            }
            if(arr.length > 2){
                return originPrice
            }
        }
        if(txt.startsWith('.')){
            return '0' + txt
        }
        if(txt === '0'){
            if(originPrice === '0.'){
                return txt
            }
            return '0.'
        }
        if(
            txt.startsWith('00')
            || (txt.startsWith('0') && !txt.startsWith('0.'))
        ){
            return this.floorFun(parseFloat(txt),2) + ''
        }
        return txt
    }

    floorFun(value, n) {
        return Math.floor(value*Math.pow(10,n))/Math.pow(10,n);
    }


    getItemTitle(item){
        let value;
        if (typeof item == 'string') {
            value = item;
        } else if (isNotEmpty(item.short_title)) {
            value = item.short_title
        } else if (isNotEmpty(item.title)) {
            value = item.title
        } else {
            value = item.name;
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
        if (this._includeItem(item,selectData)) {
            let index =  this._getIndexInArray(item,selectData);
            selectData.splice(index, 1)
        } else if (item.radio) {
            selectData.splice(0,selectData.length)
            selectData.push({title: item.title, id: item.id, value: this.getItemTitle(item)});
        } else {
            selectData.push({title: item.title, id: item.id, value: this.getItemTitle(item)});
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

        let colors = ['#1FDB9B','#00C891']
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
            let key;
            if (index == 0) {            
                key = 'alias_cn'
            } else if (index == 1) {
                key = 'brand'
            } else if (index == 2) {
                key = 'standard'
            }
            if (dataArray.length > 0) {
                dataArray = itemAddKey(dataArray, key);
    
                if (index == 0) {
                    this.setState({
                        DrugNameDataArray: dataArray,
                    });
                } else if (index == 1) {
                    this.setState({
                        ManufacturerDataArray: dataArray,
                    });
                } else if (index == 2) {
                    this.setState({
                        StandardDataArray: dataArray,
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
        let paramMap = new Map();
        if (this.state.selectName.length > 0 && index != 0) {
            paramMap.set('aliascn', this.state.selectName.map(function (x) {
                return x.id;
            }).join());
        }
        if (this.state.selectForm.length > 0 && index != 1) {
            paramMap.set('titleAbb', this.state.selectForm.map(function (x) {
                return x.id;
            }).join());
        }
        if (this.state.selectStand.length > 0 && index != 2) {
            paramMap.set('standard', safe(this.state.selectStand.map(function (x) {
                return x.id;
            }).join()));
        }
        paramMap.set('minPrice',safe(this.state.minPrice))
        paramMap.set('maxPrice',safe(this.state.maxPrice))
        return paramMap;
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
                minPrice:'',
                maxPrice:''
            });
        }

    }

    _saveMethod() {
        let minPrice = parseFloat(this.state.minPrice)
        let maxPrice = parseFloat(this.state.maxPrice)
        if (!isNaN(minPrice) && !isNaN(maxPrice) && minPrice > maxPrice) {
            YFWToast('最低价不能超过最高价')
            return
        } else if (isNotEmpty(this.state.maxPrice) && !isNaN(maxPrice) && maxPrice <= 0) {
            YFWToast('最高价不能小于等于0')
            return
        }
        let param = this._getParamMap(99);
        let paramJson = {
            selectName: this.state.selectName,
            selectForm: this.state.selectForm,
            selectStand: this.state.selectStand,
            selectProduce: this.state.selectProduce,
            minPrice: this.state.minPrice,
            maxPrice: this.state.maxPrice,
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
