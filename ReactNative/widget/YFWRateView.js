/**
 * Created by nw on 2018/9/12.
 */

import React, {Component} from 'react';
import {
    TouchableOpacity,
    Text,
    Image,
    View,
    Modal,
    DeviceEventEmitter, NativeModules,
} from 'react-native';
import {darkTextColor,darkNomalColor,separatorColor} from '../Utils/YFWColor'
import {kScreenWidth} from "../PublicModule/Util/YFWPublicFunction";
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import YFWNativeManager from "../Utils/YFWNativeManager";
import ModalView from './ModalView'
import {pushNavigation} from "../Utils/YFWJumpRouting";
import {getItem, setItem,AppEvaluationActionShow,AppEvaluationStartTime,ISAppEvaluation,NeverOpenEvaluation,ThisOpenEvaluation} from "../Utils/YFWStorage";

export default class YFWRateView extends Component {

    constructor(...args) {
        super(...args);
        this.state = {
            navigation:undefined,
        };
    }

    componentDidMount() {
        if (this.props.getNavigation) {
            this.navigation = this.props.getNavigation();
        }
        this.openListener = DeviceEventEmitter.addListener('OpenRateView',()=>this.showView());
    }

    componentWillUnmount() {
        this.openListener&&this.openListener.remove();
    }

    //action
    showView() {
        getItem(NeverOpenEvaluation).then((id)=>{
            if (id != 1){
                getItem(ThisOpenEvaluation).then((id)=>{
                    if(id != 1){
                        this.modalView && this.modalView.show();
                    }
                })
            }
        })
    }

    onClickMethod1(){
        const {navigate} = this.navigation;
        this.closeView();
        pushNavigation(navigate,{type:'get_feedback',from:'rate'});
    }
    onClickMethod2(){
        setItem(NeverOpenEvaluation,1)
        YFWNativeManager.openAppStoreComment(()=>{
            this.closeView()
        });

    }

    closeView(){

        setItem(ThisOpenEvaluation,1)

        this.modalView && this.modalView.disMiss()
    }

    renderAlertView(){
        return(
            <View style={[BaseStyles.centerItem,{flex:1,backgroundColor: 'rgba(0, 0, 0, 0.3)'}]}>
                <View style={{width: kScreenWidth - 100, height: 230,alignItems:'center',backgroundColor:'white',borderRadius:10}}>
                    <View style={[BaseStyles.centerItem,{height: 78, width: kScreenWidth - 100}]}>
                        <Text style={{fontSize:16,color:darkTextColor(),fontWeight:'bold'}} numberOfLines={3}>五星好评鼓励下我们!</Text>
                    </View>
                    <View style={{backgroundColor:separatorColor(),height:0.5,width:kScreenWidth - 100}}/>
                    <TouchableOpacity style={[BaseStyles.centerItem,{height: 50, width: kScreenWidth - 100}]} onPress={()=>this.onClickMethod2()}>
                        <Text style={{fontSize:14,color:darkNomalColor()}}>好评鼓励</Text>
                    </TouchableOpacity>
                    <View style={{backgroundColor:separatorColor(),height:0.5,width:kScreenWidth - 100}}/>
                    <TouchableOpacity style={[BaseStyles.centerItem,{height: 50, width: kScreenWidth - 100}]} onPress={()=>this.onClickMethod1()}>
                        <Text style={{fontSize:14,color:darkNomalColor()}}>我要吐槽</Text>
                    </TouchableOpacity>
                    <View style={{backgroundColor:separatorColor(),height:0.5,width:kScreenWidth - 100}}/>
                    <TouchableOpacity style={[BaseStyles.centerItem,{height: 50, width: kScreenWidth - 100}]} onPress={()=>this.closeView()}>
                        <Text style={{fontSize:14,color:darkNomalColor()}}>下次再说</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    render() {
        return (

            <ModalView ref={(c) => this.modalView = c} animationType="fade">
                {this.renderAlertView()}
            </ModalView>
        );
        // return (
        //     <Modal
        //         animationType='fade'
        //         transparent={true}
        //         visible={this.state.status_modal}
        //         onRequestClose={() => {
        //
        //         }}>
        //         {this.renderAlertView()}
        //     </Modal>
        // );
    }
}