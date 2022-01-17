import React, { Component } from 'react'
import { View, Text, Image, TouchableOpacity, TextInput, FlatList, DeviceEventEmitter } from 'react-native'
import { isIphoneX, kScreenWidth, safe, safeObj } from '../../PublicModule/Util/YFWPublicFunction';
import { pushNavigation } from '../../Utils/YFWJumpRouting';
import YFWEmptyView from '../../widget/YFWEmptyView';
import YFWO2OCancelOrComfirmModal from '../widgets/YFWO2OCancelOrComfirmModal';
import YFWOTOStoreCart from './YFWOTOStoreCart';
import YFWOTOStoreMedicineCell from './YFWOTOStoreMedicineCell';

export default class YFWOTOStoreSearchController extends Component {
  static navigationOptions = ({ navigation }) => ({
    tabBarVisible: false,
    header: null
  });

  constructor(props) {
    super(props)

    const data = safeObj(safeObj(this.props.navigation.state.params.state).data)
    this.state = {
      viewModel: data,
      editHistory: false,
      tFocus: false
    }

    this.lisenter()
  }

  handleBack() {
    this.props.navigation.goBack()
  }

  handleEditHistroy(edit) {
    this.setState({ editHistory: edit })
  }

  handleDeleteHistoryTag(tag) {
    const { item, index } = tag
    let { viewModel } = this.state
    viewModel.searchHistory.splice(index, 1)
    this.setState({ viewModel: viewModel })
  }

  handleClearModal() {
    this.clearRef && this.clearRef.show()
  }

  handleClearSearchHistory() {
    this.clearRef && this.clearRef.disMiss()
    this.state.viewModel.removeSearchHistory()
    this.setState({ editHistory: false })
  }

  handleEditMedicineQuantity(medicine, quantity) {
    this.handleCartEditMedicineQuantity(medicine, quantity)
  }

  handleCartEditMedicineQuantity(medicine, quantity) {
    this.state.viewModel.editMedicineQuantity(medicine, quantity, res => {
      console.log(res);
      this.state.viewModel.dealSearchMedicine()
      medicine.quantity = quantity
      this.setState({})
    })
  }

  handleClearCart() {
    this.state.viewModel.clearShopCart(res => {
      console.log(res);
      // this.setState({})
      DeviceEventEmitter.emit('kOTOShoppingCartChange')
    })
  }

  handleTextChange(text) {
    this.state.viewModel.searchKey = text.replace(/ /g, '')
    this.state.viewModel.searchType = 'keywords'
    this.state.viewModel.searchResult = []
    this.setState({})
    if (text.length > 0) {

      this.state.viewModel.searchKeywords(res => {
        console.log(res);
        this.setState({})
      })
    }
  }

  handleHistoryTag(tag) {
    const { item } = tag
    this.state.viewModel.searchKey = item
    this.handleSearchMedicine()
  }

  handleSearchMedicine() {
    this.state.viewModel.searchType = 'medicine'
    this.state.viewModel.searchMedicine(res => {
      console.log(res);
      this.state.viewModel.addHistory()
      this.setState({})
    })
  }

  handleMedicineItem(item) {
    const { navigate } = this.props.navigation
    const { viewModel } = this.state
    pushNavigation(navigate, { storeViewModel: viewModel, storeMedicineModel: item, type: 'O2O_medicine_detail', })
  }

  handleClearSearch() {
    this.state.viewModel.searchKey = ''
    this.setState({})
  }

  lisenter() {
    this.shopCartEmit = DeviceEventEmitter.addListener('kOTOShoppingCartChange', () => {
      this.setState({})
    })
    this.shopcartDeleteEmit = DeviceEventEmitter.addListener('kOTOShoppingCartDelete', (value) => {
      let { viewModel } = this.state
      viewModel.dealShopCartDelete(value)
      this.setState({ viewModel: viewModel })
    })
  }

  componentDidMount() {
    // console.log(this.state.viewModel);
  }

