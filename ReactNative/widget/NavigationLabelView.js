import React from 'react'
import {
    View,
    Image, DeviceEventEmitter, TouchableOpacity
} from 'react-native'
import {isNotEmpty} from "../PublicModule/Util/YFWPublicFunction";
import {NavigationActions} from "react-navigation";

/**
 * 导航底部Label控件
 */
export default class NavigationLabelView extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            selectIcon: this.props.selectIcon,
            unSelectIcon: this.props.unSelectIcon,
            standbyIcon: null
        }
        this.listener = DeviceEventEmitter.addListener('MainLabelChange', (value) => {
            if (this.state.standbyIcon != value) {
                this.state.standbyIcon = value
                this.setState({})
            }
        });
    }

    componentWillUnmount() {
        if (isNotEmpty(this.listener)) {
            this.listener.remove()
        }
    }

    render() {
        let icon = this.state.selectIcon
        if (this.props.isFocuse) {
            if (isNotEmpty(this.state.standbyIcon)) {
                icon = this.state.standbyIcon
            }
        } else {
            icon = this.state.unSelectIcon
        }
        return (
            <TouchableOpacity accessibilityLabel='home_page' style={{flex:1,textAlign:'center', justifyContent:'center'}} onPress = {this._sendEvent}>
                <Image source = {icon} style = {{width: 26, height: 26,marginTop: 2}} />
            </TouchableOpacity>
        )
    }

    _sendEvent = () => {
        /*传入进来的focuse到这里都是false，只能用整个HomeStack的navigation去判断*/
        let isFocuse = this.props.navigation.isFocused()
        if(isFocuse){
            if (isNotEmpty(this.state.standbyIcon)) {
                DeviceEventEmitter.emit('MainScrollToTop', true);
            } else {
                DeviceEventEmitter.emit('MainScrollToTop', false);
            }
        }else{
            const resetActionTab = NavigationActions.navigate({routeName: 'HomePageNav'});
            this.props.navigation.dispatch(resetActionTab);
        }
    }
}