import React, { Component } from 'react'
import { View, Text, Image, TouchableOpacity, DeviceEventEmitter } from 'react-native'
import { isIphoneX, adaptSize,isEmpty } from '../../PublicModule/Util/YFWPublicFunction'
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager'
export default class YFWO2OShopingCar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            number: YFWUserInfoManager.ShareInstance().otoShopCarNum || 0
        }
    }
    componentDidMount() {
        DeviceEventEmitter.addListener('OTO_SHOPCAR_NUMTIPS_RED_POINT', (data) => {
            this.setState({
                number: data
            })
        }
        );
    }
    render() {
        return (
            <View style={{ position: 'absolute', right: adaptSize(10), bottom: isIphoneX() ? adaptSize(90) : adaptSize(60) }}>
                <TouchableOpacity activeOpacity={1} onPress={() => this.props._dealNavigation({type: 'get_shopping_car', showType:'oto'})} >
                    <Image source={require('../Image/icon_home_cart.png')} style={{ width: adaptSize(44), height: adaptSize(44) }} />
                </TouchableOpacity>
                {this.state.number > 0 &&<View style={{ position: 'absolute', width: adaptSize(22), height: adaptSize(16), borderRadius: adaptSize(8), backgroundColor: "#ff3300", alignItems: 'center', right: -adaptSize(5), top: -adaptSize(5),justifyContent:'center' }}>
                    {this.state.number > 0 && <Text style={{ fontSize: 10, color: '#ffffff', fontWeight: 'bold',includeFontPadding:false }}>{this.state.number > 99 ? 99 + '+' : this.state.number}</Text>}
                </View>}
            </View>
        )
    }
}