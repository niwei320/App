//
//  YFWLaunchAdViewController.h
//  HelloWorld
//
//  Created by yfw-姜明均 on 2019/6/3.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>

typedef void(^CallBackBlock)(BOOL status);
NS_ASSUME_NONNULL_BEGIN

@interface YFWLaunchAdViewController : UIViewController
@property (nonatomic, strong) NSString *imageUrl;
@property (nonatomic, assign) NSInteger showTimeSecond;
@property (nonatomic, copy) CallBackBlock callBack;
@end

NS_ASSUME_NONNULL_END
