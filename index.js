/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import YFWHomePage from './ReactNative/YFWHomePage'

import {
  AppRegistry,
  Text, TextInput,
} from 'react-native';


const TextRender = Text.render;
Text.render = function (...args) {
  const originText = TextRender.apply(this, args);
  const { style } = originText.props;
  return React.cloneElement(originText, {
    style: [{
      ...{ fontFamily: '',},
    }, style],
  });
};
Text.defaultProps = Object.assign({}, Text.defaultProps, {allowFontScaling: false})
TextInput.defaultProps = Object.assign({}, TextInput.defaultProps, {defaultProps: false})

export default class HelloWorld extends Component {
  render() {
    return (
      <YFWHomePage/>
    );
  }
}


AppRegistry.registerComponent('HelloWorld', () => HelloWorld);
