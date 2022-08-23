package com.yaofangwang.mall.activity;

import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.support.annotation.ColorInt;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.LinearLayout;
import android.widget.Toast;

import com.baidu.mapapi.model.LatLng;
import com.baidu.mapapi.search.core.PoiInfo;
import com.baidu.mapapi.search.core.SearchResult;
import com.baidu.mapapi.search.poi.OnGetPoiSearchResultListener;
import com.baidu.mapapi.search.poi.PoiDetailResult;
import com.baidu.mapapi.search.poi.PoiDetailSearchResult;
import com.baidu.mapapi.search.poi.PoiIndoorResult;
import com.baidu.mapapi.search.poi.PoiNearbySearchOption;
import com.baidu.mapapi.search.poi.PoiResult;
import com.baidu.mapapi.search.poi.PoiSearch;
import com.baidu.mapapi.search.poi.PoiSortType;
import com.umeng.analytics.MobclickAgent;
import com.yaofangwang.mall.BaiduMapApi.LocationManager;
import com.yaofangwang.mall.R;
import com.yaofangwang.mall._BaseActivity;
import com.yaofangwang.mall.adapter.AdressLocationMapFirstAdapter;
import com.yaofangwang.mall.widgtes.ListViewForScrollView;
import com.yaofangwang.mall.widgtes.ProgressActivity;
import com.yaofangwang.mall.widgtes.WidgetAutoEditText;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;

import static com.sobot.chat.widget.kpswitch.util.StatusBarHeightUtil.getStatusBarHeight;
import static com.yaofangwang.mall.AndroidNativeApi.emitRNDeviceEvent;


public class AdressLocationMapFirstActivity extends _BaseActivity implements WidgetAutoEditText.IAutoListener, OnGetPoiSearchResultListener {
    ProgressActivity progress;
    private PoiSearch mPoiSearch = null;
    List<PoiInfo> mListData;
    AdressLocationMapFirstAdapter mAdapter;
    ListViewForScrollView mListText;
    WidgetAutoEditText mAutoEdit;
    View mSearch;
    View mTopBack;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_adress_location_map_first);
        setStatusBarView(this,0xFFFFFF,1);
        initView();
        mAdapter = new AdressLocationMapFirstAdapter(this);
        mListText.setAdapter(mAdapter);
        initListener();
    }

    private void setStatusBarView(Activity activity, @ColorInt int color, int alpha) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            // 绘制一个和状态栏一样高的矩形
            View statusBarView = findViewById(R.id.status_view);
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, getStatusBarHeight(activity));
            statusBarView.setLayoutParams(params);
            statusBarView.setBackgroundColor(color);
        }
    }

    private void initView() {
        mListText = findViewById(R.id.activity_medicine_search_listview);
        mAutoEdit = findViewById(R.id.activity_medicine_search_edit);
        mSearch =  findViewById(R.id.activity_medicine_search);
        mTopBack =  findViewById(R.id.activity_search_result_topback);
    }

    private void setData(List<PoiInfo> listData) {
        mListData = listData;
        mAdapter.refreshData(listData);
    }

    private void initListener() {
        mAutoEdit.setAutoListener(this);
        mAutoEdit.setSearchVisible(true);
        mSearch.setOnClickListener(new OnClickListener() {

            @Override
            public void onClick(View v) {
                String text = mAutoEdit.getText();
                search(text);
            }
        });
        mTopBack.setOnClickListener(new OnClickListener() {

            @Override
            public void onClick(View v) {
                finish();
            }
        });
        mPoiSearch = PoiSearch.newInstance();
        mPoiSearch.setOnGetPoiSearchResultListener(this);
        mListText.setOnItemClickListener(new OnItemClickListener() {

            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                PoiInfo info = mListData.get(position);
                LocationManager.getLocationInfo().setCity(info.city);
                LocationManager.getLocationInfo().setAddress(info.name);
                double latitude = info.getLocation().latitude;
                double longitude = info.getLocation().longitude;
                LocationManager.getLocationInfo().setLatitude(latitude);
                LocationManager.getLocationInfo().setLongitude(longitude);
                JSONObject locationData = new JSONObject();
                try {
                    locationData.put("city",info.city);
                    locationData.put("name",info.name);
                } catch (JSONException e) {

                }
                emitRNDeviceEvent("locationData", locationData.toString());
                finish();
                AdressLocationMapActivity.mapActivity.finish();
                AdressLocationMapActivity.mapActivity = null;
                finish();
               /* Intent intent = new Intent(AdressLocationMapFirstActivity.this, MainActivity.class).putExtra("tag", "MainActivity");
                intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                startActivity(intent);
                finish();
                overridePendingTransition(0, 0);*/
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        MobclickAgent.onPageStart("位置搜索");
        MobclickAgent.onResume(this);
    }

    @Override
    protected void onPause() {
        super.onPause();
        MobclickAgent.onPageEnd("位置搜索");
        MobclickAgent.onPause(this);
    }

    @Override
    protected void onDestroy() {
        if (mPoiSearch != null) mPoiSearch.destroy();
        super.onDestroy();
    }

    @Override
    public void onTextChanged(final String text) {
        if (null != text && text.length() > 0) {
            startSearch(text);
        }
    }

    public void startSearch(String text) {
        if (mListData != null) {
            mListData.clear();
        }
        mAdapter.removeAllData();
        // 发起poi搜索
        double lat = LocationManager.getLocationInfo().getLatitude();
        double lng = LocationManager.getLocationInfo().getLongitude();
        mPoiSearch.searchNearby(new PoiNearbySearchOption()
                .keyword(text)
                .radius(500)
                .sortType(PoiSortType.distance_from_near_to_far)
                .location(new LatLng(lat,lng)));
    }

    @Override
    public void onStartRequest(String text) {
        search(text);
    }

    public void search(String text) {
        if (text == null || text.trim().equals("")) {
            return;
        }
        startSearch(text);
    }

    @Override
    public void onGetPoiDetailResult(PoiDetailResult result) {

    }

    @Override
    public void onGetPoiDetailResult(PoiDetailSearchResult poiDetailSearchResult) {

    }

    @Override
    public void onGetPoiIndoorResult(PoiIndoorResult poiIndoorResult) {

    }

    @Override
    public void onGetPoiResult(PoiResult result) {
        if(result.error == SearchResult.ERRORNO.RESULT_NOT_FOUND){
            Toast.makeText(AdressLocationMapFirstActivity.this,"暂无搜索结果",Toast.LENGTH_SHORT).show();
            return;
        }

        if (result == null || result.error != SearchResult.ERRORNO.NO_ERROR) {
            return;
        }
        List<PoiInfo> listData = result.getAllPoi();
        if (listData == null || listData.size() == 0) {
            Toast.makeText(AdressLocationMapFirstActivity.this,"暂无搜索结果",Toast.LENGTH_SHORT).show();
            return;
        }
        mListData = listData;
        setData(listData);
    }
}