//
//  YFWMapHelperManager.m
//  HelloWorld
//
//  Created by yfw on 2020/12/4.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "YFWMapHelperManager.h"
#import <BaiduMapAPI_Map/BMKMapComponent.h>


@interface YFWMapHelperManager ()<BMKLocationManagerDelegate,BMKGeoCodeSearchDelegate,BMKPoiSearchDelegate>

@property (nonatomic, strong) BMKLocationManager *locService;
@property (nonatomic, strong) BMKMapManager *bmkManager;
@property (nonatomic, strong) BMKGeoCodeSearch *searcher;
@property (nonatomic, strong) BMKPoiSearch *pioSearcher;
@property (nonatomic, strong) BMKUserLocation *userLocation;
@property (nonatomic, assign) float latitude;
@property (nonatomic, assign) float longitude;
@property (nonatomic, copy) PIOSearchComplectionBlock callBackBlock;

@end


@implementation YFWMapHelperManager

- (instancetype)init {
  self = [super init];
  if (self) {
    [self configureBaiduMap];
  }
  return self;
}
- (void)configureBaiduMap {
    
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
  
  //初始化检索对象
  self.pioSearcher =[[BMKPoiSearch alloc]init];
  self.pioSearcher.delegate = self;
    
}
- (void)getPOINearbyWithCallBack:(PIOSearchComplectionBlock)callBack {
  self.callBackBlock = callBack;
//  [self.locService startUpdatingLocation];
  BMKPOINearbySearchOption *option = [[BMKPOINearbySearchOption alloc]init];
  option.pageIndex = 0;
  float latitude = self.latitude;
  float longitude = self.longitude;
  option.location = CLLocationCoordinate2DMake(latitude, longitude);
  BOOL flag = [self.pioSearcher poiSearchNearBy:option];
  if(flag)
  {
      NSLog(@"周边检索发送成功");
  }
  else
  {
      NSLog(@"周边检索发送失败");
  }
}
- (void)startReverseGeoWith:(CLLocationCoordinate2D)coordinate {
  BMKReverseGeoCodeSearchOption *reverseGeoCodeSearchOption = [[BMKReverseGeoCodeSearchOption alloc]init];
  reverseGeoCodeSearchOption.location = coordinate;
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

- (BMKUserLocation *)userLocation{
  
  if (!_userLocation) {
    _userLocation = [[BMKUserLocation alloc] init];
  }
  
  return _userLocation;
}
- (void)BMKLocationManager:(BMKLocationManager *)manager didUpdateHeading:(CLHeading *)heading {
  if (!heading) {
    return;
  }
  self.userLocation.heading = heading;
}
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
  [self startReverseGeoWith:pt];
    
  self.userLocation.location = location.location;
}

//接收反向地理编码结果
-(void)onGetReverseGeoCodeResult:(BMKGeoCodeSearch *)searcher result:(BMKReverseGeoCodeSearchResult *)result errorCode:(BMKSearchErrorCode)error{
    if (error == BMK_SEARCH_NO_ERROR) {
//        self.cityName = [self getRightCityName:result];
    }
    else {
//        self.cityName = @"全国";
    }
  if (self.callBackBlock) {
    NSMutableArray *dataListArrayM = [NSMutableArray arrayWithCapacity:result.poiList.count];
    for (BMKPoiInfo *info in result.poiList) {
      [dataListArrayM addObject:[self convertBMKPointResult:info]];
    }
    self.callBackBlock(dataListArrayM);
    self.callBackBlock = nil;
  }
  [self.locService stopUpdatingLocation];
}
- (void)getSearchPOIInCity:(NSString *)cityName withKeyWord:(NSString *)keyWord andCallBack:(PIOSearchComplectionBlock)callBack
{
  self.callBackBlock = callBack;
    //发起检索
    BMKPOICitySearchOption *option = [[BMKPOICitySearchOption alloc]init];
    option.pageIndex = 0;
    option.city = cityName;
    option.keyword = keyWord;
    option.isCityLimit = YES;
    option.scope = BMK_POI_SCOPE_DETAIL_INFORMATION;
  
    BOOL flag = [self.pioSearcher poiSearchInCity:option];
    if(flag)
    {
        NSLog(@"周边检索发送成功");
    }
    else
    {
        NSLog(@"周边检索发送失败");
    }
}

//实现PoiSearchDeleage处理回调结果
- (void)onGetPoiResult:(BMKPoiSearch*)searcher result:(BMKPOISearchResult*)poiResultList errorCode:(BMKSearchErrorCode)error
{
    if (error == BMK_SEARCH_NO_ERROR) {
      if (self.callBackBlock) {
        NSMutableArray *dataListArrayM = [NSMutableArray arrayWithCapacity:poiResultList.poiInfoList.count];
        for (BMKPoiInfo *info in poiResultList.poiInfoList) {
          [dataListArrayM addObject:[self convertBMKPointResult:info]];
        }
        self.callBackBlock(dataListArrayM);
        self.callBackBlock = nil;
      }
    }
    else if (error == BMK_SEARCH_AMBIGUOUS_KEYWORD){
        //当在设置城市未找到结果，但在其他城市找到结果时，回调建议检索城市列表
        // result.cityList;
        NSLog(@"起始点有歧义");
    } else {
        NSLog(@"抱歉，未找到结果");
    }
}
- (NSDictionary *)convertBMKPointResult:(BMKPoiInfo *)info {
  BMKMapPoint point1 = BMKMapPointForCoordinate(CLLocationCoordinate2DMake(self.latitude,self.longitude));
  BMKMapPoint point2 = BMKMapPointForCoordinate(info.pt);
  CLLocationDistance distance = BMKMetersBetweenMapPoints(point1,point2);
  if (self.latitude <= 0 || self.longitude <= 0) {
    distance = 0;
  }
  return @{
    @"city":info.city?info.city:@"",
    @"province":info.province?info.province:@"",
    @"area":info.area?info.area:@"",
    @"name":info.name?info.name:@"",
    @"address":info.address?info.address:@"",
    @"latitude":@(info.pt.latitude),
    @"longitude":@(info.pt.longitude),
    @"distance":@(distance),
  };
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
@end
