package com.yaofangwang.mall.MapNearbyPoi;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;

import java.util.Map;

import javax.annotation.Nullable;

/**
 * Created by admin on 2018/9/11.
 */

public class MapNearbyPoiViewManager extends SimpleViewManager<MapNearbyPoiView> {

    public static final String REACT_CLASS = "MapNearbyPoiView";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected MapNearbyPoiView createViewInstance(ThemedReactContext reactContext) {
        return new MapNearbyPoiView(reactContext);
    }

    @Override
    public void receiveCommand(MapNearbyPoiView view, int commandId, @Nullable ReadableArray args) {
        switch (commandId){
            case 10001:
                view.onDestroy();
                break;
            case 10002:
                view.onPause();
                break;
            case 10003:
                view.onResume();
                break;
            default:
                break;
        }
    }

    @Override
    public Map getExportedCustomDirectEventTypeConstants() {
        return MapBuilder.of("onGetReverseGeoCodeResult", MapBuilder.of("registrationName", "onGetReverseGeoCodeResult"));
    }

}
