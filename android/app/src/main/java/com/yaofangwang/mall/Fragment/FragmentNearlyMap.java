package com.yaofangwang.mall.Fragment;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.text.Html;
import android.util.DisplayMetrics;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import com.baidu.mapapi.map.BaiduMap;
import com.baidu.mapapi.map.BaiduMap.OnMarkerClickListener;
import com.baidu.mapapi.map.BitmapDescriptor;
import com.baidu.mapapi.map.BitmapDescriptorFactory;
import com.baidu.mapapi.map.InfoWindow;
import com.baidu.mapapi.map.MapPoi;
import com.baidu.mapapi.map.MapStatusUpdate;
import com.baidu.mapapi.map.MapStatusUpdateFactory;
import com.baidu.mapapi.map.MapView;
import com.baidu.mapapi.map.Marker;
import com.baidu.mapapi.map.MarkerOptions;
import com.baidu.mapapi.map.MyLocationConfiguration;
import com.baidu.mapapi.map.MyLocationData;
import com.baidu.mapapi.model.LatLng;
import com.baidu.mapapi.navi.BaiduMapAppNotSupportNaviException;
import com.baidu.mapapi.utils.route.BaiduMapRoutePlan;
import com.baidu.mapapi.utils.route.RouteParaOption;
import com.facebook.drawee.view.SimpleDraweeView;
import com.yaofangwang.mall.BaiduMapApi.LocationManager;
import com.yaofangwang.mall.Consts;
import com.yaofangwang.mall.MainActivity;
import com.yaofangwang.mall.MainApplication;
import com.yaofangwang.mall.R;
import com.yaofangwang.mall.bean.LocationInfoBean;
import com.yaofangwang.mall.bean.NearShopBeanTcp;
import com.yaofangwang.mall.bean.ShopBeanHttp;
import com.yaofangwang.mall.utils.FrescoLoad;

import java.util.ArrayList;
import java.util.List;

import static java.lang.Math.atan2;
import static java.lang.Math.cos;
import static java.lang.Math.sin;
import static java.lang.Math.sqrt;

@SuppressLint("ValidFragment")
public class FragmentNearlyMap extends Fragment implements OnMarkerClickListener, BaiduMap.OnMapClickListener {

    private List<NearShopBeanTcp.ResultBean> datas = new ArrayList<>();
    Bitmap mBMBlue, mBMRed;
    private MapView mMapView = null;
    private BaiduMap mBaiduMap;

    private View mShopDescriptionView;
    public SimpleDraweeView shop_img;
    private TextView mNameView;
    private TextView mSignedView;
    private TextView mPlaceView;
    private Marker mNowMarker;
    private TextView mRatingView;
    private ImageView location_img;
    private TextView goto_tv;
    private TextView mDistanceView;
    private BitmapDescriptor mNowBitmap;
    private int mNowZindex;
    private View mContentView;
    private View mLoadingView;
    private DisplayMetrics dm;
    public Handler uiHandler = new Handler(new Handler.Callback() {
        @Override
        public boolean handleMessage(Message msg) {
            if (!isAdded()) {
                return false;
            }
            switch (msg.what){
                case 0:
//                    if(mNowMarker!=null){
//                        mNowMarker.setIcon(getBlueMarkerIcon(mNowMarker.getExtraInfo().getInt("index")));
//                    }
//                    mBaiduMap.hideInfoWindow();
                    moveLocation(LocationManager.getLocationInfo());
                    break;
                case 1:
                    showMarkersTcp(datas);
                    break;
                default:
                    break;
            }
            return false;
        }
    });

