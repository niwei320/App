/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import <RCTJPushModule.h>
#ifdef NSFoundationVersionNumber_iOS_9_x_Max
#import <UserNotifications/UserNotifications.h>
#endif


#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <AlipaySDK/AlipaySDK.h>
#import <JDPay/JDPay.h>
#import <JDPay/JDPayJSONUtils.h>
#import <React/RCTLinkingManager.h>
#import "WXApi.h"
#import "YFWEventManager.h"
#import "YFWReachability.h"
#import "YFWMedicineBPManager.h"
#import "YFWFindCodeViewController.h"
#import <OneLoginSDK/OneLoginSDK.h>
// 如果需要使用idfa功能所需要引入的头文件（可选）
#import <AdSupport/AdSupport.h>
#import "SmAntiFraud.h"
#ifdef RunOnMobile
#import <SobotKit/SobotKit.h>
#import "SobotManager.h"
#import "JANALYTICSService.h"
#endif
#import <React/RCTAssert.h>

#import "IQKeyboardManager.h"
#import <UMCommonLog/UMCommonLogManager.h>

#ifndef dispatch_queue_async_safe
#define dispatch_queue_async_safe(queue, block)\
if (dispatch_queue_get_label(DISPATCH_CURRENT_QUEUE_LABEL) == dispatch_queue_get_label(queue)) {\
block();\
} else {\
dispatch_async(queue, block);\
}
#endif

#ifndef dispatch_main_async_safe
#define dispatch_main_async_safe(block) dispatch_queue_async_safe(dispatch_get_main_queue(), block)
#endif
static AppDelegate *yfwAppDelegate;
@interface AppDelegate ()<WXApiDelegate,JPUSHRegisterDelegate>


@property (nonatomic, strong) YFWBaiduMapManager *baiduManager;
@property (nonatomic, strong) NSDictionary *launchOptionsLocal;
@property (nonatomic, strong) UIImageView *splashImage;

@property (nonatomic, strong) RCTRootView *rnRootView;
@end

@implementation AppDelegate

+ (AppDelegate *)sharedInstances
{
  AppDelegate *appdelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  return appdelegate;
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  yfwAppDelegate = self;
  //设置默认值
  NSString *domain = getSafeString([[NSUserDefaults standardUserDefaults] stringForKey:@"yfwDomain"]);
  if (domain.length == 0) {
    [[NSUserDefaults standardUserDefaults] setObject:[YFWSettingUtility yfwDomain] forKey:@"yfwDomain"];
  }
  
  NSString *tcp_host = getSafeString([[NSUserDefaults standardUserDefaults] stringForKey:@"yfwTcpHost"]);
  if (tcp_host.length == 0) {
    [[NSUserDefaults standardUserDefaults] setObject:@"app.yaofangwang.com" forKey:@"yfwTcpHost"];
  }
  
  NSInteger tcp_port = [[NSUserDefaults standardUserDefaults] integerForKey:@"yfwTcpPort"];
  if (tcp_port == 0) {
    [[NSUserDefaults standardUserDefaults] setInteger:18280 forKey:@"yfwTcpPort"];
  }

  
  NSInteger tcp_image_port = [[NSUserDefaults standardUserDefaults] integerForKey:@"yfwTcpImagePort"];
  if (tcp_image_port == 0) {
    [[NSUserDefaults standardUserDefaults] setInteger:18580 forKey:@"yfwTcpImagePort"];
  }
  self.launchOptionsLocal = launchOptions;
  [self configThirdRegist:application];
  [self configureJPushNotification:launchOptions];
  [self addNetworkChangeNotification];
  NSSetUncaughtExceptionHandler(&UncaughtExceptionHandler);
  [self hasPostExceptionMessage];
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  // 首先判断是否支持3DTouch
  if(self.window.traitCollection.forceTouchCapability == UIForceTouchCapabilityAvailable)
  {
    [self createApp3DTouch];
  }
//  [self RCTRootViewToWindow:launchOptions];
  
  [self rootViewController_new:launchOptions];
  [self.window makeKeyAndVisible];
  
  [self dealJSCrashHandler];
  
  return YES;
}


- (void)rootViewController_new:(NSDictionary *)launchOptions{
  
  __weak typeof(self)weakSelf = self;
  YFWFindCodeViewController *vc = [[YFWFindCodeViewController alloc] init];
  vc.doneBlock = ^{
    dispatch_main_async_safe(^{
      [weakSelf RCTRootViewToWindow:launchOptions];
    });
  };
  self.window.rootViewController = vc;
  
}

