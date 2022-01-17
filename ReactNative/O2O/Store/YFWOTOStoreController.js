import React, { Component } from 'react'
import { View, Text, Image, TouchableOpacity, FlatList, SectionList, DeviceEventEmitter, Animated } from 'react-native'
import LinearGradient from 'react-native-linear-gradient';
import { adaptSize, haslogin, isIphoneX, kScreenWidth, safe, safeArray, safeObj } from '../../PublicModule/Util/YFWPublicFunction';
import YFWOTOStoreViewModel from './YFWOTOStoreViewModel';
import { LargeList } from 'react-native-largelist-v3';
import YFWOTOStoreMedicineCell from './YFWOTOStoreMedicineCell';
import YFWOTOStoreCart from './YFWOTOStoreCart';
import FastImage from 'react-native-fast-image';
import YFWOTOPopupMenu from '../widgets/YFWOTOPopupMenu';
import { pushNavigation } from '../../Utils/YFWJumpRouting';
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager';
import YFWNativeManager from '../../Utils/YFWNativeManager';
import { refreshOTORedPoint } from '../../Utils/YFWInitializeRequestFunction';

export default class YFWOTOStoreController extends Component {
  static navigationOptions = ({navigation}) => ({
    tabBarVisible: false,
    header: null
  });

  constructor(props) {
    super(props)

    const data = safeObj(safeObj(this.props.navigation.state.params.state).data)
    const user = new YFWUserInfoManager()
    this.state = { 
      viewModel: new YFWOTOStoreViewModel(data),
      clockText: '',
      shopcartCount: parseInt(safe(user.otoShopCarNum)),
      login: haslogin(),
      loading: true,
    }

    this.contentH = isIphoneX() ? 528 : 383
    this.scrollY = 0 // 滚动标记
    this.categoryTouch = false // 是否是点击分类

    this.lisenter()
  }

  handleBack() {
    this.props.navigation.goBack()
  }

  handleSearch() {
    let { navigate } = this.props.navigation;
    pushNavigation(navigate, {type: 'get_oto_store_search', data: this.state.viewModel})
  }

  handleShopCart() {
    let {navigate} = this.props.navigation;
    pushNavigation(navigate, {type: 'get_shopping_car', showType:'oto'});
  }

  handleMore() {
    this.menu.show()
  }

  handleLookBigPicture(index, images) {
    let imgs = []
    images.forEach(item => {
      if (safe(item.image_url).length > 0) {
        
        imgs.push(item.image_url)
      }
    })
    let {navigate} = this.props.navigation;
    pushNavigation(navigate,{type:'big_picture', value: { imgs: imgs, index: index, notShowTip: true}})
  }

  handleTab(index) {
    let { viewModel } = this.state
    if (viewModel.tab != index) {
      viewModel.tab = index
      this.setState({})
    }
  }

  handleCategoryItem(section) {
    let { viewModel } = this.state
    if (viewModel.loading) {
      return
    }
    if (viewModel.category != section) {
      viewModel.category = section
      this.setState({ viewModel: viewModel, loading: !viewModel.categoryData[section].loaded })

      this.categoryTouch = true

      this.categoryScrollIndex(section)
      this.medicineScrollIndex(section)

      this.fetchCategoryMedicineData()
    }
  }

  handleEditMedicineQuantity(indexPath, quantity) {
    let category = this.state.viewModel.categoryData[indexPath.section]
    let medicine = category.items[indexPath.row]
    this.handleCartEditMedicineQuantity(medicine, quantity)
  }

  handleCartEditMedicineQuantity(medicine, quantity) {
    this.state.viewModel.editMedicineQuantity(medicine, quantity, res => {
      console.log(res);
      this.setState({})
    })
  }

  handleClearCart() {
    this.state.viewModel.clearShopCart(res => {
      console.log(res);
      this.setState({})
    })
  }

  handleMedicineScroll(event) {
    const { contentOffset } = event.nativeEvent
    if (this.categoryTouch) {
      this.categoryTouch = false
      this.scrollY = contentOffset.y 
      return
    }
    let { viewModel } = this.state
    const { category, categoryData } = viewModel
    if (categoryData.length == 0 || viewModel.loading) {
      return
    }
    let index = category
    const categoryModel = categoryData[category]
    if (this.scrollY<contentOffset.y && contentOffset.y>=categoryModel.offsetY) {
      index = Math.min(index+1, categoryData.length-1)
    } else if (this.scrollY>contentOffset.y && contentOffset.y<categoryModel.offsetY && contentOffset.y<categoryModel.lastOffsetY) {
      index = Math.max(0, index-1)
    }
    if (index != category) {
      viewModel.category = index
      this.setState({ viewModel: viewModel })
      this.fetchCategoryMedicineData()
      this.categoryScrollIndex(index)
    }
    this.scrollY = contentOffset.y 
  }

