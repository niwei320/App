/**
 * 倒计时：天时分秒
 */
import React, {
    Component,
} from 'react';

import {
    StyleSheet,
    View,
    Text,
} from 'react-native';

const styles = StyleSheet.create({
    text: {
        fontSize: 30,
        color: 'rgb(153,153,153)',
        marginLeft: 7,
    },
    container: {
        flexDirection: 'row',
    },
    // 时间文字
    defaultTime: {
        paddingHorizontal: 3,
        backgroundColor: 'white',
        fontSize: 12,
        color: 'rgb(153,153,153)',
        marginHorizontal: 3,
        borderRadius: 2,
    },
    // 冒号
    defaultColon: {
        fontSize: 12,
        color: 'rgb(153,153,153)'
    },
    // 提示
    defaultTip: {
        fontSize: 12,
        color: 'rgb(153,153,153)',
    }
});

class CountDown extends Component {
    static displayName = 'Simple countDown';
    static defaultProps = {
        date: new Date(),
        days: {
            plural: '天',
            singular: '天',
        },
        hours: ':',
        mins: ':',
        segs: ':',
        tip: '',
        onEnd: () => { },
        containerStyle: styles.container, 
        daysStyle: styles.defaultTime,
        hoursStyle: styles.defaultTime,
        minsStyle: styles.defaultTime,
        secsStyle: styles.defaultTime,
        firstColonStyle: styles.defaultColon,
        secondColonStyle: styles.defaultColon,
        tipStyle: styles.defaultTip,
    };
    state = {
        days: 0,
        hours: 0,
        min: 0,
        sec: 0,
    };
    componentDidMount() {
        this.interval = setInterval(() => {
            const date = this.getDateData(this.props.date);
            if (date) {
                this.setState(date);
            } else {
                this.stop();
                this.props.onEnd();
            }
        }, 1000);
    }
    componentWillMount() {
        const date = this.getDateData(this.props.date);
        if (date) {
            this.setState(date);
        }
    }
    componentWillUnmount() {
        this.stop();
    }
    getDateData(endDate) {
        endDate = endDate.replace(/-/g, "/");
        console.log('end', new Date(endDate));
        console.log('now', new Date);
        // console.log('end===',Date.parse(new Date(endDate)));
        // console.log('now===',Date.parse(new Date));
        let diff = (Date.parse(new Date(endDate)) - Date.parse(new Date)) / 1000;
        if (diff <= 0) {
            return false;
        }
        // console.log('===========',diff);
        const timeLeft = {
            years: 0,
            days: 0,
            hours: 0,
            min: 0,
            sec: 0,
            millisec: 0,
        };

        if (diff >= (365.25 * 86400)) {
            timeLeft.years = Math.floor(diff / (365.25 * 86400));
            diff -= timeLeft.years * 365.25 * 86400;
        }
        if (diff >= 86400) {
            timeLeft.days = Math.floor(diff / 86400);
            diff -= timeLeft.days * 86400;
        }
        if (diff >= 3600) {
            timeLeft.hours = Math.floor(diff / 3600);
            diff -= timeLeft.hours * 3600;
        }
        if (diff >= 60) {
            timeLeft.min = Math.floor(diff / 60);
            diff -= timeLeft.min * 60;
        }
        timeLeft.sec = diff;
        return timeLeft;
    }
    render() {
        const countDown = this.state;
        let days;
        if (countDown.days === 1) {
            days = this.props.days.singular;
        } else {
            days = this.props.days.plural;
        }
        return (
            <View style={this.props.containerStyle}>
                {this.props.tip ? <Text style={this.props.tipStyle}>{this.props.tip}</Text> : null}
                {(countDown.days > 0) ? <Text style={this.props.daysStyle}>{this.leadingZeros(countDown.days) + days}</Text> : null}
                {countDown.hours > 0 ? <Text style={this.props.hoursStyle}>{this.leadingZeros(countDown.hours)}</Text> : null}
                {countDown.hours > 0 ? <Text style={this.props.firstColonStyle}>{this.props.hours}</Text> : null}
                <Text style={this.props.minsStyle}>{this.leadingZeros(countDown.min)}</Text>
                <Text style={this.props.secondColonStyle}>{this.props.mins}</Text>
                <Text style={this.props.secsStyle}>{this.leadingZeros(countDown.sec)}</Text>
                <Text style={this.props.secondColonStyle}>{this.props.segs}</Text>
                <Text style={this.props.secondColonStyle}>后过期</Text>

            </View>
        );
    }
    stop() {
        clearInterval(this.interval);
    }
    // 数字前面补0
    leadingZeros(num, length = null) {
        let length_ = length;
        let num_ = num;
        if (length_ === null) {
            length_ = 2;
        }
        num_ = String(num_);
        while (num_.length < length_) {
            num_ = '0' + num_;
        }
        return num_;
    }
}

export default CountDown;