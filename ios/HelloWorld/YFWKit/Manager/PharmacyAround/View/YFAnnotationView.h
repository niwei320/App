//
//  YFAnnotationView.h
//  YaoFang
//
//  Created by yaofangwang on 15/1/28.
//  Copyright (c) 2015年 yaofangwang. All rights reserved.
//

#import <BaiduMapAPI_Map/BMKAnnotationView.h>
typedef void(^AnnotationViewBlock)(int type);

@interface YFAnnotationView : BMKAnnotationView

@property (nonatomic, assign) NSUInteger index;
@property (nonatomic, copy) PPActionBlock selectedHandler;
@property (nonatomic, copy) AnnotationViewBlock block;

@end
