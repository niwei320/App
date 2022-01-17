//
//  YFWSocketImageUploadOperation.h
//  YaoFang
//
//  Created by 姜明均 on 2018/2/7.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface YFWSocketImageUploadOperation : NSObject

typedef void(^Success_Block)(NSDictionary *response);
typedef void(^Error_Block)(NSError *error);
typedef void(^connectHost_Block)(void);

@property (nonatomic,assign) int diskid;
///链接服务器
- (BOOL)connecteServer;

///断开服务器
- (void)disconnect;

///发送数据
- (void)sendDataWithImage:(UIImage *)image;

///回调数据
- (void) reciveData:(Success_Block)reciveBlock;
- (void) reciveError:(Error_Block)errorBlock;
- (void) reciveConnectHost:(connectHost_Block)connetBlock;

@end
