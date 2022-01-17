//
//  YFWPriceTrendRankingCategoryTableViewCell.m
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/14.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import "YFWPriceTrendRankingCategoryTableViewCell.h"

@implementation YFWPriceTrendRankingCategoryTableViewCell

- (void)awakeFromNib {
    [super awakeFromNib];
    
    self.selectionStyle = UITableViewCellSelectionStyleNone;
}

- (void)setDataArray:(NSArray *)dataArray{
    
    _dataArray = dataArray;
    
    if (self.contentView.subviews.count == 1) {
        [self initselectButton];
    }
}

- (void)initselectButton{
    
    CGFloat width = (kScreenWidth - 50) / 3.f;
    CGFloat height = 30;
    CGFloat left = 15;
    CGFloat flag = 10;
    
    for (int i = 0; i < self.dataArray.count; i++) {
        
        NSString *title = self.dataArray[i];
        
        UIButton *button = [UIButton buttonWithType:UIButtonTypeCustom];
        button.frame = CGRectMake(left+(width+flag)*(i%3), 50+(height+flag)*(i/3), width, height);
        button.backgroundColor = [UIColor yf_backGroundColor];
        [button setTitle:title forState:UIControlStateNormal];
        [button setTitleColor:[UIColor yf_new_darkTextColor] forState:UIControlStateNormal];
        button.titleLabel.font = [UIFont systemFontOfSize:13];
        button.tag = i;
        [button addTarget:self action:@selector(clickMethod:) forControlEvents:UIControlEventTouchUpInside];
        [self.contentView addSubview:button];
    }
    
}


#pragma mark - Method

- (void)clickMethod:(UIButton *)button{
    
    if (self.selectItemMethod) {
        self.selectItemMethod(self.dataArray[button.tag]);
    }
}


+ (CGFloat)getCellHeight:(NSArray *)dataArray{
    
    if (dataArray.count == 0) {
        return 0;
    }
    
    return 50 + ((dataArray.count-1) / 3 + 1) * 40 + 10;
    
}


@end
