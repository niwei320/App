package com.yaofangwang.mall.widgtes.web;

import android.net.http.SslError;
import android.os.Build;
import android.webkit.SslErrorHandler;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.facebook.react.views.webview.WebViewConfig;

/**
 * Created by marti on 2018/12/14.
 */

public class WebConfig {
    public static WebViewConfig createConfig(){
       WebViewConfig config = new WebViewConfig() {
            @Override
            public void configWebView(WebView webView) {
                //支持JS
                webView.getSettings().setJavaScriptEnabled(true);
                //大于等于5.0默认不开启加载非安全链接，手动开启
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    webView.getSettings().setMixedContentMode(
                            WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
                }

                //重写Web客户端配置，在加载SSL错误的时候接受错误
                webView.setWebViewClient(new WebViewManager.ReactWebViewClient(){
                    @Override
                    public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                        handler.proceed();
                    }
                });
            }
        };
        return config;
    }
}
