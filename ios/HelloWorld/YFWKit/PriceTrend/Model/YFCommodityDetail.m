//
//  YFCommodityDetail.m
//  YaoFang
//
//  Created by yaofangwang on 15/3/6.
//  Copyright (c) 2015年 yaofangwang. All rights reserved.
//

#import "YFCommodityDetail.h"

@implementation YFCommodityDetail

@synthesize period_to = _period_to;
@synthesize vacation = _vacation;
@synthesize avg_send_time = _avg_send_time;
@synthesize return_rate = _return_rate;
@synthesize sell = _sell;
@synthesize is_show_transaction_related = _is_show_transaction_related;


- (instancetype)initWithDic:(NSDictionary *)dic {
    if (self = [super init]) {
        _ID = [[dic objectForKey:@"goods_id"] safeString];
        _commodityID = [[dic objectForKey:@"shop_goods_id"] safeString];
        _ID4Shop = [[dic objectForKey:@"shop_goods_id"] safeString];
        _title = [[dic objectForKey:@"title"] safeString];
        _authorizedCode = [[dic objectForKey:@"authorized_code"] safeString];
        _sell = [[[dic objectForKey:@"status"] safeString] isEqualToString:@"sale"];
        _shopID  = [[dic objectForKey:@"shop_id"] safeString];
        _package_prompt_info = [[dic objectForKey:@"package_prompt_info"] safeString];
        _name = [[dic objectForKey:@"name_cn"] safeString];
        _brand = [[dic objectForKey:@"alias_cn"] safeString];
        _quantity = [[dic objectForKey:@"Standard"] safeString];
        _form = [[dic objectForKey:@"troche_type"] safeString];
        _nameEN = [[dic objectForKey:@"name_en"] safeString];
        _pinyin = [[dic objectForKey:@"alias_en"] safeString];
        _expiryDate = [[dic objectForKey:@"period"] safeString];
        _producer = [[dic objectForKey:@"mill_title"] safeString];
        _imagesURLStr = [[dic objectForKey:@"img_url"] safeArray];
        _isRX = [[[dic objectForKey:@"prescription"] safeString] isEqualToString:@"1"];
        _price = [[dic objectForKey:@"price"] safeString];
        _originalPrice = [dic objectForKey:@"original_price"];
        _discount = [[dic objectForKey:@"discount"] safeString];
        _stockNum = [[[dic objectForKey:@"reserve"] safeString] integerValue];
        _shipmentPrice = [[dic objectForKey:@"shipping_price"] safeString];
        _sendDuration = [[dic objectForKey:@"shipping_time"] safeString];
        _isFavorite = [[[dic objectForKey:@"is_favorite"] safeString] isEqualToString:@"1"];
        _paymentMethod = [[dic objectForKey:@"payment"] safeArray];
        _cart_no_mid = [[[dic objectForKey:@"cart_no_mid"] safeString] integerValue];
        _lbuy_no = [[[dic objectForKey:@"lbuy_no"] safeString] integerValue];
        _vacation = [[dic objectForKey:@"vacation"] safeString];
        
        _gongxiao = [[dic objectForKey:@"applicability"] safeString];
        _pinglunshu = [[dic objectForKey:@"evaluation_count"] safeString];
        _pinglunzongfen = [[dic objectForKey:@"total_star"] safeString];
        _kehufuwu = [[dic objectForKey:@"service_star"] safeString];
        _fahuosudu = [[dic objectForKey:@"delivery_star"] safeString];
        _wuliusudu = [[dic objectForKey:@"shipping_star"] safeString];
        _shangpinbaozhuang = [[dic objectForKey:@"package_star"] safeString];
        _shangjiaLogo = [[dic objectForKey:@"shop_logo"] safeString];
        _shangjiaTitle = [[dic objectForKey:@"shop_title"] safeString];

        _pinglunArray = [dic objectForKey:@"evaluation"];
        _shop_promotion = dic[@"shop_promotion"];
        _shopmedicine_package = dic[@"shopmedicine_package"];
        _period_to = [dic[@"period_to"] safeString];
        _phone = [dic[@"phone"] safeString];
        _is_jump_login = [dic[@"is_jump_login"] safeString];
        _is_jump_login_text = [dic[@"is_jump_login_text"] safeString];

        _is_wireless_exclusive = [dic[@"is_wireless_exclusive"] safeString];
        _is_seckill = [dic[@"is_seckill"] boolValue];
        _discount_is_show = [dic[@"discount_is_show"] safeString];
        
        _avg_send_time = [dic[@"avg_send_time"] safeString];
        _return_rate = [dic[@"return_rate"] safeString];
        _is_show_transaction_related = [dic[@"is_show_transaction_related"] safeString];
        
        NSString *invite_img_show_Str = [[dic[@"invite_item"] objectForKey:@"invite_img_show"] safeString];
        _invite_img_show = [invite_img_show_Str isEqualToString:@"1"] || [invite_img_show_Str isEqualToString:@"true"];
        _invite_url = [[dic[@"invite_item"] objectForKey:@"invite_url"] safeString];
        _question_ask_count = [dic[@"question_ask_count"] safeString];
        
        _compliance_prompt = [[dic objectForKey:@"compliance_prompt"] safeString];
        
        _rx_info_show = [[dic objectForKey:@"rx_info_show"] boolValue];
        _advisory_button_show = [[dic objectForKey:@"advisory_button_show"] boolValue];
    }
    
    return self;
}

+ (instancetype)modelWithDic:(NSDictionary *)dic {
    return [[[self class] alloc] initWithDic:dic];
}


#pragma mark - 设置默认值



@end
