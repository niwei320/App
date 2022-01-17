//
//  YFShopTableCell.m
//  YaoFang
//
//  Created by yaofangwang on 15/1/30.
//  Copyright (c) 2015年 yaofangwang. All rights reserved.
//

#import "YFShopTableCell.h"
#import "YFRateView.h"
#import "YFSignedStatusView.h"
#import <BaiduMapAPI_Utils/BMKGeometry.h>
#import "YFShop.h"
#import <SDWebImage/UIImageView+WebCache.h>
@interface YFShopTableCell ()

 
@end

@implementation YFShopTableCell

- (instancetype)initWithStyle:(UITableViewCellStyle)style reuseIdentifier:(NSString *)reuseIdentifier {
  
  NSArray *objs = [[NSBundle mainBundle] loadNibNamed:@"YFShopTableCell"
                                                owner:self
                                              options:nil];
  return objs.firstObject;
  
}

- (instancetype)init {
  NSArray *objs = [[NSBundle mainBundle] loadNibNamed:@"YFShopTableCell"
                                                owner:self
                                              options:nil];
  return objs.firstObject;
}

- (void)awakeFromNib {
    [super awakeFromNib];
    if ([self respondsToSelector:@selector(setLayoutMargins:)]) {
        self.layoutMargins = UIEdgeInsetsZero;
    }
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated {
    [super setSelected:selected animated:animated];
}

- (void)setObject:(YFShop *)object {
    if (![object isKindOfClass:[YFShop class]]) {
        return;
    }
    _object = object;
    
    [self setDataObject:object];
}

- (void)setDataObject:(id)data
{
    YFShop *shop = (YFShop *)data;
    self.shopRate.rate = shop.rate;
    self.shopName.text = shop.name;
    self.distanceLabel.text = shop.distance;
    self.distanceLabel.textColor = [UIColor yf_greenColor_new];
    [self.shopImageView sd_setImageWithURL:[NSURL URLWithString:shop.shopImage_m] placeholderImage:[UIImage imageNamed:@"default_img"]];
    
    if (shop.isSigned) {
        self.qianLabel.textColor = [UIColor yf_greenColor_new];
        self.qianLabel.text = @"签约";
        self.qianStatusImg.image = [UIImage imageNamed:@"yiqianyue"];
    }else
    {
        self.qianLabel.textColor = [UIColor lightGrayColor];
        self.qianLabel.text = @"未签约";
        self.qianStatusImg.image = [UIImage imageNamed:@"weiqianyue"];
        
    }
}

- (void)setShop:(YFShop *)shop userLocation:(CLLocationCoordinate2D)loction {
    [self setObject:shop];
    BMKMapPoint point1 = BMKMapPointForCoordinate(loction);
    BMKMapPoint point2 = BMKMapPointForCoordinate(self.object.coordinate);
    CLLocationDistance distance = BMKMetersBetweenMapPoints(point1,point2);
    NSString *distanceStr;
    if (distance >= 1000) {
        distanceStr = [NSString stringWithFormat:@"%.1fkm", distance/1000.0];
    } else {
        distanceStr = [NSString stringWithFormat:@"%dm", (int)distance];
    }
    self.distanceLabel.text = distanceStr;
}

@end
