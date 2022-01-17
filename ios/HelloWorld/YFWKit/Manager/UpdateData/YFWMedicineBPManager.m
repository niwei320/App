//
//  YFWMedicineBPManager.m
//  HelloWorld
//
//  Created by yfw-姜明均 on 2018/12/27.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "YFWMedicineBPManager.h"
#import "YFWFindCodeView.h"
#import "YFWFindCodeTool.h"
#import "YFWUpLoadViewController.h"
@implementation YFWFindCodeModel

+ (instancetype)modelWithDic:(NSDictionary *)dic{
  
  YFWFindCodeModel *model = [[YFWFindCodeModel alloc] init];
  model.zipurl = [dic objectForKey:@"zipurl"];
  model.zipversion = [dic objectForKey:@"zipversion"];
  model.version = [dic objectForKey:@"version"];
  model.updateType = [dic objectForKey:@"updateType"];
  model.isforceUpdate = [dic objectForKey:@"isforceUpdate"];
  model.tcp_domain = [dic objectForKey:@"tcp_domain"];
  model.http_domain = [dic objectForKey:@"http_domain"];
  
//  model.version = @"4.9.98";
//  model.zipversion = @"3.4.0";
//  model.zipurl = @"https://obs-cead.obs.cn-north-1.myhuaweicloud.com/app_download/bundle_ios_version_550.zip";
  
  return model;
}

- (void)setTcp_domain:(NSString *)tcp_domain{
  
  tcp_domain = [self removePointString:tcp_domain];
  _tcp_domain = tcp_domain;
  
  BOOL istcp = [[NSUserDefaults standardUserDefaults] boolForKey:@"UseTCP"];
  if (tcp_domain.length > 10) {
    
    [[NSUserDefaults standardUserDefaults] setObject:tcp_domain forKey:@"tcp_domain"];
    if (istcp) {
      [[NSUserDefaults standardUserDefaults] setObject:tcp_domain forKey:@"yfwDomain"];
    }
    
  }
  
}


- (void)setHttp_domain:(NSString *)http_domain{
  
  http_domain = [self removePointString:http_domain];
  _http_domain = http_domain;
  
  BOOL istcp = [[NSUserDefaults standardUserDefaults] boolForKey:@"UseTCP"];
  if (http_domain.length > 10 ) {
    
    [[NSUserDefaults standardUserDefaults] setObject:http_domain forKey:@"http_domain"];
    if (!istcp) {
      [[NSUserDefaults standardUserDefaults] setObject:http_domain forKey:@"yfwDomain"];
    }
    
  }
  
}

- (NSString *)removePointString:(NSString *)domain{
  
  if ([domain isKindOfClass:[NSString class]]) {
    NSString *firstString = [[domain substringFromIndex:0] substringToIndex:1];
    if ([firstString isEqualToString:@"."]) {
      domain = [[domain substringFromIndex:1] substringToIndex:domain.length -1];
    }
  }
  
  return domain;
}

@end


@interface YFWMedicineBPManager ()<UIAlertViewDelegate>

@property (nonatomic, assign) NSInteger connectCount;
@property (nonatomic, strong) YFWFindCodeModel *model;
@end


@implementation YFWMedicineBPManager
@synthesize versionNumber = _versionNumber;
@synthesize medicineName = _medicineName;

+ (YFWMedicineBPManager *) sharedInstance
{
  static YFWMedicineBPManager *manager = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    manager = [[YFWMedicineBPManager alloc] init];
  });
  return manager;
}


//request

