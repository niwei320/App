/**
 * Created by admin on 2018/7/20.
 */

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    WebView,
    Alert,
    ListView,
    ScrollView,
    InteractionManager,
    TextInput,
    TouchableOpacity,
    Image,
    Dimensions
} from 'react-native';
import {isNotEmpty} from "../PublicModule/Util/YFWPublicFunction";

var {width, height} = Dimensions.get('window');

//减法函数
function Subtr(arg1, arg2) {
    let r1, r2, m, n;
    try {
        r1 = arg1.toString().split(".")[1].length;
    }
    catch (e) {
        r1 = 0;
    }
    try {
        r2 = arg2.toString().split(".")[1].length;
    }
    catch (e) {
        r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2));
    //last modify by deeka
    //动态控制精度长度
    n = (r1 >= r2) ? r1 : r2;
    return ((arg1 * m - arg2 * m) / m).toFixed(n);
}

//给Number类型增加一个add方法，，使用时直接用 .sub 即可完成计算。
Number.prototype.sub = function (arg) {
    return Subtr(this, arg);
};

export default class StarScore extends Component {

    constructor(props) {
        super(props);
        // 初始状态
        this.style = {width:13,height:13,marginLeft:0};
        this.index = this.props.index
        this.state = {
            totalScore: 5,
            currentScore : this.props.currentScore,
            currentStaus : this.props.currentStaus,
        };
    }
    componentWillReceiveProps(props){
        this.state = {
            currentScore : props.currentScore,
            currentStaus : props.currentStaus
        };
    }

    render() {
        const type = this.props.type;
        if(type == "doEvaluation"){
            this.style = {width:13,height:13,marginHorizontal:12};
            this.isTouchable = true;
        } else if (type == 'shopStar') {
            this.style = {width:13,height:13,marginLeft:1}
        }
        return (
            <View style={{flexDirection: 'row',height: 13, alignItems:'center',flex:1,justifyContent:'space-around'}}>
                {this._renderBody()}
                <View style={{flex:1}}></View>
                {this._renderCurrentStaus()}

            </View>
        );
    }

    _renderCurrentStaus(){
        if(this.props.type=='doEvaluation'){
            return(
                <View style={{marginRight:24,height:13,width:37}}>
                        <Text style={{fontSize:12,color:'#999999',textAlign:'center'}}>{this.state.currentStaus}</Text>
                </View>
            )
        }
    }

    _renderBody() {
        let image = this.props.type=='doEvaluation'?require('../../img/Dd_icon_staring.png'):require('../../img/nearly_star_disenable.png')
        let images = [];
        for (var i = 1; i <= 5; i++) {
            let currentCount = i;
            images.push(
                <View key={"i" + i}>
                    <TouchableOpacity activeOpacity={1} onPress={(i) => {this._score(currentCount)}} hitSlop={{top:10,left:0,bottom:10,right:0}}>
                        <Image source={image} style={this.style}/>
                        {this._renderYellowStart(i)}
                    </TouchableOpacity>
                </View>
            );
        }
        return images;
    }

    _renderYellowStart(count) {
        let r = count.sub(this.state.currentScore)
        let s = this.props.type=='doEvaluation'||this.props.type=='shopStar'?require('../../img/sx_star.png'):require('../../img/nearly_star_enable.png')
        if(r>=0.5 && r<=0.9){
            s = require('../../img/nearly_half.png')
        }
        if (count <= Math.ceil(this.state.currentScore)) {
            return (
                <Image source={s} style={[this.style,{position: 'absolute'}]}/>
            );
        }
    }

    _score(count) {
        switch (count) {
            case 1 : //
                this.state.currentStaus='差';
                break
            case 2 : //
                this.state.currentStaus='差';
            break
            case 3: //
                this.state.currentStaus= '一般';
                break
            case 4: //
                this.state.currentStaus= '很好';
                break
            case 5: //
                this.state.currentStaus= '非常好';
                break
        }
        if(isNotEmpty(this.props.onResult)){
          this.props.onResult(this.index,count)
        }
        if(!this.isTouchable){
            return;
        }
         // 点击评分功能的入口
         this.setState({
            currentScore: count
         });
    }

}
