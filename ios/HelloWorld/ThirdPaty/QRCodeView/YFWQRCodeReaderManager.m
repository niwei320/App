//
//  YFWQRCodeReaderManager.m
//  HelloWorld
//
//  Created by wei ni on 2018/9/21.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "YFWQRCodeReaderManager.h"
#import "AppDelegate.h"
#import "YFWQRCodeReaderViewController.h"
#import "YFWQRCodeReaderDelegate.h"
#import "NSString+YFWContainstirng.h"
@interface YFWQRCodeReaderManager()<YFWQRCodeReaderDelegate>
@property (nonatomic,strong) YFWQRCodeReaderViewController *reader;
@property (nonatomic,copy) RCTResponseSenderBlock callback;
@end
@implementation YFWQRCodeReaderManager
- (instancetype)init
{
  self = [super init];
  if (self) {
    
  }
  return self;
}
-(void)showQRCodeReaderView:(RCTResponseSenderBlock)callback{
  _reader = [[YFWQRCodeReaderViewController alloc] init];
  _reader.delegate = self;
  _callback = callback;
  [[AppDelegate sharedInstances].nav pushViewController:_reader animated:YES];
}

- (void)requestQRResult:(NSString *)scan_code{
  
  NSDictionary *param = @{@"__cmd" : @"guest.common.app.getScanResult" ,
                          @"scan_code" : getSafeString(scan_code)};
  __weak typeof(self)weakSelf = self;
  YFWSocketManager * manager = [YFWSocketManager shareManager];
  [manager requestAsynParameters:param success:^(id responseObject) {
    
    NSDictionary *result = [[responseObject objectForKey:@"result"] safeDictionary];
    if (result && result.allKeys.count > 0) {
      NSMutableDictionary *resultDic = [NSMutableDictionary dictionaryWithDictionary:result];
      [resultDic setValue:scan_code forKey:@"scan_code"];
      weakSelf.callback(@[[NSNull null],resultDic]);
      [[AppDelegate sharedInstances].nav popViewControllerAnimated:NO];
    } else {
      [YFWProgressHUD showErrorWithStatus:@"无扫描结果"];
    }
    
  } failure:^(NSError *error) {
    [YFWProgressHUD showErrorWithStatus:@"无扫描结果"];
  }];
  
}


#pragma mark - QRCodeReader Delegate Methods

- (void)reader:(YFWQRCodeReaderViewController *)reader didScanResult:(NSString *)result
{
  
  if ([result hasPrefix:@"http"]) {
    if ([result yfwContain:@"detail"]) {
      NSArray *first = [result componentsSeparatedByString:@"detail-"];
      if (first.count==2) {
        NSString *targetId = first[1];
        NSArray *second = [targetId componentsSeparatedByString:@"."];
        NSString *valueid = second[0];
        [[AppDelegate sharedInstances].nav popViewControllerAnimated:NO];
          _callback(@[[NSNull null],@{@"name":@"get_shop_goods_detail",@"value":valueid,@"scan_code":result}]);
      }
    } else if ([result yfwContain:@"medicine"]) {
      NSArray *first = [result componentsSeparatedByString:@"medicine-"];
      if (first.count==2) {
        NSString *targetId = first[1];
        NSArray *second = [targetId componentsSeparatedByString:@"."];
        NSString *valueid = second[0];
        [[AppDelegate sharedInstances].nav popViewControllerAnimated:NO];
        _callback(@[[NSNull null],@{@"name":@"get_goods_detail",@"value":valueid,@"scan_code":result}]);
      }
    } else if ([result yfwContain:@"cart"]) {
      NSArray *first = [result componentsSeparatedByString:@"cart-"];
      if (first.count==2) {
        NSString *targetId = first[1];
        NSArray *second = [targetId componentsSeparatedByString:@"."];
        NSString *valueid = @"";
        if (second && second.count > 0) {
          valueid = second[0];
        }
        [[AppDelegate sharedInstances].nav popViewControllerAnimated:NO];
        _callback(@[[NSNull null],@{@"name":@"get_shopping_car",@"value":valueid,@"scan_code":result}]);
      }
    } else if ([result yfwContain:@"erpOrderScan"]) {
      NSArray *first = [result componentsSeparatedByString:@"erpOrderScan"];
      if (first.count==2) {
        NSString *targetId = first[1];
        NSArray *second = [targetId componentsSeparatedByString:@"&"];
        NSMutableDictionary *paramsM = [NSMutableDictionary dictionaryWithObject:@"erpOrderScan" forKey:@"name"];
        [paramsM setValue:result forKey:@"scan_code"];
        if (second && second.count > 0) {
          for (NSString *str in second) {
            if ([str containsString:@"="] ) {
              NSArray *results = [str componentsSeparatedByString:@"="];
              [paramsM setValue:results[1] forKey: results[0] ];
            }
          }
        }
        [AppDelegate sharedInstances].erpUserInfo = [paramsM copy];
        [[AppDelegate sharedInstances].nav popViewControllerAnimated:NO];
        _callback(@[[NSNull null],paramsM]);
      }
    }
  }else
  {
    if (result.length > 0) {
      [self requestQRResult:result];
    }else{
      [YFWProgressHUD showErrorWithStatus:@"无扫描结果"];
    }
  }
  _reader = nil;
}

- (void)readerDidCancel:(YFWQRCodeReaderViewController *)reader
{
  [self.reader allStop];
  _reader = nil;
  [[AppDelegate sharedInstances].nav popViewControllerAnimated:YES];
}


- (void)clearRender{
  
  _reader = nil;
}

@end
