import React from 'react'
import {
    View,
    Text,
    Image,
    Dimensions,
    TouchableOpacity
} from 'react-native'
import { isNotEmpty } from '../../../../PublicModule/Util/YFWPublicFunction'
export default class YFWWDRefundsGoodsReasonItem extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const itemData = this.props.itemData;
        const selected = this.props.selected;
        const dataLength = this.props.dataLength;
        if (isNotEmpty(itemData)) {
            return (
                <View style={{ backgroundColor: '#fff' }}>
                    <TouchableOpacity activeOpacity={1} onPress={() => this._itemChoosed(itemData)}>
                        {this._itemSelected(itemData, selected)}
                    </TouchableOpacity>
                    {this._renderSplit(itemData, dataLength)}
                </View>
            )
        } else {
            return (<View />)
        }

    }




    _itemChoosed(itemData) {
        this.props._stateChanged(itemData);
    }

    _itemSelected(itemData, index) {
        if (itemData.index == index) {
            return (
                <View style={{ flexDirection: 'row', height: 50, alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, color: '#333', marginRight: 22, flex: 1 }} numberOfLines={2} >{itemData.item.reason}</Text>
                    <Image style={{ position: 'absolute', width: 22, height: 22, resizeMode: 'contain', alignSelf: 'center', right: 0 }}
                        source={require('../../../../../img/select_gou.png')} />
                </View>
            )
        } else {
            return (
                <View style={{ flexDirection: 'row', height: 50, alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, color: '#999', marginRight: 22, flex: 1 }} numberOfLines={2}>{itemData.item.reason}</Text>
                </View>
            )
        }
    }


    _renderSplit(itemData, dataLength) {
        if (itemData.index < dataLength - 1) {
            return (<View style={{ backgroundColor: '#ccc', height: 2, opacity: 0.2, flex: 1 }} />)
        } else {
            return (<View />)
        }
    }
}
