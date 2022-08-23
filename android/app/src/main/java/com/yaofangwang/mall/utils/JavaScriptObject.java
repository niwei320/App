package com.yaofangwang.mall.utils;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.os.Handler;
import android.os.Message;
import android.util.Log;
import android.webkit.JavascriptInterface;

import com.yaofangwang.mall.Consts;
import com.yaofangwang.mall.TUtils.TUtils;
import com.yaofangwang.mall.activity.H5HuodongActivity;
import com.yaofangwang.mall.widgtes.LoadingDialog;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;

public class JavaScriptObject {
    Context mContxt;
    private UpdateAppHelp updateAppHelp;


    int a=1;
    public JavaScriptObject(Context mContxt) {
        this.mContxt = mContxt;
        if(mContxt instanceof Activity){
            updateAppHelp = new UpdateAppHelp((Activity) mContxt);
        }
    }

    @JavascriptInterface
    public void jump(String json) {
        try {
            JSONObject mJson = new JSONObject(json);
            String type = mJson.optString("type");
            String id = mJson.optString("id");

            Log.e("mJSson", mJson.toString());
            if (type == null || id == null) {
                return;
            } else if (type.equals(Consts.qrresult.QR_GET_GOODS_DETAIL)) {
//                mContxt.startActivity(new Intent(mContxt, ValueCompareActivity.class).putExtra(Consts.extra.DATA_MEDICINE_ID, id));
            } else if (type.equals(Consts.qrresult.QR_GET_SHOP_DETAIL)) {
//                mContxt.startActivity(new Intent(mContxt, ShopDetailActivity.class).putExtra(Consts.extra.DATA_SHOP_ID, id));
            } else if (type.equals(Consts.qrresult.QR_GET_SHOP_GOODS_DETAIL)) {
//                mContxt.startActivity(new Intent(mContxt, MedicineDetailActivity.class).putExtra(Consts.extra.DATA_SHOP_GOODS_ID, id));//
            } else if (type.equals(Consts.qrresult.QR_LOGIN)) {
                ((Activity) mContxt).finish();
            } else if (type.equals("get_share")) {
                String url = mJson.optString("url");
                String title = mJson.optString("title");
                String desc = mJson.optString("desc");
                String imgsrc = mJson.optString("imgsrc");
//                String replaceImgsrc = imgsrc.replace("\\n", "");
//                Log.e("replace",replaceImgsrc);
                ((H5HuodongActivity) mContxt).chooseInviteShareClient(url, title, desc, imgsrc);
            } else if (type.equals("get_ASK")) {//问答页面
//                mContxt.startActivity(new Intent(mContxt, HealthAnswerActivity.class));
            } else if (type.equals("get_myASK")) {//我的问答
//                if (null == ((_BaseActivity) mContxt).isLogined()) {return;}
//                mContxt.startActivity(new Intent(mContxt, MyReplyHealthyQuestionActivity.class));
            } else if (type.equals("get_submit_ASK")) {//提问页面
//                if (null == ((_BaseActivity) mContxt).isLogined()) {return;}
//                mContxt.startActivity(new Intent(mContxt, AskQuestionsActivity.class));
            } else if (type.equals("get_save_photo")) {
                String url = mJson.optString("imgsrc");
                ((H5HuodongActivity) mContxt).runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        LoadingDialog.showInstance(mContxt);
                    }
                });
                onDownLoad(mContxt, url);
            } else if (type.equals("android_up")) {
                //更新升级
                updateAppHelp.checkeNewVersion();
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    /**
     * 启动图片下载线程
     */
    private void onDownLoad(Context context, String url) {

        DownLoadImageService service = new DownLoadImageService(context, url, new ImageDownLoadCallBack() {

            @Override
            public void onDownLoadSuccess(File file) {
            }

            @Override
            public void onDownLoadSuccess(Bitmap bitmap) {
                // 在这里执行图片保存方法
                Message message = new Message();
                message.what = 1;
                handler.sendMessageDelayed(message, 500);
            }

            @Override
            public void onDownLoadFailed() {
                // 图片保存失败
                Message message = new Message();
                message.what = 2;
                handler.sendMessageDelayed(message, 500);
            }
        });
        //启动图片下载线程
        new Thread(service).start();
    }

    Handler handler = new Handler() {
        @Override
        public void handleMessage(Message msg) {
            super.handleMessage(msg);
            switch (msg.what) {
                case 1:
                    LoadingDialog.cancelInstance();
                    TUtils.showShortToast(mContxt, "图片保存成功");
                    break;
                case 2:
                    LoadingDialog.cancelInstance();
                    TUtils.showShortToast(mContxt, "图片保存失败");
                    break;
            }
        }
    };

    /**
     * 获取activity的返回值
     * @param requestCode
     * @param resultCode
     * @param data
     */
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        updateAppHelp.onActivityResult(requestCode, resultCode, data);
    }

}
