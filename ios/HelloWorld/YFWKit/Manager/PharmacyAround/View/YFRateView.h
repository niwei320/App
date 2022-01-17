//
//  YFRateView.h
//  YaoFang
//
//  Created by yaofangwang on 15/1/27.
//  Copyright (c) 2015年 yaofangwang. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface YFRateView : UIView

- (instancetype)initWithDefaultFrame;

/**
 @brief rate小于等于5.0,大于等于0 
 */
@property (nonatomic, assign) CGFloat rate;

@end
