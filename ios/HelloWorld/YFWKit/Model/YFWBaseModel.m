//
//  YFWBaseModel.m
//  YaoFang
//
//  Created by 孙启超 on 2017/2/22.
//  Copyright © 2017年 ospreyren. All rights reserved.
//

#import "YFWBaseModel.h"

@implementation YFWBaseModel

+ (instancetype)modelWithDic:(NSDictionary *)dic {
    return [[[self class] alloc] initWithDic:dic];
}

- (id)valueForUndefinedKey:(NSString *)key{
    
    [super valueForUndefinedKey:key];
    
    return nil;
}

- (void)setValue:(id)value forUndefinedKey:(NSString *)key{
    
    
}

@end
