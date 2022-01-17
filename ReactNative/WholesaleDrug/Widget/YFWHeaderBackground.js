import React,{Component} from 'react'
import {View,Image} from 'react-native'
import { kScreenWidth, kStyleWholesale } from '../../PublicModule/Util/YFWPublicFunction'
import { YFWImageConst } from '../Images/YFWImageConst'

export default class YFWHeaderBackground extends Component {
    render() {
        let imageSource = require('../../../img/Status_bar.png')
        if (this.props.from == kStyleWholesale) {
            imageSource = YFWImageConst.Nav_header_background_blue
        }
        return (
            <Image source={imageSource} style={{width:kScreenWidth, flex:1, resizeMode:'stretch'}}/>
        )
    }
}