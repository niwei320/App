//
//  YFWPriceTrendModel.m
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/29.
//  Copyright © 2018年 NW. All rights reserved.
//

#import "YFWPriceTrendModel.h"

@implementation YFWPriceTrendModel
-(instancetype)init{
  if (self = [super init]) {
  
  }
  return self;
}
- (instancetype)initWithDic:(NSDictionary *)dic{
    
    if (self = [super init]) {
        
        _time = getSafeString(dic[@"time"]);
        _price = getSafeString(dic[@"price"]);
        _price_sort = getSafeString(dic[@"price_sort"]);
        _mill_title = getSafeString(dic[@"mill_title"]);
        _goods_name = getSafeString(dic[@"goods_name"]);
        _shop_count = getSafeString(dic[@"shop_count"]);
        _visit_count = getSafeString(dic[@"visit_count"]);
        _chart_desc = getSafeString(dic[@"chart_desc"]);
        _chart_item = [dic[@"chart_item"] safeDictionary];
        
    }
    
    return self;
}
- (instancetype)initWithDic_TCP:(NSDictionary *)dic{
  
  if (self = [super init]) {
    
    _time = [getSafeString(dic[@"time"]) stringByReplacingOccurrencesOfString:@"-" withString:@"."];
    _price = getSafeString(dic[@"price"]);
    _price_sort = getSafeString(dic[@"price_sort"]);
    _mill_title = getSafeString(dic[@"mill_title"]);
    _goods_name = getSafeString(dic[@"goods_name"]);
    _shop_count = getSafeString(dic[@"store_num"]);
    _visit_count = getSafeString(dic[@"visit_count"]);
    _chart_desc = getSafeString(dic[@"chart_desc"]);
    _chart_item = [self tcp_chartItem:dic[@"chart_item"]];
    _chart_title = @"近一个月";
  }
  
  return self;
}
-(NSDictionary *)tcp_chartItem:(NSDictionary *)data{
  if (!data) {
    data = @{};
  }
  NSMutableDictionary *dic = [[NSMutableDictionary alloc] initWithCapacity:2];
  id priceList = data[@"price_list"];
  if (!priceList) {
    priceList = @[];
  }
  id timeList = data[@"time_list"];
  if (!timeList) {
    timeList = @[];
  }
  [dic setObject:priceList forKey:@"item_prices"];
  [dic setObject:timeList forKey:@"item_times"];
  return [dic copy];
}

- (UIImage *)priceSortImage{
    
    UIImage *image = nil;
    
    if ([self.price_sort isEqualToString:@"up"]) {
        image = [UIImage imageNamed:@"pt_up"];
    }else if ([self.price_sort isEqualToString:@"down"]){
        image = [UIImage imageNamed:@"pt_down"];
    }else if ([self.price_sort isEqualToString:@"level"]){
        image = [UIImage imageNamed:@"pt_line"];
    }
    
    return image;
}

- (NSString *)chart_desc{
    
    if (_chart_desc.length == 0) {
        _chart_desc = @"暂无";
    }
    return _chart_desc;
    
}


@end
