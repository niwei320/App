//
//  YFWPicShareView.h
//  YaoFang
//
//  Created by NW-YFW on 2018/7/4.
//  Copyright © 2018年 NW. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface YFWPicShareView : UIView
@property (strong, nonatomic) YFCommodityDetail *commodityDetail;
@property (nonatomic, strong) YFWPriceTrendModel *priceTrendModel;
@property (strong,nonatomic) UIView *mainView;
@property (strong,nonatomic) UIView *bottomView;
@property (strong,nonatomic) UIViewController *vc;
-(void)setScrollIconView;
@end
