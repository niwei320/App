import React, { Component } from 'react'
import { View, Text, Image, FlatList, TouchableOpacity, Platform, NativeModules, TextInput, DeviceEventEmitter } from 'react-native'
import { kScreenWidth, kScreenHeight, isIphoneX, safe, isNotEmpty, secretIDCard } from '../PublicModule/Util/YFWPublicFunction'
import { pushNavigation } from '../Utils/YFWJumpRouting'
import YFWTouchableOpacity from '../widget/YFWTouchableOpacity'
import { NEWNAME, IDENTITY_CODE, IDENTITY_VERIFY } from '../PublicModule/Util/RuleString'
import YFWAlertView from '../widget/YFWAlertView'
import YFWToast from '../Utils/YFWToast'
import YFWRequestViewModel from '../Utils/YFWRequestViewModel'
const { StatusBarManager } = NativeModules

export default class YFWVerifyRealNamePage extends Component {
  static navigationOptions = ({navigation}) => ({
    translucent: true,
    tabBarVisible: false,
    headerTitle: '实名认证',
    headerTitleStyle: { color: '#333333',textAlign: 'center', flex: 1, fontSize: 17 },
    headerStyle: Platform.OS == 'ios' ? {borderBottomColor: '#ffffff', backgroundColor: '#ffffff'}
                  : { elevation: 0, backgroundColor: '#ffffff', height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50, paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0 },
    headerLeft: <TouchableOpacity style={{width:44, height: 44, justifyContent: 'center', alignItems: 'center'}} onPress={()=> navigation.goBack()}>
                  <Image style={{width:10,height:16,resizeMode:'stretch'}} source={require('../../img/icon_back_gray.png')} />
                </TouchableOpacity>,
    headerRight: <View></View>,
    headerBackground: <View></View>
  });

  constructor(props) {
    super(...arguments)

    const from = this.props.navigation.state.params.state.from || 'UserInfo'
    const isRealName = this.props.navigation.state.params.state.isRealName || false
    const realName = isRealName ? this.props.navigation.state.params.state.realName : ''
    const idCardNo = isRealName ? secretIDCard(this.props.navigation.state.params.state.idCardNo) : ''

    this.state = {  
      isVerify: isRealName,
      realName: realName,
      idCardNo: idCardNo,
      from: from ,
    }
  }

  handleAlertAction () {
    this.alertView && this.alertView.dismiss()
    const goBackKey = this.props.navigation.state.params.state.goBackKey
    this.props.navigation.goBack(safe(goBackKey))
  }

  handleConfirmRealName () {
    const { realName } = this.state
    const { idCardNo } = this.state
    if (realName.length == 0) {
      YFWToast('请输入姓名')
      return
    }
    if (idCardNo.length == 0) {
      YFWToast('请输入身份证号码')
      return
    }
    if (!IDENTITY_VERIFY.test(idCardNo)) {
      YFWToast('身份证号码格式不正确')
      return
    }
    // this.setState({
    //   isVerify: true,
    //   realName: realName,
    //   idCardNo: secretIDCard(idCardNo)
    // }) "410527199301299734" "董壮壮"
    // this.alertView && this.alertView.show()

    let paramMap = new Map();
    let viewModel = new YFWRequestViewModel();
    paramMap.set('__cmd', 'person.account.verified');
    paramMap.set('real_name', realName);
    paramMap.set('idcard_no', idCardNo);
    paramMap.set('type', 2);
    viewModel.TCPRequest(paramMap, (res) => {
      if (isNotEmpty(res) && res.result) {
        
        this.setState({
          isVerify: true,
          realName: realName,
          idCardNo: secretIDCard(idCardNo)
        })
        this.alertView && this.alertView.show()
        DeviceEventEmitter.emit('VERIFY_REALNAME_SUCCESS', {realName: realName, idCardNo: idCardNo})
      }
    }, error => {
      if (isNotEmpty(error) && isNotEmpty(error.msg)) {
        YFWToast(error.msg)
      }
    });
  }

