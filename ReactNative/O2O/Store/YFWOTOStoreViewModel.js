import { adaptSize, deepCopyObj, isNotEmpty, safe, safeArray, safeObj } from "../../PublicModule/Util/YFWPublicFunction"
import { YFWOTORequest } from '../../YFWApi'
import YFWOTOStoreCartModel from "./YFWOTOStoreCartModel"
import YFWOTOStoreMedicineModel from "./YFWOTOStoreMedicineModel"
import YFWOTOStoreModel from "./YFWOTOStoreModel"
import {getItem, setItem, removeItem, kO2OStoreSearchHistoryKey} from '../../Utils/YFWStorage'
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager"
import YFWToast from "../../Utils/YFWToast"
import { toDecimal } from "../../Utils/ConvertUtils"

export default class YFWOTOStoreViewModel {
  constructor(props) {
    this.storeInfo = new YFWOTOStoreModel(props)
    this.storeID = this.storeInfo.shop_id
    this.cartfold = Boolean(safeObj(props).cartfold)
    this.storeMedicineID = safe(safeObj(props).storeMedicineID)
    this.categoryID = safe(safeObj(props).categoryID)

    this.request = new YFWOTORequest()
    getItem(kO2OStoreSearchHistoryKey).then(res => {
      this.searchHistory = safeArray(res)
    })
  }

  cartfold = false // 是否展开购物车
  storeInfo = new YFWOTOStoreModel()
  storeID = ''

  /** 跳转进入指定分类、指定商品 */
  storeMedicineID = ''
  categoryID = ''

  tab = 0
  category = 0
  categoryHeight = 50
  medicineHeight = 115
  loading = false
  /**
    depth: 2
    icon: ""
    id: 10
    id_path: "1|10"
    name: "胃肠用药"
    parentid: 1
    py_name: "wcyy"
   */
  categoryData = []

  storeCartData = new YFWOTOStoreCartModel()

  // 搜索页面
  searchHistory = []
  searchKey = ''
  searchType = 'keywords'
  searchResult = []
  searchLoading = false

  /**
   * 获取药店信息
   * @param {*} success 
   */
  getStoreInfo(success) {
    this.request.getStoreInfoData(this.storeID, response => {
      if (isNotEmpty(safeObj(response).result)) {
        this.storeInfo.updateData(safeObj(response.result))
        this.updateStoreData()
        success(response.result)
      }
    }, error => {

    })
  }

  /**
   * 获取分类信息 
   * @param {*} success 
   */
  getCategoryData(success) {
    this.request.getStoreCategoryData(this.categoryID, this.storeMedicineID, response => {
      if (isNotEmpty(safeObj(response).result)) {
        let data = safeArray(safeObj(response).result)
        this.categoryData = data.map((item, index) => {
          let space = new YFWOTOStoreMedicineModel()
          item['key'] = 'category' + safe(item.id_path)
          item['items'] = [space]
          item['loaded'] = false
          item['loading'] = false
          item['badge'] = 0
          item['offsetY'] = (this.categoryHeight+this.medicineHeight)*(index+1)
          item['lastOffsetY'] = (this.categoryHeight+this.medicineHeight)*index
          return item
        })
        success(response.result)
      }
    }, error => {
      
    })
  }

  /**
   * 获取分类商品信息
   * @param {*} success 
   */
  getCategoryMedicineData(success, failer) {
    if (this.categoryData.length==0) {
      return
    }
    let category = this.categoryData[this.category]
    if (safeObj(category).loaded || safeObj(category).loading) {
      return
    }
    category.loading = true
    this.loading = true
    this.request.getStoreCategoryMedicineData(this.storeID, safeObj(category).id_path, this.storeMedicineID, response => {
      category.loading = false
      this.loading = false
      if (isNotEmpty(safeObj(response).result)) {
        let data = safeArray(safeObj(response).result)
        category.loaded = true
        if (data.length > 0) {
          
          category.items = YFWOTOStoreMedicineModel.setModelArray(data)
          // 同步购物车数量
          let dataSource = this.storeCartData.medicine_list
          let badge = 0
          dataSource.forEach(medicine => {
            category.items.some(item => {
              let equal = item.store_medicine_id === medicine.store_medicine_id
              if (equal) {
                item.quantity = medicine.quantity
                badge += item.quantity
              }
              return equal
            })
          });
          category.badge = badge
          this.dealSectionOffset()
          this.updateStoreData()
        } 
        success(response.result)
      }
    }, error => {
      category.loading = false
      this.loading = false
      failer && failer(error)
    })
  }

