import React from 'react'
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    Dimensions,StyleSheet
} from 'react-native'
const width = Dimensions.get('window').width;
import ReturnGoodsDetailItem from './ReturnGoodsDetailItem'
import YFWTitleView from '../../PublicModule/Widge/YFWTitleView';
import YFWGoodsListItemView from '../../widget/YFWGoodsListItemView';
export default class ReturnGoodsDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            num:undefined,
            data:[]
        }
    }

    // componentWillReceiveProps(newProps,oldProps){
    //     this.setState({})
    // }


    render() {
        let data = this.props.data;
        return (
            <View style={[styles.content,{marginTop:17}]}>
                <FlatList style={{backgroundColor:"#FFF"}}
                            data = {data}
                            renderItem={this._renderItem}
                            keyExtractor={(item, index) => [index+'key']}
                            listKey={(item, index) => index}>
                </FlatList>
            </View>
        )
    }


    editNum(index,num){
        this.props.editGoodsNum(index,num)
    }
    editGoodsSelect(index, isSelect) {
        if (this.props.editGoodsSelect) {
            this.props.editGoodsSelect(index,isSelect)
        }
    }

    _renderItem = (item) => {
        return (
            <View>
                <YFWGoodsListItemView
                    isSelectable={this.props.isCanEdit}
                    isSelected={item.item.select}
                    isPriceRed={true}
                    goodsImgUrl={item.item.img_url}
                    goodsName={item.item.title}
                    goodsStandard={item.item.standard}
                    goodsPeriodDate={''}
                    goodsQuantity={item.item.quantity}
                    goodsPrice={item.item.price}
                    onMethodQuantityChange={(number)=>{
                        number = parseInt(number)
                        if (!(number > 0)) {
                            number = 1
                        }
                        item.item.returnNumber = number
                        this.editNum(item.index,number)
                    }}
                    onMethodSelect={(info)=>{
                        this.editGoodsSelect(item.index,info.isSelected)
                        this.setState({})
                    }}
                    />
            </View>
        )
        return (
            <ReturnGoodsDetailItem data = {item.item} index = {item.index} editNum = {(index,num)=>this.editNum(index,num)} status = {this.props.status}/>
        )
    }


}
const styles = StyleSheet.create({
    container: {

    },
    content: {
        // flex:1,
        borderRadius: 7,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(204, 204, 204, 0.6)",
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowRadius: 8,
        shadowOpacity: 1,
        paddingHorizontal: 3,
        paddingTop:27,
        paddingBottom:15,
        marginHorizontal: 13,
    }
})