//
//  YFWPriceTrendDataSource.m
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/13.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import "YFWPriceTrendDataSource.h"
#import "YFWPriceTrendHeaderCell.h"
#import "YFWPriceTrendCenterCell.h"
#import "YFWPriceTrendFooterCell.h"
#import "YFWPriceTrendViewController.h"
#import "YFWPriceTrendModel.h"

@implementation YFWPriceTrendDataSource

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView{
    
    return 3;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section{
    
    return 1;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath{
    
    
    if (indexPath.section == 0) {
        YFWPriceTrendHeaderCell *cell = [tableView dequeueReusableCellWithIdentifier:@"YFWPriceTrendHeaderCell"];
        cell.model = self.model;
        return cell;
    }else if (indexPath.section == 1){
        
        return self.centerCell;
    }else{
        YFWPriceTrendFooterCell *cell = [tableView dequeueReusableCellWithIdentifier:@"YFWPriceTrendFooterCell"];
        cell.controller = (YFWPriceTrendViewController *)self.superController;
        cell.model = self.model;
        return cell;
    }
    
}


@end
