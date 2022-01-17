//
//  YFWPriceTrendFooterCell.h
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/13.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "YFWPriceTrendModel.h"
@class YFWPriceTrendViewController;

@interface YFWPriceTrendFooterCell : UITableViewCell

@property (nonatomic, weak) YFWPriceTrendViewController *controller;
@property (nonatomic, strong) YFWPriceTrendModel *model;

+ (CGFloat)cellHeight:(YFWPriceTrendModel *)model;

@end
