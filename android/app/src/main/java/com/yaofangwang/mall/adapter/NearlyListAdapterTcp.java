package com.yaofangwang.mall.adapter;

import android.content.Context;
import android.content.SharedPreferences;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.RatingBar;
import android.widget.TextView;

import com.facebook.drawee.view.SimpleDraweeView;
import com.yaofangwang.mall.Consts;
import com.yaofangwang.mall.MainApplication;
import com.yaofangwang.mall.R;
import com.yaofangwang.mall.bean.NearShopBeanTcp;
import com.yaofangwang.mall.utils.FrescoLoad;

import java.util.List;

public class NearlyListAdapterTcp extends _BaseAdapter<NearShopBeanTcp.ResultBean> {
    public NearlyListAdapterTcp(Context context, List<NearShopBeanTcp.ResultBean> listDatas) {
        super(context, listDatas);
    }

    private void setData(ViewHolder holder, NearShopBeanTcp.ResultBean bean) {
        holder.mNameView.setText(bean.getTitle());
        holder.contract_tv.setTextColor(mContext.getResources().getColor(R.color.color_appgreen));
        holder.contract_tv.setText("签约");
        SharedPreferences sharedPreferences = MainApplication.getInstance().getSharedPreferences(Consts.PreferenceKey.preferenceName, mContext.MODE_PRIVATE);
        String cdn = sharedPreferences.getString("CDN_URL", "//c1.yaofangwang.net");
        if(bean.getLogo_image().startsWith("/")){
             FrescoLoad.load(holder.shop_img,"http:"+cdn+bean.getLogo_image());
        }else {
             FrescoLoad.load(holder.shop_img,"http:"+cdn+"/"+bean.getLogo_image());
        }
        holder.mDistance.setText(bean.getDistance() + "km");

        holder.mRatingStarsView.setText(bean.getEvaluation_star_sum()+"");
        holder.item_nearly_list_ratingbar.setRating(Float.parseFloat(String.valueOf(bean.getEvaluation_star_sum())));
        // FrescoLoad.load(holder.shop_img,bean.logo_img_url);
      //  Glide.with(mContext).load(bean.get)
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        ViewHolder holder;
        NearShopBeanTcp.ResultBean bean = getItem(position);
        if (null == convertView) {
            holder = new ViewHolder();
            convertView = mInflater.inflate(R.layout.item_nearly_on_map, parent, false);
            holder.shop_img = (SimpleDraweeView) convertView.findViewById(R.id.shop_img);
            holder.mNameView = (TextView) convertView.findViewById(R.id.item_nearly_list_name);
            holder.contract_tv = (TextView) convertView.findViewById(R.id.contract_tv);
            holder.mRatingStarsView = (TextView) convertView.findViewById(R.id.item_nearly_list_ratingbar_tv);
            holder.mDistance = (TextView) convertView.findViewById(R.id.item_nearly_list_distance);
            holder.item_nearly_list_ratingbar = (RatingBar) convertView.findViewById(R.id.item_nearly_list_ratingbar);
            holder.ratingbar_ll = (LinearLayout) convertView.findViewById(R.id.ratingbar_ll);
            convertView.setTag(holder);
        } else {
            holder = (ViewHolder) convertView.getTag();
        }
        setData(holder, bean);
        return convertView;
    }

    private class ViewHolder {
        public SimpleDraweeView shop_img;
        public TextView mNameView;
        public TextView contract_tv;
        public TextView mRatingStarsView;
        public TextView mDistance;
        public RatingBar item_nearly_list_ratingbar;
        public LinearLayout ratingbar_ll;
    }
}