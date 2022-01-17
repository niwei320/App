import React from 'react'
import {
    View,
    DeviceEventEmitter,
    Platform,
    Image,
    StyleSheet,
    Text
} from 'react-native'

import YFWUserInfoManager from '../../Utils/YFWUserInfoManager'
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {yfwRedColor} from '../../Utils/YFWColor'
import { YFWImageConst } from '../Images/YFWImageConst';
const styles = StyleSheet.create({
    tab: {
        height: 50,
        backgroundColor: '#fbfafc',
        borderTopColor: '#efefef'
    },
    tabIcon: {
        width: 26,
        height: 26,
        marginTop: 2
    },
    tabLabel: {
        marginBottom: 0
    }
});

export default class WDShopCarRedPoint extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            nums: new YFWUserInfoManager().wdshopCarNum
        }
    }

    componentDidMount() {
        this.listener = DeviceEventEmitter.addListener(('WD_SHOPCAR_NUMTIPS_RED_POINT'), (nums)=> {
            if (parseInt(nums) >= 0) {
                this.setState({
                    nums: nums
                })
            }
        })
    }

    componentWillUnmount() {
        this.listener&&this.listener.remove()
    }

    _renderDetail(focused) {

        let image_icon = focused ? YFWImageConst.Tab_shopcar_select : YFWImageConst.Tab_shopcar_normal;

        let width = 16;
        let num = this.state.nums
        if (!YFWUserInfoManager.ShareInstance().hasLogin()) {
            num = 0
        }
        if (num > 0) {
            try {
                if (parseInt(num+'') > 99){
                    num = '99+';
                    width = 22;
                }
            }catch (e) {}
            return (
                <View style={{flex:1,marginLeft:Platform.isPad?-18:0}}>
                    <View style={{flex:1,textAlign:'center', justifyContent:'center'}}>
                        <Image source={image_icon}
                               style={styles.tabIcon}/>
                    </View>
                    <View style={[BaseStyles.centerItem,{width:width,height:16,backgroundColor:yfwRedColor(),
                        borderRadius:8,marginLeft:20,marginTop:Platform.isPad?10:3,position: 'absolute'}]}>
                        <Text numberOfLines={1} style={{fontSize:9,color:"#FFF"}}>{num+''}</Text>
                    </View>
                </View>
            )
        } else {
            return (
                <View style={{flex:1,marginLeft:Platform.isPad?-18:0}}>
                    <View style={{flex:1,textAlign:'center', justifyContent:'center'}}>
                        <Image source={image_icon}
                               style={styles.tabIcon}/>
                    </View>
                </View>
            )
        }

    }


    render() {
        return (
            <View>
                {this._renderDetail(this.props.focused)}
            </View>
        )
    }
}
