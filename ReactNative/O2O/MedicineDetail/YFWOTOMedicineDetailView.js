import React, { Component } from 'react'
import { NativeModules, Platform, Text, TouchableOpacity, View, Image, ScrollView, StyleSheet, UIManager, FlatList, DeviceEventEmitter } from 'react-native'
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import Swiper from 'react-native-swiper';
import { convertImg, getStatusBarHeight, isAndroid, isEmpty, isIphoneX, kScreenHeight, kScreenWidth, safe, safeArray, safeObj, kStyleOTO, iphoneBottomMargin, isNotEmpty } from '../../PublicModule/Util/YFWPublicFunction'
import YFWDiscountText from '../../PublicModule/Widge/YFWDiscountText';
import YFWTitleView from '../../PublicModule/Widge/YFWTitleView';
import { toDecimal } from '../../Utils/ConvertUtils';
import { BaseStyles } from '../../Utils/YFWBaseCssStyle';
import { backGroundColor, darkLightColor, darkNomalColor, darkTextColor, separatorColor, yfwGreenColor, yfwOrangeColor } from '../../Utils/YFWColor';
import StatusView, { DISMISS_STATUS, SHOW_LOADING } from '../../widget/StatusView'
import { IMG_LOADING } from '../../YFWHomePage';
import YFWOTOStoreCart from '../Store/YFWOTOStoreCart';
import YFWOTOPopupMenu from '../widgets/YFWOTOPopupMenu';
import BigPictureView from '../../widget/BigPictureView';
import YFWToast from "../../Utils/YFWToast";
import { doAfterLogin } from '../../Utils/YFWJumpRouting';

const { StatusBarManager } = NativeModules;

