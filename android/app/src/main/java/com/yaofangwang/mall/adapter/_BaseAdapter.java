package com.yaofangwang.mall.adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.widget.BaseAdapter;

import java.util.ArrayList;
import java.util.List;

public abstract class _BaseAdapter<T extends Object> extends BaseAdapter {
    private static final int DEFAULT_PAGE = 0;
    protected List<T> mlistDatas;
    protected Context mContext;
    protected LayoutInflater mInflater;
    private int mPage = DEFAULT_PAGE;

    protected int mNowSelectedPosiont;

    protected _BaseAdapter(Context context) {
        this(context, null);
    }

    protected _BaseAdapter(Context context, List<T> listDatas) {
        if (null == context) {
            return;
        }
        mContext = context;
        mInflater = LayoutInflater.from(context);
        if (null == listDatas) {
            mlistDatas = new ArrayList<T>();
        } else {
            mlistDatas = listDatas;
        }
    }

    public List<T> getListDatas() {
        return mlistDatas;
    }

    public void addData(T data) {
        mlistDatas.add(data);
        notifyDataSetChanged();
    }

    public void addDataList(List<T> listData) {
        mlistDatas.addAll(listData);
        notifyDataSetChanged();
    }


    public void refreshData(List<T> listData) {
        mlistDatas = listData;
        notifyDataSetChanged();
    }

    public void removeAllData() {
        mlistDatas.clear();
        mPage = DEFAULT_PAGE;
        notifyDataSetChanged();
    }

    public void clearData() {
        mlistDatas.clear();
    }

    @Override
    public int getCount() {
        if (null == mlistDatas) {
            return 0;
        }
        return mlistDatas.size();
    }

    @Override
    public T getItem(int position) {
        return mlistDatas.get(position);
    }

    @Override
    public long getItemId(int position) {
        return position;
    }

    public int getNowSelectedPosiont() {
        return mNowSelectedPosiont;
    }

    public T getNowSelectedItem() {
        if (mNowSelectedPosiont >= 0 && mNowSelectedPosiont < getCount()) {
            return getItem(mNowSelectedPosiont);
        }
        return null;
    }


    public int getNextPage() {
        return mPage + 1;
    }

    public int getNowPage() {
        return mPage;
    }

    public void setNowPage(int page) {
        mPage = page;
    }

    public void remove(int position) {
        if (mlistDatas == null) return;
        mlistDatas.remove(position);
        notifyDataSetChanged();
    }

    public void add(T d) {
        if (d == null) return;
        if (mlistDatas == null) mlistDatas = new ArrayList<>();
        mlistDatas.add(d);
        notifyDataSetChanged();
    }

    public void setData(List<T> d) {
        mlistDatas = d;
    }

    public void addAt(int position,T d) {
        if (d == null) return;
        if (mlistDatas == null) mlistDatas = new ArrayList<>();
        mlistDatas.add(position,d);
        notifyDataSetChanged();
    }
}