- (void)RCTRootViewToWindow:(NSDictionary *)launchOptions{
  
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.title = @"RNRoot";
  _nav=[[UINavigationController alloc]initWithRootViewController:rootViewController];
  //禁止侧滑返回（智齿）
  if([_nav respondsToSelector:@selector(interactivePopGestureRecognizer)]) {
    _nav.interactivePopGestureRecognizer.enabled = NO;
  }
  [_nav.navigationBar setTintColor:[UIColor yf_darkGrayColor]];
  _nav.navigationBarHidden = YES;
  
  RCTRootView *rootView = [self configReactNative:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
  rootViewController.view = rootView;
  
}

-(YFWBaiduMapManager *)getBaiduManager{
  return _baiduManager;
}
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(nullable NSString *)sourceApplication annotation:(id)annotation
{
    NSMutableDictionary *options = [NSMutableDictionary dictionaryWithCapacity:2];
    if (sourceApplication != nil) {
        options[UIApplicationOpenURLOptionsSourceApplicationKey] = sourceApplication;
    }
    if (annotation != nil) {
        options[UIApplicationOpenURLOptionsAnnotationKey] = annotation;
    }
    
    return [self application:application openURL:url options:options];
}
- (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  NSString *urlstring = [NSString stringWithFormat:@"%@",url.description];
  
  //用户安装支付宝App ， 支付结果在这里回调
  if ([url.host isEqualToString:@"safepay"]) {
    
    if ([urlstring yfwContain:@"AUTHACCOUNT"]) {
      [[AlipaySDK defaultService] processAuthResult:url
                                    standbyCallback:^(NSDictionary *resultDic) {
                                      
                                      
                                    }];
    }else
    {
      [[AlipaySDK defaultService]
       processOrderWithPaymentResult:url
       standbyCallback:^(NSDictionary *resultDic) {
         NSLog(@"result = %@",resultDic);
         
         NSString *status = getSafeString([resultDic objectForKey:@"resultStatus"]);
         if ([status isEqualToString:@"9000"])
         {
           [[NSNotificationCenter defaultCenter] postNotificationName:@"PaySuccess" object:nil];
           
           self.payResultInfo = @{@"result":@(true),@"type":@"ali"};
         }
         else
         {
           self.payResultInfo = @{@"result":@(false),@"type":@"ali"};
           [[NSNotificationCenter defaultCenter] postNotificationName:@"payFailed" object:nil];
         }
         
       }];
    }
    
  }else if ([url.host isEqualToString:@"authplatformapi"]) {
    
    [[AlipaySDK defaultService] processAuthResult:url
                                  standbyCallback:^(NSDictionary *resultDic) {
                                    
                                    
                                  }];
    
  } else if ([JDPayModule canHandleURL:url options:options]) {
    [JDPayModule handleURL:url
                   options:options
         completionHandler:^(NSDictionary * __nullable results, BOOL handled) {
          if (!results) {
            return;
          }
          NSString *payStatus = results[@"payStatus"];
          if ([payStatus isEqualToString:@"JDP_PAY_SUCCESS"]) {
            self.payResultInfo = @{@"result":@(true),@"type":@"jd"};
          } else {
            self.payResultInfo = @{@"result":@(false),@"type":@"jd"};
          }
         }];
    return YES;
  } else if ([url.host isEqualToString:@"jdpauthjdjr111702124001"]) {
    [urlstring componentsSeparatedByString:@"payStatus"];
    if ([urlstring containsString:@"JDP_PAY_SUCCESS"]) {
      self.payResultInfo = @{@"result":@(true),@"type":@"jd"};
    } else {
      self.payResultInfo = @{@"result":@(false),@"type":@"jd"};
    };
  }  else if ([url.host isEqualToString:@"pay"]) {
    
    if (urlstring.length>3) {
      NSString *symbolSina = [[urlstring substringFromIndex:0] substringToIndex:3];
      if ([symbolSina isEqualToString:@"wx2"]) {
        
        return [WXApi handleOpenURL:url delegate:self];
        
      }
    }
    
  }else if([urlstring yfwContain:@"yaofangwang://"]){
    
    if (self.nav.childViewControllers.count == 1||self.nav.childViewControllers.count == 0) {
      [YFWEventManager emit:@"SCHEME_ACTION" Data:@{@"url":[url absoluteString]}];
      self.scheme_url = [url absoluteString];
    }
    return YES;
  } else{
    //*****链接回调*****
    return  [[UMSocialManager defaultManager] handleOpenURL:url options:options];
  }
  
  return NO;
}

- (BOOL)application:(UIApplication *)application handleOpenURL:(NSURL *)url
{
  
  //*****链接回调*****
  return  [[UMSocialManager defaultManager] handleOpenURL:url];

}
- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
  NSString *webPageURLStr = userActivity.webpageURL.absoluteString;

  if ([webPageURLStr containsString:@"pay"]) {
    
    return [WXApi handleOpenUniversalLink:userActivity delegate:self];
  }
  NSString *yfwUnlikURLStr = @"https://m.yaofangwang.com/";
  if ([userActivity.activityType isEqualToString:NSUserActivityTypeBrowsingWeb] && ([webPageURLStr hasPrefix:yfwUnlikURLStr])) {
    NSString *detailStr = [webPageURLStr substringFromIndex:yfwUnlikURLStr.length];
    NSArray *infos = [detailStr componentsSeparatedByString:@"-"];
    if (infos.count >= 2) {
      NSArray *routes = @[
        @{@"name":@"detail",@"routeType":@"get_shop_goods_detail"},
        @{@"name":@"medicine",@"routeType":@"get_goods_detail"},
        @{@"name":@"catalog",@"routeType":@"get_category"},
      ];
      NSString *type = infos[0];
      NSString *value = infos[1];
      __block NSString *RNRouteType= @"";
      __block BOOL iscontain = NO;
      [routes enumerateObjectsUsingBlock:^(NSDictionary  *_Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
        if (obj && [obj[@"name"] isEqualToString:type]) {
          iscontain = YES;
          RNRouteType = obj[@"routeType"];
          *stop = true;
        }
      }];
      if (iscontain) {
        if (value.length > 0 && [value hasSuffix:@".html"]) {
          value = [value stringByReplacingOccurrencesOfString:@".html" withString:@""];
        }
        [YFWEventManager emit:@"SCHEME_ACTION" Data:@{@"url":[NSString stringWithFormat:@"yaofangwang://?type=%@&value=%@",RNRouteType,value]}];

        return true;
      }
      
    }
  }
  if (![[UMSocialManager defaultManager] handleUniversalLink:userActivity options:nil]) {
      // 其他SDK的回调
  }
  return YES;
}