export default class YFWOTOMedicineDetailView extends Component {
    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: false,
        header: null,
    });


    componentDidMount() {
        let { viewModel } = this.props
        let { navigation, selectDetailTabIndex } = viewModel
        this.showWhite =false
        this.hiddenTitle =false
    }

    toShopCarMethod() {

    }

    changePage(index) {
        this.headTabSelect = true;

        if (index == 0) {
            this.vp.scrollTo({ x: 0, y: 0 })
        } else {
            this.vp.scrollTo({ x: 0, y: this.infoViewPageY-60 })
        }

        this._setPage(index)
    }

    clickMethods(type) {
        let { viewModel } = this.props;
        viewModel.clickMethods && viewModel.clickMethods(type)
    }


    commitViewLayout(e) {
        UIManager.measure(e.target, (x, y, width, height, pageX, pageY) => {
            let navHeight = 0
            if (Platform.OS == 'android') {
                navHeight = Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50
            } else {
                navHeight = isIphoneX() ? 88 : 64;
            }
            this.infoViewPageY = pageY+height+10-navHeight
        })
    }

    _setPage(index) {
        if (index != this.selectIndex) {
            this.selectIndex = index
            this.setState({})
        }
    }

    scrollLister(event) {
        let { viewModel } = this.props
        let { navigation } = viewModel

        let contentY = event.nativeEvent.contentOffset.y;
        if (contentY > 60) {
            if (!this.showWhite || this.hiddenTitle) {
                this.showWhite = true
                this.hiddenTitle = false
                this.setState({})
            }
        } else {
            if (this.showWhite || !this.hiddenTitle) {
                this.showWhite = false
                this.hiddenTitle = true
                this.setState({})
            }
        }
        if (!this.headTabSelect) {
            if (this.infoViewPageY && contentY >= this.infoViewPageY-60) {
                this._setPage(2)
            } else {
                this._setPage(0)
            }
        }
    }


    render() {
        let { viewModel } = this.props
        let {navigation } = viewModel
        let extraHear = getStatusBarHeight() + 50 //自定头部及开启定位tip偏移量
        return (
            <View flex={1} >
                <View style={{ flex: 1 }}>
                    <ScrollView style={{ flex: 1, backgroundColor: "#fafafa" }}
                        ref={(item) => { this.vp = item }}
                        bounces={false}
                        onScroll={(e) => { this.scrollLister(e) }}
                        scrollEventThrottle={50}
                        onMomentumScrollEnd={() => {
                            this.headTabSelect = false
                            this.selectDetailTab = false
                        }}
                        stickyHeaderIndices={[1]}
                        onContentSizeChange={() => {
                            if (this.selectDetailTab) {
                                this.vp.scrollTo({ x: 0, y: this.infoViewPageY -60 })
                            }
                        }}
                    >
                        <View style={{ flex: 1 ,zIndex:999}}>
                            <YFWOTOMedicineDetailInfo flex={1}
                                viewModel={viewModel}
                                dismissLayer={() => { this.layer && this.layer.disMiss() }}
                                showLayer={() => { this.layer && this.layer.show() }}
                                ref={(item) => { this.goodsInfoView = item }}
                            />
                        </View>
                        <View style={{ width:kScreenWidth,zIndex:1, top: -extraHear }} onLayout={(e) => { this.commitViewLayout && this.commitViewLayout(e) }}>
                            {this._renderDetailInfoTabPatch()}
                            {this._renderDetailInfoTabView()}
                            <View style={{ width: kScreenWidth, height: 0.5, backgroundColor: "#fafafa" }}></View>
                        </View>
                        <View style={{ flex: 1, top: -extraHear }}>
                            <YFWOTOMedicineDetailInfoDetail viewModel={viewModel} flex={1} ref={'detailInfoDetail'} />
                        </View>

                    </ScrollView>

                    {this.renderHeader()}
                    {this.renderBottomToolView()}
                </View>


                {this.renderStatus()}
                <YFWOTOPopupMenu ref={e => this.menu = e} navigation={navigation} />
            </View>
        )
    }

    renderBottomToolView() {
        let { viewModel } = this.props
        let { navigation,storeViewModel } = viewModel
        return (
            <View style={{ height: isIphoneX() ? 77 : 60 }}>
                <YFWOTOStoreCart
                    navigation={navigation}
                    data={storeViewModel.storeCartData}
                    onEditQuantity={(medicine, quantity) => viewModel.clickMethods && viewModel.clickMethods('changeCount', {medicine:medicine,quantity:quantity})}
                    onClearCart={()=>viewModel.clickMethods && viewModel.clickMethods('clearCount')}
                    onMedicineItem={(medicine)=>viewModel.clickMethods && viewModel.clickMethods('medicineDetail', medicine)}
                />
            </View>
        )
    }

    _renderDetailInfoTabView() {
        let { viewModel } = this.props
        let { navigation, medicineDetailModel, selectDetailTabIndex } = viewModel
        let { dict_bool_lock } = medicineDetailModel
        let isShow = dict_bool_lock == 1

        return (
            <View style={{ width: kScreenWidth, height: 50, marginTop: -1, backgroundColor: '#fff', justifyContent: 'space-evenly', alignItems: 'center', flexDirection: 'row', paddingBottom: 5 }}>
                <TouchableOpacity activeOpacity={1} style={{ justifyContent: 'center', alignItems: 'center', height: 50 }} onPress={() => { this._changeIndex(0) }}>
                    <YFWTitleView type='tab' from={kStyleOTO} title={'基本信息'} style_title={{ width: 100, fontSize: 15 }} hiddenBgImage={selectDetailTabIndex != 0} />
                </TouchableOpacity>
                {isShow ? <TouchableOpacity activeOpacity={1} style={{ justifyContent: 'center', alignItems: 'center', height: 50 }} onPress={() => { this._changeIndex(1) }}>
                    <YFWTitleView type='tab' from={kStyleOTO} title={'说明书'} style_title={{ width: 70, fontSize: 15 }} hiddenBgImage={selectDetailTabIndex != 1} />
                </TouchableOpacity> : null}
                <TouchableOpacity activeOpacity={1} style={{ justifyContent: 'center', alignItems: 'center', height: 50 }} onPress={() => { this._changeIndex(isShow ? 2 : 1) }}>
                    <YFWTitleView from={kStyleOTO} type='tab' title={'服务保障'} style_title={{ width: 100, fontSize: 15 }} hiddenBgImage={selectDetailTabIndex != (isShow ? 2 : 1)} />
                </TouchableOpacity>
            </View>
        )
    }

    _changeIndex(index) {
        let { viewModel } = this.props
        let { navigation, medicineDetailModel, selectDetailTabIndex } = viewModel
        if (selectDetailTabIndex != index) {
            this.selectDetailTab = true;
            viewModel.clickMethods && viewModel.clickMethods('detailTabClick', index)
        }
    }

    _renderDetailInfoTabPatch() { //解决 DetailInfoTab 顶部悬停问题
        let extraHear = getStatusBarHeight() + 50//自定头部及开启定位tip偏移量
        return (
            <View style={{ width: 100, height: extraHear, backgroundColor: "transparent"}}/>
        )
    }

    /**
     * 返回一个自定义的头部
     * @returns {*}
     */
    renderHeader() {
        let { viewModel } = this.props
        let { navigation, shopcartCount } = viewModel
        if(Number(shopcartCount) > 99) shopcartCount = '99+'
        let headerStyle = {
            backgroundColor: this.showWhite ? 'white' : 'transparent',
            elevation: 0,
            height: getStatusBarHeight() + 50,
            paddingTop: getStatusBarHeight(),
            borderBottomWidth: 0
        }
        return (
            <View ref={(item) => this.titleView = item} style={[headerStyle, { width: kScreenWidth, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: 0 }]}>
                <TouchableOpacity style={{ width: 88, height: 29, marginLeft: 13, justifyContent: 'center' }} hitSlop={{ left: 15, top: 10, bottom: 5, right: -30 }} onPress={() => viewModel.clickMethods&&viewModel.clickMethods('goBack')}>
                    {this.showWhite ? <Image ref={(item) => this.titleBack = item} style={{ width: 11, height: 20 }} source={require('../../../img/icon_back_gray.png')} /> : <Image style={{ width: 29, height: 29 }} source={require('../../../img/sx_icon_back.png')} />}
                </TouchableOpacity>
                {this.showWhite && !this.hiddenTitle ?
                    <View ref={(item) => this.titleTextView = item} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                        <TouchableOpacity hitSlop={{ left: 10, top: 10, bottom: 0, right: 5 }} style={{}} activeOpacity={1} onPress={() => this.changePage(0)}>
                            <Text ref={(item) => this.titleText1 = item} style={{ color: this.selectIndex == 0 ? 'rgb(87,153,247)' : '#333', fontSize: 17 }}>{'商品'}</Text>
                            <LinearGradient
                                ref={(item) => this.titleTextLine1 = item}
                                colors={['rgb(87,153,247)','rgb(87,153,247)']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                locations={[0, 0.38, 1]}
                                style={{ width: 35, height: 4, marginTop: 6, opacity: this.selectIndex == 0 ? 1 : 0 }}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity hitSlop={{ left: 5, top: 10, bottom: 0, right: 5 }} style={{ marginLeft: 20 }} activeOpacity={1} onPress={() => this.changePage(2)}>
                            <Text ref={(item) => this.titleText3 = item} style={{ color: this.selectIndex == 2 ? 'rgb(87,153,247)' : '#333', fontSize: 17 }}>{'详情'}</Text>
                            <LinearGradient
                                ref={(item) => this.titleTextLine3 = item}
                                colors={['rgb(87,153,247)','rgb(87,153,247)']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                locations={[0, 0.38, 1]}
                                style={{ width: 35, height: 4, marginTop: 6, opacity: this.selectIndex == 2 ? 1 : 0 }}
                            />
                        </TouchableOpacity>
                    </View> : <View />}
                <View style={{ width: 88, height: 29, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                    <TouchableOpacity hitSlop={{ left: 5, top: 10, bottom: 0, right: 5 }} style={{ width: 40, height: 29, justifyContent: 'center', alignItems: 'center' }} onPress={() => viewModel.clickMethods&&viewModel.clickMethods('toShopCar')}>
                        {this.showWhite ?
                            <Image ref={(item) => this.titleShopCar = item} style={{ width: 19, height: 18 }} source={require('../../../img/sx_icon_cart_up.png')}></Image> :
                            <Image style={{ width: 29, height: 29 }} source={require('../../../img/sx_icon_cart.png')}></Image>
                        }
                        {shopcartCount ?
                            <View style={{ position: 'absolute', borderRadius: 8, height: 16, minWidth: 16, maxWidth: 40, backgroundColor: '#ff3300', right: shopcartCount.length > 2 ? -10 : -5, top: -5, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: 'white', fontSize: 10, padding: 3, lineHeight: 10, textAlign: 'center', fontWeight: '500' }} numberOfLines={1}>{shopcartCount}</Text>
                            </View>
                            : null}

                    </TouchableOpacity>
                    <TouchableOpacity accessibilityLabel='medicine_detail_more' hitSlop={{ left: 5, top: 10, bottom: 0, right: 5 }} style={{ width: 29, height: 29, marginLeft: 17, marginRight: 13, justifyContent: 'center', alignItems: 'center' }} onPress={() => this.menu&&this.menu.show&&this.menu.show()}>
                        {this.showWhite ?
                            <Image ref={(item) => this.titleMore = item} style={{ width: 22, height: 5, resizeMode: 'stretch' }} source={require('../../../img/icon_sandian_gray.png')}></Image> :
                            <Image style={{ width: 29, height: 29 }} source={require('../../../img/sx_icon_more.png')}></Image>
                        }
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    /**
     * 返回状态页，如果传了大图，就显示大图状态，如果没传就显示自定义状态页
     * @returns {*}
     */
    renderStatus() {
        let { viewModel } = this.props
        let { showLoading, defaultImg } = viewModel
        if (defaultImg) {
            return this.renderStatusImg()
        } else {
            return <StatusView ref={(item) => this.statusView = item}
                initStatus={showLoading ? SHOW_LOADING : DISMISS_STATUS}
                marginTop={Platform.OS === 'ios' ? 0 : (Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0)}
                retry={() => {
                    this.fetchAllDataFromServer()
                }} />
        }
    }

    renderStatusImg() {
        let { viewModel } = this.props
        let { showLoading, defaultImg } = viewModel
        if (showLoading) {
            let extraHeight = Platform.OS == 'ios' ? 0 : (Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0)
            return (
                <View style={{ width: kScreenWidth, height: kScreenHeight + extraHeight, backgroundColor: 'white', position: 'absolute' }}>
                    <Image style={{ width: kScreenWidth, height: 230, resizeMode: 'contain', marginTop: extraHeight + 50 }} source={{ uri: defaultImg }} resizeMethod={'resize'} />
                    <View style={[BaseStyles.centerItem, { width: kScreenWidth, height: kScreenHeight, position: 'absolute' }]}>
                        <View style={[{ position: 'absolute', top: '50%', bottom: "50%", marginLeft: 'auto', marginRight: 'auto' }, BaseStyles.centerItem]}>
                            <Image style={{ height: 40, width: 40, resizeMode: 'contain' }} source={IMG_LOADING} />
                        </View>
                    </View>
                </View>
            )
        }
    }


    fetchAllDataFromServer() {

    }


}

class YFWOTOMedicineDetailInfoDetail extends Component {


    render() {
        let { viewModel } = this.props
        let { navigation, medicineDetailInfoDetailModel, selectDetailTabIndex } = viewModel
        let dataSource = safeArray(medicineDetailInfoDetailModel).length > 0 ? medicineDetailInfoDetailModel[selectDetailTabIndex] : []
        return (
            <View style={{ flex: 1 ,minHeight:600, backgroundColor: backGroundColor() }}>
                <FlatList
                    removeClippedSubviews
                    style={{ flex: 1}}
                    data={dataSource.items}
                    renderItem={this._renderCell.bind(this)}
                />
            </View>
        );
    }

    /** 渲染cell */
    _renderCell({ item }) {
        let styles = YFWOTOMedicineDetailInfoDetail_Styles
        return (
            <View style={{ flex: 1 }}>
                {item.title ?
                    <View style={{ flex: 1, paddingTop: 18, paddingBottom: 10, marginHorizontal: 13 }}>
                        <Text style={{ color: darkTextColor(), fontSize: 13, fontWeight: 'bold' }}>{item.title}</Text>
                    </View> : null}
                <FlatList
                    removeClippedSubviews
                    style={item.isRadius ? [styles.contentRadius, { flex: 1, paddingTop: 15 }] : { flex: 1 }}
                    data={item.items}
                    renderItem={this._renderItemCell.bind(this)}
                    numColumns={item.numColumns}
                />
            </View>
        )
    }

    _renderItemCell(item) {
        let model = item.item

        if (model.cell == 'YFWGoodsDetailsDescriptionCell') {
            return this._renderDescriptionCell(item)

        } else if (model.cell == 'YFWGoodsDetailsAptitudeCell') {
            return this._renderAptitudeCell(item)

        } else if (model.cell == 'YFWGoodsDetailsNormalCell') {
            return this._renderNormalCell(item)

        } else if (model.cell == 'YFWGoodsDetailsImageCell') {
            return this._renderImageCell(item)

        } else if (model.cell == 'YFWGoodsDetailsPubImageCell') {
            return this._renderPubImageCell(item)

        } else if (model.cell == 'YFWGoodsDetailsAptitudeImageCell') {
            return this._renderAptitudeImageCell(item)

        } else if (model.cell == 'YFWGoodsDetailsDescriptionLineCell') {
            return this._renderDescriptionLineCell(item)

        } else if (model.cell == 'YFWGoodsDetailsDescriptionPointCell') {
            return this._renderDescriptionPointCell(item)

        } else {
            return <View />
        }
    }

    /** 平台资质cell */
    _renderAptitudeCell(item) {
        let model = item.item
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => { this._platAptitudeClick(model) }} style={{ overflow: 'hidden', borderBottomLeftRadius: 7, borderBottomRightRadius: 7 }}>
                <Image source={{ uri: model.icon }} style={{ width: kScreenWidth, height: 70 / 375.0 * kScreenWidth, resizeMode: 'stretch' }} />
            </TouchableOpacity>
        )
    }

    /** 平台资质证书查看 */
    _platAptitudeClick(model) {
        let { viewModel } = this.props;
        viewModel.clickMethods && viewModel.clickMethods('to_zzh5', model)
    }

    /** 描述性cell 上方粗体标题、下方中黑文字 */
    _renderDescriptionCell(item) {
        let model = item.item

        return (
            <View style={{ flex: 1, paddingHorizontal: 15 }}>
                <View style={{ flexDirection: 'row', paddingBottom: 8, alignItems: 'center' }}>
                    {model.icon ? <Image source={model.icon} style={{ width: 15, height: 15, marginRight: 3, resizeMode: 'contain' }} /> : null}
                    <Text style={{ flex: 1, color: darkTextColor(), fontSize: 12, fontWeight: 'bold' }}>{model.title}</Text>
                </View>
                <View style={{ flex: 1, paddingBottom: 15 }}>
                    <Text style={{ color: darkNomalColor(), fontSize: 12, lineHeight: 17 }}>{model.content}</Text>
                </View>
            </View>
        )
    }

    /** 普通cell 左边浅黑标题、右边黑色副标题 */
    _renderNormalCell(item) {
        let model = item.item

        return (
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 15 }}>
                <Text style={{ width: 70, color: darkLightColor(), fontSize: 12 }}>{model.title}</Text>
                <Text style={{ flex: 1, color: darkTextColor(), fontSize: 12 }}>{model.subtitle}</Text>
            </View>
        )
    }

    /** 图片cell  */
    _renderImageCell(item) {
        let styles = YFWOTOMedicineDetailInfoDetail_Styles
        let model = item.item
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => { }} style={[styles.contentRadius, { flex: 1, padding: model.padding, paddingTop: model.padding - 15, alignItems: 'center', justifyContent: 'center', marginTop: 10, marginHorizontal: 13 }]}>
                <Image source={{ uri: model.image_url }} style={{ width: model.width, height: model.height, resizeMode: 'contain' }} resizeMethod={'resize'} />
            </TouchableOpacity>
        )
    }

    /** pub图片cell  */
    _renderPubImageCell(item) {
        let model = item.item

        return (
            <TouchableOpacity activeOpacity={1} onPress={() => { this._clickShopImages(item, true) }}>
                <FastImage
                    source={{ uri: model.image_url }}
                    style={{ width: model.width, height: model.height, opacity: isAndroid() ? model.opacity : undefined }}
                    resizeMode={FastImage.resizeMode.stretch}
                    onLoad={e => {
                        if (model.onLoad == 0) {
                            const size = e.nativeEvent
                            model.height = kScreenWidth * size.height / size.width
                            model.width = kScreenWidth
                            model.onLoad = 1
                            model.opacity = 1
                            this.setState()
                        }
                    }}
                />
            </TouchableOpacity>
        )
    }

    /** 图片带文字的cell  */
    _renderAptitudeImageCell(item) {
        let model = item.item
        let styles = YFWOTOMedicineDetailInfoDetail_Styles
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => { }} style={[styles.contentRadius, { width: (kScreenWidth - 36) / 2, backgroundColor: '#fff', marginBottom: 10, marginLeft: item.index % 2 == 0 ? 13 : 10, paddingTop: 10, alignItems: 'center', justifyContent: 'center' }]}>
                <Image source={{ uri: (safe(model.image_url)) }} style={{ width: 133 / 375.0 * kScreenWidth, height: 133 / 375.0 * kScreenWidth, resizeMode: 'contain' }} resizeMethod={'resize'} />
                <Text style={{ marginHorizontal: 15, paddingBottom: 15, color: darkTextColor(), fontSize: 12 }} numberOfLines={1}>{model.image_name}</Text>
            </TouchableOpacity>
        )
    }

    /** 描述性cell 上方黑色标题、下方左边带点颜色描述 */
    _renderDescriptionPointCell(item) {
        let model = item.item

        return (
            <View style={{ flex: 1, paddingHorizontal: 15 }}>
                <Text style={{ flex: 1, color: darkTextColor(), fontSize: 12, fontWeight: 'bold', paddingBottom: 8 }}>{model.title}</Text>
                <View style={{ flex: 1, paddingBottom: 15 }}>
                    {this._renderDescriptionPointItemView(model)}
                </View>
            </View>
        )
    }


    _renderDescriptionPointItemView(model) {
        let items = []
        for (let index = 0; index < model.items.length; index++) {
            const element = model.items[index];
            items.push(
                <View key={index + 'c'} style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'row' }}>
                    <View style={{ width: 6, height: 6, backgroundColor: index % 2 == 0 ? yfwOrangeColor() : yfwGreenColor(), marginTop: 6, marginRight: 5, borderRadius: 3 }}></View>
                    <Text style={{ flex: 1, color: darkNomalColor(), fontSize: 12, lineHeight: 17 }}>{element}</Text>
                </View>
            )
        }
        return items
    }

    /** 描述性cell 上方黑色标题、下方左边带点颜色、竖线描述 */
    _renderDescriptionLineCell(item) {
        let model = item.item

        return (
            <View style={{ flex: 1, paddingHorizontal: 15 }}>
                <Text style={{ flex: 1, color: darkTextColor(), fontSize: 12, fontWeight: 'bold', paddingBottom: 8 }}>{model.title}</Text>
                <View style={{ flex: 1, paddingBottom: 15 }}>
                    {this._renderDescriptionLineItemView(model)}
                </View>
            </View>
        )
    }

    _renderDescriptionLineItemView(model) {
        let items = []
        for (let index = 0; index < model.items.length; index++) {
            const element = model.items[index];
            items.push(
                <View key={index + 'v'} style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'row' }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center', marginRight: 5, }}>
                        <View style={{ width: 1, height: 4, backgroundColor: index == 0 ? '#fff' : '#dddddd' }}></View>
                        <View style={{ width: 6, height: 6, backgroundColor: yfwGreenColor(), marginVertical: 2, borderRadius: 3 }}></View>
                        <View style={{ width: 1, flex: 1, backgroundColor: index == model.items.length - 1 ? '#fff' : '#dddddd' }}></View>
                    </View>
                    <Text style={{ flex: 1, color: darkNomalColor(), fontSize: 12, lineHeight: 17 }}>{element}</Text>
                </View>
            )
        }
        return items
    }


}

