//
//  NSObject+SafeObject.h
//  PP1717Wan
//
//  Created by yaofangwang on 14/11/3.
//  Copyright (c) 2014年 yaofangwang. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSObject (SafeObject)

/**
 @brief 如果此对象是aClass则返回self，否则返回nil，
 */
- (id)safeObjectWithClass:(Class)aClass;

/**
 @brief 如果此对象是NSString则返回self，否则返回nil，
 */
- (NSString *)safeString;

/**
 @brief 如果此对象是NSNumber则返回self，否则返回nil，
 */
- (NSNumber *)safeNumber;

/**
 @brief 如果此对象是NSArray则返回self，否则返回nil，
 */
- (NSArray *)safeArray;

/**
 @brief 如果此对象是NSDictionary则返回self，否则返回nil，
 */
- (NSDictionary *)safeDictionary;

@end
