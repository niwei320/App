import React,{Component} from 'react'
import {View, StyleSheet,Text,FlatList,} from 'react-native'
import { safe, safeArray, safeObj } from '../../PublicModule/Util/YFWPublicFunction'
import PropTypes from 'prop-types'

export default class YBTipsResultListView extends Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    static defaultProps = {
        dataSource:[],
        listKey:'',
        extraData:{},
    }

    static propTypes = {
        dataSource: PropTypes.array,
        listKey: PropTypes.oneOfType([PropTypes.string,PropTypes.number]),
        extraData: PropTypes.object,
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        let dataSource = safeArray(this.props.dataSource)
        let listKey = safe(this.props.listKey)
        let extraData = safeObj(this.props.extraData)
        return (
            <FlatList
                listKey={'tips'+listKey}
                style={{paddingHorizontal:13}}
                data={dataSource}
                extraData={extraData}
                keyExtractor={(item,index)=>index+''}
                renderItem={this._renderItem.bind(this)}>
            </FlatList>
        )
    }

    _renderItem(info) {
        return <Text style={{fontSize:14,color:'#333',lineHeight:16,}}>{info.item}</Text>
    }
}

const styles = StyleSheet.create({

    tipsImage:{
        width:20,
        height:20,
        marginRight:12
    },
})