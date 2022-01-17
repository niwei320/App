//
//  YFDateTimeGetter.m
//  YaoFang
//
//  Created by 药房网 on 2018/5/8.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import "YFDateTimeGetter.h"

@implementation YFDateTimeGetter
+(NSDateComponents *)getDateComponents{
    NSDate *datenow = [NSDate date];//现在时间,你可以输出来看下是什么格式
    //取得系统时间
    NSCalendar *calendar = [[NSCalendar alloc] initWithCalendarIdentifier:NSCalendarIdentifierGregorian];
    [calendar setFirstWeekday:2];
    NSDateComponents *components = [[NSDateComponents alloc] init];
    NSInteger unitFlags = NSCalendarUnitEra |
    NSCalendarUnitYear |
    NSCalendarUnitMonth |
    NSCalendarUnitDay |
    NSCalendarUnitHour |
    NSCalendarUnitMinute |
    NSCalendarUnitSecond |
    NSCalendarUnitWeekday |
    NSCalendarUnitWeekdayOrdinal |
    NSCalendarUnitQuarter |
    NSCalendarUnitWeekOfMonth |
    NSCalendarUnitWeekOfYear |
    NSCalendarUnitYearForWeekOfYear |
    NSCalendarUnitNanosecond |
    NSCalendarUnitCalendar |
    NSCalendarUnitTimeZone;
    components = [calendar components:unitFlags fromDate:datenow];
    return components;
}
+(NSString *)weekInMonth{
    return [NSString stringWithFormat:@"%ld",(long)[self getDateComponents].weekdayOrdinal];
}
+(NSString *)dayInWeek{
    return [NSString stringWithFormat:@"%ld",(long)[self getDateComponents].day];
}


+(long)getNowTimeTimestamp{

    NSDate *datenow = [NSDate date];//现在时间,你可以输出来看下是什么格式
    
    return (long)[datenow timeIntervalSince1970];
}
+(long)getTimestampFromDate: (NSDate *) date{
    return (long)[date timeIntervalSince1970];
}
//获取当天0点时间
+ (NSDate *)returnToDay0Clock
{
    NSDate *now = [NSDate date];
    NSCalendar *calender = [NSCalendar currentCalendar];
    NSUInteger unitFlags = NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay | NSCalendarUnitHour | NSCalendarUnitMinute | NSCalendarUnitSecond;
    NSDateComponents *dateComponent = [calender components:unitFlags fromDate:now];
    int hour = (int)[dateComponent hour];
    int minute = (int)[dateComponent minute];
    int second = (int)[dateComponent second];
    //当前时分秒:hour,minute,second
    //返回当前时间(hour * 3600 + minute * 60 + second)之前的时间,即为今天凌晨0点
    NSDate *nowDay = [NSDate dateWithTimeIntervalSinceNow: - (hour * 3600 + minute * 60 + second)];
    long long inter = [nowDay timeIntervalSince1970] * 1000;
    NSDate *newDate = [NSDate dateWithTimeIntervalSince1970:inter / 1000];
    return newDate;
}

//获取当天24点时间
+ (NSDate *)returnToDay24Clock
{
    NSDate *now = [NSDate date];
    NSCalendar *calender = [NSCalendar currentCalendar];
    NSUInteger unitFlags = NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay | NSCalendarUnitHour | NSCalendarUnitMinute | NSCalendarUnitSecond;
    NSDateComponents *dateComponent = [calender components:unitFlags fromDate:now];
    int hour = (int)[dateComponent hour];
    int minute = (int)[dateComponent minute];
    int second = (int)[dateComponent second];
    //一天是60分钟 * 60秒 * 24小时 = 86400秒
    NSDate *nextDay = [NSDate dateWithTimeIntervalSinceNow: - (hour * 3600 + minute * 60 + second) + 86400];
    return nextDay;
}
//获取距离周末的天数
+(int)returnToWeekDays{
    NSDate*date = [NSDate date];
    NSCalendar*calendar = [NSCalendar currentCalendar];
    NSDateComponents*comps;
    comps =[calendar components:(NSCalendarUnitWeekday |NSCalendarUnitWeekdayOrdinal) fromDate:date];
    NSInteger weekday = [comps weekday]; // 星期几（注意，周日是“1”，周一是“2”。。。。）
    switch (weekday) {
        case 2:
            return  6;
        case 3:
            return 5;
        case 4:
            return 4;
        case 5:
            return 3;
        case 6:
            return 2;
        case 7:
            return 1;
        default:
            return 0;
    }
}
@end
