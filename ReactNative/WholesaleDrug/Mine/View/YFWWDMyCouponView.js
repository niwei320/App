import React, { Component } from 'react';
import {StyleSheet,View} from 'react-native';
import YFWWDBaseView, { kNav_Linear, kBaseView_StatusView, kBaseView_TipsDialog } from '../../Base/YFWWDBaseView';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import YFWScrollableTabBar from '../../../PublicModule/Widge/YFWScrollableTabBar';
import { kStyleWholesale, kScreenWidth } from '../../../PublicModule/Util/YFWPublicFunction';
import YFWWDListView from '../../Widget/View/YFWWDListView';

export default class YFWWDMyCouponView extends YFWWDBaseView {

    constructor(props) {
        super(props);
        
    }

    componentWillReceiveProps(props) { 
        this.props =  props  
    }

    
    render() {
        return (
            <View style={styles.container_style}>
                {this.renderNavigationView(kNav_Linear,'我的优惠券',0,'',true)}
                <ScrollableTabView
                    style={styles.pagerView}
                    initialPage={0}
                    locked={true}
                    tabBarBackgroundColor='#FFFFFF'
                    tabBarActiveTextColor='#16c08e'
                    tabBarUnderlineStyle={styles.lineStyle}
                    renderTabBar={() => <YFWScrollableTabBar from={kStyleWholesale} tabNames={['未使用', '已使用', '已过期']} width={kScreenWidth / 3} />}
                    onChangeTab={(obj) => this.changeType(obj)}
                >
                    <YFWWDListView tabLabel='未使用'  father={this} model={this.props.model} navigation = {this.props.navigation} listType='list'/>
                    <YFWWDListView tabLabel='已使用'  father={this} model={this.props.model} navigation = {this.props.navigation} listType='list'/>
                    <YFWWDListView tabLabel='已过期'  father={this} model={this.props.model} navigation = {this.props.navigation} listType='list'/>
                </ScrollableTabView>
                {super.render([kBaseView_StatusView,kBaseView_TipsDialog])}
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

    changeType(obj) { 
        this.props.father&&this.props.father.changeType&&this.props.father.changeType(obj)
    }

    subMethods(key,instance) {
        this.props.father&&this.props.father.subMethods&&this.props.father.subMethods(key,instance)
    }

}

const styles = StyleSheet.create({
   container_style: {flex:1,backgroundColor: 'white'},
});