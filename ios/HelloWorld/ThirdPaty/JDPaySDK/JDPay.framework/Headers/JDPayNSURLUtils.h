//
//  OCFNSURLUtils.h
//  OCFoundation
//
//  Created by dongkui on 2019/5/3.
//  Copyright © 2019 dongkui. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

#pragma mark - NSURL (JDPayUtils)
@interface NSURL (JDPayUtils)

/*!
 @brief Get parsed arguments in the url.query.
@discussion The query should be composed by component like key=value, one more components are joined by '&'. such as "key=value&key1=value1"
 */
- (nullable NSDictionary *)jdp_parsedQueryArguments;

@end

NS_ASSUME_NONNULL_END
