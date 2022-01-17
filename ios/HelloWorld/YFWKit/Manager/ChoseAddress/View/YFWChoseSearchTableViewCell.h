//
//  YFWChoseSearchTableViewCell.h
//  YaoFang
//
//  Created by 小猪猪 on 16/6/7.
//  Copyright © 2016年 SQC. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface YFWChoseSearchTableViewCell : UITableViewCell

@property (weak, nonatomic) IBOutlet UILabel *titleLabel;

@property (weak, nonatomic) IBOutlet UILabel *descLabel;



- (void)setDataArray:(id)data;


+ (YFWChoseSearchTableViewCell *)getYFWChoseSearchTableViewCell;





@end
