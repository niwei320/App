//
//  UIWebView+YFWProgress.m
//  WebViewProgress
//
//  YaoFang
//
//  Created by NW-YFW on 2018/6/28.
//  Copyright © 2018年 NW. All rights reserved.
//

#import "UIWebView+YFWProgress.h"
#import <objc/runtime.h>
#import "YFWProgressLayer.h"

static inline void yfw_swizzleSelector(Class clazz, SEL originalSelector, SEL swizzledSelector) {
    Method originalMethod = class_getInstanceMethod(clazz, originalSelector);
    Method swizzleMethod = class_getInstanceMethod(clazz, swizzledSelector);
    BOOL success = class_addMethod(clazz, originalSelector,method_getImplementation(swizzleMethod), method_getTypeEncoding(swizzleMethod));
    if (success) {
        class_replaceMethod(clazz, swizzledSelector, method_getImplementation(originalMethod), method_getTypeEncoding(originalMethod));
    } else {
        method_exchangeImplementations(originalMethod, swizzleMethod);
    }
}

@interface UIWebView ()

@property (nonatomic, strong) id yfw_delegate;

@end

@implementation UIWebView (yfwProgress)

+ (void)load {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        Class class = [self class];
        yfw_swizzleSelector(class, @selector(initWithFrame:), @selector(yfw_initWithFrame:));
        yfw_swizzleSelector(class, @selector(initWithCoder:), @selector(yfw_initWithCoder:));
        yfw_swizzleSelector(class, @selector(setDelegate:), @selector(yfw_setDelegate:));
        yfw_swizzleSelector(class, NSSelectorFromString(@"dealloc"), @selector(yfw_dealloc));
    });
}

- (YFWProgressLayer *)yfw_progressLayer {
    return objc_getAssociatedObject(self, _cmd);
}

- (void)setYfw_progressLayer:(YFWProgressLayer *)yfw_progressLayer {
    if (yfw_progressLayer && self.yfw_progressLayer) {
        [self.yfw_progressLayer removeFromSuperlayer];
        self.yfw_progressLayer = nil;
    }
    objc_setAssociatedObject(self, @selector(yfw_progressLayer), yfw_progressLayer, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (id)yfw_delegate {
    return objc_getAssociatedObject(self, _cmd);
}

- (void)setYfw_delegate:(id)yfw_delegate {
    objc_setAssociatedObject(self, @selector(yfw_delegate), yfw_delegate, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (id<UIWebViewDelegate>)yfw_targetProxy {
    return objc_getAssociatedObject(self, _cmd);
}

- (void)setYfw_targetProxy:(id<UIWebViewDelegate>)yfw_targetProxy {
    objc_setAssociatedObject(self, @selector(yfw_targetProxy), yfw_targetProxy, OBJC_ASSOCIATION_ASSIGN);
}

- (BOOL)yfw_showProgressLayer {
    return [objc_getAssociatedObject(self, _cmd) boolValue];
}

- (void)setYfw_showProgressLayer:(BOOL)yfw_showProgressLayer {
    objc_setAssociatedObject(self, @selector(yfw_showProgressLayer), @(yfw_showProgressLayer), OBJC_ASSOCIATION_ASSIGN);
    if (yfw_showProgressLayer) {
        [self setDelegate:self.yfw_targetProxy];
    }
}

#pragma mark - method swizzling

- (instancetype)yfw_initWithFrame:(CGRect)frame {
    UIWebView *webView = [self yfw_initWithFrame:frame];
    /** 默认显示加载进度条 */
    webView.yfw_showProgressLayer = YES;
    return webView;
}

- (instancetype)yfw_initWithCoder:(NSCoder *)aDecoder {
    UIWebView *webView = [self yfw_initWithCoder:aDecoder];
    /** 默认显示加载进度条 */
    webView.yfw_showProgressLayer = YES;
    return webView;
}

- (void)yfw_setDelegate:(id <UIWebViewDelegate>)delegate {
    self.yfw_targetProxy = delegate;
    if (!self.yfw_showProgressLayer) {
        [self yfw_setDelegate:delegate];
        return;
    }
    /** 动态创建progressDelegate */
    Class clazz = [self yfw_allocPorgressDelegate];

    if (!clazz) {
        [self yfw_setDelegate:delegate];
        return;
    }

    id yfw_delegate = [[clazz alloc] init];
    self.yfw_delegate = yfw_delegate;
    [self yfw_setDelegate:yfw_delegate];
}

- (void)yfw_dealloc {
    if (self.yfw_progressLayer) {
        [self.yfw_progressLayer setHidden:YES];
        [self.yfw_progressLayer removeFromSuperlayer];
    }
    self.yfw_delegate = nil;
    [self yfw_dealloc];
}

#pragma mark - private method

- (Class)yfw_allocPorgressDelegate {
    const char * className;
    className = [@"YFWProgressDelegate" UTF8String];
    Class clazz = objc_getClass(className);
    /** 判断此类是否已经存在，如果存在则返回，不存在就创建 */
    if (!clazz) {
        Class superClass = [NSObject class];
        clazz = objc_allocateClassPair(superClass, className, 0);
    }

    /** 为类添加成员变量\方法 */
    class_addMethod(clazz, @selector(webViewDidStartLoad:), (IMP)yfw_webViewDidStartLoad, "V@:");
    class_addMethod(clazz, @selector(webViewDidFinishLoad:), (IMP)yfw_webViewDidFinishLoad, "V@:");
    class_addMethod(clazz, @selector(webView:didFailLoadWithError:), (IMP)yfw_webViewDidFailLoadWithError, "V@:");
    class_addMethod(clazz, @selector(webView:shouldStartLoadWithRequest:navigationType:), (IMP)yfw_webViewShouldStartLoadWithRequestNavigationType, "V@:");

    /** 注册这个类到runtime系统 */
    objc_registerClassPair(clazz);
    return clazz;
}

#pragma mark - method custom implementation

static void yfw_webViewDidStartLoad (id self, SEL _cmd, UIWebView *webView) {
    [webView.yfw_progressLayer progressAnimationStart];
    if (webView.yfw_targetProxy && [webView.yfw_targetProxy respondsToSelector:_cmd]) {
        [webView.yfw_targetProxy webViewDidStartLoad:webView];
    }
}

static inline void yfw_webViewDidFinishLoad (id self, SEL _cmd, UIWebView *webView) {
    [webView.yfw_progressLayer progressAnimationCompletion];
    if (webView.yfw_targetProxy && [webView.yfw_targetProxy respondsToSelector:_cmd]) {
        [webView.yfw_targetProxy webViewDidFinishLoad:webView];
    }
}

static inline void yfw_webViewDidFailLoadWithError (id self, SEL _cmd, UIWebView *webView, NSError *error) {
    [webView.yfw_progressLayer progressAnimationCompletion];
    if (webView.yfw_targetProxy && [webView.yfw_targetProxy respondsToSelector:_cmd]) {
        [webView.yfw_targetProxy webView:webView didFailLoadWithError:error];
    }
}

static inline BOOL yfw_webViewShouldStartLoadWithRequestNavigationType (id self, SEL _cmd, UIWebView *webView, NSURLRequest *request, UIWebViewNavigationType navigationType) {
    if (webView.yfw_targetProxy && [webView.yfw_targetProxy respondsToSelector:_cmd]) {
        return [webView.yfw_targetProxy webView:webView shouldStartLoadWithRequest:request navigationType:navigationType];
    }
    return YES;
}

@end
