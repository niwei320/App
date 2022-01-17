//
//  YFDateTimeGetter.h
//  YaoFang
//
//  Created by 药房网 on 2018/5/8.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface YFDateTimeGetter : NSObject
+(long)getNowTimeTimestamp;
+(long)getTimestampFromDate: (NSDate *) date;
+ (NSDate *)returnToDay0Clock;
+ (NSDate *)returnToDay24Clock;
+(int)returnToWeekDays;
+(NSString *)weekInMonth;
+(NSString *)dayInWeek;
@end
