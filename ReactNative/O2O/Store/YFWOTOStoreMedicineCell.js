import React, { Component } from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import { isNotEmpty, max, safe, safeObj } from '../../PublicModule/Util/YFWPublicFunction'
import YFWMoneyLabel from '../../widget/YFWMoneyLabel'
import FastImage from 'react-native-fast-image'
import YFWPrescribedGoodsTitle from '../../widget/YFWPrescribedGoodsTitle'
import {TYPE_DOUBLE, TYPE_NOMAL, TYPE_SINGLE, TYPE_OTC} from '../../widget/YFWPrescribedGoodsTitle'
import { doAfterLogin } from '../../Utils/YFWJumpRouting'

export default class YFWOTOStoreMedicineCell extends Component {

  constructor(props) {
    super(props)

    this.state = { }
  }

  _handleEditQuantity(type, medicine) {
    const { navigate } = this.props.navigation
    doAfterLogin(navigate, () => {
      if (this.props.onEditQuantity) {
        let quantity = Number(safe(safeObj(medicine).quantity))
        quantity = type=='sub' ? Math.max(0, quantity-1) : quantity+1
        this.props.onEditQuantity(quantity)
      }
    })
  }

  componentDidMount() {}

  componentWillUnmount() {}

  componentWillReceiveProps() {}

  render() {
    const imageWH = isNotEmpty(this.props.imageWH) ? this.props.imageWH : 64
    const medicine = this.props.data
    const saleCountType = this.props.saleCountType
    let desc = safe(safeObj(medicine).troche_type)+'  '+safe(safeObj(medicine).standard)
    if (saleCountType == '2') {
      // desc = desc + '  月销 ' + safe(safeObj(medicine).sale_count) + ' 份'
      desc = desc +'  库存 '+safe(safeObj(medicine).reserve)
    } else if (saleCountType == '3') {
      // desc = desc + '  \n月销 ' + safe(safeObj(medicine).sale_count) + ' 份'
      desc = desc +'  \n库存 '+ safe(safeObj(medicine).reserve)
    } else {
      desc = desc +'  库存 '+ safe(safeObj(medicine).reserve)
    }
    return ( 
      <View style={{height: imageWH+10, flexDirection: 'row'}}> 
        <View style={{padding: 5, width: imageWH, height: imageWH, borderRadius: 7, borderWidth: 1, borderColor: '#f0f0f0' }}>
          <FastImage style={{flex: 1}} source={{uri: safe(safeObj(medicine).cover_image)}} />
        </View>
        <View style={{flex: 1, marginLeft: 10, paddingVertical: 5}}>
          {this.renderTitleView(medicine)}
          <Text style={{fontSize: 10, color: '#999', lineHeight: 15, marginTop: 5}}>{desc}</Text>
          {/* <Text style={{fontSize: 10, color: '#999'}}>月销 {safe(safeObj(medicine).sale_count)} 份</Text> */}
          <View style={{flex: 1}} />
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <YFWMoneyLabel money={safe(safeObj(medicine).price)} moneyTextStyle={{color:'#ff3300',fontSize:14}} decimalsTextStyle={{color:'#ff3300',fontSize:12}} />
            {this.props.editQuantity ? <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
              {safe(safeObj(medicine).quantity)>0 && <TouchableOpacity onPress={this._handleEditQuantity.bind(this, 'sub', medicine)} activeOpacity={1} style={{padding: 5}} hitSlop={{left:5, top: 5, right: 5, bottom: 5}}>
                <Image source={require('../Image/icon_sub_blue.png')} style={{width: 17, height: 17}} />
              </TouchableOpacity>}
              {safe(safeObj(medicine).quantity)>0 && <Text style={{fontSize: 13, color: '#333', marginHorizontal: 3}}>{safe(safeObj(medicine).quantity)}</Text>}
              <TouchableOpacity onPress={this._handleEditQuantity.bind(this, 'add', medicine)} activeOpacity={1} style={{padding: 5}} hitSlop={{left:5, top: 5, right: 5, bottom: 5}}>
                <Image source={require('../Image/icon_add_blue.png')} style={{width: 17, height: 17}} />
              </TouchableOpacity>
            </View>
            : <View style={{padding: 5, flex: 1, alignItems: 'flex-end'}}>
              <Image source={require('../Image/icon_add_gray.png')} style={{width: 17, height: 17}} />
            </View>}
          </View>
        </View>
      </View>
    )
  }

  renderTitleView(medicine) {
    //单双轨3.1.00版本才有，并且现阶段只有HTTP才有
    //单轨药
    const title = safe(safeObj(medicine).alias_name)
    const type = safe(safeObj(medicine).PrescriptionType)
    if(type === "1"){
      return this.rednerPrescriptionLabel(TYPE_SINGLE, title)
    }
    //双轨药
    else if(type === "2"){
      return this.rednerPrescriptionLabel(TYPE_DOUBLE, title)
    }
    else if(type === "0") {
      return this.rednerPrescriptionLabel(TYPE_OTC, title)
    }
    //这里没有处方药的判断
    else {
      return this.rednerPrescriptionLabel(TYPE_NOMAL, title)
    }
}

/**
 * 返回处方标签
 * @param img
 * @returns {*}
 */
rednerPrescriptionLabel(type, title){
    return <YFWPrescribedGoodsTitle
      type={type}
      title={title}
      style={{color:'black', fontSize:13, lineHeight:17, fontWeight: '500'}}
      numberOfLines={2}
    />
}
}