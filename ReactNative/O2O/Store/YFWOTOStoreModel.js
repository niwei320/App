import { isNotEmpty, safe, safeArray, safeObj } from "../../PublicModule/Util/YFWPublicFunction"

export default class YFWOTOStoreModel {

  constructor(props) {
    this.initData(props)
  }

  address = ""
  avg_send_time = 0
  business_hours = ""
  business_scope = ""
  contract = 0
  dict_business_status = 0 // 药店交易状态
  dict_business_status_store = 0 // 药店交易状态：
  dict_shop_type = 0
  dict_store_status = 0
  dict_store_sub_type = 0
  dict_store_type = 0
  id_path = ""
  /**
   * dict_store_sub_image_type_name: "药品生产许可证"
    image_name: "商家外景图"
    image_url: "https://c1.yaofangwang.net/common/upload/shopimage/93/93873/538b1e85-2b96-44de-8639-7542d1b785fb8217.jpg"
   */
  image_list = []
  /**
   * image_url: "https://c1.yaofangwang.net/common/upload/shop/93/93873/39d9c7e4-0b73-42ca-8bc4-ad9abf46f8dd2402.jpg_800x800.jpg"
    licence_type: 2
    licence_type_name: "GSP认证"
   */
  licence_list = []
  logo_image = ""
  latitude = ""
  longitude = ""
  name_path = ""
  open_time = ""
  phone = ""
  region_name = ""
  return_rate = 0
  shop_id = 0
  title = ""
  sale_count = 0
  sale_count_real = 0
  distance = ""
  start_time = ""
  end_time = ""

  is_show_cart = false // 是否显示底部购物车
  not_show_cart_prompt = "" // 不显示底部购物车原因

  initData(data) {
    if (isNotEmpty(data)) {
      this.address = safe(safeObj(data).address)
      this.shop_id = safe(safeObj(data).storeid)
      this.logo_image = safe(safeObj(data).logo_image)
      this.title = safe(safeObj(data).store_title)
      this.sale_count = safe(safeObj(data).sale_count)
      this.distance = safe(safeObj(data).distance)
    }
  }
  
  updateData(data) {
    if (isNotEmpty(data)) {
      this.address = safe(safeObj(data).address)
      this.avg_send_time = safe(safeObj(data).avg_send_time)
      this.business_hours = safe(safeObj(data).business_hours)
      this.business_scope = safe(safeObj(data).business_scope)
      this.contract = safe(safeObj(data).contract)
      this.dict_business_status = safe(safeObj(data).dict_business_status)
      this.dict_business_status_store = safe(safeObj(data).dict_business_status_store)
      this.dict_shop_type = safe(safeObj(data).dict_shop_type)
      this.dict_store_status = safe(safeObj(data).dict_store_status)
      this.dict_store_sub_type = safe(safeObj(data).dict_store_sub_type)
      this.dict_store_type = safe(safeObj(data).dict_store_type)
      this.id_path = safe(safeObj(data).id_path)
      this.image_list = safeArray(safeObj(data).image_list)
      this.licence_list = safeArray(safeObj(data).licence_list)
      this.logo_image = safe(safeObj(data).logo_image)
      this.latitude = safe(safeObj(data).latitude)
      this.longitude = safe(safeObj(data).longitude)
      this.name_path = safe(safeObj(data).name_path)
      this.open_time = safe(safeObj(data).open_time)
      this.phone = safe(safeObj(data).phone)
      this.region_name = safe(safeObj(data).region_name)
      this.return_rate = safe(safeObj(data).return_rate)
      this.shop_id = safe(safeObj(data).shop_id)
      this.title = safe(safeObj(data).title)
      this.start_time = safe(safeObj(data).start_time)
      this.end_time = safe(safeObj(data).end_time)
      this.is_show_cart = Boolean(safeObj(data).is_show_cart)
      this.not_show_cart_prompt = safe(safeObj(data).not_show_cart_prompt)
      this.sale_count = Number(safe(safeObj(data).sale_count))
      this.sale_count_real = safe(safeObj(data).sale_count_real)
    }
  }
}