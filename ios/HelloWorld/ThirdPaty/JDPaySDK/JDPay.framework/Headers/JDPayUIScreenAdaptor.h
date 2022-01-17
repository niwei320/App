//
//  OCUIScreenAdaptor.h
//  OCUIKit
//
//  Created by dongkui on 2017/5/6.
//  Copyright © 2017年 dongkui. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

__BEGIN_DECLS

/** Get exact size of 1 pixel */
extern CGFloat JDPayUIScreen1PixelSize(void);

/** Get adapted screen scale factor */
extern CGFloat JDPayUIScreenNativeScaleFactor(void);

/**
 Get the adapted size for current device.
 
 @param size The size on 4.7 inches screen, which should be the size of iPhone 6/7/8.
 */
extern CGFloat JDPayUIScreenNativeSize(CGFloat size);

__END_DECLS
