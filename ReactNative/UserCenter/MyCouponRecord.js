import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, Platform, NativeModules,
} from 'react-native';
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import YFWMore from "../widget/YFWMore";
import {darkStatusBar, kScreenWidth} from "../PublicModule/Util/YFWPublicFunction";
import ScrollableTabView from "react-native-scrollable-tab-view";
import YFWScrollableTabBar from "../PublicModule/Widge/YFWScrollableTabBar";
import CouponDetail from "./CouponDetail";

export default class MyCouponRecord extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "优惠券使用记录",
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item,{width:40,height:40,}]}
                              onPress={()=>navigation.goBack()}>
                <Image style={{width:11,height:19,resizeMode:'stretch'}}
                       source={ require('../../img/top_back_white.png')}
                       defaultSource={require('../../img/top_back_white.png')}/>
            </TouchableOpacity>
        ),
        headerStyle: Platform.OS == 'android' ? {
            backgroundColor: 'white',
            elevation: 0,
            height: Platform.Version >= 19 ? 50 + NativeModules.StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? NativeModules.StatusBarManager.HEIGHT : 0
        } : {borderBottomColor: 'white',backgroundColor: 'white'},
        headerTitleStyle: {
            color: 'white',textAlign: 'center',flex: 1, fontWeight: 'bold', fontSize:17
        },
        headerRight: (
            <YFWMore/>
        ),
        headerBackground: <Image source={require('../../img/Status_bar.png')} style={{width:kScreenWidth, flex:1, resizeMode:'stretch'}}/>,
    });


    constructor(props) {
        super(props);
    }

    componentDidMount() {
        darkStatusBar();
    }


    render() {
        return (
            <View style={styles.container}>
                <ScrollableTabView
                    style={styles.pagerView}
                    initialPage={0}
                    locked={true}
                    tabBarBackgroundColor='white'
                    tabBarActiveTextColor='#16c08e'
                    renderTabBar={() => <YFWScrollableTabBar tabNames={['已使用','已过期']} width={kScreenWidth/2}/>}
                    tabBarUnderlineStyle={styles.lineStyle}
                    onChangeTab={(obj) => {
                        this._changerType(obj.i);
                    }}
                >
                    <CouponDetail tabLabel='已使用' ref="ref_detail" navigation = {this.props.navigation} type={'1'}/>
                    <CouponDetail tabLabel='已过期' ref="ref_detail" navigation = {this.props.navigation} type={'2'}/>
                </ScrollableTabView>
            </View>
        )
    }

    _changerType(i) {
        // this.refs.ref_detail._changeStatus(i)
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',

    },
    headerView: {
        flex: 1,
        backgroundColor: 'skyblue',
        justifyContent: 'center',
        alignItems: 'center'
    },
    pagerView: {
        flex: 6,
        backgroundColor: 'white',
    },
    lineStyle: {
        height: 2,
        backgroundColor: '#16c08e',
    },
    textMainStyle: {
        flex: 1,
        fontSize: 40,
        marginTop: 10,
        textAlign: 'center',
        color: 'black'
    },

    textHeaderStyle: {
        fontSize: 40,
        color: 'white'
    }
})