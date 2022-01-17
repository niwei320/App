import React from 'react';
import {
    DeviceEventEmitter,
    Dimensions,
    Image, Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SwipeRow } from 'react-native-swipe-list-view';
import {
    backGroundColor,
    darkNomalColor,
    darkTextColor,
    separatorColor,
    yfwOrangeColor,
    darkLightColor
} from "../../../Utils/YFWColor";
import { BaseStyles } from "../../../Utils/YFWBaseCssStyle";
import { kScreenWidth, safeObj, tcpImage, safe } from "../../../PublicModule/Util/YFWPublicFunction";
import YFWPrescribedGoodsTitle, {
    TYPE_DOUBLE,
    TYPE_NOMAL,
    TYPE_SINGLE,
    TYPE_OTC
} from "../../../widget/YFWPrescribedGoodsTitle";
import YFWMoneyLabel from '../../../widget/YFWMoneyLabel';
import YFWWDShopCarCellView from './YFWWDShopCarCellView';
import YFWWDCheckButtonView from '../../Widget/YFWWDCheckButtonView';


export default class YFWWDSwipeRow extends SwipeRow {

    constructor(...args) {
        super(...args);
        this.state = {
            navigation: undefined,
            selectSwipeRow: {},
        };
    }

    componentDidMount() {
        DeviceEventEmitter.addListener('CloseSwipeRow', () => {
            if (this.state.selectSwipeRow != this.swipeRow) {
                this.swipeRow && this.swipeRow.closeRow();
            }
            this.state.selectSwipeRow = {};
        });
    }

    _delFn() {
        if (this.props.delFn) {
            this.props.delFn();
        }
    }
    _moveFn() {
        if (this.props.moveFn) {
            this.props.moveFn();
        }
    }
    _selectGoodsItemMethod(badge) {
        if (this.props.selectGoodsItemMethod) {
            this.props.selectGoodsItemMethod(badge)
        }
    }
    _changeItemQuantity(quantity) {
        if (this.props.changeQuantity) {
            this.props.changeQuantity(quantity);
        }
    }
    _resetData(quantity) {
        if (this.props.resetData) {
            this.props.resetData(quantity);
        }
    }
    _selectFn() {
        if (this.props.selectFn) {
            this.props.selectFn();
        }
    }

    _onRowOpenFn() {

        this.state.selectSwipeRow = this.swipeRow;
        DeviceEventEmitter.emit('CloseSwipeRow');
        DeviceEventEmitter.emit('canCloseSwipeRow', false);

    }

    _onRowDidOpen() {

        DeviceEventEmitter.emit('canCloseSwipeRow', true);

    }