  /**
   * 计算分类药品滚动偏移量
   */
  dealSectionOffset() {
    for (let index = this.category; index < this.categoryData.length; index++) {
      let element = this.categoryData[index];
      let curH = this.categoryHeight + element.items.length*this.medicineHeight
      let lasH = index==0 ? 0 : this.categoryData[index-1]['offsetY']
      element['offsetY'] = curH + lasH
      element['lastOffsetY'] = lasH
    }
  }

  /**
   * 获取购物车数据
   * @param {*} success 
   */
  getShopCartData(success) {
    let login = YFWUserInfoManager.ShareInstance().hasLogin()
    if (!login) {
      return
    }
    this.request.getStoreShoppingCart(this.storeID, response => {
      if (isNotEmpty(safeObj(response).result)) {
        
        this.dealClearShopCart()

        let list = safeArray(safeObj(safeObj(response).result).dataList)
        let storeCart = {
          is_show_cart: this.storeInfo.is_show_cart,
          medicine_list: [],
          not_show_cart_prompt: this.storeInfo.not_show_cart_prompt,
          title: this.storeInfo.title,
          storeid: this.storeInfo.shop_id,
          logistcs_price: "5.00",
          package_price: "0.00"
        }
        if (list.length > 0) {
          storeCart = list[0]
          storeCart.is_show_cart = this.storeInfo.is_show_cart
          storeCart.not_show_cart_prompt = this.storeInfo.not_show_cart_prompt
        } 
        this.storeCartData.setModel(storeCart)
        this.dealCategoryMedicineQuantity(this.storeCartData.medicine_list)
        success(response.result)
      }
    }, error => {

    })
  }

  /**
   * 清空购物车
   * @param {*} success 
   */
  clearShopCart(success) {
    this.request.clearStoreShoppingCart(this.storeID, response => {
      if (isNotEmpty(safeObj(response).result)) {
        this.dealClearShopCart()
        this.storeCartData.resetData()
        success(response.result)
      }
    }, error => {

    })
  }

  /**
   * 清空购物车后匹配数据
   */
  dealClearShopCart() {
    let dataSource = deepCopyObj(this.storeCartData.medicine_list)
    dataSource = dataSource.map(item => {
      item.quantity = 0
      return item
    })
    this.dealCategoryMedicineQuantity(dataSource)
    this.dealClearSearchResultQuantity()
  }

  /**
   * 清空购物车后 处理搜索结果数据
   */
  dealClearSearchResultQuantity() {
    this.searchResult.map(medicine => {
      medicine.quantity = 0
      return medicine
    })
  }

  /**
   * 购物车页面清空删除商品回调处理
   */
  dealShopCartDelete(value) {
    let medicine = safeArray(safeObj(value)[this.storeID])
    medicine.forEach(store_medicine_id => {      
      this.categoryData.forEach(category => {
        category.badge = 0
        category.items.some(item => {
          let equal = item.store_medicine_id == safe(store_medicine_id)
          if (equal) {
            item.quantity = 0
          }
          return equal
        })
      })

      this.searchResult.some(item => {
        let equal = item.store_medicine_id == safe(store_medicine_id)
        if (equal) {
          item.quantity = 0
        }
        return equal
      })
    })
  }

  /**
   * 编辑数量，操作购物车
   * @param {*} indexPath 
   * @param {*} quantity 
   * @param {*} success 
   */
  editMedicineQuantity(medicine, quantity, success) {
    if (this.loading) {
      return
    }
    this.loading = true
    this.request.addMedicineToShoppingCart(this.storeID, safeObj(medicine).store_medicine_id, quantity, response => {
      if (isNotEmpty(safeObj(response).result)) {
        let item = deepCopyObj(medicine)
        item.quantity = quantity
        this.dealStoreCartData(item)
        this.dealCategoryMedicineQuantity([item])
        success(response.result)
      }
      this.loading = false
    }, error => {
      this.loading = false
      const msg = safe(safeObj(error).msg)
      if (msg.indexOf('下架') != -1) {
        YFWToast(msg)
      }
    })
  }

