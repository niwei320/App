import React, {Component} from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView
} from 'react-native';
import ModalView from '../../widget/ModalView'


import YFWToast from '../../Utils/YFWToast'
import {
    backGroundColor,
    darkLightColor,
    darkTextColor,
    separatorColor,
    yfwOrangeColor,
} from '../../Utils/YFWColor'
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import {doAfterLogin} from "../../Utils/YFWJumpRouting";
import {
    isNotEmpty,
    itemAddKey,
    safeObj,
    adaptSize,
    kScreenWidth,
    deepCopyObj
} from "../../PublicModule/Util/YFWPublicFunction";
import {toDecimal} from "../../Utils/ConvertUtils";
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import YFWNativeManager from "../../Utils/YFWNativeManager";


export default class YFWAlertCouponCollectionListView extends Component {

    static defaultProps = {
        data:undefined,
    }

    constructor(...args) {
        super(...args);
        this.state = {
            dataArray:[],
            dataSource:[],
            visible: false,
        };
    }

    show(data) {

        this.data = data;
        this.modalView && this.modalView.show()
        this.setState({
            visible: true
        });
        if (isNotEmpty(data.couponArray)){
            let newDataArray = []
            let newDataSource = []
            data.couponArray.map((item)=>{
                if (item.get == '1') {
                    newDataArray.push(item)
                }

                if (item.aleardyget == 1) {
                    let newItem = {...item,get:'0'}
                    for (let index = 0; index < item.user_coupon_count; index++) {
                        newDataSource.push(newItem)
                    }
                }
            })
            this.setState({
                dataArray: newDataArray,
                dataSource:newDataSource
            });
        }

    }

    dismiss() {

        this.modalView && this.modalView.disMiss()
        this.props.dismiss && this.props.dismiss()
        this.setState({
            visible: false,
        })

    }

