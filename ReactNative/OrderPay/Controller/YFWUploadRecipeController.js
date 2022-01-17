import React, {Component} from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Keyboard,
    DeviceEventEmitter,
    Platform,
    Alert
} from 'react-native'
import {yfwOrangeColor, yfwGreenColor, separatorColor,backGroundColor} from '../../Utils/YFWColor'
import {
    isEmpty,
    itemAddKey,
    kScreenWidth,
    safe,
    dismissKeyboard_yfw,
    isNotEmpty, mobClick, safeObj, isIphoneX, kScreenHeight
} from "../../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import YFWUploadRecipePhotoView from "../View/YFWUploadRecipePhotoView";
import YFWUploadRecipeInformationView from "../View/YFWUploadRecipeInformationView";
import YFWUploadRecipeModel from "../Model/YFWUploadRecipeModel";
import YFWToast from "../../Utils/YFWToast";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import {pushNavigation} from "../../Utils/YFWJumpRouting";
import YFWNativeManager from "../../Utils/YFWNativeManager";
import YFWUploadRecipeRequestModel from '../Model/YFWUploadRecipeRequestModel'
import {toDecimal} from "../../Utils/ConvertUtils";
import YFWTouchableOpacity from '../../widget/YFWTouchableOpacity';
import YFWRxInfoTipsAlert from '../View/YFWRxInfoTipsAlert';


export default class YFWUploadRecipeController extends Component {

    static navigationOptions = ({ navigation }) => ({

        tabBarVisible: false,
        title:'处方提交',
        // headerRight: (
        //     <TouchableOpacity activeOpacity={1}
        //         onPress={()=>navigation.state.params.navigatePress()}>
        //         <Text style={{marginRight:15,fontSize:14,color:yfwGreenColor()}}>提交</Text>
        //     </TouchableOpacity>
        // ),
        headerRight:null
    });

    constructor(props) {
        super(props)
        this.submitClickable = true // 是否可以点击提交处方
        this.state = {
            dataInfo:{},
            goods_items:[],
            upload_type:'1',
            imageUri:undefined,
            uploadModel:undefined,
            keyboardSpace:0,
        }
    }

    componentDidMount() {

        mobClick('order settlement-prescription-photo');
        this.order_no = this.props.navigation.state.params.state.value;
        this.props.navigation.setParams({ navigatePress:this._uploadRecipeMethod.bind(this) })
        this.state.uploadModel = new YFWUploadRecipeModel();
        this.itemPosition = this.props.navigation.state.params.state.itemPosition;
        this.pageSource = this.props.navigation.state.params.state.pageSource;
        this._requestData();

    }



