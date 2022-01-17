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
import YFWWDBaseView, { kNav_Defalut, kBaseView_StatusView, kBaseView_WebView_Alert } from '../../Base/YFWWDBaseView';
import YFWWDListView from '../../Widget/View/YFWWDListView';
import YFWWDStatusView from '../../Widget/View/YFWWDStatusView';

export default class YFWWDMessageListView extends YFWWDBaseView {

    constructor(props) {
        super(props);
    }

    componentWillReceiveProps(props) { 
        this.props =  props  
    }

    
    render() {
        return (
            <View style={styles.container_style}>
                {this.renderNavigationView(kNav_Defalut,this.props.father.instance.itemTitle)}
                <YFWWDListView ref={view => this.listView = view} father={this} model={this.props.model} navigation={this.props.navigation} listType='list' />
                {super.render([kBaseView_StatusView,kBaseView_WebView_Alert])}
            </View>
        )
    }


    updateViews() { 
        this.setState({})
    }

    retry() {
        this.props.father&&this.props.father.retry&&this.props.father.retry()
    }

    listRefresh() {
        this.props.father&&this.props.father.listRefresh&&this.props.father.listRefresh()
    }

    onEndReached() {
        this.props.father&&this.props.father.onEndReached&&this.props.father.onEndReached()
    }

    toDetail(instance) {
        this.props.father&&this.props.father.toDetail&&this.props.father.toDetail(instance)
    }

    
}

const styles = StyleSheet.create({
   container_style: {flex:1,backgroundColor: '#FAFAFA'}
});