package com.yaofangwang.mall.widgtes;

import android.app.Activity;
import android.content.Context;
import android.view.View;


/**
 * 提示对话框 Created by Shadow on 15/5/31.
 */
public class TipsDialog extends _BaseDialog {
    static TipsDialog dialog;
    Context mContext;

//    private TipsDialog(Context context, String title, String content) {
//        super(context, title);
//        mContext = context;
//        mTVContent.setGravity(Gravity.LEFT);
//        if (null == content) {
//            content = "";
//        }
//        setData(content, true);
//    }

    private TipsDialog(Context context, String content) {
        super(context, "");
        mContext = context;
        if (null == content) {
            content = "";
        }
        setData(content);
    }

    private TipsDialog(Context context, String title, String content, boolean flag) {
        super(context, title);
        mContext = context;
        if (null == content) {
            content = "";
        }
        setData(content);
    }

    @Override
    public View getView(Object data) {
        return null;
    }

    public static TipsDialog show(Context context, String content) {

        if (null != dialog && dialog.isShowing()) {
            if (((Activity) dialog.mContext).isFinishing()) {
                try {
                    dialog.cancel();
                } catch (Exception e) {
                    dialog = null;
                }
                dialog = null;
                show(context, content);
            }
        } else {
            Activity activity = (Activity) context;
            if (activity == null) {
                dialog = null;
            } else if (!activity.isFinishing()) {
                dialog = new TipsDialog(context, content);
                dialog.show();
                return dialog;
            } else {
                dialog = null;
            }
        }
        return dialog;
    }

    public static TipsDialog show(Context context, String title, String content) {

        if (null != dialog && dialog.isShowing()) {
            if (((Activity) dialog.mContext).isFinishing()) {
                try {
                    dialog.cancel();
                } catch (Exception e) {
                    dialog = null;
                }
                dialog = null;
                show(context, title, content);
            }
        } else {
            Activity activity = (Activity) context;
            if (activity == null) {
                dialog = null;
            } else if (!activity.isFinishing()) {
                dialog = new TipsDialog(context, title, content, true);
                dialog.show();
                return dialog;
            } else {
                dialog = null;
            }
        }
        return new TipsDialog(context, title, content, true);
    }

    public static TipsDialog showWithoutCancel(Context context, String title) {

        if (null != dialog && dialog.isShowing()) {
            if (((Activity) dialog.mContext).isFinishing()) {
                try {
                    dialog.cancel();
                } catch (Exception e) {
                    dialog = null;
                }
                dialog = null;
                showWithoutCancel(context, title);
            }
        } else {
            Activity activity = (Activity) context;
            if (activity == null) {
                dialog = null;
            } else if (!activity.isFinishing()) {
                dialog = new TipsDialog(context, title);
                dialog.setCancelable(false);
                dialog.show();
                return dialog;
            } else {
                dialog = null;
            }
        }
        return new TipsDialog(context, title);
    }
}