- (void)scene:(UIScene *)scene continueUserActivity:(NSUserActivity *)userActivity  API_AVAILABLE(ios(13.0)){
    [WXApi handleOpenUniversalLink:userActivity delegate:self];
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  if (![deviceToken isKindOfClass:[NSData class]]) return;
  const unsigned *tokenBytes = [deviceToken bytes];
  NSString *device_token = [NSString stringWithFormat:@"%08x%08x%08x%08x%08x%08x%08x%08x",
                        ntohl(tokenBytes[0]), ntohl(tokenBytes[1]), ntohl(tokenBytes[2]),
                        ntohl(tokenBytes[3]), ntohl(tokenBytes[4]), ntohl(tokenBytes[5]),
                        ntohl(tokenBytes[6]), ntohl(tokenBytes[7])];
  [AppDelegate sharedInstances].deviceTokenStr = device_token;
  
  NSLog(@" device token %@",device_token);
  
  //极光推送
  [JPUSHService registerDeviceToken:deviceToken];
#ifdef RunOnMobile
  //智齿客服
  [[ZCLibClient getZCLibClient] setToken:deviceToken];
#endif

}
- (void)applicationDidEnterBackground:(UIApplication *)application {
}

//应用重新进入激活状态
- (void)applicationDidBecomeActive:(UIApplication *)application{
  [[NSNotificationCenter defaultCenter] postNotificationName:@"becomeActiveNotification" object:nil];
  
  NSString *is_open = [YFWSettingUtility isLocationServiceOpen] ? @"true" : @"false";
  [YFWEventManager emit:@"IS_OPEN_LOCATION" Data:@{@"is_open":is_open}];
  
  [JPUSHService setBadge:0];
  [UIApplication sharedApplication].applicationIconBadgeNumber = 0;
  
}

- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
{
  
  dispatch_async(dispatch_get_main_queue(), ^{
    //用户已经允许接收以下类型的推送
    [[UIApplication sharedApplication] registerForRemoteNotifications];
  });
  
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)   (UIBackgroundFetchResult))completionHandler
{
  [JPUSHService handleRemoteNotification:userInfo];
    [[NSNotificationCenter defaultCenter] postNotificationName:J_APNS_NOTIFICATION_ARRIVED_EVENT object:userInfo];
    completionHandler(UIBackgroundFetchResultNewData);
}
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error{
  
  NSLog(@"Register Error : %@",error);
  
}


- (void)dealJSCrashHandler {
  RCTSetFatalHandler(^(NSError *error) {
    {//记录metrics和js Error日志，埋点上报
      NSArray *RCTJSStackTraceArray = error.userInfo[@"RCTJSStackTraceKey"];
      if ([NSJSONSerialization isValidJSONObject:RCTJSStackTraceArray]) {
        NSError *jsonError = nil;
        NSData *infoData = [NSJSONSerialization dataWithJSONObject:RCTJSStackTraceArray options:NSJSONWritingPrettyPrinted error:&jsonError];
        if (!jsonError) {
          NSString *reason = [[NSString alloc] initWithData:infoData encoding:NSUTF8StringEncoding];
          if (self.currentRNRouteInfo.length > 0) {
            reason = [reason stringByAppendingString:self.currentRNRouteInfo];
          }
          [self alertTipAndResetRNRoot];
          [self saveCrashInfoWithName:error.localizedDescription andReason:reason];
          
        }
      }
    }
  });
}
// 设置一个C函数，用来接收崩溃信息
void UncaughtExceptionHandler(NSException *exception){
  
  // 可以通过exception对象获取一些崩溃信息，我们就是通过这些崩溃信息来进行解析的，例如下面的symbols数组就是我们的崩溃堆栈。
  NSString *reason = [exception reason];
  NSString *name = [exception name];
  [yfwAppDelegate saveCrashInfoWithName:name andReason:reason];
  
}

- (void)saveCrashInfoWithName:(NSString *)name andReason:(NSString *)reason {
  if (name.length <= 0 || reason.length <= 0) {
    return;
  }
  NSMutableDictionary *exceptionDic = [[NSUserDefaults standardUserDefaults] objectForKey:@"ExceptionText"];
  BOOL canSave = [[NSUserDefaults standardUserDefaults] boolForKey:@"uploadExceptionMessageSwitch"];
  if (!canSave || exceptionDic.allKeys.count > 50) {
    return;
  }
  YFWReachability* curReach = [YFWReachability yfwReachabilityWithHostname:[NSString stringWithFormat:@"www.%@",[YFWSettingUtility yfwDomain]]];
  NetworkStatus status = [curReach currentYFWReachabilityStatus];
  NSString *statusString = @"";
  NSString *speed = [YFWSettingUtility getNetworkSpeedString];
  
  switch (status)
  {
    case NotReachable:
      statusString = @"none";
      break;
      
    case ReachableViaWiFi:
      statusString = @"wifi";
      break;
      
    case ReachableViaWWAN:
      statusString = @"wwan";
      break;
      
    default:
      statusString = @"";
      break;
  }
    
  NSDictionary *exceptionInfo = @{@"reason" : getSafeString(reason),
                                  @"name"   : getSafeString(name),
                                  @"speed"  : getSafeString(speed),
                                  @"networkType" : getSafeString(statusString)};
  
  if (exceptionDic) {
    if (exceptionDic.allKeys.count < 50) {
      [exceptionDic setObject:exceptionInfo forKey:getSafeString(name)];
      [[NSUserDefaults standardUserDefaults] setObject:exceptionDic forKey:@"ExceptionText"];
      
    }
  }else{
    exceptionDic = [NSMutableDictionary dictionaryWithCapacity:50];
    [exceptionDic setObject:exceptionInfo forKey:getSafeString(name)];
    [[NSUserDefaults standardUserDefaults] setObject:exceptionDic forKey:@"ExceptionText"];
    
  }
}
- (void)hasPostExceptionMessage{
  
  
  NSMutableDictionary *exceptionDic = [[NSUserDefaults standardUserDefaults] objectForKey:@"ExceptionText"];
  if (!exceptionDic) {
    return;
  }
  NSDictionary *exceptionDicCopy = exceptionDic.copy;
  
  for (NSString *key in exceptionDicCopy.allValues) {
    
    NSDictionary *exceptionInfo = [exceptionDic objectForKey:key];
    
    if (exceptionInfo && [exceptionInfo isKindOfClass:[NSDictionary class]]) {
      
      NSString *reason = exceptionInfo[@"reason"];
      NSString *name = exceptionInfo[@"name"];
      NSString *networkType = exceptionInfo[@"networkType"];
      NSString *speed = exceptionInfo[@"speed"];
      NSString *currentAppVersion = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"];
      NSString *systemVersion = [[UIDevice currentDevice] systemVersion];
      NSString *deviceName = [UIDevice currentDevice].machineModelName;
      
      NSDictionary *param = @{@"__cmd":@"guest.sys.log.add",
                              @"level":@"error" ,
                              @"os":@"ios",
                              @"osVersion":getSafeString(systemVersion),
                              @"version":getSafeString(currentAppVersion),
                              @"deviceName":getSafeString(deviceName),
                              @"networkType":getSafeString(networkType),
                              @"networkStatus":getSafeString(speed),
                              @"productName":@"药房网商城",
                              @"message":getSafeString(name),
                              @"exception":getSafeString(reason)};
      YFWSocketManager *manager = [YFWSocketManager shareManager];
      [manager requestAsynParameters:param success:^(id responseObject) {
        NSLog(@"错误日志，提交成功");
        [exceptionDic removeObjectForKey:key];
        if (exceptionDic.allKeys.count == 0) {
          [[NSUserDefaults standardUserDefaults] removeObjectForKey:@"ExceptionText"];
          [[NSUserDefaults standardUserDefaults] synchronize];
        }else{
          [[NSUserDefaults standardUserDefaults] setObject:exceptionDic forKey:@"ExceptionText"];
        }
        
      } failure:^(NSError *error) {
        
      }];
      
    }
  }
  
  
  
}
- (void)alertTipAndResetRNRoot {
  UIAlertController* alert = [UIAlertController alertControllerWithTitle:@""
                                 message:@"程序遇到了点小问题，是否重新加载？"
                                 preferredStyle:UIAlertControllerStyleAlert];
   
  UIAlertAction *defaultAction = [UIAlertAction actionWithTitle:@"确定" style:UIAlertActionStyleDefault
     handler:^(UIAlertAction * action) {
    [self.window.layer addAnimation:[self createTransitionAnimation] forKey:nil];
    [self.rnRootView.bridge reload];
  }];
  
  UIAlertAction *cancelAction = [UIAlertAction actionWithTitle:@"取消" style:UIAlertActionStyleCancel
     handler:^(UIAlertAction * action) {
  }];
   
  [alert addAction:defaultAction];
  [alert addAction:cancelAction];
  dispatch_async(dispatch_get_main_queue(), ^{
    [self.window.rootViewController presentViewController:alert animated:YES completion:nil];
  });
}
#pragma mark - Notification

