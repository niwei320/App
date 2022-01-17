//
//  YFWQRCodeReaderManager.h
//  HelloWorld
//
//  Created by wei ni on 2018/9/21.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
@interface YFWQRCodeReaderManager : NSObject

@property (nonatomic, assign) BOOL isTCP;
- (instancetype)init;
- (void)showQRCodeReaderView:(RCTResponseSenderBlock)callback;
@end
