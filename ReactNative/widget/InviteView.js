import React from 'react'
import {
    View,
    Dimensions,
    Animated,
    Easing,
    Image,
    TouchableOpacity,
    PanResponder,
    DeviceEventEmitter
} from 'react-native'
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
import {isNotEmpty, safeObj, mobClick} from '../PublicModule/Util/YFWPublicFunction'
import {pushNavigation} from '../Utils/YFWJumpRouting'
import {getItem,kAccountKey} from '../Utils/YFWStorage'
import YFWRequestParam from '../Utils/YFWRequestParam'
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import {getWinCashData} from "../Utils/YFWInitializeRequestFunction";


let _previousLeft = width - 40;
let _previousTop = height - 200;

let lastLeft = width - 40;
let lastTop = height - 200;

export default class InviteView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            fadeInOpacity: new Animated.Value(1),
            fadeInLeft:new Animated.Value(0),
            style: {},
            isShow: false,
            data:[]
        }

        this.onStartShouldSetPanResponder = this.onStartShouldSetPanResponder.bind(this);
        this.onMoveShouldSetPanResponder = this.onMoveShouldSetPanResponder.bind(this);
        this.onPanResponderGrant = this.onPanResponderGrant.bind(this);
        this.onPanResponderMove = this.onPanResponderMove.bind(this);
        this.onPanResponderEnd = this.onPanResponderEnd.bind(this);
    }

    //用户开始触摸屏幕的时候，是否愿意成为响应者；
    onStartShouldSetPanResponder(evt, gestureState) {
        return true;
    }

    //在每一个触摸点开始移动的时候，再询问一次是否响应触摸交互；
    onMoveShouldSetPanResponder(evt, gestureState) {
        return true;
    }

    // 开始手势操作。给用户一些视觉反馈，让他们知道发生了什么事情！
    onPanResponderGrant(evt, gestureState) {
        this.time = Date.parse(new Date());
        this.setState({
            style: {
                left: _previousLeft,
                top: _previousTop,
            }
        });
    }

    // 最近一次的移动距离为gestureState.move{X,Y}
    onPanResponderMove(evt, gestureState) {
        _previousLeft = lastLeft + gestureState.dx;
        _previousTop = lastTop + gestureState.dy;

        if (_previousLeft <= 0) {
            _previousLeft = 0;
        }
        if (_previousTop <= 0) {
            _previousTop = 0;
        }
        if (_previousLeft >= width - 60) {
            _previousLeft = width - 60;
        }
        if (_previousTop >= height - 100) {
            _previousTop = height - 100;
        }

        //实时更新
        this.setState({
            style: {
                left: _previousLeft,
                top: _previousTop,
            }
        });
    }

    // 用户放开了所有的触摸点，且此时视图已经成为了响应者。
    // 一般来说这意味着一个手势操作已经成功完成。
    onPanResponderEnd(evt, gestureState) {

        lastLeft = _previousLeft;
        lastTop = _previousTop;
        releaseTime = Date.parse(new Date());
        if(Math.abs(gestureState.dx) < 10 &&
            Math.abs(gestureState.dy) < 10 &&
            releaseTime - this.time< 50){
            this.invite()
        }
        this.changePosition();
    }

    /**
     根据位置做出相应处理
     **/
    changePosition() {

        if (_previousLeft + 20 <= width / 2) {
            //left
            _previousLeft = lastLeft = 0;

            this.setState({
                style: {
                    left: _previousLeft,
                    top: _previousTop,
                }
            });
        } else {
            _previousLeft = lastLeft = width - 60;

            this.setState({
                style: {
                    left: _previousLeft,
                    top: _previousTop,
                }
            });
        }
    }


    _animationControl(type) {
        if (type == 1) {
            let marginLeft = (_previousLeft + 20 <= width / 2) ? -30 : 30;
            Animated.timing(this.state.fadeInOpacity, {
                toValue: 0.9,
                duration: 500,
                easing: Easing.linear,// 线性的渐变函数
            }).start();
            Animated.timing(this.state.fadeInLeft,{
                toValue: marginLeft,
                duration: 300,
                easing: Easing.linear,// 线性的渐变函数
            }).start();
        } else {
            Animated.timing(this.state.fadeInOpacity, {
                toValue: 1,
                duration: 500,
                easing: Easing.linear,// 线性的渐变函数
            }).start();
            Animated.timing(this.state.fadeInLeft,{
                toValue: 0,
                duration: 300,
                easing: Easing.linear,// 线性的渐变函数
            }).start();
        }
    }

    componentWillMount(evt, gestureState) {
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: this.onStartShouldSetPanResponder,
            onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder,
            onPanResponderGrant: this.onPanResponderGrant,
            onPanResponderMove: this.onPanResponderMove,
            onPanResponderRelease: this.onPanResponderEnd,
            onPanResponderTerminate: this.onPanResponderEnd,
        });



    }

    componentDidMount() {

        DeviceEventEmitter.addListener('ShowInviteView',(value)=>{
            if (this._canShow()){
                this.setState({
                    isShow:value
                })
            }
        });

        DeviceEventEmitter.addListener('ShowInviteViewAnimate',(value)=>{
            if (this._canShow()){
                this._animationControl(value.value)
            }
        });

        DeviceEventEmitter.addListener('InviteViewData',(value)=>{
            if (this._canShow()){
                this.setState({
                    data:value.value
                })
            }
        });
    }


    _canShow(){

        let userInfo = YFWUserInfoManager.ShareInstance();
        let ads_item = safeObj(safeObj(userInfo.SystemConfig).ads_item);
        let can_show = (isNotEmpty(ads_item.isappear) &&  String(ads_item.isappear) == 'true')

        return can_show;

    }


    componentWillUnmount() {
        if (DeviceEventEmitter.isActive) {
            DeviceEventEmitter.remove();
        }
    }


    render() {
        if (this.state.isShow.value) {
            let data = this.state.data;
            let url = null
            if (isNotEmpty(data)) {
                url = data.image;
            }
            return (
                <View
                    {...this._panResponder.panHandlers}
                    style={[{position:'absolute',top:height-200,left:width-60},this.state.style]}
                >
                    <Animated.View
                        style={{opacity: this.state.fadeInOpacity,marginLeft:this.state.fadeInLeft}}>
                        <Image style={{width:60,height:60}}
                               source={isNotEmpty(url)?{uri:url}:require('../../img/inva.png')}/>
                    </Animated.View>
                </View>
            )
        } else {
            return null
        }
    }

    invite() {
        const {navigate} = this.props.getNavigation();
        getItem(kAccountKey).then((id)=> {
                if (id) {
                    mobClick('invite-prizes-buoy')
                    getWinCashData(navigate);
                } else {
                    pushNavigation(navigate, {type: 'get_login'});
                }
            }
        )
    }
}
