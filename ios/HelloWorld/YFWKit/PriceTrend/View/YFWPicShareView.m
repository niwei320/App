//
//  YFWPicShareView.m
//  YaoFang
//
//  Created by NW-YFW on 2018/7/4.
//  Copyright © 2018年 NW. All rights reserved.
//

#import "YFWPicShareView.h"
#import "YFWShareView.h"
#import "PicShareView.h"
#import "YFWQRCodeGenerateManager.h"
#import "PriceTrendShareView.h"
#import <AssetsLibrary/AssetsLibrary.h>
@interface YFWPicShareView(){
    
}
@property (strong,nonatomic) UIImageView *logView;
@property (copy,nonatomic) NSString *urlStr;
@property (copy,nonatomic) NSMutableAttributedString *codeText;
@end
@implementation YFWPicShareView
-(instancetype)init{
    if (self = [super init]) {
        self.frame = [[UIScreen mainScreen] bounds];
        self.backgroundColor = PP_UIColor_RGBA(0, 0, 0, 0.5);
    }
    return self;
}
-(void)setCommodityDetail:(YFCommodityDetail *)commodity{
    _commodityDetail = commodity;
    [self createViews];
}
-(void)setPriceTrendModel:(YFWPriceTrendModel *)priceTrendModel{
    _priceTrendModel = priceTrendModel;
    [self createViews];
}
-(void)createViews{
    UIView *tempview;
    if (_commodityDetail) {
        PicShareView *view = [PicShareView getPicShareView];
        view.commodityDetail = _commodityDetail;
        tempview = view;
        _urlStr = _commodityDetail.invite_url;
        _codeText = [[NSMutableAttributedString alloc] initWithString:@"长按或扫描二维码\n"];
        NSMutableAttributedString *colorText = [[NSMutableAttributedString alloc] initWithString:@"查看商品详情"];
        [colorText addAttribute:NSForegroundColorAttributeName value:[UIColor yf_greenColor_new] range:NSMakeRange(0, colorText.length)];
        [_codeText appendAttributedString:colorText];
    }
    if (_priceTrendModel) {
        PriceTrendShareView *view = [PriceTrendShareView getPriceTrendShareView];
        view.model = _priceTrendModel;
        tempview = view;
        _urlStr = _priceTrendModel.shareUrlString;
        _codeText = [[NSMutableAttributedString alloc] initWithString:@"长按或扫描二维码查看\n"];
        NSMutableAttributedString *colorText = [[NSMutableAttributedString alloc] initWithString:@"更多产品价格趋势"];
        [colorText addAttribute:NSForegroundColorAttributeName value:[UIColor yf_greenColor_new] range:NSMakeRange(0, colorText.length)];
        [_codeText appendAttributedString:colorText];
    }
    [self.mainView addSubview:tempview];
    [self addSubview:self.mainView];
    
    [self setupGenerate_Icon_QRCode:_urlStr];
    [self setLogView];
    [self setScrollIconView];
    [self setCancelButton];
}

-(UIView *)mainView{
    if (!_mainView) {
        _mainView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, kScreenWidth, kScreenHeight)];
        _mainView.backgroundColor = [UIColor yf_grayColor_new];
        UIView *bgView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, kScreenWidth, kScreenHeight-150)];
        bgView.backgroundColor = [UIColor whiteColor];
        [_mainView addSubview:bgView];
        _mainView.userInteractionEnabled = YES;
        UITapGestureRecognizer *tap = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(changePicViewScale)];
        [_mainView addGestureRecognizer:tap];
    }
    return _mainView;
}

#pragma mark - - - 中间带有图标二维码生成
- (void)setupGenerate_Icon_QRCode:(NSString *) url {
    
    UIView *imageBgView = [UIView new];
    imageBgView.backgroundColor = [UIColor whiteColor];
    [self.mainView addSubview:imageBgView];
    [imageBgView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.mas_equalTo(self.mainView.mas_left).mas_offset(30);
        make.bottom.equalTo(self.mainView.mas_bottom).mas_offset(-35);
        make.width.height.mas_equalTo(90);
    }];
    
    // 1、借助UIImageView显示二维码
    UIImageView *imageView = [[UIImageView alloc] init];
    CGFloat scale = 0.3;
    // 2、将最终合得的图片显示在UIImageView上
    imageView.image = [YFWQRCodeGenerateManager generateWithLogoQRCodeData:url logoImageName:@"Icon-60" logoScaleToSuperView:scale];
    [imageBgView addSubview:imageView];
    
    [imageView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.mas_equalTo(imageBgView).mas_offset(5);
        make.right.mas_equalTo(imageBgView).mas_offset(-5);
        make.top.mas_equalTo(imageBgView).mas_offset(5);
        make.bottom.mas_equalTo(imageBgView).mas_offset(-5);
    }];
    
    UILabel *title = [UILabel new];
    title.backgroundColor = [UIColor clearColor];
    title.textColor = [UIColor yf_lightGrayColor];
    title.attributedText = _codeText;
    title.font = kScreenWidth<=320?[UIFont systemFontOfSize:12]:[UIFont systemFontOfSize:14];
    title.numberOfLines = 2;
    [self.mainView addSubview:title];
    
    [title mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.mas_equalTo(imageBgView.mas_right).mas_offset(10);
        make.right.mas_equalTo(self.mainView.mas_right).mas_offset(-30);
        make.centerY.mas_equalTo(imageBgView);
        make.height.mas_equalTo(50);
    }];
}

