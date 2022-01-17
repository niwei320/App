//
//  YFWAroundViewController.m
//  YaoFang
//
//  Created by 小猪猪 on 16/5/24.
//  Copyright © 2016年 SQC. All rights reserved.
//

#import "YFWAroundViewController.h"

#import "YFWBaiduMapManager.h"
#import "YFRateView.h"
#import "YFSignedStatusView.h"
#import "YFAnnotationView.h"
#import "YFShopTableCell.h"
#import "YFShop.h"
#import "YFWArroundTableViewCell.h"
#import "YFWSocketManager.h"
#import "YFWBridgeManager.h"

@interface YFWAroundViewController ()<BMKMapViewDelegate, BMKLocationManagerDelegate,UITableViewDelegate, UITableViewDataSource>

@property (nonatomic, weak) IBOutlet UITableView *tableView;
@property (nonatomic, assign) BOOL showingTable;

@property (nonatomic, strong) BMKLocationManager *locationService;

@property (weak, nonatomic) IBOutlet UIView *baiduView;
@property (nonatomic, strong) BMKMapView *mapView;
@property (nonatomic, strong) BMKUserLocation *userLocation;
@property (nonatomic, strong) YFAnnotationView *selectAnnotationView;

@property (nonatomic, assign) BOOL needRefreshDate;
@property (nonatomic, assign) BOOL adjustedCenter;

@property (nonatomic, strong) NSArray *shops;
@property (nonatomic, strong) YFShop *selectedShop;

@property (nonatomic, strong) UIButton *rightBtn;

@end

static NSString *kCellReuseID = @"cellReuseID";

@implementation YFWAroundViewController


#pragma mark - view controller method

- (void)viewDidLoad {
    [super viewDidLoad];
  
    self.navigationController.navigationBar.shadowImage = [UIImage new];
    self.navigationController.navigationBar.translucent = NO;
    self.navigationController.navigationBar.backgroundColor = [UIColor whiteColor];
    self.navigationItem.title = @"附近的药店";
  
    CGFloat height = [UIApplication sharedApplication].statusBarFrame.size.height+44;
    self.mapView = [[BMKMapView alloc]initWithFrame:CGRectMake(0, 0, kScreenWidth, kScreenHeight-height)];
    [BMKMapView enableCustomMapStyle:NO];
    self.mapView.showsUserLocation = YES;
    self.mapView.delegate = self;
    self.mapView.mapType = BMKMapTypeStandard;
    self.baiduView.backgroundColor = [UIColor clearColor];
    [self.baiduView addSubview:self.mapView];
    self.baiduView.frame = CGRectMake(0, 0, kScreenWidth, kScreenHeight-height);
    
    self.locationService = [YFWBaiduMapManager shareManager].locService;
    self.locationService.delegate = self;
    [self.locationService startUpdatingLocation];
    [self.locationService startUpdatingHeading];
    
    UILabel *tableFooterLbl = [[UILabel alloc] initWithFrame:CGRectMake(0, 0, PP_SCREEN_WIDTH, 200)];
    tableFooterLbl.text = @"暂无信息";
    tableFooterLbl.textAlignment = NSTextAlignmentCenter;
    self.tableView.tableFooterView = tableFooterLbl;
    [self.tableView registerClass:[YFShopTableCell class] forCellReuseIdentifier:kCellReuseID];
    [self performSelector:@selector(refreshDate) withObject:nil afterDelay:1.0];
    
    self.tableView.frame = CGRectMake(0, 0, kScreenWidth, kScreenHeight-height);
  
    UIButton *rightButton = [[UIButton alloc] initWithFrame:CGRectMake(0, 7, 45, 30)];
    [rightButton setImage:[UIImage imageNamed:@"medicine_list"] forState:UIControlStateNormal];
    [rightButton setImage:[UIImage imageNamed:@"map"] forState:UIControlStateSelected];
    rightButton.titleLabel.font = [UIFont systemFontOfSize:14];
    [rightButton setTitleColor:[UIColor darkGrayColor] forState:UIControlStateNormal];
    [rightButton addTarget:self action:@selector(switchMapTable:) forControlEvents:UIControlEventTouchUpInside];
    UIBarButtonItem *rightItem = [[UIBarButtonItem alloc] initWithCustomView:rightButton];
    self.navigationItem.rightBarButtonItem = rightItem;
    self.rightBtn = rightButton;
  
    UIBarButtonItem *leftBarButtonItem = [[UIBarButtonItem alloc] initWithImage:[UIImage imageNamed:@"backgreen"] style:UIBarButtonItemStylePlain target:self action:@selector(backMethod)];
    self.navigationItem.leftBarButtonItem = leftBarButtonItem;
  
  
    [self.view sendSubviewToBack:self.tableView];

}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    [UIApplication sharedApplication].statusBarStyle =  UIStatusBarStyleDefault;
    self.navigationController.navigationBarHidden = NO;
    //百度地图的MapView在使用autolayot时UI会有问题，所以用这种方法适应屏幕
    self.mapView.frame = CGRectMake(0, 0, PP_SCREEN_WIDTH, PP_SCREEN_HEIGHT  - [UIApplication sharedApplication].statusBarFrame.size.height-44);
    [self.tableView deselectRowAtIndexPath:[self.tableView indexPathForSelectedRow] animated:NO];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
}

