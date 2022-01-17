import React, { Component } from 'react'
import { View, Text, Image, TouchableOpacity, FlatList, Animated } from 'react-native'
import PropTypes from 'prop-types'
import { isIphoneX, kScreenHeight, kScreenWidth, safe, safeArray, safeObj } from '../../PublicModule/Util/YFWPublicFunction'
import YFWOTOStoreMedicineCell from './YFWOTOStoreMedicineCell'
import { pushNavigation } from '../../Utils/YFWJumpRouting'
import YFWO2OCancelOrComfirmModal from '../widgets/YFWO2OCancelOrComfirmModal'

export default class YFWOTOStoreCart extends Component {

  constructor(props) {
    super(props)

    let noticeH = safe(safeObj(props.data).not_show_cart_prompt).length>0 ? 30 : 0
    this.bottomH = isIphoneX() ? 77 : 60
    this.backOpacity = new Animated.Value(0)
    this.noticeH = new Animated.Value(30)
    this.contentH = new Animated.Value(0)
    this.animating = false
    this.count = safeArray(safeObj(props.data).medicine_list).length

    this.state = {
      foldCart: false
    }
  }

  handlePay() {
    const data = safeObj(this.props.data)
    const { medicine_list, is_show_cart, store_medicine_count_total } = data
    if (store_medicine_count_total<1 || !is_show_cart) {
      return
    }
    this.props.navigation.navigate("YFWOTOOrderSettlement",{Data: medicine_list});
  }

  handleMedicineItem(item) {
    this.props.onMedicineItem && this.props.onMedicineItem(item)
  }

  handleCart() {
    if (this.animating) {
      return
    }
    const { foldCart } = this.state
    const data = safeObj(this.props.data)
    const { store_medicine_count_total, is_show_cart } = data
    if (!foldCart && store_medicine_count_total<1 || !is_show_cart) {
      return
    }

    this.startCartAnimation()
  }

  startCartAnimation() {
    let { foldCart } = this.state
    const data = safeObj(this.props.data)
    const { not_show_cart_prompt, medicine_list } = data
    this.animating = true
    let height = 0
    let opacity = 0
    let noticeH = not_show_cart_prompt.length>0 ? 30 : 0
    if (!foldCart) {
      this.setState({ foldCart: true })
      height = not_show_cart_prompt.length>0 ? 70 : 40 + Math.min(5, medicine_list.length)*100
      opacity = 0.3
      noticeH = 0
    }
    Animated.parallel([
      Animated.timing(this.contentH, { duration: 250, toValue: height, delay: 100 }),
      Animated.timing(this.noticeH, { duration: 250, toValue: noticeH, delay: 100 }),
      Animated.timing(this.backOpacity, { duration: 250, toValue: opacity, delay: 100 })
    ]).start(() => {
      if (foldCart) {
        this.setState({ foldCart: false })
      }
      this.animating = false
    })
  }

  handleClearCart() {
    this.props.onClearCart && this.props.onClearCart()
    this.clearRef && this.clearRef.disMiss()
    this.handleCart()
  }

  handleShowClearAlert() {
    const medicine_list = safeArray(safeObj(this.props.data).medicine_list)
    if (medicine_list.length > 0) {

      this.clearRef && this.clearRef.show()
    }
  }

  handleEditQuantity(medicine, quantity) {
    this.props.onEditQuantity && this.props.onEditQuantity(medicine, quantity)
  }

  handleChangeLocation() {
    const { navigate } = this.props.navigation
    pushNavigation(navigate, { type: 'O2O_shipping_address', from: 'O2OSelectAddress' })
  }

  componentDidMount() {}

  componentWillUnmount() {}

  componentWillReceiveProps(nextProps) {
    let len = safeArray(safeObj(nextProps.data).medicine_list).length
    if (len != this.count && this.state.foldCart && safeObj(nextProps.data).is_show_cart && !this.animating) {
      let height = safeObj(nextProps.data).not_show_cart_prompt.length>0 ? 70 : 40 + Math.min(5, len)*100
      Animated.timing(this.contentH, { duration: 250, toValue: height }).start()
    }
    if (this.state.foldCart && len==0 && !this.animating) {
      this.startCartAnimation()
    }
    this.count = len
  }

  render() {
    const { foldCart } = this.state
    const data = safeObj(this.props.data)
    const { not_show_cart_prompt } = data
    const height = foldCart ? kScreenHeight : this.bottomH+30
    return (
      <View style={{position: 'absolute', bottom: 0, left: 0, width: kScreenWidth, height: height, justifyContent: 'flex-end', zIndex: 10}}>
        {this.renderBack()}
        {this.renderSpace()}
        {this.renderContent()}
        {this.renderBottomNotice()}
        {this.renderBottom()}
        <YFWO2OCancelOrComfirmModal title={'确定清空购物车吗？'} ref={e => this.clearRef = e} confirmOnPress={this.handleClearCart.bind(this)} />
      </View>
    )
  }

  renderBack() {
    return <Animated.View style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#000', opacity: this.backOpacity}}></Animated.View>
  }

  renderSpace() {
    const { foldCart } = this.state
    return <TouchableOpacity onPress={this.handleCart.bind(this)} activeOpacity={1} style={{flex: 1, display: foldCart ? 'flex': 'none'}} ></TouchableOpacity>
  }

