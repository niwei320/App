//
//  YFWSocketRequestOperation.m
//  ScoketManager
//
//  Created by 姜明均 on 2018/1/18.
//  Copyright © 2018年 ios. All rights reserved.
//

#import "YFWSocketRequestOperation.h"
#import "GCDAsyncSocket.h"
#import "NSString+MD5.h"
#import "NSData+MD5.h"
#import "SmAntiFraud.h"

//#define SOCKET_HOST      @"192.168.2.8"   //李凯华
//#define SOCKET_HOST      @"192.168.2.66"   //小鹏
//#define SOCKET_HOST      @"192.168.2.25"   //李康
//#define SOCKET_HOST       @"192.168.2.11" // 衡化哥
//#define SOCKET_HOST       @"192.168.2.13" // 吴露
//#define SOCKET_HOST      @"192.168.2.249"  //测试服务器
//#define SOCKET_HOST      @"192.168.2.59"  //李辉
//#define SOCKET_HOST      @"192.168.2.14"  //云鹏
//#define SOCKET_HOST      @"192.168.3.106"  //孙师傅
//#define SOCKET_HOST      @"192.168.2.235"  //测试服务器
//#define SOCKET_HOST      @"192.168.2.252"  //本地测试服务器
//#define SOCKET_HOST      @"192.168.2.15"  //晓壮
//#define SOCKET_HOST      @"114.115.163.203"  //某台线上服务器ip
//#define SOCKET_HOST      @"app.yaofangwang.com" //线上服务器
//#define SOCKET_HOST      @"dev.yaofangwang.com" //测试服务器
//#define SOCKET_HOST      @"114.116.222.136"  //线上测试服务器ip

//#define SOCKET_PORT      18280
//#define SOCKET_PORT      18380
//#define SOCKET_PORT      66
//#define SOCKET_SECRET    @"ybyz!@#LHL8!234!$%&^@#BD1974&65"
#define SOCKET_TIMEOUT   10

//#define SOCKET_DBID 2000
//#define SOCKET_BUNDLEID 4000
//#define SOCKET_VERSIONID 1
//#define SOCKET_PORT      18380
//#define SOCKET_HOST      @"192.168.2.11"
//线上
#define SOCKET_HOST      [[NSUserDefaults standardUserDefaults] objectForKey:@"yfwTcpHost"]
#define SOCKET_PORT      18384
//#define SOCKET_PORT      [[NSUserDefaults standardUserDefaults] integerForKey:@"yfwTcpPort"]
//#define SOCKET_SECRET    @"0682b10a828f948f838e73d362e5e146107df057ec6c0105e8ab614b3b358727"
#define SOCKET_SECRET    @"ybyz!@#LHL8!234!$%&^@#BD1974&65"
#define SOCKET_DBID 4000
#define SOCKET_BUNDLEID 4000
#define SOCKET_VERSIONID 0


//线下
//#define SOCKET_HOST      @"192.168.3.106"
//#define SOCKET_PORT      18280
//#define SOCKET_SECRET    @"ybyz!@#LHL8!234!$%&^@#BD1974&65"
//#define SOCKET_DBID 4000
//#define SOCKET_BUNDLEID 4000
//#define SOCKET_VERSIONID 1

@interface YFWSocketRequestOperation()<GCDAsyncSocketDelegate>

@property (nonatomic, strong) GCDAsyncSocket *asyncSocket;

@property (nonatomic, copy) Success_Block returnBlock;
@property (nonatomic, copy) Error_Block errorBlock;
@property (nonatomic, copy) connectHost_Block connectBlock;
@property (nonatomic, strong) NSMutableData *mData;
@property (nonatomic, assign) BOOL returnSucced;

@property (nonatomic, strong) dispatch_source_t gcdTimer;

@property (nonatomic, strong) NSDate *connectStartDate;
@property (nonatomic, strong) NSDate *sendStartDate;
@property (nonatomic, strong) NSDate *sendSuccessDate;
@property (nonatomic, strong) NSDate *startWithTLSDate;

@property (nonatomic, assign) NSTimeInterval connectServerTime;
@property (nonatomic, assign) NSTimeInterval sendParamTime;
@property (nonatomic, assign) NSTimeInterval getAllResponseTime;
@property (nonatomic, strong) NSDate *lastGetResponseDate;
@property (nonatomic, strong) NSMutableArray *allResponseTimeArrayM;

