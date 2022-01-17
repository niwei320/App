//
//  UILabel+YFWAdd.m
//  YaoFang
//
//  Created by yfw-姜明均 on 2018/6/19.
//  Copyright © 2018年 NW. All rights reserved.
//

#import "UIImage+YFW.h"
@implementation UILabel (YFWAdd)

- (void)addTitle:(NSString *)title tagBoxToLast:(NSString *)tag Type:(YFWBoxImageType)type{
    
    if (!title) {
        return;
    }
    if (tag.length == 0) {
        self.text = title;
    }
    
    NSMutableAttributedString * attriStr = [[NSMutableAttributedString alloc] initWithString:[title stringByAppendingString:@"   "]];
    
    CGFloat width = [tag widthForFont:[UIFont systemFontOfSize:10]]+5;
    UILabel *label = [[UILabel alloc] initWithFrame:CGRectMake(0, 0, (int)width, 15)];
    label.font = [UIFont systemFontOfSize:10];
    label.textAlignment = NSTextAlignmentCenter;
    label.layer.masksToBounds = YES;
    label.text = tag;
    if (type == YFWBoxImageDefaultType) {
        label.backgroundColor = [UIColor whiteColor];
        label.textColor = [UIColor yf_orangeColor_new];
        label.layer.cornerRadius = 1;
        label.layer.borderColor = [UIColor yf_orangeColor_new].CGColor;
        label.layer.borderWidth = 0.5;
    }else if (type == YFWBoxImageOrangeBGType){
        label.backgroundColor = RGB(253, 244, 230);
        label.textColor = [UIColor yf_orangeColor_new];
    }
    UIImage *image = [self imageWithUIView:label];
    NSTextAttachment *attchImage = [[NSTextAttachment alloc] init];
    attchImage.image = image;
    attchImage.bounds = CGRectMake(0, -3, width, 15);
    NSAttributedString *stringImage = [NSAttributedString attributedStringWithAttachment:attchImage];
    [attriStr appendAttributedString:stringImage];
    
    self.attributedText = attriStr;
    
    
}

//尾部添加边框标记
- (void)addTitle:(NSString *)title tagBoxToLast:(NSString *)tag{
    
    [self addTitle:title tagBoxToLast:tag Type:YFWBoxImageDefaultType];
}


- (UIImage*) imageWithUIView:(UIView*) view
{
    UIGraphicsBeginImageContextWithOptions(view.size, NO, 0);
    CGContextRef ctx = UIGraphicsGetCurrentContext();
    [view.layer renderInContext:ctx];
    UIImage* tImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return tImage;
}

///文字添加马赛克效果
- (void)setMosaicTitle:(NSString *)title{
    
    [self setMosaicTitle:title Level:8];
    
}

- (void)setMosaicTitle:(NSString *)title Level:(NSInteger)level{
    
    self.text = title;
    UIImage *titleImage = [self imageWithUIView:self];
    UIImage *mosaicImage = [UIImage mosaicWithImage:titleImage Level:level];
    
    NSTextAttachment *attchImage = [[NSTextAttachment alloc] init];
    attchImage.image = mosaicImage;
    attchImage.bounds = CGRectMake(0, -3, self.width, 15);
    NSAttributedString *stringImage = [NSAttributedString attributedStringWithAttachment:attchImage];
    
    self.attributedText = stringImage;
    
}



@end
