//
//  YFWPriceTrendRankingListDataSource.m
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/14.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import "YFWPriceTrendRankingListDataSource.h"
#import "YFWPriceTrendRankingListTableViewCell.h"
#import "YFWPriceTrendRankingCategoryTableViewCell.h"
#import "YFWPriceTrendRankingAllViewController.h"

@implementation YFWPriceTrendRankingListDataSource

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView{
    
    return 3;
    
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section{
    
    return (section == 0 || section == 1) ? 3 : 1;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath{
    
    
    if (indexPath.section == 0 || indexPath.section == 1) {
        
        YFWPriceTrendRankingListTableViewCell * cell = [tableView dequeueReusableCellWithIdentifier:@"YFWPriceTrendRankingListTableViewCell" forIndexPath:indexPath];
        
        cell.index = indexPath.row;
        cell.isLast = indexPath.row == 2;
        
        return cell;
    }else{
        __weak typeof(self)weakSelf = self;
        YFWPriceTrendRankingCategoryTableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"YFWPriceTrendRankingCategoryTableViewCell"];
        cell.dataArray = @[@"心脑血管",@"家庭常用",@"呼吸系统"];
        cell.selectItemMethod = ^(NSString *titleName) {
            YFWPriceTrendRankingAllViewController *vc = [[YFWPriceTrendRankingAllViewController alloc] init];
            vc.titleName = titleName;
            [weakSelf.superController.navigationController pushViewController:vc animated:YES];
        };
        
        return cell;
    }
    
}

@end
