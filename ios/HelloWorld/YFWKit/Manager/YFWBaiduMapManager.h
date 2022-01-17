//
//  YFWBaiduMapManager.h
//  HelloWorld
//
//  Created by yfw-姜明均 on 2018/9/28.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

typedef void(^geoCodeComplectionBlock)(NSDictionary *info);

@interface YFWBaiduMapManager : NSObject

@property (nonatomic, assign) float latitude;

@property (nonatomic, assign) float longitude;

@property (nonatomic, copy) NSString *cityName;

@property (nonatomic, copy) NSString *homeAddress;

@property (nonatomic, copy) NSString *currentAddress;

@property (nonatomic, copy) NSString *name;

@property (nonatomic, copy) NSString *city;

@property (nonatomic, copy) NSString *province;

@property (nonatomic, copy) NSString *area;


@property (nonatomic, strong) BMKLocationManager *locService;


+ (instancetype)shareManager;

- (void)managerRegist;

- (void)setAddressInfo:(BMKPoiInfo *)bmkInfo;

- (void)geoCodeWith:(NSString *)city address:(NSString *)address complection:(geoCodeComplectionBlock)complection;
- (void)geoReverseCodeWith:(NSString *)longitude latitude:(NSString *)latitude complection:(geoCodeComplectionBlock)complection;
- (void)startUpdatingLocationWithComplection:(geoCodeComplectionBlock)complection;
@end
