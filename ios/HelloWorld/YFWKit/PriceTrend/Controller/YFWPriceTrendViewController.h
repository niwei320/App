//
//  YFWPriceTrendViewController.h
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/13.
//  Copyright © 2018年 ospreyren. All rights reserved.
//


@interface YFWPriceTrendViewController : UIViewController

@property (nonatomic, strong) NSString *commodityID;
@property (nonatomic, assign) BOOL is_from_seller;
@property (nonatomic, assign) BOOL is_TCP;
//请求趋势数据
- (void)requestTrendChart:(NSString *)day_count;
- (void)toBuyMethod;

@end