- (void)requestData{
  
#ifdef DEBUG
  
#else
  
  __weak typeof(self)weakSelf = self;
  
  NSDictionary *param = @{@"__cmd":@"guest.common.app.getCurrentVersionZip",@"os" : @"ios"};
  YFWSocketManager *manager = [YFWSocketManager shareManager];
  [manager requestAsynParameters:param success:^(id responseObject) {
    NSDictionary *result = [responseObject objectForKey:@"result"];
    if (!result || [result isKindOfClass:[NSNull class] ]) {
      return ;
    }
    YFWFindCodeModel *model = [YFWFindCodeModel modelWithDic:result];
    
    self.model = model;
    
    NSString *currentAppVersion = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"];
    NSString *medicineName = self.medicineName;
    BOOL versionBool = [[currentAppVersion stringByReplacingOccurrencesOfString:@"." withString:@""] doubleValue] >= [[model.version stringByReplacingOccurrencesOfString:@"." withString:@""] doubleValue];
    
    if ([[model.zipversion stringByReplacingOccurrencesOfString:@"." withString:@""] doubleValue] > [[medicineName stringByReplacingOccurrencesOfString:@"." withString:@""] doubleValue] &&
        versionBool &&
        model.zipurl.length > 0) {
      
      if ([model.updateType isEqualToString:@"front"]) {
        
        if (model.isforceUpdate.boolValue) {
          
          [self showAlert:^{
            YFWFindCodeView *vc = [YFWFindCodeView getYFWFindCodeView];
            vc.doneBlock = self.doneBlock;
            [vc request:model];
            [[AppDelegate sharedInstances].window.rootViewController.view addSubview:vc];
          }];
          
        }else{
          
          [self showAlert:^{
            YFWFindCodeView *vc = [YFWFindCodeView getYFWFindCodeView];
            vc.doneBlock = self.doneBlock;
            [vc request:model];
            [[AppDelegate sharedInstances].window.rootViewController.view addSubview:vc];
            
          } Cancle:^{

          }];
        
          
        }
        
      } else {
        
        [[YFWFindCodeTool shareInstance] dLWithModel:model];
        
      }
    }
    
  } failure:^(NSError *error) {
    
    if (weakSelf.connectCount < 3) {
      [weakSelf requestData];
      weakSelf.connectCount++;
    }
    
  }];
#endif
  
}
 - (void)showAlert:(void (^)())doneBlock Cancle:(void (^)())cancleBlock{
   
   UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:nil message:@"有更新文件，是否升级？" delegate:self cancelButtonTitle:@"取消" otherButtonTitles:@"确定", nil];
   alertView.tag = 1002;
   [alertView show];
   
 }
   
   
 - (void)showAlert:(void (^)())doneBlock{
   
   UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:nil message:@"有新版本需要升级" delegate:self cancelButtonTitle:nil otherButtonTitles:@"确定", nil];
   alertView.tag = 1001;
   [alertView show];
   
 }

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex {
  if (alertView.tag == 1001 || (alertView.tag == 1002&&buttonIndex == 1)) {
    YFWFindCodeView *vc = [YFWFindCodeView getYFWFindCodeView];
    vc.doneBlock = self.doneBlock;
    [vc request:self.model];
    YFWUpLoadViewController *loadVC = [YFWUpLoadViewController new];
    [loadVC.view addSubview:vc];
    [AppDelegate sharedInstances].window.rootViewController = loadVC;
  }
}
- (void)downLoadBundleWithUrl:(NSString *)url {
    YFWFindCodeView *vc = [YFWFindCodeView getYFWFindCodeView];
    vc.doneBlock = self.doneBlock;
  
    YFWFindCodeModel *model = [YFWFindCodeModel modelWithDic:@{
      @"zipurl":url,
      @"zipversion":self.medicineName,
      @"version":self.versionNumber,
      @"updateType":@"",
      @"isforceUpdate":@"",
    }];
    self.model = model;
    [vc request:self.model];
    YFWUpLoadViewController *loadVC = [YFWUpLoadViewController new];
    [loadVC.view addSubview:vc];
    [AppDelegate sharedInstances].window.rootViewController = loadVC;
}
#pragma mark - Config

- (void)beginRCT{
  
  if ([self compareAppVersionIsNew]) {
    [self deleteFBP];
  }
  
  [self createFBP];
  
  
  
  NSString *medicineLocation = [[NSBundle mainBundle] pathForResource:@"bundle" ofType:nil];
  NSString *fbp = [[self get_MedicineB_p] stringByAppendingPathComponent:@"/bundle"];
  
  NSFileManager *fileManager =  [NSFileManager defaultManager];
  
  if (![fileManager fileExistsAtPath:[self get_medicine_index]]) {
    if (medicineLocation) {
      [fileManager copyItemAtPath:medicineLocation toPath:fbp error:nil];
    }
  }
  if (self.doneBlock) {
    self.doneBlock();
  }
  
}

