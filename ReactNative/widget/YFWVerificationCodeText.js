import React, {Component} from 'react';
import {
    View,
    Image,
    DeviceEventEmitter,
    Text,
    Platform,
    TouchableOpacity,
    StyleSheet,
    Animated,TextInput
} from 'react-native'
import {
    kScreenWidth,
    dismissKeyboard_yfw,
    adaptSize,
    isEmpty
} from '../PublicModule/Util/YFWPublicFunction';
import {NUMBERS, TEXT_COMMA} from "../PublicModule/Util/RuleString";
import YFWToast from "../Utils/YFWToast";


export default class YFWVerificationCodeText extends Component {

    constructor(props) {
        super(props)
        this.style = this.props.style
        this.callback = this.props.callback
        this.codeLength = this.props.codeLength || 4
        this.height = this.props.height || adaptSize(40)
        this.marginHorizontal = this.props.marginHorizontal || adaptSize(90)
        this.codeItemSpace = this.props.codeItemSpace || adaptSize(14)
        this.codeItemWidth = (kScreenWidth-this.marginHorizontal*2-this.codeItemSpace*(this.codeLength-1))/this.codeLength
        this.codeArray = []
        this.state = {
            focusOpacity: new Animated.Value(0),
            isShowFocus: true,
            inputContent: '',
        }
    }

    componentWillMount(){

    }

    componentDidMount(){
        this._setFocusAnimated()
    }

    _setFocusAnimated() {
        animatedFocusOpacity = Animated.timing(
            this.state.focusOpacity, // 初始值
            {
                toValue: 1, // 终点值
                duration: 1250,
            }
        );

        Animated.loop(animatedFocusOpacity).start(); // 开始动画
    }

    _moveFoucs(index) {
        if (index > this.codeLength-1) {
            // 停止动画、隐藏光标
            Animated.loop(animatedFocusOpacity).stop()
            this.setState({
                isShowFocus: false,
            })
        } else {
            if(this.state.isShowFocus) {
                return;
            }
            this.setState({
                isShowFocus: true,
            })
            Animated.loop(animatedFocusOpacity).start()
        }
    }

    renderNumber(){
        let returnArray = []
        for(let i=0;i<this.codeLength;i++){
            returnArray.push(
                <View style={{height:this.height,width:this.codeItemWidth,justifyContent:'space-between'}}>
                    <Text style={styles.codeNumber}>{this.codeArray.length>0 ? this.codeArray[i] : ' '}</Text>
                    <View style={[styles.codeLine, {backgroundColor: this.codeArray.length>i ? '#999999' : '#cccccc'}]}></View>
                </View>
            )
        }
        return returnArray
    }

    _renderFocusView() {
        let index = this.codeArray.length > this.codeLength-1 ? this.codeLength-1 : this.codeArray.length
        let foucsLeft = this.codeItemWidth/2 + this.marginHorizontal + (this.codeItemWidth+14)*index
        if(this.codeArray.length == 4){
            foucsLeft += this.codeItemWidth/2
        }
        return(
            this.state.isShowFocus?<Animated.View style={{width:2, height: 27,backgroundColor:'#45dfac',position:'absolute',opacity:this.state.focusOpacity,left:foucsLeft}}/>:null
        )
    }

    render() {
        return (
            <View style={[{paddingHorizontal:this.marginHorizontal,width:kScreenWidth,height:this.height,justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row'},this.style]}>
                {this.renderNumber()}
                {this._renderFocusView()}
                <TextInput
                    style={{position:'absolute',height:this.height,left:this.marginHorizontal,right:this.marginHorizontal,opacity:0,}}
                    keyboardType={'number-pad'}
                    maxLength={this.codeLength}
                    value={this.state.inputContent}
                    autoFocus={true}
                    onFocus={() => {
                        if (this.state.isShowFocus) {
                            return;
                        }
                        this.setState({
                            isShowFocus: true,
                        })
                        Animated.loop(animatedFocusOpacity).start()
                    }}
                    onEndEditing={() => {
                        // 停止动画、隐藏光标
                        Animated.loop(animatedFocusOpacity).stop()
                        this.setState({
                            isShowFocus: false,
                        })
                    }}
                    onChangeText={(text) => this._changeText(text)}>

                </TextInput>
            </View>
        )
    }
    /**
     * 校验输入
     */
    verifyInput(txt) {
        if (isEmpty(txt)) {
            return txt
        }
        txt = txt.replace(NUMBERS, '')
        return txt
    }

    _changeText(text) {
        text = this.verifyInput(text)
        this.state.inputContent = text
        if (text.length > this.codeLength) {
            text = text.substr(0,this.codeLength);
        }

        let codeArray = [];

        for (let index = 0; index < text.length; index++) {
            codeArray.push(text.substr(index,1))
        }

        this.codeArray = codeArray,
        this.setState({})

        this._moveFoucs(text.length)

        if (text.length === this.codeLength) {
            dismissKeyboard_yfw();
            this.callback&&this.callback(text)
        }
    }

}
const styles = StyleSheet.create({
    codeNumber: {
        fontSize:35,
        color:'rgb(51,51,51)',
        textAlign:'center'
    },
    codeLine: {
        height:1,
        backgroundColor: '#999999',
    },
})