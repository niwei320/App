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
import YFWWDBaseView, { kBaseView_StatusView } from '../../Base/YFWWDBaseView';
import { YFWImageConst } from '../../Images/YFWImageConst';
import { kNavigationHeight, kStatusHeight, kScreenWidth } from '../../../PublicModule/Util/YFWPublicFunction';
import LinearGradient from 'react-native-linear-gradient';
import YFWWDGoodsListView from '../../Widget/View/YFWWDListView';

export default class YFWWDFrequentlyGoodsView extends YFWWDBaseView {

    constructor(props) {
        super(props);
        
    }

    componentWillReceiveProps(props) { 
        this.props =  props  
    }

    
    render() {
        return (
            <View style={styles.container_style}>
                {this.renderNavigationView()}
                <YFWWDGoodsListView ref={view => this.listView = view} father={this} model={this.props.model.listModel} navigation={this.props.navigation} listType='list' />
                {super.render([kBaseView_StatusView])}
            </View>
        )
    }

//导入YFWImageConst
     renderNavigationView() { 
         return (
             //导入LinearGradient
            <LinearGradient style={{ height: kNavigationHeight, paddingTop: kStatusHeight, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'white' }} colors={['rgb(82,66,255)', 'rgb(65,109,255)']} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }} locations={[0, 1]}>
                <TouchableOpacity onPress={() => this.backMethod()} activeOpacity={1} style={styles.backbotton_style}>
                    <Image style={styles.backicon_style} source={ YFWImageConst.Nav_back_white}/>
                </TouchableOpacity>
                <View style={{flex:1,height:kNavigationHeight-kStatusHeight,flexDirection:"row",justifyContent:'center',alignItems:'center',}}>
                    <Text style={{ fontSize: 17, color: 'white' }}>常购商品</Text>
                </View>
                <TouchableOpacity style={styles.backbotton_style}/>
            </LinearGradient>
        )
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

    toDetail(medicine) {
        this.props.father&&this.props.father.toDetail&&this.props.father.toDetail(medicine)
    }
}

//导入kNavigationHeight、kStatusHeight
const styles = StyleSheet.create({
   container_style: {flex:1,backgroundColor: 'white'},
   backbotton_style: { width: 50, height: kNavigationHeight-kStatusHeight, justifyContent: 'center'},
    backicon_style: { width: 11, height: 19, marginLeft: 12, resizeMode: 'contain' },
});