//
//  YFWPriceTrendHeaderCell.m
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/13.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import "YFWPriceTrendHeaderCell.h"
#import "UILabel+YFWAdd.h"
@interface YFWPriceTrendHeaderCell()

@property (weak, nonatomic) IBOutlet UIView *timeView;
@property (weak, nonatomic) IBOutlet UILabel *timeLabel;
@property (weak, nonatomic) IBOutlet UILabel *goodsNameLabel;
@property (weak, nonatomic) IBOutlet UILabel *millLabel;
@property (weak, nonatomic) IBOutlet UILabel *priceLabel;
@property (weak, nonatomic) IBOutlet UIImageView *priceSortImageView;
@property (weak, nonatomic) IBOutlet UILabel *visitCountLabel;
@property (weak, nonatomic) IBOutlet UILabel *shopCountLabel;

@end

@implementation YFWPriceTrendHeaderCell

- (void)awakeFromNib {
    [super awakeFromNib];
    self.selectionStyle = UITableViewCellSelectionStyleNone;
    
    /* 背景 */
    self.radiusView.layer.shadowColor = [UIColor colorWithRed:204/255.0 green:204/255.0 blue:204/255.0 alpha:0.5].CGColor;
    self.radiusView.layer.shadowOffset = CGSizeMake(0, 4);
    self.radiusView.layer.shadowRadius = 8;
    self.radiusView.layer.shadowOpacity = 1;
    self.radiusView.layer.cornerRadius = 7;
    
    /* 时间阴影、背景色 */
    self.timeView.layer.shadowColor = [UIColor colorWithRed:255/255.0 green:138/255.0 blue:101/255.0 alpha:0.5].CGColor;
    self.timeView.layer.shadowOffset = CGSizeMake(0, 4);
    self.timeView.layer.shadowRadius = 4;
    self.timeView.layer.shadowOpacity = 1;
    CAGradientLayer *gLayer = [CAGradientLayer layer];
    gLayer.frame = self.timeView.bounds;
    gLayer.cornerRadius = 3;
    gLayer.startPoint = CGPointMake(0, 0);
    gLayer.endPoint = CGPointMake(1, 0);
    gLayer.masksToBounds = YES;
    gLayer.colors = @[(id)[UIColor colorWithRed:255/255.0 green:138/255.0 blue:101/255.0 alpha:1].CGColor,(id)[UIColor colorWithRed:255/255.0 green:96/255.0 blue:94/255.0 alpha:1].CGColor];
    [self.timeView.layer insertSublayer:gLayer atIndex:0];
  
}

- (void)setModel:(YFWPriceTrendModel *)model{
    _model = model;
    
    self.timeLabel.text = model.time;
    self.goodsNameLabel.text = model.goods_name;
    self.millLabel.text = model.mill_title;
    self.priceLabel.attributedText = [self getPriceAttributeStringWith:[NSString stringWithFormat:@"¥%.2f", [model.price floatValue]]];
    self.visitCountLabel.text = model.visit_count;
    self.shopCountLabel.text = model.shop_count;
    self.priceSortImageView.image = model.priceSortImage;
    
}

- (NSAttributedString *)getPriceAttributeStringWith:(NSString *)price
{
    NSMutableAttributedString *priceAtt = [[NSMutableAttributedString alloc] initWithString:price attributes:@{NSFontAttributeName:[UIFont boldSystemFontOfSize:15], NSForegroundColorAttributeName:[UIColor colorWithRed:255/255.0 green:51/255.0 blue:0/255.0 alpha:1]}];
    NSRange range = [price rangeOfString:@"."];
    [priceAtt addAttribute:NSFontAttributeName value:[UIFont boldSystemFontOfSize:12] range:NSMakeRange(range.location, price.length-range.location)];
    return priceAtt;
}
#pragma mark - Create
+ (YFWPriceTrendHeaderCell *)getYFWPriceTrendHeaderCell
{
    NSArray *array = [[NSBundle mainBundle] loadNibNamed:@"YFWPriceTrendHeaderCell" owner:self options:nil];
    YFWPriceTrendHeaderCell *view = array.firstObject;
    
    return view;
}


@end
