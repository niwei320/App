import React, { Component } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    StyleSheet,
} from 'react-native'
import YFWPopupWindow from '../../PublicModule/Widge/YFWPopupWindow'
import YFWTouchableOpacity from '../../widget/YFWTouchableOpacity'
import {darkTextColor, yfwLineColor, darkNomalColor, yfwGreenColor} from '../../Utils/YFWColor'
import {kScreenHeight, safe, safeObj, isEmpty, kScreenWidth, isNotEmpty} from "../../PublicModule/Util/YFWPublicFunction";
import YFWToast from '../../Utils/YFWToast'
import YFWSicknessAddModal from './YFWSicknessAddModal'
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';

export default class YFWPatientSicknessModal extends Component {

    constructor(props) {
        super(props);

        this.state ={
            isShowToast: false,
            toastTitle: '',
            dataSource: [
                {
                    id: 0,
                    title: '过往病史',
                    isSickness: false,
                    selected_index: 1,
                    type: 1, // 1.有、无 2.正常、异常
                    sickness_list: [], // 选择的过往病史
                    items: [], // 过往病史数据源
                },
                {
                    id: 1,
                    title: '过敏史',
                    isSickness: false,
                    selected_index: 1,
                    type: 1,
                    sickness_list: [], // 选择的过敏史
                    items: [], // 过敏史数据源
                },
                {
                    id: 2,
                    title: '家族病史',
                    isSickness: false,
                    selected_index: 1,
                    type: 1,
                    sickness_list: [], // 选择的家族病史
                    items: [], // 家族病史数据源
                },
                {
                    id: 3,
                    title: '肝功能',
                    isSickness: false,
                    selected_index: 1,
                    type: 2,
                },
                {
                    id: 4,
                    title: '肾功能',
                    isSickness: false,
                    selected_index: 1,
                    type: 2,
                },
                {
                    id: 5,
                    title: '妊娠哺乳',
                    isSickness: false,
                    selected_index: 1,
                    type: 1,
                },
            ]
        }
    }

    componentWillReceiveProps(newProps) {
        console.log(newProps)
        let sickness_history = newProps.sickness
        if(isNotEmpty(sickness_history)) {
            this.state.dataSource[0].isSickness = sickness_history.isMedical
            this.state.dataSource[0].selected_index = sickness_history.isMedical ? 0 : 1
            this.state.dataSource[0].items = this._dealPropsData(sickness_history.medical_history)
            this.state.dataSource[0].sickness_list = this._dealPropsData(sickness_history.medical_history)
            this.state.dataSource[1].isSickness = sickness_history.isAllergy
            this.state.dataSource[1].selected_index = sickness_history.isAllergy ? 0 : 1
            this.state.dataSource[1].items = this._dealPropsData(sickness_history.allergy_history)
            this.state.dataSource[1].sickness_list = this._dealPropsData(sickness_history.allergy_history)
            this.state.dataSource[2].isSickness = sickness_history.isFamily
            this.state.dataSource[2].selected_index = sickness_history.isFamily ? 0 : 1
            this.state.dataSource[2].items = this._dealPropsData(sickness_history.family_history)
            this.state.dataSource[2].sickness_list = this._dealPropsData(sickness_history.family_history)
            this.state.dataSource[3].isSickness = sickness_history.liver
            this.state.dataSource[3].selected_index = sickness_history.liver ? 0 : 1
            this.state.dataSource[4].isSickness = sickness_history.renal
            this.state.dataSource[4].selected_index = sickness_history.renal ? 0 : 1
            this.state.dataSource[5].isSickness = sickness_history.nurse
            this.state.dataSource[5].selected_index = sickness_history.nurse ? 0 : 1

            this.setState({})
        }
    }

    _dealPropsData(content) {
        let items = safe(content).length > 0 ? content.split('|') : []
        let sickness_list = []
        if(items.length > 0) {
            items.forEach((value, index) => {
                sickness_list.push({
                    id: index,
                    title: value,
                    isSelected: true
                })
            })
        }
        return sickness_list
    }

    componentDidMount() {
        let params = new Map();
        params.set('__cmd','guest.allergy.getHotTop');
        let request = new YFWRequestViewModel()

        request.TCPRequest(params,(res)=>{
            console.log(res)
            let dataSource = []
            res.result&&res.result.map((info)=>{
                dataSource.push(
                    {title:info.allergy_name,id:info.id,isSelected:false}
                )
            })
            this.state.dataSource[1].items = dataSource
            this.setState({})
        })
    }

    componentWillUnmount() {
        if(this.timer) {
            clearTimeout(this.timer)
        }
    }

    render() {
        return(
            <YFWPopupWindow
                ref={(c) => this.modalView = c}
                onRequestClose={() => {}}
                popupWindowHeight={kScreenHeight*0.6}
            >
                {this._renderTitleView()}
                {this._renderContentList()}
                {this._renderBottomButton()}
                {this._renderToast()}
                <YFWSicknessAddModal ref={(e) => this.sicknessAddModal = e} callBack={(sickness) => {this._addSicknessCallBack(sickness)}}/>
            </YFWPopupWindow>
        )
    }

