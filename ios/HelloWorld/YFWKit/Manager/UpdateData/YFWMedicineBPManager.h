//
//  YFWMedicineBPManager.h
//  HelloWorld
//
//  Created by yfw-姜明均 on 2018/12/27.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface YFWFindCodeModel : NSObject

@property (nonatomic, copy) NSString *zipurl;
@property (nonatomic, copy) NSString *zipversion;
@property (nonatomic, copy) NSString *version;
@property (nonatomic, copy) NSString *updateType;
@property (nonatomic, copy) NSString *isforceUpdate;
@property (nonatomic, copy) NSString *tcp_domain;
@property (nonatomic, copy) NSString *http_domain;


+ (instancetype)modelWithDic:(NSDictionary *)dic;

@end


NS_ASSUME_NONNULL_BEGIN

@interface YFWMedicineBPManager : NSObject

@property (nonatomic, strong) NSString *versionNumber;
@property (nonatomic, strong) NSString *medicineName;
@property (nonatomic, copy) void (^doneBlock)();

+ (YFWMedicineBPManager *) sharedInstance;

- (void)requestData;
- (NSString*)get_medicine_index;
- (NSString *)get_MedicineB_p;
- (void)beginRCT;
- (void)downLoadBundleWithUrl:(NSString *)url;
@end

NS_ASSUME_NONNULL_END
