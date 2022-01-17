//
//  YFWShareViewController.h
//  HelloWorld
//
//  Created by yfw-姜明均 on 2018/9/26.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface YFWShareViewController : UIViewController

@property (nonatomic, copy) NSString *type;
@property (nonatomic, strong) NSDictionary *data;
@property (nonatomic, copy) void (^returnBlock)();

- (void)shareMethod;

- (void)sharePicMethod;

@end
