//
//  UULineChart.h
//  UUChartDemo
//
//  Created by 2014-763 on 15/3/12.
//  Copyright (c) 2015年 meilishuo. All rights reserved.
//


#import <UIKit/UIKit.h>
#import "SCColor.h"

#define chartMargin     10
#define xLabelMargin    15
#define yLabelMargin    15
#define UULabelHeight    10
#define UUYLabelwidth     30
#define UUTagLabelwidth     80

@interface SCLineChart : UIView

@property (strong, nonatomic) NSArray * xLabels;

@property (strong, nonatomic) NSArray * yLabels;

@property (strong, nonatomic) NSArray * yValues;

@property (strong, nonatomic) NSArray * x_new_Labels;

@property (nonatomic, strong) NSArray * colors;

@property (nonatomic) CGFloat xLabelWidth;
@property (nonatomic) CGFloat yValueMin;
@property (nonatomic) CGFloat yValueMax;

@property (nonatomic, assign) CGRange markRange;

@property (nonatomic, assign) CGRange chooseRange;

@property (nonatomic, assign) BOOL showRange;
@property (nonatomic, assign) BOOL showVerticalLine;
@property (nonatomic, assign) BOOL showBigPoint;
@property (nonatomic, assign) BOOL showAnimation;
@property (nonatomic, assign) BOOL showOtherXLabel;

@property (nonatomic, retain) NSMutableArray *ShowHorizonLine;
@property (nonatomic, retain) NSMutableArray *ShowMaxMinArray;

@property (nonatomic, copy) void(^selctLineBlock)(NSInteger index, CGFloat x_value, CGFloat y_value);

-(void)strokeChart;

+ (CGSize)sizeOfString:(NSString *)text withWidth:(float)width font:(UIFont *)font;
@end
