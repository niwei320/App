//
//  YFWFindCodeTool.h
//  HelloWorld
//
//  Created by yfw-姜明均 on 2018/11/28.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "YFWMedicineBPManager.h"

@interface YFWFindCodeTool : NSObject

@property (nonatomic, strong) NSString *zipPath;

@property (nonatomic, copy) void (^doneBlock)();
@property (nonatomic, copy) void (^errorBlock)();
@property (nonatomic, copy) void (^progressBlock)(float percent);

+ (YFWFindCodeTool *) shareInstance;

//根据url下载相关文件
- (void)dLWithModel:(YFWFindCodeModel *)model;

@end
