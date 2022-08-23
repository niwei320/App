package com.yaofangwang.mall.Fragment;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ListView;

import com.yaofangwang.mall.MainActivity;
import com.yaofangwang.mall.R;
import com.yaofangwang.mall.TUtils.TUtils;
import com.yaofangwang.mall.adapter.NearlyListAdapterTcp;
import com.yaofangwang.mall.adapter._BaseAdapter;
import com.yaofangwang.mall.bean.NearShopBeanTcp;
import com.yaofangwang.mall.bean.ShopBeanHttp;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

@SuppressLint("ValidFragment")
public class FragmentNearlyList extends Fragment implements OnItemClickListener {
    public ListView mListView;
    _BaseAdapter mAdapter;
    int page = 0;
    private View mContentView;
    private List<NearShopBeanTcp.ResultBean> mTempShops = new ArrayList<>();
    public Handler uiHandler = new Handler(new Handler.Callback() {
        @Override
        public boolean handleMessage(Message msg) {
            if (!isAdded()) {
                return false;
            }
            switch (msg.what){
                case 0:
                    if (page == 0) {
                        mAdapter.removeAllData();
                    }
                    mAdapter.addDataList(mTempShops);
                    break;
                default:
                    break;

            }
            return false;
        }
    });

    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        if (null == mContentView) {
            mContentView = inflater.inflate(R.layout.fragment_nearlylist, container, false);
            mListView = (ListView) mContentView.findViewById(R.id.fragment_nearly_list_listview);
            mListView.setOnItemClickListener(this);
        } else {
            ViewGroup parent = (ViewGroup) mContentView.getParent();
            if (null != parent) {
                parent.removeView(mContentView);
            }
        }
        mAdapter = new NearlyListAdapterTcp(getActivity(), null);

        mListView.setAdapter(mAdapter);
        return mContentView;
    }

    public String getTime() {
        long currentTimeMillis = System.currentTimeMillis();
        return " " + TUtils.formatTime(currentTimeMillis) + new SimpleDateFormat(" HH:mm", Locale.CHINA).format(new Date());
    }

    @Override
    public void onResume() {
        super.onResume();
    }

    @Override
    public void onPause() {
        super.onPause();

    }

    /**
     * 这里的列表是增加的列表
     *
     * @param tempShops
     */
    public void onGetDataTcp(List<NearShopBeanTcp.ResultBean> tempShops) {
         mTempShops = tempShops;
         uiHandler.sendEmptyMessage(0);
    }

    public void onGetDataHttp(List<ShopBeanHttp> tempShops) {
        if (page == 0) {
            mAdapter.removeAllData();
        }
        mAdapter.addDataList(tempShops);
    }

    public void onError(String msg) {
        //TUtils.showShortCustomToast(getActivity(), msg, R.drawable.toast_n);
    }

    @Override
    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {

        NearShopBeanTcp.ResultBean bean = (NearShopBeanTcp.ResultBean) parent.getAdapter().getItem(position);
        ((MainActivity) getActivity()).startRN(bean.getId() + "");

        /*reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("shop_info", bean.getId());
        getActivity().finish();*/
        /*String shopID = bean.id;
        Intent intent = new Intent();
        intent.setAction(Intent.ACTION_VIEW);
        Uri uri = Uri.parse("demo2://demo2/abc/"+shopID);
        intent.setData(uri);
        startActivity(intent);*/

    }
}
