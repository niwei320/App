//
//  YFShop.h
//  YaoFang
//
//  Created by yaofangwang on 15/1/28.
//  Copyright (c) 2015年 yaofangwang. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreLocation/CoreLocation.h>
#import <BaiduMapAPI_Map/BMKAnnotation.h>

@interface YFShop : NSObject<BMKAnnotation>

@property (nonatomic, strong) NSString *ID;
@property (nonatomic, copy) NSString *name;
@property (nonatomic, readonly) NSString *phoneNumber;
@property (nonatomic, copy) NSString *address;
@property (nonatomic, assign) BOOL isSigned;
@property (nonatomic, assign) CLLocationCoordinate2D coordinate;
@property (nonatomic, readonly) NSString *distance;
@property (nonatomic, readonly) NSString *shopImage;
@property (nonatomic, readonly) NSString *shopImage_m;

/**
 @brief 店铺综合评价
 */
@property (nonatomic, readonly) float rate;

- (instancetype)initWithDic:(NSDictionary *)dic;

- (instancetype)initWithTcpDic:(NSDictionary *)dic;


@end
