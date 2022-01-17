//
//  YFWBridgeManager.m
//  HelloWorld
//
//  Created by NW-YFW on 2018/9/13.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "YFWBridgeManager.h"
//iOS调用RN
#import <React/RCTEventDispatcher.h>


#import "YFDateTimeGetter.h"
#import "YFWSettingUtility.h"
#import "YFWSocketManager.h"
#import "YFWQRCodeReaderManager.h"
#import "YFWAroundViewController.h"
#import "YFWChoseMapViewController.h"
#import "YFWShareViewController.h"
#import "YFWSobotViewController.h"
#import "YFWPaymentControl.h"
#import "YFWBaiduMapManager.h"
#import "AppDelegate.h"
#import "YFWMedicineBPManager.h"
#import <AssetsLibrary/AssetsLibrary.h>
#import <AdSupport/AdSupport.h>
#import <AVFoundation/AVFoundation.h>
#import "YFWPriceTrendViewController.h"
#import "changeEnvironmentTableViewController.h"
#import "YFWSocketRequestOperation.h"
#import "YFWLaunchAdViewController.h"
#import "LoginViewController.h"
#import <OneLoginSDK/OneLoginSDK.h>
#import "YFWEventManager.h"
#import "LoginViewController.h"
#import "YFWAlertController.h"
#import "KeychainIDFA.h"
#import "YFWPhoneInfo.h"
#import "NSString+MD5.h"
#import "WXUtil.h"
#import "IQKeyboardManager.h"
#import <MessageUI/MessageUI.h>
#import "SmAntiFraud.h"
#import "WKWebView+ClearCache.h"
#import "WXApi.h"
#import "YFWMapHelperManager.h"
#define kAppDelegate ((AppDelegate *)[[UIApplication sharedApplication] delegate])

@interface YFWBridgeManager()<MFMessageComposeViewControllerDelegate>

@property (nonatomic, strong) YFWQRCodeReaderManager *qrManager;
@property (nonatomic, strong) YFWPaymentControl *paymentControl;
@property (nonatomic, strong) YFWMapHelperManager *mapHelperManager;

@end
@implementation YFWBridgeManager
@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();
RCT_EXPORT_METHOD(changeIQKeyboardManagerEnable:(BOOL)enable)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [IQKeyboardManager sharedManager].enable = enable;
  });
  
}
/* 清除wkwebview 缓存 */
RCT_EXPORT_METHOD(clearWebViewCache)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    
    [WKWebView yfwdeleteWebCache];
  });
  
}
RCT_EXPORT_METHOD(initSMSDK)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [[AppDelegate sharedInstances] initSMSDK];
  });
  
}
//跳转Safari浏览器
RCT_EXPORT_METHOD(applicationOpenURL:(NSString *)urlStr)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    if (urlStr.length == 0) {
      return;
    }
    NSString *encodingStr = [urlStr stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    NSURL *url = [NSURL URLWithString:encodingStr];
    if (url && [[UIApplication sharedApplication] canOpenURL:url]) {
      [[UIApplication sharedApplication] openURL:url];
    }
  });
  
}
// 接收传过来的 NSString
RCT_EXPORT_METHOD(getValueFromRN:(NSString *)value){
}
// 左对齐内容alert
RCT_EXPORT_METHOD(showAlertWithTitle:(NSString *)title message:(NSString *)message callback:(RCTResponseSenderBlock)callback){
  dispatch_async(dispatch_get_main_queue(), ^{
    YFWAlertController * alertContorller = [YFWAlertController alertControllerWithTitle:title message:message preferredStyle:(UIAlertControllerStyleAlert)];
    alertContorller.titleTextAlignment = NSTextAlignmentLeft;
    alertContorller.messageTextAlignment = NSTextAlignmentLeft;
    UIAlertAction * sureAction = [UIAlertAction actionWithTitle:@"确认" style:(UIAlertActionStyleDefault) handler:^(UIAlertAction * _Nonnull action) {
      callback(@[]);
    }];
    [alertContorller addAction:sureAction];
    [[AppDelegate sharedInstances].nav presentViewController:alertContorller animated:YES completion:nil];
  });
}
//是否打开消息通知权限
RCT_EXPORT_METHOD(isOpenNotification:(RCTResponseSenderBlock)callback)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    BOOL isClose = [[UIApplication sharedApplication] currentUserNotificationSettings].types==UIUserNotificationTypeNone;
    callback(@[@(!isClose)]);
  });
  
}
//打开消息通知权限
RCT_EXPORT_METHOD(openNotification:(NSString *)value callback:(RCTResponseSenderBlock)callback)
{
  [self configNotificationSetting:callback];
}
//  打开设置页面
RCT_EXPORT_METHOD(openSetting:(NSString *)value callback:(RCTResponseSenderBlock)callback)
{
  [YFWSettingUtility toSetting];
  callback(@[[NSNull null],@[]]);
}
//跳转AppStore页
RCT_EXPORT_METHOD(openAppStore:(NSString *)value callback:(RCTResponseSenderBlock)callback)
{
  [YFWSettingUtility openRatingsPageInAppStore];
  callback(@[[NSNull null],@[]]);
}
//给好评
RCT_EXPORT_METHOD(openAppStoreComment:(NSString *)value callback:(RCTResponseSenderBlock)callback)
{
  [YFWSettingUtility toPraiseInAppStore];
  callback(@[[NSNull null],@[]]);
}
//扫一扫页
RCT_EXPORT_METHOD(openSaoyisao:(BOOL)isTCP callback:(RCTResponseSenderBlock)callback)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    AVAuthorizationStatus status = [AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeVideo];
    if (status == AVAuthorizationStatusRestricted || status == AVAuthorizationStatusDenied)
    {
      UIAlertController* alert = [UIAlertController alertControllerWithTitle:nil
                                                                     message:@"请打开访问相机权限"
                                                              preferredStyle:UIAlertControllerStyleAlert];
      
      UIAlertAction *defaultAction = [UIAlertAction actionWithTitle:@"确定" style:UIAlertActionStyleDefault
                                                            handler:^(UIAlertAction * action) {
                                                              [YFWSettingUtility toSetting];
                                                            }];
      UIAlertAction *cancleAction = [UIAlertAction actionWithTitle:@"取消" style:UIAlertActionStyleCancel handler:^(UIAlertAction * _Nonnull action) {
        
      }];
      [alert addAction:cancleAction];
      [alert addAction:defaultAction];
      [[AppDelegate sharedInstances].nav presentViewController:alert animated:YES completion:nil];
    }else{
      _qrManager = [[YFWQRCodeReaderManager alloc] init];
      _qrManager.isTCP = isTCP;
      [_qrManager showQRCodeReaderView:callback];
    }
  });
}


