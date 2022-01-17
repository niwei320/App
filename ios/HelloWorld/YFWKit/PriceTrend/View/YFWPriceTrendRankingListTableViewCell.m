//
//  YFWPriceTrendRankingListTableViewCell.m
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/13.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import "YFWPriceTrendRankingListTableViewCell.h"

@interface YFWPriceTrendRankingListTableViewCell()

@property (weak, nonatomic) IBOutlet UIImageView *iconImageView;
@property (weak, nonatomic) IBOutlet UIButton *indexLabelBtn;
@property (weak, nonatomic) IBOutlet UILabel *goodsNameLabel;
@property (weak, nonatomic) IBOutlet UILabel *companyNameLabel;
@property (weak, nonatomic) IBOutlet UILabel *specificationsLabel;
@property (weak, nonatomic) IBOutlet UILabel *priceLabel;
@property (weak, nonatomic) IBOutlet UILabel *percentLabel;
@property (weak, nonatomic) IBOutlet UIView *lineView;

@end

@implementation YFWPriceTrendRankingListTableViewCell

- (void)awakeFromNib {
    [super awakeFromNib];
    
}

- (void)setIndex:(NSInteger)index{
    
    _index = index;
    
    [self.indexLabelBtn setImage:nil forState:UIControlStateNormal];
    [self.indexLabelBtn setTitle:@"" forState:UIControlStateNormal];
    switch (index) {
        case 0:
        {
            [self.indexLabelBtn setImage:[UIImage imageNamed:@"pt_first"] forState:UIControlStateNormal];
            self.indexLabelBtn.imageView.image = [UIImage imageNamed:@"pt_first"];
        }
            break;
        case 1:
        {
            [self.indexLabelBtn setImage:[UIImage imageNamed:@"pt_second"] forState:UIControlStateNormal];
            self.indexLabelBtn.imageView.image = [UIImage imageNamed:@"pt_second"];
        }
            break;
        case 2:
        {
            [self.indexLabelBtn setImage:[UIImage imageNamed:@"pt_third"] forState:UIControlStateNormal];
            self.indexLabelBtn.imageView.image = [UIImage imageNamed:@"pt_third"];
        }
            break;
        default:
        {
            [self.indexLabelBtn setTitle:[NSString stringWithFormat:@"%d",(int)index+1] forState:UIControlStateNormal];
        }
            break;
    }
    
}

- (void)setIsLast:(BOOL)isLast{
    
    _isLast = isLast;
    
    self.lineView.hidden = isLast;
    
}



@end
