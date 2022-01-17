//
//  YFWRNMapViewManager.m
//  HelloWorld
//
//  Created by yfw on 2020/12/3.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "YFWRNMapViewManager.h"
#import "YFWRNMapView.h"
#import <React/RCTUIManager.h>
@interface YFWRNMapViewManager ()

@end

@implementation YFWRNMapViewManager

RCT_EXPORT_MODULE()

- (UIView *)view
{
  YFWRNMapView *webView = [YFWRNMapView new];
  return webView;
}

RCT_EXPORT_VIEW_PROPERTY(onGetReverseGeoCodeResult, RCTDirectEventBlock)

RCT_EXPORT_METHOD(mapViewWillAppear:(nonnull NSNumber*) reactTag) {
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, YFWRNMapView *> *viewRegistry) {
    YFWRNMapView *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[YFWRNMapView class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting YFWRNMapView, got: %@", view);
    } else {
      [view mapViewWillAppear];
    }
  }];
}
RCT_EXPORT_METHOD(mapViewWillDisappear:(nonnull NSNumber*) reactTag) {
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, YFWRNMapView *> *viewRegistry) {
    YFWRNMapView *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[YFWRNMapView class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting YFWRNMapView, got: %@", view);
    } else {
      [view mapViewWillDisappear];
    }
  }];
}

@end
