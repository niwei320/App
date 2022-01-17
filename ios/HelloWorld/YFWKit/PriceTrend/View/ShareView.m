//
//  ShareView.m
//  YaoFang
//
//  Created by yfw－iMac on 15/11/10.
//  Copyright © 2015年 SQC. All rights reserved.
//

#import "ShareView.h"


@implementation ShareView

- (void)awakeFromNib{
    
    [super awakeFromNib];
    if (!self.isShowArray) {
        self.isShowArray = @[@"0",@"1",@"2",@"3",@"4",@"5"];
        self.shareButtonStatus = ShareButtonStatusDefault;
    }
    self.CheckRewardView.hidden = YES;
}


- (void)addIconViews
{
    switch (self.shareButtonStatus) {
        case ShareButtonStatusDefault:
            self.isShowArray = @[@"0",@"1",@"2",@"3",@"4",@"5"];
            break;
        case ShareButtonStatusPic:
            self.isShowArray = @[@"0",@"1",@"2",@"3",@"4",@"5",@"6"];
            break;
        case ShareButtonStatusWithoutCopyAndPic:
            self.isShowArray = @[@"0",@"1",@"2",@"3",@"4"];
            break;
        case ShareButtonStatusQQWEIXin:
            self.isShowArray = @[@"0",@"3"];
            break;
        case ShareButtonStatusWEIXinPYQ:
            self.isShowArray = @[@"0",@"1"];
            break;
        default:
            self.isShowArray = @[@"0",@"1",@"2",@"3",@"4",@"5"];
            break;
    }
    
    if (self.isShowArray.count <=3) {
        self.shareButtonViewHeight.constant = 250 - 100;
    }else{
        self.shareButtonViewHeight.constant = 250;
    }
    
    NSArray *titleArray = @[@"微信",@"朋友圈",@"微博",@"QQ",@"QQ空间",@"复制链接",@"图片分享"];
    NSArray *imageArray = @[@"WeixinIcon",@"PengyouIcon",@"SinaIcon",@"QQhaoyou",@"QQkongjian",@"share6",@"share_7"];

    int rowNum = 4;
    int startY = 50;
    int buttonW = 50;
    int perWidth = (kScreenWidth)/rowNum;
    //只有两个分享按钮时，居中显示
    int startX = self.isShowArray.count == 2 ? perWidth : 0;
    int perHeight = buttonW+30;
    
    for (int i=0; i<self.isShowArray.count; i++) {
        
        UIButton *sinaButton = [UIButton buttonWithType:UIButtonTypeCustom];
        sinaButton.frame = CGRectMake((perWidth-50)/2, 0, 50, 50);
        [sinaButton setImage:[UIImage imageNamed:imageArray[[self.isShowArray[i] intValue]]] forState:UIControlStateNormal];
        sinaButton.backgroundColor = [UIColor clearColor];
        sinaButton.tag = [self.isShowArray[i] intValue];
        [sinaButton addTarget:self action:@selector(shareMethod:) forControlEvents:UIControlEventTouchUpInside];
        
        UILabel *sinaLabel = [[UILabel alloc] initWithFrame:CGRectMake(0, 50, perWidth, 30)];
        sinaLabel.text = titleArray[[self.isShowArray[i] intValue]];
        sinaLabel.font = [UIFont systemFontOfSize:13];
        sinaLabel.textAlignment = NSTextAlignmentCenter;
        sinaLabel.numberOfLines = 1;
        sinaLabel.lineBreakMode = NSLineBreakByWordWrapping;
        sinaLabel.textColor = [UIColor darkGrayColor];
        
        UIView *view = [[UIView alloc] initWithFrame:CGRectMake(startX+i%rowNum*perWidth, (i/rowNum)*20+startY+i/rowNum*perHeight, perWidth, perHeight)];
        view.backgroundColor = [UIColor clearColor];
        [view addSubview:sinaButton];
        [view addSubview:sinaLabel];
        [self.buttonsView addSubview:view];
    }
}

- (void)shareMethod:(UIButton *)sender
{
    NSLog(@"***** click share tag = %ld",(long)sender.tag);
    if (self.share) {
        self.share((int)sender.tag);

    }
}

- (IBAction)cancelMethod:(id)sender {
    if (self.cancel) {
        self.cancel(YES);
    }
    
}

- (IBAction)checkRewardMethod:(UIButton *)sender {
    
    if (self.checkReward) {
        self.checkReward();
    }
    
}

+ (ShareView *)getShareView
{
    NSArray *views = [[NSBundle mainBundle] loadNibNamed:@"ShareView" owner:self options:nil];
    ShareView *view = views.firstObject;
    view.frame = CGRectMake(0, 0, kScreenWidth, kScreenHeight);
    return view;
}



@end
