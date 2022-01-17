//
//  NSNumber+YFWAdd.h
//  YaoFang
//
//  Created by 姜明均 on 2017/5/24.
//  Copyright © 2017年 ospreyren. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface NSNumber (YFWAdd)

/**
 Creates and returns an NSNumber object from a string.
 Valid format: @"12", @"12.345", @" -0xFF", @" .23e99 "...
 
 @param string  The string described an number.
 
 @return an NSNumber when parse succeed, or nil if an error occurs.
 */
+ (nullable NSNumber *)numberWithString:(NSString *)string;


@end

NS_ASSUME_NONNULL_END
