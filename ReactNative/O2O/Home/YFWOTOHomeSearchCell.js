import React, { Component } from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import { adaptSize, isIphoneX, kScreenWidth } from '../../PublicModule/Util/YFWPublicFunction'
import LinearGradient from 'react-native-linear-gradient'
import { pushNavigation } from '../../Utils/YFWJumpRouting'

export default class YFWOTOHomeSearchCell extends Component {

  constructor(props) {
    super(props)

    this.state = { }
  }

  handleSearch() {
    const { navigate } = this.props.navigation
    pushNavigation(navigate, { type: 'O2O_Search' })
  }

  componentDidMount() {}

  componentWillUnmount() {}

  componentWillReceiveProps() {}

  render() {
    return (
      <LinearGradient colors={['#2e73ed', '#5ca9ff']} start={{x: 1, y: 0}} end={{x: 0, y: 0}} style={{flex: 1, paddingTop: 5, paddingBottom: 13, paddingHorizontal: 13}} >
        <TouchableOpacity onPress={this.handleSearch.bind(this)} activeOpacity={1} style={{flex: 1, height: adaptSize(34), borderRadius: 17, paddingHorizontal: 10, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center'}}>
          <Image source={require('../Image/icon_search_gray.png')} style={{width: 14, height: 14}} />
          <Text style={{fontSize: 14, color: '#ccc', marginLeft: 5}}>批准文号、通用名、商品名、症状</Text>
        </TouchableOpacity>
      </LinearGradient>
    )
  }
}