-(void)setLogView{
    UIView *bgView = [UIView new];
    bgView.backgroundColor = [UIColor yf_greenColor_new];
    [self.mainView addSubview:bgView];
    [bgView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.centerX.mas_equalTo(self.mainView.mas_centerX);
        make.top.mas_equalTo(self.mainView);
        make.width.mas_equalTo(self.mainView);
        make.height.mas_equalTo(100);
    }];
    
    _logView = [UIImageView new];
    _logView.image = [UIImage imageNamed:@"logo_trend"];
    _logView.contentMode = UIViewContentModeScaleAspectFit;
    [self.mainView addSubview:_logView];
    
    [_logView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.centerX.mas_equalTo(self.mainView.mas_centerX);
        make.top.mas_equalTo(self.mainView.mas_top).mas_offset(20);
        make.width.mas_equalTo(kScreenWidth*0.5);
        make.height.mas_equalTo(65);
    }];
}
-(void)setCancelButton{
    UIButton *bt = [UIButton buttonWithType:UIButtonTypeCustom];
    bt.frame = CGRectMake(kScreenWidth-30-10, NavigationHeight - 44, 30, 30);
    [bt setImage:[UIImage imageNamed:@"share_icon_cancel"] forState:UIControlStateNormal];
    bt.backgroundColor = [UIColor clearColor];
    [bt addTarget:self action:@selector(shareCacelMethod) forControlEvents:UIControlEventTouchUpInside];
    [self addSubview:bt];
}
-(void)setScrollIconView
{
    _bottomView = [[UIView alloc]initWithFrame:CGRectMake(0, kScreenHeight, kScreenWidth, 130)];
    _bottomView.backgroundColor = [UIColor whiteColor];
    [self addSubview:_bottomView];
    
    UILabel *title = [[UILabel alloc] initWithFrame:CGRectMake(0, 10, kScreenWidth, 30)];
    title.text = @"分享图片给好友";
    title.textAlignment = NSTextAlignmentCenter;
    title.textColor = [UIColor yf_new_darkTextColor];
    title.backgroundColor = [UIColor clearColor];
    title.font = [UIFont systemFontOfSize:16];
    [_bottomView addSubview:title];
    
    NSArray *titleArray = @[@"微信",@"朋友圈",@"微博",@"QQ",@"QQ空间",@"保存"];
    NSArray *imageArray = @[@"WeixinIcon",@"PengyouIcon",@"SinaIcon",@"QQhaoyou",@"QQkongjian",@"share_8"];
    NSArray *isShowArray = @[@"0",@"1",@"2",@"3",@"4",@"5"];
    int rowNum = 4;
    int buttonW = 50;
    int perWidth = (kScreenWidth)/rowNum;
    //只有两个分享按钮时，居中显示
    int startX = 0;
    int perHeight = buttonW+30;
    UIScrollView *scrollView = [[UIScrollView alloc] initWithFrame:CGRectMake(0, 20, kScreenWidth, 110)];
    scrollView.backgroundColor = [UIColor clearColor];
    scrollView.showsVerticalScrollIndicator = NO;
    scrollView.showsHorizontalScrollIndicator = NO;
    scrollView.contentSize = CGSizeMake(perWidth*isShowArray.count, 110);
    for (int i=0; i<isShowArray.count; i++) {
        
        UIButton *sinaButton = [UIButton buttonWithType:UIButtonTypeCustom];
        sinaButton.frame = CGRectMake((perWidth-50)/2, 0, 50, 50);
        [sinaButton setImage:[UIImage imageNamed:imageArray[[isShowArray[i] intValue]]] forState:UIControlStateNormal];
        sinaButton.backgroundColor = [UIColor clearColor];
        sinaButton.tag = [isShowArray[i] intValue];
        [sinaButton addTarget:self action:@selector(shareWithIndex:) forControlEvents:UIControlEventTouchUpInside];
        
        UILabel *sinaLabel = [[UILabel alloc] initWithFrame:CGRectMake(0, 50, perWidth, 30)];
        sinaLabel.text = titleArray[[isShowArray[i] intValue]];
        sinaLabel.font = [UIFont systemFontOfSize:13];
        sinaLabel.textAlignment = NSTextAlignmentCenter;
        sinaLabel.numberOfLines = 1;
        sinaLabel.lineBreakMode = NSLineBreakByWordWrapping;
        sinaLabel.textColor = [UIColor darkGrayColor];
        
        UIView *view = [[UIView alloc] initWithFrame:CGRectMake(startX+i*perWidth, 20, perWidth, perHeight)];
        view.backgroundColor = [UIColor clearColor];
        [view addSubview:sinaButton];
        [view addSubview:sinaLabel];
        [scrollView addSubview:view];
    }
    [_bottomView addSubview:scrollView];
}

