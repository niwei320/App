import React, { Component } from 'react'
import {
    View,
    FlatList,
    Text,
    StyleSheet,
    Platform,
    NativeModules,
    TouchableOpacity,
    Image,
    TextInput,
    DeviceEventEmitter
} from 'react-native'
import {darkTextColor, yfwLineColor, backGroundColor, yfwGreenColor,darkLightColor} from '../../Utils/YFWColor'
import LinearGradient from 'react-native-linear-gradient';
import YFWTouchableOpacity from '../../widget/YFWTouchableOpacity'
import YFWToast from '../../Utils/YFWToast'
import {isRealName, is_phone_number, dismissKeyboard_yfw, isEmpty, safe, mapToJson, isNotEmpty, kScreenWidth, safeObj, adaptSize} from '../../PublicModule/Util/YFWPublicFunction'
import {IDENTITY_VERIFY, IDENTITY_CODE, NEWNAME, NUMBERS, NAME, EMOJIS} from '../../PublicModule/Util/RuleString'
import YFWPatientSicknessModal from './YFWPatientSicknessModal'
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel'
import YFWWeightModal from './YFWWeightModal'
import YFWRxInfoTipsAlert from '../../OrderPay/View/YFWRxInfoTipsAlert';
import YFWAlertView from '../../widget/YFWAlertView'
const {StatusBarManager} = NativeModules;
let that

