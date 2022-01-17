//
//  JDPay.h
//  JDPay
//
//  Created by dongkui on 05/07/2017.
//  Copyright © 2017 JD. All rights reserved.
//

// System
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

// JDPay
#import <JDPay/JDPayModuleSwitch.h>

// JDPayFoundation
#if UsingJDPayFoundation
#   import <JDPay/JDPaySingleton.h>
#   import <JDPay/JDPayModule.h>
#elif __has_include(<JDPayFoundation/JDPayFoundation.h>)
#   import <JDPayFoundation/JDPayFoundation.h>
#endif

// JDPayUIKit
#if UsingJDPayUIKit
#   import <JDPay/JDPayUIColor.h>
#   import <JDPay/JDPayUITableView.h>
#   import <JDPay/JDPayUIScrollView.h>
#   import <JDPay/JDPayUIViewController.h>
#elif __has_include(<JDPayUIKit/JDPayUIKit.h>)
#   import <JDPayUIKit/JDPayUIKit.h>
#endif

// JDPayWebKit
#if UsingJDPayWebKit
#   import <JDPay/JDPayWebView.h>
#   import <JDPay/JDPayWebViewController.h>
#elif __has_include(<JDPayWebKit/JDPayWebKit.h>)
#   import <JDPayWebKit/JDPayWebKit.h>
#endif

// JDPaySecurity
#if UsingJDPaySecurity

#elif __has_include(<JDPaySecurity/JDPaySecurity.h>)
#   import <JDPaySecurity/JDPaySecurity.h>
#endif

// JDPayNetwork
#if UsingJDPayNetwork
#elif __has_include(<JDPayNetwork/JDPayNetwork.h>)
#   import <JDPayNetwork/JDPayNetwork.h>
#endif

// JDPayShare
#if UsingJDPayShare
#   import <JDPay/JDPRouter.h>
#   import <JDPay/JDPayWKWebViewController.h>
#   import <JDPay/JDPServerManager.h>
#elif __has_include(<JDPayShare/JDPayShare.h>)
#   import <JDPayShare/JDPayShare.h>
#endif

// QRCode
#if UsingJDPayQRCode
#   import <JDPay/JDPayQRCodeSDK.h>
#elif __has_include(<JDPayQRCode/JDPayQRCode.h>)
#   import <JDPayQRCode/JDPayQRCode.h>
#endif

// MemberCode
#if UsingJDPayMemberCode
#   import <JDPay/JDPayMemberCodeParams.h>
#   import <JDPay/JDPayMemberCodeContainerView.h>
#   import <JDPay/JDPayMemberCodeSDK.h>
#elif __has_include(<JDPayMemberCode/JDPayMemberCode.h>)
#   import <JDPayMemberCode/JDPayMemberCode.h>
#endif

// QuickPass
#if UsingJDPayQuickPass
#   import <JDPay/JDPayQuickPassSDK.h>
#elif __has_include(<JDPayQuickPass/JDPayQuickPass.h>)
#   import <JDPayQuickPass/JDPayQuickPass.h>
#endif

// UnionPay
#if UsingJDPayUnionPay
#   import <JDPay/JDPayUnionPayConfig.h>
#   import <JDPay/JDPayUnionPaySDK.h>
#elif __has_include(<JDPayUnionPay/JDPayUnionPay.h>)
#   import <JDPayUnionPay/JDPayUnionPay.h>
#endif

// Bracelet
#if UsingJDPayBracelet
#   import <JDPay/JDPayBraceletConfig.h>
#   import <JDPay/JDPayBraceletSDK.h>
#elif __has_include(<JDPayBracelet/JDPayBracelet.h>)
#   import <JDPayBracelet/JDPayBracelet.h>
#endif

// JDPaySDK
#if UsingJDPaySDK
#   import <JDPay/JDPaySDKMain.h>
#   import <JDPay/JDPayAccount.h>
#elif __has_include(<JDPaySDK/JDPaySDK.h>)
#   import <JDPaySDK/JDPaySDK.h>
#endif

// RedEnvelope
#if UsingJDPayRedEnvelope
#   import <JDPay/JDPayRedEnvelopeSDK.h>
#elif __has_include(<JDPayRedEnvelope/JDPayRedEnvelope.h>)
#   import <JDPayRedEnvelope/JDPayRedEnvelope.h>
#endif

// ETC
#if UsingJDPayETC
#   import <JDPay/JDPayETCConfig.h>
#   import <JDPay/JDPayETCSDK.h>
#elif __has_include(<JDPayETC/JDPayETC.h>)
#   import <JDPayETC/JDPayETC.h>
#endif

// OrionMap
#if UsingJDPayOrionMap
#   import <JDPay/JDPayOrionMapSDK.h>
#elif __has_include(<JDPayOrionMap/JDPayOrionMap.h>)
#   import <JDPayOrionMap/JDPayOrionMap.h>
#endif

// JDPayAuth
#if UsingJDPayAuth
#   import <JDPay/JDPayAuthSDK.h>
#elif __has_include(<JDPayAuth/JDPayAuth.h>)
#   import <JDPayAuth/JDPayAuth.h>
#endif


// JDPayAuth
#if UsingJDPayApplePay
#   import <JDPay/JDPayApplePaySDK.h>
#elif __has_include(<JDPayApplePaySDK/JDPayApplePaySDK.h>)
#   import <JDPayApplePaySDK/JDPayApplePaySDK.h>
#endif

#pragma mark - JDPay
NS_ASSUME_NONNULL_BEGIN

@interface JDPay : JDPayModule <JDPayModuleProtocol>
JDPAY_MODULE_FUNCTION_DECLARE(JDPay)

@end

NS_ASSUME_NONNULL_END
