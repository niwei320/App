//
//  YFWPriceTrendDelegate.m
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/13.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import "YFWPriceTrendDelegate.h"
#import "YFWPriceTrendFooterCell.h"

@implementation YFWPriceTrendDelegate

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath{
    
    switch (indexPath.section) {
        case 0:
            return 170;
            break;
        case 1:
            return 300;
            break;
        case 2:
            return [YFWPriceTrendFooterCell cellHeight:self.model];
            break;
        default:
            break;
    }
    
    return 0;
}

- (CGFloat)tableView:(UITableView *)tableView heightForHeaderInSection:(NSInteger)section {
  if (section == 0) {
    return 10;
  }else {
    return 0.0001;
  }
}

- (UIView *)tableView:(UITableView *)tableView viewForHeaderInSection:(NSInteger)section {
    UIView *view = [[UIView alloc] initWithFrame:CGRectMake(0, 0, kScreenWidth, 10)];
    view.backgroundColor = [UIColor yf_backGroundColor];
  
    return view;
}

- (CGFloat)tableView:(UITableView *)tableView heightForFooterInSection:(NSInteger)section{
  
  return 0.0001;
}

- (UIView *)tableView:(UITableView *)tableView viewForFooterInSection:(NSInteger)section{
  
  UIView *view = [[UIView alloc] initWithFrame:CGRectMake(0, 0, kScreenWidth, 10)];
  view.backgroundColor = [UIColor yf_backGroundColor];
  
  return view;
}


@end
