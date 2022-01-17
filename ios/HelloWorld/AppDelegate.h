/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import <UIKit/UIKit.h>

typedef void(^Back_Block)(void);

@interface AppDelegate : UIResponder <UIApplicationDelegate>

@property (nonatomic, strong) UIWindow *window;
@property (nonatomic, strong) UINavigationController *nav;
@property (nonatomic, copy) NSString *deviceTokenStr;
@property (nonatomic, copy) NSString *registerID;
@property (nonatomic, copy) NSString *scheme_url;
@property (nonatomic, strong) NSDictionary *notification_dic;
@property (nonatomic, strong) NSDictionary *threeTouch_dic;
@property (nonatomic, strong) NSDictionary *payResultInfo;
@property (nonatomic, assign) float latitude;
@property (nonatomic, assign) float longitude;
@property (nonatomic, copy) Back_Block back_block;

@property (nonatomic, assign) NSTimeInterval preGetTokenSuccessedTime;
@property (nonatomic, assign) NSInteger expireTime;
@property (nonatomic, copy) NSString *currentRNRouteInfo;
@property (nonatomic, strong) NSDictionary *erpUserInfo;
@property (nonatomic, strong) NSDictionary *systemConfigInfo;
+ (AppDelegate *)sharedInstances;
- (void)registBaiduManager;
- (void)closeSplashImage;
- (void)changeNavigation;
- (void)changeToMainVC;
- (float)getLat;
- (float)getLon;
- (YFWBaiduMapManager *)getBaiduManager;
- (void)hasPostExceptionMessage;
- (void)initSMSDK;
@end