const YFWOTOMedicineDetailInfoDetail_Styles = StyleSheet.create({
    contentRadius: {
        borderRadius: 7,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(206, 206, 206, 0.28)",
        shadowOffset: {
            width: 1,
            height: 1
        },
        shadowRadius: 4,
        shadowOpacity: 1
    }
});



class YFWOTOMedicineDetailInfo extends Component {

    componentWillReceiveProps(props) {
        if (props != this.props) {
            this.props = props
            this.setState({})
        }
    }

    clickMethods(type) {
        let { viewModel } = this.props;
        let { navigation, medicineDetailModel } = viewModel
        doAfterLogin(navigation.navigate,()=>{
            viewModel.clickMethods && viewModel.clickMethods(type)
        })
    }

    render() {
        let styles = YFWOTOMedicineDetailInfo_Styles
        let { viewModel } = this.props
        let { navigation, medicineDetailModel } = viewModel
        let { troche_type, sale_count, Standard } = medicineDetailModel



        const data = safeObj(this.props.data)
        let headerHeight = getStatusBarHeight() + 50
        return (
            <View style={{ flex: 1, backgroundColor: backGroundColor() }}>
                <View style={{ flex: 1 }}>
                    <View style={[styles.item, { backgroundColor: 'white' }]} height={240 + headerHeight}>
                        <YFWOTOMedicineDetailInfoBarnerView viewModel={viewModel} />
                    </View>
                    <View style={{ backgroundColor: 'white' }}>
                        <View style={{ width: kScreenWidth, flexDirection: 'row', paddingLeft: 15, paddingRight: 0, marginTop: 10 }}>
                            {/*返回标题*/}
                            <View style={{ flex: 1 }}>
                                {this.renderTitle()}
                                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                    <Text style={{ color: 'rgb(153,153,153)', fontSize: 12 }}>{troche_type}</Text>
                                    <Text style={{ color: 'rgb(153,153,153)', fontSize: 12, marginLeft: 5 }}>{Standard}</Text>
                                    {/* <Text style={{ color: 'rgb(153,153,153)', fontSize: 12, marginLeft: 5 }}>{'月销 ' + sale_count}</Text> */}
                                </View>
                                { this.renderMaxBuy() }
                            </View>
                        </View>
                        {this.renderPrice()}
                    </View>
                    <View style={{ backgroundColor: '#fafafa', height: 10, width: kScreenWidth }} />
                    {this.renderApplicability()}
                    <View style={{ backgroundColor: '#fafafa', height: 10, width: kScreenWidth }} />
                </View>
            </View>
        );
    }

