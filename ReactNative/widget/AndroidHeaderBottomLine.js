import React from 'react'
import {
    View,
    Platform,
    Dimensions
} from 'react-native'
const width = Dimensions.get('window').width;
import {androidHeaderBottomLineColor} from '../Utils/YFWColor'
export default class AndroidHeaderBottomLine extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        if(Platform.OS == 'android'){
            return (
                <View style={{width:width,height:0.5,backgroundColor:androidHeaderBottomLineColor()}}/>
            )
        }else {
            return (
                <View/>
            )
        }
    }
}
