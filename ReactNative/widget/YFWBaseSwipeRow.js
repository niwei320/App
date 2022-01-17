/**
 * Created by nw on 2018/9/12.
 */

import React from 'react';
import {
    DeviceEventEmitter,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SwipeRow } from 'react-native-swipe-list-view';
import {backGroundColor,} from "../Utils/YFWColor";
import YFWUserInfoManager from '../Utils/YFWUserInfoManager';


export default class YFWBaseSwipeRow extends SwipeRow {

    constructor(...args) {
        super(...args);
        this.state = {
            selectSwipeRow:{},
            noLocationHidePrice:YFWUserInfoManager.ShareInstance().getNoLocationHidePrice(),
        };
    }

    componentDidMount() {
        this.simple_Listener = DeviceEventEmitter.addListener('CloseSimpleSwipeRow', () => {
            if (this.state.selectSwipeRow != this.swipeRow) {
                this.swipeRow && this.swipeRow.closeRow();
            }
            this.state.selectSwipeRow = {};
        });
        this.locationListener = DeviceEventEmitter.addListener('NO_LOCATION_HIDE_PRICE', (isHide) => {
            this.setState({
                noLocationHidePrice: isHide
            })
        })
    }

    componentWillUnmount() {
        this.simple_Listener && this.simple_Listener.remove()
        this.locationListener && this.locationListener.remove()
    }

    _delFn() {
        if (this.props.delFn) {
            this.props.delFn();
            DeviceEventEmitter.emit('CloseSimpleSwipeRow');
        }
    }

    _selectItemMethod() {
        if (this.props.selectItemMethod) {
            this.props.selectItemMethod()
        }
    }

    _onRowOpenFn() {
        this.state.selectSwipeRow = this.swipeRow;
        DeviceEventEmitter.emit('CloseSimpleSwipeRow');

    }

    render() {
        return (
            <SwipeRow
                {...this.props}
                ref={(c) => this.swipeRow = c}
                rightOpenValue={-60}
                previewOpenValue={-40}
                swipeToOpenPercent={10}
                swipeToClosePercent={10}
                onRowOpen={() => this._onRowOpenFn()}
                onPress={()=>this._selectItemMethod()}
                previewOpenDelay={3000}
                disableRightSwipe={true}
                disableLeftSwipe={this.props.disable === undefined ? false:this.props.disable}>
                <View style={styles.quickAContent}>
                    <TouchableOpacity style={[styles.quick, { backgroundColor: '#ff6e40'},this.props.deleleStyle]} onPress={() => { this._delFn() }}>
                        <Text style={{ color: "#fff", textAlign: 'center' }}>删除</Text>
                    </TouchableOpacity>
                </View>
                {this.props.children}
            </SwipeRow>
        );

    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        backgroundColor: backGroundColor(),
    },

    rowItem: {
        backgroundColor: 'white',
    },
    bottomView: {
        height: 50,
        width: Dimensions.get('window').width,
        backgroundColor: 'white',
    },

    //侧滑菜单的样式
    quickAContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    quick: {
        width: 60,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center'
    }
});