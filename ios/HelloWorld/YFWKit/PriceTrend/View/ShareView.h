//
//  ShareView.h
//  YaoFang
//
//  Created by yfw－iMac on 15/11/10.
//  Copyright © 2015年 SQC. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "YFWBlurView.h"

typedef void (^cancelBlock)(BOOL isSuccess);
typedef void (^shareClickBlock)(int clickIndex);
typedef void (^checkRewardBlock)();
typedef NS_ENUM(NSUInteger,ShareButtonStatus) {
    ShareButtonStatusDefault = 1,
    ShareButtonStatusPic,
    ShareButtonStatusWithoutCopyAndPic,
    ShareButtonStatusQQWEIXin,
    ShareButtonStatusWEIXinPYQ
};

@interface ShareView : UIView

@property (weak, nonatomic) IBOutlet UIView *closeView;
@property (weak, nonatomic) IBOutlet UIView *shareButtonView;
@property (weak, nonatomic) IBOutlet UIView *CheckRewardView;
@property (weak, nonatomic) IBOutlet UIView *buttonsView;

@property (strong, nonatomic) YFWBlurView *shareBackView;
@property (copy, nonatomic) cancelBlock cancel;
@property (copy, nonatomic) shareClickBlock share;
@property (copy, nonatomic) checkRewardBlock checkReward;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *shareButtonViewHeight;

@property (strong, nonatomic) NSArray *isShowArray;
@property (assign, nonatomic) ShareButtonStatus shareButtonStatus;

- (void)addIconViews;

+ (ShareView *)getShareView;

@end
