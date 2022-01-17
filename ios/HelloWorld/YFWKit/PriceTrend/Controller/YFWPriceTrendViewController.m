//
//  YFWPriceTrendViewController.m
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/13.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import "YFWPriceTrendViewController.h"
#import "YFWPriceTrendDataSource.h"
#import "YFWPriceTrendDelegate.h"
#import "YFWPriceTrendViewModel.h"
#import "YFWPriceTrendHeaderCell.h"
#import "YFWPriceTrendCenterCell.h"
#import "YFWPriceTrendFooterCell.h"
#import "YFWPicShareView.h"
//#import "YFSellersListViewController.h"
#import "YFWPriceTrendModel.h"
#import "YFWLoadingView.h"

@interface YFWPriceTrendViewController ()

@property (nonatomic, strong) UITableView *mainTableView;
@property (nonatomic, strong) YFWPriceTrendDataSource *tableDataSource;
@property (nonatomic, strong) YFWPriceTrendDelegate *tableDelegate;
@property (nonatomic, strong) YFWPriceTrendViewModel *viewModel;

@property (nonatomic, strong) YFWPriceTrendCenterCell *centerCell;
@property (nonatomic, strong) NSDictionary *oneMonthItem;
@property (nonatomic, strong) NSDictionary *threeMonthItem;
@property (nonatomic, strong) NSDictionary *oneYearItem;

@end

@implementation YFWPriceTrendViewController
- (void)viewDidLoad {
    [super viewDidLoad];
    [AppDelegate sharedInstances].nav.navigationBarHidden = YES;
    [self setupNavgation];
  
    [self configTableView];
    [self configViewModel];
    
    [self.view addSubview:self.mainTableView];
}


#pragma mark - Config

- (void)setupNavgation {
    UIView *navView = [UIView new];
    [self.view addSubview:navView];
  
    UIImageView *backView = [UIImageView new];
    backView.image = [UIImage imageNamed:@"icon_navgation"];
    [navView addSubview:backView];
  
    UIButton *backButton = [UIButton buttonWithType:UIButtonTypeCustom];
    [backButton setImage:[UIImage imageNamed:@"icon_back_white"] forState:UIControlStateNormal];
    [backButton setImage:[UIImage imageNamed:@"icon_back_white"] forState:UIControlStateHighlighted];
    [backButton addTarget:self action:@selector(backMethod) forControlEvents:UIControlEventTouchUpInside];
    [navView addSubview:backButton];
  
    UILabel *titleLabel = [UILabel new];
    titleLabel.text = @"价格趋势";
    titleLabel.textColor = [UIColor whiteColor];
    titleLabel.font = [UIFont boldSystemFontOfSize:17];
    titleLabel.textAlignment = NSTextAlignmentCenter;
    [navView addSubview:titleLabel];
  
    UIButton *shareButton = [UIButton buttonWithType:UIButtonTypeCustom];
    [shareButton setImage:[UIImage imageNamed:@"icon_share_white"] forState:UIControlStateNormal];
    [shareButton setImage:[UIImage imageNamed:@"icon_share_white"] forState:UIControlStateHighlighted];
    [shareButton addTarget:self action:@selector(shareMethod) forControlEvents:UIControlEventTouchUpInside];
    [navView addSubview:shareButton];
  
    [navView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.right.top.equalTo(self.view);
        make.height.mas_offset(NavigationHeight);
    }];
  
    [backView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.right.top.bottom.equalTo(navView);
    }];
  
    [backButton mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.bottom.mas_equalTo(navView);
        make.height.mas_offset(44);
        make.width.mas_offset(44);
    }];
  
    [titleLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.centerX.equalTo(backView);
        make.bottom.mas_equalTo(navView);
        make.height.mas_offset(44);
    }];
  
    [shareButton mas_makeConstraints:^(MASConstraintMaker *make) {
        make.right.bottom.equalTo(navView);
        make.width.mas_offset(44);
        make.height.mas_offset(44);
    }];
}

