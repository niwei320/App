//
//  YFWYFWReachability.m
//  YaoFang
//
//  Created by 胡舒舒 on 2017/5/24.
//  Copyright © 2017年 ospreyren. All rights reserved.
//

#import "YFWReachability.h"

NSString *const kYFWReachabilityChangedNotification = @"kYFWReachabilityChangedNotification";

@interface YFWReachability ()

@property (nonatomic, assign) SCNetworkReachabilityRef  YFWReachabilityRef;


#if NEEDS_DISPATCH_RETAIN_RELEASE
@property (nonatomic, assign) dispatch_queue_t          YFWReachabilitySerialQueue;
#else
@property (nonatomic, strong) dispatch_queue_t          YFWReachabilitySerialQueue;
#endif


@property (nonatomic, strong) id YFWReachabilityObject;

-(void)reachabilityChanged:(SCNetworkReachabilityFlags)flags;
-(BOOL)isReachableWithFlags:(SCNetworkReachabilityFlags)flags;

@end

static NSString *YFWReachabilityFlags(SCNetworkReachabilityFlags flags)
{
    return [NSString stringWithFormat:@"%c%c %c%c%c%c%c%c%c",
#if	TARGET_OS_IPHONE
            (flags & kSCNetworkReachabilityFlagsIsWWAN)               ? 'W' : '-',
#else
            'X',
#endif
            (flags & kSCNetworkReachabilityFlagsReachable)            ? 'R' : '-',
            (flags & kSCNetworkReachabilityFlagsConnectionRequired)   ? 'c' : '-',
            (flags & kSCNetworkReachabilityFlagsTransientConnection)  ? 't' : '-',
            (flags & kSCNetworkReachabilityFlagsInterventionRequired) ? 'i' : '-',
            (flags & kSCNetworkReachabilityFlagsConnectionOnTraffic)  ? 'C' : '-',
            (flags & kSCNetworkReachabilityFlagsConnectionOnDemand)   ? 'D' : '-',
            (flags & kSCNetworkReachabilityFlagsIsLocalAddress)       ? 'l' : '-',
            (flags & kSCNetworkReachabilityFlagsIsDirect)             ? 'd' : '-'];
}

// Start listening for YFWReachability notifications on the current run loop
static void TMYFWReachabilityCallback(SCNetworkReachabilityRef target, SCNetworkReachabilityFlags flags, void* info)
{
#pragma unused (target)
#if __has_feature(objc_arc)
    YFWReachability *reachability = ((__bridge YFWReachability*)info);
#else
    YFWReachability *reachability = ((YFWReachability*)info);
#endif
    
    // We probably don't need an autoreleasepool here, as GCD docs state each queue has its own autorelease pool,
    // but what the heck eh?
    @autoreleasepool
    {
        [reachability reachabilityChanged:flags];
    }
}


@implementation YFWReachability

@synthesize YFWReachabilityRef;
@synthesize YFWReachabilitySerialQueue;

@synthesize reachableOnWWAN;

@synthesize reachableBlock;
@synthesize unreachableBlock;

@synthesize YFWReachabilityObject;

#pragma mark - Class Constructor Methods

+(YFWReachability*)YFWReachabilityWithHostName:(NSString*)hostname
{
    return [YFWReachability yfwReachabilityWithHostname:hostname];
}

+(YFWReachability*)yfwReachabilityWithHostname:(NSString*)hostname
{
    SCNetworkReachabilityRef ref = SCNetworkReachabilityCreateWithName(NULL, [hostname UTF8String]);
    if (ref)
    {
        id YFWReachability = [[self alloc] initWithYFWReachabilityRef:ref];
        
#if __has_feature(objc_arc)
        return YFWReachability;
#else
        return [YFWReachability autorelease];
#endif
        
    }
    
    return nil;
}

