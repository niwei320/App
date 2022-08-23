package android.support.v4.app;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.widget.TextView;
import android.widget.Toast;

import com.yaofangwang.mall.R;
import com.yaofangwang.mall.bean.VersionInfo;
import com.yaofangwang.mall.utils.myAsync;

import static android.app.Activity.RESULT_CANCELED;
import static android.app.Activity.RESULT_OK;

/**
 * Created by marti on 2018/12/20.
 */

public class UploadApkFragment extends DialogFragment implements View.OnClickListener {
    private TextView contentTv, uploadTv, cancelTv;
    private View root;
    private VersionInfo versionInfo;

    public static UploadApkFragment newInstance(VersionInfo info) {
        UploadApkFragment f = new UploadApkFragment();
        Bundle bundle = new Bundle();
        bundle.putSerializable("info",info);
        f.setArguments(bundle);
        return f;
    }

    @Override
    public void onAttach(Context context) {
        super.onAttach(context);
        try{
            versionInfo = (VersionInfo) getArguments().getSerializable("info");
        }catch (Exception e){

        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        getDialog().requestWindowFeature(Window.FEATURE_NO_TITLE);
        root = LayoutInflater.from(getActivity()).inflate(R.layout.fragment_upload_apk, null);
        initViews();
        setData();
        return root;
    }

    private void setData() {
        if(versionInfo != null){
            if("1".equals(versionInfo.compulsively)){
                this.setCancelable(false);
                cancelTv.setVisibility(View.GONE);
            }else{
                this.setCancelable(true);
                cancelTv.setVisibility(View.VISIBLE);
            }
            contentTv.setText(versionInfo.update_desc);
        }
    }

    private void initViews() {
        contentTv = root.findViewById(R.id.contentTv);
        uploadTv = root.findViewById(R.id.uploadTv);
        cancelTv = root.findViewById(R.id.cancelTv);
        uploadTv.setOnClickListener(this);
        cancelTv.setOnClickListener(this);
    }

    @Override
    public void onStart() {
        super.onStart();
        Window window = getDialog().getWindow();
        WindowManager.LayoutParams params = window.getAttributes();
        params.gravity = Gravity.CENTER;
        params.width = WindowManager.LayoutParams.WRAP_CONTENT;
        params.height = WindowManager.LayoutParams.WRAP_CONTENT;
        window.setAttributes(params);
        window.setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
    }

    @Override
    public void show(FragmentManager manager, String tag) {
        mDismissed = false;
        mShownByMe = true;
        FragmentTransaction ft = manager.beginTransaction();
        ft.add(this, tag);
        ft.commitAllowingStateLoss();
    }

    @Override
    public void dismiss() {
        dismissAllowingStateLoss();
    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.uploadTv://更新
                //兼容8.0，如果是8.0并且没有授权过，就跳转授权，否则直接下载
                download();
                break;
            case R.id.cancelTv://取消
                dismiss();
                break;
        }
    }

    /**
     * 操作结果处理
     * @param requestCode
     * @param resultCode
     * @param data
     */
    private void uploadReuslt(int requestCode, int resultCode, Intent data) {
        if (resultCode == RESULT_OK && requestCode == myAsync.INSTALL_PREMISSION_CODE) {
            /**
             * 确认授权，如果是7.0 8.0的那些，没有授权允许安装未知来源应用的话，授权后会在这里收到结果
             * 那么久可以直接去更新了，不需要用户再按确定更新之类的操作
             */
            if (versionInfo != null) {
                download();
            }
        } else if (resultCode == RESULT_CANCELED && requestCode == myAsync.INSTALL_PREMISSION_CODE) {
            /**
             * 取消授权，取消授权的话不区分是否强制更新，反正Dialog判断过是否可以取消，强制不可取消，普通可以取消
             */
            Toast.makeText(getActivity(), "取消授权", Toast.LENGTH_SHORT).show();
        } else if (resultCode == 0 && requestCode == myAsync.INSTALL_CANCLE_CODE) {
            /**
             * 取消安装，和取消授权一样的操作。不过如果他退出APP再进来的话就要重新下载了，没有做断点续传和本地缓存
             */
        }
    }

    /**
     * 下载，不过下载之前先判断是否授权了未知来源，先授权再下载
     * 如果下载后安装前跳转授权的话，感觉不是很友好
     */
    private void download(){
        if(getActivity().getApplicationInfo().targetSdkVersion>=Build.VERSION_CODES.O){
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !getActivity().getPackageManager().canRequestPackageInstalls()) {
                Uri packageURI = Uri.parse("package:" + getActivity().getPackageName());
                Intent intent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, packageURI);
                startActivityForResult(intent, myAsync.INSTALL_PREMISSION_CODE);
            }else{
                new myAsync(getActivity()).execute(versionInfo.update_url);
            }
        } else {
            new myAsync(getActivity()).execute(versionInfo.update_url);
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        uploadReuslt(requestCode,resultCode,data);
    }
}
