import React, {Component} from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Text,
    ImageBackground,
    Image,
    ScrollView,
    DeviceEventEmitter, TextInput, KeyboardAvoidingView, FlatList
} from 'react-native';
import YFWTitleView from "../../PublicModule/Widge/YFWTitleView";
import YFWPrescriptionUploadPhotoView from "../View/YFWPrescriptionUploadPhotoView";
import {
    dismissKeyboard_yfw,
    isEmpty,
    isIphoneX,
    isNotEmpty,
    kScreenWidth, safe, isAndroid, tcpImage, deepCopyObj, adaptSize, safeObj, kScreenHeight, strMapToObj, kScreenScaling
} from "../../PublicModule/Util/YFWPublicFunction";
import {backGroundColor, yfwGreenColor} from "../../Utils/YFWColor";
import YFWPrescriptionExampleDialog from "../View/YFWPrescriptionExampleDialog";
import YFWTouchableOpacity from "../../widget/YFWTouchableOpacity";
import YFWToast from "../../Utils/YFWToast";
import YFWPatientCardView from "../View/YFWPatientCardView";
import {pushNavigation} from "../../Utils/YFWJumpRouting";
import YFWInquirySicknessAddModal from "../View/YFWInquirySicknessAddModal";
import BigPictureView from "../../widget/BigPictureView";
import {EMOJIS, NAME} from "../../PublicModule/Util/RuleString";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import YFWPrescriptionNoProofModel from "../View/YFWPrescriptionNoProofModel";
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';
import YFWRxInfoTipsAlert from '../View/YFWRxInfoTipsAlert';
import YFWPrescriptionUploadRxTipsDialog from '../View/YFWPrescriptionUploadRxTipsDialog';
import YFWRealNameAuthenticationAlert from '../View/YFWRealNameAuthenticationAlert';
import YFWNativeManager from '../../Utils/YFWNativeManager';
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager';
import YFWRequestParam from '../../Utils/YFWRequestParam';
import { BaseStyles } from '../../Utils/YFWBaseCssStyle';
import DashLine from '../../widget/DashLine';
import YFWPrescriptionExampleView from '../View/YFWPrescriptionExampleView';

const width = Dimensions.get('window').width;
const tabEnum = [
    {index: 1, title: '在线问诊'},
    {index: 0, title: '有处方单'},];
const prescriptionType = {
    Paper: {title: '纸质处方'},
    Digital: {title: '已有电子处方'}};
const pageEnum = {
    onePage:{},
    twoPage:{}};

