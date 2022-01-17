//
//  YFWLoadingView.h
//  EmptyDataManager
//
//  Created by 姜明均 on 2017/4/6.
//  Copyright © 2017年 ios. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface YFWLoadingView : UIView

/**
 * 显示加载页
 */
+ (instancetype)showWithController:(UIViewController *)controller;
+ (instancetype)showWithView:(UIView *)superView;

/**
 * 显示错误信息
 */
+ (void)showErrorMessage:(NSString *)msg;

/**
 * 显示加载框
 */
+ (void)showLoadingWithController:(UIViewController *)controller;

/**
 * 取消加载页
 */
+ (void)dismiss;

/**
 * 添加刷新回调
 */
+ (void)returnRefreshBlock:(void (^)())block;

/**
 * 判断加载页是否显示
 */
+ (BOOL)hasDisplay;

/**
 * 判断是否显示正在加载页面
 */
+ (BOOL)hasLoadingDisplay;

@end
