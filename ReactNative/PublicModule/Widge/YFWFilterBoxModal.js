import React, {Component} from 'react';
import {
    View,
    Image,
    Text,
    Animated,
    TouchableOpacity, Easing,

} from 'react-native'
import ModalView from '../../widget/ModalView'
import YFWFilterBoxView from './YFWFilterBoxView'
import {darkLightColor, darkTextColor, yfwGreenColor} from "../../Utils/YFWColor";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import YFWNativeManager from "../../Utils/YFWNativeManager";
import {kScreenHeight, kScreenWidth, isNotEmpty, safe, safeArray, itemAddKey} from "../Util/YFWPublicFunction";
import YFWMFilterBoxView from '../../widget/YFWMFilterBoxView'
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel';

export default class YFWFilterBoxModal extends Component {

    static defaultProps = {
        category_id:'',
        keywords:'',
        paramJson:{},
    }

    constructor(props) {
        super(props)
        this.state = {
            animationValue: new Animated.Value(-0.8 * kScreenWidth),
            DrugNameDataArray:[],//商品名/品牌
            ManufacturerDataArray:[],//厂家
            StandardDataArray:[],//规格
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
                <Animated.View
                    style={{width:0.8*kScreenWidth,height:kScreenHeight,marginRight:this.state.animationValue}}>
                    {/* <YFWMFilterBoxView/> */}
                    <YFWFilterBoxView ref={(filter)=>this.filter = filter} keywords={this.props.keywords}
                                      category_id={this.props.category_id}  paramJson={this.props.paramJson}
                                      saveMethod={(param,paramJson)=>this.saveMethod(param,paramJson)} from = {this.props.from} father={this}/>
                </Animated.View>
                <TouchableOpacity style={{flex:1}} activeOpacity={1} onPress={()=>{this.closeView()}}>
                    <View style={{flex:1}}/>
                </TouchableOpacity>
            </View>
        );
    }
       //Request

       _ProcessInterface(index) {
        switch (this.props.from) {
            case "YFWSearchDetailListView":
            case "YFWWDSearchDetailListView":
                switch (index) {
                    case 0:
                        return 'guest.medicine.getSearchAliascn';
                    case 1:
                        return 'guest.medicine.getSearchTitleAbb';
                    case 2:
                        return 'guest.medicine.getSearchStandard';
                    case 3:
                        return 'guest.medicine.getSearchTrocheType'
                }
                break;
            case "YFWSubCategoryController":
                switch (index) {
                    case 0:
                        return 'guest.medicine.getTopAliasCN';
                    case 1:
                        return 'guest.store.getTopMills';
                    case 2:
                        return '';//规格字段 被去除
                    case 3:
                        return 'guest.medicine.getTopTrocheType'
                }
                break;
            case "YFWWDSubCategoryList":
                switch (index) {
                    case 0:
                        return 'store.whole.medicine.getTopAliasCN';
                    case 1:
                        return 'store.whole.medicine.getTopMills';
                    case 2:
                        return '';//规格字段 被去除
                    case 3:
                        return 'guest.medicine.getTopTrocheType'
                }
                break;
        }
    }

    _requestSelectItem(index,back) {
        if (index == 0 && safeArray(this.state.DrugNameDataArray).length > 0) {
            back&&back(this.state.DrugNameDataArray)
        }
        if (index == 1 && safeArray(this.state.ManufacturerDataArray).length > 0) {
            back&&back(this.state.ManufacturerDataArray)
        }
        if (index == 2 && safeArray(this.state.StandardDataArray).length > 0) {
            back&&back(this.state.StandardDataArray)
        }

        let paramMap = new Map();
        let tableName = this._ProcessInterface(index);
        paramMap.set('__cmd', tableName);
        if (tableName == 'guest.store.getTopMills'||tableName == 'store.whole.medicine.getTopMills') {
            paramMap.set('hasprice','1')
        }
        if (isNotEmpty(this.props.category_id)) {
            paramMap.set('conditions', {'categoryid': this.props.category_id+"",sub_type:this.props.from==('YFWWDSearchDetailListView'||'YFWWDSubCategoryList')?1:0});
            paramMap.set('limit', 1000)
        }
        if (isNotEmpty(this.props.keywords)) {
            paramMap.set('keywords', safe(this.props.keywords));
        }
        let viewModel = new YFWRequestViewModel();
        // for (let [k,v] of this._getParamMap(index)) {
        //     paramMap.set(k, v);
        // }
        viewModel.TCPRequest(paramMap, (res) => {
            let dataArray = safeArray(res.result)
            if (dataArray.length > 0) {
                dataArray = itemAddKey(dataArray, index == 0?'alias_cn':index == 1?'brand':'standard');
                if (index == 0) {
                    this.state.DrugNameDataArray = dataArray
                } else if (index == 1) {
                    this.state.ManufacturerDataArray = dataArray
                } else if (index == 2) {
                    this.state.StandardDataArray = dataArray
                }
            }
            back && back(dataArray)
        }, () => {
            back && back([])
        })

    }

}
