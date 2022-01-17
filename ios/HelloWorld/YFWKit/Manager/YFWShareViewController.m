//
//  YFWShareViewController.m
//  HelloWorld
//
//  Created by yfw-姜明均 on 2018/9/26.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "YFWShareViewController.h"

@interface YFWShareViewController ()

@property (copy, nonatomic) NSString *shareUrlString;
@property (copy, nonatomic) NSString *sharetitleString;
@property (strong, nonatomic) UIImage *shareImage;

@end

@implementation YFWShareViewController

- (void)dealloc
{
  [[NSNotificationCenter defaultCenter] removeObserver:self name:@"becomeActiveNotification" object:nil];
}

- (void)viewDidLoad {
  [super viewDidLoad];
  
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(returnBackMethod) name:@"becomeActiveNotification" object:nil];
  
}


- (void)returnBackMethod{
  
  [self.navigationController popToRootViewControllerAnimated:NO];
  
}

- (IBAction)clickBackMethod:(UIButton *)sender {
  
  [self.navigationController popToRootViewControllerAnimated:YES];
  
}


- (void)shareMethod{
  
  self.shareUrlString = self.data[@"url"];
  self.sharetitleString = self.data[@"title"];
  if ([self.data[@"image"] length] != 0) {
    self.shareImage = self.data[@"image"];
  }
  
  //创建分享消息对象
  UMSocialMessageObject *messageObject = [UMSocialMessageObject messageObject];
  //创建网页内容对象
  UMShareWebpageObject *shareObject = [UMShareWebpageObject shareObjectWithTitle:self.sharetitleString descr:self.data[@"content"] thumImage:self.shareImage];
  //设置网页地址
  shareObject.webpageUrl = self.shareUrlString;
  messageObject.shareObject = shareObject;
  
  UMSocialPlatformType platformType = UMSocialPlatformType_Qzone;
  
  if ([self.type isEqualToString:@"wx"]) {
    platformType = UMSocialPlatformType_WechatSession;
  }else if ([self.type isEqualToString:@"pyq"]){
    platformType = UMSocialPlatformType_WechatTimeLine;
  }else if ([self.type isEqualToString:@"wb"]){
    platformType = UMSocialPlatformType_Sina;
  }else if ([self.type isEqualToString:@"qq"]){
    platformType = UMSocialPlatformType_QQ;
  }else if ([self.type isEqualToString:@"qzone"]){
    platformType = UMSocialPlatformType_Qzone;
  }else if ([self.type isEqualToString:@"save"]){
    UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
    pasteboard.string = self.shareUrlString;
    [YFWProgressHUD showSuccessWithStatus:@"复制成功"];
    [self.navigationController popViewControllerAnimated:YES];
    return;
  }else if ([self.type isEqualToString:@"wxMini"]) {
    platformType = UMSocialPlatformType_WechatSession;
    UMShareMiniProgramObject *shareObject = [UMShareMiniProgramObject shareObjectWithTitle:self.sharetitleString descr:self.data[@"content"] thumImage:[UIImage imageNamed:@"wxmin_share.png"]];
    shareObject.webpageUrl = self.shareUrlString;
    shareObject.userName = @"gh_1cc6c01f4bdd";
    shareObject.path =  [NSString stringWithFormat:@"%@%@%@", @"/components/YFWWebView/YFWWebView?params={\"value\":\"",self.shareUrlString, @"\"}"];
    shareObject.hdImageData = [NSData dataWithContentsOfFile:[[NSBundle mainBundle] pathForResource:@"wxmin_share" ofType:@"png"]];
    shareObject.miniProgramType = UShareWXMiniProgramTypeRelease; // 可选体验版和开发板
    messageObject.shareObject = shareObject;
  }
  
  __weak typeof(self)weakSelf = self;
  //调用分享接口
  [UMSocialGlobal shareInstance].isUsingHttpsWhenShareContent = NO;
  [[UMSocialManager defaultManager] shareToPlatform:platformType messageObject:messageObject currentViewController:self completion:^(id data, NSError *error) {
    if (error) {
      NSLog(@"************Share fail with error %@*********",error);
      [YFWProgressHUD showErrorWithStatus:@"分享失败"];
      if ([[self.data objectForKey:@"from"] isEqualToString:@"GoodsDetail"]) {
        [MobClick event:@"product detail-fail"];
      }
    }else{
      [YFWProgressHUD showSuccessWithStatus:@"分享成功"];
      if ([[self.data objectForKey:@"from"] isEqualToString:@"GoodsDetail"]) {
        [MobClick event:@"product detail-success"];
      }
      [[NSNotificationCenter defaultCenter] postNotificationName:@"shareSuccedNotification" object:nil];
      if (weakSelf.returnBlock) {
        weakSelf.returnBlock();
      }
    }
    
    [weakSelf.navigationController popViewControllerAnimated:YES];
    
  }];
  
  
}

