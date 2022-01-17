import React from 'react'
import {
  View,
  Modal, Dimensions, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback
} from 'react-native'
import {isEmpty, isNotEmpty, kStyleWholesale, safeObj} from "../Util/YFWPublicFunction";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";

/**
 * 提示弹窗组件
 */

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
export default class BaseTipsDialog extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
        visible: false,
        themeColor:this.props.from===kStyleWholesale?"#547cff":"#16c08e"
    }
  }

  render() {
    if (this.bean == null) {
      return <View />
    }
    return (
      <Modal
        transparent = {true}
        visible = {this.state.visible}
        onRequestClose = {() => {
          if(this.state.isTouchCancel){
            this._cancel()
          }
        }}
      >
        <TouchableOpacity activeOpacity={1} onPress = {() => {
            if(this.state.isTouchCancel){
                this._cancel()
            }
        }}>
          <View style = {{
            width: width,
            height: height,
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            justifyContent: "center",
          }}>

            <TouchableWithoutFeedback activeOpacity={1} onPress = {() => {
              return
            }}>
              <View
                style = {{
                  width: width - 80,
                  marginLeft: 40,
                  marginRight: 40,
                  height: 140,
                  borderRadius: 4,
                  backgroundColor: "#fff",
                }}
              >
                <View style = {{
                  paddingTop: 10,
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingBottom: 10,
                  justifyContent: 'center',
                  flex: 1
                }}>
                  <Text style = {{
                    color: "#333333",
                    fontSize: 14,
                    textAlign: 'center'
                  }}>{this.bean.title}</Text>

                </View>


                <View style = {{
                  height: 1,
                  backgroundColor: "#f5f5f5"
                }} />

                <View style = {{
                  height: 40, flexDirection: 'row'
                }}>
                  {this.buildLeftButton()}
                  <View style = {{width: 1, height: 40, backgroundColor: "#f5f5f5"}} />
                  {this.buildRigthButton()}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableOpacity>
      </Modal>
    )
  }

  /**
    bean : {
     title : "标题"
     leftText : "左边按钮文本"
     rightText : "右边按钮文本"
     leftTextColor : "#999999"
     rightTextColor : "#16c08e"
     leftClick :
     rightClick :
    }
   * @param bean
   * @private
   */
  _show(bean) {
    this.bean = bean
    this.setState({
      visible: true,
      title: isNotEmpty(this.bean.title) ? this.bean.title : "",
      leftTextColor: isNotEmpty(this.bean.leftTextColor) ? this.bean.leftTextColor : "#999",
      rightTextColor: isNotEmpty(this.bean.rightTextColor) ? this.bean.rightTextColor : this.state.themeColor,
      leftClick:this.bean.leftClick,
      rightClick: this.bean.rightClick,
      leftText : this.bean.leftText,
      rightText: this.bean.rightText,
      isTouchCancel:safeObj(this.bean).isTouchCancel === false ? false : true
    })
  }

  _cancel() {
    this.setState({
      visible: false,
      title: "",
      leftText: "",
      rightText: "",
      leftTextColor: "#999",
      rightTextColor: this.state.themeColor,
    })
  }

  buildLeftButton() {
    if(isNotEmpty(this.state.leftText)){
      return (
          <TouchableOpacity activeOpacity={1}
          onPress = {() => {this._cancel();if(this.bean.leftClick){this.bean.leftClick()}}}
          style = {[BaseStyles.centerItem,{flex: 1, height: 40}]}
          >
            <Text style = {{textAlign: 'center', color: this.state.leftTextColor}}>{this.state.leftText}</Text>
          </TouchableOpacity>
      )
    }
  }

  buildRigthButton() {
    if(isNotEmpty(this.state.rightText)){
      return (
          <TouchableOpacity activeOpacity={1}
              onPress = {() => {this._cancel();if(this.bean.rightClick){this.bean.rightClick()}}}
              style = {[BaseStyles.centerItem,{flex: 1, height: 40}]}
          >
              <Text style = {{textAlign: 'center', color: this.state.rightTextColor}}>{this.state.rightText}</Text>
          </TouchableOpacity>

      )
    }
  }
}