//iOS 10 前台收到消息
- (void)jpushNotificationCenter:(UNUserNotificationCenter *)center  willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(NSInteger))completionHandler {
  NSDictionary * userInfo = notification.request.content.userInfo;
  if([notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
    // Apns
    NSLog(@"iOS 10 APNS 前台收到消息");
    [JPUSHService handleRemoteNotification:userInfo];
    [[NSNotificationCenter defaultCenter] postNotificationName:J_APNS_NOTIFICATION_ARRIVED_EVENT object:userInfo];
  }
  else {
    // 本地通知 todo
    NSLog(@"iOS 10 本地通知 前台收到消息");
    [[NSNotificationCenter defaultCenter] postNotificationName:J_LOCAL_NOTIFICATION_ARRIVED_EVENT object:userInfo];
  }
  //需要执行这个方法，选择是否提醒用户，有 Badge、Sound、Alert 三种类型可以选择设置
  completionHandler(UNNotificationPresentationOptionAlert);
}

//iOS 10 消息事件回调
- (void)jpushNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler: (void (^)(void))completionHandler {
  NSDictionary * userInfo = response.notification.request.content.userInfo;
  if([response.notification.request.trigger isKindOfClass:[UNPushNotificationTrigger class]]) {
    // Apns
    NSLog(@"iOS 10 APNS 消息事件回调");
    [JPUSHService handleRemoteNotification:userInfo];
    // 保障应用被杀死状态下，用户点击推送消息，打开app后可以收到点击通知事件
    [[RCTJPushEventQueue sharedInstance]._notificationQueue insertObject:userInfo atIndex:0];
    [[NSNotificationCenter defaultCenter] postNotificationName:J_APNS_NOTIFICATION_OPENED_EVENT object:userInfo];
  }
  else {
    // 本地通知
    NSLog(@"iOS 10 本地通知 消息事件回调");
    // 保障应用被杀死状态下，用户点击推送消息，打开app后可以收到点击通知事件
    [[RCTJPushEventQueue sharedInstance]._localNotificationQueue insertObject:userInfo atIndex:0];
    [[NSNotificationCenter defaultCenter] postNotificationName:J_LOCAL_NOTIFICATION_OPENED_EVENT object:userInfo];
  }
  // 系统要求执行这个方法
  completionHandler();
}

//iOS7以后，点击通知执行方法，挂在后台的情况
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo{
  
  [self pushNotificationConfig:userInfo];
  [[NSNotificationCenter defaultCenter] postNotificationName:J_APNS_NOTIFICATION_ARRIVED_EVENT object:userInfo];
}

- (void)pushNotificationConfig:(NSDictionary *)userInfo{
  self.notification_dic = userInfo;
  
}
#pragma mark -Action

- (void)jumpWithUrl:(NSURL *)url{
  
  NSDictionary *dic = [YFWSettingUtility getURLParameters:url];
  
}

- (void)autoSplashScreen{
  
  if (!_splashImage) {
    _splashImage = [[UIImageView alloc]initWithFrame:[UIScreen mainScreen].bounds];
  }
  if (IS_IPHONE_X) {
    _splashImage.image = [UIImage imageNamed:@"DefaultX"];
  }else{
    _splashImage.image = [UIImage imageNamed:@"Default"];
  }
  
  [self.window addSubview:_splashImage];
}


-(void)closeSplashImage {
  dispatch_sync(dispatch_get_main_queue(), ^{
    [UIView animateWithDuration:0.5 animations:^{
      _splashImage.alpha = 0;
    } completion:^(BOOL finished){
//      [_splashImage removeFromSuperview];
      self.window.rootViewController = _nav;
    }];
  });
}

-(void)changeNavigation {
  dispatch_sync(dispatch_get_main_queue(), ^{
    if (self.window.rootViewController != _nav) {
      [self.window.layer addAnimation:[self createTransitionAnimation] forKey:nil];
      self.window.rootViewController = _nav;
    }
  });
}

- (void)changeToMainVC {
  if (self.window.rootViewController != _nav) {
    [self.window.layer addAnimation:[self createTransitionAnimation] forKey:nil];
    self.window.rootViewController = _nav;
  }
}
- (CATransition *)createTransitionAnimation {
  CATransition *animation = [CATransition animation];
  animation.type = @"fade";
  animation.subtype = kCATransitionFromBottom;
  animation.duration = 1.5;
  animation.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut];
  return animation;
}
- (void)addNetworkChangeNotification{
  
  //开启网络状况的监听
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(appReachabilityChanged:)
                                               name:kYFWReachabilityChangedNotification
                                             object:nil];
  
  // 检测默认路由是否可达
  YFWReachability *routerReachability = [YFWReachability yfwReachabilityForInternetConnection];
  [routerReachability startNotifier];
  
}
/// 当网络状态发生变化时调用
- (void)appReachabilityChanged:(NSNotification *)notification{
  
  //检测服务器是否可达
  dispatch_queue_t disqueue =  dispatch_queue_create("com.yaofang.store", DISPATCH_QUEUE_CONCURRENT);
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), disqueue, ^{
    
    //BOOL reachable = [self socketReachabilityTest];
    BOOL reachable = [self reachabilityChanged:notification];
    
    [YFWEventManager emit:@"netWorkChanged" Data:@{@"reachable":@(reachable)}];
    
  });
}
- (BOOL)reachabilityChanged:(NSNotification *)note
{
  YFWReachability* curReach = [YFWReachability yfwReachabilityWithHostname:@"www.baidu.com"];
  NetworkStatus status = [curReach currentYFWReachabilityStatus];
  
  switch (status)
  {
    case NotReachable:
      NSLog(@"====当前网络状态不可达=======");
      //其他处理
      break;
      
    case ReachableViaWiFi:
      NSLog(@"====当前网络状态为Wifi=======");
      return YES;
      break;
      
    case ReachableViaWWAN:
      NSLog(@"====当前网络状态为WWAN=======");
      return YES;
      break;
      
    default:
      NSLog(@"你是外星来的吗？");
      //其他处理
      break;
  }
  
  return NO;
}
#pragma mark - Config

