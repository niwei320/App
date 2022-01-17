import React, { Component } from 'react'
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, NativeModules, DeviceEventEmitter, Animated,NativeEventEmitter } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import {
  adaptSize,
  isAndroid,
  isEmpty,
  isIphoneX,
  kScreenWidth,
  safe,
  safeObj
} from '../../PublicModule/Util/YFWPublicFunction';
import { refreshOTORedPoint } from '../../Utils/YFWInitializeRequestFunction';
import { doAfterLoginWithCallBack } from '../../Utils/YFWJumpRouting';
import NavigationActions from '../../../node_modules_local/react-navigation/src/NavigationActions';
import YFWOTOPopupMenu from '../widgets/YFWOTOPopupMenu';
import YFWOTOHomeIconCell from './YFWOTOHomeIconCell';
import YFWOTOHomeNavigationCell from './YFWOTOHomeNavigationCell';
import YFWOTOHomeNearbyCell from './YFWOTOHomeNearbyCell';
import YFWOTOHomeSearchCell from './YFWOTOHomeSearchCell';
import YFWOTOHomeServiceCell from './YFWOTOHomeServiceCell';
import YFWOTOHomeStoreCell from './YFWOTOHomeStoreCell';
import YFWOTOHomeViewModel from './YFWOTOHomeViewModel'
import YFWNativeManager from '../../Utils/YFWNativeManager';
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager';
const {YFWEventManager} = NativeModules;
const iOSManagerEmitter = new NativeEventEmitter(YFWEventManager);
export default class YFWOTOHomeController extends Component {
  static navigationOptions = ({navigation}) => ({
    header: null,
    // tabBarVisible: false,
  });

  constructor(props) {
    super(props)

    this.height = isIphoneX() ? 88 : 65
    this.state = {
      viewModel: new YFWOTOHomeViewModel(),
      loading: false,
      backHeight: new Animated.Value(this.height)
    }

    this.listener()
  }

  handleBack() {
    this.props.navigation.goBack()
  }

  handleShopCart() {

  }

  handleMore() {
    this.menu.show()
  }

  handleMoreNearbyData() {
    this.fetchHomeNearbyData()
  }

  handleScroll(event) {
    const { contentOffset } = event.nativeEvent
    if (contentOffset.y<0) {

      Animated.spring(this.state.backHeight, {
        toValue: this.height + Math.abs(contentOffset.y),
        duration: 1
      }).start()
    }
  }

  /** 请求首页初始化数据 */
  fetchHomeData() {
    this.state.viewModel.getHomeData(res => {
      console.log(res);
      this.setState({})
    })
  }

  fetchHomeNearbyData() {
    this.state.viewModel.getHomeNearbyData(res => {
      console.log(res);
      this.setState({})
    })
  }

  locationRefreshListener(){
    YFWNativeManager.getLongitudeAndLatitude((data)=> {
      console.log(data,'oto home getLongitudeAndLatitude')
      YFWUserInfoManager.ShareInstance().setApplocation(data);
      let { viewModel } = this.state
      let model = viewModel.dataSouce[0]
      if (isEmpty(model.data.address)) {
        viewModel.dataSouce[0] = model
        model.data.address = isAndroid()?safe(safeObj(data).address):safe(safeObj(data).name)
        model.data.city = safe(safeObj(data).city)
        this.setState({ viewModel: viewModel })
        this.fetchHomeData()
      }
    });
  }

  listener() {
    this.locationEmit = DeviceEventEmitter.addListener('O2OAddressSelected', value => {
      console.log('修改定位', value);
      let { viewModel } = this.state
      let model = viewModel.dataSouce[0]
      viewModel.dataSouce[0] = model
      model.data.address = safe(safeObj(value).address)
      model.data.city = safe(safeObj(value).city)
      this.setState({ viewModel: viewModel })
      this.fetchHomeData()
    })
    this.AddressListener = isAndroid()?
        DeviceEventEmitter.addListener('androidLocationOpen', ()=> this.locationRefreshListener())
        :
        iOSManagerEmitter.addListener('addressNotification', ()=> this.locationRefreshListener());
  }

  componentDidMount() {

    this.fetchHomeData()

    refreshOTORedPoint()
    DeviceEventEmitter.addListener('LoginToUserCenter',(param)=>{
      if (param == 1) {
          const {navigate} = this.props.navigation
          doAfterLoginWithCallBack(navigate,()=>{
              const resetActionTab = NavigationActions.navigate({ routeName: 'UserCenterNav' });
              this.props.navigation.dispatch(resetActionTab);
          })
      }
    })
  }

  componentWillUnmount() {
    this.locationEmit && this.locationEmit.remove()
    this.AddressListener && this.AddressListener.remove()
  }

