import React, { Component } from 'react';
import {View,Dimensions,StyleSheet,TouchableOpacity,Image,Text,ImageBackground, FlatList, DeviceEventEmitter} from 'react-native';
import ModalView from '../../widget/ModalView';
import { kScreenWidth, safe, kNavigationHeight, kStatusHeight, kScreenHeight, kStyleWholesale, safeArray, safeObj } from '../../PublicModule/Util/YFWPublicFunction';
import { BaseStyles } from '../../Utils/YFWBaseCssStyle';
import YFWNativeManager from '../../Utils/YFWNativeManager';
import YFWToast from '../../Utils/YFWToast';
import YFWWDProgressBar from '../Widget/View/YFWWDProgressBar';
import Picker from 'react-native-picker';
import LinearGradient from 'react-native-linear-gradient';
import { YFWImageConst } from '../Images/YFWImageConst';
import YFWWDAlertSheet from '../Widget/View/YFWWDAlertSheet';
import YFWWDSwitchAddressView from '../Widget/View/YFWWDSwitchAddressView';
import YFWWDBigPictureView from '../Widget/YFWWDBigPictureView';
import DatePicker from '../Widget/View/DatePicker/DatePicker';
import BaseTipsDialog from '../../PublicModule/Widge/BaseTipsDialog';
import YFWWDStatusView from '../Widget/View/YFWWDStatusView';
import { findNodeHandle,UIManager} from'react-native';
import YFWWebViewAlert from '../Widget/View/YFWWebViewAlert';
import YFWWDMore from '../Widget/View/YFWWDMore';
export const kNav_Defalut = 'nav_default'     //白色背景，黑色标题
export const kNav_Linear = 'nav_linear'         //渐变色背景，白色标题
export const kNav_Bg = 'nav_bg'         //带背景图

export const kBaseView_Big_Pic = 'big_pic'
export const kBaseView_WebView_Alert = 'webview_alert'
export const kBaseView_DatePicker_Normal = 'date_picker_normal'
export const kBaseView_DatePicker_Custom = 'date_picker_custom'
export const kBaseView_TipsDialog = 'base_tips_dialog'
export const kBaseView_StatusView = 'statusView'

export default class YFWWDBaseView extends Component{

  constructor(props) {
    super(props);
    this.xValue = 0
    this.yValue = 0
    this.self_width = 0
    this.self_height = 0
    this.bigPicView = <View/>
    this.webViewAlert = <View/>
    this.dataPicker1 = <View/>
    this.dataPicker2 = <View/>
    this.alertSheet = <View/>
    this.addressAlert = <View/>
    this.statusView  = <View/>
    this.tipsInfo = { text: '', color: '#666666', ishowCloseIcon: true, specialText: { text: '', color: '', action: 'call' } ,callback:()=>{}}      // specialText {text:'',color:''}
    this.isShowAssociationView = false
    this.associationViewArray = []
    this.associationViewBlock = () => {}
    this.associationView_width = 0
  }

  render(keys) {
    keys = safeArray(keys)
    let components = {
      'big_pic': <YFWWDBigPictureView ref={(view) => { this.bigPicView = view }} />,
      'webview_alert': <YFWWebViewAlert ref={(view) => { this.webViewAlert = view }} />,
      'date_picker_normal':<DatePicker HH={false} mm={false} ss={false} unit={['年', '月', '日']} startYear={1900} onPickerConfirm={(value) => { alert(JSON.stringify(value)) }} onPickerCancel={() => { alert('cancel') }} selectedItemValue={(item) => { let data = item }} ref={ref => this.dataPicker1 = ref} />,
      'date_picker_custom': <DatePicker HH={false} mm={false} ss={false} unit={['年', '月', '日']} startYear={1900} type={'custom'} onPickerConfirm={(value) => { alert(JSON.stringify(value)) }} onPickerCancel={() => { alert('cancel') }} selectedItemValue={(item) => { let data = item }} ref={ref => this.dataPicker2 = ref} />,
      'base_tips_dialog': <BaseTipsDialog ref={(item) => { this.tipsDialog = item }} from={kStyleWholesale} />,
      'statusView':<YFWWDStatusView father={this} ref={(item) => this.statusView = item} retry={() => this.retry()} navigation={this.props.navigation}/>
    }

    return keys.map((item) => {return components[item]})
  }

