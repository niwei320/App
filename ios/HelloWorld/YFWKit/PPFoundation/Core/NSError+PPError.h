//
//  NSError+PPError.h
//  PP1717Wan
//
//  Created by yaofangwang on 14/11/16.
//  Copyright (c) 2014年 yaofangwang. All rights reserved.
//

#import <Foundation/Foundation.h>

FOUNDATION_EXPORT NSString *const PPErrorDomain;

/**
 @brief 在error的userInfo中保存务器返回状态code的Key
 */
FOUNDATION_EXPORT NSString * const PPErrorUserInfoKeyServerCode;

/**
 @brief 在error的userInfo中保存向用户展示错误提示信息的Key
 */
FOUNDATION_EXPORT NSString * const PPErrorUserInfoKeyMsg;

/**
 @brief 在error的userInfo中保存问题描述信息的Key
 */
FOUNDATION_EXPORT NSString * const PPErrorUserInfoKeyDescription;

/**
 @brief 如果是跟URL有关的Error,这个key可以取到相关URL
 */
FOUNDATION_EXPORT NSString * const PPErrorUserInfoKeyURL;

/**
 @brief 在error的userInfo中保存相关内容信息的Key
 */
FOUNDATION_EXPORT NSString * const PPErrorUserInfoKeyContent;

enum {
    PPErrorCodeContentParserFail = 1001,//内容无法正常解析
    PPErrorCodeServerReturnError = 1002,//服务器按照约定格式返回一个错误信息
    
    PPErrorCodeCryptFail = 1003,//加密时发生错误
    PPErrorCodeDecryptFail = 1004,//解密时发生错误
};

@interface NSError (PPError)

/**
 @brief 数据加密时的错误
 */
+ (NSError *)pp_cryptFailErrorWithContent:(NSString *)content;

/**
 @brief 数据解密时的错误
 */
+ (NSError *)pp_decryptFailErrorWithContent:(NSString *)content;

/**
 @brief 数据解析时的错误
 */
+ (NSError *)pp_parserFaillErrorWithURLString:(NSString *)URLString content:(id)content Exception:(NSException *)exception;

/**
 @brief 服务器返回的错误，kPPErrorUserInfoKeyServerCode，kPPErrorUserInfoKeyServerMsg
 @return 返回error的userInfo可用kPPErrorUserInfoKeyServerCode，kPPErrorUserInfoKeyServerMsg为key取到响应的对象
 */
+ (NSError *)pp_serverReturnErrorWithCode:(NSInteger)code msg:(NSString *)msg content:(id)content URLString:(NSString *)URLString;

/**
 @brief 判断是否是由此类别生成的Error
 */
- (BOOL)pp_isPPError;

@end
