//
//  PriceTrendShareView.m
//  YaoFang
//
//  Created by NW-YFW on 2018/6/29.
//  Copyright © 2018年 NW. All rights reserved.
//

#import "PriceTrendShareView.h"
#import "SCChart.h"
#import "YFWPriceTrendHeaderCell.h"
@interface PriceTrendShareView()<SCChartDataSource>{
    
}
@property (weak, nonatomic) IBOutlet UIView *headerView;
@property (weak, nonatomic) IBOutlet UIView *chartView;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *marginTop;
@property (nonatomic, strong) NSDictionary *showSelectItem;
@property (weak, nonatomic) IBOutlet UILabel *chartTitleLabel;
@property (nonatomic, strong) SCChart *lineView;
@end


@implementation PriceTrendShareView
- (void)awakeFromNib{
    [super awakeFromNib];
}

-(void)setModel:(YFWPriceTrendModel *)model{
    _marginTop.constant = NavigationHeight+40;
    _model = model;
    _showSelectItem = model.chart_item;
    YFWPriceTrendHeaderCell *cell = [YFWPriceTrendHeaderCell getYFWPriceTrendHeaderCell];
    cell.model = self.model;
    UIView *headerTitleView = cell.radiusView;
    headerTitleView.backgroundColor = [UIColor whiteColor];
    [_headerView addSubview:headerTitleView];
    [headerTitleView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.right.mas_equalTo(_headerView);
        make.top.mas_equalTo(_headerView);
        make.bottom.mas_equalTo(_headerView);
    }];
    
    CGRect rect = CGRectMake(0, 0, kScreenWidth-50,kScreenHeight-_marginTop.constant-150-50-20-150);
    _lineView = [[SCChart alloc] initwithSCChartDataFrame:rect withSource:self withStyle:SCChartLineStyle];
    _lineView.backgroundColor = [UIColor clearColor];
    _lineView.userInteractionEnabled = NO;
    [_lineView showInView:_chartView];
  
    self.chartTitleLabel.text = [NSString stringWithFormat:@"%@价格趋势图", model.chart_title];
}

- (NSArray *)getXTitles{
    NSMutableArray *xTitles = [NSMutableArray array];
    for (NSDictionary *timeDic in self.showSelectItem[@"item_prices"]) {
        [xTitles addObject:timeDic[@"time"]];
    }
    return xTitles;
}

#pragma mark - SCChart DataSource
//横坐标标题数组
- (NSArray *)SCChart_xLableArray:(SCChart *)chart {
    return [self getXTitles];
}

//横坐标新标题数组
- (NSArray *)SCChart_new_xLableArray:(SCChart *)chart{
    
    NSMutableArray *xTitles = [NSMutableArray array];
    
    for (NSDictionary *timeDic in self.showSelectItem[@"item_times"]) {
        [xTitles addObject:timeDic[@"time"]];
    }
    
    return xTitles.copy;
}

//纵坐标数组
- (NSArray *)SCChart_yValueArray:(SCChart *)chart{
    
    NSMutableArray *ary = [NSMutableArray array];
    for (NSDictionary *timeDic in self.showSelectItem[@"item_prices"]) {
        [ary addObject:timeDic[@"price"]];
    }
    return @[ary];
}

//颜色数组
- (NSArray *)SCChart_ColorArray:(SCChart *)chart {
    return @[[UIColor yf_greenColor_new]];
}

//标记数值区域
- (CGRange)SCChartMarkRangeInLineChart:(SCChart *)chart {
    return CGRangeZero;
}

//判断显示横线条
- (BOOL)SCChart:(SCChart *)chart ShowHorizonLineAtIndex:(NSInteger)index {
    
    return NO;
}

//判断显示最大最小值
- (BOOL)SCChart:(SCChart *)chart ShowMaxMinAtIndex:(NSInteger)index {
    
    return NO;
}

+ (PriceTrendShareView *)getPriceTrendShareView
{
    NSArray *views = [[NSBundle mainBundle] loadNibNamed:@"PriceTrendShareView" owner:self options:nil];
    PriceTrendShareView *view = views[0];
    view.frame = CGRectMake(0, 0, kScreenWidth, kScreenHeight);
    return view;
}

@end
