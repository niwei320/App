import React, { Component } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    SectionList,
    Platform,
    NativeModules,
    StyleSheet,
    ScrollView
} from 'react-native'
import {darkTextColor, yfwLineColor, backGroundColor, yfwGreenColor, darkLightColor} from '../../Utils/YFWColor'
import {safe, safeObj, adaptSize} from '../../PublicModule/Util/YFWPublicFunction'
import YFWTitleView from '../../PublicModule/Widge/YFWTitleView'
import YFWDoctorAptitudeModal from './YFWDoctorAptitudeModal'
import BigPictureView from '../../widget/BigPictureView';
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';
const {StatusBarManager} = NativeModules;

export default class YFWPrescriptionAuditResultController extends Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: '处方信息',
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            backgroundColor: '#fff',
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : {borderBottomColor: 'white', borderBottomWidth: 0, backgroundColor: '#fff',},
        headerRight: <View style={{width:50}}/>,
    });

    constructor(props) {
        super(props);

        this.state = {
            headerData: {},
            dataSource: [],
            bigImage:[],
            refreshing:false,
        }
    }

    componentDidMount() {
        let data = this.props.navigation.state.params.state.value
        this.orderNo = this.props.navigation.state.params.state.orderNo
        this.requestData()
    }

    // 获取数据
    _fetchData(data) {
        this._handleBigImageArray(data.image_url)
        let headerData = {
            title: '审核状态:',
            content:'',
            status: '', // 待开处方 处方已开未审核 审核通过 审核失败
            image_url: data.image_url // 处方图片
        }
        let dataSource = [
            {
                id: 0,
                key: 'patient',
                title: '用药人信息',
                width: 92,
                data: [
                    this._setItemModel(0, '姓名', data.medicate_name),
                    this._setItemModel(1, '身份证号码', data.medicate_idcardno),
                    this._setItemModel(2, '性别', data.medicine_sex==1?'男':'女'),
                    this._setItemModel(3, '年龄', data.medicate_age),
                    // this._setItemModel(4, '体重', data.medicate_weight==0?'':data.medicate_weight+'kg'),
                ]
            }
        ]
        if(safe(data.medicate_weight) != ''&&data.medicate_weight != 0){
            dataSource[0].data.push(this._setItemModel(4, '体重', data.medicate_weight+'kg'))
        }
        if(safe(data.audit_real_name) != ''){
            dataSource.push(
                {
                    id: 1,
                    key: 'doctor',
                    title: '审方信息',
                    width: 72,
                    data: [
                        this._setItemModel(0, '审方药师', data.audit_real_name),
                        this._setItemModel(1, '审方记录',data.audit_time),
                        this._setItemModel(1, '审方结果',data.audit_content),
                    ]
                }
            )
        }

        this.setState({
            headerData: headerData,
            dataSource: dataSource
        })
    }

    _handleDate(date){
        if(date.indexOf('1900')==-1){
            return date
        }else{
            return ''
        }
    }

    _handleRxImage(image){
        if(safe(image) == '') {
            return
        }
        let strCount = this._strPatch('http',safe(image))
        let imageStr = ''
        if(strCount == 2){
            imageStr = safe(image).replace('http://c1.yaofangwang.net/','')
        }else{
            imageStr = image
        }
        return imageStr
    }

     _strPatch(re,s){
      re=eval("/"+re+"/ig")
      let a = s.match(re) || []
      return a.length;
    }

    _handleAge(idNumer){
        if(safe(idNumer) == ''){
            return ''
        }
        let year = idNumer.substr(6, 4)
        let month = idNumer.substr(10, 2)
        let day = idNumer.substr(12, 2)
        let sex = idNumer.substr(16, 1)

        return this._dealBirthdayAndAge(year, month, day)
    }

    _dealBirthdayAndAge(year, month, day) {
        let currentDate = new Date()
        let currentYear = currentDate.getFullYear()
        let currenMonth = currentDate.getMonth()
        let currenDay = currentDate.getDay()
        let age = currentYear - parseInt(year)
        if((currenMonth*100+currenDay) > (parseInt(month)*100+parseInt(day))) {
            age += 1
        }

       return age
    }

    _setItemModel(id, title, content) {
        return {
            id: id,
            title: title,
            content: content,
        }
    }

    render() {
        return(
            <View style={{flex: 1, backgroundColor: '#fff'}}>
                <SectionList
                    sections={this.state.dataSource}
                    extraData={this.state}
                    ListHeaderComponent={this._renderListHeader.bind(this)}
                    renderSectionHeader={this._renderSectionHeader.bind(this)}
                    renderItem={this._renderItemCell.bind(this)}
                    stickySectionHeadersEnabled={false}
                    refreshing = {this.state.refreshing}
                    onRefresh = {()=>{this.setState({refreshing:true});this.requestData()}}
                />
                <YFWDoctorAptitudeModal ref={(e) => this.doctorModal = e}/>
                <BigPictureView ref={(view)=>{this.picView = view}}/>
            </View>
        )
    }

    // 表头
    _renderListHeader() {
        return(
            <View style={{paddingHorizontal: 13, backgroundColor: backGroundColor(), marginBottom: 10}}>
                <View style={{paddingVertical: 15, flexDirection: 'row', alignItems: 'flex-start'}}>
                    {/* <Text style={{fontSize: adaptSize(11), fontWeight: '500', color: darkTextColor()}}>
                        {this.state.headerData.title+'  '}
                        <Text style={{color: this.state.headerData.status != 2 ? yfwGreenColor() : '#ca0000'}}>{this.state.headerData.content}</Text>
                        </Text> */}
                </View>
                {
                    this.state.headerData.image_url&&this.state.headerData.image_url.length>0?
                    <View style={[styles.borderShadow, {paddingHorizontal: 10, paddingVertical: 15, height: adaptSize(188), backgroundColor: '#fff', zIndex: 10}]}>
                        <Text style={{fontSize: adaptSize(15), color: darkTextColor(), fontWeight: '500', textAlign: 'left'}}>处方图片</Text>
                        <ScrollView style={{flex:1,height:adaptSize(130)}}
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                alwaysBounceHorizontal={true}>
                            <View style={{width:adaptSize(80),height:adaptSize(130)}}/>
                            {this._hendleRxImagesView(this.state.headerData.image_url)}

                        </ScrollView>
                    </View>:null
                }
                {
                    this.state.headerData.image_url&&this.state.headerData.image_url.length>0?<View style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 50, backgroundColor: '#fff'}}/>:null
                }
            </View>
        )
    }

    _hendleRxImagesView(array){
        let data = array || []
        let returnArray = []
        data.forEach((value,index) => {
            returnArray.push(
                <TouchableOpacity activeOpacity={1} style={{justifyContent: 'center', alignItems: 'center', flex: 1}} onPress={()=>{
                    this.picView.showView(this.state.bigImage,index)
                }}>
                    <Image style={{width: adaptSize(160), height: adaptSize(130), resizeMode: 'contain'}} source={{uri:this._handleRxImage(value)}}></Image>
                </TouchableOpacity>
            )
        });
        return returnArray
    }

    _handleBigImageArray(array){
        let data = array || []
        let returnArray = []
        data.forEach(element => {
            returnArray.push({url:element})
        });
        this.state.bigImage = returnArray
    }

    // 区头
    _renderSectionHeader({section}) {
        return (
            <View style={{backgroundColor: '#fff', paddingLeft: 13, paddingTop: 20}}>
                <YFWTitleView title={section.title} style_title={{width: adaptSize(section.width), fontSize: adaptSize(15)}}></YFWTitleView>
            </View>
        )
    }

    // cell
    _renderItemCell({item}) {
        return(
            <TouchableOpacity onPress={() => {this._lookDoctorAptitue(item)}} activeOpacity={1} style={{height: adaptSize(41)}}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: adaptSize(40), paddingHorizontal: 27,}}>
                    <Text style={{color: darkLightColor(), fontSize: adaptSize(13)}}>{item.title}</Text>
                    {this._renderDoctorAptitude(item)}
                    <Text style={{color: darkTextColor(), fontSize: adaptSize(13)}}>{item.content}</Text>
                </View>
                {this._renderLine()}
            </TouchableOpacity>
        )
    }

    //药师资质证书
    _renderDoctorAptitude(item) {
        if(item.title == '审方药师'){

            return(
                <View style={{flex: 1, alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 10}}>
                    <Image source={require('../../../img/prescription_doctor_aptitude.png')} style={{width: adaptSize(53), height: adaptSize(14), resizeMode: 'contain'}}></Image>
                </View>
            )
        }else {
            return <View/>
        }
    }

    // 分割线
    _renderLine() {
        return(
            <View style={{marginLeft: 13, height: 0.5, backgroundColor: yfwLineColor()}}></View>
        )
    }

    // 查看药师资质证书
    _lookDoctorAptitue(item) {
        if(item.title == '审方药师'){

            // this.doctorModal && this.doctorModal.show()
        }
    }

    requestData(){
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.order.getPreDetailInfo');
        paramMap.set('orderno', this.orderNo);
        viewModel.TCPRequest(paramMap, (res)=> {
            this._fetchData(safeObj(res.result))
            this.setState({refreshing:false})
        })
    }
}

const styles = StyleSheet.create({
    borderShadow: {
        borderRadius: 7,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(204, 204, 204, 0.5)",
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowRadius: 5,
        shadowOpacity: 1,
        elevation: 2,
    },
})