//
//  YFWPriceTrendCenterCell.h
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/13.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import <UIKit/UIKit.h>
@class YFWPriceTrendViewController;

@interface YFWPriceTrendCenterCell : UITableViewCell

@property (nonatomic, weak) YFWPriceTrendViewController *controller;
@property (nonatomic, strong) NSDictionary *showSelectItem;
@property (nonatomic, copy) NSString *showSelectItemTitle;


//重新绘制折线图
- (void)strokeChartWith:(NSDictionary *)item dayCount:(NSString *)day_count;
+ (YFWPriceTrendCenterCell *)getYFWPriceTrendCenterCell;

@end
