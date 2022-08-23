package com.yaofangwang.mall.widgtes;

import android.content.Context;
import android.text.TextUtils;

import com.yaofangwang.mall.R;

/**
 * 提示对话框
 */
public class TipsUpdateDialog extends _BaseUpdateDialog {

    private TipsUpdateDialog(Context context, String title, String content) {
        super(context, title);
        if (TextUtils.isEmpty(content)) {
            content = "";
        }
        setData(content);
    }

    public static TipsUpdateDialog showUpdate(Context context, String content) {
        TipsUpdateDialog dialog = new TipsUpdateDialog(context, context.getResources().getString(R.string.toast_levelup_prompt), content);
        dialog.setCancelable(true);
        dialog.setCanceledOnTouchOutside(false);
        dialog.show();
        return dialog;
    }

    public static TipsUpdateDialog showUpdate(Context context, String content, String title) {
        if (TextUtils.isEmpty(title)) {
            title = context.getResources().getString(R.string.toast_levelup_prompt);
        }
        TipsUpdateDialog dialog = new TipsUpdateDialog(context, title, content);
        dialog.setCancelable(true);
        dialog.setCanceledOnTouchOutside(false);
        dialog.show();
        return dialog;
    }
}
