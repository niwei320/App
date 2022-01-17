import React, { Component } from 'react'
import { View, Text, Image } from 'react-native'
import PropTypes from 'prop-types'
import { adaptSize, safeArray } from '../../PublicModule/Util/YFWPublicFunction'

export default class YFWOTOHomeServiceCell extends Component {

  constructor(props) {
    super(props)

    this.state = { }
  }

  componentDidMount() {}

  componentWillUnmount() {}

  componentWillReceiveProps() {}

  render() {
    return( 
      <View style={{flex: 1, height: adaptSize(36), flexDirection: 'row', justifyContent: 'space-evenly'}}> 
        {safeArray(this.props.data).map((item, index) => {
          return (
            <View key={'service'+index} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
              <Image source={item.icon} style={{width: adaptSize(item.size.width), height: adaptSize(item.size.height), marginRight: adaptSize(5)}} />
              <Text style={{fontSize: adaptSize(12), color: '#999'}}>{item.title}</Text>
            </View>
          )
        })}
      </View> 
    )
  }
}