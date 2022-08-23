package com.yaofangwang.mall.bean;

import java.io.Serializable;
import java.util.HashMap;

public class ThirdLoginBean implements Serializable {
	public String type; // 登录类型（必须，如：weibo，weixin，alipay）
	public String account_name; // 用户名（必须）
	public String img_url; // 用户头像地址（可选）
	public String sex; // 性别（可选）
	public String mobile; // 电话（可选）
	public String address;// 地址（可选）
	public String nick_name;// 昵称（可选）

	public void setIntoHashMap(HashMap<String, String> datas) {

		if (null != mobile) {
			datas.put("mobile", mobile);
		}
		// if (null != address) {//address不传
		// datas.put("address", address);
		// }
		datas.put("sex", getSex());
		datas.put("nick_name", nick_name);
		datas.put("type", type);
		datas.put("account_name", account_name);
		datas.put("img_url", img_url);
	}

	public String getSex() {
		// 性别，m：男、f：女、n：未知

		if ("男".equals(sex)) {
			return "1";
		} else if ("女".equals(sex)) {
			return "0";
		} else if ("m".equals(sex)) {
			return "1";
		} else if ("f".equals(sex)) {
			return "0";
		} else if ("n".equals(sex)) {
			return "";
		} else {
			return null == sex ? "" : sex;
		}
	}

}
