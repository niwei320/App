import React,{Component} from 'react'
import {View, StyleSheet,Text,TouchableOpacity,} from 'react-native'
import { safeArray } from '../../PublicModule/Util/YFWPublicFunction'
import { BaseStyles } from '../../Utils/YFWBaseCssStyle'
import { yfwGreenColor } from '../../Utils/YFWColor'
import PropTypes from 'prop-types'
export default class YBTipsUtilView extends Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    static defaultProps = {
        actions:[]
    }

    static propTypes = {
        actions: PropTypes.arrayOf(PropTypes.shape({
            text:   PropTypes.string,
            hidden: PropTypes.bool,
            onPress: PropTypes.func,
        }))
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        let actions = safeArray(this.props.actions)
        return (
            <View style={{flexDirection:'row',marginVertical:10,marginHorizontal:30}}>
                {actions.map((info,index)=>{
                    if (info.hidden) {
                        return null
                    }
                    return (
                        <TouchableOpacity key={index+'util'} onPress={()=>{info.onPress&&info.onPress()}} style={{borderRadius:10,marginHorizontal:3,borderColor:yfwGreenColor(),borderWidth:1,minWidth:39,...BaseStyles.centerItem}} hitSlop={{left:10,top:10,bottom:10,right:10}}>
                            <Text style={{color:yfwGreenColor(),fontSize:14,marginHorizontal:3}}>{info.text}</Text>
                        </TouchableOpacity>
                    )
                })
                }
            </View>
        )
    }

    
}

const styles = StyleSheet.create({

    tipsImage:{
        width:20,
        height:20,
        marginRight:12
    },
})