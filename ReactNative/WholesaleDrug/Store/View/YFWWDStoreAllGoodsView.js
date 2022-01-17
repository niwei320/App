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
    StatusBar,
} from 'react-native';
import YFWWDBaseView, { kBaseView_StatusView } from '../../Base/YFWWDBaseView';
import YFWWDSearchHeader from '../../Widget/View/YFWWDSearchHeader';
import YFWWDFilterBar from '../../Widget/View/YFWWDFilterBar';
import YFWWDGoodsListView from '../../Widget/View/YFWWDListView';
import YFWWDListPageDataModel from '../../Widget/Model/YFWWDListPageDataModel';
import YFWUserInfoManager from '../../../Utils/YFWUserInfoManager';
import { kScreenWidth, kScreenHeight } from '../../../PublicModule/Util/YFWPublicFunction';
import {yfwGreenColor,darkTextColor} from '../../../Utils/YFWColor'
import { BaseStyles } from '../../../Utils/YFWBaseCssStyle';

export default class YFWWDStoreAllGoodsView extends YFWWDBaseView {

    constructor(props) {
        super(props);
        this.listType = YFWUserInfoManager.ShareInstance().tableStyle ? 'list' : 'collection'
        this.category=[]
        this.categoryViewOpen = false
        this.selectCategoryItem = ''
    }

    componentWillReceiveProps(props) {
        this.props = props
    }

    
    render() {
        return (
            <View style={styles.container_style}>
                <StatusBar ref={'StatusBar'} barStyle='light-content'/>
                 {super.render([kBaseView_StatusView])}
                <YFWWDSearchHeader father={this}/>
                <YFWWDFilterBar father={this} ref={(view) => { this.filterView = view }} />
                {this.renderCollectBillsHint()}
                <View style={{flex:1}}>
                    <YFWWDGoodsListView father={this} model={this.props.model} navigation={this.props.navigation} listType={this.listType} itemOffest={5}/>
                </View>
                {this.openCategoryView()}
            </View>
        )
    }

    openCategoryView() { 
        if (this.category.length == 0) {
            this.props.father && this.props.father.getCategory && this.props.father.getCategory((data) => {
                this.category = data
                return this.renderCategoryView()
            })
        } else { 
            return this.renderCategoryView()
        }
        
    }

    renderCategoryView() { 
        if (this.categoryViewOpen) {
            return (
                <View style={{ width: kScreenWidth, height: kScreenHeight, top: 0, position: 'absolute' }} activeOpacity={1} onPress={() => this.hideCategoryView()}>
                    <TouchableOpacity style={{backgroundColor: 'transparent',height:this.filterView.self_height+this.filterView.yValue}} onPress={() => this.hideCategoryView()}/>
                    <View style={[BaseStyles.sectionListStyle,{paddingBottom:13,backgroundColor:'#fff'}]} >
                        { this.category.map((item,index)=> {
                            let textColor = this.selectCategoryItem === index ? 'rgb(84,124,255)' : darkTextColor()
                            let borderColor = this.selectCategoryItem === index ? 'rgb(84,124,255)' : '#cccccc'
                            return(
                                <TouchableOpacity key={index} onPress={() => this.categoryClick(item,index)} underlayColor="transparent">
                                    <View style={[styles.row2,{paddingHorizontal:15,paddingVertical:10}]}>
                                        <View style={{flex:1, height:24, borderColor:borderColor, borderWidth:1, borderRadius:12,justifyContent:'center', alignItems:'center'}}>
                                            <Text style={{fontSize:12,color:textColor,fontWeight:'500'}}>{item.name}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                    <TouchableOpacity style={{backgroundColor: 'rgba(108,108,108,0.5)',height:kScreenHeight}} onPress={() => this.hideCategoryView()}/>
                </View>
            )
        } else {
            return null
        }
    }

     //满减提示
     renderCollectBillsHint(){
        if(this.props.father.model.showCollectBillsHint){
            return (
                <View style={{flexDirection:'row',width:kScreenWidth,backgroundColor:'#FAF8D9'}}>
                    <View style={{flex:1, marginVertical:10, marginHorizontal: 16}}>
                        {this.props.father.model.collectBillsInfo.add_on != ''?
                            <Text style={{fontSize: 12, color: '#FEAC4C'}}>{this.props.father.model.collectBillsInfo.add_on?this.props.father.model.collectBillsInfo.add_on:''}</Text>
                            : <View />
                        }
                        {this.props.father.model.collectBillsInfo.freepostage != '' ?
                            <Text style = {{fontSize: 12,color: '#FEAC4C'}}>{this.props.father.model.collectBillsInfo.freepostage ?this.props.father.model.collectBillsInfo.freepostage : ''}</Text>
                            :<View />
                        }
                        {this.props.father.model.collectBillsInfo.minprice_msg != '' ?
                            <Text style = {{fontSize: 12,color: '#FEAC4C'}}>{this.props.father.model.collectBillsInfo.minprice_msg ?this.props.father.model.collectBillsInfo.minprice_msg : ''}</Text>
                            :<View />
                        }
                    </View>
                    <TouchableOpacity onPress={() =>this.toShopCar()}>
                        <Text style={{marginVertical:10, marginHorizontal: 16,fontSize: 12, color: '#C1AD5C'}}>去购物车</Text>
                    </TouchableOpacity>
                </View>
            )
        }else {
            return (<View/>)
        }
    }

    toShopCar() { 
        this.props.father&&this.props.father.toShopCar&&this.props.father.toShopCar()
    }

    backMethod() { 
        this.props.father&&this.props.father.backMethod&&this.props.father.backMethod()
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

    changeFilterStatus(item) { 
        this.props.father&&this.props.father.changeFilterStatus&&this.props.father.changeFilterStatus(item)
    }

    searchClick(keyword) { 
        this.props.father&&this.props.father.searchClick&&this.props.father.searchClick(keyword)
    }

    toScanView() { 
        this.props.father&&this.props.father.searchClick&&this.props.father.toScanView()
    }

    changeListStyle(type) { 
        this.listType = type?'list':'collection'          //list collection
        this.updateViews()
    }
   
    categoryClick(item,index) { 
        this.selectCategoryItem = index
        this.props.father&&this.props.father.categoryClick&&this.props.father.categoryClick(item)
        this.hideCategoryView()
    }

    hideCategoryView() { 
        this.categoryViewOpen = false
        this.setState({})
    }

    toDetail(medicine) { 
        this.props.father&&this.props.father.toDetail&&this.props.father.toDetail(medicine)
    }
    
    subMethods(type,medicine) { 
        this.props.father&&this.props.father.subMethods&&this.props.father.subMethods(type,medicine)
    }
}

const styles = StyleSheet.create({
    container_style: { flex: 1, backgroundColor: '#FAFAFA' },
    row2: {
        flexDirection: "row",
        flexWrap: "wrap",
        width: kScreenWidth / 3,
        height: 40,
        backgroundColor: '#FFFFFF',
        justifyContent: "center",
        alignItems: "center",
    },
    row: {
        margin: 5,
        flexDirection: "column",
        backgroundColor: '#FFFFFF',
        flexWrap: "wrap",
        width: (kScreenWidth - 20) / 2,
        height: 200,
        justifyContent: "center",
        alignItems: "center",
    },
    
});