  componentWillUnmount() {
    this.state.viewModel.resetSearchData()
    this.state.viewModel.saveSearchHistory()
    this.shopCartEmit && this.shopCartEmit.remove()
    this.shopcartDeleteEmit && this.shopcartDeleteEmit.remove()
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        {this.renderNavigation()}
        <View style={{ flex: 1 }}>
          {this.renderHistory()}
          {this.renderSearchResult()}
        </View>
        {this.renderBottom()}
      </View>
    )
  }

  renderNavigation() {
    return (
      <View style={{ height: isIphoneX() ? 88 : 64, flexDirection: 'row', alignItems: 'flex-end' }}>
        <TouchableOpacity onPress={this.handleBack.bind(this)} activeOpacity={1} style={{ width: 40, height: 44, justifyContent: 'center', alignItems: 'center' }}>
          <Image source={require('../../../img/icon_back_gray.png')} style={{ width: 7, height: 14 }} />
        </TouchableOpacity>
        <View style={{ flex: 1, height: 44, paddingVertical: 5 }}>
          <View activeOpacity={1} style={{ flexDirection: 'row', alignItems: 'center', height: 34, backgroundColor: '#f5f5f5', borderRadius: 17 }}>
            <Image source={require('../Image/icon_search_gray.png')} style={{ width: 14, height: 15, marginLeft: 10 }} />
            <TextInput
              style={{ fontSize: 14, color: '#333', marginLeft: 5, flex: 1 }}
              placeholder={'输入商品名称'}
              placeholderTextColor={'#ccc'}
              value={this.state.viewModel.searchKey}
              onChangeText={this.handleTextChange.bind(this)}
              autoFocus={true}
              returnKeyType={'search'}
              onSubmitEditing={this.handleSearchMedicine.bind(this)}
              onFocus={() => { this.setState({ tFocus: true }) }}
              onBlur={() => { this.setState({ tFocus: false }) }}
            />
          <TouchableOpacity onPress={this.handleClearSearch.bind(this)} activeOpacity={1} style={{width: 40, height: 44, justifyContent: 'center', alignItems: 'center', display: this.state.viewModel.searchKey.length>0&&this.state.tFocus ? 'flex' : 'none'}}>
            <Image source={require('../Image/delete_icon.png')} style={{width: 14, height: 14}} />
          </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={this.handleSearchMedicine.bind(this)} activeOpacity={1} style={{ paddingHorizontal: 13, height: 44, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: '#5799f7', fontWeight: '500' }}>搜索</Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderHistory() {
    const { viewModel, editHistory } = this.state
    return (
      <View style={{ position: 'absolute', left: viewModel.searchKey.length == 0 ? 0 : kScreenWidth, width: kScreenWidth, top: 0, bottom: 0, zIndex: 1, backgroundColor: '#fff' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 14, color: '#333', fontWeight: '500', marginLeft: 20 }}>历史搜索</Text>
          {!editHistory ? <TouchableOpacity onPress={this.handleEditHistroy.bind(this, true)} activeOpacity={1} style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
            <Image source={require('../Image/deleteAll_icon.png')} style={{ width: 14, height: 17 }} />
          </TouchableOpacity>
            : <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={this.handleClearModal.bind(this)} activeOpacity={1} style={{ height: 40, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 7 }}>
                <Text style={{ fontSize: 12, color: '#666' }}>全部删除</Text>
              </TouchableOpacity>
              <View style={{ backgroundColor: '#999', width: 1, height: 10 }}></View>
              <TouchableOpacity onPress={this.handleEditHistroy.bind(this, false)} activeOpacity={1} style={{ height: 40, justifyContent: 'center', alignItems: 'center', paddingLeft: 7, paddingRight: 13 }}>
                <Text style={{ fontSize: 12, color: '#fe0000' }}>完成</Text>
              </TouchableOpacity>
            </View>}
        </View>
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 }}>
          {viewModel.searchHistory.map((item, index) => {
            return this.renderHistoryTag({ item: item, index: index })
          })}
        </View>
        <YFWO2OCancelOrComfirmModal title={'确定删除全部历史记录？'} ref={e => this.clearRef = e} confirmOnPress={this.handleClearSearchHistory.bind(this)} />
      </View>
    )
  }

  renderHistoryTag(tag) {
    const { item, index } = tag
    const { editHistory } = this.state
    if (safe(item).replace(/ /g, '').length > 0) {
      
      return (
        <View key={index + ''} >
          <TouchableOpacity onPress={this.handleHistoryTag.bind(this, tag)} activeOpacity={1} style={{ paddingHorizontal: 20, height: 30, backgroundColor: '#e9f2ff', borderRadius: 15, justifyContent: 'center', marginHorizontal: 4, marginBottom: 7 }}>
            <Text style={{ fontSize: 11, color: '#5799f7' }}>{item}</Text>
          </TouchableOpacity>
          {editHistory && <TouchableOpacity onPress={this.handleDeleteHistoryTag.bind(this, tag)} activeOpacity={1} style={{ position: 'absolute', right: 0, width: 30, justifyContent: 'center', alignItems: 'center', height: 30 }}>
            <Image source={require('../Image/icon_delete_white.png')} style={{ width: 7, height: 7, tintColor: '#5799f7' }} />
          </TouchableOpacity>}
        </View>
      )
    }
  }

  renderSearchResult() {
    const { viewModel } = this.state
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          data={viewModel.searchResult}
          extraData={this.state.viewModel}
          renderItem={this.renderItem.bind(this)}
          keyExtractor={(item, index) => viewModel.searchType + index}
          ListEmptyComponent={() => { return this.state.viewModel.searchType !== 'keywords' ? <YFWEmptyView title={'暂无结果'} /> : <></> }}
        />
      </View>
    )
  }

  renderItem(search) {
    const { searchType } = this.state.viewModel
    if (searchType == 'keywords') {
      return this.renderKeywordsItem(search)
    } else {
      return this.renderSearchItem(search)
    }
  }

  renderKeywordsItem(search) {
    const { item, index } = search
    return (
      <TouchableOpacity onPress={this.handleHistoryTag.bind(this, search)} activeOpacity={1} style={{ height: 40, paddingHorizontal: 16, justifyContent: 'center' }}>
        {safe(item) !== '[object Object]' && <Text style={{ fontSize: 12, color: '#333' }}>{safe(item)}</Text>}
      </TouchableOpacity>
    )
  }

  renderSearchItem(search) {
    const { item, index } = search
    const { viewModel } = this.state
    return (
      <TouchableOpacity onPress={this.handleMedicineItem.bind(this, item)} activeOpacity={1} style={{ height: 100, paddingHorizontal: 16, paddingVertical: 18 }}>
        {safe(item) == '[object Object]' && <YFWOTOStoreMedicineCell imageWH={64} navigation={this.props.navigation} data={item} editQuantity={viewModel.storeInfo.is_show_cart} saleCountType={1} onEditQuantity={this.handleEditMedicineQuantity.bind(this, item)} />}
      </TouchableOpacity>
    )
  }

  renderBottom() {
    return (
      <View style={{ height: isIphoneX() ? 77 : 60 }}>
        <YFWOTOStoreCart
          navigation={this.props.navigation}
          data={this.state.viewModel.storeCartData}
          onEditQuantity={this.handleCartEditMedicineQuantity.bind(this)}
          onClearCart={this.handleClearCart.bind(this)}
          onMedicineItem={this.handleMedicineItem.bind(this)}
        />
      </View>
    )
  }
}