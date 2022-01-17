//
//  YFKActionPaopaoView.h
//  HelloWorld
//
//  Created by mac on 2019/10/23.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "YFAnnotationPaoPaoView.h"
typedef void(^AnnotationViewBlock)(int type);
NS_ASSUME_NONNULL_BEGIN

@interface YFKActionPaopaoView : BMKActionPaopaoView
@property (nonatomic, copy) AnnotationViewBlock block;
@end

NS_ASSUME_NONNULL_END
