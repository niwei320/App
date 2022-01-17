import React,{Component} from 'react'
import {View, StyleSheet,Image,ActivityIndicator,} from 'react-native'
import PropTypes from 'prop-types'
export default class YBTipsStatusView extends Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    static defaultProps = {
        status:'',
    }

    static propTypes = {
        status: PropTypes.string,
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        let status = this.props.status
        if (status == 'loading') {
            return <ActivityIndicator style={{marginRight:12}}></ActivityIndicator>
        } else if (status == 'success') {
            return <Image key={'succ'} source={require('../../../img/tip_success.png')} style = {styles.tipsImage}/>
        } else if (status == 'fail') {
            return <Image key={'fail'} source={require('../../../img/tip_warn.png')} style = {[styles.tipsImage,{tintColor:'#ff3300'}]}/>
        } else {
            return null
        }
    }

    
}

const styles = StyleSheet.create({

    tipsImage:{
        width:20,
        height:20,
        marginRight:12
    },
})