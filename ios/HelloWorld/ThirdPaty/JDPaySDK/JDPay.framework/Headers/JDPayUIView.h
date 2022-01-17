//
//  OCUIView.h
//  OCUIKit
//
//  Created by dongkui on 2018/11/3.
//  Copyright © 2018 dongkui. All rights reserved.
//

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

/**
 A custom UIView, which has more powerfull functions. for more detail, please see the comments for each property.
*/
@interface JDPayUIView : UIView

/** The view controller which owns this view. */
@property (nonatomic, weak, nullable) UIViewController *ownerViewController;

/** The background layer, default to nil. */
@property (nonatomic, strong, nullable) CALayer *backgroundLayer;

/**
 Set the background layer with animation.
 
 @param newBackgroundLayer CALayer instance.
 @param duration The animation duration.
 */
- (void)setBackgroundLayer:(nullable CALayer *)newBackgroundLayer withAnimationDuration:(NSTimeInterval)duration;

@end

NS_ASSUME_NONNULL_END
