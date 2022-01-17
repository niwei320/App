//
//  YFWRNOrderMapView.m
//  HelloWorld
//
//  Created by yfw on 2020/12/15.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "YFWRNOrderMapView.h"
#import "YFWRNMapPaopaoView.h"
#import "YFKActionPaopaoView.h"
#import "YFWRNMapAnnotation.h"
#import "YFWRNShopView.h"
@interface YFWRNOrderMapView ()<BMKMapViewDelegate, BMKLocationManagerDelegate>
@property (nonatomic, strong) BMKMapView *mapView;
@property (nonatomic, strong) BMKLocationManager *locService;
@property (nonatomic, strong) BMKMapManager *bmkManager;

@property (nonatomic, strong) BMKUserLocation *userLocation;
@property (nonatomic, strong) YFWRNMapAnnotation *userAnnotation;
@property (nonatomic, weak) BMKAnnotationView *annotationView;
@property (nonatomic, strong) YFWRNMapAnnotation *shopAnnotation;
@property (nonatomic, weak) BMKAnnotationView *shopAnnotationView;

@property (nonatomic, copy) RCTDirectEventBlock onClick;
@property (nonatomic, copy) RCTDirectEventBlock onTimeOut;
@property (nonatomic, assign) float userLatitude;
@property (nonatomic, assign) float userLongitude;
@property (nonatomic, copy) NSString *userTitle;
@property (nonatomic, copy) NSString *userMsg;
@property (nonatomic, assign) NSInteger userSecond;
@property (nonatomic, assign) float shopLatitude;
@property (nonatomic, assign) float shopLongitude;
@property (nonatomic, copy) NSString *shopTitle;
@property (nonatomic, copy) NSString *shopMsg;
@property (nonatomic, copy) NSString *shopImag;
@property (nonatomic, assign) NSInteger shopSecond;
@property (nonatomic, assign) BOOL showLine;
@end

@implementation YFWRNOrderMapView