//TCP请求
RCT_EXPORT_METHOD(TCPRequest:(NSDictionary *)param Success:(RCTResponseSenderBlock)successBlock Error:(RCTResponseSenderBlock)errorBlock)
{
  
  @try {
    
    YFWSocketManager *manager = [YFWSocketManager shareManager];
    [manager requestAsynParameters:param success:^(id responseObject) {
      NSLog(@"%@",param);
      NSLog(@"当前线程（TCPRequest）%@",[NSThread currentThread]);
      if (responseObject) {
        if(successBlock)successBlock(@[responseObject]);
      }else{
        if(errorBlock)errorBlock(@[@{}]);
      }
    } failure:^(NSError *error) {
      if(errorBlock)errorBlock(@[error]);
    }];
    
  } @catch (NSException *exception) {
    NSLog(@"");
  } @finally {
    
  }
  
  
}

//TCP请求
RCT_EXPORT_METHOD(TCPMultipleRequest:(NSDictionary *)params Success:(RCTResponseSenderBlock)successBlock Error:(RCTResponseSenderBlock)errorBlock)
{
  
  NSLog(@"当前线程（TCPRequest）*********** stzrt  ");
  NSDate *startDate = [NSDate date];
  dispatch_group_t group = dispatch_group_create();
  dispatch_queue_t gloableQueue = dispatch_queue_create("com.yfw.test", DISPATCH_QUEUE_CONCURRENT);
  NSMutableDictionary *allReturnValueDic = [NSMutableDictionary dictionary];
  NSArray *allParam = params[@"params"];
  for (int i = 0; i <allParam.count; i++) {
    dispatch_group_enter(group);
  }
  for (NSDictionary *param in allParam) {
    dispatch_async(gloableQueue, ^{
      YFWSocketRequestOperation *request = [[YFWSocketRequestOperation alloc] init];
      NSDate *startDate = [NSDate date] ;

      [request reciveConnectHost:^{
        [request sendDataWithDic:param];
      }];
      [request reciveData:^(NSDictionary *response) {
        [allReturnValueDic setObject:response forKey:param[@"__cmd"]];
        dispatch_group_leave(group);
        NSTimeInterval timeInterval = [[NSDate date] timeIntervalSinceDate:startDate];
        NSLog(@"cmd = %@ end request timeInterval=%f",param[@"__cmd"],timeInterval);
      }];
      [request reciveError:^(NSError *error) {
        
        [allReturnValueDic setObject:@{@"error":@YES} forKey:param[@"__cmd"]];
        dispatch_group_leave(group);
        
      }];
      [request connecteServer];
      NSLog(@"cmd = %@  start request ",param[@"__cmd"]);
    
    });
    
  }
  dispatch_group_notify(group, gloableQueue, ^{
    NSTimeInterval timeInterval = [[NSDate date] timeIntervalSinceDate:startDate];
    NSLog(@"当前线程（TCPRequest）*********** end  timeInterval=%f",timeInterval);

    successBlock(@[allReturnValueDic]);
  });
  
  
  
  
}

//TCP图片上传
RCT_EXPORT_METHOD(tcpUploadImg:(NSString *)path Success:(RCTResponseSenderBlock)successBlock Error:(RCTResponseSenderBlock)errorBlock){
  
  YFWSocketManager *manager = [YFWSocketManager shareManager];
  NSURL *url = [NSURL URLWithString:path];
  UIImage *image = [UIImage imageWithData:[NSData dataWithContentsOfURL:url]];
  [manager requestUploadImage:image success:^(id responseObject) {
    NSLog(@"%@",path);
    successBlock(@[responseObject]);
  } failure:^(NSError *error) {
    errorBlock(@[error]);
  }];
  
}

//TCP处方图片上传
RCT_EXPORT_METHOD(tcpUploadRXImg:(NSString *)path diskId:(int)diskid Success:(RCTResponseSenderBlock)successBlock Error:(RCTResponseSenderBlock)errorBlock){
  
  YFWSocketManager *manager = [YFWSocketManager shareManager];
  NSURL *url = [NSURL URLWithString:path];
  UIImage *image = [UIImage imageWithData:[NSData dataWithContentsOfURL:url]];
  [manager requestUploadImage:image diskId:diskid success:^(id responseObject) {
    NSLog(@"%@",path);
    successBlock(@[responseObject]);
  } failure:^(NSError *error) {
    errorBlock(@[error]);
  }];
  
}



//开屏广告
RCT_EXPORT_METHOD(showFullAdWithInfo:(NSDictionary *)adInfo callBack:(RCTResponseSenderBlock)callBackBlock) {
  
  dispatch_async(dispatch_get_main_queue(), ^{
    YFWLaunchAdViewController *adVC = [YFWLaunchAdViewController new];
    adVC.showTimeSecond = [[adInfo objectForKey:@"second"] integerValue];
    adVC.imageUrl = [adInfo objectForKey:@"img_url"];
    adVC.callBack = ^(BOOL status) {
      callBackBlock(@[@(status)]);
    };
    CATransition *animation = [self creatTransitionAnimationWithType:@"fade"];
    [[AppDelegate sharedInstances].window.layer addAnimation:animation forKey:nil];
    [AppDelegate sharedInstances].window.rootViewController = adVC;
  });
  
}
//转场动画
RCT_EXPORT_METHOD(showTransitionAnimationWithType:(NSString *)animationType) {
  
  dispatch_async(dispatch_get_main_queue(), ^{
    CATransition *animation = [self creatTransitionAnimationWithType:animationType];
    [[AppDelegate sharedInstances].window.layer addAnimation:animation forKey:nil];
  });
}
- (CATransition *)creatTransitionAnimationWithType:(NSString *)animationType {
  /* The name of the transition. Current legal transition types include
   * `fade', `moveIn', `push' and `reveal'. Defaults to `fade'. */
  if (!([animationType isEqualToString:@"fade"] || [animationType isEqualToString:@"moveIn"] || [animationType isEqualToString:@"push"] || [animationType isEqualToString:@"reveal"])) {
    animationType = @"fade";
  }
  CATransition *animation = [CATransition animation];
  animation.type = animationType;
  animation.subtype = kCATransitionFromBottom;
  animation.duration = 1;
  animation.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut];
  return animation;
}
//是否打开定位
RCT_EXPORT_METHOD(isLocationServiceOpen:(RCTResponseSenderBlock)callBack){
  
  BOOL is_open = [YFWSettingUtility isLocationServiceOpen];
  NSString *isOpenString = is_open ? @"true" : @"false";

  if (callBack) {
    callBack(@[isOpenString]);
  }
  
}
//
RCT_EXPORT_METHOD(getPOINearby:(RCTResponseSenderBlock)callBack){
  dispatch_async(dispatch_get_main_queue(), ^{
    [self.mapHelperManager getPOINearbyWithCallBack:^(NSArray * _Nonnull infos) {
      if (callBack) {
        callBack(@[infos]);
      }
    }];
  });
}
//
RCT_EXPORT_METHOD(getSearchPOIInCity:(NSString *)cityName keyWord:(NSString *)keyWord callBack:(RCTResponseSenderBlock)callBack){
  dispatch_async(dispatch_get_main_queue(), ^{
    [self.mapHelperManager getSearchPOIInCity:cityName withKeyWord:keyWord andCallBack:^(NSArray * _Nonnull infos) {
      if (callBack) {
        callBack(@[infos]);
      }
    }];
  });
}
//
RCT_EXPORT_METHOD(destroyPOI){
  dispatch_async(dispatch_get_main_queue(), ^{
    self.mapHelperManager = nil;
  });
}
//调用更新接口
RCT_EXPORT_METHOD(getFindCode){
  
//  if (currentTextType == YFWTextDefault || hasMedicineB) {
//    [[YFWMedicineBPManager sharedInstance] requestData];
//  }
  
}


