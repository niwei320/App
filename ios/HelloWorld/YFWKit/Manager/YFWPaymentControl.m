//
//  YFWPaymentControl.m
//  HelloWorld
//
//  Created by yfw-姜明均 on 2018/9/26.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "YFWPaymentControl.h"
#import "payRequsestHandler.h"
#import "YFWEventManager.h"
#import "Product.h"
#import "Order.h"
#import <JDPay/JDPay.h>
@interface YFWPaymentControl()

@property (nonatomic, strong) NSString *pyType;

@end

@implementation YFWPaymentControl

- (void)dealloc{
  
  [[NSNotificationCenter defaultCenter] removeObserver:self name:@"PaySuccess" object:nil];
  [[NSNotificationCenter defaultCenter] removeObserver:self name:@"payFailed" object:nil];
  
}

- (void)paymentMethod:(NSDictionary *)data Type:(NSString *)type isTCP:(BOOL)istcp{
  self.pyType = type;
  if (istcp) {
    [self paymentTCPMethod:data Type:type];
  } else{
    [self paymentMethod:data Type:type];
  }
  
}

- (void)paymentTCPMethod:(NSDictionary *)data Type:(NSString *)type{
  
  [self registNotification];
  
  if ([type isEqualToString:@"ali"]) {
    
    [self alipayOperation:data[@"result"]];
    
  }else if ([type isEqualToString:@"wx"]){
    
    [self parseWXpayWithItemTCP:data[@"param"]];
    
  } else if ([type isEqualToString:@"jd"]) {
    [self payWithJD:data[@"result"]];
  }
  
}

- (void)paymentMethod:(NSDictionary *)data Type:(NSString *)type{
  
  [self registNotification];
  
  if ([type isEqualToString:@"ali"]) {
    
    [self parseAlipayWithItem:data];
    
  }else if ([type isEqualToString:@"wx"]){
    
    [self parseWXpayWithItem:data];
    
  }
  
}

- (void)registNotification{
  
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(paySuccess) name:@"PaySuccess" object:nil];
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(payFailed) name:@"payFailed" object:nil];
  
}


#pragma mark - Public

- (void)payFailed
{
  [YFWProgressHUD showErrorWithStatus:@"支付失败！"];
  [YFWEventManager emit:@"paymentFail" Data:@{@"type":self.pyType}];

}

- (void)paySuccess
{
  [YFWProgressHUD showSuccessWithStatus:@"订单支付成功！"];
  
  [YFWEventManager emit:@"paymentSuccess" Data:@{@"type":self.pyType}];
  if (self.paySuccedBlock) {
    self.paySuccedBlock();
    self.paySuccedBlock = nil;
  }
  
}

#pragma mark - JD

- (void)payWithJD:(NSDictionary *)item {
  NSString *appId = item[@"appId"];
  NSString *merchantId = item[@"merchantId"];
  UIViewController *VC = [AppDelegate sharedInstances].nav.topViewController;
  //  sign
  NSString *orderID = item[@"orderId"];
  NSString *signStr = item[@"sign"];
  [JDPayAuth_mainModule() payWithViewController:VC
                                          appID:appId
                                       merchant:merchantId
                                        orderId:orderID
                                       signData:signStr
                                      extraInfo:nil
                                     completion:^(NSDictionary *result) {
                                       NSString *payStatus = result[@"payStatus"];
                                       if ([payStatus isEqualToString:@"JDP_PAY_SUCCESS"]) {
                                         [self paySuccess];
                                       } else {
                                         [self payFailed];
                                       }
                                     }];
}

#pragma mark - 支付宝

- (void)parseAlipayWithItem:(NSDictionary *)item
{
  
  Product *product = [[Product alloc] init];
  
  product.subject = getSafeString([item objectForKey:@"subject"]);
  product.orderId = getSafeString([item objectForKey:@"out_trade_no"]);
  product.price = [getSafeString([item objectForKey:@"total_fee"]) floatValue];
  product.body = @"IOS";
  
  NSString *partner = getSafeString([item objectForKey:@"partner"]);
  NSString *seller = getSafeString([item objectForKey:@"seller_id"]);
  NSString *privateKey = getSafeString([item objectForKey:@"private_key"]);
  
  //partner和seller获取失败,提示
  if ([partner length] == 0 ||
      [seller length] == 0 ||
      [privateKey length] == 0)
  {
    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"提示"
                                                    message:@"缺少partner或者seller或者私钥。"
                                                   delegate:self
                                          cancelButtonTitle:@"确定"
                                          otherButtonTitles:nil];
    [alert show];
    return;
  }
  
  Order *order = [[Order alloc] init];
  order.partner = partner;
  order.seller = seller;
  order.tradeNO = getSafeString([item objectForKey:@"out_trade_no"]); //订单ID（由商家自行制定）
  order.productName = product.subject; //商品标题
  order.productDescription = product.body; //商品描述
  order.amount = [NSString stringWithFormat:@"%.2f",product.price]; //商品价格
  order.notifyURL =  getSafeString([item objectForKey:@"notify_url"]); //回调URL
  
  order.service = getSafeString([item objectForKey:@"service"]);
  order.paymentType = getSafeString([item objectForKey:@"payment_type"]);
  order.inputCharset = getSafeString([item objectForKey:@"_input_charset"]);
  if (order.inputCharset.length == 0) {
    order.inputCharset = @"utf-8";
  }
  order.itBPay = @"30m";
  order.showUrl = @"m.alipay.com";
  
  //将商品信息拼接成字符串
  NSString *orderSpec = [order description];
  NSLog(@"orderSpec = %@",orderSpec);
  
  //获取私钥并将商户信息签名,外部商户可以根据情况存放私钥和签名,只需要遵循RSA签名规范,并将签名字符串base64编码和UrlEncode
