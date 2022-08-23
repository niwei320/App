package com.yaofangwang.mall;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.react.uimanager.ViewManager;
import com.yaofangwang.mall.widgtes.web.WebViewManager;

import java.util.ArrayList;
import java.util.List;


/**
 * Created by marti on 2018/12/14.
 */

public class ReactMainPackage extends MainReactPackage {

    /**
     * 所有控件包都会在这里添加
     * @param reactContext
     * @return
     */
    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        List<ViewManager> list = new ArrayList<>();
        list.addAll(super.createViewManagers(reactContext));
        for (int i = 0; i < list.size(); i++) {
            if(list.get(i).getName().equals("RCTWebView")){
                list.set(i,createWebViewManager(reactContext));
            }
        }
        return list;
    }

    /**
     * 构造WebViewManager
     * @return
     */
    public WebViewManager createWebViewManager(ReactApplicationContext reactContext){
        return new WebViewManager(reactContext);
    }
}