- (void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];
    self.navigationController.navigationBarHidden = YES;
    [YFWProgressHUD dismiss];
}

- (void)backMethod{
  
    [self.navigationController popViewControllerAnimated:YES];
  
}

#pragma mark - BMKMapViewDelegate

- (void)mapViewDidFinishLoading:(BMKMapView *)mapView {
    
    
}

- (void)mapView:(BMKMapView *)mapView onClickedMapBlank:(CLLocationCoordinate2D)coordinate {
    NSLog(@"map view: click blank");
}

- (void)mapview:(BMKMapView *)mapView onDoubleClick:(CLLocationCoordinate2D)coordinate {
    NSLog(@"map view: double click");
}

- (void)mapStatusDidChanged:(BMKMapView *)mapView
{
    
}

#pragma mark - Navigation

- (void)showShopDetailWithShop:(YFShop *)shop {
  
  
//  [self backMethod];
  
  NSDictionary *info = @{@"type":@"get_shop_detail",
                         @"value":getSafeString(shop.ID)};
  
  //跳转商家详情页面
  if (self.returnBlock) {
    self.returnBlock(info);
  }
  
}

#pragma mark - data

- (void)refreshDate {
  
    float latitude = [YFWBaiduMapManager shareManager].latitude;
    float longitude = [YFWBaiduMapManager shareManager].longitude;
  
    [self.mapView setCenterCoordinate:CLLocationCoordinate2DMake(latitude, longitude) animated:YES];
    
    [self requestShops];
  
}

- (void)requestShops {

  __weak typeof(self)weakSelf = self;
  float latitude = [AppDelegate sharedInstances].getBaiduManager.latitude;
  float longitude = [AppDelegate sharedInstances].getBaiduManager.longitude;
  
  NSDictionary *param = @{@"__cmd" : @"guest.common.app.getNearShop",
                          @"lng" : [NSString stringWithFormat:@"%f",longitude],
                          @"lat" : [NSString stringWithFormat:@"%f",latitude] };
  YFWSocketManager *manager = [YFWSocketManager shareManager];
  [manager requestAsynParameters:param success:^(id responseObject) {
    
    NSArray *shops = [responseObject objectForKey:@"result"];
    NSMutableArray *mshops = [NSMutableArray array];
    for (NSDictionary *dic in shops) {
      YFShop *shop = [[YFShop alloc] initWithTcpDic:dic];
      [mshops addObject:shop];
    }
    
    if (mshops.count) {
      weakSelf.shops = mshops;
      [weakSelf.mapView addAnnotations:weakSelf.shops];
      [weakSelf.tableView reloadData];
      weakSelf.tableView.tableFooterView = nil;
      
      [weakSelf adjustRegin];
    }
    
  } failure:^(NSError *error) {
    NSLog(@"");
  }];
  
}

