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
import YFWWDBaseView, { kNav_Linear, kNav_Defalut, kNav_Bg, kBaseView_StatusView } from '../../Base/YFWWDBaseView';
import YFWWDListView from '../../Widget/View/YFWWDListView';

export default class YFWWDMyComplaintView extends YFWWDBaseView {

    constructor(props) {
        super(props);
        
    }

    componentWillReceiveProps(props) { 
        this.props =  props  
    }

    
    render() {
        return (
            <View style={styles.container_style}>
                {this.renderNavigationView(kNav_Linear,'我的投诉')}
                <View style={{flex:1,marginHorizontal:12}}>
                    <YFWWDListView father={this} model={this.props.model} navigation = {this.props.navigation} listType='list'/>
                </View>
                {super.render([kBaseView_StatusView])}
            </View>
        )
    }

    updateViews() { 
        this.setState({})
    }

    listRefresh() { 
        this.props.father&&this.props.father.listRefresh&&this.props.father.listRefresh()
    }

    onEndReached() {
        this.props.father&&this.props.father.onEndReached&&this.props.father.onEndReached()
    }

    toDetail(item) {
        this.props.father&&this.props.father.toDetail&&this.props.father.toDetail(item)
    }

    
}

//导入kNavigationHeight、kStatusHeight
const styles = StyleSheet.create({
   container_style: {flex:1,backgroundColor: '#FAFAFA'},
});