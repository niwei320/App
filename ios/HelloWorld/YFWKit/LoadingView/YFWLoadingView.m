//
//  YFWLoadingView.m
//  EmptyDataManager
//
//  Created by 姜明均 on 2017/4/6.
//  Copyright © 2017年 ios. All rights reserved.
//

#import "YFWLoadingView.h"
#import "YFWReachability.h"
#import <SDWebImage/UIImage+GIF.h>
#define BROKEN_NET_MSG @"网络请求失败"

@interface YFWLoadingView ()

@property (nonatomic, retain) UIView *loadingView;
@property (nonatomic, retain) UIView *brokenNetView;
@property (nonatomic, assign) BOOL clearBack;//背景是否为透明

@property (nonatomic, copy) void (^refreshBlock)();

@end

@implementation YFWLoadingView

+ (instancetype)getView{
    
    static YFWLoadingView *_loadView = nil;

    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        
        _loadView = [[YFWLoadingView alloc] initWithFrame:[UIScreen mainScreen].bounds];
        _loadView.backgroundColor = [UIColor whiteColor];
        _loadView.layer.zPosition = 1;

    });
    
    return _loadView;
}

- (void)currentNetwork{

    BOOL isExistenceNetwork = YES;
    YFWReachability *reach = [YFWReachability yfwReachabilityForInternetConnection];
    
    //检测当前网络环境
    switch ([reach currentYFWReachabilityStatus]) {
        case NotReachable:{
            isExistenceNetwork = NO;
            
            break;
        }
        case ReachableViaWiFi:{
            isExistenceNetwork = YES;
            break;
        }
        case ReachableViaWWAN:{
            isExistenceNetwork = YES;
            break;
        }
    }
    
    //加载页面or断网提示
    if (isExistenceNetwork) {
        
        [self createLoadingView];
    }else{
    
        [self createBrokenNetView:BROKEN_NET_MSG];
    }
    
}


#pragma mark - View
- (void)createLoadingView{
    
    [self removeBrokenNetView];
    if (_loadingView) {
        return;
    }
    
    self.loadingView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, 80, 80)];
    _loadingView.center = self.center;
    [self addSubview:_loadingView];
  
    UIImageView *loadImageView = [[UIImageView alloc] init];
    loadImageView.frame = CGRectMake(10, 10, 40, 40);
    loadImageView.backgroundColor = [UIColor clearColor];
    [loadImageView setImage:[UIImage imageNamed:@"loading.gif"]];
    NSString *loadingImagePath = [[NSBundle mainBundle] pathForResource:@"loading" ofType:@"gif"];
    NSData *imageData = [NSData dataWithContentsOfFile:loadingImagePath];
    UIImage *loadingImage = [UIImage sd_animatedGIFWithData:imageData];
    [loadImageView setImage:loadingImage];
    [_loadingView addSubview:loadImageView];
    
}

- (void)romoveLoadingView{
    
    [self.loadingView removeFromSuperview];
    self.loadingView = nil;
}

- (void)createBrokenNetView:(NSString *)msg{

    [self romoveLoadingView];
    if (_brokenNetView || _clearBack) {
        return;
    }
    
    self.brokenNetView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, 200, 250)];
    self.brokenNetView.center = self.center;
    
    UIImageView *iconImageView = [[UIImageView alloc]
                                  initWithImage:[UIImage imageNamed:@"brokenNetA"]];
    iconImageView.frame = CGRectMake(49, 0, 102, 70);
    [_brokenNetView addSubview:iconImageView];
    
    UILabel *title = [[UILabel alloc] initWithFrame:CGRectMake(0, 85, 200, 30)];
    title.text = msg;
    title.textColor = [UIColor grayColor];
    title.textAlignment = NSTextAlignmentCenter;
    title.font = [UIFont systemFontOfSize:18];
    [_brokenNetView addSubview:title];
    
    UILabel *context = [[UILabel alloc] initWithFrame:CGRectMake(0, 120, 200, 40)];
    context.text = @"请检查您的网络\n重新加载吧";
    context.numberOfLines = 2;
    context.textAlignment = NSTextAlignmentCenter;
    context.textColor = [UIColor lightGrayColor];
    context.font = [UIFont systemFontOfSize:14];
    [_brokenNetView addSubview:context];
    
    UIButton *button = [UIButton buttonWithType:UIButtonTypeCustom];
    button.frame = CGRectMake(50, 190, 100, 35);
    [button setTitle:@"重新加载" forState:UIControlStateNormal];
    [button setTitleColor:[UIColor grayColor] forState:UIControlStateNormal];
    button.layer.cornerRadius = 5;
    button.layer.masksToBounds = YES;
    button.layer.borderWidth = 1;
    button.layer.borderColor = [UIColor grayColor].CGColor;
    [button addTarget:self action:@selector(refresh) forControlEvents:UIControlEventTouchUpInside];
    [_brokenNetView addSubview:button];
    
    [self addSubview:_brokenNetView];
    
}

- (void)removeBrokenNetView{

    [self.brokenNetView removeFromSuperview];
    self.brokenNetView = nil;

}

#pragma mark - Private Function

- (void)refresh{

    if (self.refreshBlock) {
     
        self.refreshBlock();
        
        [self removeBrokenNetView];
        [self createLoadingView];
    }
}

#pragma mark - Public Function

+ (instancetype)showWithController:(UIViewController *)controller{
    
    return [self showWithView:controller.view];
}

+ (instancetype)showWithView:(UIView *)superView{

    [self dismiss];
  
    YFWLoadingView *view = [YFWLoadingView getView];
    view.backgroundColor = [UIColor whiteColor];
    view.clearBack = NO;
    [view currentNetwork];
    
    if (![superView.subviews containsObject:view]) {
        
        [superView addSubview:view];
        [superView bringSubviewToFront:view];
        [YFWProgressHUD dismiss];
    }
    
    return view;
}

+ (void)showErrorMessage:(NSString *)msg{

    YFWLoadingView *view = [YFWLoadingView getView];
    
    [view removeBrokenNetView];
    [view romoveLoadingView];
    
    if (!msg) {
        msg = BROKEN_NET_MSG;
    }
    
    [view createBrokenNetView:msg];
}

+ (void)showLoadingWithController:(UIViewController *)controller{

    YFWLoadingView *view = [self showWithController:controller];
    view.backgroundColor = [UIColor clearColor];
    view.clearBack = YES;
    
    [view createLoadingView];
}

+ (void)dismiss{

    YFWLoadingView *view = [YFWLoadingView getView];
    
    view.frame = [UIScreen mainScreen].bounds;
    [view removeBrokenNetView];
    [view romoveLoadingView];
    
    [view removeFromSuperview];
    
}

+ (void)returnRefreshBlock:(void (^)())block{
    
    YFWLoadingView *view = [YFWLoadingView getView];
    
    view.refreshBlock = block;
}

+ (BOOL)hasDisplay{

    YFWLoadingView *view = [YFWLoadingView getView];
    
    if (view.superview) {
        
        return YES;
    }
    
    return NO;
}

+ (BOOL)hasLoadingDisplay{

    YFWLoadingView *view = [YFWLoadingView getView];
    
    if (view.superview && view.loadingView) {
        
        return YES;
    }
    
    return NO;
}


@end