  renderContent() {
    const data = safeObj(this.props.data)
    const { foldCart } = this.state
    const { medicine_list, not_show_cart_prompt, store_medicine_count_total } = data
    return (
      <Animated.View style={{backgroundColor: '#fff', borderTopLeftRadius: 7, borderTopRightRadius: 7, height: this.contentH, display: foldCart ? 'flex': 'none'}}>
        {not_show_cart_prompt.length>0 && <View style={{borderTopLeftRadius: 7, borderTopRightRadius: 7, overflow: 'hidden'}}>
          {this.renderNotice()}
        </View>}
        <View style={{height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 17}}>
        <Text style={{fontWeight: '500', fontSize: 14, color: '#333'}}>购物车<Text style={{fontSize: 10, color: '#999', fontWeight: '300'}}>（共{store_medicine_count_total}件商品）</Text></Text>
          <TouchableOpacity onPress={this.handleShowClearAlert.bind(this)} activeOpacity={1} style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 40}}>
            <Image source={require('../Image/deleteAll_icon.png')} style={{width: 11, height: 12, marginRight: 5}} />
            <Text style={{fontSize: 13, color: '#b9b9b9'}}>清空</Text>
          </TouchableOpacity>
        </View>
        <View style={{height: Math.min(5, medicine_list.length)*100, paddingBottom: 6}}>
          <FlatList
            data={medicine_list}
            extraData={this.props}
            renderItem={this.renderMedicineItem.bind(this)}
            keyExtractor={(item, index) => index+''}
          />
        </View>
      </Animated.View>
    )
  }

  renderMedicineItem(medicine) {
    const { item, index } = medicine
    const data = safeObj(this.props.data)
    const { is_show_cart } = data
    return (
      <TouchableOpacity onPress={this.handleMedicineItem.bind(this, item)} activeOpacity={1} style={{height: 100, paddingHorizontal: 17, paddingTop: 16, paddingBottom: 20}}>
        <YFWOTOStoreMedicineCell navigation={this.props.navigation} editQuantity={is_show_cart} data={item} onEditQuantity={this.handleEditQuantity.bind(this, item)} />
      </TouchableOpacity>
    )
  }

  renderNotice() {
    const data = safeObj(this.props.data)
    const { not_show_cart_prompt, is_show_cart } = data
    const back = is_show_cart ? 'rgba(233, 242, 255, 0.85)' : 'rgba(51, 51, 51, 0.85)'
    const color = is_show_cart ? '#5799f7' : '#fff'
    const showLocation = not_show_cart_prompt.indexOf('配送范围内') != -1
    const height = not_show_cart_prompt.length>0 ? 30 : 0
    return (
      <View style={{backgroundColor: back, height: height, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12, flexDirection: 'row'}}>
        <Text style={{color: color, fontSize: 12}} numberOfLines={1}>{not_show_cart_prompt}</Text>
        {showLocation && <TouchableOpacity style={{ height: 30, marginLeft: 5, justifyContent: 'center', alignItems: 'center'}} onPress={this.handleChangeLocation.bind(this)} activeOpacity={1} >
          <View style={{paddingHorizontal: 5, height: 14, borderRadius: 10, borderWidth: 0.5, borderColor: '#fff', justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: 10, color: '#fff'}}>更换地址</Text>
          </View>
        </TouchableOpacity>}
      </View>
    )
  }

  renderBottomNotice() {
    return (
      <Animated.View style={{height: this.noticeH}}>
        {this.renderNotice()}
      </Animated.View>
    )
  }

  renderBottom() {
    const data = safeObj(this.props.data)
    const showCart = data.is_show_cart
    const badge = data.store_medicine_count_total>99 ? '99+' : data.store_medicine_count_total
    const cartImg = (showCart && data.store_medicine_count_total>0) ? require('../Image/icon_cart_blue.png') : require('../Image/icon_cart_gray.png')
    const priceColor = (showCart && data.store_medicine_count_total>0) ? '#ff3300' : '#999'
    const otherPrice = data.store_medicine_count_total>0 ? '配送费￥'+data.logistcs_price+'  包装费￥'+data.package_price : '另需配送费￥'+data.logistcs_price
    const action = data.store_medicine_count_total>0 ? '去结算' : '￥0起送'
    const actionColor = (showCart && data.store_medicine_count_total>0) ? '#5799f7' : '#999'
    return (
      <View style={{height: this.bottomH, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', shadowColor: 'rgba(100, 100, 100, 0.2)', shadowOffset:{width: 1, height: 1}, shadowOpacity: 1, shadowRadius: 6,elevation:2}}>
        <TouchableOpacity activeOpacity={1}  onPress={this.handleCart.bind(this)} style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
          <View style={{paddingVertical: 7, width: 90, alignItems: 'flex-end'}}>
            <Image source={cartImg} style={{width: 63, height: 43}} />
            {data.store_medicine_count_total>0 && <Text style={{position: 'absolute', backgroundColor: priceColor, textAlign: 'center', top: 9, right: 0, minWidth: 18, paddingHorizontal: 5, lineHeight: 18, height: 18, borderRadius: 9, overflow: 'hidden', fontSize: 13, color: '#fff'}}>{badge}</Text>}
          </View>
          <View style={{flex: 1, justifyContent: 'center', paddingLeft: 12}}>
            {data.store_medicine_count_total>0 ? <Text style={{color: priceColor, fontSize: 16}}>￥ <Text style={{fontWeight: 'bold'}}>{data.store_medicine_price_total}</Text></Text>
            : <Text style={{color: priceColor, fontSize: 12}}>未选购商品</Text>}
            <Text style={{color: '#999', fontSize: 10}}>{otherPrice}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.handlePay.bind(this)} activeOpacity={1} style={{height: 32, justifyContent: 'center', paddingHorizontal: 15, backgroundColor: actionColor, borderRadius: 16, marginRight: 24, marginLeft: 5}}>
          <Text style={{fontWeight: '500', color: '#fff', fontSize: 14}}>{action}</Text>
        </TouchableOpacity>
      </View>
    )
  }
}
