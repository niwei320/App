//
//  YFWAlertController.h
//  HelloWorld
//
//  Created by yfw on 2019/11/28.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface YFWAlertController : UIAlertController
/* 标题对齐方式 */
@property (nonatomic, assign) NSTextAlignment titleTextAlignment;
/* 内容对齐方式 */
@property (nonatomic, assign) NSTextAlignment messageTextAlignment;
@end

NS_ASSUME_NONNULL_END
