import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, Dimensions,DeviceEventEmitter,
} from 'react-native';
import YFWNativeManager from "../Utils/YFWNativeManager";
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";

const width = Dimensions.get('window').width;
export default class YFWNoLocationHint extends Component {

    constructor(...args) {
        super(...args);
        this.state = {
            noLocationHidePrice: YFWUserInfoManager.ShareInstance().getNoLocationHidePrice(),
        };
    }

    componentDidMount(){
        let that = this
        this.locationListener = DeviceEventEmitter.addListener('NO_LOCATION_HIDE_PRICE',(isHide)=>{
            that.setState({
                noLocationHidePrice:isHide
            })
        })
    }

    componentWillUnmount() {
        this.locationListener && this.locationListener.remove()
    }

    render() {
        if(this.state.noLocationHidePrice){
            return (
                <View style={{flexDirection:'row',width:width,backgroundColor:'#FAF8D9'}}>
                    <View style={{flex:1, marginVertical:10, marginHorizontal: 16}}>
                        <Text style={{fontSize: 12, color: '#FEAC4C'}}>开启定位后，我们可以更好地为您服务</Text>
                    </View>
                    <TouchableOpacity style={{marginVertical:10, marginHorizontal: 16, flexDirection:'row', alignItems: 'center'}} onPress={()=>this._onClicked()}>
                        <Text style={{fontSize: 12, color: '#FEAC4C'}}>去开启</Text>
                        <Image style={{width:6,height:10,marginLeft:6,resizeMode:'contain'}} source={require('../../img/icon_arrow_y.png')} />
                    </TouchableOpacity>
                </View>
            )
        } else {
            return <View />
        }
    }

    _onClicked() {
    YFWNativeManager.openLocation()
    }

}
