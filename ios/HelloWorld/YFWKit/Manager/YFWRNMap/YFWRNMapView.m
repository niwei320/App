//
//  YFWRNMapView.m
//  HelloWorld
//
//  Created by yfw on 2020/12/3.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "YFWRNMapView.h"
#import "YFKActionPaopaoView.h"
#import "YFWRNMapLocationPaoppaoView.h"

@interface YFWRNMapView ()<BMKMapViewDelegate, BMKLocationManagerDelegate,BMKGeoCodeSearchDelegate>
@property (nonatomic, strong) BMKMapView *mapView;
@property (nonatomic, strong) BMKLocationManager *locService;
@property (nonatomic, strong) BMKMapManager *bmkManager;
@property (nonatomic, strong) BMKGeoCodeSearch *searcher;
@property (nonatomic, strong) BMKUserLocation *userLocation;
@property (nonatomic, strong) BMKPointAnnotation *annotation;
@property (nonatomic, weak) BMKAnnotationView *annotationView;

@property (nonatomic, assign) float latitude;
@property (nonatomic, assign) float longitude;

@property (nonatomic, copy) RCTDirectEventBlock onGetReverseGeoCodeResult;
@property (nonatomic, strong) UIButton *relocationView;

@end

@implementation YFWRNMapView

- (instancetype)initWithFrame:(CGRect)frame {
  self = [super initWithFrame:frame];
  if (self) {
    [self configureBaiduMap];

    self.mapView = [[BMKMapView alloc] initWithFrame:frame];
    self.mapView.showsUserLocation = YES;
    self.mapView.delegate = self;
    self.mapView.mapType = BMKMapTypeStandard;
    [self addSubview:self.mapView];
    UIImage *locationImage = [UIImage imageNamed:@"map_relocation"];
    locationImage = [locationImage imageWithRenderingMode:UIImageRenderingModeAlwaysTemplate];
    UIImageView *imageView = [[UIImageView alloc] initWithImage:locationImage];
    imageView.tintColor = [UIColor grayColor];
    imageView.frame = CGRectMake(11, 11, 22, 22);
    self.relocationView = [UIButton new];
    [self.relocationView addTarget:self action:@selector(beginUpdatingLocation) forControlEvents:UIControlEventTouchUpInside];
    self.relocationView.backgroundColor = [UIColor whiteColor];
    self.relocationView.layer.cornerRadius = 22;
    self.relocationView.clipsToBounds = YES;
    self.relocationView.layer.masksToBounds = NO;
    self.relocationView.layer.shadowColor   = [UIColor lightGrayColor].CGColor;
    self.relocationView.layer.shadowOffset  = CGSizeMake(0, 0);
    self.relocationView.layer.shadowOpacity = 0.8;
    self.relocationView.layer.shadowRadius  = 22;
    [self.relocationView addSubview:imageView];
    [self addSubview:self.relocationView];
  }
  return self;
}
- (void)layoutSubviews {
  self.mapView.frame = CGRectMake(0, 0, CGRectGetWidth(self.bounds), CGRectGetHeight(self.bounds));
  self.relocationView.frame = CGRectMake(CGRectGetWidth(self.bounds) - 44 - 12, CGRectGetHeight(self.bounds) - 44 - 12,  44, 44);
}
-(void)mapViewWillAppear
{
    [self.mapView viewWillAppear];
}
-(void)mapViewWillDisappear
{
    [self.mapView viewWillDisappear];
}
- (void)beginUpdatingLocation {
  [self.locService startUpdatingLocation];
}
- (void)configureBaiduMap {
    
    //初始化BMKLocationService
  self.locService = [[BMKLocationManager alloc]init];
  self.locService.delegate = self;
  self.locService.coordinateType = BMKLocationCoordinateTypeBMK09LL;
  self.locService.desiredAccuracy = kCLLocationAccuracyNearestTenMeters;
  self.locService.distanceFilter = kCLDistanceFilterNone;
  self.locService.locationTimeout = 10;
  self.searcher =[[BMKGeoCodeSearch alloc]init];
  self.searcher.delegate = self;
    
}
- (void)adjustRegin {
    
    //修改地图尺度
    [self.mapView setRegion:
     BMKCoordinateRegionMake(CLLocationCoordinate2DMake(self.latitude,self.longitude),
                                                    BMKCoordinateSpanMake(0.05,0.05)) animated:YES];
    
    
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
  [self.mapView updateLocationData:self.userLocation];
}
- (BMKAnnotationView *)mapView:(BMKMapView *)mapView viewForAnnotation:(id <BMKAnnotation>)annotation
{
    if ([annotation isKindOfClass:[BMKPointAnnotation class]])
    {
        static NSString *reuseIndetifier = @"annotationReuseIndetifier";
        BMKAnnotationView *annotationView = [mapView dequeueReusableAnnotationViewWithIdentifier:reuseIndetifier];
        if (annotationView == nil)
        {
            annotationView = [[BMKAnnotationView alloc] initWithAnnotation:annotation
                                                              reuseIdentifier:reuseIndetifier];
        }
        annotationView.image = [UIImage imageNamed:@"map_point_1.png"];
        self.annotationView = annotationView;
        annotationView.calloutOffset = CGPointMake(0, -10);
        annotationView.canShowCallout = annotation.title.length > 0;
        YFWRNMapLocationPaoppaoView *popView = [[[NSBundle mainBundle] loadNibNamed:@"YFWRNMapLocationPaoppaoView" owner:self options:nil] firstObject];
        popView.titleLable.text = annotation.title;
        CGSize textSize = [annotation.title sizeForFont:[UIFont systemFontOfSize:12] size:CGSizeMake(300, 21) mode:NSLineBreakByWordWrapping];
        popView.bounds = CGRectMake(0, 0, textSize.width + 10, 25);
        YFKActionPaopaoView *paopao = [[YFKActionPaopaoView alloc] initWithCustomView:popView];
        annotationView.paopaoView = paopao;
        return annotationView;
    }
    return nil;
}
- (void)mapView:(BMKMapView *)mapView regionWillChangeAnimated:(BOOL)animated reason:(BMKRegionChangeReason)reason {
  if (reason == BMKRegionChangeReasonGesture) {
    self.annotationView.image = [UIImage imageNamed:@"map_point_2.png"];
  }
}
/**
 *地图区域改变完成后会调用此接口
 *@param mapView 地图View
 *@param animated 是否动画
 *@param reason 地区区域改变的原因
 */
