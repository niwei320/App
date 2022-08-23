package com.yaofangwang.mall.adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.TextView;

import com.yaofangwang.mall.R;

import java.util.ArrayList;
import java.util.List;

public class AutoAdapter extends BaseAdapter {
    public List<String> mListDatas;
    Context mContext;

    public AutoAdapter(Context context) {
        this.mListDatas = new ArrayList<String>();
        this.mContext = context;
    }

    public void setDatas(List<String> listDatas) {
        this.mListDatas = listDatas;
        notifyDataSetChanged();
    }

    @Override
    public int getCount() {
        return mListDatas.size();
    }

    @Override
    public Object getItem(int position) {
        return mListDatas.get(position);
    }

    @Override
    public long getItemId(int position) {
        return position;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        if (null == convertView) {
            convertView = LayoutInflater.from(mContext).inflate(
                    R.layout.single_spinner_textview_background, parent, false);
        }
        TextView tv = (TextView) convertView;
        tv.setText(mListDatas.get(position));
        return convertView;
    }
}