-(void)imageLoad{
    UIImage *image = [self imageWithUIView:self.mainView];
    ALAuthorizationStatus author =[ALAssetsLibrary authorizationStatus];
    if (author == kCLAuthorizationStatusRestricted || author ==kCLAuthorizationStatusDenied)
    {
        [YFWProgressHUD showErrorWithStatus:@"请打开访问照片权限！"];
    }else{
        dispatch_async(dispatch_get_main_queue(), ^{
            UIImageWriteToSavedPhotosAlbum(image,self,@selector(image:didFinishSavingWithError:contextInfo:),NULL);
        });
    }
}
- (void)image:(UIImage *)image didFinishSavingWithError:(NSError *)error contextInfo:(void *)contextInfo{
    NSString *msg = nil ;
    if(error != NULL){
        msg = @"保存图片失败" ;
        [YFWProgressHUD showErrorWithStatus:msg];
    }else{
        msg = @"保存图片成功" ;
        [YFWProgressHUD showSuccessWithStatus:msg];
    }
}

- (UIImage*) imageWithUIView:(UIView*) imageView{
    UIView *view = imageView;

    // 创建一个bitmap的context
    // 并把它设置成为当前正在使用的context
    UIGraphicsBeginImageContextWithOptions(view.bounds.size, YES, [UIScreen mainScreen].scale);
    CGContextRef currnetContext = UIGraphicsGetCurrentContext();
    [view.layer renderInContext:currnetContext];
    // 从当前context中创建一个改变大小后的图片
    UIImage* image = UIGraphicsGetImageFromCurrentImageContext();
    // 使当前的context出堆栈
    UIGraphicsEndImageContext();
    
    return image;
}
//缩放视图
- (void)viewScaleAnimation:(CGPoint) scalePoint{
    
    [UIView beginAnimations:@"ViewScale" context:nil];
    [UIView setAnimationDuration:0.5];
    CGAffineTransform newTransform =  CGAffineTransformScale(self.mainView.transform, scalePoint.x, scalePoint.y);
    [self.mainView setTransform:newTransform];
    [UIView commitAnimations];
}

- (void)shareWithIndex:(UIButton *)sender
{
    int index = (int)sender.tag;
    //创建分享消息对象
    UMSocialMessageObject *messageObject = [UMSocialMessageObject messageObject];
    
    //创建图片内容对象
    UMShareImageObject *shareObjectPic = [[UMShareImageObject alloc] init];
    //如果有缩略图，则设置缩略图
    shareObjectPic.thumbImage = [UIImage imageNamed:@"Icon-60"];
    shareObjectPic.title = @"";
    shareObjectPic.descr = @"";
    [shareObjectPic setShareImage:[self imageWithUIView:self.mainView]];
    
    //分享消息对象设置分享内容对象
    messageObject.shareObject = shareObjectPic;
    
    UMSocialPlatformType platformType = UMSocialPlatformType_Qzone;
    
    switch (index) {
        case 0:
        {
            platformType = UMSocialPlatformType_WechatSession;
            break;
        }
        case 1:
        {
            platformType = UMSocialPlatformType_WechatTimeLine;
            break;
        }
        case 2:
        {
            platformType = UMSocialPlatformType_Sina;
            break;
        }
        case 3:
        {
            platformType = UMSocialPlatformType_QQ;
            break;
        }
        case 4:
        {
            platformType = UMSocialPlatformType_Qzone;
            break;
        }
        case 5:
        {
            [self imageLoad];
            return;
            break;
        }
        
        default:
            break;
    }
    //调用分享接口
    [[UMSocialManager defaultManager] shareToPlatform:platformType messageObject:messageObject currentViewController:self.vc completion:^(id data, NSError *error) {
        if (error) {
            NSLog(@"************Share fail with error %@*********",error);
            [YFWProgressHUD showErrorWithStatus:@"分享失败"];
        }else{
            [YFWProgressHUD showSuccessWithStatus:@"分享成功"];
            [[NSNotificationCenter defaultCenter] postNotificationName:@"shareSuccedNotification" object:nil];
            [self removeFromSuperview];
        }
    }];
}

-(void)shareCacelMethod{
    [self removeFromSuperview];
}

-(void)changePicViewScale{
    CGRect rect;
    if (_bottomView.frame.origin.y < kScreenHeight) {
        [self viewScaleAnimation:CGPointMake(12.0/11.0, 12.0/11.0)];
        rect = CGRectMake(0, kScreenHeight, _bottomView.frame.size.width, _bottomView.frame.size.height);
    }else{
        //在屏幕下方
        [self viewScaleAnimation:CGPointMake(11.0/12.0, 11.0/12.0)];
        rect = CGRectMake(0, kScreenHeight - _bottomView.frame.size.height, _bottomView.frame.size.width, _bottomView.frame.size.height);
    }
    [UIView animateWithDuration:0.5 animations:^{
        _bottomView.frame = rect;
    } completion:^(BOOL finished) {
        
    }];
}

-(void)layoutSubviews{
    [super layoutSubviews];
    [self viewScaleAnimation:CGPointMake(0.8, 0.8)];
    [self changePicViewScale];
}

@end
