package com.yaofangwang.mall.onelogin;

/**
 * Created by 谷闹年 on 2019/4/1.
 */
public interface OneLoginResult {
    void onResult();
    void thirdOneLogin(String type, Boolean isLoginToUserCenter);

}
