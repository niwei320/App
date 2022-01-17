//
//  changeEnvironmentTableViewController.m
//  YaoFang
//
//  Created by 姜明均 on 2017/8/21.
//  Copyright © 2017年 ospreyren. All rights reserved.
//

#import "changeEnvironmentTableViewController.h"
#import "YFWFindCodeViewController.h"
#import "WKWebView+ClearCache.h"

@interface changeEnvironmentTableViewController ()

@property (nonatomic, strong) NSArray *dataArr;

@end

@implementation changeEnvironmentTableViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    [AppDelegate sharedInstances].nav.navigationBarHidden = NO;
    [self leftBatItem];
    [self rightBatItem];
    self.title = @"地址切换";
    self.view.backgroundColor = [UIColor yf_backGroundColor];
    [self.tableView registerClass:[UITableViewCell class] forCellReuseIdentifier:@"cell"];
    NSString *used_url_str = [[NSUserDefaults standardUserDefaults] objectForKey:@"yfwTcpHost"];

    self.dataArr = @[
                    @{@"name":@"当前使用服务器",@"id":used_url_str},
                    @{@"name":@"线上环境",@"id":@"app.yaofangwang.com"},
                     @{@"name":@"线上测试服务器",@"id":@"114.116.222.136"},
                     @{@"name":@"小鹏",@"id":@"192.168.2.66"},
                     @{@"name":@"吴露",@"id":@"192.168.2.13"},
                     @{@"name":@"李凯华",@"id":@"192.168.2.8"},
                     @{@"name":@"总监",@"id":@"192.168.2.11"},
                     @{@"name":@"晓壮",@"id":@"192.168.2.15"},
                     @{@"name":@"李辉",@"id":@"192.168.2.59"},
                     @{@"name":@"本地测试服务器",@"id":@"192.168.2.252"}];
  
  
  UIView *footerView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, self.view.width, 200)];
  self.tableView.tableFooterView = footerView;
  UILabel *textField = [[UILabel alloc] initWithFrame:CGRectMake(0, 0, 100, 21)];
  textField.text = @"自定义热更新bundle包URL";
  [footerView addSubview:textField];
  [textField mas_makeConstraints:^(MASConstraintMaker *make) {
    make.left.equalTo(footerView.mas_left).valueOffset(@23);
    make.top.equalTo(footerView.mas_top).valueOffset(@12);
  }];
  UIButton *addBtn = [UIButton buttonWithType:UIButtonTypeContactAdd];
  [addBtn addTarget:self action:@selector(addHotBundleUrl) forControlEvents:UIControlEventTouchUpInside];
  [footerView addSubview:addBtn];
  [addBtn mas_makeConstraints:^(MASConstraintMaker *make) {
    make.left.equalTo(textField.mas_right).valueOffset(@10);
    make.top.equalTo(textField.mas_top);
  }];
  UIButton *clearBtn = [UIButton buttonWithType:UIButtonTypeCustom];

  [clearBtn addTarget:self action:@selector(clearWebViewCache) forControlEvents:UIControlEventTouchUpInside];
  [clearBtn setTitle:@"清除WKWebView缓存" forState:UIControlStateNormal];
  [clearBtn setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
  [footerView addSubview:clearBtn];

  [clearBtn mas_makeConstraints:^(MASConstraintMaker *make) {
    make.top.equalTo(textField.mas_bottom).valueOffset(@10);
    make.left.equalTo(textField.mas_left).valueOffset(@0);
  }];
    
}

- (void)leftBatItem{
  
  UIBarButtonItem *leftBarButtonItem = [[UIBarButtonItem alloc] initWithImage:[UIImage imageNamed:@"backgreen"] style:UIBarButtonItemStylePlain target:self action:@selector(backMethod)];
  
  self.navigationItem.leftBarButtonItem = leftBarButtonItem;
}

- (void)rightBatItem {
  
  UIBarButtonItem *leftBarButtonItem = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemAdd target:self action:@selector(addNewIpAction)];
  
  self.navigationItem.rightBarButtonItem = leftBarButtonItem;
}
- (void)clearWebViewCache {
  [WKWebView yfwdeleteWebCache];
}
- (void)addNewIpAction {
  UIAlertController* alert = [UIAlertController alertControllerWithTitle:nil
                                                                 message:@"自定义IP"
                                                          preferredStyle:UIAlertControllerStyleAlert];
  
  [alert addTextFieldWithConfigurationHandler:^(UITextField * _Nonnull textField) {
    textField.placeholder = @"192.168.2.255";
  }];
  
  UIAlertAction* defaultAction = [UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleDefault
                                                        handler:^(UIAlertAction * action) {
                                                          NSString *ip = alert.textFields[0].text;
                                                          if (ip.length > 0) {
                                                            [[NSUserDefaults standardUserDefaults] setObject:ip forKey:@"yfwTcpHost"];
                                                            exit(0);
                                                          }
                                                        }];
  
  [alert addAction:defaultAction];
  [self presentViewController:alert animated:YES completion:nil];
}
- (void)addHotBundleUrl
{
  UIAlertController* alert = [UIAlertController alertControllerWithTitle:nil
                                                                 message:@"自定义热更新包URL"
                                                          preferredStyle:UIAlertControllerStyleAlert];
  
  [alert addTextFieldWithConfigurationHandler:^(UITextField * _Nonnull textField) {
    textField.placeholder = @"完整链接";
  }];
  
  UIAlertAction* defaultAction = [UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleDefault
                                                        handler:^(UIAlertAction * action) {
                                                          NSString *hostUrl = alert.textFields[0].text;
                                                          if (hostUrl.length > 0) {
                                                            [self uploadHotBundleUrl:hostUrl];
                                                          }
                                                        }];
  
  [alert addAction:defaultAction];
  [self presentViewController:alert animated:YES completion:nil];
}
- (void)uploadHotBundleUrl:(NSString *)url {
  if (![url hasPrefix:@"http"]) {
    
    return;
  }
  YFWFindCodeViewController *vc = [[YFWFindCodeViewController alloc] init];
  vc.customBundleUrl = url;
  vc.doneBlock = ^{
    exit(0);
  };
  [AppDelegate sharedInstances].window.rootViewController = vc;
}
- (void)backMethod
{
  [AppDelegate sharedInstances].nav.navigationBarHidden = YES;
  [[AppDelegate sharedInstances].nav popViewControllerAnimated:YES];
}

#pragma mark - Table view data source

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
    
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    
    return self.dataArr.count;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    UITableViewCell *cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleValue1 reuseIdentifier:@"cell"];
    NSDictionary *dic = self.dataArr[indexPath.row];
    cell.textLabel.text = dic[@"name"];
    cell.detailTextLabel.text = dic[@"id"];
    cell.backgroundColor = [UIColor whiteColor];
    
    NSString *url_str = [[NSUserDefaults standardUserDefaults] objectForKey:@"yfwTcpHost"];
    if (url_str.length == 0) {
        if (indexPath.row==0) {
            cell.backgroundColor = [UIColor lightGrayColor];
        }
    }else{
        if ([url_str isEqualToString:dic[@"id"]]) {
            cell.backgroundColor = [UIColor lightGrayColor];
        }
    }
    
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath{
    
    NSString *url_str = [self.dataArr[indexPath.row] objectForKey:@"id"];
    NSString *used_url_str = [[NSUserDefaults standardUserDefaults] objectForKey:@"yfwTcpHost"];
    if ([url_str isEqualToString:used_url_str]) {
      return;
    }
    [[NSUserDefaults standardUserDefaults] setObject:url_str forKey:@"yfwTcpHost"];
  
    exit(0);
    
}

@end
