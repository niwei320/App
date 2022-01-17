//
//  YFSignedStatusView.m
//  YaoFang
//
//  Created by yaofangwang on 15/1/28.
//  Copyright (c) 2015年 yaofangwang. All rights reserved.
//

#import "YFSignedStatusView.h"

@interface YFSignedStatusView ()

@property (nonatomic, strong) UIImageView *signedIconView;
@property (nonatomic, strong) UILabel *label;

@end

@implementation YFSignedStatusView

- (instancetype)init {
    if (self = [super init]) {
        [self commonInit];
    }
    
    return self;
}

- (void)awakeFromNib {
    [super awakeFromNib];
    [self commonInit];
}

- (void)commonInit {
    self.signedIconView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"signed_icon"]];
    CGRect frame = self.signedIconView.frame;
    frame.origin.y = (15 - frame.size.height)/2;
    self.signedIconView.frame = frame;
    [self addSubview:self.signedIconView];
    
    self.label = [[UILabel alloc] initWithFrame:CGRectZero];
    self.label.font = [UIFont systemFontOfSize:13];
    [self addSubview:self.label];
    
    self.isSigned = NO;
}

- (void)setIsSigned:(BOOL)isSigned {
    _isSigned = isSigned;
    CGFloat viewWidth;
    if (_isSigned) {
        self.signedIconView.hidden = NO;
        self.label.text = @"签约";
        self.label.textColor = [UIColor yf_greenColor];
        [self.label sizeToFit];
        
        CGRect frame = self.label.frame;
        frame.origin.x = self.signedIconView.frame.size.width + 2;
        frame.origin.y = (self.frame.size.height - frame.size.height)/2;
        self.label.frame = frame;
        
        viewWidth = frame.size.width + self.signedIconView.frame.size.width + 2;
    } else {
        self.signedIconView.hidden = YES;
        self.label.text = @"未入驻";
        self.label.textColor = [UIColor yf_lightGrayColor];
        [self.label sizeToFit];
        
        CGRect frame = self.label.frame;
        frame.origin.x = 0;
        frame.origin.y = (self.frame.size.height - frame.size.height)/2;
        self.label.frame = frame;
        
        viewWidth = frame.size.width;
    }
    
    for (NSLayoutConstraint *constraint in [self constraints]) {
        if (constraint.firstAttribute == NSLayoutAttributeWidth) {
            constraint.constant = viewWidth;
        }
    }
    
    CGRect frame = self.frame;
    frame.size.width = viewWidth;
    self.frame = frame;
}

@end
