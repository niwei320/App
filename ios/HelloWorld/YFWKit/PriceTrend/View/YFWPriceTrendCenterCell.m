//
//  YFWPriceTrendCenterCell.m
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/13.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import "YFWPriceTrendCenterCell.h"
#import "YFWPriceTrendViewController.h"
#import "SCChart.h"

@interface YFWPriceTrendCenterCell ()<SCChartDataSource>

@property (weak, nonatomic) IBOutlet UIView *radiusView;
@property (weak, nonatomic) IBOutlet UIButton *oneMonthButton;
@property (weak, nonatomic) IBOutlet UIButton *threeMonthButton;
@property (weak, nonatomic) IBOutlet UIButton *oneYearButton;
@property (strong, nonatomic) CAGradientLayer *gLayer;

@property (nonatomic, strong) NSDictionary *oneMonthItem;
@property (nonatomic, strong) NSDictionary *threeMonthItem;
@property (nonatomic, strong) NSDictionary *oneYearItem;

@property (nonatomic, weak) IBOutlet UIView *lineChartView;
@property (nonatomic, strong) SCChart *chartView;
@property (nonatomic, strong) UIView *chartAlert;
@property (nonatomic, strong) UILabel *timeLabel;
@property (nonatomic, strong) UILabel *priceLabel;
@property (nonatomic, strong) UILabel *noneLabel;

@end

@implementation YFWPriceTrendCenterCell

- (void)awakeFromNib {
    [super awakeFromNib];
    self.selectionStyle = UITableViewCellSelectionStyleNone;
  
    /* 背景 */
    self.radiusView.layer.shadowColor = [UIColor colorWithRed:204/255.0 green:204/255.0 blue:204/255.0 alpha:0.5].CGColor;
    self.radiusView.layer.shadowOffset = CGSizeMake(0, 4);
    self.radiusView.layer.shadowRadius = 8;
    self.radiusView.layer.shadowOpacity = 1;
    self.radiusView.layer.cornerRadius = 7;
  
    [self buttonStyle:self.oneMonthButton];
    [self buttonStyle:self.threeMonthButton];
    [self buttonStyle:self.oneYearButton];
  
    [self buttonSelected:self.oneMonthButton];
    [self buttonUnSelected:self.threeMonthButton];
    [self buttonUnSelected:self.oneYearButton];
    
    [self configchartViewUI];
    
}


#pragma mark - Config

- (void)configchartViewUI{
    if (self.chartView) {
        [self.chartView removeFromSuperview];
        self.chartView = nil;
    }
    self.chartView = [[SCChart alloc] initwithSCChartDataFrame:CGRectMake(0, 0, kScreenWidth-76, self.lineChartView.height)withSource:self withStyle:SCChartLineStyle];
    [self.chartView showInView:self.lineChartView];
    
    [self.chartView addSubview:self.chartAlert];
    
}

- (UIView *)chartAlert{
    
    if (!_chartAlert) {
        
        _chartAlert = [[UIView alloc] initWithFrame:CGRectMake(0, 0, 102, 35)];
        _chartAlert.hidden = YES;
        _chartAlert.layer.cornerRadius = 4;
        _chartAlert.layer.masksToBounds = YES;
        
        UIView *alpha = [[UIView alloc] initWithFrame:_chartAlert.bounds];
        alpha.backgroundColor = [UIColor yf_new_darkTextColor];
        alpha.alpha = 0.5;
        [_chartAlert addSubview:alpha];
        
        UILabel *timeLabel = [[UILabel alloc] initWithFrame:CGRectMake(5, 5, 92, 10)];
        timeLabel.font = [UIFont systemFontOfSize:7];
        timeLabel.textColor = [UIColor whiteColor];
        timeLabel.text = @"";
        self.timeLabel = timeLabel;
        [_chartAlert addSubview:timeLabel];
      
        UILabel *titleLabel = [[UILabel alloc] initWithFrame:CGRectMake(5, 16, 42, 15)];
        titleLabel.font = [UIFont systemFontOfSize:8];
        titleLabel.textColor = [UIColor whiteColor];
        titleLabel.text = @"平均成交价";
        [_chartAlert addSubview:titleLabel];
        
        UILabel *priceLabel = [[UILabel alloc] initWithFrame:CGRectMake(47, 15, 50, 15)];
        priceLabel.font = [UIFont systemFontOfSize:10];
        priceLabel.textColor = [UIColor whiteColor];
        priceLabel.text = @"0.00";
        self.priceLabel = priceLabel;
        [_chartAlert addSubview:priceLabel];
        
    }
    
    return _chartAlert;
}

- (UILabel *)noneLabel{
    
    if (!_noneLabel) {
        
        _noneLabel = [[UILabel alloc] initWithFrame:self.chartView.bounds];
        _noneLabel.font = [UIFont systemFontOfSize:12];
        _noneLabel.textColor = [UIColor yf_lightGrayColor];
        _noneLabel.backgroundColor = [UIColor clearColor];
        _noneLabel.text = @"暂无数据";
        _noneLabel.textAlignment = NSTextAlignmentCenter;
        
    }
    
    return _noneLabel;
}

#pragma mark - Method
//重新绘制折线图
- (void)strokeChartWith:(NSDictionary *)item dayCount:(NSString *)day_count{
    NSString *title = @"近一个月";
    if (day_count.integerValue == 30) {
        self.oneMonthItem = item;
        title = @"近一个月";
    }else if (day_count.integerValue == 90){
        self.threeMonthItem = item;
        title = @"近三个月";
    }else if (day_count.integerValue == 365){
        self.oneYearItem = item;
        title = @"近一年";
    }
  
    self.showSelectItemTitle = title;
    self.showSelectItem = item;
    [self.chartView strokeChart];
    
    NSArray *item_prices = [item[@"item_prices"] safeArray];
    if (item_prices.count == 0) {
        [self.chartView addSubview:self.noneLabel];
    }else{
        [self.noneLabel removeFromSuperview];
    }
    
}