//版本号
RCT_EXPORT_METHOD(getVersionNum:(NSString *)value callback:(RCTResponseSenderBlock)callback)
{
  NSString *local = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"];
  callback(@[[NSNull null],local]);
}



RCT_EXPORT_METHOD(getZipBundleNum:(RCTResponseSenderBlock)callback)
{
  
  NSString *medicineName = [YFWMedicineBPManager sharedInstance].medicineName;
  
  callback(@[medicineName]);
  
}


//三方登录
RCT_EXPORT_METHOD(openThirdLogin:(NSString *)type callback:(RCTResponseSenderBlock)callback){
  dispatch_async(dispatch_get_main_queue(), ^{
    
    [[LoginViewController new] thirdLogin:type callBack:^(NSDictionary *info) {
        callback(@[info]);
    }];
  });
  
}
//检查WeChat是否安装
RCT_EXPORT_METHOD(checkUserHaveInstallWX:(RCTResponseSenderBlock)callback){
  dispatch_async(dispatch_get_main_queue(), ^{
    callback(@[@([WXApi isWXAppInstalled])]);
  });
  
}

//分享
RCT_EXPORT_METHOD(shareWithUmeng:(NSString *)type Data:(NSDictionary *)data callback:(RCTResponseSenderBlock)callback){

  dispatch_async(dispatch_get_main_queue(), ^{

    YFWShareViewController *shareVC = [[YFWShareViewController alloc] init];
    shareVC.type = type;
    shareVC.data = data;
    shareVC.returnBlock = ^{
      callback(@[]);
    };
    [[AppDelegate sharedInstances].nav pushViewController:shareVC animated:YES];
    [shareVC shareMethod];

  });

}
//价格趋势
RCT_EXPORT_METHOD(startChart:(NSString *)idString andSsid:(NSString *)commodityID andIs_TCP:(NSString *)is_TCP){
  YFSetObjectForKey(idString, @"SSID");
  YFSynchronize;
  dispatch_async(dispatch_get_main_queue(), ^{
    
    YFWPriceTrendViewController *vc = [[YFWPriceTrendViewController alloc] init];
    vc.commodityID = commodityID;
    vc.is_TCP = [is_TCP isEqualToString:@"true"];
    vc.is_from_seller = YES;
    [[AppDelegate sharedInstances].nav pushViewController:vc animated:YES];
  });
  
}
//分享图片
RCT_EXPORT_METHOD(shareWithPicUmeng:(NSString *)type Data:(NSDictionary *)data callback:(RCTResponseSenderBlock)callback){
  
  dispatch_async(dispatch_get_main_queue(), ^{
    
    YFWShareViewController *shareVC = [[YFWShareViewController alloc] init];
    shareVC.type = type;
    shareVC.data = data;
    shareVC.returnBlock = ^{
      callback(@[]);
    };
    [[AppDelegate sharedInstances].nav pushViewController:shareVC animated:YES];
    [shareVC sharePicMethod];
    
  });
  
}


//支付
RCT_EXPORT_METHOD(openPayment:(NSDictionary *)data Type:(NSString *)type isTCP:(BOOL)istcp callback:(RCTResponseSenderBlock)callback){
  
  dispatch_async(dispatch_get_main_queue(), ^{
    _paymentControl = [[YFWPaymentControl alloc] init];
    _paymentControl.paySuccedBlock = ^{
      callback(@[]);
    };
    [_paymentControl paymentMethod:data Type:type isTCP:istcp];
  });
  
}


//智齿客服
RCT_EXPORT_METHOD(openZCSobot:(NSDictionary *)data ssid:(NSString *)ssid){
  
  NSLog(@"");
  dispatch_async(dispatch_get_main_queue(), ^{
    
    YFWSobotViewController *sobotVC = [[YFWSobotViewController alloc] init];
    sobotVC.ssid = ssid;
    [[AppDelegate sharedInstances].nav pushViewController:sobotVC animated:YES];
    
  });
  
}


