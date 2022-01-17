//
//  YFWSocketImageUploadOperation.m
//  YaoFang
//
//  Created by 姜明均 on 2018/2/7.
//  Copyright © 2018年 ospreyren. All rights reserved.
//

#import "YFWSocketImageUploadOperation.h"
#import "GCDAsyncSocket.h"
#import "NSString+MD5.h"
#import "NSData+MD5.h"

//#define SOCKET_HOST      @"192.168.2.249" // 李凯华
//#define SOCKET_HOST      @"192.168.2.235"  //测试服务器
//#define SOCKET_HOST      @"server.yizong.cn"  //线上服务器
//#define SOCKET_HOST      @"server-erp.yaofangwang.com"  //线上服务器
//#define SOCKET_HOST      @"192.168.2.14"  //云鹏


//线下
//#define SOCKET_HOST      @"192.168.4.125"  //孙师傅
//#define SOCKET_PORT      18480
//#define SOCKET_SECRET    @"ybyz!@#LHL8!234!$%&^@#BD1974&65"
//#define SOCKET_TIMEOUT   -1
//#define SOCKET_DBID 4200
//#define SOCKET_BUNDLEID 4200



//线上
#define SOCKET_HOST      [NSString stringWithFormat:@"upload.%@",[YFWSettingUtility yfwDomain]]  //线上
//#define SOCKET_PORT      18480
#define SOCKET_PORT      [[NSUserDefaults standardUserDefaults] integerForKey:@"yfwTcpImagePort"]
#define SOCKET_SECRET    @"ybyz!@#LHL8!234!$%&^@#BD1974&65"
#define SOCKET_TIMEOUT   -1
#define SOCKET_DBID 4000
#define SOCKET_BUNDLEID 4000



@interface YFWSocketImageUploadOperation()<GCDAsyncSocketDelegate>

@property (nonatomic, strong) GCDAsyncSocket *asyncSocket;
@property (nonatomic, strong) NSDictionary *params;
@property (nonatomic, copy) Success_Block returnBlock;
@property (nonatomic, copy) Error_Block errorBlock;
@property (nonatomic, copy) connectHost_Block connectBlock;
@property (nonatomic, strong) NSMutableData *mData;
@property (nonatomic, assign) BOOL returnSucced;

@property (nonatomic, strong) NSData *image;
@property (nonatomic, assign) int start;
@property (nonatomic, assign) int limitMax;
@property (nonatomic, assign) int limit;

@end

@implementation YFWSocketImageUploadOperation

- (void)dealloc{
    
    [self disconnect];
    
}

- (NSString *)removePointString:(NSString *)domain{
  
  if ([domain isKindOfClass:[NSString class]]) {
    NSString *firstString = [[domain substringFromIndex:0] substringToIndex:1];
    if ([firstString isEqualToString:@"."]) {
      domain = [[domain substringFromIndex:1] substringToIndex:domain.length -1];
    }
  }
  
  return domain;
}

#pragma mark - Public Function
///链接服务器
- (BOOL)connecteServer{
    
    NSError * error = nil;
    self.returnSucced = NO;
    self.start = 0;
    self.limitMax = 250*1024;
    self.limit = self.limitMax;
    NSString *HOST = SOCKET_HOST;
    NSString *tcpIp = [[NSUserDefaults standardUserDefaults] objectForKey:@"yfwTcpHost"];
    if ([tcpIp hasPrefix:@"192.168"] || [tcpIp isEqualToString:@"114.116.222.136"]) {
      HOST = tcpIp;
    }
    NSString *socket_host = [self removePointString:HOST];
    BOOL success = [self.asyncSocket connectToHost:socket_host onPort:SOCKET_PORT withTimeout:10 error:&error];
  
    if (error) {
        NSLog(@"连接失败: %@", error.description);
        if (self.errorBlock) {
            self.errorBlock(error);
        }
    }else{
      [self startWithTLS];
    }
    
    return success;
}

///断开服务器
- (void)disconnect{
    
    if ([_asyncSocket isConnected]) {
        [_asyncSocket disconnect];
        _asyncSocket = nil;
    }
}


///发送数据
- (void)sendDataWithImage:(UIImage *)image{
    
    self.mData = [NSMutableData data];
    self.image = UIImageJPEGRepresentation(image, 0.8);
    
    NSData *data = [self buildImageBodystart:self.start limit:self.limit first:YES];
    NSData *length = [NSData dataWithBytes:[[self intToBte:(int)data.length] bytes] length:4];
    
    NSMutableData *mdata = [NSMutableData data];
    [mdata appendData:length];
    [mdata appendData:data];
    
    [_asyncSocket writeData:mdata withTimeout:-1 tag:0];
    
}


///回调数据
- (void) reciveData:(Success_Block)reciveBlock{
    
    _returnBlock = reciveBlock;
}

- (void)reciveError:(Error_Block)errorBlock{
    
    _errorBlock = errorBlock;
}

- (void)reciveConnectHost:(connectHost_Block)connetBlock{
    
    _connectBlock = connetBlock;
}


