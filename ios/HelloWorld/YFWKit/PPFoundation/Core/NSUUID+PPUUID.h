//
//  NSUUID+PPUUID.h
//  PP1717Wan
//
//  Created by yaofangwang on 14/11/24.
//  Copyright (c) 2014年 yaofangwang. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSUUID (PPUUID)

/**
 @brief 返回一个固定UUID，在一个app中每次取值都相同，当删除重装是值会改变
 */
- (NSString *)pp_stableUUIDString;

@end
