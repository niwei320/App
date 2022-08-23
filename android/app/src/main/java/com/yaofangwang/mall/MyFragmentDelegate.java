package com.yaofangwang.mall;

/**
 * Created by admin on 2018/12/17.
 */

import android.support.v4.app.DialogFragment;
import android.support.v4.app.Fragment;

/**
 * Created by yinqingyang on 2018/5/6.
 */

public interface MyFragmentDelegate {
    void push(Fragment fragment, String tag);
    void pop();
    void startRN(String params);
    void reactBack();
    void show(DialogFragment f, String tag);
}