//获取定位地址
RCT_EXPORT_METHOD(getLocationAddress:(RCTResponseSenderBlock)callback){
  
  dispatch_async(dispatch_get_main_queue(), ^{
    
    NSString *address = [YFWBaiduMapManager shareManager].currentAddress;
    NSString *city = [YFWBaiduMapManager shareManager].cityName;
    NSString *name = [YFWBaiduMapManager shareManager].name;
    NSString *province = [YFWBaiduMapManager shareManager].province;
    NSString *area = [YFWBaiduMapManager shareManager].area;
    
    NSDictionary *data = @{@"address" : getSafeString(address),
                           @"city"    : getSafeString(city),
                           @"name"    : getSafeString(name),
                           @"province": getSafeString(province),
                           @"area"    : getSafeString(area),
    };
    
    callback(@[data]);
    
  });
  
}
//重新定位
RCT_EXPORT_METHOD(startUpdatingLocationWithComplection:(RCTResponseSenderBlock)callback){
  
  dispatch_async(dispatch_get_main_queue(), ^{
    
    [[YFWBaiduMapManager shareManager] startUpdatingLocationWithComplection:^(NSDictionary *info) {
      callback(@[info]);
    }];
  });
  
}
RCT_EXPORT_METHOD(setKeychainYFWID:(NSString *)ID) {
  
  dispatch_async(dispatch_get_main_queue(), ^{
    [KeychainIDFA setYFWID:ID];
  });
}
RCT_EXPORT_METHOD(getKeychainYFWID:(RCTResponseSenderBlock)callback) {
  
  dispatch_async(dispatch_get_main_queue(), ^{
    NSString *ID = [KeychainIDFA YFWID];
    if (!ID) {
      ID = @"";
    }
    callback(@[ID]);
  });
}
//获取App配置信息
RCT_EXPORT_METHOD(getAppConfig:(RCTResponseSenderBlock)callback){
  
  dispatch_async(dispatch_get_main_queue(), ^{
    
    NSString *versionNum = getSafeString([[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"]);
    NSString *deviceNo = getSafeString([AppDelegate sharedInstances].deviceTokenStr );
    NSString *idfa = getSafeString([[[ASIdentifierManager sharedManager] advertisingIdentifier] UUIDString]);
    NSString *idfv = [[[UIDevice currentDevice] identifierForVendor] UUIDString];
    NSLog(@"idfv ==%@",idfv);
    NSString *key = [NSString stringWithFormat:@"%@ %f x %f %f %ld %ld",idfv,YFWPhoneInfo.deviceLogicalScreenSize.width,YFWPhoneInfo.deviceLogicalScreenSize.height,YFWPhoneInfo.deviceTotalMemory,(long)YFWPhoneInfo.deviceCPUType,(long)YFWPhoneInfo.deviceCPUNum];
    NSLog(@"orange key==%@  md5==%@ sha1==%@",key,[WXUtil md5:key],[WXUtil sha1:key]);
    idfa = getSafeString([KeychainIDFA IDFA]);
    idfv = getSafeString([KeychainIDFA IDFV]);
    NSLog(@"keychain idfa= %@  idfv== %@",idfa,idfv);
    NSString *deviceIp = getSafeString([UIDevice currentDevice].ipAddressCell);
    if (deviceIp.length == 0) {
      deviceIp = getSafeString([YFWSettingUtility getIPAddress]);
    }
    NSString *deviceName = getSafeString([UIDevice currentDevice].machineModelName);
    NSString *systemVersion = [[UIDevice currentDevice] systemVersion];
    BOOL is_tcp = [[NSUserDefaults standardUserDefaults] boolForKey:@"UseTCP"];
    NSString *yfwDomain = getSafeString([[NSUserDefaults standardUserDefaults] objectForKey:@"yfwDomain"]);
    NSString *jpushId = getSafeString([AppDelegate sharedInstances].registerID);
    NSString *isPush = [[UIApplication sharedApplication] currentUserNotificationSettings].types==UIUserNotificationTypeNone?@"0":@"1";
    
    NSDictionary *param = @{@"version"      : versionNum ,
                            @"deviceNo"     : idfa ,
                            @"osVersion"    : systemVersion,
                            @"deviceName"   : deviceName,
                            @"jpushId"      : jpushId,
                            @"mfpushId"     : deviceNo,
                            @"manufacturer" : @"苹果",
                            @"idfa"         : idfa ,
                            @"yfwDomain"    : yfwDomain,
                            @"ip"           : deviceIp ,
                            @"isPush"       : isPush ,
                            @"isTcp"        : is_tcp?@"yes":@"no",
                            @"idfv":idfv,
                            @"devicekScreenWidth": @(YFWPhoneInfo.deviceLogicalScreenSize.width),
                            @"devicekScreenHeight": @(YFWPhoneInfo.deviceLogicalScreenSize.height),
                            @"deviceTotalMemory":@(YFWPhoneInfo.deviceTotalMemory),
                            @"deviceCPUType":@(YFWPhoneInfo.deviceCPUType),
                            @"deviceCPUNum":@(YFWPhoneInfo.deviceCPUNum),
                            };
    callback(@[param]);
    
  });
  
}
//获取设备ID
RCT_EXPORT_METHOD(getDeviceId:(RCTResponseSenderBlock)callback){
  
  dispatch_async(dispatch_get_main_queue(), ^{
    NSString *deviceID = [[SmAntiFraud shareInstance] getDeviceId];
    callback(@[deviceID]);
  });
  
}
// 详细地址转经纬度
RCT_EXPORT_METHOD(getGeoCodeResult:(NSString *)city address:(NSString *)address complection:(RCTResponseSenderBlock)callback) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [[YFWBaiduMapManager shareManager] geoCodeWith:city address:address complection:^(NSDictionary *info) {
      callback(@[info]);
    }];
    
//    float longitude = [YFWBaiduMapManager shareManager].longitude;
//    float latitude = [YFWBaiduMapManager shareManager].latitude;
//    NSDictionary *info = @{
//                           @"latitude" : [NSString stringWithFormat:@"%f",latitude] ,
//                           @"longitude" : [NSString stringWithFormat:@"%f",longitude],
//                           };
    
  });
}

// 经纬度转详细地址
RCT_EXPORT_METHOD(getGeoReverseCodeResult:(NSString *)longtitude address:(NSString *)latitude complection:(RCTResponseSenderBlock)callback) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [[YFWBaiduMapManager shareManager] geoReverseCodeWith:longtitude latitude:latitude complection:^(NSDictionary *info) {
      callback(@[info]);
    }];
  });
}

//获取经纬度信息
RCT_EXPORT_METHOD(getLongitudeAndLatitude:(RCTResponseSenderBlock)callback){
  
  dispatch_async(dispatch_get_main_queue(), ^{
    float longitude = [YFWBaiduMapManager shareManager].longitude;
    float latitude = [YFWBaiduMapManager shareManager].latitude;
    NSString *address = [YFWBaiduMapManager shareManager].currentAddress;
    NSString *city = [YFWBaiduMapManager shareManager].cityName;
    [AppDelegate sharedInstances].longitude = longitude;
    [AppDelegate sharedInstances].latitude = latitude;
    
    NSDictionary *info = @{@"latitude" : [NSString stringWithFormat:@"%f",latitude] ,
                           @"longitude" : [NSString stringWithFormat:@"%f",longitude],
                           @"name"  : getSafeString(address),
                           @"city"  : getSafeString(city)
                           };
    
    callback(@[info]);
    
  });
  
}

