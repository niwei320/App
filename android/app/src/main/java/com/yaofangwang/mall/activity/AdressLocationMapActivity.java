package com.yaofangwang.mall.activity;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.support.annotation.ColorInt;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;

import com.baidu.mapapi.map.BaiduMap;
import com.baidu.mapapi.map.BitmapDescriptor;
import com.baidu.mapapi.map.BitmapDescriptorFactory;
import com.baidu.mapapi.map.MapStatusUpdate;
import com.baidu.mapapi.map.MapStatusUpdateFactory;
import com.baidu.mapapi.map.MapView;
import com.baidu.mapapi.map.Marker;
import com.baidu.mapapi.map.MarkerOptions;
import com.baidu.mapapi.model.LatLng;
import com.baidu.mapapi.search.core.PoiInfo;
import com.baidu.mapapi.search.core.SearchResult;
import com.baidu.mapapi.search.geocode.GeoCodeResult;
import com.baidu.mapapi.search.geocode.GeoCoder;
import com.baidu.mapapi.search.geocode.OnGetGeoCoderResultListener;
import com.baidu.mapapi.search.geocode.ReverseGeoCodeOption;
import com.baidu.mapapi.search.geocode.ReverseGeoCodeResult;
import com.yaofangwang.mall.BaiduMapApi.LocationManager;
import com.yaofangwang.mall.R;
import com.yaofangwang.mall._BaseActivity;
import com.yaofangwang.mall.adapter.AdressLocationMapAdapter;
import com.yaofangwang.mall.bean.LocationInfoBean;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;

import static com.sobot.chat.widget.kpswitch.util.StatusBarHeightUtil.getStatusBarHeight;
import static com.yaofangwang.mall.AndroidNativeApi.emitRNDeviceEvent;

/**
 * 选择 or 添加收货地址
 */
public class AdressLocationMapActivity extends _BaseActivity implements OnClickListener,  OnGetGeoCoderResultListener {
    ListView mListView;
    List<PoiInfo> mListData;

    GeoCoder mSearch = null; // 搜索模块

