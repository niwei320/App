//
//  OCFJSONModel.h
//  OCFoundation
//
//  Created by Kenny on 2017/2/1.
//  Copyright © 2017 Kenny DONG. All rights reserved.
//

#ifndef _OCF_JSON_MODEL_H_
#define _OCF_JSON_MODEL_H_

#if __OBJC__

#import <Foundation/Foundation.h>

/**
 JDPayJSONModel provides basic core function to convert JDPayJSONModel instance into JSON dictionary by using interface
 toJSONDictionary and create instance from a json dictionary by using interface initWithDictionary:.
 You need to create your own subclass and add some properties to get it jsonable.
 
 @Note The json model supports following kind of property type: NSString, NSMutableString, NSNumber, NSDecimalNumber,
 NSArray, NSMutableArray, NSDictionary, NSMutableDictionary, subclass of JDPayJSONModel and all primitive types, such as
 int, short, long, unsigned X, float, double, NSInteger, NSUInteger etc.
 */
@interface JDPayJSONModel : NSObject

/**
 Set JSONAble element class for specific array property.
 
 @note If you want a jsonable model class stored in an array typed property, you must call this function to set the
 jsonable model class before you call - [[NSObject setValuesForKeysWithDictionary] + [JDPayJSONModel modelWithDictionary:],
 - [JDPayJSONModel initWithDictionary:] and - [JDPayJSONModel toJSONDictionary].
 */
+ (void)setJSONAbleElementClass:(Class)elementClass forArrayProperty:(NSString *)propertyName;

/**
 Create an instance and init with the dictionary.
 */
+ (id)modelWithDictionary:(NSDictionary *)dictionary;

/**
 Create an instance.
 */
+ (id)model;

/**
 Init with the dictionary.
 */
- (instancetype)initWithDictionary:(NSDictionary *)dictionary NS_DESIGNATED_INITIALIZER;

/**
 Updates properties of the receiver with values from a given dictionary, using its keys to identify the properties.
 
 @param dictionary A dictionary whose keys identify properties in the receiver. The values of the properties in the
 receiver are set to the corresponding values in the dictionary.
 */
- (void)updateWithDictionary:(NSDictionary *)dictionary;

/**
 Convert the model to a jsonable dictionary.
 */
- (NSDictionary *)toJSONDictionary;

@end

#endif // __OBJC__

#endif // _OCF_JSON_MODEL_H_