  handleRealNameInput (value) {
    let realName = value
    realName = realName.replace(NEWNAME, '')
    this.setState({ realName: realName })
  }

  handleIdCardNoInput (value) {
    let idCardNo = value
    idCardNo = idCardNo.replace(IDENTITY_CODE, '')
    this.setState({ idCardNo: idCardNo })
  }

  componentDidMount () {  
    console.log(this.props.navigation.state.params.state)
  }

  componentWillUnmount () {  }

  renderInputView () {
    const { realName } = this.state
    const { idCardNo } = this.state
    return (
      <View>
        <View style={{width: kScreenWidth-26, marginHorizontal: 13, marginTop: 20, backgroundColor: '#fff', height: 50, borderRadius: 7, flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{fontSize: 13, fontWeight: '500', color: '#333', marginLeft: 16, marginRight: 5}}>姓名：</Text>
          <TextInput 
            style={{width: kScreenWidth-55, color: '#333', fontSize: 13}}
            value={realName}
            placeholder='请输入姓名' 
            placeholderTextColor='#999'
            maxLength={10}
            onChangeText={this.handleRealNameInput.bind(this)}
          />            
        </View>
        <View style={{width: kScreenWidth-26, marginHorizontal: 13, marginTop: 14, backgroundColor: '#fff', height: 50, borderRadius: 7, flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{fontSize: 13, fontWeight: '500', color: '#333', marginLeft: 16, marginRight: 5}}>身份证号：</Text>
          <TextInput 
            style={{width: kScreenWidth-55, color: '#333', fontSize: 13}}
            value={idCardNo}
            placeholder='请输入18位身份证号码' 
            placeholderTextColor='#999'
            maxLength={22}
            onChangeText={this.handleIdCardNoInput.bind(this)}
          />            
        </View>
      </View>
    ) 
  }

  renderShowView () {
    const { realName } = this.state
    const { idCardNo } = this.state
    return (
      <View>
        <View style={{width: kScreenWidth-26, marginHorizontal: 13, marginTop: 20, backgroundColor: '#f5f5f5', height: 50, borderRadius: 7, flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{fontSize: 13, fontWeight: '500', color: '#777', marginLeft: 16, marginRight: 5}}>姓名：</Text>
          <Text style={{fontSize: 13, fontWeight: 'bold', color: '#777'}}>{realName}</Text>          
        </View>
        <View style={{width: kScreenWidth-26, marginHorizontal: 13, marginTop: 14, backgroundColor: '#f5f5f5', height: 50, borderRadius: 7, flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{fontSize: 13, fontWeight: '500', color: '#777', marginLeft: 16, marginRight: 5}}>身份证号：</Text>
          <Text style={{fontSize: 13, fontWeight: 'bold', color: '#777'}}>{idCardNo}</Text>          
        </View>
      </View>
    ) 
  }

  render() {
    const { isVerify } = this.state
    return ( 
      <View style={{flex: 1, backgroundColor: '#fafafa'}}>
        {!isVerify && <View style={{paddingHorizontal: 14, paddingVertical: 11, backgroundColor: '#faf8dc', width: kScreenWidth}}>
          <Text style={{color: '#feac4c', fontSize: 12}}>为保证您的账号安全，请完成实名认证，确认此账户是本人使用</Text>
        </View>}
        {isVerify ? this.renderShowView() : this.renderInputView()}
        {!isVerify && <View style={{paddingHorizontal: 13, flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end', paddingVertical: isIphoneX() ? 30 : 0}}>
          <YFWTouchableOpacity title='完成认证' isEnableTouch={true} callBack={this.handleConfirmRealName.bind(this)}></YFWTouchableOpacity>
        </View>}
        <YFWAlertView ref={e => this.alertView = e} content='您已实名认证成功' confirmText='我知道了' showCancel={false} onClick={this.handleAlertAction.bind(this)}></YFWAlertView>
      </View>
    )
  }
}