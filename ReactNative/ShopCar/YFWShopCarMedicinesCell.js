import React,{Component} from 'react'
import {View,StyleSheet} from 'react-native'
import YFWShopCarCellView from './YFWShopCarCellView';
import YFWSwipeRow from '../widget/YFWSwipeRow';
import {kScreenWidth, safeArray} from '../PublicModule/Util/YFWPublicFunction';
import YFWOTOShopCarStaleCell from '../O2O/ShopCar/View/YFWOTOShopCarStaleCell';
import YFWOTOSwipeRow from '../widget/YFWOTOSwipeRow';

export default class YFWShopCarMedicinesCell extends Component {


    constructor(args){
        super(args)
    }

    static defaultProps = {
        DataArray:[]
    }

    render(){

        if ( this.props.DataArray.length == 0) {
            return (<View/>)
        }
        let cellStyle = this.props.showType=='oto'?styles.containerAnother:styles.container
        return (
            <View style={cellStyle}>
                <View style={{overflow:'hidden'}}>
                    {this.renderMedicineCell()}
                </View>
            </View>
        )
    }

    renderMedicineCell(){

        let allCell = []
        safeArray(this.props.DataArray).map((item,index)=>{
            let newItem = {item:item,index:index}
            if (item.isNotCanSale) {
                allCell.push(
                    <YFWOTOShopCarStaleCell Data={item}
                                showType={this.props.showType}
                                 key={index+'cell'}
                                 accessibilityLabel={'shop_'+item.position+'_medicine_'+(this.props.startPosition+index)}
                                 selectGoodsItemMethod={()=>this.props.selectGoodsItemMethod(newItem)}
                                 changeQuantity={(quantity)=>this.props.changeQuantity(newItem,quantity)}
                                 resetData={(quantity)=>this.props.resetData(newItem,quantity)}
                                 select={this.props.select(newItem)}
                                 selectFn={()=>this.props.selectFn(newItem)}
                                 delFn={()=>this.props.delFn(newItem)}
                                 moveFn={()=>this.props.moveFn(newItem)}
                    />
                )
            } else if (this.props.showType == 'oto') {
                allCell.push(
                    <YFWOTOSwipeRow Data={newItem}
                                showType={this.props.showType}
                                 key={index+'cell'}
                                 accessibilityLabel={'shop_'+item.position+'_medicine_'+(this.props.startPosition+index)}
                                 selectGoodsItemMethod={()=>this.props.selectGoodsItemMethod(newItem)}
                                 changeQuantity={(quantity)=>this.props.changeQuantity(newItem,quantity)}
                                 resetData={(quantity)=>this.props.resetData(newItem,quantity)}
                                 select={this.props.select(newItem)}
                                 selectFn={()=>this.props.selectFn(newItem)}
                                 delFn={()=>this.props.delFn(newItem)}
                                 moveFn={()=>this.props.moveFn(newItem)}
                    />
                )
            } else {
                allCell.push(
                    <YFWSwipeRow Data={newItem}
                                showType={this.props.showType}
                                 key={index+'cell'}
                                 accessibilityLabel={'shop_'+item.position+'_medicine_'+(this.props.startPosition+index)}
                                 selectGoodsItemMethod={()=>this.props.selectGoodsItemMethod(newItem)}
                                 changeQuantity={(quantity)=>this.props.changeQuantity(newItem,quantity)}
                                 resetData={(quantity)=>this.props.resetData(newItem,quantity)}
                                 select={this.props.select(newItem)}
                                 selectFn={()=>this.props.selectFn(newItem)}
                                 delFn={()=>this.props.delFn(newItem)}
                                 moveFn={()=>this.props.moveFn(newItem)}
                    />
                )
            }
        })

        return allCell

    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'white',
        shadowColor: "rgba(204, 204, 204, 0.2)",
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowRadius: 8,
        shadowOpacity: 1,
        elevation:2,
        borderRadius:8,
        marginHorizontal:13,
        padding:4,
    },
    containerAnother:{
        flex:1,
        backgroundColor:'white',
        shadowColor: "rgba(204, 204, 204, 0.2)",
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowRadius: 8,
        shadowOpacity: 1,
        elevation:2,
        padding:4,
    }
})
