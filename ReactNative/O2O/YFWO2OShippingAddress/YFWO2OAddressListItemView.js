import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import {adaptSize, isNotEmpty, kScreenWidth} from "../../PublicModule/Util/YFWPublicFunction";
import {toDecimal} from "../../Utils/ConvertUtils";

export default class YFWO2OAddressListItemView extends Component {
    static propTypes = {
        name: PropTypes.string,
        address: PropTypes.string,
        distance: PropTypes.number,
        selected: PropTypes.bool,
        showDistance: PropTypes.bool,
    }

    static defaultProps = {
        name: '',
        address: '',
        distance: 0,
        onClick: ()=>{},
        selected:false,
        showDistance:false
    };

    render() {
        let {name,address,distance,selected,showDistance} = this.props
        if(distance === 0){
            distance = ''
        } else if(distance > 1000){
            distance = toDecimal(distance/1000) + 'km'
        } else {
            distance = toDecimal(distance) + 'm'
        }
        return (
            <TouchableOpacity
                onPress={()=>{
                    this.props.onClick(this.props)
                }}
                style={{
                    marginBottom:1,
                    justifyContent:'center',
                    height: adaptSize(55),
                    width:kScreenWidth,
                    backgroundColor: selected?'#5799f7':'#ffffff',
                    paddingLeft:adaptSize(40),
                    paddingRight:adaptSize(13)
                }}
            >
                <View
                    style={{
                        position:'absolute',
                        left:adaptSize(12),
                        width: adaptSize(12),
                        height: adaptSize(12),
                        backgroundColor: "#ffffff",
                        borderRadius:20,
                        borderStyle: "solid",
                        borderWidth: adaptSize(2),
                        borderColor: "#b9b9b9"
                    }}
                />
                <View style={{width:kScreenWidth-adaptSize(53),flexDirection:'row',justifyContent:'space-between'}}>
                    <Text style={{fontWeight: "bold", fontSize: adaptSize(14), color: selected?'#5799f7':"#333333"}}>{name}</Text>
                    {isNotEmpty(distance) && showDistance &&<Text style={{fontSize: adaptSize(12), color: "#999999"}}>{distance}</Text>}
                </View>
                <Text style={{fontSize: adaptSize(12), color: "#999999"}} numberOfLines={1}>{address}</Text>
            </TouchableOpacity>
        )
    }
}
