//
//  YFWShareView.h
//  YaoFang
//
//  Created by yfw－iMac on 16/5/11.
//  Copyright © 2016年 SQC. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "ShareView.h"
#import "YFWPriceTrendModel.h"

@interface YFWShareView : NSObject

@property (strong, nonatomic) ShareView *shareView;
@property (copy, nonatomic) NSString *shareUrlString;
@property (copy, nonatomic) NSString *sharetitleString;
@property (copy, nonatomic) NSString *sharetitleString_wx;

@property (copy, nonatomic) NSString *sinaContentString;
@property (copy, nonatomic) NSString *qqfContentString;
@property (copy, nonatomic) NSString *qqsContentString;
@property (copy, nonatomic) NSString *wxfContentString;
@property (copy, nonatomic) NSString *wxsContentString;
@property (assign, nonatomic) BOOL is_show_topview;
@property (strong, nonatomic) NSArray *isShowArray;
@property (assign, nonatomic) BOOL is_share_pic;
@property (strong, nonatomic) UIImage *shareImage;

@property (weak, nonatomic) UIViewController *controller;
@property (strong, nonnull) YFCommodityDetail *commodityDetail;
@property (nonatomic, strong) YFWPriceTrendModel *priceTrendModel;
+ (YFWShareView *)sharedInstance;
- (void)addShareView;

- (void)initShareView;

- (void)setShareTextWithUserCenter;
- (void)setShareTextWithURL:(NSString *)url;
- (void)setShareTextDetail:(NSString *)title image:(UIImage *)image good_id:(NSString *)good_id;
- (void)setShareTextBiJia:(NSString *)title image:(UIImage *)image good_id:(NSString *)good_id;
- (void)setShareURL:(NSString *)title image:(UIImage *)image desc:(NSString *)desc urlstring:(NSString *)url;
- (void)setShareURL_zixun:(NSString *)title image:(UIImage *)image desc:(NSString *)desc urlstring:(NSString *)url;
@end
