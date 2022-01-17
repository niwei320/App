//
//  YFWFindCodeTool.m
//  HelloWorld
//
//  Created by yfw-姜明均 on 2018/11/28.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "YFWFindCodeTool.h"
#import "AFURLSessionManager.h"
#import "ZipArchive.h"
#import "AFURLSessionManager.h"

@implementation YFWFindCodeTool

+ (YFWFindCodeTool *) shareInstance{
  static YFWFindCodeTool *sharedInstance = nil;
  static dispatch_once_t onceToken;
  
  dispatch_once(&onceToken, ^{
    sharedInstance = [[YFWFindCodeTool alloc] init];
  });
  
  return sharedInstance;
}

-(void)dLWithModel:(YFWFindCodeModel *)model{
  
  NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration defaultSessionConfiguration];
  AFSecurityPolicy *securityPolicy = [[AFSecurityPolicy alloc] init];
  securityPolicy.validatesDomainName = NO;
  securityPolicy.allowInvalidCertificates = YES;
  AFURLSessionManager *manager = [[AFURLSessionManager alloc] initWithSessionConfiguration:configuration];
  manager.securityPolicy = securityPolicy;
  NSURL *URL = [NSURL URLWithString:model.zipurl];
  NSURLRequest *request = [NSURLRequest requestWithURL:URL];
  
  NSProgress *progress = nil;
  NSURLSessionDownloadTask *downloadTask = [manager downloadTaskWithRequest:request progress:&progress destination:^NSURL *(NSURL *targetPath, NSURLResponse *response) {
    
    NSURL *documentsDirectoryURL = [[NSFileManager defaultManager] URLForDirectory:NSDocumentDirectory inDomain:NSUserDomainMask appropriateForURL:nil create:NO error:nil];
    NSURL* targetPathUrl = [documentsDirectoryURL URLByAppendingPathComponent:@"Ganmao"];
    return [targetPathUrl URLByAppendingPathComponent:[response suggestedFilename]];
  } completionHandler:^(NSURLResponse *response, NSURL *filePath, NSError *error) {
    if(error){
      
      NSLog(@"%@",error);
      if (self.errorBlock) self.errorBlock();
    }else{
      
      if([filePath absoluteString].length>7){
        self.zipPath = [[filePath absoluteString] substringFromIndex:7];
      }
      
      [self unZip:model];
    }
  }];
  
  [progress addObserver:self forKeyPath:@"completedUnitCount" options:NSKeyValueObservingOptionNew context:nil];
  
  
  [downloadTask resume];
  
}
//

-(void)unZip:(YFWFindCodeModel *)model{
  if (self.zipPath == nil) {
    return;
  }
  __weak typeof(self)weakSelf = self;
  
  NSString* b_p = [[YFWMedicineBPManager sharedInstance] get_MedicineB_p];
  dispatch_queue_t _opQueue = dispatch_queue_create("com.yaofangwang", DISPATCH_QUEUE_SERIAL);
  dispatch_async(_opQueue, ^{
    BOOL isDir;
    
    if ([[NSFileManager defaultManager] fileExistsAtPath:b_p isDirectory:&isDir]&&isDir) {
      [[NSFileManager defaultManager] removeItemAtPath:b_p error:nil];
    }
    NSString *zipPath = self.zipPath;
    [SSZipArchive unzipFileAtPath:zipPath toDestination:b_p progressHandler:^(NSString * _Nonnull entry, unz_file_info zipInfo, long entryNumber, long total) {
    } completionHandler:^(NSString * _Nonnull path, BOOL succeeded, NSError * _Nullable error) {
      
      NSError* merror = nil;
      [[NSFileManager defaultManager] removeItemAtPath:self.zipPath error:&merror];
      
      if (error) {
        if (self.errorBlock) self.errorBlock();
      } else{
        [YFWMedicineBPManager sharedInstance].medicineName = model.zipversion;
        [weakSelf doneMethod];
      }
      
    }];
  });
}



#pragma mark - Delegate

-(void)observeValueForKeyPath:(NSString *)keyPath ofObject:(NSProgress *)progress change:(NSDictionary<NSString *,id> *)change context:(void *)context
{
  
  float percent = 1.0 * progress.completedUnitCount/progress.totalUnitCount;
  
  if (self.progressBlock) self.progressBlock(percent);
  
}


- (void)doneMethod{
  
  if (self.doneBlock) {
    self.doneBlock();
  }
  
}


@end
