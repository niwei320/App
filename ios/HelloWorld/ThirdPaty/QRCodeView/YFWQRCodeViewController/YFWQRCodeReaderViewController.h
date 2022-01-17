//
//  YFWQRCodeReaderViewController.h
//  YaoFang
//
//  Created by 姜明均 on 2017/5/26.
//  Copyright © 2017年 ospreyren. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <AVFoundation/AVFoundation.h>
#import "YFWQRCodeReaderDelegate.h"
/**
 * The `QRCodeReaderViewController` is a simple QRCode Reader/Scanner based on
 * the `AVFoundation` framework from Apple. It aims to replace ZXing or ZBar
 * for iOS 7 and over.
 */
@interface YFWQRCodeReaderViewController : UIViewController

#pragma mark - Managing the Delegate
/** @name Managing the Delegate */

/**
 * @abstract The object that acts as the delegate of the receiving QRCode
 * reader.
 * @since 1.0.0
 */
@property (nonatomic, weak) id<YFWQRCodeReaderDelegate> delegate;

- (void)allStop;

@end
