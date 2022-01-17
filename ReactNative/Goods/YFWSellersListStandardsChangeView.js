import React, {Component} from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    Image,
    Button,
    ScrollView,
    TouchableOpacity,
    Dimensions, ListView,
    ImageBackground
} from 'react-native';

const {width, height} = Dimensions.get('window');
import {
    darkNomalColor, darkTextColor, darkLightColor, separatorColor, yfwGreenColor,
    backGroundColor
} from "../Utils/YFWColor";
import ModalView from '../widget/ModalView'
import {isEmpty, isIphoneX, safeObj, tcpImage, kScreenWidth, isNotEmpty,coverAuthorizedTitle} from '../PublicModule/Util/YFWPublicFunction'
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import YFWPrescribedGoodsTitle, {
    TYPE_DOUBLE,
    TYPE_NOMAL,
    TYPE_PRESCRIPTION,
    TYPE_SINGLE,
    TYPE_OTC
} from "../widget/YFWPrescribedGoodsTitle";
import { pushNavigation } from '../Utils/YFWJumpRouting';

export default class YFWSellersListStandardsChangeView extends Component {

    static defaultProps = {
        Data: undefined,
        standards: new Array(),
    }

    constructor(props) {
        super(props);
        this.state = {
            selectIndex: 0,
            visible: false
        };
    }

    closeModal() {
        this.modalView && this.modalView.disMiss()
        this.props.dismiss&&this.props.dismiss()
        this.setState({
            visible: false
        })
    }

    show() {
        this.modalView && this.modalView.show()
        this.setState({
            visible: true
        })
    }

    render() {
        if(isEmpty(this.props.Data) || Object.keys(isEmpty(this.props.Data)?{}:this.props.Data).length === 0){
            return <View />
        }
        return (
            <ModalView ref={(c) => this.modalView = c}
                transparent={true}
                animationType='slide'
                visible={this.state.visible}
                onRequestClose={() => this.closeModal()}>
                <View style={{flex:1}}>
                    <TouchableOpacity style={{flex:1}} activeOpacity={1} onPress={()=>this.closeModal()}/>
                    <View style={{width:width,height:400,backgroundColor:'white',borderRadius:7}}>
                    <TouchableOpacity hitSlop={{left:10,top:10,bottom:10,right:10}} onPress={()=>this.closeModal()} style={{marginTop:16,marginLeft:kScreenWidth-14-19}}>
                         <Image style={{width:14,height:14} } source={require('../../img/close_button.png')}/>
                     </TouchableOpacity>
                        <View style={{flexDirection:'row',height:100,marginTop:13}}>
                            <Image
                                style={styles.iconStyle}
                                source={{uri:tcpImage(this.props.Data.img_url)}}
                            />
                            <View style={{marginLeft:20,marginRight:3,flex:1}}>
                                {this.renderTitleView()}
                                <Text style={[styles.textStyle,{marginTop:9}]}>{this.props.Data.authorizedCode_title}:<Text style={{color:'#333'}}>{this.props.Data.authorized_code}</Text></Text>
                            </View>
                        </View>
                        <ScrollView>
                            {this.renderItem()}
                        </ScrollView>
                    </View>
                </View>
            </ModalView>
        );
    }
    renderTitleView() {
        //单双轨3.1.00版本才有，并且现阶段只有HTTP才有
        //单轨药
        if(safeObj(this.props.Data).PrescriptionType+"" === "1"){
            return this.rednerPrescriptionLabel(TYPE_SINGLE,this.props.Data.title,()=>{this.showPrescribedTips()})
        }
        //双轨药
        else if(safeObj(this.props.Data).PrescriptionType+"" === "2"){
            return this.rednerPrescriptionLabel(TYPE_DOUBLE,this.props.Data.title,()=>{this.showPrescribedTips()})
        }
        //OTC
        else if(safeObj(this.props.Data).PrescriptionType+"" === "0"){
            return this.rednerPrescriptionLabel(TYPE_OTC,this.props.Data.title,()=>{this.showPrescribedTips()})
        }
        else {
            return <Text style={{
                fontSize: 15,
                color: '#000',
                fontWeight:'bold',
                marginLeft: 0,
                marginRight:5,
                lineHeight:17,
                width: Dimensions.get('window').width - 120,
            }}>{safeObj(this.props.Data).title}</Text>
            // return this.rednerPrescriptionLabel(TYPE_NOMAL,safeObj(this.props.Data).title)
        }
    }

    /**
     * 返回处方标签
     * @param img
     * @returns {*}
     */
    rednerPrescriptionLabel(type,title,onClick){

        return <YFWPrescribedGoodsTitle
            type={type}
            title={title}
            style={{
                fontSize: 15,
                color: '#000',
                fontWeight:'bold',
                marginLeft: 0,
                lineHeight:17
            }}
            onClick={()=>{onClick && onClick()}}
        />
    }

    /**
     * 跳转H5单双轨说明
     */
    showPrescribedTips(){
        if(isNotEmpty(this.props.Data.prompt_url)){
            this.closeModal()
            pushNavigation(this.props.navigation.navigate,{type:'get_h5',value:this.props.Data.prompt_url,title:'H5单双轨说明页'})
        }
    }

    /**
     * 组装标题
     * @returns {*}
     */
    assembleTitle(){
        return this.props.Data.title
    }

