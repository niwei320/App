import React, { Component } from 'react';
import {
    DeviceEventEmitter,
    Image,
    NativeEventEmitter,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,ImageBackground
} from 'react-native';
import YFWWDBaseView, { kNav_Linear } from '../../Base/YFWWDBaseView';

export default class YFWWDFeedbackView extends YFWWDBaseView {

    constructor(props) {
        super(props);
        
    }

    componentWillReceiveProps(props) { 
        this.props =  props  
    }

    
    render() {
        return (
            <View style={styles.container_style}>
                {this.renderNavigationView(kNav_Linear, '意见反馈', 0, '', false, { title:'提交',action:this.upload})}
                <TextInput
                    underlineColorAndroid='transparent'
                    placeholder="您的意见对我们非常重要，我们会不断的优化和改善，努力为您带来更好的体验，谢谢！"
                    multiline={true}
                    onChangeText={this.onTextChange.bind(this)}
                    value={this.props.model.content}
                    style={{height:300,color:'#333333',fontSize:14,textAlignVertical:'top',padding:0,marginHorizontal:21,marginTop:32}}
                />
            </View>
        )
    }


    updateViews() { 
        this.setState({})
    }

    upload = ()=> { 
        this.props.father&&this.props.father.upload&&this.props.father.upload()
    }

    onTextChange(text) { 
        this.props.father&&this.props.father.onTextChange&&this.props.father.onTextChange(text)   
    }
}

const styles = StyleSheet.create({
   container_style: {flex:1,backgroundColor: '#FFF'},
});