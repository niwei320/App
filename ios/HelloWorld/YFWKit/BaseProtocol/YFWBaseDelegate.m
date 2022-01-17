//
//  YFWBaseDelegate.m
//  YaoFang
//
//  Created by 小猪猪 on 16/7/29.
//  Copyright © 2016年 SQC. All rights reserved.
//

#import "YFWBaseDelegate.h"

@implementation YFWBaseDelegate

- (instancetype)initWithController:(UIViewController *)controller rowHeight:(float)height
{
    self = [super initWithController:controller];
    if (self) {
        self.heightForRow = height;
    }
    return self;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
    return self.heightForRow;
}

- (CGFloat)tableView:(UITableView *)tableView heightForHeaderInSection:(NSInteger)section
{
    return self.heightForHeader;
}

- (CGFloat)tableView:(UITableView *)tableView heightForFooterInSection:(NSInteger)section
{
    return self.heightForFooter;
}


- (nullable UIView *)tableView:(UITableView *)tableView viewForHeaderInSection:(NSInteger)section
{
    return nil;
}

- (nullable UIView *)tableView:(UITableView *)tableView viewForFooterInSection:(NSInteger)section
{
    return nil;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    [tableView deselectRowAtIndexPath:indexPath animated:YES];

    
}

@end
