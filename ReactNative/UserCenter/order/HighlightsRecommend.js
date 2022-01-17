import React from 'react'
import {
    View,
    Platform,
    Dimensions,
    ImageBackground,
    Image,
    TouchableOpacity,
    Text,
    ScrollView,
    FlatList
} from 'react-native'
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {toDecimal} from "../../Utils/ConvertUtils";
const width = Dimensions.get('window').width;
import {tcpImage, safeObj, kScreenWidth} from '../../PublicModule/Util/YFWPublicFunction'
import {pushNavigation} from '../../Utils/YFWJumpRouting'
import YFWTitleView from '../../PublicModule/Widge/YFWTitleView'
import YFWGoodsItem from '../../widget/YFWGoodsItem'
import YFWSubCategoryCollectionItemView from '../../FindYao/View/YFWSubCategoryCollectionItemView'
import YFWDiscountText from "../../PublicModule/Widge/YFWDiscountText";
export default class HighlightsRecommend extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <View>
                <FlatList
                    ref={(flatList)=>this._flatList = flatList}
                    numColumns={2}
                    style={{paddingHorizontal:7,flex:1}}
                    ListHeaderComponent={this._renderHeaderItem}
                    data={this.props.dataArray}
                    renderItem={this._renderBottomItem}
                    keyExtractor={(item, index) => item.key}
                />
            </View>
        )
    }


    _renderHeaderItem = () => {
        return (<View
            style={{flexDirection:'row',alignItems:'center',backgroundColor:'#fafafa',paddingRight:10,paddingLeft:10}}>
            <View style={{flex:1}}/>
            <View style={{alignItems:'center',height:48}}>
                <YFWTitleView title={'精选商品'}/>
            </View>
            <View style={{flex:1}}/>
        </View>)
    }


    onRefrshIconClick() {
        this.props._refreshData()
    }

    clickItems(item) {
        const {navigate} = this.props.navigation;
        let param = {"type": "get_goods_detail", "value": item.id};
        pushNavigation(navigate, param);
    }

    _renderBottomItem = (item)=> {
        let uneven = false;
        if (item.index % 2 == 0) {
            uneven = true;
        }
        return (
                <YFWGoodsItem model={item.item} from={'all_highlights_list'} navigation={this.props.navigation} width={(kScreenWidth-36)/2}/>
        );
    };

    _renederImage(item) {
        return (<Image style={{height:126,marginLeft:27,marginTop:19,marginRight:28,resizeMode:'contain'}}
        source={{uri:safeObj(tcpImage(item.item.intro_image))}}/>)
    }
}
