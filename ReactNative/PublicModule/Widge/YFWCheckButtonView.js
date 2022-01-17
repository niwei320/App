import React, { Component } from 'react';
import {
    StyleSheet,
    Image,
    View,
    TouchableOpacity, Dimensions
} from 'react-native';
import {kStyleWholesale} from "../Util/YFWPublicFunction";
import {YFWImageConst} from "../../WholesaleDrug/Images/YFWImageConst";


export default class YFWCheckButtonView extends Component {

    static defaultProps = {
        select:false,
    }

    render() {
        let unselect_img = this.props.isOverdue?require('../../../img/radio_off_o.png'):require('../../../img/radio_off.png')
        let select_img = this.props.from == kStyleWholesale? YFWImageConst.Icon_select_blue:require('../../../img/chooseBtn.png')
        return (
            <View style={styles.operatingBtn}>
                <TouchableOpacity activeOpacity={0.8}
                                  disabled = {this.props.isOverdue?true:false}
                                  hitSlop={{top:15,left:10,bottom:15,right:10}}
                                  style={[styles.operatingBtnBox,{width:25,height:25}]}
                                  onPress={()=>this.selectFn()}>
                    {this.props.select
                        ? <Image source={select_img}
                                 defaultSource={require('../../../img/radio_off.png')}
                                 resizeMode='contain'
                                 style={{ width: 25, height: 25 }} />
                        : <Image source={unselect_img}
                                 defaultSource={unselect_img}
                                 resizeMode='contain'
                                 style={{ width: 18, height: 18 }} />
                    }
                </TouchableOpacity>
            </View>
        );
    }


    selectFn(){
        if (this.props.selectFn) {
            this.props.selectFn();
        }
    }

}

//设置样式
const styles = StyleSheet.create({
    operatingBtn: {
        flex:1,
        height:40,
        width:30,
        alignItems:'center',
        justifyContent:'center',
    },
    operatingBtnBox:{
        flex:1,
        alignItems:'center',
        justifyContent:'center',
    },

});