import React from 'react'
import {
    Image,
    TouchableOpacity,
    View,
    Text,WebView
} from 'react-native'
import {
    iphoneBottomMargin,
    iphoneTopMargin,
    isNotEmpty,
    kScreenHeight,
    kScreenWidth, tcpImage, changeImageUrlHeader, isAndroid
} from "../../../PublicModule/Util/YFWPublicFunction";
import {darkLightColor} from "../../../Utils/YFWColor";
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import ModalView from '../../../widget/ModalView';
/**
 * 查看大图
 */
export default class YFWWebViewAlert extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            html_code:''
        }
    }

    showView(content) {
        this.setState({html_code:content})
        this.modalView && this.modalView.show()
    }


    closeView(){
        this.modalView && this.modalView.disMiss()
    }


    render() {
        var htmlContent=`<!DOCTYPE html>
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0,maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
            </head>
            <body  content="initial-scale=1.0, maximum-scale=1.0" >
                ${this.state.html_code}
                <script>
                    window.onload=function(){
                        window.location.hash = 1;
                        document.title = document.body.clientHeight;
                    }
                </script>
            </body>
        </html>`;
        return (
            <ModalView ref={(c) => this.modalView = c} animationType="fade">
                <View style={{ flex: 1, width: kScreenWidth, height: kScreenHeight, backgroundColor:'rgba(0, 0, 0, 0.7)'}}>
                    <TouchableOpacity onPress={() => { this.closeView() }} style={{backgroundColor:'transparent',flex:1}}/>
                    <View style={{width:kScreenWidth,paddingHorizontal:20,height:300,borderRadius:10,backgroundColor:isAndroid()?'#ffffff':'transparent',overflow:'hidden'}}>
                        <WebView
                            bounces={false}
                            source={{ html: htmlContent}}
                            scalesPageToFit={isAndroid()}
                            automaticallyAdjustContentInsets={false}
                            scrollEnabled={true}
                        />
                    </View>
                    <TouchableOpacity onPress={() => { this.closeView() }} style={{backgroundColor:'transparent',flex:1}}/>
                </View>

            </ModalView>
        )
    }
}
