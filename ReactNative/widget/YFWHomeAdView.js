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
    Text
} from 'react-native';
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {isNotEmpty, kScreenWidth,safeObj,isEmpty} from "../PublicModule/Util/YFWPublicFunction";
import {pushNavigation} from "../Utils/YFWJumpRouting";
import ModalView from "../widget/ModalView"

export default class YFWHomeAdView extends Component {
    constructor(...args) {
        super(...args);
        this.state = {
            advertValue: '',
            showClose:this.props.showClose === undefined?true:this.props.showClose
        };
    }

    componentDidMount() {
        if (this.props.getNavigation) {
            this.navigation = this.props.getNavigation();
        }

    }


    //action
    showView(value) {

        if (isNotEmpty(value) && isNotEmpty(value.img_url)) {

            this.modalView && this.modalView.show()
            this.setState({
                advertValue: value,
            });

        }

        this.modalView && this.modalView.show()
    }

    onClickMethod() {
        const {navigate} = this.props.navigation;
        this.closeView();
        pushNavigation(navigate, this.state.advertValue);
    }

    closeView() {
        this.modalView && this.modalView.disMiss()
    }

    renderAlertView() {
        let maxW = kScreenWidth - 80
        let height = safeObj(this.state.advertValue).img_height;
        let width = safeObj(this.state.advertValue).img_width;
        let advWidth = isNaN(parseInt(safeObj(width).replace('px',''))/2)?0:parseInt(safeObj(width).replace('px',''))/2;
        let advHeight = isNaN(parseInt(safeObj(height).replace('px',''))/2)?0:parseInt(safeObj(height).replace('px',''))/2;
        if (advHeight == 0 || isEmpty(advHeight)) {
            advHeight = 380
        }
        if (advWidth == 0 || isEmpty(advWidth)) {
            advWidth = maxW
        }
        if(advWidth > maxW){
            advHeight = (maxW / advWidth) * advHeight
            advWidth = maxW
        }

        return (
            <TouchableOpacity activeOpacity={1} onPress={()=>{this.modalView && this.modalView.disMiss()}} style={[BaseStyles.centerItem,{flex:1,backgroundColor: 'rgba(0, 0, 0, 0.2)'}]}>
                <View style={{width:advWidth,height:advHeight+30}}>
                    {this.state.showClose?
                        <View style={{flexDirection:'row',width:advWidth,height:30}}>
                            <View style={{flex:1}}/>
                            <TouchableOpacity onPress={()=>{this.modalView && this.modalView.disMiss()}} activeOpacity={1} style={{width:20,height:20}} >
                                <Image style={{width:20,height:20,resizeMode:'contain'}}
                                       source={require('../../img/home_adv_delete_icon.png')}/>
                            </TouchableOpacity>
                        </View>
                        :<></>
                    }
                    <TouchableOpacity onPress={()=>this.onClickMethod()} activeOpacity={1}>
                        <Image style={{width: advWidth, height: advHeight,resizeMode:'contain'}}
                               source={{uri:this.state.advertValue.img_url}}
                        />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
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
