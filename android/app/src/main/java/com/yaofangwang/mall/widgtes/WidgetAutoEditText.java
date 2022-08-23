package com.yaofangwang.mall.widgtes;

import android.content.Context;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.AttributeSet;
import android.view.KeyEvent;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.PopupWindow;
import android.widget.TextView;
import android.widget.TextView.OnEditorActionListener;

import com.yaofangwang.mall.R;
import com.yaofangwang.mall.adapter.AutoAdapter;

public class WidgetAutoEditText extends LinearLayout {

    public WidgetAutoEditText(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    public WidgetAutoEditText(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public WidgetAutoEditText(Context context) {
        super(context);

    }

    ListView mAutoList;
    PopupWindow mPop;
    EditText mEdit;
    AutoAdapter mAutoAdapter;
    View mContentView;
    View mSearchBtn;
    View mDelBtn;

    private void init() {
        mContentView =  inflate(getContext(), R.layout.widget_auto_edittext, this);
        mEdit = (EditText) mContentView.findViewById(R.id.widget_auto_edittext_edit);
        mEdit.setSingleLine(true);
        mEdit.setOnEditorActionListener(new OnEditorActionListener() {

            @Override
            public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
                if (actionId == EditorInfo.IME_ACTION_SEARCH || (event != null && event.getKeyCode() == KeyEvent.KEYCODE_ENTER)) {
                    if (null != mAutoListener) {
                        mAutoListener.onStartRequest(getText());
                    }
                    return true;
                }
                return false;
            }
        });

        mSearchBtn = mContentView.findViewById(R.id.widget_auto_edittext_btn);
        mDelBtn = mContentView.findViewById(R.id.widget_auto_edittext_del);
        mDelBtn.setVisibility(View.GONE);
        mDelBtn.setOnClickListener(new OnClickListener() {

            @Override
            public void onClick(View v) {
                mEdit.setText("");
            }
        });
        initAutoTextView();
    }

    public void setText(String text) {
        mEdit.setText(text);
        mEdit.setSelection(mEdit.length());
    }

    public String getText() {
        return mEdit.getText().toString();
    }

    public void setSearchVisible(boolean isVisible) {
        if (isVisible) {
            mSearchBtn.setVisibility(View.VISIBLE);
        } else {
            mSearchBtn.setVisibility(View.GONE);
        }
    }

    private void initAutoTextView() {
//        View contentView = LayoutInflater.from(getContext()).inflate(R.layout.view_pop_layout, this, false);
//        mAutoList = (ListView) contentView.findViewById(R.id.view_pop_list);
//        mPop = new PopupWindow(contentView, LayoutParams.WRAP_CONTENT, TUtils.dp2px(getContext(), 200), false);
//        mPop.setBackgroundDrawable(getResources().getDrawable(R.color.color_apptran));
//        mPop.setOutsideTouchable(true);
//        mAutoAdapter = new AutoAdapter(getContext());
//        mAutoList.setAdapter(mAutoAdapter);
        mEdit.addTextChangedListener(new TextWatcher() {

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
            }

            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void afterTextChanged(Editable s) {
                String text = s.toString();
                if (s.toString().length() > 0) {
                    mDelBtn.setVisibility(View.VISIBLE);
                } else {
                    mDelBtn.setVisibility(View.GONE);
                }
                if (null != mAutoListener) {
                    mAutoListener.onTextChanged(text);
                }
            }
        });
//        mAutoList.setOnItemClickListener(new OnItemClickListener() {
//
//            @Override
//            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
//                mEdit.setText(parent.getItemAtPosition(position).toString());
//                mEdit.setSelection(mEdit.getText().length());
//                mPop.dismiss();
//                if (null != mAutoListener) {
//                    mAutoListener.onStartRequest(parent.getItemAtPosition(position).toString());
//                }
//            }
//        });
    }

    IAutoListener mAutoListener;

    public void setAutoListener(IAutoListener autoListener) {
        this.mAutoListener = autoListener;
    }

    public void startRequest() {
        if (null != mAutoListener && null != getText()) {
            mAutoListener.onStartRequest(getText());
        }
    }

//    public void setData(List<String> datas) {
//        mAutoAdapter.setDatas(datas);
//        if (datas.size() > 0) {
//            mAutoAdapter.setDatas(datas);
//            mPop.setWidth(getWidth());
//            int maxHeight = TUtils.dp2px(getContext(), 200);
//            if (mPop.getHeight() > maxHeight) {
//                mPop.setHeight(maxHeight);
//            }
//            mPop.showAsDropDown(this, TUtils.dp2px(getContext(), 5), 0);
//        } else {
//            mPop.dismiss();
//        }
//    }

    public void setHint(int id) {
        mEdit.setHint(id);
    }

    public interface IAutoListener {
        public void onTextChanged(String text);

        public void onStartRequest(String text);
    }

}
