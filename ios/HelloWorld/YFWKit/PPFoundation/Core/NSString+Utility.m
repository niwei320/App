//
//  NSString+UrlUtiliy.m
//  PP1717Wan
//
//  Created by yaofangwang on 14/11/5.
//  Copyright (c) 2014年 yaofangwang. All rights reserved.
//

#import "NSString+Utility.h"
#import "PPUtilly.h"

@implementation NSString (Utility)

+ (NSString *)pp_URLStringWithBase:(NSString *)baseUrlStr params:(NSDictionary *)params {
    NSParameterAssert(params);
    
    NSMutableString *urlString = [NSMutableString stringWithString:baseUrlStr ? : @""];
    
    if (![urlString hasSuffix:@"?"]) {
        [urlString appendString:@"?"];
    }
    
    for (int i = 0; i < [params count]; i++) {
        NSString *key = [[params allKeys] objectAtIndex:i];
        NSObject *value = [params objectForKey:key];
        [urlString appendFormat:@"%@=%@", key, [value isKindOfClass:[NSString class]] ? [(NSString *)value pp_UTF8URLEncodeString] : value];
        if (i < ([params count] - 1)) {
            [urlString appendString:@"&"];
        }
    }
    
    return [NSString stringWithString:urlString];
}

- (NSDictionary *)pp_getUrlStrParams {
    NSArray *components = [self componentsSeparatedByString:@"?"];
    if ([components count] != 2) {
        return nil;
    }
    
    NSArray *paramsStrArray = [[components lastObject] componentsSeparatedByString:@"&"];
    NSMutableDictionary *params = [NSMutableDictionary dictionaryWithCapacity:[paramsStrArray count]];
    for (NSString *paramStr in paramsStrArray) {
        NSArray *paramComponents = [paramStr componentsSeparatedByString:@"="];
        if ([paramComponents count] == 2) {
            [params setObject:[paramComponents lastObject] forKey:[paramComponents objectAtIndex:0]];
        }
    }
    
    return [NSDictionary dictionaryWithDictionary:params];
}

- (NSString *)pp_pinyinString {
    NSMutableString *str = [NSMutableString stringWithString:self];
    if (CFStringTransform((__bridge CFMutableStringRef)str, 0, kCFStringTransformMandarinLatin, NO) &&
        CFStringTransform((__bridge CFMutableStringRef)str, 0, kCFStringTransformStripDiacritics, NO)) {
        return [NSString stringWithString:str];
    } else {
        return nil;
    }
}

- (NSString *)pp_UTF8URLEncodeString {
    return (__bridge_transfer NSString *)CFURLCreateStringByAddingPercentEscapes(NULL,
                                                                                 (CFStringRef)[self mutableCopy],
                                                                                 NULL,
                                                                                 CFSTR("￼=,!$&'()*+;@?\n\"<>#\t :/"),
                                                                                 kCFStringEncodingUTF8) ;
}

