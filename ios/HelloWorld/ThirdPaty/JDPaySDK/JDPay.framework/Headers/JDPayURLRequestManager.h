//
//  JDPayURLRequestManager.h
//  JDPayFoundation
//
//  Created by dongkui on 24/07/2017.
//  Copyright © 2017 jd. All rights reserved.
//

#import <Foundation/Foundation.h>

#ifndef _JDPAY_URL_REQUEST_MANAGER_H_
#define _JDPAY_URL_REQUEST_MANAGER_H_

NS_ASSUME_NONNULL_BEGIN

#pragma mark - JDPayURLRequestError
typedef NS_ENUM(NSInteger, JDPayURLRequestError) {
    JDPayURLRequestErrorBadURL      = NSURLErrorBadURL,
    JDPayURLRequestErrorCancelled   = NSURLErrorCancelled,
};

#pragma mark - JDPayURLRequest
@interface JDPayURLRequest : NSObject

@property (nonatomic, strong, readonly) NSString *uuid; // the unique identity
@property (nonatomic, copy) NSString *URLString; // URL
@property (nonatomic, copy) NSString *HTTPMethod; // HTTP Method, POST Or GET
@property (nonatomic, assign) NSTimeInterval timeoutInterval; // timeout time interval in second, Defaults to 60 seconds.
@property (nonatomic, copy) NSDictionary<NSString *, NSString *> *HTTPHeaders; // HTTP headers
@property (nonatomic, copy) NSData *HTTPBody; // HTTP post body, only for HTTP POST method.

/**
 Set default time out value for a kind of sub class of JDPayURLRequest.
 
 @Note If you do not set, the default time out value is 1 minute.
 */
+ (BOOL)setDefaultTimeout:(NSTimeInterval)timeInterval forRequestWithClassName:(NSString *)className;

@end

#pragma mark - JDPayURLRequestManager
typedef void (^JDPayURLRequestBlock) (NSData * _Nullable data, NSHTTPURLResponse * _Nullable response, NSError * _Nullable error);

@interface JDPayURLRequestManager : NSObject

/**
 @brief Specifies additional headers which will be set on outgoing requests.
 @Note These headers are added to the request only if not already present in HTTPHeaders.
 */
@property (nullable, copy) NSDictionary *HTTPAdditionalHeaders;

+ (instancetype)sharedManager;

/**
 Send request
 
 @param request JDPayURLRequest
 @param finishBlock Finish callback
 */
- (void)sendRequest:(JDPayURLRequest *)request withFinishBlock:(JDPayURLRequestBlock)finishBlock;

/**
 Cancel request

 @param request JDPayURLRequest
 @return BOOL true if success.
 */
- (BOOL)cancelRequest:(JDPayURLRequest *)request;

@end

NS_ASSUME_NONNULL_END

#endif // _JDPAY_URL_REQUEST_MANAGER_H_