- (instancetype)initWithFrame:(CGRect)frame {
  self = [super initWithFrame:frame];
  if (self) {
    [self configureBaiduMap];

    self.mapView = [[BMKMapView alloc] initWithFrame:frame];
    self.mapView.showsUserLocation = NO;
    self.mapView.delegate = self;
    self.mapView.mapType = BMKMapTypeStandard;
    [self addSubview:self.mapView];
  }
  return self;
}
- (void)layoutSubviews {
  self.mapView.frame = CGRectMake(0, 0, CGRectGetWidth(self.bounds), CGRectGetHeight(self.bounds));
}
-(void)mapViewWillAppear
{
    [self.mapView viewWillAppear];
}
-(void)mapViewWillDisappear
{
    [self.mapView viewWillDisappear];
}
- (void)setMapData:(NSDictionary *)mapData {
  _mapData = mapData;
  NSArray *listArray = mapData[@"dataArray"];
  self.showLine = [mapData[@"showLine"] boolValue];
  if ([listArray isKindOfClass:[NSArray class]]) {
    for (NSDictionary *info in listArray) {
      if (getSafeString(info[@"image"]).length > 0) {
        self.shopLatitude = [info[@"lat"] floatValue];
        self.shopLongitude = [info[@"lng"] floatValue];
        NSString *imgUrl = getSafeString(info[@"image"]);
        if ([imgUrl hasPrefix:@"/"]) {
          imgUrl = [NSString stringWithFormat:@"https:%@",imgUrl];
        }
        self.shopImag = imgUrl;
        self.shopTitle = info[@"title"];
        self.shopMsg = info[@"msg"];
        self.shopSecond = [info[@"second"] integerValue];
      } else {
        self.userLatitude = [info[@"lat"] floatValue];
        self.userLongitude = [info[@"lng"] floatValue];
        self.userTitle = info[@"title"];
        self.userMsg = info[@"msg"];
        self.userSecond = [info[@"second"] integerValue];
      }
    }
  }
  [self adjustRegin];
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
    
}
- (void)adjustRegin {
    float latitudeDistance = fabsf(self.userLatitude - self.shopLatitude);
    float longitudeDistance = fabsf(self.userLongitude - self.shopLongitude);
    if (latitudeDistance <= 0 || latitudeDistance > 1) {
      latitudeDistance = 0.025;
    }
    if (longitudeDistance <= 0|| longitudeDistance > 1) {
      longitudeDistance = 0.025;
    }
    float latitude = MIN(self.shopLatitude, self.userLatitude);
    float longitude = MIN(self.shopLongitude, self.userLongitude);
    if (self.shopLatitude <= 0 || self.shopLongitude <= 0) {
      latitude = self.userLatitude;
      longitude = self.userLongitude;
    } else if (self.userLatitude <= 0 || self.userLongitude <= 0) {
      latitude = self.shopLatitude;
      longitude = self.shopLongitude;
    }
    //修改地图尺度
    [self.mapView setRegion:
     BMKCoordinateRegionMake(CLLocationCoordinate2DMake(latitude,longitude),
                                                    BMKCoordinateSpanMake(latitudeDistance*3,longitudeDistance*3)) animated:YES];
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
    if ([annotation isKindOfClass:[YFWRNMapAnnotation class]])
    {
        YFWRNMapAnnotation *customAnnotation = (YFWRNMapAnnotation *)annotation;
        static NSString *reuseIndetifier = @"annotationReuseIndetifier";
        BMKAnnotationView *annotationView = [mapView dequeueReusableAnnotationViewWithIdentifier:reuseIndetifier];
        if (annotationView == nil)
        {
            annotationView = [[BMKAnnotationView alloc] initWithAnnotation:annotation
                                                              reuseIdentifier:reuseIndetifier];
        }
        if ([annotation.subtitle isEqualToString:@"shop"]) {
          YFWRNShopView *shopView = [[YFWRNShopView alloc] initWithImageUrl:[NSURL URLWithString:customAnnotation.img]];
          shopView.frame = CGRectMake(0, 0, 37, 41);
          UIImage *shopImage = [self convertViewToImage:shopView];
          annotationView.image = shopImage;
        } else {
          annotationView.image = [UIImage imageNamed:@"map_point_user.png"];
        }
        annotationView.calloutOffset = CGPointMake(0, -10);
        annotationView.canShowCallout = customAnnotation.title.length > 0 || customAnnotation.msg.length > 0;
        self.annotationView = annotationView;
        YFWRNMapPaopaoView *popView = [[[NSBundle mainBundle] loadNibNamed:@"YFWRNMapPaopaoView" owner:self options:nil] firstObject];
        popView.info = @{
          @"title":getSafeString(customAnnotation.title),
          @"msg":getSafeString(customAnnotation.msg),
          @"second":@(customAnnotation.second),
          @"subtitle":getSafeString(customAnnotation.subtitle),
        };
        popView.clickActionCallBack = ^(NSDictionary * _Nonnull info) {
          if (self.onClick) {
            self.onClick(@{@"type":annotation.subtitle?annotation.subtitle:@""});
          }
        };
      popView.timeEndCallBack = ^(NSDictionary * _Nonnull info) {
        if (self.onTimeOut) {
          self.onTimeOut(info);
        }
      };
      CGSize textSize = [customAnnotation.title sizeForFont:[UIFont systemFontOfSize:16] size:CGSizeMake(300, 21) mode:NSLineBreakByWordWrapping];
      CGSize msgTextSize = [customAnnotation.msg sizeForFont:[UIFont systemFontOfSize:11] size:CGSizeMake(300, 21) mode:NSLineBreakByWordWrapping];
        popView.bounds = CGRectMake(0, 0, MAX(msgTextSize.width + 30, MAX(110, textSize.width + 30)), 45);
        YFKActionPaopaoView *paopao = [[YFKActionPaopaoView alloc] initWithCustomView:popView];
        paopao.block = ^(int type) {
          if (self.onClick) {
            self.onClick(@{@"type":annotation.subtitle?annotation.subtitle:@""});
          }
        };
        annotationView.paopaoView = paopao;
        return annotationView;
    }
    return nil;
}
- (void)mapView:(BMKMapView *)mapView regionWillChangeAnimated:(BOOL)animated reason:(BMKRegionChangeReason)reason {
  if (reason == BMKRegionChangeReasonGesture) {
//    self.annotationView.image = [UIImage imageNamed:@"map_point_2.png"];
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
//    self.annotationView.image = [UIImage imageNamed:@"map_point_1.png"];
  }
//  self.userAnnotation.coordinate = mapView.centerCoordinate;
//  self.shopAnnotation.coordinate = mapView.centerCoordinate;
  
}

