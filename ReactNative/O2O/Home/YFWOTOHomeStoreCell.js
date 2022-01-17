import React, { Component } from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import { adaptSize, safe, safeObj } from '../../PublicModule/Util/YFWPublicFunction'
import { pushNavigation } from '../../Utils/YFWJumpRouting'

export default class YFWOTOHomeStoreCell extends Component {

  constructor(props) {
    super(props)

    this.state = { }
  }

  handleItem(item) {
    let {navigate} = this.props.navigation
    pushNavigation(navigate, { type: 'get_oto_store', data: item })
  }

  componentDidMount() {}

  componentWillUnmount() {}

  componentWillReceiveProps() {}

  render() {
    const data = this.props.data
    const count = Number(safe(safeObj(data).sale_count))>0 ? '月销   '+safe(safeObj(data).sale_count) : ''
    return( 
      <TouchableOpacity onPress={this.handleItem.bind(this, data)} activeOpacity={1}>
        <View style={{flex: 1, flexDirection: 'row', padding: 10}}> 
          <Image source={{uri: safe(safeObj(data).logo_image)}} resizeMode={'stretch'} style={{borderRadius: 3, borderWidth: 0.5, borderColor: '#dddddd', width: adaptSize(65), height: adaptSize(50)}} />
          <View style={{flex: 1, paddingLeft: adaptSize(13)}}>
            <Text style={{fontWeight: '500', fontSize: adaptSize(14), color: '#333', marginRight: adaptSize(50)}} numberOfLines={1}>{safe(safeObj(data).store_title)}</Text>
            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginTop: adaptSize(5)}}>
              <Image source={require('../Image/icon_star.png')} style={{width: adaptSize(12), height: adaptSize(11)}} />
              <Text style={{fontSize: adaptSize(12), color: '#ffb02e', fontWeight: '500', marginLeft: 3}}>{safe(safeObj(data).shop_avg_level)}</Text>
              <Text style={{fontSize: adaptSize(11), color: '#666', marginLeft: 5, flex: 1}}>{count}</Text>
              <Text style={{fontSize: adaptSize(11), color: '#666', marginRight: 5}}>{'距离 '+safe(safeObj(data).distance)}</Text>
            </View>
            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginTop: adaptSize(4)}}>
              <Text style={{fontSize: adaptSize(11), color: '#999', marginRight: 5}}>{'起送 ￥'+safe(safeObj(data).starting_price)}</Text>
              <Text style={{fontSize: adaptSize(11), color: '#666', marginRight: 5}}>{' 配送费 ￥'+safe(safeObj(data).logistics_price)}</Text>
            </View>
            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginTop: adaptSize(6)}}>
              {/* <Text style={{fontSize: adaptSize(11), color: '#f55763', marginRight: 5, borderColor: '#f55763', borderWidth: 0.5, borderRadius: 2}}>{' 满60减13 '}</Text>
              <Text style={{fontSize: adaptSize(11), color: '#f55763', marginRight: 5, borderColor: '#f55763', borderWidth: 0.5, borderRadius: 2}}>{' 满90减25 '}</Text> */}
            </View>
          </View>
        </View> 
      </TouchableOpacity>
    )
  }
}