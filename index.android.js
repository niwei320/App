/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import YFWHomePage from './ReactNative/YFWHomePage'
import {
  AppRegistry,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';


export default class HelloWorld extends Component {
  render() {
    return (
      <YFWHomePage/>
    );
  }
}


AppRegistry.registerComponent('HelloWorld', () => HelloWorld);
