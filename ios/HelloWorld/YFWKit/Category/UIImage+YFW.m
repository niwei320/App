//
//  UIImage+YFW.m
//  HelloWorld
//
//  Created by yfw-姜明均 on 2019/4/16.
//  Copyright © 2019年 Facebook. All rights reserved.
//

#import "UIImage+YFW.h"
#import <ImageIO/ImageIO.h>

@implementation UIImage (YFW)
+ (UIImage*)mosaicWithImage:(UIImage *)image Level:(NSUInteger)level{
  
  if (!image) return nil;
  
  CGImageRef imageRef = image.CGImage;
  NSUInteger width = CGImageGetWidth(imageRef);
  NSUInteger height = CGImageGetHeight(imageRef);
  
  CGColorSpaceRef  colorSpaceRef = CGImageGetColorSpace(imageRef);
  
  CGContextRef contextRef = CGBitmapContextCreate(nil, width, height, 8, width*4, colorSpaceRef, kCGImageAlphaPremultipliedLast);
  
  CGContextDrawImage(contextRef, CGRectMake(0, 0, width, height), imageRef);
  
  unsigned char * bitmapData = CGBitmapContextGetData(contextRef);
  
  NSUInteger currentIndex,preCurrentIndex;
  unsigned char* pixels[4] = {0};
  for (NSUInteger i = 0; i < height - 1; i++){
    for(NSUInteger j = 0; j < width - 1; j++){
      currentIndex = (i * width) + j;
      if(i%level == 0){
        if(j%level == 0){
          memcpy(pixels, bitmapData + 4 *currentIndex, 4);
        }else{
          memcpy(bitmapData + 4 * currentIndex, pixels, 4);
        }
      }else{
        preCurrentIndex = (i-1) * width + j;
        memcpy(bitmapData + 4 * currentIndex, bitmapData + 4 *preCurrentIndex, 4);
      }
    }
  }
  
  NSUInteger size = width * height * 4;
  CGDataProviderRef providerRef = CGDataProviderCreateWithData(NULL, bitmapData, size, NULL);
  
  CGImageRef mosaicImageRef = CGImageCreate(width, height, 8, 4*8, width*4, colorSpaceRef, kCGImageAlphaPremultipliedLast, providerRef, NULL, NO, kCGRenderingIntentDefault);
  
  CGContextRef mosaicContextRef = CGBitmapContextCreate(nil, width, height, 8, width*4, colorSpaceRef, kCGImageAlphaPremultipliedLast);
  
  CGContextDrawImage(mosaicContextRef, CGRectMake(0, 0, width, height), mosaicImageRef);
  CGImageRef resultImageRef = CGBitmapContextCreateImage(mosaicContextRef);
  UIImage *mosaicImage = [UIImage imageWithCGImage:resultImageRef];
  
  CGImageRelease(resultImageRef);
  CGImageRelease(mosaicImageRef);
  CGColorSpaceRelease(colorSpaceRef);
  CGDataProviderRelease(providerRef);
  CGContextRelease(contextRef);
  CGContextRelease(mosaicContextRef);
  
  return mosaicImage;
  
}

@end
