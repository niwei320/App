//
//

#import <Foundation/Foundation.h>

//设置你idfa的Keychain标示,该标示相当于key,而你的IDFA是value
#define IDFA_STRING @"com.yaofang.store.idfa"
#define IDFV_STRING @"com.yaofang.store.idfv"
#define CUSTOMID_STRING @"com.yaofang.store.customID"
//
typedef NS_ENUM(NSInteger, YFWIDType) {
  YFWIDTypeIDFA,
  YFWIDTypeIDFV,
  YFWIDTypeCustomID,
};
@interface KeychainIDFA : NSObject

+ (NSString *)getIDWithType:(YFWIDType)type;
+ (void)deleteIDWithType:(YFWIDType)type;
+ (void)setYFWID:(NSString *)ID;
//获取IDFA
+ (NSString*)IDFA;

//删除keychain的IDFA(一般不需要)
+ (void)deleteIDFA;

//获取IDFV
+ (NSString*)IDFV;

+ (void)deleteIDFV;

//获取自定义ID
+ (NSString*)YFWID;

+ (void)deleteYFWID;

@end