- (void)configTableView{
    
    self.tableDelegate = [[YFWPriceTrendDelegate alloc] initWithController:self];
    self.tableDataSource = [[YFWPriceTrendDataSource alloc] initWithController:self];
    self.tableDataSource.centerCell = self.centerCell;
    
    self.mainTableView.delegate = self.tableDelegate;
    self.mainTableView.dataSource = self.tableDataSource;
    
    [self.mainTableView registerNib:[UINib nibWithNibName:@"YFWPriceTrendHeaderCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"YFWPriceTrendHeaderCell"];
    [self.mainTableView registerNib:[UINib nibWithNibName:@"YFWPriceTrendFooterCell" bundle:[NSBundle mainBundle]] forCellReuseIdentifier:@"YFWPriceTrendFooterCell"];
}

- (void)configViewModel{
    
    __weak typeof(self)weakSelf = self;
  
    [YFWLoadingView showWithController:self];
    [YFWLoadingView returnRefreshBlock:^{
      [weakSelf requestTrendChart:@"30"];
    }];
  
    [weakSelf requestTrendChart:@"30"];
    self.viewModel = [[YFWPriceTrendViewModel alloc] init];
    self.viewModel.goods_id = self.commodityID;
    self.viewModel.is_TCP = self.is_TCP;
    self.viewModel.trendChartReturnBlock = ^(id returnValue, NSString *day_count) {
      if (weakSelf.is_TCP) {
        if ([returnValue[@"code"] intValue] == 1) {
          [YFWProgressHUD dismiss];
          [weakSelf.centerCell strokeChartWith:[[YFWPriceTrendModel new] tcp_chartItem:returnValue[@"result"]] dayCount:day_count];
        }else if ([returnValue[@"code"] intValue] == -1){
          [YFWProgressHUD showErrorWithStatus:returnValue[@"msg"]];
          [YFWLoadingView showErrorMessage:returnValue[@"msg"]];
        }else{
          [YFWProgressHUD dismiss];
          [YFWLoadingView dismiss];
        }
      }else{
        if ([returnValue[@"code"] intValue] == 1) {
          [YFWProgressHUD dismiss];
          [weakSelf.centerCell strokeChartWith:returnValue[@"item"] dayCount:day_count];
        }else if ([returnValue[@"code"] intValue] == -1){
          [YFWProgressHUD showErrorWithStatus:returnValue[@"msg"]];
        }else{
          [YFWProgressHUD dismiss];
        }
      }

        
    };
    
    self.viewModel.returnBlock = ^(id returnValue) {
      
        [YFWLoadingView dismiss];
        YFWPriceTrendModel *model = (YFWPriceTrendModel *)returnValue;
        //app下载链接
        model.shareUrlString = [NSString stringWithFormat:@"https://www.%@/app/index.html",[YFWSettingUtility yfwDomain]];
        weakSelf.tableDataSource.model = model;
        weakSelf.tableDelegate.model = model;
        [weakSelf.centerCell strokeChartWith:model.chart_item dayCount:@"30"];
        [weakSelf.mainTableView reloadData];
    };
    
    self.viewModel.errorBlock = ^(id errorCode) {
        [YFWLoadingView dismiss];
      dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [YFWProgressHUD dismiss];
        [weakSelf backMethod];
      });
    };
    
    [self.viewModel getServiceData];
    
}


#pragma mark - Method
- (void)backMethod
{
   [AppDelegate sharedInstances].nav.navigationBarHidden = YES;
   [[AppDelegate sharedInstances].nav popViewControllerAnimated:YES];
}

- (void)shareMethod{
    if (self.tableDataSource.model) {
        YFWPicShareView *view = [[YFWPicShareView alloc] init];
        view.vc = self;
        self.tableDataSource.model.chart_item = self.tableDataSource.centerCell.showSelectItem;
        self.tableDataSource.model.chart_title = self.tableDataSource.centerCell.showSelectItemTitle;
        view.priceTrendModel = self.tableDataSource.model;
        [[UIApplication sharedApplication].keyWindow addSubview:view];
    }
}

- (void)toBuyMethod{
  [self backMethod];
}

#pragma mark - Public Function
//请求趋势数据
- (void)requestTrendChart:(NSString *)day_count{
  
    [self.viewModel getServiceTrendChartData:day_count];
    
}


#pragma mark - Setter && Getter
- (UITableView *)mainTableView{
    
    if (!_mainTableView) {
        
        _mainTableView = [[UITableView alloc] initWithFrame:CGRectMake(0, NavigationHeight, kScreenWidth, kScreenHeight-NavigationHeight) style:UITableViewStyleGrouped];
        _mainTableView.separatorStyle = UITableViewCellSeparatorStyleNone;
        _mainTableView.backgroundColor = [UIColor yf_backGroundColor];
        [self systemVersionAdapter:_mainTableView];
    }
    
    return _mainTableView;
}


- (YFWPriceTrendCenterCell *)centerCell{
    
    if (!_centerCell) {
        
        _centerCell = [YFWPriceTrendCenterCell getYFWPriceTrendCenterCell];
        _centerCell.controller = self;
    }
    
    return _centerCell;
}
- (void)systemVersionAdapter:(UIScrollView *)scrollView{
  
  if (@available(iOS 11.0, *)) {
    if ([scrollView isKindOfClass:[UITableView class]]) {
      UITableView *tableView = (UITableView *)scrollView;
      tableView.estimatedRowHeight =0;
      tableView.estimatedSectionHeaderHeight =0;
      tableView.estimatedSectionFooterHeight =0;
    }
    scrollView.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever;
    self.automaticallyAdjustsScrollViewInsets = NO;
  } else {
    self.automaticallyAdjustsScrollViewInsets = NO;
  }
  
}
@end