+(YFWReachability *)yfwReachabilityWithAddress:(const struct sockaddr_in *)hostAddress
{
    SCNetworkReachabilityRef ref = SCNetworkReachabilityCreateWithAddress(kCFAllocatorDefault, (const struct sockaddr*)hostAddress);
    if (ref)
    {
        id YFWReachability = [[self alloc] initWithYFWReachabilityRef:ref];
        
#if __has_feature(objc_arc)
        return YFWReachability;
#else
        return [YFWReachability autorelease];
#endif
    }
    
    return nil;
}

+(YFWReachability *)yfwReachabilityForInternetConnection
{
    struct sockaddr_in zeroAddress;
    bzero(&zeroAddress, sizeof(zeroAddress));
    zeroAddress.sin_len = sizeof(zeroAddress);
    zeroAddress.sin_family = AF_INET;
    
    return [self yfwReachabilityWithAddress:&zeroAddress];
}

+(YFWReachability*)yfwReachabilityForLocalWiFi
{
    struct sockaddr_in localWifiAddress;
    bzero(&localWifiAddress, sizeof(localWifiAddress));
    localWifiAddress.sin_len            = sizeof(localWifiAddress);
    localWifiAddress.sin_family         = AF_INET;
    // IN_LINKLOCALNETNUM is defined in <netinet/in.h> as 169.254.0.0
    localWifiAddress.sin_addr.s_addr    = htonl(IN_LINKLOCALNETNUM);
    
    return [self yfwReachabilityWithAddress:&localWifiAddress];
}


// Initialization methods

-(YFWReachability *)initWithYFWReachabilityRef:(SCNetworkReachabilityRef)ref
{
    self = [super init];
    if (self != nil)
    {
        self.reachableOnWWAN = YES;
        self.YFWReachabilityRef = ref;
    }
    
    return self;
}

-(void)dealloc
{
    [self stopNotifier];
    
    if(self.YFWReachabilityRef)
    {
        CFRelease(self.YFWReachabilityRef);
        self.YFWReachabilityRef = nil;
    }
    
    self.reachableBlock		= nil;
    self.unreachableBlock	= nil;
    
#if !(__has_feature(objc_arc))
    [super dealloc];
#endif
    
    
}

#pragma mark - Notifier Methods

// Notifier
// NOTE: This uses GCD to trigger the blocks - they *WILL NOT* be called on THE MAIN THREAD
// - In other words DO NOT DO ANY UI UPDATES IN THE BLOCKS.
//   INSTEAD USE dispatch_async(dispatch_get_main_queue(), ^{UISTUFF}) (or dispatch_sync if you want)

-(BOOL)startNotifier
{
    SCNetworkReachabilityContext    context = { 0, NULL, NULL, NULL, NULL };
    
    // this should do a retain on ourself, so as long as we're in notifier mode we shouldn't disappear out from under ourselves
    // woah
    self.YFWReachabilityObject = self;
    
    
    
    // First, we need to create a serial queue.
    // We allocate this once for the lifetime of the notifier.
    self.YFWReachabilitySerialQueue = dispatch_queue_create("com.tonymillion.YFWReachability", NULL);
    if(!self.YFWReachabilitySerialQueue)
    {
        return NO;
    }
    
#if __has_feature(objc_arc)
    context.info = (__bridge void *)self;
#else
    context.info = (void *)self;
#endif
    
    if (!SCNetworkReachabilitySetCallback(self.YFWReachabilityRef, TMYFWReachabilityCallback, &context))
    {
#ifdef DEBUG
        NSLog(@"SCNetworkYFWReachabilitySetCallback() failed: %s", SCErrorString(SCError()));
#endif
        
        // Clear out the dispatch queue
        if(self.YFWReachabilitySerialQueue)
        {
#if NEEDS_DISPATCH_RETAIN_RELEASE
            dispatch_release(self.YFWReachabilitySerialQueue);
#endif
            self.YFWReachabilitySerialQueue = nil;
        }
        
        self.YFWReachabilityObject = nil;
        
        return NO;
    }
    
    // Set it as our YFWReachability queue, which will retain the queue
    if(!SCNetworkReachabilitySetDispatchQueue(self.YFWReachabilityRef, self.YFWReachabilitySerialQueue))
    {
#ifdef DEBUG
        NSLog(@"SCNetworkYFWReachabilitySetDispatchQueue() failed: %s", SCErrorString(SCError()));
#endif
        
        // UH OH - FAILURE!
        
        // First stop, any callbacks!
        SCNetworkReachabilitySetCallback(self.YFWReachabilityRef, NULL, NULL);
        
        // Then clear out the dispatch queue.
        if(self.YFWReachabilitySerialQueue)
        {
#if NEEDS_DISPATCH_RETAIN_RELEASE
            dispatch_release(self.YFWReachabilitySerialQueue);
#endif
            self.YFWReachabilitySerialQueue = nil;
        }
        
        self.YFWReachabilityObject = nil;
        
        return NO;
    }
    
    return YES;
}

