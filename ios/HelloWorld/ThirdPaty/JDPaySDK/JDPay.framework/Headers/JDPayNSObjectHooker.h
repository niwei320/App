//
//  NSObject+OCFHooker.h
//  OCFoundation
//
//  Created by dongkui on 2/10/16.
//  Copyright © 2016 dongkui. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSObject (JDPayHooker)

/**
 Hook a instance method for the given class
 
 @param selector1 The original method
 @param selector2 the new method
 @param aClass The class you want to hook
 */
+ (void)jdp_hookInstanceSelector:(SEL)selector1 withSelector:(SEL)selector2 forClass:(Class)aClass;

/**
 Hook a instance method for current class
 
 @param selector1 The original method
 @param selector2 the new method
 */
+ (void)jdp_hookInstanceSelector:(SEL)selector1 withSelector:(SEL)selector2;

/**
 Hook a class method for the given class
 
 @param selector1 The original method
 @param selector2 the new method
 @param aClass The class you want to hook
 */
+ (void)jdp_hookClassSelector:(SEL)selector1 withSelector:(SEL)selector2 forClass:(Class)aClass;

/**
 Hook a class method for current class
 
 @param selector1 The original method
 @param selector2 the new method
 */
+ (void)jdp_hookClassSelector:(SEL)selector1 withSelector:(SEL)selector2;

@end
