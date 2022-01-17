import React, {Component} from 'react';
import {
    Platform,
    View,
    ScrollView,
    Image,
    Text,
    TouchableOpacity,
    NativeModules,
    Dimensions,
    StyleSheet
} from 'react-native';
import {
    itemAddKey,
    isEmpty,
    kScreenWidth,
    isNotEmpty,
    safeObj, darkStatusBar, imageJoinURL, dismissKeyboard_yfw, kScreenHeight,iphoneTopMargin,iphoneBottomMargin,adaptSize
} from "../../../PublicModule/Util/YFWPublicFunction";
const {StatusBarManager} = NativeModules;
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
import {yfwLightGreenColor, backGroundColor, darkTextColor, darkLightColor, separatorColor} from '../../../Utils/YFWColor'
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import YFWRequestViewModel from "../../../Utils/YFWRequestViewModel";
import {pushNavigation} from "../../../Utils/YFWJumpRouting";
import YFWHealthAskQuestionItemView from '../View/YFWHealthAskQuestionItemView'
import YFWHealthAskIndexModel from '../Model/YFWHealthAskIndexModel'
import {mobClick} from '../../../PublicModule/Util/YFWPublicFunction'
import AndroidHeaderBottomLine from "../../../widget/AndroidHeaderBottomLine";
import SerchHeader from '../../../PublicModule/Widge/SerchHeader'
import YFWScrollableTabBar from "../../../PublicModule/Widge/YFWScrollableTabBar"
import ScrollableTabView, {ScrollableTabBar,DefaultTabBar} from 'react-native-scrollable-tab-view';
import YFWHealthAskAllDepartmentController from './YFWHealthAskAllDepartmentController'
export default class YFWHealthAskHomeController extends Component {