//跳转第三方导航
RCT_EXPORT_METHOD(jumpThirdMap:(NSString *)lat lng:(NSString *)lng address:(NSString *)address) {
  dispatch_async(dispatch_get_main_queue(), ^{
    CLLocationDegrees latitude = [lat doubleValue];
    CLLocationDegrees longitude = [lng doubleValue];
    CLLocationCoordinate2D endLocation = CLLocationCoordinate2DMake(latitude, longitude);
    [self navThirdMapWithLocation:endLocation andTitle:address];
  });
}

-(void)navThirdMapWithLocation:(CLLocationCoordinate2D)endLocation andTitle:(NSString *)titleStr{
  //百度地图的坐标和高德的坐标不同 需要转换  http://lbsyun.baidu.com/index.php?title=coordinate
  endLocation = CLLocationCoordinate2DMake(endLocation.latitude - 0.006, endLocation.longitude - 0.0065);
  NSMutableArray *mapsA = [NSMutableArray array];
  //苹果原生地图方法和其他不一样
  NSMutableDictionary *iosMapDic = [NSMutableDictionary dictionary];
  iosMapDic[@"title"] = @"苹果地图";
  [mapsA addObject:iosMapDic];
  //高德地图
  if ([[UIApplication sharedApplication] canOpenURL:[NSURL URLWithString:@"iosamap://"]]) {
    NSMutableDictionary *gaodeMapDic = [NSMutableDictionary dictionary];
    gaodeMapDic[@"title"] = @"高德地图";
    NSString *urlString = [[NSString stringWithFormat:@"iosamap://path?sourceApplication=ios.blackfish.XHY&dlat=%f&dlon=%f&dname=%@&style=2",endLocation.latitude,endLocation.longitude,titleStr] stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet URLQueryAllowedCharacterSet]];
    gaodeMapDic[@"url"] = urlString;
    [mapsA addObject:gaodeMapDic];
  }
  //百度地图
  if ([[UIApplication sharedApplication] canOpenURL:[NSURL URLWithString:@"baidumap://"]]) {
    NSMutableDictionary *baiduMapDic = [NSMutableDictionary dictionary];
    baiduMapDic[@"title"] = @"百度地图";
    NSString *urlString = [[NSString stringWithFormat:@"baidumap://map/direction?origin={{我的位置}}&destination=latlng:%f,%f|name:%@&coord_type=gcj02&mode=driving&src=ios.blackfish.XHY",endLocation.latitude,endLocation.longitude,titleStr] stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet URLQueryAllowedCharacterSet]];
    baiduMapDic[@"url"] = urlString;
    [mapsA addObject:baiduMapDic];
    
    //腾讯地图
    if ([[UIApplication sharedApplication] canOpenURL:[NSURL URLWithString:@"qqmap://"]]) {
      NSMutableDictionary *qqMapDic = [NSMutableDictionary dictionary];
      qqMapDic[@"title"] = @"腾讯地图";
      NSString *urlString = [[NSString stringWithFormat:@"qqmap://map/routeplan?from=我的位置&type=drive&to=%@&tocoord=%f,%f&coord_type=1&referer={ios.blackfish.XHY}",titleStr,endLocation.latitude,endLocation.longitude] stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet URLQueryAllowedCharacterSet]];
      qqMapDic[@"url"] = urlString;
      [mapsA addObject:qqMapDic];
    }
    
  }
  
  //手机地图个数判断
  if (mapsA.count > 0) {
    //选择
    UIAlertController *alertVC = [UIAlertController alertControllerWithTitle:@"使用导航" message:nil preferredStyle:UIAlertControllerStyleActionSheet];
    NSInteger index = mapsA.count;
    
    for (int i = 0; i < index; i++) {
      
      NSString *title = mapsA[i][@"title"];
      NSString *urlString = mapsA[i][@"url"];
      if (i == 0) {
        
        UIAlertAction *iosAntion = [UIAlertAction actionWithTitle:title style:(UIAlertActionStyleDefault) handler:^(UIAlertAction * _Nonnull action) {
          [self appleNaiWithCoordinate:endLocation andWithMapTitle:titleStr];
        }];
        [alertVC addAction:iosAntion];
        continue;
      }
      
      UIAlertAction *action = [UIAlertAction actionWithTitle:title style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        [[UIApplication sharedApplication] openURL:[NSURL URLWithString:urlString]];
      }];
      
      [alertVC addAction:action];
    }
    
    UIAlertAction *cancleAct = [UIAlertAction actionWithTitle:@"取消" style:UIAlertActionStyleCancel handler:^(UIAlertAction * _Nonnull action) {
    }];
    [alertVC addAction:cancleAct];
    
    [[AppDelegate sharedInstances].nav presentViewController:alertVC animated:YES completion:^{
      
    }];
  }else{
    NSLog(@"未检测到地图应用");
  }
}


//唤醒苹果自带导航
- (void)appleNaiWithCoordinate:(CLLocationCoordinate2D)coordinate andWithMapTitle:(NSString *)map_title{
  
  MKMapItem *currentLocation = [MKMapItem mapItemForCurrentLocation];
  MKMapItem *tolocation = [[MKMapItem alloc] initWithPlacemark:[[MKPlacemark alloc] initWithCoordinate:coordinate addressDictionary:nil]];
  tolocation.name = map_title;
  [MKMapItem openMapsWithItems:@[currentLocation,tolocation] launchOptions:@{MKLaunchOptionsDirectionsModeKey:MKLaunchOptionsDirectionsModeDriving,
                                                                             MKLaunchOptionsShowsTrafficKey:[NSNumber numberWithBool:YES]}];
}


