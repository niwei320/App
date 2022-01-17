import React, { Component } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ImageBackground, ScrollView, UIManager, Keyboard, Platform
} from 'react-native';
import {
    backGroundColor, darkLightColor,
    darkNomalColor, darkTextColor, orangeColor,
    separatorColor,
    yfwGreenColor,
    yfwOrangeColor, yfwBlueColor,
} from '../../../Utils/YFWColor'
import { toDecimal } from "../../../Utils/ConvertUtils";
import {
    isEmpty, isNotEmpty,
    kScreenHeight,
    kScreenWidth,
    safeObj,
    tcpImage,
    convertImg,
    iphoneBottomMargin,safeNumber
} from "../../../PublicModule/Util/YFWPublicFunction";
import YFWToast from "../../../Utils/YFWToast";
import YFWDiscountText from "../../../PublicModule/Widge/YFWDiscountText";
import LinearGradient from 'react-native-linear-gradient';
import { pushWDNavigation } from '../../YFWWDJumpRouting';
import YFWPopupWindow from '../../../PublicModule/Widge/YFWPopupWindow';
import { getAddCarCount } from '../../../Utils/YFWInitializeRequestFunction';


export default class YFWWDAddGoodsPackageListView extends Component {

    static defaultProps = {
        data: undefined,
    }

    constructor(...args) {
        super(...args);
        this.state = {
            quantity: 1,
            packageDate: [],
            treatmentPackageData: [],
            selectItem: 'single',
            footerViewType: 0,                  // 0:加入购物车, 1:立即购买
            textFocus: false,                   // 输入焦点
            popupWindowHeight: 0,
        };
    }

    componentWillMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
    }

    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow(e) {
        //因为两个平台弹出键盘方式不同为了减少刷新时闪烁影响，ios在弹出键盘高度回调的时候重新设置弹框高度，android在输入获取焦点的时候刷新高度
        if (Platform.OS == 'ios') {
            this.setState({
                popupWindowHeight: 250 + e.endCoordinates.height
            });
        }
    }

    _keyboardDidHide() {
        this.selectNumInput && this.selectNumInput.blur();
        this._setDefaultHeight()
    }

    show(type) {
        this.modalView && this.modalView.show()
        this._onTextBlur()
        if (this.props.data != null && isEmpty(this.state.selectItem)) {
            //进入默认选中套餐一
            // this.setState({
            //     selectItem:this.props.data.shopmedicine_package[0],
            // });
        }
        if (type != null) {
            this.setState({
                footerViewType: type
            });
        }
        let car_good_count = safeNumber(this.props.data.cartcount,0)
        let min_purchase = safeNumber(this.props.data.purchase_minsum,1)
        let purchase_times = safeNumber(this.props.data.purchase_times,1)
        let show_quantity = 1
        if (car_good_count >= min_purchase) {
            show_quantity = min_purchase
        } else {
            show_quantity = min_purchase - car_good_count
        }
        this.setState({quantity:show_quantity})
        this._handlePackageData()
        this._setDefaultHeight()
    }

    disMiss() {
        this.props.dismiss && this.props.dismiss()
        this.modalView && this.modalView.disMiss()
    }

    _handlePackageData() {
        if (isNotEmpty(this.props.data.shopmedicine_package)) {
            let packages = []
            let treatmentPackageData = []
            for (let i = 0; i < this.props.data.shopmedicine_package.length; i++) {
                let item = this.props.data.shopmedicine_package[i]
                if (item.package_type == '1') {
                    treatmentPackageData.push(item)
                } else {
                    packages.push(item)
                }
            }
            this.state.treatmentPackageData = treatmentPackageData
            this.state.packageDate = packages
        }
    }

    _setDefaultHeight() {
        //单品高度
        let popupWindowHeight = 385;
        //如果有疗程装
        if (this.state.treatmentPackageData.length > 0) {
            popupWindowHeight += 50;
        }
        //如果有套餐
        popupWindowHeight = (this.state.packageDate.length < 1) ? popupWindowHeight : kScreenHeight / 7 * 5;
        this.setState({
            popupWindowHeight: popupWindowHeight
        });
    }

    render() {
        return (
            <YFWPopupWindow ref={(c) => this.modalView = c}
                onRequestClose={() => {
                    this.props.onRequestClose && this.props.onRequestClose()
                    this.disMiss()
                }}
                popupWindowHeight={this.state.popupWindowHeight}
                backgroundColor={'white'}>
                {this._renderMainView()}
            </YFWPopupWindow>
        );
    }

    _renderMainView() {
        return (
            <View style={{ marginHorizontal: 12, marginTop: 15, alignItems: 'center' }}>
                {this._renderTitle()}
                {this.state.textFocus ? <View /> :
                    <ScrollView style={{ flex: 1, width: kScreenWidth - 24, height: kScreenHeight / 7 * 5 / 2 }}
                        ref={(e) => { this.scrollView = e }}
                        showsVerticalScrollIndicator={false}>
                        {this._renderSingle()}
                        {this._renderPackage()}
                        {this._renderTreatmentPackage()}
                    </ScrollView>}
                {this._selectNum()}
                {this._renderPriceSummary()}
                {this._footerView()}
            </View>
        )
    }

    _renderTitle() {
        let ImgUrl = { uri: tcpImage(this.props.data.img_url ? this.props.data.img_url['0'] : this.props.data.img_url) };
        let images = [];
        for (let i = 0; i < safeObj(this.props.data.img_url).length; i++) {
            let imageUrl = convertImg(this.props.data.img_url[i])
            images[i] = imageUrl
        }
        let price = this.props.data.price;
        let name = this.state.selectItem ? (this.state.selectItem == 'single' ? this.props.data.title : this.state.selectItem.name) : '';
        return (
            <View style={{height:110,width:kScreenWidth-24,alignItems:'flex-start',flexDirection:'row',justifyContent:'flex-start'}}>
                <TouchableOpacity activeOpacity={1} style={{height:110,justifyContent:'center'}} onPress={()=>this._clickShopImages(images)}>
                    <Image style={styles.titleImage}
                           source={ImgUrl}/>
                </TouchableOpacity>
                <View style={{flex:1,height:110,paddingTop:0,paddingLeft:22,justifyContent:'flex-start'}}>
                    <Text style={{marginTop:5,fontSize:14,fontWeight:'500',color:darkTextColor(),width:kScreenWidth-180}} numberOfLines={2}>
                        {this.props.data.title}
                    </Text>
                    <Text style={{fontSize:12,color:darkLightColor(),width:kScreenWidth-180, marginTop:2}} numberOfLines={1}>
                        {this.props.data.authorized_code}
                    </Text>
                    <YFWDiscountText navigation={this.props.navigation}  style_view={{marginTop:10}} style_text={{fontSize:15,fontWeight: '500'}} value={'¥'+toDecimal(price)} />
                    <Text style={{fontSize:12,color:darkTextColor(),width:kScreenWidth-180, marginTop:4}}>
                        {!isEmpty(this.state.selectItem)?'已选择：':'未选择'}{name}
                    </Text>
                </View>
                <TouchableOpacity activeOpacity={1} style={{width:20,height:20,marginRight:10,alignItems: 'center',justifyContent: 'center'}}
                                  hitSlop={{top:20,left:20,bottom:20,right:20}}
                                  onPress={()=>this.disMiss()}>
                    <Image style={{width:15,height:15}}
                           source={require('../../../../img/close_button.png')}/>
                </TouchableOpacity>
            </View>
        )
    }
    //查看大图
    _clickShopImages(images) {
        this.disMiss()
        let { navigate } = this.props.navigation;
        pushWDNavigation(navigate, { type: 'big_picture', value: { imgs: images, index: 0 } })
    }

    _renderSingle() {
        let btnStyle = this.state.selectItem == 'single' ? styles.ovalItemButton : styles.ovalItemButtonUn
        let textStyle = this.state.selectItem == 'single' ? styles.itemText : styles.itemTextUn
        let period_to
        if (isNotEmpty(this.props.data.period_to_Date)) {
            period_to = this.props.data.period_to_Date.toString().includes('有效期') ? ' ' + this.props.data.period_to_Date : (' 有效期至：' + this.props.data.period_to_Date)
        }
        return (
            <View style={styles.itemBox} onLayout={(e) => this._singleViewLayout(e)}>
                <Text>选择单品</Text>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={btnStyle} onPress={() => this._changeSelectItem('single')}>
                        <Text style={textStyle}>{this.props.data.title}
                            {isNotEmpty(this.props.data.period_to_Date) ? <Text style={{ fontWeight: 'normal', fontSize: 12 }}>{period_to}</Text> : null}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    //套餐
    _renderPackage() {
        if (this.state.packageDate.length < 1) {
            return <View />
        } else {
            let isShowList = this.state.selectItem && this.state.selectItem.package_type == 0
            return (
                <View style={styles.itemBox}>
                    <Text>选择套餐</Text>
                    <View>
                        <View style={[styles.itemListBorderTop, { backgroundColor: isShowList ? yfwBlueColor() : 'white' }]} />
                        <View style={{ flexDirection: 'row' }}>
                            {this._renderPackageSelectView()}
                        </View>
                    </View>
                    {isShowList ?
                        <View style={styles.itemList}>
                            {this._headerView()}
                            <FlatList
                                style={{ flex: 1 }}
                                extraData={this.state}
                                data={this.state.selectItem.sub_items}
                                renderItem={this._renderItem.bind(this)} />
                        </View> : <View />}
                </View>
            )
        }
    }

    //疗程
    _renderTreatmentPackage() {
        if (this.state.treatmentPackageData.length < 1) {
            return <View />
        } else {
            return (
                <View style={styles.itemBox}>
                    <Text>疗程装</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {this._renderTreatmentPackageSelectView()}
                    </View>
                </View>
            )
        }
    }

    _renderItem = (item, index) => {
        let period_to
        if (isNotEmpty(item.item.period_to_Date)) {
            period_to = item.item.period_to_Date.toString().includes('有效期') ? ' ' + item.item.period_to_Date : (' 有效期至：' + item.item.period_to_Date)
        }
        return (
            <View style={{ height: 60, backgroundColor: backGroundColor(), marginTop: 7 }}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Image style={{ marginLeft: 5, width: 50, height: 50, resizeMode: 'contain' }}
                        source={{ uri: tcpImage(item.item.image_url) }} />
                    <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 10 }}>
                        <Text style={{ marginLeft: 15, fontSize: 12, width: kScreenWidth - 120, color: darkTextColor() }}>{item.item.title}</Text>
                        <View style={{ marginLeft: 15, marginTop: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, color: darkNomalColor(), flex: 1 }}>¥{toDecimal(item.item.price)}
                                {isNotEmpty(item.item.period_to_Date) ? <Text>{period_to}</Text> : null}
                            </Text>
                            <Text style={{ fontSize: 12, color: darkNomalColor(), width: 30, marginRight: 0 }}>x {item.item.quantity}</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    _headerView() {
        if (isEmpty(this.state.selectItem) || this.state.selectItem == 'single') {
            return <View />
        } else {
            let item = this.state.selectItem;
            return (
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 14, color: darkNomalColor(), width: kScreenWidth - 30 }}>{item.name}</Text>
                        <View style={{ height: 30, flexDirection: 'row', alignItems: 'center', }}>
                            <YFWDiscountText navigation={this.props.navigation} style_view={{ marginTop: 0 }} style_text={{ fontSize: 14, fontWeight: 'bold' }} value={'¥' + toDecimal(item.price_total)} />
                            <Text style={{ marginLeft: 15, fontSize: 12, color: darkNomalColor() }}>原价: ¥{toDecimal(item.save_price + item.price_total)}</Text>
                        </View>
                    </View>
                </View>
            );
        }
    }

    _renderPackageSelectView() {
        let dataArray = this.state.packageDate;
        let itemAry = [];
        if (dataArray != null) {
            for (let i = 0; i < dataArray.length; i++) {
                let item = dataArray[i];
                let isSelect = this.state.selectItem == item;
                let btnStyle = isSelect ? styles.rectangleItemButton : styles.rectangleItemButtonUn;
                let textStyle = isSelect ? styles.itemText : styles.itemTextUn;
                itemAry.push(
                    <TouchableOpacity key={i + ''} style={[styles.rectangleItemStyle, btnStyle, { marginRight: i < (dataArray.length - 1) ? 3 : 0 }]}
                        onPress={() => {
                            this._changeSelectItem(item)
                            this.timer = setTimeout(() => {
                                this.scrollView.scrollTo({ x: 0, y: this.singleViewHeight + 10 })
                            }, 100);
                        }}
                        activeOpacity={1}>
                        <Text style={textStyle}>{item.name_aliase}</Text>
                        {Platform.OS == 'android' && isSelect ? <View style={{ backgroundColor: 'white', width: 200, height: 8, position: 'absolute', top: 25 }} /> : <View />}
                    </TouchableOpacity>
                );
            }
        }
        return itemAry;
    }

    _renderTreatmentPackageSelectView() {
        let dataArray = this.state.treatmentPackageData;
        let itemAry = [];
        if (dataArray != null) {
            for (let i = 0; i < dataArray.length; i++) {
                let item = dataArray[i];
                let isSelect = this.state.selectItem == item;
                let btnStyle = isSelect ? styles.ovalItemButton : styles.ovalItemButtonUn;
                let textStyle = isSelect ? styles.itemText : styles.itemTextUn;
                let period_to_Date
                if (isNotEmpty(item.sub_items[0].period_to_Date)) {
                    period_to_Date = item.sub_items[0].period_to_Date.toString().includes('有效期') ? ' ' + item.sub_items[0].period_to_Date : (' 有效期至：' + item.sub_items[0].period_to_Date)
                }
                itemAry.push(
                    <TouchableOpacity key={'package' + i} style={btnStyle} onPress={() => this._changeSelectItem(item)}>
                        <Text style={textStyle}>{item.name}
                            {isNotEmpty(period_to_Date) ? <Text style={{ fontWeight: 'normal', fontSize: 12 }}>{period_to_Date}</Text> : null}
                        </Text>
                    </TouchableOpacity>
                );
                itemAry.push(
                    <View key={i + 'l'} style={{ width: 5 }} />
                );
            }
        }
        return itemAry;
    }

    _singleViewLayout(e) {
        UIManager.measure(e.target, (x, y, width, height, pageX, pageY) => {
            this.singleViewHeight = height
        })
    }

    //切换套餐
    _changeSelectItem(item) {
        if (item == this.state.selectItem) {
            return

        }
        this.setState({
            selectItem: item,
            quantity: 1,
        });
    }

    _renderPriceSummary() {
        let {price, send_price} = this.props.data;
        let sum = price*this.state.quantity;
        if (!this.state.textFocus) {
            return (
                <View key={'summary'} style={{ flexDirection: 'row', alignItems: 'center',justifyContent:'flex-start', width:kScreenWidth-26, flexWrap: "wrap",}}>
                    <Text style={{fontSize: 13, color: "#333333"}}>单品合计：</Text>
                    <YFWDiscountText
                        navigation={this.props.navigation}
                        style_view={{marginHorizontal:7}}
                        style_text={{fontSize:15,fontWeight: '500'}}
                        value={'¥'+toDecimal(sum)}
                    />
                </View>
            )
        }
    }

    _footerView() {
        let bg_colors = this.state.footerViewType == 0 ? ['rgb(255,51,0)', 'rgb(255,110,74)'] : ['rgb(255,151,29)','rgb(253,179,92)'];
        let text = this.state.footerViewType == 0 ? '加入购物车' : '立即购买';
        if (this.state.textFocus) {
            if (Platform.OS == 'android') {
                return (
                    <View style={{ height: 50, width: kScreenWidth, alignItems: 'flex-end', backgroundColor: backGroundColor() }}>
                        <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }} onPress={() => { this.selectNumInput && this.selectNumInput.blur() }}>
                            <Text style={{ fontSize: 16, color: yfwOrangeColor() }}>完成</Text>
                        </TouchableOpacity>
                    </View>
                )
            } else {
                return <View />
            }
        } else {
            if (safeObj(this.props.data.status) == 'sale') {
                return (
                    <TouchableOpacity activeOpacity={1} style={{ flex: 1,marginBottom: iphoneBottomMargin(), alignItems: 'center', justifyContent: 'flex-end' }} onPress={() => this._addShopCarMethod()}>
                        <LinearGradient colors={bg_colors}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            locations={[0, 1]}
                            style={{ height: 50, width: kScreenWidth,  alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>{text}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )
            } else {
                if (isNotEmpty(this.props.data.prohibit_sales_btn_text)) {
                    text = this.props.data.prohibit_sales_btn_text
                } else {
                    text = '暂不销售'
                }
                return (
                    <View style={{ height: 50, width: kScreenWidth, marginBottom: iphoneBottomMargin(), backgroundColor: '#ccc' }} >
                        <TouchableOpacity activeOpacity={1} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>{text}</Text>
                        </TouchableOpacity>
                    </View>
                )
            }
        }
    }

    //加入购物车
    _addShopCarMethod() {
        let item
        if (isEmpty(this.state.selectItem)) {
            YFWToast('请选择购买规格', { position: kScreenHeight * 0.2 })
            return
        } else if (this.state.selectItem == 'single') {
            item = { package_id: 'single', quantity: this.state.quantity, name: this.props.data.name_cn };
        } else {
            item = { package_id: this.state.selectItem.package_id, quantity: this.state.quantity, name: this.state.selectItem.name };
        }
        if (this.state.footerViewType == 0 && this.props.addShopCarMethod) {
            this.props.addShopCarMethod(item);
        } else if (this.props.byNowMethod) {
            this.props.byNowMethod(item)
        }
        this.disMiss()
    }

    //选择数量
    _selectNum() {
        return (
            <View key={'kucun'} style={{ flexDirection: 'row', height: 50, backgroundColor: 'white', marginTop: 10, alignItems: 'center', marginBottom: 12 }}>
                {this._renderMaxBuy()}
                <View style={styles.operatingBox}>
                    <TouchableOpacity activeOpacity={1} style={styles.reduce} onPress={() => this._subtractionFn()}>
                        <View style={styles.reduce}><Text allowFontScaling={false} style={{}}>—</Text></View>
                    </TouchableOpacity>
                    <TextInput allowFontScaling={false}
                        ref={(e) => { this.selectNumInput = e }}
                        style={{borderColor: separatorColor(),borderLeftWidth: 1,borderRightWidth: 1,textAlign: 'center',padding: 0,minWidth:30,paddingHorizontal:5}}
                        value={String(this.state.quantity)}
                        returnKeyType={'done'}
                        keyboardType="numeric"
                        onChangeText={(txt) => { this._inputChangeQuantity(txt) }}
                        autoFocus={false}
                        onFocus={() => { this._onTextFocus() }}
                        onBlur={() => { this._onTextBlur() }}
                        underlineColorAndroid="transparent">
                    </TextInput>
                    <TouchableOpacity
                        activeOpacity={1} style={styles.reduce} onPress={() => this._plusFn()}>
                        <View style={styles.reduce}>
                            <Text allowFontScaling={false} style={{}}>＋</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    _inputChangeQuantity(text) {
        if (!this._checkReserve()) {
            return
        }
        let quantity = text
        this.setState({ quantity: quantity })

    }

    _onTextBlur() {
        this.setState({ quantity: getAddCarCount(this.state.quantity,this.props.data.cartcount,this.props.data.purchase_minsum,this.props.data.lbuy_no,this.props.data.purchase_times,this.props.data.reserve) })
        this.setState({ textFocus: false })
    }

    _onTextFocus() {
        //因为两个平台弹出键盘方式不同为了减少闪烁影响，ios在弹出键盘高度回调的时候重新设置弹框高度，android在输入获取焦点的时候刷新高度
        if (Platform.OS == 'android') {
            this.setState({
                textFocus: true,
                popupWindowHeight: 250
            });
        } else {
            this.setState({
                textFocus: true,
            })
        }
    }
    //返回最大和限购数量
    _renderMaxBuy() {
        let text = ''
        if (this.props.data.lbuy_no + '' === '0') {
            if (isEmpty(safeObj(this.props.data).max_buy_qty) || safeObj(this.props.data).max_buy_qty + '' === '0') {
                text = ''
            } else {
                text = `  (最大购买${this.props.data.max_buy_qty}件)`
            }
        } else if (this.props.data.lbuy_no != 'undefined') {
            text = `  (限购${this.props.data.lbuy_no}件)`
        } else {
            text = ''
        }
        return (
            <View style={{ flexDirection: 'row', marginTop: 13, width: kScreenWidth - 140 }}>
                <Text style={{ color: darkTextColor(), fontSize: 13 }}>数量</Text>
                {/* <Text style={{ color: darkLightColor(), fontSize: 13, marginLeft: 20 }}>库存:{this.props.data.reserve}</Text> */}
                <Text style={{ color: orangeColor(), fontSize: 13, marginLeft: 5 }}>{text}</Text>
            </View>
        )
    }

    //数量减一
    _subtractionFn() {
        if (!this._checkReserve()) {
            return
        }
        if (this.state.quantity <= 1) {
            return
        }
        let car_good_count = safeNumber(this.props.data.cartcount,0)
        let min_purchase = safeNumber(this.props.data.purchase_minsum,1)
        let purchase_times = safeNumber(this.props.data.purchase_times,1)
        if (car_good_count < min_purchase) {
            min_purchase = min_purchase - car_good_count
        }
        let quantity = Number.parseInt(String(this.state.quantity)) - purchase_times;
        if (this.state.quantity <= min_purchase || quantity < min_purchase) {
            YFWToast('小于起订量', { position: kScreenHeight * 0.2 })
            return
        }
        this.setState({
            quantity: quantity,
        });
    }

    safeNumber(number,defaultValue=0){
        if (isEmpty(number) || isNaN(parseInt(number))) {
            if (isEmpty(defaultValue) || isNaN(parseInt(defaultValue))){
                return parseInt(defaultValue)
            } else {
                return 0
            }
        } else {
            return parseInt(number)
        }
    }

    //数量加一
    _plusFn() {
        if (!this._checkReserve()) {
            return
        }
        let quantity = Number.parseInt(String(this.state.quantity));
        if (isNaN(quantity) || !quantity) {
            quantity = 0
        }
        let purchase_times = safeNumber(this.props.data.purchase_times,1)
        quantity += purchase_times;
        if (quantity > this.props.data.reserve) {
            YFWToast('超过库存上限', { position: kScreenHeight * 0.2 });
            return;
        } else if (!isNaN(this.props.data.lbuy_no) && this.props.data.lbuy_no > 0 && quantity > this.props.data.lbuy_no) {
            YFWToast('超过限购上限', { position: kScreenHeight * 0.2 });
            return;
        }
        this.setState({
            quantity: quantity,
        });
    }

    //预防未请求到库存信息的情况
    _checkReserve() {
        return this.props.data.reserve ? true : false
    }

}





const styles = StyleSheet.create({
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
    itemBox: {
        marginTop: 10
    },
    itemList: {
        borderWidth: 1,
        borderTopWidth: 0,
        borderStyle: "solid",
        borderColor: "#1fdb9b",
        borderBottomLeftRadius: 7,
        borderBottomRightRadius: 7,
        paddingHorizontal: 13,
        paddingVertical: 12,
    },
    itemListBorderTop: {
        backgroundColor: yfwBlueColor(),
        flex: 1,
        height: 1,
        bottom: -41
    },
    titleImage: {
        width: 96,
        height: 96,
        resizeMode: 'contain',
        borderWidth: 0.5,
        borderColor: "#dddddd",
    },
    reduce: {
        width: 30,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemText: {
        fontWeight: '500',
        fontSize: 13,
        color: yfwBlueColor(),
    },
    itemTextUn: {
        fontWeight: '500',
        fontSize: 13,
        color: "#666666"
    },
    ovalItemButton: {
        // height: 30,
        justifyContent: 'center',
        paddingHorizontal: 18,
        paddingVertical: 4.5,
        marginVertical: 4.5,
        borderRadius: 100,
        backgroundColor: '#eef2ff',
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: yfwBlueColor()
    },
    ovalItemButtonUn: {
        // height: 30,
        justifyContent: 'center',
        paddingHorizontal: 18,
        paddingVertical: 4.5,
        marginVertical: 4.5,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: backGroundColor(),
        backgroundColor: backGroundColor()
    },
    rectangleItemStyle: {
        flex: 1,
        maxWidth: 110,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 11,
        marginRight: 3,
        borderTopLeftRadius: 7,
        borderTopRightRadius: 7,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderWidth: 1,
        borderBottomColor: 'white',
        borderBottomWidth: 0,
        borderColor: yfwBlueColor(),
        backgroundColor: 'white',
        overflow: 'hidden'
    },
    rectangleItemButton: {
        borderWidth: 1,
        borderBottomWidth: Platform.select({
            ios: 1,
            android: 0
        }),
        borderBottomColor: Platform.select({
            ios: 'white',
            android: yfwBlueColor(),
        }),
        borderColor: yfwBlueColor(),
        overflow: Platform.select({
            ios: 'visible',
            android: 'hidden'
        })
    },
    rectangleItemButtonUn: {
        top: -1,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderColor: backGroundColor(),
        backgroundColor: backGroundColor(),
        overflow: 'hidden'
    },
    operatingBox: {

        marginLeft: 25,
        marginTop: 5,
        minWidth: 90,
        height: 24,
        borderColor: separatorColor(),
        borderWidth: 1,
        borderRadius: 3,
        flexDirection: 'row',
        overflow: 'hidden'

    },
    shareView: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    }
});