//处理位置坐标更新
- (void)BMKLocationManager:(BMKLocationManager *)manager didUpdateLocation:(BMKLocation *)location orError:(NSError *)error {
  
  if (error) {
    NSLog(@"locError:{%ld - %@};", (long)error.code, error.localizedDescription);
  }
  if (!location) {
    return;
  }
  
//  self.userLatitude = location.location.coordinate.latitude;
//  self.userLongitude = location.location.coordinate.longitude;
//  self.userLocation.location = location.location;
//  [self.mapView updateLocationData:self.userLocation];
  [self.mapView setCenterCoordinate:CLLocationCoordinate2DMake(self.userLatitude, self.userLongitude) animated:YES];
  [self adjustRegin];
}

#pragma mark - BMKMapViewDelegate

- (void)mapViewDidFinishLoading:(BMKMapView *)mapView {
  [self beginUpdatingLocation];
  BOOL showUser = NO;
  BOOL showShop = NO;
  if (self.userLatitude > 0 && self.userLongitude > 0) {
    [self.mapView addAnnotation:self.userAnnotation];
    if (self.userTitle.length > 0 || self.userMsg.length > 0) {
      [self.mapView selectAnnotation:self.userAnnotation animated:NO];
    }
    showUser = YES;
  }
  if (self.shopLatitude > 0 && self.shopLongitude > 0) {
    [self.mapView addAnnotation:self.shopAnnotation];
    if (self.shopTitle.length > 0 || self.shopMsg.length > 0) {
      [self.mapView selectAnnotation:self.shopAnnotation animated:NO];
    }
    showShop = YES;
  }
  if (showShop && showUser && self.showLine) {
    //添加弧线覆盖物
    //传入的坐标顺序为起点、途经点、终点
    CLLocationCoordinate2D coords[3] = {0};
    coords[0].latitude = self.shopLatitude;
    coords[0].longitude = self.shopLongitude;
    coords[1].latitude = [self getMidPoint:CLLocationCoordinate2DMake(self.shopLatitude, self.shopLongitude) and:CLLocationCoordinate2DMake(self.userLatitude, self.userLongitude)].latitude;
    coords[1].longitude = [self getMidPoint:CLLocationCoordinate2DMake(self.shopLatitude, self.shopLongitude) and:CLLocationCoordinate2DMake(self.userLatitude, self.userLongitude)].longitude;
    coords[2].latitude = self.userLatitude;
    coords[2].longitude = self.userLongitude;
    BMKArcline *arcline = [BMKArcline arclineWithCoordinates:coords];
    [mapView addOverlay:arcline];
  }
  
}
//view转成Image
- (UIImage *)convertViewToImage:(UIView *)view {
    
    UIImage *imageRet = [[UIImage alloc]init];
//开启上下文 参数1：CGSize size 尺寸, 参数2：BOOL opaque 透明度, 参数3：CGFloat scale 比例
    UIGraphicsBeginImageContextWithOptions(view.frame.size, NO, [UIScreen mainScreen].scale);
//获取图像
    [view.layer renderInContext:UIGraphicsGetCurrentContext()];
    imageRet = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    
    return imageRet;
    
}
- (float)dealCenter:(float)one two:(float)two {
  float distance = fabsf(one-two)/2.0;
  if (one >= two) {
    distance = one + distance;
  } else {
    distance = two - distance;
  }
  return distance;
}
- (CLLocationCoordinate2D)getMidPoint:(CLLocationCoordinate2D)start and:(CLLocationCoordinate2D)end {
  double t, t2, h,h2;
  double lng1 = start.longitude;
  double lng2 = end.longitude;
  double lat1 = start.latitude;
  double lat2 = end.latitude;

  if (lng2 > lng1) {
      if ((lng2 - lng1) > 180) {
          if (lng1 < 0) {
              lng1 = (180 + 180 + lng1);
          }
      }
  }
  if (lng1 > lng2) {
      if ((lng1 - lng2) > 180) {
          if (lng2 < 0) {
              lng2 = (180 + 180 + lng2);
          }
      }
  }
  if (lat2 == lat1) {
      t = 0;
      h = lng1 - lng2;
  } else {
      if (lng2 == lng1) {
          t = M_PI / 2;
          h = lat1 - lat2;
      } else {
          t = atan((lat2 - lat1) / (lng2 - lng1));
          h = (lat2 - lat1) / sin(t);
      }
  }
  t2 = (t + (M_PI / 10));
  h2 = h / 2;
  double lng3 = h2 * cos(t2) + lng1;
  double lat3 = h2 * sin(t2) + lat1;
  return CLLocationCoordinate2DMake(lat3, lng3);
}
- (void)mapView:(BMKMapView *)mapView onClickedMapBlank:(CLLocationCoordinate2D)coordinate {

}

