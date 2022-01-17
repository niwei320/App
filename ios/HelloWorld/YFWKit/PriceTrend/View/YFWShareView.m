//
//  YFWShareView.m
//  YaoFang
//
//  Created by yfw－iMac on 16/5/11.
//  Copyright © 2016年 SQC. All rights reserved.
//

#import "YFWShareView.h"
#import "YFWPicShareView.h"
@implementation YFWShareView

static YFWShareView *shareView;
+ (YFWShareView *)sharedInstance
{
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        shareView = [[YFWShareView alloc] init];
        [shareView initShareView];
    });
    return shareView;
}
- (void)initShareView
{
    __weak typeof(self) weakSelf = self;
    self.shareView = [ShareView getShareView];
    self.shareView.hidden = YES;
    self.shareView.alpha = 0.0;
    self.shareView.cancel = ^(BOOL isSuccess){
        [weakSelf removeShareView];
    };
    self.shareView.share = ^(int clickIndex){
        [weakSelf shareWithIndex:clickIndex];
    };
    self.shareView.checkReward = ^{
        [weakSelf toBonusView];
    };
}
- (void)toBonusView{
    
//    NSDictionary *dic = [SystemConfigManager getManager].ads;
//
//    HomeItemInfo *info = [[HomeItemInfo alloc] init];
//    info.type = dic[@"type"];
//    info.value = dic[@"value"];
//    info.name = dic[@"title"];
//    info.shareUrl = dic[@"value"];
//    info.is_login = dic[@"islogin"];
//    info.param_dic = [dic[@"parameter_item"] safeDictionary];
//    info.shar_hidden = YES;
//
//    YFWBaseViewController *baseVC = (YFWBaseViewController *)self.controller;
//    [baseVC pushViewControllerWithInfo_notification:info];
//    [self removeShareView];
}

- (void)removeShareView{
    [self resetShareViewStatus];
    [UIView animateWithDuration:0.2 delay:0 options:UIViewAnimationOptionCurveEaseIn animations:^{
        self.shareView.alpha = 0.0;
    } completion:^(BOOL finished) {
        self.shareView.CheckRewardView.hidden = !self.is_show_topview;
        self.shareView.hidden = YES;
        [self.shareView removeFromSuperview];
    }];
    
}

- (void)shareWithIndex:(int)index
{
    NSString *urlString = self.shareUrlString;
    UIImage *image = self.shareImage;
    NSString *titleStr = self.sharetitleString;

    //创建分享消息对象
    UMSocialMessageObject *messageObject = [UMSocialMessageObject messageObject];
    //创建网页内容对象
    UMShareWebpageObject *shareObject = [UMShareWebpageObject shareObjectWithTitle:titleStr descr:self.sinaContentString thumImage:image];
    //设置网页地址
    shareObject.webpageUrl =urlString;
    UMSocialPlatformType platformType = UMSocialPlatformType_Qzone;
    
    switch (index) {
        case 0:
        {
            shareObject.descr = self.wxsContentString;
            platformType = UMSocialPlatformType_WechatSession;
            break;
        }
        case 1:
        {
            shareObject.descr = self.wxfContentString;
            if (self.sharetitleString_wx.length>0) {
                shareObject.title = self.sharetitleString_wx;
            }
            platformType = UMSocialPlatformType_WechatTimeLine;
            break;
        }
        case 2:
        {
            shareObject.descr = self.sinaContentString;
            platformType = UMSocialPlatformType_Sina;
            break;
        }
        case 3:
        {
            shareObject.descr = self.qqsContentString;
            platformType = UMSocialPlatformType_QQ;
            break;
        }
        case 4:
        {
            shareObject.descr = self.qqfContentString;
            platformType = UMSocialPlatformType_Qzone;
            break;
        }
        case 5:
        {
            UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
            pasteboard.string = urlString;
            [self removeShareView];
            [YFWProgressHUD showSuccessWithStatus:@"复制成功"];
            return;
            break;
        }
        case 6:         //图片分享
        {
            YFWPicShareView *view = [[YFWPicShareView alloc] init];
            view.vc = self.controller;
            if (self.commodityDetail) {
                view.commodityDetail = self.commodityDetail;
            }else if(self.priceTrendModel){
                view.priceTrendModel = self.priceTrendModel;
            }else{
                return;
            }
            [[UIApplication sharedApplication].keyWindow addSubview:view];
             [self removeShareView];
   
            return;
            break;
        }
        default:
            break;
    }
    
    if (self.is_share_pic) {
        //创建图片内容对象
        UMShareImageObject *shareObjectPic = [[UMShareImageObject alloc] init];
        //如果有缩略图，则设置缩略图
        shareObjectPic.thumbImage = [UIImage imageNamed:@"Icon-60"];
        shareObjectPic.title = titleStr;
        shareObjectPic.descr = self.sinaContentString;
        [shareObjectPic setShareImage:self.shareImage];
        
        //分享消息对象设置分享内容对象
        messageObject.shareObject = shareObjectPic;
    }else{
        messageObject.shareObject = shareObject;
    }

    //调用分享接口
    [[UMSocialManager defaultManager] shareToPlatform:platformType messageObject:messageObject currentViewController:self.controller completion:^(id data, NSError *error) {
        if (error) {    
            NSLog(@"************Share fail with error %@*********",error);
            if (self.is_show_topview) {
                [MobClick event:@"product detail-fail"];
            }
            [YFWProgressHUD showErrorWithStatus:@"分享失败"];
        }else{
            [YFWProgressHUD showSuccessWithStatus:@"分享成功"];
            if (self.is_show_topview) {
                [MobClick event:@"product detail-success"];
            }
            [[NSNotificationCenter defaultCenter] postNotificationName:@"shareSuccedNotification" object:nil];
            [self removeShareView];
        }
    }];
}

