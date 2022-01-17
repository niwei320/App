import React from 'react'
import {
    View,
    Text
} from 'react-native'

import QRCode from "react-native-qrcode-svg";
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {yfwGreenColor,darkNomalColor} from '../Utils/YFWColor'
export default class ShareQrCodeView extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const desc = this.props.desc || '查看商品详情'
        const type = this.props.type || 1
        const color = type==1 ? yfwGreenColor() : '#547cff'
        return (
            <View>
                <View
                    style={[BaseStyles.leftCenterView,{padding:20,paddingVertical:15}]}>
                    <QRCode
                        value={this.props.url}
                        size={60}
                        bgColor='black'
                        fgColor='white'>

                    </QRCode>
                    <View>
                        <Text style={{marginLeft:10,fontSize:13,color:darkNomalColor()}}>长按或扫描二维码</Text>
                        <Text style={{marginTop:10,marginLeft:10,fontSize:13,color: color}}>{desc}</Text>
                    </View>
                </View>
            </View>
        )
    }
}
