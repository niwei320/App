//
//  YFRateView.m
//  YaoFang
//
//  Created by yaofangwang on 15/1/27.
//  Copyright (c) 2015年 yaofangwang. All rights reserved.
//

#import "YFRateView.h"

@interface YFRateView()

@property (nonatomic, strong) UIView *bgStarsView;
@property (nonatomic, strong) UIView *frontStarsView;
@property (nonatomic, strong) UILabel *rateLabel;

@end

#define STAR_SPACE 2
#define STAR_WIDTH 15

@implementation YFRateView

- (instancetype)initWithDefaultFrame {
    if (self = [super initWithFrame:CGRectMake(0, 0, 90, 12)]) {
        [self commonInit];
    }
    return self;
}

- (void)awakeFromNib {
    [super awakeFromNib];
    [self commonInit];
}

- (void)commonInit {
  self.bgStarsView = [self starsViewWithImageName:@"sort_icon_star_empty"];
    [self addSubview:self.bgStarsView];
    self.frontStarsView = [self starsViewWithImageName:@"sort_icon_star"];
    [self addSubview:self.frontStarsView];
    
    self.rateLabel = [[UILabel alloc] initWithFrame:CGRectMake(self.bgStarsView.frame.size.width + 2, 1, 20, 15)];
    self.rateLabel.font = [UIFont systemFontOfSize:12];
    self.rateLabel.textColor = [UIColor yf_lightGrayColor];
    [self addSubview:self.rateLabel];
    
//    self.rate = 3.4;
}

- (UIView *)starsViewWithImageName:(NSString *)imageName {
    UIView *starsView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, STAR_WIDTH * 5 + STAR_SPACE * 4, 18)];
    for (int i = 0; i < 5; i++) {
        UIImageView *starView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:imageName]];
        CGRect frame = CGRectMake(0, 2, 15, 15);
        frame.origin.x = i * (STAR_WIDTH + STAR_SPACE);
        starView.frame = frame;
        [starsView addSubview:starView];
    }
    starsView.clipsToBounds = YES;
    return starsView;
}

- (void)setRate:(CGFloat)rate {
    if (rate > 5.0) {
        _rate = 5.0;
    } else if (rate < 0) {
        _rate = 0;
    } else {
        _rate = rate;
    }
    
    self.rateLabel.text = [NSString stringWithFormat:@"%.1f", _rate];
    
    CGFloat floorRate = floorf(rate);
    CGFloat decimal = _rate - floorRate;
    
    CGRect frame = self.frontStarsView.frame;
    if (rate < 5.0) {
        frame.size.width = floorRate * (STAR_WIDTH + STAR_SPACE) + decimal * STAR_WIDTH;
    } else {
        frame.size.width = floorRate * (STAR_WIDTH + STAR_SPACE) - STAR_SPACE;
    }
    
    self.frontStarsView.frame = frame;
}


@end
