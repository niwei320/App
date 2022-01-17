import React, {Component} from 'react';
import {
    View, TouchableOpacity, Modal,Animated,
} from 'react-native';
import {kScreenHeight, kScreenWidth} from "../Util/YFWPublicFunction";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {backGroundColor} from "../../Utils/YFWColor";
import ModalView from '../../widget/ModalView';

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
export default class YFWPopupWindow extends Component {

    constructor(props) {
        super(props);
        this.state = {
            popupWindowHeight:this.props.popupWindowHeight? this.props.popupWindowHeight:kScreenHeight/2,               // 设置弹框高度
            modalHeight: new Animated.Value(0),                             // 弹窗动画初始值
            backgroundColor:this.props.backgroundColor? this.props.backgroundColor: backGroundColor()
        }
    }

    show = () =>{
        this.popupDialog && this.popupDialog.show();
        Animated.parallel([
            Animated.timing(this.state.modalHeight, {
                toValue: 1,
                duration: 300
            }),
        ]).start(() => {
        });
    }

    disMiss(){
        this.props.onDisMiss && this.props.onDisMiss()
        Animated.parallel([
            Animated.timing(this.state.modalHeight, {
                toValue: 0,
                duration: 200
            }),
        ]).start(() => {
            this.popupDialog && this.popupDialog.disMiss()
        });
    }

    render() {
        this.state.popupWindowHeight= this.props.popupWindowHeight? this.props.popupWindowHeight:kScreenHeight/2            // 设置弹框高度
        return (
                <ModalView
                    ref={(c) => this.popupDialog = c}
                    animationType="fade"
                    transparent={true}
                    onRequestClose={() => this.props.onRequestClose?this.props.onRequestClose:this.disMiss()}>
                    {this.renderAlertView()}
                </ModalView>
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
                <TouchableOpacity onPress={()=>this.disMiss()} style={{flex:1}}/>
                <Animated.View style = {[BaseStyles.centerItem, {backgroundColor:backgroundColor,borderTopLeftRadius: 10, borderTopRightRadius: 10, height: modalHeight, width:kScreenWidth}]}>
                    <View style={{flex:1}}>
                        {this.props.children}
                    </View>
                </Animated.View>
            </View>
        );
    }


}
