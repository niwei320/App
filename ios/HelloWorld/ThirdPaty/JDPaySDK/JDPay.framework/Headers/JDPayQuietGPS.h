//
//  OCQuietGPS.h
//  OCFoundation
//
//  Created by dongkui on 2017/5/30.
//  Modified by dongkui on 2018/7/11.
//  Copyright © 2017 dongkui. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreLocation/CoreLocation.h>

NS_ASSUME_NONNULL_BEGIN

typedef NS_ENUM(NSInteger, JDPayQuietGPSError) {
    JDPayQuietGPSErrorDisabled                  = -1,                               // location service is currently disabled
    JDPayQuietGPSErrorLocationUnknown           = kCLErrorLocationUnknown,          // location is currently unknown, but CL will keep trying
    JDPayQuietGPSErrorDenied                    = kCLErrorDenied,                   // Access to location or ranging has been denied by the user
    JDPayQuietGPSErrorNetwork                   = kCLErrorNetwork,                  // general, network-related error
    JDPayQuietGPSErrorGeocodeFoundNoResult      = kCLErrorGeocodeFoundNoResult,     // A geocode request yielded no result
    JDPayQuietGPSErrorGeocodeFoundPartialResult = kCLErrorGeocodeFoundPartialResult,// A geocode request yielded a partial result
    JDPayQuietGPSErrorGeocodeCanceled           = kCLErrorGeocodeCanceled,          // A geocode request was cancelled
};

/**
 Get GPS location completion block
 
 @param locations The result locations with elements of CLLocation instance
 @param error NSError, nil if no error. see JDPayQuietGPSError
 */
typedef void (^JDPayQuietGPSGetLocationCompletionHandler)(NSArray< CLLocation *> * __nullable locations, NSError * __nullable error);

/**
 A quiet GPS location manager, which does not do authentication request. so if your application was forbidden to access
 the location service, the manager will report a error 'JDPayQuietGPSErrorDenied'.
 */
@interface JDPayQuietGPS : NSObject

/**
 Return the shared manager.
 */
+ (JDPayQuietGPS *)sharedGPS;

/**
 Query the latest location asynchronously with desired accuracy.
 
 @param desiredAccuracy Desired accuracy.
 @param completionHandler Callback which will be called after it finish querying the location or encount an error.
 */
- (void)locationWithDesiredAccuracy:(CLLocationAccuracy)desiredAccuracy
                  completionHandler:(JDPayQuietGPSGetLocationCompletionHandler)completionHandler;

/**
 Reverse the geocode location asynchronously with specified distance accuracy.
 
 @param location The location needs to reverse.
 @param accuracy The distance accuracy. This method can not be call frequently, so you need to specify a proper distance
 accuracy, so that the manager could be able to check if it need to do a refresh geocode reverse request or just return
 the last one.
 @param completionHandler Callback which will be called after it finish reversing the geocode location or encount an error.
 */
- (void)reverseGeocodeLocation:(CLLocation *)location
                      accuracy:(CLLocationDistance)accuracy
             completionHandler:(CLGeocodeCompletionHandler)completionHandler;

@end

NS_ASSUME_NONNULL_END
