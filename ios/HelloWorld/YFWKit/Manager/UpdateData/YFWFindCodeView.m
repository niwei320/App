//
//  YFWFindCodeView.m
//  HelloWorld
//
//  Created by yfw-姜明均 on 2018/12/24.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "YFWFindCodeView.h"
#import "YFWFindCodeTool.h"

@interface YFWFindCodeView()

@property (weak, nonatomic) IBOutlet UIImageView *backImageView;
@property (weak, nonatomic) IBOutlet UIView *percentView;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *percentViewWidth;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *percentViewTop;

@end

@implementation YFWFindCodeView

-(void)awakeFromNib{
  
  [super awakeFromNib];
  
  if ([[UIDevice currentDevice].model isEqualToString:@"iPad"]) {
    
    _backImageView.image = [UIImage imageNamed:@"DefaultPad_main"];
    self.percentViewTop.constant = 700;
    
  }else{
    
    if (IS_IPHONE_X) {
      _backImageView.image = [UIImage imageNamed:@"DefaultX_main.jpg"];
    }else{
      _backImageView.image = [UIImage imageNamed:@"Default_main.jpg"];
    }
    
    self.percentViewTop.constant = 410;
    
  }
  
}

- (void)request:(YFWFindCodeModel *)model{
  
  __weak typeof(self)weakSelf = self;
  
  [YFWFindCodeTool shareInstance].doneBlock = ^{
    [weakSelf doneMethod];
  };
  [YFWFindCodeTool shareInstance].progressBlock = ^(float percent) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [weakSelf showProgressBar:percent];
    });
  };
  
  if (model.isforceUpdate.boolValue) {
    [[YFWFindCodeTool shareInstance] dLWithModel:model];
    [YFWFindCodeTool shareInstance].errorBlock = ^{
      [weakSelf doneMethod];
    };
    
  }else{
    //选择更新 （下载失败进入主页面）
    [[YFWFindCodeTool shareInstance] dLWithModel:model];
    [YFWFindCodeTool shareInstance].errorBlock = ^{
      dispatch_async(dispatch_get_main_queue(), ^{
        [YFWProgressHUD showInfoWithStatus:@"更新失败"];
      });
      [weakSelf doneMethod];
    };
    
  }
  
}

- (void)showProgressBar:(float)percent{
  
  
  __weak typeof(self)weakSelf = self;
  dispatch_async(dispatch_get_main_queue(), ^{
    
    CGFloat kWidth = kScreenWidth - 40;
    CGFloat contentWidth = kWidth *percent;
    
    if (contentWidth > 20) {
      [UIView animateWithDuration:0.1 animations:^{
        weakSelf.percentViewWidth.constant = contentWidth;
      }];
    }
    
  });
  
}

- (void)doneMethod{
  
  if (self.doneBlock) self.doneBlock();
//  [self removeFromSuperview];
  
}


+ (YFWFindCodeView *)getYFWFindCodeView
{
  NSArray *array = [[NSBundle mainBundle] loadNibNamed:@"YFWFindCodeView" owner:self options:nil];
  YFWFindCodeView *view = array.firstObject;
  view.frame = CGRectMake(0, 0, kScreenWidth, kScreenHeight);
  
  return view;
}



@end
