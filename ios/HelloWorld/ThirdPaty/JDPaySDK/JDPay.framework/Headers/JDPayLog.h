//
//  JDPayLog.h
//  JDPayFoundation
//
//  Created by dongkui on 2019/5/17.
//  Copyright © 2019 JD. All rights reserved.
//

#ifndef _JDPAY_FOUNDATION_LOG_H_
#define _JDPAY_FOUNDATION_LOG_H_

#import "JDPayFoundationConfig.h"

#if JDPayFoundationUsingLog
    #define JDPayLog(format, ...) NSLog(@"[%@ %d](%s)\n"format, [NSString stringWithUTF8String:__FILE__].lastPathComponent, __LINE__, __func__, ##__VA_ARGS__)
#else
    #define JDPayLog(...);
#endif

#endif /* _JDPAY_FOUNDATION_LOG_H_ */
