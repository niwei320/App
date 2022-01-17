/**
 * Created by admin on 2018/5/2.
 */
import React, {Component} from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    Platform,
    Text,
    Image,
    TouchableOpacity, DeviceEventEmitter
} from 'react-native'

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
import YFWNativeManager from '../Utils/YFWNativeManager'
import {pushNavigation} from "../Utils/YFWJumpRouting";
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import {getItem, kAccountKey} from "../Utils/YFWStorage";
import {ABOUNT_US_HTML, isNotEmpty, SHOP_JOIN_IN,Qualification_HTML} from "../PublicModule/Util/YFWPublicFunction";
import YFWRequestParam from "../Utils/YFWRequestParam";
import {getWinCashData} from "../Utils/YFWInitializeRequestFunction";
const styles = StyleSheet.create({
    spiltView: {
        width: width,
        height: 10,
        backgroundColor: '#F5F5F5'
    },
    orderAndTips: {
        width: width,
        backgroundColor: "white"
    },
    TextStyle: {
        color: 'black',
        fontSize: 15,
        margin: 10
    }, innerImag: {
        width: 25,
        height: 25,
        resizeMode: 'cover',
        marginTop: 10,
        alignSelf: 'center'
    }, imgScroll: {
        width: '100%',
        height: 70,
        flexDirection: 'row'
    },
    TipsTextStyle: {
        color: 'black',
        fontSize: 14,
        marginLeft: 10,
        marginTop: 15,
        marginBottom: 15
    }
});
export default class UserCenterBottomItem extends Component {
    constructor(props) {
        super(props)
        this2 = this;
        this.state = {
            nums: 0,
            data: {},
            version_num:'1.0.0',
            zipNumber:'1.0.0'
        }
    }

    componentDidMount() {
        DeviceEventEmitter.addListener(('DRUGREMIND_RED_POINT'), (nums)=> {
            if (parseInt(nums.drug_remind_count) >= 0) {
                this.setState({
                    nums: nums.drug_remind_count,
                    data: nums,
                })
            }
        })
        YFWNativeManager.getVersionNum((value)=> {
            this.setState({
                version_num: value,
            })
        })
        YFWNativeManager.getZipBundleNum((value)=>{
            this.setState({zipNumber:value});
        });
    }

    drugRemindPoint(){
        if (this.state.nums >0){
            return (
                <View style={[BaseStyles.centerItem,{width:14,height:14,backgroundColor:"#FF6E40",
                    borderRadius:7,marginLeft:15}]}>
                    <Text style={{fontSize:10,color:"#FFF",textAlign:'center'}}>{this.state.nums+''}</Text>
                </View>
            );
        } else {

        }
    }

