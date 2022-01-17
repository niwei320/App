//
//  YFWAroundViewController.h
//  YaoFang
//
//  Created by 小猪猪 on 16/5/24.
//  Copyright © 2016年 SQC. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface YFWAroundViewController : UIViewController

@property (nonatomic, assign) BOOL isTCP;
@property (nonatomic, copy) void (^returnBlock)(NSDictionary *info);

@end
