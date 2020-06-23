package org.consento.syncrandombytes;

import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.Callback;

import com.facebook.react.bridge.ReactContextBaseJavaModule;

import java.security.SecureRandom;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

import android.util.Base64;

class SyncRandomBytesModule extends ReactContextBaseJavaModule {
  private static final String SEED_KEY = "seed";

  public SyncRandomBytesModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "SyncRandomBytes";
  }

  @ReactMethod
  public void randomBytes(int size, Callback success) {
    success.invoke(null, getRandomBytes(size));
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put(SEED_KEY, getRandomBytes(8));
    return constants;
  }

  private List<Integer> getRandomBytes(int size) {
    SecureRandom sr = new SecureRandom();
    List<Integer> returnSet = new ArrayList();
    byte[] output = new byte[size];
    sr.nextBytes(output);
    for (int i = 0; i < size; i++) {
      returnSet.add(Byte.toUnsignedInt(output[i]));
    }
    return returnSet;
  }
}
