import React, { Component } from 'react';
import {
    View,
    FlatList
} from 'react-native';

import YFWSearchHeader from './YFWSearchHeaderView'

export default class YFWHeaderExamplePage extends Component {
    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: true,

        header: null,
    });

    constructor(...args) {
        super(...args);
        this.state = {
            data: ['sss', 'ss', 'ss', 'ss', 'sss', 'sss', 'ss'],
        };
    }


    render() {
        return (
            <View style={{ flex: 1, flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start' }}>

                <FlatList
                    extraData={this.state}
                    data={this.state.data}
                    renderItem={this._renderItem.bind(this)}
                    onScroll={this._onScroll}
                    scrollEventThrottle={50} />

                <YFWSearchHeader ref='searchHeaderView'
                    navigation={this.props.navigation}
                    from={'home'} bgStyle={{ position: 'absolute' }}
                    onSearchClick={() => { this.onSearchClick() }}
                    onMessageClick={() => { this.onMessageClick() }} />
            </View>
        )
    }

    _renderItem = (item) => {
        let colors = ['orange', '#999']

        return (
            <View style={{ height: 220, backgroundColor: colors[item.index % colors.length] }}></View>
        )
    }

    //list滑动监听方法，通知给headerView
    _onScroll = (event) => {
        try {
            let contentY = event.nativeEvent.contentOffset.y;
            this.refs.searchHeaderView.setOffsetProps(contentY);

        } catch (e) { }
    }

    onSearchClick() {

    }

    onMessageClick() {
        const {navigate} = this.props.navigation;
        navigate('YFWEmptyPage');
    }
}