//
//  YFWKitMacro.h
//  YaoFang
//
//  Created by 姜明均 on 2017/5/24.
//  Copyright © 2017年 ospreyren. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <sys/time.h>
#import <pthread.h>

#ifndef YFWKitMacro_h
#define YFWKitMacro_h

#ifdef __cplusplus
#define YFW_EXTERN_C_BEGIN  extern "C" {
#define YFW_EXTERN_C_END  }
#else
#define YFW_EXTERN_C_BEGIN
#define YFW_EXTERN_C_END
#endif


YFW_EXTERN_C_BEGIN

#ifndef YFW_CLAMP // return the clamped value
#define YFW_CLAMP(_x_, _low_, _high_)  (((_x_) > (_high_)) ? (_high_) : (((_x_) < (_low_)) ? (_low_) : (_x_)))
#endif

#ifndef YFW_SWAP // swap two value
#define YFW_SWAP(_a_, _b_)  do { __typeof__(_a_) _tmp_ = (_a_); (_a_) = (_b_); (_b_) = _tmp_; } while (0)
#endif


#define YFWAssertNil(condition, description, ...) NSAssert(!(condition), (description), ##__VA_ARGS__)
#define YFWCAssertNil(condition, description, ...) NSCAssert(!(condition), (description), ##__VA_ARGS__)

#define YFWAssertNotNil(condition, description, ...) NSAssert((condition), (description), ##__VA_ARGS__)
#define YFWCAssertNotNil(condition, description, ...) NSCAssert((condition), (description), ##__VA_ARGS__)

#define YFWAssertMainThread() NSAssert([NSThread isMainThread], @"This method must be called on the main thread")
#define YFWCAssertMainThread() NSCAssert([NSThread isMainThread], @"This method must be called on the main thread")


/**
 Add this macro before each category implementation, so we don't have to use
 -all_load or -force_load to load object files from static libraries that only
 contain categories and no classes.
 More info: http://developer.apple.com/library/mac/#qa/qa2006/qa1490.html .
 *******************************************************************************
 Example:
 YFWSYNTH_DUMMY_CLASS(NSString_YFWAdd)
 */
#ifndef YFWSYNTH_DUMMY_CLASS
#define YFWSYNTH_DUMMY_CLASS(_name_) \
@interface YFWSYNTH_DUMMY_CLASS_ ## _name_ : NSObject @end \
@implementation YFWSYNTH_DUMMY_CLASS_ ## _name_ @end
#endif


/**
 Synthsize a dynamic object property in @implementation scope.
 It allows us to add custom properties to existing classes in categories.
 
 @param association  ASSIGN / RETAIN / COPY / RETAIN_NONATOMIC / COPY_NONATOMIC
 @warning #import <objc/runtime.h>
 *******************************************************************************
 Example:
 @interface NSObject (MyAdd)
 @property (nonatomic, retain) UIColor *myColor;
 @end
 
 #import <objc/runtime.h>
 @implementation NSObject (MyAdd)
 YFWSYNTH_DYNAMIC_PROPERTY_OBJECT(myColor, setMyColor, RETAIN, UIColor *)
 @end
 */
