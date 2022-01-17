import React, {Component} from 'react';
import {
    View,
    Image,
    DeviceEventEmitter,
    Text,
    Platform,
    TouchableOpacity,
    FlatList
} from 'react-native'
import YFWGoodsItem from '../../widget/YFWGoodsItem';
import StatusView from '../../widget/StatusView';
import YFWListFooterComponent from '../../PublicModule/Widge/YFWListFooterComponent';
import { adaptSize } from '../../PublicModule/Util/YFWPublicFunction';

export default class YFWShopRecomandGoodsView extends Component {

    constructor(props) {
        super(props)
        this.fData = this.props.dataArray
        this.state = {
            data:[],
            showFoot: 0,
        }
    }

    componentWillMount(){

    }
    componentWillUnmount(){

    }

    componentDidMount(){

    }

    componentWillReceiveProps(props){
        this.fData = props.dataArray
        this.state.data = this.fData
        this.setState({})
    }

    render() {
        return (
            <View style={{flex:1,paddingHorizontal:7,backgroundColor:'transparent'}}>
                <FlatList
                    horizontal={false}
                    numColumns={2}
                    data={this.state.data}
                    ListHeaderComponent={this._renderHeader.bind(this)}
                    ListFooterComponent={this._renderFooter.bind(this)}
                    renderItem={this._renderSubItem.bind(this)}
                    onEndReachedThreshold={0.1}
                />
            </View>
        )
    }

    _renderHeader() {
        return <View style={{flex:1,height:8}}/>
    }

    _renderFooter() {
        return <YFWListFooterComponent showFoot={this.state.showFoot}/>
    }

    _renderSubItem({item}) {
        let goodType = item.dict_store_medicine_status + ''
        let color
        switch (goodType) {
            case '精选' :
                color = 'rgb(255,51,0)'
                break;
            case '促销' :
                color = 'rgb(254,172,76)'
                break;
            case '新品' :
                color = 'rgb(31,219,155)'
                break;
            case '推荐' :
                color = 'rgb(72,139,255)'
                break;
            default:
                color = 'rgb(255,51,0)'
                break;
        }
        return (
            <View style={{flex:1}}>
                <YFWGoodsItem model={item} navigation={this.props.navigation} from={'shop_medicine_recomand'}/>
                {goodType.length>0?<View style={{height:adaptSize(18), paddingHorizontal:adaptSize(6),flex:1,justifyContent:'center',position:'absolute',top:adaptSize(10),right:adaptSize(8)
                    ,borderRadius:adaptSize(9),borderColor:color,borderWidth:1}}>
                    <Text style={{color:color,fontSize:11}}>{item.dict_store_medicine_status}</Text>
                </View>:null}
            </View>
        )

    }

}
