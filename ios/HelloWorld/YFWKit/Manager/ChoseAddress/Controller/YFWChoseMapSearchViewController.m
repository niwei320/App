//
//  YFWChoseMapSearchViewController.m
//  YaoFang
//
//  Created by 小猪猪 on 16/6/7.
//  Copyright © 2016年 SQC. All rights reserved.
//

#import "YFWChoseMapSearchViewController.h"
#import "YFWChoseMapSearchTableViewCell.h"
#import <BaiduMapAPI_Map/BMKMapComponent.h>
#import "YFWBaiduMapManager.h"
#import "YFWEventManager.h"

@interface YFWChoseMapSearchViewController ()<UITextFieldDelegate,BMKPoiSearchDelegate>



@property (strong, nonatomic) NSMutableArray *dataArray;

@property (weak, nonatomic) IBOutlet UITableView *mainTableView;
@property (assign, nonatomic) BOOL isCanSearch;
@property (strong, nonatomic) UIView *titleView;

@property (strong, nonatomic) UITextField *searchTextfield;
@property (strong, nonatomic) BMKPoiSearch *searcher;
@end

@implementation YFWChoseMapSearchViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.title = @"搜索";
    self.isCanSearch = YES;
    [self performSelector:@selector(searchTheMapWith) withObject:nil afterDelay:1.0];
    
    self.mainTableView.tableFooterView = [[UIView alloc] init];
  
    UIBarButtonItem *leftBarButtonItem = [[UIBarButtonItem alloc] initWithImage:[UIImage imageNamed:@"backgreen"] style:UIBarButtonItemStylePlain target:self action:@selector(backMethod)];
    self.navigationItem.leftBarButtonItem = leftBarButtonItem;
    
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    [self.navigationController.navigationBar addSubview:self.titleView];
    [self.searchTextfield becomeFirstResponder];
    self.navigationController.navigationBarHidden = NO;
  
}

- (void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];
    [self.titleView removeFromSuperview];
    self.isCanSearch = NO;
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
        _searchTextfield = [[UITextField alloc] initWithFrame:CGRectMake(10, 0, kScreenWidth-100, 30)];
        _searchTextfield.delegate = self;
        [_titleView addSubview:_searchTextfield];

        
    }
    return _titleView;
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
    YFWChoseMapSearchTableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"YFWChoseMapSearchTableViewCell"];
    if(!cell)
    {
        cell = [YFWChoseMapSearchTableViewCell getYFWChoseMapSearchTableViewCell];
        cell.selectionStyle = UITableViewCellSelectionStyleNone;
        
    }
    
    [cell setDataArray:self.dataArray[indexPath.row]];
    
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
  
    //选择地址
    BMKPoiInfo *obj = self.dataArray[indexPath.row];
    [[YFWBaiduMapManager shareManager] setAddressInfo:obj];
    self.navigationController.navigationBarHidden = YES;
    [self.navigationController popToRootViewControllerAnimated:YES];
    [YFWEventManager emit:@"addressNotification" Data:@{@"name":obj.name}];
  
}

- (BOOL)textField:(UITextField *)textField shouldChangeCharactersInRange:(NSRange)range replacementString:(NSString *)string
{
    
    return YES;
}

- (void)searchTheMapWith
{
    if (!self.isCanSearch) {
        return;
    }
    
    //初始化检索对象
    _searcher =[[BMKPoiSearch alloc]init];
    _searcher.delegate = self;
    //发起检索
    BMKPOINearbySearchOption *option = [[BMKPOINearbySearchOption alloc]init];
    option.pageIndex = 0;
    float latitude = [YFWBaiduMapManager shareManager].latitude;
    float longitude = [YFWBaiduMapManager shareManager].longitude;
  
    option.location = CLLocationCoordinate2DMake(latitude, longitude);
    option.keywords = @[self.searchTextfield.text];
    BOOL flag = [_searcher poiSearchNearBy:option];
    if(flag)
    {
        NSLog(@"周边检索发送成功");
    }
    else
    {
        NSLog(@"周边检索发送失败");
    }
    [self performSelector:@selector(searchTheMapWith) withObject:nil afterDelay:1.0];

}

//实现PoiSearchDeleage处理回调结果
- (void)onGetPoiResult:(BMKPoiSearch*)searcher result:(BMKPOISearchResult*)poiResultList errorCode:(BMKSearchErrorCode)error
{
    if (error == BMK_SEARCH_NO_ERROR) {
        //在此处理正常结果
      self.dataArray = poiResultList.poiInfoList.mutableCopy;
      [self.mainTableView reloadData];
    }
    else if (error == BMK_SEARCH_AMBIGUOUS_KEYWORD){
        //当在设置城市未找到结果，但在其他城市找到结果时，回调建议检索城市列表
        // result.cityList;
        NSLog(@"起始点有歧义");
    } else {
        NSLog(@"抱歉，未找到结果");
    }
}




@end
