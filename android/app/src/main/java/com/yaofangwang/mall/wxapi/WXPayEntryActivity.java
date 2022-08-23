package com.yaofangwang.mall.wxapi;

import android.content.Intent;
import android.os.Bundle;
import android.support.v4.content.LocalBroadcastManager;
import android.support.v7.app.AppCompatActivity;

import com.tencent.mm.opensdk.constants.ConstantsAPI;
import com.tencent.mm.opensdk.modelbase.BaseReq;
import com.tencent.mm.opensdk.modelbase.BaseResp;
import com.tencent.mm.opensdk.openapi.IWXAPI;
import com.tencent.mm.opensdk.openapi.IWXAPIEventHandler;
import com.tencent.mm.opensdk.openapi.WXAPIFactory;
import com.yaofangwang.mall.Consts;


/**
 * 支付页面，因微信的特殊性，必须要在这个页面调起，所以其他的支付方式也只能写在这里
 * TODO 支付的方式改变，支付的埋点也需要改
 */
public class WXPayEntryActivity extends AppCompatActivity implements IWXAPIEventHandler {
    //微信回调广播Action
    public static final String ACTION_WX_PAY = "action.wx.pay";
    //广告取值的KEY
    public static final String WX_PAY_RESULT_CODE = "WX_PAY_RESULT_CODE";

    private IWXAPI msgApi;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        msgApi = WXAPIFactory.createWXAPI(this, null);
        msgApi.handleIntent(getIntent(), this);
        msgApi.registerApp(Consts.weixinpara.APP_ID);
    }

    /**
     * 微信回调会采用singleTop的启动方式，所以会在这里接收参数
     *
     * @param intent
     */
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        msgApi.handleIntent(intent, this);
    }

    @Override
    public void onReq(BaseReq req) {

    }

    @Override
    public void onResp(BaseResp baseResp) {
        if (baseResp.getType() == ConstantsAPI.COMMAND_PAY_BY_WX) {
            sendPayResultBroadcast(baseResp.errCode);
        }
    }

    /**
     * 发送微信支付结果的本地广播
     * 本地广播比全局广播效率高，更安全
     * <p>
     * 接收者请参考：
     * http://www.cnblogs.com/trinea/archive/2012/11/09/2763182.html
     *
     * @param resultCode
     */
    private void sendPayResultBroadcast(int resultCode) {
        LocalBroadcastManager broadcastManager = LocalBroadcastManager.getInstance(getApplicationContext());
        Intent payResult = new Intent();
        payResult.setAction(ACTION_WX_PAY);
        payResult.putExtra(WX_PAY_RESULT_CODE, resultCode);
        broadcastManager.sendBroadcast(payResult);
        finish();
    }
}
