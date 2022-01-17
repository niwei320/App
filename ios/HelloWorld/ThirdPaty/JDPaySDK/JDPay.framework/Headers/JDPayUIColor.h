//
//  JDPayUIColor.h
//  UIKit
//
//  Created by dongkui on 26/03/2017.
//  Copyright © 2017 dongkui. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

__BEGIN_DECLS

/**
 Convert HEX RGBA value to UIColor, for example:
 JDPayUIColorFromRGBA(0xffee00ff), ff->red, ee->green, 00->blue, ff->alpha.
 */
UIColor *JDPayUIColorFromRGBA(uint32_t rgba);

/**
 Convert HEX RGB value to UIColor. for example:
 JDPayUIColorFromRGB_A(0xffee00, 1.f), ff->red, ee->green, 00->blue, 1.f->alpha.
 */
UIColor *JDPayUIColorFromRGB_A(uint32_t rgb, CGFloat a);

/** Convert HEX RGB value to UIColor, the alpha value would be 1.0f. */
#define JDPayUIColorFromRGB(rgb) JDPayUIColorFromRGB_A(rgb, 1.f)

/** Convert HEX RGB string to UIColor, the alpha value would be 1.0f. */
UIColor *JDPayUIColorFromString(NSString *hexString);

/**
 Convert uint8_t R,G,B,A value to UIColor. for example:
 JDPayUIColorFromR_G_B(0, 255, 0, 1.f), 0->red, 255->green, 0->blue, 1.f->alpha.
 */
UIColor *JDPayUIColorFromR_G_B_A(uint8_t r, uint8_t g, uint8_t b, CGFloat a);

/**
 Convert uint8_t R,G,B value to UIColor, the alpha value would be 1.0f. for example:
 JDPayUIColorFromR_G_B(0, 255, 0), 0->red, 255->green, 0->blue, 1.f->alpha.
 */
#define JDPayUIColorFromR_G_B(r, g, b) JDPayUIColorFromR_G_B_A(r, g, b, 1.f)

__END_DECLS
