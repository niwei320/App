//
//  SFPerformance.h
//  SFFoundation
//
//  Created by dongkui on 2019/11/10.
//  Copyright © 2019 dongkui. All rights reserved.
//

#ifndef _JDPAY_FOUNDATION_PERFORMANCE_H_
#define _JDPAY_FOUNDATION_PERFORMANCE_H_

#import "JDPayFoundationConfig.h"

#if JDPayFoundationUsingMeasurePerformance
#define JDPAY_MEASURE_PERFORMANCE_START(FUNCNAME) NSDate *FUNCNAME = [NSDate date]
#define JDPAY_MEASURE_PERFORMANCE_END(FUNCNAME) JDPayLog(@"%s %s used %f seconds", __PRETTY_FUNCTION__, #FUNCNAME, -[FUNCNAME timeIntervalSinceNow])
#else
#define JDPAY_MEASURE_PERFORMANCE_START(FUNC) {}
#define JDPAY_MEASURE_PERFORMANCE_END(FUNC) {}
#endif

#endif /* _JDPAY_FOUNDATION_PERFORMANCE_H_ */
