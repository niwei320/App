//
//  SFWebViewController.h
//  JSFUIKit
//
//  Created by dongkui on 2019/10/13.
//  Copyright © 2019 dongkui. All rights reserved.
//

#import "JDPayWebView.h"

#if __has_include(<JDPayUIKit/JDPayUIViewController.h>)
#import <JDPayUIKit/JDPayUIViewController.h>
#else
#import <JDPay/JDPayUIViewController.h>
#endif

NS_ASSUME_NONNULL_BEGIN

extern NSString *const kJDPayWebViewControllerNavBarButtonItemClose;

@class JDPayWebViewController;
@protocol JDPayWebViewControllerDelegate <NSObject>

@optional

/*!
 @brief Decide whether it is allowed to start the navigation action.
 @param navigationAction The navigation action.
 @return YES to allow the navigation action, NO to cancel it.
*/
- (BOOL)viewController:(JDPayWebViewController *)viewController shouldStartNavigationAction:(WKNavigationAction *)navigationAction;

/*!
 @brief Decide whether it is allowed to start the navigation response.
 @param navigationResponse The navigation response.
 @return YES to allow the navigation response, NO to cancel it.
*/
- (BOOL)viewController:(JDPayWebViewController *)viewController shouldStartNavigationResponse:(WKNavigationResponse *)navigationResponse;

/*!
 @brief Invoked when a server redirect is received for the main frame.
 @param viewController The view controller invoking the delegate method.
 @param navigation The navigation.
 */
- (void)viewController:(JDPayWebViewController *)viewController didReceiveServerRedirectForProvisionalNavigation:(null_unspecified WKNavigation *)navigation;

/*!
 @brief Called when the navigation is began.
 @param navigation The navigation.
*/
- (void)viewController:(JDPayWebViewController *)viewController didBeginNavigation:(null_unspecified WKNavigation *)navigation;

/*!
 @brief Called when the navigation is end.
 @param navigation The navigation.
 @param error The error if it has.
*/
- (void)viewController:(JDPayWebViewController *)viewController didEndNavigation:(null_unspecified WKNavigation *)navigation withError:(nullable NSError *)error;

/*!
 @brief Invoked when the web view needs to respond to an authentication challenge.
 @param viewController The view controller that received the authentication challenge.
 @param challenge The authentication challenge.
 @param completionHandler The completion handler you must invoke to respond to the challenge. The disposition argument is one of the constants of the enumerated type NSURLSessionAuthChallengeDisposition.
 When disposition is NSURLSessionAuthChallengeUseCredential, the credential argument is the credential to use, or nil to indicate continuing without a credential.
 @discussion If you do not implement this method, the view controller will respond to the authentication challenge with the NSURLSessionAuthChallengeRejectProtectionSpace disposition.
 */
- (void)viewController:(JDPayWebViewController *)viewController didReceiveAuthenticationChallenge:(NSURLAuthenticationChallenge *)challenge completionHandler:(void (^)(NSURLSessionAuthChallengeDisposition disposition, NSURLCredential * _Nullable credential))completionHandler;

@end

/*!
 @abstract A enhanced WebView controller displays interactive Web content.
*/
API_AVAILABLE(ios(8.0))
@interface JDPayWebViewController : JDPayUIViewController

@property (nonatomic, strong) NSString *cancelActionTextOfJSAlertPanel;
@property (nonatomic, strong) NSString *cancelActionTextOfJSConfirmPanel;
@property (nonatomic, strong) NSString *comfirmActionTextOfJSConfirmPanel;
@property (nonatomic, strong) NSString *comfirmActionTextOfJSTextInputPanel;

/*!
 @brief Use the HTML title.
 @discussion The defaults value is YES.
 */
@property (nonatomic, assign) BOOL useHTMLTitle;

/*!
 @brief Specify amount to inset (positive) for each of web content edges. values can be negative to 'outset'
 @discussion The defaults value is UIEdgeInsetsZero.
*/
@property (nonatomic, assign) UIEdgeInsets webContentInsets;

/**
 @brief A Boolean value indicating whether horizontal swipe gestures will trigger back-forward list navigations.
 @discussion The default value is YES.
 */
@property (nonatomic) BOOL allowsBackForwardNavigationGestures;

/*!
 @brief Set the close bar button style on navigation bar.
 @discussion The defaults value is JDPayUIViewControllerBarButtonItemStyleBlack.
 @note If you are using the system navigation bar, then the interactive pop gesture will stop working.
 @note Make sure to call this in or after the '- viewDidLoad'.
 */
@property (nonatomic, assign) JDPayUIViewControllerBarButtonItemStyle navBarCloseButtonStyle;

/*!
 @brief Call when user click the close button on navigation bar.
 @discussion The default implementation will close the view controller.
 */
- (void)didClickNavBarCloseButtonOnViewController:(JDPayWebViewController *)viewController;

/*!
 @brief Navigates to a requested URL.
 @param request The request specifying the URL to which to navigate.
 @result A new navigation for the given request.
 */
- (nullable WKNavigation *)loadRequest:(NSURLRequest *)request;

@property (nonatomic, weak, nullable) id<JDPayWebViewControllerDelegate> delegate;// @see JDPayWebViewControllerDelegate

@property (nonatomic, readonly) BOOL canGoBack;// A Boolean value indicating whether there is a webpage can be navigated to.

/*!
 @brief Navigates to previous webpage.
 @result A new navigation to the previous webpage, or nil if there is no previous webpage.
 */
- (nullable WKNavigation *)goBack;

/*
 @brief Evaluates the given JavaScript string.
 @param javaScriptString The JavaScript string to evaluate.
 @param completionHandler A block to invoke when script evaluation completes or fails.
 @discussion The completionHandler is passed the result of the script evaluation or an error.
*/
- (void)evaluateJavaScript:(NSString *)javaScriptString completionHandler:(void (^ _Nullable)(_Nullable id, NSError * _Nullable error))completionHandler;

@end

NS_ASSUME_NONNULL_END