//跳转地图页面
RCT_EXPORT_METHOD(jumpToMapActivity:(NSDictionary *)data isTCP:(BOOL)isTcp Callback:(RCTResponseSenderBlock)callback){
  
  dispatch_async(dispatch_get_main_queue(), ^{
    
    YFWAroundViewController *aroundVC = [[YFWAroundViewController alloc] init];
    aroundVC.isTCP = isTcp;
    aroundVC.returnBlock = ^(NSDictionary *info) {
//      callback(@[info]);
      [self.bridge.eventDispatcher sendAppEventWithName:@"AppToShopDetail" body:info];
      [self performSelector:@selector(delayMethod) withObject:nil afterDelay:0.5f];
    };
    [[AppDelegate sharedInstances].nav pushViewController:aroundVC animated:YES];
    
  });
  
}
-(void)delayMethod{
  NSMutableArray *vc = [AppDelegate sharedInstances].nav.childViewControllers.mutableCopy;
  NSMutableArray *newVC = @[].mutableCopy;
  [newVC addObject:vc[1]];
  [newVC addObject:vc[0]];

  [[AppDelegate sharedInstances].nav setViewControllers:newVC.copy];
}

//返回地图页面
RCT_EXPORT_METHOD(backChange) {
//  [[AppDelegate sharedInstances].nav popViewControllerAnimated:YES];

  dispatch_async(dispatch_get_main_queue(), ^{

    NSMutableArray *vc = [AppDelegate sharedInstances].nav.childViewControllers.mutableCopy;
    NSMutableArray *newVC = @[].mutableCopy;
    [newVC addObject:vc[1]];
    [newVC addObject:vc[0]];
    [[AppDelegate sharedInstances].nav setViewControllers:newVC.copy];

  });
  
}

//跳转一级页面移除原生附近药店页面
RCT_EXPORT_METHOD(removeVC) {
  if([AppDelegate sharedInstances].nav.childViewControllers.count>1){
    dispatch_async(dispatch_get_main_queue(), ^{
      NSMutableArray *vc = [AppDelegate sharedInstances].nav.childViewControllers.mutableCopy;
      NSMutableArray *newVC = @[].mutableCopy;
      [newVC addObject:vc[1]];
      [[AppDelegate sharedInstances].nav setViewControllers:newVC.copy];
      
    });
  }
}


//跳转重新定位页面
RCT_EXPORT_METHOD(chooseAddress){
  
  dispatch_async(dispatch_get_main_queue(), ^{
    
    YFWChoseMapViewController *aroundVC = [[YFWChoseMapViewController alloc] init];
    
    [[AppDelegate sharedInstances].nav pushViewController:aroundVC animated:YES];
    
  });
  
}

//获取缓存大小
RCT_EXPORT_METHOD(getCacheSize:(RCTResponseSenderBlock)callback){
  dispatch_async(dispatch_get_main_queue(), ^{
    NSString *path = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES)[0];
    float size=[self folderSizeAtPath:path];
    NSString *sizeValue=[NSString stringWithFormat:@"%0.f",size];
    NSString *sizeString=[NSString stringWithFormat:@"%@%@",sizeValue,@"M"];
    callback(@[sizeString]);
  });
}

//清除缓存
RCT_EXPORT_METHOD(clearCache:(RCTResponseSenderBlock)callback){
  dispatch_async(dispatch_get_main_queue(), ^{
    NSString *cachPath = [NSSearchPathForDirectoriesInDomains(NSCachesDirectory,NSUserDomainMask, YES) objectAtIndex:0];

    NSArray *files = [[NSFileManager defaultManager] subpathsAtPath:cachPath];
    NSLog(@"files :%lu",(unsigned long)[files count]);
    for (NSString *p in files) {
      NSError *error;
      NSString *path = [cachPath stringByAppendingPathComponent:p];
      if ([[NSFileManager defaultManager] fileExistsAtPath:path]) {
        [[NSFileManager defaultManager] removeItemAtPath:path error:&error];
      }
    }
    [self performSelectorOnMainThread:@selector(clearCacheSuccess:) withObject:callback waitUntilDone:YES];
  });
}

//拷贝链接
RCT_EXPORT_METHOD(copyLink:(NSString *)url){
  
  UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
  pasteboard.string = url;
  
}
//读取剪切板内容
RCT_EXPORT_METHOD(getPasteboardString:(RCTResponseSenderBlock)callback){
  
  UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
  callback(@[(pasteboard.string ? : @"")]); 
}

//关闭加载页
RCT_EXPORT_METHOD(closeSplashImage){
  
  [[AppDelegate sharedInstances] closeSplashImage];
  
}

#pragma mark 切换navigation
RCT_EXPORT_METHOD(changeNavigation){

  [[AppDelegate sharedInstances] changeNavigation];

}

//下载图片
RCT_EXPORT_METHOD(copyImage:(NSString *)imagePath){
  
  if (imagePath.length > 0) {
    
    UIImage *image = [UIImage imageWithContentsOfFile:imagePath];
    if (!image) {
      image = [UIImage imageWithData:[NSData dataWithContentsOfURL:[NSURL URLWithString:imagePath]]];
    }
    ALAuthorizationStatus author =[ALAssetsLibrary authorizationStatus];
    if (author == kCLAuthorizationStatusRestricted || author ==kCLAuthorizationStatusDenied)
    {
      [YFWProgressHUD showErrorWithStatus:@"请打开访问照片权限！"];
    }else{
      dispatch_async(dispatch_get_main_queue(), ^{
        UIImageWriteToSavedPhotosAlbum(image,self,@selector(image:didFinishSavingWithError:contextInfo:),NULL);
      });
    }
    
  }
  
}

//有点埋点统计
RCT_EXPORT_METHOD(mobClick:(NSString *)title){
  
  [MobClick event:title];
  
}


//拨打电话
RCT_EXPORT_METHOD(takePhone:(NSString *)title){
  
  if (title.length == 0) return;
  
  NSString *callPhone = [NSString stringWithFormat:@"tel://%@", title];
  if (@available(iOS 10.0, *)) {
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:callPhone] options:@{} completionHandler:nil];
  } else {
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:callPhone]];
  }
  
}


//开启百度SDK
RCT_EXPORT_METHOD(registBaiduManager){
  
  [[AppDelegate sharedInstances] registBaiduManager];
  [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"LaunchViewDone"];
  
}
//检查相机权限
RCT_EXPORT_METHOD(checkCameraAuthorizationStatusCallback:(RCTResponseSenderBlock)callback)
{//
  dispatch_async(dispatch_get_main_queue(), ^{
    AVAuthorizationStatus status = [AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeVideo];
    if (status == AVAuthorizationStatusRestricted || status == AVAuthorizationStatusDenied)
    {
      callback(@[@NO]);
    }  else if(status == AVAuthorizationStatusNotDetermined) { //第一次请求。
      [AVCaptureDevice requestAccessForMediaType:AVMediaTypeVideo completionHandler:^(BOOL granted) {
        dispatch_async(dispatch_get_main_queue(), ^{
          if (granted) {
            callback(@[@YES]);
          } else {
            callback(@[@NO]);
          }
        });
      }];
    } else{
      callback(@[@YES]);
    }
  });
}