@end

@implementation YFWSocketRequestOperation

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
  self.mData = [NSMutableData data];
  self.returnSucced = NO;
  NSString *socket_host = [self removePointString:SOCKET_HOST];
  NSInteger port = SOCKET_PORT;
  if ([socket_host hasPrefix:@"192.168"]) {//本地服务器18380端口有问题
    port = 18280;
  } else if ([socket_host isEqualToString:@"114.116.222.136"]) {//线上测试服务器兼容
    port = 18180;
  }
  NSLog(@"cmd = connect server start");
  self.connectStartDate = [NSDate date];
  self.asyncSocket = [[GCDAsyncSocket alloc]
                  initWithDelegate:self
                  delegateQueue:dispatch_get_main_queue()];
  BOOL success = [self.asyncSocket connectToHost:socket_host onPort:port withTimeout:SOCKET_TIMEOUT error:&error];
  
  if (error) {
    NSLog(@"连接失败: %@", error.description);
    if (self.errorBlock) {
      self.errorBlock(error);
    }
  }else{
    
    if (port != 18280) {
      [self startWithTLS];
    } else {
      
    }
  }
  
  return success;
}



- (void)removeHeartBeat{
  
  if (self.gcdTimer) {
    dispatch_source_cancel(self.gcdTimer);
    self.gcdTimer = nil;
  }
  
}


///断开服务器
- (void)disconnect{
    
  if ([_asyncSocket isConnected]) {
    [_asyncSocket disconnect];
    _asyncSocket = nil;
  }

  self.returnBlock = nil;
  self.errorBlock = nil;
  self.connectBlock = nil;
  
}

