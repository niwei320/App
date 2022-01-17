//
//  YFWBaseDataSource.h
//  YaoFang
//
//  Created by 小猪猪 on 16/7/29.
//  Copyright © 2016年 SQC. All rights reserved.
//

#import <Foundation/Foundation.h>

#import "YFWBaseProtocol.h"

@interface YFWBaseDataSource : YFWBaseProtocol<UITableViewDataSource>


@property (assign, nonatomic) int numSection;
@property (assign, nonatomic) int numRow;


@end
