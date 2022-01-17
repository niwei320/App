//
//  YFWSobotViewController.m
//  HelloWorld
//
//  Created by yfw-姜明均 on 2018/9/27.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "YFWSobotViewController.h"
#ifdef RunOnMobile
#import "SobotManager.h"
#endif

@interface YFWSobotViewController ()

@end

@implementation YFWSobotViewController

- (void)viewDidLoad {
    [super viewDidLoad];
  
    [self configSobotManager];
  
}

- (IBAction)clickBackMethod:(UIButton *)sender {
  
  [self.navigationController popToRootViewControllerAnimated:YES];
  
}

#pragma mark - Config

- (void)configSobotManager{
  
#ifdef RunOnMobile
  [SobotManager getManager].detail = self.detail;
  [SobotManager getManager].ssid = self.ssid;
  [[SobotManager getManager] startChatView:self];
#endif
  
}

@end
