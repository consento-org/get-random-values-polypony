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
  private static final String UUID_KEY = "uuid";

  public GetRandomValuesPolyPonyModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "GetRandomValuesPolyPony";
  }

  @ReactMethod
  public void newUUID(Callback success) {
    success.invoke(null, UUID.randomUUID().toString());
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put(UUID_KEY, UUID.randomUUID().toString());
    return constants;
  }
}
