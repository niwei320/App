//
//  UIDevice+Utility.m
//  PP1717Wan
//
//  Created by yaofangwang on 14/11/12.
//  Copyright (c) 2014年 yaofangwang. All rights reserved.
//

#import "UIDevice+Utility.h"

@implementation UIDevice (Utility)

+ (BOOL)pp_isPad {
    return (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad);
}

+ (BOOL)pp_isPhone {
    return (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPhone);
}

+ (BOOL)pp_isIOSVersionAbove8 {
    return floor(NSFoundationVersionNumber) > NSFoundationVersionNumber_iOS_7_1;
}

@end
