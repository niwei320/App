package com.yaofangwang.mall.widgtes.pullToRefresh;

import android.content.Context;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.view.animation.Animation;
import android.view.animation.RotateAnimation;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.yaofangwang.mall.R;


/**
 * The footer view for {@link com.markmao.pulltorefresh.widget.XListView} and
 * {@link com.markmao.pulltorefresh.widget.XScrollView}
 *
 * @author markmjw
 * @date 2013-10-08
 */
public class XFooterView extends LinearLayout {
    public final static int STATE_NORMAL = 0;
    public final static int STATE_READY = 1;
    public final static int STATE_LOADING = 2;
    public final static int STATE_GONE = 3;

    private final int ROTATE_ANIM_DURATION = 180;

    private View mLayout;

    private View mProgressBar;

    private TextView mHintView;

    private Animation mRotateUpAnim;
    private Animation mRotateDownAnim;

    private int mState = STATE_NORMAL;
    private TextView xfootLineLeft;
    private TextView xfootLineRight;

    public XFooterView(Context context) {
        super(context);
        initView(context);
    }

    public XFooterView(Context context, AttributeSet attrs) {
        super(context, attrs);
        initView(context);
    }

    private void initView(Context context) {
        mLayout = LayoutInflater.from(context).inflate(R.layout.vw_footer, null);
        mLayout.setLayoutParams(new LayoutParams(LayoutParams.MATCH_PARENT,
                LayoutParams.WRAP_CONTENT));
        addView(mLayout);

        mProgressBar = mLayout.findViewById(R.id.footer_progressbar);
        mHintView = (TextView) mLayout.findViewById(R.id.footer_hint_text);
        xfootLineLeft = (TextView) mLayout.findViewById(R.id.xfoot_line_left);
        xfootLineRight = (TextView) mLayout.findViewById(R.id.xfoot_line_right);

        mRotateUpAnim = new RotateAnimation(0.0f, 180.0f, Animation.RELATIVE_TO_SELF, 0.5f, Animation.RELATIVE_TO_SELF, 0.5f);
        mRotateUpAnim.setDuration(ROTATE_ANIM_DURATION);
        mRotateUpAnim.setFillAfter(true);

        mRotateDownAnim = new RotateAnimation(180.0f, 0.0f, Animation.RELATIVE_TO_SELF, 0.5f, Animation.RELATIVE_TO_SELF, 0.5f);
        mRotateDownAnim.setDuration(ROTATE_ANIM_DURATION);
        mRotateDownAnim.setFillAfter(true);
    }

    /**
     * Set footer view state
     *
     * @param state
     * @see #STATE_LOADING
     * @see #STATE_NORMAL
     * @see #STATE_READY
     */
    public void setState(int state) {
        xfootLineLeft.setVisibility(GONE);
        xfootLineRight.setVisibility(GONE);
        if (state == mState) return;
        switch (state) {
            case STATE_NORMAL:
                mHintView.setVisibility(View.VISIBLE);
                mHintView.setText("加载中...");
                mProgressBar.setVisibility(View.VISIBLE);

                xfootLineLeft.setVisibility(GONE);
                xfootLineRight.setVisibility(GONE);
                break;
            case STATE_READY://完成
                mHintView.setVisibility(View.VISIBLE);
                mHintView.setText("没有更多了");
                mProgressBar.setVisibility(View.GONE);

                xfootLineLeft.setVisibility(VISIBLE);
                xfootLineRight.setVisibility(VISIBLE);
                break;
            case STATE_LOADING:
                mProgressBar.setVisibility(View.VISIBLE);
                mHintView.setVisibility(View.VISIBLE);
                mHintView.setText("加载中...");

                xfootLineLeft.setVisibility(GONE);
                xfootLineRight.setVisibility(GONE);
                break;
            case STATE_GONE:
                mProgressBar.setVisibility(View.INVISIBLE);
                mHintView.setVisibility(View.INVISIBLE);
                mHintView.setText("");
                break;
        }
        mState = state;
    }

    /**
     * Set footer view bottom margin.
     *
     * @param margin
     */
    public void setBottomMargin(int margin) {
        if (margin < 0) return;
        LayoutParams lp = (LayoutParams) mLayout.getLayoutParams();
        lp.bottomMargin = margin;
        mLayout.setLayoutParams(lp);
    }

    /**
     * Get footer view bottom margin.
     *
     * @return
     */
    public int getBottomMargin() {
        LayoutParams lp = (LayoutParams) mLayout.getLayoutParams();
        return lp.bottomMargin;
    }

    /**
     * normal status
     */
    public void normal() {
        mHintView.setVisibility(View.VISIBLE);
        mProgressBar.setVisibility(View.GONE);
    }

    /**
     * loading status
     */
    public void loading() {
        mHintView.setVisibility(View.GONE);
        mProgressBar.setVisibility(View.VISIBLE);
    }

    /**
     * hide footer when disable pull load more
     */
    public void hide() {
        LayoutParams lp = (LayoutParams) mLayout.getLayoutParams();
        lp.height = 0;
        mLayout.setLayoutParams(lp);
    }

    /**
     * show footer
     */
    public void show() {
        LayoutParams lp = (LayoutParams) mLayout.getLayoutParams();
        lp.height = LayoutParams.WRAP_CONTENT;
        mLayout.setLayoutParams(lp);
    }

    public void getNodata() {
        mHintView.setVisibility(View.VISIBLE);
        mHintView.setText("就这么多了");
        mProgressBar.setVisibility(View.GONE);
    }

}
