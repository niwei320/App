//
//  NSError+PPError.m
//  PP1717Wan
//
//  Created by yaofangwang on 14/11/16.
//  Copyright (c) 2014年 yaofangwang. All rights reserved.
//

#import "NSError+PPError.h"

NSString *const PPErrorDomain = @"PPErrorDomain";

NSString * const PPErrorUserInfoKeyServerCode = @"PPErrorUserInfoKeyServerCode";
NSString * const PPErrorUserInfoKeyMsg = @"PPErrorUserInfoKeyServerMsg";
NSString * const PPErrorUserInfoKeyDescription = @"PPErrorUserInfoKeyDescription";
NSString * const PPErrorUserInfoKeyURL = @"PPErrorUserInfoKeyURL";
NSString * const PPErrorUserInfoKeyContent = @"PPErrorUserInfoKeyContent";

@implementation NSError (PPError)

+ (NSError *)pp_cryptFailErrorWithContent:(NSString *)content {
    NSParameterAssert(content);
    NSDictionary *userInfo = nil;
    if (content) {
        userInfo = @{PPErrorUserInfoKeyContent : content,
                     PPErrorUserInfoKeyMsg : @"对不起，数据加密出错！"};
    }
    return [NSError errorWithDomain:PPErrorDomain code:PPErrorCodeCryptFail userInfo:userInfo];
}

+ (NSError *)pp_decryptFailErrorWithContent:(NSString *)content {
    NSParameterAssert(content);
    NSDictionary *userInfo = nil;
    if (content) {
        userInfo = @{PPErrorUserInfoKeyContent : content,
                     PPErrorUserInfoKeyMsg : @"对不起，数据解密出错！"};
    }
    return [NSError errorWithDomain:PPErrorDomain code:PPErrorCodeDecryptFail userInfo:userInfo];
}

+ (NSError *)pp_parserFaillErrorWithURLString:(NSString *)URLString content:(id)content Exception:(NSException *)exception {
    NSParameterAssert(URLString);
    NSParameterAssert(content);
    NSDictionary *userInfo = nil;
    if (URLString && content) {
        userInfo = [NSDictionary dictionaryWithObjectsAndKeys:
                    URLString, PPErrorUserInfoKeyURL,
                    content, PPErrorUserInfoKeyContent,
                    @"数据解析时出错！", PPErrorUserInfoKeyMsg,
                    exception.description, PPErrorUserInfoKeyDescription, nil];
    }
    
    return [NSError errorWithDomain:PPErrorDomain code:PPErrorCodeContentParserFail userInfo:userInfo];
}


+ (NSError *)pp_serverReturnErrorWithCode:(NSInteger)code msg:(NSString *)msg content:(id)content URLString:(NSString *)URLString {
    NSParameterAssert(code);
    NSParameterAssert(msg);
    NSParameterAssert(URLString);
    
    NSDictionary *userInfo = nil;
    if (URLString && msg && code) {
        userInfo = [NSDictionary dictionaryWithObjectsAndKeys:
                    URLString, PPErrorUserInfoKeyURL,
                    msg, PPErrorUserInfoKeyMsg,
                    [NSNumber numberWithInteger:code], PPErrorUserInfoKeyServerCode,
                    @"服务器返回一个错误", PPErrorUserInfoKeyDescription,
                    content, PPErrorUserInfoKeyContent, nil];
    }
    
    return [NSError errorWithDomain:PPErrorDomain code:PPErrorCodeServerReturnError userInfo:userInfo];
}

- (BOOL)pp_isPPError {
    return [self.domain isEqualToString:PPErrorDomain];
}

@end
