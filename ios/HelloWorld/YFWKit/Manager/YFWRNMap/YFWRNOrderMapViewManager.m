//
//  YFWRNOrderMapViewManager.m
//  HelloWorld
//
//  Created by yfw on 2020/12/15.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "YFWRNOrderMapViewManager.h"
#import "YFWRNOrderMapView.h"
#import <React/RCTUIManager.h>
@interface YFWRNOrderMapViewManager ()

@end

@implementation YFWRNOrderMapViewManager

RCT_EXPORT_MODULE()

- (UIView *)view
{
  YFWRNOrderMapView *webView = [YFWRNOrderMapView new];
  return webView;
}
RCT_EXPORT_VIEW_PROPERTY(mapData, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(onClick, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onTimeOut, RCTDirectEventBlock)
RCT_EXPORT_METHOD(mapViewWillAppear:(nonnull NSNumber*) reactTag) {
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, YFWRNOrderMapView *> *viewRegistry) {
    YFWRNOrderMapView *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[YFWRNOrderMapView class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting YFWRNOrderMapView, got: %@", view);
    } else {
      [view mapViewWillAppear];
    }
  }];
}
RCT_EXPORT_METHOD(mapViewWillDisappear:(nonnull NSNumber*) reactTag) {
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, YFWRNOrderMapView *> *viewRegistry) {
    YFWRNOrderMapView *view = viewRegistry[reactTag];
    if (![view isKindOfClass:[YFWRNOrderMapView class]]) {
      RCTLogError(@"Invalid view returned from registry, expecting YFWRNOrderMapView, got: %@", view);
    } else {
      [view mapViewWillDisappear];
    }
  }];
}

@end

