//
//  LoginViewController.h
//  OneLoginExample
//
//  Created by noctis on 2019/8/8.
//  Copyright © 2019 geetest. All rights reserved.
//

#import <UIKit/UIKit.h>
typedef void(^LoginSuccessBlock)(id _Nullable );
typedef void(^LoginErrorBlock)(id _Nullable);
NS_ASSUME_NONNULL_BEGIN

@interface LoginViewController : UIViewController
@property (nonatomic, copy) LoginSuccessBlock success_block;
@property (nonatomic, copy) LoginErrorBlock error_block;
@property (nonatomic, assign) BOOL needCallBack;

-(void)thirdLogin:(NSString *) type callBack:(void(^)(NSDictionary *info)) block;
@end

NS_ASSUME_NONNULL_END
