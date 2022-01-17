//
//  YFWSettingUtility.m
//  HelloWorld
//
//  Created by yfw-姜明均 on 2018/9/20.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "YFWSettingUtility.h"
#import "YFDateTimeGetter.h"
#import <UIKit/UIKit.h>
#import "QBTools.h"
#import "sys/utsname.h"
#include <ifaddrs.h>
#include <arpa/inet.h>
#include <net/if.h>


@implementation YFWSettingUtility

+ (void)openRatingsPageInAppStore{
  
  dispatch_async(dispatch_get_main_queue(), ^{
    NSURL *url = [NSURL URLWithString:@"https://itunes.apple.com/cn/app/%E8%8D%AF%E6%88%BF%E7%BD%91%E5%95%86%E5%9F%8E/id992334854?mt=8"];
    [[UIApplication sharedApplication] openURL:url];
  });
  
}

+ (void)toPraiseInAppStore{
  
  dispatch_async(dispatch_get_main_queue(), ^{
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:@"https://itunes.apple.com/cn/app/%E8%8D%AF%E6%88%BF%E7%BD%91%E5%95%86%E5%9F%8E/id992334854?mt=8&action=write-review"]];
  });
  
}


+ (void)toSetting{
  
  dispatch_async(dispatch_get_main_queue(), ^{
    NSURL *url = [NSURL URLWithString:UIApplicationOpenSettingsURLString];
    if ([[UIApplication sharedApplication] canOpenURL:url]) {
      if (@available(iOS 10.0, *)) {
        [[UIApplication sharedApplication] openURL:url options:@{} completionHandler:nil];
      } else {
        [[UIApplication sharedApplication] openURL:url];
      }
    }
  });
  
}


NSString * getSafeString(id object)
{
  NSString *string = nil;
  if ([object isKindOfClass:[NSNull class]]||object==nil) {
    string = @"";
  }else
  {
    string = [NSString stringWithFormat:@"%@",object];
  }
  return string;
}



+ (NSString *)getNetworkSpeedString{
  
  struct ifaddrs *ifa_list = 0, *ifa;
  if (getifaddrs(&ifa_list) == -1) {
    return 0;
  }
  uint32_t iBytes = 0;
  uint32_t oBytes = 0;
  for (ifa = ifa_list; ifa; ifa = ifa->ifa_next) {
    if (AF_LINK != ifa->ifa_addr->sa_family)
      continue;
    if (!(ifa->ifa_flags & IFF_UP) && !(ifa->ifa_flags & IFF_RUNNING))
      continue;
    if (ifa->ifa_data == 0)
      continue;
    /* Not a loopback device. */
    if (strncmp(ifa->ifa_name, "lo", 2)) {
      struct if_data *if_data = (struct if_data *)ifa->ifa_data;
      //下行
      iBytes += if_data->ifi_ibytes;
      //上行
      oBytes += if_data->ifi_obytes;
    }
  }
  freeifaddrs(ifa_list);
  //    NSLog(@"\n[getInterfaceBytes-Total]%@,%@",[QBTools formattedFileSize:iBytes/1024],[QBTools formattedFileSize:oBytes/1024]);
  
  return [NSString stringWithFormat:@"%@/S", [QBTools formattedFileSize:oBytes/1024]];
}

//获取设备IP地址
+(NSString *)getIPAddress{
  
  NSString *address = @"";
  struct ifaddrs *interfaces = NULL;
  struct ifaddrs *temp_addr = NULL;
  int success = 0;
  // 检索当前接口,在成功时,返回0
  success = getifaddrs(&interfaces);
  if (success == 0) {
    // 循环链表的接口
    temp_addr = interfaces;
    while(temp_addr != NULL) {
      if(temp_addr->ifa_addr->sa_family == AF_INET) {
        // 检查接口是否en0 wifi连接在iPhone上
        if([[NSString stringWithUTF8String:temp_addr->ifa_name] isEqualToString:@"en0"]) {
          // 得到NSString从C字符串
          address = [NSString stringWithUTF8String:inet_ntoa(((struct sockaddr_in *)temp_addr->ifa_addr)->sin_addr)];
        }
      }
      temp_addr = temp_addr->ifa_next;
    }
  }
  // 释放内存
  freeifaddrs(interfaces);
  return address;
  
}



+ (BOOL)isLocationServiceOpen {
  if ([ CLLocationManager authorizationStatus] == kCLAuthorizationStatusDenied) {
    return NO;
  } else
    return YES;
}

