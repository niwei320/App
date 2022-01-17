//
//  YFWArroundTableViewCell.h
//  YaoFang
//
//  Created by 小猪猪 on 16/6/27.
//  Copyright © 2016年 SQC. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "YFRateView.h"

@interface YFWArroundTableViewCell : UITableViewCell

@property (weak, nonatomic) IBOutlet UIImageView *shopImageView;
@property (weak, nonatomic) IBOutlet UILabel *shopName;
@property (weak, nonatomic) IBOutlet YFRateView *shopRate;
@property (weak, nonatomic) IBOutlet UILabel *distanceLabel;
@property (weak, nonatomic) IBOutlet UIImageView *qianStatusImg;
@property (weak, nonatomic) IBOutlet UILabel *qianLabel;

@property (weak, nonatomic) IBOutlet UIView *backView;


- (void)setDataObject:(id)data;

+ (YFWArroundTableViewCell *)getYFWArroundTableViewCell;



@end
