import { isNotEmpty, safe, safeArray, safeObj } from '../../PublicModule/Util/YFWPublicFunction'
import { toDecimal } from '../../Utils/ConvertUtils'
import YFWOTOStoreMedicineModel from './YFWOTOStoreMedicineModel'

export default class YFWOTOStoreCartModel {

  is_cold_storage = 0
  is_show_cart = true
  logistcs_price = "5.00"
  medicine_list = []
  not_show_cart_prompt = ""
  package_price = "0.00"
  packmedicine_list = []
  return_price_total = "0.00"
  store_medicine_count = 0
  store_medicine_count_total = 0
  store_medicine_nopack_count = 0
  store_medicine_nopack_price = "0.00"
  store_medicine_nopack_price_real = "0.00"
  store_medicine_price_total = "0.00"
  title = ""
  storeid = 0

  resetData() {

    this.is_cold_storage = 0
    this.logistcs_price = "5.00"
    this.package_price = "0.00"
    this.medicine_list = []
    this.packmedicine_list = []
    this.return_price_total = "0.00"
    this.store_medicine_count = 0
    this.store_medicine_count_total = 0
    this.store_medicine_nopack_count = 0
    this.store_medicine_nopack_price = "0.00"
    this.store_medicine_nopack_price_real = "0.00"
    this.store_medicine_price_total = "0.00"
  }

  setModel(data) {
    if (isNotEmpty(data)) {
      this.title = safe(safeObj(data).title)
      this.storeid = safe(safeObj(data).storeid)
      this.is_cold_storage = safe(safeObj(data).is_cold_storage)
      this.is_show_cart = Boolean(safeObj(data).is_show_cart)
      this.logistcs_price = toDecimal(safe(safeObj(data).logistcs_price))
      this.medicine_list = YFWOTOStoreMedicineModel.setCartModelArray(safeArray(safeObj(data).medicine_list), this.storeid)
      this.not_show_cart_prompt = safe(safeObj(data).not_show_cart_prompt)
      this.package_price = toDecimal(Number(safe(safeObj(data).package_price)))
      this.packmedicine_list = safeArray(safeObj(data).packmedicine_list)
      this.return_price_total = toDecimal(Number(safe(safeObj(data).return_price_total)))
      this.store_medicine_count = Number(safe(safeObj(data).store_medicine_count))
      this.store_medicine_count_total = Number(safe(safeObj(data).store_medicine_count_total))
      this.store_medicine_nopack_count = Number(safe(safeObj(data).store_medicine_nopack_count))
      this.store_medicine_nopack_price = toDecimal(Number(safe(safeObj(data).store_medicine_nopack_price)))
      this.store_medicine_nopack_price_real = toDecimal(Number(safe(safeObj(data).store_medicine_nopack_price_real)))
      this.store_medicine_price_total = toDecimal(Number(safe(safeObj(data).store_medicine_price_total)))
    }
  }
}