- (void)adjustRegin {
    
    
    float lon = [YFWBaiduMapManager shareManager].longitude;   //121.618484
    float lat = [YFWBaiduMapManager shareManager].latitude;  //31.2131443
    
    //修改地图尺度
    [self.mapView setRegion:BMKCoordinateRegionMake(CLLocationCoordinate2DMake(lat,lon),BMKCoordinateSpanMake(0.1,0.1))animated:YES];
    
    
}

#pragma mark - set
- (BMKUserLocation *)userLocation{
  
  if (!_userLocation) {
    _userLocation = [[BMKUserLocation alloc] init];
  }
  return _userLocation;
}

#pragma mark - BMKLocationServiceDelegate

- (void)BMKLocationManager:(BMKLocationManager *)manager didUpdateHeading:(CLHeading *)heading {
  if (!heading) {
    return;
  }
  
  self.userLocation.heading = heading;
  [self.mapView updateLocationData:self.userLocation];
}


- (void)BMKLocationManager:(BMKLocationManager *)manager didUpdateLocation:(BMKLocation *)location orError:(NSError *)error {
  
    if (error) {
      NSLog(@"locError:{%ld - %@};", (long)error.code, error.localizedDescription);
    }
    if (!location) {
      return;
    }
  
    if (self.needRefreshDate) {
        [self requestShops];
    }
  
    self.userLocation.location = location.location;
    if (!self.adjustedCenter) {
        self.adjustedCenter = YES;
        self.mapView.centerCoordinate = self.userLocation.location.coordinate;
    }
    [self.mapView updateLocationData:self.userLocation];
}

- (void)didFailToLocateUserWithError:(NSError *)error {
    [self.locationService stopUpdatingLocation];
    [self.locationService stopUpdatingHeading];
}

#pragma mark - action

//到这去的方法
- (IBAction)goHereAction:(id)sender
{
    [self selectAllMapAlert];
    
}

- (void)selectAllMapAlert{
    
    UIAlertController *alter = [UIAlertController alertControllerWithTitle:nil message:@"请选择您已经安装的导航工具" preferredStyle:UIAlertControllerStyleActionSheet];
    __weak typeof(self)weakSelf = self;
    //苹果地图
    UIAlertAction *appleMap = [UIAlertAction actionWithTitle:@"苹果地图" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        [weakSelf openAppleMap];
    }];
    [alter addAction:appleMap];
    
    NSString *shopName = self.selectedShop.name.length>0?self.selectedShop.name:@"目的地";
    CLLocationCoordinate2D endLocation = self.selectedShop.coordinate;
    //百度地图
    if ([[UIApplication sharedApplication] canOpenURL:[NSURL URLWithString:@"baidumap://"]]) {
        UIAlertAction *baiduMap = [UIAlertAction actionWithTitle:@"百度地图" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
            
            NSString *urlString = [[NSString stringWithFormat:@"baidumap://map/direction?origin={{我的位置}}&destination=latlng:%f,%f|name=%@&mode=driving&coord_type=bd09ll&region=%@",endLocation.latitude,endLocation.longitude,shopName,shopName] stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
            [[UIApplication sharedApplication] openURL:[NSURL URLWithString:urlString]];
        }];
        [alter addAction:baiduMap];
    }
    
    //高德地图
    if ([[UIApplication sharedApplication] canOpenURL:[NSURL URLWithString:@"iosamap://"]]) {
        UIAlertAction *gaodeMap = [UIAlertAction actionWithTitle:@"高德地图" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
            
            NSString *urlString = [[NSString stringWithFormat:@"iosamap://navi?sourceApplication=%@&backScheme=%@&lat=%f&lon=%f&dev=0&style=2",@"导航功能",@"yaofangwang",endLocation.latitude,endLocation.longitude] stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
            [[UIApplication sharedApplication] openURL:[NSURL URLWithString:urlString]];
        }];
        [alter addAction:gaodeMap];
    }
    
    //谷歌地图
    if ([[UIApplication sharedApplication] canOpenURL:[NSURL URLWithString:@"comgooglemaps://"]]) {
        UIAlertAction *gaodeMap = [UIAlertAction actionWithTitle:@"谷歌地图" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
            
            NSString *urlString = [[NSString stringWithFormat:@"comgooglemaps://?x-source=%@&x-success=%@&saddr=&daddr=%f,%f&directionsmode=driving",@"导航测试",@"yaofangwang",endLocation.latitude, endLocation.longitude] stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
            [[UIApplication sharedApplication] openURL:[NSURL URLWithString:urlString]];
        }];
        [alter addAction:gaodeMap];
    }
    
    UIAlertAction *cancle = [UIAlertAction actionWithTitle:@"取消" style:UIAlertActionStyleCancel handler:nil];
    [alter addAction:cancle];
    
    [self presentViewController:alter animated:YES completion:nil];
    
}

