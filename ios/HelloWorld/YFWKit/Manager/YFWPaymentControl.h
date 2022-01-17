//
//  YFWPaymentControl.h
//  HelloWorld
//
//  Created by yfw-姜明均 on 2018/9/26.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface YFWPaymentControl : NSObject

@property (nonatomic, copy) void(^paySuccedBlock)();

- (void)paymentMethod:(NSDictionary *)data Type:(NSString *)type isTCP:(BOOL)istcp;

@end
