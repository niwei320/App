//
//  YFWChoseMapSearchTableViewCell.m
//  YaoFang
//
//  Created by 小猪猪 on 16/6/7.
//  Copyright © 2016年 SQC. All rights reserved.
//

#import "YFWChoseMapSearchTableViewCell.h"
#import <BaiduMapAPI_Search/BMKPoiSearchType.h>

@implementation YFWChoseMapSearchTableViewCell




- (void)setDataArray:(id)data
{
    BMKPoiInfo *info = (BMKPoiInfo *)data;

    NSString *title = getSafeString(info.name);
    NSString *desc = getSafeString(info.address);
    
    self.titleLabel.text = title;
    self.descLabel.text = desc;
}


+ (YFWChoseMapSearchTableViewCell *)getYFWChoseMapSearchTableViewCell
{
    NSArray *array = [[NSBundle mainBundle] loadNibNamed:@"YFWChoseMapSearchTableViewCell" owner:self options:nil];
    YFWChoseMapSearchTableViewCell *view = array[0];
    return view;
}









@end