    _renderDrugRemind = ()=>{
        let isShow = YFWUserInfoManager.ShareInstance().getSystemConfig().drug_remind_show;
        if(isShow){
            return (
                <View>
                    <TouchableOpacity onPress={() => this.onItenmClick('DrugReminding')} activeOpacity={1}>
                        <View style={{flexDirection:'row',width:width,marginLeft:10,height:50,alignItems:'center'}}>
                            <Text style={[styles.TipsTextStyle,{fontWeight:('normal','100')}]}>用药提醒</Text>
                            {this.drugRemindPoint()}
                            <View style={{flex:1}}/>
                            <Image source={ require('../../img/uc_next.png')}
                                   style={{width:15,height:15,alignSelf:'center',marginRight:20,resizeMode:'contain'}}/>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.spiltView} height={10} marginLeft={0}/>
                </View>
            );
        }
    }

    _renderInviteView = ()=>{

        let url = this.state.data.invite_win_cash_url;
        if(url&&url.length>0){
            return (
                <View>
                    <TouchableOpacity onPress={() => this.onItenmClick('Invite')} activeOpacity={1}>
                        <View style={{flexDirection:'row',width:width,marginLeft:10,height:50,alignItems:'center'}}>
                            <Text style={[styles.TipsTextStyle,{fontWeight:('normal','100')}]}>邀请赢现金</Text>
                            <View style={{flex:1}}/>
                            <Image source={ require('../../img/uc_next.png')}
                                   style={{width:15,height:15,alignSelf:'center',marginRight:20,resizeMode:'contain'}}/>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.spiltView} height={10} marginLeft={0}/>
                </View>
            );
        }
    }
    invite() {

        const {navigate} = this.props.navigation;
        getWinCashData(navigate);

    }
    render() {
        return <View style={{width:width,flexDirection:'column',backgroundColor:'white'}}>
            {this._renderInviteView()}
            {this._renderDrugRemind()}
            <TouchableOpacity onPress={() => this.onItenmClick('Feedback')} activeOpacity={1}>
                <View style={{flexDirection:'row',width:width,marginLeft:10,height:50,alignItems:'center'}}>
                    <Text style={[styles.TipsTextStyle,{fontWeight:('normal','100')}]}>意见反馈</Text>
                    <View style={{flex:1}}/>
                    <Image source={ require('../../img/uc_next.png')}
                           style={{width:15,height:15,alignSelf:'center',marginRight:20,resizeMode:'contain'}}/>
                </View>
            </TouchableOpacity>
            <View style={[styles.spiltView]} height={1} marginLeft={20}/>
            <TouchableOpacity onPress={() => this.onItenmClick('GoodRating')} activeOpacity={1}>
                <View style={{flexDirection:'row',width:width,marginLeft:10,height:50,alignItems:'center'}}>
                    <Text style={[styles.TipsTextStyle,{fontWeight:('normal','100')}]}>给我好评</Text>
                    <View style={{flex:1}}/>
                    <Image source={ require('../../img/uc_next.png')}
                           style={{width:15,height:15,alignSelf:'center',marginRight:20,resizeMode:'contain'}}/>
                </View>
            </TouchableOpacity>
            <View style={[styles.spiltView]} height={1} marginLeft={20}/>
            <TouchableOpacity onPress={() => this.onItenmClick('ContactUs')} activeOpacity={1}>
                <View style={{flexDirection:'row',width:width,marginLeft:10,height:50,alignItems:'center'}}>
                    <Text style={[styles.TipsTextStyle,{fontWeight:('normal','100')}]}>联系我们</Text>
                    <View style={{flex:1}}/>
                    <Text style={{fontSize:14,color:'#16c08e',alignSelf:'center',marginRight:10}}/>
                    <Image source={ require('../../img/uc_next.png')}
                           style={{width:15,height:15,alignSelf:'center',marginRight:20,resizeMode:'contain'}}/>
                </View>
            </TouchableOpacity>
            <View style={[styles.spiltView]} height={1} marginLeft={20}/>
            <TouchableOpacity onPress={() => this.onItenmClick('AboutUs')} activeOpacity={1}>
                <View style={{flexDirection:'row',width:width,marginLeft:10,height:50,alignItems:'center'}}>
                    <Text style={[styles.TipsTextStyle,{fontWeight:('normal','100')}]}>关于我们</Text>
                    <View style={{flex:1}}/>
                    <Text style={{fontSize:14,color:'#999999',alignSelf:'center',marginRight:10}}>v{this.state.version_num}</Text>
                    <Image source={ require('../../img/uc_next.png')}
                           style={{width:15,height:15,alignSelf:'center',marginRight:20,resizeMode:'contain'}}/>
                </View>
            </TouchableOpacity>
            <View style={[styles.spiltView]} height={1} marginLeft={20}/>
            <TouchableOpacity onPress={() => this.onItenmClick('Qualification')} activeOpacity={1}>
                <View style={{flexDirection:'row',width:width,marginLeft:10,height:50,alignItems:'center'}}>
                    <Text style={[styles.TipsTextStyle,{fontWeight:('normal','100')}]}>资质证书</Text>
                    <View style={{flex:1}}/>
                    <Image source={ require('../../img/uc_next.png')}
                           style={{width:15,height:15,alignSelf:'center',marginRight:20,resizeMode:'contain'}}/>
                </View>
            </TouchableOpacity>
            <View style={[styles.spiltView]} height={1} marginLeft={20}/>
            <TouchableOpacity onPress={() => this.onItenmClick('MerchantEntry')} activeOpacity={1}>
                <View style={{flexDirection:'row',width:width,marginLeft:10,height:50,alignItems:'center'}}>
                    <Text style={[styles.TipsTextStyle,{fontWeight:('normal','100')}]}>商家入驻</Text>
                    <View style={{flex:1}}/>
                    <Image source={ require('../../img/uc_next.png')}
                           style={{width:15,height:15,alignSelf:'center',marginRight:20,resizeMode:'contain'}}/>
                </View>
            </TouchableOpacity>
        </View>
    }

    onItenmClick(type) {
        const {navigate} = this.props.navigation;
        switch (type) {
            case 'DrugReminding':
                YFWNativeManager.mobClick('account-drug reminding');
                pushNavigation(navigate,{type:'drug_reminding'})
                break
            case 'Invite':
                this.invite();
                break
            case 'Feedback':
                YFWNativeManager.mobClick('account-feedback');
                pushNavigation(navigate,{type:'get_feedback'})
                break
            case 'GoodRating':
                YFWNativeManager.openAppStoreComment(()=>{});
                break
            case 'MerchantEntry':
                pushNavigation(navigate, {
                    type: 'get_h5',
                    value: SHOP_JOIN_IN(),
                    name: '商家入驻',
                    title: '商家入驻'
                });
                break
            case 'AboutUs':
                YFWNativeManager.mobClick('account-about us');
                pushNavigation(navigate, {
                    type: 'get_h5',
                    value: ABOUNT_US_HTML(),
                    name: '关于我们',
                    title: '关于我们',
                    isHiddenShare:true,
                });
                break
            case 'Qualification':
                YFWNativeManager.mobClick('account-about us');
                pushNavigation(navigate, {
                    type: 'get_h5',
                    value: Qualification_HTML(),
                    name: '资质证书',
                    title: '资质证书',
                    isHiddenShare:true,
                });
                break
            case 'ContactUs':
                YFWNativeManager.mobClick('account-contact');
                this.props.navigation.navigate('ContactUs')
                break
        }
    }
}