     /**
     * 返回最大和限购数量
     * @returns {*}
     */
    renderMaxBuy() {
        let { viewModel } = this.props
        let { medicineDetailModel } = viewModel
        let { max_buy_qty, lbuy_no, limit_buy_prompt ,reserve,period_to_Date} = medicineDetailModel

        let text = ''
        let lbuy_desc = safe(limit_buy_prompt)
        if (lbuy_desc?.length > 0) {
            text = '  (' + lbuy_desc + ')'
        }
        return (
            <View style={{backgroundColor:'white',flexDirection:'row',marginTop:5}}>
                <Text style={[{color:'#999',fontSize:12}]}>库存</Text>
                <Text style={[{ color:'#999',fontSize:12},{marginLeft:5}]}>{safe(reserve)}
                        <Text style={{color:'rgb(254,172,76)'}}>{text}</Text>
                        {this.renderPeriodInfo(period_to_Date)}
                </Text>
            </View>
        )
    }

    renderPeriodInfo(period_to_Date) {
        if(isNotEmpty(period_to_Date)){
            return(
                <Text style={{color:'#999'}}>
                    {'    有效期至   '}
                    <Text style={[{ color:'#999',fontSize:12},{marginLeft:16}]}>{period_to_Date}</Text>
                </Text>
            )
        }else {
            return null
        }
    }