    static navigationOptions = ({navigation}) => ({
        headerTitle: (
            <TouchableOpacity activeOpacity={1} onPress={()=>{
                const {navigate} = navigation;
                pushNavigation(navigate, {type: 'get_ASK_Search'});
            }} style={{marginLeft:Platform.OS == "ios"?40:-20,height:32,flexDirection:'row',alignItems:'center'}}>
                <View style={{width:kScreenWidth-99,height:32,backgroundColor:'white',borderRadius:16,flexDirection:'row',alignItems:'center'}}>
                    <Image style={{width:14,height:14,resizeMode:'contain',marginLeft:13}} source={require('../../../../img/top_bar_search.png')}></Image>
                    <Text style={{marginLeft:9,fontSize: 13,color: "#cccccc"}}>请输入疾病或症状</Text>
                </View>
                <View style={{width:59,height:34,justifyContent:'center',alignItems:'center'}}>
                    <Text style={{fontSize: 14,color: "#ffffff"}}>搜索</Text>
                </View>
            </TouchableOpacity>
        ),
        headerRight: null,
        tabBarVisible: false,
        translucent: false,
        headerStyle: Platform.OS == 'android' ? {
            elevation: 0,
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : {borderBottomWidth: 0},
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item,{width:40,height:40,marginRight:0}]}
                              onPress={()=>{
                                dismissKeyboard_yfw();
                                navigation.goBack()
                              }}>
                <Image style={{width:10,height:16,resizeMode:'stretch'}}
                       source={ require('../../../../img/top_back_white.png')}
                       defaultSource={require('../../../../img/top_back_white.png')}/>
            </TouchableOpacity>
        ),
        headerBackground: <Image source={require('../../../../img/Status_bar.png')} style={{width:width, flex:1, resizeMode:'stretch'}}/>,
    });

    constructor(props, context) {

        super(props, context);

        this.state = {
            dataInfo: {},
            initialPage:0
        }
    }

    componentDidMount() {
        darkStatusBar();
        mobClick('health')
        this.requestData_Tcp()
    }

    //@ Action


    //点击热搜
    _clickHotItemMethod(badge) {

        const {navigate} = this.props.navigation;
        pushNavigation(navigate, {type: 'get_ASK_all_category', categoryid: badge.dep_id, title: badge.dep_name,py_name:badge.py_name,parent_py:badge.parent_py?badge.parent_py:badge.py_name});
        mobClick('health-search-hot')
    }

    //点击搜索
    _clickSearchMethod() {

        const {navigate} = this.props.navigation;
        pushNavigation(navigate, {type: 'get_ASK_Search'});

        mobClick('health-search')
    }

    //点击全部科室
    _clickAllDepartmentMethod() {
        const {navigate} = this.props.navigation;
        pushNavigation(navigate, {type: 'get_ASK_all_department'});
        mobClick('health-section')
    }

    //点击提问
    _clickAskQuestionMethod() {

        let {navigate} = this.props.navigation;
        pushNavigation(navigate, {type: 'get_submit_ASK'});

        mobClick('health-question')
    }

    //点击我的问答
    _clickMyAskMethod() {
        const {navigate} = this.props.navigation;
        pushNavigation(navigate, {type: 'get_myASK'});
        mobClick('health-answer')
    }

    //点击图片广告
    _clickImageAdsMethod(badge) {
        const {navigate} = this.props.navigation;
        pushNavigation(navigate, badge);
    }

    //点击最新问题
    _clickNewQuestionMethod() {

        const {navigate} = this.props.navigation;
        pushNavigation(navigate, {type: 'get_ASK_all_question'});

        mobClick('health-new question')
    }

    //@Request

    requestData_Tcp() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.ask.getCount');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            let solve_ask_count = res.result;
            let paramMap = new Map();
            paramMap.set('__cmd', 'guest.ask.getIndex_APP');
            paramMap.set('get_reply', '1');
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap, (res)=> {
                let dataArray = YFWHealthAskIndexModel.getModelArray(res.result,solve_ask_count);
                this.setState({
                    dataInfo: dataArray,
                });

            });
        },()=>{},false);
    }


    //@ View

    render() {
        let headerH = (Platform.OS === 'ios') ? (24 + iphoneTopMargin()) : Platform.Version > 19 ? StatusBarManager.HEIGHT + 50 : 50;
        let headerB= (Platform.OS === 'ios') ? (58 + iphoneBottomMargin()) :58;
        return (
            <View style={{flex:1}}>
                <AndroidHeaderBottomLine/>
                <ScrollableTabView
                    style={styles.pagerView}
                    initialPage={this.state.initialPage}
                    tabBarBackgroundColor='#FFFFFF'
                    tabBarActiveTextColor='#16c08e'
                    renderTabBar={() => <YFWScrollableTabBar tabNames={['最新','热门','科室']} width={width/3} />}
                >
                    <View tabLabel='最新'>
                        {this._renderHeaderView()}
                        <View style={{width:kScreenWidth,height:10,backgroundColor:'#f8f8f9'}}></View>
                        <ScrollView style={{width:kScreenWidth,marginBottom:90+headerB}}>
                            {this._renderNewQuetionItemView()}
                        </ScrollView>
                    </View>
                    <View tabLabel='热门'>
                        {this._renderHeaderView()}
                        <View style={{width:kScreenWidth,height:10,backgroundColor:'#f8f8f9'}}></View>
                        <ScrollView style={{width:kScreenWidth,marginBottom:90+headerB}}>
                            {this._renderHotQuetionItemView()}
                        </ScrollView>

                    </View>
                    <View tabLabel='科室'>
                        {this._renderHeaderView()}
                        <View style={{width:kScreenWidth,height:10,backgroundColor:'#f8f8f9'}}></View>

                        <View style={{width:kScreenWidth,marginBottom:90+headerB+30}}>
                            <YFWHealthAskAllDepartmentController  navigation={this.props.navigation}/>
                        </View>

                    </View>

                </ScrollableTabView>
                {this._renderBottomView()}
                {/* <ScrollView style={{flex:1,backgroundColor:backGroundColor()}}>
                    {this._renderHeaderView()}
                    {this._renderAskQuesionView()}
                    {this._renderAdsItems()}
                    {this._renderNewQuetionItemView()}
                    {this._renderHotQuetionItemView()}
                </ScrollView> */}
            </View>
        );

    }
    _renderBottomView() {
        return(
        <View style={{ position:'absolute',bottom:iphoneBottomMargin(),height: 58, backgroundColor: 'white', width: kScreenWidth }}>
            <View style={{ backgroundColor: '#f8f8f9', width: kScreenWidth, height: 1 }} />
            <View style={{ width: kScreenWidth, height: 57, flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity activeOpacity={1} style={{ alignItems: "center", flex: 1 }} onPress={() => this._clickMyAskMethod()} >
                    <Image style={{ width: 20, height: 20 }} source={require('../../../../img/msg_cq.png')}></Image>
                    <Text style={{ fontSize: 12, color: "#333333", marginTop: 3 }}>问答</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}></View>
                <TouchableOpacity activeOpacity={1} style={{ alignItems: "center", flex: 1, justifyContent: "center" }} onPress={() => this._clickMyMethod()}>
                    <Image style={{ width: 20, height: 23 }} source={require('../../../../img/mine_cq.png')}></Image>
                    <Text style={{ fontSize: 12, color: "#333333", marginTop: 3 }}>我的</Text>
                </TouchableOpacity>
            </View>
        </View>
        )
    }
    //点击问答
    _clickMyAskMethod() {
        this.setState({
            initialPage:0
        })
    }
    //点击我的
    _clickMyMethod() {
        const { navigate } = this.props.navigation;
        pushNavigation(navigate, { type: 'get_myASK' });
    }
    _renderHeaderView() {

        if (isNotEmpty(this.state.dataInfo.last_ask)) {
            let last_ask = this.state.dataInfo.last_ask[0]
            return(
                <TouchableOpacity onPress={()=>this._clickAskQuestionMethod()} style={{width:kScreenWidth,height:80,flexDirection:"row",justifyContent:'space-between'}}>
                    <View  style={{flexDirection:'column',justifyContent:'space-between'}}>
                        <Text style={{fontSize:16,color:'#333333',marginLeft:23,marginTop:5,fontWeight:'600'}}>我的问答</Text>
                        <View style={{marginBottom:11,flexDirection:"row",alignItems:'center',marginLeft:23}}>
                            <Image style={{width:30,height:30,borderRadius:15,backgroundColor:'#f8f8f9'}} source={{uri:last_ask.intro_image}}/>
                            <Text style={{fontSize: 12,color: "#999999",marginLeft:10}}>{last_ask.name}  {last_ask.reply_time}回答了问题</Text>
                        </View>
                    </View>
                    <Image style={{position:'absolute',width:adaptSize(90),height:40,right:6,top:18,resizeMode:'contain'}} source={require('../../../../img/my_ask.png')}/>
                </TouchableOpacity>
            )
        }
    }


    // //头部视图
    // _renderHeaderView() {

    //     return (
    //         <View style={{width:kScreenWidth,height:230,backgroundColor:'white'}}>
    //             <TouchableOpacity activeOpacity={1} style={{marginLeft:16,marginTop:15,marginRight:16,height:35}}
    //                               onPress={()=>this._clickSearchMethod()}>
    //                 <View
    //                     style={[BaseStyles.borderView,BaseStyles.leftCenterView,{flex:1,overflow:'hidden',borderRadius:5}]}>
    //                     <Image style={{width:14,height:14,resizeMode:'contain',marginLeft:10}}
    //                            source={ require('../../../../img/top_bar_search.png')}/>
    //                     <View style={[BaseStyles.leftCenterView,{marginLeft:10,flex:1}]}>
    //                         <Text style={[BaseStyles.contentWordStyle,{color:'#999999',marginLeft:7}]}>请输入疾病或症状</Text>
    //                     </View>
    //                     <View style={[BaseStyles.centerItem,{backgroundColor:yfwLightGreenColor(),height:35,width:80}]}>
    //                         <Text style={{fontSize:13,color:'white'}}>搜索</Text>
    //                     </View>
    //                 </View>
    //             </TouchableOpacity>
    //             <View style={[BaseStyles.leftCenterView,{height:30,width:kScreenWidth,marginTop:15}]}>
    //                 <Text style={{marginLeft:16,flex:1,fontSize:12,color:darkTextColor()}}>热搜</Text>
    //             </View>
    //             <ScrollView style={{width:kScreenWidth,flex:1}}>
    //                 {this._renderHotView()}
    //             </ScrollView>
    //             <TouchableOpacity activeOpacity={1}
    //                 style={[BaseStyles.leftCenterView,BaseStyles.centerItem,{marginBottom:0,width:kScreenWidth,height:50}]}
    //                 onPress={()=>this._clickAllDepartmentMethod()}>
    //                 <Text style={[BaseStyles.contentWordStyle,{fontSize:14,color:'#686868'}]}>全部科室</Text>
    //                 <Image style={{width: 7, height: 12, marginLeft: 5}}
    //                        source={require('../../../../img/around_detail_icon.png')}/>
    //             </TouchableOpacity>
    //         </View>
    //     );

    // }

    _renderHotView() {

        if (isNotEmpty(this.state.dataInfo.hot_seach_items)) {
            return (
                <View >
                    <View style={{flexDirection:'row', flexWrap:'wrap',marginLeft:8,width:kScreenWidth-24}}>
                        {this._renderHotItem()}
                    </View>
                </View>
            );
        }

    }

    _renderHotItem() {

        var allBadge = [];
        let hotArray = this.state.dataInfo.hot_seach_items;

        for (var i = 0; i < hotArray.length; i++) {

            let badge = hotArray[i];
            allBadge.push(
                <TouchableOpacity activeOpacity={1} key={'history'+i} style={{marginLeft:8,marginTop:8}}
                                  onPress={()=>this._clickHotItemMethod(badge)}>
                    <View style={[BaseStyles.centerItem,{height:33,borderWidth:0.5,borderRadius:5,borderColor:'rgb(210,210,210)'}]}>
                        <Text
                            style={[BaseStyles.contentWordStyle,{color:'rgb(102,102,102)',marginLeft:10,marginRight:10,marginTop:7,marginBottom:7}]}>
                            {badge.dep_name}
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        }

        return allBadge;

    }


    //提问视图
    _renderAskQuesionView() {

        return (
            <View style={{width:kScreenWidth,height:100,backgroundColor:'white',marginTop:10}}>
                <TouchableOpacity  activeOpacity={1} style={{marginLeft:16,marginTop:10,marginRight:16,height:40}}
                                  onPress={()=>this._clickAskQuestionMethod()}>
                    <View style={[BaseStyles.centerItem,{flex:1,borderRadius:5,backgroundColor:yfwLightGreenColor()}]}>
                        <Text style={{fontSize:15,fontWeight:'bold',color:'white'}}>我要提问</Text>
                    </View>
                </TouchableOpacity>
                <View style={[BaseStyles.leftCenterView ,{flex:1}]}>
                    <View style={[BaseStyles.leftCenterView,{marginLeft:16,flex:1}]}>
                        {this._renderSolveCountView()}
                    </View>
                    <TouchableOpacity activeOpacity={1} style={{marginRight:16,width:80,height:30}}
                                      onPress={()=>this._clickMyAskMethod()}>
                        <View style={[BaseStyles.centerItem,{flex:1,borderRadius:5,backgroundColor:separatorColor()}]}>
                            <Text style={{fontSize:13,color:'#686868'}}>我的问答</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );

    }

    _renderSolveCountView () {

        if (this.state.dataInfo.solve_ask_count&&isNotEmpty(this.state.dataInfo.solve_ask_count.solve_count)) {

            return (
                <Text style={[BaseStyles.contentWordStyle]}>{this.state.dataInfo.solve_ask_count.solve_count}</Text>
            );

        }
    }


    //药师图片视图
    _renderAdsItems() {

        let item = this.state.dataInfo.ads_items;
        if (isNotEmpty(item) && item.length > 0) {

            let object = safeObj(safeObj(item)[0]);
            let width = Number.parseFloat(object.img_width);
            let height = Number.parseFloat(object.img_height);

            let viewHeight = 0
            if ((width == 0 || isNaN(width)) || (height == 0 || isNaN(height)) ) {
                viewHeight = Platform.isPad ? 170 : 100;
            }else{
                viewHeight = kScreenWidth / width * height;
            }

            return (
                <View style={{width:kScreenWidth,height:viewHeight,backgroundColor:'white',marginTop:10}}>
                    <TouchableOpacity activeOpacity={1} style={{flex:1}} onPress={()=>this._clickImageAdsMethod(object)}>
                        <Image
                            style={{flex:1,resizeMode: "stretch"}}
                            source={{uri:object.img_url}}
                        />
                    </TouchableOpacity>
                </View>
            );

        }

    }

    _renderNewQuetionItemView() {

        if (isNotEmpty(this.state.dataInfo.new_ask_items)) {

            return (
                <View style={{backgroundColor:'white',marginTop:3}}>
                    {/* <TouchableOpacity activeOpacity={1} onPress={()=>this._clickNewQuestionMethod()}>
                        <View style={[BaseStyles.leftCenterView,{height:50}]}>
                            <Text style={{fontSize:14,fontWeight:'bold',color:darkTextColor(),marginLeft:16,width:kScreenWidth-40}}>最新问题</Text>
                            <Image style={{width: 10, height: 10, marginRight: 15}}
                                   source={require('../../../../img/around_detail_icon.png')}/>
                        </View>
                    </TouchableOpacity> */}
                    {this._renderAddQuestionItem(this.state.dataInfo.new_ask_items, 'newQuestion')}
                </View>
            );

        }

    }

    _renderHotQuetionItemView() {

        if (isNotEmpty(this.state.dataInfo.popular_ask_items)) {

            return (
                <View style={{backgroundColor:'white',marginTop:3}}>
                    {/* <View style={[BaseStyles.leftCenterView,{height:50}]}>
                        <Text style={{fontSize:15,fontWeight:'bold',color:darkTextColor(),marginLeft:16}}>热门问题</Text>
                    </View> */}
                    {this._renderAddQuestionItem(this.state.dataInfo.popular_ask_items, 'hotQuestion')}
                </View>
            );

        }

    }


    _renderAddQuestionItem(array, key) {

        var allBadge = [];

        let menuaArray = array;
        for (var i = 0; i < menuaArray.length; i++) {
            let badge = menuaArray[i];
            allBadge.push(
                <YFWHealthAskQuestionItemView key={key+i} Data={badge} navigation={this.props.navigation} />
            );
        }

        return allBadge;

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