//  id<DataSigner> signer = CreateRSADataSigner(privateKey);
//  NSString *signedString = [signer signString:orderSpec];
  RSADataSigner *signer = [[RSADataSigner alloc] initWithPrivateKey:privateKey];
  NSString *signedString = [signer signString:orderSpec];
  
  //将签名成功字符串格式化为订单字符串,请严格按照该格式
  NSString *orderString = nil;
  if (signedString != nil) {
    orderString = [NSString stringWithFormat:@"%@&sign=\"%@\"&sign_type=\"%@\"",
                   orderSpec, signedString, getSafeString([item objectForKey:@"sign_type"])];
    
    [self alipayOperation:orderString];
    
  }
}
-(void)alipayOperation:(NSString *)orderString
{
  //应用注册scheme,在AlixPayDemo-Info.plist定义URL types
  NSString *appScheme = @"yaofangalipay";
  
  //用户没有安装支付宝App时调用H5支付页面 ， 在这里回调
  [[AlipaySDK defaultService] payOrder:orderString fromScheme:appScheme callback:^(NSDictionary *resultDic) {
    NSLog(@"reslut = %@",resultDic);
    [YFWProgressHUD dismiss];
    
    NSString *status = getSafeString([resultDic objectForKey:@"resultStatus"]);
    if ([status isEqualToString:@"9000"])
    {
      [self paySuccess];
    } else {
      [self payFailed];
    }
  }];
}


#pragma mark - 微信

- (void)parseWXpayWithItem:(NSDictionary *)item
{
  NSString *appid = [NSString stringWithFormat:@"%@",item[@"appid"]];
  NSString *key = [NSString stringWithFormat:@"%@",item[@"key"]];
  NSString *mchid = [NSString stringWithFormat:@"%@",item[@"mch_id"]];
  
  
  //创建支付签名对象
  payRequsestHandler *req = [[payRequsestHandler alloc] init];
  //初始化支付签名对象
  [req init:appid mch_id:mchid];
  //设置密钥
  [req setKey:key];
  
  //获取到实际调起微信支付的参数后，在app端调起支付
  NSMutableDictionary *dict = [req sendPay_demo:item];
  
  if(dict == nil){
    //错误提示
    NSString *debug = [req getDebugifo] ;
    
    
    NSLog(@"%@\n\n",debug);
  }else{
    NSLog(@"%@\n\n",[req getDebugifo]);
    
    dict = [req erciqianmingWithDiction:item].mutableCopy;
    
    NSMutableString *stamp  = [dict objectForKey:@"timestamp"];
    
    //调起微信支付
    PayReq* req             = [[PayReq alloc] init];
    req.openID              = [dict objectForKey:@"appid"];
    req.partnerId           = [dict objectForKey:@"partnerid"];
    req.prepayId            = [dict objectForKey:@"prepayid"];
    req.nonceStr            = [dict objectForKey:@"noncestr"];
    req.timeStamp           = stamp.intValue;
    req.package             = [dict objectForKey:@"package"];
    req.sign                = [dict objectForKey:@"sign"];
    req.openID              = @"wxe5dffc689e29f754";
    [WXApi sendReq:req completion:^(BOOL success) {
      
    }];
  }
}


- (void)parseWXpayWithItemTCP:(NSDictionary *)item{
  
  NSString *stamp = [item objectForKey:@"timestamp"];
  //调起微信支付
  PayReq* req             = [[PayReq alloc] init];
  req.partnerId           = [item objectForKey:@"partnerid"];
  req.prepayId            = [item objectForKey:@"prepayid"];
  req.nonceStr            = [item objectForKey:@"noncestr"];
  req.timeStamp           = stamp.intValue;
  req.package             = [item objectForKey:@"package"];
  req.sign                = [item objectForKey:@"sign"];
  req.openID              = [item objectForKey:@"appid"];;
  [WXApi sendReq:req completion:^(BOOL success) {
    
  }];
  
}



@end
