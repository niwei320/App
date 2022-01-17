//
//  YFWPriceTrendRankingCategoryTableViewCell.h
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/14.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface YFWPriceTrendRankingCategoryTableViewCell : UITableViewCell

@property (nonatomic, strong) NSArray *dataArray;
@property (nonatomic, copy) void(^selectItemMethod)(NSString *titleName);

+ (CGFloat)getCellHeight:(NSArray *)dataArray;

@end
