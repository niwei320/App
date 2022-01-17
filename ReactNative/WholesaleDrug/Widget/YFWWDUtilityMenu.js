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
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import {iphoneTopMargin, isNotEmpty} from "../../PublicModule/Util/YFWPublicFunction"
import YFWNativeManager from "../../Utils/YFWNativeManager";
import {darkTextColor} from "../../Utils/YFWColor";
import { pushWDNavigation ,doAfterLogin, kRoute_message_home, kRoute_search, kRoute_browsing_history} from '../YFWWDJumpRouting';
import { YFWImageConst } from '../Images/YFWImageConst';
const {StatusBarManager} = NativeModules;

const {width, height} = Dimensions.get('window');


let mwidth = 130;
let mheight = 230;
let headerH = (Platform.OS === 'ios') ? (44+iphoneTopMargin()-20) :Platform.Version > 19? 50+StatusBarManager.HEIGHT -18:50-18;
const marginTop = headerH-4;

export default class YFWWDUtilityMenu extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isVisible: false,
            viewShow:true,
            move:'',
            isStore: false,
            storeInfo: undefined
        }
    }

    componentDidMount() {
        this.showMenu = DeviceEventEmitter.addListener('OpenWDUtilityMenu',(value)=>{
            if (isNotEmpty(value)) {
                this.setState({ isStore: value.type=='store', storeInfo: value.data })
            }
            this.showView(value)
        });
        this.changeMenuViewState = DeviceEventEmitter.addListener('changeWDMenuViewState',(action)=>{
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
        let move = (value?.type=='move')?'move':''
        this.setState({
            isVisible: true,
            move:move
        });

    }

    closeModal() {
        this.setState({
            isVisible: false
        });
    }

    _toRecenty() {
        this.closeModal()
        const {navigate} = this.navigation;
        doAfterLogin(navigate,()=>{
            pushWDNavigation(navigate, {type:kRoute_browsing_history})
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
            type: kRoute_search
        }
        if (YFWUserInfoManager.ShareInstance().isShopMember()) {
            params.shop_id = YFWUserInfoManager.ShareInstance().getErpShopID()
            params.isShopMember = true
        }
        pushWDNavigation(navigate, params);
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

    _toShare () {
        this.closeModal()
        let param = {
            page : 'shop',
            type : 'poster',
            title : this.state.storeInfo?.storeName || '',
            content : '',
            shop_id: this.state.storeInfo?.shopId || '',
            shareData: this.state.storeInfo,
            from : 'Shop',
            url: '',
            isShowHead: false
        };

        DeviceEventEmitter.emit('WDOpenShareView',param);
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

                            {this.state.isStore && this._renderRowItem('店铺分享', YFWImageConst.Share_shop, ()=> {
                                this._toShare()
                            })}
                            {this._renderRowItem('批发市场', YFWImageConst.Icon_wd_pop1, ()=> {
                                this._toHome()
                            })}
                            {this._renderRowItem('最近浏览', YFWImageConst.Icon_wd_pop2, ()=> {
                                this._toRecenty()
                            })}
                            {this._renderRowItem('搜索', YFWImageConst.Icon_wd_pop3, ()=> {
                                this._toSearch()
                            })}
                            {this._renderRowItem('购物车', YFWImageConst.Icon_wd_pop4, ()=> {
                                this._toShopCar()
                            })}
                            {this._renderRowItem('我的', YFWImageConst.Icon_wd_pop5, ()=> {
                                this._toUserCenter()
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