//
//  YFWChoseMapViewController.m
//  YaoFang
//
//  Created by 小猪猪 on 16/6/7.
//  Copyright © 2016年 SQC. All rights reserved.
//

#import "YFWChoseMapViewController.h"
#import "YFWChoseSearchTableViewCell.h"
#import "YFWChoseMapSearchViewController.h"
#import "YFWBaiduMapManager.h"
#import "YFWEventManager.h"


@interface YFWChoseMapViewController ()<BMKMapViewDelegate, BMKLocationManagerDelegate,BMKGeoCodeSearchDelegate>

@property (nonatomic, weak) IBOutlet UITableView *mainTableView;

@property (nonatomic, strong) UIView *titleView;
@property (nonatomic, strong) BMKMapView *mapView;

@property (nonatomic, strong) NSMutableArray *dataArray;

@property (nonatomic, strong) BMKLocationManager *locService;
@property (nonatomic, strong) BMKMapManager *bmkManager;
@property (nonatomic, strong) BMKGeoCodeSearch *searcher;
@property (nonatomic, strong) BMKUserLocation *userLocation;
@property (nonatomic, strong) BMKPointAnnotation *annotation;

@property (nonatomic, assign) float latitude;
@property (nonatomic, assign) float longitude;

@property (nonatomic, copy) NSString *cityName;

@end

@implementation YFWChoseMapViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    UIBarButtonItem *rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:@"搜索" style:UIBarButtonItemStylePlain target:self action:@selector(gotoSearch)];
    rightBarButtonItem.tintColor = [UIColor yf_greenColor_new];
    self.navigationItem.rightBarButtonItem = rightBarButtonItem;
  
    UIBarButtonItem *leftBarButtonItem = [[UIBarButtonItem alloc] initWithImage:[UIImage imageNamed:@"backgreen"] style:UIBarButtonItemStylePlain target:self action:@selector(backMethod)];
    self.navigationItem.leftBarButtonItem = leftBarButtonItem;
  
    [self configureBaiduMap];

    self.mapView = [[BMKMapView alloc]initWithFrame:CGRectMake(0, 64, kScreenWidth, kScreenHeight-64)];
    self.mapView.showsUserLocation = YES;
    self.mapView.delegate = self;
    self.mapView.mapType = BMKMapTypeStandard;
    [self.view addSubview:self.mapView];
        
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    [self.navigationController.navigationBar addSubview:self.titleView];
    [self.view bringSubviewToFront:self.mainTableView];
    self.navigationController.navigationBarHidden = NO;
    
}

- (void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];
    [self.titleView removeFromSuperview];
    self.navigationController.navigationBarHidden = YES;
    
}

- (void)backMethod{
  
  [self.navigationController popViewControllerAnimated:YES];
  
}

- (UIView *)titleView
{
    if (!_titleView) {
        _titleView = [[UIView alloc] initWithFrame:CGRectMake(50, 7, kScreenWidth-120, 30)];
        _titleView.backgroundColor = [UIColor yf_grayColor_new];
        _titleView.layer.cornerRadius = 5;
        
        UIImageView *imageView = [[UIImageView alloc]initWithFrame:CGRectMake(10, 7, 15, 15)];
        imageView.image = [UIImage imageNamed:@"top_bar_search"];
        [_titleView addSubview:imageView];
        
        UILabel *label = [[UILabel alloc]initWithFrame:CGRectMake(30, 2, 150, 26)];
        label.text = @"输入小区、写字楼、学校等";
        label.font = [UIFont systemFontOfSize:11];
        label.textColor = [UIColor grayColor];
        [_titleView addSubview:label];
        
        UIButton *button = [UIButton buttonWithType:UIButtonTypeCustom];
        [button setFrame:CGRectMake(50, 5, kScreenWidth-100, 30)];
        [button addTarget:self action:@selector(gotoSearch) forControlEvents:UIControlEventTouchUpInside];
        [_titleView addSubview:button];
    }
    return _titleView;
}


