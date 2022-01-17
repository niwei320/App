//
//  YFWRNShopView.m
//  HelloWorld
//
//  Created by yfw on 2020/12/21.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "YFWRNShopView.h"

@interface YFWRNShopView ()

@property (nonatomic,strong) NSURL *imageUrl;
@end

@implementation YFWRNShopView

- (instancetype)initWithImageUrl:(NSURL *)imageUrl {
  self = [super init];
  if (self) {
    self.imageUrl = imageUrl;
    self.backgroundColor = [UIColor clearColor];
  }
  return self;
}
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
  CGContextRef contextRef = UIGraphicsGetCurrentContext();
  CGContextSetFillColorWithColor(contextRef, [UIColor clearColor].CGColor);
  CGContextFillRect(contextRef, rect);
  UIImage *shopContainerImage = [UIImage imageNamed:@"map_point_empty"];
  [shopContainerImage drawInRect:CGRectMake(0, 0, 37, 41)];
  UIImage *shopLogoImage = [UIImage imageWithData:[NSData dataWithContentsOfURL:self.imageUrl]];
  [shopLogoImage drawInRect:CGRectMake(1, 0.5, 35, 35)];
}


@end
