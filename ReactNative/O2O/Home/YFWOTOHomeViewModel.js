import { convertImg, deepCopyObj, isNotEmpty, safe, safeArray, safeObj } from '../../PublicModule/Util/YFWPublicFunction'
import { toDecimal } from '../../Utils/ConvertUtils'
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager'
import { YFWOTORequest } from '../../YFWApi'
export default class YFWOTOHomeViewModel {

  request = new YFWOTORequest()
  
  userInfo = new YFWUserInfoManager()

  navigationData = {
    key: 'oto_navigation',
    cell: 'oto_navigation',
    title: '导航栏',
    data: {
      address: this.userInfo.O2Oaddress + '',
      city: this.userInfo.O2Ocity + ''
    }
  }

  searchData = {
    key: 'oto_search',
    cell: 'oto_search',
    title: '搜索栏'
  }

  iconsJson = [
    {name: '感冒发烧', icon: require('../Image/oto_home_1.png'), type: '324'},
    {name: '咳嗽用药', icon: require('../Image/oto_home_2.png'), type: '11'},
    {name: '性福生活', icon: require('../Image/oto_home_3.png'), type: '55'},
    {name: '儿童用药', icon: require('../Image/oto_home_4.png'), type: '20'},
    {name: '家庭常备', icon: require('../Image/oto_home_5.png'), type: '323'},
    {name: '妇科用药', icon: require('../Image/oto_home_6.png'), type: '19'},
    {name: '皮肤用药', icon: require('../Image/oto_home_7.png'), type: '17'},
    {name: '营养保健', icon: require('../Image/oto_home_8.png'), type: '3'},
    {name: '心脑血管', icon: require('../Image/oto_home_9.png'), type: '12'},
    {name: '胃肠用药', icon: require('../Image/oto_home_10.png'), type: '10'},
    {name: '风湿骨科', icon: require('../Image/oto_home_11.png'), type: '15'},
    {name: '医疗器械', icon: require('../Image/oto_home_12.png'), type: '2'},
    {name: '个人护理', icon: require('../Image/oto_home_13.png'), type: '53'},
    {name: '中药饮品', icon: require('../Image/oto_home_14.png'), type: '6'},
    {name: '美容护肤', icon: require('../Image/oto_home_15.png'), type: '4'}
  ]

  iconData = {
    key: 'oto_icon',
    cell: 'oto_icon',
    title: '金刚区',
    data: []
  }

  serviceData = {
    key: 'oto_service',
    cell: 'oto_service',
    title: '服务保障',
    data: [
      {title: '同城配送', icon: require('../Image/icon_home_city.png'), size: {width: 11, height: 9}},
      {title: '极速送达', icon: require('../Image/icon_home_quick.png'), size: {width: 12, height: 12}},
      {title: '隐私包装', icon: require('../Image/icon_home_private.png'), size: {width: 10, height: 12}},
      {title: '执业药师', icon: require('../Image/icon_home_doctor.png'), size: {width: 10, height: 12}},
    ]
  }

  nearbyData = {
    key: 'oto_nearby',
    cell: 'oto_nearby',
    title: '附近药店',
    data: 0
  }

  storeData = {
    key: 'oto_store',
    cell: 'oto_store',
    title: '附近药店'
  }

  pageIndex = 1
  isMore = true
  loading = false
  dataSouce = [
    this.navigationData,
    this.searchData,
    this.iconData,
    this.serviceData,
    this.nearbyData,
    // this.storeData
  ]

  /**
   * 获取首页初始化数据
   * @param {*} success 
   */
  getHomeData(success) {
    this.isMore = true
    this.pageIndex = 2
    this.request.getHomeData(response => {
      const res = safeObj(response).result
      if (isNotEmpty(res)) {
        /**
          backgroundcolor: null
          end: null
          img_height: "116"
          img_url: "http://192.168.2.252/18/3849/930328efb89f4cd8d1016e619ba44a49.nwm.png"
          img_width: "116"
          is_login: "0"
          is_sellout: "0"
          name: "感冒发烧"
          price: "0.00"
          share: "//m.yaofangwang.com/catalog-324.html"
          start: null
          type: "get_h5"
          value: "//m.yaofangwang.com/catalog-324.html"
         */
        // 金刚区数据
        const data = safeObj(safeObj(safeObj(res).data_items)['APP-home-medicine-quick'])
        if (safeArray(data.items).length > 0) {
          
          this.iconData.data = safeArray(data.items)
        }

        // 附近药店
        const nearby = safeObj(safeObj(safeObj(res).data_items)['nearbyo2oshop'])
        this.nearbyData.data = parseInt(safe(nearby.count))

        let store = this.dealNearbyData(nearby.items)
        this.dataSouce = this.dataSouce.slice(0, 5)
        this.dataSouce = this.dataSouce.concat(store)
        this.isMore = store.length < this.nearbyData.data

        success(res)
      }
    }, error => {
      console.log(error);
    })
  }

  /**
   * 获取首页附近店铺数据
   * @param {*} success 
   */
  getHomeNearbyData(success) {
    if (!this.isMore || this.loading) {
      return
    }
    this.loading = true
    this.request.getHomeNearbyData(this.pageIndex, response => {
      const res = safeObj(response).result
      if (isNotEmpty(res)) {
        let data = this.dealNearbyData(res.dataList)
        this.dataSouce = this.dataSouce.concat(data)
        this.isMore = this.pageIndex <= parseInt(safe(res.pageCount))
        this.pageIndex++
        success(res)
      }
      this.loading = false
    }, error => {
      this.loading = false
      console.log(error);
    })
  }

  dealNearbyData(dataList) {
    let data = safeArray(dataList)
    data = data.map((item) => {
      /**
        address: "河南省郑州市二七区郑大医学院西门北侧(大学路40号)"
        distance: "106m"
        logistics_price: 5
        logo_image: ""
        sale_count: 0
        shop_avg_level: 5
        starting_price: 0
        store_title: "郑州市二七区智仁大药店"
        storeid: 118200
        */
      item['key'] = 'oto_store' + safe(safeObj(item).storeid)
      item['cell'] = 'oto_store'
      item['title'] = '附近药店'
      item['shop_avg_level'] = Number(safe(safeObj(item).shop_avg_level)).toFixed(1)
      item['logo_image'] = safe(safeObj(item).logo_image)
      return item
    })
    return data
  }
}