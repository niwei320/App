//
//  YFWPriceTrendRankingListSectionHeaderView.h
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/14.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface YFWPriceTrendRankingListSectionHeaderView : UIView

@property (nonatomic, copy) NSString *title;
@property (nonatomic, copy) void(^moreMethodBlock)();

+ (YFWPriceTrendRankingListSectionHeaderView *)getYFWPriceTrendRankingListSectionHeaderView;

@end
