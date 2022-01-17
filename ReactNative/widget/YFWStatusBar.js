import React, {Component} from 'react';
import {
    View,
    StatusBar, DeviceEventEmitter, Platform,
} from 'react-native'
import {isNotEmpty} from "../PublicModule/Util/YFWPublicFunction";
import {pushNavigation} from "../Utils/YFWJumpRouting";

var onLoad = true;

export default class YFWStatusBar extends Component {

    static defaultProps = {
        from:'',
    }

    constructor(props) {
        super(props)

        this.listener()
    }

    listener() {
        //监听屏幕正在显示
        this.didFocus = this.props.addListener('didFocus',
            payload => {
                StatusBar.setBarStyle('light-content');
                onLoad = false;
                setTimeout(()=> {onLoad=true}, 500)
            }
        );
        //监听屏幕正在消失
        this.willBlur = this.props.addListener('willBlur',
            payload => {
                if (onLoad){
                    StatusBar.setBarStyle('dark-content');
                }
            }
        );
    }

    componentWillUnmount() {

        this.didFocus.remove();
        this.willBlur.remove();

    }

    render() {
        return (
            <StatusBar ref={'StatusBar'} />
        )
    }
}