//
//  YFWPriceTrendHeaderCell.h
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/13.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "YFWPriceTrendModel.h"

@interface YFWPriceTrendHeaderCell : UITableViewCell
@property (weak, nonatomic) IBOutlet UIView *radiusView;
@property (nonatomic, strong) YFWPriceTrendModel *model;

+ (YFWPriceTrendHeaderCell *)getYFWPriceTrendHeaderCell;
@end
