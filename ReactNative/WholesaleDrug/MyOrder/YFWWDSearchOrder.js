import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, Platform, Keyboard, NativeModules, Dimensions,ImageBackground
} from 'react-native';
import SerchHeader from "../../PublicModule/Widge/SerchHeader";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {YFWImageConst} from "../Images/YFWImageConst";
import * as BackHandler from "react-native/Libraries/Utilities/BackHandler.android";
import YFWWDOrderList from "./View/YFWWDOrderList";
import YFWHeaderLeft from "../Widget/YFWHeaderLeft";

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
export default class YFWWDSearchOrder extends Component {

    static navigationOptions = ({navigation}) => ({
        headerTitle: <SerchHeader onSerchClick={(text)=>navigation.state.params.searchMethod(text)}
                                  placeholder="商品名称/批准文号/商家名称"
                                  tipsText="搜索"/>,
        headerRight: null,
        tabBarVisible: false,
        translucent: false,
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            height: Platform.Version >= 19 ? 50 + NativeModules.StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? NativeModules.StatusBarManager.HEIGHT : 0
        } : {borderBottomWidth: 0},
        headerLeft: <YFWHeaderLeft navigation={navigation}/>,
        headerBackground: <Image source={YFWImageConst.Nav_header_background_blue} style={{width:width, flex:1, resizeMode:'stretch'}}/>,
    });

    constructor(props) {
        super(props);
        this.state = {
            afterSearch:false
        }
    }

//----------------------------------------------LIFECYCLE-------------------------------------------

    componentWillMount() {
        this.props.navigation.setParams({searchMethod: this._searchMethod});
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

//-----------------------------------------------METHOD---------------------------------------------

    _searchMethod = (text) => {
        this.setState({
            afterSearch:true
        })
        this.list && this.list._searchOrderMethod(text)
        this.lostBlur()
    }

    lostBlur() {
        //退出软件盘
        Keyboard&&Keyboard.dismiss();
    }

//-----------------------------------------------RENDER---------------------------------------------
    renderTopRadius() {
        return (
            <ImageBackground style={{backgroundColor:'#F5F5F5',position:'absolute',top:0,width:width,height:10}}
                             source={YFWImageConst.Nav_header_background_blue}>
                <View style={{width:width,height:10,borderTopLeftRadius: 7, borderTopRightRadius: 7, backgroundColor: "#FAFAFA"}}/>
            </ImageBackground>
        )
    }
    render() {
        return (
            <View style={{flex:1}}>
                <YFWWDOrderList ref={(item)=>{this.list=item}} navigation={this.props.navigation} status={''} from={'searchOrder'}/>
                {this.renderTopRadius()}
                {this.state.afterSearch?null:<View style={{position:'absolute',top:10,width:width,height:height-50,backgroundColor:'#FAFAFA'}}/>}
            </View>
        )
    }

}