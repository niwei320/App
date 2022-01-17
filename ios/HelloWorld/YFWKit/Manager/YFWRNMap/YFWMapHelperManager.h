//
//  YFWMapHelperManager.h
//  HelloWorld
//
//  Created by yfw on 2020/12/4.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN
typedef void(^PIOSearchComplectionBlock)(NSArray *infos);

@interface YFWMapHelperManager : NSObject
- (void)getPOINearbyWithCallBack:(PIOSearchComplectionBlock)callBack;
- (void)getSearchPOIInCity:(NSString *)cityName withKeyWord:(NSString *)keyWord andCallBack:(PIOSearchComplectionBlock)callBack;
@end

NS_ASSUME_NONNULL_END
