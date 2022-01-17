import React, {Component} from 'react'
import {TouchableOpacity, Text, ImageBackground, StyleSheet} from 'react-native'
import {kScreenWidth} from '../PublicModule/Util/YFWPublicFunction';
import LinearGradient from 'react-native-linear-gradient';

export default class YFWTouchableOpacity extends Component {
    render() {
        return this._renderGradient()
    }

    _renderGradient() {
        let style_title = {
            width: this.props.style_title&&this.props.style_title.width ? this.props.style_title.width : kScreenWidth-26,
            height: this.props.style_title&&this.props.style_title.height ? this.props.style_title.height : 44,
            fontSize: this.props.style_title&&this.props.style_title.fontSize ? this.props.style_title.fontSize : 20,
        };

        return(
            <TouchableOpacity activeOpacity={1} onPress={this._touchableClick.bind(this)} style={[styles.shawddow,{marginBottom:10,shadowColor:this.props.isEnableTouch ?(this.props.enableShaowColor?this.props.enableShaowColor:"rgba(31, 219, 155, 0.5)") : "rgba(204, 204, 204, 0.5)"}]}>
                <LinearGradient
                    colors={this.props.isEnableTouch ? (this.props.enableColors?this.props.enableColors:['#00c891','#1fdb9b']) : ['#ccc','#ccc']}
                    start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                    locations={[1,0]}
                    style={{width:style_title.width,height: style_title.height,borderRadius:style_title.height/2,justifyContent:'center',elevation:4,alignItems:'center'}}>
                    <Text style={{fontSize:style_title.fontSize,color:'white',fontWeight:'bold'}}>{this.props.title}</Text>
                </LinearGradient>
            </TouchableOpacity>
        )
    }

    _touchableClick() {
        if (this.props.callBack && this.props.isEnableTouch) {
            this.props.callBack()
        }
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    backImag: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 5,
    },
    title: {
        fontWeight: 'bold',
        color: '#FFFFFF'
    },
    shawddow:{
        shadowColor: "rgba(31, 219, 155, 0.5)",
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowRadius: 8,
        shadowOpacity: 1,
        elevation:2,
    }
})