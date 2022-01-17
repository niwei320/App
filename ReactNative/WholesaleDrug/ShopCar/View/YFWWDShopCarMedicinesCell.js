import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import { kScreenWidth } from '../../../PublicModule/Util/YFWPublicFunction';
import YFWWDSwipeRow from './YFWWDSwipeRow';

export default class YFWWDShopCarMedicinesCell extends Component {


    constructor(args) {
        super(args)
    }

    static defaultProps = {
        DataArray: []
    }

    render() {

        if (this.props.DataArray.length == 0) {
            return (<View />)
        }
        return (
            <View style={styles.container}>
                <View style={{ overflow: 'hidden' }}>
                    {this.renderMedicineCell()}
                </View>
            </View>
        )
    }

    renderMedicineCell() {

        let allCell = []
        this.props.DataArray.map((item, index) => {
            let newItem = { item: item, index: index }
            allCell.push(
                <YFWWDSwipeRow Data={newItem}
                    key={index + 'cell'}
                    selectGoodsItemMethod={() => this.props.selectGoodsItemMethod(newItem)}
                    changeQuantity={(quantity) => this.props.changeQuantity(newItem, quantity)}
                    resetData={(quantity) => this.props.resetData(newItem, quantity)}
                    select={this.props.select(newItem)}
                    selectFn={() => this.props.selectFn(newItem)}
                    delFn={() => this.props.delFn(newItem)}
                    moveFn={() => this.props.moveFn(newItem)}
                />
            )
        })

        return allCell

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        shadowColor: "rgba(204, 204, 204, 0.2)",
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowRadius: 8,
        shadowOpacity: 1,
        elevation: 2,
        borderRadius: 8,
        marginHorizontal: 13,
        padding: 4,
    }
})