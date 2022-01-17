import React, { Component } from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import ModalView from './ModalView'
import { adaptSize, kScreenWidth, safeArray } from '../PublicModule/Util/YFWPublicFunction'
import LinearGradient from 'react-native-linear-gradient';
import { pushNavigation } from '../Utils/YFWJumpRouting'
import YFWRequestViewModel from '../Utils/YFWRequestViewModel'

export default class YFWRealNameAlertView extends Component {

  constructor(props) {
    super(...arguments)

    this.state = {  }
  }

  show (from) {
    this.fromPage = from
    this.modalView && this.modalView.show()
  }

  dismiss () {
    this.modalView && this.modalView.disMiss()
  }

  handleActionClick (type) {
    this.dismiss()
    this.props.onClick && this.props.onClick({ type: type })
    if (this.navigation) {
      const { navigate } = this.navigation;
      // pushNavigation(navigate, { type:'verify_real_name', from: this.fromPage })
      let paramMap = new Map();
      let viewModel = new YFWRequestViewModel;
      paramMap.set('__cmd', 'person.userdrug.GetListByAccountId');
      viewModel.TCPRequest(paramMap, (res)=> {
          let patients = []
          safeArray(res.result).map(patientTtem => {
              if (patientTtem.dict_bool_certification == 1) {
                  patients.push(patientTtem)
              }
          })
          if (patients.length == 0) {
              pushNavigation(navigate, { type:'verify_real_name', from: 'UserInfo', isRealName: false })
          } else {
              pushNavigation(navigate, { type:'verify_fast_real_name', from: 'UserInfo', patients: patients })
          }
      },(error)=>{
        if (isNotEmpty(error) && isNotEmpty(error.msg)) {
          YFWToast(error.msg)
        }
      })
    }
  }

  componentDidMount () {
    if (this.props.getNavigation) {
      this.navigation = this.props.getNavigation();
    }
  }

  render() {
    
    return ( 
      <ModalView ref={e => this.modalView = e} animationType='fade'>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.4)'}}>
          <View style={{position: 'relative', width: kScreenWidth-adaptSize(96), minHeight: adaptSize(200), borderRadius: 10, backgroundColor: '#fff', alignItems: 'center'}}>
            <TouchableOpacity onPress={this.dismiss.bind(this)} activeOpacity={1} style={{position: 'absolute', right: 0, top: 0, width: 40, height: 40, justifyContent: 'center', alignItems: 'center'}}>
              <Image source={require('../../img/returnTips_close.png')} style={{width:14,height:14}} />
            </TouchableOpacity>
            <Image source={require('../../img/icon_real_name.png')} style={{width: adaptSize(100), height: adaptSize(100), marginVertical: adaptSize(30) }} />
            <Text style={{fontSize: 21, fontWeight: 'bold', color: '#333'}}>实名认证</Text>
            <Text style={{fontSize: 13, color: '#999', marginVertical: 20, maxWidth: kScreenWidth-adaptSize(150), lineHeight: 15 }}>根据平台管理要求，购药前须实名认证，避免影响后续购药请尽快认证哦</Text>
            <TouchableOpacity onPress={this.handleActionClick.bind(this)} style={{shadowColor: 'rgba(103, 216, 160, 0.5)', shadowOffset: { width: -3, height: 2 }, shadowRadius: 8, shadowOpacity: 1, elevation:2}} activeOpacity={1}>
              <LinearGradient 
                colors={['#5ac595','#67d8a0']}
                start={{x: 1, y: 0}} end={{x: 0, y: 0}}
                locations={[1,0]}
                style={{justifyContent: 'center', alignItems: 'center', width: kScreenWidth-adaptSize(160), height: 40, marginVertical: 20, borderRadius: 20}}>
                <Text style={{fontSize: 15, color: '#fff', fontWeight: '500'}}>立即认证</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ModalView>
    )
  }
}

YFWRealNameAlertView.defaultProps = {
  title: '提示',
  content: '',
  confirmText: '确定',
  cancelText: '取消',
  showCancel: true,
  onClick: () => {}
}

YFWRealNameAlertView.prototypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  showCancel: PropTypes.bool,
  onClick: PropTypes.func,
}