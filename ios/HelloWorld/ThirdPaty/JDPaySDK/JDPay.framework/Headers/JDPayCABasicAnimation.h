//
//  JDPayCABasicAnimation.h
//  JDPayUIKit
//
//  Created by dongkui on 2018/10/31.
//  Copyright © 2018 JD. All rights reserved.
//

#import <QuartzCore/QuartzCore.h>

NS_ASSUME_NONNULL_BEGIN

typedef void (^JDPayCABasicAnimationStartBlock) (void);
typedef void (^JDPayCABasicAnimationFinishBlock) (BOOL finished);

@interface JDPayCABasicAnimation : CABasicAnimation

@property (nonatomic, copy) JDPayCABasicAnimationStartBlock startBlock;
@property (nonatomic, copy) JDPayCABasicAnimationFinishBlock finishBlock;

@end

NS_ASSUME_NONNULL_END