  handlePhone() {
    const { phone } = this.state.viewModel.storeInfo
    YFWNativeManager.takePhone(phone)
  }

  handleMedicineItem(item) {
    if (item.store_medicine_id==0) {
      return
    }
    const { navigate } = this.props.navigation
    const { viewModel } = this.state
    pushNavigation(navigate, {storeViewModel:viewModel,storeMedicineModel:item, type: 'O2O_medicine_detail', })
  }
  
  categoryScrollIndex(index) {
    const { viewModel } = this.state
    let maxOff = (viewModel.categoryData.length+1)*viewModel.categoryHeight-this.contentH
    maxOff = Math.max(0, maxOff)
    const sub = (index*viewModel.categoryHeight+25)-this.contentH/2
    let offset = Math.min(maxOff, Math.max(0, sub))
    console.log(offset);
    this.categoryTabel && this.categoryTabel.scrollTo({x: 0, y: offset}, true).then().catch()
  }

  medicineScrollIndex(index) {
    const { viewModel } = this.state
    const category = viewModel.categoryData[index]
    // this.medicineTabel && this.medicineTabel.scrollToIndexPath({section: index, row: -1}, false).then().catch()
    this.medicineTabel && this.medicineTabel.scrollTo({x: 0, y: category.lastOffsetY}, false).then().catch()
  }

  contentLayout(event) {
    this.contentH = event.nativeEvent.layout.height
  }

  fetchStoreInfoData() {
    this.state.viewModel.getStoreInfo(res => {
      console.log(res);
      this.setState({})
      this.countdownTimer()
    })
  }

  fetchCategoryData() {
    this.state.viewModel.getCategoryData(res => {
      console.log(res);
      this.setState({})
      this.fetchCategoryMedicineData()
    })
  }

  fetchCategoryMedicineData() {
    this.state.viewModel.getCategoryMedicineData(res => {
      console.log(res);
      this.setState({ loading: false })
    }, error => {
      this.setState({ loading: false })
    })
  }

  fetchStoreCartData() {
    this.state.viewModel.getShopCartData(res => {
      console.log(res);
      if (this.state.viewModel.storeInfo.is_show_cart && this.state.viewModel.cartfold) {
        this.state.viewModel.cartfold = false
        this.storeCartRef && this.storeCartRef.handleCart()
      }
      this.setState({})
    })
  }

  lisenter() {
    this.shopCartEmit = DeviceEventEmitter.addListener('kOTOShoppingCartChange', () => {
      this.setState({})
    })
    this.cartCountEmit = DeviceEventEmitter.addListener('OTO_SHOPCAR_NUMTIPS_RED_POINT', (nums) => {
      this.setState({ shopcartCount: parseInt(nums) })
    })
    this.shopcartDeleteEmit = DeviceEventEmitter.addListener('kOTOShoppingCartDelete', (value) => {
      console.log(value);
      let { viewModel } = this.state
      viewModel.dealShopCartDelete(value)
      this.setState({ viewModel: viewModel })
    })
    this.locationEmit = DeviceEventEmitter.addListener('O2OAddressSelected', value => {
      this.state.viewModel.getStoreInfo(res => {
        this.setState({})
      })
    })
    this.loginEmit = DeviceEventEmitter.addListener('UserLoginSucess', value => {
      this.fetchStoreCartData()
      this.fetchStoreInfoData()
      refreshOTORedPoint()
    })
    this.didFocusEmit = this.props.navigation.addListener('didFocus', payload => {
        this.fetchStoreCartData()
        this.fetchStoreInfoData()
        refreshOTORedPoint()
      }
    );
  }

  countdownTimer() {
    this.countdown && clearInterval(this.countdown)
    let that = this
    let end = new Date(Number(that.state.viewModel.storeInfo.end_time))
    if (!that.state.viewModel.storeInfo.is_show_cart) {
      return
    }
    this.countdown = setInterval(() => {
      let sub = end - new Date() + 150
      let second = Math.floor(sub/(1000*60))
      let minites = Math.floor(sub/(1000))%60
      // console.log(second, minites);
      if (second>60 || second<0) {
        clearInterval(that.countdown)
      }
      let clock = ''
      if (second>=0 && second<30) {
        
        clock = '本店将于' + (second<10 ? '0' + second : second) + ':' + (minites<10 ? '0' + minites : minites) +'后休息，请尽快下单'
      }
      if (second==-1 && minites==-1) {
        that.fetchStoreInfoData()
      }

      that.setState({ clockText: clock})
    }, 1000);
  }

