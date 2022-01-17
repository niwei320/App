//
//  JDPayBase64.h
//  JDPayFoundation
//
//  Created by dongkui on 06/21/18.
//  Copyright © 2018 dongkui. All rights reserved.
//

#ifndef JDPayBase64_h
#define JDPayBase64_h

#import <Foundation/Foundation.h>

__BEGIN_DECLS

#pragma mark - Encode

/**
 Encode data to base64 string
 
 @param data The source data
 @return The encoded base64 string
 */
extern NSString *JDPayBase64_encodeData(NSData *data);

/**
 Encode str to base64 encoded string using the specific encoding for str.
 
 @param str The source string.
 @param enc The encoding algorithm you want to use for str.
 @return The encoded base64 string
 */
extern NSString *JDPayBase64_encodeStringWithEncoding(NSString *str, NSStringEncoding enc);

/**
 Encode str to base64 encoded string using NSUTF8StringEncoding for str.
 
 @param str The source string.
 @return The encoded base64 string.
 */
extern NSString *JDPayBase64_encodeString(NSString *str);

#pragma mark - Decode

/**
 Decode base64EncodedData to data.
 
 @param base64EncodedData The source data.
 @return The decoded data.
 */
extern NSData *JDPayBase64_decodeBase64EncodedData(NSData *base64EncodedData);

/**
 Decode base64EncodedData to string. This method will decode base64EncodedData to plain decodedData, and then convert
 the decodedData to string by using specific string encoding.
 
 @param base64EncodedData The source data.
 @param enc The encoding algorithm you want to use for converting decoded data to string.
 @return The decoded string
 */
extern NSString *JDPayBase64_stringByDecodingBase64EncodedDataWithEncoding(NSData *base64EncodedData, NSStringEncoding enc);

/**
 Decode base64EncodedData to string. This method will decode base64EncodedData to plain decodedData, and then convert the
 decodedData to string by using NSUTF8StringEncoding.
 
 @param base64EncodedData The source data.
 @return The decoded string
 */
extern NSString *JDPayBase64_stringByDecodingBase64EncodedData(NSData *base64EncodedData);

/**
 Decode base64EncodedString to data.
 
 @param base64EncodedString The source base64 encoded string.
 @return The decoded data.
 */
extern NSData *JDPayBase64_decodeBase64EncodedString(NSString *base64EncodedString);

/**
 Decode base64EncodedString to plain string. This method will decode base64EncodedString to plain decodedData, and then
 convert the decodedData to string by using specific string encoding.
 
 @param base64EncodedString The source base64 encoded string.
 @param enc The encoding algorithm you want to use for converting decoded data to string.
 @return The decoded plain string
 */
extern NSString *JDPayBase64_stringByDecodingBase64EncodedStringWithEncoding(NSString *base64EncodedString, NSStringEncoding enc);

/**
 Decode base64EncodedString to plain string. This method will decode base64EncodedString to plain decodedData, and then
 convert the decodedData to string by using NSUTF8StringEncoding.
 
 @param base64EncodedString The source base64 encoded string.
 @return The decoded plain string
 */
extern NSString *JDPayBase64_stringByDecodingBase64EncodedString(NSString *base64EncodedString);

__END_DECLS

#endif /* JDPayBase64_h */
