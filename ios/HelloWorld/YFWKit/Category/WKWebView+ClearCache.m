//
//  WKWebView+ClearCache.m
//  HelloWorld
//
//  Created by yfw on 2020/6/5.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "WKWebView+ClearCache.h"

@implementation WKWebView (ClearCache)
+ (void)yfwdeleteWebCache {
    //allWebsiteDataTypes清除所有缓存
    NSSet *websiteDataTypes = [WKWebsiteDataStore allWebsiteDataTypes];
    NSDate *dateFrom = [NSDate dateWithTimeIntervalSince1970:0];
    [[WKWebsiteDataStore defaultDataStore] removeDataOfTypes:websiteDataTypes modifiedSince:dateFrom completionHandler:^{
        
    }];
}

+ (void)yfwcustomDeleteWebCache {
    /*
     在磁盘缓存上。
     WKWebsiteDataTypeDiskCache,
     
     html离线Web应用程序缓存。
     WKWebsiteDataTypeOfflineWebApplicationCache,
     
     内存缓存。
     WKWebsiteDataTypeMemoryCache,
     
     本地存储。
     WKWebsiteDataTypeLocalStorage,
     
     Cookies
     WKWebsiteDataTypeCookies,
     
     会话存储
     WKWebsiteDataTypeSessionStorage,
     
     IndexedDB数据库。
     WKWebsiteDataTypeIndexedDBDatabases,
     
     查询数据库。
     WKWebsiteDataTypeWebSQLDatabases
     */
    NSArray * types=@[WKWebsiteDataTypeCookies,WKWebsiteDataTypeLocalStorage,WKWebsiteDataTypeDiskCache,WKWebsiteDataTypeMemoryCache,WKWebsiteDataTypeOfflineWebApplicationCache];
    
    NSSet *websiteDataTypes= [NSSet setWithArray:types];
    NSDate *dateFrom = [NSDate dateWithTimeIntervalSince1970:0];
    
    [[WKWebsiteDataStore defaultDataStore] removeDataOfTypes:websiteDataTypes modifiedSince:dateFrom completionHandler:^{
        
    }];
    
}
+(void)yfwclearCacheInCurrentVersion
{
  NSString *libraryDir = NSSearchPathForDirectoriesInDomains(NSLibraryDirectory,
  NSUserDomainMask, YES)[0];
  NSString *bundleId  =  [[[NSBundle mainBundle] infoDictionary]
  objectForKey:@"CFBundleIdentifier"];
  NSString *webkitFolderInLib = [NSString stringWithFormat:@"%@/WebKit",libraryDir];
  NSString *webKitFolderInCaches = [NSString
  stringWithFormat:@"%@/Caches/%@/WebKit",libraryDir,bundleId];
   NSString *webKitFolderInCachesfs = [NSString
   stringWithFormat:@"%@/Caches/%@/fsCachedData",libraryDir,bundleId];

  NSError *error;
  /* iOS8.0 WebView Cache的存放路径 */
  [[NSFileManager defaultManager] removeItemAtPath:webKitFolderInCaches error:&error];
  [[NSFileManager defaultManager] removeItemAtPath:webkitFolderInLib error:nil];

  /* iOS7.0 WebView Cache的存放路径 */
  [[NSFileManager defaultManager] removeItemAtPath:webKitFolderInCachesfs error:&error];
}
@end
