//
//  UIColor+YFCustom.h
//  YaoFang
//
//  Created by yaofangwang on 15/1/21.
//  Copyright (c) 2015年 yaofangwang. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface UIColor (YFCustom)

/**
 @brief 接近黑色的深色常用于文字
 */
+ (UIColor *)yf_darkTextColor;
/**
 @brief 深灰色常用于文字,#666666
 */
+ (UIColor *)yf_darkGrayColor;
/**
 @brief 浅灰色常用于文字,#999999
 */
+ (UIColor *)yf_lightGrayColor;

/**
 @brief 接近黑色的深色常用于文字,#333333
 */
+ (UIColor *)yf_new_darkTextColor;

/**
 @brief APP常用的分割线颜色
 */
+ (UIColor *)yf_separatorColor;

/**
 @breif 常用的土黄色色块背景色
 */
+ (UIColor *)yf_blockBGColor;

/**
 @brief 土黄色色块边框颜色
 */
+ (UIColor *)yf_blockBorderColor;

//表格全局颜色
+ (UIColor *)yf_tableBackColor;

/**
 @breif APP中常用的绿色
 */
+ (UIColor *)yf_greenColor;
/**
 @breif APP中常用的粉色
 */
+ (UIColor *)yf_pinkColor;
/**
 @breif APP中常用的橙色
 */
+ (UIColor *)yf_orangeColor;

/**
 @breif 新版本APP中常用的绿色
 */
+ (UIColor *)yf_greenColor_new;
+ (UIColor *)yf_lightGreenColor_new:(float) alpha;
/**
 @breif 新版本APP中常用的灰色色
 */
+ (UIColor *)yf_grayColor_new;

/**
 @breif 新版APP中常用的橙色
 */
+ (UIColor *)yf_orangeColor_new;

/**
 @breif APP中常用的红色
 */
+ (UIColor *)yf_redColor_new;

/**
 @breif 新版APP中常用的蓝色
 */
+ (UIColor *)yf_blueColor_new;

/**
 @breif 新版APP中优惠券页面 常用的蓝色
 */
+ (UIColor *)yf_light_blueColor;

/**
 @breif 新版APP中背景颜色
 */
+ (UIColor *)yf_backGroundColor;
/**
 十六进制颜色
 
 @param color 颜色十六进制字符串
 @return 返回值
 */
+ (UIColor *) colorWithHexString: (NSString *)color;
@end