+ (NSString *)yfwDomain{
  
  if (currentTextType == YFWTextDefault || hasMedicineB) {
    
    NSString *domain = getSafeString([[NSUserDefaults standardUserDefaults] stringForKey:@"yfwDomain"]);
    
    
    if (domain.length > 0) {
      domain = [self removePointString:domain];
      return domain;
    }
    
    return YFWDomain;
    
  } else if(currentTextType == YFWTextHTTP){
    
    return @"yaofangwang.com";
    
  } else if (currentTextType == YFWTextTCP){
    
    return @"yaofangwang.com";
  }
  
  return YFWDomain;
  
}


+ (NSString *)removePointString:(NSString *)domain{
  
  if ([domain isKindOfClass:[NSString class]]) {
    NSString *firstString = [[domain substringFromIndex:0] substringToIndex:1];
    if ([firstString isEqualToString:@"."]) {
      domain = [[domain substringFromIndex:1] substringToIndex:domain.length -1];
    }
  }
  
  return domain;
}


/**
 *  截取URL中的参数
 *
 *  @return NSMutableDictionary parameters
 */
+ (NSMutableDictionary *)getURLParameters:(NSURL *)url {
  
  // 查找参数
  NSString *urlStr = url.relativeString;
  NSRange range = [urlStr rangeOfString:@"?"];
  if (range.location == NSNotFound) {
    return nil;
  }
  
  // 以字典形式将参数返回
  NSMutableDictionary *params = [NSMutableDictionary dictionary];
  
  // 截取参数
  NSString *parametersString = [urlStr substringFromIndex:range.location + 1];
  
  // 判断参数是单个参数还是多个参数
  if ([parametersString containsString:@"&"]) {
    
    // 多个参数，分割参数
    NSArray *urlComponents = [parametersString componentsSeparatedByString:@"&"];
    
    for (NSString *keyValuePair in urlComponents) {
      // 生成Key/Value
      NSArray *pairComponents = [keyValuePair componentsSeparatedByString:@"="];
      NSString *key = [pairComponents.firstObject stringByRemovingPercentEncoding];
      NSString *value = [pairComponents.lastObject stringByRemovingPercentEncoding];
      
      // Key不能为nil
      if (key == nil || value == nil) {
        continue;
      }
      
      id existValue = [params valueForKey:key];
      
      if (existValue != nil) {
        
        // 已存在的值，生成数组
        if ([existValue isKindOfClass:[NSArray class]]) {
          // 已存在的值生成数组
          NSMutableArray *items = [NSMutableArray arrayWithArray:existValue];
          [items addObject:value];
          
          [params setValue:items forKey:key];
        } else {
          
          // 非数组
          [params setValue:@[existValue, value] forKey:key];
        }
        
      } else {
        
        // 设置值
        [params setValue:value forKey:key];
      }
    }
  } else {
    // 单个参数
    
    // 生成Key/Value
    NSArray *pairComponents = [parametersString componentsSeparatedByString:@"="];
    
    // 只有一个参数，没有值
    if (pairComponents.count == 1) {
      return nil;
    }
    
    // 分隔值
    NSString *key = [pairComponents.firstObject stringByRemovingPercentEncoding];
    NSString *value = [pairComponents.lastObject stringByRemovingPercentEncoding];
    
    // Key不能为nil
    if (key == nil || value == nil) {
      return nil;
    }
    
    // 设置值
    [params setValue:value forKey:key];
  }
  
  return params;
}

+ (NSString *)URLDecodedString:(NSString *)str
{
  NSString *decodedString=(__bridge_transfer NSString *)CFURLCreateStringByReplacingPercentEscapesUsingEncoding(NULL, (__bridge CFStringRef)str, CFSTR(""), CFStringConvertNSStringEncodingToEncoding(NSUTF8StringEncoding));
  
  NSMutableString *jsonStr = decodedString.mutableCopy;
  NSRange range;
  range.location = 0;
  range.length = jsonStr.length;
  [jsonStr replaceOccurrencesOfString:@" " withString:@"" options:NSLiteralSearch range:range];
  range.location = 0;
  range.length = jsonStr.length;
  [jsonStr replaceOccurrencesOfString:@"\n" withString:@"" options:NSLiteralSearch range:range];
  range.location = 0;
  range.length = jsonStr.length;
  [jsonStr replaceOccurrencesOfString:@"\"" withString:@"\"" options:NSLiteralSearch range:range];
  NSMutableString *responseString = jsonStr;
  NSString *character = nil;
  for (int i = 0; i < responseString.length; i ++) {
    character = [responseString substringWithRange:NSMakeRange(i, 1)];
    if ([character isEqualToString:@"\\"])
      [responseString deleteCharactersInRange:NSMakeRange(i, 1)];
  }
  for (int i = 0; i < responseString.length; i ++) {
    character = [responseString substringWithRange:NSMakeRange(i, 1)];
    if ([character isEqualToString:@"\""])
      [responseString deleteCharactersInRange:NSMakeRange(i, 1)];
  }
  return responseString;
}


@end
