//
//  YFWPriceTrendViewModel.h
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/26.
//  Copyright © 2018年 NW. All rights reserved.
//

#import "YFWBaseViewModel.h"

@interface YFWPriceTrendViewModel : YFWBaseViewModel

@property (nonatomic, copy) NSString *goods_id;
@property (nonatomic, assign) BOOL is_TCP;
@property (nonatomic, copy) void(^trendChartReturnBlock)(id returnValue,NSString *day_count) ;


//价格趋势 数据报表
- (void)getServiceTrendChartData:(NSString *)day_count;

@end
