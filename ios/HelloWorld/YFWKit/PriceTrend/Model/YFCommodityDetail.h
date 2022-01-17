//
//  YFCommodityDetail.h
//  YaoFang
//
//  Created by yaofangwang on 15/3/6.
//  Copyright (c) 2015年 yaofangwang. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface YFCommodityDetail : NSObject <PPModel>

@property (nonatomic, copy) NSString *commodityID;
@property (nonatomic, copy) NSString *ID;
@property (nonatomic, readonly) NSString *ID4Shop;
@property (nonatomic, readonly) NSString *shopID;
@property (nonatomic, readonly) BOOL sell;
@property (nonatomic, copy) NSString *authorizedCode;
@property (nonatomic, copy) NSString *title;//
@property (nonatomic, copy) NSString *region_name;//

@property (nonatomic, readonly) NSString *package_prompt_info;//包装更换提醒
@property (nonatomic, readonly) NSString *name;//通用名
@property (nonatomic, readonly) NSString *brand;//品牌
@property (nonatomic, readonly) NSString *nameEN;//英文
@property (nonatomic, readonly) NSString *quantity;//数量
@property (nonatomic, readonly) NSString *pinyin;//拼音
@property (nonatomic, readonly) NSString *expiryDate;//有效期
@property (nonatomic, copy) NSString *producer;//生产厂家
@property (nonatomic, readonly) NSString *form;//剂型

@property (nonatomic, readonly) NSArray *pinglunArray;
@property (nonatomic, readonly) NSArray *imagesURLStr;
@property (nonatomic, readonly) BOOL isRX;
@property (nonatomic, copy) NSString *price;
@property (nonatomic, readonly) NSString *originalPrice;
@property (nonatomic, readonly) NSString *discount; //折扣值
@property (nonatomic, readonly) NSInteger stockNum;
@property (nonatomic, readonly) NSString *shipmentPrice;
@property (nonatomic, readonly) NSInteger lbuy_no; //限购
@property (nonatomic, readonly) NSString *sendDuration;
@property (nonatomic, assign) BOOL isFavorite;
@property (nonatomic, readonly) NSArray *paymentMethod;
@property (nonatomic, readonly) NSString *vacation;
@property (nonatomic, strong) NSString *gongxiao; //功效
@property (nonatomic, readonly) NSString *pinglunshu; //评论数
@property (nonatomic, readonly) NSString *pinglunzongfen; //评论总分
@property (nonatomic, readonly) NSString *kehufuwu; //客户服务
@property (nonatomic, readonly) NSString *fahuosudu; //发货速度
@property (nonatomic, readonly) NSString *wuliusudu; //物流速度
@property (nonatomic, readonly) NSString *shangpinbaozhuang; //商品包装
@property (nonatomic, readonly) NSString *shangjiaLogo; //商家图片
@property (nonatomic, readonly) NSString *shangjiaTitle; //商家图片
@property (nonatomic, readonly) NSArray *shopmedicine_package;
@property (nonatomic, readonly) NSInteger cart_no_mid;//购物车中的数量
@property (nonatomic, strong) NSArray *shop_promotion;

@property (nonatomic, copy) NSString *recentUrl;

@property (nonatomic, copy) NSString *is_wireless_exclusive;//是否显示专享价

@property (nonatomic, copy) NSString *period_to;//有效期

@property (nonatomic, copy) NSString *phone;//商家电话

@property (nonatomic, assign) BOOL is_seckill;//是否秒杀单品

@property (nonatomic, copy) NSString *is_jump_login;//是否需要登录
@property (nonatomic, copy) NSString *is_jump_login_text;

@property (nonatomic, copy) NSString *discount_is_show;//折扣是否显示

@property (nonatomic, copy) NSString *avg_send_time; //平均发货时长
@property (nonatomic, copy) NSString *return_rate;   //退单率
@property (nonatomic, copy) NSString *is_show_transaction_related;//是否显示 发货时长和退单率

@property (nonatomic, assign) BOOL invite_img_show;
@property (nonatomic, copy) NSString *invite_url;

@property (nonatomic, copy) NSString *question_ask_count; //商品详情问答数量

@property (nonatomic, copy) NSString *compliance_prompt; //郑重承诺

@property (nonatomic, assign) BOOL rx_info_show;

@property (nonatomic, assign) BOOL advisory_button_show;

+ (instancetype)modelWithDic:(NSDictionary *)dic;

@end