- (RCTRootView *)configReactNative:(NSDictionary *)launchOptions{
  
  NSURL *medicineLocation;
  
#ifdef DEBUG
  
  medicineLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];
#else
//  [[YFWMedicineBPManager sharedInstance] beginRCT];
  NSString* medicineP = [[YFWMedicineBPManager sharedInstance] get_medicine_index];
  medicineLocation = [NSURL URLWithString:medicineP];
#endif
  
  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:medicineLocation moduleName:@"HelloWorld" initialProperties:nil launchOptions:launchOptions];
  self.rnRootView = rootView;
  return rootView;
  
}


- (void)configThirdRegist:(UIApplication *)application{
  //*************************键盘设置***********************************
  [IQKeyboardManager sharedManager].enable = NO;
  [IQKeyboardManager sharedManager].shouldResignOnTouchOutside = YES;
  
// //在register之前打开log, 后续可以根据log排查问题
//  [WXApi startLogByLevel:WXLogLevelDetail logBlock:^(NSString *log) {
//      NSLog(@"WeChatSDK: %@", log);
//  }];
//
//  //务必在调用自检函数前注册
//  BOOL is_success = [WXApi registerApp:WeiXinAppkey universalLink:WeiXinUniversalLink];
//  NSLog(@"WeChat regiest result %d",is_success);
//
//  //调用自检函数
//  [WXApi checkUniversalLinkReady:^(WXULCheckStep step, WXCheckULStepResult* result) {
//      NSLog(@"WeChat %@, %u, %@, %@", @(step), result.success, result.errorInfo, result.suggestion);
//  }];
  //友盟统计
  [UMCommonLogManager setUpUMCommonLogManager];
  [UMConfigure setLogEnabled:NO];
  [UMConfigure initWithAppkey:YouMengAppkey channel:@"App Store"];
  [MobClick setScenarioType:E_UM_NORMAL];
  
  [UMSocialGlobal shareInstance].universalLinkDic = @{@(UMSocialPlatformType_WechatSession):WeiXinUniversalLink};

  //打开调试日志
  [[UMSocialManager defaultManager] openLog:YES];
  
  //设置微信的appKey和appSecret
  [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_WechatSession appKey:WeiXinAppkey appSecret:WeiXinAppSecret redirectURL:YFWURL];
  
  //设置分享到QQ互联的appKey和appSecret
  [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_QQ appKey:QQAppId  appSecret:nil redirectURL:YFWURL];
  
  //设置新浪的appKey和appSecret
  [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_Sina appKey:SinaAppkey  appSecret:SinaAppSecret redirectURL:YFWURL];
  
  [[UMSocialManager defaultManager] setPlaform: UMSocialPlatformType_APSession appKey:@"2015102100507562" appSecret:nil redirectURL:YFWURL];

  
  
#ifdef RunOnMobile
  [[SobotManager getManager] register:application delegate:self];
  //极光统计
  JANALYTICSLaunchConfig * config = [[JANALYTICSLaunchConfig alloc] init];
  config.appKey = YF_JPUSH_APPID;
  config.channel = @"channel";
  [JANALYTICSService setupWithConfig:config];
  
#endif
  
  if ([[NSUserDefaults standardUserDefaults] boolForKey:@"LaunchViewDone"]) {
    [self registBaiduManager];
  }
  
  [YFWProgressHUD setDefaultMaskType:YFWProgressHUDMaskTypeClear];
  [YFWProgressHUD setBackgroundColor:PP_UIColor_RGBA(0, 0, 0, 0.8)];
  [YFWProgressHUD setForegroundColor:[UIColor whiteColor]];
  
}
- (void)registBaiduManager{
  
  self.baiduManager = [YFWBaiduMapManager shareManager];
  [self.baiduManager managerRegist];
  
}
/**
* 初始化数美SDK（用户同意隐私权限后，再初始化数美SDK）
*/
- (void)initSMSDK {
  
  SmOption *option = [[SmOption alloc] init];
  [option setOrganization:SMOrganization];
  [option setAppId:SMAppID];
  [option setPublicKey:SMPublicKey];
  [[SmAntiFraud shareInstance] create:option];
}

