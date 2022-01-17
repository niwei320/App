/**
 * 调用说明：
 * <Loading ref={r=>{this.Loading = r}} hide = {true} /> //放在布局的最后即可
 * 在需要显示的地方调用this.Loading.show();
 * 在需要隐藏的地方调用this.Loading.close();
 */

import React, { Component } from 'react';
import {
    Platform,
    View,
    Animated,
    Image, DeviceEventEmitter,
} from 'react-native';
import ModalView from "../widget/ModalView"
import YFWToast from "../Utils/YFWToast";
import {isIphoneX} from "../PublicModule/Util/YFWPublicFunction";
const loadingImage = '../../img/loading.gif';

export default class LoadProgress extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        DeviceEventEmitter.addListener('LoadProgressShow',()=>{
            this.show();
        });
        DeviceEventEmitter.addListener('LoadProgressClose',()=>{
            this.close()
        });
    }
    componentWillUnmount() {
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove();
        }
        this.close();
    }
    close() {
        this.modalView && this.modalView.disMiss();

        if (this.timer){
            clearTimeout(this.timer);
        }

    }

    show() {
        this.modalView && this.modalView.show()
        this.timer = setTimeout(
            ()=> {
                if (this.modalView){
                    this.close();
                }
            },1000 * 6
        )
    }

    render() {

        return (
            <ModalView ref={(c) => this.modalView = c} animationType="fade" marginTop={isIphoneX()?88:64}>
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <Image style={{height: 40, width:40,resizeMode:'contain'}} source={require(loadingImage)} />
                </View>
            </ModalView>
        );
    }
}

