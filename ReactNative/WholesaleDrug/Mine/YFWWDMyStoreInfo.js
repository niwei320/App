import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, FlatList,
} from 'react-native';
import {
    adaptSize, isIphoneX,
    itemAddKey,
    kScreenWidth, objToStrMap, safe,
    safeObj
} from "../../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import YFWWDMySupplierModel from "./Model/YFWWDMySupplierModel";
import YFWToast from "../../Utils/YFWToast";
import StatusView from "../../widget/StatusView";
import {YFWImageConst} from "../Images/YFWImageConst";
import LinearGradient from "react-native-linear-gradient";
import BaseTipsDialog from "../../PublicModule/Widge/BaseTipsDialog";

export default class YFWWDMyStoreInfo extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: '企业信息',
        headerRight:<View style={{width:50}}/>
    });

    constructor(props) {
        super(props);
        this.state = {
            data:'',
        }
    }

//----------------------------------------------LIFECYCLE-------------------------------------------

    componentWillMount() {

    }

    componentDidMount() {
        this._requestShopData();
    }

    componentWillUnmount() {

    }

//-----------------------------------------------METHOD---------------------------------------------
    _requestShopData() {
        this.statusView && this.statusView.showLoading();
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.account.getWholeStoreInfo');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap , (res)=>{
                this.statusView && this.statusView.dismiss()
                res.result.licence_list = itemAddKey(res.result.licence_list)
                this.setState({
                    data:res.result
                })
            },
            (error)=>{
                this.statusView && this.statusView.showNetError()
                if(error&&error.msg){
                    this.props.navigation.goBack();
                    YFWToast(error.msg)
                }
            },false)

    }

    _gotoAuth(){
        //todo
    }

//-----------------------------------------------RENDER---------------------------------------------
    _renderWarring() {
        let warring = '未通过企业实名认证，请尽快完成实名认证'
        if(this.state.data.isAuth == 1){
            return null
        } else {
            return (
                <View style={styles.warringView}>
                    <Text style={styles.warringText}>{warring}</Text>
                </View>
            )
        }
    }

    _renderHeader() {
        let idCardNo = safe(this.state.data.idcard_no) //脱敏接口处理 idCardNo.replace(idCardNo.substr(6,8),'*******')
        return (
            <View style={styles.baseInfoView}>
                {this._renderLine("企业名称：",this.state.data.title)}
                {this._renderLine("注册地址：",this.state.data.address)}
                {this._renderLine("管理员：",this.state.data.real_name + '  ' + idCardNo)}
            </View>
        )
    }


    _renderItem(item) {
        let dataMap = objToStrMap(item.item)
        let linesDOM = []
        dataMap.forEach((value, key, map)=> {
            if(key != "名称" && key != "key"){
                linesDOM.push(this._renderLine(key + "：", value))
            }
        })
        return (
            <View style={styles.licenceView}>
                <View style={styles.lineView}>
                    <Image style={styles.titleIcon} source={YFWImageConst.Icon_licence}/>
                    <Text style={styles.titleText}>{dataMap.get("名称")}</Text>
                </View>
                {linesDOM}
            </View>
        )
    }

    _renderLine(title,message) {
        return (
            <View style={styles.lineView}>
                <Text style={styles.headerText}>{title}<Text style={styles.messageText}>{message}</Text></Text>
            </View>
        )
    }

    _renderList() {
        return (
            <FlatList
                extraData={this.state}
                data={this.state.data.licence_list}
                renderItem = {(item)=>this._renderItem(item)}
                ListHeaderComponent={this._renderHeader()}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={<View height={adaptSize(120)}/>}
            />
        )
    }

    _renderButton() {
        if(this.state.data.isAuth == 1){
            return null
        }
        return (
            <TouchableOpacity  style={{kScreenWidth:kScreenWidth-26, paddingHorizontal:13, height: 42,borderRadius: 21, position:'absolute',bottom:isIphoneX()? 60 : 40}}
                               onPress={() => this._gotoAuth()}>
                <LinearGradient
                    style={{flex:1,width:kScreenWidth-52,alignItems:'center',borderRadius: 21,justifyContent:'center',elevation:2}}
                    colors={['#3257ea','#3369ff']}
                    start={{x: 0, y: 1}}
                    end={{x: 1, y: 0}}
                    locations={[0,1]}>
                    <Text style={{fontSize:17,color:'white',fontWeight:'bold'}}>{'立即认证'}</Text>
                </LinearGradient>
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <View style = {styles.root}>
                {this._renderWarring()}
                {this._renderList()}
                {this._renderButton()}
                <StatusView ref={(item)=>this.statusView = item}
                            retry={()=>{this._requestShopData()}}
                            navigation={this.props.navigation}/>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: "#fafafa"
    },
    warringView: {
        backgroundColor: "#fff3da",
        paddingHorizontal: 14,
        paddingVertical: 9,
        width:kScreenWidth
    },
    warringText: {
        fontSize: 12,
        color: "#fc9924",
    },
    baseInfoView: {
        width: kScreenWidth - 26,
        marginHorizontal:13,
        marginTop:20,
        paddingHorizontal:10,
        paddingVertical:22,
        borderRadius: 7,
        backgroundColor: "#f5f5f5"
    },
    licenceView: {
        width: kScreenWidth - 26,
        marginHorizontal:13,
        marginTop:20,
        paddingHorizontal:10,
        paddingVertical:15,
        borderRadius: 7,
        backgroundColor: "#ffffff"
    },
    lineView:{
        flexDirection: 'row',
        alignItems:'center',
        marginVertical: 4,
    },
    titleIcon:{
        width: 11,
        height: 11,
        resizeMode: 'stretch'
    },
    titleText: {
        paddingLeft:8,
        fontSize: 14,
        lineHeight:20,
        fontWeight:'bold',
        includeFontPadding:false,
        color: "#547cff",
    },
    headerText: {
        fontSize: 13,
        lineHeight:20,
        includeFontPadding:false,
        color: "#999999",
    },
    messageText: {
        fontSize: 13,
        includeFontPadding:false,
        color: "#333333",
    }
});