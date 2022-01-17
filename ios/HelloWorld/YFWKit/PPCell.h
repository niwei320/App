//
//  PPCellProtocol.h
//  YaoFang
//
//  Created by yaofangwang on 15/2/25.
//  Copyright (c) 2015年 yaofangwang. All rights reserved.
//

#import <Foundation/Foundation.h>

@protocol PPCell <NSObject>

@property (nonatomic, strong) id object;
@property (nonatomic, assign) BOOL isShowMosaicPic;
@optional

+ (CGFloat)cellHeghtWithObject:(id)object;

@end
