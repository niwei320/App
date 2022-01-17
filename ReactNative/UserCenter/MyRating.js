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
import {getItem, setItem, kAccountKey} from '../Utils/YFWStorage'
import YFWEmptyView from '../widget/YFWEmptyView'
import YFWListFooterComponent from '../PublicModule/Widge/YFWListFooterComponent'
import YFWRequestViewModel from '../Utils/YFWRequestViewModel';
const width = Dimensions.get('window').width;
import {darkTextColor,yfwGreenColor,darkLightColor, darkNomalColor,backGroundColor} from './../Utils/YFWColor'
import StartScore from './StartScore'
import {darkStatusBar, itemAddKey, kScreenWidth, adaptSize} from "../PublicModule/Util/YFWPublicFunction";
import MyRatingModel from "./Model/MyRatingModel";
import AndroidHeaderBottomLine from '../widget/AndroidHeaderBottomLine'
import YFWStartScore from '../widget/YFWStartScore'
import {pushNavigation} from "../Utils/YFWJumpRouting"
import { BaseStyles } from '../Utils/YFWBaseCssStyle';

export default class MyRating extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "我的评价",
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
        getItem(kAccountKey).then((id)=> {
            if (id) {
                this.requestMyRatingData();
            } else {
                this.setState(()=>({
                        //跳转登录页面
                    }
                    )
                )
            }
        });
    }

    requestMyRatingData() {
        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'person.evaluation.getPageData');
        paramMap.set('pageSize', 10);
        paramMap.set('pageIndex', this.state.pageIndex);

        viewModel.TCPRequest(paramMap, (res) => {
            let showFoot = 0;
            let dataArray = MyRatingModel.getModelArray(res.result.dataList);
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
                showFoot: showFoot,
            }));
        }, () => {
        }, this.state.pageIndex == 1 ? true : false);
    }

    _renderItem = (item)=> {
        return (
            <View activeOpacity={1}>
                <View style={{backgroundColor:'white',marginTop:adaptSize(17),marginLeft:adaptSize(13),paddingBottom:adaptSize(20),width:kScreenWidth-adaptSize(26),borderRadius:10,shadowOffset:{width: 0,height:5},shadowColor:'black',shadowOpacity:0.2,elevation:10}}>
                    <TouchableOpacity activeOpacity={1} hitSlop={{top:20,left:20,bottom:20,right:10}}  onPress={this.clickItem.bind(this,item)} style={{flexDirection:'row',marginHorizontal:adaptSize(21),marginTop:adaptSize(27),alignItems:'center',justifyContent:'space-between'}}>
                        <Text style={{ color:'rgb(153,153,153)',fontSize: 13}}>订单:
                            <Text style={{ color:'rgb(31,219,155)',fontSize: 13}}> {this.state.dataArray[item.index].order_no}</Text>
                        </Text>
                        <Image source={ require('../../img/uc_next.png')} style={{width:adaptSize(8),height:adaptSize(14),resizeMode:'contain'}}/>
                    </TouchableOpacity>
                    <View style={{flexDirection:'row',marginHorizontal:adaptSize(21),alignItems:'center',marginTop:adaptSize(9)}}>
                        <Text style={{ color:'rgb(153,153,153)',fontSize: 13}}>商家:
                            <Text style={{ color:'rgb(51,51,51)',fontSize: 13}}> {this.state.dataArray[item.index].shop_title}</Text>
                        </Text>
                    </View>
                    <View style={{marginHorizontal:adaptSize(24),marginTop:adaptSize(32),alignItems:'center'}}>
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            <Text style={{color:'rgb(51,51,51)',fontSize: 13}}>客户服务</Text>
                            <YFWStartScore style={{marginLeft:adaptSize(12),marginRight:adaptSize(32),flex:1}} starSize={13} total={5} stars={this.state.dataArray[item.index].service_star} starSpacing={adaptSize(12)}/>
                            <Text style={{color:'rgb(153,153,153)',fontSize: 13}}></Text>
                        </View>
                        <View style={{flexDirection:'row',alignItems:'center',marginTop:22}}>
                            <Text style={{color:'rgb(51,51,51)',fontSize: 13}}>发货速度</Text>
                            <YFWStartScore style={{marginLeft:adaptSize(12),marginRight:adaptSize(32),flex:1}} starSize={13} total={5} stars={this.state.dataArray[item.index].send_star} starSpacing={adaptSize(12)}/>
                            <Text style={{color:'rgb(153,153,153)',fontSize: 13}}></Text>
                        </View>
                        <View style={{flexDirection:'row',alignItems:'center',marginTop:22}}>
                            <Text style={{color:'rgb(51,51,51)',fontSize: 13}}>物流速度</Text>
                            <YFWStartScore style={{marginLeft:adaptSize(12),marginRight:adaptSize(32),flex:1}} starSize={13} total={5} stars={this.state.dataArray[item.index].logistics_star} starSpacing={adaptSize(12)}/>
                            <Text style={{color:'rgb(153,153,153)',fontSize: 13}}></Text>
                        </View>
                        <View style={{flexDirection:'row',alignItems:'center',marginTop:22}}>
                            <Text style={{color:'rgb(51,51,51)',fontSize: 13}}>商品包装</Text>
                            <YFWStartScore style={{marginLeft:adaptSize(12),marginRight:adaptSize(32),flex:1}} starSize={13} total={5} stars={this.state.dataArray[item.index].package_star} starSpacing={adaptSize(12)}/>
                            <Text style={{color:'rgb(153,153,153)',fontSize: 13}}></Text>
                        </View>
                    </View>
                    <View style={{marginHorizontal:adaptSize(21),marginTop:adaptSize(26)}}>
                        <Text style={{color:'rgb(51,51,51)',fontSize:15,marginTop:10}}>评价内容:</Text>
                        <Text style={{color:'rgb(51,51,51)',fontSize:13,marginTop:14}}>{this.state.dataArray[item.index].eval_content}</Text>
                    </View>
                    {this._renderReplyView(item.item)}
                </View>
            </View>
        );
    }

    _renderReplyView = (item)=>{
        let content = item.reply_content+'';
        if (content.length>0){
            return(
                <View style={{marginHorizontal:adaptSize(14),marginTop:9}}>
                    <Image source={ require('../../img/messageAngle.png')} style={{marginLeft:adaptSize(20),width:adaptSize(15),height:adaptSize(7),resizeMode:'contain'}}/>
                    <View style={{backgroundColor:'rgb(245,245,245)'}}>
                        <Text style={{color:'rgb(102,102,102)',fontSize:13,marginVertical:adaptSize(15),marginHorizontal:adaptSize(11)}}>[商家回复]:
                            <Text style={{fontSize:13,marginTop:10,marginLeft:10}}>{item.reply_content}</Text>
                        </Text>
                    </View>
                </View>
            );
        }
    }

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
                <YFWEmptyView image = {require('../../img/ic_no_rate.png')} title={'暂无评价'}/>
            )
        } else {
            return (
                <View style={styles.container}>
                    <FlatList style={{width:width,backgroundColor:'rgb(250,250,250)'}}
                              ItemSeparatorComponent={this._splitView}
                              renderItem={this._renderItem}
                              keyExtractor={(item, index) => item.key}
                              data={this.state.dataArray}
                              listKey={(item, index) => item.key}
                              ListFooterComponent={this._renderFooter.bind(this)}
                              onEndReached={this._onEndReached.bind(this)}
                              onEndReachedThreshold={0.1}/>
                </View>
            )
        }
    }

    _renderFooter(){

        return <YFWListFooterComponent showFoot={this.state.showFoot}/>

    }

    _splitView() {
        return (
            <View style={{width:width}} height={10}></View>
        );
    }

    clickItem(item) {
        const {navigate} = this.props.navigation;
        pushNavigation(navigate, {type: 'get_order_detail', value:this.state.dataArray[item.index].order_no});
    }

    _onEndReached(){

        if(this.state.showFoot != 0 ){
            return ;
        }
        this.state.pageIndex ++;
        this.setState({
            showFoot:2
        });
        this.requestMyRatingData();

    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#F5F5F5'
    }, spiltView: {
        width: width,
        height: 10,
        backgroundColor: 'rgba(178,178,178,0.2)',

    }
})