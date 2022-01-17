//
//  YFWPriceTrendRankingAllDataSource.m
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/14.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import "YFWPriceTrendRankingAllDataSource.h"
#import "YFWPriceTrendRankingListTableViewCell.h"

@implementation YFWPriceTrendRankingAllDataSource

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView{
    
    return 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section{
    
    return 10;
    
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath{
    
    YFWPriceTrendRankingListTableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"YFWPriceTrendRankingListTableViewCell" forIndexPath:indexPath];
    
    cell.index = indexPath.row;
    cell.isLast = indexPath.row == 9;
    
    return cell;
}

@end
