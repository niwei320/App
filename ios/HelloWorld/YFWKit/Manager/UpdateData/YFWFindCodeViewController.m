//
//  YFWFindCodeViewController.m
//  HelloWorld
//
//  Created by yfw-姜明均 on 2019/1/18.
//  Copyright © 2019年 Facebook. All rights reserved.
//

#import "YFWFindCodeViewController.h"
#import "YFWMedicineBPManager.h"

@interface YFWFindCodeViewController ()

@property (weak, nonatomic) IBOutlet UIImageView *backImageView;

@end

@implementation YFWFindCodeViewController

- (void)viewDidLoad {
    [super viewDidLoad];
  
    [self showBackImage];
    [YFWMedicineBPManager sharedInstance].doneBlock = self.doneBlock;
  if (self.customBundleUrl && self.customBundleUrl.length > 0) {
    [[YFWMedicineBPManager sharedInstance] downLoadBundleWithUrl:self.customBundleUrl];
  } else {
    [[YFWMedicineBPManager sharedInstance] beginRCT];
    [[YFWMedicineBPManager sharedInstance] requestData];
  }
    
}

- (void)showBackImage{
  
  if ([[UIDevice currentDevice].model isEqualToString:@"iPad"]) {
    
    _backImageView.image = [UIImage imageNamed:@"DefaultPad_main"];
    
  }else{
    
    if (IS_IPHONE_X) {
      _backImageView.image = [UIImage imageNamed:@"DefaultX_main.jpg"];
    }else{
      _backImageView.image = [UIImage imageNamed:@"Default_main.jpg"];
    }
    
  }
  
}



@end
