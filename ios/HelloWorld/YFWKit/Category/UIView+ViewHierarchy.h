//
//  UIView+ViewHierarchy.h
//  HelloWorld
//
//  Created by yfw on 2019/11/28.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface UIView (ViewHierarchy)
- (void)logViewHierarchy;
- (NSArray *)labelsForTitle:(NSString *)title message:(NSString *)message;
@end

NS_ASSUME_NONNULL_END
