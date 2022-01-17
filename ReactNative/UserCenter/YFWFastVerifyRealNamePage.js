import React, { Component } from 'react'
import { View, Text, Image, FlatList, TouchableOpacity, Platform, NativeModules, TextInput, DeviceEventEmitter } from 'react-native'
import { kScreenWidth, kScreenHeight, isIphoneX, safe, isNotEmpty, secretIDCard, safeObj } from '../PublicModule/Util/YFWPublicFunction'
import { pushNavigation } from '../Utils/YFWJumpRouting'
import YFWTouchableOpacity from '../widget/YFWTouchableOpacity'
import { NEWNAME, IDENTITY_CODE, IDENTITY_VERIFY } from '../PublicModule/Util/RuleString'
import YFWAlertView from '../widget/YFWAlertView'
import YFWToast from '../Utils/YFWToast'
import YFWRequestViewModel from '../Utils/YFWRequestViewModel'
const { StatusBarManager } = NativeModules

export default class YFWFastVerifyRealNamePage extends Component {
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
    headerRight: <TouchableOpacity style={{width:80, height: 44, justifyContent: 'center', alignItems: 'center'}} onPress={
                    ()=> { pushNavigation(navigation.navigate, { type:'verify_real_name', from: 'SelectPatient', isRealName: false, realName: '', idCardNo: '', goBackKey: navigation.state.key }) }
                  }>
                    <Text style={{fontSize: 14, color: "#1fdb9b"}}>本人认证</Text>
                  </TouchableOpacity>,
    headerBackground: <View></View>,
  });

  constructor(props) {
    super(...arguments)

    const from = this.props.navigation.state.params.state.from || 'UserInfo'
    const dataSource = this.props.navigation.state.params.state.patients || []

    this.state = {  
      from: from,
      dataSource: dataSource,
      selectIndex: -1
    }
  }

  handleAlertAction () {
    this.alertView && this.alertView.dismiss()
    this.props.navigation.goBack()
  }

  handleSelectPatient (index) {
    if (index != this.state.selectIndex) {
      this.setState({ selectIndex: index })
    }
  }

  handleConfirmRealName () {
    const { selectIndex } = this.state
    if (selectIndex == -1) {
      YFWToast('请选择实名信息');
      return
    }
    const { dataSource } = this.state
    const patient = dataSource[selectIndex];
  
    let paramMap = new Map();
    let viewModel = new YFWRequestViewModel();
    const realName = safe(patient.real_name)
    const idCardNo = safe(patient.idcard_no)
    paramMap.set('__cmd', 'person.account.verified');
    paramMap.set('real_name', realName);
    paramMap.set('idcard_no', idCardNo);
    paramMap.set('type', 1);
    viewModel.TCPRequest(paramMap, (res) => {
      if (isNotEmpty(res) && res.result) {
        this.alertView && this.alertView.show()
        DeviceEventEmitter.emit('VERIFY_REALNAME_SUCCESS', {realName: realName, idCardNo: idCardNo})
      }
    }, error => {
      if (isNotEmpty(error) && isNotEmpty(error.msg)) {
        YFWToast(error.msg)
      }
    });
  }

  renderPatientItem (patientItem) {
    const { item } = patientItem
    const { index } = patientItem
    const { selectIndex } = this.state
    const active = index == selectIndex
    const icon = active ? require('../../img/icon_check_active.png') : require('../../img/icon_check_normal.png')
    return (
      <TouchableOpacity onPress={this.handleSelectPatient.bind(this, index)} activeOpacity={1} style={{width: kScreenWidth-26, marginLeft: 13, marginTop: 10, height: 50, backgroundColor: '#ffffff', alignItems: 'center', flexDirection: 'row'}}>
        <Image source={icon} style={{width: 26, height: 26, marginHorizontal: 15, marginTop: 2}} />
        <Text style={{fontWeight: '500', color: "#333", marginRight: 15}}>{safe(item.real_name)}</Text>
        <Text style={{fontSize: 13, color: "#999999", marginRight: 15}}>{safeObj(item.dict_sex)==1 ? "男" : "女"}</Text>
        <Text style={{fontSize: 13, color: "#999999"}}>{secretIDCard(safe(item.idcard_no))}</Text>
      </TouchableOpacity>
    )
  }

  render() {
    const { dataSource } = this.state
    return ( 
      <View style={{flex: 1, backgroundColor: '#fafafa'}}>
        <View style={{paddingHorizontal: 14, paddingVertical: 11, backgroundColor: '#faf8dc', width: kScreenWidth, marginBottom: 10}}>
          <Text style={{color: '#feac4c', fontSize: 12}}>如下是已实名的用药人，可直接选择认证，一旦完成则不可更改</Text>
        </View>
        <FlatList
          data={dataSource}
          extraData={this.state}
          renderItem={this.renderPatientItem.bind(this)}
          keyExtractor={(item, index) => index.toString()}
        />
        <View style={{paddingHorizontal: 13, flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end', paddingVertical: isIphoneX() ? 30 : 0}}>
          <YFWTouchableOpacity title='完成认证' isEnableTouch={true} callBack={this.handleConfirmRealName.bind(this)}></YFWTouchableOpacity>
        </View>
        <YFWAlertView ref={e => this.alertView = e} content='您已实名认证成功' confirmText='我知道了' showCancel={false} onClick={this.handleAlertAction.bind(this)}></YFWAlertView>
      </View>
    )
  }
}