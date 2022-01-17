//
//  OCUIIconButton.h
//
//  Created by dongkui on 9/1/13.
//  Copyright (c) 2013 dongkui. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#define UIEdgeOffsetsZero UIEdgeOffsetsMake(0, 0, 0, 0)

/**
 Style of the icon button, used to specify the position of the icon.
 */
typedef NS_ENUM(NSInteger, JDPayUIIconButtonStyle) {
    JDPayUIIconButtonStyleIconTop,
    JDPayUIIconButtonStyleIconBottom,
    JDPayUIIconButtonStyleIconLeft,
    JDPayUIIconButtonStyleIconRight
};

typedef struct UIEdgeOffsets {
    CGFloat left, top, width, height;
} UIEdgeOffsets;

UIKIT_STATIC_INLINE UIEdgeOffsets UIEdgeOffsetsMake(CGFloat left, CGFloat top, CGFloat width, CGFloat height)
{
    UIEdgeOffsets offsets = {left, top, width, height};
    return offsets;
}

UIKIT_STATIC_INLINE CGRect UIEdgeOffsetsRect(CGRect rect, UIEdgeOffsets offsets)
{
    rect.origin.x    += offsets.left;
    rect.origin.y    += offsets.top;
    rect.size.width  += offsets.width;
    rect.size.height += offsets.height;
    return rect;
}

/**
 JDPayUIIconButton is used to change the layout of UIButton.
 
 Icon is put on the top and label on the bottom for JDPayUIIconButtonStyleIconTop style.
 +----------+
 | +------+ |
 | | Icon | |
 | +------+ |
 |   Text   |
 +----------+
 */
@interface JDPayUIIconButton : UIButton

/** The icon stype, default to JDPayUIIconButtonStyleIconTop */
@property (nonatomic) JDPayUIIconButtonStyle iconStyle;

/** Specify the image size, defaults to CGSizeZero to get the size by self.imageView.image.size */
@property (nonatomic) CGSize imageSize;

/** Specify the left margin, defaults to 0 */
@property (nonatomic)  CGFloat leftMargin;

/** Specify the top margin, defaults to 0 */
@property (nonatomic)  CGFloat topMargin;

/** Specify the bottom margin, defaults to 0 */
@property (nonatomic)  CGFloat bottomMargin;

/** Specify the right margin, defaults to 0 */
@property (nonatomic) CGFloat rightMargin;

/** Specify space between icon and title, defaults to 0 */
@property (nonatomic) CGFloat spaceBetweenIconAndTitle;

/** Specify edge offsets of icon(self.imageView), defaults to UIEdgeOffsetsZero */
@property (nonatomic) UIEdgeOffsets imageEdgeOffsets;

/** Specify edge offsets of title label(self.titleLabel), defaults to UIEdgeOffsetsZero */
@property (nonatomic) UIEdgeOffsets titleEdgeOffsets;

@end
