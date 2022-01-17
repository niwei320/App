//
//  YFWReachability.h
//  YaoFang
//
//  Created by 胡舒舒 on 2017/5/24.
//  Copyright © 2017年 ospreyren. All rights reserved.
//


#import <Foundation/Foundation.h>
#import <SystemConfiguration/SystemConfiguration.h>

#import <sys/socket.h>
#import <netinet/in.h>
#import <netinet6/in6.h>
#import <arpa/inet.h>
#import <ifaddrs.h>
#import <netdb.h>

/**
 * Does ARC support GCD objects?
 * It does if the minimum deployment target is iOS 6+ or Mac OS X 8+
 *
 * @see http://opensource.apple.com/source/libdispatch/libdispatch-228.18/os/object.h
 **/
#if OS_OBJECT_USE_OBJC
#define NEEDS_DISPATCH_RETAIN_RELEASE 0
#else
#define NEEDS_DISPATCH_RETAIN_RELEASE 1
#endif

/**
 * Create NS_ENUM macro if it does not exist on the targeted version of iOS or OS X.
 *
 * @see http://nshipster.com/ns_enum-ns_options/
 **/
#ifndef NS_ENUM
#define NS_ENUM(_type, _name) enum _name : _type _name; enum _name : _type
#endif

extern NSString *const kYFWReachabilityChangedNotification;

typedef NS_ENUM(NSInteger, NetworkStatus) {
    // Apple NetworkStatus Compatible Names.
    NotReachable = 0,
    ReachableViaWiFi = 2,
    ReachableViaWWAN = 1
};

@class YFWReachability;

typedef void (^NetworkReachable)(YFWReachability * YFWReachability);
typedef void (^NetworkUnreachable)(YFWReachability * YFWReachability);

@interface YFWReachability : NSObject

@property (nonatomic, copy) NetworkReachable    reachableBlock;
@property (nonatomic, copy) NetworkUnreachable  unreachableBlock;


@property (nonatomic, assign) BOOL reachableOnWWAN;

+(YFWReachability*)yfwReachabilityWithHostname:(NSString*)hostname;
+(YFWReachability*)yfwReachabilityForInternetConnection;
+(YFWReachability*)yfwReachabilityWithAddress:(const struct sockaddr_in*)hostAddress;
+(YFWReachability*)yfwReachabilityForLocalWiFi;

-(YFWReachability *)initWithYFWReachabilityRef:(SCNetworkReachabilityRef)ref;

-(BOOL)startNotifier;
-(void)stopNotifier;

-(BOOL)isReachable;
-(BOOL)isReachableViaWWAN;
-(BOOL)isReachableViaWiFi;

// WWAN may be available, but not active until a connection has been established.
// WiFi may require a connection for VPN on Demand.
-(BOOL)isConnectionRequired; // Identical DDG variant.
-(BOOL)connectionRequired; // Apple's routine.
// Dynamic, on demand connection?
-(BOOL)isConnectionOnDemand;
// Is user intervention required?
-(BOOL)isInterventionRequired;

-(NetworkStatus)currentYFWReachabilityStatus;
-(SCNetworkReachabilityFlags)yfwReachabilityFlags;
-(NSString*)currentYFWReachabilityString;
-(NSString*)currentYFWReachabilityFlags;

@end
