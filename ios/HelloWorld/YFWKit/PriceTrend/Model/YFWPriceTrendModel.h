//
//  YFWPriceTrendModel.h
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/29.
//  Copyright © 2018年 NW. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface YFWPriceTrendModel : YFWBaseModel<PPModel>

@property (nonatomic, copy) NSString *time;
@property (nonatomic, copy) NSString *price;
@property (nonatomic, copy) NSString *price_sort;
@property (nonatomic, copy) NSString *mill_title;
@property (nonatomic, copy) NSString *goods_name;
@property (nonatomic, copy) NSString *shop_count;
@property (nonatomic, copy) NSString *visit_count;
@property (nonatomic, copy) NSString *chart_desc;
@property (nonatomic, strong) UIImage *priceSortImage;
@property (nonatomic, strong) NSDictionary *chart_item;
@property (nonatomic, copy) NSString *shareUrlString;
@property (nonatomic, copy) NSString *chart_title;

- (instancetype)initWithDic_TCP:(NSDictionary *)dic;
-(NSDictionary *)tcp_chartItem:(NSDictionary *)data;
@end
