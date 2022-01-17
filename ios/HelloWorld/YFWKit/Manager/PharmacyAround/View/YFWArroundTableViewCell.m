//
//  YFWArroundTableViewCell.m
//  YaoFang
//
//  Created by 小猪猪 on 16/6/27.
//  Copyright © 2016年 SQC. All rights reserved.
//

#import "YFWArroundTableViewCell.h"
#import "YFShop.h"
#import <SDWebImage/UIImageView+WebCache.h>
@implementation YFWArroundTableViewCell

- (void)setDataObject:(id)data
{
    YFShop *shop = (YFShop *)data;
    self.shopRate.rate = shop.rate;
    self.shopName.text = shop.name;
    self.distanceLabel.text = [NSString stringWithFormat:@"%.1fkm",shop.distance.floatValue];
    [self.shopImageView sd_setImageWithURL:[NSURL URLWithString:shop.shopImage_m] placeholderImage:[UIImage imageNamed:@"default_img"]];
    
    if (shop.isSigned) {
        self.qianLabel.textColor = [UIColor yf_greenColor_new];
        self.qianLabel.text = @"已签约";
        self.qianStatusImg.image = [UIImage imageNamed:@"icon_select"];
    }else
    {
        self.qianLabel.textColor = [UIColor lightGrayColor];
        self.qianLabel.text = @"未签约";
        self.qianStatusImg.image = [UIImage imageNamed:@"icon_normal"];

    }
}


- (void)awakeFromNib {
  [super awakeFromNib];
  
  self.backView.layer.cornerRadius = 8;
  self.backView.layer.shadowColor = [UIColor yf_backGroundColor].CGColor;
  self.backView.layer.shadowRadius = 13;
  self.backView.layer.shadowOpacity = 1;
  self.backView.layer.shadowOffset = CGSizeMake(0, 0);
}

+ (YFWArroundTableViewCell *)getYFWArroundTableViewCell
{
    NSArray *array = [[NSBundle mainBundle] loadNibNamed:@"YFWArroundTableViewCell" owner:self options:nil];
    YFWArroundTableViewCell *view = array[0];
    return view;
}




@end
