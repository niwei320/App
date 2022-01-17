//
//  NSObject+SafeObject.m
//  PP1717Wan
//
//  Created by yaofangwang on 14/11/3.
//  Copyright (c) 2014年 yaofangwang. All rights reserved.
//

#import "NSObject+SafeObject.h"

@implementation NSObject (SafeObject)

- (id)safeObjectWithClass:(Class)aClass {
    if ([self isKindOfClass:aClass]) {
        return self;
    }
    else
    {
        if (![self isKindOfClass:[NSNull class]]) {
            NSAssert(NO,
                     @"Object class not matched, self is %@, should be %@",
                     NSStringFromClass([self class]),
                     NSStringFromClass(aClass));
        }
        return nil;
    }
}

- (NSString *)safeString {
    if ([self isKindOfClass:[NSNumber class]])
    {
        return [NSString stringWithFormat:@"%@",[self safeNumber]];
    }
    return [self safeObjectWithClass:[NSString class]];
}

- (NSNumber *)safeNumber {
    return [self safeObjectWithClass:[NSNumber class]];
}

- (NSArray *)safeArray {
    return [self safeObjectWithClass:[NSArray class]];
}

- (NSDictionary *)safeDictionary {
    return [self safeObjectWithClass:[NSDictionary class]];
}


@end
