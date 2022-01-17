//
//  YFWBaseDelegate.h
//  YaoFang
//
//  Created by 小猪猪 on 16/7/29.
//  Copyright © 2016年 SQC. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "YFWBaseProtocol.h"

@interface YFWBaseDelegate : YFWBaseProtocol <UITableViewDelegate>


@property (assign, nonatomic) float heightForRow;
@property (assign, nonatomic) float heightForHeader;
@property (assign, nonatomic) float heightForFooter;

- (instancetype)initWithController:(UIViewController *)controller rowHeight:(float)height;

@end
