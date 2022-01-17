import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet,
} from 'react-native';
import YFWWDBaseModel from "../../Base/YFWWDBaseModel";

export default class YFWWDAccountComplementModel extends YFWWDBaseModel{
    constructor() {
        super()
        this.first_load = true
        this.storeid = ''
        this.shopName = ''
        this.accountShopName = ''
        this.need_add_health_products = false;      //食品经营许可证
        this.need_instruments = false;              //第二类医疗器械经营备案凭证
        this.electronicInfo = {
            list: [],
            missingList:[],
        }
    }

}
