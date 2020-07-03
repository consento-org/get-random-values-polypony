package org.consento.getrandomvaluespolypony;

import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.Callback;

import com.facebook.react.bridge.ReactContextBaseJavaModule;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.UUID;

import android.util.Base64;

class GetRandomValuesPolyPonyModule extends ReactContextBaseJavaModule {
  public GetRandomValuesPolyPonyModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "GetRandomValuesPolyPony";
  }

  @ReactMethod(isBlockingSynchronousMethod=true)
  public String newUUID() {
    return UUID.randomUUID().toString();
  }
}
