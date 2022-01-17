import React, {Component} from 'react';
import {
    View,
    Image,
    DeviceEventEmitter,
    Text,
    Platform,
    TouchableOpacity,
    StyleSheet
} from 'react-native'
import ScrollableTabView, {ScrollableTabBar,DefaultTabBar} from '../../../node_modules_local/react-native-scrollable-tab-view';
import YFWShopCategoryItemGoodsListView from './YFWShopCategoryItemGoodsListView';
import YFWShopRecomandGoodsView from './YFWShopRecomandGoodsView';

export default class YFWShopCategoryGoodsListView extends Component {

    constructor(props) {
        super(props)
        this.shopRecommendItem = this.props.shopRecommendItem
        this.shopCategorItem = this.props.shopCategorItem
        this.shopID = this.props.shopID
    }

    componentWillMount(){
    
    }
    componentWillUnmount(){

    }


    componentDidMount(){
        
    }

    componentWillReceiveProps(props){
        this.shopRecommendItem = props.shopRecommendItem
        this.shopCategorItem = props.shopCategorItem
        this.shopID = props.shopID
        this.setState({})
    }

    refreshView(){
        
    }

    render() {
        return (
            <ScrollableTabView
                ref={(view)=>{this.scrollView = view}}
                style={[styles.pagerView,{flex: 6}]}
                initialPage={0}
                tabBarBackgroundColor='transparent'
                tabUnderlineBottomOffset={5}
                tabBarActiveTextColor='white'
                tabBarInactiveTextColor = 'white'
                tabBarUnderlineStyle={[styles.lineStyle,{width:30}]}
                tabUnderlineStyleColor={'transparent'}
                tabUnderlineBorderColor={'transparent'}
                onChangeTab={(value)=>{}}
                renderTabBar={() => <ScrollableTabBar backgroundColor={'transparent'}/>}
            >
                <YFWShopRecomandGoodsView tabLabel='商家优选' status={'recomend'} navigation = {this.props.navigation} initPosition = {0} dataArray = {this.shopRecommendItem}/>
                <YFWShopCategoryItemGoodsListView tabLabel={'中西药品'} status={1} shopID={this.shopID} navigation = {this.props.navigation} initPosition = {1} />
                <YFWShopCategoryItemGoodsListView tabLabel={'医疗器械'} status={2} shopID={this.shopID} navigation = {this.props.navigation} initPosition = {2} />
                <YFWShopCategoryItemGoodsListView tabLabel={'养生保健'} status={3} shopID={this.shopID} navigation = {this.props.navigation} initPosition = {3} />
                <YFWShopCategoryItemGoodsListView tabLabel={'美容护肤'} status={4} shopID={this.shopID} navigation = {this.props.navigation} initPosition = {4} />
                <YFWShopCategoryItemGoodsListView tabLabel={'计生用品'} status={5} shopID={this.shopID} navigation = {this.props.navigation} initPosition = {5} />
                <YFWShopCategoryItemGoodsListView tabLabel={'中药饮片'} status={6} shopID={this.shopID} navigation = {this.props.navigation} initPosition = {6} />
            </ScrollableTabView>
        )
    }
}

//样式
const styles = StyleSheet.create({
    pagerView: {
        backgroundColor:'transparent'
    },
    lineStyle: {
        height: 4,
        backgroundColor: 'white',
        justifyContent:'center'
    },
})