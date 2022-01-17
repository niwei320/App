//
//  YFWAlertController.m
//  HelloWorld
//
//  Created by yfw on 2019/11/28.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "YFWAlertController.h"
#import "UIView+ViewHierarchy.h"
@interface YFWAlertController ()

@end

@implementation YFWAlertController

- (void)viewDidLoad {
  [super viewDidLoad];
  [self setupTextAttribute];
}

- (void)setupTextAttribute {
  NSArray *labelsArray = [self.view labelsForTitle:self.title message:self.message];
  UILabel *titleLabel = labelsArray.firstObject;
  UILabel *messageLabel = labelsArray.count >= 2 ? labelsArray[1] : nil;
  if ([titleLabel isKindOfClass:[UILabel class]]) {
    titleLabel.textAlignment = self.titleTextAlignment;
    
  }
  if ([messageLabel isKindOfClass:[UILabel class]]) {
    messageLabel.textAlignment = self.messageTextAlignment;
    
  }
}
/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

@end
