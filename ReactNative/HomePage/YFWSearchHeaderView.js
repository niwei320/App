import React, {Component} from 'react';
import {
    StyleSheet,
    Image,
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    DeviceEventEmitter, Platform,Animated,NativeModules
} from 'react-native';
import YFWMessageRedPointView from '../widget/YFWMessageRedPointView';
const {StatusBarManager} = NativeModules;

const kScreenWidth = Dimensions.get('window').width;
const kScreenHeight = Dimensions.get('window').height;
function safeObj(obj) {
    return isNotEmpty(obj) ? obj : '';
}
function isAndroid() {
    return Platform.OS === 'android'
}
//对象判空
function isEmpty(obj){

    if(typeof (obj) != 'number' && (!obj || obj == null || obj == ' ' || obj == undefined || typeof (obj) == 'undefined')){
        return true;
    }
    return false;

}
//对象非空
function isNotEmpty(obj){

    if(!isEmpty(obj)){
        return true;
    }
    return false;

}
//判断是否为iphoneX XR XS MAX
function isIphoneX() {
    return (
        Platform.OS === 'ios' &&
        ((kScreenHeight == 812 && kScreenWidth == 375) ||
            (kScreenHeight == 896 && kScreenWidth == 414))
    )
}

//靠近屏幕顶部的控件marginTop值
function iphoneTopMargin() {

    return isAndroid()?Platform.Version >= 19?StatusBarManager.HEIGHT +20:20:isIphoneX()?44+20:20+20;
}
export default class YFWHomeSearchHeaderView extends Component {

    static defaultProps = {
        canChangeColor: true,
        bgStyle: {}
    }

    constructor(props) {
        super(props);
        this.state = {
            text: '',
            address: '定位失败',
            refreshRotateY: new Animated.Value(0),
        };
    }

    componentDidMount() {
        this._getAddress();
        DeviceEventEmitter.addListener('get_change_location',(data)=>{

            let address = safeObj(data.address);
            let lat = safeObj(data.lat);
            let lng = safeObj(data.lng);

            this._changeAddress(address, lat, lng);

        });

        DeviceEventEmitter.addListener('refresh_location',(data)=>{
            this._locationRefresh()
        });


    }

    componentWillUnmount() {
        this.getLocationData && this.getLocationData.remove();
        this.AddressListener.remove();
    }

    setOffsetProps(newOffsetY) {
        if (this.props.from&&(this.props.from == 'findyao')){
            return
        }
        if (newOffsetY < 30) {
            opacity = newOffsetY * (1 / 30);
        }

        let allH = 60 + iphoneTopMargin();
        if (this.props.from&&(this.props.from == 'home_member')){
            allH = 70 + iphoneTopMargin()
        }
        let margiT = iphoneTopMargin() + 20;
        let criticalPoint = this.props.canChangeColor ? 60 : 60;

        if (newOffsetY > criticalPoint) {
            if (newOffsetY - criticalPoint > 33) {
                DeviceEventEmitter.emit('kStatusChange',true)
                allH = 33 + iphoneTopMargin();
                this.positionView.setNativeProps({
                    style: {height: allH},
                    opacity: 1,
                })
                this.contentView.setNativeProps({
                    style: {height: allH},
                })
                this.locationText.setNativeProps({
                    style:{maxWidth:70}
                })
                // this.topView.setNativeProps({
                //     opacity: 0,
                // })
                margiT = iphoneTopMargin() - 10;
                this.searchView.setNativeProps({
                    style: {marginTop: margiT,marginLeft:13,width:kScreenWidth-13-44,paddingTop:0},
                })

            } else {
                DeviceEventEmitter.emit('kStatusChange',false)
                let someOp = (criticalPoint + 33 - newOffsetY) / 33;
                // this.topView.setNativeProps({
                //     opacity: someOp,
                // })
                allH = allH - (newOffsetY - criticalPoint);
                margiT = iphoneTopMargin() + 20 - (newOffsetY - criticalPoint);
                this.positionView.setNativeProps({
                    style: {height: allH},
                    opacity: this.props.canChangeColor?(1-someOp):1,
                })
                this.contentView.setNativeProps({
                    style: {height: allH},
                })
                let leftOp = 13
                let rightOp = 34*(1-someOp)+13
                this.searchView.setNativeProps({
                    style: {marginTop: margiT,marginLeft:leftOp,width:kScreenWidth-leftOp-rightOp,paddingTop:someOp*4},
                })
            }
        } else if (newOffsetY < 0) {
            DeviceEventEmitter.emit('kStatusChange',false)
            this.contentView.setNativeProps({
                opacity: this.props.canChangeColor?0:1,
            })
            this.positionView.setNativeProps({
                style: {height: allH},
                opacity: this.props.canChangeColor?0:1,
            })
            this.searchView.setNativeProps({
                style: {marginTop: margiT,marginLeft:13,width:kScreenWidth-26},
            })
            this.locationText.setNativeProps({
                style:{maxWidth:kScreenWidth*0.5}
            })

        } else {
            DeviceEventEmitter.emit('kStatusChange',false)
            if (this.props.canChangeColor) {
                
                
                // this.topView.setNativeProps({
                //     opacity: 1,
                // })
            }
            this.searchView.setNativeProps({
                style: {marginTop: margiT,marginLeft:13,width:kScreenWidth-26,paddingTop:4},
            })
            this.locationText.setNativeProps({
                style:{maxWidth:kScreenWidth*0.5}
            })
            this.positionView.setNativeProps({
                style: {height: allH},
                opacity: this.props.canChangeColor?0:1,
            })
            this.contentView.setNativeProps({
                style: {height: allH},
                opacity: 1,
            })


        }

    }

