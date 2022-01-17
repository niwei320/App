//
//  YFWPriceTrendRankingAllDelegate.m
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/14.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import "YFWPriceTrendRankingAllDelegate.h"
#import "YFWPriceTrendViewController.h"

@implementation YFWPriceTrendRankingAllDelegate

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath{
    
    YFWPriceTrendViewController *vc = [[YFWPriceTrendViewController alloc] init];
    [self.superController.navigationController pushViewController:vc animated:YES];
    
}

- (CGFloat)tableView:(UITableView *)tableView heightForFooterInSection:(NSInteger)section{
    return 0.1;
}

- (CGFloat)tableView:(UITableView *)tableView heightForHeaderInSection:(NSInteger)section{
    
    if (self.titleName.length != 0) {
        
        return 50;
    }
    return 0.1;
}

- (UIView *)tableView:(UITableView *)tableView viewForHeaderInSection:(NSInteger)section{
    
    if (self.titleName.length != 0) {
        
        UIView *view = [[UIView alloc] initWithFrame:CGRectMake(0, 0, kScreenWidth, 50)];
        view.backgroundColor = [UIColor whiteColor];
        
        UILabel *label = [[UILabel alloc] initWithFrame:CGRectMake(15, 10, 200, 30)];
        label.font = [UIFont systemFontOfSize:14 weight:0.4];
        label.textColor = [UIColor yf_new_darkTextColor];
        label.text = [NSString stringWithFormat:@"%@药品价格%@榜单",self.titleName,self.segmentIndex==0?@"下跌":@"上升"];
        
        [view addSubview:label];
        
        return view;
        
    }
    
    return nil;
}


@end
