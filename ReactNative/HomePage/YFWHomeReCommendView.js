import React, { Component } from 'react';
import {
    View,FlatList,DeviceEventEmitter
} from 'react-native';
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {
    mobClick,
} from "../PublicModule/Util/YFWPublicFunction";
import {pushNavigation} from "../Utils/YFWJumpRouting";
import YFWSubCategoryCollectionItemView from '../FindYao/View/YFWSubCategoryCollectionItemView';
import YFWRecomendGoodsModel from "./Model/YFWRecomendGoodsModel";

export default class YFWHomeReCommendView extends Component {

    static defaultProps = {
        Data:[],
    }

    constructor(props) {
        super(props);
        this.state = {
            index:0
        };

    }

    componentDidMount(){
        DeviceEventEmitter.addListener('homeTopIndexChange',(index)=>{
            this.setState({
                index:index
            })
        })
    }

    //@ Action
    clickItems(badge){
        mobClick('home-recommend-adv');
        const { navigate } = this.props.navigation;

        let param = {"type":"get_goods_detail","value":badge.id};
        pushNavigation(navigate,param);

    }

    //@ View
    render() {

        let data = this.props.Data&&this.props.Data.length>this.state.index?this.props.Data[this.state.index].items:[]
        data = YFWRecomendGoodsModel.getModelArray(data)
        return(
            <View style={[BaseStyles.container,{alignItems:'center'}]}>
                <FlatList
                    ref={(flatList)=>this._flatList = flatList}
                    numColumns={2}
                    extraData={this.state}
                    data={data}
                    renderItem = {this._renderItem.bind(this)}
                />
            </View>
        );

    }

    _renderItem = (item) => {
        item.item.index = item.index
        return(
            <YFWSubCategoryCollectionItemView from={'home'} Data={item.item}
            navigation={this.props.navigation}></YFWSubCategoryCollectionItemView>
        );

    }

    clickedIndex(index) {
        DeviceEventEmitter.emit('homeTopIndexChange',index)
    }

}