    render() {

        
        let bgHeight = 60 + iphoneTopMargin();
        let marginTop = iphoneTopMargin() + 20;
        let bgOpacity = this.props.canChangeColor?0:1
        let searchViewW = kScreenWidth-26
        let searchViewLeft = 13
        let searchViewTop = 4
        let contentViewH =60 + iphoneTopMargin()
        if (this.props.from&&this.props.from == 'findyao'){
            bgHeight = 33 + iphoneTopMargin()
            marginTop = iphoneTopMargin()-10;
            searchViewW = kScreenWidth-44-13
            searchViewLeft = 13
            searchViewTop = 0
            contentViewH = 30+iphoneTopMargin()
        }
        if (this.props.from&&this.props.from == 'home_member'){
            bgHeight = 70 + iphoneTopMargin()
            contentViewH = 70 + iphoneTopMargin()
        }
        return (
            <View ref={(e)=>{this.contentView = e}}
                  style={[styles.backStyle,this.props.bgStyle,{backgroundColor:'rgba(0,0,0,0)',height:contentViewH}]}>
                {
                    this.props.from == 'home_member'?
                    <Image ref={(e)=>{this.positionView = e}} style={{position:'absolute',width:kScreenWidth,height:bgHeight}} source={require('../../img/search_top_bg.png')}/>:
                    <View ref={(e)=>{this.positionView = e}}
                            style={{width:kScreenWidth,height:bgHeight,position:'absolute',opacity:bgOpacity,backgroundColor:'#1fdb9b'}}>
                    </View>
                }
                {this._renderTopView()}
                <View ref={(e)=>{this.searchView = e}}
                      style={{position: 'absolute',width:searchViewW,paddingTop:searchViewTop, marginLeft: searchViewLeft, marginRight: 10, height: 35,marginTop:marginTop}}>
                    <TouchableOpacity activeOpacity={1} style={{flex:1}} onPress={()=>this._searchMethod()}>
                        <View style={{flexDirection: 'row', backgroundColor: 'white',
                            borderRadius:17,height:34, justifyContent: 'space-between', alignItems: 'center'}}>
                            <View style={[styles.leftCenterView,{flex:1}]}>
                                <Image style={{width: 15, height: 15, marginLeft:9,overflow:'visible'}}
                                       source={require('../../img/top_bar_search.png')}
                                       defaultSource={require('../../img/top_bar_search.png')}/>
                                <Text style={{marginLeft:5,color:'#ccc',fontSize:14,flex:1}} numberOfLines={1}>批准文号、通用名、商品名、症状</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    _renderTopView() {

        let textMaxW = kScreenWidth*0.5
        if (this.props.from&&this.props.from == 'findyao'){
            textMaxW = 70
        }

        return (
            <View ref={(e)=>{this.topView = e}}
                  style={[styles.leftCenterView,{marginTop:iphoneTopMargin()-10,paddingBottom:10,justifyContent: 'space-between'}]}>
                <TouchableOpacity style={[styles.leftCenterView,{top:5}]} activeOpacity={1}
                                  onPress={this._startSelectLocation}>
                    <Image source={require('../../img/sy_location_icon.png')}
                           defaultSource={require('../../img/sy_location_icon.png')}
                           style={{marginLeft:16,height:18,width:13,resizeMode:'contain'}}/>
                    <Text ref={(e)=>this.locationText=e} style={{color:'white',fontSize:14,marginLeft:5,maxWidth:textMaxW}}
                          numberOfLines={1}>{this.state.address}</Text>
                    <TouchableOpacity activeOpacity={1} onPress={()=>{this._locationRefresh()}}>
                        <Animated.Image source={require('../../img/refresh.png')}
                               defaultSource={require('../../img/refresh.png')}
                               style={{marginLeft:6,height:18,width:13,resizeMode:'contain',
                                   transform: [
                                       { rotateZ: this.state.refreshRotateY.interpolate({
                                               inputRange: [0, 1],
                                               outputRange: ['360deg', '0deg']}) },{ perspective: 1000 }
                                   ]}}/>
                    </TouchableOpacity>
                </TouchableOpacity>
                <View style={[styles.leftCenterView,{top:5}]}>
                        {this.renderMessageRedpoint()}
                </View>
            </View>
        )
    }

    /** 点击刷新icon*/
    _locationRefresh() {
        this.state.refreshRotateY.stopAnimation(value => {
            Animated.spring(this.state.refreshRotateY, {
                toValue: Math.round(value) + 1,
                duration: 500,
            }).start(()=>{
            })
        })
    }

    renderMessageRedpoint() {

        return (
            <YFWMessageRedPointView isWhiteBg={true} navigation={this.props.navigation} callBack={()=>{this.clickMessageMethod()}} />
        )
    }

    _startSelectLocation = ()=> {

    }

    _changeAddress(address, lat, lng) {
        this.setState({
            address: address
        })
    }

    _searchMethod() {
        if (this.props.onSearchClick) {
            this.props.onSearchClick();
        }

    }
    /**
     * TODO 获取定位
     * @param {*} isRefresh 
     */
    _getAddress(isRefresh) {
        
    }


    clickShareMethod() {

        if (this.props.onShareClick) {
            this.props.onShareClick();
        }

    }
    clickMessageMethod = ()=> {
        if (this.props.onMessageClick) {
            this.props.onMessageClick();
        }
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "flex-start",
        alignItems: 'stretch',
        backgroundColor: '#16c08e',
    },
    backStyle: {
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        width: kScreenWidth,
        backgroundColor: '#1fdb9b',
    },
    inputStyle: {
        height: 30,
        width: Dimensions.get('window').width - 20,
        borderRadius: 5,
        borderColor: 'white',
        backgroundColor: 'white',
    },
    titleStyle: {
        flexDirection: 'row',
        backgroundColor: '#16c08e',
        padding: 10
    },
    textStyle: {
        fontSize: 16,
        textAlign: 'center',
        color: 'white',
        marginLeft: 30,
        width: Dimensions.get('window').width - 120,
    },
    imgTouchStyle: {
        height: 30,
        width: 30,
    },
    imgStyle: {
        height: 18,
        width: 18,
    },
    leftCenterView:{
        flexDirection:'row',
        alignItems:'center',
    },
    centerItem:{
        alignItems:'center',
        justifyContent:'center'
    },
});