-(void)createFBP{
  if([[NSFileManager defaultManager]fileExistsAtPath:[self get_medicine_index]]){
    return;
  }
  
  NSFileManager *fileManager = [NSFileManager defaultManager];
  
  NSString *directryP = [self get_MedicineB_p];
  [fileManager createDirectoryAtPath:directryP withIntermediateDirectories:YES attributes:nil error:nil];
  
  NSString *ganmaoP = [self get_ganmao_p];
  [fileManager createDirectoryAtPath:ganmaoP withIntermediateDirectories:YES attributes:nil error:nil];
  
}

- (void)deleteFBP{
  
  NSFileManager *fileManager = [NSFileManager defaultManager];
  
  NSString *directryP = [self get_MedicineB_p];
  if ([fileManager fileExistsAtPath:directryP]) {
    [fileManager removeItemAtPath:directryP error:nil];
  }
  
  NSString *ganmaoP = [self get_ganmao_p];
  if ([fileManager fileExistsAtPath:ganmaoP]) {
    [fileManager removeItemAtPath:ganmaoP error:nil];
  }
  
}

- (NSString *)get_MedicineB_p{
  
  NSArray *ps = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory,NSUserDomainMask,YES);
  NSString *p = [ps lastObject];
  
  NSString *directry = [p stringByAppendingPathComponent:@"MedicineB"];
  
  return directry;
  
}

- (NSString *)get_ganmao_p{
  
  NSArray *ps = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory,NSUserDomainMask,YES);
  NSString *p = [ps lastObject];
  
  NSString *directry = [p stringByAppendingPathComponent:@"Ganmao"];
  
  return directry;
  
}


- (NSString*)get_medicine_index{

  NSString* filePath = [[self get_MedicineB_p] stringByAppendingPathComponent:@"/bundle/index.ios.jsbundle"];
  
  return  filePath;
}

- (BOOL)compareAppVersionIsNew{
  
  NSString *compareVersion = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"];
  double localVersion = [[compareVersion stringByReplacingOccurrencesOfString:@"." withString:@""] doubleValue];
  double lastVersion = [[self.versionNumber stringByReplacingOccurrencesOfString:@"." withString:@""] doubleValue];
  //处理3.3.30版本及之前版本上的一个热更新bug
  //3.3.50版本发版时对应的yfw_medicineName=2.8.0
  BOOL fixed = [[NSUserDefaults standardUserDefaults] boolForKey:@"3330BugFixed"];
  if (!fixed && localVersion>3330 && [self.medicineName isEqualToString:@"2.8.0"]) {
    [[NSUserDefaults standardUserDefaults] setBool:YES forKey:@"3330BugFixed"];
    return true;
  }
  return localVersion > lastVersion;
}


#pragma mark - Setter && Getter
- (NSString *)versionNumber{
  NSString *version = [[NSUserDefaults standardUserDefaults] objectForKey:@"yfw_versionNumber"];
  NSString *localVersion = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"];
  if (version.length == 0) {
    version = localVersion;
  }
  [self setVersionNumber:localVersion];
  return version;
}
-(void)setVersionNumber:(NSString *)versionNumber{
  [[NSUserDefaults standardUserDefaults] setObject:versionNumber forKey:@"yfw_versionNumber"];
}
- (NSString *)medicineName{
  NSString *medicineName = [[NSUserDefaults standardUserDefaults] objectForKey:@"yfw_medicineName"];
  if (medicineName.length == 0) {
    medicineName = @"4.7.0";
  }
  return medicineName;
}
- (void)setMedicineName:(NSString *)medicineName{
  [[NSUserDefaults standardUserDefaults] setObject:medicineName forKey:@"yfw_medicineName"];
}


@end
