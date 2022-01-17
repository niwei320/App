//
//

#import "KeychainIDFA.h"
#import "KeychainHelper.h"
@import AdSupport;

#define kIsStringValid(text) (text && text!=NULL && text.length>0)



@implementation KeychainIDFA

+ (void)deleteIDWithType:(YFWIDType)type {
  switch (type) {
    case YFWIDTypeIDFA:
      [KeychainHelper delete:IDFA_STRING];
      break;
    case YFWIDTypeIDFV:
      [KeychainHelper delete:IDFV_STRING];
      break;
    case YFWIDTypeCustomID:
      [KeychainHelper delete:CUSTOMID_STRING];
      break;
  }
}
+ (void)deleteIDFA
{
  [self deleteIDWithType:YFWIDTypeIDFA];
}

+ (void)deleteIDFV
{
  [self deleteIDWithType:YFWIDTypeIDFV];
}

+ (void)deleteYFWID
{
  [self deleteIDWithType:YFWIDTypeCustomID];
}
+ (NSString *)getIDWithType:(YFWIDType)type {
  //0.读取keychain的缓存
  NSString *deviceID = [KeychainIDFA getIdStringWithType:type];
  if (kIsStringValid(deviceID)) {
    
    return deviceID;
    
  } else {
    
    switch (type) {
      case YFWIDTypeIDFA:
      {
        //1.取IDFA,可能会取不到,如用户关闭IDFA
        if ([ASIdentifierManager sharedManager].advertisingTrackingEnabled) {
          deviceID = [[[ASIdentifierManager sharedManager] advertisingIdentifier] UUIDString];
        } else {
          //2.如果取不到,就生成UUID,当成IDFA
          deviceID = [KeychainIDFA getUUID];
        }
      }
        break;
      case YFWIDTypeIDFV:
      {
        deviceID = [[[UIDevice currentDevice] identifierForVendor] UUIDString];
        if (!(kIsStringValid(deviceID) && ![deviceID hasPrefix:@"00"])) {
          //2.如果取不到,就生成UUID,当成IDFA
          deviceID = [KeychainIDFA getUUID];
        }
      }
        break;
      case YFWIDTypeCustomID:
      {
        deviceID = @"";
      }
        break;
    }
    if (kIsStringValid(deviceID)){
      [KeychainIDFA setIdStringWithID:deviceID andType:type];
      return deviceID;
    }
  }
  return nil;
}
+ (NSString*)IDFA
{
  return [self getIDWithType:YFWIDTypeIDFA];
}
+ (NSString*)IDFV
{
  return [self getIDWithType:YFWIDTypeIDFV];
}
+ (NSString*)YFWID
{
  return [self getIDWithType:YFWIDTypeCustomID];
}
+ (void)setYFWID:(NSString *)ID {
  [self setIdStringWithID:ID andType:YFWIDTypeCustomID];
}
#pragma mark - Keychain
+ (NSString*)getIdStringWithType:(YFWIDType )type
{
  NSString *idStr = [KeychainHelper load:IDFA_STRING];
  switch (type) {
    case YFWIDTypeIDFA:
      idStr = [KeychainHelper load:IDFA_STRING];
      break;
    case YFWIDTypeIDFV:
      idStr = [KeychainHelper load:IDFV_STRING];
      break;
    case YFWIDTypeCustomID:
      idStr = [KeychainHelper load:CUSTOMID_STRING];
      break;
  }
    if (kIsStringValid(idStr))
    {
        return idStr;
    }
    else
    {
        return nil;
    }
}

+ (BOOL)setIdStringWithID:(NSString *)secValue andType:(YFWIDType)type
{
    if (kIsStringValid(secValue))
    {
      switch (type) {
        case YFWIDTypeIDFA:
          [KeychainHelper save:IDFA_STRING data:secValue];
          break;
        case YFWIDTypeIDFV:
          [KeychainHelper save:IDFV_STRING data:secValue];
          break;
        case YFWIDTypeCustomID:
          [KeychainHelper save:CUSTOMID_STRING data:secValue];
          break;
      }
        return YES;
    }
    else
    {
        return NO;
    }
}



#pragma mark - UUID
+ (NSString*)getUUID
{
    CFUUIDRef uuid_ref = CFUUIDCreate(kCFAllocatorDefault);
    CFStringRef uuid_string_ref= CFUUIDCreateString(kCFAllocatorDefault, uuid_ref);
    
    CFRelease(uuid_ref);
    NSString *uuid = [NSString stringWithString:(__bridge NSString*)uuid_string_ref];
    if (!kIsStringValid(uuid))
    {
        uuid = @"";
    }
    CFRelease(uuid_string_ref);
    return [uuid lowercaseString];
}


@end
