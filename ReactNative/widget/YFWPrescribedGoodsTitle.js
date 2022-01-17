import React from 'react'
import {
    Dimensions,
    Image, StyleSheet,
    Text, TouchableOpacity,
    View,
} from 'react-native'
import {isAndroid, isEmpty, safeObj} from "../PublicModule/Util/YFWPublicFunction";
import {darkTextColor} from "../Utils/YFWColor";

const IMG_SINGLE_TRACK_LABEL = require('../../img/ic_drug_track_label.png')//单轨
const IMG_DOUBLE_TRACK_LABEL = require('../../img/ic_drug_track_label.png')//双轨
const IMG_PRESCRIPTION_LABEL = require('../../img/ic_drug_track_label.png')//处方
const IMG_OTC_LABEL = require('../../img/ic_drug_OTC.png')//otc
//灰色
const IMG_SINGLE_TRACK_LABEL_Overdue = require('../../img/ic_drug_track_label_o.png')//单轨
const IMG_DOUBLE_TRACK_LABEL_Overdue = require('../../img/ic_drug_track_label_o.png')//双轨
const IMG_PRESCRIPTION_LABEL_Overdue = require('../../img/ic_drug_track_label_o.png')//处方
const IMG_OTC_LABEL_Overdue = require('../../img/ic_drug_OTC_o.png')//otc


export const TYPE_SINGLE = 1
export const TYPE_DOUBLE = 2
export const TYPE_PRESCRIPTION = 3
export const TYPE_NOMAL = -1
export const TYPE_OTC = 0


export const DISTANCE_CF = '            '//处方的间距
export const DISTANCE_TRACK = '          '//单双轨的间距
export const DISTANCE_OTC = '          '//OTC的间距

export default class YFWPrescribedGoodsTitle extends React.Component {

    constructor(props) {
        super(props)
        this.titleStyle = isEmpty(this.props.style)?styles.titleStyle:this.props.style
        this.numberOfLines = isEmpty(this.props.numberOfLines)?2:this.props.numberOfLines
        this.isOverdue = this.props.isOverdue || false
    }

    componentWillReceiveProps(nextProps){
        this.isOverdue = nextProps.isOverdue || false
        this.setState({})
    }

    render() {
        return (
            this.renderTitleView()
        )
    }

    renderTitleView() {
        //单轨药
        if(this.props.type === TYPE_SINGLE){
            let margin = isEmpty(this.props.activity_img_url)?DISTANCE_TRACK:DISTANCE_TRACK+'          '
            return this.rednerPrescriptionLabel(this.isOverdue?IMG_SINGLE_TRACK_LABEL_Overdue:IMG_SINGLE_TRACK_LABEL,margin)
        }
        //双轨药
        else if(this.props.type === TYPE_DOUBLE){
            let margin = isEmpty(this.props.activity_img_url)?DISTANCE_TRACK:DISTANCE_TRACK+'          '
            return this.rednerPrescriptionLabel(this.isOverdue?IMG_DOUBLE_TRACK_LABEL_Overdue:IMG_DOUBLE_TRACK_LABEL,margin)
        }
        //处方药
        else if (this.props.type === TYPE_PRESCRIPTION) {
            let margin = isEmpty(this.props.activity_img_url)?DISTANCE_CF:DISTANCE_CF+'          '
            return this.rednerPrescriptionLabel(this.isOverdue?IMG_PRESCRIPTION_LABEL_Overdue:IMG_PRESCRIPTION_LABEL,margin)
        } else if (this.props.type === TYPE_OTC) {
            let margin = isEmpty(this.props.activity_img_url)?DISTANCE_OTC:DISTANCE_OTC+'          '
            return this.rednerPrescriptionLabel(this.isOverdue?IMG_OTC_LABEL_Overdue:IMG_OTC_LABEL,margin)
        } else {
            return (
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    {this.renderActivityImage()}
                    <Text style={[styles.titleStyleLines,this.titleStyle,this.isOverdue?styles.overdueStyle:{}]} numberOfLines={this.numberOfLines}>{this.props.title}</Text>
                </View>
            )
        }
    }

    /**
     * 返回处方标签
     * @param img
     * @returns {*}
     */
    rednerPrescriptionLabel(img,distance){
        if (this.props.onClick) {
            return (
                <TouchableOpacity activeOpacity={1} style={{flexDirection:'row'}} onPress={()=>{
                    this.props.onClick && this.props.onClick()
                }}>
                    <Image style={[styles.cfyIconStyle,{position:'absolute'}]} source={img}/>
                    {this.renderActivityImage(true)}
                    <Text style={[this.titleStyle,this.isOverdue?styles.overdueStyle:{}]} numberOfLines={this.numberOfLines}>{distance+this.props.title}</Text>
                </TouchableOpacity>
            )
        } else {
            return (
                <View style={{flexDirection:'row'}}>
                    <Image style={[styles.cfyIconStyle,{position:'absolute'}]} source={img}/>
                    {this.renderActivityImage(true)}
                    <Text style={[this.titleStyle,this.isOverdue?styles.overdueStyle:{}]} numberOfLines={this.numberOfLines}>{distance+this.props.title}</Text>
                </View>
            )
        }

    }

    renderActivityImage(absolute) {
        if (isEmpty(this.props.activity_img_url)) {
            return null
        }
        return (
            <Image style={[styles.activityIconStyle,absolute?{position:'absolute',left:34,marginTop:-0,}:{}]} source={{uri:this.props.activity_img_url}} ></Image>
        )
    }
}
const styles = StyleSheet.create({
    titleStyle: {
        fontSize: 13,
        lineHeight:16,
        color: '#000',
        fontWeight:'bold',
        marginRight: 10,
        flex:1
    },
    titleStyleLines: {
        fontSize: 13,
        lineHeight:14,
        color: '#000',
        fontWeight:'bold',
        marginRight: 10,
        flex:1
    },
    cfyIconStyle: {
        resizeMode:'contain',
        height:13,
        width:30,
        marginTop:isAndroid()?1:2.5,
    },
    activityIconStyle:{
        width:31,height:16,marginRight:4,
    },
    overdueStyle: {
        color: 'rgb(153,153,153)',
    }
})
