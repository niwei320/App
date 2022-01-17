import React,{Component} from 'react'
import {View,Text,TouchableOpacity,Image,DeviceEventEmitter} from 'react-native'
import YFWNativeManager from '../Utils/YFWNativeManager';
import { doAfterLogin } from '../Utils/YFWJumpRouting';
export default class YFWMessageRedPointView extends Component {


    constructor(args){
        super(args)
        this.state = {
            messageCount:null
        }
    }

    static defaultProps = {
        messageCount: null,
        isWhiteBg: true,
        callBack : ()=>{}
    }

    componentWillReceiveProps(nextProps){
        if (nextProps.messageCount) {
            this.setState({
                messageCount:nextProps.messageCount
            })
        }
    }

    componentDidMount(){
        DeviceEventEmitter.addListener('ALL_MESSAGE_RED_POINT_STATUS', (value)=> {
            this.setState({
                messageCount:value
            })
        })
    }

    render(){

        let messageCount = this.coverMessageCount()
        let imageSource = this.props.isWhiteBg?require('../../img/icon_notice.png'):require('../../img/icon_notice_2.png')
        return(
            <TouchableOpacity activeOpacity={1} onPress={()=>{this.clickedAction()}} style={{width:22,height:22,marginRight:13,overflow:'visible'}} hitSlop={{left:10,top:10,bottom:10,right:10}}>
                <Image style={{width:22,height:22,overflow:'visible'}} source={imageSource}></Image>
                {messageCount?
                    <View style={{minWidth:13,borderTopLeftRadius: 6,borderTopRightRadius: 6,borderBottomLeftRadius: 0,borderBottomRightRadius: 6,backgroundColor: "#ff3300",position:'absolute',top:-6,right:-5,flex:1}}>
                        <Text style={{color:'white',fontSize:11,paddingHorizontal:2,textAlign:'center',lineHeight:13}}>{messageCount}</Text>
                    </View>:null
                }
            </TouchableOpacity>
        )
    }

    coverMessageCount(){
        let messageCount = parseInt(this.state.messageCount)
        if (isNaN(messageCount) || messageCount ==0) {
            messageCount = null
        } else if(messageCount > 99) {
            messageCount = '99+'
        }
        return messageCount
    }

    clickedAction(){
        YFWNativeManager.mobClick('account-message');
        const {navigate} = this.props.navigation;
        doAfterLogin(navigate, ()=> {
            let badge = new Map();
            navigate('YFWMyMessageController', {state: badge})
        })
        if (this.props.callBack) {
            this.props.callBack()
        }
    }
}