package com.yaofangwang.mall.Fragment;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;

import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.yaofangwang.mall.BaiduMapApi.LocationManager;
import com.yaofangwang.mall.MainActivity;
import com.yaofangwang.mall.R;
import com.yaofangwang.mall.bean.LocationInfoBean;
import com.yaofangwang.mall.bean.NearShopBeanTcp;
import com.yaofangwang.mall.bean.ShopBeanHttp;
import com.yaofangwang.mall.httpNet.Net;
import com.yaofangwang.mall.net.TcpUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import static com.sobot.chat.widget.kpswitch.util.StatusBarHeightUtil.getStatusBarHeight;

/**
 * Created by admin on 2018/12/17.
 */
@SuppressLint("ValidFragment")
public class NearlyShopFragment extends Fragment implements View.OnClickListener {
    private View mLeft;
    FragmentNearlyMap mFNearlyMap;
    private List<NearShopBeanTcp.ResultBean> shopDatas = new ArrayList<>();
    private View mViewMap;
    private View mViewList;
    private FragmentNearlyList mFNearlyList;
    List<ShopBeanHttp> mListShopBeans;
    private View mContentView;


    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, Bundle savedInstanceState) {
        if (null == mContentView) {
            mContentView = inflater.inflate(R.layout.activity_nearly_shop, container, false);
        } else {
            ViewGroup parent = (ViewGroup) mContentView.getParent();
            if (null != parent) {
                parent.removeView(mContentView);
            }
        }
        initView();
        setStatusBarView(getActivity(), 1);
        initListener();
        locationAndRequestData();
        return mContentView;
    }

    private void setStatusBarView(Activity activity, int alpha) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            // 绘制一个和状态栏一样高的矩形
            View statusBarView = mContentView.findViewById(R.id.status_view);
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, getStatusBarHeight(activity));
            statusBarView.setLayoutParams(params);
        }
    }

    private void requestNearlyShop_Http() {
        HashMap<String, String> datas = new HashMap<>();
        datas.put("service", "get_shop_near");
        datas.put("latitude", LocationManager.getLocationInfo().getLatitude() + "");
        datas.put("longitude", LocationManager.getLocationInfo().getLongitude() + "");
        datas.put("page_index", "1");
        Net.sendRequest(datas, new Response.Listener<List<ShopBeanHttp>>() {

            @Override
            public void onResponse(List<ShopBeanHttp> listShops) {
                if (null == mListShopBeans) {
                    mListShopBeans = listShops;
                } else {
                    mListShopBeans.addAll(listShops);
                }
                if (null != mFNearlyList) {
                    mFNearlyList.onGetDataHttp(listShops);
                }
                if (null != mFNearlyMap) mFNearlyMap.onGetData(mListShopBeans);
                mViewList.setClickable(true);

            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError volleyError) {
                if (null != mFNearlyList && volleyError != null) {
                    mFNearlyList.onError(volleyError.getMessage());
                }
            }
        }, new TypeToken<List<ShopBeanHttp>>() {
        }.getType());
    }

    public void locationAndRequestData(){
        if (null != mFNearlyMap) mFNearlyMap.getMyLocationMarker();
        requestNearlyShops_TCP();
        if (!LocationManager.isSuccess()) {
            startLocation();
        }
    }

    public void requestNearlyShops_TCP() {
        final HashMap<String, Object> datas = new HashMap<>();
        datas.put("__cmd", "guest.common.app.getNearShop");
        datas.put("lat", LocationManager.getLocationInfo().getLatitude() + "");
        datas.put("lng", LocationManager.getLocationInfo().getLongitude() + "");
        new TcpUtils(getActivity()).sendMessage(datas, new TcpUtils.OnResponseListener() {

            @Override
            public void onResponse(String s) {
                NearShopBeanTcp nearShopBeanTcp = new Gson().fromJson(s, NearShopBeanTcp.class);
                List<NearShopBeanTcp.ResultBean> result = nearShopBeanTcp.getResult();
                if(shopDatas != result){
                    shopDatas.clear();
                    shopDatas.addAll(result);
                }
                mViewList.setClickable(true);
                if (null != mFNearlyMap) mFNearlyMap.onGetDataTcp(shopDatas);
                if (null != mFNearlyList) mFNearlyList.onGetDataTcp(shopDatas);
            }

            @Override
            public void onError(String s) {
                String error = s;
            }
        });
    }

    private void startLocation() {
        LocationManager.getInstance().start(true, new LocationManager.OnLocationListener() {
            @Override
            public boolean onSuccess(LocationInfoBean bean) {
                // 拿到定位信息 传递给js获取到附近药店信息
                //pushLocationDataToJs(bean);
                if (null != mFNearlyMap) mFNearlyMap.getMyLocationMarker();
                requestNearlyShops_TCP();
                return false;
            }

            @Override
            public void onFailure() {
//                Toast.makeText(getActivity(), "获取定位失败", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void initListener() {
        mLeft.setOnClickListener(this);
        mViewList.setOnClickListener(this);
        mViewMap.setOnClickListener(this);
    }

    private void initView() {
        mLeft = mContentView.findViewById(R.id.top_left);
        mViewMap = mContentView.findViewById(R.id.fragment_nearly_top_right_map);
        mViewList = mContentView.findViewById(R.id.fragment_nearly_top_right_list);
        mViewList.setClickable(false);
        mFNearlyMap = new FragmentNearlyMap();
        mFNearlyList = new FragmentNearlyList();
        getChildFragmentManager().beginTransaction().add(R.id.fragment_nearly_linear, mFNearlyMap,"fragmentMap").add(R.id.fragment_nearly_linear, mFNearlyList,"fragmentList").hide(mFNearlyList).commit();
        mViewMap.setVisibility(View.GONE);
    }


    @Override
    public void onClick(View v) {
        FragmentManager fm = ((MainActivity) getActivity()).getSupportFragmentManager();
        switch (v.getId()) {
            case R.id.fragment_nearly_top_right_list:
                mViewList.setVisibility(View.GONE);
                mViewMap.setVisibility(View.VISIBLE);
                fm.beginTransaction().hide(mFNearlyMap).show(mFNearlyList).commit();
                break;
            case R.id.fragment_nearly_top_right_map:
                mViewList.setVisibility(View.VISIBLE);
                mViewMap.setVisibility(View.GONE);
                fm.beginTransaction().hide(mFNearlyList).show(mFNearlyMap).commit();
                break;
            case R.id.top_left:
                ((MainActivity) getActivity()).pop();
                break;

            default:
                break;
        }
    }
}