- (void)mapView:(BMKMapView *)mapView regionDidChangeAnimated:(BOOL)animated reason:(BMKRegionChangeReason)reason; {
  if (reason == BMKRegionChangeReasonGesture) {
    self.annotationView.image = [UIImage imageNamed:@"map_point_1.png"];
  }
  [self startReverseGeoWith:mapView.centerCoordinate];
  self.annotation.coordinate = mapView.centerCoordinate;
  [self.mapView addAnnotation:self.annotation];
}

//处理位置坐标更新
- (void)BMKLocationManager:(BMKLocationManager *)manager didUpdateLocation:(BMKLocation *)location orError:(NSError *)error {
  
  if (error) {
    NSLog(@"locError:{%ld - %@};", (long)error.code, error.localizedDescription);
  }
  if (!location || location.location.coordinate.latitude == 0) {
    self.latitude = [YFWBaiduMapManager shareManager].latitude;
    self.longitude = [YFWBaiduMapManager shareManager].longitude;
  } else {
    self.latitude = location.location.coordinate.latitude;
    self.longitude = location.location.coordinate.longitude;
  }
  //发起反向地理编码检索
  CLLocationCoordinate2D pt = (CLLocationCoordinate2D){self.latitude, self.longitude};
  [self startReverseGeoWith:pt];
    
  self.userLocation.location = location.location;
  [self.mapView updateLocationData:self.userLocation];
  [self.mapView setCenterCoordinate:CLLocationCoordinate2DMake(self.latitude, self.longitude) animated:YES];
  [self adjustRegin];
}

