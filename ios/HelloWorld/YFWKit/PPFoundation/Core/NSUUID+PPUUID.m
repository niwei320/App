//
//  NSUUID+PPUUID.m
//  PP1717Wan
//
//  Created by yaofangwang on 14/11/24.
//  Copyright (c) 2014年 yaofangwang. All rights reserved.
//

#import "NSUUID+PPUUID.h"

NSString *const kPPUserDefaultsKeyUUID = @"kPPUserDefaultsKeyUUID";

@implementation NSUUID (PPUUID)

- (NSString *)pp_stableUUIDString {
    NSString *UUIDString = [[NSUserDefaults standardUserDefaults] objectForKey:kPPUserDefaultsKeyUUID];
    if (!UUIDString) {
        UUIDString = [self UUIDString];
        [[NSUserDefaults standardUserDefaults] setObject:UUIDString forKey:kPPUserDefaultsKeyUUID];
    }
    
    return UUIDString;
}

@end
