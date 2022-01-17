//
//  YFShop.m
//  YaoFang
//
//  Created by yaofangwang on 15/1/28.
//  Copyright (c) 2015年 yaofangwang. All rights reserved.
//

#import "YFShop.h"

@implementation YFShop

- (instancetype)initWithDic:(NSDictionary *)dic {
    if (self = [super init]) {
        _ID = [[dic objectForKey:@"id"] safeString];
        if ([_ID length] == 0) {
            _ID = [[dic objectForKey:@"shop_id"] safeString];
        }
        _name = [[dic objectForKey:@"title"] safeString];
        if ([_name length] == 0)
        {
            _name = [[dic objectForKey:@"shop_title"] safeString];
        }
        
        _phoneNumber = [[dic objectForKey:@"phone"] safeString];
        _address = [[dic objectForKey:@"address"] safeString];
        _isSigned = [[dic objectForKey:@"contract"] boolValue];
        _rate = [[dic objectForKey:@"star"] floatValue];
        _coordinate = CLLocationCoordinate2DMake([[dic objectForKey:@"latitude"] doubleValue],
                                                     [[dic objectForKey:@"longitude"] doubleValue]);
        _distance = [[dic objectForKey:@"distance"] safeString];
        _shopImage = [[dic objectForKey:@"intro_image"] safeString];
        _shopImage_m = [[dic objectForKey:@"logo_img_url"] safeString];


    }
    
    return self;
}

- (instancetype)initWithTcpDic:(NSDictionary *)dic{
  
  if (self = [super init]) {
    
    _ID = [[dic objectForKey:@"id"] safeString];
    _name = [[dic objectForKey:@"title"] safeString];
    _phoneNumber = [[dic objectForKey:@"phone"] safeString];
    _address = [[dic objectForKey:@"address"] safeString];
    _isSigned = YES;
    _rate = [[dic objectForKey:@"evaluation_star_sum"] floatValue];
    _coordinate = CLLocationCoordinate2DMake([[dic objectForKey:@"Lat"] doubleValue],
                                             [[dic objectForKey:@"Lng"] doubleValue]);
    _distance = [[dic objectForKey:@"distance"] safeString];
    NSString *image_url = [[dic objectForKey:@"logo_image"] safeString];
    _shopImage = [self resetImageUrl:image_url];
    _shopImage_m = [self resetImageUrl:image_url];
    
  }
  
  return self;
}


- (NSString *)resetImageUrl:(NSString *)url
{
  
  BOOL is_tcp = [[NSUserDefaults standardUserDefaults] boolForKey:@"UseTCP"];
  
  if (is_tcp) {
    if (url.length==0) {
      return url;
    }
    if ([url containsString:@"assets"]) {
      return url;
    }
    //手机本地图片
    if ([url containsString:@"Library/Developer"] || [url containsString:@"mobile/Containers"]) {
      return url;
    }
    
    NSString *result = url;
    if ([url rangeOfString:@"%7C"].length>0) {
      NSArray *arr = [result componentsSeparatedByString:@"%7C"];
      url = [arr lastObject];
    }
    
    if ([url containsString:@"yaofangwang"]) {
      result = [url stringByReplacingOccurrencesOfString:@"https" withString:@"http"];
    }else if (![url containsString:@"http"])
    {
      url = [url stringByReplacingOccurrencesOfString:@"file://" withString:@""];
      NSString *cdn_url = [[NSUserDefaults standardUserDefaults] stringForKey:@"yfwCdnUrl"];
      result = [NSString stringWithFormat:@"http:%@/%@",cdn_url,url];
//      result = [NSString stringWithFormat:@"http://c2.%@/%@",[YFWSettingUtility yfwDomain],url];
      
    }
    if ([url containsString:@"default"]) {
      result = [result stringByReplacingOccurrencesOfString:@"_300x300.jpg" withString:@""];
    }
    return result;
  }
  
  return url;
  
}


@end
