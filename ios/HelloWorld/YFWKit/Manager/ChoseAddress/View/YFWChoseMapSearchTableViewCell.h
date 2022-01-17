//
//  YFWChoseMapSearchTableViewCell.h
//  YaoFang
//
//  Created by 小猪猪 on 16/6/7.
//  Copyright © 2016年 SQC. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface YFWChoseMapSearchTableViewCell : UITableViewCell

@property (weak, nonatomic) IBOutlet UILabel *titleLabel;
@property (weak, nonatomic) IBOutlet UILabel *descLabel;



- (void)setDataArray:(id)data;


+ (YFWChoseMapSearchTableViewCell *)getYFWChoseMapSearchTableViewCell;




@end
