import React, {Component} from 'react';
import {
    View,
} from 'react-native'
import {isNotEmpty, min, safe} from "../../PublicModule/Util/YFWPublicFunction";
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";

export default class YFWSettlementPointModel extends Component {

    constructor(props) {
        super(props)

        this.prompt = '';
        this.point = '0';
        this.balance = '0';
        this.use_ratio = 0.9;

    }


}