- (IBAction)changeSegmentMethod:(UIButton *)sender {
    
    [self buttonUnSelected:self.oneMonthButton];
    [self buttonUnSelected:self.threeMonthButton];
    [self buttonUnSelected:self.oneYearButton];
    
    [self buttonSelected:sender];
    self.chartAlert.hidden = YES;
    
}

- (void)buttonStyle:(UIButton *)button {
    button.layer.shadowColor = [UIColor yf_lightGreenColor_new:0.5].CGColor;
    button.layer.shadowOffset = CGSizeMake(0, 4);
    button.layer.shadowRadius = 4;
    button.layer.shadowOpacity = 1;
    button.layer.cornerRadius = 7;
    button.layer.borderWidth = 1;
    button.layer.borderColor = [UIColor yf_greenColor_new].CGColor;
    button.backgroundColor = [UIColor whiteColor];
}

- (CAGradientLayer *)gLayer {
  if (!_gLayer) {
      CAGradientLayer *gLayer = [CAGradientLayer layer];
      gLayer.frame = self.oneYearButton.bounds;
      gLayer.cornerRadius = 7;
      gLayer.startPoint = CGPointMake(1, 0);
      gLayer.endPoint = CGPointMake(0, 0);
      gLayer.masksToBounds = YES;
      gLayer.colors = @[(id)[UIColor colorWithRed:0/255.0 green:200/255.0 blue:145/255.0 alpha:1].CGColor,(id)[UIColor colorWithRed:31/255.0 green:219/255.0 blue:155/255.0 alpha:1].CGColor];
      _gLayer = gLayer;
  }
  return _gLayer;
}

- (void)buttonSelected:(UIButton *)button{
    
    [button.layer insertSublayer:self.gLayer atIndex:0];
    [button setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    button.layer.borderWidth = 0;
    
    if (button.tag == 30) {
        self.showSelectItemTitle = @"近一个月";
        self.showSelectItem = self.oneMonthItem;
    }else if (button.tag == 90){
        self.showSelectItemTitle = @"近三个月";
        self.showSelectItem = self.threeMonthItem;
    }else if (button.tag == 365){
        self.showSelectItemTitle = @"近一年";
        self.showSelectItem = self.oneYearItem;
    }
    
    NSString *tag = [NSString stringWithFormat:@"%ld",(long)button.tag];
    if (self.showSelectItem) {
        [self strokeChartWith:self.showSelectItem dayCount:tag];
    }else{
        [self.controller requestTrendChart:tag];
    }
    
}

- (void)buttonUnSelected:(UIButton *)button{
    [button setTitleColor:[UIColor yf_greenColor_new] forState:UIControlStateNormal];
    button.layer.borderWidth = 1;
}

- (NSArray *)getXTitles{
    NSMutableArray *xTitles = [NSMutableArray array];
  if (![self.showSelectItem[@"item_times"] safeArray]) {
    return xTitles;
  }
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
  if (![self.showSelectItem[@"item_times"] safeArray]) {
    return xTitles;
  }
    for (NSDictionary *timeDic in self.showSelectItem[@"item_times"]) {
        [xTitles addObject:timeDic[@"time"]];
    }
    
    return xTitles.copy;
}

//纵坐标数组
- (NSArray *)SCChart_yValueArray:(SCChart *)chart{
    
    NSMutableArray *ary = [NSMutableArray array];
  if (![self.showSelectItem[@"item_prices"] safeArray]) {
    return ary;
  }
    for (NSDictionary *timeDic in self.showSelectItem[@"item_prices"]) {
        [ary addObject:timeDic[@"price"]];
    }
    return @[ary];
}

//节点事件
- (void)SCChart:(SCChart *)chart ShowIndex:(NSInteger)index showXValue:(CGFloat)x_value showYValue:(CGFloat)y_value{
    
    NSArray *item_prices = [self.showSelectItem[@"item_prices"] safeArray];
    if (item_prices.count > index) {
        
        NSDictionary *item_price = [item_prices[index] safeDictionary];
        self.timeLabel.text = [item_price[@"time"] stringByReplacingOccurrencesOfString:@"-" withString:@"."];
//        self.priceLabel.text = [NSString stringWithFormat:@"¥%@",item_price[@"price"]];
        self.priceLabel.text = [NSString stringWithFormat:@"%.2f", [item_price[@"price"] floatValue]];
        self.chartAlert.hidden = NO;
        [self.chartView bringSubviewToFront:self.chartAlert];
      
        CGFloat center_x = x_value;
        CGFloat center_y = y_value - 20;
        if (y_value < 50) {
          center_y = y_value + 35;
        }
        if (x_value+65 > kScreenWidth-26) {
          center_x = x_value - 50;
        }
        self.chartAlert.center = CGPointMake(center_x, center_y);
    }
    
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
    
    return YES;
}

//判断显示最大最小值
- (BOOL)SCChart:(SCChart *)chart ShowMaxMinAtIndex:(NSInteger)index {
    
    return NO;
}

//显示动画
- (BOOL)SCChartShowAnimation:(SCChart *)chart{
    
    return YES;
}



#pragma mark - Create
+ (YFWPriceTrendCenterCell *)getYFWPriceTrendCenterCell
{
    NSArray *array = [[NSBundle mainBundle] loadNibNamed:@"YFWPriceTrendCenterCell" owner:self options:nil];
    YFWPriceTrendCenterCell *view = array.firstObject;
    
    return view;
}


@end