    /**
    * 主治功能
    */
    renderApplicability() {
        let { viewModel } = this.props
        let { medicineDetailModel } = viewModel
        let { applicability } = medicineDetailModel
        if (applicability) {
            return (
                <View style={{ marginLeft: 15, marginRight: 16 ,minHeight: 50, backgroundColor: 'white' }}>
                    <Text style={{ color: 'rgb(87,153,247)', fontSize: 14, marginVertical: 14 }}>{'主治功能'}</Text>
                    <Text style={[{ height: null, fontSize: 12, lineHeight: 18, color: '#333', marginBottom: 17 }]} numberOfLines={3}>{applicability.replace(/<[^>]+>/g, "").replace(/(↵|\r|\n)/g, "").trim()}</Text>
                </View>
            )
        }
    }

    renderTitle() {
        let { viewModel } = this.props
        let { medicineDetailModel } = viewModel
        let { title, PrescriptionType } = medicineDetailModel
        //单双轨3.1.00版本才有，并且现阶段只有HTTP才有
        //单轨药
        //双轨药
        if (PrescriptionType + "" === "1" || PrescriptionType + "" === "2" || PrescriptionType + "" === "0") {
            return (
                <View>
                    <Text style={{ color: 'rgb(51,51,51)', fontSize: 16 }}>{title}</Text>
                </View>
            )
        } else {
            //处方药
            return (
                <View>
                    <Text style={{ color: 'rgb(51,51,51)', fontSize: 16, marginTop: 8 }}>{title}</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Image style={{ width: 27, height: 12 }} source={require('../../../img/ic_drug_track_label.png')} />
                        <Text style={{ color: 'rgb(153,153,153)', fontSize: 12 }}>{' 本品为处方药，须在执业药师指导下凭处方购买和使用'}</Text>
                    </View>
                </View>
            )
        }
    }


