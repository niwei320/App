//
//  OCUIImage+UIColor.h
//  OCUIKit
//
//  Created by dongkui on 4/2/16.
//  Copyright © 2016 dongkui. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface UIImage (UIColor)

/**
 Create a gradient UIImage instance with given parameters.

 @param size The size of the UIImage instance.

 @param colors The array of UIColor objects defining the color of each gradient stop.

 @param startPoint The start and end points of the gradient when drawn into the layer's coordinate space. The start
 point corresponds to the first gradient stop, the end point to the last gradient stop. Both points are defined in a
 unit coordinate space that is then mapped to the layer's bounds rectangle when drawn. (I.e. [0,0] is the bottom-left
 corner of the layer, [1,1] is the top-right corner.) The default values are [.5,0] and [.5,1] respectively.

 @param endPoint See startPoint

 @param locations An optional array of NSNumber objects defining the location of each gradient stop as a value in the
 range [0,1]. The values must be monotonically increasing. If a nil array is given, the stops are assumed to spread
 uniformly across the [0,1] range. When rendered, the colors are mapped to the output colorspace before being
 interpolated.

 @return UIImage instance
 */
+ (nullable UIImage *)jdp_imageWithSize:(CGSize)size
                         gradientColors:(NSArray<UIColor *> *_Nonnull)colors
                             startPoint:(CGPoint)startPoint
                               endPoint:(CGPoint)endPoint
                              locations:(NSArray<NSNumber *> *_Nullable)locations;

/**
 Create a gradient UIImage instance with given parameters.

 @param size The size of the UIImage instance.

 @param colors The array of UIColor objects defining the color of each gradient stop.

 @param horizontal BOOL, YES to create a left to right image, NO to create a top to bottom grident image.

 @return UIImage instance
 */
+ (nullable UIImage *)jdp_imageWithSize:(CGSize)size gradientColors:(NSArray<UIColor *> *_Nonnull)colors horizontal:(BOOL)horizontal;

/**
 Create a vertical gradient UIImage instance with given parameters.

 @param size The size of the UIImage instance.

 @param colors The array of UIColor objects defining the color of each gradient stop.

 @return UIImage instance
 */
+ (nullable UIImage *)jdp_imageWithSize:(CGSize)size gradientColors:(NSArray<UIColor *> *_Nonnull)colors;

/**
 Create an one pixel UIImage instance with given color.

 @param color The UIColor object defining the color of the image.

 @return UIImage instance
 */
+ (nullable UIImage *)jdp_imageWithUIColor:(UIColor *_Nonnull)color;

@end