#pragma mark - Common Method
- (long)getTimestamp
{
    NSDate *dateNow = [NSDate date];
    NSTimeInterval timeone = [dateNow timeIntervalSince1970];
    return (long)(timeone*1000);
}

- (NSData *)intToBte:(int)number
{
    Byte byte[4] = {};
    
    byte[0] = (Byte)(number>>24 & 0xFF);
    byte[1] = (Byte)(number>>16 & 0xFF);
    byte[2] = (Byte)(number>>8 & 0xFF);
    byte[3] = (Byte)(number & 0xFF);
    
    NSData *data = [NSData dataWithBytes: &byte length: sizeof(byte)];
    
    return data;
}

- (NSData *)intToBteEight:(long)number
{
    Byte byte[8] = {};
    
    byte[0] = (Byte)((number>>56) & 0xFF);
    byte[1] = (Byte)((number>>48) & 0xFF);
    byte[2] = (Byte)((number>>40) & 0xFF);
    byte[3] = (Byte)(number>>32 & 0xFF);
    byte[4] = (Byte)(number>>24 & 0xFF);
    byte[5] = (Byte)(number>>16 & 0xFF);
    byte[6] = (Byte)(number>>8 & 0xFF);
    byte[7] = (Byte)(number & 0xFF);
    
    NSData *data = [NSData dataWithBytes: &byte length: sizeof(byte)];
    
    return data;
}


- (int)dataToInt:(NSData *)data
{
    int value = CFSwapInt32BigToHost(*(int*)([data bytes]));
    return value;
}