-(void)stopNotifier
{
    // First stop, any callbacks!
    SCNetworkReachabilitySetCallback(self.YFWReachabilityRef, NULL, NULL);
    
    // Unregister target from the GCD serial dispatch queue.
    SCNetworkReachabilitySetDispatchQueue(self.YFWReachabilityRef, NULL);
    
    if(self.YFWReachabilitySerialQueue)
    {
#if NEEDS_DISPATCH_RETAIN_RELEASE
        dispatch_release(self.YFWReachabilitySerialQueue);
#endif
        self.YFWReachabilitySerialQueue = nil;
    }
    
    self.YFWReachabilityObject = nil;
}

#pragma mark - YFWReachability tests

// This is for the case where you flick the airplane mode;
// you end up getting something like this:
//YFWReachability: WR ct-----
//YFWReachability: -- -------
//YFWReachability: WR ct-----
//YFWReachability: -- -------
// We treat this as 4 UNREACHABLE triggers - really apple should do better than this

#define testcase (kSCNetworkReachabilityFlagsConnectionRequired | kSCNetworkReachabilityFlagsTransientConnection)

-(BOOL)isReachableWithFlags:(SCNetworkReachabilityFlags)flags
{
    BOOL connectionUP = YES;
    
    if(!(flags & kSCNetworkReachabilityFlagsReachable))
        connectionUP = NO;
    
    if( (flags & testcase) == testcase )
        connectionUP = NO;
    
#if	TARGET_OS_IPHONE
    if(flags & kSCNetworkReachabilityFlagsIsWWAN)
    {
        // We're on 3G.
        if(!self.reachableOnWWAN)
        {
            // We don't want to connect when on 3G.
            connectionUP = NO;
        }
    }
#endif
    
    return connectionUP;
}

-(BOOL)isReachable
{
    SCNetworkReachabilityFlags flags;
    
    if(!SCNetworkReachabilityGetFlags(self.YFWReachabilityRef, &flags))
        return NO;
    
    return [self isReachableWithFlags:flags];
}

-(BOOL)isReachableViaWWAN
{
#if	TARGET_OS_IPHONE
    
    SCNetworkReachabilityFlags flags = 0;
    
    if(SCNetworkReachabilityGetFlags(YFWReachabilityRef, &flags))
    {
        // Check we're REACHABLE
        if(flags & kSCNetworkReachabilityFlagsReachable)
        {
            // Now, check we're on WWAN
            if(flags & kSCNetworkReachabilityFlagsIsWWAN)
            {
                return YES;
            }
        }
    }
#endif
    
    return NO;
}

