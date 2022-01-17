//
//  YFWBaiduMapManager.m
//  HelloWorld
//
//  Created by yfw-姜明均 on 2018/9/28.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "YFWBaiduMapManager.h"
#import "YFWEventManager.h"

@interface YFWBaiduMapManager()<BMKLocationManagerDelegate,BMKGeoCodeSearchDelegate,BMKGeneralDelegate,BMKLocationAuthDelegate>

@property (nonatomic, strong) BMKMapManager *bmkManager;

@property (nonatomic, strong) BMKGeoCodeSearch *searcher;

@property (nonatomic, copy) geoCodeComplectionBlock compectionBlock;
@property (nonatomic, copy) geoCodeComplectionBlock reserveCompectionBlock;
@property (nonatomic, copy) geoCodeComplectionBlock updateLocationCompectionBlock;


@end

@implementation YFWBaiduMapManager

+ (instancetype)shareManager{
  
  static YFWBaiduMapManager *instance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    
    instance = [[YFWBaiduMapManager alloc] init];
    
  });
  
  return instance;
  
}


- (void)managerRegist{
  
  [[BMKLocationAuth sharedInstance] checkPermisionWithKey:YF_BAIDU_MAP_KEY authDelegate:self];
  
  self.bmkManager = [[BMKMapManager alloc] init];
  [self.bmkManager start:YF_BAIDU_MAP_KEY generalDelegate:nil];
  
  __weak typeof(self)weakSelf = self;
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
    [weakSelf getLocationConfig];
  });

  
}

- (void)getLocationConfig{
  
  //初始化BMKLocationService
  self.locService = [[BMKLocationManager alloc]init];
  self.locService.delegate = self;
  self.locService.coordinateType = BMKLocationCoordinateTypeBMK09LL;
  self.locService.desiredAccuracy = kCLLocationAccuracyNearestTenMeters;
  self.locService.distanceFilter = kCLDistanceFilterNone;
  self.locService.locationTimeout = 10;
  //启动LocationService
  [self.locService startUpdatingLocation];
  
  self.searcher =[[BMKGeoCodeSearch alloc]init];
  self.searcher.delegate = self;
  
}


- (void)setAddressInfo:(BMKPoiInfo *)bmkInfo{
  
  self.currentAddress = bmkInfo.name;
  self.longitude = (float)bmkInfo.pt.longitude;
  self.latitude = (float)bmkInfo.pt.latitude;
  
}
- (void)startUpdatingLocationWithComplection:(geoCodeComplectionBlock)complection {
  self.updateLocationCompectionBlock = complection;
  [self.locService startUpdatingLocation];
}
- (void)geoCodeWith:(NSString *)city address:(NSString *)address complection:(geoCodeComplectionBlock)complection {
  self.compectionBlock = complection;
  
  BMKGeoCodeSearchOption *geoCodeSearchOption = [[BMKGeoCodeSearchOption alloc]init];
  geoCodeSearchOption.address = address;
  geoCodeSearchOption.city = city;
  
  BOOL flag = [self.searcher geoCode: geoCodeSearchOption];
  if (flag) {
//    NSLog(@"geo检索发送成功");
  }  else  {
//    NSLog(@"geo检索发送失败");
    self.compectionBlock(@{@"code":@"0"});
  }
}

- (void)geoReverseCodeWith:(NSString *)longitude latitude:(NSString *)latitude complection:(geoCodeComplectionBlock)complection {
  self.reserveCompectionBlock = complection;
  
  double lon = longitude.doubleValue;
  double lat = latitude.doubleValue;
  
  //发起反向地理编码检索
  CLLocationCoordinate2D pt = CLLocationCoordinate2DMake(lat, lon);
  BMKReverseGeoCodeSearchOption *reverseGeoCodeSearchOption = [[BMKReverseGeoCodeSearchOption alloc]init];
  reverseGeoCodeSearchOption.location = pt;
  BOOL flag = [self.searcher reverseGeoCode:reverseGeoCodeSearchOption];
  
  if(flag)
  {
    //        NSLog(@"反geo检索发送成功");
    self.latitude = lon;
    self.longitude = lat;
  }
  else
  {
    //        NSLog(@"反geo检索发送失败");
    self.reserveCompectionBlock(@{@"code": @"0"});
  }
}

#pragma mark - Delegate

