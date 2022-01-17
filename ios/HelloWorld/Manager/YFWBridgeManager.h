//
//  YFWBridgeManager.h
//  HelloWorld
//
//  Created by NW-YFW on 2018/9/13.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTLog.h>
@interface YFWBridgeManager : NSObject<RCTBridgeModule>

-(void)navThirdMapWithLocation:(CLLocationCoordinate2D)endLocation andTitle:(NSString *)titleStr;

@end