//关闭程序
RCT_EXPORT_METHOD(exit){
  
  exit(0);
  
}


//存SSID
RCT_EXPORT_METHOD(saveSsid:(NSString *)ssid){
  
  YFSetObjectForKey(getSafeString(ssid), @"SSID");
  
}
//上传错误崩溃日志开关
RCT_EXPORT_METHOD(uploadExceptionMessageSwitch:(BOOL)status){
  [[NSUserDefaults standardUserDefaults] setBool:status forKey:@"uploadExceptionMessageSwitch"];
}
RCT_EXPORT_METHOD(saveCurrentRouteName:(NSString *)routeInfo) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [AppDelegate sharedInstances].currentRNRouteInfo = routeInfo;
  });
}
//切换应用请求环境
RCT_EXPORT_METHOD(requestChangeToTCP:(BOOL)is_tcp){
  
  [[NSUserDefaults standardUserDefaults] setBool:is_tcp forKey:@"UseTCP"];
  
  if (is_tcp) {
    NSString *tcp_domain = [[NSUserDefaults standardUserDefaults] objectForKey:@"tcp_domain"];
    if (tcp_domain.length > 10) {
      [[NSUserDefaults standardUserDefaults] setObject:tcp_domain forKey:@"yfwDomain"];
    }
    
  }else{
    NSString *http_domain = [[NSUserDefaults standardUserDefaults] objectForKey:@"http_domain"];
    if (http_domain.length > 10) {
      [[NSUserDefaults standardUserDefaults] setObject:http_domain forKey:@"yfwDomain"];
    }
  }
  
}

RCT_EXPORT_METHOD(changeYfwDomain:(NSString *)domain){
  
  [[NSUserDefaults standardUserDefaults] setObject:domain forKey:@"yfwDomain"];
  
}


//CDN传值
RCT_EXPORT_METHOD(setCdnAndport:(NSDictionary *)data){
  
  NSString *cdn_url = getSafeString([data objectForKey:@"cdn_url"]);
  NSInteger tcp_port = [[data objectForKey:@"tcp_port"] integerValue];
  NSInteger tcp_image_port = [[data objectForKey:@"tcp_image_port"] integerValue];
  
  if (cdn_url.length > 5) {
    [[NSUserDefaults standardUserDefaults] setObject:cdn_url forKey:@"yfwCdnUrl"];
  }
  if (tcp_port > 1) {
    [[NSUserDefaults standardUserDefaults] setInteger:tcp_port forKey:@"yfwTcpPort"];
  }
  if (tcp_image_port > 1) {
    [[NSUserDefaults standardUserDefaults] setInteger:tcp_image_port forKey:@"yfwTcpImagePort"];
  }
  
  
}
//CDN传值
RCT_EXPORT_METHOD(setSystemConfigInfo:(NSDictionary *)data){
  [AppDelegate sharedInstances].systemConfigInfo = data;

}
#pragma mark 深度连接schemeURL，APP不在进程种情况，RN页面加载完成后，RN调用获取URL
RCT_EXPORT_METHOD(get_schemeURL:(RCTResponseSenderBlock)callback){
  dispatch_async(dispatch_get_main_queue(), ^{
    NSString *scheme_url = [AppDelegate sharedInstances].scheme_url;
    if (scheme_url.length > 0) {
      callback(@[scheme_url]);
      [AppDelegate sharedInstances].scheme_url = @"";
    }
  });
  
}
#pragma mark 推送获取infoDic，APP不在进程种情况，RN页面加载完成后，RN调用获取dic
RCT_EXPORT_METHOD(get_notificationDic:(RCTResponseSenderBlock)callback){
  dispatch_async(dispatch_get_main_queue(), ^{
    NSDictionary *notification_dic = [AppDelegate sharedInstances].notification_dic;
    if (notification_dic) {
      callback(@[notification_dic]);
      [AppDelegate sharedInstances].notification_dic = nil;
    }
  });
}

#pragma mark 获取支付结果，APP不在进程种情况，RN页面加载完成后，RN调用获取dic
RCT_EXPORT_METHOD(get_payInfoDic:(RCTResponseSenderBlock)callback){
  dispatch_async(dispatch_get_main_queue(), ^{
    NSDictionary *payResultInfo_dic = [AppDelegate sharedInstances].payResultInfo;
    if (payResultInfo_dic) {
      callback(@[payResultInfo_dic]);
      [AppDelegate sharedInstances].payResultInfo = nil;
    }
  });
  
}

#pragma mark 获取3d touch
RCT_EXPORT_METHOD(get_3dTouchDic:(RCTResponseSenderBlock)callback){
  dispatch_async(dispatch_get_main_queue(), ^{
    NSDictionary *threeTouch_dic = [AppDelegate sharedInstances].threeTouch_dic;
    if (threeTouch_dic) {
      callback(@[threeTouch_dic]);
      [AppDelegate sharedInstances].threeTouch_dic = nil;
    }
  });
}


#pragma mark APP每次从后台唤醒后，更新定位。
RCT_EXPORT_METHOD(appUpdatingLocation){
  [[[AppDelegate sharedInstances] getBaiduManager].locService startUpdatingLocation];
}

#pragma mark 跳转tcp_host切换页
RCT_EXPORT_METHOD(changeTcpHost){
    dispatch_async(dispatch_get_main_queue(), ^{
      changeEnvironmentTableViewController *vc = [[changeEnvironmentTableViewController alloc] init];
      [[AppDelegate sharedInstances].nav pushViewController:vc animated:YES];
    });
}

