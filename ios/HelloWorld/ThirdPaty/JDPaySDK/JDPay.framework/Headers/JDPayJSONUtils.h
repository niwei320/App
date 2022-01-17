//
//  JDPayJSONUtils.h
//  SFFoundation
//
//  Created by dongkui on 2019/5/12.
//  Copyright © 2019 dongkui. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

#pragma mark - NSObject (JDPayJSON)
@interface NSObject (JDPayJSON)

/**
 Convert current object to JSON data with options.
 */
- (nullable NSData *)jdp_toJSONDataWithOptions:(NSJSONWritingOptions)options error:(NSError **)error;

/**
 Convert current object to compact data JSON data, which can reduce the size of the result data.
 */
- (nullable NSData *)jdp_toJSONData;

/**
 Convert current object to JSON string with options.
 */
- (nullable NSString *)jdp_toJSONStringWithOptions:(NSJSONWritingOptions)options error:(NSError **)error;

/**
 Convert current object to compact data JSON string, which can reduce the size of the result string.
 */
- (nullable NSString *)jdp_toJSONString;

@end

#pragma mark - NSData (JDPayJSON)
@interface NSData (JDPayJSON)

- (nullable id)jdp_toJSONObjectWithOptions:(NSJSONReadingOptions)options error:(NSError **)error;

- (nullable id)jdp_toJSONObject;

@end

#pragma mark - NSString (JDPayJSON)
@interface NSString (JDPayJSON)

- (nullable id)jdp_toJSONObjectWithOptions:(NSJSONReadingOptions)options error:(NSError **)error;

- (nullable id)jdp_toJSONObject;

@end

NS_ASSUME_NONNULL_END
