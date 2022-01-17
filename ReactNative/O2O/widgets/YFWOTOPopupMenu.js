import React, { Component } from 'react'
import { View, Text, Image, Modal, TouchableOpacity, DeviceEventEmitter } from 'react-native'
import PropTypes from 'prop-types'
import { adaptSize, isIphoneX, safe } from '../../PublicModule/Util/YFWPublicFunction'
import YFWNativeManager from '../../Utils/YFWNativeManager'
import { NavigationActions } from 'react-navigation'
import { doAfterLogin } from '../../Utils/YFWJumpRouting'
import { refreshMessageRedPoint } from '../../Utils/YFWInitializeRequestFunction'

export default class YFWOTOPopupMenu extends Component {

  constructor(props) {
    super(props)

    this.state = { 
      visible: false,
      data: [
        {
          key: 'message',
          icon: require('../Image/icon_menu_message.png'),
          title: '消息',
          badge: '',
          size: {width: adaptSize(18), height: adaptSize(18)}
        },
        {
          key: 'message',
          icon: require('../Image/icon_menu_home.png'),
          title: '首页',
          badge: '',
          size: {width: adaptSize(17), height: adaptSize(16)}
        },
        {
          key: 'person',
          icon: require('../Image/icon_menu_person.png'),
          title: '我的',
          badge: '',
          size: {width: adaptSize(16), height: adaptSize(18)}
        }
      ]
    }
  }

  show() {
    this.setState({ visible: true })
  }

  dismiss() {
    this.setState({ visible: false })
  }

  _close() {
    this.dismiss()
  }

  _handleHome() {
    this._close()

    YFWNativeManager.removeVC();

    this.props.navigation.popToTop();

    const resetActionTab = NavigationActions.navigate({ routeName: 'OTONav' });
    this.props.navigation.dispatch(resetActionTab);
  }

  _handleMessage() {
    this._close()

    const {navigate} = this.props.navigation;
    doAfterLogin(navigate, ()=> {
        let badge = new Map();
        DeviceEventEmitter.emit('ShowInviteView', {value: false});
        navigate('YFWMyMessageController', {state: badge});
    })
  }

  _handlePerson() {
    this._close()

    YFWNativeManager.removeVC();

    this.props.navigation.popToTop();

    const resetActionTab = NavigationActions.navigate({ routeName: 'UserCenterNav' });
    this.props.navigation.dispatch(resetActionTab);
  }

  componentDidMount() {
    refreshMessageRedPoint()
    let that = this
    this.messageEmit = DeviceEventEmitter.addListener('ALL_MESSAGE_RED_POINT_STATUS', (value)=> {
      let { data } = that.state
      let message = data[0]
      let badge = parseInt(safe(value))
      message.badge = badge>0 ? (badge>99 ? '99+' : badge+'') : ''
      data[0] = message
      that.setState({ data: data })
  })
  }

  componentWillUnmount() {
    this.messageEmit && this.messageEmit.remove()
  }

  componentWillReceiveProps() {}

  render() {
    const home = this.props.home
    const { data } = this.state
    return ( 
      
      <Modal
        transparent={true}
        visible={this.state.visible}
        animationType={'fade'}
        onRequestClose={this._close.bind(this)}
      >
        <TouchableOpacity activeOpacity={1} style={{flex: 1}} onPress={this._close.bind(this)}>
          <View style={{width: adaptSize(110), borderRadius: 7, opacity: 0.85, paddingVertical: 5, backgroundColor: '#fff', position: 'absolute', right: 13, top: isIphoneX() ? 80 : 56}}>
            {this.renderItem(data[0], this._handleMessage)}
            {!home && this.renderItem(data[1], this._handleHome)}
            {this.renderItem(data[2], this._handlePerson)}
          </View>
        </TouchableOpacity>
      </Modal>
    )
  }

  renderItem(item, handleClick) {
    return (
      <TouchableOpacity activeOpacity={1} onPress={handleClick.bind(this)}>
        <View style={{height: adaptSize(45), flexDirection: 'row', alignItems: 'center'}}>
          {item.badge.length>0 && <Text style={{fontSize: adaptSize(8), fontWeight: 'bold', textAlign: 'center', height: adaptSize(12), minWidth: adaptSize(12), overflow: 'hidden', paddingHorizontal: 2, lineHeight: adaptSize(12), backgroundColor: '#ff3300', borderRadius: adaptSize(6), color: '#fff', position: 'absolute', top: adaptSize(7), left: adaptSize(34), zIndex: 1}}>{item.badge}</Text>}
          <View style={{width: adaptSize(18), marginLeft: adaptSize(26), marginRight: adaptSize(12)}}><Image source={item.icon} style={{...item.size}} /></View>
          <Text style={{fontSize: adaptSize(14), color: '#5799f7', flex: 1}}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    )
  }
}