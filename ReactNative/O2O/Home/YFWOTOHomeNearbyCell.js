import React, { Component } from 'react'
import { View, Text, Image } from 'react-native'
import PropTypes from 'prop-types'
import { adaptSize, safe } from '../../PublicModule/Util/YFWPublicFunction'

export default class YFWOTOHomeNearbyCell extends Component {

  constructor(props) {
    super(props)

    this.state = { }
  }

  componentDidMount() {}

  componentWillUnmount() {}

  componentWillReceiveProps() {}

  render() {
    const show = Number(safe(this.props.data)) > 0
    return( 
      <View> 
        <Text style={{fontSize: adaptSize(16), fontWeight: '500', color: '#333'}}>
          {'附近药店   '}
          {show && <Text style={{fontSize: adaptSize(12), fontWeight: '400', color: '#999'}}>附近共有<Text style={{color: '#5799f7'}}>{this.props.data}</Text>家药店</Text>}
        </Text>
      </View> 
    )
  }
}