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
    View,SectionList
} from 'react-native';
import YFWWDBaseView, { kNav_Linear } from '../../Base/YFWWDBaseView';
import YFWWDSettingCell from '../../Widget/View/YFWWDSettingCell';

export default class YFWWDSettingView extends YFWWDBaseView {

    constructor(props) {
        super(props);
        
    }

    componentWillReceiveProps(props) { 
        this.props =  props  
    }

    
    render() {
        return (
            <View style={styles.container_style}>
                {this.renderNavigationView(kNav_Linear,'设置')}
                <SectionList
                    sections = {this.props.model.pageData}
                    renderItem = {this._renderCell.bind(this)}
                    renderSectionHeader = {this._renderSectionHeader}
                    renderSectionFooter = {this._renderSectionFooter}
                    ItemSeparatorComponent = {this._renderSeparator}
                    // ListFooterComponent = {this._renderListFooter}
                    stickySectionHeadersEnabled={false}
                />
            </View>
        )
    }


    updateViews() { 
        this.setState({})
    }

    _renderCell({item}) {
        return <YFWWDSettingCell model={item} callBack={this._selectCell.bind(this)}/>
    }

    _renderSectionHeader({section}) {
        if (section.isShowHeader === true) {
            return (
                <View style={styles.sectionHeader}>
                    <Text style={{ fontSize: 15, fontWeight:'bold',color:'#333333'}}>{title}</Text>
                </View>
            )
        }
    }

    _renderSectionFooter({item}) {
        return <View style={styles.sectionFooter}/>
    }

    _renderSeparator() {
        return (
            <View style={styles.separator}>
                <View style={{backgroundColor:'#FAFAFA', height: 1}}></View>
            </View>
        )
    }

    _selectCell(item){
        this.props.father&&this.props.father.selectCell&&this.props.father.selectCell(item)
    }
}

const styles = StyleSheet.create({
    container_style: { flex: 1, backgroundColor: '#FAFAFA' },
    sectionHeader: {
        height: 40,
        backgroundColor: '#FAFAFA',
        paddingLeft: 16,
    },
    sectionFooter: {
        height: 12,
        backgroundColor: '#FAFAFA',
    },
    separator: {
        backgroundColor: 'white',
        paddingLeft: 16,
        height: 1,
    }
});