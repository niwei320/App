//
//  SobotManager.m
//  YaoFang
//
//  Created by 姜明均 on 17/3/7.
//  Copyright © 2017年 ospreyren. All rights reserved.
//

#import "SobotManager.h"
#import <SobotKit/SobotKit.h>
#import <UserNotifications/UserNotifications.h>
#import "SQCWebViewController.h"
#define SYSTEM_VERSION_GRATERTHAN_OR_EQUALTO(v)  ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] != NSOrderedAscending)

@interface SobotManager ()<UIApplicationDelegate,UNUserNotificationCenterDelegate>

@end

@implementation SobotManager

static SobotManager* _manager = nil;
static bool is_first = YES;

+ (instancetype)getManager{
    
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        
        _manager = [[SobotManager alloc] init];
        
    });

    return _manager;
    
}

- (void)register:(UIApplication *)application delegate:(id)delegate{
    
    if (SYSTEM_VERSION_GRATERTHAN_OR_EQUALTO(@"10")) {
        UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
        center.delegate = delegate;
        [center requestAuthorizationWithOptions:(UNAuthorizationOptionSound | UNAuthorizationOptionAlert |UNAuthorizationOptionBadge) completionHandler:^(BOOL granted, NSError * _Nullable error) {
            if (!error) {
              dispatch_async(dispatch_get_main_queue(), ^{
                [[UIApplication sharedApplication] registerForRemoteNotifications];
              });
            }
        }];
    }else{
        [self registerPush:application];
    }
    
    NSLog(@"===智齿获取AppKey===");
    if([ZCLibClient getZCLibClient].libInitInfo == nil){
        [ZCLibClient getZCLibClient].libInitInfo = [ZCLibInitInfo new];
    }
    // 获取APPKEY
    [[ZCLibClient getZCLibClient].libInitInfo setApp_key:self.appKey];
    //初始化SDK
    [[ZCLibClient getZCLibClient] initSobotSDK:self.appKey host:nil result:^(id object) {
      NSLog(@"初始化完成%@",object);
    }];
    //开发环境
    [[ZCLibClient getZCLibClient] setIsDebugMode:NO];
    //自动提醒
    [[ZCLibClient getZCLibClient] setAutoNotification:YES];
    //错误日志收集
    [ZCLibClient setZCLibUncaughtExceptionHandler];
    // 设置切换到后台自动断开长连接，不会影响APP后台挂起时长 进入前台会自动重连，断开期间消息会发送apns推送
    [ZCLibClient getZCLibClient].autoCloseConnect = YES;
}


- (void)startChatView:(UIViewController *)superVC{

    if (is_first) {
        //获取APPKEY
//        [[ZCLibClient getZCLibClient] setAppKey:self.appKey];
        is_first = NO;
    }
    
    ZCLibInitInfo *initInfo = [ZCLibInitInfo new];
    //Appkey    *必填*
    initInfo.app_key  = self.appKey;//appKey;
    // 用户id，用于标识用户
//    initInfo.userId = self.ssid;
    initInfo.partnerid = self.ssid;
    [self customUserInformationWith:initInfo];
    //配置UI
    ZCKitInfo *uiInfo=[ZCKitInfo new];
//    uiInfo.info=initInfo;
    //自定义UI(设置背景颜色相关)
    [self customerUI:uiInfo];
    
    //之定义商品和留言页面的相关UI
    if (self.detail) {
        [self customerGoodAndLeavePageWithParameter:uiInfo];
    }
    
    //设置启动参数
    [ZCSobot setShowDebug:NO];
    NSString *zcVersion = [ZCSobot getVersion];
    NSLog(@"**************%@",zcVersion);
    [[ZCLibClient getZCLibClient] setLibInitInfo:initInfo];
  
    [ZCSobotApi openZCChat:uiInfo with:superVC target:nil pageBlock:^(id  _Nonnull object, ZCPageBlockType type) {
      if(type==ZCPageBlockGoBack){
        NSLog(@"点击了关闭按钮");
        superVC.toolbarItems = nil;
        NSMutableArray *vc = [AppDelegate sharedInstances].nav.childViewControllers.mutableCopy;
        NSMutableArray *newVC = @[].mutableCopy;
        for (int i = 0; i<vc.count-1; i++) {
          [newVC addObject:vc[i]];
        }
        [[AppDelegate sharedInstances].nav setViewControllers:newVC.copy];

      }
    } messageLinkClick:^BOOL(NSString * _Nonnull link) {
        SQCWebViewController *webView = nil;
        webView = [[SQCWebViewController alloc] initWithURLString:link];
        webView.showPageTitles = NO;
        webView.navigationButtonsHidden = YES;
        webView.title = @"详情";
        [superVC.navigationController pushViewController:webView animated:YES];
        return YES;
    }];
    
}


