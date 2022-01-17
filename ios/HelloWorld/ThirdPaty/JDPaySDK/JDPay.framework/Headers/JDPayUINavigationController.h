//
//  JDPayUINavigationController.h
//  JDPayUIKit
//
//  Created by dongkui on 2018/4/22.
//  Copyright © 2018 JD. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface JDPayUINavigationController : UINavigationController

/**
 Get the top most view controller
 */
+ (UIViewController *)topMostViewController;

/**
 Show a view controller accordingly, if the viewController is a kind of UINavigationController, the viewController will
 be presented, or else it will be pushed.
 
 @param viewController The view controller to show.
 @prarm animated Whether to do animation while showing the viewController.
 */
+ (void)showViewController:(UIViewController *)viewController animated:(BOOL)animated;

@end
