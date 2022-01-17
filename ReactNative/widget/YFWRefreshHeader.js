import React, {Component} from 'react';
import {
    View,
    Text,
    Image,ImageBackground
} from 'react-native'
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {isIphoneX, isNotEmpty, objToStrMap, kScreenWidth} from '../PublicModule/Util/YFWPublicFunction'

export const RefreshStatus={
    willLoad:1,
    canLoad:2,
    loading:3,
    finish:4,
}

let marginTop = isIphoneX()? 34 : 0;
let HeaderHeight = 70;
let refreshHeight = -HeaderHeight-marginTop;


export default class YFWRefreshHeader extends Component {

    constructor(props) {
        super(props)
        this.state = {
        }
        this.status = RefreshStatus.willLoad
    }


    // ====== Action ======
    onScroll(event){

        let contentY = event.nativeEvent.contentOffset.y
        let newStatus = this.status;

        if (this.status != RefreshStatus.loading){
            if (this.status == RefreshStatus.finish) {
                if (contentY < 0){
                    newStatus = RefreshStatus.willLoad;
                }
            } else if (this.status == RefreshStatus.willLoad) {
                if (contentY < refreshHeight){
                    newStatus = RefreshStatus.canLoad;
                }
            } else if (this.status == RefreshStatus.canLoad) {
                if (contentY > refreshHeight){
                    newStatus = RefreshStatus.willLoad;
                }
            }

        }


        if (this.status != newStatus) {

            this.status = newStatus;
        }


    }

    beginRefresh(){

        if (this.status == RefreshStatus.canLoad){
            this.status = RefreshStatus.loading;
            if (this.props.onRefresh){
                this.props.onRefresh();
            }
            if (this.props.toScroll){
                this.props.toScroll(refreshHeight);
            }
        }
    }

    endRefresh(){
        if (this.props.toScroll){
            this.props.toScroll(0);
        }
        this.status = RefreshStatus.finish;
    }
    // ===== View ======
    render() {
        let bgImageH = 347*kScreenWidth/375
        let bgImageSource = require('../../img/loading_bg.png')
        let loadImageSource = require('../../img/loading.gif')
        return (
            <View style={{height:HeaderHeight+marginTop,marginTop:-HeaderHeight-marginTop}}>
                <Image style={{resizeMode:'stretch',width:kScreenWidth,height:bgImageH,position:'absolute',left:0,top:(HeaderHeight- bgImageH)}} source={bgImageSource} defaultSource={bgImageSource}></Image>
                <View style={[BaseStyles.leftCenterView,BaseStyles.centerItem,{height:HeaderHeight,marginTop:marginTop}]}>
                    <Image style={{width:40,height:40}} source={loadImageSource} defaultSource={loadImageSource}/>
                </View>
            </View>
        );
    }
}