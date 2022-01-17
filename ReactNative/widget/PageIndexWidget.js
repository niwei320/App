import React from 'react'
import {
    Text,
    View,
} from 'react-native'
import {iphoneBottomMargin} from "../PublicModule/Util/YFWPublicFunction";

export default class PageIndexWidget extends React.Component {

    constructor(props) {
        super(props)
        this.state={
            cureent:1,
            max:1
        }
    }

    render() {
        return (
            <View style={{position:'absolute',alignSelf: 'center',bottom:30+iphoneBottomMargin(),width:80,height:25,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,0,0,0.5)'
                ,borderRadius:25/2}}>
                <Text style={{fontSize:13,color:'white'}}>{this.state.cureent}/{parseInt(this.state.max)}</Text>
            </View>
        )
    }

    setProgress(cureent,max){
        if(cureent == this.state.cureent && max == this.state.max){return}
        this.setState({
            cureent:cureent>max?max:cureent,
            max:max
        })
    }
}