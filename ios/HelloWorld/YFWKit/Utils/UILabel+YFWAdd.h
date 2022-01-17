//
//  UILabel+YFWAdd.h
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/19.
//  Copyright © 2018年 NW. All rights reserved.
//

#import <UIKit/UIKit.h>

typedef NS_ENUM(NSInteger,YFWBoxImageType)
{
    YFWBoxImageDefaultType,
    YFWBoxImageOrangeBGType,
    
};

@interface UILabel (YFWAdd)

///尾部添加边框标记
- (void)addTitle:(NSString *)title tagBoxToLast:(NSString *)tag;

///尾部添加边框标记 - 含类型
- (void)addTitle:(NSString *)title tagBoxToLast:(NSString *)tag Type:(YFWBoxImageType)type;

///文字添加马赛克效果
- (void)setMosaicTitle:(NSString *)title;

- (void)setMosaicTitle:(NSString *)title Level:(NSInteger)level;


@end
