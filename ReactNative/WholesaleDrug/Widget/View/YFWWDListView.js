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
    FlatList
} from 'react-native';
import YFWWDBaseView from '../../Base/YFWWDBaseView';
import YFWWDListPageDataModel from '../Model/YFWWDListPageDataModel';
import YFWWDMedicineItem from './YFWWDListItem';
import { adaptSize, kScreenWidth, tcpImage, isNotEmpty } from '../../../PublicModule/Util/YFWPublicFunction';
import YFWWDMedicineInfoModel from '../Model/YFWWDMedicineInfoModel';
import YFWListFooterComponent from "../../../PublicModule/Widge/YFWListFooterComponent";

export default class YFWWDListView extends YFWWDBaseView {

    constructor(props) {
        super(props);
        this.listType = this.props.listType || 'list'           //list collection
        this.itemOffest = this.props.itemOffest || 5          //一行显示多个时，item的间距
        this.data = this.props.model ? YFWWDListPageDataModel.init(this.props.model) : new YFWWDListPageDataModel()
        this.hidePrice = false
    }

    componentWillReceiveProps(props) {
        this.data = YFWWDListPageDataModel.init(props.model)
        this.listType = props.listType
    }

    render() {
        if (this.data.needRequest) {
            return (
                <FlatList
                    onLayout={(event) => {
                        if (!this.props.isSubList) {
                            this._onLayout(event,this.flatlist)
                        }
                        this.updateViews('item_refresh')
                    }}
                    ref={(ref) =>this.flatlist= ref}
                    style={this.props.style}
                    horizontal={false}
                    key={this.listType=='list'?'list':'collection'}
                    numColumns={this.listType=='list'||this.listType=='list-list'?1:this.data.numColumns}
                    renderItem={this.listType=='list-list'?(item)=>this.renderList(item.item):this.listType=='list'?(item)=>this.renderListItem(item.item):(item)=>this.renderCollectionItem(item)}
                    data={this.data.dataArray}
                    ListHeaderComponent={this.renderHeader.bind(this)}
                    ListFooterComponent={this.renderFooter.bind(this)}
                    ListEmptyComponent={() => { return this.statusView || <View/>}}
                    onEndReachedThreshold={0.1}
                    onRefresh={() => this.listRefresh()}
                    refreshing={this.data.needRequest&&this.data.refreshing}
                    onEndReached={()=> this.onEndReached()}
                />
            )
        } else {
            return (
                <FlatList
                    onLayout={(event) => {
                        if (!this.props.isSubList) { 
                            this._onLayout(event,this.flatlist)
                        }
                        this.updateViews('item_refresh')
                    }}
                    ref={(ref) =>this.flatlist= ref}
                    style={this.props.style}
                    horizontal={false}
                    key={this.listType=='list'?'list':'collection'}
                    numColumns={this.listType=='list'?1:this.data.numColumns}
                    renderItem={this.listType=='list'?(item)=>this.renderListItem(item.item):(item)=>this.renderCollectionItem(item)}
                    data={this.data.dataArray}
                    ListEmptyComponent={() => { return this.statusView || <View/>}}
                    ListHeaderComponent={this.renderHeader.bind(this)}
                />
            )
        }
    }

    renderHeader() {
        return this.listType=='list'?null:<View style={{flex:1,height:8}}/>
    }


    renderFooter() {
        return <YFWListFooterComponent showFoot={this.data.showFoot}/>
    }

    renderList(item) { 
        return (
            <View style={{marginTop:17, borderRadius:7,backgroundColor:'white',paddingHorizontal:18,paddingVertical:13}}>
                <Text style={{fontSize:13,fontWeight:'bold',marginBottom:13}}>{item.title}</Text>
                <YFWWDListView father={this} model={item.model} navigation={this.props.navigation} listType='list' isSubList={true}/>
            </View>
        )
    }

    renderListItem(listitem) {
        return (
            <View style={{flex:1}}>
                <YFWWDMedicineItem father={this} numColumns={1} model={listitem} navigation={this.props.navigation} offset={this.itemOffest} itemType={'list'} from={this.data.from}/>
            </View>
        )
    }

    renderCollectionItem(collectionItem) {
        return (
            <View style={{flex:1,paddingLeft:collectionItem.index%2 == 0?this.itemOffest:this.itemOffest/2,paddingRight:collectionItem.index%2 == 1?this.itemOffest:this.itemOffest/2}}>
                <YFWWDMedicineItem father={this} numColumns={this.data.numColumns} model={collectionItem.item} navigation={this.props.navigation} offset={this.itemOffest} itemType={'collection'} from={this.data.from}/>
            </View>
        )
    }


    updateViews(type) {
        if (type == 'item_refresh') {
            this.setState({})
        }
    }

    listRefresh() {
        if (this.data.needRequest) {
            this.props.father&&this.props.father.listRefresh&&this.props.father.listRefresh()
        }
    }

    onEndReached() {
        this.props.father&&this.props.father.onEndReached&&this.props.father.onEndReached()
    }

    toDetail(medicine) {
        this.props.father&&this.props.father.toDetail&&this.props.father.toDetail(medicine)
    }

    subMethods(key,item) {
        this.props.father&&this.props.father.subMethods&&this.props.father.subMethods(key,item)
    }
}

const styles = StyleSheet.create({
   container_style: {width:300,height:100,backgroundColor: 'red'},
});