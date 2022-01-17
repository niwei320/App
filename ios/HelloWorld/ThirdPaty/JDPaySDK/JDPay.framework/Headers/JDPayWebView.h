//
//  SFWebView.h
//  JSFUIKit
//
//  Created by dongkui on 2019/10/13.
//  Copyright © 2019 dongkui. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <WebKit/WebKit.h>
#import <JavaScriptCore/JavaScriptCore.h>

NS_ASSUME_NONNULL_BEGIN

/*!
@abstract A enhanced WebView object displays interactive Web content.
*/
API_AVAILABLE(ios(8.0))
@interface JDPayWebView : WKWebView

@property(nonatomic, assign) CGFloat progressHeight;// The height of the progress bar, Default is 1.f / UIScreen.mainScreen.scale;
@property(nonatomic, strong, nullable) UIColor *progressTintColor;
@property(nonatomic, strong, nullable) UIImage *progressImage;

/*!
 @abstract An block to notify title changing of the current webpage.
 */
@property (nonatomic, copy) void (^ _Nullable titleDidChangeBlock)(NSString *title);

@end

NS_ASSUME_NONNULL_END