    // 标题行
    _renderTitleView() {
        return(
            <View style={{width: kScreenWidth, height: 44, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <View style={{width: 44, height: 44}}></View>
                <Text style={{color: darkTextColor(), fontSize: 15, fontWeight: '500'}}>疾病史</Text>
                <TouchableOpacity onPress={() => {this.disMiss()}} activeOpacity={1} style={{width: 44, height: 44, alignItems: 'center', justifyContent: 'center'}}>
                    <Image source={require('../../../img/close_button.png')} style={{width: 15, height: 15, resizeMode: 'stretch'}}></Image>
                </TouchableOpacity>
            </View>
        )
    }

    // 内容列表
    _renderContentList() {
        return(
            <View style={{flex: 1, paddingHorizontal: 13}}>
                <FlatList
                    data = {this.state.dataSource}
                    extraData = {this.state}
                    renderItem = {this._renderItemCell.bind(this)}
                    keyExtractor = {(item, index) => index}
                />
            </View>
        )
    }

    // cell
    _renderItemCell({item}) {
        return(
            <View>
                <View style={{height: 41, paddingLeft: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Text style={{fontSize: 13, fontWeight: '500', color: darkTextColor()}}>{item.title}</Text>
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
                        {this._renderCheckBox(item, 0)}
                        {this._renderCheckBox(item, 1)}
                    </View>
                </View>
                {this._renderLine()}
                {this._renderSicknessView(item)}
            </View>
        )
    }

    // 单选框
    _renderCheckBox(model, index) {
        let selected = model.selected_index == index
        let title = model.type == 1 ? (index==0 ? '有' : '无') : (index==0 ? '异常' : '正常')
        let right = index==0 ? 14 : 0
        return(
            <TouchableOpacity onPress={() => {this._changeSicknessState(model, index)}} activeOpacity={1} style={{height: 40, flexDirection: 'row', alignItems:'center', justifyContent: 'center', marginRight: right}}>
                <View style={{width: 20, height: 20, justifyContent: 'center', alignItems: 'flex-end', marginRight: 5}}>
                    {selected ?
                        <Image source={require('../../../img/icon_coupon_select.png')} style={{width: 20, height: 20, resizeMode: 'stretch'}}/>:
                        <Image source={require('../../../img/check_discheck.png')} style={{width: 16, height: 16, resizeMode: 'stretch'}}/>
                    }
                </View>
                <Text style={{color: darkTextColor(), fontSize: 13, width: 45}}>{title}</Text>
            </TouchableOpacity>
        )
    }

    // 疾病wrap
    _renderSicknessView(model) {
        if(model.isSickness && model.items) {

            return(
                <View style={{flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 9, paddingVertical: 5}}>
                    {this._renderSicknessWrap(model)}
                </View>
            )
        }else {

            return <View/>
        }
    }

    // 疾病wrap
    _renderSicknessWrap(model) {
        let items = []

        model.items.forEach(element => {
            items.push(
                this._renderSicknessItem(element, model)
            )
        });

        items.push(
            this._renderSicknesssAddButton(model)
        )

        return items
    }

    // 疾病item
    _renderSicknessItem(item, model) {
        return(
            <TouchableOpacity onPress={() => {this._selectSickness(item, model)}} activeOpacity={1} style={item.isSelected ? styles.sicknessButtonSelected : styles.sicknessButtonNormal}>
                <Text style={item.isSelected ? styles.sicknessTitleSelected : styles.sicknessTitleNormal}>{item.title}</Text>
            </TouchableOpacity>
        )
    }

    // 添加疾病按钮
    _renderSicknesssAddButton(model) {
        return(
            <TouchableOpacity onPress={() => {this._addSickness(model)}} activeOpacity={1} style={styles.sicknessAddButton}>
                <Text style={styles.sicknessAddTitle}>+</Text>
            </TouchableOpacity>
        )
    }

    // 分割线
    _renderLine() {
        return(
            <View style={{height: 0.5, backgroundColor: yfwLineColor()}}></View>
        )
    }

    // toast
    _renderToast() {
        if(this.state.isShowToast) {
            return(
                <View style={{position: 'absolute', width: 130, left: (kScreenWidth-130)/2, top: 100, paddingVertical: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 4,}}>
                    <Text style={{fontSize: 13, color: '#fff', fontWeight: '500', textAlign: 'center'}}>{this.state.toastTitle}</Text>
                </View>
            )
        }else {
            return <View/>
        }
    }

    // 完成按钮
    _renderBottomButton() {
        return(
            <View style={{paddingVertical: 20, alignItems: 'center'}}>
                <YFWTouchableOpacity title={'完成'} isEnableTouch={true} callBack={() => {

                    if(this.state.dataSource[0].isSickness && this.state.dataSource[0].sickness_list.length == 0){
                        this._showToast('请添加过往疾病史')
                    } else if(this.state.dataSource[1].isSickness && this.state.dataSource[1].sickness_list.length == 0){
                        this._showToast('请添加过敏史')
                    } else if(this.state.dataSource[2].isSickness && this.state.dataSource[2].sickness_list.length == 0){
                        this._showToast('请添加家族病史')
                    } else {
                        this.disMiss();
                        if(this.props.callBack) {
                            let data = this._dealCallBackData()
                            this.props.callBack(data)
                        }
                    }
                }}/>
            </View>
        )
    }

    // 无疾病toast
    _showToast(title) {
        if(this.state.isShowToast) {
            clearTimeout(this.timer)
        }
        this.state.isShowToast = true
        this.state.toastTitle = title
        this.setState({})
        this.timer = setTimeout(() => {
            this.state.isShowToast = false
            this.state.toastTitle = ''
            this.setState({})
        },2000)
    }

    // 疾病史数据处理
    _dealCallBackData() {
        // 过往病史
        let medical = ''
        if(this.state.dataSource[0].isSickness && this.state.dataSource[0].sickness_list.length > 0){
            this.state.dataSource[0].sickness_list.forEach((value, index) => {
                medical = medical + value.title + (index+1 < this.state.dataSource[0].sickness_list.length ? '|' : '')
            })
        }

        // 过敏史
        let allergy = ''
        if(this.state.dataSource[1].isSickness && this.state.dataSource[1].sickness_list.length > 0){
            this.state.dataSource[1].sickness_list.forEach((value, index) => {
                allergy = allergy + value.title + (index+1 < this.state.dataSource[1].sickness_list.length ? '|' : '')
            })
        }

        // 家族病史
        let family = ''
        if(this.state.dataSource[2].isSickness && this.state.dataSource[2].sickness_list.length > 0){
            this.state.dataSource[2].sickness_list.forEach((value, index) => {
                family = family + value.title + (index+1 < this.state.dataSource[2].sickness_list.length ? '|' : '')
            })
        }

        // 是否有疾病
        let isSickness = false
        this.state.dataSource.forEach((value) => {
            if(value.isSickness) {
                isSickness = true
            }
        })

        let sickness_history = {
            isSickness: isSickness,
            isMedical: this.state.dataSource[0].isSickness,
            medical_history: medical,
            isAllergy: this.state.dataSource[1].isSickness,
            allergy_history: allergy,
            isFamily: this.state.dataSource[2].isSickness,
            family_history: family,
            liver: this.state.dataSource[3].isSickness,
            renal : this.state.dataSource[4].isSickness,
            nurse: this.state.dataSource[5].isSickness,
        }

        return sickness_history
    }

    // 切换有无疾病
    _changeSicknessState(model, index) {
        if(model.selected_index == index) {

            return
        }else {
            let isSickness = this.state.dataSource[model.id].isSickness
            this.state.dataSource[model.id].selected_index = index
            this.state.dataSource[model.id].isSickness = !isSickness

            this.setState({})
        }
    }

    // 选中疾病
    _selectSickness(item, model) {

        if(item.isSelected) {
            let index = model.sickness_list.indexOf(item)
            model.sickness_list.splice(index, 1)
        }else {
            model.sickness_list.push(item)
        }

        item.isSelected = !item.isSelected

        this.setState({})
    }

    // 添加疾病
    _addSickness(model) {
        this.sicknessModel = model
        this.sicknessAddModal && this.sicknessAddModal.show(model.title == '过敏史')
    }

    // 添加疾病回调方法
    _addSicknessCallBack(sickness) {
        if(this.sicknessModel.items.length > 0) {
            let isAddSickness = true
            this.sicknessModel.items.forEach(value => {
                if(value.title == sickness.title) {
                    isAddSickness = false
                }
            })

            if(!isAddSickness) {
                return
            }
        }
        sickness.isSelected = true
        sickness.id = this.sicknessModel.items.length
        this.sicknessModel.items.push(sickness)
        this.sicknessModel.sickness_list.push(sickness)
        this.setState({})
    }

    // 弹出modal
    show() {
        this.modalView && this.modalView.show()
    }

    // 消失modal
    disMiss() {
        this.modalView && this.modalView.disMiss()
    }
}

const styles = StyleSheet.create({
    sicknessButtonNormal: {
        borderRadius: 20,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        marginHorizontal: 7,
        marginVertical: 5,
        backgroundColor: "#f5f5f5",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#f5f5f5"
    },
    sicknessTitleNormal: {
        color: darkNomalColor(),
        fontSize: 12,
        fontWeight: '200'
    },
    sicknessButtonSelected: {
        borderRadius: 20,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        marginHorizontal: 7,
        marginVertical: 5,
        backgroundColor: "#e8fbf5",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: yfwGreenColor()
    },
    sicknessTitleSelected: {
        color: yfwGreenColor(),
        fontSize: 12,
        fontWeight: '500'
    },
    sicknessAddButton: {
        borderRadius: 20,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 15,
        marginHorizontal: 7,
        marginVertical: 5,
        borderWidth: 1,
        borderColor: yfwGreenColor(),
    },
    sicknessAddTitle: {
        color: yfwGreenColor(),
        fontSize: 30,
        fontWeight: '500',
        lineHeight: 30
    }
})