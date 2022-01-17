//
//  UIWebView+YFWProgress.h
//  WebViewProgress
//  YaoFang
//
//  Created by NW-YFW on 2018/6/28.
//  Copyright © 2018年 NW. All rights reserved.
//

#import <UIKit/UIKit.h>

@class YFWProgressLayer;

@interface UIWebView (Progress)

@property (nonatomic, strong) YFWProgressLayer *yfw_progressLayer;
/** 是否显示加载进度条, 默认YES */
@property (nonatomic, assign) BOOL yfw_showProgressLayer;

- (void)yfw_showCustomProgressView;

@end
