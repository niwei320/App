import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, FlatList, ScrollView,
} from 'react-native';
import {
    isEmpty, isIphoneX,
    isNotEmpty,
    kScreenHeight,
    kScreenWidth
} from "../../../../PublicModule/Util/YFWPublicFunction";
import YFWTouchableOpacity from "../../../../widget/YFWTouchableOpacity";
import YFWPopupWindow from "../../../../PublicModule/Widge/YFWPopupWindow";

export default class CounterfeitDrugExplanationView extends Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    show(){
        this.modalView.show()
    }

    closeView(){
        this.modalView.disMiss()
    }

    render() {
        let title = '假药/劣药说明'
        let buttonText = '我知道了'
        let h1 = '根据《中华人民共和国药品管理法》规定\r\n\r\n'
        let h2 = '有下列情形之一的，为假药：\r\n' +
            '1. 药品所含成份与国家药品标准规定的成份不符；\n' +
            '2. 以非药品冒充药品或者以他种药品冒充此种药品；\n' +
            '3. 变质的药品；\n' +
            '4. 药品所标明的适应症或者功能主治超出规定范围。\n\n' +
            '有下列情形之一的，为劣药：\n'+
            '1. 药品成份的含量不符合国家药品标准；\n' +
            '2. 被污染的药品；\n' +
            '3. 未标明或者更改有效期的药品；\n' +
            '4. 未注明或者更改产品批号的药品；\n' +
            '5. 超过有效期的药品；\n' +
            '6. 擅自添加防腐剂、辅料的药品；\n' +
            '7. 其他不符合药品标准的药品。'

        return (
            <YFWPopupWindow
                ref={(c) => this.modalView = c}
                popupWindowHeight={kScreenHeight*0.6}
            >
                <View style={{flex: 1}}>
                    <View style={{ height: 50, width: kScreenWidth }}>
                        <View style={{ flexDirection: 'row', height: 45, width: kScreenWidth, justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ height: 15, width: 15, marginLeft: 18 }} />
                            <Text style={{color:"#000", fontSize:14, fontWeight: '500'}}>{title}</Text>
                            <TouchableOpacity onPress={() => this.closeView()}>
                                <Image style={{ width: 13, height: 13, marginRight: 18 }} source={require('../../../../../img/close_button.png')} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{height:kScreenHeight*0.6 - 50 - (isIphoneX()?110:85)}}>
                        <ScrollView style={{marginHorizontal:33}}>
                            <Text style={{fontSize: 12, lineHeight: 18, color: "#333333",fontWeight:'500'}}>{h1}</Text>
                            <Text style={{fontSize: 12, lineHeight: 18, color: "#666666",fontWeight:'500'}}>{h2}</Text>
                        </ScrollView>
                    </View>
                    <View style={{ width: kScreenWidth - 13 * 2, marginLeft: 13, position: 'absolute', bottom: isIphoneX()?45:20}}>
                        <YFWTouchableOpacity style_title={{ height: 44, width: kScreenWidth - 13 * 2, fontSize: 17 }}
                                             title={buttonText}
                                             callBack={() => { this.closeView() }}
                                             isEnableTouch={true} />

                    </View>
                </View>
            </YFWPopupWindow>
        )
    }

}

const style = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    }
});