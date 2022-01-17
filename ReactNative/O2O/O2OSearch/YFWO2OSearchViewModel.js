import React, { Component } from 'react';
import YFWO2OSearchView from './YFWO2OSearchView'
export function YFWO2OSearchViewModel(controller) {
    let { state } = controller;
    let vm = {};
    vm.dataSource = state.dataSource
    vm.showType = state.showType
    vm.relativeItems = state.relativeItems
    vm.firstLoad = state.firstLoad
    vm.hotWords = state.hotWords
    vm.resultHeaderItem = {
        location: state.location,
        rowCount: state.rowCount,
    }
    vm.searchInput = {
        placeholder: '批准文号、通用名、商品名、症状',
        cancelText: '取消',
        searchIcon: require('../Image/search_icon.png'),
        searchDeleteIcon: require('../Image/delete_icon.png'),
        searchText: state.searchText,
        backIcon: require('../Image/icon_back_white.png'),
    }
    vm.historySearch = {
        titleText: '历史搜索',
        deleteAllIcon: require('../Image/deleteAll_icon.png'),
        deleteIcon: require('../Image/icon_delete_white.png'),
        deleteAllText: '全部删除',
        deleteComplete: '完成'
    }
    vm.hotSearch = {
        titleText: '热门搜索',
    }
    vm.clickShopItemMethod = (searchText) => {
        controller.clickShopItemMethod && controller.clickShopItemMethod(searchText)
    }
    vm.clickGoodsItemMethod = (searchText) => {
        controller.clickGoodsItemMethod && controller.clickGoodsItemMethod(searchText)
    }
    vm.clickItemMethod = (type, searchText) => {
        if (type == 'shop')
            controller.clickShopItemMethod && controller.clickShopItemMethod(searchText)
        else
            controller.clickGoodsItemMethod && controller.clickGoodsItemMethod(searchText)
    }
    vm.relative = {
        searchTextFirstHalf: '搜索“',
        searchTextFinalHalf: '”的商家',
        shopIcon: require('../Image/shops.png'),

    }
    vm.clickMethod = {
        clickShopItemMethod: vm.clickShopItemMethod,
        clickGoodsItemMethod: vm.clickGoodsItemMethod,
        clickItemMethod: vm.clickItemMethod,
    }
    vm.onChangeText = (text) => {
        console.log(text);
        controller.onChangeText && controller.onChangeText(text);
    }
    vm.searchClick = (text) => {
        controller.searchClick && controller.searchClick(text);
    }
    vm.goBack = () => {
        controller._goBack && controller._goBack();
    }
    vm._removeKeywords = () => {
        controller._removeKeywords && controller._removeKeywords();
    }
    vm.onFocus = () => {
        controller.onFocus && controller.onFocus();
    }
    vm.onRefresh = (keywords = '', index = 1) => {
        controller._fetchResultData && controller._fetchResultData(keywords, index)
    }
    vm.refreshing = state.refreshing
    vm.noMore = state.noMore
    vm.index = state.index
    vm._dealNavigation = (data) => {
        controller._dealNavigation && controller._dealNavigation(data)
    }
    return <YFWO2OSearchView viewModel={vm} />
}
export default YFWO2OSearchViewModel;
