//
//  LoginViewController.m
//  OneLoginExample
//
//  Created by noctis on 2019/8/8.
//  Copyright © 2019 geetest. All rights reserved.
//

#import "LoginViewController.h"
#import <OneLoginSDK/OneLoginSDK.h>
#import "AppDelegate.h"
#import <CoreTelephony/CTCellularData.h>
#import "YFWEventManager.h"

#define IS_IPHONE_X  ([UIScreen instancesRespondToSelector:@selector(currentMode)] ? (CGSizeEqualToSize(CGSizeMake(1125, 2436), [[UIScreen mainScreen] currentMode].size) || CGSizeEqualToSize(CGSizeMake(828, 1792), [[UIScreen mainScreen] currentMode].size) || CGSizeEqualToSize(CGSizeMake(1242, 2688), [[UIScreen mainScreen] currentMode].size)) : NO)
#define kScreenHeight   [[UIScreen mainScreen] bounds].size.height
#define kScreenWidth    [[UIScreen mainScreen] bounds].size.width
#define kAppDelegate ((AppDelegate *)[[UIApplication sharedApplication] delegate])

API_AVAILABLE(ios(9.0))
@interface LoginViewController () <OneLoginDelegate, UIAlertViewDelegate>


@property (nonatomic, strong) CTCellularData *cellularData;

@end

@implementation LoginViewController

- (void)dealloc {
    NSLog(@"------------- %@ %@ -------------", [self class], NSStringFromSelector(_cmd));
}



- (IBAction)clickBackMethod:(UIButton *)sender {
  
  [self.navigationController popToRootViewControllerAnimated:YES];
  
}

- (void)viewDidDisappear:(BOOL)animated{
    [super viewDidDisappear:animated];
    if (@available(iOS 9.0, *)){
        _cellularData.cellularDataRestrictionDidUpdateNotifier = nil;
        _cellularData = nil;
    }
}

- (void)viewDidLoad {
    [super viewDidLoad];
    if (@available(iOS 9.0, *)) {
      _cellularData = [[CTCellularData alloc] init];
      __weak typeof(self) wself = self;
      _cellularData.cellularDataRestrictionDidUpdateNotifier = ^(CTCellularDataRestrictedState state) {
        NSString *authority = @"Unknown";
        if (state == kCTCellularDataRestricted) {
          authority = @"Restricted";
          dispatch_async(dispatch_get_main_queue(), ^{
            UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"温馨提示"
                                                            message:@"您必须打开移动网络，否则无法成功预取号，去设置移动网络？"
                                                           delegate:wself
                                                  cancelButtonTitle:@"取消"
                                                  otherButtonTitles:@"确定", nil];
            [alert show];
          });
        } else if(state == kCTCellularDataNotRestricted) {
          authority = @"NotRestricted";
        }
      };
    }
    [OneLogin setDelegate:self];
    [self normalLoginAction];
}

#pragma mark - Screen Size

- (CGFloat)ol_screenWidth {
    return MIN([UIScreen mainScreen].bounds.size.width, [UIScreen mainScreen].bounds.size.height);
}

- (CGFloat)ol_screenHeight {
    return MAX([UIScreen mainScreen].bounds.size.width, [UIScreen mainScreen].bounds.size.height);
}

#pragma mark - Action

