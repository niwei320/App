/**
 * Created by admin on 2018/5/23.
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    FlatList,
    ImageBackground,
    ScrollView,
    TextInput,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    DeviceEventEmitter
} from 'react-native';
import DeepClone from 'lodash'
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
import YFWToast from '../Utils/YFWToast'
import {getItem, setItem, kAccountKey} from '../Utils/YFWStorage'
import YFWRequestParam from '../Utils/YFWRequestParam'
import YFWRequest from '../Utils/YFWRequest'
import Alert from './Dialog'
import {isNotEmpty,isEmpty, itemAddKey, mapToJson, safe, strMapToObj} from '../PublicModule/Util/YFWPublicFunction'
import Picker from 'react-native-picker';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {backGroundColor,darkNomalColor,separatorColor,yfwOrangeColor} from '../Utils/YFWColor';
import DrugRemidingDetaiItemView from './View/DrugRemidingDetaiItemView'
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import YFWNativeManager from "../Utils/YFWNativeManager";
import { SwipeListView } from 'react-native-swipe-list-view';
import AndroidHeaderBottomLine from '../widget/AndroidHeaderBottomLine'
import DrugRemidingDetailModel from "./Model/DrugRemidingDetailModel";
import {convertDate} from "../Utils/DateConvertUtils";

const EMOJIS = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig;
export default class DrugRemidingDetail extends Component {
    static navigationOptions = ({navigation}) => ({

        headerRight: (
            <TouchableOpacity
                hitSlop={{left:10,top:10,bottom:13,right:10}}
                onPress={() => this2.onRightTvClick(navigation)}>
                <Text style={{fontSize:14,color:'#16c08e',marginRight:5}}
                >保存</Text>
            </TouchableOpacity>
        ),
        tabBarVisible: false,
        headerTitle: "用药提醒设置",

    });

    constructor(props) {
        super(props);
        this2 = this
        let startDate = this.initStartDate();
        let endDate = this.initEndDate();
        this.state = {
            getItem:[],
            dataArray: [],
            lackInfoArray: [],
            drugTimes: [],
            date: new Date(),
            chooseDrugTypeImageEveryDay: require('../../img/check_checked.png'),
            chooseDrugTypeImageSpace: require('../../img/check_discheck.png'),
            action: '',
            updataDrugItemsIndex: undefined,
            canAddDrugTime: true,
            starDate: startDate,
            endDate: endDate,
            interval_days:'0',
            remark:'',
            interval_days_old:'0',
            startTimeMillisecondValue:new Date(startDate).getTime(),
            endTimeMillisecondValue:new Date(endDate).getTime(),
        }
        this.listener()
    }

    listener(){
        this.willBlur = this.props.navigation.addListener('willBlur',payload => {
            Picker.hide()
        });
    }

    componentWillUnmount(){
        this.willBlur && this.willBlur.remove()
    }

    initStartDate() {
        let date = new Date();
        let startDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        return startDate
    }

    initEndDate() {
        var timestamp = Date.parse(new Date());
        var endDateTimstamp = timestamp + 7 * 1000 * 60 * 60 * 24;
        var date = new Date(endDateTimstamp);
        var y = date.getFullYear();
        var m = (date.getMonth() + 1 );
        m = m < 10 ? ('0' + m) : m;
        var d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        let endtDate = y + '-' + m + '-' + d;
        return endtDate
    }


    _changeDataMethod(value){

        if (value.length > 10){

            return value.substring(0,10);

        }

        return '';

    }


    onRightTvClick() {
        this._checkInformationIsCorrect();
    }


    /*
    *  检查信息是否填写完整
    * */
    _checkInformationIsCorrect(){
        this.state.lackInfoArray = [];
        this.state.dataArray.forEach((item,index)=>{
           if (isEmpty(item.name_cn)||isEmpty(item.unit)||isEmpty(item.usage_fee)){
               this.state.lackInfoArray.push(index);
           }
        });
        if (this.state.lackInfoArray.length >0) {
            YFWToast('请完善药品信息');
            return;
        }else if(this.state.drugTimes.length<1){
            YFWToast('需要填写服药时间');
            return;
        } else {
            this._saveInformation();
        }
    }


    _saveInformation(){
        YFWNativeManager.mobClick('drag notification-add-save');

        //服药时间
        let drugTimesArray = [];
        this.state.drugTimes.forEach((item, index) => {
            let id = 0;
            if (isNotEmpty(this.state.getItem.item_timec) && this.state.getItem.item_timec.length > index){
                id = this.state.getItem.item_timec[index].id;
            }
            drugTimesArray.push({'timec':item , id:id});
        });

        //提醒商品
        let item_goods = []
        if (this.state.dataArray.length > 0){
            this.state.dataArray.forEach((item,index)=>{
                let id = 0;
                if (isNotEmpty(this.state.getItem.item_goods) &&  this.state.getItem.item_goods.length > index) {
                    id = this.state.getItem.item_goods[index].id;
                }
                let goods = {
                    medicineid:item.goods_id,
                    namecn:item.name_cn,
                    image:item.image_url,
                    usage_num:item.usage_fee,
                    unit:item.unit,
                    id:id,
                }
                item_goods.push(goods);
            });
        }

        let enable = '1';
        if (isNotEmpty(this.state.getItem.enable)) {
            enable = this.state.getItem.enable;
        }

        let infoMap = {
            interval_days:this.state.interval_days,
            start_time:this.state.starDate,
            end_time:this.state.endDate,
            dict_enable:enable,
            remark:this.state.remark,
            item_goods:item_goods,
            item_timec:drugTimesArray,
            id:safe(this.detail_id)
        };

        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'guest.common.app.submitUseMedicine');
        paramMap.set('conditions', infoMap);
        viewModel.TCPRequest(paramMap, (res)=> {
            YFWToast('保存成功');
            DeviceEventEmitter.emit('changeDrugRemind')
            this.props.navigation.pop();
        }, (error)=> {
            // YFWToast(error.msg);
        });


    }


    _rendeDrugRemidingAddList() {
        return (
            <SwipeListView
                useFlatList={true}
                style={{width:width}}
                ItemSeparatorComponent={this._splitView}
                renderItem={this._renderItem}
                keyExtractor={(item, index) => item.id}
                data={this.state.dataArray}
                renderHiddenItem={this._renderQuickActions.bind(this)}
                disableRightSwipe={true}
                rightOpenValue={-60}
                previewOpenValue={-30}
                previewOpenDelay={3000}
                closeOnRowBeginSwipe={true}
                previewRowKey = {''}
            >
            </SwipeListView>
        );
    }

    _splitView() {
        return (
            <View style={{backgroundColor:'#0DD79C'}} height={1}></View>
        );
    }


    componentDidMount() {
        let detai_id = this.props.navigation.state.params.state.value;
        this.detail_id = detai_id;
        this.state.action = this.props.navigation.state.params.state.action
        if (isNotEmpty(detai_id)) {
            this.requestNetData(detai_id);
        } else {
            //新建
            this.state.dataArray = [];
            this._addButtonClic();
        }
    }
    /**
     * 侧滑删除按钮
     * @returns {*}
     * @private
     */
    _renderQuickActions = (item)=> {
        return (
            <View style={styles.quickAContent}>
                <TouchableOpacity style={[styles.quick,{backgroundColor:'#ff6e40'}]}
                                  onPress={()=>{this.onDelGoods(item)}}>
                    <Text style={{color:"#fff",textAlign:'center'}}>删除</Text>
                </TouchableOpacity>
            </View>
        )
    }

    onDelGoods(item) {
        this.state.dataArray.splice(item.index,1);
        this.setState({});
    }
    requestNetData(detai_id) {

        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.common.app.getUseMedicineDetail');
        paramMap.set('remindId', detai_id);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            res = DrugRemidingDetailModel.getModelData(res)
            if(res.item.item_timec.length== 4){
                this.state.canAddDrugTime = false;
            }
            this.state.endDate = this._changeDataMethod(res.item.end_time);
            this.state.getItem = res.item;
            this.state.dataArray = res.item.item_goods;
            this.state.drugTimes= DeepClone.clone(this.drugTimesArray(res.item.item_timec));
            this.state.starDate = this._changeDataMethod(res.item.start_time);
            this.state.startTimeMillisecondValue = new Date(this._changeDataMethod(res.item.start_time)).getTime();
            this.state.endTimeMillisecondValue= new Date(this._changeDataMethod(res.item.end_time)).getTime();
            this.state.interval_days = res.item.interval_days+'';
            this.state.interval_days_old = res.item.interval_days=='0'?'1':res.item.interval_days+'';
            this.state.remark = res.item.remark+'';
            this.setState({});
            this._changeChooseType((res.item.interval_days+'')=='0'?0:1)
        });

    }

    drugTimesArray(array){
        let returnArray = [];
        array.forEach((item,index)=>{
            let time = item.time_c;
            let hour = time.substring(0, 2);
            let minute = time.substring(3,5);
            returnArray.push(hour+':'+minute);
        });
        return returnArray;
    }
    clickItem(item) {
        YFWToast(item.index)
    }
    _changeDrugItemArray(data,index){

        if (this.state.dataArray.length > index){
            let array = this.state.dataArray;
            array[index] = data;
            this.setState({
                dataArray:array
            });
        }

    }


    _renderItem = (item)=> {
        return (
            <DrugRemidingDetaiItemView data={this.state.dataArray[item.index]}
                                       index={item.index}
                                       navigation = {this.props.navigation}
                                       callback = {
                                           (data,index)=>{
                                               this._changeDrugItemArray(data,index)
                                           }
                                       }
                />
        );
    };

    render() {
        return (
            <KeyboardAvoidingView style={{flex:1,backgroundColor:'#FFFFFF'}} behavior="padding"
                                  keyboardVerticalOffset={80}>
                <View style={{flex:1}}>
                    <AndroidHeaderBottomLine/>
                    <ScrollView>
                        <TouchableWithoutFeedback onPressIn={()=> this._closePicker()}>
                            <View>
                                <View style={{backgroundColor:'white'}}>
                                    {this._rendeDrugRemidingAddList()}
                                </View>
                                <View style={{backgroundColor:'white'}}>
                                    {this._renderDrugRemidingBottom()}
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </ScrollView>
                    <Alert ref="ref_dialog">
                    </Alert>
                </View>
            </KeyboardAvoidingView>
        );
    }

    _renderDrugRemidingBottom() {
        return (
            <View style={{alignItems:'center'}}>
                <TouchableOpacity style={{width:80,backgroundColor:'#16c08e',width:width,padding:10}}
                                  onPress={this._addButtonClic.bind(this)}>
                    <Text style={{color:'#FFF',textAlign:'center'}}>
                        ＋ 新增药品
                    </Text>
                </TouchableOpacity>
                <View style={{width:width,flexDirection:'row',paddingLeft:10,paddingRight:10,paddingTop:15,paddingBottom:15,alignItems:'center',height:70}}>
                    <Text style={{fontSize:14,color:darkNomalColor()}}>服药时间</Text>
                    {this._addDrugTimeView()}
                </View>
                <View style={{width:width-10,height:1,backgroundColor:'#E5E5E5',marginLeft:10}}/>
                <View style={{paddingLeft:10,paddingRight:10,paddingTop:15,paddingBottom:15,flexDirection:'row',width:width,height:60,alignItems:'center'}}>
                    <Text style={{fontSize:14,color:darkNomalColor()}}>重复</Text>
                    <TouchableOpacity style={{flexDirection:'row',alignItems:'center'}}
                                        hitSlop={{left:0,top:10,bottom:10,right:0}}
                                      onPress={()=>this._chooseStarAndEndDate(0)}>
                        <Text style={{fontSize:12,color:darkNomalColor(),marginLeft:10}}>{this.state.starDate}</Text>
                        <Image style={{marginLeft:10,width:10,height:10,resizeMode:'contain'}}
                               source={require('../../img/arrow_down_drug.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={{flexDirection:'row',alignItems:'center'}}
                                        hitSlop={{left:0,top:10,bottom:10,right:0}}
                                      onPress={()=>this._chooseStarAndEndDate(1)}>
                        <Text style={{fontSize:12,color:darkNomalColor(),marginLeft:15}}>{this.state.endDate}</Text>
                        <Image style={{marginLeft:10,width:10,height:10,resizeMode:'contain'}}
                               source={require('../../img/arrow_down_drug.png')}/>
                    </TouchableOpacity>
                </View>
                <View style={{width:width-10,height:1,backgroundColor:'#E5E5E5',marginLeft:10}}/>
                <View style={{paddingLeft:10,paddingRight:10,paddingTop:15,flexDirection:'row',width:width,height:60}}>
                    <TouchableOpacity hitSlop={{left:10,top:10,bottom:0,right:10}} onPress={()=>this._changeChooseType(0)}>
                        <Image style={{width:18,height:18,resizeMode:'contain'}}
                               source={this.state.chooseDrugTypeImageEveryDay}/>
                    </TouchableOpacity>
                    <Text style={{marginLeft:10,color:darkNomalColor(),fontSize:12}}>每天 (从今天开始计算)</Text>
                </View>
                <View style={{paddingLeft:10,paddingRight:10,flexDirection:'row',width:width,paddingBottom:15,alignItems:'center',height:50}}>
                    <TouchableOpacity hitSlop={{left:10,top:10,bottom:10,right:10}} onPress={()=>this._changeChooseType(1)}>
                        <Image style={{width:18,height:18,resizeMode:'contain'}}
                               source={this.state.chooseDrugTypeImageSpace}/>
                    </TouchableOpacity>
                    <Text style={{marginLeft:10,color:darkNomalColor(),fontSize:12}}>每隔</Text>
                    <TextInput
                        style={{borderWidth:1,borderColor:'#E5E5E5',width:60,marginLeft:10,textAlign:'center',padding:0,height:25,fontSize:10,color:darkNomalColor()}}
                        underlineColorAndroid='transparent'
                        keyboardType="numeric"
                        returnKeyType={'done'}
                        onFocus={()=>this.onFocus()}
                        onChangeText={(text) => this.intervalDayTextChange(text)}
                        onBlur={(text)=>this.intervalDayBlur(this.state.interval_days_old)}
                        value =  {this.state.interval_days_old}
                        autoFocus={false}/>
                    <Text style={{marginLeft:5,color:darkNomalColor(),fontSize:12}}>天</Text>
                </View>
                <View style={{width:width,height:5,backgroundColor:backGroundColor()}}/>
                <View style={{backgroundColor:'#FFF',padding:10,height:200}}>
                    <Text style={{fontSize:14,color:darkNomalColor()}}>添加备注</Text>
                    <TextInput style={{marginTop:10,marginBottom: 10,height:150,width:width-20,color:'#16c08e',fontSize:12}}
                               underlineColorAndroid='transparent'
                               autoFocus={false}
                               onFocus={()=>this.onFocus()}
                               onChangeText={(text) => this.setState({remark: text.replace(EMOJIS,'')})}
                               value =  {this.state.remark}
                               multiline={true}>
                    </TextInput>
                </View>
            </View>
        );
    }

    onFocus(){
        Picker.hide()
    }

    intervalDayBlur(text){
        try {
            text = Number.parseInt(String(text));
            if(isNaN(text) || !text){
                text = 1
            }else if(text<1){
                text = 1
            }
        }catch (e) {
            text = 1
        }
        this.setState({
            interval_days_old:text+'',
            interval_days: text+'',
        })
    }

    intervalDayTextChange(text){
        try {
            text = Number.parseInt(String(text));
            if(isNaN(text) || !text){
                text = ''
            }else if(text>30){
                text = 30
            }
        }catch (e) {
            text = ''
        }
        let days = (this.state.endTimeMillisecondValue-this.state.startTimeMillisecondValue)/(24*60*60*1000);
        if(text > days){
            YFWToast('间隔日期不能大于'+days+'天');
            this.setState({
                interval_days_old:1+'',
                interval_days: 1,
            })
        }else {
            this.setState({
                interval_days_old: text + '',
                interval_days: text + '',
            })
        }
    }

    _addButtonClic() {
        YFWNativeManager.mobClick('drag notification-add-add drag');
        //数据集合添加数据

        let id = 0;
        if (this.state.dataArray.length > 0){
            let data = this.state.dataArray[this.state.dataArray.length-1];
            id = data.id +1;
        }

        let itemData = {
            id:id,
            name_cn: '',
            usage_fee: '',
            medicineDesc: '',
            image_url: '',
        }
        this.state.dataArray.push(itemData);
        this.setState({})
    }



    _addDrugTimeView() {
        return (<View style={{flexDirection:'row',width:width-66,alignItems:'center'}}>
            {this._renderTimes()}
            {this._renderAddDurgTimsButton()}
        </View>)
    }

    _chooseDrugTimes() {
        this.state.action = 'creat'
        this._showTimePicker()
    }

    renderTimesItem(item, index) {
        return (
            <View
                style={{borderColor:'#999999',borderWidth:1,borderRadius:5,width:50,alignItems:'center',marginLeft:10,paddingBottom:5,paddingTop:5}}>
                <TouchableOpacity
                    onPress={()=>this._upDataDrugItems(index)}>
                    <Text style={{fontSize:12,color:'#333333'}}>{item}</Text>
                </TouchableOpacity>
            </View>)
    }

    _upDataDrugItems(index) {
        this.state.action = 'update'
        this.state.updataDrugItemsIndex = index
        this._showTimePicker()
    }

    _renderTimes() {
        if (this.state.drugTimes.length > 0) {
            return this.state.drugTimes.map((item, index) => this.renderTimesItem(item, index))
        }
    }

    _changeChooseType(number) {
        if (number == 0 ){
            YFWNativeManager.mobClick('account-drug reminding-info-everyday');
            this.setState({
                interval_days: '0',
                chooseDrugTypeImageEveryDay: require('../../img/check_checked.png'),
                chooseDrugTypeImageSpace: require('../../img/check_discheck.png')
            })
        } else{
            YFWNativeManager.mobClick('account-drug reminding-info-every other day');
            this.setState({
                interval_days:this.state.interval_days_old,
                chooseDrugTypeImageEveryDay: require('../../img/check_discheck.png'),
                chooseDrugTypeImageSpace: require('../../img/check_checked.png')
            })
        }
    }


    _showTimePicker() {
        let
            hours = [],
            minutes = [];
        for (let i = 0; i < 24; i++) {
            hours.push(i + '时');
        }
        for (let i = 0; i < 60; i++) {
            minutes.push(i + '分');
        }
        let pickerData = [hours, minutes];
        let date = new Date();
        let selectedValue = [
            date.getHours() + '时',
            date.getMinutes() + '分'
        ];
        Picker.init({
            pickerData,
            selectedValue,
            pickerConfirmBtnText: '确认',
            pickerCancelBtnText: this.state.action == 'creat' ? '取消' : '删除',
            wheelFlex: [1, 1],
            pickerFontColor: [51,51,51,1],
            pickerConfirmBtnColor:[39,191,143,1],
            pickerCancelBtnColor:[102,102,102,1],
            pickerTitleText:'',
            onPickerConfirm: pickedValue => {
                YFWNativeManager.mobClick('account-drug reminding-info-time');
                let date = pickedValue.toString().split(',');
                let hours = parseInt(date[0]) < 10 ? '0' + date[0].replace('时', '') : date[0].replace('时', '')
                let minu = parseInt(date[1]) < 10 ? '0' + date[1].replace('分', '') : date[1].replace('分', '')
                let dataItems = hours + ':' + minu
                if (this.state.action == 'creat') {
                    this.state.drugTimes.push(dataItems)
                    if (this.state.drugTimes.length >= 4) {
                        this.setState({
                            canAddDrugTime: false
                        })
                    }
                } else {
                    this.state.drugTimes.splice(this.state.updataDrugItemsIndex, 1, dataItems)
                }
                this.setState({})
            },
            onPickerCancel: pickedValue => {
                if (this.state.action == 'update') {
                    this.state.drugTimes.splice(this.state.updataDrugItemsIndex, 1);
                    this.setState({canAddDrugTime: true})
                }
            },
        });
        Picker.show();
    }


    _renderAddDurgTimsButton() {
        if (this.state.canAddDrugTime) {
            return (<TouchableOpacity onPress={()=>this._chooseDrugTimes()}>
                <View
                    style={{borderColor:separatorColor(),borderWidth:1,borderRadius:5,width:50,alignItems:'center',marginLeft:10,paddingBottom:5,paddingTop:5}}>
                    <Text style={{textAlign:'center',color:darkNomalColor(),fontSize:12}}>+</Text>
                </View>
            </TouchableOpacity>)
        } else {
            return <View/>
        }
    }

    _closePicker() {
        Picker.isPickerShow(status => {
            if (status) {
                Picker.hide()
            }
        });
    }

    _chooseStarAndEndDate(number) {
        let date;
        if (number == 0) {
            YFWNativeManager.mobClick('account-drug reminding-info-start');
            date = this.state.starDate;
        } else {
            YFWNativeManager.mobClick('account-drug reminding-info-end');
            date = this.state.endDate;
        }
        var y = date.substring(0, 4) + '年';
        let time_month = parseInt(date.substring(5, 7));
        var m = time_month + '月';
        // var m = (date.getMonth() + 1 ) + '月';
        // m = m < 10 ? ('0' + m) : m;
        let time_day = parseInt(date.substring(8, 10));
        var d = time_day + '日';
        // d = d < 10 ? ('0' + d) : d;
        let selectedValue = [y, m, d];
        Picker.init({
            pickerData: this._createDateData(),
            selectedValue,
            pickerFontColor: [51,51,51,1],
            pickerConfirmBtnText:'确定',
            pickerConfirmBtnColor:[39,191,143,1],
            pickerCancelBtnText:'取消',
            pickerCancelBtnColor:[102,102,102,1],
            pickerTitleText:'',
            onPickerConfirm: (pickedValue, pickedIndex) => {
                let date = pickedValue.toString().split(',');
                let year = date[0].replace('年', '')
                let month = parseInt(date[1]) < 10 ? '0' + date[1].replace('月', '') : date[1].replace('月', '')
                let day = parseInt(date[2]) < 10 ? '0' + date[2].replace('日', '') : date[2].replace('日', '')
                let dataItems = year + '-' + month + '-' + day
                let millisecondValue =  new Date(dataItems).getTime();
                number == 0 ? this.state.startTimeMillisecondValue = millisecondValue : this.state.endTimeMillisecondValue = millisecondValue
                if(this.state.endTimeMillisecondValue<this.state.startTimeMillisecondValue){
                    YFWToast('起始日期不能小于当前日期');
                    return
                }
                number == 0 ? this.state.starDate = dataItems : this.state.endDate = dataItems
                this.setState({})
            },
        });
        Picker.show();
    }

    _createDateData() {
        let date = [];
        let currentDate = new Date();
        let year = currentDate.getFullYear();
        year += 1
        for (let i = 1970; i <= year; i++) {
            let month = [];
            for (let j = 1; j < 13; j++) {
                let day = [];
                if (j === 2) {
                    for (let k = 1; k < 29; k++) {
                        day.push(k + '日');
                    }
                    if (i % 4 === 0) {
                        day.push(29 + '日');
                    }
                }
                else if (j in {1: 1, 3: 1, 5: 1, 7: 1, 8: 1, 10: 1, 12: 1}) {
                    for (let k = 1; k < 32; k++) {
                        day.push(k + '日');
                    }
                }
                else {
                    for (let k = 1; k < 31; k++) {
                        day.push(k + '日');
                    }
                }
                let _month = {};
                _month[j + '月'] = day;
                month.push(_month);
            }
            let _date = {};
            _date[i + '年'] = month;
            date.push(_date);
        }
        return date;
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor:'white'
    },
    //侧滑菜单的样式
    quickAContent:{
        flex:1,
        flexDirection:'row',
        justifyContent:'flex-end',
    },
    quick:{
        width:60,
        padding:10,
        justifyContent:'center',
        alignItems:'center'
    }
})