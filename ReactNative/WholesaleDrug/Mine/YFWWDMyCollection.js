/**
 * Created by admin on 2018/6/5.
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    NativeModules, Platform,
} from 'react-native';
const {StatusBarManager} = NativeModules;
import ScrollableTabView from 'react-native-scrollable-tab-view';
import {darkStatusBar, kStyleWholesale} from "../../PublicModule/Util/YFWPublicFunction";
import YFWScrollableTabBar from "../../PublicModule/Widge/YFWScrollableTabBar"
import YFWWDCollectionGoods from "./View/YFWWDCollectionGoods";
import YFWWDCollectionStore from "./View/YFWWDCollectionStore";
import YFWHeaderLeft from "../Widget/YFWHeaderLeft";
import {YFWImageConst} from "../Images/YFWImageConst";
import YFWWDMore from '../Widget/View/YFWWDMore';
const width = Dimensions.get('window').width;
export default class YFWWDMyCollection extends Component {

    static navigationOptions = ({navigation}) => ({


        tabBarVisible: false,
        headerTitle: "我的收藏",
        headerLeft: <YFWHeaderLeft navigation={navigation}/>,
        headerStyle: Platform.OS == 'android' ? {
            backgroundColor: 'white',
            elevation: 0,
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : {borderBottomColor: 'white',backgroundColor: 'white'},
        headerTitleStyle: {
            color: 'white',textAlign: 'center',flex: 1, fontWeight: 'bold', fontSize:17
        },
        headerRight: (
            <View style={{flexDirection:'row'}}>
                <TouchableOpacity activeOpacity={1} onPress={()=>navigation.state.params.changeRightState()}>
                    <Text style={{fontSize:16,color:'#fff',marginRight:20}}>{navigation.state.params?navigation.state.params.title:''}</Text>
                </TouchableOpacity>
                <YFWWDMore/>
            </View>
        ),
        headerBackground: <Image source={YFWImageConst.Nav_header_background_blue} style={{width:width, flex:1, resizeMode:'stretch'}}/>,

    });

    constructor(props) {
        super(props);
        this.state={
            isManager:true,
        }
    }

    componentDidMount() {
        darkStatusBar();
        this.props.navigation.setParams({
            changeRightState:this.onRightTvClick,
            title:'管理',
        })
    }

    onRightTvClick = ()=>{
        let bool = !this.state.isManager;
        this.setState({
            isManager:bool
        })
        this.props.navigation.setParams({
            title: bool?'管理':'完成',
        })
    }

    render() {
        return (
            <View style={styles.container}>
                <ScrollableTabView
                    style={styles.pagerView}
                    initialPage={0}
                    tabBarBackgroundColor='#FFFFFF'
                    tabBarActiveTextColor='#16c08e'
                    tabBarUnderlineStyle={styles.lineStyle}
                    renderTabBar={() => <YFWScrollableTabBar from={kStyleWholesale} tabNames={['商品','商家']} width={width/2}/>}
                >
                    <YFWWDCollectionGoods tabLabel='商品' navigation = {this.props.navigation} isShow={!this.state.isManager}/>
                    <YFWWDCollectionStore tabLabel='商家' navigation = {this.props.navigation} isShow={!this.state.isManager}/>
                </ScrollableTabView>

            </View>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white'
    },
    headerView: {
        flex: 1,
        backgroundColor: 'skyblue',
        justifyContent: 'center',
        alignItems: 'center'
    },
    pagerView: {
        flex: 6,
        backgroundColor: 'white'
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
        color: 'white',
    }
})
