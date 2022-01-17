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
    View,
} from 'react-native';
import YFWWDBaseView from '../../Base/YFWWDBaseView';
import ScrollableTabView, {ScrollableTabBar} from '../../../../node_modules_local/react-native-scrollable-tab-view';
import YFWWDGoodsListView from './YFWWDListView';

export default class YFWWDScrollableTabView extends YFWWDBaseView {

    constructor(props) {
        super(props);
        this.tabs = this.props.tabs,
        this.dataArray = this.props.dataArray,
        this.currentPage = 0
    }

    componentWillReceiveProps(props) { 
        this.tabs = props.tabs
        this.dataArray = props.dataArray
    }
    
    render() {
        if (this.tabs.length > 0) {
            return (
                <ScrollableTabView
                    ref={(view) => {this.scrollView = view}}
                    style={this.props.style}
                    initialPage={0}
                    tabUnderlineBottomOffset={5}
                    tabBarTextStyle={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: 'white'}}
                    tabBarUnderlineStyle={[styles.lineStyle, { width: 30 }]}
                    tabUnderlineStyleColor={'transparent'}
                    tabUnderlineBorderColor={'transparent'}
                    renderTabBar={() => <ScrollableTabBar style={{ backgroundColor: 'transparent', marginLeft: -10 }} />}
                    onChangeTab={(value) => {this.onChangeTab(value)}}
                >
                    {this.getPageViews()}
                </ScrollableTabView>
            )
        } else { 
            return <View flex={1}/>
        }
    }

    getPageViews() { 
        let views = []
        this.tabs.forEach((value, index) => {
            views.push(<YFWWDGoodsListView father={this} model={this.dataArray[index]} tabLabel={value} navigation = {this.props.navigation} initPosition = {index} listType='collection'/>)
        });
        return views
    }

    onChangeTab(value) { 
        this.currentPage = value.i
        if (value.from != value.i) { 
            this.props.father&&this.props.father.toCollect&&this.props.father.onChangeTab(value)
        }
    }

    listRefresh() { 
        this.props.father&&this.props.father.listRefresh&&this.props.father.listRefresh()
    }

    onEndReached() {
        this.props.father&&this.props.father.onEndReached&&this.props.father.onEndReached()
    }

    toDetail(medicine) {
        this.props.father&&this.props.father.toDetail&&this.props.father.toDetail(medicine)
    }
}

const styles = StyleSheet.create({
    scrollView_style: { backgroundColor: 'transparent'},
    lineStyle: { height: 4, backgroundColor: 'white', justifyContent: 'center' },
    
});
