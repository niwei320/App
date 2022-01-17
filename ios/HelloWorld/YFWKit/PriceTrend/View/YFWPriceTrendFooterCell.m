//
//  YFWPriceTrendFooterCell.m
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/13.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import "YFWPriceTrendFooterCell.h"
#import "YFWPriceTrendViewController.h"

@interface YFWPriceTrendFooterCell()

@property (weak, nonatomic) IBOutlet UIView *radiusView;
@property (weak, nonatomic) IBOutlet UILabel *contentLabel;
@property (weak, nonatomic) IBOutlet UIButton *toBuyButton;

@end

@implementation YFWPriceTrendFooterCell

- (void)awakeFromNib {
    [super awakeFromNib];
    self.selectionStyle = UITableViewCellSelectionStyleNone;
  
    /* 背景 */
    self.radiusView.layer.shadowColor = [UIColor colorWithRed:204/255.0 green:204/255.0 blue:204/255.0 alpha:0.5].CGColor;
    self.radiusView.layer.shadowOffset = CGSizeMake(0, 4);
    self.radiusView.layer.shadowRadius = 8;
    self.radiusView.layer.shadowOpacity = 1;
    self.radiusView.layer.cornerRadius = 7;
  
    self.toBuyButton.layer.cornerRadius = 11;
    self.toBuyButton.layer.masksToBounds = YES;
    self.toBuyButton.layer.borderColor = [UIColor yf_orangeColor_new].CGColor;
    self.toBuyButton.layer.borderWidth = 1;
    [self.toBuyButton setTitleColor:[UIColor yf_orangeColor_new] forState:UIControlStateNormal];
    
}

- (void)setModel:(YFWPriceTrendModel *)model{
    
    _model = model;
    
    self.contentLabel.text = model.chart_desc;
    
}

- (IBAction)toBuyMethod:(UIButton *)sender {
    
    [self.controller toBuyMethod];
    
}


+ (CGFloat)cellHeight:(YFWPriceTrendModel *)model{
    
    CGFloat height = [model.chart_desc heightForFont:[UIFont systemFontOfSize:11] width:kScreenWidth-30];
    
    return height + 55 + 15;
}


@end
