import React, {Component} from 'react';
import {Text} from 'react-native'
import { adaptSize } from '../Util/YFWPublicFunction';


export default class YFWTimeText extends Component {

    constructor(props) {
        super(props)
        this.fontSize = this.props.fontSize || 13
        this.color = this.props.color || '#1fdb9b'
        this.times = this.props.times || 1800
        this.title = this.props.title || '付款'
        this.width = this.props.width || adaptSize(60)
        this.format = this.props.format || 'mm:ss'
        this.showTimeZero = this.props.showTimeZero || false
        this.timeCallback = ()=>{this.props.timeCallback && this.props.timeCallback()}
    }

    componentDidMount(){
        this.startTimer()
    }

    componentWillReceiveProps(nextPropos){
        if (nextPropos.times != this.props.times) {
            this.times = nextPropos.times
            this.clearTimer()
            this.startTimer()
        }
    }

    componentWillUnmount(){
        this.clearTimer()
    }

    clearTimer(){
        if(this.timer){
            clearInterval(this.timer);
        }
    }

    startTimer(){
        this.timer = setInterval(
            ()=>{
               this.times = this.times -1
               this.setState({})
            }, 1000)
    }

    timeStrFormat(number){
        return number < 10? '0'+number:number
    }

    render() {
        this.times = parseInt(this.times)
        let ssStr = this.timeStrFormat(this.times%60)
        let mmStr = this.timeStrFormat(parseInt(this.times/60)%60)
        let timeStr = mmStr + ':' + ssStr
        if(this.format==='hh:mm:ss'){
            let hhStr = this.timeStrFormat(parseInt(this.times/3600)%24)
            timeStr = hhStr + ':' + timeStr
        }
        if (this.times <= 0){
            this.clearTimer();
            if(this.props.times > 0) this.timeCallback();
            if(!this.showTimeZero) timeStr = '';
        }
        return (
            <Text style={{includeFontPadding:false,textAlign:'center',textAlignVertical:'center',color:this.color,fontSize:this.fontSize,minWidth:this.width}}>{this.title+timeStr}</Text>
        )
    }



}
