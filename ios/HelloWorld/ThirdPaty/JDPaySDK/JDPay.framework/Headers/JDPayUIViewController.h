//
//  JDPayUIViewController.h
//  JDPayUIKit
//
//  Created by dongkui on 2018/4/17.
//  Copyright © 2018 JD. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "JDPayUINavigationBar.h"

NS_ASSUME_NONNULL_BEGIN

extern NSString * const kJDPayUIViewControllerNavBarButtonItemBack;

#pragma mark - JDPayUIViewControllerBarButtonItemStyle
typedef NS_ENUM(NSUInteger, JDPayUIViewControllerBarButtonItemStyle) {
    JDPayUIViewControllerBarButtonItemStyleNone,  // Remove the custom bar button item if it exists
    JDPayUIViewControllerBarButtonItemStyleBlack, // Set to black style
    JDPayUIViewControllerBarButtonItemStyleWhite  // Set to white style
};

#pragma mark - JDPayUIViewController
@class JDPayUIScrollView;

/**
 A custom UIViewController, which has more powerfull functions. for more detail, please see the comments for each property.
 
 @warning If you want to create a subclass of this view controller and you want to do something in the '- loadView' function,
 you must first call super view's '- loadView' function in your custom subclass view controller. meantime, you must not
 replace the root view of UIViewController with your custom view.
 
 @note In case of getting all these functions work properly, you should add all your subviews into the contentView.
 */
@interface JDPayUIViewController : UIViewController

/** The background layer of the controller, default to nil. */
@property (nonatomic, strong) CALayer *backgroundLayer;

/** End editing state when touch empty places(not on control), defaults to YES. */
@property (nonatomic, assign) BOOL endEditingWhenTouchEmptyPlaces;

/**
 Disable interactive pop gesture, defaults to NO.
 
 @warning You may need to save the old value of 'self.navigationController.interactivePopGestureRecognizer.enabled' before
 you call '- viewDidAppear:' in your subclass, so that you can recovery it if needs.
 */
@property (nonatomic, assign) BOOL disableInteractivePopGesture;

/**
 Adjust contentSize of contentView to the specific value automatically for screen height less than the  specific value, Defaults to 568.
 
 @note You can set the value less or equal to zero, if you want to close the auto-adjustment feature.
 @note If you are adding a subview into the contentView. if the subView is a kind of UIScrollView and its frame is equal to the bounds
 of the contentView, then this value will be set to zero automatically. you can reset it to other value if you want to.
 */
@property (nonatomic, assign) CGFloat autoAdjustContentSizeOfContentViewForMinScreenHeight;

/**
 Adjust contentSize of contentView for keyboard automatically, Defaults to NO.
 */
@property (nonatomic, assign) BOOL autoAdjustContentSizeOfContentViewForKeyboard;

/**
 The root view of the view controller, which is placed below the navigation bar.
 
 @note The frame, bounds, center of the contentView will be updated automatically when needed, so if you have any view
 depends on this, you must override the '-viewDidLayoutSubviews' method and update the value of the view properly.
 */
@property (nonatomic, strong, readonly) JDPayUIScrollView *contentView;

/** Use custom JDPayUINavigationBar. */
@property (nonatomic, assign, readonly) BOOL useCustomNavigationBar;

/** Custom navigation bar, this property is only available when customNavigationBar is YES. */
@property (nonatomic, strong, readonly, nullable) JDPayUINavigationBar *customNavigationBar;

/**
 Created on-demand so that a view controller may customize its custom navigation bar appearance.
 
 @note Only title, titleView, leftBarButtonItems and rightBarButtonItems properties are used for custom navigation bar,
 for more detail, please see the comments in JDPayUINavigationItem
 */
@property (nonatomic, strong, readonly, nullable) JDPayUINavigationItem *customNavigationItem;

/**
 Set the  bar button item on navigation bar.
 
 @param identity The Identity of the item, must be unique.
 @param style The style of the item.
 @param isLeadingBar Specific the position of the item, YES for left and NO for right.
 @param creationHandler The handler used to create an item if it isn't exist for the identity.
 @param configurationHandler The handler used to configure the item.
 */
- (BOOL)setNavBarButtonItemWithId:(NSString *)identity
                            style:(JDPayUIViewControllerBarButtonItemStyle)style
                     isLeadingBar:(BOOL)isLeadingBar
                  creationHandler:(UIView * (^_Nullable)(void))creationHandler
             configurationHandler:(void (^_Nullable)(NSObject *item))configurationHandler;


/**
 Get the button item  on navigation bar with the identity.
 
 @param identity The identity of the item.
 
 @return A relative item depends on if you are using a custom navigation bar. for custom navigation bar, it
 is JDPayUIBarButtonItem and for system navigation bar, it is UIBarButtonItem. @see useCustomNavigationBar
 */
- (NSObject *_Nullable)navBarButtonItemWithId:(NSString *)identity;

/**
 Set the back bar button style on navigation bar.
 
 @discussion The defaults value is JDPayUIViewControllerBarButtonItemStyleBlack when you are using custom back bar
 button on navigation bar.
 @note If you are using the system navigation bar, then the interactive pop gesture will stop working.
 @note Make sure to call this in or after the '- viewDidLoad'.
 */
@property (nonatomic, assign) JDPayUIViewControllerBarButtonItemStyle navBarBackButtonStyle;

/**
 Call when user click the back button on navigation bar.
 
 @discussion The default implementation will close the view controller.
 */
- (void)didClickNavBarBackButtonOnViewController:(JDPayUIViewController *)viewController;

/**
 Init the view controller with given params

 @warning If you are using custom navigation bar, the system navigation will be hidden automatically. you must recovery
 the state when you are not using the custom navigation bar. The best case is that you use custom navigation bar in a whole
 SDK project, so that you can push and pop the navigation bar state when you enter and leave the SDK.
 
 @warning Do not call self.view in the initialize methods if you have uninitialized parameters would be used during the
 view loading process('- loadView' -> '- viewDidLoad' -> ...). the initialize methods include '- init',
 '- initToUseCustomNavigationBar:', '- initWithNibName:bundle:' and '- initWithCoder:'.
 
 @param useCustomNavigationBar YES to use custom navigation bar.
 @return JDPayUIViewController instance
 */
- (nullable instancetype)initToUseCustomNavigationBar:(BOOL)useCustomNavigationBar NS_DESIGNATED_INITIALIZER;

/**
 Set the background layer of the controller with animation.
 
 @warning You must call this method after the view is loaded.
 @param newBackgroundLayer CALayer instance.
 @param duration The animation duration.
 */
- (void)setBackgroundLayer:(CALayer *)newBackgroundLayer withAnimationDuration:(NSTimeInterval)duration;

/**
 Force to layout the subviews of its view.
 */
- (void)setNeedsLayoutSubviews;

/**
 Close the view controller.
 @discussion You can overide it to do your custom actions.
 @param animated Do animation or not.
*/
- (void)closeViewControllerAnimated:(BOOL)animated;

@end

#pragma mark - JDPayUIViewController (UITextField)
@interface JDPayUIViewController (UITextField)

/** Convenient method to make its root view or any subview that is the first responder resign. */
- (BOOL)endEditing;

@end

NS_ASSUME_NONNULL_END
