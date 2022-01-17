import React, {Component} from 'react';
import {
    Platform,
    View,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
} from 'react-native';
import {itemAddKey, isEmpty, kScreenWidth, isNotEmpty, tcpImage, imageJoinURL} from "../../../PublicModule/Util/YFWPublicFunction";
import {yfwLightGreenColor, backGroundColor, darkTextColor,darkLightColor,separatorColor} from '../../../Utils/YFWColor'
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import YFWRequestViewModel from "../../../Utils/YFWRequestViewModel";
import {pushNavigation} from "../../../Utils/YFWJumpRouting";
import YFWListFooterComponent from '../../../PublicModule/Widge/YFWListFooterComponent'
import YFWHealthAskPharmacistHomeModel from "../Model/YFWHealthAskPharmacistHomeModel";
import AndroidHeaderBottomLine from "../../../widget/AndroidHeaderBottomLine";


export default class YFWHealthAskPharmacistHomeController extends Component {

    static navigationOptions = ({navigation}) => ({

        tabBarVisible: false,
        title:'药师主页',
    });


    constructor(props, context) {

        super(props, context);

        this.state = {
            dcotorInfo:{},
            dataArray:[],
            pageIndex:1,
            loading:false,
            showFoot:2,
        }
    }

    componentDidMount(){

        this.pharmacistId = this.props.navigation.state.params.state.value;

        this._handleData();

    }

    //@ Action

    //跳转商家详情
    _clickdoctorShopMethod(){

        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'get_shop_detail',value:this.state.dcotorInfo.shop_id});

    }

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
        paramMap.set('__cmd'  , 'guest.ask.getPharmacistInfo');
        paramMap.set('pharmacistid' , this.pharmacistId);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap , (res)=>{
            let dcotorInfo = YFWHealthAskPharmacistHomeModel.getPharmacistInfo(res.result);
            let paramMap2 = new Map();
            paramMap2.set('__cmd'  , 'guest.ask.getDoctorDetailPageData');
            paramMap2.set('pageSize' , 20);
            paramMap2.set('pageIndex' , this.state.pageIndex);
            paramMap2.set('conditions' , {"pharmacistid":this.pharmacistId});
            let viewModel2 = new YFWRequestViewModel();
            viewModel2.TCPRequest(paramMap2,(res)=>{
                let showFoot = 0;
                let dataArray = YFWHealthAskPharmacistHomeModel.getPharmacistAskList(res.result.dataList);
                if (dataArray.length === 0){
                    showFoot = 1;
                }
                if (this.state.pageIndex > 1){
                    dataArray = this.state.dataArray.concat(dataArray);
                }
                dataArray = itemAddKey(dataArray);
                this.setState({
                    dataArray:dataArray,
                    dcotorInfo:dcotorInfo,
                    loading:false,
                    showFoot:showFoot,
                });
            },(error)=>{},this.state.pageIndex==1?true:false)
        },(error)=>{},false);

    }


    //@ View

    render() {

        return(
            <View style={[BaseStyles.container]}>
                <AndroidHeaderBottomLine />
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
        );

    }

    _renderListItem = (item) => {

        let iconSize = 0;
        if (item.item.status_id === '3'){
            iconSize = 15;
        }

        return (
            <View style={{backgroundColor:'white'}}>
                <View style={[BaseStyles.leftCenterView,{marginTop:10}]}>
                    <Text style={[BaseStyles.titleWordStyle,{color:'#666666',marginLeft:16,marginTop:5,marginBottom:5,width:kScreenWidth-50}]}>{item.item.title}</Text>
                    <Image style={{width:iconSize,height:iconSize,resizeMode:'contain',marginLeft:10}}
                           source={require('../../../../img/icon_yicaina.png')} />
                </View>
                <View style={{marginLeft:10,marginRight:10,backgroundColor:backGroundColor(),marginTop:5}}>
                    <Text style={[BaseStyles.contentWordStyle,{marginLeft:10,marginTop:10,marginBottom:10,marginRight:10}]}>
                        <Text style={{fontSize:12,color:yfwLightGreenColor()}}>回答：</Text>
                        {item.item.reply_content}
                    </Text>
                </View>
                <View style={[BaseStyles.rightCenterView,{height:40}]}>
                    <Text style={[BaseStyles.contentWordStyle,{fontSize:12,color:'#ACADAE',marginRight:10}]}>{item.item.CreateTime}</Text>
                </View>

                <View style={[BaseStyles.separatorStyle]}/>
            </View>
        );

    }



    _renderHeaderView(){


        let  detail = this.state.dcotorInfo;

        if (isNotEmpty(detail)){

            return(
                <View >
                    <View style={{height:90,marginTop:10,backgroundColor:'white'}}>
                        <View style={[BaseStyles.leftCenterView,{flex:1}]}>
                            <Image style={{width:50,height:50,marginLeft:10,resizeMode: "contain"}} source={{uri:imageJoinURL(detail.img_url)}}/>
                            <View style={{flex:1}}>
                                <View style={[BaseStyles.leftCenterView,{flex:1}]}>
                                    <Text style={{marginLeft:10,fontSize:12,color:yfwLightGreenColor()}}>{detail.real_name}</Text>
                                    <Text style={[BaseStyles.contentWordStyle,{marginLeft:10}]}>{detail.type}</Text>
                                    <TouchableOpacity activeOpacity={1} onPress={()=>this._clickdoctorShopMethod()}>
                                        <Text style={{fontSize:12,color:'rgb(29, 164, 198)',marginLeft:10,width:kScreenWidth-180}}>{detail.shop_name}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={[BaseStyles.separatorStyle]}/>
                                <View style={[BaseStyles.leftCenterView,{flex:1}]}>
                                    <Image style={{width:15,height:15,resizeMode:'contain',marginLeft:10}}
                                           source={ require('../../../../img/icon_yihuifu.png')}/>
                                    <Text style={[BaseStyles.contentWordStyle,{marginLeft:5}]}>已回复问题：{detail.reply_count}条</Text>
                                    <Image style={{width:15,height:15,resizeMode:'contain',marginLeft:10}}
                                           source={ require('../../../../img/icon_yicaina.png')}/>
                                    <Text style={[BaseStyles.contentWordStyle,{marginLeft:5}]}>被采纳问题：{detail.adopt_count}条</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={{height:50,marginTop:10,backgroundColor:'white'}}>
                        <View style={[BaseStyles.leftCenterView,{flex:1}]}>
                            <Text style={{fontSize:15,fontWeight:'bold',color:darkTextColor(),marginLeft:10,width:kScreenWidth-40}}>全部问题</Text>
                        </View>
                    </View>
                </View>

            );

        }

    }

    _renderFooter(){

        return <YFWListFooterComponent showFoot={this.state.showFoot}/>

    }


}