    renderPrice() {
        let { viewModel } = this.props
        let { medicineDetailModel, navigation } = viewModel
        let { price } = medicineDetailModel
        price = price ? price : '0.01'

        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingLeft: 13, paddingTop: 7, paddingBottom: 14 }}>
                {/*展示价*/}
                <YFWDiscountText navigation={navigation} style_text={{ fontSize: 19, fontWeight: '500' }} value={'¥' + toDecimal(price)} />
                {/*折扣*/}
                {this.renderDiscount()}
                {/*原价*/}
                {this.renderOriginalPrice()}
                <View style={{ flex: 1 }}></View>
                {/*{this.renderSharedGetMoeny()}*/}
                {/* {this.renderDiscountNotice()} */}
                {this.renderNumberView()}
            </View>
        )
    }

    renderNumberView() {
        let { viewModel } = this.props
        let { storeViewModel, defaultCount } = viewModel
        let canOperation = storeViewModel.storeInfo.is_show_cart
        return (
            <View style={{ marginRight: 13, flexDirection: 'row', alignItems: 'center' }} activeOpacity={1}>
                {defaultCount > 0 && <TouchableOpacity onPress={() => {canOperation&&this.clickMethods('numsub')}} activeOpacity={1} style={{ padding: 5 }} hitSlop={{ left: 5, top: 5, right: 5, bottom: 5 }}>
                    <Image source={require('../Image/icon_sub_blue.png')} style={{ width: 22, height: 22 }} />
                </TouchableOpacity>}
                {defaultCount > 0 && <Text style={{ fontSize: 13, color: '#333', marginHorizontal: 3 }}>{defaultCount}</Text>}
                <TouchableOpacity onPress={() => {canOperation&&this.clickMethods('numadd')}} activeOpacity={1} style={{ padding: 5 }} hitSlop={{ left: 5, top: 5, right: 5, bottom: 5 }}>
                    <Image source={canOperation?require('../Image/icon_add_blue.png'):require('../Image/icon_add_gray.png')} style={{ width: 22, height: 22 }} />
                </TouchableOpacity>
            </View>
        )
    }

    /*降价通知*/
    renderDiscountNotice() {
        return (
            <TouchableOpacity style={{ marginRight: 13, flexDirection: 'row', alignItems: 'flex-end' }} hitSlop={{ left: 20, top: 10, bottom: 10, right: 20 }} activeOpacity={1} onPress={() => { }}>
                <Image style={{ width: 15, height: 7, marginRight: 3, top: -2, resizeMode: 'stretch' }} source={require('../../../img/icon_jjtz.png')} />
                <Text style={{ fontSize: 12, color: "#1fdb9b", includeFontPadding: false }}>降价通知</Text>
            </TouchableOpacity>
        )
    }

    /**
    * 返回原始价标签
    */
    renderOriginalPrice() {
        let { viewModel } = this.props
        let { medicineDetailModel } = viewModel
        let { is_wireless_exclusive, is_seckill } = medicineDetailModel
        if ("true" == is_wireless_exclusive || "true" == is_seckill) {
            let price = '0.01'
            let img = ''
            let imgStyle = { width: 40, height: 12 }
            if ("true" == is_wireless_exclusive) {
                price = "商城价: ¥ " + toDecimal(original_price)
                img = require('../../../img/zhuanxiang.png')
            } else if ("true" == is_seckill) {
                img = require('../../../img/miaosha.png')
                imgStyle = { width: 47, height: 12 }
            }
            return (
                <View style={[{ flexDirection: 'row', marginLeft: 5 }, BaseStyles.centerItem]}>
                    <Image source={img} style={{ resizeMode: 'center' }} style={{ resizeMode: 'stretch', ...imgStyle }} />
                    <Text style={{ marginLeft: 4, color: darkNomalColor(), fontSize: 12 }}>{price}</Text>
                </View>
            )
        }
    }

    /**
    * 返回折扣视图标签
    * @returns {*}
    */
    renderDiscount() {
        let { viewModel } = this.props
        let { medicineDetailModel } = viewModel
        let { discount_is_show, discount } = medicineDetailModel
        if ("true" === discount_is_show) {
            return (
                <View style={[
                    BaseStyles.centerItem, {
                        backgroundColor: 'rgb(236,103,98)',
                        borderRadius: 4,
                        paddingLeft: 3,
                        paddingRight: 3,
                        paddingTop: 1,
                        paddingBottom: 1,
                        marginLeft: 6,
                        marginRight: 6,
                    }]}>
                    <Text style={{ fontSize: 10, color: 'white', fontWeight: '500' }}>{discount}</Text>
                </View>
            )
        }
    }
}