- (void)gotoSearch
{
    YFWChoseMapSearchViewController *search = [[YFWChoseMapSearchViewController alloc] initWithNibName:@"YFWChoseMapSearchViewController" bundle:[NSBundle mainBundle]];
    [self.navigationController pushViewController:search animated:YES];
    
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

#pragma mark - tableview delegate

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return self.dataArray.count;
}

-(CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
    return 70;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    YFWChoseSearchTableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"YFWChoseSearchTableViewCell"];
    if(!cell)
    {
        cell = [YFWChoseSearchTableViewCell getYFWChoseSearchTableViewCell];
        cell.selectionStyle = UITableViewCellSelectionStyleNone;
        
    }
     
    [cell setDataArray:self.dataArray[indexPath.row]];
    
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
  
      //点击选择新地址

    BMKPoiInfo *obj = self.dataArray[indexPath.row];
    [[YFWBaiduMapManager shareManager] setAddressInfo:obj];
    [self.navigationController popToRootViewControllerAnimated:YES];
    [YFWEventManager emit:@"addressNotification" Data:@{@"name":obj.name}];

}

- (CGFloat)tableView:(UITableView *)tableView heightForHeaderInSection:(NSInteger)section;
{
    return 40;
}

- (nullable UIView *)tableView:(UITableView *)tableView viewForHeaderInSection:(NSInteger)section
{
    UIView *view = [[UIView alloc] initWithFrame:CGRectMake(0, 0, kScreenWidth, 40)];
    view.backgroundColor = [UIColor whiteColor];
    
    UILabel *label = [[UILabel alloc] initWithFrame:CGRectMake(10, 0, kScreenHeight-20, 40)];
    label.font = [UIFont systemFontOfSize:14];
    label.text = @"附近地址";
    [view addSubview:label];
    

    UIView *lineView2 = [[UIView alloc] initWithFrame:CGRectMake(0, 39, kScreenWidth, 1)];
    lineView2.backgroundColor = [UIColor yf_grayColor_new];
    [view addSubview:lineView2];
    
    return view;
}

- (void)BMKLocationManager:(BMKLocationManager *)manager didUpdateHeading:(CLHeading *)heading {
  if (!heading) {
    return;
  }
  
  self.userLocation.heading = heading;
  [self.mapView updateLocationData:self.userLocation];
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
  [self.mapView updateLocationData:self.userLocation];
  [self.mapView setCenterCoordinate:CLLocationCoordinate2DMake(self.latitude, self.longitude) animated:YES];
  [self adjustRegin];
}

//接收反向地理编码结果
-(void) onGetReverseGeoCodeResult:(BMKGeoCodeSearch *)searcher result:(BMKReverseGeoCodeSearchResult *)result errorCode:(BMKSearchErrorCode)error{
    if (error == BMK_SEARCH_NO_ERROR) {
        
        self.cityName = [self getRightCityName:result];
        
    }
    else {
        
        self.cityName = @"全国";
    }
    self.dataArray = result.poiList.mutableCopy;
    [self.mainTableView reloadData];
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
    
    
}

- (void)mapView:(BMKMapView *)mapView onClickedMapBlank:(CLLocationCoordinate2D)coordinate {
  self.annotation.coordinate = coordinate;
  [self.mapView addAnnotation:self.annotation];
  [self startReverseGeoWith:coordinate];
}

- (void)mapview:(BMKMapView *)mapView onDoubleClick:(CLLocationCoordinate2D)coordinate {
    NSLog(@"map view: double click");
}

- (void)mapView:(BMKMapView *)mapView onClickedMapPoi:(BMKMapPoi *)mapPoi {
  self.annotation.coordinate = mapPoi.pt;
  [self.mapView addAnnotation:self.annotation];
  [self startReverseGeoWith:mapPoi.pt];
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
    annotation.title = @"是否修改定位为当前地点";
    _annotation = annotation;
  }
  return _annotation;
}

@end
