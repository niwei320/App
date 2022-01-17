//
//  JDPayUINavigationBar.h
//  JDPayUIKit
//
//  Created by dongkui on 2018/4/22.
//  Copyright © 2018 JD. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "JDPayUIView.h"

#pragma mark - JDPayUIBarButtonItem
@interface JDPayUIBarButtonItem : NSObject

/**
 Init the item with a custom view
 
 @param customView Custom view
 @return JDPayUIBarButtonItem instance
 */
- (instancetype _Nullable )initWithCustomView:(UIView * _Nullable)customView NS_DESIGNATED_INITIALIZER;

/** Custom view */
@property (nonatomic, strong, nullable) __kindof UIView *customView;

/**
 The size of the custom view.
 
 If this property value is positive(both width and height), the size of the customView is fixed. If the value is
 CGSizeZero or negative, the size of the customView will be resized to fit. The default value is CGSizeZero.
 */
@property (nonatomic) CGSize size;

@end

#pragma mark - JDPayUINavigationItem
@interface JDPayUINavigationItem : NSObject

/** Title of the navigation bar. default is nil */
@property (nonatomic, copy, nullable) NSString *title;

/** Title view on the navigation bar. The defaut type is UILabel */
@property (nonatomic, strong, nullable) UIView *titleView;

/**
 Use these properties to set multiple items in the navigation bar.
 
 leftBarButtonItems are placed in the navigation bar left to right with the first
 item in the list at the left outside edge and left aligned.
 rightBarButtonItems are placed right to left with the first item in the list at
 the right outside edge and right aligned.
 */
@property (nonatomic, copy, nullable) NSArray<JDPayUIBarButtonItem *> *leftBarButtonItems;
@property (nonatomic, copy, nullable) NSArray<JDPayUIBarButtonItem *> *rightBarButtonItems;

@end

#pragma mark - JDPayUINavigationBar
/** A custom navigation bar, which has more flexable functions for customizations. */
@interface JDPayUINavigationBar : JDPayUIView

/**
 Created on-demand so that a view controller may customize its custom navigation bar appearance.
 
 @note Only title, titleView, leftBarButtonItems and rightBarButtonItems properties are used for
 custom navigation bar, for more detail, please see the comments in JDPayUINavigationItem
 */
@property (nonatomic, strong, readonly, nonnull) JDPayUINavigationItem *navigationItem;

/** The edge insets for the bar items(exclude titleView) on navigation bar. Defaults to UIEdgeInsetsMake(0, 0, 0, 16) */
@property (nonatomic, assign) UIEdgeInsets barItemEdgeInsets;

/** The space between the bar items for the navigation bar. Defaults to 0.f */
@property (nonatomic, assign) CGFloat spaceBetweenBarItems;

/** A Boolean value which determines whether to hide the bottom 1 pixel border, default to NO. */
@property (nonatomic, assign) BOOL hideBottomBorder;

@end
