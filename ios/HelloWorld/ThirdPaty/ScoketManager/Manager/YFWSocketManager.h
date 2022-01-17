//
//  YFWSocketManager.h
//  ScoketManager
//
//  Created by 姜明均 on 2018/1/18.
//  Copyright © 2018年 ios. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface YFWSocketManager : NSObject

///单例
+ (instancetype)shareManager;

//请求链接
- (void)requestParameters:(id)parameters
                  success:(void (^)(id responseObject))success
                  failure:(void (^)( NSError *error))failure;

//请求异步链接
- (void)requestAsynParameters:(id)parameters
                      success:(void (^)(id responseObject))success
                      failure:(void (^)( NSError *error))failure;

//数据图片请求
- (void)requestUploadImage:(id)image
                   success:(void (^)(id))success
                   failure:(void (^)(NSError *))failure;
- (void)requestUploadImage:(id)image
                    diskId:(int)diskid
                   success:(void (^)(id))success
                   failure:(void (^)(NSError *))failure;

@end
