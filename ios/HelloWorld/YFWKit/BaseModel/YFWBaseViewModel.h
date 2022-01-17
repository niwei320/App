//
//  YFWBaseViewModel.h
//  YaoFang
//
//  Created by 小猪猪 on 16/8/1.
//  Copyright © 2016年 SQC. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "YFWSocketManager.h"

typedef void (^ReturnValueBlock) (id returnValue);
typedef void (^ErrorCodeBlock) (id errorCode);
typedef void (^NoMoreDataBlock) ();

@interface YFWBaseViewModel : NSObject

@property (nonatomic, copy) ReturnValueBlock returnBlock;
@property (nonatomic, copy) ErrorCodeBlock errorBlock;
@property (nonatomic, copy) NoMoreDataBlock noMoreData;

@property (nonatomic, strong) YFWSocketManager *tcp_sessionManager;
@property (nonatomic, weak) UIViewController *superController;

- (void)getServiceData;

@end
