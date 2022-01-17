//
//  YFWFindCodeView.h
//  HelloWorld
//
//  Created by yfw-姜明均 on 2018/12/24.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "YFWMedicineBPManager.h"

NS_ASSUME_NONNULL_BEGIN

@interface YFWFindCodeView : UIView

@property (nonatomic, copy) void (^doneBlock)();

- (void)request:(YFWFindCodeModel *)model;

+ (YFWFindCodeView *)getYFWFindCodeView;

@end

NS_ASSUME_NONNULL_END
