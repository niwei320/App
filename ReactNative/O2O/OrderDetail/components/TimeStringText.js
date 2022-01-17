import React, { Component} from 'react'
import { DeviceEventEmitter, Text } from 'react-native';

export default class TimeStringText extends Component {

    constructor(props) {
        super(props)
        let that = this
        this.state = {
            timeString: props.timeString,    //"2020-09-22 22:00:00"
            formatString: '',
            from:props.from
        }
        this.state.formatString = getRemainTimeString(this.state.timeString)
        this.timer = setInterval(() => {
            that.state.timeString = that.state.timeString -1
            that.state.formatString = getRemainTimeString(that.state.timeString)
            if (that.state.formatString == '00:00') {
                this.props.callBack && this.props.callBack()
            }
            that.setState({})
        }, 1000)
    }

    UNSAFE_componentWillReceiveProps(props) {
        if(this.props.timeString !== props.timeString){
            this.state.timeString = props.timeString
        }
        this.state.formatString = getRemainTimeString(this.state.timeString)
        this.setState({})
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }

    render() {
        return (
            <Text style={this.props.style}>{this.state.formatString}</Text>
        )
    }
}

function getRemainTimeString(date) {
    let returnStirng
    let disDate = date//new Date(date.replace(/-/g, '/')) - new Date()
    if (disDate <= 0) {
        returnStirng = '00:00'
    } else {
        let hour = parseInt(disDate / 3600)
        let minute = parseInt((disDate - hour * 3600) / 60)
        let seconds = parseInt(disDate - hour * 3600 - minute * 60)
        returnStirng = formatZero(minute, 2) + ':' + formatZero(seconds, 2)
    }
    return returnStirng
}

function formatZero(num, len = 2) {
    if (String(num).length > len) {
        return num;
    }
    return (Array(len).join(0) + num).slice(-len);
}

