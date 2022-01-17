
import React,{Component} from 'react'
import {View,Image,TouchableOpacity,DeviceEventEmitter} from 'react-native'
import PropTypes from 'prop-types';
import { YFWImageConst } from '../../Images/YFWImageConst';

export default class YFWWDMore extends Component {

    constructor(args){
        super(args)
    }

    static propTypes = {
        onPress: PropTypes.func,
        isStore: PropTypes.bool,
        storeInfo: PropTypes.object
    }
    
    static defaultProps = {
        onPress:undefined,
        isStore: false,
        storeInfo: undefined
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
                                const store = this.props.isStore ? 'store' : ''
                                DeviceEventEmitter.emit('OpenWDUtilityMenu', {type: store, data: this.props.storeInfo})
                            }
                        }}>
                <Image style={{width:15,height:15,resizeMode:'contain',marginRight:15}}
                    source={YFWImageConst.Icon_more_white}/>
            </TouchableOpacity>
        )
    }
}