///发送数据
- (void)sendDataWithDic:(NSDictionary *)param{
  NSDate *startDate = [NSDate date];
  
  NSMutableData *mdata = [NSMutableData data];
  NSString *ssid = param[@"ssid"];
  
  NSMutableDictionary *mparam = param.mutableCopy;
  [mparam setObject:getSafeString(ssid) forKey:@"__ssid"];
  [mparam setObject:@"phone" forKey:@"__client"];
  
  [mparam setObject:@"ios" forKey:@"__os"];
  [mparam setObject:getSafeString(YFObjectForKey(@"k_deviceNo")) forKey:@"__device_no"];
  [mparam setObject:getSafeString([[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"]) forKey:@"__app_version"];
  [mparam setObject:[[UIDevice currentDevice] systemVersion] forKey:@"__os_version"];
  [mparam setObject:@"ab391b9adb7de872a6c63bcb55cca349" forKey:@"__app_key"];
  [mparam setObject:[self getCurrentDate] forKey:@"__timestamp"];
//  [mparam setObject:getSafeString(YFObjectForKey(@"SSID")) forKey:@"__ssid"];
  [mparam setObject:@"iOS" forKey:@"__market"];
  NSString *deviceID = [[SmAntiFraud shareInstance] getDeviceId];
  [mparam setValue:deviceID forKey:@"shumid"];
  if ([[param[@"__cmd"] lowercaseString] containsString:@"o2o"] || [[param[@"__cmd"] lowercaseString] containsString:@"oto"]) {
    [mparam setObject:param[@"o2o_lat"] forKey:@"__lat"];
    [mparam setObject:param[@"o2o_lng"] forKey:@"__lng"];
  } else {
    float longitude = [YFWBaiduMapManager shareManager].longitude;
    float latitude = [YFWBaiduMapManager shareManager].latitude;
    [mparam setObject:[NSString stringWithFormat:@"%f",latitude] forKey:@"__lat"];
    [mparam setObject:[NSString stringWithFormat:@"%f",longitude] forKey:@"__lng"];
  }
  
  
  param = mparam.copy;
  
  NSData * data = [self getParams:param];
  NSData *length = [NSData dataWithBytes:[[self intToBte:(int)data.length] bytes] length:4];
  [mdata appendData:length];
  [mdata appendData:data];
  
  [_asyncSocket writeData:mdata withTimeout:SOCKET_TIMEOUT tag:0];
  NSTimeInterval time = [[NSDate date] timeIntervalSinceDate:startDate];
  NSLog(@"cmd = param time = %f",time);
  
  self.sendStartDate = [NSDate date];
  NSLog(@"cmd = send param start");
}

-(NSString *)getCurrentDate{
  NSDate *dateNow = [NSDate date];
  NSCalendar *calendar = [[NSCalendar alloc] initWithCalendarIdentifier:NSCalendarIdentifierGregorian];//设置成中国阳历
  NSDateComponents *comps = [[NSDateComponents alloc] init];
  NSInteger unitFlags = NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay | NSCalendarUnitWeekday | NSCalendarUnitHour | NSCalendarUnitMinute | NSCalendarUnitSecond;
  comps = [calendar components:unitFlags fromDate:dateNow];
  long year=[comps year];//获取年对应的长整形字符串
  long month=[comps month];//获取月对应的长整形字符串
  long day=[comps day];//获取日期对应的长整形字符串
  long hour=[comps hour];//获取小时对应的长整形字符串
  long minute=[comps minute];//获取月对应的长整形字符串
  long second=[comps second];//获取秒对应的长整形字符串
  return [NSString stringWithFormat:@"%ld-%ld-%ld %ld:%ld:%ld",year,month,day,hour,minute,second];
  
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

#pragma mark - Private Function
- (NSData *)getParams:(NSDictionary *)param
{
    int dbId = SOCKET_DBID;
    int bundleId = SOCKET_BUNDLEID;
    int versionId = SOCKET_VERSIONID;
    NSDictionary *dict = param.copy;
    
    NSMutableData *sendData = [[NSMutableData alloc] init];
    NSData* secretdata = [SOCKET_SECRET dataUsingEncoding:NSUTF8StringEncoding];
    NSData *data_dbId = [self intToBte:dbId];
    NSData *data_bundleId = [self intToBte:bundleId];
    NSData *data_versionId = [self intToBte:versionId];
    NSData *data_timestamp = [[NSData alloc] initWithBytes:[[self intToBteEight:[self getTimestamp]]bytes] length:8];
    
    NSData *data_body = [self buildBody:dict];
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

-(NSString *)jsonString:(id)dicMsg{
    
    NSString * jsonString = @"";
    if ([dicMsg isKindOfClass:[NSString class]]) {
        jsonString = [NSString stringWithFormat:@"'%@'",dicMsg];
    }else if ([dicMsg isKindOfClass:[NSNumber class]]){
        
        jsonString = ((NSNumber *)dicMsg).stringValue;
        
    }else{
        NSData * jsonData = [NSJSONSerialization dataWithJSONObject:dicMsg options:NSJSONWritingPrettyPrinted error:nil];
        jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    }

    return jsonString;
}

- (NSData *)buildBody:(NSDictionary *)diction
{
    NSMutableData *mData = [[NSMutableData alloc] init];
    [mData appendData:[self intToBte:(int)diction.allKeys.count]];
    
    for (int i=0; i<diction.allKeys.count; i++) {
        NSString *key = diction.allKeys[i];
        
        id obj = diction[key];
        NSString *value = @"";
        if (![key containsString:@"__"]) {
            value = [self jsonString:obj];
        }else{
            value = obj;
        }
        
        NSData* keydata = [key dataUsingEncoding:NSUTF8StringEncoding];
        NSData* valuedata = [value dataUsingEncoding:NSUTF8StringEncoding];
        
        [mData appendData:[self intToBte:(int)keydata.length]];
        [mData appendData:keydata];
        
        [mData appendData:[self intToBte:(int)valuedata.length]];
        [mData appendData:valuedata];
    }
    return mData.copy;
}

- (int)dataToInt:(NSData *)data
{
    int value = CFSwapInt32BigToHost(*(int*)([data bytes]));
    return value;
}

- (NSDictionary *)unpackage:(NSData *)data
{
    NSData *totalLenth = [data subdataWithRange:NSMakeRange(0, 4)];
    
    int total = [self dataToInt:totalLenth];
    
    NSData *totalData = [data subdataWithRange:NSMakeRange(4, total)];
    
    NSData *jsonLengthData = [totalData subdataWithRange:NSMakeRange(0, 4)];
    
    int jsonLength = [self dataToInt:jsonLengthData];
    
    NSData *jsonData = [totalData subdataWithRange:NSMakeRange(4, jsonLength)];
    
    NSError *JSONSerializationError = nil;
      id obj = [NSJSONSerialization JSONObjectWithData:jsonData options:kNilOptions error:&JSONSerializationError];
    if (JSONSerializationError) {
      NSString *jsonStr = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
      jsonStr = [jsonStr stringByReplacingRegex:@"[ⳤ]" options:NSRegularExpressionCaseInsensitive withString:@" "];
      NSLog(@"error json str =  %@",jsonStr);
      NSData *someJsonData = [jsonStr dataUsingEncoding:NSUTF8StringEncoding];
      NSLog(@"JSONSerializationError = %@",JSONSerializationError.localizedDescription);
      obj = [NSJSONSerialization JSONObjectWithData:someJsonData options:kNilOptions error:nil];
    }
    
    if (total > jsonLength+4) {
        
        NSData *sessionCountData = [totalData subdataWithRange:NSMakeRange(jsonLength+4, 4)];
        int sessionDataCount = [self dataToInt:sessionCountData];
        if (sessionDataCount != 0) {
            int Pointer = jsonLength+8;
            for (int i = 0; i < sessionDataCount; i++) {
                NSData *sessionKeyLenthData = [totalData subdataWithRange:NSMakeRange(Pointer, 4)];
                int sessionKeyLenth = [self dataToInt:sessionKeyLenthData];
                NSData *sessionKeyData = [totalData subdataWithRange:NSMakeRange(Pointer+4, sessionKeyLenth)];
                NSString *key = [[NSString alloc] initWithData:sessionKeyData encoding:NSUTF8StringEncoding];
                NSLog(@"key:%@",key);
                Pointer += sessionKeyLenth+4;
                
                NSData *sessionValueLenthData = [totalData subdataWithRange:NSMakeRange(Pointer, 4)];
                int sessionValueLenth = [self dataToInt:sessionValueLenthData];
                NSData *sessionValueData = [totalData subdataWithRange:NSMakeRange(Pointer+4, sessionValueLenth)];
                NSString *value = [[NSString alloc] initWithData:sessionValueData encoding:NSUTF8StringEncoding];
                NSLog(@"value:%@",value);
                Pointer += sessionValueLenth+4;
                
                if ([key isEqualToString:@"ssid"]) {
                  
                  NSMutableDictionary *mdic = [obj mutableCopy];
                  [mdic setValue:value forKey:@"ssid"];
                  obj = mdic.copy;
                }
              
            }
        }
        
    }
    
    
    return obj;
}


#pragma mark - Delegate
- (void)socketDidDisconnect:(GCDAsyncSocket *)sock withError:(NSError *)err
{
    NSLog(@"断开连接...%@", err.description);
    if (err && self.errorBlock && !self.returnSucced) {
        self.errorBlock(err);
        [self performSelector:@selector(removeHeartBeat) withObject:self afterDelay:0];
    }
  
}

- (void)socket:(GCDAsyncSocket *)sock didConnectToHost:(NSString *)host port:(uint16_t)port
{
  NSLog(@"已连接: %@, 端口: %d", host, port);
  NSTimeInterval time = [[NSDate date] timeIntervalSinceDate:self.connectStartDate];
  NSLog(@"cmd = connect success timeInterval=%f",time);
  self.connectServerTime = time;
  if (self.connectBlock) {
    self.connectBlock();
  }
  
  
}

- (void)socket:(GCDAsyncSocket *)sock didWriteDataWithTag:(long)tag
{
  NSLog(@"已发送Tag: %ld", tag);
  self.sendSuccessDate = [NSDate date];
  NSTimeInterval time = [self.sendSuccessDate timeIntervalSinceDate:self.sendStartDate];
  NSLog(@"cmd = send param success timeInterval=%f",time);
  self.sendParamTime = time;
  dispatch_queue_t queue = dispatch_get_global_queue(0, 0);
  self.gcdTimer = dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER, 0, 0, queue);
  // start 秒后开始执行
  uint64_t start = 0;
  // 每隔interval执行
  uint64_t interval = 0.5;
  dispatch_source_set_timer(self.gcdTimer, dispatch_time(DISPATCH_TIME_NOW, start * NSEC_PER_SEC), interval * NSEC_PER_SEC, 0);
  __weak typeof(self)weakSelf = self;
  dispatch_source_set_event_handler(self.gcdTimer, ^{
    __strong typeof(weakSelf)strongSelf = weakSelf;
    if (strongSelf && strongSelf.asyncSocket) {
      [strongSelf.asyncSocket readDataWithTimeout:SOCKET_TIMEOUT tag:0];
    }
  });
  //5.启动定时器
  dispatch_resume(self.gcdTimer);
  
}

- (void)socket:(GCDAsyncSocket *)sock didReadData:(NSData *)data withTag:(long)tag
{
  NSLog(@"接收数据");
  NSDate *lastDate = self.sendSuccessDate;
  if (self.lastGetResponseDate) {
    lastDate = self.lastGetResponseDate;
  }
  NSTimeInterval time = [[NSDate date] timeIntervalSinceDate:lastDate];
  NSLog(@"cmd = get response timeIntervel=%f",time);
  if (!self.allResponseTimeArrayM) {
    self.allResponseTimeArrayM = [NSMutableArray array];
  }
  [self.allResponseTimeArrayM addObject:@(time)];
  self.lastGetResponseDate = [NSDate date];
  [self.mData appendData:data];
  NSData *totalLenth = [self.mData subdataWithRange:NSMakeRange(0, 4)];
  int total = [self dataToInt:totalLenth];
  if (total>self.mData.length-4){
    [sock readDataWithTimeout:SOCKET_TIMEOUT tag:tag];
    return;
  }
  NSTimeInterval getAllResponseTime = [[NSDate date] timeIntervalSinceDate:self.sendSuccessDate];
  NSLog(@"cmd = get all response timeIntervel=%f",getAllResponseTime);
  NSTimeInterval getAllRequestTime = [[NSDate date] timeIntervalSinceDate:self.connectStartDate];
  NSLog(@"cmd = get all request timeIntervel=%f",getAllRequestTime);
  self.getAllResponseTime = getAllResponseTime;
  NSDate *currentDate = [NSDate date];
  NSMutableDictionary *response = [NSMutableDictionary dictionaryWithDictionary:[self unpackage:self.mData]];
  NSTimeInterval unpackTime = [[NSDate date] timeIntervalSinceDate:currentDate];
  [response setObject:@(self.connectServerTime) forKey:@"connectServerTime"];
  [response setObject:@(self.sendParamTime) forKey:@"sendParamTime"];
  [response setObject:@(self.getAllResponseTime) forKey:@"getAllResponseTime"];
  [response setObject:@(getAllRequestTime) forKey:@"getAllRequestTime"];
  [response setObject:self.allResponseTimeArrayM forKey:@"getResponseTimeArray"];
  [response setObject:@(unpackTime) forKey:@"unpackTime"];
  if (self.returnBlock) {
    self.returnSucced = YES;
    self.returnBlock(response);
    [self performSelector:@selector(removeHeartBeat) withObject:self afterDelay:0];
  }
  
  [self disconnect];
  [sock readDataWithTimeout:SOCKET_TIMEOUT tag:tag];
}

- (void)socket:(GCDAsyncSocket *)sock didReceiveTrust:(SecTrustRef)trust completionHandler:(void (^)(BOOL))completionHandler{
    
    //server certificate
    //强制信任证书
    completionHandler(YES);
  NSTimeInterval time = [[NSDate date] timeIntervalSinceDate:self.startWithTLSDate];
  NSLog(@"cmd = TLS request trust timeInterval=%f",time);
}


- (void)socketDidSecure:(GCDAsyncSocket *)sock{
    NSTimeInterval time = [[NSDate date] timeIntervalSinceDate:self.startWithTLSDate];
    NSLog(@"cmd = TLS end timeInterval=%f",time);
    _asyncSocket = sock;
}


#pragma mark - Method

- (void)startWithTLS
{
    NSMutableDictionary *sslSettings = [[NSMutableDictionary alloc] init];
    
    [sslSettings setObject:[NSNumber numberWithBool:YES]
                 forKey:GCDAsyncSocketManuallyEvaluateTrust];
  
    [self.asyncSocket startTLS:sslSettings];
    self.startWithTLSDate = [NSDate date];
    NSLog(@"cmd = start TLS");
    
}

@end