- (void)mapview:(BMKMapView *)mapView onDoubleClick:(CLLocationCoordinate2D)coordinate {
    
}

- (void)mapView:(BMKMapView *)mapView onClickedMapPoi:(BMKMapPoi *)mapPoi {

}

- (void)mapView:(BMKMapView *)mapView didSelectAnnotationView:(BMKAnnotationView *)view {
  
}

- (void)mapStatusDidChanged:(BMKMapView *)mapView
{
    
}
/**
 根据overlay生成对应的BMKOverlayView

 @param mapView 地图View
 @param overlay 指定的overlay
 @return 生成的覆盖物View
 */
- (BMKOverlayView *)mapView:(BMKMapView *)mapView viewForOverlay:(id<BMKOverlay>)overlay
{
    if ([overlay isKindOfClass:[BMKArcline class]])
    {
        BMKArclineView *arclineView = [[BMKArclineView alloc] initWithArcline:overlay];
        arclineView.strokeColor = [UIColor colorWithHexString:@"#256acd"];
        arclineView.lineDash = YES;
        arclineView.lineWidth = 2.0;
        return arclineView;
    }
    return nil;
}
#pragma mark - BMKLocationServiceDelegate


- (void)didFailToLocateUserWithError:(NSError *)error {
    [self.locService stopUpdatingLocation];
}


#pragma mark - lazy
- (YFWRNMapAnnotation *)userAnnotation {
  if (!_userAnnotation) {
    YFWRNMapAnnotation *annotation = [YFWRNMapAnnotation new];
    annotation.coordinate = CLLocationCoordinate2DMake(self.userLatitude, self.userLongitude);
    annotation.title = self.userTitle;
    annotation.subtitle = @"user";
    annotation.msg = self.userMsg;
    annotation.second = self.userSecond;
    _userAnnotation = annotation;
  }
  return _userAnnotation;
}
- (YFWRNMapAnnotation *)shopAnnotation {
  if (!_shopAnnotation) {
    YFWRNMapAnnotation *annotation = [YFWRNMapAnnotation new];
    annotation.coordinate = CLLocationCoordinate2DMake(self.shopLatitude, self.shopLongitude);
    annotation.title = self.shopTitle;
    annotation.subtitle = @"shop";
    annotation.msg = self.shopMsg;
    annotation.second = self.shopSecond;
    annotation.img = self.shopImag;
    _shopAnnotation = annotation;
  }
  return _shopAnnotation;
}
@end

