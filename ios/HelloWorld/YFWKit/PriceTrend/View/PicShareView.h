//
//  PicShareView.h
//  YaoFang
//
//  Created by NW-YFW on 2018/6/14.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface PicShareView : UIView
@property (weak, nonatomic) IBOutlet UIView *mainView;
@property (strong, nonatomic) YFCommodityDetail *commodityDetail;

+ (PicShareView *)getPicShareView;

@end

