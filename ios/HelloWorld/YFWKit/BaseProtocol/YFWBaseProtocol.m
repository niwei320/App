//
//  YFWBaseProtocol.m
//  YaoFang
//
//  Created by 小猪猪 on 16/7/29.
//  Copyright © 2016年 SQC. All rights reserved.
//

#import "YFWBaseProtocol.h"

@implementation YFWBaseProtocol

- (instancetype)initWithController:(UIViewController *)controller
{
    self = [super init];
    if (self) {
        self.superController = controller;
    }
    return self;
}

@end
