//
//  YFShopTableCell.h
//  YaoFang
//
//  Created by yaofangwang on 15/1/30.
//  Copyright (c) 2015年 yaofangwang. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>
#import "YFRateView.h"

@class YFShop;

#define YFShopTableCellHeight 90.0

@interface YFShopTableCell : UITableViewCell
@property (nonatomic, strong) YFShop *object;

@property (weak, nonatomic) IBOutlet UIImageView *shopImageView;
@property (weak, nonatomic) IBOutlet UILabel *shopName;
@property (weak, nonatomic) IBOutlet YFRateView *shopRate;
@property (weak, nonatomic) IBOutlet UILabel *distanceLabel;
@property (weak, nonatomic) IBOutlet UIImageView *qianStatusImg;
@property (weak, nonatomic) IBOutlet UILabel *qianLabel;



- (void)setShop:(YFShop *)shop userLocation:(CLLocationCoordinate2D)loction;

@end
