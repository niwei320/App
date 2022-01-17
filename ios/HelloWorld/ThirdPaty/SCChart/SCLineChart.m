//
//  UULineChart.m
//  UUChartDemo
//
//  Created by 2014-763 on 15/3/12.
//  Copyright (c) 2015年 meilishuo. All rights reserved.
//

#import "SCLineChart.h"
#import "SCColor.h"
#import "SCChartLabel.h"
#import "SCTool.h"

@interface SCLineChart()<UIGestureRecognizerDelegate>

@property (nonatomic, strong) UIView *lineView;
@property (nonatomic, assign) CGFloat afterSelect;
@property (nonatomic, strong) NSMutableArray *pointArray;

@end

@implementation SCLineChart

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        // Initialization code
        self.clipsToBounds = YES;
        [self initialize];
    }
    return self;
}

- (void)initialize{
    
    UIPanGestureRecognizer *gesture = [[UIPanGestureRecognizer alloc]initWithTarget:self action:@selector(selectShowLineView:)];
    gesture.delegate = self;
    [self addGestureRecognizer:gesture];
    
    UITapGestureRecognizer *tapGesture = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(selectShowLineView:)];
    [self addGestureRecognizer:tapGesture];
}


-(void)setYValues:(NSArray *)yValues
{
    _yValues = yValues;
    [self setYLabels:yValues];
}

-(void)setYLabels:(NSArray *)yLabels
{
    if ([yLabels.firstObject count] == 0) {
        return;
    }
    
    CGFloat max = 0;
    CGFloat min = 1000000000;
    NSInteger rowCount = 0; // 自动计算每个图表适合的行数
    for (NSArray * ary in yLabels) {
        for (NSString *valueString in ary) {
            CGFloat value = [valueString floatValue];
            if (value > max) {
                max = value;
            }
            if (value < min) {
                min = value;
            }
        }
    }
    if (self.showRange) {
        _yValueMin = min;
    }else{
        _yValueMin = 0;
    }
    _yValueMax = max;
    
    if (_chooseRange.max!=_chooseRange.min) { // 自定义数值范围
        _yValueMax = _chooseRange.max;
        _yValueMin = _chooseRange.min;
    } else { // 自动计算数值范围和合适的行数
        rowCount = [SCTool rowCountWithValueMax:_yValueMax] == 0 ? 5 : [SCTool rowCountWithValueMax:_yValueMax];
//        _yValueMax = [SCTool rangeMaxWithValueMax:_yValueMax] == 0 ? 100 : [SCTool rangeMaxWithValueMax:_yValueMax];
//        _yValueMin = 0;
        
        CGFloat between = (max - min) * 0.1;
        if (between<0.05) {
            between = 1;
        }
        _yValueMin = min > between ? (min-between):0;
        _yValueMax = (max+between);
        
    }
    
    float level = (_yValueMax-_yValueMin) /rowCount; // 每个区间的差值
    CGFloat chartCavanHeight = self.frame.size.height - UULabelHeight*3;
    CGFloat levelHeight = chartCavanHeight /rowCount; // 每个区间的高度
    for (int i=0; i<rowCount+1; i++) {
        SCChartLabel * label = [[SCChartLabel alloc] initWithFrame:CGRectMake(0.0,chartCavanHeight-i*levelHeight+5, UUYLabelwidth, UULabelHeight)];
		label.text = [NSString stringWithFormat:@"%.2f",level * i+_yValueMin]; // 每个区间的值
        if (kScreenWidth == 320) {
            label.font = [UIFont systemFontOfSize:7];
        }
		[self addSubview:label];
    }
    if ([super respondsToSelector:@selector(setMarkRange:)]) {
        UIView *view = [[UIView alloc]initWithFrame:CGRectMake(UUYLabelwidth, (1-(_markRange.max-_yValueMin)/(_yValueMax-_yValueMin))*chartCavanHeight+UULabelHeight, self.frame.size.width-UUYLabelwidth, (_markRange.max-_markRange.min)/(_yValueMax-_yValueMin)*chartCavanHeight)];
        view.backgroundColor = [[UIColor grayColor] colorWithAlphaComponent:0.1];
        [self addSubview:view];
    }

    //画横线
    for (int i=0; i<rowCount+1; i++) {
        if ([_ShowHorizonLine[i] integerValue]>0 || i == rowCount) {
            
            CAShapeLayer *shapeLayer = [CAShapeLayer layer];
            UIBezierPath *path = [UIBezierPath bezierPath];
            [path moveToPoint:CGPointMake(UUYLabelwidth,UULabelHeight+i*levelHeight)];
            [path addLineToPoint:CGPointMake(self.frame.size.width,UULabelHeight+i*levelHeight)];
            [path closePath];
            shapeLayer.path = path.CGPath;
            shapeLayer.strokeColor = [[[UIColor blackColor] colorWithAlphaComponent:0.1] CGColor];
            shapeLayer.fillColor = [[UIColor whiteColor] CGColor];
            shapeLayer.lineWidth = 1;
            if (i != rowCount) {
               shapeLayer.lineDashPattern = @[@2, @2];
            }
            [self.layer addSublayer:shapeLayer];
        }
    }
}

