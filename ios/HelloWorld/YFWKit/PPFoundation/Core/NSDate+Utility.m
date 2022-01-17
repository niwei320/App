//
//  NSDate+Utility.m
//  PP1717Wan
//
//  Created by yaofangwang on 15/1/12.
//  Copyright (c) 2015年 yaofangwang. All rights reserved.
//

#import "NSDate+Utility.h"

@implementation NSDate (Utility)

- (BOOL)pp_isSameDayWithDate:(NSDate *)date {
    NSDateFormatter *df = [[NSDateFormatter alloc] init];
    [df setDateFormat:@"yyyyMMdd"];
    
    return [[df stringFromDate:self] isEqualToString:[df stringFromDate:date]];
}

@end
