//
//  NSURL+Utility.m
//  PP1717Wan
//
//  Created by yaofangwang on 14/12/19.
//  Copyright (c) 2014年 yaofangwang. All rights reserved.
//

#import "NSURL+Utility.h"
#import "NSString+Utility.h"

@implementation NSURL (Utility)

- (NSDictionary *)pp_getParams {
    @try {
        NSString *urlString = [self absoluteString];
        NSArray *components = [urlString componentsSeparatedByString:@"?"];
        NSArray *paramStrings = [[components objectAtIndex:1] componentsSeparatedByString:@"&"];
        NSMutableDictionary *params = [NSMutableDictionary dictionaryWithCapacity:[paramStrings count]];
        for (NSString *string in paramStrings) {
            components = [string componentsSeparatedByString:@"="];
            [params setObject:[[components objectAtIndex:1] pp_UTF8URLDecodeString]
                       forKey:[components objectAtIndex:0]];
        }
        
        return params;
    }
    @catch (NSException *exception) {
        return nil;
    }
}

@end
