//
//  JDPayCollectionUtils.h
//  JDPayFoundation
//
//  Created by dongkui on 2019/3/25.
//  Copyright © 2019 JD. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

#pragma mark - NSObject (JDPayIsEmpty)
@interface NSObject (JDPayIsEmpty)

/**
 Check if an object is nil or its length/count is 0 or it is a NSNull instance.
 */
+ (BOOL)jdp_isEmptyObject:(id)anObject;

@end

#pragma mark - NSMutableArray (JDPaySetNonEmpty)
@interface NSMutableArray<ObjectType> (JDPaySetNonEmpty)

/**
 Add a non-empty object, which will be checked using '+ [NSObject jdp_isEmptyObject:]'.
 
 @return YES, if success, otherwise NO.
 */
- (BOOL)jdp_addNonEmptyObject:(ObjectType)anObject;

@end

#pragma mark - NSMutableArray (JDPaySafe)
@interface NSMutableArray<ObjectType> (JDPaySafe)

/**
 Remove a object safely.
 */
- (void)jdp_removeObject:(ObjectType __nullable)anObject;

@end

#pragma mark - NSDictionary (JDPayMerge)
@interface NSDictionary (JDPayMerge)

/**
 Generate a new dictionary by adding current dictionary with the given dict.
 
 @return NSDictionary instance.
 */
- (instancetype)jdp_dictionaryByAddingDictionary:(NSDictionary *)dict;

@end

#pragma mark - NSMutableDictionary (JDPaySetNonEmpty)
@interface NSMutableDictionary<KeyType, ObjectType> (JDPaySetNonEmpty)

/**
 Set a non-empty object, which will be checked using '+ [NSObject jdp_isEmptyObject:]'.
 
 @return YES, if success, otherwise NO.
 */
- (BOOL)jdp_setNonEmptyObject:(ObjectType)anObject forKey:(KeyType <NSCopying>)aKey;

@end

NS_ASSUME_NONNULL_END
