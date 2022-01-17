//
//  WKWebView+ClearCache.h
//  HelloWorld
//
//  Created by yfw on 2020/6/5.
//  Copyright © 2020 Facebook. All rights reserved.
//


#import <WebKit/WebKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface WKWebView (ClearCache)
// 自定义清除缓存

+(void)yfwcustomDeleteWebCache;
// 清除全部缓存

+(void)yfwdeleteWebCache;
// ios9以前清除缓存

+(void)yfwclearCacheInCurrentVersion;

@end

NS_ASSUME_NONNULL_END