- (void)setShareTextWithUserCenter
{
    
    [self setShareTextWithURL:[NSString stringWithFormat:@"https://www.%@/app/index.html",[YFWSettingUtility yfwDomain]]];

}

- (void)setShareTextWithURL:(NSString *)url{
    
    self.shareUrlString = url;
    self.sharetitleString = @"药房网商城App客户端";
    self.sharetitleString_wx = @"药房网商城App客户端，手机买药优选平台！";
    
    self.shareImage = [UIImage imageNamed:@"Icon-60.png"];
    self.sinaContentString = [NSString stringWithFormat:@"推荐@药房网商城 的手机买药app，品种丰富，全国比价，正品保障！下载地址：#https://www.%@/app/index.html#",[YFWSettingUtility yfwDomain]];
    self.qqfContentString = @"手机买药优选平台，品种丰富，价格实在，正品保障！";
    self.qqsContentString = @"手机买药优选平台，品种丰富，价格实在，正品保障！";
    self.wxfContentString = @"手机买药优选平台，品种丰富，价格实在，正规药房，正品保障！";
    self.wxsContentString = @"手机买药优选平台，品种丰富，价格实在，正规药房，正品保障！";
    
}

- (void)setShareTextDetail:(NSString *)title image:(UIImage *)image good_id:(NSString *)good_id
{

    self.shareUrlString = [NSString stringWithFormat:@"https://m.%@/detail-%@.html",[YFWSettingUtility yfwDomain],good_id];
    self.sharetitleString = title;
    self.shareImage = image;
    self.sinaContentString = [NSString stringWithFormat:
                              @"我在@药房网商城 找到了#%@#，分享给大家！#https://m.%@/detail-%@.html#",self.sharetitleString,[YFWSettingUtility yfwDomain],good_id];
    self.qqfContentString = @"药房网商城 - 手机买药优选平台，App购药更优惠！";
    self.qqsContentString = @"药房网商城 - 手机买药优选平台，App购药更优惠！";
    self.wxfContentString = @"药房网商城 - 手机买药优选平台，App购药更优惠！";
    self.wxsContentString = @"药房网商城 - 手机买药优选平台，App购药更优惠！";
    
}

- (void)setShareTextBiJia:(NSString *)title image:(UIImage *)image good_id:(NSString *)good_id
{

    self.shareUrlString = [NSString stringWithFormat:@"https://m.%@/medicine-%@.html",[YFWSettingUtility yfwDomain],good_id];
    self.sharetitleString = title;
    self.shareImage = image;
    self.sinaContentString = [NSString stringWithFormat:
                              @"我在@药房网商城 找到了#%@#，分享给大家！#https://m.%@/medicine-%@.html#",self.sharetitleString,[YFWSettingUtility yfwDomain],good_id];
    self.qqfContentString = @"药房网商城 - 手机买药优选平台，App购药更优惠！";
    self.qqsContentString = @"药房网商城 - 手机买药优选平台，App购药更优惠！";
    self.wxfContentString = @"药房网商城 - 手机买药优选平台，App购药更优惠！";
    self.wxsContentString = @"药房网商城 - 手机买药优选平台，App购药更优惠！";
    
}