- (void)sharePicMethod{
  
  self.shareUrlString = self.data[@"url"];
  self.sharetitleString = self.data[@"title"];
  self.shareImage = [UIImage imageWithContentsOfFile:self.data[@"image"]];
  
  UMSocialMessageObject *messageObject = [UMSocialMessageObject messageObject];
  UMShareImageObject *shareObjectPic = [[UMShareImageObject alloc] init];
  //如果有缩略图，则设置缩略图
  shareObjectPic.thumbImage = [UIImage imageNamed:@"Icon-60"];
  shareObjectPic.title = self.sharetitleString;
  shareObjectPic.descr = self.data[@"content"];
  [shareObjectPic setShareImage:self.shareImage];
  
  //分享消息对象设置分享内容对象
  messageObject.shareObject = shareObjectPic;
  
  UMSocialPlatformType platformType = UMSocialPlatformType_Qzone;
  
  if ([self.type isEqualToString:@"wx"]) {
    platformType = UMSocialPlatformType_WechatSession;
  }else if ([self.type isEqualToString:@"pyq"]){
    platformType = UMSocialPlatformType_WechatTimeLine;
  }else if ([self.type isEqualToString:@"wb"]){
    platformType = UMSocialPlatformType_Sina;
  }else if ([self.type isEqualToString:@"qq"]){
    platformType = UMSocialPlatformType_QQ;
  }else if ([self.type isEqualToString:@"qzone"]){
    platformType = UMSocialPlatformType_Qzone;
  }else if ([self.type isEqualToString:@"save"]){
    UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
    pasteboard.string = self.shareUrlString;
    [YFWProgressHUD showSuccessWithStatus:@"复制成功"];
    [self.navigationController popViewControllerAnimated:YES];
    return;
  }
  
  __weak typeof(self)weakSelf = self;
  //调用分享接口
  [[UMSocialManager defaultManager] shareToPlatform:platformType messageObject:messageObject currentViewController:self completion:^(id data, NSError *error) {
    if (error) {
      NSLog(@"************Share fail with error %@*********",error);
      [YFWProgressHUD showErrorWithStatus:@"分享失败"];
    }else{
      [YFWProgressHUD showSuccessWithStatus:@"分享成功"];
      [[NSNotificationCenter defaultCenter] postNotificationName:@"shareSuccedNotification" object:nil];
      if (weakSelf.returnBlock) {
        weakSelf.returnBlock();
      }
    }
    
    [weakSelf.navigationController popViewControllerAnimated:YES];
    
  }];
  
}


#pragma mark - Setter && Getter

- (UIImage *)shareImage{
  
  if (!_shareImage) {
    
    _shareImage = [UIImage imageNamed:@"Icon-60.png"];
  }
  return _shareImage;
}

- (NSString *)sharetitleString{
  
  if (_sharetitleString.length == 0) {
    
    _sharetitleString = @"药房网商城";
  }
  return _sharetitleString;
}

- (NSString *)shareUrlString{
  
  if (_shareUrlString.length == 0) {
    
    _shareUrlString = [NSString stringWithFormat:@"https://www.%@/app/index.html",[YFWSettingUtility yfwDomain]];
  }
  return _shareUrlString;
}


@end
