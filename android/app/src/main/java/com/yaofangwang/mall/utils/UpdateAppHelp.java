package com.yaofangwang.mall.utils;

import android.app.Activity;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.support.annotation.NonNull;
import android.text.TextUtils;
import android.widget.Toast;

import com.android.volley.Response;
import com.google.gson.reflect.TypeToken;
import com.yaofangwang.mall.R;
import com.yaofangwang.mall.bean.VersionInfo;
import com.yaofangwang.mall.httpNet.Net;
import com.yaofangwang.mall.widgtes.TipsDialog;
import com.yaofangwang.mall.widgtes.TipsUpdateDialog;
import com.yaofangwang.mall.widgtes._BaseUpdateDialog;

import java.lang.ref.WeakReference;
import java.util.HashMap;

/**
 * Created by marti on 2018/7/3.
 * 更新APP帮助类
 */
public class UpdateAppHelp {
    private WeakReference<Activity> con;
    private VersionInfo versionInfo;

    public UpdateAppHelp(@NonNull Activity con) {
        if(con == null){
            throw new NullPointerException();
        }
        this.con = new WeakReference<Activity>(con);
    }

    public void checkeNewVersion(){
        HashMap<String, String> datas = new HashMap<>();
        datas.put("service", "app_update");
        Net.sendRequest(datas, new Response.Listener<VersionInfo>() {

            @Override
            public void onResponse(final VersionInfo versionInfo) {
                if (TextUtils.isEmpty(versionInfo.new_version)) {
                    TipsDialog.show(con.get(), con.get().getResources().getString(R.string.toast_no_version));
                } else {
                    update(versionInfo);
                }
            }
        }, new TypeToken<VersionInfo>() {
        }.getType());
    }

    /**
     * 更新
     * @param versionInfo
     */
    private void update(final VersionInfo versionInfo) { //版本信息
        this.versionInfo = versionInfo;
        final _BaseUpdateDialog baseUpdateDialog = TipsUpdateDialog.showUpdate(con.get(), versionInfo.update_desc, versionInfo.title).setRightButton("马上更新", new DialogInterface
                .OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                dialog.dismiss();
                //兼容8.0，如果是8.0并且没有授权过，就跳转授权，否则直接下载
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !con.get().getPackageManager().canRequestPackageInstalls()) {
                    Uri packageURI = Uri.parse("package:" + con.get().getPackageName());
                    Intent intent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, packageURI);
                    con.get().startActivityForResult(intent, myAsync.INSTALL_PREMISSION_CODE);
                } else {
                    new myAsync(con.get()).execute(versionInfo.update_url);
                }
            }
        });
        if ("1".equals(versionInfo.compulsively)) {// /强制更新
            baseUpdateDialog.setLeftGone();
        } else {
            baseUpdateDialog.setLeftButton("暂时不用", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    dialog.cancel();
                }
            });
        }
    }

    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (resultCode == Activity.RESULT_OK && requestCode == myAsync.INSTALL_PREMISSION_CODE) {
            /* 确认授权 */
            if (versionInfo != null) {
                new myAsync(con.get()).execute(versionInfo.update_url);
            }
        } else if (resultCode == Activity.RESULT_CANCELED && requestCode == myAsync.INSTALL_PREMISSION_CODE) {
            Toast.makeText(con.get(), "授权失败", Toast.LENGTH_SHORT).show();
        }
    }
}
