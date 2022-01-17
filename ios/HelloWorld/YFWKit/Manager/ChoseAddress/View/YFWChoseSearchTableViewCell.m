//
//  YFWChoseSearchTableViewCell.m
//  YaoFang
//
//  Created by 小猪猪 on 16/6/7.
//  Copyright © 2016年 SQC. All rights reserved.
//

#import "YFWChoseSearchTableViewCell.h"
#import <BaiduMapAPI_Search/BMKPoiSearchType.h>
@implementation YFWChoseSearchTableViewCell


- (void)setDataArray:(id)data
{
    BMKPoiInfo *info = (BMKPoiInfo *)data;
    NSString *titleString = getSafeString(info.name);
    NSString *descString = getSafeString(info.address);

    self.titleLabel.text = titleString;
    self.descLabel.text = descString;
    
}




+ (YFWChoseSearchTableViewCell *)getYFWChoseSearchTableViewCell
{
    NSArray *array = [[NSBundle mainBundle] loadNibNamed:@"YFWChoseSearchTableViewCell" owner:self options:nil];
    YFWChoseSearchTableViewCell *view = array[0];
    return view;
}





@end
