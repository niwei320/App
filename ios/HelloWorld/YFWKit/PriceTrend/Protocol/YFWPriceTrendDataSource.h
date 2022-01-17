//
//  YFWPriceTrendDataSource.h
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/13.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import "YFWBaseDataSource.h"
@class YFWPriceTrendCenterCell,YFWPriceTrendModel;

@interface YFWPriceTrendDataSource : YFWBaseDataSource

@property (nonatomic, strong) YFWPriceTrendModel *model;
@property (nonatomic, strong) YFWPriceTrendCenterCell *centerCell;

@end
