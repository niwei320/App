import React, {Component} from 'react';
import {FlatList, Image, Text, View,NativeModules,
    Dimensions,Platform,
    StyleSheet,TouchableOpacity} from 'react-native';
import {imageJoinURL, itemAddKey, kScreenWidth, tcpImage, dismissKeyboard_yfw} from "../../../PublicModule/Util/YFWPublicFunction";
import {darkTextColor, yfwGreenColor} from '../../../Utils/YFWColor'
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import YFWRequestViewModel from "../../../Utils/YFWRequestViewModel";
import YFWHealthAskQuestionItemView from '../View/YFWHealthAskQuestionItemView'
import YFWListFooterComponent from '../../../PublicModule/Widge/YFWListFooterComponent'
import YFWHealthMyAskModel from "../Model/YFWHealthMyAskModel";
import YFWEmptyView from "../../../widget/YFWEmptyView";
import AndroidHeaderBottomLine from "../../../widget/AndroidHeaderBottomLine";
const {StatusBarManager} = NativeModules;
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
import SerchHeader from '../../../PublicModule/Widge/SerchHeader'
import {pushNavigation} from "../../../Utils/YFWJumpRouting";
import YFWHomeTopView from '../../YFWHomeTopView'
export default class YFWHealthMyAskController extends Component {

    static navigationOptions = ({navigation}) => ({
        headerTitle: (
            <TouchableOpacity activeOpacity={1} onPress={()=>{
                const {navigate} = navigation;
                pushNavigation(navigate, {type: 'get_ASK_Search'});
            }} style={{width:kScreenWidth-40,marginLeft:Platform.OS == "ios"?40:-20,height:32,flexDirection:'row',alignItems:'center'}}>
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
            <TouchableOpacity style={[BaseStyles.item,{width:40,height:40,}]}
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
            dataInfo:{},
            dataArray:[],
            pageIndex:1,
            loading:false,
            showFoot:2,
            type:0,
            selectIndex:0
        }
    }

    componentDidMount(){

        this._handleData();

    }

    //@ Action


    _onRefresh(){

        this.state.pageIndex = 1;
        this.setState({
            loading:true
        });
        this._handleData();

    }

    _onEndReached(){

        if(this.state.showFoot != 0 ){
            return ;
        }
        this.state.pageIndex ++;
        this.setState({
            showFoot:2
        });
        this._handleData();

    }



    //@Request
    _handleData(){

        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.ask.getMyQuestionPageData');
        paramMap.set('type',this.state.type);
        paramMap.set('pageSize',10);
        paramMap.set('pageIndex',this.state.pageIndex);
        let type = this.state.type
        viewModel.TCPRequest(paramMap, (res)=> {
            let showFoot = 0;
            let data = YFWHealthMyAskModel.getModelArray(res.result);

            let dataArray = data.dataList
            if (dataArray.length === 0){
                showFoot = 1;
            }
            if (this.state.pageIndex > 1){
                dataArray = this.state.dataArray.concat(dataArray);
            }
            dataArray = itemAddKey(dataArray);
            this.setState({
                dataArray:dataArray,
                dataInfo:data.dataInfo,
                loading:false,
                showFoot:showFoot,
            });
        },()=>{},this.state.pageIndex==1?true:false);

    }


    //@ View

    render() {

        return(
            <View style={{flex:1}}>
                <AndroidHeaderBottomLine/>
                {this._renderBody()}
            </View>
        );

    }

    _renderBody(){
        // if (this.state.dataArray.length > 0) {
            return (
                <View style={[BaseStyles.container,{backgroundColor:'white'}]}>
                    <FlatList
                        ref={(flatList)=>this._flatList = flatList}
                        extraData={this.state}
                        data={this.state.dataArray}
                        onRefresh={() => this._onRefresh()}
                        refreshing={this.state.loading}
                        renderItem = {this._renderListItem.bind(this)}
                        ListHeaderComponent={this._renderHeaderView.bind(this)}
                        ListFooterComponent={this._renderFooter.bind(this)}
                        onEndReached={this._onEndReached.bind(this)}
                        onEndReachedThreshold={0.1}
                    />
                </View>

            )
        // } else {
        //     return (
        //         <View style={[BaseStyles.container,{backgroundColor:'white'}]}>
        //             {this._renderUsrInfoView()}
        //             {<YFWEmptyView title={'您还没有提问过问题！'}/>}
        //         </View>

        //     )
        // }
    }
    _renderListItem = (item) => {
        if (this.state.dataArray.length > 0) {
            return (
                <YFWHealthAskQuestionItemView Data={item.item} navigation={this.props.navigation} from='pharmacist_ask'/>
            );
        }else {
            return (
                <View style={[BaseStyles.container,{backgroundColor:'white'}]}>
                    {this._renderUsrInfoView()}
                    {<YFWEmptyView title={'您还没有提问过问题！'}/>}
                </View>

            )
        }

    }



    _renderHeaderView(){

        return (
            <View style={[BaseStyles.container]}>
                {this._renderUsrInfoView()}
                <View style={{backgroundColor:'white',marginTop:0,}}>
                    {/* <View style={[BaseStyles.leftCenterView,{height:33}]}>
                        <Text style={{fontSize:14,fontWeight:'bold',color:darkTextColor(),marginLeft:23,width:kScreenWidth-46}}>全部问题</Text>
                    </View> */}
                     <YFWHomeTopView Data={[{"name":"全部问题"},{"name":"已回复"},{"name":"未回复"}]} index={this.state.selectIndex} clickedIndex={(index)=>this.clickedIndex(index)} from="health_my"></YFWHomeTopView>
                </View>
                <View style={[BaseStyles.separatorStyle,{marginLeft:23,width:kScreenWidth-46}]}/>
            </View>
        );

    }
    clickedIndex(index){
      if(index==0){
       this.state.type=0
      }
      if(index==1){
        this.state.type=2
      }
      if(index==2){
        this.state.type=1
      }
        this.setState({
            dataArray:[],
            dataInfo:{},
            selectIndex:index,
            type:this.state.type,
            pageIndex:1
      })
      this._handleData();
    }
    _renderUsrInfoView(){
        return (
            <View style={[BaseStyles.leftCenterView,{width:kScreenWidth,height:120,marginBottom:10,backgroundColor:'white'}]}>
                <Image style={{width: 60, height: 60, marginLeft: 23}}
                       source={{uri:this.state.dataInfo.img_url}}/>
                <View style={{flex:1}}>
                    <View style={[BaseStyles.leftCenterView,{}]}>
                        <Text style={[BaseStyles.titleWordStyle,{marginLeft:18,fontSize:16}]}>{this.state.dataInfo.account_name}</Text>
                    </View>
                    <View style={[BaseStyles.leftCenterView,{marginTop:9}]}>
                        <Text style={[BaseStyles.contentWordStyle,{marginLeft:18,fontSize:12,color:'#999999'}]}>已提问题：</Text>
                        <Text style={[BaseStyles.contentWordStyle,{color:yfwGreenColor(),fontSize:12}]}>{this.state.dataInfo.ask_count}</Text>
                        <Text style={[BaseStyles.contentWordStyle,{fontSize:12, color:'#999999'}]}>条</Text>
                    </View>

                </View>


            </View>
        )

    }
    _renderFooter(){

        return <YFWListFooterComponent showFoot={this.state.showFoot}/>

    }



}

