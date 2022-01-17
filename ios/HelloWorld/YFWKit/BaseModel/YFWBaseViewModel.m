//
//  YFWBaseViewModel.m
//  YaoFang
//
//  Created by 小猪猪 on 16/8/1.
//  Copyright © 2016年 SQC. All rights reserved.
//

#import "YFWBaseViewModel.h"

@implementation YFWBaseViewModel

- (void)getServiceData{

    self.errorBlock(nil);
}

- (id)init {
    self = [super init];
    if (!self) {
        return nil;
    }
    _tcp_sessionManager = [YFWSocketManager shareManager];
  
    return self;
}




@end
