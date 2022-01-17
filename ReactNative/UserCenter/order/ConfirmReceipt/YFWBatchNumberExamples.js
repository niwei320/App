import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet,
} from 'react-native';
import {kScreenWidth} from "../../../PublicModule/Util/YFWPublicFunction";

export default class YFWBatchNumberExamples extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: '查看批号说明',
        headerRight: <View style={{width:50}}/>
    });

    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        return (
            <View style = {{flex: 1, alignItems: 'center'}}>
                <Image style={{
                    marginTop:20,
                    width: kScreenWidth - 26,
                    height: (kScreenWidth - 26)/350*207,
                    backgroundColor: "#ffffff"
                }} resizeMode='stretch' source={require('../../../../img/image_batch_examples.jpg')}/>
                <View
                    style={{
                        marginTop:30,
                        width: kScreenWidth - 26,
                        borderRadius: 7,
                        backgroundColor: "#ededed",
                        paddingHorizontal: 16,
                        paddingVertical: 13,
                    }}
                >
                    <View style={{flexDirection: 'row', alignItems:'center'}}>
                    <Image style={{
                        width: 12,
                        height: 12,
                    }} resizeMode='stretch' source={require('../../../../img/tip.png')}/>
                        <Text style={{fontSize: 14, color: "#85a694", fontWeight: 'bold'}}>  填写产品批号说明</Text>
                    </View>
                    <Text style={{fontSize: 14, color: "#85a694", fontWeight: 'bold'}}> ·  <Text style={{fontSize: 12, color: "#999999", fontWeight: 'normal'}}>请如实根据商品包装盒上的【产品批号】填写</Text></Text>
                    <Text style={{fontSize: 14, color: "#85a694", fontWeight: 'bold'}}> ·  <Text style={{fontSize: 12, color: "#999999", fontWeight: 'normal'}}>若多次被核实未根据规范填写，会取消参与抽奖资格</Text></Text>
                </View>
            </View>
        )
    }

}

const style = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    }
});