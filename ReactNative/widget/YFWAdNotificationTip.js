import React, { Component } from 'react';
import {
    Image,
    TouchableOpacity,
    View,
    Text,
    StyleSheet,Platform
} from 'react-native';
import PropTypes from 'prop-types';
import { pushNavigation } from '../Utils/YFWJumpRouting';
import { isEmpty, safe, kScreenWidth } from '../PublicModule/Util/YFWPublicFunction';

export default class YFWAdNotificationTip extends Component {

    static defaultProps = {
        info: {},
        navigation: null,
        textStyle:{}
    }
    static propTypes = {
        info: PropTypes.object.isRequired,
        navigation: PropTypes.object.isRequired,
        textStyle: PropTypes.object,
    }
    render() {
        if (isEmpty(this.props.info) || (isEmpty(this.props.info.content) && isEmpty(this.props.info.img_url) )) {
            return (<View />)
        } else {
            return (
                <TouchableOpacity style={{ ...styels.container }} activeOpacity={1} onPress={() => { this._onAdClick() }}>
                    {this._renderImage()}
                    <Text style={{ ...styels.tipText,...this.props.textStyle }}>{this.props.info.content}</Text>
                    {this._renderNextImage()}
                </TouchableOpacity>
            )
        }
    }

    _renderImage() {
        if (isEmpty(this.props.info) || isEmpty(this.props.info.img_url)) {
            return null
        }
        let imageW =  this._dealSize(this.props.info.img_width,20)
        let imageH = this._dealSize(this.props.info.img_height,20)
        return (
            <Image style={{width:imageW,height:imageH,marginHorizontal:3}} source={{uri:this.props.info.img_url}}></Image>
        )
    }

    _renderNextImage() {
        if (isEmpty(this.props.info.url)) {
            return null
        }
        return (
            <Image source={require('../../img/uc_next.png')}
                        style={{ ...styels.nextImage }} />
        )
    }

    _dealSize(size,defaultSize) {
        let size_origin = parseInt(size)
        if (isNaN(size_origin) || size_origin <= 0) {
            size_origin = defaultSize
        } else {
            size_origin = size_origin/2
        }
        return size_origin
    }

    _onAdClick() {
        if (isEmpty(this.props.info.url) || isEmpty(this.props.navigation) || isEmpty(this.props.navigation.navigate)) {
            return
        }
        const { navigate } = this.props.navigation;
        pushNavigation(navigate, { type: 'get_h5', value: Platform.OS == 'android'?safe(this.props.info.share):safe(this.props.info.url), title: this.props.info.title ? this.props.info.title : '' })
    }
}

const styels = StyleSheet.create({
    tipText:{
        color: '#EABD1C', fontSize: 12,flex:1
    },
    container:{
        width: kScreenWidth, padding: 10, backgroundColor: '#fdf8c5', flexDirection: 'row',alignItems:'center'
    },
    nextImage:{
        width: 10, height: 12, alignSelf: 'center', marginRight: 0, resizeMode: 'contain', marginLeft: 5,tintColor:'#EABD1C'
    }
})