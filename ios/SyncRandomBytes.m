//
//  SyncRandomBytes.m
//  randombytes
//
//  Forked by Martin Heidegger on 9/26/19.
//  Created by Mark Vayngrib on 10/13/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "SyncRandomBytes.h"
#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#elif __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import "React/RCTBridgeModule.h" // Required when used as a Pod in a Swift project
#endif

@implementation SyncRandomBytes

RCT_EXPORT_MODULE()

@synthesize bridge = _bridge;

RCT_EXPORT_METHOD(randomBytes:(NSUInteger)length
                  callback:(RCTResponseSenderBlock)callback)
{
    callback(@[[NSNull null], [self randomBytes:length]]);
}

- (NSMutableArray *) randomBytes:(NSUInteger)length
{
    NSMutableData* bytes = [NSMutableData dataWithLength:length];
    int status = SecRandomCopyBytes(kSecRandomDefault, length, [bytes mutableBytes]);
    return (NSMutableArray *)[bytes bytes];
}

- (NSDictionary *)constantsToExport
{
    return @{
        @"seed": [self randomBytes:8]
    };
};

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

@end
