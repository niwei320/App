import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, Dimensions,
} from 'react-native';
import {isNotEmpty, kScreenWidth,isEmpty} from "../../PublicModule/Util/YFWPublicFunction";
import {pushNavigation} from "../../Utils/YFWJumpRouting";
import YFWToast from "../../Utils/YFWToast";

const width = Dimensions.get('window').width;
const scale = kScreenWidth/375;
export default class YFWPatientCardView extends Component {

    constructor(parameters) {
        super(parameters);
        this.state = {
            data:this.props.data,
            isSelect:false,
        }
    }

    setSelect(boolean){
        this.setState({
            data:this.props.data,
            isSelect: boolean,
        })
    }

    render() {
        let isSelect = this.props.data.select;
        let mobile = this.props.data.mobile;
        mobile = mobile.substring(0,3) + "****" + mobile.substring(7); //手机号信息脱敏
        let ageTime = new Date().getTime() - new Date(this.props.data.birthday.replace(/\-/g, "/")).getTime();   //时间差的毫秒数
        let age = Math.floor(ageTime/(365*24*3600*1000))
        return (
                <TouchableOpacity style={[styles.cardView,{borderColor: isSelect?"#1fdb9b":"#ffffff"}]}
                                activeOpacity={1}
                                onPress={()=>{
                                    if (this.props.callBack) {
                                        this.props.callBack()
                                    }
                                }}>
                    <View>
                        <Text style={styles.titleText}>{this.props.data.real_name}</Text>
                        {this.renderTags()}
                    </View>
                    <View style={{flex:1}}/>
                    <View style={{flexDirection:'row'}}>
                        <Text style={styles.text}>{this.props.data.dict_sex==1?'男':'女'}</Text>
                        <Text style={[styles.text,{marginLeft:5}]}>{age}岁</Text>
                    </View>
                    <Text style={styles.text}>{mobile}
                    </Text>
                    <TouchableOpacity style = {{position:'absolute',top:scale*11,right:scale*7}}
                                      hitSlop = {{top: 10, bottom: 10, left: 10, right: 10}}
                                      onPress={()=>{pushNavigation(this.props.getNavigate,{type:'prescription_patient_edit',value:{type: 2, patient_id: this.props.data.id},callBack:(item)=>{}})}}>
                        <Text style={styles.text}>编辑
                        </Text>
                    </TouchableOpacity>
                    {isSelect? <Image style = {styles.image} source={require('../../../img/chooseBtn.png')} />:<View/>}
                </TouchableOpacity>
        )
    }

    renderTags(){
        let tagStr = this.props.data.relation_label?this.props.data.relation_label:'';
        let tags = []
        if(this.props.data.dict_bool_default == 1){
            tags.push(this.renderTag("默认"))
        }
        if (isNotEmpty(tagStr)) {
            tags.push(this.renderTag(tagStr))
        }
        if(this.props.data.dict_bool_certification == 1){
            tags.push(this.renderTag("已认证",'#ff0000'))
        } else {
            tags.push(this.renderTag("未认证",'#999'))
        }

        return (
            <View style={styles.tagView}>
                {tags}
            </View>)
    }

    renderTag(text,bgColor){
        let viewBackgroundColor = bgColor?bgColor:'#feac4c'
        return (
            <View key={text} style={[styles.tag,{marginRight:3,backgroundColor:viewBackgroundColor}]}>
                <Text style={styles.tagText}>{text}</Text>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    cardView: {
        minWidth: scale*119,
        height:scale*107,
        backgroundColor:'white',
        borderRadius: scale*7,
        borderStyle: "solid",
        borderWidth: scale*3,
        borderColor: "#ffffff",
        paddingLeft: scale*15,
        paddingTop: scale*12,
        paddingBottom: scale*18,
    },
    titleText:{
        fontSize: scale*16,
        color: "#333333",
        fontWeight: "500"
    },
    text:{
        fontSize: scale*12,
        paddingVertical:0,
        color: "#666666"
    },
    tagView:{
        flexDirection: 'row',
        marginRight: scale*3,
        marginTop: scale*3,
        overflow:'hidden',
    },
    tag:{
        minWidth: scale*28,
        minHeight: scale*14,
        paddingHorizontal:2,
        borderRadius: scale*3,
        backgroundColor: "#feac4c",
        alignItems: "center",
        justifyContent: "center",
    },
    tagText:{
        paddingVertical:0,
        fontWeight: "500",
        fontSize: scale*12,
        color: "#ffffff",
    },
    image:{
        position:'absolute',
        bottom:scale*6,
        right:scale*6,
        width: scale*17,
        height:scale*17,
        resizeMode:'contain',
    }
});