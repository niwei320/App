package com.yaofangwang.mall.widgtes;

import android.app.Dialog;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.util.DisplayMetrics;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

import com.umeng.socialize.bean.SHARE_MEDIA;
import com.yaofangwang.mall.R;
import com.yaofangwang.mall.TUtils.TUtils;

import java.util.HashMap;

/**
 * 三方分享的弹出框
 *
 * @author Ushio_Yu
 */
public class ShareDialog extends Dialog implements View.OnClickListener {
    protected Context mContext;
    protected LayoutInflater mInflater;

    IOnNameChecked mOnNameChecked;
    private View mSharePic;
    private HashMap<String, View> views = new HashMap<>();
    public static final String TAG_WE_CHAT = "SHARED_WE_CHAT";
    public static final String TAG_WE_CHAT_MOMENT = "SHARED_WE_CHAT_MOMENT";
    public static final String TAG_SINA = "SHARED_SINA";
    public static final String TAG_QQ = "SHARED_QQ";
    public static final String TAG_QZONE = "SHARED_QZONE";
    public static final String TAG_COPY_URL = "SHARED_COPY_URL";
    public static final String TAG_PIC = "SHARED_PIC";

    public interface IOnNameChecked {
        public void onChecked(SHARE_MEDIA name);
    }

    View mCancelView;
    View mShareSina;
    View mShareWechat;
    View mShareWechatMoment;
    View mShareQQ;
    View mShareQZone;
    View mShareCopy;

    String url;

    public ShareDialog(Context context, IOnNameChecked listener, String str) {
        super(context, R.style.ActionSheetDialogStyle);
        mOnNameChecked = listener;
        mContext = context;
        mInflater = LayoutInflater.from(context);
        initViews();
        addViews();
        initListener();
        initDatas();
        url = str;
    }

    private void addViews(){
        views.put(TAG_WE_CHAT, mShareWechat);//微信
        views.put(TAG_WE_CHAT_MOMENT, mShareWechatMoment);//朋友圈
        views.put(TAG_SINA, mShareSina);//微博
        views.put(TAG_QQ, mShareQQ);//QQ
        views.put(TAG_QZONE, mShareQZone);//QQ控件
        views.put(TAG_COPY_URL, mShareCopy);//复制链接
        views.put(TAG_PIC, mSharePic);//复制链接
    }

    private void initViews() {
        setContentView(R.layout.dialog_share_layout);
        mShareSina = findViewById(R.id.dialog_share_sian);
        mShareWechat = findViewById(R.id.dialog_share_wechat);
        mShareWechatMoment = findViewById(R.id.dialog_share_wechat_moment);
        mShareQQ = findViewById(R.id.dialog_share_qq);
        mShareQZone = findViewById(R.id.dialog_share_qzone);
        mCancelView = findViewById(R.id.dialog_share_cancel);
        mShareCopy = findViewById(R.id.dialog_share_copy);
        mSharePic = findViewById(R.id.dialog_share_pic);
//        if(mContext instanceof MedicineDetailActivity){
//            String prescription = ((MedicineDetailActivity) mContext).detailBean.prescription;
//            String is_jump_login = ((MedicineDetailActivity) mContext).detailBean.is_jump_login;
//            if(TextUtils.isEmpty(prescription)|| TextUtils.isEmpty(is_jump_login)){
//                return;
//            }
//            if(prescription.equals("0")){
//                mSharePic.setVisibility(View.VISIBLE);
//            }else {
//                //是处方药
//                if("false".equals(is_jump_login)){
//                    mSharePic.setVisibility(View.VISIBLE);
//                }else {
//                    //未登录
//                    mSharePic.setVisibility(View.GONE);
//                }
//            }
//        }else {
//            mSharePic.setVisibility(View.GONE);
//        }
//        if(mContext instanceof ShareMedicnePicActivity){
//            mShareCopy.setVisibility(View.GONE);
//        }else {
//            mShareCopy.setVisibility(View.VISIBLE);
//        }
    }

    private void initListener() {
        mShareSina.setOnClickListener(this);
        mShareWechat.setOnClickListener(this);
        mShareWechatMoment.setOnClickListener(this);
        mShareQQ.setOnClickListener(this);
        mShareQZone.setOnClickListener(this);
        mCancelView.setOnClickListener(this);
        mShareCopy.setOnClickListener(this);
        mSharePic.setOnClickListener(this);
    }

    private void initDatas() {
        Window window = getWindow();
        WindowManager.LayoutParams params = window.getAttributes();
        WindowManager windowManager = (WindowManager) mContext.getSystemService(Context.WINDOW_SERVICE);
        DisplayMetrics outMetrics = new DisplayMetrics();
        windowManager.getDefaultDisplay().getMetrics(outMetrics);
        params.width = outMetrics.widthPixels;
        params.gravity = Gravity.BOTTOM;
        window.setAttributes(params);
    }

    public void shareCopy(String url) {
        ClipboardManager myClipboard = (ClipboardManager) mContext.getSystemService(Context.CLIPBOARD_SERVICE);
        ClipData myClip = ClipData.newPlainText("text", url);
        myClipboard.setPrimaryClip(myClip);
        TUtils.showShortToast(mContext, "已复制到剪切板");
    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.dialog_share_sian:
                mOnNameChecked.onChecked(SHARE_MEDIA.SINA);
                break;
            case R.id.dialog_share_wechat:
                mOnNameChecked.onChecked(SHARE_MEDIA.WEIXIN);
                break;
            case R.id.dialog_share_wechat_moment:
                mOnNameChecked.onChecked(SHARE_MEDIA.WEIXIN_CIRCLE);
                break;
            case R.id.dialog_share_qq:
                mOnNameChecked.onChecked(SHARE_MEDIA.QQ);
                break;
            case R.id.dialog_share_qzone:
                mOnNameChecked.onChecked(SHARE_MEDIA.QZONE);
                break;
            case R.id.dialog_share_copy:
                shareCopy(url);
                break;
            case R.id.dialog_share_pic:
                //分享海报  需要shop_goods_id
                mOnNameChecked.onChecked(null);
                break;
            default:
                break;
        }
        cancel();
    }

    /**
     * 隐藏一个或多个，从0开始
     *
     * @param index
     */
    public void setGone(String... index) {
        for (int i = 0; i < index.length; i++) {
            if (views.get(index[i]) != null) {
                views.get(index[i]).setVisibility(View.GONE);
            }
        }
    }

}