//一键登录获取号
RCT_EXPORT_METHOD(isOneLoginPreGetTokenSuccess:(RCTResponseSenderBlock)callback){
    // 建议APP启动时就进行预取号，若是用户首次安装APP，网络未开启，在此处肯定无法预取号成功，故，在需要进入授权页面的页面的viewDidLoad中也需要进行预取号
  dispatch_async(dispatch_get_main_queue(), ^{
    if ([[UIDevice currentDevice].model isEqualToString:@"iPad"]) {
      //审核人员用的iPad  一键登录的功能禁用
      callback(@[@NO]);
      return ;
    }
    [YFWProgressHUD setDefaultMaskType:YFWProgressHUDMaskTypeBlack];
    [YFWProgressHUD setBackgroundColor:PP_UIColor_RGBA(0, 0, 0, 0.5)];
    [YFWProgressHUD setForegroundColor:[UIColor colorWithRed:31/255.0f green:219/255.0f blue:155/255.0f alpha:1] ];
    [YFWProgressHUD showWithStatus:@"跳转中..."];
    [OneLogin registerWithAppID:@"6f7f603a336a40cc3f4237268fc4dd8c"];
    [OneLogin preGetTokenWithCompletion:^(NSDictionary * _Nonnull sender) {
      [YFWProgressHUD dismiss];
      if (sender.count > 0 && sender[@"status"] && 200 == [sender[@"status"] integerValue]) {
        callback(@[@YES]);
      }else{
        callback(@[@NO]);
      }
    }];
    
  });

}

//一键登录页
RCT_EXPORT_METHOD(oneLogin:(BOOL)needCallBack success:(RCTResponseSenderBlock)successBack error:(RCTResponseSenderBlock)errorBack){
  dispatch_async(dispatch_get_main_queue(), ^{
    LoginViewController *vc = [[LoginViewController alloc] init];
    vc.needCallBack = needCallBack;
    vc.error_block = ^(id _Nullable result) {
      errorBack(@[result]);
    };
    vc.success_block = ^(id _Nullable result) {
      successBack(@[result]);
    };
    [[AppDelegate sharedInstances].nav pushViewController:vc animated:YES];
  });
  
}

- (void)image:(UIImage *)image didFinishSavingWithError:(NSError *)error contextInfo:(void *)contextInfo{
  NSString *msg = nil ;
  if(error != NULL){
    msg = @"保存图片失败" ;
    [YFWProgressHUD showErrorWithStatus:msg];
  }else{
    msg = @"保存图片成功" ;
    [YFWProgressHUD showSuccessWithStatus:msg];
  }
}

- (void)configNotificationSetting:(RCTResponseSenderBlock)callback{
  
  dispatch_async(dispatch_get_main_queue(), ^{
    if ([[UIApplication sharedApplication] currentUserNotificationSettings].types==UIUserNotificationTypeNone) {
      NSString *remindDay = getSafeString(YFObjectForKey(@"remindDay"));
      NSString *remindWeek = [getSafeString(YFObjectForKey(@"remindWeek")) isEqualToString:@""]?[YFDateTimeGetter weekInMonth]:getSafeString(YFObjectForKey(@"remindWeek"));
      NSString *remindCount = getSafeString(YFObjectForKey(@"remindCount"));
      if ([remindWeek isEqualToString:[YFDateTimeGetter weekInMonth]]&&![remindCount isEqualToString:@"3"]){
        if (![remindDay isEqualToString:[YFDateTimeGetter dayInWeek]]){
          NSString *num = YFObjectForKey(@"remindCount");
          num = [NSString stringWithFormat:@"%d",[YFObjectForKey(@"remindCount") intValue]+1];
          YFSetObjectForKey(num, @"remindCount");
          YFSetObjectForKey([YFDateTimeGetter dayInWeek], @"remindDay");
          YFSetObjectForKey([YFDateTimeGetter weekInMonth], @"remindWeek");
          YFSynchronize;
          if ([[UIApplication sharedApplication] currentUserNotificationSettings].types==UIUserNotificationTypeNone) {
            callback(@[[NSNull null],@[@"YES"]]);
          }
        }
      }else{
        if(![remindWeek isEqualToString:[YFDateTimeGetter weekInMonth]]){
          YFSetObjectForKey(@"0", @"remindCount");
          YFSetObjectForKey([YFDateTimeGetter weekInMonth], @"remindWeek");
          YFSynchronize;
          [self configNotificationSetting:callback];
        }
      }
    }
  });
  
}
//通常用于删除缓存的时，计算缓存大小
//单个文件的大小
- (long long) fileSizeAtPath:(NSString*) filePath{
  NSFileManager* manager = [NSFileManager defaultManager];
  if ([manager fileExistsAtPath:filePath]){
    return [[manager attributesOfItemAtPath:filePath error:nil] fileSize];
  }
  return 0;
}
//遍历文件夹获得文件夹大小，返回多少M
- (float ) folderSizeAtPath:(NSString*) folderPath{
  NSFileManager* manager = [NSFileManager defaultManager];
  if (![manager fileExistsAtPath:folderPath]) return 0;
  NSEnumerator *childFilesEnumerator = [[manager subpathsAtPath:folderPath] objectEnumerator];
  NSString* fileName;
  long long folderSize = 0;
  while ((fileName = [childFilesEnumerator nextObject]) != nil){
    NSString* fileAbsolutePath = [folderPath stringByAppendingPathComponent:fileName];
    folderSize += [self fileSizeAtPath:fileAbsolutePath];
  }
  return folderSize/(1024.0*1024.0);
}
-(void)clearCacheSuccess:(RCTResponseSenderBlock)block
{
  NSLog(@"清理成功");
  block(@[@"success"]);
}
RCT_EXPORT_METHOD(sendMessageWithRecipients:(NSArray <NSString *>*)recipients body:(NSString *)body) {
  
  dispatch_async(dispatch_get_main_queue(), ^{
    MFMessageComposeViewController *messageVC = [[MFMessageComposeViewController alloc] init];
    messageVC.recipients = recipients;
    messageVC.body = body;
    messageVC.messageComposeDelegate = self;
    [[AppDelegate sharedInstances].nav presentViewController:messageVC animated:YES completion:nil];
  });
}
#pragma mark MFMessageComposeViewControllerDelegate
- (void)messageComposeViewController:(MFMessageComposeViewController *)controller didFinishWithResult:(MessageComposeResult)result {
  switch (result) {
    case MessageComposeResultSent:
    {
      NSLog(@"send");
      dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(3 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [controller dismissViewControllerAnimated:YES completion:nil];
      });
      break;
    }
    case MessageComposeResultCancelled:
      NSLog(@"cancelled");
      [controller dismissViewControllerAnimated:YES completion:nil];
      break;
    case MessageComposeResultFailed:
      NSLog(@"failed");
      break;
  }
}
- (YFWMapHelperManager *)mapHelperManager {
  if (!_mapHelperManager) {
    _mapHelperManager = [YFWMapHelperManager new];
  }
  return _mapHelperManager;
}
@end
