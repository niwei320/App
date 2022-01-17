import React from 'react'
import {StackActions, NavigationActions} from 'react-navigation';
import {
    Platform,
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    Modal,
    Dimensions,
    DeviceEventEmitter,
    NativeModules,
} from 'react-native'
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import {iphoneTopMargin, isNotEmpty, mobClick, safe, safeObj} from "../PublicModule/Util/YFWPublicFunction"
import {doAfterLogin, pushNavigation} from "../Utils/YFWJumpRouting";
import YFWNativeManager from "../Utils/YFWNativeManager";
import {darkTextColor} from "../Utils/YFWColor";
const {StatusBarManager} = NativeModules;

const {width, height} = Dimensions.get('window');


let mwidth = 130;
let mheight = 230;
let headerH = (Platform.OS === 'ios') ? (44+iphoneTopMargin()-20) :Platform.Version > 19? 50+StatusBarManager.HEIGHT -18:50-18;
const marginTop = headerH-4;

export default class UtilityMenu extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isVisible: false,
            viewShow:true,
            move:'',
            showShare: false,
            sharData: {}
        }
    }

    componentDidMount() {
        this.showMenu = DeviceEventEmitter.addListener('OpenUtilityMenu',(value)=>{
            this.showView(value)
        });
        this.changeMenuViewState = DeviceEventEmitter.addListener('changeMenuViewState',(action)=>{
            this.setState({
                viewShow:action
            })
        });

        if (this.props.getNavigation) {
            this.navigation = this.props.getNavigation();
        }

    }

    componentWillUnmount() {
        if (this.showMenu.isActive) {
            this.showMenu.remove();
        }
        if (this.changeMenuViewState.isActive) {
            this.changeMenuViewState.remove();
        }

    }


    // ====== Action ======

    showView(value){
        let move = ''
        let showShare = false
        let sharData = {}
        if (isNotEmpty(value)) {
            let type = safe(value.type)
            if (type == 'move') {
                move = type
            } else if (type == 'share') {
                showShare = true
                sharData = safeObj(value.data)
            }
        }
        
        this.setState({
            isVisible: true,
            move:move,
            showShare: showShare,
            sharData: sharData
        });

    }

    closeModal() {
        this.setState({
            isVisible: false
        });
    }

    _toMessage() {
        this.closeModal()
        const {navigate} = this.navigation;

        doAfterLogin(navigate,()=>{
            navigate('YFWMyMessageController')
        });

    }

    _toHome() {
        this.closeModal()
        YFWNativeManager.removeVC();

        this.navigation.popToTop();

        const resetActionTab = NavigationActions.navigate({ routeName: 'HomePageNav' });
        this.navigation.dispatch(resetActionTab);

    }

    _toSearch() {
        this.closeModal()
        const {navigate} = this.navigation;
        let params = {
            type: 'get_search'
        }
        if (YFWUserInfoManager.ShareInstance().isShopMember()) {
            params.shop_id = YFWUserInfoManager.ShareInstance().getErpShopID()
            params.isShopMember = true
        }
        pushNavigation(navigate, params);
    }

    _toMenu() {
        this.closeModal()
        const {navigate} = this.navigation;

        let badge = new Map();
        badge.set('index', 0);
        navigate('YFWCategoryController', {state: badge});
    }

    _toShopCar() {
        this.closeModal()
        YFWNativeManager.removeVC();

        this.navigation.popToTop();

        const resetActionTab = NavigationActions.navigate({ routeName: 'ShopCarNav' });
        this.navigation.dispatch(resetActionTab);

    }

    _toUserCenter() {
        this.closeModal()
        YFWNativeManager.removeVC();

        this.navigation.popToTop();

        const resetActionTab = NavigationActions.navigate({ routeName: 'UserCenterNav' });
        this.navigation.dispatch(resetActionTab);

    }

    _toShare() {
        mobClick('store-share')
        this.closeModal()
        DeviceEventEmitter.emit('OpenShareView', this.state.sharData);
    }

    // ====== View ======

    render(){
        if (this.state.viewShow) {
            return (
                <Modal
                    transparent={true}
                    visible={this.state.isVisible}
                    animationType={'fade'}
                    onRequestClose={() => this.closeModal()}>
                    <TouchableOpacity style={styles.container} activeOpacity={1} onPress={() => this.closeModal()}>

                        <View style={[styles.modal,(this.state.move=='move')?{top:marginTop+7}:{top:marginTop}]}>

                            {this._renderRowItem('消息', require('../../img/pop1.png'), ()=> {
                                this._toMessage()
                            })}
                            {this._renderRowItem('首页', require('../../img/pop2.png'), ()=> {
                                this._toHome()
                            })}
                            {this._renderRowItem('搜索', require('../../img/pop7.png'), ()=> {
                                this._toSearch()
                            })}
                            {this._renderRowItem('购物车', require('../../img/pop5.png'), ()=> {
                                this._toShopCar()
                            })}
                            {this._renderRowItem('我的', require('../../img/pop6.png'), ()=> {
                                this._toUserCenter()
                            })}
                            {this.state.showShare && this._renderRowItem('分享', require('../../img/pop8.png'), ()=> {
                                this._toShare()
                            })}

                        </View>

                    </TouchableOpacity>
                </Modal>
            )
        }else {
            return(<View style={{width:0,height:0}}/>)
        }
    }



    _renderRowItem(title,iamge,action){

        return(
            <View style={{flex:1}}>
                <TouchableOpacity activeOpacity={1} onPress={action}
                                  style={styles.itemView}>
                    <Image style={styles.imgStyle} source={iamge}/>
                    <Text style={styles.textStyle}>{title}</Text>
                </TouchableOpacity>
            </View>
        )
    }




}
const styles = StyleSheet.create({
    container: {
        width: width,
        height: height,
    },
    modal: {
        backgroundColor: 'white',
        width: mwidth,
        height:mheight,
        position: 'absolute',
        left: width - mwidth - 10,
        top: marginTop,
        justifyContent: 'center',
        opacity: 0.86,
        shadowColor: "rgba(0, 0, 0, 0.09)",
        shadowOffset: {
            width: 0,
            height: 9
        },
        elevation:2,
        shadowRadius: 22,
        shadowOpacity: 1,
        borderRadius: 3,
    },
    itemView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    textStyle: {
        color: darkTextColor(),
        fontSize: 14,
        width:70,
        marginLeft: 13,
    },
    imgStyle: {
        width: 20,
        height: 20,
        marginLeft: 15,
        resizeMode: 'contain',
    }
});