    // ====== Request ======
    _requestData(){

        let paramMap = new Map();
        paramMap.set('__cmd','person.order.getUploadRXInfo');
        paramMap.set('orderno',safe(this.order_no));
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap,(res)=>{

            let info = YFWUploadRecipeRequestModel.getModelValue(res.result);
            let goods_items = itemAddKey(info.medicine_list);
            this.setState({
                dataInfo:info,
                goods_items:goods_items,
            });
        });

    }

    //上传处方信息
    _sendRecipeInfoData(model){
        if(this.submitClickable){
            this.submitClickable = false
        }else{
            return;
        }
        let rx_content = '';
        rx_content += '姓名:'+ safe(model.name);
        rx_content += '  性别:'+ safe(model.gender);
        rx_content += '  年龄:'+ safe(model.age);
        rx_content += '<br />医院:'+ safe(model.hospital);
        rx_content += '<br />医生:'+ safe(model.doctor);
        rx_content += '<br />科别:'+ safe(model.department);
        rx_content += '<br />开具时间:'+ safe(model.date);
        this.state.goods_items.forEach((item,index,array)=>{
            let info = '商品名称:' + item.goods_name + '||||数量:' + item.qty;
            rx_content += '<br />'+ info;
        });

        let paramMap = new Map();
        paramMap.set('__cmd','person.order.uploadRX');
        paramMap.set('orderno',safe(this.order_no));
        paramMap.set('rx_content',safe(rx_content));
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap,(res)=>{
            YFWToast('处方提交成功');
            if (isNotEmpty(this.itemPosition)) {
                let noticeData = {itemPosition:this.itemPosition,pageSource:this.pageSource}
                DeviceEventEmitter.emit('uploadrecip_order_status_refresh', noticeData);
            }
            this.props.navigation.goBack();
        },(res)=>{
            this.submitClickable = true;
        });

    }

    //上传处方照片
    _sendRecipePhotoData(url){
        if(this.submitClickable){
            this.submitClickable = false
        }else{
            return;
        }
        YFWNativeManager.tcpUploadImg(url, (image) => {

            let paramMap = new Map();
            let viewModel = new YFWRequestViewModel();
            paramMap.set('__cmd', 'person.order.uploadRX');
            paramMap.set('orderno', safe(this.order_no));
            paramMap.set('rx_image', safe(image));
            viewModel.TCPRequest(paramMap, (res) => {
                YFWToast('处方提交成功');
                if (isNotEmpty(this.itemPosition)) {
                    let noticeData = {itemPosition: this.itemPosition, pageSource: this.pageSource}
                    DeviceEventEmitter.emit('uploadrecip_order_status_refresh', noticeData);
                }
                this.props.navigation.goBack();
            },(error)=>{
                if (error&&error.msg) {
                    this.rxInfoAlert && this.rxInfoAlert.showView(error.msg)
                }
                this.submitClickable = true;
            });

        },()=>{},-1);
    }



    // ====== Action ======
    _uploadRecipeMethod(){

        mobClick('order settlement-submit');
        if (this.state.upload_type == '1'){

            if (isEmpty(this.state.imageUri)){
                YFWToast('请上传处方照片!');
                return;
            }

            this._sendRecipePhotoData(this.state.imageUri);

        }  else if(this.state.upload_type == '2') {

            let model = this._info.getInfoModel();
            this.state.uploadModel = model;

            if (model.name.length == 0){

                YFWToast('姓名不能为空');
                return;

            } else if(model.age.length == 0){

                YFWToast('年龄不能为空');
                return;

            } else if(model.gender.length == 0){

                YFWToast('请选择性别');
                return;

            }  else if(model.hospital.length == 0){

                YFWToast('医院不能为空');
                return;

            } else if(model.department.length == 0){

                YFWToast('科别不能为空');
                return;

            } else if(model.doctor.length == 0){

                YFWToast('医生不能为空');
                return;

            } else if(model.date.length == 0){

                YFWToast('日期不能为空');
                return;

            }

            this._sendRecipeInfoData(model);


        }

    }


    _clickChangeStyleMethod(upload_type){

        mobClick('order settlement-prescription-photo');
        this.setState({
            upload_type:upload_type,
        });

    }

    _setPhotoUri(uri){

        this.setState({
            imageUri:uri,
        });

    }

    _setUploadModel(model){

        this.setState({
            uploadModel:model,
        });

    }



    // ====== View ======

    render() {
        return (
            <View style={{backgroundColor:'#fafafa',flex:1}}>
                <KeyboardAwareScrollView>
                    <View style={[BaseStyles.container]}>
                        <FlatList
                            ref={(flatList)=>this._flatList = flatList}
                            extraData={this.state}
                            data={this.state.goods_items}
                            renderItem = {this._renderItem.bind(this)}
                            ListHeaderComponent={this._renderHeader.bind(this)}
                            ListFooterComponent={this._renderFooter.bind(this)}
                            onScrollBeginDrag={()=>{dismissKeyboard_yfw();}}
                            style={{backgroundColor:backGroundColor()}}
                        />
                    </View>
                </KeyboardAwareScrollView>
                <View style={{height:isIphoneX()?45+25+34:45+25,width:kScreenWidth,alignItems:'center'}}>
                    <YFWTouchableOpacity style_title={{height:44, width:kScreenWidth-20, fontSize: 16}} title={'提交'}
                                                     callBack={()=>this._uploadRecipeMethod()}
                                                     isEnableTouch={true}/>
                </View>
                <YFWRxInfoTipsAlert ref={(e)=>{this.rxInfoAlert=e}}/>
            </View>

        )
    }

    _renderItem = (item) => {

        return (<View/>)

    }

    _renderHeader(){


        let drugViews = []
        this.state.goods_items.map((item,index)=>{
            let title = item.goods_name.split("(")[0] + '(' +item.standard + ')'
        let marginT = index == 0?25:21
        let marginB = index == (this.state.goods_items.length -1)?28:0
        drugViews.push(
            <View style={[BaseStyles.leftCenterView,{paddingBottom:marginB,paddingTop:marginT,backgroundColor:'#fafafa',justifyContent:'space-between'}]}>
                <Text style={[BaseStyles.titleWordStyle,{marginLeft:13,color:'#000',fontSize:12}]} numberOfLines={1}>{title}</Text>
                <Text style={[BaseStyles.contentWordStyle,{marginRight:15}]}>x{item.qty}</Text>
            </View>
        )
        })
        return(
            <View>
                <View style={{paddingHorizontal:15,paddingVertical:7,backgroundColor:'#faf8dc'}}>
                    <Text style={[BaseStyles.contentWordStyle,{color:'#feac4c',fontSize:12}]}>
                        {this.state.dataInfo.prompt_info}
                    </Text>
                </View>
                <View style={{marginTop:10,backgroundColor:'white',marginHorizontal:13,borderTopLeftRadius:7,borderTopRightRadius:7,shadowColor: "rgba(204, 204, 204, 0.44)",shadowOpacity:1,shadowOffset:{width:0,height:0}}}>
                    <View style={[BaseStyles.leftCenterView,{height:50}]}>
                        <Text style={[BaseStyles.titleWordStyle,{marginLeft:13}]}>商家：</Text>
                        <Text style={[BaseStyles.titleWordStyle,{marginLeft:2}]}>{this.state.dataInfo.title}</Text>
                    </View>
                    <View style={[BaseStyles.separatorStyle]}/>
                    <View style={[BaseStyles.leftCenterView,{height:50}]}>
                        <Text style={[BaseStyles.titleWordStyle,{marginLeft:13}]}>订单：</Text>
                        <Text style={[BaseStyles.titleWordStyle,{marginLeft:2,color:'#999'}]}>{this.state.dataInfo.orderno}</Text>
                    </View>
                    <View style={[BaseStyles.separatorStyle]}/>
                    {drugViews}
                </View>
            </View>
        );

    }


    _renderFooter(){

        if (isNotEmpty(this.state.dataInfo.upload_type_list) && this.state.dataInfo.upload_type_list.length > 0){

            return(
                <View style={{backgroundColor:'white',paddingBottom:7,marginHorizontal:13,marginVertical:20,borderRadius:7,shadowColor: "rgba(204, 204, 204, 0.44)",shadowRadius:7,shadowOpacity:1,shadowOffset:{width:0,height:3}}}>
                    {this._renderFooterItem()}
                    {this._renderItemFooter()}
                </View>
            );
        } else {
            return (<View/>);
        }

    }


    _renderFooterItem(){

        var itemAry = [];
        let upload_type_list = this.state.dataInfo.upload_type_list;
        // 遍历
        for (let i = 0; i<upload_type_list.length; i++) {
            let dataItem = upload_type_list[i];

            let color = (this.state.upload_type == dataItem.type) ? '#333333' : '#666';

            itemAry.push(
                <TouchableOpacity activeOpacity={1} style={{flex:1,flexDirection:'row',alignItems:'center'}} onPress={()=>this._clickChangeStyleMethod(dataItem.type)}>
                    <Text style={{fontSize:15,color:color,marginLeft:18,marginTop:15,fontWeight:'bold'}}>{dataItem.value}</Text>
                </TouchableOpacity>
            );
        }
        return itemAry;


    }




    _renderItemFooter(){

        if (this.state.upload_type == '1'){

            let prompt_info = '';
            // if (isNotEmpty(this.state.dataInfo.upload_type_list)){
            //     this.state.dataInfo.upload_type_list.forEach((item,index)=>{
            //         if (String(item.type) == '1'){
            //             prompt_info = item.prompt_info;
            //         }
            //     });
            // }

            return(
                <YFWUploadRecipePhotoView prompt_info={prompt_info} imageUri={this.state.imageUri}
                                          returnImage={(uri)=>{this._setPhotoUri(uri)}}/>
            );

        } else if(this.state.upload_type == '2'){

            let prompt_info = '';
            // if (isNotEmpty(this.state.dataInfo.upload_type_list)){
            //     this.state.dataInfo.upload_type_list.forEach((item,index)=>{
            //         if (String(item.type) == '2'){
            //             prompt_info = item.prompt_info;
            //         }
            //     });
            // }

            return(
                <YFWUploadRecipeInformationView ref={(info => this._info = info)} prompt_info={prompt_info}
                                                model={this.state.uploadModel} returnModel={(model)=>{this._setUploadModel(model)}}/>
            );

        } else {

            return (<View/>);

        }

    }

    componentWillUnmount(){
        if(isNotEmpty(this.props.navigation.state.params.state.rxCallback)){
            this.props.navigation.state.params.state.rxCallback(this.props.navigation.state.params.state.value);
        }
    }


}