//
//  YFWProgressHUD.h
//  YaoFang
//
//  Created by 胡舒舒 on 2017/5/24.
//  Copyright © 2017年 ospreyren. All rights reserved.
//

#import <Foundation/Foundation.h>

extern NSString * const YFWProgressHUDDidReceiveTouchEventNotification;
extern NSString * const YFWProgressHUDDidTouchDownInsideNotification;
extern NSString * const YFWProgressHUDWillDisappearNotification;
extern NSString * const YFWProgressHUDDidDisappearNotification;
extern NSString * const YFWProgressHUDWillAppearNotification;
extern NSString * const YFWProgressHUDDidAppearNotification;

extern NSString * const YFWProgressHUDStatusUserInfoKey;

typedef NS_ENUM(NSUInteger, YFWProgressHUDMaskType) {
    YFWProgressHUDMaskTypeNone = 1,  // allow user interactions while HUD is displayed
    YFWProgressHUDMaskTypeClear,     // don't allow user interactions
    YFWProgressHUDMaskTypeBlack,     // don't allow user interactions and dim the UI in the back of the HUD
    YFWProgressHUDMaskTypeGradient   // don't allow user interactions and dim the UI with a a-la-alert-view background gradient
};

@interface YFWProgressHUD : UIView

#pragma mark - Customization

+ (void)setBackgroundColor:(UIColor*)color;                 // default is [UIColor whiteColor]
+ (void)setForegroundColor:(UIColor*)color;                 // default is [UIColor blackColor]
+ (void)setRingThickness:(CGFloat)width;                    // default is 4 pt
+ (void)setFont:(UIFont*)font;                              // default is [UIFont preferredFontForTextStyle:UIFontTextStyleSubheadline]
+ (void)setInfoImage:(UIImage*)image;                       // default is the bundled info image provided by Freepik
+ (void)setSuccessImage:(UIImage*)image;                    // default is the bundled success image provided by Freepik
+ (void)setErrorImage:(UIImage*)image;                      // default is the bundled error image provided by Freepik
+ (void)setDefaultMaskType:(YFWProgressHUDMaskType)maskType; // default is YFWProgressHUDMaskTypeNone
+ (void)setViewForExtension:(UIView*)view;                  // default is nil, only used if #define SV_APP_EXTENSIONS is set

#pragma mark - Show Methods

+ (void)show;
+ (void)showWithMaskType:(YFWProgressHUDMaskType)maskType;
+ (void)showWithStatus:(NSString*)status;
+ (void)showWithStatus:(NSString*)status maskType:(YFWProgressHUDMaskType)maskType;

+ (void)showProgress:(float)progress;
+ (void)showProgress:(float)progress maskType:(YFWProgressHUDMaskType)maskType;
+ (void)showProgress:(float)progress status:(NSString*)status;
+ (void)showProgress:(float)progress status:(NSString*)status maskType:(YFWProgressHUDMaskType)maskType;

+ (void)setStatus:(NSString*)string; // change the HUD loading status while it's showing

// stops the activity indicator, shows a glyph + status, and dismisses HUD a little bit later
+ (void)showInfoWithStatus:(NSString *)string;
+ (void)showInfoWithStatus:(NSString *)string maskType:(YFWProgressHUDMaskType)maskType;

+ (void)showSuccessWithStatus:(NSString*)string;
+ (void)showSuccessWithStatus:(NSString*)string maskType:(YFWProgressHUDMaskType)maskType;

+ (void)showErrorWithStatus:(NSString *)string;
+ (void)showErrorWithStatus:(NSString *)string maskType:(YFWProgressHUDMaskType)maskType;

// use 28x28 white pngs
+ (void)showImage:(UIImage*)image status:(NSString*)status;
+ (void)showImage:(UIImage*)image status:(NSString*)status maskType:(YFWProgressHUDMaskType)maskType;

+ (void)setOffsetFromCenter:(UIOffset)offset;
+ (void)resetOffsetFromCenter;

+ (void)popActivity; // decrease activity count, if activity count == 0 the HUD is dismissed
+ (void)dismiss;

+ (BOOL)isVisible;

@end
