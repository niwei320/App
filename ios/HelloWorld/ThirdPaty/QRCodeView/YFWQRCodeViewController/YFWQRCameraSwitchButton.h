//
//  YFWQRCameraSwitchButton.h
//  YaoFang
//
//  Created by 姜明均 on 2017/5/26.
//  Copyright © 2017年 ospreyren. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface YFWQRCameraSwitchButton : UIButton

#pragma mark - Managing Properties
/** @name Managing Properties */

/**
 * @abstract The edge color of the drawing.
 * @discussion The default color is the white.
 * @since 2.0.0
 */
@property (nonatomic, strong) UIColor *edgeColor;

/**
 * @abstract The fill color of the drawing.
 * @discussion The default color is the darkgray.
 * @since 2.0.0
 */
@property (nonatomic, strong) UIColor *fillColor;

/**
 * @abstract The edge color of the drawing when the button is touched.
 * @discussion The default color is the white.
 * @since 2.0.0
 */
@property (nonatomic, strong) UIColor *edgeHighlightedColor;

/**
 * @abstract The fill color of the drawing when the button is touched.
 * @discussion The default color is the black.
 * @since 2.0.0
 */
@property (nonatomic, strong) UIColor *fillHighlightedColor;

@end
