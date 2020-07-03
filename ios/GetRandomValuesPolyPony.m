//
//  GetRandomValuesPolyPony.m
//
//  Preparing random bytes using uuids
//
//  Created by Martin Heidegger on 7/1/2020.
//

#import "GetRandomValuesPolyPony.h"
#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#elif __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import "React/RCTBridgeModule.h" // Required when used as a Pod in a Swift project
#endif
#import "RCTUtils.h"

@implementation GetRandomValuesPolyPony

RCT_EXPORT_MODULE()

@synthesize bridge = _bridge;

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(NSString*, newUUID)
{
    return [[NSUUID UUID] UUIDString];
}

@end
