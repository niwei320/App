//
//  YFWLaunchAdViewController.m
//  HelloWorld
//
//  Created by yfw-姜明均 on 2019/6/3.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "YFWLaunchAdViewController.h"
#import <SDWebImage/UIImageView+WebCache.h>
#import "YFWUpLoadViewController.h"
@interface YFWLaunchAdViewController ()
@property (weak, nonatomic) IBOutlet UIImageView *bgImageView;
@property (weak, nonatomic) IBOutlet UIButton *skipBtn;
@property (nonatomic, strong) dispatch_source_t gcdTimer;
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *skipBtnTopLaoutConstraint;
@property (weak, nonatomic) IBOutlet UILabel *titleLabel;

@end

@implementation YFWLaunchAdViewController
- (IBAction)clickedAction:(id)sender {
  if (self.gcdTimer) {
    dispatch_source_cancel(self.gcdTimer);
    self.gcdTimer = nil;
  }
  if (self.callBack) {
    self.callBack(YES);
    [[AppDelegate sharedInstances].window.layer addAnimation:[self createTransitionAnimation] forKey:nil];
    [[AppDelegate sharedInstances] changeToMainVC];
  }
  
}

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
  if ( !self.imageUrl || !([self.imageUrl hasPrefix:@"http"]||[self.imageUrl hasPrefix:@"https"]) ) {
    [self skipAction];
    return;
  }
  CGRect statusRect = [[UIApplication sharedApplication] statusBarFrame];
  self.skipBtnTopLaoutConstraint.constant = statusRect.size.height + 10;
  
  if (self.showTimeSecond <= 0) {
    self.showTimeSecond = 3;
  }
  
  
  NSURL *imageUrl = [NSURL URLWithString:self.imageUrl];
  UIImage *defaultImage = [UIImage imageNamed:@"Default_main.jpg"];
  if (IS_IPHONE_X) {
    defaultImage = [UIImage imageNamed:@"DefaultX_main.jpg"];
  }
  [SDWebImageDownloader sharedDownloader].downloadTimeout = 5;
  [self.bgImageView sd_setImageWithURL:imageUrl placeholderImage:defaultImage completed:^(UIImage * _Nullable image, NSError * _Nullable error, SDImageCacheType cacheType, NSURL * _Nullable imageURL) {
    if (error) {
      [self skipAction];
    } else {
      
      self.skipBtn.hidden = NO;
      [self uploadSkipTitle];
      [self initTimer];
    }
  }];
  
 
  
}
- (IBAction)skipAction {
  if (self.callBack) {
    self.callBack(NO);
  }
  if (self.gcdTimer) {
    dispatch_source_cancel(self.gcdTimer);
    self.gcdTimer = nil;
  }
  dispatch_async(dispatch_get_main_queue(), ^{
    if (![[AppDelegate sharedInstances].window.rootViewController isKindOfClass:[YFWUpLoadViewController class]]) {
      [[AppDelegate sharedInstances].window.layer addAnimation:[self createTransitionAnimation] forKey:nil];
      [AppDelegate sharedInstances].window.rootViewController = [AppDelegate sharedInstances].nav;
    }
  });
}
- (void)uploadSkipTitle{
  NSString *skipTitle = [NSString stringWithFormat:@"%02ld 跳过",(long)self.showTimeSecond];
  [self.titleLabel setText:skipTitle];

}
- (CATransition *)createTransitionAnimation {
  CATransition *animation = [CATransition animation];
  animation.type = @"fade";
  animation.subtype = kCATransitionFromBottom;
  animation.duration = 1;
  animation.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut];
  return animation;
}
- (void)timerAction {
  
  self.showTimeSecond--;
  if (self.showTimeSecond <= 0) {
    [self skipAction];
  } else {
    dispatch_async(dispatch_get_main_queue(), ^{
      [self uploadSkipTitle];
    });
  }
}
- (void)initTimer{
  dispatch_queue_t queue = dispatch_get_global_queue(0, 0);
  self.gcdTimer = dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER, 0, 0, queue);
  // start 秒后开始执行
  uint64_t start = 1;
  // 每隔interval执行
  uint64_t interval = 1;
  dispatch_source_set_timer(self.gcdTimer, dispatch_time(DISPATCH_TIME_NOW, start * NSEC_PER_SEC), interval * NSEC_PER_SEC, 0);
  __weak typeof(self)weakSelf = self;
  dispatch_source_set_event_handler(self.gcdTimer, ^{
    [weakSelf timerAction];
  });
  dispatch_resume(self.gcdTimer);
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
