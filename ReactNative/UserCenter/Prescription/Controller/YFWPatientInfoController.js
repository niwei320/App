import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet,FlatList,DeviceEventEmitter
} from 'react-native';
import YFWRequestViewModel from "../../../Utils/YFWRequestViewModel";
import {isIphoneX, kScreenWidth, safe,isEmpty} from "../../../PublicModule/Util/YFWPublicFunction";
import YFWTouchableOpacity from "../../../widget/YFWTouchableOpacity";
import YFWToast from "../../../Utils/YFWToast";
import {pushNavigation} from "../../../Utils/YFWJumpRouting";
import YFWRxInfoTipsAlert from "../../../OrderPay/View/YFWRxInfoTipsAlert";
import YFWEmptyView from "../../../widget/YFWEmptyView";
import {darkNomalColor, yfwGreenColor} from "../../../Utils/YFWColor";

let scale = kScreenWidth/360
export default class YFWPatientInfoController extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: '用药人',
        headerRight: <View style = {{width: 40, height: 50}} />
    });

    constructor(parameters) {
        super(parameters);
        this.state = {
            patientData:[],
            refreshing:false,
            deleteID:undefined,
        }
    }

    componentDidMount() {
        this._requestData();
        this.changeUserDrugListener = DeviceEventEmitter.addListener('kChangeUserDrug',()=>{
            this._requestData()
        })
    }

    componentWillUnmount() {
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove();
        }
        this.changeUserDrugListener&&this.changeUserDrugListener.remove()
    }

    /**=== request ===*/
    _requestData(){
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.userdrug.GetListByAccountId');
        viewModel.TCPRequest(paramMap, (res)=> {
            // console.log(JSON.stringify(res))
            this.setState({
                patientData: res.result,
                refreshing: false,
            })
        },(event)=>{
            this.setState({
                refreshing: false,
            })
                YFWToast(JSON.stringify(event))
        })
    }

    _requestDelete(id){
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.userdrug.delete');
        paramMap.set('id', id);
        viewModel.TCPRequest(paramMap, (res)=> {
            this.setState({
                deleteID:undefined,
            })
            this._requestData()
        },(event)=>{
            YFWToast(JSON.stringify(event))
        })
    }

    /**=== method ===*/

    _addMethod(){
        pushNavigation(this.props.navigation.navigate,{type:'prescription_patient_edit',value:{type: 1},callBack:(item)=>{}})
    }

    _editMethod(id){
        pushNavigation(this.props.navigation.navigate,{type:'prescription_patient_edit',value:{type: 2, patient_id: id},callBack:(item)=>{}})
    }
    /**=== render ===*/

    _renderItem(item){
        return (
            <View style={{
                width:scale * 300,
                height:scale * 120,
                margin: scale * 30,
                marginBottom: 0,
                paddingHorizontal:scale * 4,
                paddingVertical:scale * 7,
                borderRadius: 7,
                backgroundColor: '#ffffff',
                shadowColor: "rgba(170, 170, 170, 0.3)",
                shadowOffset: {
                    width: 0,
                    height: 3
                },
                shadowRadius: 7,
                elevation:3,
                shadowOpacity: 1}}>
                <Image style={{
                    position: 'absolute',
                    right:0,
                    top:0,
                    width:scale * 128,
                    height:scale * 68,
                    resizeMode:'contain'
                }} source={require('../../../../img/img_list_item_back.png')}/>

                <View style={{height:scale * 25,flexDirection:'row', justifyContent: 'flex-end', alignItems: 'center',paddingTop:scale * 4}}>
                    <TouchableOpacity activeOpacity={1} hitSlop={{left:0,top:10,bottom:10,right:0}} style={[styles.itemBtm,{borderColor:yfwGreenColor(), marginRight: scale * 8}]} onPress={()=>{this.state.deleteID=item.id;this.rxInfoAlert && this.rxInfoAlert.showView("是否确定删除该用药人信息？")}} isEnableTouch = {true}>
                        <Text style={{color:yfwGreenColor(), fontSize: scale * 12}}>删除</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} hitSlop={{left:0,top:10,bottom:10,right:0}} style={[styles.itemBtm,{borderColor:darkNomalColor(), marginRight: scale * 5}]} onPress={()=>{this._editMethod(item.id)}} isEnableTouch = {true} >
                        <Text style={{color:darkNomalColor(), fontSize: scale * 12,}}>编辑</Text>
                    </TouchableOpacity>
                </View>
                <View style={{height:scale * (120 - 32 * 2 - 5), alignItems:'center',paddingLeft: scale * 20, justifyContent:'space-between'}}>
                    <View style={{flexDirection: 'row', justifyContent:'space-between', alignItems:'flex-end'}}>
                        <Text style={{
                            fontWeight: "bold",
                            fontSize: scale * 19,
                            color: "#666666"}}>{item.real_name}</Text>
                        <View style={{flex:1}}/>
                        <View style={{width: scale * 100,flexDirection: 'row', alignItems:'center'}}>
                            <Image style={{width: scale * 11, height: scale * 10, resizeMode:'contain', marginLeft:scale * 5}}
                                   source={require('../../../../img/icon_user.png')}/>
                            <Text style={{fontSize: scale * 11, color: "#666666",marginLeft:scale * 5}}>{item.dict_sex==1?'男':'女'}</Text>
                            <Text style={{fontSize: scale * 11, color: "#666666",marginLeft:scale * 7}}>{item.age}岁</Text>
                        </View>
                    </View>

                    <View style={{flexDirection: 'row', justifyContent:'space-between'}}>
                        <View style={{flex:1}}>
                            {this.renderTags(item)}
                        </View>
                        <View style={{width: scale * 100,flexDirection: 'row', alignItems:'center'}}>
                            <Image style={{width: scale * 11, height: scale * 10, resizeMode:'contain', marginLeft:scale * 5}}
                                   source={require('../../../../img/icon_phone.png')}/>
                            <Text style={{fontSize: scale * 11, color: "#666666",marginLeft:scale * 5}}>{item.mobile}</Text>
                        </View>
                    </View>
                </View>

            </View>
        )
    }

    renderTags(item){
        // if(isEmpty(item.relation_label) && item.dict_bool_default != 1 && item.dict_bool_certification != 1){
        //     return
        // }
        let tagStr = safe(item.relation_label)
        let tags = []
        let tagWidth = scale * 28;
        let tagHeight = scale * 12;
        if(tagStr.indexOf("本人")!=-1){
            tags.push(<Image style={{width: tagWidth, height: tagHeight,marginRight: 3, resizeMode:'contain'}} source={require('../../../../img/icon_tag_myself.png')}/>)
        } else if(tagStr.indexOf("家属")!=-1){
            tags.push(<Image style={{width: tagWidth, height: tagHeight,marginRight: 3, resizeMode: 'contain'}} source={require('../../../../img/icon_tag_family.png')}/>)
        } else if(tagStr.indexOf("亲戚")!=-1){
            tags.push(<Image style={{width: tagWidth, height: tagHeight,marginRight: 3, resizeMode: 'contain'}} source={require('../../../../img/icon_tag_relative.png')}/>)
        } else if(tagStr.indexOf("朋友")!=-1){
            tags.push(<Image style={{width: tagWidth, height: tagHeight,marginRight: 3, resizeMode: 'contain'}} source={require('../../../../img/icon_tag_friend.png')}/>)
        }
        if(item.dict_bool_default == 1){
            tags.push(<Image style={{width: tagWidth, height: tagHeight,marginRight: 3, resizeMode: 'contain'}} source={require('../../../../img/icon_tag_defualt.png')}/>)
        }
        if(item.dict_bool_certification == 1){
            tags.push(<Image style={{width: tagWidth, height: tagHeight,marginRight: 3, resizeMode: 'contain'}} source={require('../../../../img/icon_tag_certify.png')}/>)
        } else {
            tags.push(<Image style={{width: tagWidth, height: tagHeight,marginRight: 3, resizeMode: 'contain'}} source={require('../../../../img/icon_tag_uncertify.png')}/>)
        }

        return (
            <View style={{flexDirection: 'row',marginTop: 3,overflow:'hidden', }}>
                {tags}
            </View>)
    }

    _renderBottomBtn() {
        return (
            <View style={[styles.bottomBtmView,{height: isIphoneX() ? 70 + 34 : 70}]}>
                <YFWTouchableOpacity style_title={styles.bottomBtm} title={'添加用药人'} callBack={()=>{this._addMethod()}} isEnableTouch = {true} />
            </View>
        )
    }

    render() {
        return (
            <View style={{flex:1,backgroundColor:'#fafafa', alignItems:'center'}}>
                {this.state.patientData.length==0?
                    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                        <YFWEmptyView image = {require('../../../../img/ic_no_footprint.png')}  title={'无用药人信息，请添加'}/>
                    </View>
                    :
                    <FlatList
                        ref={(e) => this._flatlist = (e)}
                        style={{flex:1}}
                        contentContainerStyle={{paddingBottom: scale * 30}}
                        extraData={this.state}
                        data={this.state.patientData}
                        renderItem={(item)=>this._renderItem(item.item)}
                        refreshing = {this.state.refreshing}
                        onRefresh = {()=>{
                            this.setState({refreshing:true})
                            this._requestData()
                        }}
                    />
                }

                {this._renderBottomBtn()}
                <YFWRxInfoTipsAlert ref = {(item) => {this.rxInfoAlert = item}}  actions={[{title:'确定',callBack:()=>{this._requestDelete(this.state.deleteID)}},{title:'取消',callBack:()=>{this.state.deleteID = undefined}}]}/>
            </View>
        )
    }



}

const styles = StyleSheet.create({
    bottomBtm:{
        height: 44,
        width: kScreenWidth - 20,
        fontSize: scale * 16,
        fontWeight: 'bold',
    },
    itemBtm:{
        paddingHorizontal:scale*12,
        height:scale*20,
        borderRadius:scale*12,
        borderWidth:1,
        justifyContent:'center',
        alignItems:'center'
    }
});