package com.yaofangwang.mall.onelogin;

import com.facebook.react.bridge.Callback;

public interface StartOneLogin {
    void  startOneLogin(Boolean isLoginToUserCenter, Callback successCallback, Callback errorCallback);
}
