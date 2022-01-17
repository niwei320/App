//
//  YFWSocketManager.m
//  ScoketManager
//
//  Created by 姜明均 on 2018/1/18.
//  Copyright © 2018年 ios. All rights reserved.
//

#import "YFWSocketManager.h"
#import "YFWSocketRequestOperation.h"
#import "YFWSocketImageUploadOperation.h"

@interface YFWSocketManager()

@property (nonatomic, strong) NSMutableArray *marray;
@property (nonatomic, strong) NSLock *lock;

@end

@implementation YFWSocketManager

//单例获取
+ (instancetype)shareManager{
    
    static id _instance;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _instance = [[self alloc] init];
    });
    
    return _instance;
}

//异步请求
- (void)requestAsynParameters:(id)parameters
                      success:(void (^)(id responseObject))success
                      failure:(void (^)( NSError *error))failure{
  
//    NSLog(@"requestAsynParameters  1  *****%@",parameters);
//    dispatch_queue_t queue = dispatch_queue_create("yfw", DISPATCH_QUEUE_CONCURRENT);
//
//    __weak typeof(self)weakSelf = self;
//    dispatch_async(queue, ^{
//      NSLog(@"requestAsynParameters  2  *****%@",parameters);
//
//        [weakSelf requestParameters:parameters success:^(id responseObject) {
//          NSLog(@"requestAsynParameters  3  *****%@",parameters);
//
//          success(responseObject);
//
//        } failure:^(NSError *error) {
//          NSLog(@"requestAsynParameters  4  *****%@",parameters);
//
//          if(failure) failure(error);
//
//        }];
//    });
  
  NSLog(@"requestAsynParameters  2  *****%@",parameters);

  [self requestParameters:parameters success:^(id responseObject) {
    NSLog(@"requestAsynParameters  3  *****%@",parameters);
    
    success(responseObject);
    
  } failure:^(NSError *error) {
    NSLog(@"requestAsynParameters  4  *****%@",parameters);
    
    if(failure) failure(error);
    
  }];
    
}

//数据请求
- (void)requestParameters:(id)parameters success:(void (^)(id))success failure:(void (^)(NSError *))failure{
  
    NSLog(@"requestParameters  1  *****");

    YFWSocketRequestOperation *request = [[YFWSocketRequestOperation alloc] init];

    [request reciveConnectHost:^{
        [request sendDataWithDic:parameters];
    }];
    [request reciveData:^(NSDictionary *response) {
        success(response);
    }];
    [request reciveError:^(NSError *error) {
        failure(error);
    }];
    [request connecteServer];

    [self.lock lock];
    [self.marray addObject:request];
    [self.lock unlock];
    [self removeRequest];
  
}

//数据图片请求
- (void)requestUploadImage:(id)image success:(void (^)(id))success failure:(void (^)(NSError *))failure{
    
    YFWSocketImageUploadOperation *request = [[YFWSocketImageUploadOperation alloc] init];
    
    [request reciveConnectHost:^{
        [request sendDataWithImage:image];
    }];
    [request reciveData:^(NSDictionary *response) {
        success(response);
    }];
    [request reciveError:^(NSError *error) {
        failure(error);
    }];
    [request connecteServer];
    
}
//RX图片请求
- (void)requestUploadImage:(id)image diskId:(int)diskid success:(void (^)(id))success failure:(void (^)(NSError *))failure{
  
  YFWSocketImageUploadOperation *request = [[YFWSocketImageUploadOperation alloc] init];
  request.diskid = diskid;
  [request reciveConnectHost:^{
    [request sendDataWithImage:image];
  }];
  [request reciveData:^(NSDictionary *response) {
    success(response);
  }];
  [request reciveError:^(NSError *error) {
    failure(error);
  }];
  [request connecteServer];
  
}

- (void)removeRequest{
  
  NSInteger maxCount = 30;
  CGFloat percent = 0.6;
  NSInteger removeCount = (NSInteger)maxCount * percent;
  
  if (self.marray.count > maxCount) {
    
    [self.lock lock];
    [self.marray removeObjectsInRange:NSMakeRange(0, removeCount)];
    [self.lock unlock];
    
  }
  
}


- (NSMutableArray *)marray{
  
  if (!_marray) {
    _marray = [NSMutableArray array];
  }
  
  return _marray;
}

- (NSLock *)lock{
  
  if (!_lock) {
    _lock = [[NSLock alloc] init];
  }
  
  return _lock;
}



@end
