import React, { Component } from 'react';
import {
    View,FlatList,DeviceEventEmitter
} from 'react-native';
import PropTypes from 'prop-types';
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import YFWWDHomeGoodItemView from './YFWWDHomeGoodItemView';
import YFWListFooterComponent from '../../../PublicModule/Widge/YFWListFooterComponent';
import {isNotEmpty} from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWWDHomeReCommendView extends Component {

    static propTypes={
        showFoot:PropTypes.number
    }
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
    }

    //@ View
    render() {

        let data = this.props.Data?this.props.Data:[]
        // data = YFWRecomendGoodsModel.getModelArray(data)
        return(
            <View style={[BaseStyles.container,{alignItems:'center'}]}>
                <FlatList
                    keyExtractor={(item, index)=>{return 'ReCommendView'+index}}
                    ref={(flatList)=>this._flatList = flatList}
                    extraData={this.state}
                    data={data}
                    renderItem={this._renderItem.bind(this)}
                    ListFooterComponent={this._renderFooter.bind(this)}
                />
            </View>
        );

    }

    _renderItem = (item) => {
        item.item.index = item.index
        return(
            <YFWWDHomeGoodItemView
                key={'home'+ item.index}
                from={'home'} Data={item.item}
                navigation={this.props.navigation}
            />
        );

    }

    _renderFooter(){
        if(isNotEmpty(this.props.showFoot)){
            return <YFWListFooterComponent showFoot={this.props.showFoot}/>
        } else{
            return null
        }

    }

}