- (void)normalLoginAction {
    // 若不需要自定义UI，可不设置任何参数，使用SDK默认配置即可
    OLAuthViewModel *viewModel = [OLAuthViewModel new];
  
    // --------------状态栏设置 -------------------
    viewModel.statusBarStyle = UIStatusBarStyleDefault;
    
    // -------------- 授权页面背景图片设置 -------------------
//    viewModel.backgroundImage = [UIImage imageNamed:@"login_back"];
//    viewModel.landscapeBackgroundImage = [UIImage imageNamed:@"login_back_landscape"];
    
    // -------------- 导航栏设置 -------------------
    viewModel.naviTitle = [[NSAttributedString alloc] initWithString:@""
                                                          attributes:@{NSForegroundColorAttributeName : UIColor.whiteColor,
                                                                       NSFontAttributeName : [UIFont boldSystemFontOfSize:18]
                                                                       }];  // 导航栏标题
    viewModel.naviBgColor = UIColor.whiteColor; // 导航栏背景色
    viewModel.naviBackImage = [UIImage imageNamed:@"back"]; // 导航栏返回按钮
//    viewModel.naviHidden = YES;  // 导航栏是否隐藏，默认不隐藏，注意，此处导航栏隐藏，不会隐藏返回按钮和标题，另，页面其他控件距顶部偏移，导航栏隐藏时，为到状态栏顶部的距离，导航栏不隐藏时，为到导航栏底部的距离
    viewModel.backButtonHidden = NO; // 是否隐藏返回按钮，默认不隐藏
    OLRect backButtonRect = {0, 0, 0, 0, 0, 0, {0, 0}}; // 返回按钮偏移、大小设置，偏移量和大小设置值需大于0，否则取默认值，默认可不设置
    viewModel.backButtonRect = backButtonRect;
    UIButton *rightBarButton = [UIButton buttonWithType:UIButtonTypeCustom];
    [rightBarButton setTitle:@"账号密码登录" forState:UIControlStateNormal];
    [rightBarButton setTitleColor:[UIColor colorWithRed:31/255.0f green:219/255.0f blue:155/255.0f alpha:1] forState:UIControlStateNormal];
    [rightBarButton.titleLabel setFont:[UIFont boldSystemFontOfSize:16]];
    [rightBarButton addTarget:self action:@selector(doneAction:) forControlEvents:UIControlEventTouchUpInside];
    viewModel.naviRightControl = rightBarButton;    // 导航栏右侧控制视图
    
    // -------------- logo设置 -------------------
    viewModel.appLogo = [UIImage imageNamed:@""];  // 自定义logo图片
    OLRect logoRect = {0, 0, 0, 20, 0, 0, {0, 0}}; // logo偏移、大小设置，偏移量和大小设置值需大于0，否则取默认值，默认可不设置，logo大小默认为图片大小
    viewModel.logoRect = logoRect;
    viewModel.logoHidden = YES; // 是否隐藏logo，默认不隐藏
    viewModel.logoCornerRadius = 0; // logo圆角，默认为0
    
    // -------------- 手机号设置 -------------------
    viewModel.phoneNumColor = UIColor.blackColor; // 颜色
    viewModel.phoneNumFont = [UIFont boldSystemFontOfSize:25]; // 字体
    OLRect phoneNumRect = {IS_IPHONE_X?44+50:44+50, 0, 0, 0, 0, 0, {0, 0}};  // 手机号偏移设置，手机号不支持设置宽高
    viewModel.phoneNumRect = phoneNumRect;
    
    
    // -------------- slogan设置 -------------------
    viewModel.sloganTextColor =  [UIColor colorWithRed:153/255.0f green:153/255.0f blue:153/255.0f alpha:1]; // slogan颜色
    viewModel.sloganTextFont = [UIFont systemFontOfSize:12]; // slogan字体
    OLRect sloganRect = {IS_IPHONE_X?44+90:44+90, 0, 0, 0, 0, 0, {0, 0}};  // slogan偏移、大小设置，偏移量和大小设置值需大于0，否则取默认值，默认可不设置
    viewModel.sloganRect = sloganRect;
    
    
    // -------------- 授权登录按钮设置 -------------------
    viewModel.authButtonImages = @[
                                   [UIImage imageNamed:@"login_botton"],
                                   [UIImage imageNamed:@"login_botton"],
                                   [UIImage imageNamed:@"login_botton"]
                                   ];   // 授权按钮背景图片
    viewModel.authButtonTitle = [[NSAttributedString alloc] initWithString:@"一键登录"
                                                                attributes:@{NSForegroundColorAttributeName : UIColor.whiteColor,
                                                                             NSFontAttributeName : [UIFont boldSystemFontOfSize:16]
                                                                             }];  // 导航栏标题
    OLRect authButtonRect = {IS_IPHONE_X?44+200:44+200, 0, 0, 0, 0, 0, {300, 60}};  // 授权按钮偏移、大小设置，偏移量和大小设置值需大于0，否则取默认值，默认可不设置
    viewModel.authButtonRect = authButtonRect;
    viewModel.authButtonCornerRadius = 25; // 授权按钮圆角，默认为0
    
    
    // -------------- 切换账号设置 -------------------
    viewModel.switchButtonColor = [UIColor colorWithRed:31/255.0f green:219/255.0f blue:155/255.0f alpha:1]; // 切换按钮颜色
    viewModel.switchButtonFont = [UIFont systemFontOfSize:16];  // 切换按钮字体
    viewModel.switchButtonText = @"切换账号";  // 切换按钮文案
    viewModel.switchButtonHidden = NO; // 是否隐藏切换按钮，默认不隐藏
    OLRect switchButtonRect = {IS_IPHONE_X?44+270:44+270, 0, 0, 0, 0, 0, {0, 0}};  // 切换按钮偏移、大小设置，偏移量和大小设置值需大于0，否则取默认值，默认可不设置
    viewModel.switchButtonRect = switchButtonRect;
    
    
    
    // -------------- 服务条款设置 -------------------
    viewModel.defaultCheckBoxState = NO; // 是否默认选择同意服务条款，默认不勾选
    viewModel.checkedImage = [UIImage imageNamed:@"selected"]; // 复选框选中状态图片
    viewModel.uncheckedImage = [UIImage imageNamed:@"unselected"]; // 复选框未选中状态图片
    viewModel.checkBoxSize = CGSizeMake(12, 12); // 复选框尺寸，默认为12*12
    // 隐私条款文字属性
    NSMutableParagraphStyle *paragraphStyle = [[NSMutableParagraphStyle alloc] init];
    paragraphStyle.lineSpacing = 1.33;
    paragraphStyle.alignment = NSTextAlignmentLeft;
    paragraphStyle.paragraphSpacing = 0.0;
    paragraphStyle.lineBreakMode = NSLineBreakByWordWrapping;
    paragraphStyle.firstLineHeadIndent = 0.0;
    viewModel.termTextColor = UIColor.grayColor;
    viewModel.privacyTermsAttributes = @{
                                         NSForegroundColorAttributeName : [UIColor colorWithRed:31/255.0f green:219/255.0f blue:155/255.0f alpha:1],
                                         NSParagraphStyleAttributeName : paragraphStyle,
                                         NSFontAttributeName : [UIFont systemFontOfSize:12]
                                         };
    // 额外自定义服务条款，注意index属性，默认的index为0，SDK会根据index对多条服务条款升序排列，假如想设置服务条款顺序为 自定义服务条款1 默认服务条款 自定义服务条款2，则，只需将自定义服务条款1的index设为-1，自定义服务条款2的index设为1即可
    OLPrivacyTermItem *item1 = [[OLPrivacyTermItem alloc] initWithTitle:@"药房网用户个人服务协议"
                                                                linkURL:[NSURL URLWithString:@"https://m.yaofangwang.com/app/agreement.html?os=ios"]
                                                                  index:-1];
    viewModel.additionalPrivacyTerms = @[item1];
    OLRect termsRect = {IS_IPHONE_X?44+330:44+330, 0, 0, 0, 0, 0, {0, 0}};  // 服务条款偏移、大小设置，偏移量和大小设置值需大于0，否则取默认值，默认可不设置
    viewModel.termsRect = termsRect;
    viewModel.auxiliaryPrivacyWords = @[@"登录注册并视为同意《", @"》和《",@"", @"》并使用本机号码登录"];   // 条款之外的文案，默认可不设置
    
    
    // -------------- 服务条款H5页面导航栏设置 -------------------
    viewModel.webNaviTitle = [[NSAttributedString alloc] initWithString:@"服务条款"
                                                             attributes:@{NSForegroundColorAttributeName : UIColor.whiteColor,
                                                                          NSFontAttributeName : [UIFont boldSystemFontOfSize:18]
                                                                          }];  // 服务条款H5页面导航栏标题
    viewModel.webNaviBgColor = [UIColor colorWithRed:31/255.0f green:219/255.0f blue:155/255.0f alpha:1]; // 服务条款导航栏背景色
    viewModel.webNaviHidden = NO;   // 服务条款导航栏是否隐藏
    
    // -------------- 授权页面支持的横竖屏设置 -------------------
    viewModel.supportedInterfaceOrientations = UIInterfaceOrientationMaskAllButUpsideDown; // 默认为UIInterfaceOrientationMaskPortrait
  
    __weak typeof(self) wself = self;
    // -------------- 自定义UI设置，如，可以在授权页面添加三方登录入口 -------------------
    viewModel.customUIHandler = ^(UIView * _Nonnull customAreaView) {
      NSString *localVersion = getSafeString([[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"]);
        NSDictionary *systemConfigInfo = [AppDelegate sharedInstances].systemConfigInfo;
      if (systemConfigInfo && [[systemConfigInfo objectForKey:@"app_audit_version"] isEqualToString:localVersion]) {
        
      } else {
        UIView *customView = [[UIButton alloc] initWithFrame:CGRectMake(0, IS_IPHONE_X?kScreenHeight-100-88:kScreenHeight-100-64, kScreenWidth, 100)];
          [customAreaView addSubview:customView];
          
          UILabel *lb = [[UILabel alloc] initWithFrame:CGRectMake(0, 0, 120, 20)];
          lb.text = @"第三方账号登录";
          lb.textColor = [UIColor grayColor];
          lb.font = [UIFont boldSystemFontOfSize:12];
          lb.textAlignment = NSTextAlignmentCenter;
          [customView addSubview:lb];
          lb.center = CGPointMake(customView.center.x, 10);
        
          UIView *bottonView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, 235, 40)];
          [customView addSubview:bottonView];
          bottonView.center = CGPointMake(customView.center.x, 50);
        
          UIButton *customBtn1 = [[UIButton alloc] initWithFrame:CGRectMake(0, 0, 40, 40)];
          customBtn1.tag = 1;
          [customBtn1 setImage:[UIImage imageNamed:@"user_center_login1.png"] forState:UIControlStateNormal];
          [customBtn1 addTarget:wself action:@selector(dismissAuthVC:) forControlEvents:UIControlEventTouchUpInside];
          [bottonView addSubview:customBtn1];
        
          UIButton *customBtn2 = [[UIButton alloc] initWithFrame:CGRectMake(65, 0, 40, 40)];
          customBtn2.tag = 2;
          [customBtn2 setImage:[UIImage imageNamed:@"user_center_login2.png"] forState:UIControlStateNormal];
          [customBtn2 addTarget:wself action:@selector(dismissAuthVC:) forControlEvents:UIControlEventTouchUpInside];
          [bottonView addSubview:customBtn2];
        
          UIButton *customBtn3 = [[UIButton alloc] initWithFrame:CGRectMake(130, 0, 40, 40)];
          customBtn3.tag = 3;
          [customBtn3 setImage:[UIImage imageNamed:@"user_center_login3.png"] forState:UIControlStateNormal];
          [customBtn3 addTarget:wself action:@selector(dismissAuthVC:) forControlEvents:UIControlEventTouchUpInside];
          [bottonView addSubview:customBtn3];
        
          UIButton *customBtn4 = [[UIButton alloc] initWithFrame:CGRectMake(195, 0, 40, 40)];
          customBtn4.tag = 4;
          [customBtn4 setImage:[UIImage imageNamed:@"user_center_login4.png"] forState:UIControlStateNormal];
          [customBtn4 addTarget:wself action:@selector(dismissAuthVC:) forControlEvents:UIControlEventTouchUpInside];
          [bottonView addSubview:customBtn4];
      }
        
    
    };
    
    // -------------- 授权页面点击登录按钮之后的loading设置 -------------------
    viewModel.loadingViewBlock = ^(UIView * _Nonnull containerView) {
        if ([OneLogin isProtocolCheckboxChecked]) {
          [YFWProgressHUD setDefaultMaskType:YFWProgressHUDMaskTypeBlack];
          [YFWProgressHUD setBackgroundColor:PP_UIColor_RGBA(0, 0, 0, 0.5)];
          [YFWProgressHUD setForegroundColor:[UIColor colorWithRed:31/255.0f green:219/255.0f blue:155/255.0f alpha:1] ];
          [YFWProgressHUD showWithStatus:@"登录中..."];
        }
    };
    
    viewModel.stopLoadingViewBlock = ^(UIView * _Nonnull containerView) {
        [YFWProgressHUD dismiss];
    };
    
    // -------------- 授权页面未勾选服务条款时点击登录按钮的提示 -------------------
    viewModel.notCheckProtocolHint = @"请您先同意服务条款";  // 授权页面未勾选服务条款时点击登录按钮的提示，默认为"请同意服务条款"
  
  [OneLogin requestTokenWithViewController:wself viewModel:viewModel completion:^(NSDictionary * _Nullable result) {
    NSLog(@"requestTokenWithViewController result: %@", result);
    [wself finishRequestingToken:result];
  }];
}

- (void)doneAction:(UIButton *)button {
  [OneLogin dismissAuthViewController:nil];
  [self.navigationController popToRootViewControllerAnimated:YES];
  if (self.error_block) {
    self.error_block(@{@"errorCode":@"loginByPsw"});
  }
}

- (void)finishRequestingToken:(NSDictionary *)result {
    if (result.count > 0 && result[@"status"] && 200 == [result[@"status"] integerValue]) {
        NSString *token = result[@"token"];
        NSString *appID = result[@"appID"];
        NSString *processID = result[@"processID"];
        NSString *authcode = [NSString stringWithFormat:@"%@", result[@"gwAuth"]];
        [self validateTokenAndGetLoginInfo:token appID:appID processID:processID authcode:authcode];
    }else{
        [YFWProgressHUD showErrorWithStatus:@"一键登录失败，请切换登录方式"];
    }
}

// 使用token获取用户的登录信息
- (void)validateTokenAndGetLoginInfo:(NSString *)token appID:(NSString *)appID processID:(NSString *)processID authcode:authcode{
  // 根据用户自己接口构造
  NSMutableDictionary *params = [[NSMutableDictionary alloc] init];
  [params setValue:@"guest.account.login"      forKey:@"__cmd"];
  [params setValue:processID  forKey:@"process_id"];
  [params setValue:token      forKey:@"token"];
  [params setValue:@1      forKey:@"is_onelogin"];
  [params setValue:authcode forKey:@"authcode"];
  
  if ([AppDelegate sharedInstances].erpUserInfo) {
    [params setValuesForKeysWithDictionary:[AppDelegate sharedInstances].erpUserInfo];
  }
  @try {
    YFWSocketManager *manager = [YFWSocketManager shareManager];
    [manager requestAsynParameters:params success:^(id responseObject) {
      [YFWProgressHUD dismiss];
      if (responseObject) {
        if ([responseObject[@"code"] intValue] == 1 || [responseObject[@"code"] intValue] == -100) {
          if(self.success_block){
            self.success_block(responseObject);
          }
          [OneLogin dismissAuthViewController:nil];
          [self.navigationController popToRootViewControllerAnimated:YES];
        }else{
          [YFWProgressHUD showErrorWithStatus:@"一键登录失败，请切换登录方式"];
        }
      }
    } failure:^(NSError *error) {
      [YFWProgressHUD dismiss];
      [YFWProgressHUD showErrorWithStatus:@"一键登录失败，请切换登录方式"];
    }];
  } @catch (NSException *exception) {
    [YFWProgressHUD dismiss];
    [YFWProgressHUD showErrorWithStatus:@"一键登录失败，请切换登录方式"];
  } @finally {
   
  }
}

- (void)dismissAuthVC:(UIButton *) bt {
  NSInteger type = bt.tag;
  NSString *typeStr;
  if (type == 1) {
    typeStr = @"ali";
  }else if(type == 2){
    typeStr = @"wx";
  }else if(type == 3){
    typeStr = @"qq";
  }else{
    typeStr = @"weibo";
  }
  __weak typeof(self) wself = self;
  [self thirdLogin:typeStr callBack:^(NSDictionary *info) {
    NSMutableDictionary *tempInfo = [NSMutableDictionary dictionaryWithDictionary:info];
    [tempInfo setValue:@(wself.needCallBack) forKey:@"isLoginToUserCenter"];
    [YFWEventManager emit:@"thirdAuthOK" Data:tempInfo];
    [OneLogin dismissAuthViewController:nil];
    [wself.navigationController popToRootViewControllerAnimated:YES];
  }];
}


-(void)thirdLogin:(NSString *) type callBack:(void(^)(NSDictionary *info)) block{
  if ([type isEqualToString:@"ali"]) {
    
    [self alipayMethodRequest:block];
  }else{
    
    [self otherLoginRequest:type backBlock:block];
  }
  
}


- (void)alipayMethodRequest:(void(^)(NSDictionary *info)) block{
  
  /*============================================================================*/
  /*=======================需要填写商户app申请的===================================*/
  /*============================================================================*/
  NSString *partner = @"2088301654881161";
  NSString *appID = @"2015102100507562";
  NSString *privateKey = @"MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAJWrv6olTtBU3xwGzX8semoOS1K6U1bLrWpBZovH1nsPYiFN0O5p/ww8flTh3VE6fHGdY7Mrp53c0aVuIMcW+GI+0fERDvO2t0tQg0ooYbg61yTQBgzhVYVFjGRxJnYalpe57tUGFela3nsyBKyOPX5Bi5HUaO1iltnxuiFtXtK5AgMBAAECgYAw/liuTKog/jdOiFeKcrfbsbQsb3vKZL/ukVwNE6x8+gsoVb233ZC0o7TC+nClH10PH/M7+mVTAq7J1WP7Z+SEXF6Aiy3v9Ym+P2HKnqacaQX+TqrTjtipyXTH9pnsC4F4LvxQNSz2YZeDLND12TcZVfOV/pcUSEMQ9jRQsa671QJBAMTSN6F/g2cjpiSVmINc5RoZ+EwDF6JCAKDDeprNrqRPygnWMI2wRstHnMZoAXNMLg8DuUiNXStlvdrFjEjgWhMCQQDCrEP7gWpsE5H4RRFau5c9finSphqpEzNIW0Fo05YmRWxF2atcnWQ9ZUosB/BNkDUVuaSoxUYef4f5J72nw7mDAkEAsivW3mSvUGvOGCowESLD5rgBtNXLzD/Rj7bFw2NUqDvumq8B7xHXVGf0fQtj3LrmqwLk9M+7uvB0SJoyXzpxbwJBALCIUqWx9/XF0WrYByLGViHXVMnHAwordSe6SRhsNw7BiavV9cVonMvoHFjNYiaUDO+Eh0Lckfd6Iq3YUe3eWU0CQBLL4QAEI7vivlZvNaCjNvhAl4XQS44dH1zPR/Lq1/ko57ZJf2mUTBQM+S4bV0YbAjzAVqiJHUsdueFSsDKHJNA=";
  /*============================================================================*/
  /*============================================================================*/
  /*============================================================================*/
  
  
  //partner和seller获取失败,提示
  if ([partner length] == 0 ||
      [appID length] == 0 ||
      [privateKey length] == 0)
  {
    __weak typeof(self) wself = self;
    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"提示"
                                                    message:@"缺少partner或者appID或者私钥。"
                                                   delegate:wself
                                          cancelButtonTitle:@"确定"
                                          otherButtonTitles:nil];
    [alert show];
    return;
  }
  APAuthV2Info *info = [APAuthV2Info new];
  info.pid = partner;
  info.appID = appID;
  info.authType = @"AUTHACCOUNT";//默认是AUTHACCOUNT
  
  NSDateFormatter *formatter = [NSDateFormatter new];
  [formatter setDateFormat:@"yyyy-MM-dd HH:mm:ss"];
  info.signDate = [formatter stringFromDate:[NSDate date]];
  
  NSString *authStr = [info description];
  
  id<DataSigner> signer = CreateRSADataSigner(privateKey);
  NSString *signStr = [signer signString:authStr];
  
  signStr = [NSString stringWithFormat:@"%@&sign=\"%@\"&sign_type=\"%@\"",
             authStr, signStr, @"RSA"];
  
  [[AlipaySDK defaultService]
   auth_V2WithInfo:signStr
   fromScheme:@"yaofangwang"
   callback:^(NSDictionary *resultDic) {
     NSLog(@"result = %@",resultDic);
     NSString *key = [NSString stringWithFormat:@"%@",resultDic[@"auth_code"]];
     NSString * encodedString = [YFWSettingUtility URLDecodedString:key];
     key = encodedString;
     NSString *type = @"alipay";
     
     NSDictionary *param = @{@"key"          : getSafeString(key),
                             @"type"         : type,
                             @"nick_name"    : @"",
                             @"img_url"      : @"",
                             @"sex"          : @""};
     block(param);
   }];
}

