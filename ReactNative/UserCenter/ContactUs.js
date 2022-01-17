/**
 * Created by 12345 on 2018/4/23.
 */
import React, {Component} from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    Text,
    Image,
    TouchableOpacity
} from 'react-native';
const width = Dimensions.get('window').width;
import {pushNavigation} from "../Utils/YFWJumpRouting";
import {getItem, setItem, kAccountKey} from '../Utils/YFWStorage'
import YFWToast from '../Utils/YFWToast'
import YFWNativeManager from "../Utils/YFWNativeManager";
import AndroidHeaderBottomLine from '../widget/AndroidHeaderBottomLine'
import {BaseURL, darkStatusBar, isIphoneX, yfw_domain} from "../PublicModule/Util/YFWPublicFunction";
const styles = StyleSheet.create({
    spiltView: {
        width: width,
        height: 10,
        backgroundColor: 'rgba(178,178,178,0.2)'
    },
    orderAndTips: {
        width: width,
        backgroundColor: "white"
    },
    TextStyle: {
        color: 'black',
        fontSize: 15,
        margin: 10
    }, innerImag: {
        width: 25,
        height: 25,
        resizeMode: 'cover',
        marginTop: 10,
        alignSelf: 'center'
    }, imgScroll: {
        width: '100%',
        height: 70,
        flexDirection: 'row'
    },
    TipsTextStyle: {
        color: 'black',
        fontSize: 15,
        marginLeft: 10,
        marginTop: 15,
        marginBottom: 15
    },
    TipsRightTextStyle: {
        color: 'black',
        fontSize: 15,
        marginRight: 10,
        marginTop: 15,
        marginBottom: 15
    }
});
export default class ContactUs extends React.Component {

    constructor(props) {
        super(props);
        darkStatusBar();
    }

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "联系我们",
        headerRight:<View style={{width:50}}/>,
    });

    render() {
        return (
            <View style={{flex:1}}>
                <AndroidHeaderBottomLine/>
                <TouchableOpacity onPress={()=>this.onLineCustomServiceClick()}>
                    <View style={{backgroundColor:'white',flexDirection:'row',alignItems:'center',padding:15,height:105}}>
                        <Image style={{width:65,height:65,resizeMode:'contain'}} source={ require('../../img/xx_khfw.png')}/>
                        <Text style={{fontSize:15,color:'black',marginLeft:20}}>在线客服</Text>
                        <View style={{flex:1}}/>
                        <Image source={ require('../../img/uc_next.png')} style={{width:10,height:12,alignSelf:'center',marginRight:10}}/>
                    </View>
                </TouchableOpacity>
                <View style={{flex:1}}/>
                <View style={{flexDirection:'row',alignItems:'center',marginBottom:isIphoneX() ? 50 : 20}}>
                    <View style={{flex:1}}/>
                    <View>
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            <Image style={{width:20,height:20,resizeMode:'contain'}} source={require('../../img/icon_phone.png')}/>
                            <Text style={{fontSize:14,color:"#666666",marginLeft:10}}>400-8810-120</Text>
                        </View>
                        <View style={{flexDirection:'row',alignItems:'center',marginTop:10}}>
                            <Image style={{width:20,height:20,resizeMode:'contain'}} source={require('../../img/icon_emial.png')}/>
                            <Text style={{fontSize:14,color:"#666666",marginLeft:10}}>service@{yfw_domain()}</Text>
                        </View>
                        <View style={{flexDirection:'row',alignItems:'center',marginTop:10}}>
                            <Image style={{width:20,height:20,resizeMode:'contain'}} source={require('../../img/icon_intellectual.png')}/>
                            <Text style={{fontSize:14,color:"#666666",marginLeft:10}}>IPrights@{yfw_domain()}</Text>
                        </View>
                    </View>
                    <View style={{flex:1}}/>
                </View>
            </View>
        );
    }

    onLineCustomServiceClick() {
        getItem(kAccountKey).then((id)=> {
            if (id) {
                YFWNativeManager.mobClick('account-about us');
                YFWNativeManager.openZCSobot();
            } else {
                this.props.navigation.navigate('YFWLogin');
            }
        });
    }
}