#ifdef __OBJC__
#import <UIKit/UIKit.h>
#else
#ifndef FOUNDATION_EXPORT
#if defined(__cplusplus)
#define FOUNDATION_EXPORT extern "C"
#else
#define FOUNDATION_EXPORT extern
#endif
#endif
#endif

#import "DeviceInfo.hpp"
#import "HybridCactusCryptoSpec.hpp"
#import "HybridCactusDeviceInfoSpec.hpp"
#import "HybridCactusFileSystemSpec.hpp"
#import "HybridCactusImageSpec.hpp"
#import "HybridCactusSpec.hpp"
#import "HybridCactusUtilSpec.hpp"
#import "Cactus-Swift-Cxx-Bridge.hpp"

FOUNDATION_EXPORT double CactusVersionNumber;
FOUNDATION_EXPORT const unsigned char CactusVersionString[];

