import React,{Component} from 'react'
import {View, StyleSheet,Image,Text,} from 'react-native'
import { isNotEmpty, safeFloatNumber } from '../../PublicModule/Util/YFWPublicFunction'
import { yfwRedColor } from '../../Utils/YFWColor'
import YBTipsStatusView from './YBTipsStatusView'
import PropTypes from 'prop-types'
export default class YBTipsApiInfoView extends Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    static defaultProps = {
        cmd:'',
        cmdCN:'',
        spendTime:0
    }

    static propTypes = {
        cmd: PropTypes.string,
        cmdCN: PropTypes.string,
        spendTime: PropTypes.oneOfType([PropTypes.string,PropTypes.number]),
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        let cmd = this.props.cmd
        let cmdCN = this.props.cmdCN
        let spendTime = safeFloatNumber(this.props.spendTime)
        let spendTimeStr = parseInt(spendTime*1000)+'ms'
        let timeTipColor = spendTime > 1?yfwRedColor():'#333'
        return (
            <View style={styles.container}>
                <View style={{flex:1}}>
                    <Text style={styles.tipText}>{cmd}</Text>
                    {isNotEmpty(cmdCN)&&<Text style={[styles.tipText,{marginTop:5}]}>{cmdCN}</Text>}
                </View>
                {
                (spendTime > 0 && isNotEmpty(spendTimeStr))&&<Text style={{color:timeTipColor,fontSize:12,marginRight:3,}}>{spendTimeStr}</Text>
                }
                {this._renderStatus()}
            </View>
        )
    }
    _renderStatus(){
        let status = this.props.status
        return (
            <YBTipsStatusView status={status}></YBTipsStatusView>
        )
    }

}

const styles = StyleSheet.create({
    container:{
        flexDirection:'row',alignItems:'center',justifyContent:'center',backgroundColor:'white',minHeight:21
    },
    tipText:{
        fontSize:14,color:'#333',textAlign:'left'
    },
})