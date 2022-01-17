//
//  JDPayNSString+CGSize.h
//  JDPayUIKit
//
//  Created by dongkui on 2018/10/15.
//  Copyright © 2018 JD. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface NSString (CGSize)

- (CGSize)jdp_sizeToFits:(CGSize)size withFont:(UIFont *)font;

@end

NS_ASSUME_NONNULL_END
