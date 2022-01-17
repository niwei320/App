import React, {Component} from 'react';
import {
    View,
    Image,
    Text,
    Animated,
    TouchableOpacity, Easing,

} from 'react-native'
import ModalView from '../../widget/ModalView'
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {
    kScreenHeight,
    kScreenWidth,
    isNotEmpty,
    safe,
    safeArray,
    itemAddKey,
    isAndroid, getStatusBarHeight
} from "../../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';
import YFWSellerFilterBoxView from './YFWSellerFilterBoxView';
import { ChooseAddressProvinceData,getItem,setItem } from '../../Utils/YFWStorage';
import YFWChooseAddressViewModel from '../../UserCenter/Model/YFWChooseAddressViewModel';

export default class YFWSellerFilterBoxModal extends Component {

    static defaultProps = {
        category_id:'',
        keywords:'',
        paramJson:{},
    }

    constructor(props) {
        super(props)
        this.state = {
            animationValue: new Animated.Value(-0.8 * kScreenWidth),
            DrugNameDataArray:[
                {title:'180天-1年',id:'one',radio:true},
                {title:'1年以上',id:'two',radio:true},
                {title:'2年以上',id:'three',radio:true},
            ],//效期
            ManufacturerDataArray:[
                {title:'多买优惠',id:'a'},
                {title:'满减优惠',id:'b'},
                {title:'优惠券',id:'c'},
            ],//优惠活动
            StandardDataArray:[],//所在地
        }
    }



    // ======== action ========
    showView() {

        this.modalView && this.modalView.show()
        Animated.spring (
            this.state.animationValue, {
                toValue: 0,
                duration: 800,
                easing: Easing.linear
            }
        ).start()
        this._openDefaultMethod();

    }


    closeView(){
        Animated.spring (
            this.state.animationValue, {
                toValue: -0.8*kScreenWidth,
                duration: 800,
                easing: Easing.linear
            }
        ).start()
        this.modalView && this.modalView.disMiss()
    }

    saveMethod(param,paramJson){
        if (this.props.saveMethod) {
            this.props.saveMethod(param,paramJson);
        }
    }

    _openDefaultMethod(){
        if (this.filter) {
            this.filter._openMethod();
        }

    }

    // ====== View ======
    render() {
        return (
            <ModalView ref={(m) => this.modalView = m} animationType="fade">
                {this.renderAlertView()}
            </ModalView>
        )
    }

    renderAlertView(){
        return(
            <View style={[BaseStyles.rightCenterView,{flex:1,backgroundColor: 'rgba(0, 0, 0, 0.3)'}]}>
                <TouchableOpacity style={{flex:1}} activeOpacity={1} onPress={()=>{this.closeView()}}>
                    <View style={{flex:1}}/>
                </TouchableOpacity>
                <Animated.View
                    style={{
                        width:0.8*kScreenWidth,
                        height:kScreenHeight,
                        paddingBottom:(isAndroid()?getStatusBarHeight():0),
                        marginRight:this.state.animationValue,
                        position:'absolute',
                        left:0,
                        top:0
                    }}>
                    <YFWSellerFilterBoxView ref={(filter)=>this.filter = filter}
                                            paramJson={this.props.paramJson}
                                            saveMethod={(param,paramJson)=>this.saveMethod(param,paramJson)}
                                            from = {this.props.from}
                                            father={this}/>
                </Animated.View>
            </View>
        );
    }

    _requestSelectItem(index,back) {
        if (index == 0 && this.state.DrugNameDataArray.length > 0) {
            back&&back(this.state.DrugNameDataArray)
        }
        if (index == 1 && this.state.ManufacturerDataArray.length > 0) {
            back&&back(this.state.ManufacturerDataArray)
        }
        if (index == 2) {
            if (this.state.StandardDataArray.length > 0) {
                back&&back(this.state.StandardDataArray)
            } else {
                this.handleProvinceData(index,back)
            }
        }

    }

    handleProvinceData(index,back) {
        getItem(ChooseAddressProvinceData).then((data)=> {
            if (isNotEmpty(data)) {
                itemAddKey(data);
                data = data.map((item)=>{
                    item.radio = true
                    return item
                })
                this.state.StandardDataArray = data;
                back&&back(data)
            } else {
                let paramMap = new Map();
                paramMap.set('__cmd', 'guest.sys_region.getListByParentId');
                paramMap.set('regionid', 0);
                let viewModel = new YFWRequestViewModel();
                viewModel.TCPRequest(paramMap, (res) => {
                    let data = YFWChooseAddressViewModel.getModelData(res.result);
                    setItem(ChooseAddressProvinceData,data);
                    itemAddKey(data);
                    data = data.map((item)=>{
                        item.radio = true
                        return item
                    })
                    this.state.StandardDataArray = data;
                    back&&back(data)
                },(error)=>{
                    this.state.StandardDataArray = []
                    back&&back([])
                });
            }

        });
    }

}
