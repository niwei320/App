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
import YFWWDBaseView, { kNav_Defalut } from '../../Base/YFWWDBaseView';
import YFWWDListView from '../../Widget/View/YFWWDListView';

export default class YFWWDMessageHomeView extends YFWWDBaseView {

    constructor(props) {
        super(props);
        
    }

    componentWillReceiveProps(props) { 
        this.props =  props  
    }

    
    render() {
        return (
            <View style={styles.container_style}>
                {this.renderNavigationView(kNav_Defalut,'我的消息')}
                <YFWWDListView father={this} model={this.props.model} navigation = {this.props.navigation} listType='list'/>
            </View>
        )
    }

    updateViews() { 
        this.setState({})
    }

    toDetail(item) {
        this.props.father&&this.props.father.toDetail&&this.props.father.toDetail(item)
    }
}

const styles = StyleSheet.create({
   container_style: {flex:1,backgroundColor: '#FAFAFA'},
});