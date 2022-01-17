//
//  SobotManager.h
//  YaoFang
//
//  Created by 姜明均 on 17/3/7.
//  Copyright © 2017年 ospreyren. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface SobotManager : NSObject

@property (nonatomic, readonly) NSString *appKey;
@property (nonatomic, strong) NSDictionary *detail;
@property (nonatomic, strong) NSString *ssid;

+ (instancetype)getManager;

//注册
- (void)register:(UIApplication *)application delegate:(id)delegate;

//启动
- (void)startChatView:(UIViewController *)superVC;

//获取未读信息
- (void)getUnreadNumber:(UILabel *)label;

@end
