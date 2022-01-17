/**
 * Created by admin on 2018/7/19.
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    TextInput,
    FlatList
} from 'react-native';
import {log, logErr, logWarm} from '../Utils/YFWLog'
const width = Dimensions.get('window').width;
import {darkNomalColor,darkLightColor,darkTextColor,separatorColor} from '../Utils/YFWColor';
import {darkStatusBar, itemAddKey, mapToJson, adaptSize, kScreenWidth} from "../PublicModule/Util/YFWPublicFunction";
import YFWEmptyView from '../widget/YFWEmptyView'
import YFWListFooterComponent from '../PublicModule/Widge/YFWListFooterComponent'
import YFWRequestViewModel from '../Utils/YFWRequestViewModel';
import YFWComplaintModel from "./Model/YFWComplaintModel";
import {pushNavigation} from "../Utils/YFWJumpRouting";
import AndroidHeaderBottomLine from '../widget/AndroidHeaderBottomLine'
import { BaseStyles } from '../Utils/YFWBaseCssStyle';
export default class MyComplaint extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "我的投诉",
        headerTitleStyle: {
            color: 'white',textAlign: 'center',flex: 1, fontWeight: 'bold', fontSize:17
        },
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item,{width:40,height:40,}]}
                              onPress={()=>navigation.goBack()}>
                <Image style={{width:11,height:19,resizeMode:'stretch'}}
                       source={ require('../../img/top_back_white.png')}
                       defaultSource={require('../../img/top_back_white.png')}/>
            </TouchableOpacity>
        ),
        headerRight: <View style={{width:50}}/>,
        headerBackground: <Image source={require('../../img/Status_bar.png')} style={{width:kScreenWidth, flex:1, resizeMode:'stretch'}}/>
    });


    constructor(props) {
        super(props);
        this.state = {
            dataArray: [],
            pageIndex: 1,
            loading: false,
            showFoot: 2,
        }
    }

    componentDidMount() {
        darkStatusBar();
        this.requestMyComplaintData();

    }

    requestMyComplaintData() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.complaints.getPageData');
        paramMap.set('pageSize', 10);
        paramMap.set('pageIndex', this.state.pageIndex);
        paramMap.set('conditions', {type: '-1'});

        viewModel.TCPRequest(paramMap, (res) => {
            let showFoot = 0;
            let dataArray = YFWComplaintModel.getModelArray(res.result.dataList);
            if (dataArray.length === 0) {
                showFoot = 1;
            }
            if (this.state.pageIndex > 1) {
                dataArray = this.state.dataArray.concat(dataArray);
            }
            dataArray = itemAddKey(dataArray);
            this.setState(() => ({
                        dataArray: dataArray,
                        loading: false,
                        showFoot: showFoot
                    }
                )
            )
        }, () => {
            this.setState({
                loading: false
            })
        }, this.state.pageIndex == 1 ? true : false);
    }

    _splitView() {
        return (
            <View style={{backgroundColor:'#F5F5F5',width:width}} height={0}/>
        );
    }

    clickItem(item) {

        let {navigate} = this.props.navigation;

        let grade = this.state.dataArray[item.index];
        let order_no = grade.order_no;

        pushNavigation(navigate,{type:'get_complain_detail',value:order_no});
    }

    _onEndReached(){

        if(this.state.showFoot != 0 ){
            return ;
        }
        this.state.pageIndex ++;
        this.setState({
            showFoot:2
        });
        this.requestMyComplaintData();

    }
    _renderFooter(){

        return <YFWListFooterComponent showFoot={this.state.showFoot}/>

    }


    _renderItem = (item)=> {
        //0待处理 1已处理 2已撤销 3商家已处理
        let statusColor = this.state.dataArray[item.index].status == 0?'rgb(254,172,76)':this.state.dataArray[item.index].status == 1?'rgb(31,219,155)':this.state.dataArray[item.index].status == 3?'rgb(31,219,155)':'rgb(204,204,204)'
        return (
            <TouchableOpacity activeOpacity={1} onPress={this.clickItem.bind(this,item)}>
                <View style={{backgroundColor:'white',marginLeft:adaptSize(13),width:kScreenWidth-adaptSize(26),marginTop:adaptSize(17),paddingBottom:adaptSize(19),borderRadius:10,shadowOffset:{width: 0,height:5},shadowColor:'black',shadowOpacity:0.2,elevation:10}}>
                    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:adaptSize(19),marginHorizontal:adaptSize(21)}}>
                        <Text style={{fontSize:13,color:'rgb(153,153,153)'}}>订单:
                            <Text style={{fontSize:13,color:'rgb(51,51,51)'}}> {this.state.dataArray[item.index].order_no}</Text>
                        </Text>
                        <Text style={{color:statusColor,fontSize:13}}>{this.state.dataArray[item.index].status_name}</Text>
                    </View>
                    <Text style={{fontSize:13,color:'rgb(153,153,153)',marginTop:adaptSize(19),marginHorizontal:adaptSize(21)}}>投诉:
                        <Text style={{fontSize:13,color:'rgb(51,51,51)'}}> {this.state.dataArray[item.index].title}</Text>
                    </Text>
                    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:adaptSize(10),marginHorizontal:adaptSize(21)}}>
                        <View style={{flexDirection:'row',flex:1}}>
                            <Text style={{fontSize:13,color:'rgb(153,153,153)'}}>内容:</Text>
                            <Text numberOfLines={1} style={{fontSize:13,color:'rgb(51,51,51)',flex:1}}> {this.state.dataArray[item.index].content}</Text>
                        </View>
                        <Image style={{width:adaptSize(8),height:adaptSize(14),resizeMode:'contain',marginLeft:10}} source={ require('../../img/uc_next.png')}></Image>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };


    render() {
        return (
            <View style={styles.container}>
                <AndroidHeaderBottomLine/>
                {this.reanderContent()}
            </View>
        )
    }

    reanderContent() {
        if (this.state.dataArray.length == 0) {
            return (
                <YFWEmptyView image = {require('../../img/ic_no_rate.png')} title={'暂无投诉'}/>
            )
        } else {
            return (
                <View style={styles.container}>
                    <FlatList style={{width:width,backgroundColor:'#F5F5F5'}}
                              ItemSeparatorComponent={this._splitView}
                              renderItem={this._renderItem}
                              showsVerticalScrollIndicator={false}
                              keyExtractor={(item, index) => item.order_no}
                              data={this.state.dataArray}
                              listKey={(item, index) => item.order_no}
                              ListFooterComponent={this._renderFooter.bind(this)}
                              onEndReached={this._onEndReached.bind(this)}
                              onEndReachedThreshold={0.1}
                              refreshing={this.state.loading}
                              onRefresh={this.onRefresh}
                    >

                    </FlatList>
                </View>
            )
        }
    }

    onRefresh = () => {
        this.setState({
            loading: true
        });
        this.requestMyComplaintData();
    }


}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white'
    }, spiltView: {
        width: width,
        height: 10,
        backgroundColor: 'rgba(178,178,178,0.2)',

    }
})