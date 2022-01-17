//
//  OCUICheckBox.h
//  OCUIKit
//
//  Created by dongkui on 6/8/14.
//  Copyright (c) 2014 dongkui. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#pragma mark - JDPayUICheckBoxStyle
/**
 Style of the check box, used to specify the position of the check box image.
 */
typedef NS_ENUM(NSInteger, JDPayUICheckBoxStyle) {
    JDPayUICheckBoxStyleIconTop,
    JDPayUICheckBoxStyleIconBottom,
    JDPayUICheckBoxStyleIconLeft,
    JDPayUICheckBoxStyleIconRight
};

#pragma mark - JDPayUICheckBoxDelegate
@class JDPayUICheckBox;
@protocol JDPayUICheckBoxDelegate <NSObject>

@optional

/**
 Call when the state of the checkbox was changed.

 @param checkBox JDPayUICheckBox
 */
- (void)didChangeStateOfCheckBox:(JDPayUICheckBox*)checkBox;

/**
 Call when user touched the text of the checkbox.
 
 @param checkBox JDPayUICheckBox
 */
- (void)didTouchTextOfCheckBox:(JDPayUICheckBox*)checkBox;

@end

#pragma mark - JDPayUICheckBox
/**
 A custom check box
 */
@interface JDPayUICheckBox: UIView

@property (nonatomic,weak) id<JDPayUICheckBoxDelegate> delegate;

/**
 Specify the space between the image and text. default is 5.f
 */
@property (nonatomic,assign) CGFloat spaceBetweenImageAndText;

/**
 A Boolean value that determines whether it is checked.
 */
@property (nonatomic,assign) BOOL checked;

/**
 A Boolean value that determines whether it is enabled, default is YES. if set to NO, user interactions are ignored and
 the alpha of the icon will be set to 0.6.
 */
@property (nonatomic,assign) BOOL enabled;

/**
 A Boolean value that determines whether to change the check/uncheck state if user touch the text. default is YES.
 */
@property (nonatomic,assign) BOOL isChangeStateIfTouchText;

/**
 Specify the icon of checked state
 */
@property (nonatomic,strong) UIImage *checkedImage;

/**
 Specify the icon of unchecked state
 */
@property (nonatomic,strong) UIImage *unCheckedImage;

/**
 Specify the style
 */
@property (nonatomic,assign) JDPayUICheckBoxStyle style;

/**
 Specify the text
 */
@property (nonatomic,copy) NSString *text;

/**
 Specify the text font. default to nil (system font 17 plain)
 */
@property (nonatomic,strong) UIFont *font;

/**
 Specify the text color.
 */
@property (nonatomic,strong) UIColor *textColor;

@end
