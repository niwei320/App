package com.yaofangwang.mall.httpNet;

public class TObjSaveEntity {

	public int mSaveType = TObjSaveType.getSavetype();//保存类型 是String 还是Object
	/**
	 * 是否需要请求网络数据,默认为true
	 */
	public boolean is_need_request_net = true;
	/**
	 * 是否需要保持请求结果,默认为false
	 */
	public boolean is_need_save_result_data = false;
	/**
	 * 是否需要将缓存的数据,与获取的数据进行对比{@link TObjSaveType#REQUEST_TYPE_TWICE }会用到此参数
	 */
	public boolean is_need_judge_result_data;
	/**
	 * 获取到的缓存的数据
	 */
	public Object cacheData;
	/**
	 * 获取得到的网络数据
	 */
	public String resultData;
	/**
	 * 数据缓存的时间,单位为毫秒
	 */
	public long cacheTimeSecond;

	/**
	 * key
	 */
	public String key;

	@Override
	public String toString() {
		return "FDRequestEntity [is_need_request_net=" + is_need_request_net
				+ ", is_need_save_result_data=" + is_need_save_result_data
				+ ", is_need_judge_result_data=" + is_need_judge_result_data
				+ ", cacheData=" + cacheData + ", resultData=" + resultData
				+ ", cacheTimeSecond=" + cacheTimeSecond + ", key=" + key + "]";
	}

}
