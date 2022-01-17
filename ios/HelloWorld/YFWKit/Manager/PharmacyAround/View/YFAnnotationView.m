//
//  YFAnnotationView.m
//  YaoFang
//
//  Created by yaofangwang on 15/1/28.
//  Copyright (c) 2015年 yaofangwang. All rights reserved.
//

#import "YFAnnotationView.h"
#import "YFAnnotationPaoPaoView.h"
#import "YFKActionPaopaoView.h"


@interface YFAnnotationView ()
@property (nonatomic, strong) YFKActionPaopaoView *actionPaopaoView;
@end

@implementation YFAnnotationView

- (id)initWithAnnotation:(id<BMKAnnotation>)annotation reuseIdentifier:(NSString *)reuseIdentifier {
    if (self = [super initWithAnnotation:annotation reuseIdentifier:reuseIdentifier]) {
//      self.centerOffset = CGPointMake(0, -12.5);
      self.calloutOffset = CGPointMake(50, 120);
      self.image = [UIImage imageNamed:@"annotation_normal"];
      self.hidePaopaoWhenSelectOthers = YES;
      self.hidePaopaoWhenSingleTapOnMap = YES;
      YFAnnotationPaoPaoView *paopao = [[[NSBundle mainBundle] loadNibNamed:@"YFAnnotationPaoPaoView" owner:self options:nil] firstObject];
      paopao.model = (YFShop *)annotation;
      _actionPaopaoView = [[YFKActionPaopaoView alloc] initWithCustomView:paopao];
      self.paopaoView = _actionPaopaoView;
    }
    return self;
}

-(void)setBlock:(AnnotationViewBlock)block{
  _actionPaopaoView.block = block;
}

- (void)setSelected:(BOOL)selected {
    [super setSelected:selected];
  
    self.image = self.selected ? [UIImage imageNamed:@"annotation_selected"] : [UIImage imageNamed:@"annotation_normal"];
}

@end
