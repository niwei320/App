//
//  PPUtilly
//  PP1717Wan
//
//  Created by yaofangwang on 14-11-20.
//  Copyright (c) 2012年 PPTV Innovation. All rights reserved.
//

#import <UIKit/UIKit.h>

typedef void (^PPVoidBlock)(void);

/**
 @brief 处理一些事件的block，sender为调用次block的对象，obj传与要处理事件相关的对象
 */
typedef void (^PPActionBlock)(id sender, id obj);

typedef void (^PPIndexBlock)(NSUInteger index);

typedef void (^PPIndexPathBlock)(NSIndexPath *path,NSUInteger index);

//time

#define PP_SECONDS_PER_MINUTE 60
#define PP_SECONDS_PER_HOUR   (60 * PP_SECONDS_PER_MINUTE)
#define PP_SECONDS_PER_DAY    (24 * PP_SECONDS_PER_HOUR)
#define PP_SECONDS_PER_WEEK   (7 * PP_SECONDS_PER_DAY)

//coder

#define STRINGIFY(x) #x
#define OBJC_STRINGIFY(x) @#x

#define ENCODE_OBJECT(x) [aCoder encodeObject:x forKey:OBJC_STRINGIFY(x)]
#define DECODE_OBJECT(x) [aDecoder decodeObjectForKey:OBJC_STRINGIFY(x)]

#define ENCODE_INTEGER(x) [aCoder encodeInteger:x forKey:OBJC_STRINGIFY(x)]
#define DECODE_INTEGER(x) [aDecoder decodeIntegerForKey:OBJC_STRINGIFY(x)]

#define ENCODE_UINTEGER(x) [aCoder encodeObject:[NSNumber numberWithUnsignedInteger:x] forKey:OBJC_STRINGIFY(x)]
#define DECODE_UINTEGER(x) [[aDecoder decodeObjectForKey:OBJC_STRINGIFY(x)] unsignedIntegerValue]

#define ENCODE_ULONGLONG(x) [aCoder encodeObject:[NSNumber numberWithUnsignedLongLong:x] forKey:OBJC_STRINGIFY(x)]
#define DECODE_ULONGLONG(x) [[aDecoder decodeObjectForKey:OBJC_STRINGIFY(x)] unsignedLongLongValue]

#define ENCODE_FLOAT(x) [aCoder encodeFloat:x forKey:OBJC_STRINGIFY(x)]
#define DECODE_FLOAT(x) [aDecoder decodeFloatForKey:OBJC_STRINGIFY(x)]

#define ENCODE_DOUBLE(x) [aCoder encodeDouble:x forKey:OBJC_STRINGIFY(x)]
#define DECODE_DOUBLE(x) [aDecoder decodeDoubleForKey:OBJC_STRINGIFY(x)]

#define ENCODE_BOOL(x) [aCoder encodeBool:x forKey:OBJC_STRINGIFY(x)]
#define DECODE_BOOL(x) [aDecoder decodeBoolForKey:OBJC_STRINGIFY(x)]

//devices

#define PP_IS_PHONE() (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPhone)
#define PP_IS_PAD() (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad)
#define PP_SCREEN_WIDTH [UIScreen mainScreen].bounds.size.width
#define PP_SCREEN_HEIGHT [UIScreen mainScreen].bounds.size.height
#define PP_SEPARATOR_WIDTH 1.0/[UIScreen mainScreen].scale

//call
#define PP_CALL(PhoneNumber) [[UIApplication sharedApplication] openURL:[NSURL URLWithString:[NSString stringWithFormat:@"telprompt://%@", PhoneNumber]]]