-(void)setX_new_Labels:(NSArray *)x_new_Labels{
    
    _x_new_Labels = x_new_Labels;
    CGFloat num = 0;
    if (x_new_Labels.count>=20) {
        num=20.0;
    }else if (x_new_Labels.count<=1){
        num=1.0;
    }else{
        num = x_new_Labels.count;
    }
    
    CGFloat newxLabelWidth = (self.frame.size.width - UUYLabelwidth)/num;
    
    if (self.showOtherXLabel) {
        for (int i=0; i<x_new_Labels.count; i++) {
            NSString *labelText = x_new_Labels[i];
            SCChartLabel * label = [[SCChartLabel alloc] initWithFrame:CGRectMake(i * newxLabelWidth+UUYLabelwidth, self.frame.size.height - UULabelHeight, newxLabelWidth, UULabelHeight)];
            if (kScreenWidth == 320) {
                label.font = [UIFont systemFontOfSize:7];
            }
            label.text = labelText;
            [self addSubview:label];
        }
    }
    
}

-(void)setXLabels:(NSArray *)xLabels
{
    _xLabels = xLabels;
    CGFloat num = 0;
    if (xLabels.count>=20) {
        num=20.0;
    }else if (xLabels.count<=1){
        num=1.0;
    }else{
        num = xLabels.count;
    }
    _xLabelWidth = (self.frame.size.width - UUYLabelwidth)/num;
    
    if (!self.showOtherXLabel) {
        for (int i=0; i<xLabels.count; i++) {
            NSString *labelText = xLabels[i];
            SCChartLabel * label = [[SCChartLabel alloc] initWithFrame:CGRectMake(i * _xLabelWidth+UUYLabelwidth, self.frame.size.height - UULabelHeight, _xLabelWidth, UULabelHeight)];
            label.text = labelText;
            [self addSubview:label];
        }
    }

    [self addSubview:self.lineView];
    
    if (self.showVerticalLine) {
        //画竖线
        for (int i=0; i<xLabels.count+1; i++) {
            CAShapeLayer *shapeLayer = [CAShapeLayer layer];
            UIBezierPath *path = [UIBezierPath bezierPath];
            [path moveToPoint:CGPointMake(UUYLabelwidth+i*_xLabelWidth,UULabelHeight)];
            [path addLineToPoint:CGPointMake(UUYLabelwidth+i*_xLabelWidth,self.frame.size.height-2*UULabelHeight)];
            [path closePath];
            shapeLayer.path = path.CGPath;
            shapeLayer.strokeColor = [[[UIColor blackColor] colorWithAlphaComponent:0.1] CGColor];
            shapeLayer.fillColor = [[UIColor whiteColor] CGColor];
            shapeLayer.lineWidth = 1;
            [self.layer addSublayer:shapeLayer];
        }
    }else{
        CAShapeLayer *shapeLayer = [CAShapeLayer layer];
        UIBezierPath *path = [UIBezierPath bezierPath];
        [path moveToPoint:CGPointMake(UUYLabelwidth,UULabelHeight)];
        [path addLineToPoint:CGPointMake(UUYLabelwidth,self.frame.size.height-2*UULabelHeight)];
        [path closePath];
        shapeLayer.path = path.CGPath;
        shapeLayer.strokeColor = [[[UIColor blackColor] colorWithAlphaComponent:0.1] CGColor];
        shapeLayer.fillColor = [[UIColor whiteColor] CGColor];
        shapeLayer.lineWidth = 1;
        [self.layer addSublayer:shapeLayer];
    }
    
}

-(void)setColors:(NSArray *)colors
{
	_colors = colors;
}
- (void)setMarkRange:(CGRange)markRange
{
    _markRange = markRange;
}
- (void)setChooseRange:(CGRange)chooseRange
{
    _chooseRange = chooseRange;
}
- (void)setShowHorizonLine:(NSMutableArray *)ShowHorizonLine
{
    _ShowHorizonLine = ShowHorizonLine;
}


