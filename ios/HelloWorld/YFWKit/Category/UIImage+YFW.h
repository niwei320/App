//
//  UIImage+YFW.h
//  HelloWorld
//
//  Created by yfw-姜明均 on 2019/4/16.
//  Copyright © 2019年 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface UIImage (YFW)
+ (UIImage*)mosaicWithImage:(UIImage *)image Level:(NSUInteger)level;
@end

NS_ASSUME_NONNULL_END
