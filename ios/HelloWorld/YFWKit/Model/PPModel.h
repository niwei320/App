//
//  PPModel.h
//  YaoFang
//
//  Created by yaofangwang on 15/3/15.
//  Copyright (c) 2015年 yaofangwang. All rights reserved.
//

#import <Foundation/Foundation.h>

@protocol PPModel <NSObject>

- (instancetype)initWithDic:(NSDictionary *)dic;
+ (instancetype)modelWithDic:(NSDictionary *)dic;

@end
