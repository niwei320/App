//
//  YFWSocketRequestOperation.h
//  ScoketManager
//
//  Created by 姜明均 on 2018/1/18.
//  Copyright © 2018年 ios. All rights reserved.
//

#import <Foundation/Foundation.h>

typedef void(^Success_Block)(NSDictionary *response);
typedef void(^Error_Block)(NSError *error);
typedef void(^connectHost_Block)(void);

@interface YFWSocketRequestOperation : NSObject

///链接服务器
- (BOOL)connecteServer;

///断开服务器
- (void)disconnect;

///发送数据
- (void)sendDataWithDic:(NSDictionary *)param;

///回调数据
- (void) reciveData:(Success_Block)reciveBlock;
- (void) reciveError:(Error_Block)errorBlock;
- (void) reciveConnectHost:(connectHost_Block)connetBlock;

@end
