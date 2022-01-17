//
//  Header.h
//  PP1717Wan
//
//  Created by yaofangwang on 14-10-17.
//  Copyright (c) 2014年 yaofangwang. All rights reserved.
//

#import <Foundation/Foundation.h>

#if defined __cplusplus
extern "C" {
#endif
    
/**
 * @brief 用于方便获取一些系统文件夹的路径
 */
    
/**
 * @brief 获取传入bunle下的路径
 *
 *      @param bundle        The bundle to append relativePath to. If nil, [NSBundle mainBundle]
 *                           will be used.
 *      @param relativePath  The relative path to append to the bundle's path.
 *
 *      @returns The bundle path concatenated with the given relative path.
 */
NSString* PPPathForBundleResource(NSBundle* bundle, NSString* relativePath);
    
    /**
     * Create a path with the documents directory and the relative path appended.
     *
     *      @returns The documents path concatenated with the given relative path.
     */
NSString* PPPathForDocuments(NSString* relativePath);
    
    /**
     * Create a path with the Library directory and the relative path appended.
     *
     *      @returns The Library path concatenated with the given relative path.
     */
NSString* PPPathForLibrary(NSString* relativePath);
    
    /**
     * Create a path with the caches directory and the relative path appended.
     *
     *      @returns The caches path concatenated with the given relative path.
     */
NSString* PPPathForCaches(NSString* relativePath);
    
#if defined __cplusplus
};
#endif
