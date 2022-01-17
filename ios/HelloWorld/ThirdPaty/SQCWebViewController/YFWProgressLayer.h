//
//  YFWProgressLayer.h
//  WebViewProgress
//
//  YaoFang
//
//  Created by NW-YFW on 2018/6/28.
//  Copyright © 2018年 NW. All rights reserved.
//

#import <QuartzCore/QuartzCore.h>
#import <UIKit/UIKit.h>

/** 进度条风格 */
typedef NS_ENUM(NSUInteger, YFWProgressStyle) {
    /** 默认风格 */
    YFWProgressStyle_Noraml,
    /** 渐变风格 */
    YFWProgressStyle_Gradual,
};

/** 进度条 */
@interface YFWProgressLayer : CAShapeLayer

/** 进度条显示风格 */
@property (nonatomic, assign) YFWProgressStyle progressStyle;
/** 进度条颜色，默认白色 */
@property (nonatomic, strong) UIColor *progressColor;

/**
 初始化方法

 @param frame 初始化frame
 @return 初始化对象
 */
- (instancetype)initWithFrame:(CGRect)frame;

/**
 初始化方法

 @param frame 初始化frame
 @param color 颜色
 @return 初始化对象
 */
- (instancetype)initWithFrame:(CGRect)frame color:(UIColor *)color;

/**
 进度条开始加载
 */
- (void)progressAnimationStart;

/**
 进度条加载完成
 */
- (void)progressAnimationCompletion;

@end
