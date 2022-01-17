//
//  JDPayModule.h
//  JDPayFoundation
//
//  Created by dongkui on 12/07/2017.
//  Copyright © 2017 JD. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#ifndef _JDPAY_MODULE_H_
#define _JDPAY_MODULE_H_

NS_ASSUME_NONNULL_BEGIN

#pragma mark - JDPayModuleProtocol
@protocol JDPayModuleProtocol <NSObject>

@required
- (BOOL)canOpenURL:(NSURL *)url options:(nullable NSDictionary<NSString *, id> *)options;

- (void)openURL:(NSURL*)url
        options:(nullable NSDictionary<NSString *, id> *)options
completionHandler:(void (^ _Nullable)(id _Nullable results, BOOL handled))completion;

@end

#pragma mark - JDPayModule
@interface JDPayModule : NSObject <JDPayModuleProtocol>

@property (readonly, strong) NSBundle *mainBundle;
@property (readonly, copy) NSString *identifier;
@property (readonly, nullable, copy) NSString *name;// nil for main bundle
@property (readonly, copy) NSString *version;
@property (readonly, copy) NSString *buildVersion;
@property (nonatomic, nullable, copy) NSString *channel;
@property (readonly, nullable, copy) NSString *GITCommitID;// Commit Hash of Git repository

/*!
 Check to see if any module can handle the url with the options.
 */
+ (BOOL)canHandleURL:(NSURL *)url options:(nullable NSDictionary<NSString *, id> *)options;

/*!
 Handle the url with given options and completion.
 
 @param url NSURL instance see https://developer.apple.com/documentation/foundation/nsurl, Currently, the 'JDPayModule'
 scheme is used to communicate with JDPayModule based modules.
 
 The user property of NSURL indicate the class name of the module, which is optional, if you do not specify the user, class
 name will be the same as module name.
 
 The host property of NSURL indicate the module name, which is required.
 
 Other property of NSURL can be customed by the owner module to implement specific functions.
 
 @param options NSDictionary.
 @param completion Completion callback.
 
 @attention
 JDPayModule provides a basic protocol URL 'JDPayModule://[MODULE_NAME]/mainModule', which give you a way to get the
 instance of the module specified by [MODULE_NAME].
 */
+ (void)handleURL:(NSURL*)url
          options:(nullable NSDictionary<NSString *, id> *)options
completionHandler:(void (^ _Nullable)(id _Nullable result, BOOL handled))completion;

/*!
 Get or load a module
 
 @param name The module name.
 */
+ (nullable instancetype)moduleWithName:(nullable NSString *)name;

/*!
 Register the module.
 
 @note The module will be registered automatically when calling '+ moduleWithName:'
 
 @param module JDPayModule.
 */
+ (BOOL)registerModule:(JDPayModule *)module;

/*!
 Unregister the module to release it if possible.
 
 @param module JDPayModule.
 */
+ (void)unregisterModule:(JDPayModule *)module;

/*!
 The designed initializer to init a module with specific name.
 */
- (nullable instancetype)initWithName:(nullable NSString *)name NS_DESIGNATED_INITIALIZER;

/*!
 @brief Returns the value associated with the specified key in the module's information property list.
 
 Use of this method is preferred over other access methods because it returns the localized value of a key when one is 
 available.
 Parameters
 
 @param key A key in the module's property list.
 
 @return The value associated with key in the module's property list (Info.plist). The localized value of a key is 
 returned when one is available.
 */
- (nullable id)objectForInfoDictionaryKey:(NSString *)key;

- (nonnull NSArray<NSString *> *)pathsForResource:(nullable NSString *)name
                                           ofType:(nullable NSString *)ext
                                      inDirectory:(nullable NSString *)subpath
                                  forLocalization:(nullable NSString *)localizationName;
/*!
 @brief Returns an array containing the files for all bundle resources matching the specified criteria(name, ext, subpath,
 localizationName).
 
 @param names The filenames of the files to locate. If you specify an empty string or nil, the filenames is
 assumed not to exist.
 
 @param types The filename extensions of the files to locate. If you specify an empty string or nil, the extension is
 assumed not to exist.
 
 @param subpath The name of the module's bundle subdirectory to search.
 
 @param localizationName The language ID for the localization.
 
 @param stopOnceFound Stop the searching once it found matched result.
 
 @return An array containing the full pathnames for all module's bundle resources matching the specified criteria. This
 method returns an empty array if no matching resource files are found.
 */
- (nonnull NSArray<NSString *> *)pathsForResources:(nullable NSArray<NSString *> *)names
                                           ofTypes:(nullable NSArray<NSString *> *)types
                                       inDirectory:(nullable NSString *)subpath
                                   forLocalization:(nullable NSString *)localizationName
                                     stopOnceFound:(BOOL)stopOnceFound;

- (nonnull NSArray<NSString *> *)pathsForResources:(nullable NSArray<NSString *> *)names
                                           ofTypes:(nullable NSArray<NSString *> *)types
                                       inDirectory:(nullable NSString *)subpath
                                   forLocalization:(nullable NSString *)localizationName;

- (NSString *)localizedStringForKey:(NSString *)key value:(nullable NSString *)value table:(nullable NSString *)tableName;