    renderItem() {
        // 数组
        var itemAry = [];

        //保证数组不为空
        if(isEmpty(this.props.standards)){
            this.props.standards = []
        }

        //把数组的内容转移到新数组
        this.standards = [...this.props.standards]

        if(YFWUserInfoManager.defaultProps.isRequestTCP){
            //TCP没有返回当前规格，需要自己手动添加自己到第一位
            this.standards.unshift({
                id:safeObj(this.props.Data).goods_id,
                standard:safeObj(this.props.Data).standard,
            })
        }

        // 遍历
        for (let i = 0; i < this.standards.length; i++) {
            let dataItem = this.standards[i]

            if (i===this.state.selectIndex){
                let height = (kScreenWidth-10)/350*67;
                itemAry.push(
                    <TouchableOpacity key={i+'c'} activeOpacity={1} onPress={()=>this.clickItemSelect(i)}>
                        <ImageBackground style={{resizeMode:'cover',justifyContent:'space-between',marginHorizontal:5,flexDirection:'row',alignItems:'center',width:kScreenWidth-10,height:height,paddingBottom:3/67*(height)}}
                                        source={require('../../img/button_card.png')}>
                            <View style={{justifyContent:'center',marginLeft:22,minWidth:150,flex:1}}>
                                <Text style={{color:'#FFF',fontSize:15,fontWeight:'500'}}>{dataItem.standard}</Text>
                            </View>
                            <View style={{justifyContent:'center',width:20,marginRight:20}}>
                                <Image style={{width:20,height:20}} resizeMode={'contain'} source={require('../../img/chooseBtnWhite.png')}/>
                            </View>
                        </ImageBackground>
                    </TouchableOpacity>
                );
            } else {
                //未选择情况, 按钮背景切图不带阴影,切图大小不一致
                let height = (kScreenWidth-10)/350*67;
                let marginAdd = 7/350*(kScreenWidth-10);
                let marginTop = 2/350*(kScreenWidth-10);
                let marginBottom = 9/350*(kScreenWidth-10);
                itemAry.push(
                    <TouchableOpacity key={i+'v'} activeOpacity={1} onPress={()=>this.clickItemSelect(i)}>
                        <View style={{
                            backgroundColor:backGroundColor(),
                            justifyContent:'space-between',
                            marginHorizontal:5 + marginAdd,
                            marginTop: marginTop,
                            marginBottom: marginBottom,
                            flexDirection:'row',
                            alignItems:'center',
                            width:kScreenWidth - 10 - marginAdd * 2,
                            height:height-marginTop-marginBottom,
                            borderRadius: 7,
                            borderStyle: "solid",
                            borderWidth: 1,
                            borderColor: "#1fdb9b"}}>
                            <View style={{justifyContent:'center',marginLeft:22-marginAdd,minWidth:150,flex:1}}>
                                <Text style={{color:yfwGreenColor(),fontSize:15,fontWeight:'500'}}>{dataItem.standard}</Text>
                            </View>
                            <View style={{flex:1}}></View>
                            <View style={{justifyContent:'center',width:20,marginRight:14}}>
                                <Image style={{width:20,height:20}} resizeMode={'contain'} source={require('../../img/checkout_unsel.png')}/>
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            }


        }
        return itemAry;
    }


    _getChooseImage(index) {

        var unchooseBtn = require('../../img/unChooseBtn.png');
        var chooseBtn = require('../../img/chooseBtn.png');
        if (this.state.selectIndex === index) {
            <Image style={styles.icon2Style} source={chooseBtn}/>
        } else {
            <Image style={styles.icon2Style} source={unchooseBtn}/>
        }

    }

    // @ Method @ ----------------------------------
    clickConfirm() {
        this.closeModal();
        let item = this.standards[this.state.selectIndex]
        if(safeObj(item).id == safeObj(this.props.Data).goods_id){
            return
        }
        this.props.changeStandarsMethod(item);

    }


    clickItemSelect(index) {

        this.setState({
            selectIndex: index,
        });
        this.state.selectIndex = index;
        this.clickConfirm()

    }


}


//设置样式
const styles = StyleSheet.create({

    container: {
        flex: 1,
        height: 250,
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        backgroundColor: 'white',

    },
    iconStyle: {
        width: 80,
        height: 80,
        marginBottom: 10,
        marginLeft: 10,
        marginTop: 10,
        resizeMode: 'contain',
    },
    titleStyle: {
        fontSize: 15,
        width: Dimensions.get('window').width - 120,
        color: darkTextColor(),
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
    },
    textStyle: {
        fontSize: 12,
        textAlign: 'left',
        color: darkNomalColor(),
        width: Dimensions.get('window').width - 120,
    },
    confirmViewStyle: {

        height: 50,
        width: Dimensions.get('window').width,
        backgroundColor: yfwGreenColor(),

    },
    confirmTextStyle: {
        flex: 1,
        color: 'white',
        fontSize: 15,
        textAlign: 'center',
        marginTop: 15,
    },
    scrollViewStyle: {
        // 背景色
        backgroundColor: 'white',
        height: 170,
        width: Dimensions.get('window').width,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
    },
    borderItemStyle: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 5,
        marginBottom: 5,
        width: Dimensions.get('window').width - 20,
        alignItems: 'center',
        flexDirection: 'row',
        height: 56,
	borderRadius: 7,
	borderStyle: "solid",
	borderWidth: 1,
	borderColor: "#1fdb9b",
    },
    itemTextStyle: {

        marginLeft: 10,
        fontSize: 15,
        width: Dimensions.get('window').width - 80,
        color: yfwGreenColor(),
        fontWeight:'500'

    },
    separatorStyle: {
        backgroundColor: separatorColor(),
        height: 1,
        width: Dimensions.get('window').width,

    },
    standarsTitleStyle: {
        marginTop: 10,
        marginLeft: 10,
        marginBottom: 10,
        fontSize: 13,
        color: darkNomalColor(),

    },
    icon2Style: {
        width: 20,
        marginTop: 3,
        marginLeft: 15,
        resizeMode: 'contain',
    },

});