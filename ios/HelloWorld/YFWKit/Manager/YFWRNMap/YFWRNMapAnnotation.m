//
//  YFWRNMapAnnotation.m
//  HelloWorld
//
//  Created by yfw on 2020/12/21.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "YFWRNMapAnnotation.h"

@implementation YFWRNMapAnnotation
- (id)initWithCoordinate2D:(CLLocationCoordinate2D)coordinate {
    self = [super init];
    if (self != nil) {
        _coordinate = coordinate;
    }
    return self;
}
@end
