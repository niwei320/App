package com.yaofangwang.mall.MapNearbyPoi;

import android.content.Context;
import android.os.Handler;
import android.os.Message;
import android.support.annotation.NonNull;
import android.support.design.widget.FloatingActionButton;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.baidu.location.BDAbstractLocationListener;
import com.baidu.location.BDLocation;
import com.baidu.location.LocationClient;
import com.baidu.location.LocationClientOption;
import com.baidu.mapapi.map.BaiduMap;
import com.baidu.mapapi.map.MapStatus;
import com.baidu.mapapi.map.MapStatusUpdate;
import com.baidu.mapapi.map.MapStatusUpdateFactory;
import com.baidu.mapapi.map.MapView;
import com.baidu.mapapi.map.MyLocationConfiguration;
import com.baidu.mapapi.map.MyLocationData;
import com.baidu.mapapi.map.UiSettings;
import com.baidu.mapapi.model.LatLng;
import com.baidu.mapapi.search.core.PoiInfo;
import com.baidu.mapapi.search.core.SearchResult;
import com.baidu.mapapi.search.geocode.GeoCodeResult;
import com.baidu.mapapi.search.geocode.GeoCoder;
import com.baidu.mapapi.search.geocode.OnGetGeoCoderResultListener;
import com.baidu.mapapi.search.geocode.ReverseGeoCodeOption;
import com.baidu.mapapi.search.geocode.ReverseGeoCodeResult;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.yaofangwang.mall.BaiduMapApi.LocationManager;
import com.yaofangwang.mall.R;
import com.yaofangwang.mall.bean.LocationInfoBean;

import java.lang.ref.WeakReference;
import java.util.List;

public class MapNearbyPoiView extends FrameLayout {
    private final Context mContext;
    private BaiduMap map;
    private LocationClient mLocClient;
    private MapView mapView;
    private GeoCoder mSearch;
    private FloatingActionButton mButton;
    private ImageView mImageView;
    private TextView textView;
    private LinearLayout location_label;
    private MapHandler mapHandler;

    public MapNearbyPoiView(@NonNull final Context context) {
        super(context);
        mContext = context;
        initView();
        mapSetting();
        initListener();
        moveLocation(LocationManager.getLocationInfo());
        startLocation();
    }

    private void mapSetting() {
        mapView.showZoomControls(false);
        mapView.showScaleControl(false);
        map.setMapType(BaiduMap.MAP_TYPE_NORMAL);
        map.setMyLocationEnabled(true);
        MyLocationConfiguration.LocationMode mCurrentMode = MyLocationConfiguration.LocationMode.NORMAL;
        map.setMyLocationConfiguration(new MyLocationConfiguration(
                mCurrentMode, true, null));
        UiSettings mUiSettings = map.getUiSettings();
        mUiSettings.setOverlookingGesturesEnabled(false);
        mUiSettings.setRotateGesturesEnabled(false);
        mLocClient = new LocationClient(mContext);
        mLocClient.registerLocationListener(new BDAbstractLocationListener(){

            @Override
            public void onReceiveLocation(BDLocation location) {
                // map view 销毁后不在处理新接收的位置
                if (location == null || mapView == null) {
                    return;
                }
                MyLocationData locData = new MyLocationData.Builder()
                        .accuracy(location.getRadius())
                        .latitude(location.getLatitude())
                        .longitude(location.getLongitude()).build();
                map.setMyLocationData(locData);
            }
        });
        LocationClientOption option = new LocationClientOption();
        option.setOpenGps(true); // 打开gps
        option.setCoorType("bd09ll"); // 设置坐标类型
        option.setScanSpan(1000);
        mLocClient.setLocOption(option);
        mLocClient.start();
    }

