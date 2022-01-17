//
//  YFWBaseModel.h
//  YaoFang
//
//  Created by 孙启超 on 2017/2/22.
//  Copyright © 2017年 ospreyren. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface YFWBaseModel : NSObject
- (instancetype)initWithDic:(NSDictionary *)dic;
+ (instancetype)modelWithDic:(NSDictionary *)dic;

@end