//处理位置坐标更新
- (void)BMKLocationManager:(BMKLocationManager *)manager didUpdateLocation:(BMKLocation *)location orError:(NSError *)error {
  
  if (error) {
    NSLog(@"locError:{%ld - %@};", (long)error.code, error.localizedDescription);
  }
  if (!location) {
    return;
  }
  
  self.latitude = location.location.coordinate.latitude;
  self.longitude = location.location.coordinate.longitude;
  //发起反向地理编码检索
  CLLocationCoordinate2D pt = (CLLocationCoordinate2D){location.location.coordinate.latitude, location.location.coordinate.longitude};
  BMKReverseGeoCodeSearchOption *reverseGeoCodeSearchOption = [[BMKReverseGeoCodeSearchOption alloc]init];
  reverseGeoCodeSearchOption.location = pt;
  BOOL flag = [self.searcher reverseGeoCode:reverseGeoCodeSearchOption];
  
  if(flag)
  {
    //        NSLog(@"反geo检索发送成功");
  }
  else
  {
    //        NSLog(@"反geo检索发送失败");
  }
  
}

// 正向地理编码检索结果回调
- (void)onGetGeoCodeResult:(BMKGeoCodeSearch *)searcher result:(BMKGeoCodeSearchResult *)result errorCode:(BMKSearchErrorCode)error {
  if (error == BMK_SEARCH_NO_ERROR) {
    //在此处理正常结果
    self.compectionBlock(@{@"latitude":[NSString stringWithFormat:@"%f",result.location.latitude],
                           @"longitude":[NSString stringWithFormat:@"%f",result.location.longitude],
                           @"code":@"1"});
  }
  else {
//    NSLog(@"检索失败");
    if (self.compectionBlock) self.compectionBlock(@{@"code":@"0"});
  }
}


//接收反向地理编码结果
-(void) onGetReverseGeoCodeResult:(BMKGeoCodeSearch *)searcher result:(BMKReverseGeoCodeSearchResult *)result errorCode:(BMKSearchErrorCode)error{
  if(error == BMK_SEARCH_NO_ERROR){
    self.cityName = [self getRightCityName:result];
    self.cityName = self.cityName.length>0 ? self.cityName : @"全国";
    NSString *addressName = result.businessCircle;
    if (result.poiList.count>0) {
      BMKPoiInfo *info = (BMKPoiInfo *)result.poiList[0];
      addressName = info.name;
    }
    
    [self setTheAddress:addressName];
    [[NSNotificationCenter defaultCenter] postNotificationName:@"changeHeaderName" object:nil];
    [self.locService stopUpdatingLocation];
    self.currentAddress = self.homeAddress;
    self.name = result.address;
    self.city = result.addressDetail.city;
    self.province = result.addressDetail.province;
    self.area = result.addressDetail.district;
    if (self.updateLocationCompectionBlock) {
      self.updateLocationCompectionBlock(@{
        @"name":addressName,
        @"address":self.name,
        @"city":self.city,
        @"province":self.province,
        @"area":self.area,
        @"latitude":@(self.latitude),
        @"longitude":@(self.longitude)});
      self.updateLocationCompectionBlock = nil;
      return;
    }
    [YFWEventManager emit:@"addressNotification" Data:@{@"name":getSafeString(self.currentAddress)}];
    if(self.reserveCompectionBlock) self.reserveCompectionBlock(@{@"code": @"1", @"city": self.cityName, @"address": addressName});
  } else {
    if (self.reserveCompectionBlock) self.reserveCompectionBlock(@{@"code": @"0"});
  }
}

#pragma mark - Action

- (void)setTheAddress:(NSString *)string
{
  NSString *address = string;
  if (address.length>10)
  {
    address = [[address substringFromIndex:0] substringToIndex:10];
  }
  self.homeAddress = address;
  
}

- (NSString *)getRightCityName:(BMKReverseGeoCodeSearchResult *)result
{
  NSArray *citys = @[@"北京市",@"上海市",@"天津市",@"重庆市"];
  for (int i=0; i<citys.count; i++) {
    NSString *city = citys[i];
    if ([result.addressDetail.city isEqualToString:city]) {
      return city;
    }
  }
  NSString *thirdCity = result.addressDetail.district;
  if (thirdCity.length==0) {
    thirdCity = result.addressDetail.city;
  }
  
  return thirdCity;
}


- (float)latitude{
  
  if (_latitude == 0) {
    return 31.236276;
  }
  return _latitude;
}

- (float)longitude{
  
  if (_longitude == 0) {
    return 121.480248;
  }
  return _longitude;
}


@end
