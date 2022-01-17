//  JDPayDevice.h
//  JDPayFoundation
//
//  Created by dongkui on 06/21/18.
//  Copyright © 2018 dongkui. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreGraphics/CoreGraphics.h>

@interface JDPayDevice : NSObject

/**
 Get hardware type. e.g. iPhone8,1
 */
+ (NSString *)hardwareType;

@end

/**
 * Check if the device is jailbroken.
 */
extern BOOL JDPayDevice_isJailbreak(void);
