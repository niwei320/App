//
//  NSString+YFWContainstirng.m
//  YaoFang
//
//  Created by 胡舒舒 on 2017/6/7.
//  Copyright © 2017年 ospreyren. All rights reserved.
//

#import "NSString+YFWContainstirng.h"

@implementation NSString (YFWContainstirng)


- (BOOL)yfwContain:(NSString *)string
{
    for (int i=0; i<=self.length-string.length; i++) {
        
        NSString *str = [[self substringFromIndex:i] substringToIndex:string.length];
        if ([string isEqualToString:str]) {
            return YES;
        }
    }
    return NO;
}


@end