  /**
   * 编辑数量后，处理购物车数据
   * @param {*} medicine 
   */
  dealStoreCartData(medicine) {
    let repeatIndex = -1
    let subQuantity = 0
    let subPrice = Number(this.storeCartData.store_medicine_price_total)
    this.storeCartData.medicine_list.some((item, index) => {
      let repeat = item.store_medicine_id == medicine.store_medicine_id
      if (repeat) {
        repeatIndex = index
        subQuantity = Number(medicine.quantity) - Number(item.quantity)
        subPrice += (subQuantity * Number(medicine.price))
      }
      return repeat
    })
    if (repeatIndex == -1) {
      this.storeCartData.medicine_list.unshift(medicine)
      subQuantity = Number(medicine.quantity)
      subPrice += Number(medicine.price)
      this.getShopCartData(() => {})
    } else if (medicine.quantity == '0') {

      this.storeCartData.medicine_list.splice(repeatIndex, 1)
    } else {
      let item = this.storeCartData.medicine_list[repeatIndex]
      item.quantity = medicine.quantity
      this.storeCartData.medicine_list[repeatIndex] = item
    }
    
    this.storeCartData.store_medicine_count_total += subQuantity
    this.storeCartData.store_medicine_price_total = toDecimal(subPrice)
    this.storeCartData.is_show_cart = this.storeCartData.store_medicine_count_total!==0
  }

  /**
   * 加入、减少、清空 购物车之后，修改分类商品的数量
   * @param {*} medicine_list 
   */
  dealCategoryMedicineQuantity(medicine_list) {
    if (safeArray(medicine_list).length == 0) {
      return
    }
    medicine_list.forEach(medicine => {
      this.categoryData.forEach(category => {
        let badge = 0
        category.items.forEach(item => {
          let equal = item.store_medicine_id === medicine.store_medicine_id
          if (equal) {
            item.quantity = medicine.quantity
          }     
          badge += item.quantity 
        })
        category.badge = badge
      })
    });
  }

  /**
   * 更新店铺状态
   */
  updateStoreData() {
    this.storeCartData.is_show_cart = this.storeInfo.is_show_cart
    this.storeCartData.not_show_cart_prompt = this.storeInfo.not_show_cart_prompt
  }

  /**
   * 输入框搜索关键字
   * @param {*} success 
   */
  searchKeywords(success) {
    if (this.searchLoading) {
      return
    }
    this.searchLoading = true
    this.request.getSearchKeywords(this.searchKey, response => {
      if (isNotEmpty(response.result)) {
        let data = safeArray(safeObj(response).result)
        this.searchResult = data
        success(response.result)
      }
      this.searchLoading = false
    }, error => {
      this.searchLoading = false
    })
  }

  /**
   * 搜索药品
   * @param {*} success 
   */
  searchMedicine(success) {
    if (safe(this.searchKey.length==0)) {
      YFWToast('请输入商品名称')
      return
    }
    this.request.searchStoreMedicine(this.storeID, this.searchKey, response => {
      if (isNotEmpty(response.result)) {
        let data = safeArray(safeObj(response).result)
        this.searchResult = YFWOTOStoreMedicineModel.setModelArray(data)
        this.dealSearchMedicine()
        success(response.result)
      }
    }, error => {

    })
  }

  /**
   * // 同步购物车数量
   */
  dealSearchMedicine() {
    let dataSource = this.storeCartData.medicine_list
    dataSource.forEach(medicine => {
      this.searchResult.some(item => {
        let equal = item.store_medicine_id === medicine.store_medicine_id
        if (equal) {
          item.quantity = medicine.quantity
        }
        return equal
      })
    });
  }

  /**
   * 添加历史记录
   * @param {*} key 
   */
  addHistory() {
    const key = this.searchKey
    const idx = this.searchHistory.indexOf(key)
    if (idx != -1) {
      this.searchHistory.splice(idx, 1)
    } 
    this.searchHistory.unshift(key)
    if (this.searchHistory.length>10) {
      this.searchHistory = this.searchHistory.slice(0, 10)
    }
  }

  /**
   * 保存搜索历史
   */
  saveSearchHistory() {
    setItem(kO2OStoreSearchHistoryKey, this.searchHistory)
  }

  /**
   * 清空搜索历史
   */
  removeSearchHistory() {
    removeItem(kO2OStoreSearchHistoryKey)
    this.searchHistory = []
  }

  /**
   * 重置搜索页
   */
  resetSearchData() {
    // this.searchHistory = []
    this.searchKey = ''
    this.searchResult = []
    this.searchIndex = 1
  }
}