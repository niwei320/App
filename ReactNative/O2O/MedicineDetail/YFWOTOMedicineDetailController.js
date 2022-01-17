import React, { Component } from 'react';
import { YFWOTOMedicineDetailViewModel } from './YFWOTOMedicineDetailViewModel';
import { darkStatusBar, isNotEmpty, isEmpty, safeObj, safe } from '../../PublicModule/Util/YFWPublicFunction';
import { YFWOTOMedicineDetailAPI } from './YFWOTOMedicineDetailAPI'
import { YFWOTOMedicineDetailInfoDetailModel, YFWOTOMedicineDetailModel } from './YFWOTOMedicineDetailModel'
import { pushNavigation } from "../../Utils/YFWJumpRouting";
import { DeviceEventEmitter } from 'react-native';
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager';
import YFWToast from '../../Utils/YFWToast';
export default class YFWOTOMedicineDetailController extends Component {
    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: false,
        headerTitle: '分类结果页',
        header: null,
    });

    constructor(props) {
        super(props);
        this.state = {
            location: '张江盛银大厦', //this.props.navigation.state.params.state.location || '张江盛银大厦',
            categoryName: '营养保健',//this.props.navigation.state.params.state.categoryName || '营养保健',
            categoryId: 1,//this.props.navigation.state.params.state.categoryId || 1,
            rowCount: 0,
            dataSource: [],
            noMore: false,
            index: 1,

            showLoading: true,

            shopcartCount: parseInt(safe(new YFWUserInfoManager().otoShopCarNum)),

            storeViewModel: this.props.navigation.state.params.state.storeViewModel,
            storeMedicineModel: this.props.navigation.state.params.state.storeMedicineModel,

            defaultCount: this.props.navigation.state.params.state.storeMedicineModel.quantity || 0,
            defaultImg: this.props.navigation.state.params.state.storeMedicineModel.cover_image,
            storeMedicineId: this.props.navigation.state.params.state.storeMedicineModel.store_medicine_id,

            medicineDetailModel: {},
            medicineDetailInfoDetailModel: {},
            selectDetailTabIndex: 0,

        }
    }
    //----------------------------------------------LIFECYCLE-------------------------------------------

    componentDidMount() {
        this.requesttData(this.state.storeMedicineId)
        darkStatusBar();
        this.cartCountEmit = DeviceEventEmitter.addListener('OTO_SHOPCAR_NUMTIPS_RED_POINT', (nums) => {
            this.setState({ shopcartCount: parseInt(nums) })
        })
        this.locationEmit = DeviceEventEmitter.addListener('O2OAddressSelected', value => {
            this.state.storeViewModel.getStoreInfo(res => {
                this.setState({})
            })
        })
    }

    componentWillUnmount() {
        this.cartCountEmit && this.cartCountEmit.remove()
        this.locationEmit && this.locationEmit.remove()
    }

    //-----------------------------------------------METHOD---------------------------------------------

    requesttData(storeMedicineId) {
        this.setState({
            refreshing: false,
        })
        YFWOTOMedicineDetailAPI.getMedcineDetail(storeMedicineId).then((res) => {
            this.setState({ showLoading: false })
            if (isNotEmpty(res) && isNotEmpty(res.result)) {
                let medicineDetailModel = YFWOTOMedicineDetailModel.getModelArray(res.result['detail']);
                let medicineDetailInfoDetailModel = YFWOTOMedicineDetailInfoDetailModel.getModelArray(medicineDetailModel, res.result['zzImage']);
                this.setState({ medicineDetailModel: medicineDetailModel, medicineDetailInfoDetailModel: medicineDetailInfoDetailModel })

            }
        }, (err) => {
        })
    }
    clickMethods(type, value) {
        let { goBack, navigate } = this.props.navigation;
        if (type == 'numadd') {
            let reserve = Number(this.state.medicineDetailModel.reserve)
            if (parseInt(this.state.defaultCount) >= reserve) {
                YFWToast('超过库存')
                return
            }
            let nextNum = parseInt(this.state.defaultCount) + 1
            this.state.storeViewModel.editMedicineQuantity(this.state.storeMedicineModel, nextNum, res => {
                this.state.defaultCount = nextNum
                this.state.storeViewModel.dealClearSearchResultQuantity()
                this.state.storeViewModel.dealSearchMedicine()
                DeviceEventEmitter.emit('kOTOShoppingCartChange')
            })
        }
        else if (type == 'numsub') {
            let nextNum = parseInt(this.state.defaultCount) - 1
            this.state.storeViewModel.editMedicineQuantity(this.state.storeMedicineModel, nextNum, res => {
                this.state.defaultCount = nextNum
                this.state.storeViewModel.dealClearSearchResultQuantity()
                this.state.storeViewModel.dealSearchMedicine()
                DeviceEventEmitter.emit('kOTOShoppingCartChange')
            })
        }

        else if (type == 'detailTabClick') {
            this.setState({ selectDetailTabIndex: value })
        }
        else if (type == 'to_zzh5') {
            pushNavigation(navigate, {
                type: 'get_h5',
                value: value.link,
                name: '资质证书',
                title: '资质证书',
                isHiddenShare: true,
            });
        }
        else if (type == 'changeCount') {
            this.state.storeViewModel.editMedicineQuantity(value.medicine, value.quantity, res => {
                if (value.medicine.store_medicine_id == this.state.storeMedicineId) {
                    this.state.defaultCount = value.quantity
                }
                this.setState({})
                this.state.storeViewModel.dealClearSearchResultQuantity()
                this.state.storeViewModel.dealSearchMedicine()
                DeviceEventEmitter.emit('kOTOShoppingCartChange')
            })
        }
        else if (type == 'toShopCar') {
            pushNavigation(navigate, { type: 'get_shopping_car', showType: 'oto' });
        }
        else if (type == 'goBack') {
            goBack()
        }
        else if (type == 'clearCount') {
            this.state.storeViewModel.clearShopCart(() => {
                this.setState({ defaultCount: 0 })
                DeviceEventEmitter.emit('kOTOShoppingCartChange')
            })
        }
        else if (type == 'medicineDetail') {
            pushNavigation(navigate, { storeViewModel: this.state.storeViewModel, storeMedicineModel: value, type: 'O2O_medicine_detail', })
        }

    }

    //-----------------------------------------------RENDER---------------------------------------------
    render() {
        return <YFWOTOMedicineDetailViewModel state={this.state} navigation={ this.props.navigation} controller={this}/>
    }
}
