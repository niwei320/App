//
//  YFWFindCodeViewController.h
//  HelloWorld
//
//  Created by yfw-姜明均 on 2019/1/18.
//  Copyright © 2019年 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface YFWFindCodeViewController : UIViewController

@property (nonatomic, copy) void (^doneBlock)();

@property (nonatomic, copy) NSString *customBundleUrl;

@end

NS_ASSUME_NONNULL_END