//接收反向地理编码结果
-(void)onGetReverseGeoCodeResult:(BMKGeoCodeSearch *)searcher result:(BMKReverseGeoCodeSearchResult *)result errorCode:(BMKSearchErrorCode)error{
    if (error == BMK_SEARCH_NO_ERROR) {
//        self.cityName = [self getRightCityName:result];
    }
    else {
//        self.cityName = @"全国";
    }
  if (_onGetReverseGeoCodeResult != nil) {
    NSMutableDictionary<NSString *, id> *event = [NSMutableDictionary dictionary];
    NSMutableArray *dataListArrayM = [NSMutableArray arrayWithCapacity:result.poiList.count];
    if (result.poiList.count > 0) {
      BMKPoiInfo *poiInfo = result.poiList[0];
      self.annotation.title = poiInfo.name;
      [self.mapView removeAnnotation:self.annotation];
      [self.mapView addAnnotation:self.annotation];
      [self.mapView selectAnnotation:self.annotation animated:NO];
    }
    for (BMKPoiInfo *info in result.poiList) {
      [dataListArrayM addObject:@{
        @"city":result.addressDetail.city?result.addressDetail.city:@"",
        @"province":result.addressDetail.province?result.addressDetail.province:@"",
        @"area":result.addressDetail.district?result.addressDetail.district:@"",
        @"name":info.name?info.name:@"",
        @"address":info.address?info.address:@"",
        @"latitude":@(info.pt.latitude),
        @"longitude":@(info.pt.longitude),
      }];
    }
    [event addEntriesFromDictionary: @{@"data": dataListArrayM }];
    _onGetReverseGeoCodeResult(event);
  }
    [self.locService stopUpdatingLocation];
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

#pragma mark - BMKMapViewDelegate

- (void)mapViewDidFinishLoading:(BMKMapView *)mapView {
  [self beginUpdatingLocation];
}

- (void)mapView:(BMKMapView *)mapView onClickedMapBlank:(CLLocationCoordinate2D)coordinate {
//  self.annotation.coordinate = coordinate;
//  [self.mapView addAnnotation:self.annotation];
//  [self startReverseGeoWith:coordinate];
}

- (void)mapview:(BMKMapView *)mapView onDoubleClick:(CLLocationCoordinate2D)coordinate {
    NSLog(@"map view: double click");
}

- (void)mapView:(BMKMapView *)mapView onClickedMapPoi:(BMKMapPoi *)mapPoi {
//  self.annotation.coordinate = mapPoi.pt;
//  [self.mapView addAnnotation:self.annotation];
//  [self startReverseGeoWith:mapPoi.pt];
}

- (void)mapView:(BMKMapView *)mapView didSelectAnnotationView:(BMKAnnotationView *)view {
  
}

- (void)mapStatusDidChanged:(BMKMapView *)mapView
{
    
}

#pragma mark - BMKLocationServiceDelegate


- (void)didFailToLocateUserWithError:(NSError *)error {
    [self.locService stopUpdatingLocation];
}


#pragma mark - lazy
- (BMKPointAnnotation *)annotation {
  if (!_annotation) {
    BMKPointAnnotation *annotation = [BMKPointAnnotation new];
    annotation.coordinate = CLLocationCoordinate2DMake(self.latitude, self.longitude);
    annotation.isLockedToScreen = YES;
    annotation.screenPointToLock = CGPointMake(CGRectGetWidth(self.bounds)/2, CGRectGetHeight(self.bounds)/2);
    _annotation = annotation;
  }
  return _annotation;
}
@end