  render() {
    return (
      <View style={{flex: 1, paddingTop: isIphoneX() ? 44 : 20}}>
        {this.renderHeaderBack()}
        <FlatList
          data={this.state.viewModel.dataSouce}
          extraData={this.state.viewModel}
          renderItem={this.renderItem.bind(this)}
          ListFooterComponent={this.renderFooter.bind(this)}
          stickyHeaderIndices={[1]}
          onEndReached={this.handleMoreNearbyData.bind(this)}
          onEndReachedThreshold={0.1}
          refreshing={this.state.loading}
          onRefresh={this.fetchHomeData.bind(this)}
          onScroll={this.handleScroll.bind(this)}
        />
        {/* {this.renderShopCart()} */}
        <YFWOTOPopupMenu home={true} ref={e => this.menu = e} navigation={this.props.navigation} />
      </View>
    )
  }

  renderFooter() {
    const { viewModel } = this.state
    const show = !viewModel.isMore && viewModel.dataSouce.length>5
    return (
      <View style={{paddingBottom: 20, paddingTop: 5, justifyContent: 'center', alignItems: 'center'}}>
        {show && <Text style={{fontSize: 12, color: '#ccc'}}>—————  <Text style={{color: '#aaa'}}>已经到底了</Text>  —————</Text>}
      </View>
    )
  }

  renderShopCart() {
    return (
      <View style={{position: 'absolute', right: 10, bottom: isIphoneX() ? 90 : 60}}>
        <TouchableOpacity activeOpacity={1} onPress={this.handleShopCart.bind(this)} >
          <Image source={require('../Image/icon_home_cart.png')} style={{width: 44, height: 44}} />
        </TouchableOpacity>
      </View>
    )
  }

  /**
   * 渲染顶部背景
   */
  renderHeaderBack() {
    return (
      <Animated.View style={{position:'absolute', top: 0, left: 0, right: 0, height: this.state.backHeight}}>
        <LinearGradient colors={['#2e73ed', '#5ca9ff']} start={{x: 1, y: 0}} end={{x: 0, y: 0}} style={{flex: 1}} />
      </Animated.View>
    )
  }

  /**
   * 渲染列表item
   */
  renderItem(itemData) {
    const { item } = itemData
    if (item.cell == 'oto_navigation') {

      return this.renderNavagationItem(itemData)
    } else if (item.cell == 'oto_search') {

      return this.renderSearchItem(itemData)
    } else if (item.cell == 'oto_icon') {

      return this.renderIconItem(itemData)
    } else if (item.cell == 'oto_service') {

      return this.renderServiceItem(itemData)
    } else if (item.cell == 'oto_nearby') {

      return this.renderNearbyItem(itemData)
    }  else if (item.cell == 'oto_store') {

      return this.renderStoreItem(itemData)
    }else {

      return <View />
    }
  }

  /**
   * 渲染导航栏
   */
  renderNavagationItem(itemData) {
    const { item } = itemData
    return <YFWOTOHomeNavigationCell data={item.data} navigation={this.props.navigation} onMore={this.handleMore.bind(this)} />
  }

  /**
   * 渲染搜索栏
   */
  renderSearchItem(itemData) {
    return <YFWOTOHomeSearchCell navigation={this.props.navigation} />
  }

  /**
   * 渲染金刚区
   */
  renderIconItem(itemData) {
    const { item } = itemData
    return (
      <View >
        <LinearGradient colors={['#2e73ed', '#5ca9ff']} start={{x: 1, y: 0}} end={{x: 0, y: 0}} style={{position: 'absolute', left: 0, right: 0, height: adaptSize(35)}} />
        <View style={styles.item}>
          <YFWOTOHomeIconCell data={item.data} navigation={this.props.navigation} />
        </View>
      </View>
    )
  }

  /**
   * 渲染服务区
   */
  renderServiceItem(itemData) {
    const { item } = itemData
    return (
      <View style={styles.item}>
        <YFWOTOHomeServiceCell data={item.data} navigation={this.props.navigation} />
      </View>
    )
  }

  /**
   * 渲染附近药店标题
   */
  renderNearbyItem(itemData) {
    const { item } = itemData
    return (
      <View style={{marginHorizontal: 13, marginBottom: 13}}>
        <YFWOTOHomeNearbyCell data={item.data} navigation={this.props.navigation} />
      </View>
    )
  }

  /**
   * 渲染药店item
   */
  renderStoreItem(itemData) {
    const { item } = itemData
    return (
      <View style={styles.item}>
        <YFWOTOHomeStoreCell data={item} navigation={this.props.navigation} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  item: {
    borderRadius: 7,
    marginHorizontal: 13,
    marginBottom: 13,
    backgroundColor: '#fff'
  }
})