export default class YFWPatientEditController extends Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: navigation.state.params.state.value.type == 1 ? '新增用药人' : '编辑用药人',
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            backgroundColor: '#fff',
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : {borderBottomColor: 'white', borderBottomWidth: 0, backgroundColor: '#fff',},
        headerRight: <TouchableOpacity onPress={() => {that._savePatient()}} activeOpacity={1} style={{justifyContent: 'center', alignItems: 'center', height: 40, paddingHorizontal: 15}}>
            <Text style={{fontSize: 13, color: darkTextColor()}}>保存</Text>
        </TouchableOpacity>,
    });

    constructor(props) {
        super(props);
        this.state = {
            enableCommit: true,             //多次点击提交，是否可以点击
            isDefault: false,
            canCommit: this.props.navigation.state.params.state.value.type == 1 ? false : true, // 保存按钮是否可以点击
            realName: '',
            idCardNo: '',
            dataSource: [
                {
                    id: 0,
                    title: '用药人姓名',
                    content: '',
                    placeholder: '请输入用药人真实姓名',
                    cell_id: 'NormalCell',
                    enable: true,
                    limmit: 20,
                    keyboardType: 'default', // 键盘类型
                },
                {
                    id: 1,
                    title: '身份证号码',
                    content: '',
                    placeholder: '请输入用药人身份证号码',
                    cell_id: 'NormalCell',
                    enable: true,
                    limmit: 22,
                    keyboardType: 'default',
                    isAdult: true, // 是否成年
                    isChildren: false // 是否是不满6岁的儿童
                },
                {
                    id: 2,
                    title: '出生年月',
                    content: '',
                    placeholder: '',
                    cell_id: 'NormalCell',
                    enable: false
                },
                {
                    id: 3,
                    title: '性别',
                    content: '男',
                    cell_id: 'SexCell',
                    select_index: 0,
                    enable: false
                },
                {
                    id: 4,
                    title: '体重(Kg)',
                    content: '',
                    placeholder: '请填写体重',
                    cell_id: 'NormalCell',
                    enable: true,
                    limmit: 4,
                    keyboardType: 'numeric',
                },
                {
                    id: 5,
                    title: '手机号码',
                    content: '',
                    placeholder: '用于医生回复时接收短信',
                    cell_id: 'NormalCell',
                    enable: true,
                    limmit: 11,
                    keyboardType: 'number-pad',
                },
                {
                    id: 6,
                    title: '疾病史',
                    content: '',
                    placeholder: '无肝肾异常、过敏史、妊娠',
                    cell_id: 'PatientCell',
                    enable: false,
                    isSickness: false,
                    sickness_history: {}
                },
                {
                    id: 7,
                    title: '关系标签',
                    content: '本人',
                    cell_id: 'RelationCell',
                    select_index: 0,
                },
            ]
        }
    }

    componentDidMount() {
        that = this
        if(this.props.navigation.state.params.state.value.type == 1) {
            this._fetchFirstData()
            this._fetchRealNameData()
        }else {
            this._fetchData()
        }
    }

    _fetchRealNameData () {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.account.getCertInfoForDrug');

        viewModel.TCPRequest(paramMap, (res) => {
            if (isNotEmpty(res.result)) {
                this.setState({
                    realName: safe(res.result.realname),
                    idCardNo: safe(res.result.idcardno),
                })
                if (safe(res.result.show) == '1') {
                    this.alertView && this.alertView.show()
                }                
            }
        }, (error) => {}, false);
    }

    // 新版本之前有用药人信息、第一次进入新版本，将之前的信息带出
    _fetchFirstData() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.userdrug.GetIsFristReturnOldUser');

        viewModel.TCPRequest(paramMap, (res) => {
            if(res.result.needuseold) {
                this.state.dataSource[0].content = res.result.real_name
                this.state.dataSource[1].content = res.result.idcard_no
                this.state.dataSource[4].content = safe(res.result.weight) == '0' ? '' : safe(res.result.weight)
                this.state.dataSource[5].content = safe(res.result.mobile)

                this._calculatePatientAge();

                // 校验是否可以提交
                this._checkPatient('check')
            }
        }, (error) => {}, false);
    }

    // 编辑的时候，获取信息
    _fetchData() {
        //
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.userdrug.GetById');
        paramMap.set('id', this.props.navigation.state.params.state.value.patient_id);
        viewModel.TCPRequest(paramMap, (res) => {
            console.log(res)
            if(isNotEmpty(res.result)) {
                this.state.dataSource[0].content = res.result.real_name
                this.state.dataSource[0].enable = res.result.dict_bool_certification == 1?false:true
                this.state.dataSource[1].content = res.result.idcard_no
                this.state.dataSource[1].enable = res.result.dict_bool_certification == 1?false:true
                this.state.dataSource[2].content = res.result.birthday.replace(' 00:00:00', '')
                this.state.dataSource[3].content = res.result.dict_sex == 1 ? '男' : '女'
                this.state.dataSource[3].select_index = res.result.dict_sex == 1 ? 0 : 1
                this.state.dataSource[4].content = res.result.weight == 0 ? '' : res.result.weight.toString()
                this.state.dataSource[5].content = res.result.mobile
                this.state.isDefault = res.result.dict_bool_default == 1
                this.state.dataSource[7].content = res.result.relation_label
                let relation_select = 0
                if(res.result.relation_label == '本人') {
                    relation_select = 0
                }else if(res.result.relation_label == '家属') {
                    relation_select = 1
                }else if(res.result.relation_label == '亲戚') {
                    relation_select = 2
                }else if(res.result.relation_label == '朋友') {
                    relation_select = 3
                }
                this.state.dataSource[7].select_index = relation_select

                let isSickness = false;
                if(res.result.dict_bool_medical_history == 1 ||
                    res.result.dict_bool_allergy_history == 1 ||
                    res.result.dict_bool_family_history == 1 ||
                    res.result.dict_bool_liver == 1 ||
                    res.result.dict_bool_renal == 1 ||
                    res.result.dict_bool_nurse == 1) {
                        isSickness = true
                }
                let sickness_history = {
                    isSickness: isSickness,
                    isMedical: res.result.dict_bool_medical_history == 1,
                    medical_history: safe(res.result.medical_history),
                    isAllergy: res.result.dict_bool_allergy_history == 1,
                    allergy_history: safe(res.result.allergy_history),
                    isFamily: res.result.dict_bool_family_history == 1,
                    family_history: safe(res.result.family_history),
                    liver: res.result.dict_bool_liver == 1,
                    renal : res.result.dict_bool_renal == 1,
                    nurse: res.result.dict_bool_nurse == 1,
                }
                this.state.dataSource[6].isSickness = isSickness
                this.state.dataSource[6].sickness_history = sickness_history

                this.setState({})

                this._calculatePatientAge();
            }
        }, (error) => {}, false);
    }

    _handleRealNAmeClick (res) {
        // this.alertView && this.alertView.dismiss()
        if (res.type == 'confirm') {
            this.state.dataSource[0].content = this.state.realName
            this.state.dataSource[1].content = this.state.idCardNo
            this.setState({})
            this._calculatePatientAge();
        }
    }


    render() {
        return(
            <View style={{flex:1, backgroundColor: backGroundColor()}}>
                {this._renderNoticeView()}
                {this._renderPatientList()}
                <YFWPatientSicknessModal sickness={this.state.dataSource[6].sickness_history} ref={(e) => {this.sicknessModal = e}} callBack={(data) => {this._sicknessCallBack(data)}}/>
                <YFWWeightModal ref={e => this.weightModal = e}/>
                <YFWRxInfoTipsAlert ref = {(item) => {this.tipsAlert = item}}  actions={[{title:'确认',callBack:()=>{}}]}/>
                {this._renderRealNameAlert()}
            </View>
        )
    }

    _renderRealNameAlert () {
        const { realName } = this.state
        const { idCardNo } = this.state
        return (
            <YFWAlertView
                ref={e => this.alertView = e} 
                title='您已实名信息' 
                confirmText='确定' 
                showCancel={false}
                onClick={this._handleRealNAmeClick.bind(this)}
            >
                <View style={{width: kScreenWidth-adaptSize(96), marginHorizontal: adaptSize(20), paddingHorizontal: 14, paddingVertical: 20, backgroundColor: "#f5f5f5"}}>
                    <Text style={{fontSize: 13, color: '#333', marginBottom: 15}}>姓名：<Text style={{fontWeight: '500'}}>{realName}</Text></Text>
                    <Text style={{fontSize: 13, color: '#333'}}>身份证号：<Text style={{fontWeight: '500'}}>{idCardNo}</Text></Text>
                </View>
                <Text style={{fontSize: 12, color: '#999', marginVertical: 10}}>温馨提示：点击“确定”，实名信息自动填入。</Text>
            </YFWAlertView>
        )
    }

    // 顶部提示语
    _renderNoticeView() {
        return(
            <View style={{paddingHorizontal: 20, paddingVertical: 12.0, backgroundColor: '#faf8dc'}}>
                <Text style={{color: '#feac4c', fontSize: 13}}>根据国家药监局规定，购买处方药需要实名认证。</Text>
            </View>
        )
    }

    // 用药信息列表
    _renderPatientList() {
        return(
            <View style={{flex: 1}}>
                <View style = {styles.borderShadow}>
                    <FlatList
                        data = {this.state.dataSource}
                        extraData = {this.state}
                        renderItem = {this._renderItemCell.bind(this)}
                        keyExtractor = {(item, index) => index}
                        keyboardDismissMode = {'on-drag'}
                    />
                </View>
                {this._renderDefaultPatientView()}
                <TouchableOpacity style={{flex:1}} onPress={() => {dismissKeyboard_yfw()}} activeOpacity={1}></TouchableOpacity>
                <View style={{paddingVertical: 20, alignItems: 'center'}}>
                    <YFWTouchableOpacity title={'保存并使用'} isEnableTouch={this.state.canCommit} callBack={() => {this._savePatient()}}/>
                </View>
            </View>
        )
    }

    // item cell
    _renderItemCell({item}) {
        if(item.cell_id == 'NormalCell') {

            return this._renderNormalCell(item)
        }else if(item.cell_id == 'SexCell') {

            return this._renderSexCell(item)
        }else if(item.cell_id == 'PatientCell') {

            return this._renderPatientCell(item)
        }else if(item.cell_id == 'RelationCell') {

            return this._renderRelationCell(item)
        }
    }

    // 普通cell
    _renderNormalCell(model) {
        return(
            <View style={{height: 41}}>
                <View style={{flexDirection: 'row', flex: 1, paddingHorizontal: 16, alignItems: 'center'}}>
                    <Text style={[styles.title,{color:model.enable?darkTextColor():darkLightColor()}]}>{model.title}</Text>
                    {this.renderContent(model)}
                </View>
                {this._renderLine()}
            </View>
        )
    }

    renderContent(model){
        if (!model.enable) {
            return (
                <Text style={{flex:1, lineHeight: 40, fontSize: 13, color: darkLightColor()}} >{model.content}</Text>
            )
        }
        return (
            <TextInput
                        style={{flex:1, height: 40, fontSize: 13, color: darkTextColor()}}
                        value={model.content}
                        placeholder={model.placeholder}
                        editable={model.enable}
                        maxLength={model.limmit}
                        keyboardType={model.keyboardType}
                        onChangeText={(text) => {

                            if(model.id == 0) {

                                text = text.replace(EMOJIS, '')
                            }else if(model.id == 1) {

                                text = text.replace(IDENTITY_CODE, '')
                            }else if(model.id == 4) {

                                text = text.replace(NUMBERS, '')
                                text = parseInt(text) == 0 ? '' : text
                                if(parseFloat(text) > 100) {
                                    dismissKeyboard_yfw()
                                    this.weightModal.show()
                                }
                            }else if(model.id == 5) {

                                text = text.replace(NUMBERS, '')
                            }

                            this.state.dataSource[model.id].content = text
                            this.setState({})
                            this._checkPatient('check')
                        }}
                        onEndEditing={() => {
                            if(model.id == 0) {

                                this.state.dataSource[model.id].content = model.content.replace(EMOJIS, '')
                                this.setState({})
                            }else if(model.id == 1) {

                                this._calculatePatientAge()
                            }

                            this._checkPatient('check')
                        }}
                    />
        )
    }

    // 性别cell
    _renderSexCell(model) {
        return(
            <View style={{height: 41}}>
                <View style={{flexDirection: 'row', flex: 1, paddingHorizontal: 16, alignItems: 'center'}}>
                    <Text style={[styles.title,{color:model.enable?darkTextColor():darkLightColor()}]}>{model.title}</Text>
                    {this._renderSexItem(model, 0, '男')}
                    {this._renderSexItem(model, 1, '女')}
                </View>
                {this._renderLine()}
            </View>
        )
    }

    // 性别item
    _renderSexItem(model, index, title) {
        let isSelect = model.select_index == index
        return(
            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginRight: 30}} activeOpacity={1}>
                {this._renderCheckBox(isSelect)}
                <Text style={{color:model.enable?darkTextColor():darkLightColor(), fontSize: 13}}>{title}</Text>
            </TouchableOpacity>
        )
    }

    // 疾病史cell
    _renderPatientCell(model) {
        return(
            <View>
                <TouchableOpacity activeOpacity={1} onPress={() => {
                        dismissKeyboard_yfw();
                        this.sicknessModal.show()
                    }} style={{flexDirection: 'row', flex: 1, paddingHorizontal: 16, alignItems: 'flex-start'}}>
                    <Text style={[styles.title, {marginVertical: 13}]}>{model.title}</Text>
                    <View activeOpacity={1} style={{flex: 1, paddingVertical: 7}}>
                        {this._renderSickness(model)}
                    </View>
                    <Image source={require('../../../img/toPayArrow.png')} style={{width: 7, height: 12, resizeMode: 'stretch', marginVertical: 13, marginLeft: 10}}></Image>
                </TouchableOpacity>
                {this._renderLine()}
            </View>
        )
    }

    // 疾病展示
    _renderSickness(model) {
        let items = []
        if(!model.isSickness) {
            return <Text style={{fontSize: 13, color: '#cccccc', marginVertical: 5}}>{model.placeholder}</Text>
        }else {
            if(model.sickness_history.isMedical) {
                items.push(this._renderSicknessItem('过往病史：'+model.sickness_history.medical_history))
            }
            if(model.sickness_history.isAllergy) {
                items.push(this._renderSicknessItem('过敏史：'+model.sickness_history.allergy_history))
            }
            if(model.sickness_history.isFamily) {
                items.push(this._renderSicknessItem('家族病史：'+model.sickness_history.family_history))
            }
            if(model.sickness_history.liver) {
                items.push(this._renderSicknessItem('肝功能异常'))
            }
            if(model.sickness_history.renal) {
                items.push(this._renderSicknessItem('肾功能异常'))
            }
            if(model.sickness_history.nurse) {
                items.push(this._renderSicknessItem('有妊娠哺乳'))
            }
        }
        return items
    }

    // 疾病展示
    _renderSicknessItem(content) {
        return <Text style={{color: darkTextColor(), fontSize: 13, marginVertical: 5}} numberOfLines={2}>{content}</Text>
    }

    // 关系cell
    _renderRelationCell(model) {
        return(
            <View style={{paddingVertical: 20}}>
                <View style={{flexDirection: 'row', flex: 1, paddingLeft: 16, alignItems: 'center'}}>
                    <Text style={styles.title}>{model.title}</Text>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap', flex: 1}}>
                        {this._renderRelationItem(model, 0, '本人')}
                        {this._renderRelationItem(model, 1, '家属')}
                        {this._renderRelationItem(model, 2, '亲戚')}
                        {this._renderRelationItem(model, 3, '朋友')}
                    </View>
                </View>
            </View>
        )
    }

    // 关系item
    _renderRelationItem(model, index, title) {
        let right = index != 3 ? 8 : 0
        let isSelect = index == model.select_index

        if(isSelect) {

            return(
                <TouchableOpacity onPress={() => {this._changeRelation(model, index, title)}} activeOpacity={1} style={[styles.relationShadow, {marginRight: right}]}>
                    <LinearGradient
                    colors={['#28e1a4','#1fdb9b']}
                    start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                    locations={[1,0]}
                    style={styles.relationItem}>
                        <Text style={styles.relationTitleSelected}>{title}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )
        }else {

            return(
                <TouchableOpacity onPress={() => {this._changeRelation(model, index, title)}} activeOpacity={1} style={[styles.relationItem, styles.relationBorder, {marginRight: right}]}>
                    <Text style={styles.relationTitleNormal}>{title}</Text>
                </TouchableOpacity>
            )
        }
    }

    // 分割线
    _renderLine() {
        return(
            <View style={{marginLeft: 16, height: 0.5, backgroundColor: yfwLineColor()}}></View>
        )
    }

    // 默认用药人
    _renderDefaultPatientView() {
        return(
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <TouchableOpacity onPress={() => {this._changeDefaultPatient()}} activeOpacity={1} style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15}}>
                    {this._renderCheckBox(this.state.isDefault)}
                    <Text style={{color: darkTextColor(), fontSize: 13}}>设为默认用药人</Text>
                </TouchableOpacity>
            </View>
        )
    }

    // 单选框
    _renderCheckBox(selected) {
        return(
            <View style={{width: 20, height: 20, justifyContent: 'center', alignItems: 'flex-end', marginRight: 5}}>
                {selected ?
                    <Image source={require('../../../img/icon_coupon_select.png')} style={{width: 20, height: 20, resizeMode: 'stretch'}}/>:
                    <Image source={require('../../../img/check_discheck.png')} style={{width: 16, height: 16, resizeMode: 'stretch'}}/>
                }
            </View>
        )
    }

    // 计算出生年月及年龄大小
    _calculatePatientAge() {
        let idNumer = this.state.dataSource[1].content
        if(!idNumer.match(IDENTITY_VERIFY)) {
            return
        }

        if(idNumer.length == 18) {

            // 18位身份证号码
            let year = idNumer.substr(6, 4)
            let month = idNumer.substr(10, 2)
            let day = idNumer.substr(12, 2)
            let sex = idNumer.substr(16, 1)

            this._dealBirthdayAndAge(year, month, day, sex)

        }else if(idNumer.length == 15) {

            // 15位身份证号码
            let year = idNumer.substr(6, 2)
            let yearNumber = parseInt(year)
            let currentDate = new Date()
            let currentYear = currentDate.getFullYear()
            let number = currentYear%2000
            if(yearNumber > number) {
                year = '19' + year
            }else {
                year = '20' + year
            }
            let month = idNumer.substr(8, 2)
            let day = idNumer.substr(10, 2)
            let sex = idNumer.substr(13, 1)

            this._dealBirthdayAndAge(year, month, day, sex)
        }else {
            this.state.dataSource[2].content = ''
            this.setState({})
        }
    }

    _dealBirthdayAndAge(year, month, day, sex) {
        let currentDate = new Date()
        let currentYear = currentDate.getFullYear()
        let currenMonth = currentDate.getMonth() + 1 // getMonth 值（0~11）
        let currenDay = currentDate.getDate()

        let age = currentYear - parseInt(year)
        let isMale = parseInt(sex)%2 == 1
        if((currenMonth*100+currenDay) > (parseInt(month)*100+parseInt(day))) {
            age += 1
        }

        if(age <= 6) {
            this.state.dataSource[4].placeholder = '该用药人为儿童，请填写体重'
            this.state.dataSource[1].isAdult = false
            this.state.dataSource[1].isChildren = true

            // YFWToast('您的年龄不超过6岁，无法提供问诊开方服务', {duration: 4000,position:kScreenHeight/2})
            this.tipsAlert && this.tipsAlert.showView(safeObj('您的年龄不超过6岁，无法提供问诊开方服务'),'确认')
        } else if(age <= 14) {
            this.state.dataSource[4].placeholder = '该用药人为儿童，请填写体重'
            this.state.dataSource[1].isAdult = false
            this.state.dataSource[1].isChildren = false
        } else {
            this.state.dataSource[4].placeholder = '请填写体重'
            this.state.dataSource[1].isAdult = true
            this.state.dataSource[1].isChildren = false
        }

        this.state.dataSource[3].content = isMale ? '男' : '女'
        this.state.dataSource[3].select_index = isMale ? 0 : 1
        this.state.dataSource[2].content = year + '-' + month + '-' + day
        this.setState({})
    }

    // 性别修改
    _changePatientSex(model, index, title) {
        if (index == model.select_index) {
            return
        }

        this.state.dataSource[model.id].content = title
        this.state.dataSource[model.id].select_index = index
        this.setState({})
    }

    // 疾病史信息回调
    _sicknessCallBack(data) {
        this.state.dataSource[6].sickness_history = data
        this.state.dataSource[6].isSickness = data.isSickness
        this.setState({})
    }

    // 关系修改
    _changeRelation(model, index, title) {
        if (index == model.select_index) {
            return
        }

        this.state.dataSource[model.id].content = title
        this.state.dataSource[model.id].select_index = index
        this.setState({})
    }

    // 设为默认用药人
    _changeDefaultPatient() {
        let isDefault = this.state.isDefault
        this.setState({
            isDefault: !isDefault
        })
    }

    // 校验信息
    _checkPatient(type) {

        let canCommit = false;
        let message = '';

        let nameModel = this.state.dataSource[0]
        let idCardModel = this.state.dataSource[1]
        let weightModel = this.state.dataSource[4]
        let mobileModel = this.state.dataSource[5]

        if(nameModel.content.length == 0) {

            message = nameModel.placeholder
        }
        // else if(!isRealName(nameModel.content)) {

        //     message = '姓名格式不正确'
        // }
        else if(idCardModel.content.length == 0) {

            message = idCardModel.placeholder
        }else if(!idCardModel.content.match(IDENTITY_VERIFY)) {

            message = '身份证号码格式不正确'
        }else if(idCardModel.isChildren) {

            message = '您的年龄不超过6岁，无法提供问诊开方服务'
        }else if(!idCardModel.isAdult && weightModel.content.length == 0) {

            weightModel = idCardModel.placeholder
        }else if(mobileModel.content.length == 0) {

            message = '请输入手机号码'
        }else if(!is_phone_number(mobileModel.content)) {

            message = '手机号码格式不正确'
        } else {
            canCommit = true;
        }

        if(safe(type) == 'commit') {
            if(message.length > 0) {
                if (message == '您的年龄不超过6岁，无法提供问诊开方服务') {
                    this.tipsAlert && this.tipsAlert.showView(safeObj('您的年龄不超过6岁，无法提供问诊开方服务'),'确认')
                }else{
                    YFWToast(message)
                }
            }
        }else {
            this.setState({
                canCommit: canCommit
            })
        }

        return canCommit
    }

    // 保存信息
    _savePatient() {
        if (!this.state.enableCommit) {
            return
        }
        this.state.enableCommit = false
        dismissKeyboard_yfw()
        let nameModel = this.state.dataSource[0]
        let idCardModel = this.state.dataSource[1]
        let birthdayModel = this.state.dataSource[2]
        let sexModel = this.state.dataSource[3]
        let weightModel = this.state.dataSource[4]
        let mobileModel = this.state.dataSource[5]
        let illnessModel = this.state.dataSource[6]
        let relationModel = this.state.dataSource[7]

        let canCommit = this._checkPatient('commit')
        if (canCommit) {
            // 提交用药人信息
            let paramMap = new Map();
            let viewModel = new YFWRequestViewModel();
            let url = this.props.navigation.state.params.state.value.type == 1 ? 'person.userdrug.insert' : 'person.userdrug.update'
            paramMap.set('__cmd', url);

            let dataInfo = new Map();

            if(this.props.navigation.state.params.state.value.type != 1) {
                dataInfo.set('id', this.props.navigation.state.params.state.value.patient_id)
            }

            dataInfo.set('real_name', nameModel.content); // 姓名
            dataInfo.set('idcard_no', idCardModel.content); // 身份证号
            dataInfo.set('birthday', birthdayModel.content); // 出生年月
            dataInfo.set('dict_sex', sexModel.content=='男' ? 1 : 0); // 性别
            dataInfo.set('weight', parseFloat(weightModel.content)); // 体重
            dataInfo.set('mobile', mobileModel.content); // 手机号码
            dataInfo.set('dict_bool_medical_history', illnessModel.sickness_history.isMedical? 1:0); // 是否有过往病史
            dataInfo.set('medical_history', illnessModel.sickness_history.medical_history); // 过往病史
            dataInfo.set('dict_bool_allergy_history', illnessModel.sickness_history.isAllergy ? 1 : 0); // 是否有过敏史
            dataInfo.set('allergy_history', illnessModel.sickness_history.allergy_history); // 过敏史
            dataInfo.set('dict_bool_family_history', illnessModel.sickness_history.isFamily ? 1 : 0); // 是否有家族病史
            dataInfo.set('family_history', illnessModel.sickness_history.family_history); // 家族病史
            dataInfo.set('dict_bool_liver', illnessModel.sickness_history.liver ? 1 : 0); // 肝功能
            dataInfo.set('dict_bool_renal', illnessModel.sickness_history.renal ? 1 : 0); // 肾功能
            dataInfo.set('dict_bool_nurse', illnessModel.sickness_history.nurse ? 1 : 0); // 妊娠
            dataInfo.set('relation_label', relationModel.content); // 关系标签
            dataInfo.set('dict_bool_default', this.state.isDefault ? 1 : 0); // 是否是默认用药人
            paramMap.set('data',mapToJson(dataInfo))
            viewModel.TCPRequest(paramMap, (res) => {
                this.state.enableCommit = true
                this.tipsAlert = null
                DeviceEventEmitter.emit('kChangeUserDrug')
                YFWToast('实名认证成功')
                this.props.navigation.goBack()
            }, (error) => {
                this.state.enableCommit = true
                if (isNotEmpty(error)) {
                    this.tipsAlert && this.tipsAlert.showView(safeObj(error.msg),'确认')
                }
            }, false);
        }

    }
}

const styles = StyleSheet.create({
    borderShadow: {
        borderRadius: 7,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(204, 204, 204, 0.5)",
        shadowOffset: {
            width: 1,
            height: 6
        },
        shadowRadius: 8,
        shadowOpacity: 1,
        elevation: 2,
        marginHorizontal: 13,
        marginTop: 13
    },
    title: {
        color: darkTextColor(),
        fontSize: 13,
        fontWeight: '500',
        width: 70,
        marginRight: 10
    },
    relationItem: {
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 20,
        marginVertical: 5,
        backgroundColor:'white',
        elevation: 2
    },
    relationShadow: {
        shadowColor: "rgba(31, 219, 155, 0.5)",
        shadowOffset: {
            width: 0,
            height: 5
        },
        shadowRadius: 5,
        shadowOpacity: 1,
    },
    relationBorder: {
        borderWidth: 1,
        borderColor: yfwGreenColor(),
    },
    relationTitleNormal: {
        fontSize: 13,
        fontWeight: '500',
        color: yfwGreenColor()
    },
    relationTitleSelected: {
        fontSize: 13,
        fontWeight: '500',
        color: '#fff'
    },
})