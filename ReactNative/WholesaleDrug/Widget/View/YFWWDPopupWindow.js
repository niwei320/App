import React, {Component} from 'react';
import {
    View, TouchableOpacity, Modal,Animated,
} from 'react-native';
import {kScreenHeight, kScreenWidth} from '../../../PublicModule/Util/YFWPublicFunction';
import {backGroundColor} from "../../../Utils/YFWColor";
import { BaseStyles } from '../../../Utils/YFWBaseCssStyle';

/**
 *  从屏幕下方弹出的白色带圆角的弹框
 *
 *  props：popupWindowhHeight 弹出弹框高度,默认高度屏幕一半
 *        onRequestClose      Modal相同
 *  Sample:
 *      <YFWPopupWindow
 *          ref={(c) => this.modalView = c}
 *          onRequestClose={() => {}}
 *          popupWindowhHeight={kScreenHeight/2}
 *          >
 *          {....}
 *      </YFWPopupWindow>
 *
 *      this.modalView && this.modalView.show()     //弹出
 *      this.modalView && this.modalView.disMiss()  //关闭
 */
export default class YFWWDPopupWindow extends Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: false,                                                 // 弹窗是否可见
            popupWindowHeight:this.props.popupWindowHeight? this.props.popupWindowHeight:kScreenHeight/2,               // 设置弹框高度
            modalHeight: new Animated.Value(0),                             // 弹窗动画初始值
            backgroundColor:this.props.backgroundColor? this.props.backgroundColor: backGroundColor()
        }
    }

    show = () =>{
        this.setState({
            visible:true,
        });
        Animated.parallel([
            Animated.timing(this.state.modalHeight, {
                toValue: 1,
                duration: 300
            }),
        ]).start(() => {
        });
    }

    disMiss(){
        Animated.parallel([
            Animated.timing(this.state.modalHeight, {
                toValue: 0,
                duration: 200
            }),
        ]).start(() => {
            this.setState({
                visible:false,
            });
        });
    }

    render() {
        this.state.popupWindowHeight= this.props.popupWindowHeight? this.props.popupWindowHeight:kScreenHeight/2            // 设置弹框高度
        return (
            <View>
                <Modal
                    animationType='fade'
                    transparent={true}
                    visible={this.state.visible}
                    onRequestClose={() => this.props.onRequestClose?this.props.onRequestClose():this.disMiss()}>
                    {this.renderAlertView()}
                </Modal>
            </View>
        )
    }

    renderAlertView(){
        let popWindowHeight = this.state.popupWindowHeight
        let backgroundColor = this.state.backgroundColor
        const modalHeight = this.state.modalHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [1, popWindowHeight],
        });
        return(
            <View style={[{backgroundColor: 'rgba(0, 0, 0, 0.3)',flex:1}]}>
                <TouchableOpacity onPress={() => this.props.onRequestClose&&this.props.onRequestClose()} style={{flex:1}}/>
                <Animated.View style = {[BaseStyles.centerItem, {backgroundColor:backgroundColor,borderTopLeftRadius: 10, borderTopRightRadius: 10, height: modalHeight, width:kScreenWidth}]}>
                    <View style={{flex:1}}>
                        {this.props.children}
                    </View>
                </Animated.View>
            </View>
        );
    }


}