  retry() {
      this.statusView && this.statusView.dismiss()
      this.props.father.listRefresh&&this.props.father.listRefresh()
  }

  /*********************************************************************************** 方法相关**************************************************************************/
  //根View的onLayout回调函数
  _onLayout(event,view) {
    //使用大括号是为了限制let结构赋值得到的变量的作用域，因为接来下还要结构解构赋值一次
    {
      //获取根View的宽高，以及左上角的坐标值
      let {x, y, width, height} = event.nativeEvent.layout;
      this.self_width = width
      this.self_height = height
      this.xValue = x
      this.yValue = y
      // DeviceEventEmitter.emit('WDStatusView_Refresh', { width, height,x,y})
      console.log('通过onLayout得到的x：' + x);
      console.log('通过onLayout得到的y：' + y);
      console.log('通过onLayout得到的宽度：' + width);
      console.log('通过onLayout得到的高度：' + height);

    }
    if (view) {
      const handle = findNodeHandle(view);
      UIManager.measure(handle,(x,y,width,height,pageX,pageY) => {

        console.log(x,y,width,height,pageX,pageY);
        DeviceEventEmitter.emit('WDStatusView_Refresh', { width, height,x,y,pageX,pageY})

      });
    }

    //通过Dimensions API获取屏幕宽高
    let {width, height} = Dimensions.get('window');
    console.log('通过Dimensions得到的宽度：' + width);
    console.log('通过Dimensions得到的高度：' + height);
  }


  backMethod() {
    this.props.father&&this.props.father.backMethod&&this.props.father.backMethod()
  }

  updateViews() {
    this.setState({})
  }

  componentWillUnmount() {
    Picker.hide()
  }

  /*********************************************************************************** 相关公用view**************************************************************************/

/**
 *
 * @param {nav的类型} type
 * @param {标题} title
 * @param {nav类型为nav_bg的高度} height
 */
renderNavigationView(type, title ,height,Img,showMore,actionItem) {
    if (type == 'nav_bg') {
      return (
        <View style={{ height: kNavigationHeight, paddingTop: kStatusHeight, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Image style={{ height: height || 300, width: kScreenWidth, position: 'absolute', top: 0, left: 0, right: 0, resizeMode: 'stretch' }} source={Img?Img:YFWImageConst.Bg_page_header_h} />
          <TouchableOpacity onPress={() => this.backMethod()} activeOpacity={1} style={styles.backbotton_style}>
            <Image style={styles.backicon_style} source={YFWImageConst.Nav_back_white} />
          </TouchableOpacity>
          <View style={[styles.backbotton_style, { flex: 1, alignItems: 'center' }]}>
            <Text style={{ fontSize: 17, color: 'white' }}>{title}</Text>
          </View>
          {showMore ? <View style={styles.backbotton_style}>
            <YFWWDMore/>
          </View>:<TouchableOpacity style={styles.backbotton_style} />}
        </View>
      )
    } else if (type == 'nav_linear') {
      return (
        //导入LinearGradient
        <LinearGradient style={{ height: kNavigationHeight, paddingTop: kStatusHeight, flexDirection: 'row', justifyContent: 'space-between' }} colors={['rgb(82,66,255)', 'rgb(65,109,255)']} start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }} locations={[0, 1]}>
          <TouchableOpacity onPress={() => this.backMethod()} activeOpacity={1} style={styles.backbotton_style}>
            <Image style={styles.backicon_style} source={YFWImageConst.Nav_back_white} />
          </TouchableOpacity>
          <View style={{ flex: 1, height: kNavigationHeight - kStatusHeight, flexDirection: "row", justifyContent: 'center', alignItems: 'center', }}>
            <Text style={{ fontSize: 17, color: 'white' }}>{title}</Text>
          </View>
          {showMore ? <View style={styles.backbotton_style}>
            <YFWWDMore/>
            </View> :safe(safeObj(actionItem).title).length > 0 ? <TouchableOpacity style={styles.backbotton_style} onPress={()=>actionItem.action&&actionItem.action()}>
            <Text style={{ fontSize: 15, color: 'white' }}>{actionItem.title}</Text>
          </TouchableOpacity>:<TouchableOpacity style={styles.backbotton_style} />}
        </LinearGradient>
      )
    } else {
      return(
        <View style={{ height: kNavigationHeight, paddingTop: kStatusHeight, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'white' }}>
          <TouchableOpacity onPress={() => this.backMethod()} activeOpacity={1} style={styles.backbotton_style}>
          <Image style={[styles.backicon_style, {tintColor:'rgb(51,51,51)'}]} source={ YFWImageConst.Nav_back_white}/>
          </TouchableOpacity>
          <View style={{flex:1,height:kNavigationHeight-kStatusHeight,flexDirection:"row",justifyContent:'center',alignItems:'center',}}>
          <Text style={{ fontSize: 17, color: 'rgb(51,51,51)' }}>{title}</Text>
          </View>
          {showMore ? <View style={styles.backbotton_style}>
            <YFWWDMore/>
            </View> :safe(safeObj(actionItem).title).length > 0 ? <TouchableOpacity style={styles.backbotton_style} onPress={()=>actionItem.action&&actionItem.action()}>
            <Text style={{ fontSize: 15, color: 'white' }}>{actionItem.title}</Text>
          </TouchableOpacity>:<TouchableOpacity style={styles.backbotton_style} />}
        </View>
      )
    }
  }



