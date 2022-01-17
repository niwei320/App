import React, { Component } from 'react'
import { View, Text, Image, FlatList, Animated, TouchableOpacity} from 'react-native'
import PropTypes from 'prop-types'
import { adaptSize, kScreenWidth, safe, safeArray, safeObj } from '../../PublicModule/Util/YFWPublicFunction'
import { pushNavigation } from '../../Utils/YFWJumpRouting'

export default class YFWOTOHomeIconCell extends Component {

  constructor(props) {
    super(props)

    this.width = kScreenWidth-26

    this.state = { 
      left: new Animated.Value(0)
    }
  }

  handleCategory(item) {
    const { navigate } = this.props.navigation
    pushNavigation(navigate, { type: 'O2O_Category_Result', categoryName: item.name, categoryId: item.type })
  }

  componentDidMount() {}

  componentWillUnmount() {}

  componentWillReceiveProps() {}

  /**
   * {
        nativeEvent: {
        contentInset: {bottom, left, right, top},
        contentOffset: {x, y},
        contentSize: {height, width},
        layoutMeasurement: {height, width},
        zoomScale
      }
    }
   * @param {*} event 
   */
  handleScroll(event) {
    const { contentSize, contentOffset, layoutMeasurement } = event.nativeEvent
    const scrollArea = contentSize.width - layoutMeasurement.width
    const x = Math.min(Math.max(0, contentOffset.x), scrollArea)
    const scale = x / scrollArea
    Animated.spring(this.state.left, { toValue: scale*25 }).start()
  }

  render() {
    let len = safeArray(this.props.data).length
    let data = new Array(Number((len + len%2)/2))
    let height = len>10 ? adaptSize(190) : adaptSize(170)
    // let lineW = len>10 ? 25 : 50
    return( 
      <View style={{flex: 1, height: height, paddingTop: adaptSize(5)}}> 
        <FlatList
          showsHorizontalScrollIndicator={false}
          style={{height: adaptSize(140)}}
          horizontal={true}
          indicatorStyle={'white'}
          data={data}
          extraData={this.props}
          renderItem={this.renderItem.bind(this)}
          keyExtractor={(item, index) => 'icon'+index}
          onScroll={this.handleScroll.bind(this)}
          scrollEventThrottle={20}
        />
        {len>10 && <View style={{flex: 1, alignItems: 'center'}}>
          <View style={{width: 50, height: 6, borderRadius: 3, backgroundColor: '#f4f4f4'}}>
            <Animated.View style={{width: 25, height: 6, borderRadius: 3, backgroundColor: '#5799f7', position: 'absolute', left: this.state.left}}></Animated.View>
          </View>
        </View>}
      </View> 
    )
  }

  renderItem(itemData) {
    const { item, index } = itemData
    const { data } = this.props
    const size = this.width/5
    const idx = index+Number((data.length+data.length%2)/2)
    return (
      <View style={{width: size, height: adaptSize(70)}}>
        {this.renderIconItem(data[index])}
        {idx<data.length && this.renderIconItem(data[idx])}
      </View>
    )
  }

  renderIconItem(item) {
    // const { item } = itemData
    const size = this.width/5
    const iconW = adaptSize(45)
    const img = safe(safeObj(item).img_url).length>0 ? {uri: safeObj(item).img_url} : item.icon
    return (
      <TouchableOpacity onPress={this.handleCategory.bind(this, item)} activeOpacity={1} style={{width: size, height: size+adaptSize(5), justifyContent: 'center', alignItems: 'center'}}>
        <Image source={img} style={{width: iconW, height: iconW}} />
        <Text style={{fontSize: adaptSize(12), color: '#666', marginTop: 3}}>{item.name}</Text>
      </TouchableOpacity>
    )
  }
}