  componentDidMount() {
    this.fetchCategoryData()
  }

  componentWillUnmount() {
    this.shopCartEmit && this.shopCartEmit.remove()
    this.cartCountEmit && this.cartCountEmit.remove()
    this.shopcartDeleteEmit && this.shopcartDeleteEmit.remove()
    this.didFocusEmit && this.didFocusEmit.remove()
    this.loginEmit && this.loginEmit.remove()
    this.countdown && clearInterval(this.countdown)
  }

  render() {
    return( 
      <View style={{flex: 1, backgroundColor: '#fff'}}> 
        {this.renderBackground()}
        {this.renderNavigation()}
        {this.renderStore()}
        {this.renderTab()}
        {this.renderContent()}
        {this.renderBottom()}
        <YFWOTOPopupMenu ref={e => this.menu = e} navigation={this.props.navigation}  />
      </View> 
    )
  }

  renderBackground() {
    return (
      <View style={{height: (isIphoneX() ? 142 : 118), position: 'absolute', left: 0, right: 0}}>
        <LinearGradient colors={['#2e73ed', '#5ca9ff']} start={{x: 1, y: 0}} end={{x: 1, y: 1}} style={{flex: 1}} />
      </View>
    )
  }

  renderNavigation() {
    const { shopcartCount } = this.state
    const count = shopcartCount>99 ? '99+' : ''+shopcartCount
    return (
      <View style={{height: isIphoneX() ? 88 : 64, flexDirection: 'row', alignItems: 'flex-end'}}>
        <TouchableOpacity onPress={this.handleBack.bind(this)} activeOpacity={1} style={{width: 40, height: 44, justifyContent: 'center', alignItems: 'center'}}>
          <Image source={require('../Image/icon_back_white.png')} style={{width: 7, height: 14}} />
        </TouchableOpacity>
        <View style={{flex: 1, height: 44, paddingVertical: 5}}>
          <TouchableOpacity onPress={this.handleSearch.bind(this)} activeOpacity={1} style={{flexDirection: 'row', alignItems: 'center', height: 34, backgroundColor: '#fff', borderRadius: 17}}>
            <Image source={require('../Image/icon_search_gray.png')} style={{width: 14, height: 15, marginLeft: 10}} />
            <Text style={{fontSize: 14, color: '#cccccc', marginLeft: 5}}>输入商品名称</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={this.handleShopCart.bind(this)} activeOpacity={1} style={{width: 40, height: 44, justifyContent: 'center', alignItems: 'center', marginLeft: 8}}>
          <Image source={require('../Image/icon_cart_white.png')} style={{width: 23, height: 23}} />
          {shopcartCount>0 && <Text style={{position: 'absolute', backgroundColor: '#ff3300', textAlign: 'center', top: 8, right: 0, minWidth: 12, paddingHorizontal: 2, lineHeight: 12, height: 12, borderRadius: 6, overflow: 'hidden', fontSize: 8, color: '#fff'}}>{count}</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={this.handleMore.bind(this)} activeOpacity={1} style={{width: 40, height: 44, justifyContent: 'center', alignItems: 'center', marginRight: 8}}>
          <Image source={require('../Image/icon_more_white.png')} style={{width: 20, height: 4}} />
        </TouchableOpacity>
      </View>
    )
  }

  renderStore() {
    const { storeInfo } = this.state.viewModel
    return (
      <View style={{marginHorizontal: 13, marginTop: 15, borderRadius: 7, backgroundColor: '#5799f7', shadowColor: 'rgba(100, 165, 250, 0.2)', shadowOffset:{width: 0, height: 2}, shadowOpacity: 1, shadowRadius: 13}}>
        <View style={{height: 100, backgroundColor: '#fff', borderRadius: 7, flexDirection: 'row', alignItems: 'center'}}>
          <Image source={{uri: storeInfo.logo_image}} resizeMode='stretch' resizeMethod='scale' style={{width: 76, height: 60, borderRadius: 3, marginLeft: 10}} />
          <View style={{marginLeft: 20, marginRight: 10, flex: 1}}>
            <Text style={{fontSize: 18, fontWeight: '500', color: '#333', marginRight: 20, marginBottom: 5}} numberOfLines={1}>{storeInfo.title}</Text>
            {storeInfo.sale_count!=0 && <Text style={{color: '#666', fontSize: 11}}>{'月销   '+storeInfo.sale_count}</Text>}
            <Text style={{color: '#666', fontSize: 11}} numberOfLines={2}>{'店铺地址：'+storeInfo.address}</Text>
          </View>
        </View>
        {this.state.clockText.length>0 && <View style={{height: 30, alignItems: 'center', flexDirection: 'row'}}>
          <Image source={require('../Image/icon_clock.png')} style={{width: 14, height: 13, marginLeft: 10, marginRight: 8}} />
          <Text style={{color: '#fff', fontSize: 12}}>{this.state.clockText}</Text>
        </View>}
      </View>
    )
  }

  renderTab() {
    return (
      <View style={{flexDirection: 'row', alignItems: 'center', height: 45}}>
        {this.renderTabItem('全部商品', 0)}
        {this.renderTabItem('商家', 1)}
      </View>
    )
  }

  renderTabItem(title, index) {
    const { viewModel } = this.state
    const active = viewModel.tab == index
    const titleStyle = active ? {color: '#5799f7', fontWeight: 'bold'} : {color: '#333'}
    const line = active ? {backgroundColor: '#5799f7', shadowColor: 'rgba(100, 165, 250, 0.3)', shadowOffset:{width: 0, height: 1}, shadowOpacity: 1, shadowRadius: 4} : {backgroundColor: '#fff'}
    return (
      <TouchableOpacity onPress={this.handleTab.bind(this, index)} activeOpacity={1} style={{height: 45, width: 88, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={[titleStyle, {fontSize: 14}]}>{title}</Text>
        <View style={[line, {height: 3, width: 27, marginTop: 3}]}></View>
      </TouchableOpacity>
    )
  }

  renderContent() {
    const { viewModel, loading } = this.state
    return (
      <View style={{flex: 1}} onLayout={this.contentLayout.bind(this)}>
        {this.renderCategoryAndMedicine()}
        {loading && this.renderMedicineLoading()}
        {viewModel.tab == 1 && this.renderStoreInfo()}
      </View>
    )
  }

  renderMedicineLoading() {
    return (
      <View style={{justifyContent: 'center', alignItems: 'center', position: 'absolute', backgroundColor: '#fff', left: 75, right: 0, top: 0, bottom: 0}}>
        <Image source={require('../../../img/loading.gif')} style={{width: 40, height: 40}} />
      </View>
    )
  }

  renderCategoryAndMedicine() {
    let { viewModel } = this.state
    return (
      <View style={{flexDirection: 'row', height: this.contentH}}>
        <LargeList
          ref={e => this.categoryTabel = e}
          style={{width: 75, backgroundColor: '#fff'}}
          data={viewModel.categoryData}
          showsVerticalScrollIndicator={false}
          renderIndexPath={() => <View />}
          heightForIndexPath={() => 0}
          renderSection={this.renderCategoryItem.bind(this)}
          heightForSection={() => viewModel.categoryHeight}
          renderFooter={() => <View style={{height: viewModel.categoryData.length}} />}
        />
        <LargeList
          contentStyle={{height: this.contentH}}
          ref={e => this.medicineTabel = e}
          style={{width: kScreenWidth-75, backgroundColor: '#fff'}}
          data={viewModel.categoryData}
          showsVerticalScrollIndicator={false}
          renderIndexPath={this.renderMedicineItem.bind(this)}
          heightForIndexPath={() => viewModel.medicineHeight}
          renderSection={this.renderCategoryHeader.bind(this)}
          heightForSection={() => viewModel.categoryHeight}
          renderFooter={this.renderMedicineFooter.bind(this)}   
          scrollEnabled={!this.state.viewModel.loading}       
          onScroll={this.handleMedicineScroll.bind(this)}
        />
      </View>
    )
  }

  renderMedicineFooter() {
    return (
      <View style={{height: this.contentH-100, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 30}}>
        <Text style={{fontSize: 12, color: '#ccc'}}>—————  <Text style={{color: '#aaa'}}>已经到底了</Text>  —————</Text>
      </View>
    )
  }

  renderCategoryItem(section) {
    const { viewModel } = this.state
    const model = viewModel.categoryData[section]
    const active = viewModel.category == section
    const styles = active ? {color: '#333', fontWeight: '500'} : {color: '#666'}
    const back = active ? {backgroundColor: '#fff'} : {backgroundColor: '#f5f5f5'}
    const topR = (viewModel.category+1) == section ? 4 : 0
    const bottomR = (viewModel.category-1) == section ? 4 : 0
    return (
      <View style={[back, { width: 75, height: viewModel.categoryHeight, borderTopRightRadius: topR, borderBottomRightRadius: bottomR}]}>
        <TouchableOpacity onPress={this.handleCategoryItem.bind(this, section)} activeOpacity={1} style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={[styles, {fontSize: 12}]}>{safe(model.name)}</Text>
        </TouchableOpacity>
        {model.badge>0 && <Text style={{position: 'absolute', backgroundColor: '#ff3300', textAlign: 'center', top: 2, right: 2, minWidth: 14, paddingHorizontal: 2, lineHeight: 14, height: 14, borderRadius: 7, overflow: 'hidden', fontSize: 10, color: '#fff'}}>{model.badge}</Text>}
      </View>
    )
  }

  renderCategoryHeader(section) {
    const { categoryData } = this.state.viewModel
    const model = categoryData[section]
    return (
      <View style={{flex: 1, justifyContent: 'center', paddingHorizontal: 12, backgroundColor: '#fff'}}>
        <Text style={{fontSize: 14, color: '#333',  fontWeight: '500'}}>{model.name}</Text>
      </View>
    )
  }

  renderMedicineItem(indexPath) {
    const { viewModel } = this.state
    const { section, row } = indexPath
    const sItem = viewModel.categoryData[section]
    const item = sItem.items[row]
    const backColor = (section==0 && item.store_medicine_id===viewModel.storeMedicineID) ? '#e8fbf5' : '#fff'
    return (
      <TouchableOpacity onPress={this.handleMedicineItem.bind(this, item)} activeOpacity={ 1}  style={{height: viewModel.medicineHeight, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: backColor}}>
        {item.store_medicine_id==0 ? 
        <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}><Text style={{fontSize: 12, color: '#999'}}>{sItem.loaded ? '该分类暂无商品' : ''}</Text></View> 
        : <YFWOTOStoreMedicineCell imageWH={105} navigation={this.props.navigation} data={item} saleCountType={3} editQuantity={viewModel.storeInfo.is_show_cart} onEditQuantity={this.handleEditMedicineQuantity.bind(this, indexPath)} />}
      </TouchableOpacity>
    )
  }

  renderStoreInfo() {
    const { viewModel } = this.state
    const { storeInfo } = viewModel
    return (
      <View style={{position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: '#f5f5f5'}}>
        <View style={{borderRadius: 7, backgroundColor: '#fff', marginHorizontal: 12, marginTop: 10, paddingHorizontal: 20, paddingVertical: 15}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 14, color: '#333', fontWeight: '500', marginVertical: 3}}>{storeInfo.title}</Text>
              <Text style={{fontSize: 12, color: '#666', marginTop: 2}} numberOfLines={2}>{storeInfo.address}</Text>
            </View>
            <TouchableOpacity onPress={this.handlePhone.bind(this)} activeOpacity={1} style={{width: 60, height: 30, paddingLeft: 25, borderLeftWidth: 1, borderLeftColor: '#bfbfbf', justifyContent: 'center', alignItems: 'center'}}>
              <Image source={require('../Image/phone_blue.png')} style={{width: 25, height: 25}} />
            </TouchableOpacity>
          </View>
          <Text style={{fontSize: 12, color: '#333', marginTop: 17}}>营业时间    <Text style={{color: '#5799f7', fontWeight: '500'}}>{storeInfo.business_hours}</Text></Text>
          <View style={{marginBottom: 15}}>
            {this.renderStoreImages('店铺实景', storeInfo.image_list)}
            {this.renderStoreImages('经营资质', storeInfo.licence_list)}
          </View>
        </View>
      </View>
    )
  }

  renderStoreImages(title, images) {
    if (safeArray(images).length == 0) {
      return null
    }
    let data = images.length>3 ? images.slice(0, 3) : images
    return (
      <View style={{flexDirection: 'row', marginTop: 15}}>
        <Text style={{fontSize: 12, color: '#333'}}>{title}</Text>
        {data.map((item, index) => {
          return (
            <TouchableOpacity onPress={this.handleLookBigPicture.bind(this, index, images)} key={index+''} activeOpacity={1} style={{marginLeft: 17}}>
              <FastImage source={{uri: safe(safeObj(item).image_url)}} style={{width: 64, height: 64, borderRadius: 3, backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#f5f5f5'}} resizeMode={FastImage.resizeMode.contain} />
              {(index==2 && images.length>3) && <View style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 3, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{fontSize: 14, color: '#fff'}}>共{images.length}页</Text>
              </View>}
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }

  renderBottom() {
    return (
      <View style={{height: isIphoneX() ? 77 : 60}}>
        <YFWOTOStoreCart 
          ref={e => this.storeCartRef = e}
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