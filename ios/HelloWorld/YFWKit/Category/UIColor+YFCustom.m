//
//  UIColor+YFCustom.m
//  YaoFang
//
//  Created by yaofangwang on 15/1/21.
//  Copyright (c) 2015年 yaofangwang. All rights reserved.
//

#import "UIColor+YFCustom.h"

@implementation UIColor (YFCustom)

/**
 @brief 接近黑色的深色常用于文字
 */
+ (UIColor *)yf_darkTextColor {
    return PP_UIColor_RGB(68, 68, 68);
}
/**
 @brief 深灰色常用于文字,#666666
 */
+ (UIColor *)yf_darkGrayColor {
    return PP_UIColor_RGB(102, 102, 102);
}
/**
 @brief 浅灰色常用于文字,#999999
 */
+ (UIColor *)yf_lightGrayColor {
    return PP_UIColor_RGB(153, 153, 153);
}

/**
 @brief 接近黑色的深色常用于文字,#333333
 */
+ (UIColor *)yf_new_darkTextColor{

    return PP_UIColor_RGB(51, 51, 52);
}

/**
 @brief APP常用的分割线颜色
 */
+ (UIColor *)yf_separatorColor {
    return PP_UIColor_RGB(229, 229, 229);
}
/**
 @breif 常用的灰色色块背景色
 */
+ (UIColor *)yf_blockBGColor {
    return PP_UIColor_RGB(255, 250, 228);
}

+ (UIColor *)yf_blockBorderColor {
    return PP_UIColor_RGB(213, 189, 81);
}

+ (UIColor *)yf_tableBackColor {
    return PP_UIColor_RGB(239, 239, 244);
}

/**
 @breif 新版本APP中常用的绿色
 */
+ (UIColor *)yf_greenColor_new {
//    return PP_UIColor_RGB(25, 168, 45);
    return PP_UIColor_RGB(31, 219, 155);
}

+ (UIColor *)yf_lightGreenColor_new:(float) alpha {
    //    return PP_UIColor_RGB(25, 168, 45);
    return PP_UIColor_RGBA(31, 219, 155,alpha);
}
/**
 @breif 新版本APP中常用的灰色色
 */
+ (UIColor *)yf_grayColor_new {
    return PP_UIColor_RGB(240, 240, 240);
}

/**
 @breif APP中常用的绿色
 */
+ (UIColor *)yf_greenColor {
//    return PP_UIColor_RGB(13, 185, 94);
    return [UIColor yf_greenColor_new];
}
/**
 @breif APP中常用的粉色
 */
+ (UIColor *)yf_pinkColor {
    return PP_UIColor_RGB(251, 76, 94);
}
/**
 @breif APP中常用的橙色
 */
+ (UIColor *)yf_orangeColor {
    return PP_UIColor_RGB(255, 121, 32);
}

/**
 @breif APP中常用的红色
 */
+ (UIColor *)yf_redColor_new {
    return PP_UIColor_RGB(230, 9, 10);
}

/**
 @breif 新版APP中常用的橙色
 */
+ (UIColor *)yf_orangeColor_new {
    return PP_UIColor_RGB(255, 131, 100);
}

/**
 @breif 新版APP中常用的蓝色
 */
+ (UIColor *)yf_blueColor_new {
    return PP_UIColor_RGB(21, 116, 177);
}

/**
 @breif 新版APP中优惠券页面 常用的蓝色
 */
+ (UIColor *)yf_light_blueColor{
    return PP_UIColor_RGB(22, 110, 192);
}

/**
 @breif 新版APP中背景颜色
 */
+ (UIColor *)yf_backGroundColor{

    return PP_UIColor_RGB(245, 245, 245);
}

/**
 十六进制颜色

 @param color 颜色十六进制字符串
 @return 返回值
 */
+ (UIColor *) colorWithHexString: (NSString *)color
{
    NSString *cString = [[color stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]] uppercaseString];
    
    // String should be 6 or 8 characters
    if ([cString length] < 6) {
        return [UIColor clearColor];
    }
    // 判断前缀
    if ([cString hasPrefix:@"0X"])
        cString = [cString substringFromIndex:2];
    if ([cString hasPrefix:@"#"])
        cString = [cString substringFromIndex:1];
    if ([cString length] != 6)
        return [UIColor clearColor];
    // 从六位数值中找到RGB对应的位数并转换
    NSRange range;
    range.location = 0;
    range.length = 2;
    //R、G、B
    NSString *rString = [cString substringWithRange:range];
    range.location = 2;
    NSString *gString = [cString substringWithRange:range];
    range.location = 4;
    NSString *bString = [cString substringWithRange:range];
    // Scan values
    unsigned int r, g, b;
    [[NSScanner scannerWithString:rString] scanHexInt:&r];
    [[NSScanner scannerWithString:gString] scanHexInt:&g];
    [[NSScanner scannerWithString:bString] scanHexInt:&b];
    
    return [UIColor colorWithRed:((float) r / 255.0f) green:((float) g / 255.0f) blue:((float) b / 255.0f) alpha:1.0f];
}


@end