const YFWOTOMedicineDetailInfo_Styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        backgroundColor: backGroundColor()
    },
    text: {
        fontSize: 20,
        textAlign: 'center'
    },
    cfyIconStyle: {
        resizeMode: 'contain',
        height: 15,
        width: 35,
        marginLeft: 2,
        marginTop: 3
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
    },
    checkImgStyle: {
        width: 12,
        height: 12,
        marginLeft: 15,
    },
    textStyle: {
        color: '#333',
        fontSize: 13,
        height: 25,
        flex: 1,

    },
    grayText: { color: '#666' },
    shopButtonStyle: {
        height: 36,
        width: kScreenWidth - 50,
        borderColor: yfwGreenColor(),
        borderWidth: 1,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center'
    },
    operatingBox: {

        width: 90,
        height: 30,
        borderColor: separatorColor(),
        borderWidth: 1,
        marginLeft: 25,
        marginTop: 5,
        borderRadius: 3,
        flexDirection: 'row',

    },
    reduce: {
        flex: 1,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btn1: {
        fontSize: 14,
        color: darkTextColor(),
    },
    inputBorder: {
        borderColor: separatorColor(),
        borderLeftWidth: 1,
        borderRightWidth: 1,
        width: 30,
        height: 30,
        textAlign: 'center',
        padding: 0
    },
    color_disabled1: {
        color: darkLightColor(),
    },

    shopBtn: {
        width: 145 * kScreenWidth / 375,
        height: 37 * kScreenWidth / 375,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    smallIcon: {
        width: 14, height: 14, resizeMode: 'contain'
    },

});