#pragma mark - Method
- (void)unpackage:(NSData *)data
{
    NSData *totalLenth = [data subdataWithRange:NSMakeRange(0, 4)];
    
    int total = [self dataToInt:totalLenth];
    if (total != 0) {
        NSData *totalData = [data subdataWithRange:NSMakeRange(4, total)];
        NSData *typeData = [totalData subdataWithRange:NSMakeRange(0, 4)];
        NSData *fileSizeData = [totalData subdataWithRange:NSMakeRange(4, 4)];
        NSData *filePathLengthData = [totalData subdataWithRange:NSMakeRange(8, 4)];
        NSData *filePathData = [totalData subdataWithRange:NSMakeRange(12, [self dataToInt:filePathLengthData])];
        
        int type = [self dataToInt:typeData];
        NSString *filePath = [[NSString alloc] initWithData:filePathData encoding:NSUTF8StringEncoding];

        NSLog(@"type : %d",type);
        NSLog(@"dataString : %@",[[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding]);
        NSLog(@"data : %@",data);
        
        if (type == 11 || type == 22 ||
            type == 20 || self.start >= self.image.length) {
            
            if (self.returnBlock) {
                self.returnSucced = YES;
                self.returnBlock(filePath);
            }
            [self disconnect];

        }else{
            [self beginUploadImageData];
        }
    }
     self.mData = [NSMutableData data];

}

- (NSData *)getHeaderParams:(NSData *)data_body{
    
//    int dbId = SOCKET_DBID;
    int dbId = _diskid;
    int bundleId = SOCKET_BUNDLEID;
    int versionId = 0;
    NSString *secret = SOCKET_SECRET;
    
    NSMutableData *sendData = [[NSMutableData alloc] init];
    
    NSData* secretdata = [secret dataUsingEncoding:NSUTF8StringEncoding];
    NSData *data_dbId = [self intToBte:dbId];
    NSData *data_bundleId = [self intToBte:bundleId];
    NSData *data_versionId = [self intToBte:versionId];
    NSData *data_timestamp = [[NSData alloc] initWithBytes:[[self intToBteEight:[self getTimestamp]]bytes] length:8];
    
    NSData *featureCode = [data_body MD5Digest];

    NSData *reserveByte = [[NSData alloc] initWithBytes:[[self intToBte:1]bytes] length:12];
    
    NSMutableData *signData = [[NSMutableData alloc] init];
    [signData appendData:featureCode];
    [signData appendData:data_timestamp];
    [signData appendData:secretdata];
    
    NSData *signMD5 = [signData MD5Digest];
    
    [sendData appendData:data_dbId];
    [sendData appendData:data_bundleId];
    [sendData appendData:data_versionId];
    [sendData appendData:data_timestamp];
    [sendData appendData:featureCode];
    [sendData appendData:reserveByte];
    [sendData appendData:signMD5];
    [sendData appendData:data_body];
    
    return sendData;
    
}

- (NSData *)getFeatureCode:(NSData *)data{
    
    int Md5MaxSize = 4*1024*1024;
    //    return featureCode;
    NSUInteger dataLenth = data.length;
    if (dataLenth > Md5MaxSize) {
        NSMutableData *mdata = [NSMutableData data];
        NSData *first = [data subdataWithRange:NSMakeRange(0, Md5MaxSize/2)];
        NSData *last = [data subdataWithRange:NSMakeRange(dataLenth-Md5MaxSize/2, Md5MaxSize/2)];
        [mdata appendData:first];
        [mdata appendData:last];
        
        return [mdata MD5Digest];
    }else{
        return [data MD5Digest];
    }
}

- (void)beginUploadImageData{
    
    if (self.image.length-self.start < self.limit) {
        self.limit = (int)self.image.length-self.start;
    }
    NSData *data = [self buildImageBodystart:self.start limit:self.limit first:NO];
    NSData *length = [NSData dataWithBytes:[[self intToBte:(int)data.length] bytes] length:4];
    NSMutableData *mdata = [NSMutableData data];
    [mdata appendData:length];
    [mdata appendData:data];
    [_asyncSocket writeData:mdata withTimeout:-1 tag:0];
    
    self.start += self.limit;
    
}

- (NSData *)buildImageBodystart:(NSInteger)start
                          limit:(NSInteger)limit
                          first:(BOOL)first{
    
    NSMutableData *bodyData = [NSMutableData data];
    
    //filrSize
    NSData *imgData = self.image;
    int fileSize = (int)imgData.length;
    //fileName
    NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    formatter.dateFormat = @"yyyyMMddHHmmss";
    NSString *str = [formatter stringFromDate:[NSDate date]];
    NSString *fileName = [NSString stringWithFormat:@"%@.jpg", str];
    NSData *fileNameData = [fileName dataUsingEncoding:NSUTF8StringEncoding];
    NSData *filefeatureCode = [self getFeatureCode:imgData];
    if (imgData.length < _limitMax) {
        limit = imgData.length;
    }
    NSData *sendData = [imgData subdataWithRange:NSMakeRange(start, limit)];
    
    if (first) {
        [bodyData appendData:[self intToBte:0]];
        [bodyData appendData:[self intToBte:fileSize]];
        [bodyData appendData:[self intToBte:0]];
        [bodyData appendData:filefeatureCode];
        [bodyData appendData:[self intToBte:(int)start]];
        [bodyData appendData:[self intToBte:(int)limit]];
        [bodyData appendData:[self intToBte:0]];
    }else{
        [bodyData appendData:[self intToBte:1]];
        [bodyData appendData:[self intToBte:fileSize]];
        [bodyData appendData:[self intToBte:(int)fileNameData.length]];
        [bodyData appendData:fileNameData];
        [bodyData appendData:filefeatureCode];
        [bodyData appendData:[self intToBte:(int)start]];
        [bodyData appendData:[self intToBte:(int)limit]];
        [bodyData appendData:[self intToBte:(int)sendData.length]];
        [bodyData appendData:sendData];
    }
    
    NSData *newBodyData = [self getHeaderParams:bodyData];
    
    return newBodyData;
}

#pragma mark - Delegate
- (void)socketDidDisconnect:(GCDAsyncSocket *)sock withError:(NSError *)err
{
    NSLog(@"断开连接...%@", err.description);
    if (err && self.errorBlock && !self.returnSucced) {
        self.errorBlock(err);
    }
}

- (void)socket:(GCDAsyncSocket *)sock didConnectToHost:(NSString *)host port:(uint16_t)port
{
    NSLog(@"已连接: %@, 端口: %d", host, port);
    if (self.connectBlock) {
        self.connectBlock();
    }
    [sock readDataWithTimeout:SOCKET_TIMEOUT tag:0];
}

- (void)socket:(GCDAsyncSocket *)sock didWriteDataWithTag:(long)tag
{
    NSLog(@"已发送Tag: %ld", tag);
    [sock readDataWithTimeout:SOCKET_TIMEOUT tag:tag];
}

- (void)socket:(GCDAsyncSocket *)sock didReadData:(NSData *)data withTag:(long)tag
{
    NSLog(@"接收数据");
    [self.mData appendData:data];
    NSData *totalLenth = [self.mData subdataWithRange:NSMakeRange(0, 4)];
    int total = [self dataToInt:totalLenth];
    if (total>self.mData.length-4){
        [sock readDataWithTimeout:SOCKET_TIMEOUT tag:tag];
        return;
    }
    [self unpackage:self.mData];
  
    [sock readDataWithTimeout:SOCKET_TIMEOUT tag:tag];
}

- (void)socket:(GCDAsyncSocket *)sock didReceiveTrust:(SecTrustRef)trust completionHandler:(void (^)(BOOL))completionHandler{
    
    //server certificate
    //强制信任证书
    completionHandler(YES);
    
}


- (void)socketDidSecure:(GCDAsyncSocket *)sock{
    
    NSLog(@"socketDidSecure");
    
    _asyncSocket = sock;
    
}

#pragma mark - Method

- (void)startWithTLS
{
    NSMutableDictionary *sslSettings = [[NSMutableDictionary alloc] init];
    
    [sslSettings setObject:[NSNumber numberWithBool:YES]
                    forKey:GCDAsyncSocketManuallyEvaluateTrust];
    
    [self.asyncSocket startTLS:sslSettings];
    
}

#pragma mark - Setter && Getter
- (GCDAsyncSocket *)asyncSocket{
    
    if (!_asyncSocket) {
        _asyncSocket = [[GCDAsyncSocket alloc]
                        initWithDelegate:self
                        delegateQueue:dispatch_get_main_queue()];
    }
    
    return _asyncSocket;
}


@end