export default class YFWUploadPrescriptionController extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle:  navigation.state.params.state.value.isDouble?'处方单信息':'就诊信息',
        headerRight: <View style = {{width: 40, height: 50}} />
    });

    constructor(parameters) {
        super(parameters);
        this.state = {
            pageType:pageEnum.twoPage,
            tab: 1,
            patientIndex:0,
            patientData:[],
            index:0,
            prescriptionType: prescriptionType.Paper,
            digitalPrescription: {},
            digitalPrescriptionData: [],
            imageUri:[],
            sicknessTag:new Set([]),
            sicknessTagData:new Set([]),
            sicknessTagDataArray:[],
            newIndex:undefined,
            diseaseDesc:'',                 //   用户疾病主诉
            caseImageUri:[],                //  复诊凭证
            noProof: true,                  //   无复诊凭证
            showDiseaseDesc:false,
            showProof:true,
            showAddTip:true,
            showEditTip:true,
            canShowMore:true,
            is_certificate_upload:false,    //强制上传复诊凭证（高危药）
            rx_mode:0,                       //单轨药电子处方模式  1=只支持电子处方  2=只支持已有处方  其他=电子处方&已有处方
            isEnableTouch:true,
            medicine_disease_items:{},
            medicine_disease_xz_count: 1,//
            disease_xz_add: 0,//
        }
        this.pageIndex = 1
        this.isDouble = 0
        this.isShowUpLoadPhotoView = true
        this.currentAddkey = ''
    }


    componentDidMount() {
        this.stopTipAnimation()
        this.stopEditTipAnimation()
        this.initData()
        this.refreshPatientCard()
        this.refreshPhototimer = setTimeout(() => {
            this.refreshPhotoView()
        }, 100);
        this.setState({})
        this.changeUserDrugListener =  DeviceEventEmitter.addListener('newUserDrug',(drug_items=>{
            if(isEmpty(drug_items)){
                return
            }
            let index = this.state.index
            if(isNotEmpty(this.state.patientData) && drug_items.length > this.state.patientData.length){ //是否为新增用药人。 是，选中第一位并滚回到第一位。
                this.state.patientData = drug_items
                this.state.newIndex = index                         //数据刷新后index需要改变防止错乱
                this.state.patientData[0].select = true
                this.state.index = 0
            } else {                                                //否，编辑用药人，恢复选中状态。
                this.state.patientData = drug_items
                this.state.patientData.forEach((item, i)=>{
                    this.state.patientData[i].select = i == index
                    if(i == index){
                        this.state.index = i
                    }
                })
            }
            this.setState({showEditTip:true})
        }))
    }


    componentWillUnmount() {
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove();
        }
        this.changeUserDrugListener&&this.changeUserDrugListener.remove()
        this.refreshPhototimer && clearTimeout(this.refreshPhototimer);
    }

    initData() {
        // console.log(JSON.stringify(this.props.navigation.state.params.state.value))
        this.state.patientData = this.props.navigation.state.params.state.value.drug_items;
        this.state.digitalPrescriptionData = this.props.navigation.state.params.state.value.rx_images;
        this.state.cachedInfo = this.props.navigation.state.params.state.value.cachedInfo;
        this.state.disease_items = this.props.navigation.state.params.state.value.disease_items;
        this.state.medicine_disease_items = this.props.navigation.state.params.state.value.medicine_disease_items;
        this.state.disease_xz_add = this.props.navigation.state.params.state.value.disease_xz_add;
        this.state.medicine_disease_xz_count = this.props.navigation.state.params.state.value.medicine_disease_xz_count;
        this.state.is_certificate_upload = this.props.navigation.state.params.state.value.is_certificate_upload
        this.state.rx_mode = this.props.navigation.state.params.state.value.rx_mode
        this.cartIDStr = this.props.navigation.state.params.state.value.cartIDStr;
        this.packageIDStr = this.props.navigation.state.params.state.value.packageIDStr;
        this.disease_xz_count = this.props.navigation.state.params.state.value.disease_xz_count;
        this.rx_cid_items = this.props.navigation.state.params.state.value.rx_cid_items;
        this.isDouble = this.props.navigation.state.params.state.value.isDouble
        if (this.state.is_certificate_upload) {
            this.state.showProof = true
            this.state.noProof = false
        }
        if(this.isDouble == 1){
            if (isEmpty(this.state.cachedInfo)) {
                this.state.cachedInfo = {}
            }
            this.state.cachedInfo.rx_upload_type = 0
            this.isShowUpLoadPhotoView = false
        }
        if (this.state.rx_mode == 2 && this.isDouble == 0) {
            this.ref_uploadrx_tips&&this.ref_uploadrx_tips.show()
            this.state.tab = 0
        }
        if(isNotEmpty(this.state.patientData)){
            this.state.patientData[0].select = true;
            this.state.isEnableTouch = this.state.patientData[0].dict_bool_certification == 1
            this.checkAuth(this.state.patientData[0])
        }
        if(isNotEmpty(this.state.disease_items)){
            let someDataArray = this.state.disease_items
            someDataArray.forEach((item)=>{
                this.state.sicknessTagData.add(item)
                this.state.sicknessTagDataArray.push(item)
            })
            this.state.canShowMore = this.state.disease_items.length > 3
        }
        if(isNotEmpty(this.state.cachedInfo)){
            if(isNotEmpty(this.state.patientData)){
                this.state.patientData.forEach((item, index)=>{
                    if(item.id == this.state.cachedInfo.drugid){  //如果选中之前保存的用药人,并滚动到对应卡片
                        this.state.patientData[index].select = true
                        this.state.index = index
                    } else {
                        this.state.patientData[index].select = false
                    }
                })
            }
            if(isNotEmpty(this.state.cachedInfo.rx_upload_type)){
                this.state.tab = this.state.cachedInfo.rx_upload_type == 1?0:this.state.cachedInfo.rx_upload_type == 2?1:0
            }
            if(isNotEmpty(this.state.cachedInfo.prescriptionType)){
                this.state.prescriptionType = this.state.cachedInfo.prescriptionType
                if(this.state.prescriptionType == prescriptionType.Paper){
                    if(isNotEmpty(this.state.cachedInfo.rx_images)){
                        this.state.imageUri = this.state.cachedInfo.rx_images
                    }
                }
            }
            if(isNotEmpty(this.state.cachedInfo.allDiseaselist)){
                this.state.cachedInfo.allDiseaselist.forEach((item)=>{
                    this.state.sicknessTagData.add(item)
                    this.state.sicknessTagDataArray.push(item)
                })
            }
            if(isNotEmpty(this.state.cachedInfo.diseaselist)){
                this.state.cachedInfo.diseaselist.forEach((item)=>{
                    this.state.sicknessTag.add(item)
                    this.state.sicknessTagData.add(item)
                    this.state.sicknessTagDataArray.push(item)
                })
            }
            if(isNotEmpty(this.state.cachedInfo.pageIndex)){
                this.pageIndex = this.state.cachedInfo.pageIndex
            }
            if(isNotEmpty(this.state.cachedInfo.canShowMore)){
                this.state.canShowMore = this.state.cachedInfo.canShowMore == 'true'?true:false
            }

            if(isNotEmpty(this.state.cachedInfo.disease_desc)){
                this.state.diseaseDesc = this.state.cachedInfo.disease_desc
            }
            if(this.state.cachedInfo.noProof !== undefined && this.state.cachedInfo.noProof !== null){
                this.state.noProof = this.state.cachedInfo.noProof
            }
            if(isNotEmpty(this.state.cachedInfo.case_url)){
                this.state.caseImageUri = this.state.cachedInfo.case_url
            }
            if(isNotEmpty(this.state.cachedInfo.inquiryid) && isNotEmpty(this.state.digitalPrescriptionData)){
                this.state.digitalPrescriptionData.some((item)=>{
                    if(item.inquiryid == this.state.cachedInfo.inquiryid){
                        this.state.digitalPrescription = item
                        return
                    }
                })
            }
        }
    }

    render() {
        return (
            <View style={{flex:1,backgroundColor:backGroundColor()}}>
                {this.state.rx_mode==1||this.state.rx_mode==2?<View/>:this._renderTab()}
                {this._renderWarning()}
                {this.renderContent()}
                {this._renderBottomBtn()}
                <YFWInquirySicknessAddModal ref={(e) => this.sicknessAddModal = e} callBack={(sickness) => {this._addSicknessCallBack(sickness)}}/>
                <YFWPrescriptionNoProofModel ref={(e) => this.noProofModal = e} callBack={() => {this._noProofCallBack()}}/>
                <YFWPrescriptionExampleDialog ref={ref_example_dialog => (this.ref_example_dialog = ref_example_dialog)}
                    uploadAction={()=>{this._UploadProof&&this._UploadProof._uploadImage&&this._UploadProof._uploadImage(0)}}
                    showLargeImage={(index)=>{this.exampleView&&this.exampleView.show(index)}}
                    />
                <YFWPrescriptionExampleView ref={e => this.exampleView = e}></YFWPrescriptionExampleView>
                <YFWPrescriptionUploadRxTipsDialog ref={view => (this.ref_uploadrx_tips = view)}/>
                <BigPictureView ref={(view)=>{this.picView = view}}/>
                <YFWRxInfoTipsAlert ref={(e)=>{this.rxInfoAlert=e}}/>
                <YFWRealNameAuthenticationAlert ref={(e)=>this.realNameAuthAlert=e}></YFWRealNameAuthenticationAlert>
            </View>
        )
    }

    renderContent() {
        if (isAndroid()) {
            return (
                <KeyboardAvoidingView style={{flex:1}} behavior="padding"
                                      keyboardVerticalOffset={80}>
                    <ScrollView
                        style={{}}
                        contentContainerStyle={{}}
                        keyboardDismissMode='on-drag'
                        keyboardShouldPersistTaps='never'
                        showsVerticalScrollIndicator={true}
                        scrollEnabled={true}
                        pagingEnabled={false}
                        horizontal={false}
                        onScrollBeginDrag={()=>{dismissKeyboard_yfw();}}
                     >
                        {this._renderSelectPatient()}
                        {/* {this._renderPatientNotice()} */}
                        {this._renderFooter()}
                    </ScrollView>
                </KeyboardAvoidingView>
            )
        } else {
            return (
                <KeyboardAwareScrollView
                        extraScrollHeight={(kScreenWidth - 64)/308*83}
                        keyboardDismissMode='on-drag'
                        keyboardShouldPersistTaps='never'
                        showsVerticalScrollIndicator={true}
                        scrollEnabled={true}
                        pagingEnabled={false}
                        horizontal={false}
                >
                    {this._renderSelectPatient()}
                    {/* {this._renderPatientNotice()} */}
                    {this._renderFooter()}
                </KeyboardAwareScrollView>
            )
        }
    }

    _getMaxSelectDiseaseCount() {
        return isNotEmpty(this.state.medicine_disease_xz_count)?this.state.medicine_disease_xz_count:2
    }

    _addSicknessCallBack(sickness){
        sickness.customadd = true
        sickness.namecn = this.currentAddkey
        if (this.state.sicknessTagData) {
            let allDataArray = Array.from(this.state.sicknessTagData)
            let have = allDataArray.some((item)=>{
                return !isNaN(parseInt(item.id)) && (parseInt(item.id) ==  parseInt(sickness.id) && item.namecn == sickness.namecn)
            })
            if (have) {
                return
            }
        }
        let max = this._getMaxSelectDiseaseCount()
        let diseaseItemsArray = this.state.medicine_disease_items[this.currentAddkey]
        if (isEmpty(diseaseItemsArray)) {
            diseaseItemsArray = []
        }
        let selectDiseaseCount = 0
        diseaseItemsArray.forEach((item, index)=>{
            let isSelect = this.state.sicknessTag.has(item)
            if (isSelect) {
                selectDiseaseCount ++
            }
        })
        if (selectDiseaseCount < max) {
            this.state.sicknessTag.add(sickness)
        }
        diseaseItemsArray.push(sickness)
        this.state.medicine_disease_items[this.currentAddkey] = diseaseItemsArray
        this.state.sicknessTagData.add(sickness)
        this.state.sicknessTagDataArray.push(sickness)
        this.setState({})
    }

    _diseaseClickAction(item,selectDiseaseCount) {
        let isSelect = this.state.sicknessTag.has(item)
        let max = this._getMaxSelectDiseaseCount()
        if (isSelect) {
            this.state.sicknessTag.delete(item)
        } else {
            if (selectDiseaseCount < max) {
                this.state.sicknessTag.add(item)
            } else {
                YFWToast('确诊疾病最多选择'+max+'个')
            }
        }
        this.setState({})
    }

    _noProofCallBack(){
        this.state.noProof = true
        this.state.caseImageUri = []
        this.setState({})
    }

    _renderTab() {
        if(this.isDouble == 1){
            return null
        }else{
            if(this.state.pageType == pageEnum.onePage){
                return <View />
            }
            let tabs = [];
            tabEnum.forEach((item,index) => {
                tabs.push(
                    <TouchableOpacity key={index+'s'} activeOpacity={1} onPress={() => {
                            if (item.index == 0&&item.index != this.state.tab) {
                                this.ref_uploadrx_tips&&this.ref_uploadrx_tips.show()
                            }
                            this.setState({tab: item.index})}
                        }>
                        <YFWTitleView style_title={{fontSize: 14, width: 14 * item.title.length + 10}} title={item.title} hiddenBgImage={this.state.tab != item.index} />
                    </TouchableOpacity>
                )
            });
            return (
                <View style = {styles.tab}>
                    {tabs}
                </View>
            )
        }
    }

    _renderFooter() {
        switch (this.state.tab) {
            case 0:
                return this._renderUploadPage();
                break;
            case 1:
                return this._renderInquiryPage();
                break;
            default:
                return <View />
        }
    }

    /** 组件选择用药人 */
    _renderSelectPatient() {
        let imageSource = this.state.showAddTip?require('../../../img/add_user_info_gif.gif'):require('../../../img/add_user_info.png')
        return (
            <View style={[styles.containerHPadding,{paddingHorizontal:0}]}>
                {
                    isNotEmpty(this.state.patientData)?
                    <View style={{flex:1}}>
                        <View style={[styles.functionTitle,{paddingLeft:13,paddingRight:8}]}>
                            <View style={{flexDirection:'row'}}>
                                <Text style={styles.redText}>*</Text><Text style = {styles.functionTitleText}>请选择用药人</Text>
                            </View>
                            <TouchableOpacity style={styles.grayBtn} hitSlop={{left:10,top:10,bottom:10,right:10}} onPress={()=>{
                                pushNavigation(this.props.navigation.navigate,{type:'prescription_patient_edit',value:{type: 1},callBack:(item)=>{}})
                            }}>
                                <Text style={styles.grayBtnText}>添加</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{marginTop:20, height:kScreenWidth/375*120,alignItems:'center'}}>
                            {this.renderPatientContent()}
                        </View>
                        {this.renderPatientinDicationPoint()}
                    </View>:
                    <TouchableOpacity activeOpacity={1} onPress={()=>{
                        pushNavigation(this.props.navigation.navigate,{type:'prescription_patient_edit',value:{type: 1},callBack:(item)=>{}})
                    }}>
                        <Image style={{resizeMode:'contain',width:adaptSize(238),height:adaptSize(137),marginTop:40,marginBottom:20}} source={imageSource}/>
                    </TouchableOpacity>
                }
            </View>
        )
    }

    renderPatientContent() {
        return (
            <ScrollView style={{flex:1,width:kScreenWidth}} horizontal={true} showsHorizontalScrollIndicator={false}>
                {this.renderPatientCard()}
            </ScrollView>
        )
    }

    renderPatientinDicationPoint() {
        if (this.state.patientData.length > 1) {
            let indicationPoints = []
            this.state.patientData.map((item,index)=>{
                let isSelect = index == this.state.index
                let bgColor = isSelect?'#e9e9e9':'#efefef'
                let size = isSelect?12:8
                let radius = isSelect?6:4
                let margin = isSelect?6.5:8.5
                indicationPoints.push(
                    <View key={index+''} style={{backgroundColor:bgColor,width:size,height:size,borderRadius:radius,marginHorizontal:margin}}></View>
                )
            })
            return (
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',height:21,marginBottom:30,marginTop:21}}>
                    {indicationPoints}
                </View>
            )
        }
        return (<View style={{height:30,marginTop:21}}/>)
    }

    renderPatientCard(){
        let items = [];
        if(isNotEmpty(this.state.patientData)){
            this.state.patientData.forEach((item,index)=>{
                items.push(
                    <View key={index+'d'} style={{marginHorizontal:10,}}>
                        <YFWPatientCardView data={item} ref={index+''} callBack={()=>{
                            this.setState({
                                index:index
                            })
                            this.checkAuth(this.state.patientData[index])
                            this.state.index = index
                            this.refreshPatientCard()
                        }} getNavigate={this.props.navigation.navigate}/>
                    </View>
                )
            })
            return items
        }
    }

    onDidChange(index){
        this.state.index = index
        this.refreshPatientCard()
        this.setState({index:index,showEditTip:true})
        this.stopEditTipAnimation()
    }

    refreshPatientCard(){
        if(isNotEmpty(this.state.patientData)){
            for( let i = 0; i < this.state.patientData.length; i++){
                this.refs[i+''] && this.refs[i+''].setSelect(this.state.index==i)
                this.state.patientData[i].select = this.state.index==i
            }
        }
    }

    // 用药人信息不完善时，提示完善用药人信息
    _renderPatientNotice() {
        if(isEmpty(this.state.patientData) || this.state.patientData.length == 0) {
            return <View style={{width: kScreenWidth, height:adaptSize(50)}}/>
        } else {
            // 选中用药人
            let patient = this.state.patientData[this.state.index];
            let notice = false;

            if (isEmpty(patient.real_name) || isEmpty(patient.idcard_no) || isEmpty(patient.mobile) || isEmpty(patient.relation_label)) {
                notice = true;
            }

            if (notice) {
                let imageSource = this.state.showEditTip?require('../../../img/perfect_patient_info_gif.gif'):require('../../../img/perfect_patient_info.png')
                return (
                    <TouchableOpacity activeOpacity={1} onPress={() => {
                        pushNavigation(this.props.navigation.navigate,{type:'prescription_patient_edit',value:{type: 2, patient_id: patient.id}})
                    }}>
                        <Image source={imageSource} style={{width: kScreenWidth, height:adaptSize(50), resizeMode: 'contain'}}></Image>
                    </TouchableOpacity>
                )
            } else {
                return <View style={{width: kScreenWidth, height:adaptSize(50)}}/>
            }
        }
    }

    /** 有处方单页 */
    _renderUploadPage() {
        let imageArrow = this.isShowUpLoadPhotoView?require('../../../img/up_arrow.png'):require('../../../img/down_arrow.png');
        let isDigitalPrescriptionData = isNotEmpty(this.state.digitalPrescriptionData) && this.state.digitalPrescriptionData.length > 0
        return (
            <View style = {styles.containerHPadding}>
                <View style = {styles.functionTitle}>
                    <TouchableOpacity style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}} activeOpacity={1} onPress={()=>{
                        if(this.isDouble==1){
                            this.isShowUpLoadPhotoView = !this.isShowUpLoadPhotoView
                            this.setState({})
                        }
                    }}>
                        <Text style = {styles.functionTitleText}>{!isDigitalPrescriptionData?this.isDouble?'上传处方图片(选填)':'上传处方图片(必传)':'处方类型'}</Text>
                        <View flex={1}/>
                        {this.isDouble==1?<Image style={{width:12,height:6,marginRight:20}} source={imageArrow}/>:null}
                    </TouchableOpacity>
                    {isDigitalPrescriptionData?
                        <View style = {{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                            {this._renderTypeIcon(prescriptionType.Paper)}
                            {this._renderTypeIcon(prescriptionType.Digital)}
                        </View>
                    :<View />}
                </View>
                {this._renderSelectPrescription()}
            </View>
        )
    }

    /** 按钮选择处方类型 */
    _renderTypeIcon(item) {
        if (this.state.prescriptionType === item) {
            return (
                <TouchableOpacity activeOpacity={1} onPress={() => {this.setState({prescriptionType: item})}}>
                    <ImageBackground style={styles.typeIconSelectedView} source={require('../../../img/button_pay.png')} imageStyle={{resizeMode: 'stretch'}}>
                        <Text style={styles.typeIconSelectedText}>{item.title}</Text>
                    </ImageBackground>
                </TouchableOpacity>
            )
        } else {
            return (
                <TouchableOpacity activeOpacity={1} style={styles.typeIconUnselectedView} onPress={() => {this.setState({prescriptionType: item})}}>
                    <Text style = {styles.typeIconUnselectedText}>{item.title}</Text>
                </TouchableOpacity>
            )
        }
    }

    /** 组件 处方选择 */
    _renderSelectPrescription() {
        switch (this.state.prescriptionType) {
            case prescriptionType.Paper:
                return this._renderUploadPhoto();
            case prescriptionType.Digital:
                return this._renderDigitalPrescriptionList();
            default:
                return <View />
        }
    }

    /** 组件 上传处方 */
    _renderUploadPhoto() {
        let prompt_info = '药店药师审核，请上传正规处方（仅可上传3张）';
        if(this.isShowUpLoadPhotoView){
            return (
                <View>
                <View style = {styles.photoView}>
                    <YFWPrescriptionUploadPhotoView ref={ref=>this._Upload=ref}
                                                    imageUri = {this.state.imageUri}
                                                    size = {3}
                                                    upTitle={'上传处方照片'}
                                                    returnImage = {(uri) => {
                                                        this._setPhotoUri(uri)
                                                    }} />
                    <View style = {{alignItems: 'center'}}>
                        <TouchableOpacity hitSlop={{left:10,top:10,bottom:10,right:10}} onPress={()=>{this.ref_example_dialog.show(0)}}>
                            <Text style = {{
                                fontSize: 10,
                                color: "#1fdb9b",
                                borderBottomWidth: 1,
                                borderColor: "#1fdb9b"
                            }}>处方示例</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style = {{
                    fontSize: 12,
                    color: "#feac4c",
                    width: width - 26,
                    marginHorizontal: 15,
                    marginVertical: 7,
                }}>{prompt_info}</Text>
            </View>
            )
        }
    }

    _setPhotoUri(uri, type) {
        if(type=='proof'){
            this.setState({
                caseImageUri: uri,
            });
            this._UploadProof && this._UploadProof._reloadPic()
        } else {
            this.setState({
                imageUri: uri,
            });
            this._Upload._reloadPic()
        }
    }

    refreshPhotoView(){
        this._UploadProof && this._UploadProof._reloadPic()
        this._Upload && this._Upload._reloadPic()
    }

    /** 电子处方单列表 */
    _renderDigitalPrescriptionList() {
        let listItems = [];
        listItems.push(<View key={'view'} style={{height:14}}/>)
        if(isNotEmpty(this.state.digitalPrescriptionData)){
            this.state.digitalPrescriptionData.forEach((item,index)=>{
                let isChecked = false
                if(isNotEmpty(this.state.digitalPrescription) && item.inquiryid == this.state.digitalPrescription.inquiryid){
                    isChecked = true
                }
                listItems.push(
                    <View key={index+'s'} style={{alignItems:'center'}}>
                        <TouchableOpacity activeOpacity={1}
                                          style={[styles.listItemImgTouch,{backgroundColor:isChecked?'rgb(31,219,155)':'rgb(204,204,204)'}]}
                                          onPress={()=>this._itemChecked(item)}>
                            <View style = {styles.listItemImgView}>
                                <Image style = {styles.listItemImg}
                                       source ={{uri:tcpImage(item.img_url)}}/>
                                <Image style = {styles.listItemClickIcon}
                                       source = {isChecked?require('../../../img/address_default.png'):require('../../../img/address_normal.png')}/>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity = {1}
                                          onPress = {()=>{this.picView.showView([{url:tcpImage(item.img_url)}],0)}}>
                            <Text style={{
                                marginTop:10,
                                fontFamily: "SourceHanSansCN-Regular",
                                fontSize: 12,
                                color: "#1fdb9b"}}>
                                查看大图
                            </Text>
                        </TouchableOpacity>
                    </View>
                )
            })

        }
        return (
            <View style={[styles.photoView,{
                marginHorizontal: 0,flexDirection:'row', overflow:'hidden'}]}>
                <ScrollView
                    style={{}}
                    contentContainerStyle={{paddingHorizontal:15}}
                    keyboardDismissMode='on-drag'
                    keyboardShouldPersistTaps='never'
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={true}
                    pagingEnabled={false}
                    horizontal={true}
                >
                    {listItems}
                </ScrollView>
            </View>
        )
    }
    _itemChecked(item){
        if(this.state.digitalPrescription && item.inquiryid == this.state.digitalPrescription.inquiryid){
            this.state.digitalPrescription = {}
        } else {
            this.state.digitalPrescription = deepCopyObj(item)
            let cdn = 'c1.yaofangwang.net'
            let index = this.state.digitalPrescription.img_url.indexOf(cdn)
            if(index !== -1){
                this.state.digitalPrescription.img_url = this.state.digitalPrescription.img_url.substring(index + cdn.length)
            }
        }
        this.setState({})
    }
    /** 无处方页 */
    _renderInquiryPage() {
        return (
            <View >
                {this._renderSickness()}
                {this._renderUploadProof()}
                <View style={{height:60}}/>
            </View>
        )
    }

    /** 选择线下确诊的相关疾病 */
    _renderSickness(){

        let diseaseInfoViews = []
        let medicine_disease_items = this.state.medicine_disease_items || {}
        let diseaseItem_index = 0
        let is_can_add = this.state.disease_xz_add == 1
        for (let k of Object.keys(medicine_disease_items)) {
            let diseaseItemsArray = medicine_disease_items[k];
            if (isEmpty(diseaseItemsArray)) {
                diseaseItemsArray = []
            }
            let itemViews = []
            let selectDiseaseCount = 0
            let iscustomadd = false
            diseaseItemsArray.forEach((item, index)=>{
                let isSelect = this.state.sicknessTag.has(item)
                if (isSelect) {
                    selectDiseaseCount ++
                }
                if (item.customadd) {
                    iscustomadd = true
                }
            })
            let hasSelectDisease = selectDiseaseCount > 0
            diseaseItemsArray.forEach((item, index)=>{
                let isSelect = this.state.sicknessTag.has(item)
                itemViews.push(
                    <TouchableOpacity key={index+'a'} activeOpacity={1} onPress={()=>{this._diseaseClickAction(item,selectDiseaseCount)}}>
                        <Text style={[styles.smallItems,{
                            backgroundColor: isSelect?"#e8fbf5":"#f5f5f5",
                            color: isSelect?"#1fdb9b": "#666666",
                            borderColor: isSelect?"#1fdb9b":"#f5f5f5",}]}>{item.name}</Text>
                    </TouchableOpacity>
                )
            })
            if (is_can_add || isEmpty(diseaseItemsArray) || diseaseItemsArray.length == 0 || iscustomadd) {
                itemViews.push(
                    <TouchableOpacity key={'more'} activeOpacity={1} onPress={()=>{
                        this.currentAddkey = k
                        this.sicknessAddModal && this.sicknessAddModal.show()
                        }}>
                        <Image style={{height:32, width:40/90*130, marginVertical:5, resizeMode:'contain'}} source={require('../../../img/btn_add_tag.png')}/>
                    </TouchableOpacity>
                )
            }

            diseaseInfoViews.push(
                (
                    <View style={{marginLeft:5}}>
                        <Text style={{color:'#666',fontSize:12,marginTop:10}}>{'['+k+']'}</Text>
                        <View style={{flexDirection:'row',marginVertical:10}}>
                            <View style={{height:30,marginVertical:5,width:12,...BaseStyles.centerItem}}>
                                <View style={{width:5,height:5,backgroundColor:hasSelectDisease?'#1fdb9b':'#ccc',borderRadius:2.5}}></View>
                            </View>
                            <View style={{flexWrap:'wrap', flexDirection:'row'}}>
                                {itemViews}
                            </View>
                        </View>
                        { diseaseItem_index < (Object.keys(medicine_disease_items).length - 1) &&
                        <View style={{height:1,flex:1}}>
                            <DashLine len={100*kScreenScaling} backgroundColor={'#bfbfbf'}></DashLine>
                        </View>}
                    </View>
                )
            )
            diseaseItem_index ++
        }

        return (
            <View style = {styles.containerHPadding}>
                <View style = {styles.functionTitle}>
                    <View style={{flexDirection:'row'}}>
                        <Text style={styles.redText}>*</Text><Text style = {styles.functionTitleText}>请选择确诊疾病</Text>
                    </View>
                </View>
                <View style={[styles.listItemView,{height:undefined, justifyContent:'flex-start', paddingVertical:12, paddingHorizontal:15}]}>
                    <Text style={{fontSize:12,color:'#666',fontWeight:'500',padding:5,paddingTop:0}}>{'请您选择在线下确诊的相关疾病'}</Text>
                    {diseaseInfoViews}
                    <View style={{width: kScreenWidth - 64,paddingBottom:5,marginHorizontal:5,flexDirection:'row',justifyContent:'space-between'}}>
                        <Text style={{fontSize:12,color:'#666',fontWeight:'500'}}>{'请您描述疾病症状（选填）'}</Text>
                        <TouchableOpacity activeOpacity={1} hitSlop={{left:20,top:20,bottom:20,right:20}} onPress={()=>{
                            this.setState({
                                showDiseaseDesc:!this.state.showDiseaseDesc
                            })
                        }} >
                            <Image style={{width:12,height:12,transform:[this.state.showDiseaseDesc?{rotate:'-90deg'}:{rotate:'90deg'}],resizeMode:'contain'}} source={require('../../../img/around_detail_icon.png')}/>
                        </TouchableOpacity>
                    </View>
                    {this._renderDiseaseContent()}
                </View>
            </View>
        )
    }

    _renderDiseaseContent() {
        if (this.state.showDiseaseDesc) {
            return (
                    <View style={{width: kScreenWidth - 64,padding:5,paddingTop:0,marginHorizontal:5, marginBottom:10,marginTop:2, minHeight: (kScreenWidth - 64)/308*83, borderRadius: 2, alignItems:'flex-end',backgroundColor: "#fafafa"}}>
                        <TextInput
                            style={{width: kScreenWidth - 74, fontSize: 13,backgroundColor: "#fafafa",minHeight: (kScreenWidth - 64)/308*83, textAlignVertical: 'top'}}
                            placeholder={'请您描述确诊疾病的症状'}
                            value={this.state.diseaseDesc}
                            selectionColor={yfwGreenColor()}
                            underlineColorAndroid={'transparent'}
                            multiline={true}
                            maxLength={200}
                            onChangeText={(text) => {
                                text = text.replace(EMOJIS,'')
                                this.state.diseaseDesc = text
                                this.setState({})
                            }}
                            onEndEditing={(event) => {
                                this.state.diseaseDesc = safe(this.state.diseaseDesc).trim()
                                this.setState({})
                            }}
                        />
                        <View style={{flex:1}}/>
                        <Text style={{fontSize: 10, color: "#dedede"}}>{this.state.diseaseDesc?this.state.diseaseDesc.length:0}/200</Text>
                    </View>
            )
        }

        return (
            <View/>
        )
    }

    /** 凭证上传 */
    _renderUploadProof(){
        if (!this.state.showProof) {
            return (
                <View style = {[styles.containerHPadding]}>
                    {this._renderProofTip()}
                    <View style={{height:100}}></View>
                </View>
            )
        }
        if(!this.state.noProof){
            let tip = '请您上传用药人的【处方/病历/住院出院记录】(仅可上传5张)'
            return (
                <View style = {styles.containerHPadding}>
                    {this._renderProofTip()}
                    <View style = {styles.photoView}>

                        <Text style={{fontSize:12,color:'#666',paddingLeft:20,paddingBottom:5}}>{tip}</Text>
                        <YFWPrescriptionUploadPhotoView ref={ref=>this._UploadProof=ref}
                                                        imageUri = {this.state.caseImageUri}
                                                        size = {5}
                                                        upTitle={'上传凭证'}
                                                        returnImage = {(uri) => {
                                                            this._setPhotoUri(uri,'proof')
                                                            this.ref_example_dialog&&this.ref_example_dialog.dismiss()
                                                        }}
                                                        clickPic = {(index)=>{
                                                            if (isEmpty(this.state.caseImageUri) || this.state.caseImageUri.length == 0) {
                                                                this.ref_example_dialog.show(1)
                                                                return true
                                                            }
                                                            return false
                                                        }}
                                                        />
                        <View style = {{alignItems: 'center'}}>
                            <TouchableOpacity activeOpacity={1} style={{marginVertical:10,borderRadius:6,backgroundColor:'#fafafa',marginHorizontal:12,flexDirection:'row',alignItems:'center',padding:10}} onPress={()=>{this.exampleView&&this.exampleView.show()}}>
                                <Image style={{width:128,height:87}} source={require('../../../img/img_proof_example_all.png')}></Image>
                                <Text style={{color:'#666',fontSize:13,fontWeight:'500',lineHeight:16,marginLeft:16}}>{'有效凭证，须包含以下信息：\r\n·医疗机构名称；\r\n·医生姓名；\r\n·患者姓名；\r\n·诊断和用药信息；\r\n若一张凭证信息不全，可上传多张。'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {
                        this.state.is_certificate_upload?null:
                        <TouchableOpacity onPress={()=>{this.noProofModal.show()}}>
                            <Text style = {{fontSize: 13, color: "#feac4c", width: width - 26, marginHorizontal: 15, marginTop: 7,}}>就诊凭证遗失/处方不在身边</Text>
                        </TouchableOpacity>
                    }
                </View>
            )
        } else {
            return (
                <View style = {styles.containerHPadding}>
                    {this._renderProofTip()}
                    <View style={[styles.listItemView,{height:undefined, justifyContent:'flex-start', paddingVertical:12, paddingHorizontal:15, marginTop:5}]}>
                        <View style={{width: kScreenWidth - 64,padding:5,paddingTop:0,marginHorizontal:5, marginVertical:10, borderRadius: 2, alignItems:'flex-end',backgroundColor: "#fafafa"}}>
                            <Text style={{fontSize: 12, lineHeight: 13, color: "#cccccc", padding:16,paddingLeft: 10}}>
                                已确认在线下医院完成就诊，但此刻就诊凭证遗失或不在身边。无历史处方、病历、住院出院记录可能会影响医生对您的病情判断。
                            </Text>
                        </View>
                        <View style={{flexWrap:'wrap', flexDirection:'row'}}>
                            <Text style={{fontSize: 13, color: "#cccccc"}}>已找到历史处方、病历、住院出院记录，</Text>
                            <TouchableOpacity hitSlop={{left:10,top:10,bottom:10,right:10}} onPress={()=>{this.setState({noProof:false})}}>
                                <Text style = {{fontSize: 13, color: "#1fdb9b",}}>立即上传</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )
        }
    }

    _renderProofTip() {
        let up_tip = '请上传就诊凭证'
        return (
            <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',flex:1}}>
                <View style={{flex:1}}>
                    <View style={{flexDirection:'row',flex:1}}>
                        {this.state.is_certificate_upload?<Text style={styles.redText}>*</Text>:null}
                        <Text style = {styles.functionTitleText}>{up_tip}</Text>
                    </View>
                </View>
                {
                    this.state.is_certificate_upload?null:
                    <TouchableOpacity activeOpacity={1} hitSlop={{left:20,top:20,bottom:20,right:20}} onPress={()=>{
                        this.setState({
                            showProof:!this.state.showProof
                        })
                    }} >
                        <Image style={{width:12,height:12,marginRight:20,transform:[this.state.showProof?{rotate:'-90deg'}:{rotate:'90deg'}],resizeMode:'contain'}} source={require('../../../img/around_detail_icon.png')}/>
                    </TouchableOpacity>
                }
            </View>
        )
    }

    /** 顶部提示文本 */
    _renderWarning() {
        let warningStr = ''
        switch (this.state.tab) {
            case 0:
                warningStr = this.isDouble?'您订单内的处方药须登记患者实名信息、用药情况    查看 >':'您订单内处方药必须凭医生开具的正规处方销售    查看 >';
                break;
            case 1:
                warningStr = "以下信息仅用于互联网医院为您提供问诊开方服务";
                break;
            default:
        }
        return (
            <View style = {[styles.warning,{flexDirection:'row',alignItems:'center',justifyContent:"space-between"}]}>
                <TouchableOpacity hitSlop={{left:10,top:10,bottom:10,right:10}} activeOpacity={1} onPress={()=>{
                    pushNavigation(this.props.navigation.navigate,{type:'get_h5',value:'https://m.yaofangwang.com/rx_guide.html' ,title:'H5单双轨说明页'})
                }}>
                    <Text style = {styles.warningText}>{warningStr}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    /** 底部提交按钮 */
    _renderBottomBtn() {
        let isInquiryPage = this.state.tab == 1;
        let isHintTextShow = (this.state.prescriptionType == prescriptionType.Digital && this.state.tab == 0)||isInquiryPage;
        let hintText = isInquiryPage?'互联网医院问诊并成功开具处方，所需问诊费暂不收取。':'处方内的药品与订单药品保持一致'
        let viewHeight = isHintTextShow? 95:70;
        return (
            <View style={[styles.bottomBtmView,{height: isIphoneX() ? viewHeight + 34 : viewHeight}]}>
                {isHintTextShow?<View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 5}}>
                    <Image style={{width: 12, height: 12, marginHorizontal: 5, resizeMode: 'stretch'}} source = {require('../../../img/icon_warring_light.png')} />
                    <Text style = {{fontSize: 12, lineHeight: 13, color: "#999999"}}>{hintText}</Text>
                </View>:<View />}
                <YFWTouchableOpacity style_title={styles.bottomBtmOpacity} title={isInquiryPage?'保存并同意问诊':'完成'} callBack={()=>this._submitMethod()} isEnableTouch = {true} />
            </View>
        )
    }

    checkAuth(info) {
        this.setState({
            isEnableTouch:info.dict_bool_certification == 1
        })
        if (info.dict_bool_certification) {//已认证
            return
        }
        this.realNameAuthAlert&&this.realNameAuthAlert.showView(info.real_name,info.idcard_no,(name,IDCard)=>{
            this.authFromServer({
                id:info.id,
                real_name:name,
                idcard_no:IDCard
            })
        })
    }
    authFromServer(info) {
        let params = new Map()
        params.set('__cmd','person.userdrug.verified')
        params.set('id',info.id)
        params.set('real_name',info.real_name)
        params.set('idcard_no',info.idcard_no)
        let request = new YFWRequestViewModel()
        request.TCPRequest(params,(res)=>{
            if (res.code == -2) {
                if(isNotEmpty(res.msg)){
                    YFWToast(res.msg,{position:kScreenHeight*0.5,duration:4000})
                }
            } else {
                this.realNameAuthAlert&&this.realNameAuthAlert.closeView()
                YFWToast('认证成功')
                DeviceEventEmitter.emit('kChangeUserDrug')
                this.setState({
                    isEnableTouch:true
                })
            }
        },(error)=>{
            if (error&&error.msg) {
                YFWToast(error.msg,{position:kScreenHeight*0.5,duration:4000})
            }
        })
    }

    showMoreDisease() {
        let params = new Map()
        params.set('__cmd','person.cart.get_disease_by_cids')
        params.set('pageIndex',this.pageIndex)
        params.set('rx_cid_items',JSON.stringify(safeObj(this.rx_cid_items)))
        let request = new YFWRequestViewModel()
        request.TCPRequest(params,(res)=>{
            if (res.result) {
                res.result.map((item)=>{
                    let info = {
                        id:item.id,
                        name:item.name,
                    }
                    this.state.sicknessTagDataArray.push(info)
                    this.state.sicknessTagData.add(info)
                })
            }
            this.pageIndex++
            this.setState({
                canShowMore:res.result&&res.result.length >= 10
            })
        },(error)=>{
            if (error&&error.msg) {
                YFWToast(error.msg)
            }
        })
    }

    stopTipAnimation() {
        setTimeout(() => {
            this.setState({
                showAddTip:false
            })
        }, 2500);
    }
    stopEditTipAnimation() {
        setTimeout(() => {
            this.setState({
                showEditTip:false
            })
        }, 2500);
    }

    _submitMethod(){
        let isInquiryPage = this.state.tab == 1;
        let drug = {}
        let isDrug = false
        if (isNotEmpty(this.state.patientData)) {
            isDrug = this.state.patientData.some((item)=>{
                if(item.select){
                    drug = item
                }
                return item.select
            })
        }
        if(!isDrug){
            YFWToast('未添加用药人')
            if (!this.state.showAddTip) {
                this.setState({showAddTip:true})
                this.stopTipAnimation()
            }
            return
        }

        // if (isEmpty(drug.real_name) || isEmpty(drug.idcard_no) || isEmpty(drug.mobile) || isEmpty(drug.relation_label)) {
        //     this.setState({showEditTip:true})
        //     this.stopEditTipAnimation()
        //     return
        // }
        if(isInquiryPage){
            if(isEmpty(this.state.sicknessTag) || this.state.sicknessTag.size == 0){
                YFWToast('请选择确诊疾病')
                return
            } else {
                let medicine_disease_items = this.state.medicine_disease_items
                for (let k of Object.keys(medicine_disease_items)) {
                    let diseaseItemsArray = medicine_disease_items[k];
                    if (isEmpty(diseaseItemsArray)) {
                        diseaseItemsArray = []
                    }
                    let haveSelect = diseaseItemsArray.some((diseaseInfo)=>{
                        if (this.state.sicknessTag) {
                            let allDataArray = Array.from(this.state.sicknessTag)
                            let have = allDataArray.some((item)=>{
                                return !isNaN(parseInt(item.id)) && (parseInt(item.id) ==  parseInt(diseaseInfo.id) && item.namecn == diseaseInfo.namecn)
                            })
                            return have
                        }
                    })
                    if (!haveSelect) {
                        YFWToast('【'+k+'】'+'\r\n'+'未选择确诊疾病')
                        return
                    }
                }

            }
            // if(isEmpty(this.state.diseaseDesc) || this.state.diseaseDesc.length == 0){
            //     YFWToast('未填写确诊疾病症状')
            //     return
            // }
            if(this.state.is_certificate_upload){
                if (isEmpty(this.state.caseImageUri)|| this.state.caseImageUri.length == 0){
                    YFWToast('请上传就诊凭证')
                    return
                }
            }
        } else {
            if(this.isDouble != 1){
                switch (this.state.prescriptionType) {
                    case prescriptionType.Paper:
                        if(isEmpty(this.state.imageUri)|| this.state.imageUri.length == 0){
                            YFWToast('未上传处方')
                            return
                        }
                        break;
                    case prescriptionType.Digital:
                        if(isEmpty(this.state.digitalPrescription)|| isEmpty(this.state.digitalPrescription.inquiryid)){
                            YFWToast('未选择处方')
                            return
                        }
                        break;
                    default:
                }
            }
        }
        let caseImageUri = isNotEmpty(this.state.caseImageUri)?this.state.caseImageUri:[]
        let params = new Map()
        //1.上传处方2.在线问诊3.双轨用药信息登记
        let type = isInquiryPage?2:this.isDouble==1?3:1
        params.set('__cmd','person.order.verificationInquiry')
        params.set('data_info',{
            "cartids":this.cartIDStr,
            "packageids":this.packageIDStr,
            rx_upload_type:type,
            "drugid":drug.id,
            "rx_image":this.state.prescriptionType == prescriptionType.Paper?this.state.imageUri.join('|'):this.state.digitalPrescription.img_url,
            "diseaselist":JSON.stringify(Array.from(this.state.sicknessTag)),
            "case_url":caseImageUri.join('|'),
        })
        let paramObj = new YFWRequestParam();
        let paramMap = paramObj.getBaseParam(params);
        console.log(params)
        try {
            DeviceEventEmitter.emit('LoadProgressShow');
            YFWNativeManager.TCPRequest(strMapToObj(paramMap),(res)=>{
                DeviceEventEmitter.emit('LoadProgressClose');
                if (isNotEmpty(res) && isNotEmpty(res.code)){
                    if (String(res.code) == '1') {
                        this._dealCallBack(drug,type)
                    }else {
                        this._result_process(res)
                    }
                }

            },(error)=>{
                DeviceEventEmitter.emit('LoadProgressClose');
                error&&this._result_process(error)
            });
        }catch (error) {
            DeviceEventEmitter.emit('LoadProgressClose');
            error&&this._result_process(error)
        }

        // let request = new YFWRequestViewModel()
        // request.TCPRequest(params,(res)=>{
        //     this._dealCallBack(drug,type)
        // },(error)=>{
        //     if (error&&error.msg) {
        //         this.rxInfoAlert && this.rxInfoAlert.showView(error.msg)
        //     }
        // })

    }

    _result_process(res){
        let userInfo = new YFWUserInfoManager();
        let errorMsg = isEmpty(safeObj(res).message)?safeObj(res).msg : safeObj(res).message
        res.code = safeObj(res.code);

        this.submitClickable = true;

        if(String(res.code) == '-999' || res.code == -999 ){
            userInfo.clearInfo();
            DeviceEventEmitter.emit('OpenReLoginView');
        } else if(String(res.code) == '-3'){
            if (isNotEmpty(errorMsg) && errorMsg.length > 0){
                this.rxInfoAlert && this.rxInfoAlert.showView(errorMsg)
            }
        } else {
            this.showToast(errorMsg);
        }
    }
    showToast(msg){
        let isShow = true;
        for (let i = 0; i < filterMsg.length; i++) {
            if(msg.includes(filterMsg[i])){
                isShow =false
                break
            }
        }
        if(isShow){
            YFWToast(msg)
        }
    }
    _dealCallBack(drug,type){
        let rxImages = []
        if(this.state.prescriptionType == prescriptionType.Paper){
            rxImages =  this.state.imageUri
        } else {
            rxImages.push(this.state.digitalPrescription.img_url)
        }
        let item = {
            inquiryid: this.state.digitalPrescription.inquiryid,//电子处方id
            rx_images: rxImages,//上传处方图片
            diseaselist:Array.from(this.state.sicknessTag),//线下确诊疾病
            allDiseaselist:this.state.sicknessTagDataArray,//线下确诊疾病
            pageIndex:this.pageIndex,
            canShowMore:this.state.canShowMore?'true':'false',
            drugid:drug.id,//用药人id
            rx_upload_type:type,//页面类型
            prescriptionType:this.state.prescriptionType,//上传处方类型
            case_url:this.state.caseImageUri,//诊断报告
            noProof:this.state.noProof,//无复诊凭证
            disease_desc:this.state.diseaseDesc,//用户疾病主诉
        }
        if (this.props.navigation.state.params && this.props.navigation.state.params.state.value.callBack) {
            this.props.navigation.state.params.state.value.callBack(item);
            this.props.navigation.goBack();
        }
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        flex: 1
    },
    containerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    containerHPadding: {
        flexDirection: 'column',
        alignItems: 'center',
        paddingHorizontal: 13,
    },
    tab: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'white',
        paddingHorizontal: 10,
        height: 34,
    },
    warning: {
        justifyContent: 'center',
        backgroundColor: '#faf8dc',
        paddingHorizontal: 13,
        paddingVertical: 8,
    },
    warningText: {
        fontSize: 12,
        color: "#feac4c"
    },
    functionTitle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: width - 24,
    },
    redText: {
        fontSize: 11,
        lineHeight: 35,
        fontWeight:'bold',
        color: "#ff0000",
    },
    functionTitleText: {
        fontSize: 15,
        lineHeight: 40,
        color: "#333333",
        fontWeight: 'bold',
        paddingRight: 25,
    },
    grayBtn:{
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: 'rgb(204,204,204)',
    },
    grayBtnText:{
        fontSize: 13,
        lineHeight: 16,
        color: "#ffffff",
        marginHorizontal:7,
        fontWeight:'500',
    },
    photoView: {
        width: width - 26,
        marginHorizontal: 13,
        backgroundColor: 'white',
        paddingVertical: 17,
        marginVertical: 5,
        borderRadius: 7,
        elevation: 3,
        shadowColor: "rgba(204, 204, 204, 0.44)",
        shadowRadius: 7,
        shadowOpacity: 1,
        shadowOffset: {width: 0, height: 3}
    },
    typeIconUnselectedView: {
        height: 23,
        width: 92,
        marginLeft: 10,
        marginRight: 5,
        marginTop: 5,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgb(108,217,178)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    typeIconUnselectedText: {
        fontWeight: 'bold',
        fontSize: 11,
        includeFontPadding: false,
        color: "#1fdb9b"
    },
    typeIconSelectedView: {
        height: 37,
        width: 104,
        marginLeft: 5,
        marginTop: 10,
        paddingBottom: 6,
        alignItems: 'center',
        justifyContent: 'center'
    },
    typeIconSelectedText: {
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontSize: 11,
        includeFontPadding: false
    },
    bottomBtmView: {
        width: kScreenWidth,
        alignItems: 'center',
    },
    bottomBtmOpacity:{
        height: 44,
        width: kScreenWidth - 20,
        fontSize: 16
    },
    listItemView: {
        width: kScreenWidth - 24,
        height:(kScreenWidth - 24)/350 * 80,
        marginBottom: 11,
        justifyContent: 'space-between',
        paddingHorizontal:14,
        paddingVertical:20,
        borderRadius: 7,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(204, 204, 204, 0.6)",
        shadowOffset: {
            width: 0,
            height: 3
        },
        elevation: 3,
        shadowRadius: 8,
        shadowOpacity: 1
    },
    listItemTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: "#333333"
    },
    listItemImg: {
        width: (kScreenWidth-26)/2.5 - 30,
        height: (kScreenWidth-26)/2.5 - 30,
        borderRadius: 10,
        backgroundColor:'white',
    },
    listItemImgView: {
        width: (kScreenWidth-26)/2.5 - 30,
        height: (kScreenWidth-26)/2.5 - 30,
        borderRadius: 15,
        backgroundColor:'white',
        justifyContent:'center',
        alignItems:'center'
    },
    listItemImgTouch: {
        width: (kScreenWidth-26)/2.5 - 20,
        height: (kScreenWidth-26)/2.5 - 20,
        borderRadius: 15,
        marginHorizontal:10,
        backgroundColor: "rgb(204,204,204)",
        justifyContent:'center',
        alignItems:'center'
    },
    listItemClickIcon: {
        position: 'absolute',
        resizeMode: 'stretch',
        top: 5,
        right: 5,
        width: 17,
        height: 17
    },
    smallItems:{
        marginVertical:5,
        marginHorizontal:5,
        borderRadius: 17.5,
        backgroundColor: "#e8fbf5",
        lineHeight:30,
        paddingHorizontal:12,
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#1fdb9b",
        fontSize: 12,
        color: "#1fdb9b",
        overflow:'hidden'
    },
    smallUnItems:{
        lineHeight: 30,
        paddingHorizontal:13,
        borderRadius: 15,
        backgroundColor: "#f5f5f5",
        fontSize: 12,
        color: "#666666"
    }
});
const filterMsg = ["下架","error","request","系统","服务","__cmd","undefined","service"]
