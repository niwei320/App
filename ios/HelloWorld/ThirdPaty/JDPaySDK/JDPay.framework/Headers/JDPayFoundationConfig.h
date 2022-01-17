//
//  SFFoundationConfig.h
//  SFFoundation
//
//  Created by dongkui on 2019/11/10.
//  Copyright © 2019年 dongkui. All rights reserved.
//

#import <Foundation/Foundation.h>

#ifndef _JDPAY_FOUNDATION_CONFIG_H_
#define _JDPAY_FOUNDATION_CONFIG_H_

// #define [Module]Using[Feature]    on(1)/off(0) // comments
// Log
#if !GM_EDITION
#define JDPayFoundationUsingLog    1 // Do not print log
#else
#define JDPayFoundationUsingLog    0 // Print log.
#endif

// Measure performance
#if DEBUG
#define JDPayFoundationUsingMeasurePerformance    1 // Do not measure performance
#else
#define JDPayFoundationUsingMeasurePerformance    0 // Measure performance.
#endif

#endif /* _JDPAY_FOUNDATION_CONFIG_H_ */
