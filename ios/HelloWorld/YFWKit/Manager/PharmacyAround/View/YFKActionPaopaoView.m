//
//  YFKActionPaopaoView.m
//  HelloWorld
//
//  Created by mac on 2019/10/23.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "YFKActionPaopaoView.h"

@implementation YFKActionPaopaoView

-(void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event{
  UITouch *touch=[touches anyObject];//获取一个触摸对象
  CGPoint cur=[touch locationInView:self];//当前点
  
  if (cur.x>self.width*2/3) {
    if (self.block) {
      self.block(2);
    }
  }else{
    if (self.block) {
      self.block(1);
    }
  }
  
}

@end
