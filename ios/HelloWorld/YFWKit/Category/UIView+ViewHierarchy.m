//
//  UIView+ViewHierarchy.m
//  HelloWorld
//
//  Created by yfw on 2019/11/28.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "UIView+ViewHierarchy.h"

@implementation UIView (ViewHierarchy)
static NSMutableArray *_labelsArray;
static NSString *_title;
static NSString *_message;
static NSUInteger _totalCount;

- (void)logViewHierarchy {
  for (UIView *subview in self.subviews) {
    if ([subview isKindOfClass:[UILabel class]]) {
      UILabel *label = (UILabel *)subview;
      //title label
      if ([label.text isEqualToString:_title]) {
        [_labelsArray addObject:label];
      } else if ([label.text isEqualToString:_message]) {
        //message label
        [_labelsArray addObject:label];
      }
    }
    if (_labelsArray.count >= 2) { break; }
    [subview logViewHierarchy];
  }
}

- (NSArray *)labelsForTitle:(NSString *)title message:(NSString *)message {
  _totalCount = 0;
  _labelsArray = [NSMutableArray array];
  _title = title;
  _message = message;
  _totalCount = 0;
  if (_title != nil) {
    _totalCount += 1;
  }
  if (_message != nil) {
    _totalCount += 1;
  }
  //遍历所有子视图，找到对应title和message的label
  [self logViewHierarchy];
  return _labelsArray;
}

@end