    private void initListener() {
        mapHandler = new MapHandler(location_label, mImageView);
        mButton.setOnClickListener(v -> startLocation());
        if(mSearch == null){
            mSearch = GeoCoder.newInstance();
        }
        mSearch.setOnGetGeoCodeResultListener(new OnGetGeoCoderResultListener() {
            @Override
            public void onGetGeoCodeResult(GeoCodeResult geoCodeResult) {

            }

            @Override
            public void onGetReverseGeoCodeResult(ReverseGeoCodeResult result) {

                if (result == null || result.error != SearchResult.ERRORNO.NO_ERROR) {
                    eventToRn(Arguments.createMap());
                    return;
                }
                ReverseGeoCodeResult.AddressComponent  addressDetail = result.getAddressDetail();
                String province = addressDetail.province;
                String area = addressDetail.district;
                List<PoiInfo> listData = result.getPoiList();
                WritableMap map = Arguments.createMap();
                WritableArray poiList = new WritableNativeArray();
                if(listData != null && listData.size()>0){
                    String s = listData.get(0).getName();
                    textView.setText(s);
                    location_label.setVisibility(VISIBLE);
                    for(PoiInfo poiInfo:listData){
                        WritableMap poi = Arguments.createMap();
                        poi.putInt("distance",poiInfo.getDistance());
                        poi.putString("name",poiInfo.getName());
                        poi.putString("address",poiInfo.getAddress());
                        poi.putDouble("latitude",poiInfo.getLocation().latitude);
                        poi.putDouble("longitude",poiInfo.getLocation().longitude);
                        poi.putString("province",province);
                        poi.putString("area",area);
                        poiList.pushMap(poi);
                    }
                }
                map.putArray("data", poiList);
                eventToRn(map);
            }
        });


        BaiduMap.OnMapStatusChangeListener listener = new BaiduMap.OnMapStatusChangeListener() {
            /**
             * 手势操作地图，设置地图状态等操作导致地图状态开始改变。
             * @param status 地图状态改变开始时的地图状态
             */
            @Override
            public void onMapStatusChangeStart(MapStatus status) {

            }

            /**
             * 手势操作地图，设置地图状态等操作导致地图状态开始改变。
             * @param status 地图状态改变开始时的地图状态
             * @param reason 地图状态改变的原因
             */

            //用户手势触发导致的地图状态改变,比如双击、拖拽、滑动底图
            //int REASON_GESTURE = 1;
            //SDK导致的地图状态改变, 比如点击缩放控件、指南针图标
            //int REASON_API_ANIMATION = 2;
            //开发者调用,导致的地图状态改变
            //int REASON_DEVELOPER_ANIMATION = 3;
            @Override
            public void onMapStatusChangeStart(MapStatus status, int reason) {

            }

            /**
             * 地图状态变化中
             * @param status 当前地图状态
             */
            @Override
            public void onMapStatusChange(MapStatus status) {
                mapHandler.sendMessage(new Message());
            }

            /**
             * 地图状态改变结束
             * @param status 地图状态改变结束后的地图状态
             */
            @Override
            public void onMapStatusChangeFinish(MapStatus status) {
                mImageView.setImageResource(R.drawable.icon_location_ok);
                mSearch.reverseGeoCode(new ReverseGeoCodeOption().location(status.target));
            }
        };
        //设置地图状态监听
        map.setOnMapStatusChangeListener(listener);
    }

    private void initView(){
        View view = LayoutInflater.from(mContext).inflate(R.layout.map_nearby_poi_view, this);
        mapView = view.findViewById(R.id.bmapView);
        mButton = view.findViewById(R.id.location_bt);
        mButton.setImageDrawable(getResources().getDrawable(android.R.drawable.ic_menu_mylocation));
        mImageView = view.findViewById(R.id.location_anchor);
        textView = view.findViewById(R.id.location_tv_q);
        location_label = view.findViewById(R.id.location_label);
        map = mapView.getMap();
    }

    /*请求最新位置*/
    private void startLocation() {
        LocationManager.getInstance().start(true, new LocationManager.OnLocationListener() {
            @Override
            public boolean onSuccess(LocationInfoBean bean) {
                moveLocation(bean);
                searchGeo(bean);
                return false;
            }
            @Override
            public void onFailure() {
            }
        });
    }

    private void moveLocation(LocationInfoBean bean) {
        MapStatusUpdate u = MapStatusUpdateFactory.newLatLngZoom(new LatLng(bean.getLatitude(), bean.getLongitude()), 18);
        map.animateMapStatus(u);
    }

    private void searchGeo(LocationInfoBean bean) {
        LatLng ptCenter = new LatLng(bean.getLatitude(), bean.getLongitude());
        mSearch.reverseGeoCode(new ReverseGeoCodeOption().location(ptCenter));
    }

    public void eventToRn(WritableMap data) {
        ReactContext reactContext = (ReactContext) getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                getId(),
                "onGetReverseGeoCodeResult",
                data);
    }

    public void onResume() {
        if(mapView != null) {
            mapView.onResume();
        }
    }
    public void onPause() {
        if(mapView != null) {
            mapView.onPause();
        }
    }
    public void onDestroy() {
        if(mLocClient != null) {
            mLocClient.stop();
            mLocClient = null;
        }
        if(mapView != null) {
            mapView.onDestroy();
            mapView = null;
        }
        if(map != null){
            map.setMyLocationEnabled(false);
            map = null;
        }
        if(mSearch != null){
            mSearch.destroy();
            mSearch = null;
        }
    }

    private static class MapHandler extends Handler {
        private final WeakReference<LinearLayout> weakReference;
        private final WeakReference<ImageView> weakReferenceImageView;
        public MapHandler (LinearLayout linearLayout, ImageView mImageView){
            this.weakReference = new WeakReference<>(linearLayout);
            this.weakReferenceImageView = new WeakReference<>(mImageView);
        }
        @Override
        public void handleMessage(@androidx.annotation.NonNull Message msg) {
            super.handleMessage(msg);
            LinearLayout location_label = weakReference.get();
            if(location_label != null){
                location_label.setVisibility(INVISIBLE);
            }
            ImageView mImageView = weakReferenceImageView.get();
            if(mImageView != null){
                mImageView.setImageResource(R.drawable.icon_location_waitting);
            }
        }
    }
}