import React, { Component } from 'react';
import YFWOTOMedicineDetailView from './YFWOTOMedicineDetailView'
export class YFWOTOMedicineDetailViewModel extends Component{
    constructor(props) { 
        super(props)
        this.handleData()
    }

    static getDerivedStateFromProps(nextProps,prevState){
        //该方法内禁止访问this
        if (nextProps !== prevState) {
            //通过对比nextProps和prevState，返回一个用于更新状态的对象
            return { canUpdate: true }
        } else { 
            return { canUpdate: false }
        }
        
    }

    handleData() {
        let { state, navigation ,controller} = this.props;
        let { showLoading, shopcartCount, defaultImg, defaultCount, selectDetailTabIndex, storeViewModel, medicineDetailModel, medicineDetailInfoDetailModel } = state 

        this.vm = {};
        this.vm.navigation = navigation
        this.vm.showLoading = showLoading
        this.vm.shopcartCount = shopcartCount
        this.vm.defaultImg = defaultImg
        this.vm.defaultCount = defaultCount
        this.vm.selectDetailTabIndex = selectDetailTabIndex
    
        this.vm.storeViewModel = storeViewModel
        this.vm.medicineDetailModel = medicineDetailModel
        this.vm.medicineDetailInfoDetailModel = medicineDetailInfoDetailModel

        this.vm.clickMethods = (type,value) => {
            controller.clickMethods&&controller.clickMethods(type,value)
        }
    }


    

    render() {
        this.handleData()
        return <YFWOTOMedicineDetailView viewModel={this.vm} ref={(view) => {this.view = view }}/>
    }
}
export default YFWOTOMedicineDetailViewModel;
