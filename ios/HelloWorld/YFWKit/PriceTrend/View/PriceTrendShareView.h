//
//  PriceTrendShareView.h
//  YaoFang
//
//  Created by NW-YFW on 2018/6/29.
//  Copyright © 2018年 NW. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "YFWPriceTrendModel.h"
@interface PriceTrendShareView : UIView
@property (nonatomic, strong) YFWPriceTrendModel *model;

+ (PriceTrendShareView *)getPriceTrendShareView;

@end