/*!
 @brief This method looks in the files of module's bundle for an image object with the specified name and returns the
 variant of that image that best matches the specified name and screen scale. the resulting image will be cached.
 
 @param name The name of the image. For images in asset catalogs, specify the name of the image asset, the filename
 extension will be ingored if it exists. For PNG, JPG or JPEG image files, specify the filename without the filename
 extension. For all other image file formats, include the filename extension in the name.
 
 @return The UIImage instance.
 */
- (nullable UIImage *)cachedImageNamed:(NSString *)name NS_AVAILABLE_IOS(8.0);

/*!
 @brief This method looks in the files of module's bundle for an image object with the specified name and returns the
 variant of that image that best matches the specified name and screen scale.
 
 @note This function does not support images in asset catalogs. use '-cachedImageNamed:' instend.
 
 @param name The name of the image. For PNG, JPG or JPEG image files, you may specify the filename without the filename
 extension. For all other image file formats, include the filename extension in the name.
 
 @return The UIImage instance.
 */
- (nullable UIImage *)imageNamed:(NSString *)name;

/*!
 @brief Unarchives the contents of a nib file located in the module's bundle.
 
 You can use this method to load user interfaces and make the objects available to your code. During the loading process,
 this method unarchives each object, initializes it, sets its properties to their configured values, and reestablishes 
 any connections to other objects. (To establish outlet connections, this method uses the setValue:forKey: method, which
 may cause the object in the outlet to be retained automatically.) For detailed information about the nib-loading process,
 see <a href="https://developer.apple.com/library/etc/redirect/xcode/content/1189/documentation/Cocoa/Conceptual/LoadingResources/Introduction/Introduction.html#//apple_ref/doc/uid/10000051i">Resource Programming Guide</a>
 
 If the nib file contains any proxy objects beyond just the File’s Owner proxy object, you can specify the runtime 
 replacement objects for those proxies using the options dictionary. In that dictionary, add the UINibExternalObjects key
 and set its value to a dictionary containing the names of any proxy objects (the keys) and the real objects to use in 
 their place. The proxy object’s name is the string you assign to it in the Identifier field of the Interface Builder 
 inspector window.

 @param name The name of the nib file, which need not include the .nib extension.
 
 @param owner The object to assign as the nib’s File's Owner object.
 
 @param options A dictionary containing the options to use when opening the nib file. For a list of available keys for
 this dictionary, see UIKit Nib Loading Options.
 
 @return An array containing the top-level objects in the nib file. The array does not contain references to the File’s
 Owner or any proxy objects; it contains only those objects that were instantiated when the nib file was unarchived. You 
 should retain either the returned array or the objects it contains manually to prevent the nib file objects from being 
 released prematurely.
 */
- (nullable NSArray *)loadNibNamed:(NSString *)name owner:(nullable id)owner options:(nullable NSDictionary *)options;

/*!
 @brief Returns a UINib object initialized to the nib file in the module's bundle.
 
 The UINib object looks for the nib file in the bundle's language-specific project directories first, followed by the 
 Resources directory.
 
 @param name The name of the nib file, without any leading path information.

 @return The initialized UINib object. An exception is thrown if there were errors during initialization or the nib file
 could not be located.
 */
- (nullable UINib *)nibWithNibName:(NSString *)name;

@end

/**
 Macro to declare/implement the main convenient module API function.
 @Note If you want to use the module function in an app(which is a main),You must set the 'modulename' parameter of JDPAY_MODULE_FUNCTION_IMPLEMENT macro to nil.
 
 @discussion
 e.g.:
 @interface JDPayModuleName : JDPayModule
 JDPAY_MODULE_FUNCTION_DECLARE(JDPayModuleName)
 @end
 
 @implementation JDPayModuleName
 JDPAY_MODULE_FUNCTION_IMPLEMENT(JDPayModuleName, @"JDPayModuleName")
 @end
 */
#pragma mark - Macro for module declaration & implement

#define JDPAY_MODULE_FUNCTION_DECLARE(classname) \
\
+ (nullable instancetype )mainModule;\
\
FOUNDATION_EXPORT classname *_Nullable classname##_mainModule(void);\
\
FOUNDATION_EXPORT NSString *_Nullable classname##_localizedString(NSString *_Nonnull key);\
\
FOUNDATION_EXPORT UIImage *_Nullable classname##_imageNamed(NSString *_Nonnull name);\
\

#define JDPAY_MODULE_FUNCTION_IMPLEMENT(classname, modulename) \
\
+ (nullable instancetype)mainModule\
{\
    return [self moduleWithName:modulename];\
}\
\
classname *_Nullable classname##_mainModule(void)\
{\
    return [classname mainModule];\
}\
\
UIImage *_Nullable classname##_imageNamed(NSString *_Nonnull name)\
{\
    return [classname##_mainModule() imageNamed:name];\
}\
\
NSString *_Nullable classname##_localizedString(NSString *_Nonnull key)\
{\
    return [classname##_mainModule() localizedStringForKey:key value:key table:nil];\
}\
\

NS_ASSUME_NONNULL_END

#endif// _JDPAY_MODULE_H_
