//
//  YFWPriceTrendViewModel.m
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/26.
//  Copyright © 2018年 NW. All rights reserved.
//

#import "YFWPriceTrendViewModel.h"
#import "YFWPriceTrendModel.h"

@implementation YFWPriceTrendViewModel

//价格趋势 数据报表
- (void)getServiceTrendChartData:(NSString *)day_count{
  
  NSDictionary *param = @{@"__cmd"   : @"guest.repAvgpriceWeek.get_medicine_price_trend_chart",
                          @"medicineid"  : getSafeString(self.goods_id),
                          @"dayCount" : getSafeString(day_count)};
  
  [self.tcp_sessionManager requestAsynParameters:param success:^(id responseObject) {
    if (self.trendChartReturnBlock) {
      self.trendChartReturnBlock(responseObject,day_count);
    }
  } failure:^(NSError *error) {
//    if (self.errorBlock) {
//      self.errorBlock(error);
//    }
  }];
  
}

- (void)getServiceData{
  
  NSDictionary *param = @{@"__cmd"   : @"guest.repAvgpriceWeek.get_medicine_price_trend_info",
                          @"medicineid"  : getSafeString(self.goods_id)};
  [self.tcp_sessionManager requestAsynParameters:(id)param success:^(id responseObject) {
    if ([responseObject[@"code"] intValue] == 1) {
      [YFWProgressHUD dismiss];
      
      NSDictionary *param = [responseObject[@"result"] safeDictionary];
      YFWPriceTrendModel *model = [[YFWPriceTrendModel alloc] initWithDic_TCP:param];
      if (self.returnBlock) {
        self.returnBlock(model);
      }
      
    }else if ([responseObject[@"code"] intValue] == -1){
      [YFWProgressHUD showErrorWithStatus:responseObject[@"msg"]];
      if (self.errorBlock) {
        self.errorBlock(responseObject[@"msg"]);
      }
    }else{
      [YFWProgressHUD dismiss];
      if (self.errorBlock) {
        self.errorBlock(responseObject[@"msg"]);
      }
    }
    
  } failure:^(NSError *error) {
    if (self.errorBlock) {
      self.errorBlock(error);
    }
  }];
  
}


@end
