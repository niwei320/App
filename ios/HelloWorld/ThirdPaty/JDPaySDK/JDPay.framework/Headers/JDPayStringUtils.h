//
//  OCFStringUtils.h
//  OCFoundation
//
//  Created by dongkui on 2019/5/3.
//  Copyright © 2019 dongkui. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

#pragma mark - NSString (JDPayNSURLQueryComponentValue)
@interface NSString (JDPayNSURLQueryComponentValue)

/*!
@brief Encode current string into a valid  query component value.
*/
- (NSString *)jdp_encodedQueryComponentValue;

@end

NS_ASSUME_NONNULL_END
