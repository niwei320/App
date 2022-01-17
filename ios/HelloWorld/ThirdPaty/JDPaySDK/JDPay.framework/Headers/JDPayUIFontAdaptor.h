//
//  OCUIFontAdaptor.h
//  OCUIKit
//
//  Created by dongkui on 2017/5/6.
//  Copyright © 2017年 dongkui. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "JDPayUIScreenAdaptor.h"

__BEGIN_DECLS

NS_ASSUME_NONNULL_BEGIN

/**
 Create a system font object in the specified size.

 @param fontSize Font size in point
 @return UIFont
 */
NS_INLINE UIFont* _Nullable JDPayUIFontOfSize(CGFloat fontSize)
{
    return [UIFont systemFontOfSize:fontSize];
}

/**
 Create a bold system font object in the specified size.
 
 @param fontSize Font size in point
 @return UIFont
 */
NS_INLINE UIFont* _Nullable JDPayUIBoldFontOfSize(CGFloat fontSize)
{
    return [UIFont boldSystemFontOfSize:fontSize];
}

/**
 Create an adapted system font object in the specified size. adapted means that the font created by this method has been
 scaled properly for current device.
 
 @param fontSize Standard font size on iPhone 6/7/8
 @return UIFont
 */
NS_INLINE UIFont* _Nullable JDPayUINativeFontOfSize(CGFloat fontSize)
{
    return JDPayUIFontOfSize(JDPayUIScreenNativeSize(fontSize));
}

/**
 Create an adapted bold system font object in the specified size. adapted means that the font created by this method has
 been scaled properly for current device.
 
 @param fontSize Standard font size on iPhone 6/7/8
 @return UIFont
 */
NS_INLINE UIFont* _Nullable JDPayUINativeBoldFontOfSize(CGFloat fontSize)
{
    return JDPayUIBoldFontOfSize(JDPayUIScreenNativeSize(fontSize));
}

NS_ASSUME_NONNULL_END

__END_DECLS
