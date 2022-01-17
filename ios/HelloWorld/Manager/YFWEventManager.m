//
//  YFWEventManager.m
//  HelloWorld
//
//  Created by yfw-姜明均 on 2018/9/27.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "YFWEventManager.h"

NSString *const AddressNotification = @"addressNotification";
NSString *const NetWorkChangedNotification = @"netWorkChanged";
NSString *const PaymentSuccess = @"paymentSuccess";
NSString *const PaymentFail = @"paymentFail";
NSString *const ThirdAuthOK = @"thirdAuthOK";
NSString *const IS_OPEN_LOCATION = @"IS_OPEN_LOCATION";
NSString *const SCHEME_ACTION = @"SCHEME_ACTION";
NSString *const THREETOUCH_ACTION = @"get_threeTouch";

#define EmitEventNames @[AddressNotification,NetWorkChangedNotification,PaymentSuccess,PaymentFail,ThirdAuthOK,IS_OPEN_LOCATION,SCHEME_ACTION,THREETOUCH_ACTION]
#define NotificationCenter [NSNotificationCenter defaultCenter]

@implementation YFWEventManager

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

#pragma mark - Override

- (NSArray<NSString *> *)supportedEvents
{
  return EmitEventNames;
}

- (void)startObserving{
  for (NSString *emit in self.supportedEvents) {
    [NotificationCenter addObserver:self selector:@selector(emit:) name:emit object:nil];
  }
}

- (void)stopObserving{
  [NotificationCenter removeObserver:self];
}


#pragma mark - Current Function

- (void)emit:(NSNotification *)notification{

  NSString *name = notification.object[@"name"];
  NSDictionary *data = notification.object[@"data"];
  [self sendEventWithName:name body:data];

}

+ (void)emit:(NSString *)emitName Data:(NSDictionary *)data{

  NSDictionary *info = @{@"name" : emitName ,
                         @"data" : data };

  [NotificationCenter postNotificationName:emitName object:info];
}

@end
