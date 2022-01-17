import React from 'react';
import YFWWDStoreAllGoodsView from '../View/YFWWDStoreAllGoodsView';
import YFWWDMedicineInfoModel from '../../Widget/Model/YFWWDMedicineInfoModel';
import YFWWDListPageDataModel from '../../Widget/Model/YFWWDListPageDataModel';
import YFWUserInfoManager from '../../../Utils/YFWUserInfoManager';
import { itemAddKey, safeArray, safeObj, tcpImage, isNotEmpty } from '../../../PublicModule/Util/YFWPublicFunction';
import YFWToast from '../../../Utils/YFWToast';
import YFWWDCategoryItemModel from '../../Widget/Model/YFWWDCategoryItemModel';
import YFWWDBaseController from '../../Base/YFWWDBaseController';
import { pushWDNavigation, kRoute_shop_goods_detail, kRoute_shoppingcar } from '../../YFWWDJumpRouting';
import { kList_from } from '../../Base/YFWWDBaseModel';
import YFWWDStoreAllGoodsModel from '../Model/YFWWDStoreAllGoodsModel';

export default class YFWWDStoreAllGoodsController extends YFWWDBaseController {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header: null
    });

    constructor(props) {
        super(props);
        this.model = new YFWWDStoreAllGoodsModel()
        this.model.listModel.shopId = this.props.navigation.state.params.state.value
        this.model.from = this.props.navigation.state.params.state.from
        this.view = <YFWWDStoreAllGoodsView ref={(view) => this.view = view} father={this} model={this.model.listModel}/>
    }

    componentWillMount() { 
        this.model.priceSumInShop = this.props.navigation.state.params.state.priceSumInShop
        this.getCollectBills()
        this.model.listModel.categoryId = ''
        this.model.listModel.numColumns = 2
        this.model.listModel.dataPath = 'dataList'
        this.model.listModel.from = kList_from.kList_from_storeList
        this.getParamMap()
        this.getListData()
    }

    render() {
        return this.view
    }

    getParamMap() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.whole.app.getStoreMedicineSearchWhole')
        paramMap.set('storeid', this.model.listModel.shopId);
        paramMap.set('categoryid', this.model.listModel.categoryId);
        paramMap.set('pageSize', this.model.listModel.pageSize);
        paramMap.set('pageIndex', this.model.listModel.currentPage);
        paramMap.set('orderField', this.model.listModel.sort);
        paramMap.set('keywords', this.model.listModel.keyword);
        paramMap.set('user_city_name', YFWUserInfoManager.ShareInstance().getCity());
        paramMap.set('user_region_id', YFWUserInfoManager.ShareInstance().getRegionId());
        this.model.listModel.paramMap = paramMap
    }

    //请求包邮满减信息
    getCollectBills() {
        if (isNotEmpty(this.model.priceSumInShop)) {     
            let paramMap = new Map();
            paramMap.set('__cmd','store.buy.cart.getFreepostageAndActivityInfo');
            paramMap.set('storeid',this.model.listModel.shopId);
            paramMap.set('price',this.model.priceSumInShop);
            this.model.requestWithParams(paramMap , (res)=>{
                if(res.code == 1){
                    if(isNotEmpty(res.result)){
                        let collectBillsInfo = {
                            add_on : safeObj(res.result).add_on,
                            add_on_isshow : safeObj(res.result).add_on_isshow,
                            freepostage : safeObj(res.result).freepostage,
                            freepostage_isshow : safeObj(res.result).freepostage_isshow,
                            minprice_msg : safeObj(res.result).minprice_msg,
                            minprice_msg_isshow : safeObj(res.result).minprice_msg_isshow,
                        }
                        if (collectBillsInfo.add_on == '' && collectBillsInfo.freepostage == '' && collectBillsInfo.minprice_msg == '') {
                            this.model.showCollectBillsHint = false
                        } else { 
                            this.model.showCollectBillsHint = true
                        }
                        this.model.collectBillsInfo = collectBillsInfo
                        this.view&&this.view.updateViews&&this.view.updateViews()
                    }
                }
            },(error)=>{},false);
        }
    }

    changeFilterStatus(item) { 
        if (item.icontype == 1) {
            this.view.categoryViewOpen = !this.view.categoryViewOpen
            this.view.updateViews()
            return
        } 
        if (item.icontype == 2 && item.type == 'price') {
            if (item.status) {
                this.model.listModel.sort = 'price asc'
            } else {
                this.model.listModel.sort = 'price desc'   
            }
        } else { 
            this.model.listModel.sort = 'sale_count desc'
        }
        this.model.listModel.dataArray = []
        this.model.listModel.currentPage = 1
        this.model.listModel.showFoot = 0
        this.getListData((data) => { 
            this.getMedicineArray(data, (medicineArray) => { 
                this.model.listModel.dataArray = medicineArray
                this.view&&this.view.updateViews&&this.view.updateViews()
            })
        })
    }

    searchClick(keyword) { 
        this.model.listModel.keyword = keyword
        this.model.listModel.dataArray = []
        this.model.listModel.currentPage = 1
        this.model.listModel.showFoot = 0
        this.getListData((data) => { 
            this.getMedicineArray(data, (medicineArray) => { 
                this.model.listModel.dataArray = medicineArray
                this.view.updateViews()
            })
        })
    }

    toScanView() { 
        YFWToast('去扫一扫')
    }

    getCategory(back) {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.whole.app.getSpecialCategoryWhole');    
        YFWWDListPageDataModel.request(paramMap, (res) => { 
            back&&back(this.handleCategoryData(res.result))
        }, (err) => { 
                
        },true)
    }

    handleCategoryData(data) { 
        data = safeArray(data)
        let returnArray = []
        //初始化分类商品YFWWDListPageDataModel
        data.forEach((value, index) => {
            let instance = new YFWWDCategoryItemModel(safeObj(value.name), safeObj(value.id))
            returnArray.push(instance)
        });
        return returnArray
    }

    categoryClick(item) {
        let instance = YFWWDCategoryItemModel.init(item)
        this.model.listModel.dataArray = []
        this.model.listModel.currentPage = 1
        this.model.listModel.showFoot = 0
        this.model.listModel.categoryId = instance.id
        this.getParamMap()
        this.getListData()
    }

    toDetail(medicine) { 
        let instance = YFWWDMedicineInfoModel.initWithModel(medicine)
        const { navigate } = this.props.navigation;
        pushWDNavigation(navigate, { type: kRoute_shop_goods_detail, value: instance.id, img_url: tcpImage(instance.image) })
    }
    
    subMethods(type, medicine) { 
        if (type=='addcar') {
            this.addShopCar(medicine, 1)
            if (isNotEmpty(this.model.priceSumInShop)) {
                this.model.priceSumInShop += medicine.wPrice
            }
            this.getCollectBills()
        }
    }

    toShopCar() { 
        if (this.model.from == 'shopcar') {
            this.props.navigation.goBack()
        } else if (this.model.from == 'detail') { 
            pushWDNavigation(this.props.navigation.navigate,{type:kRoute_shoppingcar})
        }
    }
}