- (void)setShareURL:(NSString *)title image:(UIImage *)image desc:(NSString *)desc urlstring:(NSString *)url
{

    self.shareUrlString = url;
    self.sharetitleString = title;
    self.sharetitleString_wx = [NSString stringWithFormat:@"%@-药房网商城，手机买药优选平台！",self.sharetitleString];
    self.shareImage = image;
    self.sinaContentString = [NSString stringWithFormat:@"我在@药房网商城 发现了#%@#，分享给大家！#%@#",self.sharetitleString,self.shareUrlString];
    self.qqfContentString = desc;
    self.qqsContentString = desc;
    self.wxfContentString = desc;
    self.wxsContentString = desc;
    
}

- (void)setShareURL_zixun:(NSString *)title image:(UIImage *)image desc:(NSString *)desc urlstring:(NSString *)url
{

    self.shareUrlString = url;
    self.sharetitleString = title;
    self.shareImage = image;
    self.sharetitleString_wx = [NSString stringWithFormat:@"#%@#—药房网商城，手机买药优选平台！",self.sharetitleString];
    self.sinaContentString = [NSString stringWithFormat:@"#%@#@药房网商城，分享给大家！#%@#",self.sharetitleString,self.shareUrlString];
    self.qqfContentString = @"手机买药优选平台，品种丰富，价格实在，正品保障！";
    self.qqsContentString = @"手机买药优选平台，品种丰富，价格实在，正品保障！";
    self.wxfContentString = desc;
    self.wxsContentString = desc;
    if (desc.length==0) {
        self.wxsContentString = @"手机买药优选平台，品种丰富，价格实在，正规药房，正品保障！";
    }
}

- (void)addShareView
{
    [self.shareView.buttonsView removeAllSubviews];
    [self.shareView addIconViews];
#if !defined(SV_APP_EXTENSIONS)
    NSEnumerator *frontToBackWindows = [UIApplication.sharedApplication.windows reverseObjectEnumerator];
    for (UIWindow *window in frontToBackWindows){
        BOOL windowOnMainScreen = window.screen == UIScreen.mainScreen;
        BOOL windowIsVisible = !window.hidden && window.alpha > 0;
        BOOL windowLevelNormal = window.windowLevel == UIWindowLevelNormal;
        
        if (windowOnMainScreen && windowIsVisible && windowLevelNormal) {
            
            [UIView animateWithDuration:0.1 delay:0 options:UIViewAnimationOptionCurveEaseIn animations:^{
                [window addSubview:self.shareView];
                self.shareView.CheckRewardView.hidden = !self.is_show_topview;
                self.shareView.alpha = 1.0;
                self.shareView.hidden = NO;
            } completion:^(BOOL finished) {
                
            }];
            
            break;
        }
    }
#else
    if(YFWProgressHUDExtensionView){
        [YFWProgressHUDExtensionView addSubview:self.overlayView];
    }
#endif

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

-(void)resetShareViewStatus{
    self.is_show_topview = NO;
    self.is_share_pic = NO;
    self.shareView.shareButtonStatus = ShareButtonStatusDefault;
    self.priceTrendModel = nil;
    self.commodityDetail = nil;
}
- (UIImage*) imageWithUIView:(UIView*) imageView{
    UIView *view = imageView;
    // 创建一个bitmap的context
    // 并把它设置成为当前正在使用的context
    UIGraphicsBeginImageContextWithOptions(view.bounds.size, YES, [UIScreen mainScreen].scale);
    CGContextRef currnetContext = UIGraphicsGetCurrentContext();
    [view.layer renderInContext:currnetContext];
    // 从当前context中创建一个改变大小后的图片
    UIImage* image = UIGraphicsGetImageFromCurrentImageContext();
    // 使当前的context出堆栈
    UIGraphicsEndImageContext();
    return image;
}
@end

