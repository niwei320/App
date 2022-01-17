//
//  YFWRNOrderMapView.h
//  HelloWorld
//
//  Created by yfw on 2020/12/15.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <React/RCTView.h>

NS_ASSUME_NONNULL_BEGIN

@interface YFWRNOrderMapView : RCTView

@property (nonatomic, copy) NSDictionary *mapData;

- (void)mapViewWillAppear;
- (void)mapViewWillDisappear;
@end

NS_ASSUME_NONNULL_END
