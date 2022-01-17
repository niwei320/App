import { convertImg, isNotEmpty, safe, safeArray, safeObj } from "../../PublicModule/Util/YFWPublicFunction"
import { toDecimal } from "../../Utils/ConvertUtils"

export default class YFWOTOStoreMedicineModel {
  aliascn = ""
  authorized_code = ""
  c_id_path = ""
  create_time = ""
  dict_medicine_type = 0
  PrescriptionType = ''
  dict_store_medicine_status = 0
  store_medicine_id = 0
  intro_image = ""
  medicineid = 0
  namecn = ""
  price = "0.00"
  sale_count = 0
  short_title = ""
  standard = ""
  store_lock_price = 0
  storeid = 0
  title = ""
  troche_type = ""
  cover_image = ""
  images = []
  alias_name = ""
  reserve = 0
  id = 0
  shop_id = 0

  quantity = 0

  depreciate_desc = ""
  end_date = ''
  freepostagecount = 0
  is_freepostage = 0
  limit_buy_qty = 6
  medicine_name = ""
  medicine_total = 0
  mill_title = ""
  period_to = ""
  price_desc = ""
  price_real = ''
  purchase_minsum = 1
  purchase_times = 1
  regionids = ""
  reserve_desc = ""
  return_price = 0
  start_date = ''
  vacation_set = ""
  vacationid = 0
  not_sales_desc = ""

  static setModelArray(data) {
    let array = []
    if (safeArray(data).length > 0) {
      array = data.map(item => {
        let model = new YFWOTOStoreMedicineModel()
        model.baseData(item)
        model.setModel(item)
        return model
      })
    }
    return array
  }

  baseData(data) {
    if (isNotEmpty(data)) {
      this.aliascn = safe(safeObj(data).aliascn)
      this.authorized_code = safe(safeObj(data).authorized_code)
      this.dict_medicine_type = safe(safeObj(data).dict_medicine_type)
      this.PrescriptionType = this.dict_medicine_type==='3' ? '1' : this.dict_medicine_type
      this.dict_store_medicine_status = safe(safeObj(data).dict_store_medicine_status)
      this.troche_type = safe(safeObj(data).troche_type)
      this.price = toDecimal(safe(safeObj(data).price))
      this.intro_image = safe(safeObj(data).intro_image)
      this.medicineid = safe(safeObj(data).medicineid)
      this.namecn = safe(safeObj(data).namecn)
      this.standard = safe(safeObj(data).standard)
      this.id = safe(safeObj(data).id)
      this.storeid = safe(safeObj(data).storeid)
      this.reserve = safe(safeObj(data).reserve)
      this.alias_name = this.aliascn.length>0 ? this.aliascn+'  '+this.namecn : this.namecn
    }
  }

  setModel(data) {
    if (isNotEmpty(data)) {
      this.c_id_path = safe(safeObj(data).c_id_path)
      this.create_time = safe(safeObj(data).create_time)
      this.store_medicine_id = safe(safeObj(data).store_medicine_id)
      this.sale_count = safe(safeObj(data).sale_count)
      this.short_title = safe(safeObj(data).short_title)
      this.store_lock_price = toDecimal(safe(safeObj(data).store_lock_price))
      // this.storeid = safe(safeObj(data).storeid)
      this.title = safe(safeObj(data).title)
      this.troche_type = safe(safeObj(data).troche_type)
      // this.alias_name = this.aliascn.length>0 ? this.aliascn+'  '+this.namecn : this.namecn

      this.dealImages()
    }
  }

  static setCartModelArray(data, storeid) {
    let array = []
    if (safeArray(data).length > 0) {
      array = data.map(item => {
        let model = new YFWOTOStoreMedicineModel()
        item.storeid = safe(storeid)
        model.baseData(item)
        model.setCartModel(item)
        return model
      })
    }
    return array
  }

  setCartModel(data) {
    if (isNotEmpty(data)) {
      this.quantity = Number(safe(safeObj(data).amount))
      this.depreciate_desc = safe(safeObj(data).depreciate_desc)
      this.end_date = safe(safeObj(data).end_date)
      this.freepostagecount = safe(safeObj(data).freepostagecount)
      this.is_freepostage = safe(safeObj(data).is_freepostage)
      this.limit_buy_qty = safe(safeObj(data).limit_buy_qty)
      this.medicine_name = safe(safeObj(data).medicine_name)
      this.medicine_total = safe(safeObj(data).medicine_total)
      this.mill_title = safe(safeObj(data).mill_title)
      this.period_to = safe(safeObj(data).period_to)
      this.price_desc = safe(safeObj(data).price_desc)
      this.price_real = safe(safeObj(data).price_real)
      this.purchase_minsum = safe(safeObj(data).purchase_minsum)
      this.purchase_times = safe(safeObj(data).purchase_times)
      this.regionids = safe(safeObj(data).regionids)
      this.reserve_desc = safe(safeObj(data).reserve_desc)
      this.return_price = safe(safeObj(data).return_price)
      this.start_date = safe(safeObj(data).start_date)
      this.vacation_set = safe(safeObj(data).vacation_set)
      this.vacationid = safe(safeObj(data).vacationid)
      this.store_medicine_id = safe(safeObj(data).store_medicineid)
      // this.alias_name = safe(safeObj(data).medicine_name)
      this.not_sales_desc = safe(safeObj(data).not_sales_desc)
      this.shop_id = this.storeid

      this.dealImages()
    }
  }

  dealImages() {
    if (this.intro_image.length > 0) {
      let list = this.intro_image.split('|')
      this.images = list.map(item => {
        return convertImg(item)
      })
      this.cover_image = this.images[0]
    }
  }
}