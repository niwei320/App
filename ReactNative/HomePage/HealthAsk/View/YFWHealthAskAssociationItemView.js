import React, {Component} from 'react';
import {
    View,
    Image,
    Text,
    TouchableOpacity, StyleSheet,
} from 'react-native';
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import {kScreenWidth} from "../../../PublicModule/Util/YFWPublicFunction";
import {pushNavigation} from "../../../Utils/YFWJumpRouting";

export default class YFWHealthAskAssociationItemView extends Component {

    static defaultProps = {
        Data:undefined,
    }

    render() {

        let item = this.props.Data;

        return (
            <TouchableOpacity activeOpacity={1} onPress={() =>{this.clickItemMethod()}} underlayColor="transparent">
                <View style={[{width:kScreenWidth,height:40,backgroundColor:'white',justifyContent:'flex-end'}]}>
                    <View style={[BaseStyles.centerItem,{flexDirection:'row',justifyContent:'flex-start',marginBottom:5}]}>
                        <Image style={{width:20,height:20,marginLeft:14}} source={require('../../../../img/second_normal.png')}/>
                        <Text style={[BaseStyles.titleWordStyle,{marginLeft:10,width:kScreenWidth - 42}]} numberOfLines={1}>{item.title}</Text>
                    </View>

                    <View style={[BaseStyles.separatorStyle,{marginLeft:40}]}/>
                </View>
            </TouchableOpacity>

        );
    }

    clickItemMethod(){

        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'get_ask_detail',value:this.props.Data.id});

    }


}