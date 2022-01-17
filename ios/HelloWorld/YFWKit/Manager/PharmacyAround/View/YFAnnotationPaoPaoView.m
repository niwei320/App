//
//  YFAnnotationPaoPaoView.m
//  HelloWorld
//
//  Created by wei ni on 2019/4/29.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "YFAnnotationPaoPaoView.h"
#import "YFShop.h"
#import <SDWebImage/UIImageView+WebCache.h>

@interface YFAnnotationPaoPaoView ()
@property (weak, nonatomic) IBOutlet UIImageView *storeImageView;
@property (weak, nonatomic) IBOutlet UILabel *storeName;
@property (weak, nonatomic) IBOutlet UIImageView *signIconImageView;
@property (weak, nonatomic) IBOutlet UILabel *signLabel;
@property (weak, nonatomic) IBOutlet UILabel *rateLabel;
@property (weak, nonatomic) IBOutlet UILabel *distanceLabel;
@property (weak, nonatomic) IBOutlet UILabel *storeAddressLabel;

@end

@implementation YFAnnotationPaoPaoView

- (void)setModel:(YFShop *)model {
  _model = model;
  
  [self.storeImageView sd_setImageWithURL:[NSURL URLWithString:model.shopImage_m] placeholderImage:[UIImage imageNamed:@"default_img"]];
  self.storeName.text = model.name;
  self.storeAddressLabel.text = model.address;
  self.distanceLabel.text = [NSString stringWithFormat:@"%.1fkm",model.distance.floatValue];
  self.rateLabel.text = [NSString stringWithFormat:@"%.1f", model.rate];
  self.signIconImageView.highlighted = model.isSigned;
  
  if (model.isSigned) {
    self.signLabel.text = @"已签约";
    self.signLabel.textColor = [UIColor yf_greenColor_new];
  } else {
    self.signLabel.text = @"未签约";
    self.signLabel.textColor = [UIColor yf_lightGrayColor];
  }
}

@end