    render() {
        let array = this.state.dataSource
        let array1 = this.state.dataArray
        return (
            <ModalView ref = {(c) => this.modalView = c}
                       transparent={true}
                       animationType = "slide"
                       visible={this.state.visible}
                       onRequestClose={()=>{
                this.props.onRequestClose && this.props.onRequestClose()
                this.dismiss()
            }}>
                <View style = {{flex: 1}}>
                    <TouchableOpacity activeOpacity = {1} style = {{flex: 1}} onPress = {() => this.dismiss()} />
                    <View style = {{backgroundColor: '#F8F8F8', height: 423,borderTopLeftRadius: 7,borderTopRightRadius: 7,padding:4}}>
                        <View style = {{height: 48,justifyContent:'center',alignItems:'center'}}>
                            <Text style = {{color: '#000', fontSize: 15,fontWeight:'bold',lineHeight: 20}}>优惠券</Text>
                            <TouchableOpacity activeOpacity = {1} style = {{width: 15, height: 15,position:'absolute', right: 19,top:16}} hitSlop={{top:20,left:20,bottom:20,right:20}} onPress = {() => this.dismiss()}>
                                <Image style = {{width: 15, height: 15}} source = {require('../../../img/close_button.png')} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{flex:1,}}>
                            {this.ReceviceFavourable()}
                            {(isNotEmpty(this.state.dataSource)&&this.state.dataSource.length>0)?this.haveReceviceFavourable():<View/>}
                        </ScrollView>
                        {/* <Text style = {{color: '#000', fontSize: 14,marginLeft:11}}>可领取优惠券</Text>
                        <FlatList ref = {(flatList) => this._flatList = flatList} extraData = {this.state} data = {this.state.dataArray} renderItem = {this._renderItem.bind(this)} ListFooterComponent = {() => this._footerView()}
                        /> */}
                        <View style = {{height: 10}} />
                    </View>
                </View>
            </ModalView>
        );
    }
    ReceviceFavourable(){
        return(
            <View style={{flex:1}}>
                <Text style = {{color: '#000', fontSize: 14,marginLeft:11}}>可领取优惠券</Text>
                <FlatList ref = {(flatList) => this._flatList = flatList} extraData = {this.state} data = {this.state.dataArray} renderItem = {this._renderItem.bind(this)} ListFooterComponent = {() => this._footerView()}
                />
            </View>

        )
    }
    haveReceviceFavourable(){
        return(
            <View style={{flex:1}}>
                <Text style = {{color: '#000', fontSize: 14,marginLeft:11}}>已领取优惠券</Text>
                <FlatList ref = {(flatList) => this._flatList = flatList} extraData = {this.state} data = {this.state.dataSource} renderItem = {this._renderItem.bind(this)} ListFooterComponent = {() => this._footerView()}
                />
            </View>

        )
    }

    _renderItem = (item,index) => {

        if (item.item.time_start) {
            item.item.start_time = item.item.time_start
        }
        if (item.item.time_end) {
            item.item.end_time = item.item.time_end
        }

        let validTime = item.item.start_time.split('-').join('.') + '-' + item.item.end_time.split('-').join('.')
        let isCanGet = item.item.get === '1'
        let btnTitle = isCanGet?'点击领取':'已领取'
        let btnBgSource = require('../../../img/button_djlq.png')
        let scale = 360/kScreenWidth
        return (
            <View style={{height:110,flex:1}}>
                <View style={styles.cell}>
                    <ImageBackground style={{width:112*scale,height:100,justifyContent:'center',alignItems:'center'}} source={require('../../../img/icon_coupon_backimage.png')} imageStyle={{resizeMode:'stretch'}}>
                        <Text style={{color:'white',fontSize:21,fontWeight:'bold'}}>¥<Text style={{fontSize:42}}>{parseInt(item.item.money)}</Text></Text>
                    </ImageBackground>
                    <View style={{flex:1,marginLeft:14*scale}}>
                        <View style = {{marginTop:19,flexDirection:'row',alignItems:'center'}}>
                            <View style={{height:adaptSize(16),borderRadius:adaptSize(8),borderWidth: 1,borderColor:'#1fdb9b',marginRight:adaptSize(5),paddingHorizontal:6,justifyContent:'center'}}>
                                <Text style={{fontSize:12,color:'#1fdb9b',includeFontPadding:false}}>{item.item.type==1?'店铺':'单品'}</Text>
                            </View>
                            <Text style={{color:darkTextColor(),fontSize:13*scale,fontWeight:'bold'}}>{item.item.title}</Text>
                        </View>
                        <View style={{flex:1}}/>
                        <Text style={{color:darkTextColor(),fontSize:11*scale,marginBottom:21*scale,marginRight:78*scale}}>{validTime}</Text>
                    </View>
                    {isCanGet?<TouchableOpacity activeOpacity={1}  style={{width:76*scale,height:37*scale,right:4*scale,bottom:8*scale,position:'absolute'}} onPress={()=>
                         {if(isCanGet){this._getCouponMethod(item.item.id,item.index)}}
                        }>
                                <ImageBackground
                                    style={{flex:1,alignItems: 'center',justifyContent: 'center'}}
                                    source={btnBgSource}>
                                    <Text style={{color:'white',fontSize:12*scale,top:-3*scale,includeFontPadding:false}}>{btnTitle}</Text>
                                </ImageBackground>
                    </TouchableOpacity>:
                    <View style={{width:62.5*scale,height:22.2*scale,right:7*scale,bottom:18*scale,position:'absolute',borderRadius:11.1*scale,borderWidth:1,borderColor:'#1fdb9b',justifyContent:'center',alignItems:'center'}}>
                        <Text style={{color:'#1fdb9b',fontSize:12*scale}}>{btnTitle}</Text>
                    </View>
                    }
                </View>
            </View>
        );

    }

    _footerView(){

        return(
            <View style={{height:20}}/>
        );

    }


    //领取优惠券
    _getCouponMethod(coupon_id,index){

        if (coupon_id == null){
            return;
        }
        if(!YFWUserInfoManager.ShareInstance().hasLogin()){
            this.dismiss()
        }
        let{navigate} = this.props.navigation
        doAfterLogin(navigate,()=>{
            let paramMap = new Map();
            let viewModel = new YFWRequestViewModel();
            paramMap.set('__cmd', 'person.usercoupons.acceptCoupon');
            paramMap.set('id', coupon_id);
            viewModel.TCPRequest(paramMap, (res) => {
                YFWToast('领取成功');
                if (res && (res.result+'' === '1' || res.result+'' === '2')) {//1代表已领 2 代表 还可继续领取
                        let infosArray = deepCopyObj(this.state.dataArray)
                        let info = infosArray[index]
                        info.aleardyget = 1
                        info.get = '0'
                        this.state.dataArray[index].user_coupon_count++
                        this.state.dataArray[index].aleardyget = 1
                        let data = this.state.dataSource
                        data.push(info)
                        //max_claim_quantity==0 代表不限数量
                        if (info.max_claim_quantity != 0 && info.max_claim_quantity <= this.state.dataArray[index].user_coupon_count) {
                            this.state.dataArray[index].get = '0'
                            this.state.dataArray.splice(index,1)
                        }
                        this.setState({
                            dataSource:data
                        })
                }

            });
        })
    }
}



const styles = StyleSheet.create({
    cell: {
        marginHorizontal:10,marginTop:10,height:100,
        alignItems: 'center',flexDirection: 'row',
        shadowColor: "rgba(250, 250, 250, 0.5)",
        backgroundColor:'white',
        shadowOffset: {
                    width: 0,
                    height: 4
                    },
        shadowRadius: 8,
        shadowOpacity: 1
    },
    text: {
        fontSize: 20,
        textAlign: 'center'
    },
    item: {
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'

    },
    shareImage: {
        width: 40,
        height: 40
    },
    shareView: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    }
});