- (void)configureJPushNotification:(NSDictionary *)launchOptions{

  //Required
  //notice: 3.0.0及以后版本注册可以这样写，也可以继续用之前的注册方式
  JPUSHRegisterEntity * entity = [[JPUSHRegisterEntity alloc] init];
  entity.types = JPAuthorizationOptionAlert|JPAuthorizationOptionBadge|JPAuthorizationOptionSound;
  if ([[UIDevice currentDevice].systemVersion floatValue] >= 8.0) {
    // 可以添加自定义categories
    // NSSet<UNNotificationCategory *> *categories for iOS10 or later
    // NSSet<UIUserNotificationCategory *> *categories for iOS8 and iOS9
  }
  [JPUSHService registerForRemoteNotificationConfig:entity delegate:self];
  
  NSString *advertisingId = [[[ASIdentifierManager sharedManager] advertisingIdentifier] UUIDString];
  YFSetObjectForKey(advertisingId, @"k_deviceNo");
  // appKey  :
  // channel : 指明应用程序包的下载渠道，为方便分渠道统计，具体值由你自行定义
  // apsForProduction : 0 (默认值)表示采用的是开发证书，1 表示采用生产证书发布应用
  [JPUSHService setupWithOption:launchOptions
                         appKey:YF_JPUSH_APPID
                        channel:@"App Store"
               apsForProduction:TRUE
          advertisingIdentifier:advertisingId];
  
  //获取RegisterID
  [JPUSHService registrationIDCompletionHandler:^(int resCode, NSString *registrationID) {
    self.registerID = registrationID;
    NSLog(@"registerID:%@",registrationID);
  }];
  // 自定义消息
  NSNotificationCenter *defaultCenter = [NSNotificationCenter defaultCenter];
  [defaultCenter addObserver:self selector:@selector(networkDidReceiveMessage:) name:kJPFNetworkDidReceiveMessageNotification object:nil];
}
//自定义消息
- (void)networkDidReceiveMessage:(NSNotification *)notification {
  NSDictionary * userInfo = [notification userInfo];
  [[NSNotificationCenter defaultCenter] postNotificationName:J_CUSTOM_NOTIFICATION_EVENT object:userInfo];
}
#pragma mark 3D touch 配置
- (void)createApp3DTouch{
  // 自定义图标
  UIApplicationShortcutIcon *icon1 = [UIApplicationShortcutIcon iconWithTemplateImageName:@"car_3dicon"];
  // 创建带着有自定义图标item
  UIMutableApplicationShortcutItem *item1 = [[UIMutableApplicationShortcutItem alloc]initWithType:@"ShopCar" localizedTitle:@"购物车" localizedSubtitle:nil icon:icon1 userInfo:nil];
  [[UIApplication sharedApplication] setShortcutItems:@[item1]];

}

