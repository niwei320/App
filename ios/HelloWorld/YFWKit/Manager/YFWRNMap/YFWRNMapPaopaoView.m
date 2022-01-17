//
//  YFWRNMapPaopaoView.m
//  HelloWorld
//
//  Created by yfw on 2020/12/15.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "YFWRNMapPaopaoView.h"
#import "YFWRNShopView.h"
@interface YFWRNMapPaopaoView ()

@property (weak, nonatomic) IBOutlet UIButton *clickBtn;
@property (weak, nonatomic) IBOutlet UIImageView *rightRowImageView;
@property (weak, nonatomic) IBOutlet UILabel *titleLable;
@property (weak, nonatomic) IBOutlet UILabel *statusLable;
@property (weak, nonatomic) IBOutlet UILabel *descLable;
@property (strong,nonatomic) CADisplayLink *displayLink;
@property (nonatomic, assign) NSInteger second;
@property (nonatomic, assign) NSInteger displayCount;
@end

@implementation YFWRNMapPaopaoView
- (instancetype)initWithCoder:(NSCoder *)coder {
  self = [super initWithCoder:coder];
  if (self) {
    [self initPaopao];
  }
  return self;
}
- (instancetype)initWithFrame:(CGRect)frame {
  self = [super initWithFrame:frame];
  if (self) {
    [self initPaopao];
  }
  return self;
}
- (void)initPaopao {
}
- (void)awakeFromNib {
  [super awakeFromNib];
  self.rightRowImageView.transform = CGAffineTransformMakeRotation(180*M_PI/180.0);
}
- (void)layoutSubviews {
  [super layoutSubviews];
}
- (void)setInfo:(NSDictionary *)info {
  _info = info;
  self.descLable.text = info[@"msg"];
  if (((NSString *)info[@"msg"]).length == 0) {
    self.titleLable.text = info[@"title"];
    self.statusLable.text = @"";
  } else {
    self.statusLable.text = info[@"title"];
    self.titleLable.text = @"";
  }
  if ([info[@"second"] integerValue] > 0 && ([((NSString *)info[@"msg"]) containsString:@"X"])) {
    self.second = [info[@"second"] integerValue];
    self.displayLink = [CADisplayLink displayLinkWithTarget:self selector:@selector(dealTipInfo)];
    [self.displayLink addToRunLoop:[NSRunLoop mainRunLoop] forMode:NSRunLoopCommonModes];
    [self dealTipInfo];
  } else if ([info[@"second"] integerValue] <= 0 && ([((NSString *)info[@"msg"]) containsString:@"X"])) {
    self.descLable.text = @"";
    self.titleLable.text = info[@"title"];
    self.statusLable.text = @"";
  }
}
- (void)dealTipInfo {
  if (self.displayCount == 60) {
    self.displayCount = 0;
  }
  if (self.displayCount != 0) {
    self.displayCount ++;
    return;
  } else {
    if (self.second <= 0) {
      if (self.timeEndCallBack) {
        self.timeEndCallBack(@{});
      }
      [self.displayLink invalidate];
      self.displayLink = nil;
    }
  }
  self.displayCount ++;
  NSString *msgStr = (NSString *)self.info[@"msg"];
  NSRange range = [msgStr rangeOfString:@"X"];
  NSMutableAttributedString *tipAttr = [[NSMutableAttributedString alloc] initWithString:[msgStr substringToIndex:range.location] attributes:@{NSFontAttributeName:[UIFont boldSystemFontOfSize:11], NSForegroundColorAttributeName:[UIColor colorWithHexString:@"#333333"]}];
  [tipAttr appendAttributedString:[[NSMutableAttributedString alloc] initWithString:[self dealTimeWithSecond:self.second] attributes:@{NSFontAttributeName:[UIFont boldSystemFontOfSize:11], NSForegroundColorAttributeName:[UIColor colorWithHexString:@"#5799f7"]}]];
  [tipAttr appendAttributedString:[[NSMutableAttributedString alloc] initWithString:[msgStr substringFromIndex:range.location+1] attributes:@{NSFontAttributeName:[UIFont boldSystemFontOfSize:11], NSForegroundColorAttributeName:[UIColor colorWithHexString:@"#333333"]}]];
  self.descLable.attributedText = tipAttr;
  self.second--;
}
- (NSString *)dealTimeWithSecond:(NSInteger)second {
  if (second <= 0) {
    return @"";
  }
  return [NSString stringWithFormat:@"%.2ld:%.2ld",second/60,second%60];
}
- (IBAction)clickAction:(UIButton *)sender {
  if (self.clickActionCallBack) {
    self.clickActionCallBack(@{});
  }
}

@end
