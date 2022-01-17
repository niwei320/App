//
//  NSString+Utility.h
//  PP1717Wan
//
//  Created by yaofangwang on 14/11/5.
//  Copyright (c) 2014年 yaofangwang. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSString (Utility)

#pragma mark - url
+ (NSString *)pp_URLStringWithBase:(NSString *)baseUrlStr params:(NSDictionary *)params;
- (NSDictionary *)pp_getUrlStrParams;
- (NSString *)pp_UTF8URLEncodeString;
- (NSString *)pp_UTF8URLDecodeString;

- (BOOL)pp_isPhoneNumber;
- (BOOL)pp_isEmail;
- (BOOL)pp_hasChinese;
- (BOOL)pp_isIDCard;
//判断是否为固话
- (BOOL)pp_isFixedTelephone;
//判断是否有emoji
- (BOOL)pp_containsEmoji;
//判断姓名格式
- (BOOL)pp_realName;

- (NSString *)pp_pinyinString;

//去除表情符号
- (NSString *)disable_emoji;

/**
 @brief 将timeInterval格式化为string，string的格式为 hh:mm:ss,当时间小于一小时时为mm:ss
 */
+ (NSString *)pp_timeStringWith:(NSTimeInterval)timeInterval;

/**
 @brief 返回date与现在时间的差，date为过去1分钟返回刚刚，大1分钟显示1分钟前，一小时内以此叠加，大于一小时显示1小时前，24小时内以此叠加，大于24小时返回 yyyy年MM月dd日 HH:ss
 */
+ (NSString *)pp_timeStringFromNowWith:(NSDate *)date;

@end
