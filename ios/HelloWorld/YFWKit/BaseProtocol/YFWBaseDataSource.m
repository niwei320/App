//
//  YFWBaseDataSource.m
//  YaoFang
//
//  Created by 小猪猪 on 16/7/29.
//  Copyright © 2016年 SQC. All rights reserved.
//

#import "YFWBaseDataSource.h"
#import "PPCell.h"
static NSString * const kMainCellReuseID = @"kMainCellReuseID";
@implementation YFWBaseDataSource


- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
    return self.numSection;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return self.dataArray.count;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    UITableViewCell<PPCell> *cell = [tableView dequeueReusableCellWithIdentifier:kMainCellReuseID forIndexPath:indexPath];
    cell.object = [self.dataArray objectAtIndex:indexPath.row];
    return cell;
}


@end
