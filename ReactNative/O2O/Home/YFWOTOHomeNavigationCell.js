import React, { Component } from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import { isIphoneX, kScreenWidth, safe, safeObj } from '../../PublicModule/Util/YFWPublicFunction'
import LinearGradient from 'react-native-linear-gradient'
import YFWMessageRedPointView from '../../widget/YFWMessageRedPointView'
import { pushNavigation } from '../../Utils/YFWJumpRouting'

export default class YFWOTOHomeNavigationCell extends Component {

  constructor(props) {
    super(props)

    this.state = { }
  }

  handleBack() {
    this.props.navigation.goBack()
  }

  handleLocation() {
    const { navigate } = this.props.navigation
    pushNavigation(navigate, { type: 'O2O_shipping_address', from: 'O2OSelectAddress' })
  }

  handleMore() {
    this.props.onMore && this.props.onMore()
  }

  componentDidMount() {}

  componentWillUnmount() {}

  componentWillReceiveProps() {}

  render() {
    const data = safeObj(this.props.data)
    const address = safe(data.address).length>0 ? safe(data.address) : safe(data.city).length>0 ? safe(data.city) : '暂无地址'
    return(
      <View style={{width: kScreenWidth, height: 44}}>
        <LinearGradient colors={['#2e73ed', '#5ca9ff']} start={{x: 1, y: 0}} end={{x: 0, y: 0}}  style={{flex: 1}}  style={{flex: 1, flexDirection: 'row', alignItems: 'flex-end'}}>
          {/* <TouchableOpacity onPress={this.handleBack.bind(this)} activeOpacity={1} style={{width: 34, height: 44, justifyContent: 'center', alignItems: 'center'}}>
            <Image source={require('../Image/icon_back_white.png')} style={{width: 7, height: 14}} />
          </TouchableOpacity> */}
          {/* <Text style={{fontSize: 20, fontWeight: '700', height: 44, color: '#fff', lineHeight: 43, marginLeft: 13}}>同城配送</Text> */}
          <Image source={require('../Image/oto_home_logo.png')} style={{width: 73, height: 20, marginBottom: 11, marginLeft: 13}} />
          <View style={{width: 0, height: 16, marginBottom: 13, marginHorizontal: 10, borderColor: '#fff', borderWidth: 0.5, borderStyle: 'dashed'}} />
          <TouchableOpacity onPress={this.handleLocation.bind(this)} activeOpacity={1} style={{flex: 4, height: 44, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
            <Image source={require('../Image/icon_address_white.png')} style={{width: 12, height: 14}} />
            <Text style={{fontSize: 15, color: '#fff', marginHorizontal: 5}} numberOfLines={1}>{address}</Text>
            <Image source={require('../Image/icon_detail_white.png')} style={{width: 5, height: 9}} />
          </TouchableOpacity>
          <View style={{flex: 1}}></View>
          {/* <TouchableOpacity onPress={this.handleMore.bind(this)} activeOpacity={1} style={{width: 46, height: 44, justifyContent: 'center', alignItems: 'center'}}>
            <Image source={require('../Image/icon_more_white.png')} style={{width: 20, height: 4}} />
          </TouchableOpacity> */}
          <View style={{height: 44, justifyContent: 'center', alignItems: 'center'}}><YFWMessageRedPointView navigation={this.props.navigation} /></View>
        </LinearGradient>
      </View>
    )
  }
}