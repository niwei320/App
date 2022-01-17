import React, { Component } from 'react';
import YFWO2OCategoryResultView from './YFWO2OCategoryResultView'
export function YFWO2OCategoryResultViewModel(controller) {
    let { state } = controller;
    let vm = {};
    vm.dataSource = state.dataSource
    vm.showType = state.showType
    vm.resultHeaderItem = {
        location: state.location,
        rowCount: state.rowCount,
    }
    vm.navigationBar = {
        categoryName: state.categoryName,
        backIcon: require('../Image/icon_back_white.png'),
        searchIcon: require('../Image/search_icon.png')
    }
    vm._dealNavigation = (data) => {
        controller._dealNavigation&&controller._dealNavigation(data)
    }
    vm.goBack = () => {
        controller._goBack && controller._goBack();
    }
    vm.onRefresh = (keywords = '', index = 1) => {
        controller._fetchResultData && controller._fetchResultData(keywords, index)
    }
    vm.refreshing = state.refreshing
    vm.noMore = state.noMore
    vm.index = state.index
    vm.categoryId = state.categoryId
    vm.firstLoad = state.firstLoad
    return <YFWO2OCategoryResultView viewModel={vm} />
}
export default YFWO2OCategoryResultViewModel;