    @Override
    public void onResume() {
        super.onResume();

        if (null != mMapView) {
            mMapView.onResume();
            mMapView.setVisibility(View.VISIBLE);
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        if (null != mMapView) {
            mMapView.setVisibility(View.INVISIBLE);
            mMapView.onPause();
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (null != mMapView) {
            mMapView.onDestroy();
        }
        BaiduMapRoutePlan.finish(getActivity());
    }

    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        dm = new DisplayMetrics();
        getActivity().getWindowManager().getDefaultDisplay().getMetrics(dm);
        if (null == mContentView) {
            mContentView = inflater.inflate(R.layout.fragment_nearlymap, container, false);
            initView(mContentView);
            mBMBlue = BitmapFactory.decodeResource(getResources(), R.drawable.nearly_marker_little_red);
            mBMRed = BitmapFactory.decodeResource(getResources(), R.drawable.nearly_marker_little_red);
        } else {
            ViewGroup parent = (ViewGroup) mContentView.getParent();
            if (null != parent) {
                parent.removeView(mContentView);
            }
        }
        mMapView = (MapView) mContentView.findViewById(R.id.bmapView);
        mMapView.showZoomControls(false);
        mBaiduMap = mMapView.getMap();
        mBaiduMap.setOnMapClickListener(this);
        moveLocation(LocationManager.getLocationInfo());
        return mContentView;
    }

    public synchronized void getMyLocationMarker(){
        uiHandler.sendEmptyMessage(0);
    }

    /**
     * 移动到某个位置
     */
    private void moveLocation(LocationInfoBean locationInfo) {
        MapStatusUpdate u = MapStatusUpdateFactory.newLatLngZoom(new LatLng(locationInfo.getLatitude(), locationInfo.getLongitude()), 14);
        mBaiduMap.animateMapStatus(u);
        addNowLoctionMarker(LocationManager.getLocationInfo());
    }

    private void initView(View contentView) {
        mLoadingView = contentView.findViewById(R.id.loading_view);
        //SimpleDraweeView mLoadingImage = (SimpleDraweeView) contentView.findViewById(R.id.loading_imge);
        /*DraweeController mDraweeController = Fresco.newDraweeControllerBuilder()
                .setAutoPlayAnimations(true)
                .setUri(Uri.parse("res://"+getActivity().getPackageName()+"/"+R.drawable.load_logo))//设置uri
                .build();
        mLoadingImage.setController(mDraweeController);*/
        //mLoadingImage.setAlpha(0.8f);
        // FrescoLoad.load(mLoadingImage,getActivity().getResources().getDrawable(R.drawable.load_logo));
        View view = LayoutInflater.from(contentView.getContext()).inflate(R.layout.info_window, null); //自定义气泡形状
        mShopDescriptionView = view.findViewById(R.id.fragment_nearly_map_overlay_item);
        shop_img = (SimpleDraweeView) view.findViewById(R.id.shop_img);
        mNameView = (TextView) view.findViewById(R.id.fragment_nearly_map_overlay_name);
        mSignedView = (TextView) view.findViewById(R.id.contract_tv);
        mPlaceView = (TextView) view.findViewById(R.id.fragment_nearly_map_overlay_place);
        mRatingView = (TextView) view.findViewById(R.id.item_nearly_list_ratingbar_tv);
        mDistanceView = (TextView) view.findViewById(R.id.item_nearly_list_distance);
        location_img = (ImageView) view.findViewById(R.id.location_tv);
        goto_tv = (TextView) view.findViewById(R.id.goto_tv);
//        mShopDescriptionView.setVisibility(View.GONE);

    }

    /**
     * 显示图标
     *
     * @param listShops 需要显示图标的商店的列表
     */
    public void showMarkers(List<ShopBeanHttp> listShops) {
        if (listShops == null || listShops.size() == 0) {
            return;
        }
        //mBaiduMap.clear();
        int index = 1;
        for (ShopBeanHttp bean : listShops) {
            addMarker(bean, index++);
        }
    }

    /**
     * 在地图上面添加一个标志
     */
    public void addMarker(ShopBeanHttp bean, int index) {
        // 定义Maker坐标点
        LatLng point = new LatLng(Double.parseDouble(bean.latitude), Double.parseDouble(bean.longitude));
        // 构建MarkerOption，用于在地图上添加Marker
        BitmapDescriptor bitmap = getBlueMarkerIcon(index);

        // 在地图上添加Marker，并显示
        MarkerOptions option = new MarkerOptions().position(point).icon(bitmap);
        Marker marker = (Marker) mBaiduMap.addOverlay(option);
        Bundle datas = new Bundle();
        datas.putInt("index", index);
        datas.putSerializable("data", bean);
        marker.setExtraInfo(datas);
        mBaiduMap.setOnMarkerClickListener(this);
    }

    public void addNowLoctionMarker(LocationInfoBean locationInfo) {
        mBaiduMap.setMyLocationEnabled(true);
        MyLocationData locData = new MyLocationData.Builder().accuracy(locationInfo.getRadius())
                // 此处设置开发者获取到的方向信息，顺时针0-360
                .direction(100).latitude(locationInfo.getLatitude()).longitude(locationInfo.getLongitude()).build();
        // 设置定位数据
        mBaiduMap.setMyLocationData(locData);
        // 设置定位图层的配置（定位模式，是否允许方向信息，用户自定义定位图标）
        BitmapDescriptor mCurrentMarker = BitmapDescriptorFactory.fromResource(R.drawable.navigate);
        MyLocationConfiguration config = new MyLocationConfiguration(MyLocationConfiguration.LocationMode.NORMAL, false, mCurrentMarker);
        mBaiduMap.setMyLocationConfigeration(config);
        // 当不需要定位图层时关闭定位图层
        // mBaiduMap.setMyLocationEnabled(false);
    }

    private void setData(final ShopBeanHttp bean, int index) {
        mShopDescriptionView.setVisibility(View.VISIBLE);
        mNameView.setText(bean.title);
        mSignedView.setTextColor(getActivity().getResources().getColor(R.color.color_appgreen));
        mSignedView.setText("签约    ");
        Drawable drawable = getActivity().getResources().getDrawable(R.drawable.qianyue_on);
        mSignedView.setCompoundDrawablesWithIntrinsicBounds(drawable, null, null, null);
        mPlaceView.setText(bean.address);
        mDistanceView.setText(bean.distance);
        mRatingView.setText(Html.fromHtml("<font color=\'#666666\'>评价：</font><font color=\'#00AA22\'>" + bean.star + "</font>"));
        goto_tv.setOnClickListener(new OnClickListener() {

            @Override
            public void onClick(View v) {
                // startActivity(new Intent(getActivity(), ShopDetailActivity.class).putExtra(Consts.extra.DATA_SHOP_ID, bean.id));
                /*  push数据到js finish当前native页面
                * */
                /*reactApplicationContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("shop_info", bean.id);
                getActivity().finish();*/
                ((MainActivity) getActivity()).startRN(bean.id);
            }
        });
        location_img.setOnClickListener(new OnClickListener() {

            @Override
            public void onClick(View v) {
                double mLat1 = LocationManager.getLocationInfo().getLatitude();
                double mLon1 = LocationManager.getLocationInfo().getLongitude();
                double mLat2 = Double.parseDouble(bean.latitude);
                double mLon2 = Double.parseDouble(bean.longitude);
                LatLng pt1 = new LatLng(mLat1, mLon1);
                LatLng pt2 = new LatLng(mLat2, mLon2);
                RouteParaOption para = new RouteParaOption()
                        .startPoint(pt1)
                        .endPoint(pt2)
                        .startName(LocationManager.getLocationInfo().getAddress())
                        .endName(bean.address);

                try {
                    BaiduMapRoutePlan.setSupportWebRoute(true);
                    BaiduMapRoutePlan.openBaiduMapWalkingRoute(para, getActivity());
                } catch (BaiduMapAppNotSupportNaviException e) {
                    e.printStackTrace();
                    showDialog();
                }
            }
        });
    }

    @SuppressLint("InflateParams")
    public BitmapDescriptor getBlueMarkerIcon(int index) {
        BitmapDrawable bitmapdraw = (BitmapDrawable)getResources().getDrawable(R.drawable.nearly_marker_unclicked);
        Bitmap b=bitmapdraw.getBitmap();
        Bitmap smallMarker = Bitmap.createScaledBitmap(b, (int)(24*dm.density), (int)(31*dm.density), false);
        // 构建Marker图标
        return BitmapDescriptorFactory.fromBitmap(smallMarker);
    }

    @SuppressLint("InflateParams")
    public BitmapDescriptor getRedMarkerIcon(int index) {
        BitmapDrawable bitmapdraw = (BitmapDrawable)getResources().getDrawable(R.drawable.nearly_marker_clicked);
        Bitmap b=bitmapdraw.getBitmap();
        Bitmap smallMarker = Bitmap.createScaledBitmap(b, (int)(26*dm.density), (int)(34*dm.density), false);
        // 构建Marker图标
        BitmapDescriptor bitmap = BitmapDescriptorFactory.fromBitmap(smallMarker);
        return bitmap;
    }

    @Override
    public boolean onMarkerClick(Marker marker) {
        if (null != mNowMarker && null != mNowBitmap) {
            mNowMarker.setIcon(mNowBitmap);
            mNowMarker.setZIndex(mNowZindex);
        }
        mNowBitmap = marker.getIcon();
        mNowMarker = marker;
        mNowZindex = marker.getZIndex();
        Bundle datas = marker.getExtraInfo();
        int index = datas.getInt("index");

        NearShopBeanTcp.ResultBean bean = (NearShopBeanTcp.ResultBean) datas.getSerializable("data");
        setDataTcp(bean, index);

        marker.setZIndex(Integer.MAX_VALUE);
        marker.setIcon(getRedMarkerIcon(index));
        return false;
    }


    public void onGetData(List<ShopBeanHttp> listShops) {
        mMapView.setVisibility(View.VISIBLE);
        showMarkers(listShops);
    }

    /**
     * 提示未安装百度地图app或app版本过低
     */
    public void showDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
        builder.setMessage("您尚未安装百度地图app或app版本过低。");
        builder.setTitle("提示");
        builder.setPositiveButton("确认", new AlertDialog.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                dialog.dismiss();
//                /**
//                 * OpenClientUtil:调起百度客户端工具类
//                 *
//                 * public static int getBaiduMapVersion(Context context)
//                 * 获取百度地图客户端版本号
//                 * 返回0代表没有安装百度地图客户端
//                 * */
//                OpenClientUtil.getLatestBaiduMapApp(getActivity());
            }
        });

        builder.setNegativeButton("取消", new AlertDialog.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                dialog.dismiss();
            }
        });

        builder.create().show();

    }

    public void onGetDataTcp(List<NearShopBeanTcp.ResultBean> shopDatas) {
        mMapView.setVisibility(View.VISIBLE);
        datas = shopDatas;
        uiHandler.sendEmptyMessage(1);
    }

    public void showMarkersTcp(List<NearShopBeanTcp.ResultBean> listShops) {
        if (listShops == null || listShops.size() == 0) {
            return;
        }
        mBaiduMap.clear();
        int index = 1;
        for (NearShopBeanTcp.ResultBean bean : listShops) {
            addMarkerTcp(bean, index++);
        }
    }

    /**
     * 在地图上面添加一个标志
     */
    public void addMarkerTcp(NearShopBeanTcp.ResultBean bean, int index) {
        // 定义Maker坐标点
        LatLng point = new LatLng(Double.parseDouble(bean.getLat()), Double.parseDouble(bean.getLng()));
        // 构建MarkerOption，用于在地图上添加Marker
        BitmapDescriptor bitmap = getBlueMarkerIcon(index);

        // 在地图上添加Marker，并显示
        MarkerOptions option = new MarkerOptions().position(point).icon(bitmap);
        Marker marker = (Marker) mBaiduMap.addOverlay(option);
        Bundle datas = new Bundle();
        datas.putInt("index", index);
        datas.putSerializable("data", bean);
        marker.setExtraInfo(datas);
        mBaiduMap.setOnMarkerClickListener(this);
    }

    private void setDataTcp(final NearShopBeanTcp.ResultBean bean, int index) {
        mShopDescriptionView.setVisibility(View.VISIBLE);
        SharedPreferences sharedPreferences = MainApplication.getInstance().getSharedPreferences(Consts.PreferenceKey.preferenceName, this.getContext().MODE_PRIVATE);
        String cdn = sharedPreferences.getString("CDN_URL", "//c1.yaofangwang.net");
        if(bean.getLogo_image().startsWith("/")){
            FrescoLoad.load(shop_img,"http:"+cdn+bean.getLogo_image());
        }else {
            FrescoLoad.load(shop_img,"http:"+cdn+"/"+bean.getLogo_image());
        }
        mNameView.setText(bean.getTitle());
        mSignedView.setTextColor(getActivity().getResources().getColor(R.color.color_appgreen));
        mSignedView.setText("已签约");
        mPlaceView.setText(bean.getAddress());
        mDistanceView.setText(bean.getDistance() + "km");
        mRatingView.setText(String.valueOf(bean.getEvaluation_star_sum()));

        mShopDescriptionView.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                // do nothing
            }
        });

        location_img.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                // startActivity(new Intent(getActivity(), ShopDetailActivity.class).putExtra(Consts.extra.DATA_SHOP_ID, bean.id));
                /*  push数据到js finish当前native页面
                * */
                /*reactApplicationContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("shop_info", bean.id);
                getActivity().finish();*/
                ((MainActivity) getActivity()).startRN(bean.getId() + "");
            }
        });
        goto_tv.setOnClickListener(new OnClickListener() {

            @Override
            public void onClick(View v) {
                if(checkApkExist(getActivity(),"com.autonavi.minimap") && !checkApkExist(getActivity(),"com.baidu.BaiduMap")){
                    goToGaode(bean.getLat(), bean.getLng(),bean.getAddress());
                    return;
                }
                double mLat1 = LocationManager.getLocationInfo().getLatitude();
                double mLon1 = LocationManager.getLocationInfo().getLongitude();
                double mLat2 = Double.parseDouble(bean.getLat());
                double mLon2 = Double.parseDouble(bean.getLng());
                LatLng pt1 = new LatLng(mLat1, mLon1);
                LatLng pt2 = new LatLng(mLat2, mLon2);
                RouteParaOption para = new RouteParaOption()
                        .startPoint(pt1)
                        .endPoint(pt2)
                        .startName(LocationManager.getLocationInfo().getAddress())
                        .endName(bean.getAddress());

                try {
                    BaiduMapRoutePlan.setSupportWebRoute(true);
                    BaiduMapRoutePlan.openBaiduMapWalkingRoute(para, getActivity());
                } catch (BaiduMapAppNotSupportNaviException e) {
                    e.printStackTrace();
                    showDialog();
                }
            }
        });
        LatLng point = new LatLng(Double.valueOf(bean.getLat()), Double.valueOf(bean.getLng()));
        InfoWindow mInfoWindow = new InfoWindow(mShopDescriptionView, point, (int)(120*dm.density));
        mBaiduMap.showInfoWindow(mInfoWindow);
    }

    @Override
    public void onMapClick(LatLng latLng) {
        if(mNowMarker!=null){
            mNowMarker.setIcon(getBlueMarkerIcon(mNowMarker.getExtraInfo().getInt("index")));
        }
        mBaiduMap.hideInfoWindow();
    }

    @Override
    public void onMapPoiClick(MapPoi mapPoi) {

    }

    private Double gg_lon;
    private Double gg_lat;

    //高德
    private void goToGaode(String lat, String lon, String address) {
        bd_decrypt(Double.parseDouble(lat), Double.parseDouble(lon));
        StringBuffer stringBuffer = new StringBuffer("androidamap://route?sourceApplication=").append("amap");

        stringBuffer.append("&dlat=").append(gg_lat)
                .append("&dlon=").append(gg_lon)
                .append("&dname=").append(address)
                .append("&dev=").append(0)
                .append("&t=").append(0);

        Intent intent = new Intent("android.intent.action.VIEW", android.net.Uri.parse(stringBuffer.toString()));
        intent.setPackage("com.autonavi.minimap");
        startActivity(intent);
    }

    //百度转高德
    void bd_decrypt(double bd_lat, double bd_lon) {
        double x = bd_lon - 0.0065, y = bd_lat - 0.006; double z = sqrt(x * x + y * y) - 0.00002 * sin(y * Math.PI);
        double theta = atan2(y, x) - 0.000003 * cos(x * Math.PI);
        gg_lon = z * cos(theta);
        gg_lat = z * sin(theta);

    }

    //判断是否安装地图应用 com.autonavi.minimap/com.baidu.BaiduMap
    private boolean checkApkExist(Context context, String packageName) {
        if (packageName == null || "".equals(packageName))
            return false;
        try {
            ApplicationInfo info = context.getPackageManager().getApplicationInfo(packageName,
                    PackageManager.GET_UNINSTALLED_PACKAGES);
            return true;
        } catch (PackageManager.NameNotFoundException e) {
            return false;
        }
    }
}
