//
//  YFWQRCodeReaderView.h
//  YaoFang
//
//  Created by 姜明均 on 2017/5/26.
//  Copyright © 2017年 ospreyren. All rights reserved.
//

#import <UIKit/UIKit.h>

@protocol YFWQRCodeReaderViewDelegate <NSObject>
- (void)loadView:(CGRect)rect;
@end

@interface YFWQRCodeReaderView : UIView
@property (nonatomic, weak)   id<YFWQRCodeReaderViewDelegate> delegate;
@property (nonatomic, assign) CGRect innerViewRect;
@end
