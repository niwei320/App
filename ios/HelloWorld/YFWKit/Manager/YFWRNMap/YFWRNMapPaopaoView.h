//
//  YFWRNMapPaopaoView.h
//  HelloWorld
//
//  Created by yfw on 2020/12/15.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>
NS_ASSUME_NONNULL_BEGIN
typedef void(^clickAction)(NSDictionary *info);
@interface YFWRNMapPaopaoView : BMKActionPaopaoView

@property (nonatomic, copy) clickAction clickActionCallBack;
@property (nonatomic, copy) clickAction timeEndCallBack;
@property (nonatomic, strong) NSDictionary *info;
@end

NS_ASSUME_NONNULL_END
