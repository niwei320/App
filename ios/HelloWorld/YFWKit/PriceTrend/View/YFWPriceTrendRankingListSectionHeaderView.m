//
//  YFWPriceTrendRankingListSectionHeaderView.m
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/14.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import "YFWPriceTrendRankingListSectionHeaderView.h"

@interface YFWPriceTrendRankingListSectionHeaderView()

@property (weak, nonatomic) IBOutlet UILabel *titleLabel;
@property (weak, nonatomic) IBOutlet UILabel *timeLabel;

@end

@implementation YFWPriceTrendRankingListSectionHeaderView

- (void)awakeFromNib{
    
    [super awakeFromNib];
    
    
}

- (void)setTitle:(NSString *)title{
    
    _title = title;
    
    self.titleLabel.text = title;
    
}

#pragma mark - Method

- (IBAction)moreMethod:(UIButton *)sender {

    if (self.moreMethodBlock) {
        self.moreMethodBlock();
    }
}

+ (YFWPriceTrendRankingListSectionHeaderView *)getYFWPriceTrendRankingListSectionHeaderView
{
    NSArray *array = [[NSBundle mainBundle] loadNibNamed:@"YFWPriceTrendRankingListSectionHeaderView" owner:self options:nil];
    YFWPriceTrendRankingListSectionHeaderView *view = array.firstObject;
    
    return view;
}


@end
