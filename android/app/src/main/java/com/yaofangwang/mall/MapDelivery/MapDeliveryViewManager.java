package com.yaofangwang.mall.MapDelivery;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.util.Map;

import javax.annotation.Nullable;

/**
 * Created by admin on 2018/9/11.
 */

public class MapDeliveryViewManager extends SimpleViewManager<MapDeliveryView> {

    public static final String REACT_CLASS = "MapDeliveryView";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected MapDeliveryView createViewInstance(ThemedReactContext reactContext) {
        return new MapDeliveryView(reactContext);
    }


    @ReactProp(name = "mapData")
    public void set(MapDeliveryView view, ReadableMap dataMap) {
        ReadableArray dataArray = Arguments.createArray();
        if(dataMap.hasKey("dataArray")){
            if(!dataMap.isNull("dataArray")){
                if(dataMap.getType("dataArray") == ReadableType.Array){
                    dataArray = dataMap.getArray("dataArray");
                }
            }
        }
        boolean showLine = false;
        if(dataMap.hasKey("showLine")){
            if(!dataMap.isNull("showLine")){
                if(dataMap.getType("showLine") == ReadableType.Boolean){
                    showLine = dataMap.getBoolean("showLine");
                }
            }
        }
        view.setData(dataArray, showLine);
    }


    @Override
    public void receiveCommand(MapDeliveryView view, int commandId, @Nullable ReadableArray args) {
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
        return MapBuilder.of(
                "onClick", MapBuilder.of("registrationName", "onClick"),
                "onTimeOut",MapBuilder.of("registrationName", "onTimeOut")
        );
    }

}
