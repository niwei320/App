
import React,{Component} from 'react'
import {View,Image,TouchableOpacity,DeviceEventEmitter} from 'react-native'
import PropTypes from 'prop-types';
import { safe, safeObj } from '../PublicModule/Util/YFWPublicFunction';

export default class YFWMore extends Component {

    constructor(args){
        super(args)
    }

    static propTypes = {
        onPress: PropTypes.func,
    }
    
    static defaultProps = {
        onPress:undefined
    }

    render () {

        return (
            <TouchableOpacity style={{width:30,alignSelf:'center'}}
                        hitSlop={{top:10,left:10,bottom:10,right:10}}
                        activeOpacity={1}
                        onPress={() => {
                            if (this.props.onPress) {
                                this.props.onPress()
                            } else {
                                let page = safe(this.props.fromPage)
                                let param = {}
                                if (page == 'shop') {
                                    param.type = 'share',
                                    param.data = safeObj(this.props.shareData)
                                }
                                DeviceEventEmitter.emit('OpenUtilityMenu', param)
                            }
                        }}>
                <Image style={{width:15,height:15,resizeMode:'contain',marginRight:15}}
                    source={require('../../img/more_white.png')}/>
            </TouchableOpacity>
        )
    }
}