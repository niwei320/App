import React, {Component} from 'react';
import {
    Platform,
    View,
    ScrollView,
    Image,
    Text,
    TouchableOpacity, DeviceEventEmitter,StyleSheet,FlatList,NativeModules,Dimensions
} from 'react-native';
import {
    itemAddKey,
    isEmpty,
    kScreenWidth,
    isNotEmpty,
    kScreenHeight,
    isIphoneX, tcpImage, safeObj, imageJoinURL,dismissKeyboard_yfw
} from "../../../PublicModule/Util/YFWPublicFunction";
import {
    yfwGreenColor,
    backGroundColor,
    darkTextColor,
    darkLightColor,
    separatorColor,
    yfwOrangeColor
} from '../../../Utils/YFWColor'
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import YFWRequestViewModel from "../../../Utils/YFWRequestViewModel";
import {pushNavigation} from "../../../Utils/YFWJumpRouting";
import YFWHealthAskQuestionItemView from '../View/YFWHealthAskQuestionItemView'
import PopupDialog, { SlideAnimation,FadeAnimation } from 'react-native-popup-dialog';
import YFWToast from "../../../Utils/YFWToast";
import YFWHealthAskDetailAppendQuestionsView from '../View/YFWHealthAskDetailAppendQuestionsView'
import YFWHealthAskDetailModel from "../Model/YFWHealthAskDetailModel";
import YFWDiscountText from '../../../PublicModule/Widge/YFWDiscountText'
import {toDecimal} from "../../../Utils/ConvertUtils";
import AndroidHeaderBottomLine from "../../../widget/AndroidHeaderBottomLine";
import YFWHealthAskDetailRecommendListModel from "../Model/YFWHealthAskDetailRecommendListModel";
import BigPictureView from '../../../widget/BigPictureView';
import YFWGoodsItem from '../../../widget/YFWGoodsItem'
const {StatusBarManager} = NativeModules;
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const slideAnimation = new SlideAnimation({
    slideFrom: 'top',
});

    export default class YFWHealthAskDetailController extends Component {

        static navigationOptions = ({navigation}) => ({
            headerTitle: (
                <TouchableOpacity activeOpacity={1} onPress={()=>{
                    const {navigate} = navigation;
                    pushNavigation(navigate, {type: 'get_ASK_Search'});
                }} style={{width:kScreenWidth-40,height:32,marginLeft:Platform.OS == "ios"?40:-20,flexDirection:'row',alignItems:'center'}}>
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
        }
    }

    componentDidMount(){

        this.ask_id = this.props.navigation.state.params.state.value;

        this._handleData();

    }

    //@ Action

    _clickGoodsItemMethod(shop_goods_id){

        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'get_shop_goods_detail',value:shop_goods_id})

    }

    _clickdoctorNameMethod(badge){

        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'get_ask_pharmacist',value:badge.pharmacist_id+''})

    }


    _clickdoctorShopMethod(badge){

        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'get_shop_detail',value:badge.shop_id});

    }

    _clickAskQuestionMethod(){

        let {navigate} = this.props.navigation;
        pushNavigation(navigate,{type:'get_submit_ASK'});

    }

    _clickAskAppendButtonMethod(badge,id){


        if (badge.type == 'submit_ask_questions_append'){
            //追问
            DeviceEventEmitter.emit('OpenAskDetailAppendQSView',true);
            this.askReplayId = id;

        }else if(badge.type == 'submit_ask_questions_adopt'){
            //采纳
            this._acceptAnswerData(id);

        }


    }


    //@Request
    _handleData(){

        let paramMap = new Map();
        let viewModel = new YFWRequestViewModel();
        paramMap.set('__cmd', 'guest.ask.getDetail');
        paramMap.set('id' , this.ask_id);

        viewModel.TCPRequest(paramMap, (res)=> {
            this.setState({
                dataInfo:YFWHealthAskDetailModel.getModelArray(res.result),
            });
            this.getRecommendGoodsList()
        });

    }

    /**
     * 获取推荐商品，只有TCP才需要
     */
    getRecommendGoodsList() {


        let paramMap = new Map();
        paramMap.set('__cmd','guest.ask.getStoreMedicineTop');
        paramMap.set('id',safeObj(safeObj(this.state.dataInfo).ask_detail).id);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap , (res)=>{
            let array = res.result
            let dataArray = itemAddKey(array)
            this.state.dataInfo.item_medicine = dataArray
            this.setState({});
        },(error)=>{},false);

    }


    _acceptAnswerData(askReplayId){
        if (isNotEmpty(askReplayId)){

            let paramMap = new Map();
            paramMap.set('__cmd' , 'person.ask.accept');
            paramMap.set('replyid' , askReplayId);
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap , (res)=>{
                YFWToast('采纳成功');
                this._handleData();
            });

        }
    }

    _submitAskQuestion(text){

        if (isNotEmpty(this.askReplayId)){

            let paramMap = new Map();
            paramMap.set('__cmd' , 'person.ask.insertAppend');
            paramMap.set('replyid' , this.askReplayId);
            paramMap.set('content' , text);
            let viewModel = new YFWRequestViewModel();
            viewModel.TCPRequest(paramMap , (res)=>{

                DeviceEventEmitter.emit('OpenAskDetailAppendQSView',false);
                this._handleData();

            });

        }

    }



    //@ View

    render() {

        return(
            <View style={[BaseStyles.container]}>
                <AndroidHeaderBottomLine />
                <ScrollView style={{flex:1,backgroundColor:backGroundColor()}}>
                    {this._renderAskDetailView()}
                    {this._renderAskReplyView()}
                    {/* {this._renderAskQuesionView()} */}
                    {this._renderRelateQuestionView()}
                    {this._renderRelateGoodsView()}
                </ScrollView>
                <YFWHealthAskDetailAppendQuestionsView submitMethod={(text)=>this._submitAskQuestion(text)}/>
                <BigPictureView ref={(view)=>{this.picView = view}}/>
            </View>

        );

    }

    _renderAskDetailView(){

        let detail = this.state.dataInfo.ask_detail;
        if (isNotEmpty(detail)){

            let imageSize = 0;
            let imageUrl = '';
            if (detail.intro_image.length > 0){
                imageSize = 70;
                imageUrl = detail.intro_image;
            }

            return(
                <View style={{width:kScreenWidth,flex:1,backgroundColor:'white',marginTop:0}}>
                    <View style={{flexDirection:'row',marginBottom:20,width:kScreenWidth,marginTop:20}}>
                            <Image style={[styles.cfyIconStyle,{position:'absolute'}]} source={require('../../../../img/wen_icon.png')}/>
                            <Text style={[styles.overdueStyle,{marginRight:23,marginLeft:22
        }]} numberOfLines={2}>       {detail.title}</Text>
                    </View>
                    <View style={{marginBottom:23}}>
                        <View style={{flexDirection:'row',flex:1,alignItems:'center',marginRight:23}}>
                                <Image style={{width:30,height:30,marginLeft:23,borderRadius:15}} source={{uri:detail.account_intro_image}}/>
                                <Text style={{fontSize: 12,color: "#999999",marginLeft:11}}>{detail.sex}</Text>
                                <Text style={{fontSize: 12,color: "#999999",marginLeft:21}}>{detail.age}岁</Text>
                                <Text style={{fontSize: 11,color: "#999999",marginLeft:11}} numberOfLines={1}>{detail.time}</Text>
                        </View>
                        <View style={{}}>
                            <Text style={{marginLeft:23,marginRight:29,marginTop:10,fontSize: 12,lineHeight: 16,color: "#333333",marginTop:10}} numberOfLines={2}>{detail.desc}</Text>
                            {imageUrl.length>0?<TouchableOpacity activeOpacity={1} onPress={()=>{this.picView.showView([{url:imageUrl}],0)}}>
                                    <Image style={{width:imageSize,height:imageSize,marginLeft:16,marginTop:10,resizeMode: "contain"}} source={{uri:imageUrl}}/>
                                </TouchableOpacity>:null}
                        </View>

                    </View>
                </View>
            );

        }

    }



    //医师回答视图
    _renderAskReplyView(){

        let detail = this.state.dataInfo.ask_detail;
        if (isNotEmpty(detail)){

            return(
                <View style={{backgroundColor:'white',marginTop:7}}>
                    <View style={[BaseStyles.leftCenterView,{width:kScreenWidth,paddingVertical:8}]}>
                        <Image style={[styles.cfyIconStyle]}
                               source={require('../../../../img/icon_da.png')}/>
                        <Text style={{width:kScreenWidth-40,marginLeft:-8,fontSize:13,color:'#333333'}}>医生回答（{detail.item_ask_reply.length}条回复）</Text>
                    </View>
                    <View style={[BaseStyles.separatorStyle,{marginTop:0,marginLeft:23,width:kScreenWidth-46}]}/>
                    <View style={{marginTop:detail.item_ask_reply.length>0?5:0}}>
                        {this._renderAskReplyItemView(detail.item_ask_reply)}
                    </View>
                </View>
            );

        }

    }


    _renderAskReplyItemView(ask_reply){

        var allBadge = [];

        if (isNotEmpty(ask_reply)){

            for (var i=0;i<ask_reply.length;i++){

                let badge = ask_reply[i];
                allBadge.push(

                    <View key={'ask_reply'+i} style={{flex:1}}>
                        {/* <View style={[BaseStyles.leftCenterView,{height:40}]}>
                            <Image style={{width:25,height:25,marginLeft:16,resizeMode: "contain"}} source={{uri:badge.intro_image}}/>
                            <TouchableOpacity activeOpacity={1} onPress={()=>this._clickdoctorNameMethod(badge)}>
                                <Text style={{fontSize:12,color:yfwGreenColor(),marginLeft:5}}>{badge.account_name}</Text>
                            </TouchableOpacity>
                            <Text style={[BaseStyles.contentWordStyle,{marginLeft:10}]}>{badge.type}</Text>
                            <TouchableOpacity activeOpacity={1} onPress={()=>this._clickdoctorShopMethod(badge)}>
                                <Text style={{fontSize:12,color:'rgb(29, 164, 198)',marginLeft:15,width:kScreenWidth-160}}>{badge.shop_name}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{marginTop:10,marginBottom:10}}>
                            <Text style={[BaseStyles.contentWordStyle,{width:kScreenWidth-32,marginLeft:16}]}>{badge.desc}</Text>
                            {this._renderAskReplyGoodsScroll(badge.relative_goods_item)}
                            <Text style={[BaseStyles.contentWordStyle,{height:20,width:kScreenWidth-20,marginTop:15,marginRight:10,textAlign:'right'}]} >{badge.time}</Text>
                            {this._renderAskAppend(badge.item_ask_append)}
                            {this._renderAskAppendbuttons(badge)}
                        </View>
                        <View style={[BaseStyles.separatorStyle]}/> */}
                        <View style={{marginBottom:15}}>
                            <View style={{flexDirection:'row',flex:1,alignItems:'center',marginRight:23,justifyContent:'space-between',marginTop:12}}>
                                <View style={{flexDirection:'row',alignItems:'center',}}>
                                    <Image style={{width:30,height:30,marginLeft:23,borderRadius:15}} source={{uri:badge.intro_image}}/>
                                    <TouchableOpacity activeOpacity={1} onPress={()=>this._clickdoctorNameMethod(badge)}>
                                        <Text style={{fontSize: 12,color: "#999999",marginLeft:10}}>{badge.account_name}</Text>
                                    </TouchableOpacity>
                                    <View style={{paddingHorizontal:5,paddingVertical:1,borderRadius: 3,backgroundColor: "#f5f5f5",marginLeft:10}}>
                                        <Text style={{fontSize: 11,color: "#dab96b"}}>{badge.type}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity activeOpacity={1} onPress={()=>this._clickdoctorShopMethod(badge)} style={{flex:1,marginLeft:3,marginRight:0}}>
                                    <Text style={{fontSize: 11,color: "#666666",}} numberOfLines={1}>{badge.shop_name}</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={{marginLeft:23,marginRight:29,marginTop:10,fontSize: 12,lineHeight: 16,color: "#333333",marginTop:10}}>{badge.desc}</Text>
                            {this._renderAskReplyGoodsScroll(badge.relative_goods_item)}
                            {/* <Text style={[BaseStyles.contentWordStyle,{height:20,width:kScreenWidth-20,marginTop:15,marginRight:10,textAlign:'right'}]} >{badge.time}</Text> */}
                            {this._renderAskAppend(badge.item_ask_append)}
                            {this._renderAskAppendbuttons(badge)}
                        </View>

                    </View>

                );
            }
        }

        return allBadge;

    }



    _renderAskReplyGoodsScroll(goods_item){


        if (isNotEmpty(goods_item) && goods_item.length > 0){

            return(
                <ScrollView style={[{width:kScreenWidth-20,height:80,marginTop:0,marginLeft:10}]} horizontal={true}>
                    {this._renderAskReplyGoodsScrollItem(goods_item)}
                </ScrollView>
            );

        }

    }

    _renderAskReplyGoodsScrollItem(goods_item){

        var allBadge = [];

        if (isNotEmpty(goods_item)){

            for (var i=0;i<goods_item.length;i++){

                let badge = goods_item[i];
                allBadge.push(
                    <TouchableOpacity activeOpacity={1} key={'scroll_goods'+i} onPress={()=>this._clickGoodsItemMethod(badge.shop_goods_id)}>
                        <View style={[BaseStyles.centerItem,{width:80,height:80,marginLeft:10}]}>
                            <Image style={{width:50,height:50,resizeMode: "contain"}} source={{uri:badge.image_file}}/>
                            <Text style={[BaseStyles.contentWordStyle,{marginTop:5,fontSize:11}]} numberOfLines={1}>{badge.name_cn}</Text>
                        </View>
                    </TouchableOpacity>
                );
            }
        }

        return allBadge;

    }


    _renderAskAppend(ask_append){

        if (isNotEmpty(ask_append) && ask_append.length > 0){

            return(
                <View style={{backgroundColor:backGroundColor(),marginLeft:10,marginRight:10,marginTop:10,marginBottom:10}}>
                    {this._renderAskAppendItem(ask_append)}
                </View>
            );

        }

    }

    _renderAskAppendItem(ask_append){

        var allBadge = [];

        if (isNotEmpty(ask_append)){

            for (var i=0;i<ask_append.length;i++){

                let badge = ask_append[i];
                allBadge.push(
                    <View key={'ask_append'+i} style={{marginTop:10,marginBottom:10}}>
                        <Text style={[BaseStyles.contentWordStyle,{marginLeft:10,width:kScreenWidth-40}]}>追问：{badge.desc}</Text>
                        <View>
                            {this._renderAskAppendReplyItem(badge.item_ask_appendreply)}
                        </View>
                    </View>
                );
            }
        }

        return allBadge;

    }

    _renderAskAppendReplyItem(appendreply){

        var allBadge = [];

        if (isNotEmpty(appendreply)){

            for (var i=0;i<appendreply.length;i++){

                let badge = appendreply[i];
                allBadge.push(
                    <View key={'appendreply'+i} style={{marginTop:10}}>
                        <Text style={[BaseStyles.contentWordStyle,{marginLeft:10,width:kScreenWidth-40}]}>医生：{badge.desc}</Text>
                    </View>
                );
            }
        }

        return allBadge;

    }

    _renderAskAppendbuttons(badge){

        if (isNotEmpty(badge.buttons) && badge.buttons.length > 0){

            return(
                <View style={[BaseStyles.leftCenterView,{marginTop:8,justifyContent:'space-between'}]}>
                    <View style={[BaseStyles.leftCenterView,{marginLeft:11}]}>
                        {this._renderAskAppendbuttonsItem(badge.buttons,badge.id)}
                    </View>
                    <Text style={{marginLeft:23,fontSize: 11,color: "#999999",marginRight:23}}>{badge.time}</Text>
                </View>
            );
        }else if(isNotEmpty(badge.status_id) && badge.status_id === '3'){

            return (
                <View style={[BaseStyles.leftCenterView,{marginTop:8,justifyContent:'space-between'}]}>
                    <View style={[BaseStyles.leftCenterView]}>
                        <Image style={{width: 11, height: 15, marginLeft:23, resizeMode:'contain'}}
                               source={require('../../../../img/icon_yicaina.png')}/>
                        <Text style={{fontSize:11,color:'#feac4c',marginLeft:5}}>{badge.status}</Text>
                    </View>
                    <Text style={{marginLeft:23,fontSize: 11,color: "#999999",marginRight:23}}>{badge.time}</Text>

                </View>
            );

        }else{
            return (
                <View style={[BaseStyles.leftCenterView,{marginTop:8,justifyContent:'flex-end'}]}>
                    <Text style={{marginLeft:23,fontSize: 11,color: "#999999",marginRight:23}}>{badge.time}</Text>
                </View>
            );

        }

    }

    _renderAskAppendbuttonsItem(buttons,id) {

        var allBadge = [];

        if (isNotEmpty(buttons)){

            for (var i=0;i<buttons.length;i++){

                let badge = buttons[i];
                let height = 20;
                if (i == buttons.length-1){
                    height = 0;
                }
                allBadge.push(
                    <View key={'buttons'+i} style={[BaseStyles.leftCenterView]}>
                        <TouchableOpacity  style={[BaseStyles.leftCenterView,{padding:12}]} onPress={()=>this._clickAskAppendButtonMethod(badge,id)}>
                            <Text style={{fontSize:11,color:yfwGreenColor()}}>{badge.name}</Text>
                        </TouchableOpacity>
                        {/* <View style={{width:1,height:height,backgroundColor:separatorColor()}}/> */}
                    </View>
                );
            }
        }

        return allBadge;

    }

    //提问视图
    _renderAskQuesionView(){

        let detail = this.state.dataInfo.ask_detail;
        if (isNotEmpty(detail)){

            return (
                <View style={{width:kScreenWidth,height:90,backgroundColor:'white',marginTop:10}}>
                    <View style={[BaseStyles.centerItem,{height:40}]}>
                        <Text style={[BaseStyles.titleWordStyle,{color:'#555555'}]}>有疑问，在线咨询，专业药师回答</Text>
                    </View>
                    <TouchableOpacity activeOpacity={1} style={{marginLeft:16,marginBottom:10,marginRight:16,height:40}} onPress={()=>this._clickAskQuestionMethod()}>
                        <View style={[BaseStyles.centerItem,{flex:1,borderRadius:5,backgroundColor:yfwGreenColor()}]}>
                            <Text style={{fontSize:15,fontWeight:'bold',color:'white'}}>我要提问</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            );

        }

    }


    //相关问题视图
    _renderRelateQuestionView(){

        let item_related = this.state.dataInfo.item_related;

        if (isNotEmpty(item_related)){
            return(
                <View style={{backgroundColor:'white',marginTop:7}}>
                    <View style={[BaseStyles.leftCenterView,{height:33}]}>
                        <Text style={{fontSize:13,fontWeight:'bold',color:'#333333',marginLeft:23,width:kScreenWidth-40}}>相关问题</Text>
                    </View>
                    <View style={[BaseStyles.separatorStyle,{marginTop:0,marginLeft:23,width:kScreenWidth-46}]}/>
                    {this._renderRelateQuestionViewItem(item_related)}
                </View>
            );
        }

    }

    _renderRelateQuestionViewItem(item_related){

        var allBadge = [];

        let array = item_related;
        for (var i=0;i<array.length;i++){
            let badge = array[i];
            allBadge.push(
                <YFWHealthAskQuestionItemView key={'item_related'+i} Data={badge} navigation={this.props.navigation} from='pharmacist_ask'/>
            );
        }

        return allBadge;

    }

    //相关商品视图
    _renderRelateGoodsView(){

        let item_medicine = this.state.dataInfo.item_medicine;

        if (isNotEmpty(item_medicine) && item_medicine.length>0){
            return(
                <View style={{backgroundColor:'white',marginTop:7}}>
                    <View style={[BaseStyles.leftCenterView,{height:34}]}>
                        <Text style={{fontSize:13,fontWeight:'bold',color:darkTextColor(),marginLeft:23,width:kScreenWidth-40}}>相关商品</Text>
                    </View>
                    {this._renderRelateGoodsViewItem(item_medicine)}
                </View>
            );
        }

    }

    _renderRelateGoodsViewItem(item_medicine){

        // var allBadge = [];

        // let array = item_medicine;
        // for (var i=0;i<array.length;i++){
        //     let badge = array[i];
        //     allBadge.push(
        //         <TouchableOpacity activeOpacity={1} key={'item_medicine'+i} onPress={()=>this._clickGoodsItemMethod(badge.detail_id)}>
        //             <View style={[BaseStyles.item, {backgroundColor:'white'}]}>
        //                 <View style={{justifyContent:'center',height:100}}>
        //                     <Image style={[BaseStyles.imageStyle,{width:80,height:80,alignItems:'flex-end'}]} source={{uri: imageJoinURL(badge.intro_image)}} defaultSource={require('../../../../img/default_shop_icon.png')}/>
        //                 </View>
        //                 <View style={{flex:1}}>
        //                     <View style={[{flex:1,marginTop:0}]}>
        //                         <Text style={[BaseStyles.titleStyle,{fontSize:13,width:kScreenWidth - 116}]} numberOfLines={2}>{badge.title}</Text>
        //                         <Text style={[BaseStyles.titleStyle,{color:'rgb(102,102,102)',fontSize:12,marginTop:3}]}>{badge.standard}</Text>
        //                     </View>
        //                     <View style={[BaseStyles.leftCenterView,{flex:1,justifyContent: "space-between"}]}>
        //                         <YFWDiscountText navigation={this.props.navigation}  style_view={{marginLeft:10}} value={'¥'+toDecimal(badge.price)} discount={badge.discount}/>
        //                     </View>
        //                     <View style={[BaseStyles.separatorStyle,{marginTop:0}]}/>
        //                 </View>
        //             </View>
        //         </TouchableOpacity>
        //     );
        // }

        // return allBadge;
        return(
            <FlatList
                style={{paddingBottom:5,paddingHorizontal:5}}
                data={item_medicine}
                renderItem={this._renderCommendItem.bind(this)}
                keyExtractor={(item, index) => index}
                numColumns={2}
            />
        )

    }
    _renderCommendItem({item}) {
        return(
            /**  */
            <YFWGoodsItem model={item} from={'health_medicine_list'} navigation={this.props.navigation}/>
        )
    }


}

const styles = StyleSheet.create({
    titleStyle: {
        fontSize: 13,
        lineHeight:16,
        color: '#000',
        fontWeight:'bold',
        marginRight: 10,
        flex:1
    },
    titleStyleLines: {
        fontSize: 13,
        lineHeight:14,
        color: '#000',
        fontWeight:'bold',
        marginRight: 10,
        flex:1
    },
    cfyIconStyle: {
        resizeMode:'contain',
        height:25,
        marginLeft:5
    },
    overdueStyle: {
        fontSize:15,
        color: '#333333',
        lineHeight: 21,
    }
})

