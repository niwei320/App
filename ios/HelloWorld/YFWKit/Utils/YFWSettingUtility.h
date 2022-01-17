//
//  YFWSettingUtility.h
//  HelloWorld
//
//  Created by yfw-姜明均 on 2018/9/20.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface YFWSettingUtility : NSObject

//AppStore 页
+ (void)openRatingsPageInAppStore;

//AppStore 评论页
+ (void)toPraiseInAppStore;

//设置页面
+ (void)toSetting;

//获取网速
+ (NSString *)getNetworkSpeedString;

//网速测试
+(NSMutableDictionary *)getDataCounters;

//获取IP地址
+(NSString *)getIPAddress;

//定位
+ (BOOL)isLocationServiceOpen;

+ (NSString *)yfwDomain;

+ (NSMutableDictionary *)getURLParameters:(NSURL *)url;

+ (NSString *)URLDecodedString:(NSString *)str;


NSString * getSafeString(id object);


@end
