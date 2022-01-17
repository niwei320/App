//
//  NSData+MD5.h
//  TCPClient
//
//  Created by yfw on 2018/1/17.
//  Copyright © 2018年 JuanFelix. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface NSData (MD5)

+(NSData *)MD5Digest:(NSData *)input;

-(NSData *)MD5Digest;

+(NSString *)MD5HexDigest:(NSData *)input;

-(NSString *)MD5HexDigest;

@end
