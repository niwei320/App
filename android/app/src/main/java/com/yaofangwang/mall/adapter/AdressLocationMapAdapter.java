package com.yaofangwang.mall.adapter;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import com.baidu.mapapi.search.core.PoiInfo;
import com.yaofangwang.mall.R;

public class AdressLocationMapAdapter extends _BaseAdapter<PoiInfo> {

	public AdressLocationMapAdapter(Context context) {
		super(context);
	}

	@Override
	public View getView(final int position, View convertView, ViewGroup parent) {
		final ViewHolder holder;
		if (null == convertView) {
			convertView = mInflater.inflate(R.layout.view_address_nearly, parent, false);
			holder = new ViewHolder();
			holder.mTVAdressAdress = (TextView) convertView.findViewById(R.id.item_address_address);
			holder.mTVAdressName = (TextView) convertView.findViewById(R.id.item_address_name);
			convertView.setTag(holder);
		} else {
			holder = (ViewHolder) convertView.getTag();
		}
		final PoiInfo bean = getItem(position);
		holder.mTVAdressAdress.setText(bean.address);
		holder.mTVAdressName.setText(bean.name);
		return convertView;
	}

	private class ViewHolder {
		TextView mTVAdressName;
		TextView mTVAdressAdress;
	}

}
