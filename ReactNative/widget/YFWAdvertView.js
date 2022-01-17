/**
 * Created by nw on 2018/9/12.
 */

import React, {Component} from 'react';
import {
    Image,
    TouchableOpacity,
    View,
    Modal,
    DeviceEventEmitter,
} from 'react-native';
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {isNotEmpty, kScreenWidth} from "../PublicModule/Util/YFWPublicFunction";
import {pushNavigation} from "../Utils/YFWJumpRouting";
import ModalView from "../widget/ModalView"

export default class YFWAdvertView extends Component {
    constructor(...args) {
        super(...args);
        this.state = {
            advertValue:'',
            navigation:undefined,
        };
    }

    componentDidMount() {
        if (this.props.getNavigation) {
            this.navigation = this.props.getNavigation();
        }
        DeviceEventEmitter.addListener('OpenAdvertView',(value)=>{
            this.showView(value)
        });
    }

    componentWillUnmount() {
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove();
        }
    }

    //action
    showView(value) {

        if (isNotEmpty(value) && isNotEmpty(value.img_url)){

            this.modalView && this.modalView.show()
            this.setState({
                advertValue :value,
            });

        }

    }

    onClickMethod(){
        const {navigate} = this.navigation;
        this.closeView();
        pushNavigation(navigate,{type:this.state.advertValue.type,value:this.state.advertValue.value});
    }

    closeView(){
        this.modalView && this.modalView.disMiss()
    }

    renderAlertView(){

        let imageHeight = 320;
        let height = this.state.advertValue.height;
        let width = this.state.advertValue.width;

        if (isNotEmpty(width) &&
            isNotEmpty(height) &&
            Number.parseFloat(height) != 0 &&
            Number.parseFloat(width) != 0) {

            imageHeight = (kScreenWidth - 80) *Number.parseFloat(height) / Number.parseFloat(width);
        }

        return(
            <View style={[BaseStyles.centerItem,{flex:1,backgroundColor: 'rgba(0, 0, 0, 0.3)'}]}>
                <View style={{width: kScreenWidth - 80, height: imageHeight,alignItems:'center',borderRadius:8}}>
                    <TouchableOpacity onPress={()=>this.onClickMethod()}>
                        <Image style={{width: kScreenWidth - 80, height: imageHeight,borderRadius:8,resizeMode:'contain'}}
                               // source={{uri:'https://cdn2.jianshu.io/assets/web/misc-pic1-b2e2caa2aec8ff89bd6957f09b4e6fce.png'}}
                               source={{uri:this.state.advertValue.img_url}}
                        />
                    </TouchableOpacity>

                </View>
                <TouchableOpacity onPress={()=>this.closeView()}>
                    <Image style={{height: 40, width: 40,marginTop:10}} accessibilityLabel='not_get' source={require('../../img/advert_delete.png')}/>
                </TouchableOpacity>
            </View>
        );
    }

    render() {
        return (
            <ModalView ref={(c) => this.modalView = c} animationType="fade">
                {this.renderAlertView()}
            </ModalView>
        );
    }
}