- (void)openAppleMap{
    
    CLLocationCoordinate2D loc = self.selectedShop.coordinate;
    MKMapItem *currentLocation = [MKMapItem mapItemForCurrentLocation];
    MKMapItem *toLocation = [[MKMapItem alloc] initWithPlacemark:[[MKPlacemark alloc] initWithCoordinate:loc addressDictionary:nil]];
    toLocation.name = self.selectedShop.name;
    [MKMapItem openMapsWithItems:@[currentLocation, toLocation]
                   launchOptions:@{MKLaunchOptionsDirectionsModeKey: MKLaunchOptionsDirectionsModeDriving,
                                   MKLaunchOptionsShowsTrafficKey: [NSNumber numberWithBool:YES]}];
    
}


- (IBAction)refreshButtonClick:(id)sender {
    [self refreshDate];
}

- (IBAction)switchMapTable:(UIBarButtonItem *)sender {
    self.showingTable = !self.showingTable;
  
    self.rightBtn.selected = self.showingTable;
  

    [UIView beginAnimations:@"switch animation" context:nil];
    [UIView setAnimationTransition:UIViewAnimationTransitionFlipFromLeft
                           forView:self.view
                             cache:NO];
    [UIView setAnimationDuration:0.3];
    if (self.showingTable) {
        
        [self.view bringSubviewToFront:self.tableView];
        
    } else {
        
        [self.view sendSubviewToBack:self.tableView];
    }
    sender.title = self.showingTable ? @"地图" : @"列表";
    [UIView commitAnimations];
}

- (IBAction)mapShowDetailClick:(id)sender {
    [self showShopDetailWithShop:self.selectedShop];
}

#pragma mark - BMKMapViewDelegate

- (BMKAnnotationView *)mapView:(BMKMapView *)mapView viewForAnnotation:(id <BMKAnnotation>)annotation {
    static NSString *reuseID = @"reuseID";
    YFAnnotationView *annotationView = [[YFAnnotationView alloc] initWithAnnotation:annotation reuseIdentifier:reuseID];
    annotationView.block = ^(int type) {
      if (type == 1) {
        [self showShopDetailWithShop:(YFShop *)annotation];
      }else{
        YFShop *shop = (YFShop *)annotation;
        [[YFWBridgeManager new] navThirdMapWithLocation:shop.coordinate andTitle:shop.name];
      }
    };

    if (!annotationView) {
      
      annotationView = [[YFAnnotationView alloc] initWithAnnotation:annotation reuseIdentifier:reuseID];
      annotationView.block = ^(int type) {
        if (type == 1) {
          [self showShopDetailWithShop:(YFShop *)annotation];
        }else{
          YFShop *shop = (YFShop *)annotation;
          [[YFWBridgeManager new] navThirdMapWithLocation:shop.coordinate andTitle:shop.name];
        }
      };
      
    } else {
      annotationView.annotation = annotation;
    }
    
    return annotationView;
}

- (void)mapView:(BMKMapView *)mapView annotationViewForBubble:(BMKAnnotationView *)view {
  
//    [self showShopDetailWithShop:(YFShop *)view.annotation];
}


#pragma mark - UITableViewDateSource

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return [self.shops count];
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    YFWArroundTableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"YFWArroundTableViewCell"];
    if (!cell) {
        cell = [YFWArroundTableViewCell getYFWArroundTableViewCell];
    }
    
    [cell setDataObject:[self.shops objectAtIndex:indexPath.row]];
    
    return cell;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
  return 100;
}

#pragma mark - UITableViewDelegate

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    [self showShopDetailWithShop:[self.shops objectAtIndex:indexPath.row]];
}


@end