    private MapView mMapView = null;
    private BaiduMap mBaiduMap;
    TextView mEditText;
    public static AdressLocationMapActivity mapActivity = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_adress_location_map);
        //TObserver.init(this);
        initView();
        setStatusBarView(this,0xFFFFFF,1);
        initListener();

        /*移动到历史记录位置先，不然一出现就是北京天安门*/
        moveLocation(LocationManager.getLocationInfo());
        /*先请求一次历史位置的附近信息*/
        searchGeo(LocationManager.getLocationInfo());
        /*请求最新位置*/
        startLocation();
        mapActivity = this;

       /* if(!LocationManager.isSuccess()){
            TUtils.showShortCustomToast(this, "获取坐标失败，使用默认配置!", R.drawable.toast_n);
        }*/
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
        mEditText = (TextView) findViewById(R.id.head_shop_detail_issigned_search_edit);
        mMapView = (MapView) findViewById(R.id.bmapView);
        mBaiduMap = mMapView.getMap();
        mListView = (ListView) findViewById(R.id.activity_adress_listview);
        mAdressAdapter = new AdressLocationMapAdapter(this);
        mListView.setAdapter(mAdressAdapter);
        mSearch = GeoCoder.newInstance();
        mSearch.setOnGetGeoCodeResultListener(this);
    }

    private void initListener() {
        mEditText.setOnClickListener(this);
        findViewById(R.id.top_left).setOnClickListener(this);
        mListView.setOnItemClickListener(new OnItemClickListener() {

            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                PoiInfo info = mListData.get(position);
                LocationManager.getLocationInfo().setCity(info.city);
                LocationManager.getLocationInfo().setAddress(info.name);
                /*Intent intent = new Intent(AdressLocationMapActivity.this, MainActivity.class).putExtra("tag", "MainActivity");
                intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                startActivity(intent);*/
                JSONObject jsonObject = new JSONObject();
                try {
                    jsonObject.put("lat",info.getLocation().latitude+"");
                    jsonObject.put("lon",info.getLocation().longitude+"");
                    jsonObject.put("name",info.name);
                    emitRNDeviceEvent("locationData", jsonObject.toString());
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                finish();
                //overridePendingTransition(R.anim.in_from_left, R.anim.out_to_right);
            }
        });
    }

    /*请求最新位置*/
    private void startLocation(){
        LocationManager.getInstance().start(true, new LocationManager.OnLocationListener() {
            @Override
            public boolean onSuccess(LocationInfoBean bean) {
                moveLocation(bean);
                // 反Geo搜索
                searchGeo(bean);
                /*定位成功通知找药页更新附近信息*/
               // TObserver.perFromAction(Consts.observer.KEY_REQUEST_NEARLY_LIST);
                return false;
            }

            @Override
            public void onFailure() {
               // TUtils.showShortCustomToast(getContent(), "定位失败！请打开GPS并允许网络访问重试", R.drawable.toast_n);
            }
        });
    }

    /**
     * 搜索地址
     * @param bean
     */
    private void searchGeo(LocationInfoBean bean) {
        LatLng ptCenter = new LatLng(bean.getLatitude(), bean.getLongitude());
        mSearch.reverseGeoCode(new ReverseGeoCodeOption().location(ptCenter));
    }

    /**
     * 移动到某个位置
     * @param bean
     */
    private void moveLocation(LocationInfoBean bean){
        MapStatusUpdate u = MapStatusUpdateFactory.newLatLngZoom(new LatLng(bean.getLatitude(), bean.getLongitude()), 14);
        mBaiduMap.animateMapStatus(u);
        addMarker(bean.getLatitude(), bean.getLongitude());
    }

    /**
     * 在地图上面添加一个标志
     */
    public void addMarker(double latitude, double longitude) {
        mBaiduMap.clear();
        // 定义Maker坐标点
        LatLng point = new LatLng(latitude, longitude);
        // 构建MarkerOption，用于在地图上添加Marker
        BitmapDescriptor bitmap = getBlueMarkerIcon();
        // 在地图上添加Marker，并显示
        MarkerOptions option = new MarkerOptions().position(point).icon(bitmap);
        Marker marker = (Marker) mBaiduMap.addOverlay(option);
        marker.setIcon(bitmap);
        mBaiduMap.setOnMarkerClickListener(new BaiduMap.OnMarkerClickListener() {
            @Override
            public boolean onMarkerClick(Marker marker) {
                return false;
            }
        });
    }

    private void setData(List<PoiInfo> listData) {
        mListData = listData;
        mAdressAdapter.refreshData(listData);
    }

    AdressLocationMapAdapter mAdressAdapter;

    @Override
    public void onGetGeoCodeResult(GeoCodeResult arg0) {

    }

    @Override
    public void onGetReverseGeoCodeResult(ReverseGeoCodeResult result) {
        if (result == null || result.error != SearchResult.ERRORNO.NO_ERROR) {
            //TUtils.showShortCustomToast(getContent(), "定位失败！请打开GPS并允许网络访问重试", R.drawable.toast_n);
            return;
        }
        List<PoiInfo> listData = result.getPoiList();
        mListData = listData;
        setData(listData);
    }



    @Override
    protected void onDestroy() {
        if (null != mMapView) {
            mMapView.onDestroy();
           // TUtils.log("mMapView.onDestroy");
        }
        if (mSearch != null) {
            mSearch.destroy();
        }
        super.onDestroy();
    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.top_left:
                finish();
                break;
            case R.id.head_shop_detail_issigned_search_edit:
                startActivity(new Intent(this, AdressLocationMapFirstActivity.class));
                break;

            default:
                break;
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        if (null != mMapView) {
            mMapView.onResume();
            mBaiduMap = mMapView.getMap();

        }
    }

    @Override
    public void onPause() {
        super.onPause();
        if (null != mMapView) {
            mMapView.onPause();
        }
    }



    @SuppressLint("InflateParams")
    public BitmapDescriptor getBlueMarkerIcon() {
        View v = LayoutInflater.from(this).inflate(R.layout.map_marker_shop, null);
        // 构建Marker图标
        BitmapDescriptor bitmap = BitmapDescriptorFactory.fromView(v);
        return bitmap;
    }
}

