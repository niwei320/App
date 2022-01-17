import React, {Component} from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Keyboard,
    ScrollView,
    Platform,
    Image, StyleSheet, TextInput,
    NativeModules, KeyboardAvoidingView, DeviceEventEmitter
} from 'react-native'
import {yfwOrangeColor, yfwGreenColor, separatorColor,backGroundColor} from '../../Utils/YFWColor'
import {
    isEmpty,
    itemAddKey,
    kScreenWidth,
    safe,
    dismissKeyboard_yfw,
    isNotEmpty, mobClick, safeObj, isIphoneX, kScreenHeight, iphoneBottomMargin, is_phone_number, mapToJson, strMapToObj
} from "../../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";;
import YFWToast from "../../Utils/YFWToast";
import YFWNativeManager from "../../Utils/YFWNativeManager";
import YFWTouchableOpacity from '../../widget/YFWTouchableOpacity';
import { EMOJIS, IDENTITY_CODE, NUMBERS, IDENTITY_VERIFY,DECIMAL } from '../../PublicModule/Util/RuleString';
import YFWHeaderBackground from '../../WholesaleDrug/Widget/YFWHeaderBackground';
import YFWHeaderLeft from '../../WholesaleDrug/Widget/YFWHeaderLeft';
import YFWSwitchAddressView from "../../widget/YFWSwitchAddressView"
import DatePicker from '../../WholesaleDrug/Widget/View/DatePicker/DatePicker';
import WorkTradeAlert from '../View/WorkTradeAlert';
const {StatusBarManager} = NativeModules;

