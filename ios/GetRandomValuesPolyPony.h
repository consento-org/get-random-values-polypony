//
//  GetRandomValuesPolyPony.h
//
//  Random uuid
//
//  Created by Martin Heidegger on 7/1/2020.
//

#import <Foundation/Foundation.h>
#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#elif __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import "React/RCTBridgeModule.h" // Required when used as a Pod in a Swift project
#endif


@interface GetRandomValuesPolyPony : NSObject<RCTBridgeModule>

@end