-(void)registerPush:(UIApplication *)application{
    // ios8后，需要添加这个注册，才能得到授权
    if ([[UIApplication sharedApplication] respondsToSelector:@selector(registerUserNotificationSettings:)]) {
        //IOS8
        //创建UIUserNotificationSettings，并设置消息的显示类类型
        UIUserNotificationSettings *notiSettings =
        [UIUserNotificationSettings settingsForTypes:
         (UIUserNotificationTypeBadge |
          UIUserNotificationTypeAlert |
          UIRemoteNotificationTypeSound) categories:nil];
        
        [application registerUserNotificationSettings:notiSettings];
        
    } else{ // ios7
        [application
         registerForRemoteNotificationTypes:(UIRemoteNotificationTypeBadge|UIRemoteNotificationTypeSound|
              UIRemoteNotificationTypeAlert)];
    }
}

// 自定义用户信息参数
- (void)customUserInformationWith:(ZCLibInitInfo*)initInfo{


    
}
// 设置UI部分
-(void) customerUI:(ZCKitInfo *) kitInfo{
    
    kitInfo.isCloseAfterEvaluation = YES;
    // 点击返回是否触发满意度评价（符合评价逻辑的前提下）
    kitInfo.isOpenEvaluation = YES;
    // 是否显示语音按钮
    kitInfo.isOpenRecord = YES;
    // 是否显示转人工按钮
    kitInfo.isShowTansfer = YES;
    // 评价完人工是否关闭会话
    kitInfo.isCloseAfterEvaluation = NO;
    // 隐藏文件，默认NO(不隐藏)
    kitInfo.hideMenuFile = YES;
    // 聊天页面底部加号中功能：隐藏留言，默认NO(不隐藏)
    kitInfo.hideMenuLeave = YES;
  
    kitInfo.isShowTansfer = YES;
  
    kitInfo.goodSendBtnColor = [UIColor yf_greenColor_new];
//    kitInfo.customBannerColor  = [UIColor whiteColor];
    kitInfo.topViewTextColor  =  [UIColor blackColor];
    kitInfo.topBackNolImg = @"backgreen.png";
    kitInfo.moreBtnNolImg = @"moreGray.png";
    kitInfo.topBackTitle = @"";

    kitInfo.rightChatColor = [UIColor yf_greenColor_new];

    kitInfo.submitEvaluationColor = [UIColor blackColor];
//    kitInfo.commentCommitButtonBgColor = [UIColor yf_greenColor_new];
    
}

// 自定义参数 商品信息相关
- (void)customerGoodAndLeavePageWithParameter:(ZCKitInfo *)uiInfo{
  
    NSString *imageUrl = [self.detail objectForKey:@"image_url"]?:@"";
    NSString *title = [self.detail objectForKey:@"title"]?:@"";
    NSString *desc = [self.detail objectForKey:@"desc"]?:@"";
    NSString *goods_id = [self.detail objectForKey:@"goods_id"]?:@"";
  
    // 商品信息自定义
    ZCProductInfo *productInfo = [ZCProductInfo new];
    productInfo.thumbUrl = imageUrl;
    productInfo.title = title;
    productInfo.desc = desc;
    productInfo.link = [NSString stringWithFormat:@"https://m.%@/detail-%@.html",[YFWSettingUtility yfwDomain],goods_id];
  
    [[NSUserDefaults standardUserDefaults] setObject:productInfo.thumbUrl forKey:@"goods_IMG"];
//    [[NSUserDefaults standardUserDefaults] setObject:productInfo.title forKey:@"goods_Title"];
    [[NSUserDefaults standardUserDefaults] setObject:productInfo.desc forKey:@"goods_SENDMGS"];
    [[NSUserDefaults standardUserDefaults] setObject:productInfo.label forKey:@"glabel_Text"];
    [[NSUserDefaults standardUserDefaults] setObject:productInfo.link forKey:@"gPageUrl_Text"];
    uiInfo.productInfo = productInfo;

    // 设置电话号和昵称（留言界面的显示）
//    uiInfo.isAddNickName = YES;
//    uiInfo.isShowNickName = YES;
    
}

- (void)getUnreadNumber:(UILabel *)label{

    //直接获取未读消息数
    int unread = [[ZCLibClient getZCLibClient] getUnReadMessage];
    label.text =[NSString stringWithFormat:@"%d",unread] ;
    
    //启动时监听
//    ZCKitInfo *uiInfo = [ZCKitInfo new];
//    [uiInfo setReceivedBlock:^(id message,int nLeft){
//        NSLog(@"当前消息数：%d \n %@",nLeft,message);
//
//        label.text =[NSString stringWithFormat:@"%d",nLeft] ;
//    }];
    [ZCLibClient getZCLibClient].receivedBlock = ^(id message, int nleft, NSDictionary *object) {
        NSLog(@"未读消息数量：\n%d,%@",nleft,message);
        label.text =[NSString stringWithFormat:@"%d",nleft];
    };

    
}



#pragma mark - Delegate

-(void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler{
    NSLog(@"Userinfo %@",notification.request.content.userInfo);
    
    //功能：可设置是否在应用内弹出通知
    completionHandler(UNNotificationPresentationOptionAlert);
    
}

#pragma mark - AppKey
- (NSString *)appKey{
    return @"758df5f224d94b48b2038635bbf2bf05";
}


@end