class YFWOTOMedicineDetailInfoBarnerView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            canUpdate : true
        }
    }
   
    static getDerivedStateFromProps(nextProps,prevState){
        //该方法内禁止访问this
        let nextImage = nextProps?.viewModel?.medicineDetailModel?.img_url
        let proImage = prevState?.proImage
        if (nextImage !== proImage) {
            //通过对比nextProps和prevState，返回一个用于更新状态的对象
            return { canUpdate: false, proImage:nextImage}
        } 
    }

    shouldComponentUpdate() { 
        if (this.state.canUpdate) {
            return true
        } else { 
            return false
        }
    }


    render() {
        let { viewModel } = this.props
        let { medicineDetailModel } = viewModel
        let { img_url } = medicineDetailModel
        let imagesData = safeArray(img_url)

        let isShowGoodSellPrice = false    //不显示多件装优惠组件renderSellView，原判断条件参数在modal中同步删除，详见#16336 后续可能做活动效果使用暂时保留。
        //如果数据源没有的时候返回了Swiper，接下来即使有数据内部也不会改变Index，Github官方已发现这个bug
        if (imagesData.length <= 0) {
            return (
                <View style={{ height: 240 + this.extraH }} />
            )
        }

        if (Platform.OS == 'ios') {
            return (
                <View>
                    <Swiper height={240 + this.extraH}
                        autoplay={false}
                        renderPagination={(index, total, swiper) => {
                            if (isShowGoodSellPrice && index === 0) {
                                return <View />
                            }
                            return (<View style={{ paddingHorizontal: 8, backgroundColor: '#000', right: 13, bottom: 12, position: 'absolute', opacity: 0.2, borderRadius: 9, height: 18 }}>
                                <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>{(++index) + '/' + total}</Text>
                            </View>)
                        }}
                        onIndexChanged={(index) => {
                            this.currentIndex = index
                        }}>
                        {this.renderImg()}
                    </Swiper>
                    <BigPictureView ref={(view)=>{this.picView = view}}/>
                </View>
            );
        } else {
            return (
            <View style={{flex:1}}>
                <Swiper height={240}
                    autoplay={false}
                    renderPagination={(index, total, swiper) => {
                        if (isShowGoodSellPrice && index === 0) {
                            return <View />
                        }
                        return (<View >
                            <Text style={{ paddingHorizontal: 8, right: 13, bottom: 12, position: 'absolute', opacity: 0.2, borderRadius: 9, height: 18, color: 'white', fontSize: 15, backgroundColor: '#000', fontWeight: 'bold', includeFontPadding: false }}>{(++index) + '/' + total}</Text>
                        </View>)
                    }}
                    onIndexChanged={(index) => {
                        this.currentIndex = index
                    }}>
                    {this.renderImg()}
                </Swiper>
                <BigPictureView ref={(view)=>{this.picView = view}}/>
            </View>
            )
        }
    }

    renderImg() {

        let { viewModel } = this.props
        let { medicineDetailModel } = viewModel
        let { img_url } = medicineDetailModel
        let imagesData = safeArray(img_url)
        var imageViews = [];
        let images = []
        let isShowGoodSellPrice = false    //不显示多件装优惠组件renderSellView，原判断条件参数在modal中同步删除，详见#16336 后续可能做活动效果使用暂时保留。
        for (let i = 0; i < safeObj(imagesData).length; i++) {
            let imageUrl = convertImg(imagesData[i])
            images[i] = imageUrl
            imageViews.push(
                <>
                    <TouchableOpacity
                        activeOpacity={1}
                        key={'banner' + i}
                        style={{
                            flex: 1,
                            width: kScreenWidth,
                            alignItems:'center',
                            justifyContent: 'center',
                            marginTop: getStatusBarHeight(),
                            paddingTop: 50,
                            paddingBottom: this.imagePaddingBottom,
                            borderWidth: isShowGoodSellPrice && (i === 0) ? 5 : 0,
                            borderColor: 'rgb(239, 61, 65)'
                        }}
                        onPress={() => {
                            this._preview(images,i)
                        }}
                    >
                        <Image
                            style={{ flex: 1, height:240,width: kScreenWidth,resizeMode: 'contain', backgroundColor: 'white' }}
                            resizeMethod={'resize'}
                            source={{ uri: imageUrl }}
                        />
                    </TouchableOpacity>
                    {isShowGoodSellPrice && (i === 0) ?
                        this.renderSellView()
                        : <></>}
                </>
            );
        }
        return imageViews;
    }

    renderSellView() {
        let { viewModel } = this.props
        let { medicineDetailModel } = viewModel
        let { packageDesc, packageUnitPrice } = medicineDetailModel
        let discount = safe(packageDesc) //#16336 字段已不在model中
        let price = safe(packageUnitPrice) //#16336 字段已不在model中
        return (
            <View style={{ position: 'absolute', bottom: 0, width: kScreenWidth, height: 55, flexDirection: 'row', alignItems: 'flex-end' }}>
                <View style={{ flex: 1, paddingHorizontal: 22, height: 36, justifyContent: 'center', backgroundColor: 'rgb(31,219,155)' }}>
                    <Text style={{ fontSize: 20, color: "#ffffff", fontWeight: 'bold' }}>{discount}</Text>
                </View>
                <View>
                    <View style={{ position: 'absolute', bottom: 0, width: 29, height: 36, backgroundColor: 'rgb(31,219,155)' }} />
                    <Image source={require('../../../img/goods_detail_sell_banner.png')} style={{ resizeMode: 'stretch', height: 55, width: 29 }} />
                </View>
                <View style={{ justifyContent: 'center', alignItems: 'center', height: 55, resizeMode: 'stretch' }}>
                    <Image source={require('../../../img/goods_detail_sell_banner_bg.png')} style={{ position: 'absolute', bottom: 0, resizeMode: 'stretch', height: 55, width: '100%' }} />
                    <Text style={{ color: "#ffffff", fontSize: 12 }}>单件到手</Text>
                    <View style={[BaseStyles.leftCenterView, { flexWrap: 'nowrap', paddingRight: 9 }, this.props.style_view]}>
                        <Text style={{ color: "#ffffff", includeFontPadding: false, fontSize: 16, fontWeight: 'bold', marginBottom: -5 }}>¥</Text>
                        <Text style={{ color: "#ffffff", includeFontPadding: false, fontSize: 32, fontWeight: 'bold' }}>{price.split('.')[0]}</Text>
                        <Text style={{ color: "#ffffff", includeFontPadding: false, fontSize: 24, fontWeight: 'bold', marginBottom: -2.5 }}>{'.' + price.split('.')[1]}</Text>
                    </View>
                </View>
            </View>
        )
    }

    _preview(images,index) {
        images = safeArray(images).map((item) => { return {url:item} })
        this.picView.showView(images,index)
    }


}
