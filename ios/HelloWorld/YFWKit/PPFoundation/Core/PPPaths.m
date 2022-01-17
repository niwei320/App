//
//  PPPaths.m
//  PP1717Wan
//
//  Created by yaofangwang on 14-10-17.
//  Copyright (c) 2014年 yaofangwang. All rights reserved.
//

#import "PPPaths.h"

#if !defined(__has_feature) || !__has_feature(objc_arc)
#error "Nimbus requires ARC support."
#endif

NSString* PPPathForBundleResource(NSBundle* bundle, NSString* relativePath) {
    NSString* resourcePath = [(nil == bundle ? [NSBundle mainBundle] : bundle) resourcePath];
    return [resourcePath stringByAppendingPathComponent:relativePath];
}

NSString* PPPathForDocuments(NSString* relativePath) {
    static NSString* documentsPath = nil;
    if (nil == documentsPath) {
        NSArray* dirs = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory,
                                                            NSUserDomainMask,
                                                            YES);
        documentsPath = [dirs objectAtIndex:0];
    }
    return [documentsPath stringByAppendingPathComponent:relativePath];
}

NSString* PPPathForLibrary(NSString* relativePath) {
    static NSString* libraryPath = nil;
    if (nil == libraryPath) {
        NSArray* dirs = NSSearchPathForDirectoriesInDomains(NSLibraryDirectory,
                                                            NSUserDomainMask,
                                                            YES);
        libraryPath = [dirs objectAtIndex:0];
    }
    return [libraryPath stringByAppendingPathComponent:relativePath];
}

NSString* PPPathForCaches(NSString* relativePath) {
    static NSString* cachesPath = nil;
    if (nil == cachesPath) {
        NSArray* dirs = NSSearchPathForDirectoriesInDomains(NSCachesDirectory,
                                                            NSUserDomainMask,
                                                            YES);
        cachesPath = [dirs objectAtIndex:0];
    }
    return [cachesPath stringByAppendingPathComponent:relativePath];
}
