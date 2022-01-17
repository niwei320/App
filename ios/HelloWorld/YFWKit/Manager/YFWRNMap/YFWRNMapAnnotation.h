//
//  YFWRNMapAnnotation.h
//  HelloWorld
//
//  Created by yfw on 2020/12/21.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface YFWRNMapAnnotation : NSObject<BMKAnnotation>
@property (nonatomic, copy) NSString *title;
@property (nonatomic, copy) NSString *subtitle;
@property (nonatomic, copy) NSString *msg;
@property (nonatomic, copy) NSString *img;
@property (nonatomic, assign) NSInteger second;

@property (nonatomic, readwrite) CLLocationCoordinate2D coordinate;

- (id)initWithCoordinate2D:(CLLocationCoordinate2D)coordinate;
@end

NS_ASSUME_NONNULL_END
