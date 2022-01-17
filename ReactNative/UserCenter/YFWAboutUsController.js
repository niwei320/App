import React, {Component} from 'react';
import {View, Text, Image, Platform, NativeModules, ImageBackground, TouchableOpacity} from 'react-native'
import {BaseStyles} from '../Utils/YFWBaseCssStyle'
import {darkStatusBar,kScreenWidth,isIphoneX} from "../PublicModule/Util/YFWPublicFunction";
import {darkNomalColor} from '../Utils/YFWColor'
const {StatusBarManager} = NativeModules;

export default class YFWAboutUsController extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "关于我们",
        headerTitleStyle: {
            color: 'white',textAlign: 'center',flex: 1
        },
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item,{width:50,height:40}]}
                            onPress={() => {navigation.goBack()}}>
                <Image style={{width:11,height:19,resizeMode:'stretch'}}
                        source={ require('../../img/top_back_white.png')}/>
            </TouchableOpacity>
        ),
        headerRight: <View style={{width:50}}/>,
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            backgroundColor:'transparent',
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : {borderBottomWidth: 0, backgroundColor:'transparent'},
        headerBackground: <Image source={require('../../img/icon_about_header.png')} style={{width:kScreenWidth, flex:1, resizeMode:'stretch'}}/>
    });

    render() {
        let date = new Date();
        let year = date.getFullYear();
        return(
            <View style={{flex:1}}>
                <Image source={require('../../img/icon_about_content.png')} style={{width:kScreenWidth, height:468/375.0*kScreenWidth, resizeMode:'stretch'}}/>
                <Image source={require('../../img/icon_about_fix.png')} style={{width:kScreenWidth, flex:1, resizeMode:'stretch'}}/>
                <ImageBackground source={require('../../img/icon_about_bottom.png')} style={{width: kScreenWidth, height:100,justifyContent:'center', alignItems:'center', paddingTop:20}} imageStyle={{resizeMode:'stretch'}}>
                    <Text style={{fontSize:13, color:darkNomalColor()}}>{'©2007-'+year+' 药房网商城版权所有'}</Text>
                    <Text style={{fontSize:13, color:darkNomalColor(), marginTop:5}}>上海伊邦医药信息科技股份有限公司</Text>
                </ImageBackground>
            </View>
        )
    }
}