package com.yaofangwang.mall.activity;

import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.support.annotation.ColorInt;
import android.text.TextUtils;
import android.view.KeyEvent;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.SslErrorHandler;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.umeng.analytics.MobclickAgent;
import com.umeng.socialize.ShareAction;
import com.umeng.socialize.UMShareAPI;
import com.umeng.socialize.UMShareListener;
import com.umeng.socialize.bean.SHARE_MEDIA;
import com.umeng.socialize.media.UMImage;
import com.umeng.socialize.media.UMWeb;
import com.yaofangwang.mall.Consts;
import com.yaofangwang.mall.R;
import com.yaofangwang.mall.TUtils.TUtils;
import com.yaofangwang.mall._BaseActivity;
import com.yaofangwang.mall.utils.JavaScriptObject;
import com.yaofangwang.mall.widgtes.ProgressActivity;
import com.yaofangwang.mall.widgtes.ShareDialog;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.sobot.chat.widget.kpswitch.util.StatusBarHeightUtil.getStatusBarHeight;
import static com.yaofangwang.mall.widgtes.ShareDialog.TAG_COPY_URL;
import static com.yaofangwang.mall.widgtes.ShareDialog.TAG_PIC;
import static com.yaofangwang.mall.widgtes.ShareDialog.TAG_QQ;
import static com.yaofangwang.mall.widgtes.ShareDialog.TAG_QZONE;
import static com.yaofangwang.mall.widgtes.ShareDialog.TAG_SINA;


public class H5HuodongActivity extends _BaseActivity {

