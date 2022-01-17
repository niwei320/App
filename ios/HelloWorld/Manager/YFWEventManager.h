//
//  YFWEventManager.h
//  HelloWorld
//
//  Created by yfw-姜明均 on 2018/9/27.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>


@interface YFWEventManager : RCTEventEmitter<RCTBridgeModule>

+ (void)emit:(NSString *)emitName Data:(NSDictionary *)data;

@end
