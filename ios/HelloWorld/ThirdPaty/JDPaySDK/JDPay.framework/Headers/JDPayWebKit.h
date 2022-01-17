//
//  JDPayWebKit.h
//  JDPayWebKit
//
//  Created by dongkui on 05/07/2017.
//  Copyright © 2017 JD. All rights reserved.
//

#import <UIKit/UIKit.h>

#if __has_include(<JDPayWebKit/JDPayWebView.h>)
    #import <JDPayWebKit/JDPayWebKitConfig.h>
    #import <JDPayWebKit/JDPayWebView.h>
    #import <JDPayWebKit/JDPayWebViewController.h>
#else
    #import <JDPay/JDPayWebKitConfig.h>
    #import <JDPay/JDPayWebView.h>
    #import <JDPay/JDPayWebViewController.h>
#endif

