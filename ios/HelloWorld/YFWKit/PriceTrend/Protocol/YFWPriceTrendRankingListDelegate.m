//
//  YFWPriceTrendRankingListDelegate.m
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/14.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import "YFWPriceTrendRankingListDelegate.h"
#import "YFWPriceTrendRankingListSectionHeaderView.h"
#import "YFWPriceTrendRankingCategoryTableViewCell.h"
#import "YFWPriceTrendRankingAllViewController.h"
#import "YFWPriceTrendViewController.h"

@implementation YFWPriceTrendRankingListDelegate

- (CGFloat)tableView:(UITableView *)tableView heightForHeaderInSection:(NSInteger)section{
    
    return (section == 0 || section == 1) ? 60 : 10;
}

- (UIView *)tableView:(UITableView *)tableView viewForHeaderInSection:(NSInteger)section{
    
    if (section == 0 || section == 1) {
        __weak typeof(self)weakSelf = self;
        UIView *view = [[UIView alloc] initWithFrame:CGRectMake(0, 0, kScreenWidth, 60)];
        view.backgroundColor = [UIColor yf_backGroundColor];
        YFWPriceTrendRankingListSectionHeaderView *hview = [YFWPriceTrendRankingListSectionHeaderView getYFWPriceTrendRankingListSectionHeaderView];
        hview.title = (section == 0) ? @"价格下跌榜单" : @"价格上升榜单";
        hview.frame = CGRectMake(0, 10, kScreenWidth, 50);
        hview.moreMethodBlock = ^{
            YFWPriceTrendRankingAllViewController *vc = [[YFWPriceTrendRankingAllViewController alloc] init];
            vc.segmentIndex = section;
            [weakSelf.superController.navigationController pushViewController:vc animated:YES];
        };
        [view addSubview:hview];
        
        return view;
    }else{
        UIView *view = [[UIView alloc] initWithFrame:CGRectMake(0, 0, kScreenWidth, 10)];
        view.backgroundColor = [UIColor yf_backGroundColor];
        return view;
    }
    
    return nil;
}

- (CGFloat)tableView:(UITableView *)tableView heightForFooterInSection:(NSInteger)section{
    
    return 0.1;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath{
    
    if (indexPath.section == 0 || indexPath.section == 1) {
        return 90;
    }else{
        return [YFWPriceTrendRankingCategoryTableViewCell getCellHeight:@[@"心脑血管",@"家庭常用",@"呼吸系统"]];
    }
    
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath{
    
    if (indexPath.section == 0 || indexPath.section == 1) {
        
        YFWPriceTrendViewController *vc = [[YFWPriceTrendViewController alloc] init];
        [self.superController.navigationController pushViewController:vc animated:YES];
    }
    
}

@end
