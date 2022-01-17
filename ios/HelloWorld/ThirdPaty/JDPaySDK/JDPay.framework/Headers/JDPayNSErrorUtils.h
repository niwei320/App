//
//  JDPayNSErrorUtils.h
//  SFFoundation
//
//  Created by dongkui on 2019/5/18.
//  Copyright © 2019 dongkui. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

#pragma mark - NSError (JDPayUtil)
@interface NSError (JDPayUtil)

+ (NSError *)jdp_errorWithDomain:(NSString *)domain
                            code:(NSInteger)code
                   localizedDesc:(NSString * _Nullable)localizedDesc
                 underlyingError:(NSError * _Nullable)underlyingError
                       debugDesc:(NSString * _Nullable)debugDesc;

@end

NS_ASSUME_NONNULL_END