#ifndef YFWSYNTH_DYNAMIC_PROPERTY_OBJECT
#define YFWSYNTH_DYNAMIC_PROPERTY_OBJECT(_getter_, _setter_, _association_, _type_) \
- (void)_setter_ : (_type_)object { \
[self willChangeValueForKey:@#_getter_]; \
objc_setAssociatedObject(self, _cmd, object, OBJC_ASSOCIATION_ ## _association_); \
[self didChangeValueForKey:@#_getter_]; \
} \
- (_type_)_getter_ { \
return objc_getAssociatedObject(self, @selector(_setter_:)); \
}
#endif


/**
 Synthsize a dynamic c type property in @implementation scope.
 It allows us to add custom properties to existing classes in categories.
 
 @warning #import <objc/runtime.h>
 *******************************************************************************
 Example:
 @interface NSObject (MyAdd)
 @property (nonatomic, retain) CGPoint myPoint;
 @end
 
 #import <objc/runtime.h>
 @implementation NSObject (MyAdd)
 YFWSYNTH_DYNAMIC_PROPERTY_CTYPE(myPoint, setMyPoint, CGPoint)
 @end
 */
#ifndef YFWSYNTH_DYNAMIC_PROPERTY_CTYPE
#define YFWSYNTH_DYNAMIC_PROPERTY_CTYPE(_getter_, _setter_, _type_) \
- (void)_setter_ : (_type_)object { \
[self willChangeValueForKey:@#_getter_]; \
NSValue *value = [NSValue value:&object withObjCType:@encode(_type_)]; \
objc_setAssociatedObject(self, _cmd, value, OBJC_ASSOCIATION_RETAIN); \
[self didChangeValueForKey:@#_getter_]; \
} \
- (_type_)_getter_ { \
_type_ cValue = { 0 }; \
NSValue *value = objc_getAssociatedObject(self, @selector(_setter_:)); \
[value getValue:&cValue]; \
return cValue; \
}
#endif

/**
 Synthsize a weak or strong reference.
 
 Example:
 @weakify(self)
 [self doSomething^{
 @strongify(self)
 if (!self) return;
 ...
 }];
 
 */
#ifndef weakify
#if DEBUG
#if __has_feature(objc_arc)
#define weakify(object) autoreleasepool{} __weak __typeof__(object) weak##_##object = object;
#else
#define weakify(object) autoreleasepool{} __block __typeof__(object) block##_##object = object;
#endif
#else
#if __has_feature(objc_arc)
#define weakify(object) try{} @finally{} {} __weak __typeof__(object) weak##_##object = object;
#else
#define weakify(object) try{} @finally{} {} __block __typeof__(object) block##_##object = object;
#endif
#endif
#endif

#ifndef strongify
#if DEBUG
#if __has_feature(objc_arc)
#define strongify(object) autoreleasepool{} __typeof__(object) object = weak##_##object;
#else
#define strongify(object) autoreleasepool{} __typeof__(object) object = block##_##object;
#endif
#else
#if __has_feature(objc_arc)
#define strongify(object) try{} @finally{} __typeof__(object) object = weak##_##object;
#else
#define strongify(object) try{} @finally{} __typeof__(object) object = block##_##object;
#endif
#endif
#endif


/**
 Convert CFRange to NSRange
 @param range CFRange @return NSRange
 */
static inline NSRange YFWNSRangeFromCFRange(CFRange range) {
    return NSMakeRange(range.location, range.length);
}

/**
 Convert NSRange to CFRange
 @param range NSRange @return CFRange
 */
static inline CFRange YFWCFRangeFromNSRange(NSRange range) {
    return CFRangeMake(range.location, range.length);
}

/**
 Same as CFAutorelease(), compatible for iOS6
 @param arg CFObject @return same as input
 */
static inline CFTypeRef YFWCFAutorelease(CFTypeRef CF_RELEASES_ARGUMENT arg) {
    if (((long)CFAutorelease + 1) != 1) {
        return CFAutorelease(arg);
    } else {
        id __autoreleasing obj = CFBridgingRelease(arg);
        return (__bridge CFTypeRef)obj;
    }
}

/**
 Profile time cost.
 @param ^block     code to benchmark
 @param ^complete  code time cost (millisecond)
 
 Usage:
 YFWBenchmark(^{
 // code
 }, ^(double ms) {
 NSLog("time cost: %.2f ms",ms);
 });
 
 */
static inline void YFWBenchmark(void (^block)(void), void (^complete)(double ms)) {
    // <QuartzCore/QuartzCore.h> version
    /*
     extern double CACurrentMediaTime (void);
     double begin, end, ms;
     begin = CACurrentMediaTime();
     block();
     end = CACurrentMediaTime();
     ms = (end - begin) * 1000.0;
     complete(ms);
     */
    
    // <sys/time.h> version
    struct timeval t0, t1;
    gettimeofday(&t0, NULL);
    block();
    gettimeofday(&t1, NULL);
    double ms = (double)(t1.tv_sec - t0.tv_sec) * 1e3 + (double)(t1.tv_usec - t0.tv_usec) * 1e-3;
    complete(ms);
}

static inline NSDate *_YFWCompileTime(const char *data, const char *time) {
    NSString *timeStr = [NSString stringWithFormat:@"%s %s",data,time];
    NSLocale *locale = [[NSLocale alloc] initWithLocaleIdentifier:@"en_US"];
    NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    [formatter setDateFormat:@"MMM dd YFWYFW HH:mm:ss"];
    [formatter setLocale:locale];
    return [formatter dateFromString:timeStr];
}

/**
 Get compile timestamp.
 @return A new date object set to the compile date and time.
 */
#ifndef YFWCompileTime
// use macro to avoid compile warning when use pch file
#define YFWCompileTime() _YFWCompileTime(__DATE__, __TIME__)
#endif

/**
 Returns a dispatch_time delay from now.
 */
static inline dispatch_time_t dispatch_time_delay(NSTimeInterval second) {
    return dispatch_time(DISPATCH_TIME_NOW, (int64_t)(second * NSEC_PER_SEC));
}

/**
 Returns a dispatch_wall_time delay from now.
 */
static inline dispatch_time_t dispatch_walltime_delay(NSTimeInterval second) {
    return dispatch_walltime(DISPATCH_TIME_NOW, (int64_t)(second * NSEC_PER_SEC));
}

/**
 Returns a dispatch_wall_time from NSDate.
 */
static inline dispatch_time_t dispatch_walltime_date(NSDate *date) {
    NSTimeInterval interval;
    double second, subsecond;
    struct timespec time;
    dispatch_time_t milestone;
    
    interval = [date timeIntervalSince1970];
    subsecond = modf(interval, &second);
    time.tv_sec = second;
    time.tv_nsec = subsecond * NSEC_PER_SEC;
    milestone = dispatch_walltime(&time, 0);
    return milestone;
}

/**
 Whether in main queue/thread.
 */
static inline bool dispatch_is_main_queue() {
    return pthread_main_np() != 0;
}

/**
 Submits a block for asynchronous execution on a main queue and returns immediately.
 */
static inline void dispatch_async_on_main_queue(void (^block)()) {
    if (pthread_main_np()) {
        block();
    } else {
        dispatch_async(dispatch_get_main_queue(), block);
    }
}

/**
 Submits a block for execution on a main queue and waits until the block completes.
 */
static inline void dispatch_sync_on_main_queue(void (^block)()) {
    if (pthread_main_np()) {
        block();
    } else {
        dispatch_sync(dispatch_get_main_queue(), block);
    }
}

/**
 Initialize a pthread mutex.
 */
static inline void pthread_mutex_init_recursive(pthread_mutex_t *mutex, bool recursive) {
#define YFWMUTEX_ASSERT_ON_ERROR(x_) do { \
__unused volatile int res = (x_); \
assert(res == 0); \
} while (0)
    assert(mutex != NULL);
    if (!recursive) {
        YFWMUTEX_ASSERT_ON_ERROR(pthread_mutex_init(mutex, NULL));
    } else {
        pthread_mutexattr_t attr;
        YFWMUTEX_ASSERT_ON_ERROR(pthread_mutexattr_init (&attr));
        YFWMUTEX_ASSERT_ON_ERROR(pthread_mutexattr_settype (&attr, PTHREAD_MUTEX_RECURSIVE));
        YFWMUTEX_ASSERT_ON_ERROR(pthread_mutex_init (mutex, &attr));
        YFWMUTEX_ASSERT_ON_ERROR(pthread_mutexattr_destroy (&attr));
    }
#undef YFWMUTEX_ASSERT_ON_ERROR
}


YFW_EXTERN_C_END
#endif
