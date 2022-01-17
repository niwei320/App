//
//  PicShareView.m
//  YaoFang
//
//  Created by NW-YFW on 2018/6/14.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import "PicShareView.h"
#import <SDWebImage/UIImageView+WebCache.h>
@interface PicShareView(){
    
}
@property (weak, nonatomic) IBOutlet NSLayoutConstraint *marginTop;
@property (weak, nonatomic) IBOutlet UIImageView *imageView;
@property (weak, nonatomic) IBOutlet UILabel *goodsTitle;
@property (weak, nonatomic) IBOutlet UILabel *goodsGuige;
@property (weak, nonatomic) IBOutlet UILabel *goodsPrice;

@end

@implementation PicShareView
@synthesize commodityDetail;
- (void)awakeFromNib{
    
    [super awakeFromNib];
}

-(void)setCommodityDetail:(YFCommodityDetail *)commodity{
    _marginTop.constant = NavigationHeight+40;
    commodityDetail = commodity;
    [_imageView sd_setImageWithURL:[NSURL URLWithString:[commodity.imagesURLStr firstObject]] placeholderImage:[UIImage imageNamed:@"default_img"]];
    _goodsTitle.text = commodity.title;
    _goodsGuige.text = commodity.quantity;
    _goodsPrice.text = [NSString stringWithFormat:@"￥%@",commodity.price];
}

+ (PicShareView *)getPicShareView
{
    
    NSArray *views = [[NSBundle mainBundle] loadNibNamed:@"PicShareView" owner:self options:nil];
    PicShareView *view = views[0];
    view.frame = CGRectMake(0, 0, kScreenWidth, kScreenHeight);
    return view;
}

@end