    render() {
        if (this.props.type == 'package' || this.props.type == 'courseOfTreatment') {
            let infosArray = this.props.Data;
            let allCells = []
            let cellHeight = 90
            let allHeight = cellHeight * infosArray.length
            infosArray.map((badge, index) => {
                allCells.push(
                    <View key={index + 'cell'} style={{ height: cellHeight, backgroundColor: 'white' }}>
                        {/*遮挡防止出现横线*/}
                        <View style={{ top: 0, left: 0, right: 0, position: 'absolute', height: 100, flex: 1, backgroundColor: 'white' }} />
                        <TouchableOpacity activeOpacity={1} style={[BaseStyles.leftCenterView, { flex: 1 }]} onPress={() => { this._selectGoodsItemMethod(badge) }}>
                            <Image style={{ width: 60, height: 60 }}
                                source={{ uri: tcpImage(badge.img_url) }} />
                            <View style={{ marginHorizontal: 10, flex: 1 }}>
                                {this.renderTopInfo(badge)}
                                <View style={[BaseStyles.leftCenterView, { justifyContent: 'space-between', }]}>
                                    <Text style={[styles.regionStyle]}>{badge.standard}</Text>
                                    <Text style={[BaseStyles.contentWordStyle]}>x{badge.quantity}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                )
            })
            return (
                <SwipeRow
                    ref={(c) => this.swipeRow = c}
                    disableRightSwipe={true}
                    key={infosArray[0].id}
                    rightOpenValue={-120}
                    previewOpenValue={-40}
                    swipeToOpenPercent={10}
                    swipeToClosePercent={10}
                    onRowOpen={() => this._onRowOpenFn()}
                    onRowDidOpen={() => this._onRowDidOpen()}
                    previewOpenDelay={3000}>
                    <View style={[styles.quickAContent, { height: allHeight }]}>
                        <TouchableOpacity activeOpacity={1} style={[styles.quick, { backgroundColor: '#a1a1a1', height: allHeight }]} onPress={() => { this._moveFn() }}>
                            <Text style={{ color: "#fff", textAlign: 'center' }}>移入收藏</Text>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={1} style={[styles.quick, { backgroundColor: '#ff3300', height: allHeight }]} onPress={() => { this._delFn() }}>
                            <Text style={{ color: "#fff", textAlign: 'center' }}>删除</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[BaseStyles.leftCenterView, { flex: 1 }]}>
                        <View style={styles.checkButton}>
                            <YFWWDCheckButtonView style={{ flex: 1 }} selectFn={() => this.props.selectFn()}
                                select={this.props.select} />
                        </View>
                        <View style={{ flex: 1 }}>
                            {allCells}
                        </View>
                    </View>
                </SwipeRow>
            );
        }
        else {
            let item = this.props.Data;
            let isOverdue = parseInt(safe(item.item.dict_store_medicine_status)) < 0 ? true : false
            return (
                <SwipeRow
                    ref={(c) => this.swipeRow = c}
                    key={item.index}
                    rightOpenValue={-120}
                    previewOpenValue={-40}
                    swipeToOpenPercent={10}
                    swipeToClosePercent={10}
                    onRowOpen={() => this._onRowOpenFn()}
                    onRowDidOpen={() => this._onRowDidOpen()}
                    previewOpenDelay={3000}
                    disableRightSwipe={true}>
                    <View style={styles.quickAContent}>
                        {isOverdue ? null : <TouchableOpacity activeOpacity={1} style={[styles.quick, { backgroundColor: '#a1a1a1', height: 90 }]} onPress={() => { this._moveFn() }}>
                            <Text style={{ color: "#fff", textAlign: 'center' }}>移入收藏</Text>
                        </TouchableOpacity>}
                        <TouchableOpacity activeOpacity={1} style={[styles.quick, { backgroundColor: '#ff3300', height: 90 }]} onPress={() => { this._delFn() }}>
                            <Text style={{ color: "#fff", textAlign: 'center' }}>删除</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.rowItem} key={item.index}>
                        <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={() => this._selectGoodsItemMethod()}>
                            <YFWWDShopCarCellView Data={item.item} changeQuantity={(quantity) => this._changeItemQuantity(quantity)}
                                resetData={(quantity) => this._resetData(quantity)}
                                select={this.props.select} selectFn={() => this._selectFn()} />
                        </TouchableOpacity>

                    </View>
                </SwipeRow>
            );
        }

    }

    renderTopInfo(item) {
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1, maxHeight: 30 }}>
                <View style={{ flex: 1 }}>
                    {this.renderTitleView(item)}
                </View>
                <YFWMoneyLabel money={item.price} moneyTextStyle={{ marginRight: 0, color: '#999', fontSize: 15 }} decimalsTextStyle={{ color: '#999', fontSize: 13 }} />
            </View>
        )
    }

    renderTitleView(item) {
        //单双轨3.1.00版本才有，并且现阶段只有HTTP才有
        //单轨药
        if (safeObj(item).PrescriptionType + "" === "1") {
            return this.rednerPrescriptionLabel(TYPE_SINGLE, item.title)
        }
        //双轨药
        else if (safeObj(item).PrescriptionType + "" === "2") {
            return this.rednerPrescriptionLabel(TYPE_DOUBLE, item.title)
        }
        else if (safeObj(item).PrescriptionType + "" === "0") {
            return this.rednerPrescriptionLabel(TYPE_OTC, item.title)
        }
        //这里没有处方药的判断
        else {
            return this.rednerPrescriptionLabel(TYPE_NOMAL, item.title)
        }
    }

    /**
     * 返回处方标签
     * @param img
     * @returns {*}
     */
    rednerPrescriptionLabel(type, title) {
        let lineHeightStyle = Platform.OS === 'android' ? { lineHeight: 16 } : null;
        return <YFWPrescribedGoodsTitle
            type={type}
            title={title}
            numberOfLines={2}
            style={[lineHeightStyle, {
                fontSize: 13,
                color: '#000',
                fontWeight: 'bold',
                marginRight: 10,
                flex: 1,
            }]}
        />
    }

}
var cols = 2;
var boxW = (Dimensions.get('window').width - 40) / 2;
var vMargin = (Dimensions.get('window').width - cols * boxW) / (cols + 1);
var hMargin = 10;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        backgroundColor: backGroundColor(),
    },
    checkButton: {
        marginLeft: 5,
        width: 30,
        height: 30,
    },
    footerTopTitle: {
        height: 35,
        width: Dimensions.get('window').width,
        textAlign: 'center',
        fontSize: 14,
        color: darkTextColor(),
        marginTop: 20,
    },
    item: {
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'

    },
    regionStyle: {
        fontSize: 12,
        color: darkLightColor(),
        marginRight: 5,
        flex: 1
    },
    outViewStyle: {
        //    设置侧轴的对齐方式
        alignItems: 'center',
        width: boxW,
        height: boxW + 60,
        marginLeft: vMargin,
        marginTop: hMargin,
    },
    iconStyle: {
        width: boxW - 20,
        height: boxW - 20,
        marginTop: 10,
    },
    footerTitleStyle: {

        width: boxW,
        textAlign: 'center',
        fontSize: 14,
        color: darkNomalColor(),
        marginTop: 15,
    },
    footerPriceStyle: {

        width: boxW,
        textAlign: 'center',
        fontSize: 14,
        color: yfwOrangeColor(),
        marginTop: 10,
    },
    sectionHeaderView: {

        height: 50,
        width: Dimensions.get('window').width,
        backgroundColor: 'white',
    },
    sectionHeaderTitle: {
        color: darkTextColor(),
        marginLeft: 5,
    },
    sectionHeaderseparator: {

        height: 1,
        marginBottom: 0,
        marginLeft: 10,
        backgroundColor: separatorColor(),
        width: Dimensions.get('window').width - 10,
    },
    sectionFooterTitle: {
        color: darkNomalColor(),
        marginRight: 15,
        fontSize: 15
    },
    rowItem: {

        height: 100,
        backgroundColor: 'white',
    },
    bottomView: {
        height: 50,
        width: Dimensions.get('window').width,
        backgroundColor: 'white',
    },

    //侧滑菜单的样式
    quickAContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    quick: {
        width: 60,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center'
    }
});