"use strict";

/**
 * Reanimated 4 pulls `react-native-worklets`, whose native entry throws in Jest
 * unless `global.__workletsModuleProxy` exists. Install a minimal stub before
 * any test file (or setupFilesAfterEnv) imports Reanimated.
 */
function serializableRef(value) {
  return {
    value,
    get: () => value,
    set: (next) => {
      value = typeof next === "function" ? next(value) : next;
    },
  };
}

global.__workletsModuleProxy = {
  createSerializable: (value) => serializableRef(value),
  createSerializableImport: () => serializableRef(undefined),
  createSerializableString: (str) => serializableRef(str),
  createSerializableNumber: (num) => serializableRef(num),
  createSerializableBigInt: (bigInt) => serializableRef(bigInt),
  createSerializableBoolean: (bool) => serializableRef(bool),
  createSerializableUndefined: () => serializableRef(undefined),
  createSerializableNull: () => serializableRef(null),
  createSerializableTurboModuleLike: (props) => serializableRef(props),
  createSerializableObject: (obj) => serializableRef(obj),
  createSerializableHostObject: (obj) => serializableRef(obj),
  createSerializableArray: (arr) => serializableRef(arr),
  createSerializableMap: () => serializableRef(new Map()),
  createSerializableSet: () => serializableRef(new Set()),
  createSerializableInitializer: (obj) => serializableRef(obj),
  createSerializableFunction: (fn) => serializableRef(fn),
  createSerializableWorklet: (w) => serializableRef(w),
  createCustomSerializable: () => serializableRef(undefined),
  registerCustomSerializable: () => {},
  scheduleOnUI: () => {},
  executeOnUIRuntimeSync: (ref) => {
    if (ref && typeof ref.get === "function") {
      return ref.get();
    }
    if (ref && "value" in ref) {
      return ref.value;
    }
    return undefined;
  },
  createWorkletRuntime: () => ({}),
  scheduleOnRuntime: () => {},
  reportFatalErrorOnJS: () => {},
  createSynchronizable: (v) => serializableRef(v),
  synchronizableGetDirty: (r) => r.value,
  synchronizableGetBlocking: (r) => r.value,
  synchronizableSetBlocking: () => {},
  synchronizableLock: () => {},
  synchronizableUnlock: () => {},
  getStaticFeatureFlag: () => false,
  setDynamicFeatureFlag: () => {},
};
