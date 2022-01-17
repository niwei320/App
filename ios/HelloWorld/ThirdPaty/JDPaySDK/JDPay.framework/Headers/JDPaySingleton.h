//
//  JDPaySingleton.h
//  JDPayFoundation
//
//  Created by dongkui on 10/12/13.
//  Copyright © 2013 dongkui. All rights reserved.
//

/**
 Macro to declare/implement a singleton instance class
 example:
 @interface A : NSObject
 JDPAY_SINGLETON_DECLARE(A, sharedA)
 @end
 
 @implementation A
 JDPAY_SINGLETON_IMPLEMENT(A, sharedA)
 @end
 */
#define JDPAY_SINGLETON_DECLARE(classname, methodname)\
\
+ (classname *)methodname;\
\

#define JDPAY_SINGLETON_IMPLEMENT(classname, methodname)\
\
+ (classname *)methodname\
{\
    static classname *s##classname = nil;\
    if (s##classname == nil) {\
        static dispatch_once_t onceToken;\
        dispatch_once(&onceToken, ^{\
            if (s##classname == nil) {\
                s##classname = [[super allocWithZone:NULL] init];\
            }\
        });\
    }\
    return s##classname;\
}\
\
+ (id)allocWithZone:(struct _NSZone *)zone\
{\
    return [self methodname];\
}\
\