- (void)otherLoginRequest:(NSString *)type backBlock:(void(^)(NSDictionary *info)) block
{
  
  UMSocialPlatformType umType;
  NSString *typeName;
  
  if ([type isEqualToString:@"wx"]) {
    umType = UMSocialPlatformType_WechatSession;
    typeName = @"weixin";
  }else if ([type isEqualToString:@"qq"]){
    umType = UMSocialPlatformType_QQ;
    typeName = @"qq";
  }else if ([type isEqualToString:@"weibo"]){
    umType = UMSocialPlatformType_Sina;
    typeName = @"weibo";
  }else{
    umType = UMSocialPlatformType_UnKnown;
    typeName = @"";
  }
  
  [[UMSocialManager defaultManager] getUserInfoWithPlatform:umType currentViewController:self completion:^(id result, NSError *error) {
    UMSocialUserInfoResponse *userinfo =result;
    if (userinfo.uid.length>0) {
      
      NSLog(@"username is %@, uid is %@, token is %@ url is %@",userinfo.name,userinfo.uid,userinfo.accessToken,userinfo.iconurl);
      
//      NSDictionary *param = [weakSelf getThirdParam:typeName Response:userinfo];
      
      NSDictionary *param = @{@"key"          : getSafeString(userinfo.uid),
                              @"type"         : typeName,
                              @"nick_name"    : getSafeString(userinfo.name),
                              @"img_url"      : getSafeString(userinfo.iconurl),
                              @"sex"          : getSafeString(userinfo.gender)};
      block(param);
    }
  }];
  
}

#pragma mark - OneLoginDelegate

- (void)userDidSwitchAccount {
  if (self.error_block) {
    self.error_block(@{@"errorCode":@"accountChange"});
  }
  [OneLogin dismissAuthViewController:nil];
  [self.navigationController popToRootViewControllerAnimated:YES];
}

- (void)userDidDismissAuthViewController {
   [OneLogin dismissAuthViewController:nil];
  [self.navigationController popToRootViewControllerAnimated:YES];
}

#pragma mark - UIAlertViewDelegate

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex {
    if (1 == buttonIndex) {
        [self openNetworkSettingPage];
    }
}

#pragma mark - Set Network

- (void)openNetworkSettingPage {
  NSURL *url = [NSURL URLWithString:UIApplicationOpenSettingsURLString];
  if ([[UIApplication sharedApplication] canOpenURL:url]) {
    if (@available(iOS 10.0, *)) {
      [[UIApplication sharedApplication] openURL:url options:@{} completionHandler:nil];
    } else {
      [[UIApplication sharedApplication] openURL:url];
    }
  }
}

@end