-(BOOL)isReachableViaWiFi
{
    SCNetworkReachabilityFlags flags = 0;
    
    if(SCNetworkReachabilityGetFlags(YFWReachabilityRef, &flags))
    {
        // Check we're reachable
        if((flags & kSCNetworkReachabilityFlagsReachable))
        {
#if	TARGET_OS_IPHONE
            // Check we're NOT on WWAN
            if((flags & kSCNetworkReachabilityFlagsIsWWAN))
            {
                return NO;
            }
#endif
            return YES;
        }
    }
    
    return NO;
}


// WWAN may be available, but not active until a connection has been established.
// WiFi may require a connection for VPN on Demand.
-(BOOL)isConnectionRequired
{
    return [self connectionRequired];
}

-(BOOL)connectionRequired
{
    SCNetworkReachabilityFlags flags;
    
    if(SCNetworkReachabilityGetFlags(YFWReachabilityRef, &flags))
    {
        return (flags & kSCNetworkReachabilityFlagsConnectionRequired);
    }
    
    return NO;
}

// Dynamic, on demand connection?
-(BOOL)isConnectionOnDemand
{
    SCNetworkReachabilityFlags flags;
    
    if (SCNetworkReachabilityGetFlags(YFWReachabilityRef, &flags))
    {
        return ((flags & kSCNetworkReachabilityFlagsConnectionRequired) &&
                (flags & (kSCNetworkReachabilityFlagsConnectionOnTraffic | kSCNetworkReachabilityFlagsConnectionOnDemand)));
    }
    
    return NO;
}

// Is user intervention required?
-(BOOL)isInterventionRequired
{
    SCNetworkReachabilityFlags flags;
    
    if (SCNetworkReachabilityGetFlags(YFWReachabilityRef, &flags))
    {
        return ((flags & kSCNetworkReachabilityFlagsConnectionRequired) &&
                (flags & kSCNetworkReachabilityFlagsInterventionRequired));
    }
    
    return NO;
}


#pragma mark - YFWReachability status stuff

-(NetworkStatus)currentYFWReachabilityStatus
{
    if([self isReachable])
    {
        if([self isReachableViaWiFi])
            return ReachableViaWiFi;
        
#if	TARGET_OS_IPHONE
        return ReachableViaWWAN;
#endif
    }
    
    return NotReachable;
}

-(SCNetworkReachabilityFlags)yfwReachabilityFlags
{
    SCNetworkReachabilityFlags flags = 0;
    
    if(SCNetworkReachabilityGetFlags(YFWReachabilityRef, &flags))
    {
        return flags;
    }
    
    return 0;
}

-(NSString*)currentYFWReachabilityString
{
    NetworkStatus temp = [self currentYFWReachabilityStatus];
    
    if(temp == reachableOnWWAN)
    {
        // Updated for the fact that we have CDMA phones now!
        return NSLocalizedString(@"Cellular", @"");
    }
    if (temp == ReachableViaWiFi)
    {
        return NSLocalizedString(@"WiFi", @"");
    }
    
    return NSLocalizedString(@"No Connection", @"");
}

-(NSString*)currentYFWReachabilityFlags
{
    return YFWReachabilityFlags([self yfwReachabilityFlags]);
}

#pragma mark - Callback function calls this method

-(void)reachabilityChanged:(SCNetworkReachabilityFlags)flags
{
    if([self isReachableWithFlags:flags])
    {
        if(self.reachableBlock)
        {
            self.reachableBlock(self);
        }
    }
    else
    {
        if(self.unreachableBlock)
        {
            self.unreachableBlock(self);
        }
    }
    
    // this makes sure the change notification happens on the MAIN THREAD
    dispatch_async(dispatch_get_main_queue(), ^{
        [[NSNotificationCenter defaultCenter] postNotificationName:kYFWReachabilityChangedNotification  object:self];
    });
}


#pragma mark - Debug Description

- (NSString *) description;
{
    NSString *description = [NSString stringWithFormat:@"<%@: %#x>",
                             NSStringFromClass([self class]), (unsigned int) self];
    return description;
}

@end