-(void)strokeChart
{
    for (int i=0; i<_yValues.count; i++) {
        NSArray *childAry = _yValues[i];
        if (childAry.count==0) {
            return;
        }
        //获取最大最小位置
        CGFloat max = [childAry[0] floatValue];
        CGFloat min = [childAry[0] floatValue];
        NSInteger max_i = 0;
        NSInteger min_i = 0;
        
        for (int j=0; j<childAry.count; j++){
            CGFloat num = [childAry[j] floatValue];
            if (max<=num){
                max = num;
                max_i = j;
            }
            if (min>=num){
                min = num;
                min_i = j;
            }
        }
        
        //划线
        CAShapeLayer *_chartLine = [CAShapeLayer layer];
        _chartLine.lineCap = kCALineCapRound;
        _chartLine.lineJoin = kCALineJoinBevel;
        _chartLine.fillColor   = [[UIColor whiteColor] CGColor];
        _chartLine.lineWidth   = 2.0;
        _chartLine.strokeEnd   = 0.0;
        _chartLine.shadowColor = [UIColor yf_greenColor_new].CGColor;
        _chartLine.shadowOffset = CGSizeMake(0, 4);
        _chartLine.shadowRadius = 4;
        _chartLine.shadowOpacity = 1;
        [self.layer addSublayer:_chartLine];
        
        UIBezierPath *progressline = [UIBezierPath bezierPath];
        CGFloat firstValue = [[childAry objectAtIndex:0] floatValue];
        CGFloat xPosition = (UUYLabelwidth + _xLabelWidth/2.0);
        CGFloat chartCavanHeight = self.frame.size.height - UULabelHeight*3;
        
        float grade = ((float)firstValue-_yValueMin) / ((float)_yValueMax-_yValueMin);
       
        //第一个点
        BOOL isShowMaxAndMinPoint = YES;
        if (self.ShowMaxMinArray) {
            if ([self.ShowMaxMinArray[i] intValue]>0) {
                isShowMaxAndMinPoint = (max_i==0 || min_i==0)?NO:YES;
            }else{
                isShowMaxAndMinPoint = YES;
            }
        }
        [self addPoint:CGPointMake(xPosition, chartCavanHeight - grade * chartCavanHeight+UULabelHeight)
                 index:i
                isShow:isShowMaxAndMinPoint
                 value:firstValue];

        
        [progressline moveToPoint:CGPointMake(xPosition, chartCavanHeight - grade * chartCavanHeight+UULabelHeight)];
        [progressline setLineWidth:2.0];
        [progressline setLineCapStyle:kCGLineCapRound];
        [progressline setLineJoinStyle:kCGLineJoinRound];
        NSInteger index = 0;
        for (NSString * valueString in childAry) {
            
            float grade =([valueString floatValue]-_yValueMin) / ((float)_yValueMax-_yValueMin);
            if (index != 0) {
                
                CGPoint point = CGPointMake(xPosition+index*_xLabelWidth, chartCavanHeight - grade * chartCavanHeight+UULabelHeight);
                [progressline addLineToPoint:point];
                
                BOOL isShowMaxAndMinPoint = YES;
                if (self.ShowMaxMinArray) {
                    if ([self.ShowMaxMinArray[i] intValue]>0) {
                        isShowMaxAndMinPoint = (max_i==index || min_i==index)?NO:YES;
                    }else{
                        isShowMaxAndMinPoint = YES;
                    }
                }
                [progressline moveToPoint:point];
                [self addPoint:point
                         index:i
                        isShow:isShowMaxAndMinPoint
                         value:[valueString floatValue]];
                
//                [progressline stroke];
            }
            index += 1;
        }
        
        _chartLine.path = progressline.CGPath;
        if ([[_colors objectAtIndex:i] CGColor]) {
            _chartLine.strokeColor = [[_colors objectAtIndex:i] CGColor];
        }else{
            _chartLine.strokeColor = [SCGreen CGColor];
        }
        
        if (self.showAnimation) {
            CABasicAnimation *pathAnimation = [CABasicAnimation animationWithKeyPath:@"strokeEnd"];
            pathAnimation.duration = childAry.count*0.3;
            pathAnimation.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut];
            pathAnimation.fromValue = [NSNumber numberWithFloat:0.0f];
            pathAnimation.toValue = [NSNumber numberWithFloat:1.0f];
            pathAnimation.autoreverses = NO;
            [_chartLine addAnimation:pathAnimation forKey:@"strokeEndAnimation"];
            
        }
        _chartLine.strokeEnd = 1.0;
        
    }
}

