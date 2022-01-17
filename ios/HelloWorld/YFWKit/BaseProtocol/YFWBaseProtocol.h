//
//  YFWBaseProtocol.h
//  YaoFang
//
//  Created by 小猪猪 on 16/7/29.
//  Copyright © 2016年 SQC. All rights reserved.
//

#import <Foundation/Foundation.h>

typedef void (^TableDeleteBlock) (id indexPath);

@interface YFWBaseProtocol : NSObject

@property (weak, nonatomic) UIViewController *superController;

@property (strong, nonatomic) NSMutableArray *dataArray;

@property (strong, nonatomic) NSMutableArray *reuseArray;

@property (copy ,nonatomic) TableDeleteBlock deleteBlock;

- (instancetype)initWithController:(UIViewController *)controller;

@end