export default class YFWDrugRegistrationController extends Component {

    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: false,
        title:'疫情防控药品登记',
        headerRight:<View style={{width:50}}/>,
        headerTitleStyle: {fontSize: 16, color: 'white', textAlign: 'center', flex: 1},
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : {borderBottomColor: 'white', borderBottomWidth: 0},
        headerLeft: (
            <YFWHeaderLeft navigation={navigation}></YFWHeaderLeft>
        ),
        headerBackground: <YFWHeaderBackground></YFWHeaderBackground>
    });
    constructor(props) {
        super(props)
        this.submitClickable = true // 是否可以点击
        this.notCheckUser = this.props.navigation.state.params.state.value.notCheckUser
        this.workData = this.props.navigation.state.params.state.value.workData
        this.state = {
            data:[
                {type:'input',key:'drugname',title:'用药人姓名',placeholder:'请输入用药人真实姓名',value:'',maxLength:20,hidden:this.notCheckUser},
                {type:'input',key:'drugidcardno',title:'身份证号',placeholder:'请输入用药人身份证号',value:'',maxLength:20,hidden:this.notCheckUser},
                {type:'input',key:'drugmobile',title:'手机号',placeholder:'请输入手机号',value:'',maxLength:11,keyboardType:'number-pad',hidden:this.notCheckUser},
                // {type:'input',key:'temperature',title:'体温',placeholder:'请输入当前体温',value:'',maxLength:8,keyboardType:'numeric',rightText:'℃'},
                {type:'switch',title:'用药目的',key:'medicate_purpose',items:[
                    {title:'治疗',select:false,value:'治疗'},
                    {title:'预防储备',select:false,value:'储备'},
                ]},
                {type:'modal',title:'从事行业',key:'work_trade',name:'',id:''},
                {type:'checkbox',title:'症状',items:[
                    {title:'发热',select:false,key:'fs'},
                    {title:'咳嗽',select:false,key:'ks'},
                    {title:'胸闷',select:false,key:'xm'},
                    {title:'其他',select:false,key:'qt',explain:true,type:'desc_sym',placeholder:'请描述症状',value:'',maxLength:200},
                ]},
                {type:'switch',title:'是否乏力',key:'is_fl',items:[
                    {title:'是',select:false,value:1},
                    {title:'否',select:false,value:0},
                ]},
                {type:'switch',title:'30天内是否去过中/高风险区域',key:'isarrivals',items:[
                    {title:'是',select:false,value:1},
                    {title:'否',select:false,value:0},
                ]},
                {type:'switch',title:'30天内是否有境外旅居史/接触史',key:'iscontact',items:[
                    {title:'是',select:false,value:1},
                    {title:'否',select:false,value:0},
                ]
                },
                { type: 'modal', title: '来自何地',id:'',name:'',key:'from_where' },
                { type: 'modal', title: '最近一次来沪日期' ,name:'',key:'last_come_time'},
            ],
            tip:'我承诺以上填写内容均真实有效，否则承担一切法律责任',
            commitEnable: false,
            selectedCheckBox: false,
        }
    }

    componentDidMount() {
        let data = this.props.navigation.state.params.state.value.data || new Map();
        for (let index = 0; index < this.state.data.length; index++) {
            let info = this.state.data[index];
            if (info.type == 'input') {
                info.value = data.get(info.key) || ''
            } else if (info.type == 'switch') {
                info.items.map((item)=>{
                    item.select = item.value == data.get(info.key)
                })
            } else if (info.type == 'checkbox') {
                info.items.map((item)=>{
                    if (item.explain) {
                        item.value = data.get(item.type) || ''
                    }
                    item.select = data.get(item.key) == 1? true:false
                })
            } else if (info.type == 'modal') {
                info.name = data.get(info.key) || ''
            }
        }
        this.setState({
            data:this.state.data
        })
        this._changeCommitBtnStatus()
        DeviceEventEmitter.addListener('AddressBack', (value) => {
            let data = value;
            let newData = this.state.data.map((item)=>{
                if(item.title == '来自何地'){
                    item.id = data.get('id'),
                    item.name = data.get('name')
                }
                return item
            })
            this.setState({ data: newData }, () => { 
                this._changeCommitBtnStatus()
            });
        });
    }

    render() {
        return (
            <View style={{ backgroundColor: '#fefefe', flex: 1 }}>
                <View style={{backgroundColor:'#faf8dc',paddingHorizontal:10,justifyContent:'center',width:kScreenWidth,height:47}}>
                    <Text style={{color:'#feac4c',fontSize:12}}>{ '根据《上海市公共卫生应急管理条例》，为落实疫情防控要求，需要您如实填写一下内容，如有隐瞒或虚报，将依法追究责任。'}</Text>
                </View>
                <View style={{ backgroundColor: '#eeeeee', alignItems:'center',paddingHorizontal:10, width: kScreenWidth, height: 30, flexDirection: 'row' }}>
                    <Image style={{ width: 12, height: 12 }} source={ require('../../../img/Icon_warning_Drug_Regist.png')}/>
                    <Text style={{color:'#a78b8b',fontSize:12,marginLeft:6}}>{ '所有信息保密，仅用于当地疾控机构检查'}</Text>
                </View>
                <KeyboardAvoidingView style={{flex:1}} behavior="padding" keyboardVerticalOffset={80}>
                    <ScrollView style={[styles.list]}>
                        {this.state.data.map((item,index)=>{
                            if (item.hidden) {
                                return null
                            }
                            return (
                                <View key={index+'s'}>
                                    {this._renderCell({item:item,index:index})}
                                    {index < this.state.data.length - 1 &&this._renderSeparator()}
                                </View>
                            )
                        })}
                    </ScrollView>
                </KeyboardAvoidingView>
                {this._renderBottom()}
                <YFWSwitchAddressView ref={ref_phoneInput => (this.ref_switchaddress = ref_phoneInput)} />
                <DatePicker itemSelectedColor={'#333'} type={'regist'} HH={false} mm={false} ss={false} unit={['年', '月', '日']} startYear={1900} onPickerConfirm={(value) => { alert(JSON.stringify(value)) }} onPickerCancel={() => { alert('cancel') }} selectedItemValue={(item) => { let data = item }} ref={ref => this.dataPicker = ref} />
                <WorkTradeAlert ref={ref => this.workAlert = ref}/>
            </View>
        )
    }

    _renderCell(info) {
        let item = info.item
        if (item.type == 'input') {
            return (
                <View style={[styles.cellContainer]} key={info.index+item.title}>
                    <Text style={{color:'#333',fontSize:15}}>{item.title}</Text>
                    <TextInput
                        style={{flex:1,textAlign:'right',fontSize:15}}
                        value={item.value}
                        placeholder={item.placeholder}
                        placeholderTextColor={'#999'}
                        maxLength={item.maxLength}
                        keyboardType={item.keyboardType || 'default'}
                        underlineColorAndroid='transparent'
                        onChangeText={(text)=>this._onChangeText(text,item)}
                        onEndEditing={()=>this._onEndEditing(item)}
                        // onSubmitEditing={this._onSubmitEditing}
                    >
                    </TextInput>
                    {item.rightText&&<Text style={{color:'#333',fontSize:15,marginLeft:2}}>{item.rightText}</Text>}
                </View>
            )
        } else if (item.type == 'switch') {
            return (
                <View style={[styles.cellContainer]}>
                    <Text style={{color:'#333',fontSize:15}}>{item.title}</Text>
                    <View style={{flexDirection:'row',alignItems:'center'}}>
                        {item.items&&item.items.map((element,index)=>{
                            let imageSource = element.select?require('../../../img/select_gou.png'):require('../../../img/check_discheck.png')
                            return (
                                <TouchableOpacity style={{marginLeft:10,flexDirection:'row',alignItems:'center'}} activeOpacity={1} onPress={()=>{this._onItemClicked(item.items,index)}}>
                                    <Image style={{width:18,height:18}} source={imageSource}></Image>
                                    <Text style={{color:'#333',fontSize:15,marginLeft:3}}>{element.title}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>
            )
        } else if (item.type == 'checkbox') {
            let explainInfo = {}
            let explainShow = item.items&&item.items.some((element)=>{
                let has = element.explain && element.select
                if (has) {
                    explainInfo = element
                }
                return has
            })
            return (
                <View>
                    <View style={[styles.cellContainer]}>
                        <Text style={{color:'#333',fontSize:15}}>{item.title}</Text>
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            {item.items&&item.items.map((element,index)=>{
                                let imageSource = element.select?require('../../../img/checkbox_select.png'):require('../../../img/checkbox_unselect.png')
                                return (
                                    <TouchableOpacity style={{marginLeft:10,flexDirection:'row',alignItems:'center'}} activeOpacity={1} onPress={()=>{this._onMultipleItemClicked(item.items,index)}}>
                                        <Image style={{width:18,height:18}} source={imageSource}></Image>
                                        <Text style={{color:'#333',fontSize:15,marginLeft:3}}>{element.title}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>
                    {explainShow&&
                        <View style={{backgroundColor:'#f9f9f9',height:110,paddingHorizontal:10,paddingBottom:20,marginBottom:10}}>
                            <TextInput multiline={true}
                                value={explainInfo.value}
                                style={{fontSize:14,color:'#333',backgroundColor:'#f9f9f9',height:90}}
                                placeholder={explainInfo.placeholder}
                                placeholderTextColor={'#999'}
                                maxLength={explainInfo.maxLength}
                                onChangeText={(text)=>this._onChangeText(text,explainInfo)}
                            >
                            </TextInput>
                            <Text style={{position:'absolute',right:10,bottom:5,color:'#999',fontSize:13}}>{explainInfo.value.length+'/'+explainInfo.maxLength}</Text>
                        </View>
                    }
                </View>
            )
        } else if (item.type == 'modal') {
            return (
                <TouchableOpacity style={[styles.cellContainer]} onPress={() => { this._onListItemClicked(item.title) }} activeOpacity={ 1}>
                    <Text style={{ color: '#333', fontSize: 15 }}>{item.title}</Text>
                    <View style={{flexDirection:'row',alignItems:'center'}} activeOpacity={1}>
                        <Text style={{color:'#999999',fontSize:14,marginLeft:3}}>{item==''?'请选择':item.name}</Text>
                        <Image style={{width:7,height:12,marginLeft:5}} source={require('../../../img/message_next.png')}></Image>
                    </View>
                </TouchableOpacity>
            )
        }
        return (
            <View></View>
        )
    }

    _onListItemClicked(type) { 
        if (type == '来自何地') {
            this.ref_switchaddress.showView('regist');
        } else if (type == '最近一次来沪日期') {
            this.dataPicker.show((value) => {
                this.dateSelected(value)
            })
        } else if (type == '从事行业') { 
            this.workAlert.showView(this.workData,(item) => { 
                this.workSelected(item)
            })
        }
    }

    workSelected(value) {
        let newData = this.state.data.map((item)=>{
            if(item.title == '从事行业'){
                item.id = value.id
                item.name = value.name
            }
            return item
        })
        this.setState({ data: newData }, () => { 
            this._changeCommitBtnStatus()
        });
    }

    dateSelected(value) {
        let newData = this.state.data.map((item)=>{
            if(item.title == '最近一次来沪日期'){
                item.name = value
            }
            return item
        })
        this.setState({ data: newData }, () => { 
            this._changeCommitBtnStatus()
        });
    }

    _renderSeparator() {
        return (
            <View style={{backgroundColor:'#f0f0f0',height:1,width:kScreenWidth-26}}></View>
        )
    }

    _renderBottom() {
        return (
            <View style={[styles.bottomBtmView,{height:95 + iphoneBottomMargin()}]}>
                <TouchableOpacity onPress={() => { this.setState({ selectedCheckBox: !this.state.selectedCheckBox }, () => { this._changeCommitBtnStatus()})}} activeOpacity={ 1} style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 5}}>
                    <Image style={{width: 12, height: 12, marginHorizontal: 5}} source = {this.state.selectedCheckBox?require('../../../img/checkbox_select.png'):require('../../../img/checkbox_unselect.png')} />
                    <Text style = {{fontSize: 12, lineHeight: 13, color: "#ff9c00"}}>{this.state.tip}</Text>
                </TouchableOpacity>
                <YFWTouchableOpacity style_title={styles.bottomBtmOpacity} title={'保存'} callBack={()=>this._submitMethod()} isEnableTouch = {this.state.commitEnable} />
            </View>
        )
    }

    _onChangeText(value,item){
        if (item.key == 'drugname' || item.key == 'desc_sym') {
            value = value.replace(EMOJIS,'')
        } else if (item.key == 'drugidcardno') {
            value = value.replace(IDENTITY_CODE,'')
        } else if (item.key == 'drugmobile') {
            value = value.replace(NUMBERS,'')
        } else if (item.key == 'temperature') {
            value = this.verifyInput(value,item.value)
        }
        item.value = value
        this.setState({})
        this._changeCommitBtnStatus()
    }
    verifyInput(txt,oldValue) {
        if (isEmpty(txt)) {
            return txt
        }
        txt = txt.replace(DECIMAL, '')
        let arr = txt.split('.')
        if(arr.length >= 2){
            if(arr[1].length > 2){
                return oldValue
            }
            if(arr.length > 2){
                return oldValue
            }
        }
        if(txt.startsWith('.')){
            return '0' + txt
        }
        if(txt === '0'){
            if(oldValue === '0.'){
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
    _onEndEditing(item) {
        if (item.key == 'temperature' && isNotEmpty(item.value)) {
            let temperature = parseFloat(item.value)
            if (temperature > 42 || temperature < 30) {
                YFWToast('体温范围30~42℃')
            }
        }
    }

    _onSubmitEditing() {

    }

    _onItemClicked(items,selectIndex) {
        if (items[selectIndex].select) {
            return
        }
        for (let index = 0; index < items.length; index++) {
            let element = items[index];
            element.select = index == selectIndex
        }
        this.setState({})
        this._changeCommitBtnStatus()
    }

    _onMultipleItemClicked(items,selectIndex) {
        items[selectIndex].select = !items[selectIndex].select
        this.setState({})
        this._changeCommitBtnStatus()
    }

    _changeCommitBtnStatus() {
        let message = ''
        let disable = this.state.data.some((info)=>{
            if (info.hidden) {
                return false
            } else if (info.type == 'input') {
                if (info.value.length == 0) {
                    message = info.placeholder
                } else if (info.key == 'drugidcardno' && !info.value.match(IDENTITY_VERIFY)) {
                    message = '身份证号码格式不正确'
                } else if (info.key == 'drugmobile' && !is_phone_number(info.value)) {
                    message = '手机号码格式不正确'
                } else if (info.key == 'temperature') {
                    let temperature = parseFloat(info.value)
                    if (temperature > 42 || temperature < 30) {
                        message = '体温范围30~42℃'
                        return true
                    }
                }
                return info.value.length == 0
            } else if (info.type == 'switch') {
                return !info.items.some((item)=>{
                    return item.select
                })
            } else if (info.type == 'checkbox') {
                return !info.items.some((item)=>{
                    if (item.explain && item.select) {
                        return item.value.length > 0
                    }
                    return item.select
                })
            } else if (info.type == 'modal') {
                return info.name.length <= 0
            } 
        })
        if (!this.state.selectedCheckBox) { 
            disable = true
        }
        if (this.state.commitEnable == disable) {
            this.setState({
                commitEnable: !disable
            })
        }
        return message

    }

    _submitMethod() {
        let message = this._changeCommitBtnStatus()
        if (isNotEmpty(message)) {
            YFWToast(message)
            return
        }
        let paramsMap = new Map()
        for (let index = 0; index < this.state.data.length; index++) {
            let info = this.state.data[index];
            if (info.type == 'input') {
                paramsMap.set(info.key, info.value)
            } else if (info.type == 'switch') {
                info.items.map((item) => {
                    item.select && paramsMap.set(info.key, item.value)
                })
            } else if (info.type == 'checkbox') {
                info.items.map((item) => {
                    if (item.explain) {
                        paramsMap.set(item.type, item.select ? item.value : '')
                    }
                    paramsMap.set(item.key, item.select ? 1 : 0)
                })
            } else if (info.type == 'modal') { 
                paramsMap.set(info.key, info.name)
            }
        }
        console.log(paramsMap)
        if (!this.notCheckUser) {
            let params = new Map()
            params.set('__cmd','person.order.userverified')
            params.set('name',paramsMap.get('drugname'))
            params.set('idcardno',paramsMap.get('drugidcardno'))
            let request = new YFWRequestViewModel()
            request.TCPRequest(params,(res)=>{
                this._dealCallBack(paramsMap)
            },(error)=>{
                if (error&&error.msg) {
                    YFWToast(error.msg)
                }
            })
        } else {
            this._dealCallBack(paramsMap)
        }
    }

    _dealCallBack(paramsMap) {
        if (this.props.navigation.state.params && this.props.navigation.state.params.state.value.callBack) {
            this.props.navigation.state.params.state.value.callBack(paramsMap);
            this.props.navigation.goBack();
        }
    }

}

const styles = StyleSheet.create(
    {
        list: {
            flex:1,
            borderRadius: 7,
            backgroundColor: "white",
            shadowColor: "rgba(204, 204, 204, 0.2)",
            shadowOffset: {
                width: 0,
                height: 0
            },
            shadowRadius: 8,
            shadowOpacity: 1,
            paddingLeft:21,
            paddingRight:19
        },
        cellContainer:{
            flexDirection:'row',
            alignItems:'center',
            justifyContent:'space-between',
            height:60
        },
        bottomBtmView: {
            width: kScreenWidth,
            alignItems: 'center',
            
            bottom:0,
            left:0
        },
        bottomBtmOpacity:{
            height: 44,
            width: kScreenWidth - 20,
            fontSize: 16
        },
    }
)