- (NSString *)pp_UTF8URLDecodeString
{
    return [[self stringByReplacingOccurrencesOfString:@"+" withString:@" "]
            stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
}

- (BOOL)pp_isEmail {
    NSString *emailRegex = @"[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}";
    NSPredicate *emailTest = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", emailRegex];
    return [emailTest evaluateWithObject:self];
}

- (BOOL)pp_isPhoneNumber {
    
    NSString * format = @"^[0-9]{11}$";
    NSPredicate *regextest = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", format];
    
    if ([regextest evaluateWithObject:self] == YES) {
        return YES;
    }
    
    return NO;
}

//判断是否含有汉字
//UTF8编码：汉字占3个字节，英文字符占1个字节
- (BOOL)pp_hasChinese{
    
    for (int i=0; i<self.length; ++i)
    {
        NSRange range = NSMakeRange(i, 1);
        NSString *subString = [self substringWithRange:range];
        const char    *cString = [subString UTF8String];
        if (strlen(cString) == 3)
        {
            return YES;
        }

    }
    return NO;
}

- (BOOL)pp_isIDCard{
    
    NSString * format = @"(^\\d{15}$)|(^\\d{17}([0-9]|X)$)";
    NSPredicate *regextest = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", format];
    
    if ([regextest evaluateWithObject:self] == YES) {
        return YES;
    }
    
    return NO;
}


//判断是否为固话
- (BOOL)pp_isFixedTelephone{
    
    NSString * format = @"^((\\d{7,8})|((0)[2-9]{1}\\d{2}|((010)|(02)\\d{1}))(\\d{7,8})|((0)[2-9]{1}\\d{2}|((010)|(02)\\d{1}))(\\d{7,8})(\\d{4}|\\d{3}|\\d{2})|(\\d{7,8})(\\d{4}|\\d{3}|\\d{2}))$";
    NSPredicate *regextest = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", format];
    
    if ([regextest evaluateWithObject:self] == YES) {
        return YES;
    }
    return NO;
}

//判断姓名格式
-(BOOL)pp_realName{

    NSString * format = @"^([\u4E00-\u9FA5]+|[a-zA-Z]+)$";
    NSPredicate *regextest = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", format];
    
    if ([regextest evaluateWithObject:self] == YES) {
        return YES;
    }
    
    return NO;
}

//判断是否有emoji
-(BOOL)pp_containsEmoji
{
    __block BOOL returnValue = NO;
    NSString *string = self;
    [string enumerateSubstringsInRange:NSMakeRange(0, [string length])
                               options:NSStringEnumerationByComposedCharacterSequences
                            usingBlock:^(NSString *substring, NSRange substringRange, NSRange enclosingRange, BOOL *stop) {
                                const unichar high = [substring characterAtIndex: 0];
                                
                                // Surrogate pair (U+1D000-1F9FF)
                                if (0xD800 <= high && high <= 0xDBFF) {
                                    const unichar low = [substring characterAtIndex: 1];
                                    const int codepoint = ((high - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
                                    
                                    if (0x1D000 <= codepoint && codepoint <= 0x1F9FF){
                                        returnValue = YES;
                                    }
                                    
                                    // Not surrogate pair (U+2100-27BF)
                                } else {
                                    if (0x2100 <= high && high <= 0x27BF){
                                        returnValue = YES;
                                    }
                                }
                            }];
    
    return returnValue;
}


+ (NSString *)pp_timeStringWith:(NSTimeInterval)timeInterval {
    int hours = timeInterval/PP_SECONDS_PER_HOUR;
    int minutes = (((int)timeInterval)%PP_SECONDS_PER_HOUR)/PP_SECONDS_PER_MINUTE;
    int seconds = ((int)timeInterval)%PP_SECONDS_PER_MINUTE;
    if (hours) {
        return [NSString stringWithFormat:@"%d:%02d:%02d", hours, minutes, seconds];
    } else {
        return [NSString stringWithFormat:@"%02d:%02d", minutes, seconds];
    }
}

+ (NSString *)pp_timeStringFromNowWith:(NSDate *)date {
    NSTimeInterval timeInterval = [[NSDate date] timeIntervalSinceDate:date];
    if (timeInterval < PP_SECONDS_PER_MINUTE) {
        return @"刚刚";
    } else if (timeInterval < PP_SECONDS_PER_HOUR) {
        return [NSString stringWithFormat:@"%d分钟前", (int)timeInterval/PP_SECONDS_PER_MINUTE];
    } else if (timeInterval < PP_SECONDS_PER_DAY) {
        return [NSString stringWithFormat:@"%d小时前", (int)timeInterval/PP_SECONDS_PER_HOUR];
    } else {
        NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
        [dateFormatter setDateFormat:@"yyyy年MM月dd日 HH:ss"];
        return [dateFormatter stringFromDate:date];
    }
}


//去除表情符号
- (NSString *)disable_emoji
{
    NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern:@"[^\\u0020-\\u007E\\u00A0-\\u00BE\\u2E80-\\uA4CF\\uF900-\\uFAFF\\uFE30-\\uFE4F\\uFF00-\\uFFEF\\u0080-\\u009F\\u2000-\\u201f\r\n]" options:NSRegularExpressionCaseInsensitive error:nil];
    NSString *modifiedString = [regex stringByReplacingMatchesInString:self
                                                               options:0
                                                                 range:NSMakeRange(0, [self length])
                                                          withTemplate:@""];
    return modifiedString;
}


@end