-(void)application:(UIApplication *)application performActionForShortcutItem:(nonnull UIApplicationShortcutItem *)shortcutItem completionHandler:(nonnull void (^)(BOOL))completionHandler{
  // 1.获得shortcutItem的type type就是初始化shortcutItem的时候传入的唯一标识符
  NSString *type = shortcutItem.type;
  
  //2.可以通过type来判断点击的是哪一个快捷按钮 并进行每个按钮相应的点击事件
  if ([type isEqualToString:@"ShopCar"]) {
    // model:0,为不需要跳转，切换tabbar类型
    // model:1,为走pushNavigation
    NSDictionary *dic = @{
                          @"model":@"0",
                          @"type":@"car",
                          @"value":@""
                          };
    self.threeTouch_dic = dic;
    [YFWEventManager emit:@"get_threeTouch" Data:dic];
    
  }
}




#pragma mark - wx pay delegate

-(void) onResp:(BaseResp*)resp
{
  if([resp isKindOfClass:[SendMessageToWXResp class]])
  {
    
  }
  else if([resp isKindOfClass:[SendAuthResp class]])
  {
    
  }
  else if ([resp isKindOfClass:[PayResp class]])
  {
    if (resp.errCode==0) {
      self.payResultInfo = @{@"result":@(true),@"type":@"wx"};
      [[NSNotificationCenter defaultCenter] postNotificationName:@"PaySuccess" object:nil];
    }else
    {
      self.payResultInfo = @{@"result":@(false),@"type":@"wx"};
      [[NSNotificationCenter defaultCenter] postNotificationName:@"payFailed" object:nil];
    }
  }
}

- (float)getLat
{
  if (_latitude == 0) {
    return 31.236276;
  }
  return _latitude;
}

- (float)getLon
{
  if (_longitude == 0) {
    return 121.480248;
  }
  return _longitude;
}

@end


@implementation NSURLRequest (AllowAnyHTTPSCertificate)

+ (BOOL)allowsAnyHTTPSCertificateForHost:(NSString *)host
{
  return YES;
}

@end
