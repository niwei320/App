//
//  YFWPhoneDefine.h
//  HelloWorld
//
//  Created by yfw on 2019/12/10.
//  Copyright © 2019 Facebook. All rights reserved.
//

#ifndef YFWPhoneDefine_h
#define YFWPhoneDefine_h

#define IOS_CELLULAR    @"pdp_ip0" // 蜂窝移动网络
#define IOS_WIFI        @"en0"     // WiFi
#define IOS_VPN         @"utun0"   // VPN
#define IP_ADDR_IPv4    @"ipv4"    // ipv4
#define IP_ADDR_IPv6    @"ipv6"    // ipv6

// 设备类型
typedef NS_ENUM(NSInteger, YFWDeviceType) {
    YFWDeviceTypeUnkown,         //未知类型
    YFWDeviceTypeIPhone,         //iPhone
    YFWDeviceTypeIPad,           //iPad
    YFWDeviceTypeIPod,           //iPod
    YFWDeviceTypeIPhoneSimulator,//手机模拟器
    YFWDeviceTypeIPadSimulator   //iPad模拟器
};

// 设备 CPU 类型
typedef NS_ENUM(NSInteger, YFWCPUType) {
    YFWCPUTypeUnkown,    //未知类型
    YFWCPUTypeARM,       //32位手机 CPU
    YFWCPUTypeARM64,     //64位手机 CPU
    YFWCPUTypeX86,       //32位电脑 CPU
    YFWCPUTypeX86_64     //64位电脑 CPU
};

#endif /* YFWPhoneDefine_h */