  /**
   *  |▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔|
   *  |      提示       |
   *  |                 |
   *  |   文字。。。。。  |
   *  |                 |
   *  |     我知道了     |
   *  |________________|
   */
  renderTipsView() {
    return (
        <ModalView ref={(item)=>this.tipsView = item} onRequestClose={()=>{}}>
            <View style={styles.dialogView}>
                <View style={[BaseStyles.centerItem,{marginHorizontal:40,paddingHorizontal:40,backgroundColor:'white',borderRadius:8}]}>
                {this.tipsInfo.ishowCloseIcon?<TouchableOpacity style={styles.closeIcon} onPress={() => { this.dismissTips() }}>
                  <Image style={styles.closeIconImg} source={require('../../../img/returnTips_close.png')} />
                </TouchableOpacity>:null}
                    <Text style={styles.titleText}>{this.tipsInfo.titleText?this.tipsInfo.titleText:'提示'}</Text>
                    {this.rendRichText()}
                    <View style={{flexDirection:'row'}}>
                        {this.tipsInfo.cancelBtnText?
                            <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 30,marginRight:15, paddingHorizontal:20, height: 36, borderRadius: 18, borderWidth: 1, backgroundColor: 'rgb(51,105,255)' , borderColor: 'rgb(51,105,255)'}} onPress={() => { this.dismissTips(()=>{
                              this.tipsInfo.callback&&this.tipsInfo.callback('cancel');
                            });}}>
                                <Text style={{color:'#ffffff',fontSize:14}}>{this.tipsInfo.cancelBtnText?this.tipsInfo.cancelBtnText:'取消'}</Text>
                            </TouchableOpacity>
                            :<></>
                        }
                        <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 30, paddingHorizontal:20, height: 36, borderRadius: 18, borderWidth: 1, borderColor: 'rgb(51,105,255)' }} onPress={() => {this.dismissTips(
                          ()=>{
                            this.tipsInfo.callback&&this.tipsInfo.callback();
                          }
                        );}}>
                            <Text style={{color:'rgb(51,105,255)',fontSize:14}}>{this.tipsInfo.confirmBtnText?this.tipsInfo.confirmBtnText:'我知道了'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ModalView>
    )
  }

  showTips() {
    if(this.tipsView){
        if(!this.tipsView.isShow()){
            this.tipsView.show()
        }
    }
  }

  dismissTips(callBack){
      this.tipsView && this.tipsView.disMiss(()=>{callBack&&callBack()})
  }

  //富文本      仅支持两种颜色
  rendRichText() {
    if(safe(this.tipsInfo.text).length == 0) return null
    let textArray = []
    if (this.tipsInfo.specialText.text.length == '') {
      textArray = [this.tipsInfo.text]
    } else {
      textArray = [
          this.tipsInfo.text.substr(0, this.tipsInfo.text.indexOf(this.tipsInfo.specialText.text)),
          this.tipsInfo.text.substr(this.tipsInfo.text.indexOf(this.tipsInfo.specialText.text),this.tipsInfo.specialText.text.length),
          this.tipsInfo.text.substr(this.tipsInfo.text.indexOf(this.tipsInfo.specialText.text) + this.tipsInfo.specialText.text.length,this.tipsInfo.text.length),
      ]
    }
    let textInfo = []
    textArray.forEach((value) => {
      if (value == this.tipsInfo.specialText.text) {
        textInfo.push({ color: this.tipsInfo.specialText.color, text: value ,action:this.tipsInfo.specialText.action})
      } else {
        textInfo.push({ color: this.tipsInfo.color, text: value })
      }
    })
    return this.renderSimpleText(textInfo,0)
  }

  renderSimpleText(array,index) {
    if (array[index]) {
      if (array[index].action == 'call') {
        return <Text onPress={() => { YFWNativeManager.takePhone(array[index].text);YFWToast(array[index].text)}} style={[styles.contentText, { color: array[index].color }]}>{array[index].text}{this.renderSimpleText(array,index+1)}</Text>
      } else {
        return <Text style={[styles.contentText, { color: array[index].color }]}>{array[index].text}{this.renderSimpleText(array,index+1)}</Text>
      }
    }
  }


  /**
   * 进度条
   */
  renderProgressBar() {
    return <YFWWDProgressBar ref={(view) => this.progressBar = view} progress={0.3} indeterminate={true} width={200}/>
  }


  /**
   * 下方选择弹框
   * @param {数据} array
   * @param {确认回调} confirm
   * @param {取消回调} cancel
   */
  showPicker(array,confirm,cancel) {
    let pickerData = array              //['组', 'mg', 'ml', 'l', '片', '粒', '丸', '袋', '滴', '喷', '揿', 'ug', '瓶', '其他'];
    Picker.init({
      pickerData,
      pickerTextEllipsisLen:20,
      pickerFontColor: [51,51,51,1],
      pickerConfirmBtnText:'确定',
      pickerConfirmBtnColor:[39,191,143,1],
      pickerCancelBtnText:'取消',
      pickerCancelBtnColor:[102,102,102,1],
      pickerTitleText:'',
      wheelFlex: [1],
      onPickerConfirm: pickedValue => {
        confirm&&confirm(pickedValue[0])
      },
      onPickerCancel: pickedValue => {
        cancel&&cancel()
      },
    });
    Picker.show();
  }


  _showTimePicker() {
    let hours = [],minutes = [];
    for (let i = 0; i < 24; i++) {
        hours.push(i + '时');
    }
    for (let i = 0; i < 60; i++) {
        minutes.push(i + '分');
    }
    let pickerData = [hours, minutes];
    let date = new Date();
    let selectedValue = [
        date.getHours() + '时',
        date.getMinutes() + '分'
    ];
    Picker.init({
        pickerData,
        selectedValue,
        pickerConfirmBtnText: '确认',
        pickerCancelBtnText: this.state.action == 'creat' ? '取消' : '删除',
        wheelFlex: [1, 1],
        pickerFontColor: [51,51,51,1],
        pickerConfirmBtnColor:[39,191,143,1],
        pickerCancelBtnColor:[102,102,102,1],
        pickerTitleText:'',
        onPickerConfirm: pickedValue => {
            YFWNativeManager.mobClick('account-drug reminding-info-time');
            let date = pickedValue.toString().split(',');
            let hours = parseInt(date[0]) < 10 ? '0' + date[0].replace('时', '') : date[0].replace('时', '')
            let minu = parseInt(date[1]) < 10 ? '0' + date[1].replace('分', '') : date[1].replace('分', '')
            let dataItems = hours + ':' + minu
            if (this.state.action == 'creat') {
                this.state.drugTimes.push(dataItems)
                if (this.state.drugTimes.length >= 4) {
                    this.setState({
                        canAddDrugTime: false
                    })
                }
            } else {
                this.state.drugTimes.splice(this.state.updataDrugItemsIndex, 1, dataItems)
            }
            this.setState({})
        },
        onPickerCancel: pickedValue => {
            if (this.state.action == 'update') {
                this.state.drugTimes.splice(this.state.updataDrugItemsIndex, 1);
                this.setState({canAddDrugTime: true})
            }
        },
    });
    Picker.show();
  }


  /**
   * 下方弹出选择sheet
   */
  renderAlertSheet() {
    return <YFWWDAlertSheet ref={view=>this.alertSheet = view}/>
  }

  /**
   * 地址选择弹框
   */
  renderAddressAlert() {
    return <YFWWDSwitchAddressView ref={view =>this.addressAlert = view} />
  }

  /**
   * 联想下拉列表
   *
   * */
  renderAssociationView(top,width,height) {
    if (this.isShowAssociationView) {
      return (
        <TouchableOpacity activeOpacity={1} onPress={() => { this.isShowAssociationView = false; this.updateViews() }} style={{zIndex: 100, position: 'absolute', top: 0, left:0,height: kScreenHeight*2, width: this.associationView_width, alignItems: 'center'}}>
          <FlatList data={this.associationViewArray}
            bounces={false}
            style={{ width: width,maxHeight:250,position:'absolute',top:top}}
            renderItem={(item)=>this.associationViewItem(item.item,height)}
          />
        </TouchableOpacity>
      )
    } else {
      return null
    }
  }
  associationViewItem(item,height) {
    return (
      <TouchableOpacity onPress={() => {this.associationViewBlock(item) }} activeOpacity={1}
        style={{height: height,backgroundColor:'white',justifyContent:'center',paddingHorizontal:10,borderWidth:1,borderColor:'rgb(230,230,230)'}}>
        <Text style={{fontSize:13,color:'rgb(51,51,51)',borderBottomColor:'rgb(230,230,230)',borderBottomWidth:1}}>{item}</Text>
      </TouchableOpacity>
    )
  }

  /**
   * 顶部黄色提示条
   *
   * */
  renderWarningTipsBar(title) {
    return (
      <View style={{width:kScreenWidth,height:30,backgroundColor:'rgb(250,248,220)',justifyContent:'center'}}>
        <Text style={{color:'rgb(254,172,76)',fontSize:12,marginLeft:14}}>{title}</Text>
      </View>
    )
  }

  /**
   * 底部渐变按钮
   */
  renderButton(title,height,callback) {
    return (
      <View style={{ height: height, width: kScreenWidth, paddingHorizontal: 36 }}>
        <LinearGradient style={{height:42,borderRadius:21}} colors={['rgb(50,87,234)', 'rgb(51,105,255)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0, 1]}>
              <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} activeOpacity={1} onPress={() => callback&&callback()}>
            <Text style={{ fontSize: 17, color: 'white', fontWeight: 'bold' }}>{title}</Text>
              </TouchableOpacity>
          </LinearGradient>
      </View>
  )
  }


}

const scale = (kScreenWidth - 80) / 3;
const styles = StyleSheet.create({
  closeIcon: {
      position: 'absolute',
      width: 30,
      height: 30,
      alignItems: 'flex-end',
      right: scale * 0.10,
      top: scale * 0.10,
  },
  closeIconImg: {
      width: scale * 0.14,
      height: scale * 0.14,
      resizeMode: 'stretch',
  },
  dialogView: {
      alignItems:'center',
      justifyContent:'center',
      flex:1,
      backgroundColor:'rgba(0,0,0,0.5)'
  },
  titleText: {
      marginTop: scale *0.24,
      marginBottom: scale *0.38,
      fontSize: 14,
      fontWeight: 'bold',
      color: "#333333"
  },
  contentText: {
      fontSize: 12,
      color: "#666666",
      textAlign:'center'

  },
  container_style: {flex:1,backgroundColor: 'white'},
  backbotton_style: { width: 50, height: kNavigationHeight-kStatusHeight, justifyContent: 'center'},
  backicon_style: { width: 11, height: 19, marginLeft: 12, resizeMode: 'contain'},
});
