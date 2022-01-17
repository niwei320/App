import React, { Component } from 'react'
import { View, Image, TouchableOpacity, Text } from 'react-native'
import { BaseStyles } from '../../Utils/YFWBaseCssStyle';
import { YFWImageConst } from '../Images/YFWImageConst';

export default class YFWWDSellsDataView extends Component {

    constructor(args) {
        super(args)
        this.state = {
            infos: [
                { title: '零售商家', value: '' },
                { title: '近期销量', value: '100+' },
                { title: '我的进价', value: '10' },
            ]
        }
    }


    render() {
        if (!this.props.showFlag) {
            return <View/>
        }
        return (
            <View style={{ paddingBottom: 10,}}>
                <View style={{ backgroundColor: 'white', paddingVertical: 6, paddingHorizontal: 17 ,shadowColor: "rgba(204, 204, 204, 0.5)",
	shadowOffset: {
		width: 0,
		height: 3
	},
	shadowRadius: 8,
	shadowOpacity: 1}}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image style={{ width: 14, height: 14 }} source={YFWImageConst.Icon_sell_data_p}></Image>
                        <Text style={{
                            marginLeft:3,
                            fontSize: 13,
                            lineHeight: 20,
                            fontWeight: "bold",
                            color: "#666666"
                        }}>{'零售参考'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center',marginTop:5 }}>
                        {this.props.infos&&this.props.infos.map((item, index) => {
                            return (
                                <View key={index+'i'} style={{ flex: 1,alignItems:'center' }}>
                                    <Text style={{
                                        fontSize: 13,
                                        lineHeight: 20,
                                        fontWeight: "bold",
                                        color: "#ff8041"
                                    }}>{item.value}</Text>
                                    <Text style={{
                                        fontSize: 12, marginTop: 1,
                                        lineHeight: 20,
                                        fontWeight: "bold",
                                        color: "#666666"
                                    }}>{item.title}</Text>
                                </View>
                            )
                        })}
                    </View>
                </View>
            </View>
        )
    }
}
