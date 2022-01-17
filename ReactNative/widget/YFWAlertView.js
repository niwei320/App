import React, { Component } from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import ModalView from './ModalView'
import { adaptSize, kScreenWidth } from '../PublicModule/Util/YFWPublicFunction'

export default class YFWAlertView extends Component {

  constructor(props) {
    super(...arguments)

    this.state = {  }
  }

  show () {
    this.modalView && this.modalView.show()
  }

  dismiss () {
    this.modalView && this.modalView.disMiss()
  }

  _handleActionClick (type) {
    this.dismiss()
    this.props.onClick && this.props.onClick({ type: type })
  }

  renderAlertHeader () {
    const { title } = this.props
    return (
      <View style={{position: 'relative', width: kScreenWidth-adaptSize(56), height: adaptSize(40), justifyContent: 'flex-end', alignItems: 'center'}}>
        <Text style={{fontSize: 17, fontWeight: '500', color: '#333'}}>{title}</Text>
        <TouchableOpacity onPress={this._handleActionClick.bind(this, 'close')} activeOpacity={1} style={{position: 'absolute', right: 0, top: 0, width: 40, height: 40, justifyContent: 'center', alignItems: 'center'}}>
          <Image source={require('../../img/returnTips_close.png')} style={{width:14,height:14}} />
        </TouchableOpacity>
      </View>
    )
  }

  renderAlertContent () {
    const { content } = this.props
    return (
      <View style={{position: 'relative', width: kScreenWidth-adaptSize(56), minHeight: adaptSize(100), justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{fontSize: 13, color: '#333'}}>{content}</Text>
        {this.props.children}
      </View>
    )
  }

  renderAlertAction () {
    const { confirmText } = this.props
    const { cancelText } = this.props
    const { showCancel } = this.props
    return (
      <View style={{position: 'relative', width: kScreenWidth-adaptSize(56), height: adaptSize(60), justifyContent: 'space-evenly', alignItems: 'flex-start', flexDirection: 'row' }}>
        {showCancel && <TouchableOpacity onPress={this._handleActionClick.bind(this, 'cancel')} activeOpacity={1} style={{minWidth: 80, backgroundColor: '#1fdb9b', borderRadius: 15, height: 30, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10}}>
          <Text style={{fontSize: 15, color: '#fff', fontWeight: '500'}}>{cancelText}</Text>
        </TouchableOpacity>}
        <TouchableOpacity onPress={this._handleActionClick.bind(this, 'confirm')} activeOpacity={1} style={{minWidth: 80, backgroundColor: '#1fdb9b', borderRadius: 15, height: 30, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10}}>
          <Text style={{fontSize: 15, color: '#fff', fontWeight: '500'}}>{confirmText}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    
    return ( 
      <ModalView ref={e => this.modalView = e} animationType='fade'>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.4)'}}>
          <View style={{width: kScreenWidth-adaptSize(56), minHeight: adaptSize(200), borderRadius: 10, backgroundColor: '#fff', justifyContent: 'space-between', alignItems: 'center'}}>
            {this.renderAlertHeader()}
            {this.renderAlertContent()}
            {this.renderAlertAction()}
          </View>
        </View>
      </ModalView>
    )
  }
}

YFWAlertView.defaultProps = {
  title: '提示',
  content: '',
  confirmText: '确定',
  cancelText: '取消',
  showCancel: true,
  onClick: () => {}
}

YFWAlertView.prototypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  showCancel: PropTypes.bool,
  onClick: PropTypes.func,
}