- (void)addPoint:(CGPoint)point index:(NSInteger)index isShow:(BOOL)isHollow value:(CGFloat)value
{
    if (self.showBigPoint) {
        UIView *view = [[UIView alloc]initWithFrame:CGRectMake(5, 5, 12, 12)];
        view.center = point;
        view.layer.masksToBounds = YES;
        view.layer.cornerRadius = 6;
        view.layer.borderWidth = 1;
        view.layer.borderColor = [[_colors objectAtIndex:index] CGColor]?[[_colors objectAtIndex:index] CGColor]:SCGreen.CGColor;
        
        if (isHollow) {
            view.backgroundColor = [UIColor colorWithWhite:1 alpha:0.5];
            view.layer.borderColor = [UIColor colorWithRed:51/255.0 green:126/255.0 blue:100/255.0 alpha:0.2].CGColor;
          
            UIView *centerView = [[UIView alloc]initWithFrame:CGRectMake(3, 3, 6, 6)];
//            centerView.center = view.center;
            centerView.layer.masksToBounds = YES;
            centerView.layer.cornerRadius = 3;
            centerView.backgroundColor = [_colors objectAtIndex:index]?[_colors objectAtIndex:index]:SCGreen;
            [view addSubview:centerView];
          
        }else{
            view.backgroundColor = [_colors objectAtIndex:index]?[_colors objectAtIndex:index]:SCGreen;
            UILabel *label = [[UILabel alloc]initWithFrame:CGRectMake(point.x-UUTagLabelwidth/2.0, point.y-UULabelHeight*2, UUTagLabelwidth, UULabelHeight)];
            label.font = [UIFont systemFontOfSize:10];
            label.textAlignment = NSTextAlignmentCenter;
            label.textColor = view.backgroundColor;
            label.text = [NSString stringWithFormat:@"%d",(int)value];
            [self addSubview:label];
        }
        
        [self addSubview:view];
        [self.pointArray addObject:view];
        
    }else{
        
        UIView *view = [[UIView alloc] initWithFrame:CGRectMake(5, 5, 2, 2)];
        view.backgroundColor = [_colors objectAtIndex:index]?[_colors objectAtIndex:index]:SCGreen;
        view.layer.masksToBounds = YES;
        view.layer.cornerRadius = 1;
        
        [self addSubview:view];
        [self.pointArray addObject:view];
    }
    
}

+ (CGSize)sizeOfString:(NSString *)text withWidth:(float)width font:(UIFont *)font
{
    NSInteger ch;
    CGSize size = CGSizeMake(width, MAXFLOAT);
    
    if ([text respondsToSelector:@selector(boundingRectWithSize:options:attributes:context:)]) {
        NSDictionary *tdic = [NSDictionary dictionaryWithObjectsAndKeys:font, NSFontAttributeName, nil];
        size = [text boundingRectWithSize:size
                                  options:NSStringDrawingUsesLineFragmentOrigin | NSStringDrawingUsesFontLeading
                               attributes:tdic
                                  context:nil].size;
    } else {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
        size = [text sizeWithFont:font constrainedToSize:size lineBreakMode:NSLineBreakByCharWrapping];
#pragma clang diagnostic pop
    }
    ch = size.height;
    
    return size;
}


#pragma mark - Delegate

- (void)selectShowLineView:(UIGestureRecognizer *)recognizer{
    
    CGPoint panPoint = [recognizer locationInView:self];
    CGFloat x = panPoint.x;
    CGFloat xPosition = (UUYLabelwidth + _xLabelWidth/2.0);
    
    //筛选重复
    if (self.afterSelect <= x+_xLabelWidth/3 &&
        self.afterSelect >= x-_xLabelWidth/3 &&
        self.afterSelect != 0) {
        
        return;
    }
    
    for (int i = 0; i < self.xLabels.count; i++) {
        if (xPosition+i*_xLabelWidth <= x+_xLabelWidth/3 &&
            xPosition+i*_xLabelWidth >= x-_xLabelWidth/3) {
          
            self.lineView.frame = CGRectMake(xPosition+i*_xLabelWidth, UULabelHeight, 1, self.frame.size.height-3*UULabelHeight);
            self.afterSelect = xPosition+i*_xLabelWidth;
            if (self.selctLineBlock) {
                CGFloat y_value = UULabelHeight;
                if (self.pointArray.count > 0 && i <= self.pointArray.count) {
                  UIView *pointView = self.pointArray[i];
                  y_value = pointView.frame.origin.y;
                }
                self.selctLineBlock(i, xPosition+i*_xLabelWidth, y_value);
            }
            
        }
    }
    
}

- (UIView *)lineView{
    
    if (!_lineView) {
        
        _lineView = [[UIView alloc] init];
        _lineView.backgroundColor = [UIColor yf_separatorColor];
    }
    
    return _lineView;
}

-(BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer shouldReceiveTouch:(UITouch *)touch
{
    return YES;
}

- (NSMutableArray *)pointArray {
    if (!_pointArray) {
        _pointArray = [NSMutableArray array];
    }
    return _pointArray;
}


@end