    String mPreUrl;
    String urlTitle;
    String mPreShare;
    ProgressBar mMyProgressBar;
    WebView mWebView;
    ProgressActivity mProgressActivit;
    String jumpAdsActivity;
    private boolean isBranNewSign = false ; //是否是新的签到页面
    private JavaScriptObject javaScriptObject;//JS交互类
    private TextView topRightTv;
    private TextView mTvTopLeft;
    private TextView mTvTopTitle;
    public WebView getWebView() {
        return mWebView;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_web);
        //ReactNative特别处理，添加状态栏
        setStatusBarView(this,0xFFFFFF,1);
        initViews();
        javaScriptObject = new JavaScriptObject(this);
        if (null != getIntent()) {
            mPreUrl = getIntent().getStringExtra(Consts.extra.DATA_URL);
            urlTitle = getIntent().getStringExtra(Consts.extra.DATA_URL_TITLE);
            mPreShare = getIntent().getStringExtra(Consts.extra.DATA_SHARE_URL);
            jumpAdsActivity = getIntent().getStringExtra("jumpAdsActivity");
            if (TextUtils.isEmpty(mPreShare)) {
                mPreShare = mPreUrl;
            }
        }
        if("签到抽奖".equals(urlTitle)){
            //如果是签到页面，默认进来不可点击，在判断没有bran_new_sign标签后才可点击
            topRightTv.setEnabled(false);
        }
        if (!TextUtils.isEmpty(mPreShare)) {
            if (!urlTitle.equals("邀请好友赢现金")) {
                setTopRight(R.drawable.share_icon, new OnClickListener() {

                    @Override
                    public void onClick(View v) {
                        chooseShareClient(mPreShare);
                    }
                });
            }
        }
        initDatas();
    }

    /**
     * 设置状态栏
     * @param activity
     * @param color
     * @param alpha
     */
    private void setStatusBarView(Activity activity, @ColorInt int color, int alpha) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            // 绘制一个和状态栏一样高的矩形
            View statusBarView = findViewById(R.id.statusView);
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, getStatusBarHeight(activity));
            statusBarView.setLayoutParams(params);
            statusBarView.setBackgroundColor(color);
        }
    }

    private void initViews(){
        mMyProgressBar = findViewById(R.id.myProgressBar);
        mWebView = findViewById(R.id.activity_web_webview);
        mProgressActivit = findViewById(R.id.progress);
        topRightTv = findViewById(R.id.top_right_tv);
        mTvTopLeft =findViewById(R.id.top_left);
        mTvTopTitle =findViewById(R.id.top_title);
        findViewById(R.id.top_left).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        MobclickAgent.onPageStart("H5页面");
        MobclickAgent.onResume(this);
    }

    @Override
    protected void onPause() {
        super.onPause();
        MobclickAgent.onPageEnd("H5页面");
        MobclickAgent.onPause(this);
    }

    private void showErrorView() {

        mProgressActivit.showError(new OnClickListener() {
            @Override
            public void onClick(View v) {
                switch (v.getId()) {
                    case R.id.errorStateButton:
                        //重试,重新请求
                        initDatas();
                        break;
                    case R.id.setError:
                        Intent intent = new Intent(Settings.ACTION_SETTINGS);
                        startActivity(intent);
                        break;
                }
            }
        });
    }

    public void chooseShareClient(String str) {
        ShareDialog dialog = new ShareDialog(this, new ShareDialog.IOnNameChecked() {
            @Override
            public void onChecked(SHARE_MEDIA name) {
                if (null != name) {
                    HashMap<String, String> data = new HashMap<>();
                    data.put("title", title);
                    data.put("content", description);
                    data.put("webUrl", mPreShare);
                    data.put("imgUrl", path);

                    sharePlatform(data, name, R.drawable.app_icon_share);
                }
            }
        }, str);
        setDialog(dialog);
        dialog.show();
    }

    public void chooseInviteShareClient(final String str, final String title, final String description, final String imgsrc) {
        ShareDialog dialog = new ShareDialog(this, new ShareDialog.IOnNameChecked() {
            @Override
            public void onChecked(SHARE_MEDIA name) {
                if (null != name) {
                    HashMap<String, String> data = new HashMap<>();
                    data.put("title", title);
                    data.put("content", description);
                    data.put("webUrl", str);
                    data.put("imgUrl", imgsrc);

                    sharePlatform(data, name, R.drawable.app_icon_share);
                }
            }
        }, str);
        setDialog(dialog);
        dialog.show();
    }

    /**
     * 设置Dialog
     *
     * @param dialog
     */
    private void setDialog(ShareDialog dialog) {
        if (!TextUtils.isEmpty(urlTitle) && urlTitle.equals("签到抽奖") && isBranNewSign) {
            //如果是签到抽奖，点击分享只有微信和朋友圈
            dialog.setGone(TAG_SINA, TAG_QQ, TAG_QZONE, TAG_COPY_URL, TAG_PIC);
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        UMShareAPI.get(this).onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_RESULT_CODE) {
            if (null == uploadMessage && null == uploadMessageAboveL) return;
            Uri result = data == null || resultCode != RESULT_OK ? null : data.getData();
            if (uploadMessageAboveL != null) {
                onActivityResultAboveL(requestCode, resultCode, data);
            } else if (uploadMessage != null) {
                uploadMessage.onReceiveValue(result);
                uploadMessage = null;
            }
        }
        javaScriptObject.onActivityResult(requestCode, resultCode, data);
    }

    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    private void onActivityResultAboveL(int requestCode, int resultCode, Intent intent) {
        if (requestCode != FILE_CHOOSER_RESULT_CODE || uploadMessageAboveL == null) return;
        Uri[] results = null;
        if (resultCode == Activity.RESULT_OK) {
            if (intent != null) {
                String dataString = intent.getDataString();
                ClipData clipData = intent.getClipData();
                if (clipData != null) {
                    results = new Uri[clipData.getItemCount()];
                    for (int i = 0; i < clipData.getItemCount(); i++) {
                        ClipData.Item item = clipData.getItemAt(i);
                        results[i] = item.getUri();
                    }
                }
                if (dataString != null) results = new Uri[]{Uri.parse(dataString)};
            }
        }
        uploadMessageAboveL.onReceiveValue(results);
        uploadMessageAboveL = null;
    }

    /**
     * U2714H
     * 提取网页中分享的的信息
     */
    private String path;
    private String description;
    private String title;

    @SuppressLint({"JavascriptInterface", "SetJavaScriptEnabled"})
    private void initDatas() {
        if (!TUtils.isNetworkAvailable(this)) {
            showErrorView();
            return;
        }
        mProgressActivit.showContent();
        mWebView.getSettings().setJavaScriptEnabled(true); // 支持js
        mWebView.addJavascriptInterface(javaScriptObject, "openApp");
        mWebView.setWebChromeClient(new CoustomWebChromeClient());
        mWebView.setWebViewClient(new MyWebViewClient());
        mWebView.addJavascriptInterface(new InJavaScriptLocalObj(), "local_obj");
        mWebView.loadUrl(mPreUrl);
        setTopLeft(new OnClickListener() {
            @Override
            public void onClick(View v) {
                if (mWebView.canGoBack()) {
                    mWebView.goBack();
                } else {
                    finish();
                }
            }
        });
        mWebView.getSettings().setDomStorageEnabled(true);
        mWebView.getSettings().setAppCacheMaxSize(1024 * 1024 * 8);
        String appCachePath = getApplicationContext().getCacheDir().getAbsolutePath();
        mWebView.getSettings().setAppCachePath(appCachePath);
        mWebView.getSettings().setAllowFileAccess(true);
        mWebView.getSettings().setAppCacheEnabled(true);

    }

    private ValueCallback<Uri> uploadMessage;
    private ValueCallback<Uri[]> uploadMessageAboveL;
    private final static int FILE_CHOOSER_RESULT_CODE = 10000;

    class CoustomWebChromeClient extends WebChromeClient {
        @Override
        public void onProgressChanged(WebView view, int newProgress) {
            if (newProgress == 100) {
                mMyProgressBar.setVisibility(View.GONE);
            } else {
                if (View.INVISIBLE == mMyProgressBar.getVisibility()) {
                    mMyProgressBar.setVisibility(View.VISIBLE);
                }
                mMyProgressBar.setProgress(newProgress);
            }
            super.onProgressChanged(view, newProgress);
        }

        //支持网页上传图片
        @Override
        public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
            uploadMessageAboveL = filePathCallback;
            openImageChooserActivity();
            return true;
        }

        private void openImageChooserActivity() {
            Intent i = new Intent(Intent.ACTION_GET_CONTENT);
            i.addCategory(Intent.CATEGORY_OPENABLE);
            i.setType("image/*");
            startActivityForResult(Intent.createChooser(i, "图片选择"), FILE_CHOOSER_RESULT_CODE);
        }

    }

    class MyWebViewClient extends WebViewClient {
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            if (url.startsWith("http:") || url.startsWith("https:")) {
                return false;
            }
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            startActivity(intent);
            return true;
        }

        @Override
        public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
            super.onReceivedError(view, errorCode, description, failingUrl);
            TUtils.showShortToast(H5HuodongActivity.this, "网络不给力，请连接后重试~");
        }

        public void onPageStarted(WebView view, String url, Bitmap favicon) {
            super.onPageStarted(view, url, favicon);
        }

        public void onPageFinished(WebView view, String url) {
            String title = mWebView.getTitle();
            mTvTopTitle.setText(title);
            view.loadUrl("javascript:window.local_obj.showSource('<head>'+" + "document.getElementsByTagName('html')[0].innerHTML+'</head>');");
            super.onPageFinished(view, url);
        }

        @Override
        public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
            handler.proceed();
        }
    }

    private void settingSigner(String html) {
        //如果这个meta标签则隐藏右上角分享按钮
        if(urlTitle.equals("签到抽奖")){
            if (html.contains("bran_new_sign") ) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        topRightTv.setVisibility(View.GONE);
                        isBranNewSign=true;
                    }
                });
            }else{
                //如果没有bran_new_sign标签则可以点击
                topRightTv.setEnabled(true);
            }
        }
    }

    class InJavaScriptLocalObj {
        /*不能删除*/
        @JavascriptInterface
        public void showSource(String html) {
            html = html.toLowerCase();
            String regex = "<img[^>]+src\\s*=\\s*['\"]([^'\"]+)['\"][^>]*>";
            Pattern p = Pattern.compile(regex);
            Matcher m = p.matcher(html);
            String buffer = "";
            while (m.find()) {
                String group = m.group();
                buffer += group + "!@#";
            }
            String[] s = buffer.split("!@#");
            Pattern p2 = Pattern.compile("src\\s*=\\s*\"?(.*?)(\"|>|\\s+)");
            // Pattern p2 =
            // Pattern.compile("<img[^<>]*?\\ssrc=['\"]?(.*?)['\"].*?>");
            Matcher m2 = p2.matcher(s[0]);
            while (m2.find()) {
                String imgPath = m2.group();
                path = imgPath.substring(4);
            }
            path = path.replace("\"", "");

            String regex_title = "<title>.*?</title>";
            Pattern p_title = Pattern.compile(regex_title);
            Matcher m_title = p_title.matcher(html);
            String buffer_title = "";
            while (m_title.find()) {
                String group_title = m_title.group();
                buffer_title += group_title + "!@#";
            }
            String[] s_title = buffer_title.split("!@#");
            title = s_title[0];
            title = title.replace("<title>", "");
            title = title.replace("</title>", "");
//            mTvTopTitle.setText(title);
            String regext_description = "name=\"description\".*?\">";
            Pattern p_description = Pattern.compile(regext_description);
            Matcher m_description = p_description.matcher(html);
            String buffer_description = "";
            while (m_description.find()) {
                String group_description = m_description.group();
                buffer_description += group_description + "!@#";
            }
            String[] s_description = buffer_description.split("!@#");
            description = s_description[0];
            description = description.replaceAll("[^0-9\\u4e00-\\u9fa5]", "");
            //设置签到相关
            settingSigner(html);
        }
    }

    @Override
    protected void onDestroy() {
        if (mWebView != null) {
            mWebView.destroy();
            mWebView = null;
        }
        super.onDestroy();
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && mWebView.canGoBack()) {
            mWebView.goBack();// 返回前一个页面
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    protected void setTopRight(int resID, View.OnClickListener click) {
        Drawable drawable = getResources().getDrawable(resID);
        topRightTv.setCompoundDrawablesWithIntrinsicBounds(null, null, drawable, null);
        topRightTv.setOnClickListener(click);
        topRightTv.setVisibility(View.VISIBLE);
    }

    protected void setTopLeft(OnClickListener click) {
        mTvTopLeft.setOnClickListener(click);
        mTvTopLeft.setVisibility(View.VISIBLE);
    }

    public void sharePlatform(Map<String, String> data, SHARE_MEDIA platform, int drawable) {
        //最好设置网络图片和本地图片
        UMImage image;
        if (TextUtils.isEmpty(data.get("imgUrl"))) {
            image = new UMImage(this, drawable);
        } else {
            image = new UMImage(this, data.get("imgUrl"));
            if (!data.get("imgUrl").contains("https:")) {
                image = new UMImage(this, "https:" + data.get("imgUrl"));
            }
        }
        UMWeb web = new UMWeb(data.get("webUrl"));
        web.setThumb(image);
        web.setTitle(data.get("title"));
        web.setDescription(data.get("content"));
        new ShareAction(this).setPlatform(platform)
//                .withText(content)
                .withMedia(web).setCallback(new UMShareListener() {
            @Override
            public void onStart(SHARE_MEDIA share_media) {

            }

            @Override
            public void onResult(SHARE_MEDIA share_media) {
                TUtils.showShortToast(H5HuodongActivity.this, getResources().getString(R.string.toast_share_true));
                MobclickAgent.onEvent(H5HuodongActivity.this, "product detail-success");
                WebView webView = getWebView();
                webView.loadUrl("javascript:AddPoint()");
            }

            @Override
            public void onError(SHARE_MEDIA share_media, Throwable throwable) {
                TUtils.showShortToast(H5HuodongActivity.this, getResources().getString(R.string.toast_share_false));
                MobclickAgent.onEvent(H5HuodongActivity.this, "product detail-fail");
            }

            @Override
            public void onCancel(SHARE_MEDIA share_media) {
                TUtils.showShortToast(H5HuodongActivity.this, "取消分享");
            }
        }).share();
    }
}
