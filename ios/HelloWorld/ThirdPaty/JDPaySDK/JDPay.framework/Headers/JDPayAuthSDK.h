//
//  JDPayAuthSDK.h
//  JDPayAuth
//
//  Created by dulinlin on 16/12/27.
//  Copyright © 2016年 dulinlin. All rights reserved.
//

#if __has_include(<JDPayFoundation/JDPayModule.h>)
#import <JDPayFoundation/JDPayModule.h>
#else
#import <JDPay/JDPayModule.h>
#endif

NS_ASSUME_NONNULL_BEGIN

/*!  @breif 错误码
 * 支付返回码
 *  0001  :订单不存在或者订单查询异常
 *  0002  :订单已完成
 *  0003  :订单已取消
 *  0004  :商户信息不匹配
 *  0005  :获取不到用户pin
 *  0006  :参数异常
 *  0007  :获取不到商户秘钥
 *  0008  :验签失败
 *  0009  :查询商户信息不存在
 *  0010  :appKey无效
 * 注册返回码
 * 000001    订单不存在或者订单查询异常
 * 000002    订单已完成
 * 000003    订单已取消
 * 000004    未登陆
 * 000005    系统异常,令牌生成失败
 * 000006    pin 入参为空
 * 000007    非法参数
 * 000008     查询商户信息不存在
 * 000009    appKey无效
 *  H5支付返回码
 *  CASH000000  :商户收单异常
 *  CASH000001  :系统请求失败
 *  CASH000002  :支付异常
 *  CASH000003  :登录超时
 *  CASH000004  :支付验签失败
 *  CASH000005  :支付金额异常
 *  CASH000006  :商户解密异常
 *  CASH000007  :校验商户签名异常
 *  CASH000008  :获取短信验证码失败
 *  CASH000009  :此卡不支持在线支付
 *  CASH000010  :用户卡ID出错
 *  CASH000011  :生日输入错误
 *  CASH000012  :验证码校验失败
 *  CASH000013  :生日校验次数超过6次
 *  CASH000014  :商户提交参数异常
 *  CASH000015  :扫码支付临时订单信息获取异常
 *  CASH000018  :该商户信息不存在
 *  CASH000019  :该商户DES秘钥不存在
 *  CASH000024  :商户提交参数异常
 *  1009        :网络不通
 *  999999      :未安装京东APP
 */

/**
 *  支付状态
 */
#define JDP_PAY_AUTH_SUCCESS  @"JDP_PAY_SUCCESS"
#define JDP_PAY_AUTH_FAIL  @"JDP_PAY_FAIL"
#define JDP_PAY_AUTH_CANCEL  @"JDP_PAY_CANCEL"

/**
 *  支付完成回调
 *
 *  @param resultDict 支付结果数据  其中包含字段:
 *                                          errorCode:错误码
 *                                          payStatus:支付状态
 *                                          extraData:成功返回数据 (NSDictionary对象)
 */
typedef void (^JDPAuthCompletionBlock)(NSDictionary * _Nullable resultDict);

#pragma mark - JDPayAuth
@interface JDPayAuth : JDPayModule
JDPAY_MODULE_FUNCTION_DECLARE(JDPayAuth)

/**
 *  唤起京东支付
 *
 *  @param viewController 推出H5页面的视图
 *  @param appID  注册的appID
 *  @param merchant 注册的商户号
 *  @param orderId 订单号
 *  @param signData 验签数据
 *  @param extraInfo 扩展数据，非必传，业务无特殊要求则传nil；如业务需要，extraInfo :  @{@"bizTag":@"CPAY"} 中的 bizTag字段（支付标识）必需传。
 *  @param completeCallBack 支付完成回调
 */
- (void)payWithViewController:(UIViewController *)viewController
                        appID:(NSString *)appID
                     merchant:(NSString *)merchant
                      orderId:(NSString *)orderId
                     signData:(NSString *)signData
                    extraInfo:(NSDictionary * _Nullable)extraInfo
                   completion:(JDPAuthCompletionBlock)completeCallBack;
/**
 *  地铁专用
 *
 *  @param viewController 推出H5页面的视图
 *  @param appID 注册的appID
 *  @param merchant 注册的商户号
 *  @param bizType 业务类型，地铁传"openAccount"
 *  @param jsonStr json串，{ "merchantNo":"商户号"， "sign":"数据签名"， "userId":用户Id"， "authToken":"用户信息标识"}
 */
- (void)openAccountWithViewController:(UIViewController *)viewController
                                appID:(NSString *)appID
                             merchant:(NSString *)merchant
                              bizType:(NSString *)bizType
                              jsonStr:(NSString *)jsonStr
                           completion:(JDPAuthCompletionBlock)completeCallBack;

@end

NS_ASSUME_NONNULL_END
