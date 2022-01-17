import React from 'react';
import YFWWDBaseController from '../../Base/YFWWDBaseController';
import YFWWDMyCouponView from '../View/YFWWDMyCouponView';
import YFWWDMyCouponModel from '../Model/YFWWDMyCouponModel';
import { kList_from } from '../../Base/YFWWDBaseModel';
import { safe, isEmpty } from '../../../PublicModule/Util/YFWPublicFunction';
import { pushWDNavigation,kRoute_shop_detail,kRoute_goods_detail,kRoute_shop_goods_detail} from '../../YFWWDJumpRouting';
import YFWToast from '../../../Utils/YFWToast';

export default class YFWWDMyCouponController extends YFWWDBaseController {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        header:null
    });

    constructor(props) {
        super(props);
        this.model = new YFWWDMyCouponModel()
        this.view = <YFWWDMyCouponView ref={(view) => this.view = view} father={this} model={this.model.listModel}/>
    }

    componentDidMount() { 
        this.model.listModel.from = kList_from.kList_from_mycoupon
        this.model.listModel.needRequest = true
        this.model.listModel.dataPath = 'dataList'
        this.getParamMap()
        this.getListData()
    }

    getParamMap(){ 
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.buy.usercoupons.getPageData')
        paramMap.set('pageSize', 10);
        paramMap.set('pageIndex', this.model.listModel.currentPage);
        paramMap.set('status', this.model.type);
        this.model.listModel.paramMap =  paramMap
    }


    render() {
        return this.view
    }

    /******************delegete********************/
    backMethod() { 
        super.backMethod()
    }

    changeType(obj) { 
        this.model.type = safe(obj.i)
        this.listRefresh()
    }

    toDetail(item) {
        if (item.btn_name == '已使用'||item.btn_name == '已过期')
            return
        let {navigate} = this.props.navigation;

        switch (item.type) {
            case '1':
                pushWDNavigation(navigate, {type: kRoute_shop_detail, value: item.shop_id})
                break
            case '2':
                if(!isEmpty(item.goods_id)){
                    pushWDNavigation(navigate, {type: kRoute_goods_detail, value: item.goods_id})
                }else{
                    pushWDNavigation(navigate, {type: kRoute_shop_goods_detail, value: item.shop_goods_id})

                }
                break
            case '3':
                this.props.navigation.popToTop();
                const resetActionTab = NavigationActions.navigate({routeName: 'HomePageNav'});
                this.props.navigation.dispatch(resetActionTab);
                break
        }
    }


    subMethods(key, instance) { 
        if (instance.status == '0') {
            return
        }
        if (key == 'delete') {
            let bean = {
                title: "确定删除吗？",
                leftText: "取消",
                rightText: "确定",
                rightClick: ()=>this.deleteCoupon(instance)
            }
    
            this.view.tipsDialog && this.view.tipsDialog._show(bean);
        }
    }
    
    deleteCoupon = (instance) => {
        let paramMap = new Map();
        paramMap.set('__cmd', 'store.buy.usercoupons.delete');
        paramMap.set('id', instance.id);
        this.model.requestWithParams(paramMap, (res)=> {
            this.listRefresh()
            YFWToast('删除成功')
        }, (error)=> {
    
        }, false);
    }

}