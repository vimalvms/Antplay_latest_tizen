var Module = typeof Module !== "undefined" ? Module : {};
var moduleOverrides = {};
var key;
for (key in Module) {
    if (Module.hasOwnProperty(key)) {
        moduleOverrides[key] = Module[key]
    }
}
var arguments_ = [];
var thisProgram = "./this.program";
var quit_ = function (status, toThrow) {
    throw toThrow
};
var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_HAS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
ENVIRONMENT_IS_WEB = typeof window === "object";
ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
ENVIRONMENT_HAS_NODE = typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string";
ENVIRONMENT_IS_NODE = ENVIRONMENT_HAS_NODE && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
var ENVIRONMENT_IS_PTHREAD = Module["ENVIRONMENT_IS_PTHREAD"] || false;
if (ENVIRONMENT_IS_PTHREAD) {
    buffer = Module["buffer"];
    tempDoublePtr = Module["tempDoublePtr"];
    DYNAMIC_BASE = Module["DYNAMIC_BASE"];
    DYNAMICTOP_PTR = Module["DYNAMICTOP_PTR"]
}
var _scriptDir = typeof document !== "undefined" && document.currentScript ? document.currentScript.src : undefined;
if (ENVIRONMENT_IS_NODE) {
    _scriptDir = __filename
} else if (ENVIRONMENT_IS_WORKER) {
    _scriptDir = self.location.href
}
var scriptDirectory = "";

function locateFile(path) {
    if (Module["locateFile"]) {
        return Module["locateFile"](path, scriptDirectory)
    }
    return scriptDirectory + path
}
var read_, readAsync, readBinary, setWindowTitle;
var nodeFS;
var nodePath;
if (ENVIRONMENT_IS_NODE) {
    scriptDirectory = __dirname + "/";
    read_ = function shell_read(filename, binary) {
        if (!nodeFS) nodeFS = require("fs");
        if (!nodePath) nodePath = require("path");
        filename = nodePath["normalize"](filename);
        return nodeFS["readFileSync"](filename, binary ? null : "utf8")
    };
    readBinary = function readBinary(filename) {
        var ret = read_(filename, true);
        if (!ret.buffer) {
            ret = new Uint8Array(ret)
        }
        assert(ret.buffer);
        return ret
    };
    if (process["argv"].length > 1) {
        thisProgram = process["argv"][1].replace(/\\/g, "/")
    }
    arguments_ = process["argv"].slice(2);
    if (typeof module !== "undefined") {
        module["exports"] = Module
    }
    process["on"]("uncaughtException", function (ex) {
        if (!(ex instanceof ExitStatus)) {
            throw ex
        }
    });
    process["on"]("unhandledRejection", abort);
    quit_ = function (status) {
        process["exit"](status)
    };
    Module["inspect"] = function () {
        return "[Emscripten Module object]"
    };
    var nodeWorkerThreads;
    try {
        nodeWorkerThreads = require("worker_threads")
    } catch (e) {
        console.error('The "worker_threads" module is not supported in this node.js build - perhaps a newer version is needed?');
        throw e
    }
    Worker = nodeWorkerThreads.Worker
} else if (ENVIRONMENT_IS_SHELL) {
    if (typeof read != "undefined") {
        read_ = function shell_read(f) {
            return read(f)
        }
    }
    readBinary = function readBinary(f) {
        var data;
        if (typeof readbuffer === "function") {
            return new Uint8Array(readbuffer(f))
        }
        data = read(f, "binary");
        assert(typeof data === "object");
        return data
    };
    if (typeof scriptArgs != "undefined") {
        arguments_ = scriptArgs
    } else if (typeof arguments != "undefined") {
        arguments_ = arguments
    }
    if (typeof quit === "function") {
        quit_ = function (status) {
            quit(status)
        }
    }
    if (typeof print !== "undefined") {
        if (typeof console === "undefined") console = {};
        console.log = print;
        console.warn = console.error = typeof printErr !== "undefined" ? printErr : print
    }
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href
    } else if (document.currentScript) {
        scriptDirectory = document.currentScript.src
    }
    if (scriptDirectory.indexOf("blob:") !== 0) {
        scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf("/") + 1)
    } else {
        scriptDirectory = ""
    }
    if (ENVIRONMENT_HAS_NODE) {
        read_ = function shell_read(filename, binary) {
            if (!nodeFS) nodeFS = require("fs");
            if (!nodePath) nodePath = require("path");
            filename = nodePath["normalize"](filename);
            return nodeFS["readFileSync"](filename, binary ? null : "utf8")
        };
        readBinary = function readBinary(filename) {
            var ret = read_(filename, true);
            if (!ret.buffer) {
                ret = new Uint8Array(ret)
            }
            assert(ret.buffer);
            return ret
        }
    } else {
        read_ = function shell_read(url) {
            var xhr = new XMLHttpRequest;
            xhr.open("GET", url, false);
            xhr.send(null);
            return xhr.responseText
        };
        if (ENVIRONMENT_IS_WORKER) {
            readBinary = function readBinary(url) {
                var xhr = new XMLHttpRequest;
                xhr.open("GET", url, false);
                xhr.responseType = "arraybuffer";
                xhr.send(null);
                return new Uint8Array(xhr.response)
            }
        }
        readAsync = function readAsync(url, onload, onerror) {
            var xhr = new XMLHttpRequest;
            xhr.open("GET", url, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = function xhr_onload() {
                if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                    onload(xhr.response);
                    return
                }
                onerror()
            };
            xhr.onerror = onerror;
            xhr.send(null)
        }
    }
    setWindowTitle = function (title) {
        document.title = title
    }
} else {}
if (ENVIRONMENT_HAS_NODE) {
    if (typeof performance === "undefined") {
        performance = require("perf_hooks").performance
    }
}
var out = Module["print"] || console.log.bind(console);
var err = Module["printErr"] || console.warn.bind(console);
for (key in moduleOverrides) {
    if (moduleOverrides.hasOwnProperty(key)) {
        Module[key] = moduleOverrides[key]
    }
}
moduleOverrides = null;
if (Module["arguments"]) arguments_ = Module["arguments"];
if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
if (Module["quit"]) quit_ = Module["quit"];

function dynamicAlloc(size) {
    var ret = HEAP32[DYNAMICTOP_PTR >> 2];
    var end = ret + size + 15 & -16;
    if (end > _emscripten_get_heap_size()) {
        abort()
    }
    HEAP32[DYNAMICTOP_PTR >> 2] = end;
    return ret
}

function getNativeTypeSize(type) {
    switch (type) {
        case "i1":
        case "i8":
            return 1;
        case "i16":
            return 2;
        case "i32":
            return 4;
        case "i64":
            return 8;
        case "float":
            return 4;
        case "double":
            return 8;
        default: {
            if (type[type.length - 1] === "*") {
                return 4
            } else if (type[0] === "i") {
                var bits = parseInt(type.substr(1));
                assert(bits % 8 === 0, "getNativeTypeSize invalid bits " + bits + ", type " + type);
                return bits / 8
            } else {
                return 0
            }
        }
    }
}

function warnOnce(text) {
    if (!warnOnce.shown) warnOnce.shown = {};
    if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        err(text)
    }
}
var asm2wasmImports = {
    "f64-rem": function (x, y) {
        return x % y
    },
    "debugger": function () {}
};
var functionPointers = new Array(0);

function makeBigInt(low, high, unsigned) {
    return unsigned ? +(low >>> 0) + +(high >>> 0) * 4294967296 : +(low >>> 0) + +(high | 0) * 4294967296
}

function dynCall(sig, ptr, args) {
    if (args && args.length) {
        return Module["dynCall_" + sig].apply(null, [ptr].concat(args))
    } else {
        return Module["dynCall_" + sig].call(null, ptr)
    }
}
var tempRet0 = 0;
var setTempRet0 = function (value) {
    tempRet0 = value
};
var getTempRet0 = function () {
    return tempRet0
};
var GLOBAL_BASE = 1024;
var wasmBinary;
if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
var noExitRuntime;
if (Module["noExitRuntime"]) noExitRuntime = Module["noExitRuntime"];
if (typeof WebAssembly !== "object") {
    err("no native wasm support detected")
}

function setValue(ptr, value, type, noSafe) {
    type = type || "i8";
    if (type.charAt(type.length - 1) === "*") type = "i32";
    switch (type) {
        case "i1":
            HEAP8[ptr >> 0] = value;
            break;
        case "i8":
            HEAP8[ptr >> 0] = value;
            break;
        case "i16":
            HEAP16[ptr >> 1] = value;
            break;
        case "i32":
            HEAP32[ptr >> 2] = value;
            break;
        case "i64":
            tempI64 = [value >>> 0, (tempDouble = value, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[ptr >> 2] = tempI64[0], HEAP32[ptr + 4 >> 2] = tempI64[1];
            break;
        case "float":
            HEAPF32[ptr >> 2] = value;
            break;
        case "double":
            HEAPF64[ptr >> 3] = value;
            break;
        default:
            abort("invalid type for setValue: " + type)
    }
}
var wasmMemory;
var wasmTable = new WebAssembly.Table({
    "initial": 3050,
    "maximum": 3050,
    "element": "anyfunc"
});
var wasmModule;
var threadInfoStruct = 0;
var selfThreadId = 0;
var __performance_now_clock_drift = 0;
var ABORT = false;
var EXITSTATUS = 0;

function assert(condition, text) {
    if (!condition) {
        abort("Assertion failed: " + text)
    }
}
var ALLOC_NONE = 3;

function allocate(slab, types, allocator, ptr) {
    var zeroinit, size;
    if (typeof slab === "number") {
        zeroinit = true;
        size = slab
    } else {
        zeroinit = false;
        size = slab.length
    }
    var singleType = typeof types === "string" ? types : null;
    var ret;
    if (allocator == ALLOC_NONE) {
        ret = ptr
    } else {
        ret = [_malloc, stackAlloc, dynamicAlloc][allocator](Math.max(size, singleType ? 1 : types.length))
    }
    if (zeroinit) {
        var stop;
        ptr = ret;
        assert((ret & 3) == 0);
        stop = ret + (size & ~3);
        for (; ptr < stop; ptr += 4) {
            HEAP32[ptr >> 2] = 0
        }
        stop = ret + size;
        while (ptr < stop) {
            HEAP8[ptr++ >> 0] = 0
        }
        return ret
    }
    if (singleType === "i8") {
        if (slab.subarray || slab.slice) {
            HEAPU8.set(slab, ret)
        } else {
            HEAPU8.set(new Uint8Array(slab), ret)
        }
        return ret
    }
    var i = 0,
        type, typeSize, previousType;
    while (i < size) {
        var curr = slab[i];
        type = singleType || types[i];
        if (type === 0) {
            i++;
            continue
        }
        if (type == "i64") type = "i32";
        setValue(ret + i, curr, type);
        if (previousType !== type) {
            typeSize = getNativeTypeSize(type);
            previousType = type
        }
        i += typeSize
    }
    return ret
}

function getMemory(size) {
    if (!runtimeInitialized) return dynamicAlloc(size);
    return _malloc(size)
}

function UTF8ArrayToString(u8Array, idx, maxBytesToRead) {
    var endIdx = idx + maxBytesToRead;
    var str = "";
    while (!(idx >= endIdx)) {
        var u0 = u8Array[idx++];
        if (!u0) return str;
        if (!(u0 & 128)) {
            str += String.fromCharCode(u0);
            continue
        }
        var u1 = u8Array[idx++] & 63;
        if ((u0 & 224) == 192) {
            str += String.fromCharCode((u0 & 31) << 6 | u1);
            continue
        }
        var u2 = u8Array[idx++] & 63;
        if ((u0 & 240) == 224) {
            u0 = (u0 & 15) << 12 | u1 << 6 | u2
        } else {
            u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u8Array[idx++] & 63
        }
        if (u0 < 65536) {
            str += String.fromCharCode(u0)
        } else {
            var ch = u0 - 65536;
            str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
        }
    }
    return str
}

function UTF8ToString(ptr, maxBytesToRead) {
    return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : ""
}

function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
    if (!(maxBytesToWrite > 0)) return 0;
    var startIdx = outIdx;
    var endIdx = outIdx + maxBytesToWrite - 1;
    for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) {
            var u1 = str.charCodeAt(++i);
            u = 65536 + ((u & 1023) << 10) | u1 & 1023
        }
        if (u <= 127) {
            if (outIdx >= endIdx) break;
            outU8Array[outIdx++] = u
        } else if (u <= 2047) {
            if (outIdx + 1 >= endIdx) break;
            outU8Array[outIdx++] = 192 | u >> 6;
            outU8Array[outIdx++] = 128 | u & 63
        } else if (u <= 65535) {
            if (outIdx + 2 >= endIdx) break;
            outU8Array[outIdx++] = 224 | u >> 12;
            outU8Array[outIdx++] = 128 | u >> 6 & 63;
            outU8Array[outIdx++] = 128 | u & 63
        } else {
            if (outIdx + 3 >= endIdx) break;
            outU8Array[outIdx++] = 240 | u >> 18;
            outU8Array[outIdx++] = 128 | u >> 12 & 63;
            outU8Array[outIdx++] = 128 | u >> 6 & 63;
            outU8Array[outIdx++] = 128 | u & 63
        }
    }
    outU8Array[outIdx] = 0;
    return outIdx - startIdx
}

function stringToUTF8(str, outPtr, maxBytesToWrite) {
    return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite)
}

function lengthBytesUTF8(str) {
    var len = 0;
    for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
        if (u <= 127) ++len;
        else if (u <= 2047) len += 2;
        else if (u <= 65535) len += 3;
        else len += 4
    }
    return len
}

function allocateUTF8(str) {
    var size = lengthBytesUTF8(str) + 1;
    var ret = _malloc(size);
    if (ret) stringToUTF8Array(str, HEAP8, ret, size);
    return ret
}

function allocateUTF8OnStack(str) {
    var size = lengthBytesUTF8(str) + 1;
    var ret = stackAlloc(size);
    stringToUTF8Array(str, HEAP8, ret, size);
    return ret
}

function writeArrayToMemory(array, buffer) {
    HEAP8.set(array, buffer)
}

function writeAsciiToMemory(str, buffer, dontAddNull) {
    for (var i = 0; i < str.length; ++i) {
        HEAP8[buffer++ >> 0] = str.charCodeAt(i)
    }
    if (!dontAddNull) HEAP8[buffer >> 0] = 0
}
var WASM_PAGE_SIZE = 65536;
var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

function updateGlobalBufferAndViews(buf) {
    buffer = buf;
    Module["HEAP8"] = HEAP8 = new Int8Array(buf);
    Module["HEAP16"] = HEAP16 = new Int16Array(buf);
    Module["HEAP32"] = HEAP32 = new Int32Array(buf);
    Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
    Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
    Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
    Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
    Module["HEAPF64"] = HEAPF64 = new Float64Array(buf)
}
var STACK_BASE = 649664,
    STACKTOP = STACK_BASE,
    STACK_MAX = 17426880,
    DYNAMIC_BASE = 17426880,
    DYNAMICTOP_PTR = 646368;
if (ENVIRONMENT_IS_PTHREAD) {}
var INITIAL_TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 134217728;
if (ENVIRONMENT_IS_PTHREAD) {
    wasmMemory = Module["wasmMemory"];
    buffer = Module["buffer"]
} else {
    if (Module["wasmMemory"]) {
        wasmMemory = Module["wasmMemory"]
    } else {
        wasmMemory = new WebAssembly.Memory({
            "initial": INITIAL_TOTAL_MEMORY / WASM_PAGE_SIZE,
            "maximum": INITIAL_TOTAL_MEMORY / WASM_PAGE_SIZE,
            "shared": true
        });
        if (!(wasmMemory.buffer instanceof SharedArrayBuffer)) {
            err("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag");
            if (ENVIRONMENT_HAS_NODE) {
                console.log("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and also use a recent version)")
            }
            throw Error("bad memory")
        }
    }
}
if (wasmMemory) {
    buffer = wasmMemory.buffer
}
INITIAL_TOTAL_MEMORY = buffer.byteLength;
updateGlobalBufferAndViews(buffer);
if (!ENVIRONMENT_IS_PTHREAD) {
    HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE
}

function callRuntimeCallbacks(callbacks) {
    while (callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == "function") {
            callback();
            continue
        }
        var func = callback.func;
        if (typeof func === "number") {
            if (callback.arg === undefined) {
                Module["dynCall_v"](func)
            } else {
                Module["dynCall_vi"](func, callback.arg)
            }
        } else {
            func(callback.arg === undefined ? null : callback.arg)
        }
    }
}
var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATMAIN__ = [];
var __ATEXIT__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
var runtimeExited = false;
if (ENVIRONMENT_IS_PTHREAD) runtimeInitialized = true;

function preRun() {
    if (ENVIRONMENT_IS_PTHREAD) return;
    if (Module["preRun"]) {
        if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
        while (Module["preRun"].length) {
            addOnPreRun(Module["preRun"].shift())
        }
    }
    callRuntimeCallbacks(__ATPRERUN__)
}

function initRuntime() {
    runtimeInitialized = true;
    if (USE_HOST_BINDINGS) _set_host_bindings_impl();
    SOCKFS.root = FS.mount(SOCKFS, {}, null);
    if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
    TTY.init();
    callRuntimeCallbacks(__ATINIT__)
}

function preMain() {
    if (ENVIRONMENT_IS_PTHREAD) return;
    FS.ignorePermissions = false;
    callRuntimeCallbacks(__ATMAIN__)
}

function exitRuntime() {
    if (ENVIRONMENT_IS_PTHREAD) return;
    runtimeExited = true
}

function postRun() {
    if (ENVIRONMENT_IS_PTHREAD) return;
    if (Module["postRun"]) {
        if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
        while (Module["postRun"].length) {
            addOnPostRun(Module["postRun"].shift())
        }
    }
    callRuntimeCallbacks(__ATPOSTRUN__)
}

function addOnPreRun(cb) {
    __ATPRERUN__.unshift(cb)
}

function addOnPostRun(cb) {
    __ATPOSTRUN__.unshift(cb)
}

function unSign(value, bits, ignore) {
    if (value >= 0) {
        return value
    }
    return bits <= 32 ? 2 * Math.abs(1 << bits - 1) + value : Math.pow(2, bits) + value
}

function reSign(value, bits, ignore) {
    if (value <= 0) {
        return value
    }
    var half = bits <= 32 ? Math.abs(1 << bits - 1) : Math.pow(2, bits - 1);
    if (value >= half && (bits <= 32 || value > half)) {
        value = -2 * half + value
    }
    return value
}
var Math_abs = Math.abs;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_min = Math.min;
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;

function getUniqueRunDependency(id) {
    return id
}

function addRunDependency(id) {
    assert(!ENVIRONMENT_IS_PTHREAD, "addRunDependency cannot be used in a pthread worker");
    runDependencies++;
    if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies)
    }
}

function removeRunDependency(id) {
    runDependencies--;
    if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies)
    }
    if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
            clearInterval(runDependencyWatcher);
            runDependencyWatcher = null
        }
        if (dependenciesFulfilled) {
            var callback = dependenciesFulfilled;
            dependenciesFulfilled = null;
            callback()
        }
    }
}
Module["preloadedImages"] = {};
Module["preloadedAudios"] = {};

function abort(what) {
    if (Module["onAbort"]) {
        Module["onAbort"](what)
    }
    if (ENVIRONMENT_IS_PTHREAD) console.error("Pthread aborting at " + (new Error).stack);
    what += "";
    out(what);
    err(what);
    ABORT = true;
    EXITSTATUS = 1;
    what = "abort(" + what + "). Build with -s ASSERTIONS=1 for more info.";
    throw new WebAssembly.RuntimeError(what)
}
var memoryInitializer = null;
if (!ENVIRONMENT_IS_PTHREAD) addOnPreRun(function () {
    if (typeof SharedArrayBuffer !== "undefined") {
        addRunDependency("pthreads");
        PThread.allocateUnusedWorkers(20, function () {
            removeRunDependency("pthreads")
        })
    }
});
var dataURIPrefix = "data:application/octet-stream;base64,";

function isDataURI(filename) {
    return String.prototype.startsWith ? filename.startsWith(dataURIPrefix) : filename.indexOf(dataURIPrefix) === 0
}
var wasmBinaryFile = "moonlight-wasm.wasm";
if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile)
}

function getBinary() {
    try {
        if (wasmBinary) {
            return new Uint8Array(wasmBinary)
        }
        if (readBinary) {
            return readBinary(wasmBinaryFile)
        } else {
            throw "both async and sync fetching of the wasm failed"
        }
    } catch (err) {
        abort(err)
    }
}

function getBinaryPromise() {
    if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && typeof fetch === "function") {
        return fetch(wasmBinaryFile, {
            credentials: "same-origin"
        }).then(function (response) {
            if (!response["ok"]) {
                throw "failed to load wasm binary file at '" + wasmBinaryFile + "'"
            }
            return response["arrayBuffer"]()
        }).catch(function () {
            return getBinary()
        })
    }
    return new Promise(function (resolve, reject) {
        resolve(getBinary())
    })
}
let USE_HOST_BINDINGS = true;

function createWasm() {
    for (const k in asmLibraryArg) {
        if (typeof asmLibraryArg[k] !== "string") {
            continue
        }
        let available = true;
        const componentList = asmLibraryArg[k].split(".");
        let component = self;
        for (const x of componentList) {
            if (typeof component[x] === "undefined") {
                available = false;
                break
            }
            component = component[x]
        }
        if (available) {
            asmLibraryArg[k] = component
        } else {
            USE_HOST_BINDINGS = false;
            asmLibraryArg[k] = (() => {})
        }
    }
    var info = {
        "env": asmLibraryArg,
        "wasi_snapshot_preview1": asmLibraryArg,
        "global": {
            "NaN": NaN,
            Infinity: Infinity
        },
        "global.Math": Math,
        "asm2wasm": asm2wasmImports
    };

    function receiveInstance(instance, module) {
        var exports = instance.exports;
        Module["asm"] = exports;
        wasmModule = module;
        if (!ENVIRONMENT_IS_PTHREAD) removeRunDependency("wasm-instantiate")
    }
    if (!ENVIRONMENT_IS_PTHREAD) {
        addRunDependency("wasm-instantiate")
    }

    function receiveInstantiatedSource(output) {
        receiveInstance(output["instance"], output["module"])
    }

    function instantiateArrayBuffer(receiver) {
        return getBinaryPromise().then(function (binary) {
            return WebAssembly.instantiate(binary, info)
        }).then(receiver, function (reason) {
            err("failed to asynchronously prepare wasm: " + reason);
            abort(reason)
        })
    }

    function instantiateAsync() {
        if (!wasmBinary && typeof WebAssembly.instantiateStreaming === "function" && !isDataURI(wasmBinaryFile) && typeof fetch === "function") {
            fetch(wasmBinaryFile, {
                credentials: "same-origin"
            }).then(function (response) {
                var result = WebAssembly.instantiateStreaming(response, info);
                return result.then(receiveInstantiatedSource, function (reason) {
                    err("wasm streaming compile failed: " + reason);
                    err("falling back to ArrayBuffer instantiation");
                    instantiateArrayBuffer(receiveInstantiatedSource)
                })
            })
        } else {
            return instantiateArrayBuffer(receiveInstantiatedSource)
        }
    }
    if (Module["instantiateWasm"]) {
        try {
            var exports = Module["instantiateWasm"](info, receiveInstance);
            return exports
        } catch (e) {
            err("Module.instantiateWasm callback failed with error: " + e);
            return false
        }
    }
    instantiateAsync();
    return {}
}
Module["asm"] = createWasm;
var tempDouble;
var tempI64;
var ASM_CONSTS = [function ($0, $1, $2) {
    const type = UTF8ToString($1);
    const response = UTF8ToString($2);
    handlePromiseMessage($0, type, response)
}, function ($0) {
    const msg = UTF8ToString($0);
    handleMessage(msg)
}, function () {
    Module["noExitRuntime"] = true
}, function ($0, $1, $2, $3) {
    const type = UTF8ToString($1);
    const response = HEAPU8.slice($2, $2 + $3);
    handlePromiseMessage($0, type, response)
}, function () {
    postMessage({
        cmd: "processQueuedMainThreadWork"
    })
}, function ($0) {
    if (!ENVIRONMENT_IS_PTHREAD) {
        if (!PThread.pthreads[$0] || !PThread.pthreads[$0].worker) {
            return 0
        }
        PThread.pthreads[$0].worker.postMessage({
            cmd: "processThreadQueue"
        })
    } else {
        postMessage({
            targetThread: $0,
            cmd: "processThreadQueue"
        })
    }
    return 1
}, function ($0) {
    const index = $0;
    if (index <= 0) {
        return 0
    }
    const func = proxiedFunctionTable[index].name;
    if (func === "___syscall142") {
        return 142
    } else if (func === "___syscall168") {
        return 168
    } else {
        return 0
    }
}, function ($0) {
    let args = $0 / 8;
    let args_ptr = HEAPF64[args + 1] / 4;
    let readfds = HEAP32[args_ptr + 1] / 4;
    let writefds = HEAP32[args_ptr + 2] / 4;
    let exceptfds = HEAP32[args_ptr + 3] / 4;
    if (readfds) {
        HEAP32[readfds] = 0;
        HEAP32[readfds + 1] = 0
    }
    if (writefds) {
        HEAP32[writefds] = 0;
        HEAP32[writefds + 1] = 0
    }
    if (exceptfds) {
        HEAP32[exceptfds] = 0;
        HEAP32[exceptfds + 1] = 0
    }
}, function () {
    return !!Module["canvas"]
}, function () {
    noExitRuntime = true
}, function () {
    throw "Canceled!"
}];

function _emscripten_asm_const_i(code) {
    return ASM_CONSTS[code]()
}

function _emscripten_asm_const_ii(code, a0) {
    return ASM_CONSTS[code](a0)
}

function _emscripten_asm_const_sync_on_main_thread_ii(code, a0) {
    if (ENVIRONMENT_IS_PTHREAD) {
        return _emscripten_proxy_to_main_thread_js(-1 - code, 1, a0)
    }
    return ASM_CONSTS[code](a0)
}

function _emscripten_asm_const_sync_on_main_thread_iiiii(code, a0, a1, a2, a3) {
    if (ENVIRONMENT_IS_PTHREAD) {
        return _emscripten_proxy_to_main_thread_js(-1 - code, 1, a0, a1, a2, a3)
    }
    return ASM_CONSTS[code](a0, a1, a2, a3)
}

function _emscripten_asm_const_sync_on_main_thread_iiii(code, a0, a1, a2) {
    if (ENVIRONMENT_IS_PTHREAD) {
        return _emscripten_proxy_to_main_thread_js(-1 - code, 1, a0, a1, a2)
    }
    return ASM_CONSTS[code](a0, a1, a2)
}

function _initPthreadsJS() {
    PThread.initRuntime()
}
if (!ENVIRONMENT_IS_PTHREAD) __ATINIT__.push({
    func: function () {
        globalCtors()
    }
});
if (!ENVIRONMENT_IS_PTHREAD) {
    memoryInitializer = "moonlight-wasm.js.mem"
}
var tempDoublePtr;
if (!ENVIRONMENT_IS_PTHREAD) tempDoublePtr = 649648;

function demangle(func) {
    return func
}

function demangleAll(text) {
    var regex = /\b__Z[\w\d_]+/g;
    return text.replace(regex, function (x) {
        var y = demangle(x);
        return x === y ? x : y + " [" + x + "]"
    })
}
var PROCINFO = {
    ppid: 1,
    pid: 42,
    sid: 42,
    pgid: 42
};
var ERRNO_CODES = {
    EPERM: 63,
    ENOENT: 44,
    ESRCH: 71,
    EINTR: 27,
    EIO: 29,
    ENXIO: 60,
    E2BIG: 1,
    ENOEXEC: 45,
    EBADF: 8,
    ECHILD: 12,
    EAGAIN: 6,
    EWOULDBLOCK: 6,
    ENOMEM: 48,
    EACCES: 2,
    EFAULT: 21,
    ENOTBLK: 105,
    EBUSY: 10,
    EEXIST: 20,
    EXDEV: 75,
    ENODEV: 43,
    ENOTDIR: 54,
    EISDIR: 31,
    EINVAL: 28,
    ENFILE: 41,
    EMFILE: 33,
    ENOTTY: 59,
    ETXTBSY: 74,
    EFBIG: 22,
    ENOSPC: 51,
    ESPIPE: 70,
    EROFS: 69,
    EMLINK: 34,
    EPIPE: 64,
    EDOM: 18,
    ERANGE: 68,
    ENOMSG: 49,
    EIDRM: 24,
    ECHRNG: 106,
    EL2NSYNC: 156,
    EL3HLT: 107,
    EL3RST: 108,
    ELNRNG: 109,
    EUNATCH: 110,
    ENOCSI: 111,
    EL2HLT: 112,
    EDEADLK: 16,
    ENOLCK: 46,
    EBADE: 113,
    EBADR: 114,
    EXFULL: 115,
    ENOANO: 104,
    EBADRQC: 103,
    EBADSLT: 102,
    EDEADLOCK: 16,
    EBFONT: 101,
    ENOSTR: 100,
    ENODATA: 116,
    ETIME: 117,
    ENOSR: 118,
    ENONET: 119,
    ENOPKG: 120,
    EREMOTE: 121,
    ENOLINK: 47,
    EADV: 122,
    ESRMNT: 123,
    ECOMM: 124,
    EPROTO: 65,
    EMULTIHOP: 36,
    EDOTDOT: 125,
    EBADMSG: 9,
    ENOTUNIQ: 126,
    EBADFD: 127,
    EREMCHG: 128,
    ELIBACC: 129,
    ELIBBAD: 130,
    ELIBSCN: 131,
    ELIBMAX: 132,
    ELIBEXEC: 133,
    ENOSYS: 52,
    ENOTEMPTY: 55,
    ENAMETOOLONG: 37,
    ELOOP: 32,
    EOPNOTSUPP: 138,
    EPFNOSUPPORT: 139,
    ECONNRESET: 15,
    ENOBUFS: 42,
    EAFNOSUPPORT: 5,
    EPROTOTYPE: 67,
    ENOTSOCK: 57,
    ENOPROTOOPT: 50,
    ESHUTDOWN: 140,
    ECONNREFUSED: 14,
    EADDRINUSE: 3,
    ECONNABORTED: 13,
    ENETUNREACH: 40,
    ENETDOWN: 38,
    ETIMEDOUT: 73,
    EHOSTDOWN: 142,
    EHOSTUNREACH: 23,
    EINPROGRESS: 26,
    EALREADY: 7,
    EDESTADDRREQ: 17,
    EMSGSIZE: 35,
    EPROTONOSUPPORT: 66,
    ESOCKTNOSUPPORT: 137,
    EADDRNOTAVAIL: 4,
    ENETRESET: 39,
    EISCONN: 30,
    ENOTCONN: 53,
    ETOOMANYREFS: 141,
    EUSERS: 136,
    EDQUOT: 19,
    ESTALE: 72,
    ENOTSUP: 138,
    ENOMEDIUM: 148,
    EILSEQ: 25,
    EOVERFLOW: 61,
    ECANCELED: 11,
    ENOTRECOVERABLE: 56,
    EOWNERDEAD: 62,
    ESTRPIPE: 135
};
var __main_thread_futex_wait_address = 649632;

function _emscripten_futex_wake(addr, count) {
    if (addr <= 0 || addr > HEAP8.length || addr & 3 != 0 || count < 0) return -28;
    if (count == 0) return 0;
    if (count >= 2147483647) count = Infinity;
    var mainThreadWaitAddress = Atomics.load(HEAP32, __main_thread_futex_wait_address >> 2);
    var mainThreadWoken = 0;
    if (mainThreadWaitAddress == addr) {
        var loadedAddr = Atomics.compareExchange(HEAP32, __main_thread_futex_wait_address >> 2, mainThreadWaitAddress, 0);
        if (loadedAddr == mainThreadWaitAddress) {
            --count;
            mainThreadWoken = 1;
            if (count <= 0) return 1
        }
    }
    var ret = Atomics.notify(HEAP32, addr >> 2, count);
    if (ret >= 0) return ret + mainThreadWoken;
    throw "Atomics.notify returned an unexpected value " + ret
}

function __kill_thread(pthread_ptr) {
    if (ENVIRONMENT_IS_PTHREAD) throw "Internal Error! _kill_thread() can only ever be called from main application thread!";
    if (!pthread_ptr) throw "Internal Error! Null pthread_ptr in _kill_thread!";
    HEAP32[pthread_ptr + 24 >> 2] = 0;
    var pthread = PThread.pthreads[pthread_ptr];
    pthread.worker.terminate();
    PThread.freeThreadData(pthread);
    PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(pthread.worker), 1);
    pthread.worker.pthread = undefined
}

function __cancel_thread(pthread_ptr) {
    if (ENVIRONMENT_IS_PTHREAD) throw "Internal Error! _cancel_thread() can only ever be called from main application thread!";
    if (!pthread_ptr) throw "Internal Error! Null pthread_ptr in _cancel_thread!";
    var pthread = PThread.pthreads[pthread_ptr];
    pthread.worker.postMessage({
        "cmd": "cancel"
    })
}

function __cleanup_thread(pthread_ptr) {
    if (ENVIRONMENT_IS_PTHREAD) throw "Internal Error! _cleanup_thread() can only ever be called from main application thread!";
    if (!pthread_ptr) throw "Internal Error! Null pthread_ptr in _cleanup_thread!";
    HEAP32[pthread_ptr + 24 >> 2] = 0;
    var pthread = PThread.pthreads[pthread_ptr];
    if (pthread) {
        var worker = pthread.worker;
        PThread.returnWorkerToPool(worker)
    }
}
var PThread = {
    MAIN_THREAD_ID: 1,
    mainThreadInfo: {
        schedPolicy: 0,
        schedPrio: 0
    },
    preallocatedWorkers: [],
    unusedWorkers: [],
    runningWorkers: [],
    initRuntime: function () {
        __register_pthread_ptr(PThread.mainThreadBlock, !ENVIRONMENT_IS_WORKER, 1);
        _emscripten_register_main_browser_thread_id(PThread.mainThreadBlock)
    },
    initMainThreadBlock: function () {
        if (ENVIRONMENT_IS_PTHREAD) return undefined;
        var requestedPoolSize = 20;
        PThread.preallocatedWorkers = PThread.createNewWorkers(requestedPoolSize);
        PThread.mainThreadBlock = 648848;
        for (var i = 0; i < 244 / 4; ++i) HEAPU32[PThread.mainThreadBlock / 4 + i] = 0;
        HEAP32[PThread.mainThreadBlock + 24 >> 2] = PThread.mainThreadBlock;
        var headPtr = PThread.mainThreadBlock + 168;
        HEAP32[headPtr >> 2] = headPtr;
        var tlsMemory = 649104;
        for (var i = 0; i < 128; ++i) HEAPU32[tlsMemory / 4 + i] = 0;
        Atomics.store(HEAPU32, PThread.mainThreadBlock + 116 >> 2, tlsMemory);
        Atomics.store(HEAPU32, PThread.mainThreadBlock + 52 >> 2, PThread.mainThreadBlock);
        Atomics.store(HEAPU32, PThread.mainThreadBlock + 56 >> 2, PROCINFO.pid)
    },
    initWorker: function () {},
    pthreads: {},
    exitHandlers: null,
    setThreadStatus: function () {},
    runExitHandlers: function () {
        if (PThread.exitHandlers !== null) {
            while (PThread.exitHandlers.length > 0) {
                PThread.exitHandlers.pop()()
            }
            PThread.exitHandlers = null
        }
        if (ENVIRONMENT_IS_PTHREAD && threadInfoStruct) ___pthread_tsd_run_dtors()
    },
    threadExit: function (exitCode) {
        var tb = _pthread_self();
        if (tb) {
            Atomics.store(HEAPU32, tb + 72 >> 2, 1);
            Atomics.store(HEAPU32, tb + 76 >> 2, 0);
            PThread.runExitHandlers();
            Atomics.store(HEAPU32, tb + 4 >> 2, exitCode);
            Atomics.store(HEAPU32, tb + 0 >> 2, 1);
            _emscripten_futex_wake(tb + 0, 2147483647);
            __register_pthread_ptr(0, 0, 0);
            threadInfoStruct = 0;
            if (ENVIRONMENT_IS_PTHREAD) {
                postMessage({
                    "cmd": "exit"
                })
            }
        }
    },
    threadCancel: function () {
        Atomics.store(HEAPU32, threadInfoStruct + 72 >> 2, 1);
        Atomics.store(HEAPU32, threadInfoStruct + 76 >> 2, 0);
        PThread.runExitHandlers();
        Atomics.store(HEAPU32, threadInfoStruct + 4 >> 2, -1);
        Atomics.store(HEAPU32, threadInfoStruct + 0 >> 2, 1);
        _emscripten_futex_wake(threadInfoStruct + 0, 2147483647);
        threadInfoStruct = selfThreadId = 0;
        __register_pthread_ptr(0, 0, 0);
        postMessage({
            "cmd": "cancelDone"
        })
    },
    terminateAllThreads: function () {
        for (var t in PThread.pthreads) {
            var pthread = PThread.pthreads[t];
            if (pthread && pthread.worker) {
                PThread.returnWorkerToPool(pthread.worker)
            }
        }
        PThread.pthreads = {};
        for (var i = 0; i < PThread.preallocatedWorkers.length; ++i) {
            var worker = PThread.preallocatedWorkers[i];
            worker.terminate()
        }
        PThread.preallocatedWorkers = [];
        for (var i = 0; i < PThread.unusedWorkers.length; ++i) {
            var worker = PThread.unusedWorkers[i];
            worker.terminate()
        }
        PThread.unusedWorkers = [];
        for (var i = 0; i < PThread.runningWorkers.length; ++i) {
            var worker = PThread.runningWorkers[i];
            var pthread = worker.pthread;
            PThread.freeThreadData(pthread);
            worker.terminate()
        }
        PThread.runningWorkers = []
    },
    freeThreadData: function (pthread) {
        if (!pthread) return;
        if (pthread.threadInfoStruct) {
            var tlsMemory = HEAP32[pthread.threadInfoStruct + 116 >> 2];
            HEAP32[pthread.threadInfoStruct + 116 >> 2] = 0;
            _free(tlsMemory);
            _free(pthread.threadInfoStruct)
        }
        pthread.threadInfoStruct = 0;
        if (pthread.allocatedOwnStack && pthread.stackBase) _free(pthread.stackBase);
        pthread.stackBase = 0;
        if (pthread.worker) pthread.worker.pthread = null
    },
    returnWorkerToPool: function (worker) {
        delete PThread.pthreads[worker.pthread.thread];
        PThread.unusedWorkers.push(worker);
        PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
        PThread.freeThreadData(worker.pthread);
        worker.pthread = undefined
    },
    receiveObjectTransfer: function (data) {},
    allocateUnusedWorkers: function (numWorkers, onFinishedLoading) {
        if (typeof SharedArrayBuffer === "undefined") return;
        var workers = [];
        var numWorkersToCreate = numWorkers;
        if (PThread.preallocatedWorkers.length > 0) {
            var workersUsed = Math.min(PThread.preallocatedWorkers.length, numWorkers);
            workers = workers.concat(PThread.preallocatedWorkers.splice(0, workersUsed));
            numWorkersToCreate -= workersUsed
        }
        if (numWorkersToCreate > 0) {
            workers = workers.concat(PThread.createNewWorkers(numWorkersToCreate))
        }
        PThread.attachListenerToWorkers(workers, onFinishedLoading);
        for (var i = 0; i < numWorkers; ++i) {
            var worker = workers[i];
            var tempDoublePtr = getMemory(8);
            worker.postMessage({
                "cmd": "load",
                "urlOrBlob": Module["mainScriptUrlOrBlob"] || _scriptDir,
                "wasmMemory": wasmMemory,
                "wasmModule": wasmModule,
                "tempDoublePtr": tempDoublePtr,
                "DYNAMIC_BASE": DYNAMIC_BASE,
                "DYNAMICTOP_PTR": DYNAMICTOP_PTR
            });
            PThread.unusedWorkers.push(worker)
        }
    },
    attachListenerToWorkers: function (workers, onFinishedLoading) {
        var numWorkersLoaded = 0;
        var numWorkers = workers.length;
        for (var i = 0; i < numWorkers; ++i) {
            var worker = workers[i];
            (function (worker) {
                worker.onmessage = function (e) {
                    var d = e["data"];
                    var cmd = d["cmd"];
                    if (worker.pthread) PThread.currentProxiedOperationCallerThread = worker.pthread.threadInfoStruct;
                    if (d["targetThread"] && d["targetThread"] != _pthread_self()) {
                        var thread = PThread.pthreads[d.targetThread];
                        if (thread) {
                            thread.worker.postMessage(e.data, d["transferList"])
                        } else {
                            console.error('Internal error! Worker sent a message "' + cmd + '" to target pthread ' + d["targetThread"] + ", but that thread no longer exists!")
                        }
                        PThread.currentProxiedOperationCallerThread = undefined;
                        return
                    }
                    if (cmd === "processQueuedMainThreadWork") {
                        _emscripten_main_thread_process_queued_calls()
                    } else if (cmd === "spawnThread") {
                        __spawn_thread(e.data)
                    } else if (cmd === "cleanupThread") {
                        __cleanup_thread(d["thread"])
                    } else if (cmd === "killThread") {
                        __kill_thread(d["thread"])
                    } else if (cmd === "cancelThread") {
                        __cancel_thread(d["thread"])
                    } else if (cmd === "loaded") {
                        worker.loaded = true;
                        if (worker.runPthread) {
                            worker.runPthread();
                            delete worker.runPthread
                        }++numWorkersLoaded;
                        if (numWorkersLoaded === numWorkers && onFinishedLoading) {
                            onFinishedLoading()
                        }
                    } else if (cmd === "print") {
                        out("Thread " + d["threadId"] + ": " + d["text"])
                    } else if (cmd === "printErr") {
                        err("Thread " + d["threadId"] + ": " + d["text"])
                    } else if (cmd === "alert") {
                        alert("Thread " + d["threadId"] + ": " + d["text"])
                    } else if (cmd === "exit") {
                        var detached = worker.pthread && Atomics.load(HEAPU32, worker.pthread.thread + 80 >> 2);
                        if (detached) {
                            PThread.returnWorkerToPool(worker)
                        }
                    } else if (cmd === "exitProcess") {
                        noExitRuntime = false;
                        try {
                            exit(d["returnCode"])
                        } catch (e) {
                            if (e instanceof ExitStatus) return;
                            throw e
                        }
                    } else if (cmd === "cancelDone") {
                        PThread.returnWorkerToPool(worker)
                    } else if (cmd === "objectTransfer") {
                        PThread.receiveObjectTransfer(e.data)
                    } else if (e.data.target === "setimmediate") {
                        worker.postMessage(e.data)
                    } else {
                        err("worker sent an unknown command " + cmd)
                    }
                    PThread.currentProxiedOperationCallerThread = undefined
                };
                worker.onerror = function (e) {
                    err("pthread sent an error! " + e.filename + ":" + e.lineno + ": " + e.message)
                };
                if (ENVIRONMENT_HAS_NODE) {
                    worker.on("message", function (data) {
                        worker.onmessage({
                            data: data
                        })
                    });
                    worker.on("error", function (data) {
                        worker.onerror(data)
                    });
                    worker.on("exit", function (data) {
                        console.log("worker exited - TODO: update the worker queue?")
                    })
                }
            })(worker)
        }
    },
    createNewWorkers: function (numWorkers) {
        if (typeof SharedArrayBuffer === "undefined") return [];
        var pthreadMainJs = "moonlight-wasm.worker.js";
        pthreadMainJs = locateFile(pthreadMainJs);
        var newWorkers = [];
        for (var i = 0; i < numWorkers; ++i) {
            newWorkers.push(new Worker(pthreadMainJs))
        }
        return newWorkers
    },
    getNewWorker: function () {
        if (PThread.unusedWorkers.length == 0) PThread.allocateUnusedWorkers(1);
        if (PThread.unusedWorkers.length > 0) return PThread.unusedWorkers.pop();
        else return null
    },
    busySpinWait: function (msecs) {
        var t = performance.now() + msecs;
        while (performance.now() < t) {}
    }
};

function establishStackSpaceInJsModule(stackTop, stackMax) {
    STACK_BASE = STACKTOP = stackTop;
    STACK_MAX = stackMax;
    establishStackSpace(stackTop, stackMax)
}
Module["establishStackSpaceInJsModule"] = establishStackSpaceInJsModule;

function jsStackTrace() {
    var err = new Error;
    if (!err.stack) {
        try {
            throw new Error(0)
        } catch (e) {
            err = e
        }
        if (!err.stack) {
            return "(no stack trace available)"
        }
    }
    return err.stack.toString()
}

function stackTrace() {
    var js = jsStackTrace();
    if (Module["extraStackTrace"]) js += "\n" + Module["extraStackTrace"]();
    return demangleAll(js)
}
var CStructsOffsets = {
    ElementaryMediaStreamTrackConfig: {
        mimeType: 0,
        extradataSize: 4,
        extradata: 8,
        decodingMode: 12
    },
    ElementaryVideoStreamTrackConfig: {
        width: 16,
        height: 20,
        framerateNum: 24,
        framerateDen: 28
    },
    ElementaryAudioStreamTrackConfig: {
        sampleFormat: 16,
        channelLayout: 20,
        samplesPerSecond: 24
    },
    ElementaryMediaPacket: {
        pts: 0,
        dts: 8,
        duration: 16,
        isKeyFrame: 24,
        dataSize: 28,
        data: 32,
        width: 36,
        height: 40,
        framerateNum: 44,
        framerateDen: 48,
        sessionId: 52,
        subsamplesSize: 56,
        subsamples: 60,
        keyIdSize: 64,
        keyId: 68,
        initializationVectorSize: 72,
        initializationVector: 76,
        encryptionMode: 80
    },
    MediaKeyConfig: {
        cdm: 0,
        encryptionMode: 4,
        licenseServer: 8,
        initDataSize: 12,
        initData: 16,
        audioMimeType: 20,
        audioRobustness: 24,
        videoMimeType: 28,
        videoRobustness: 32
    }
};
var EmssCommon = {
    init: function () {
        const IGNORE_SESSION_ID = -1;
        const IGNORE_DECODING_MODE = -1;
        const INVALID_ACTIVE_DECODING_MODE = -1;
        const CONFIG_SUPPORTED_KEYWORD = "ConfigSupported";
        const Mode = Object.freeze({
            NORMAL: 0,
            LOW_LATENCY: 1,
            VIDEO_TEXTURE: 2
        });
        const LatencyMode = Object.freeze({
            NORMAL: 0,
            LOW_LATENCY: 1,
            ULTRA_LOW_LATENCY: 2
        });
        const RenderingMode = Object.freeze({
            MEDIA_ELEMENT: 0,
            VIDEO_TEXTURE: 1
        });
        const MediaPipelineError = Object.freeze({
            CONFIG_ERROR: 0,
            DRM_ERROR: 1,
            GENERAL_ERROR: 2,
            OUT_OF_MEMORY: 3,
            UNKNOWN_ERROR: 4
        });
        const Result = Object.freeze({
            SUCCESS: 0,
            WRONG_HANDLE: 1,
            INVALID_ARGUMENT: 2,
            INVALID_STATE: 3,
            LISTENER_ALREADY_SET: 4,
            NO_SUCH_LISTENER: 5,
            NOT_ALLOWED: 6,
            NOT_SUPPORTED: 7,
            ALREADY_DESTROYED: 8,
            ALREADY_IN_PROGRESS: 9,
            CLOSE_IN_PROGRESS: 10,
            NOT_ALLOWED_IN_CURRENT_MODE: 11,
            NO_TRACKS_ATTACHED: 12,
            OPEN_IN_PROGRESS: 13,
            PLAYBACK_STATE_CHANGE_IN_PROGRESS: 14,
            SOURCE_MUST_BE_CLOSED: 15,
            SOURCE_NOT_ATTACHED: 16,
            TIMESTAMPS_EXCEED_DURATION: 17,
            TRACK_LIMIT_REACHED: 18,
            UNRELATED_OBJECT: 19,
            ABORTED: 20,
            FAILED: 21,
            INVALID_CHANNEL_LAYOUT: 22,
            INVALID_CODEC: 23,
            INVALID_FRAMERATE: 24,
            INVALID_RESOLUTION: 25,
            INVALID_MIME_TYPE: 26,
            INVALID_SAMPLE_FORMAT: 27,
            INVALID_CONFIG: 28,
            BUFFER_FULL: 29,
            EXPECTS_KEYFRAME: 30,
            APPEND_IGNORED: 31,
            NO_DURATION: 32,
            INVALID_DTS: 33,
            INVALID_PTS: 34,
            INVALID_TRACK_STATE: 35,
            INVALID_VIDEO_PARAMETERS: 36,
            NO_PACKET_DATA: 37,
            RESOURCE_ALLOCATION: 38,
            DECRYPTION_ERROR: 39,
            DECRYPTOR_NEEDS_MORE_DATA: 40,
            NO_DECRYPTION_KEY: 41,
            INVALID_INITIALIZATION_VECTOR: 42,
            INVALID_KEY_ID: 43,
            INVALID_MEDIA_KEY_SESSION: 44,
            INVALID_SUBSAMPLE_DESCRIPTION: 45,
            UNKNOWN_DECRYPTION_MODE: 46,
            INVALID_CONFIGURATION: 47,
            SESSION_NOT_UPDATED: 48,
            INVALID_TRACK_TYPE: 49,
            INVALID_VIDEO_TEXTURE: 50,
            WEBGL_CONTEXT_NOT_REGISTERED: 51,
            NOT_IN_VIDEO_TEXTURE_MODE: 52
        });
        const EXCEPTION_TO_RESULT = new Map([
            ["InvalidArgumentError", Result.INVALID_ARGUMENT],
            ["InvalidStateError", Result.INVALID_STATE],
            ["NotAllowedError", Result.NOT_ALLOWED],
            ["NotSupportedError", Result.NOT_SUPPORTED],
            ["AlreadyDestroyedError", Result.ALREADY_DESTROYED],
            ["AlreadyInProgressError", Result.ALREADY_IN_PROGRESS],
            ["CloseInProgressError", Result.CLOSE_IN_PROGRESS],
            ["NotAllowedInCurrentModeError", Result.NOT_ALLOWED_IN_CURRENT_MODE],
            ["NoTracksAttachedError", Result.NO_TRACKS_ATTACHED],
            ["OpenInProgressError", Result.OPEN_IN_PROGRESS],
            ["PlaybackStateChangeInProgressError", Result.PLAYBACK_STATE_CHANGE_IN_PROGRESS],
            ["SourceMustBeClosedError", Result.SOURCE_MUST_BE_CLOSED],
            ["SourceNotAttachedError", Result.SOURCE_NOT_ATTACHED],
            ["TimestampsExceedDurationError", Result.TIMESTAMPS_EXCEED_DURATION],
            ["TrackLimitReachedError", Result.TRACK_LIMIT_REACHED],
            ["UnrelatedObjectError", Result.UNRELATED_OBJECT],
            ["AbortError", Result.ABORTED],
            ["UnknownError", Result.FAILED],
            ["ConfigInvalidChannelLayoutError", Result.INVALID_CHANNEL_LAYOUT],
            ["ConfigInvalidCodecError", Result.INVALID_CODEC],
            ["ConfigInvalidFramerateError", Result.INVALID_FRAMERATE],
            ["ConfigInvalidResolutionError", Result.INVALID_RESOLUTION],
            ["ConfigInvalidMimeTypeError", Result.INVALID_MIME_TYPE],
            ["ConfigInvalidSampleFormatError", Result.INVALID_SAMPLE_FORMAT],
            ["ConfigInvalidError", Result.INVALID_CONFIG],
            ["AppendBufferFullError", Result.BUFFER_FULL],
            ["AppendExpectsKeyframeError", Result.EXPECTS_KEYFRAME],
            ["AppendIgnoredError", Result.APPEND_IGNORED],
            ["AppendNoDurationError", Result.NO_DURATION],
            ["AppendInvalidDtsError", Result.INVALID_DTS],
            ["AppendInvalidPtsError", Result.INVALID_PTS],
            ["AppendInvalidTrackStateError", Result.INVALID_TRACK_STATE],
            ["AppendInvalidVideoParametersError", Result.INVALID_VIDEO_PARAMETERS],
            ["AppendNoPacketDataError", Result.NO_PACKET_DATA],
            ["AppendResourceAllocationError", Result.RESOURCE_ALLOCATION],
            ["AppendDecryptionError", Result.DECRYPTION_ERROR],
            ["AppendDecryptorNeedsMoreDataError", Result.DECRYPTOR_NEEDS_MORE_DATA],
            ["AppendNoDecryptionKeyError", Result.NO_DECRYPTION_KEY],
            ["AppendInvalidInitializationVectorError", Result.INVALID_INITIALIZATION_VECTOR],
            ["AppendInvalidKeyIdError", Result.INVALID_KEY_ID],
            ["AppendInvalidMediaKeySessionError", Result.INVALID_MEDIA_KEY_SESSION],
            ["AppendInvalidSubsampleDescriptionError", Result.INVALID_SUBSAMPLE_DESCRIPTION],
            ["AppendUnknownDecryptionModeError", Result.UNKNOWN_DECRYPTION_MODE],
            ["VideoDecoderInvalidTrackTypeError", Result.INVALID_TRACK_TYPE],
            ["VideoDecoderInvalidVideoTextureError", Result.INVALID_VIDEO_TEXTURE],
            ["VideoDecoderWebGlContextNotRegisteredError", Result.WEBGL_CONTEXT_NOT_REGISTERED],
            ["VideoDecoderNotInVideoTextureModeError", Result.NOT_IN_VIDEO_TEXTURE_MODE]
        ]);
        const ERROR_TO_RESULT = new Map([
            ["Adding new tracks is allowed only in 'closed' state", Result.SOURCE_MUST_BE_CLOSED],
            ["Cannot remove provided track: provided track was not created " + "by this Elementary Media Stream Source instance.", Result.UNRELATED_OBJECT],
            ["Cannot set duration of a detached ElementaryMediaStreamSource.", Result.SOURCE_NOT_ATTACHED],
            ["Duration cannot be set in Low Latency mode.", Result.NOT_ALLOWED_IN_CURRENT_MODE],
            ["ElementaryMediaStreamSource is not attached to HTMLMediaElement.", Result.SOURCE_NOT_ATTACHED],
            ["Exceeded maximum number of supported audio tracks (1)", Result.TRACK_LIMIT_REACHED],
            ["Exceeded maximum number of supported video tracks (1)", Result.TRACK_LIMIT_REACHED],
            ["Not attached to HTMLMediaElement.", Result.SOURCE_NOT_ATTACHED],
            ["Removing tracks is allowed only in 'closed' state", Result.SOURCE_MUST_BE_CLOSED],
            ["Setting duration below highest presentation timestamp of any buffered " + "coded frames is disallowed. Instead, first call 'flush'", Result.TIMESTAMPS_EXCEED_DURATION],
            ["Cannot call while ElementaryMediaStreamSource.open() " + "is in progress.", Result.OPEN_IN_PROGRESS],
            ["Cannot call while ElementaryMediaStreamSource.close() " + "is in progress.", Result.CLOSE_IN_PROGRESS],
            ["Cannot invoke operation in the current readyState.", Result.INVALID_STATE],
            ["ElementaryMediaStreamSource is not attached to HTMLMediaElement.", Result.SOURCE_NOT_ATTACHED],
            ["Cannot open ElementaryMediaStreamSource with no tracks attached.", Result.NO_TRACKS_ATTACHED],
            ["Cannot open ElementaryMediaStreamSource.with no tracks attached.", Result.NO_TRACKS_ATTACHED],
            ["Player was already destroyed.", Result.ALREADY_DESTROYED],
            ["Unknown error", Result.FAILED],
            ["Invalid channel layout", Result.INVALID_CHANNEL_LAYOUT],
            ["Invalid codec", Result.INVALID_CODEC],
            ["Invalid framerate", Result.INVALID_FRAMERATE],
            ["Invalid resolution", Result.INVALID_RESOLUTION],
            ["No framerate in video config", Result.INVALID_FRAMERATE],
            ["No mimetype in config", Result.INVALID_MIME_TYPE],
            ["No resolution in video config", Result.INVALID_RESOLUTION],
            ["Unknown audio codec", Result.INVALID_CODEC],
            ["Unknown sample format", Result.INVALID_SAMPLE_FORMAT],
            ["Invalid video codec", Result.INVALID_CODEC],
            ["Append failed: aborted", Result.ABORTED],
            ["Append failed: cannot allocate internal resource", Result.RESOURCE_ALLOCATION],
            ["Append failed: buffer full", Result.BUFFER_FULL],
            ["Append failed: decryption error", Result.DECRYPTION_ERROR],
            ["Append failed: more data needed", Result.DECRYPTOR_NEEDS_MORE_DATA],
            ["Append failed: invalid track state", Result.INVALID_TRACK_STATE],
            ["Append failed: keyframe required", Result.EXPECTS_KEYFRAME],
            ["Append failed: no decryption key", Result.NO_DECRYPTION_KEY],
            ["Append failed: no media key session", Result.INVALID_MEDIA_KEY_SESSION],
            ["Append failed: unknown encryption", Result.UNKNOWN_DECRYPTION_MODE],
            ["Append failed: given set of video codec parameters (resolution " + "and FPS) is unsupported", Result.INVALID_VIDEO_PARAMETERS],
            ["Append failed: no framerate", Result.INVALID_FRAMERATE],
            ["Append failed: no resolution", Result.INVALID_RESOLUTION],
            ["Append failed: wrong session_id", Result.APPEND_IGNORED],
            ["Append failed: unknown error", Result.FAILED],
            ["Append packet failed: missing pts", Result.INVALID_PTS],
            ["Append packet failed: missing dts", Result.INVALID_DTS],
            ["Append packet failed: negative pts", Result.INVALID_PTS],
            ["Append packet failed: negative dts", Result.INVALID_DTS],
            ["Append packet failed: missing duration", Result.NO_DURATION],
            ["Append packet failed: if resolution is specified, both width " + "and height must be provided", Result.INVALID_RESOLUTION],
            ["Append packet failed: if framerate is specified, both " + "framerateNum and framerateDen must be provided", Result.INVALID_FRAMERATE],
            ["Encrypted content in Video Texture mode is not supported.", Result.NOT_ALLOWED_IN_CURRENT_MODE],
            ["Append packet failed: encrypted packet has no encrypted " + "subsample description", Result.INVALID_SUBSAMPLE_DESCRIPTION],
            ["Append packet failed: each subsample must contain both " + "clearBytes and encryptedBytes fields", Result.INVALID_SUBSAMPLE_DESCRIPTION],
            ["Append packet failed: missing keyId", Result.INVALID_KEY_ID],
            ["Append packet failed: bad keyId", Result.INVALID_KEY_ID],
            ["Append packet failed: missing initializationVector", Result.INVALID_INITIALIZATION_VECTOR],
            ["Append packet failed: bad initializationVector", Result.INVALID_INITIALIZATION_VECTOR],
            ["Append packet failed: missing encryptionMode", Result.UNKNOWN_DECRYPTION_MODE],
            ["Packet has no data.", Result.NO_PACKET_DATA],
            ["Only one append is allowed at a time!", Result.ALREADY_IN_PROGRESS],
            ["Calling blocking append packet on main js thread is not allowed", Result.NOT_ALLOWED],
            ["getPicture is already in progress", Result.ALREADY_IN_PROGRESS],
            ["This functionality is available only for video tracks.", Result.INVALID_TRACK_TYPE],
            ["This functionality is available only for VideoTexture mode.", Result.NOT_IN_VIDEO_TEXTURE_MODE],
            ["Invalid video texture provided.", Result.INVALID_VIDEO_TEXTURE],
            ["Provided texture was not returned by getPicture method", Result.INVALID_VIDEO_TEXTURE],
            ["Calling blocking get picture on main js thread is not allowed", Result.NOT_ALLOWED],
            ["WebGL rendering context not registered.", Result.WEBGL_CONTEXT_NOT_REGISTERED],
            ["NotAllowedError", Result.NOT_ALLOWED],
            ["NotSupportedError", Result.NOT_SUPPORTED],
            ["UnknownError", Result.FAILED]
        ]);
        const STR_TO_MEDIA_PIPELINE_ERROR = new Map([
            ["config-error", MediaPipelineError.CONFIG_ERROR],
            ["drm-error", MediaPipelineError.DRM_ERROR],
            ["out-of-memory", MediaPipelineError.OUT_OF_MEMORY],
            ["pipeline-error", MediaPipelineError.GENERAL_ERROR],
            ["unknown-error", MediaPipelineError.UNKNOWN_ERROR]
        ]);
        GENERIC_MEDIA_PIPELINE_ERROR_DESCRIPTIONS = new Map([
            [MediaPipelineError.CONFIG_ERROR, "A general configuration error has occurred."],
            [MediaPipelineError.DRM_ERROR, "A general DRM error has occurred."],
            [MediaPipelineError.OUT_OF_MEMORY, "Memory allocation failed."],
            [MediaPipelineError.GENERAL_ERROR, "A general pipeline error has occurred."],
            [MediaPipelineError.UNKNOWN_ERROR, "An unknown error has occurred."]
        ]);
        const STR_TO_MODE = new Map([
            ["normal", Mode.NORMAL],
            ["low-latency", Mode.LOW_LATENCY],
            ["video-texture", Mode.VIDEO_TEXTURE]
        ]);
        const MODE_TO_STR = Array.from(STR_TO_MODE.keys());
        const STR_TO_LATENCY_MODE = new Map([
            ["latency-mode-normal", LatencyMode.NORMAL],
            ["latency-mode-low", LatencyMode.LOW_LATENCY],
            ["latency-mode-ultra-low", LatencyMode.ULTRA_LOW_LATENCY]
        ]);
        const LATENCY_MODE_TO_STR = Array.from(STR_TO_LATENCY_MODE.keys());
        const STR_TO_RENDERING_MODE = new Map([
            ["rendering-mode-media-element", RenderingMode.MEDIA_ELEMENT],
            ["rendering-mode-video-texture", RenderingMode.VIDEO_TEXTURE]
        ]);
        const RENDERING_MODE_TO_STR = Array.from(STR_TO_RENDERING_MODE.keys());
        const DECODING_MODE_TO_STRING = ["hardware", "hardware-with-fallback", "software"];
        const ActiveDecodingMode = Object.freeze({
            HARDWARE: 0,
            SOFTWARE: 1
        });
        const STRING_TO_ACTIVE_DECODING_MODE = new Map([
            ["hardware", ActiveDecodingMode.HARDWARE],
            ["software", ActiveDecodingMode.SOFTWARE]
        ]);
        const CHANNEL_LAYOUT_TO_STRING = ["ChannelLayoutNone", "ChannelLayoutUnsupported", "ChannelLayoutMono", "ChannelLayoutStereo", "ChannelLayout2Point1", "ChannelLayout2_1", "ChannelLayout2_2", "ChannelLayout3_1", "ChannelLayout4_0", "ChannelLayout4_1", "ChannelLayout4_1QuadSide", "ChannelLayout5_0", "ChannelLayout5_0Back", "ChannelLayout5_1", "ChannelLayout5_1Back", "ChannelLayout6_0", "ChannelLayout6_0Front", "ChannelLayout6_1", "ChannelLayout6_1Back", "ChannelLayout6_1Front", "ChannelLayout7_0", "ChannelLayout7_0Front", "ChannelLayout7_1", "ChannelLayout7_1Wide", "ChannelLayout7_1WideBack", "ChannelLayoutDiscrete", "ChannelLayoutHexagonal", "ChannelLayoutOctagonal", "ChannelLayoutQuad", "ChannelLayoutStereoDownmix", "ChannelLayoutSurround", "ChannelLayoutStereoAndKeyboardMic"];
        const SAMPLE_FORMAT_TO_STRING = ["SampleFormatUnknown", "SampleFormatU8", "SampleFormatS16", "SampleFormatS32", "SampleFormatF32", "SampleFormatPlanarS16", "SampleFormatPlanarF32", "SampleFormatPlanarS32", "SampleFormatS24", "SampleFormatAc3", "SampleFormatEac3"];
        EmssCommon = {
            CONFIG_SUPPORTED_KEYWORD: CONFIG_SUPPORTED_KEYWORD,
            MediaPipelineError: MediaPipelineError,
            Result: Result,
            LatencyMode: LatencyMode,
            _callFunction: function (handleMap, handle, name, ...args) {
                const obj = handleMap[handle];
                if (!obj) {
                    return Result.WRONG_HANDLE
                }
                try {
                    obj[name](...args)
                } catch (err) {
                    return EmssCommon._exceptionToErrorCode(err)
                }
                return Result.SUCCESS
            },
            _callAsyncFunction: function (handleMap, handle, getOperationResult, onFinishedCallback, userData, name, ...args) {
                const obj = handleMap[handle];
                if (!obj) {
                    return Result.WRONG_HANDLE
                }
                try {
                    obj[name](...args).then(() => {
                        dynCall_vii(onFinishedCallback, getOperationResult(null), userData)
                    }).catch(err => {
                        dynCall_vii(onFinishedCallback, getOperationResult(err), userData)
                    })
                } catch (err) {
                    return EmssCommon._exceptionToErrorCode(err)
                }
                return Result.SUCCESS
            },
            _getProperty: function (handleMap, handle, property, retPtr, type) {
                const obj = handleMap[handle];
                if (!obj) {
                    return Result.WRONG_HANDLE
                }
                try {
                    setValue(retPtr, obj[property], type)
                } catch (err) {
                    return EmssCommon._exceptionToErrorCode(err)
                }
                return Result.SUCCESS
            },
            _getPropertyWithConversion: function (handleMap, handle, property, conversionFunction, retPtr, type) {
                const obj = handleMap[handle];
                if (!obj) {
                    return Result.WRONG_HANDLE
                }
                try {
                    const [result, converted] = conversionFunction(obj[property]);
                    if (result != Result.SUCCESS) {
                        return result
                    }
                    setValue(retPtr, converted, type)
                } catch (err) {
                    return EmssCommon._exceptionToErrorCode(err)
                }
                return Result.SUCCESS
            },
            _setProperty: function (handleMap, handle, property, value) {
                const obj = handleMap[handle];
                if (!obj) {
                    return Result.WRONG_HANDLE
                }
                try {
                    obj[property] = value
                } catch (error) {
                    return EmssCommon._exceptionToErrorCode(error)
                }
                return Result.SUCCESS
            },
            _arrayFromPtr: function (object, ptrOffset, sizeOffset) {
                const ptr = HEAP32[object + ptrOffset >> 2];
                const size = HEAP32[object + sizeOffset >> 2];
                return new Uint8Array(HEAPU8.slice(ptr, ptr + size))
            },
            _extractBaseConfig: function (configPtr) {
                const config = {
                    mimeType: UTF8ToString(HEAP32[configPtr + CStructsOffsets.ElementaryMediaStreamTrackConfig.mimeType >> 2]),
                    extradata: EmssCommon._arrayFromPtr(configPtr, CStructsOffsets.ElementaryMediaStreamTrackConfig.extradata, CStructsOffsets.ElementaryMediaStreamTrackConfig.extradataSize)
                };
                const decodingMode = HEAP32[configPtr + CStructsOffsets.ElementaryMediaStreamTrackConfig.decodingMode >> 2];
                if (decodingMode !== IGNORE_DECODING_MODE) {
                    config.decodingMode = EmssCommon._decodingModeToString(decodingMode)
                }
                return config
            },
            _extendConfigTo: function (type, config, configPtr) {
                switch (type) {
                    case "audio":
                        EmssCommon._extendConfigToAudio(config, configPtr);
                        break;
                    case "video":
                        EmssCommon._extendConfigToVideo(config, configPtr);
                        break;
                    default:
                }
            },
            _cEnumToString: function (stringArray, value, defaultValueIndex = 0) {
                const ret = stringArray[value];
                if (ret == null) {
                    return stringArray[defaultValueIndex]
                }
                return ret
            },
            _exceptionNameToErrorCode: function (exceptionName) {
                if (EXCEPTION_TO_RESULT.has(exceptionName)) {
                    return EXCEPTION_TO_RESULT.get(exceptionName)
                }
                return Result.FAILED
            },
            _exceptionToErrorCode: function (error) {
                if (error == null) {
                    return Result.SUCCESS
                }
                if (tizentvwasm.isApiSupported) {
                    let errorCode = error.name;
                    if (EXCEPTION_TO_RESULT.has(errorCode)) {
                        return EXCEPTION_TO_RESULT.get(errorCode)
                    }
                }
                let errorMessage = error.message;
                const splitLine = errorMessage.search("': ");
                const errMsgLength = errorMessage.length;
                if (splitLine != -1) {
                    errorMessage = errorMessage.slice(splitLine + 3, errMsgLength)
                }
                if (ERROR_TO_RESULT.has(errorMessage)) {
                    return ERROR_TO_RESULT.get(errorMessage)
                }
                return Result.FAILED
            },
            _stringToMediaPipelineError: function (input) {
                return STR_TO_MEDIA_PIPELINE_ERROR.has(input) ? STR_TO_MEDIA_PIPELINE_ERROR.get(input) : MediaPipelineError.UNKNOWN_ERROR
            },
            _getGenericMediaPipelineErrorDescription: function (input) {
                return GENERIC_MEDIA_PIPELINE_ERROR_DESCRIPTIONS.has(input) ? GENERIC_MEDIA_PIPELINE_ERROR_DESCRIPTIONS.get(input) : GENERIC_MEDIA_PIPELINE_ERROR_DESCRIPTIONS.get(MediaPipelineError.UNKNOWN_ERROR)
            },
            _stringToMode: function (input) {
                return STR_TO_MODE.has(input) ? STR_TO_MODE.get(input) : -1
            },
            _modesToLegacyMode: function (latencyMode, renderingMode, allowVideoTexture) {
                const legacyMode = (() => {
                    if (allowVideoTexture && renderingMode == RenderingMode.VIDEO_TEXTURE) {
                        return Mode.VIDEO_TEXTURE
                    }
                    if (latencyMode == LatencyMode.NORMAL) {
                        return Mode.NORMAL
                    }
                    if (latencyMode == LatencyMode.LOW_LATENCY) {
                        return Mode.LOW_LATENCY
                    }
                    return -1
                })();
                if (legacyMode != -1) {
                    return EmssCommon._cEnumToString(MODE_TO_STR, legacyMode)
                } else {
                    return ""
                }
            },
            _stringToLatencyMode: function (input) {
                return STR_TO_LATENCY_MODE.has(input) ? STR_TO_LATENCY_MODE.get(input) : -1
            },
            _latencyModeToString: function (input) {
                return EmssCommon._cEnumToString(LATENCY_MODE_TO_STR, input)
            },
            _stringToRenderingMode: function (input) {
                return STR_TO_RENDERING_MODE.has(input) ? STR_TO_RENDERING_MODE.get(input) : -1
            },
            _renderingModeToString: function (input) {
                return EmssCommon._cEnumToString(RENDERING_MODE_TO_STR, input)
            },
            _decodingModeToString: function (decodingMode) {
                return EmssCommon._cEnumToString(DECODING_MODE_TO_STRING, decodingMode)
            },
            _stringToActiveDecodingMode: function (value) {
                if (!STRING_TO_ACTIVE_DECODING_MODE.has(value)) return [Result.FAILED, INVALID_ACTIVE_DECODING_MODE];
                return [Result.SUCCESS, STRING_TO_ACTIVE_DECODING_MODE.get(value)]
            },
            _sampleFormatToString: function (sampleFormat) {
                return EmssCommon._cEnumToString(SAMPLE_FORMAT_TO_STRING, sampleFormat)
            },
            _channelLayoutToString: function (channelLayout) {
                return EmssCommon._cEnumToString(CHANNEL_LAYOUT_TO_STRING, channelLayout)
            },
            _extendConfigToAudio: function (config, ptr) {
                config["sampleFormat"] = EmssCommon._sampleFormatToString(HEAP32[ptr + CStructsOffsets.ElementaryAudioStreamTrackConfig.sampleFormat >> 2]);
                config["channelLayout"] = EmssCommon._channelLayoutToString(HEAP32[ptr + CStructsOffsets.ElementaryAudioStreamTrackConfig.channelLayout >> 2]);
                config["samplesPerSecond"] = HEAP32[ptr + CStructsOffsets.ElementaryAudioStreamTrackConfig.samplesPerSecond >> 2]
            },
            _extendConfigToVideo: function (config, ptr) {
                config["width"] = HEAP32[ptr + CStructsOffsets.ElementaryVideoStreamTrackConfig.width >> 2];
                config["height"] = HEAP32[ptr + CStructsOffsets.ElementaryVideoStreamTrackConfig.height >> 2];
                config["framerateNum"] = HEAP32[ptr + CStructsOffsets.ElementaryVideoStreamTrackConfig.framerateNum >> 2];
                config["framerateDen"] = HEAP32[ptr + CStructsOffsets.ElementaryVideoStreamTrackConfig.framerateDen >> 2]
            },
            _makePacketFromPtr: function (ptr) {
                const config = {
                    pts: HEAPF64[ptr + CStructsOffsets.ElementaryMediaPacket.pts >> 3],
                    dts: HEAPF64[ptr + CStructsOffsets.ElementaryMediaPacket.dts >> 3],
                    duration: HEAPF64[ptr + CStructsOffsets.ElementaryMediaPacket.duration >> 3],
                    isKeyFrame: HEAP8[ptr + CStructsOffsets.ElementaryMediaPacket.isKeyFrame >> 0],
                    isEncrypted: HEAP8[ptr + CStructsOffsets.ElementaryMediaPacket.isEncrypted >> 0]
                };
                const sessionId = HEAP32[ptr + CStructsOffsets.ElementaryMediaPacket.sessionId >> 2];
                if (sessionId !== IGNORE_SESSION_ID) {
                    config.sessionId = sessionId
                }
                const framerateDen = HEAP32[ptr + CStructsOffsets.ElementaryMediaPacket.framerateDen >> 2];
                const framerateNum = HEAP32[ptr + CStructsOffsets.ElementaryMediaPacket.framerateNum >> 2];
                if (framerateDen !== 0) {
                    config.framerateDen = framerateDen
                }
                if (framerateNum !== 0) {
                    config.framerateNum = framerateNum
                }
                const height = HEAP32[ptr + CStructsOffsets.ElementaryMediaPacket.height >> 2];
                const width = HEAP32[ptr + CStructsOffsets.ElementaryMediaPacket.width >> 2];
                if (height !== 0) {
                    config.height = height
                }
                if (width !== 0) {
                    config.width = width
                }
                config.isEncrypted = false;
                return config
            },
            _extendPacketToEncrypted: function (packet, ptr) {
                const pad = (array, goalLength = 16) => {
                    if (array.length >= goalLength) {
                        return array
                    }
                    const padding = new Array(goalLength - array.length).fill(0);
                    return new Uint8Array([...array, ...padding])
                };
                packet.isEncrypted = true;
                packet.keyId = pad(EmssCommon._arrayFromPtr(ptr, CStructsOffsets.ElementaryMediaPacket.keyId, CStructsOffsets.ElementaryMediaPacket.keyIdSize));
                packet.initializationVector = pad(EmssCommon._arrayFromPtr(ptr, CStructsOffsets.ElementaryMediaPacket.initializationVector, CStructsOffsets.ElementaryMediaPacket.initializationVectorSize));
                packet.encryptionMode = EmssMediaKey._encryptionModeToString(HEAP32[ptr + CStructsOffsets.ElementaryMediaPacket.encryptionMode >> 2]);
                packet.subsamples = EmssMediaKey._getSubsamples(ptr)
            },
            _makePacketDataFromPtr: function (ptr) {
                const dataPtr = HEAP32[ptr + CStructsOffsets.ElementaryMediaPacket.data >> 2];
                const dataSize = HEAP32[ptr + CStructsOffsets.ElementaryMediaPacket.dataSize >> 2];
                return new Uint8Array(HEAPU8.buffer, dataPtr, dataSize)
            },
            _setListener: function (namespace, handle, eventName, eventHandler) {
                const obj = namespace.handleMap[handle];
                if (!obj) {
                    return Result.WRONG_HANDLE
                }
                if (eventName in namespace.listenerMap[handle]) {
                    return Result.LISTENER_ALREADY_SET
                }
                namespace.listenerMap[handle][eventName] = eventHandler;
                obj.addEventListener(eventName, eventHandler);
                return Result.SUCCESS
            },
            _clearListeners: function (namespace, handle) {
                const obj = namespace.handleMap[handle];
                if (!obj) {
                    return Result.WRONG_HANDLE
                }
                const listeners = namespace.listenerMap[handle];
                Object.entries(listeners).forEach(eventArr => {
                    obj.removeEventListener(eventArr[0], eventArr[1])
                });
                namespace.listenerMap[handle] = {};
                return Result.SUCCESS
            }
        }
    }
};
var WasmElementaryMediaStreamSource = {
    init: function () {
        const ReadyState = Object.freeze({
            DETACHED: 0,
            CLOSED: 1,
            OPEN_PENDING: 2,
            OPEN: 3,
            ENDED: 4
        });
        const STR_TO_READY_STATE = new Map([
            ["detached", ReadyState.DETACHED],
            ["closed", ReadyState.CLOSED],
            ["open-pending", ReadyState.OPEN_PENDING],
            ["open", ReadyState.OPEN],
            ["ended", ReadyState.ENDED]
        ]);
        WasmElementaryMediaStreamSource = {
            handleMap: [],
            listenerMap: {},
            _callFunction: function (handle, name, ...args) {
                return EmssCommon._callFunction(WasmElementaryMediaStreamSource.handleMap, handle, name, ...args)
            },
            _callAsyncFunction: function (handle, onFinishedCallback, userData, name, ...args) {
                return EmssCommon._callAsyncFunction(WasmElementaryMediaStreamSource.handleMap, handle, EmssCommon._exceptionToErrorCode, onFinishedCallback, userData, name, ...args)
            },
            _getProperty: function (handle, property, retPtr, type) {
                return EmssCommon._getProperty(WasmElementaryMediaStreamSource.handleMap, handle, property, retPtr, type)
            },
            _setProperty: function (handle, property, value) {
                return EmssCommon._setProperty(WasmElementaryMediaStreamSource.handleMap, handle, property, value)
            },
            _addTrack: function (handle, configPtr, retPtr, type) {
                const elementaryMediaStreamSource = WasmElementaryMediaStreamSource.handleMap[handle];
                if (!elementaryMediaStreamSource) {
                    return EmssCommon.Result.WRONG_HANDLE
                }
                const config = EmssCommon._extractBaseConfig(configPtr);
                EmssCommon._extendConfigTo(type, config, configPtr);
                let track = null;
                try {
                    track = WasmElementaryMediaStreamSource._getAddTrackFunction(type, elementaryMediaStreamSource)(config)
                } catch (error) {
                    return EmssCommon._exceptionToErrorCode(error)
                }
                const trackHandle = track.trackId;
                WasmElementaryMediaTrack.handleMap[trackHandle] = track;
                WasmElementaryMediaTrack.listenerMap[trackHandle] = {};
                setValue(retPtr, trackHandle, "i32");
                return EmssCommon.Result.SUCCESS
            },
            _addTrackAsync: function (handle, configPtr, onFinishedCallback, userData, type) {
                const elementaryMediaStreamSource = WasmElementaryMediaStreamSource.handleMap[handle];
                if (!elementaryMediaStreamSource) {
                    return EmssCommon.Result.WRONG_HANDLE
                }
                const config = EmssCommon._extractBaseConfig(configPtr);
                EmssCommon._extendConfigTo(type, config, configPtr);
                try {
                    WasmElementaryMediaStreamSource._getAddTrackAsyncFunction(type, elementaryMediaStreamSource)(config).then(track => {
                        const trackHandle = track.trackId;
                        WasmElementaryMediaTrack.handleMap[trackHandle] = track;
                        WasmElementaryMediaTrack.listenerMap[trackHandle] = {};
                        dynCall_viii(onFinishedCallback, EmssCommon._exceptionToErrorCode(null), trackHandle, userData)
                    }).catch(err => {
                        dynCall_viii(onFinishedCallback, EmssCommon._exceptionToErrorCode(err), 0, userData)
                    })
                } catch (error) {
                    return EmssCommon._exceptionToErrorCode(error)
                }
                return EmssCommon.Result.SUCCESS
            },
            _getAddTrackFunction: function (type, elementaryMediaStreamSource) {
                switch (type) {
                    case "video":
                        return config => elementaryMediaStreamSource.addVideoTrack(config);
                    case "audio":
                        return config => elementaryMediaStreamSource.addAudioTrack(config);
                    default:
                        return
                }
            },
            _getAddTrackAsyncFunction: function (type, elementaryMediaStreamSource) {
                switch (type) {
                    case "video":
                        return config => elementaryMediaStreamSource.addVideoTrackAsync(config);
                    case "audio":
                        return config => elementaryMediaStreamSource.addAudioTrackAsync(config);
                    default:
                        return
                }
            },
            _getPropertyString: function (handle, property, retPtr, type, transform) {
                const elementaryMediaStreamSource = WasmElementaryMediaStreamSource.handleMap[handle];
                if (!elementaryMediaStreamSource) {
                    return EmssCommon.Result.WRONG_HANDLE
                }
                const answer = transform(elementaryMediaStreamSource[property]);
                setValue(retPtr, answer, type);
                return EmssCommon.Result.SUCCESS
            },
            _stringToReadyState: function (input) {
                return STR_TO_READY_STATE.has(input) ? STR_TO_READY_STATE.get(input) : -1
            },
            _setListener: function (handle, eventName, eventHandler) {
                return EmssCommon._setListener(WasmElementaryMediaStreamSource, handle, eventName, eventHandler)
            }
        }
    }
};

function _EMSSAddAudioTrack(handle, configPtr, retPtr) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(1, 1, handle, configPtr, retPtr);
    return WasmElementaryMediaStreamSource._addTrack(handle, configPtr, retPtr, "audio")
}

function _EMSSAddVideoTrack(handle, configPtr, retPtr) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(2, 1, handle, configPtr, retPtr);
    return WasmElementaryMediaStreamSource._addTrack(handle, configPtr, retPtr, "video")
}

function _EMSSClearListeners(handle) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(3, 1, handle);
    if (!(handle in WasmElementaryMediaStreamSource.handleMap)) {
        return EmssCommon.Result.WRONG_HANDLE
    }
    return EmssCommon._clearListeners(WasmElementaryMediaStreamSource, handle)
}
var TIZENTVWASM = {
    hasTizenTVWasm: function () {
        return typeof tizentvwasm !== "undefined"
    },
    allocCStr: function (jsString) {
        const length = lengthBytesUTF8(jsString) + 1;
        const ptr = _malloc(length);
        stringToUTF8(jsString, ptr, length);
        return ptr
    },
    getLegacyWasmPlayerVersion: function () {
        if (tizentvwasm.ElementaryMediaStreamSource) {
            if (tizentvwasm.ElementaryMediaTrack.prototype.hasOwnProperty("sessionId")) {
                return {
                    name: "ElementaryMediaStreamSource",
                    version: "0.9",
                    apiLevels: [1],
                    features: ["base-emss"]
                }
            } else {
                return {
                    name: "ElementaryMediaStreamSource",
                    version: "0.1",
                    apiLevels: [0],
                    features: ["legacy-emss"]
                }
            }
        }
        return null
    },
    getLegacyWasmSocketsVersion: function () {
        return {
            name: "TizenSockets",
            version: "1.0",
            apiLevels: [1],
            features: []
        }
    },
    getLegacyApis: function () {
        const legacyApis = [TIZENTVWASM.getLegacyWasmSocketsVersion()];
        const legacyEmss = TIZENTVWASM.getLegacyWasmPlayerVersion();
        if (legacyEmss) {
            legacyApis.push(legacyEmss)
        }
        return legacyApis
    },
    getAvailableApis: function () {
        const hasAvailableApis = typeof tizentvwasm.availableApis !== "undefined";
        const hasApiFeatureSupported = typeof tizentvwasm.isApiFeatureSupported !== "undefined";
        const availableApis = hasAvailableApis ? tizentvwasm.availableApis : TIZENTVWASM.getLegacyApis();
        if (hasAvailableApis && !hasApiFeatureSupported) {
            availableApis.forEach(apiInfo => {
                if (apiInfo.name === "ElementaryMediaStreamSource") {
                    apiInfo.features = ["base-emss"];
                    if (apiInfo.apiLevels.includes(2)) {
                        apiInfo.features.push("video-texture")
                    }
                    if (apiInfo.apiLevels.includes(3)) {
                        apiInfo.features.push("software-decoding")
                    }
                    return
                }
                apiInfo.features = []
            })
        }
        return availableApis
    }
};

function _EMSSCreate(latencyMode, renderingMode) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(4, 1, latencyMode, renderingMode);
    if (!TIZENTVWASM.hasTizenTVWasm()) {
        const abortMsg = "TizenTV WASM extensions were not found on this device.";
        console.error(`${abortMsg} TizenTV WASM extensions are available ` + `on 2020 Tizen SmartTV devices or newer. Aborting...`);
        abort(abortMsg)
    }
    const emssApiInfo = TIZENTVWASM.getAvailableApis().find(apiInfo => {
        return apiInfo.name == "ElementaryMediaStreamSource"
    });
    if (!emssApiInfo) {
        console.error(`ElementaryMediaStreamSource API is ` + `not available on this device.`);
        return -1
    }
    const elementaryMediaStreamSource = (() => {
        try {
            if (latencyMode == EmssCommon.LatencyMode.ULTRA_LOW_LATENCY && !emssApiInfo.features.includes("ultra-low-latency")) {
                console.warn(`Ultra low latency mode is not available on this ` + `device. Falling back to low latency mode.`);
                latencyMode = EmssCommon.LatencyMode.LOW_LATENCY
            }
            if (emssApiInfo.features.includes("construct-with-modes")) {
                return new tizentvwasm.ElementaryMediaStreamSource(EmssCommon._latencyModeToString(latencyMode), EmssCommon._renderingModeToString(renderingMode))
            } else {
                const allowVideoTexture = emssApiInfo.features.includes("video-texture");
                const legacyMode = EmssCommon._modesToLegacyMode(latencyMode, renderingMode, allowVideoTexture);
                if (legacyMode == "") {
                    return null
                }
                return new tizentvwasm.ElementaryMediaStreamSource(legacyMode)
            }
        } catch (error) {
            console.error(`Error during creating EMSS: ${error}`);
            return null
        }
    })();
    if (elementaryMediaStreamSource == null) {
        console.error(`Arguments: (${[...arguments].join(", ")})` + ` are not applicable to EMSS constructor`);
        return -1
    }
    const handle = WasmElementaryMediaStreamSource.handleMap.length;
    WasmElementaryMediaStreamSource.handleMap[handle] = elementaryMediaStreamSource;
    WasmElementaryMediaStreamSource.listenerMap[handle] = {};
    return handle
}

function _EMSSCreateObjectURL(handle, retPtr) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(5, 1, handle, retPtr);
    const elementaryMediaStreamSource = WasmElementaryMediaStreamSource.handleMap[handle];
    if (!elementaryMediaStreamSource) {
        console.warn(`No such media element: '${handle}'`);
        setValue(retPtr, 0, "i32");
        return EmssCommon.Result.WRONG_HANDLE
    }
    const src = URL.createObjectURL(elementaryMediaStreamSource).toString();
    const length = lengthBytesUTF8(src) + 1;
    const ptr = _malloc(length);
    stringToUTF8(src, ptr, length);
    setValue(retPtr, ptr, "i32");
    return EmssCommon.Result.SUCCESS
}

function _EMSSOpen(handle, callback, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(6, 1, handle, callback, userData);
    return WasmElementaryMediaStreamSource._callAsyncFunction(handle, callback, userData, "open")
}

function _EMSSRemove(handle) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(7, 1, handle);
    if (!(handle in WasmElementaryMediaStreamSource.handleMap)) {
        return EmssCommon.Result.WRONG_HANDLE
    }
    const source = WasmElementaryMediaStreamSource.handleMap[handle];
    if (typeof source.destroy == "function") {
        source.destroy()
    }
    EmssCommon._clearListeners(WasmElementaryMediaStreamSource, handle);
    delete WasmElementaryMediaStreamSource.handleMap[handle];
    delete WasmElementaryMediaStreamSource.listenerMap[handle];
    return EmssCommon.Result.SUCCESS
}

function _EMSSRevokeObjectURL(url) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(8, 1, url);
    const urlString = UTF8ToString(url);
    URL.revokeObjectURL(urlString)
}

function _EMSSSetOnClosedCaptions(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(9, 1, handle, eventHandler, userData);
    return WasmElementaryMediaStreamSource._setListener(handle, "closedcaptions", event => {
        const captions = event.closedCaptions;
        const captionsLength = captions.byteLength;
        const captionsPtr = _malloc(captionsLength);
        const captionsArray = new Uint8Array(captions);
        try {
            writeArrayToMemory(captionsArray, captionsPtr);
            dynCall_viii(eventHandler, captionsPtr, captionsLength, userData)
        } catch (error) {} finally {
            _free(captionsPtr)
        }
    })
}

function _EMSSSetOnError(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(10, 1, handle, eventHandler, userData);
    return WasmElementaryMediaStreamSource._setListener(handle, "error", event => {
        const errorCode = EmssCommon._stringToMediaPipelineError(event.error);
        const errorMessage = event.message || EmssCommon._getGenericMediaPipelineErrorDescription(errorCode);
        const length = lengthBytesUTF8(errorMessage) + 1;
        const errorMessagePtr = _malloc(length);
        try {
            stringToUTF8(errorMessage, errorMessagePtr, length);
            dynCall_viii(eventHandler, errorCode, errorMessagePtr, userData)
        } catch (error) {} finally {
            _free(errorMessagePtr)
        }
    })
}

function _EMSSSetOnPlaybackPositionChanged(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(11, 1, handle, eventHandler, userData);
    return WasmElementaryMediaStreamSource._setListener(handle, "playbackpositionchanged", event => {
        dynCall_vfi(eventHandler, event.playbackPosition, userData)
    })
}

function _EMSSSetOnSourceClosed(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(12, 1, handle, eventHandler, userData);
    return WasmElementaryMediaStreamSource._setListener(handle, "sourceclosed", () => dynCall("vi", eventHandler, [userData]))
}

function _EMSSSetOnSourceDetached(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(13, 1, handle, eventHandler, userData);
    return WasmElementaryMediaStreamSource._setListener(handle, "sourcedetached", () => dynCall("vi", eventHandler, [userData]))
}

function _EMSSSetOnSourceEnded(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(14, 1, handle, eventHandler, userData);
    return WasmElementaryMediaStreamSource._setListener(handle, "sourceended", () => dynCall("vi", eventHandler, [userData]))
}

function _EMSSSetOnSourceOpen(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(15, 1, handle, eventHandler, userData);
    return WasmElementaryMediaStreamSource._setListener(handle, "sourceopen", event => {
        dynCall_vi(eventHandler, userData);
        const source = WasmElementaryMediaStreamSource.handleMap[handle];
        if (!source) {
            return
        }
        const openForPositionChangeEmulation = source.emssOpenForPositionChangeEmulation;
        if (openForPositionChangeEmulation) {
            openForPositionChangeEmulation(event, true)
        }
    })
}

function _EMSSSetOnSourceOpenPending(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(16, 1, handle, eventHandler, userData);
    return WasmElementaryMediaStreamSource._setListener(handle, "sourceopenpending", () => dynCall("vi", eventHandler, [userData]))
}

function _TizenTVWasm_IsApiFeatureSupported(apiNamePtr, featurePtr) {
    if (!TIZENTVWASM.hasTizenTVWasm()) {
        console.error("Not a TizenTV device?");
        return 0
    }
    const apiName = UTF8ToString(apiNamePtr);
    const feature = UTF8ToString(featurePtr);
    if (typeof tizentvwasm.isApiFeatureSupported !== "undefined") {
        return tizentvwasm.isApiFeatureSupported(apiName, feature) ? 1 : 0
    } else {
        const legacyApis = TIZENTVWASM.getAvailableApis();
        for (const api of legacyApis) {
            if (api.name == apiName && api.features.includes(feature)) {
                return 1
            }
        }
        return 0
    }
}

function _TizenTVWasm_IsApiSupported(apiNamePtr, apiLevel) {
    if (!TIZENTVWASM.hasTizenTVWasm()) {
        console.error("Not a TizenTV device?");
        return 0
    }
    const apiName = UTF8ToString(apiNamePtr);
    if (typeof tizentvwasm.isApiSupported !== "undefined") {
        return tizentvwasm.isApiSupported(apiName, apiLevel) ? 1 : 0
    } else {
        const legacyApis = TIZENTVWASM.getAvailableApis();
        for (const api of legacyApis) {
            if (api.name == apiName && api.apiLevels.includes(apiLevel)) {
                return 1
            }
        }
        return 0
    }
}

function ___assert_fail(condition, filename, line, func) {
    abort("Assertion failed: " + UTF8ToString(condition) + ", at: " + [filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function"])
}
var ENV = {};

function ___buildEnvironment(environ) {
    var MAX_ENV_VALUES = 64;
    var TOTAL_ENV_SIZE = 1024;
    var poolPtr;
    var envPtr;
    if (!___buildEnvironment.called) {
        ___buildEnvironment.called = true;
        ENV["USER"] = "web_user";
        ENV["LOGNAME"] = "web_user";
        ENV["PATH"] = "/";
        ENV["PWD"] = "/";
        ENV["HOME"] = "/home/web_user";
        ENV["LANG"] = (typeof navigator === "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
        ENV["_"] = thisProgram;
        poolPtr = getMemory(TOTAL_ENV_SIZE);
        envPtr = getMemory(MAX_ENV_VALUES * 4);
        HEAP32[envPtr >> 2] = poolPtr;
        HEAP32[environ >> 2] = envPtr
    } else {
        envPtr = HEAP32[environ >> 2];
        poolPtr = HEAP32[envPtr >> 2]
    }
    var strings = [];
    var totalSize = 0;
    for (var key in ENV) {
        if (typeof ENV[key] === "string") {
            var line = key + "=" + ENV[key];
            strings.push(line);
            totalSize += line.length
        }
    }
    if (totalSize > TOTAL_ENV_SIZE) {
        throw new Error("Environment size exceeded TOTAL_ENV_SIZE!")
    }
    var ptrSize = 4;
    for (var i = 0; i < strings.length; i++) {
        var line = strings[i];
        writeAsciiToMemory(line, poolPtr);
        HEAP32[envPtr + i * ptrSize >> 2] = poolPtr;
        poolPtr += line.length + 1
    }
    HEAP32[envPtr + strings.length * ptrSize >> 2] = 0
}

function ___call_main(argc, argv) {
    var returnCode = _main(argc, argv);
    if (!noExitRuntime) postMessage({
        "cmd": "exitProcess",
        "returnCode": returnCode
    });
    return returnCode
}

function _emscripten_get_now() {
    abort()
}

function _emscripten_get_now_is_monotonic() {
    return 0 || ENVIRONMENT_IS_NODE || typeof dateNow !== "undefined" || 1
}

function ___setErrNo(value) {
    if (Module["___errno_location"]) HEAP32[Module["___errno_location"]() >> 2] = value;
    return value
}

function _clock_gettime(clk_id, tp) {
    var now;
    if (clk_id === 0) {
        now = Date.now()
    } else if (clk_id === 1 && _emscripten_get_now_is_monotonic()) {
        now = _emscripten_get_now()
    } else {
        ___setErrNo(28);
        return -1
    }
    HEAP32[tp >> 2] = now / 1e3 | 0;
    HEAP32[tp + 4 >> 2] = now % 1e3 * 1e3 * 1e3 | 0;
    return 0
}

function ___cxa_allocate_exception(size) {
    return _malloc(size)
}
var ___exception_infos = {};
var ___exception_last = 0;

function ___cxa_throw(ptr, type, destructor) {
    ___exception_infos[ptr] = {
        ptr: ptr,
        adjusted: [ptr],
        type: type,
        destructor: destructor,
        refcount: 0,
        caught: false,
        rethrown: false
    };
    ___exception_last = ptr;
    if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exceptions = 1
    } else {
        __ZSt18uncaught_exceptionv.uncaught_exceptions++
    }
    throw ptr
}

function ___lock() {}

function ___map_file(pathname, size) {
    ___setErrNo(63);
    return -1
}
var PATH = {
    splitPath: function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1)
    },
    normalizeArray: function (parts, allowAboveRoot) {
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
            var last = parts[i];
            if (last === ".") {
                parts.splice(i, 1)
            } else if (last === "..") {
                parts.splice(i, 1);
                up++
            } else if (up) {
                parts.splice(i, 1);
                up--
            }
        }
        if (allowAboveRoot) {
            for (; up; up--) {
                parts.unshift("..")
            }
        }
        return parts
    },
    normalize: function (path) {
        var isAbsolute = path.charAt(0) === "/",
            trailingSlash = path.substr(-1) === "/";
        path = PATH.normalizeArray(path.split("/").filter(function (p) {
            return !!p
        }), !isAbsolute).join("/");
        if (!path && !isAbsolute) {
            path = "."
        }
        if (path && trailingSlash) {
            path += "/"
        }
        return (isAbsolute ? "/" : "") + path
    },
    dirname: function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
            return "."
        }
        if (dir) {
            dir = dir.substr(0, dir.length - 1)
        }
        return root + dir
    },
    basename: function (path) {
        if (path === "/") return "/";
        var lastSlash = path.lastIndexOf("/");
        if (lastSlash === -1) return path;
        return path.substr(lastSlash + 1)
    },
    extname: function (path) {
        return PATH.splitPath(path)[3]
    },
    join: function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join("/"))
    },
    join2: function (l, r) {
        return PATH.normalize(l + "/" + r)
    }
};
var PATH_FS = {
    resolve: function () {
        var resolvedPath = "",
            resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            var path = i >= 0 ? arguments[i] : FS.cwd();
            if (typeof path !== "string") {
                throw new TypeError("Arguments to path.resolve must be strings")
            } else if (!path) {
                return ""
            }
            resolvedPath = path + "/" + resolvedPath;
            resolvedAbsolute = path.charAt(0) === "/"
        }
        resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(function (p) {
            return !!p
        }), !resolvedAbsolute).join("/");
        return (resolvedAbsolute ? "/" : "") + resolvedPath || "."
    },
    relative: function (from, to) {
        from = PATH_FS.resolve(from).substr(1);
        to = PATH_FS.resolve(to).substr(1);

        function trim(arr) {
            var start = 0;
            for (; start < arr.length; start++) {
                if (arr[start] !== "") break
            }
            var end = arr.length - 1;
            for (; end >= 0; end--) {
                if (arr[end] !== "") break
            }
            if (start > end) return [];
            return arr.slice(start, end - start + 1)
        }
        var fromParts = trim(from.split("/"));
        var toParts = trim(to.split("/"));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
            if (fromParts[i] !== toParts[i]) {
                samePartsLength = i;
                break
            }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
            outputParts.push("..")
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join("/")
    }
};
var TTY = {
    ttys: [],
    init: function () {},
    shutdown: function () {},
    register: function (dev, ops) {
        TTY.ttys[dev] = {
            input: [],
            output: [],
            ops: ops
        };
        FS.registerDevice(dev, TTY.stream_ops)
    },
    stream_ops: {
        open: function (stream) {
            var tty = TTY.ttys[stream.node.rdev];
            if (!tty) {
                throw new FS.ErrnoError(43)
            }
            stream.tty = tty;
            stream.seekable = false
        },
        close: function (stream) {
            stream.tty.ops.flush(stream.tty)
        },
        flush: function (stream) {
            stream.tty.ops.flush(stream.tty)
        },
        read: function (stream, buffer, offset, length, pos) {
            if (!stream.tty || !stream.tty.ops.get_char) {
                throw new FS.ErrnoError(60)
            }
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
                var result;
                try {
                    result = stream.tty.ops.get_char(stream.tty)
                } catch (e) {
                    throw new FS.ErrnoError(29)
                }
                if (result === undefined && bytesRead === 0) {
                    throw new FS.ErrnoError(6)
                }
                if (result === null || result === undefined) break;
                bytesRead++;
                buffer[offset + i] = result
            }
            if (bytesRead) {
                stream.node.timestamp = Date.now()
            }
            return bytesRead
        },
        write: function (stream, buffer, offset, length, pos) {
            if (!stream.tty || !stream.tty.ops.put_char) {
                throw new FS.ErrnoError(60)
            }
            try {
                for (var i = 0; i < length; i++) {
                    stream.tty.ops.put_char(stream.tty, buffer[offset + i])
                }
            } catch (e) {
                throw new FS.ErrnoError(29)
            }
            if (length) {
                stream.node.timestamp = Date.now()
            }
            return i
        }
    },
    default_tty_ops: {
        get_char: function (tty) {
            if (!tty.input.length) {
                var result = null;
                if (ENVIRONMENT_IS_NODE) {
                    var BUFSIZE = 256;
                    var buf = Buffer.alloc ? Buffer.alloc(BUFSIZE) : new Buffer(BUFSIZE);
                    var bytesRead = 0;
                    try {
                        bytesRead = nodeFS.readSync(process.stdin.fd, buf, 0, BUFSIZE, null)
                    } catch (e) {
                        if (e.toString().indexOf("EOF") != -1) bytesRead = 0;
                        else throw e
                    }
                    if (bytesRead > 0) {
                        result = buf.slice(0, bytesRead).toString("utf-8")
                    } else {
                        result = null
                    }
                } else if (typeof window != "undefined" && typeof window.prompt == "function") {
                    result = window.prompt("Input: ");
                    if (result !== null) {
                        result += "\n"
                    }
                } else if (typeof readline == "function") {
                    result = readline();
                    if (result !== null) {
                        result += "\n"
                    }
                }
                if (!result) {
                    return null
                }
                tty.input = intArrayFromString(result, true)
            }
            return tty.input.shift()
        },
        put_char: function (tty, val) {
            if (val === null || val === 10) {
                out(UTF8ArrayToString(tty.output, 0));
                tty.output = []
            } else {
                if (val != 0) tty.output.push(val)
            }
        },
        flush: function (tty) {
            if (tty.output && tty.output.length > 0) {
                out(UTF8ArrayToString(tty.output, 0));
                tty.output = []
            }
        }
    },
    default_tty1_ops: {
        put_char: function (tty, val) {
            if (val === null || val === 10) {
                err(UTF8ArrayToString(tty.output, 0));
                tty.output = []
            } else {
                if (val != 0) tty.output.push(val)
            }
        },
        flush: function (tty) {
            if (tty.output && tty.output.length > 0) {
                err(UTF8ArrayToString(tty.output, 0));
                tty.output = []
            }
        }
    }
};
var MEMFS = {
    ops_table: null,
    mount: function (mount) {
        return MEMFS.createNode(null, "/", 16384 | 511, 0)
    },
    createNode: function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
            throw new FS.ErrnoError(63)
        }
        if (!MEMFS.ops_table) {
            MEMFS.ops_table = {
                dir: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr,
                        lookup: MEMFS.node_ops.lookup,
                        mknod: MEMFS.node_ops.mknod,
                        rename: MEMFS.node_ops.rename,
                        unlink: MEMFS.node_ops.unlink,
                        rmdir: MEMFS.node_ops.rmdir,
                        readdir: MEMFS.node_ops.readdir,
                        symlink: MEMFS.node_ops.symlink
                    },
                    stream: {
                        llseek: MEMFS.stream_ops.llseek
                    }
                },
                file: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr
                    },
                    stream: {
                        llseek: MEMFS.stream_ops.llseek,
                        read: MEMFS.stream_ops.read,
                        write: MEMFS.stream_ops.write,
                        allocate: MEMFS.stream_ops.allocate,
                        mmap: MEMFS.stream_ops.mmap,
                        msync: MEMFS.stream_ops.msync
                    }
                },
                link: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr,
                        readlink: MEMFS.node_ops.readlink
                    },
                    stream: {}
                },
                chrdev: {
                    node: {
                        getattr: MEMFS.node_ops.getattr,
                        setattr: MEMFS.node_ops.setattr
                    },
                    stream: FS.chrdev_stream_ops
                }
            }
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
            node.node_ops = MEMFS.ops_table.dir.node;
            node.stream_ops = MEMFS.ops_table.dir.stream;
            node.contents = {}
        } else if (FS.isFile(node.mode)) {
            node.node_ops = MEMFS.ops_table.file.node;
            node.stream_ops = MEMFS.ops_table.file.stream;
            node.usedBytes = 0;
            node.contents = null
        } else if (FS.isLink(node.mode)) {
            node.node_ops = MEMFS.ops_table.link.node;
            node.stream_ops = MEMFS.ops_table.link.stream
        } else if (FS.isChrdev(node.mode)) {
            node.node_ops = MEMFS.ops_table.chrdev.node;
            node.stream_ops = MEMFS.ops_table.chrdev.stream
        }
        node.timestamp = Date.now();
        if (parent) {
            parent.contents[name] = node
        }
        return node
    },
    getFileDataAsRegularArray: function (node) {
        if (node.contents && node.contents.subarray) {
            var arr = [];
            for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
            return arr
        }
        return node.contents
    },
    getFileDataAsTypedArray: function (node) {
        if (!node.contents) return new Uint8Array;
        if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
        return new Uint8Array(node.contents)
    },
    expandFileStorage: function (node, newCapacity) {
        var prevCapacity = node.contents ? node.contents.length : 0;
        if (prevCapacity >= newCapacity) return;
        var CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) | 0);
        if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
        var oldContents = node.contents;
        node.contents = new Uint8Array(newCapacity);
        if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
        return
    },
    resizeFileStorage: function (node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
            node.contents = null;
            node.usedBytes = 0;
            return
        }
        if (!node.contents || node.contents.subarray) {
            var oldContents = node.contents;
            node.contents = new Uint8Array(new ArrayBuffer(newSize));
            if (oldContents) {
                node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)))
            }
            node.usedBytes = newSize;
            return
        }
        if (!node.contents) node.contents = [];
        if (node.contents.length > newSize) node.contents.length = newSize;
        else
            while (node.contents.length < newSize) node.contents.push(0);
        node.usedBytes = newSize
    },
    node_ops: {
        getattr: function (node) {
            var attr = {};
            attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
            attr.ino = node.id;
            attr.mode = node.mode;
            attr.nlink = 1;
            attr.uid = 0;
            attr.gid = 0;
            attr.rdev = node.rdev;
            if (FS.isDir(node.mode)) {
                attr.size = 4096
            } else if (FS.isFile(node.mode)) {
                attr.size = node.usedBytes
            } else if (FS.isLink(node.mode)) {
                attr.size = node.link.length
            } else {
                attr.size = 0
            }
            attr.atime = new Date(node.timestamp);
            attr.mtime = new Date(node.timestamp);
            attr.ctime = new Date(node.timestamp);
            attr.blksize = 4096;
            attr.blocks = Math.ceil(attr.size / attr.blksize);
            return attr
        },
        setattr: function (node, attr) {
            if (attr.mode !== undefined) {
                node.mode = attr.mode
            }
            if (attr.timestamp !== undefined) {
                node.timestamp = attr.timestamp
            }
            if (attr.size !== undefined) {
                MEMFS.resizeFileStorage(node, attr.size)
            }
        },
        lookup: function (parent, name) {
            throw FS.genericErrors[44]
        },
        mknod: function (parent, name, mode, dev) {
            return MEMFS.createNode(parent, name, mode, dev)
        },
        rename: function (old_node, new_dir, new_name) {
            if (FS.isDir(old_node.mode)) {
                var new_node;
                try {
                    new_node = FS.lookupNode(new_dir, new_name)
                } catch (e) {}
                if (new_node) {
                    for (var i in new_node.contents) {
                        throw new FS.ErrnoError(55)
                    }
                }
            }
            delete old_node.parent.contents[old_node.name];
            old_node.name = new_name;
            new_dir.contents[new_name] = old_node;
            old_node.parent = new_dir
        },
        unlink: function (parent, name) {
            delete parent.contents[name]
        },
        rmdir: function (parent, name) {
            var node = FS.lookupNode(parent, name);
            for (var i in node.contents) {
                throw new FS.ErrnoError(55)
            }
            delete parent.contents[name]
        },
        readdir: function (node) {
            var entries = [".", ".."];
            for (var key in node.contents) {
                if (!node.contents.hasOwnProperty(key)) {
                    continue
                }
                entries.push(key)
            }
            return entries
        },
        symlink: function (parent, newname, oldpath) {
            var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
            node.link = oldpath;
            return node
        },
        readlink: function (node) {
            if (!FS.isLink(node.mode)) {
                throw new FS.ErrnoError(28)
            }
            return node.link
        }
    },
    stream_ops: {
        read: function (stream, buffer, offset, length, position) {
            var contents = stream.node.contents;
            if (position >= stream.node.usedBytes) return 0;
            var size = Math.min(stream.node.usedBytes - position, length);
            if (size > 8 && contents.subarray) {
                buffer.set(contents.subarray(position, position + size), offset)
            } else {
                for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i]
            }
            return size
        },
        write: function (stream, buffer, offset, length, position, canOwn) {
            if (!length) return 0;
            var node = stream.node;
            node.timestamp = Date.now();
            if (buffer.subarray && (!node.contents || node.contents.subarray)) {
                if (canOwn) {
                    node.contents = buffer.subarray(offset, offset + length);
                    node.usedBytes = length;
                    return length
                } else if (node.usedBytes === 0 && position === 0) {
                    node.contents = new Uint8Array(buffer.subarray(offset, offset + length));
                    node.usedBytes = length;
                    return length
                } else if (position + length <= node.usedBytes) {
                    node.contents.set(buffer.subarray(offset, offset + length), position);
                    return length
                }
            }
            MEMFS.expandFileStorage(node, position + length);
            if (node.contents.subarray && buffer.subarray) node.contents.set(buffer.subarray(offset, offset + length), position);
            else {
                for (var i = 0; i < length; i++) {
                    node.contents[position + i] = buffer[offset + i]
                }
            }
            node.usedBytes = Math.max(node.usedBytes, position + length);
            return length
        },
        llseek: function (stream, offset, whence) {
            var position = offset;
            if (whence === 1) {
                position += stream.position
            } else if (whence === 2) {
                if (FS.isFile(stream.node.mode)) {
                    position += stream.node.usedBytes
                }
            }
            if (position < 0) {
                throw new FS.ErrnoError(28)
            }
            return position
        },
        allocate: function (stream, offset, length) {
            MEMFS.expandFileStorage(stream.node, offset + length);
            stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length)
        },
        mmap: function (stream, buffer, offset, length, position, prot, flags) {
            if (!FS.isFile(stream.node.mode)) {
                throw new FS.ErrnoError(43)
            }
            var ptr;
            var allocated;
            var contents = stream.node.contents;
            if (!(flags & 2) && contents.buffer === buffer.buffer) {
                allocated = false;
                ptr = contents.byteOffset
            } else {
                if (position > 0 || position + length < stream.node.usedBytes) {
                    if (contents.subarray) {
                        contents = contents.subarray(position, position + length)
                    } else {
                        contents = Array.prototype.slice.call(contents, position, position + length)
                    }
                }
                allocated = true;
                var fromHeap = buffer.buffer == HEAP8.buffer;
                ptr = _malloc(length);
                if (!ptr) {
                    throw new FS.ErrnoError(48)
                }(fromHeap ? HEAP8 : buffer).set(contents, ptr)
            }
            return {
                ptr: ptr,
                allocated: allocated
            }
        },
        msync: function (stream, buffer, offset, length, mmapFlags) {
            if (!FS.isFile(stream.node.mode)) {
                throw new FS.ErrnoError(43)
            }
            if (mmapFlags & 2) {
                return 0
            }
            var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
            return 0
        }
    }
};
var FS = {
    root: null,
    mounts: [],
    devices: {},
    streams: [],
    nextInode: 1,
    nameTable: null,
    currentPath: "/",
    initialized: false,
    ignorePermissions: true,
    trackingDelegate: {},
    tracking: {
        openFlags: {
            READ: 1,
            WRITE: 2
        }
    },
    ErrnoError: null,
    genericErrors: {},
    filesystems: null,
    syncFSRequests: 0,
    handleFSError: function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + " : " + stackTrace();
        return ___setErrNo(e.errno)
    },
    lookupPath: function (path, opts) {
        path = PATH_FS.resolve(FS.cwd(), path);
        opts = opts || {};
        if (!path) return {
            path: "",
            node: null
        };
        var defaults = {
            follow_mount: true,
            recurse_count: 0
        };
        for (var key in defaults) {
            if (opts[key] === undefined) {
                opts[key] = defaults[key]
            }
        }
        if (opts.recurse_count > 8) {
            throw new FS.ErrnoError(32)
        }
        var parts = PATH.normalizeArray(path.split("/").filter(function (p) {
            return !!p
        }), false);
        var current = FS.root;
        var current_path = "/";
        for (var i = 0; i < parts.length; i++) {
            var islast = i === parts.length - 1;
            if (islast && opts.parent) {
                break
            }
            current = FS.lookupNode(current, parts[i]);
            current_path = PATH.join2(current_path, parts[i]);
            if (FS.isMountpoint(current)) {
                if (!islast || islast && opts.follow_mount) {
                    current = current.mounted.root
                }
            }
            if (!islast || opts.follow) {
                var count = 0;
                while (FS.isLink(current.mode)) {
                    var link = FS.readlink(current_path);
                    current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
                    var lookup = FS.lookupPath(current_path, {
                        recurse_count: opts.recurse_count
                    });
                    current = lookup.node;
                    if (count++ > 40) {
                        throw new FS.ErrnoError(32)
                    }
                }
            }
        }
        return {
            path: current_path,
            node: current
        }
    },
    getPath: function (node) {
        var path;
        while (true) {
            if (FS.isRoot(node)) {
                var mount = node.mount.mountpoint;
                if (!path) return mount;
                return mount[mount.length - 1] !== "/" ? mount + "/" + path : mount + path
            }
            path = path ? node.name + "/" + path : node.name;
            node = node.parent
        }
    },
    hashName: function (parentid, name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
            hash = (hash << 5) - hash + name.charCodeAt(i) | 0
        }
        return (parentid + hash >>> 0) % FS.nameTable.length
    },
    hashAddNode: function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node
    },
    hashRemoveNode: function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
            FS.nameTable[hash] = node.name_next
        } else {
            var current = FS.nameTable[hash];
            while (current) {
                if (current.name_next === node) {
                    current.name_next = node.name_next;
                    break
                }
                current = current.name_next
            }
        }
    },
    lookupNode: function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
            throw new FS.ErrnoError(err, parent)
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
            var nodeName = node.name;
            if (node.parent.id === parent.id && nodeName === name) {
                return node
            }
        }
        return FS.lookup(parent, name)
    },
    createNode: function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
            FS.FSNode = function (parent, name, mode, rdev) {
                if (!parent) {
                    parent = this
                }
                this.parent = parent;
                this.mount = parent.mount;
                this.mounted = null;
                this.id = FS.nextInode++;
                this.name = name;
                this.mode = mode;
                this.node_ops = {};
                this.stream_ops = {};
                this.rdev = rdev
            };
            FS.FSNode.prototype = {};
            var readMode = 292 | 73;
            var writeMode = 146;
            Object.defineProperties(FS.FSNode.prototype, {
                read: {
                    get: function () {
                        return (this.mode & readMode) === readMode
                    },
                    set: function (val) {
                        val ? this.mode |= readMode : this.mode &= ~readMode
                    }
                },
                write: {
                    get: function () {
                        return (this.mode & writeMode) === writeMode
                    },
                    set: function (val) {
                        val ? this.mode |= writeMode : this.mode &= ~writeMode
                    }
                },
                isFolder: {
                    get: function () {
                        return FS.isDir(this.mode)
                    }
                },
                isDevice: {
                    get: function () {
                        return FS.isChrdev(this.mode)
                    }
                }
            })
        }
        var node = new FS.FSNode(parent, name, mode, rdev);
        FS.hashAddNode(node);
        return node
    },
    destroyNode: function (node) {
        FS.hashRemoveNode(node)
    },
    isRoot: function (node) {
        return node === node.parent
    },
    isMountpoint: function (node) {
        return !!node.mounted
    },
    isFile: function (mode) {
        return (mode & 61440) === 32768
    },
    isDir: function (mode) {
        return (mode & 61440) === 16384
    },
    isLink: function (mode) {
        return (mode & 61440) === 40960
    },
    isChrdev: function (mode) {
        return (mode & 61440) === 8192
    },
    isBlkdev: function (mode) {
        return (mode & 61440) === 24576
    },
    isFIFO: function (mode) {
        return (mode & 61440) === 4096
    },
    isSocket: function (mode) {
        return (mode & 49152) === 49152
    },
    flagModes: {
        "r": 0,
        "rs": 1052672,
        "r+": 2,
        "w": 577,
        "wx": 705,
        "xw": 705,
        "w+": 578,
        "wx+": 706,
        "xw+": 706,
        "a": 1089,
        "ax": 1217,
        "xa": 1217,
        "a+": 1090,
        "ax+": 1218,
        "xa+": 1218
    },
    modeStringToFlags: function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === "undefined") {
            throw new Error("Unknown file open mode: " + str)
        }
        return flags
    },
    flagsToPermissionString: function (flag) {
        var perms = ["r", "w", "rw"][flag & 3];
        if (flag & 512) {
            perms += "w"
        }
        return perms
    },
    nodePermissions: function (node, perms) {
        if (FS.ignorePermissions) {
            return 0
        }
        if (perms.indexOf("r") !== -1 && !(node.mode & 292)) {
            return 2
        } else if (perms.indexOf("w") !== -1 && !(node.mode & 146)) {
            return 2
        } else if (perms.indexOf("x") !== -1 && !(node.mode & 73)) {
            return 2
        }
        return 0
    },
    mayLookup: function (dir) {
        var err = FS.nodePermissions(dir, "x");
        if (err) return err;
        if (!dir.node_ops.lookup) return 2;
        return 0
    },
    mayCreate: function (dir, name) {
        try {
            var node = FS.lookupNode(dir, name);
            return 20
        } catch (e) {}
        return FS.nodePermissions(dir, "wx")
    },
    mayDelete: function (dir, name, isdir) {
        var node;
        try {
            node = FS.lookupNode(dir, name)
        } catch (e) {
            return e.errno
        }
        var err = FS.nodePermissions(dir, "wx");
        if (err) {
            return err
        }
        if (isdir) {
            if (!FS.isDir(node.mode)) {
                return 54
            }
            if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
                return 10
            }
        } else {
            if (FS.isDir(node.mode)) {
                return 31
            }
        }
        return 0
    },
    mayOpen: function (node, flags) {
        if (!node) {
            return 44
        }
        if (FS.isLink(node.mode)) {
            return 32
        } else if (FS.isDir(node.mode)) {
            if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
                return 31
            }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags))
    },
    MAX_OPEN_FDS: 4096,
    nextfd: function (is_socket) {
        is_socket = is_socket || 0;
        ret = _acquire_next_fd(is_socket);
        if (ret == -1) {
            throw new FS.ErrnoError(33)
        }
        return ret
    },
    getStream: function (fd) {
        return FS.streams[fd]
    },
    createStream: function (stream, is_socket) {
        if (!FS.FSStream) {
            FS.FSStream = function () {};
            FS.FSStream.prototype = {};
            Object.defineProperties(FS.FSStream.prototype, {
                object: {
                    get: function () {
                        return this.node
                    },
                    set: function (val) {
                        this.node = val
                    }
                },
                isRead: {
                    get: function () {
                        return (this.flags & 2097155) !== 1
                    }
                },
                isWrite: {
                    get: function () {
                        return (this.flags & 2097155) !== 0
                    }
                },
                isAppend: {
                    get: function () {
                        return this.flags & 1024
                    }
                }
            })
        }
        var newStream = new FS.FSStream;
        for (var p in stream) {
            newStream[p] = stream[p]
        }
        stream = newStream;
        var fd = FS.nextfd(is_socket);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream
    },
    closeStream: function (fd) {
        FS.streams[fd] = null
    },
    moveStream: function (fd_src, fd_dst) {
        if (fd_src === fd_dst) {
            return
        }
        FS.streams[fd_dst] = FS.streams[fd_src];
        FS.streams[fd_src] = null;
        _release_fd(fd_src);
        FS.streams[fd_dst].fd = fd_dst
    },
    chrdev_stream_ops: {
        open: function (stream) {
            var device = FS.getDevice(stream.node.rdev);
            stream.stream_ops = device.stream_ops;
            if (stream.stream_ops.open) {
                stream.stream_ops.open(stream)
            }
        },
        llseek: function () {
            throw new FS.ErrnoError(70)
        }
    },
    major: function (dev) {
        return dev >> 8
    },
    minor: function (dev) {
        return dev & 255
    },
    makedev: function (ma, mi) {
        return ma << 8 | mi
    },
    registerDevice: function (dev, ops) {
        FS.devices[dev] = {
            stream_ops: ops
        }
    },
    getDevice: function (dev) {
        return FS.devices[dev]
    },
    getMounts: function (mount) {
        var mounts = [];
        var check = [mount];
        while (check.length) {
            var m = check.pop();
            mounts.push(m);
            check.push.apply(check, m.mounts)
        }
        return mounts
    },
    syncfs: function (populate, callback) {
        if (typeof populate === "function") {
            callback = populate;
            populate = false
        }
        FS.syncFSRequests++;
        if (FS.syncFSRequests > 1) {
            console.log("warning: " + FS.syncFSRequests + " FS.syncfs operations in flight at once, probably just doing extra work")
        }
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;

        function doCallback(err) {
            FS.syncFSRequests--;
            return callback(err)
        }

        function done(err) {
            if (err) {
                if (!done.errored) {
                    done.errored = true;
                    return doCallback(err)
                }
                return
            }
            if (++completed >= mounts.length) {
                doCallback(null)
            }
        }
        mounts.forEach(function (mount) {
            if (!mount.type.syncfs) {
                return done(null)
            }
            mount.type.syncfs(mount, populate, done)
        })
    },
    mount: function (type, opts, mountpoint) {
        var root = mountpoint === "/";
        var pseudo = !mountpoint;
        var node;
        if (root && FS.root) {
            throw new FS.ErrnoError(10)
        } else if (!root && !pseudo) {
            var lookup = FS.lookupPath(mountpoint, {
                follow_mount: false
            });
            mountpoint = lookup.path;
            node = lookup.node;
            if (FS.isMountpoint(node)) {
                throw new FS.ErrnoError(10)
            }
            if (!FS.isDir(node.mode)) {
                throw new FS.ErrnoError(54)
            }
        }
        var mount = {
            type: type,
            opts: opts,
            mountpoint: mountpoint,
            mounts: []
        };
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
        if (root) {
            FS.root = mountRoot
        } else if (node) {
            node.mounted = mount;
            if (node.mount) {
                node.mount.mounts.push(mount)
            }
        }
        return mountRoot
    },
    unmount: function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, {
            follow_mount: false
        });
        if (!FS.isMountpoint(lookup.node)) {
            throw new FS.ErrnoError(28)
        }
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
        Object.keys(FS.nameTable).forEach(function (hash) {
            var current = FS.nameTable[hash];
            while (current) {
                var next = current.name_next;
                if (mounts.indexOf(current.mount) !== -1) {
                    FS.destroyNode(current)
                }
                current = next
            }
        });
        node.mounted = null;
        var idx = node.mount.mounts.indexOf(mount);
        node.mount.mounts.splice(idx, 1)
    },
    lookup: function (parent, name) {
        return parent.node_ops.lookup(parent, name)
    },
    mknod: function (path, mode, dev) {
        var lookup = FS.lookupPath(path, {
            parent: true
        });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === "." || name === "..") {
            throw new FS.ErrnoError(28)
        }
        var err = FS.mayCreate(parent, name);
        if (err) {
            throw new FS.ErrnoError(err)
        }
        if (!parent.node_ops.mknod) {
            throw new FS.ErrnoError(63)
        }
        return parent.node_ops.mknod(parent, name, mode, dev)
    },
    create: function (path, mode) {
        mode = mode !== undefined ? mode : 438;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0)
    },
    mkdir: function (path, mode) {
        mode = mode !== undefined ? mode : 511;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0)
    },
    mkdirTree: function (path, mode) {
        var dirs = path.split("/");
        var d = "";
        for (var i = 0; i < dirs.length; ++i) {
            if (!dirs[i]) continue;
            d += "/" + dirs[i];
            try {
                FS.mkdir(d, mode)
            } catch (e) {
                if (e.errno != 20) throw e
            }
        }
    },
    mkdev: function (path, mode, dev) {
        if (typeof dev === "undefined") {
            dev = mode;
            mode = 438
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev)
    },
    symlink: function (oldpath, newpath) {
        if (!PATH_FS.resolve(oldpath)) {
            throw new FS.ErrnoError(44)
        }
        var lookup = FS.lookupPath(newpath, {
            parent: true
        });
        var parent = lookup.node;
        if (!parent) {
            throw new FS.ErrnoError(44)
        }
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
            throw new FS.ErrnoError(err)
        }
        if (!parent.node_ops.symlink) {
            throw new FS.ErrnoError(63)
        }
        return parent.node_ops.symlink(parent, newname, oldpath)
    },
    rename: function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        var lookup, old_dir, new_dir;
        try {
            lookup = FS.lookupPath(old_path, {
                parent: true
            });
            old_dir = lookup.node;
            lookup = FS.lookupPath(new_path, {
                parent: true
            });
            new_dir = lookup.node
        } catch (e) {
            throw new FS.ErrnoError(10)
        }
        if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
        if (old_dir.mount !== new_dir.mount) {
            throw new FS.ErrnoError(75)
        }
        var old_node = FS.lookupNode(old_dir, old_name);
        var relative = PATH_FS.relative(old_path, new_dirname);
        if (relative.charAt(0) !== ".") {
            throw new FS.ErrnoError(28)
        }
        relative = PATH_FS.relative(new_path, old_dirname);
        if (relative.charAt(0) !== ".") {
            throw new FS.ErrnoError(55)
        }
        var new_node;
        try {
            new_node = FS.lookupNode(new_dir, new_name)
        } catch (e) {}
        if (old_node === new_node) {
            return
        }
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
            throw new FS.ErrnoError(err)
        }
        err = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
        if (err) {
            throw new FS.ErrnoError(err)
        }
        if (!old_dir.node_ops.rename) {
            throw new FS.ErrnoError(63)
        }
        if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
            throw new FS.ErrnoError(10)
        }
        if (new_dir !== old_dir) {
            err = FS.nodePermissions(old_dir, "w");
            if (err) {
                throw new FS.ErrnoError(err)
            }
        }
        try {
            if (FS.trackingDelegate["willMovePath"]) {
                FS.trackingDelegate["willMovePath"](old_path, new_path)
            }
        } catch (e) {
            console.log("FS.trackingDelegate['willMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message)
        }
        FS.hashRemoveNode(old_node);
        try {
            old_dir.node_ops.rename(old_node, new_dir, new_name)
        } catch (e) {
            throw e
        } finally {
            FS.hashAddNode(old_node)
        }
        try {
            if (FS.trackingDelegate["onMovePath"]) FS.trackingDelegate["onMovePath"](old_path, new_path)
        } catch (e) {
            console.log("FS.trackingDelegate['onMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message)
        }
    },
    rmdir: function (path) {
        var lookup = FS.lookupPath(path, {
            parent: true
        });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
            throw new FS.ErrnoError(err)
        }
        if (!parent.node_ops.rmdir) {
            throw new FS.ErrnoError(63)
        }
        if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10)
        }
        try {
            if (FS.trackingDelegate["willDeletePath"]) {
                FS.trackingDelegate["willDeletePath"](path)
            }
        } catch (e) {
            console.log("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message)
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
        try {
            if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path)
        } catch (e) {
            console.log("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message)
        }
    },
    readdir: function (path) {
        var lookup = FS.lookupPath(path, {
            follow: true
        });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
            throw new FS.ErrnoError(54)
        }
        return node.node_ops.readdir(node)
    },
    unlink: function (path) {
        var lookup = FS.lookupPath(path, {
            parent: true
        });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
            throw new FS.ErrnoError(err)
        }
        if (!parent.node_ops.unlink) {
            throw new FS.ErrnoError(63)
        }
        if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10)
        }
        try {
            if (FS.trackingDelegate["willDeletePath"]) {
                FS.trackingDelegate["willDeletePath"](path)
            }
        } catch (e) {
            console.log("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message)
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
        try {
            if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path)
        } catch (e) {
            console.log("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message)
        }
    },
    readlink: function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
            throw new FS.ErrnoError(44)
        }
        if (!link.node_ops.readlink) {
            throw new FS.ErrnoError(28)
        }
        return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link))
    },
    stat: function (path, dontFollow) {
        var lookup = FS.lookupPath(path, {
            follow: !dontFollow
        });
        var node = lookup.node;
        if (!node) {
            throw new FS.ErrnoError(44)
        }
        if (!node.node_ops.getattr) {
            throw new FS.ErrnoError(63)
        }
        return node.node_ops.getattr(node)
    },
    lstat: function (path) {
        return FS.stat(path, true)
    },
    chmod: function (path, mode, dontFollow) {
        var node;
        if (typeof path === "string") {
            var lookup = FS.lookupPath(path, {
                follow: !dontFollow
            });
            node = lookup.node
        } else {
            node = path
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63)
        }
        node.node_ops.setattr(node, {
            mode: mode & 4095 | node.mode & ~4095,
            timestamp: Date.now()
        })
    },
    lchmod: function (path, mode) {
        FS.chmod(path, mode, true)
    },
    fchmod: function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
            throw new FS.ErrnoError(8)
        }
        FS.chmod(stream.node, mode)
    },
    chown: function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === "string") {
            var lookup = FS.lookupPath(path, {
                follow: !dontFollow
            });
            node = lookup.node
        } else {
            node = path
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63)
        }
        node.node_ops.setattr(node, {
            timestamp: Date.now()
        })
    },
    lchown: function (path, uid, gid) {
        FS.chown(path, uid, gid, true)
    },
    fchown: function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
            throw new FS.ErrnoError(8)
        }
        FS.chown(stream.node, uid, gid)
    },
    truncate: function (path, len) {
        if (len < 0) {
            throw new FS.ErrnoError(28)
        }
        var node;
        if (typeof path === "string") {
            var lookup = FS.lookupPath(path, {
                follow: true
            });
            node = lookup.node
        } else {
            node = path
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63)
        }
        if (FS.isDir(node.mode)) {
            throw new FS.ErrnoError(31)
        }
        if (!FS.isFile(node.mode)) {
            throw new FS.ErrnoError(28)
        }
        var err = FS.nodePermissions(node, "w");
        if (err) {
            throw new FS.ErrnoError(err)
        }
        node.node_ops.setattr(node, {
            size: len,
            timestamp: Date.now()
        })
    },
    ftruncate: function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
            throw new FS.ErrnoError(8)
        }
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(28)
        }
        FS.truncate(stream.node, len)
    },
    utime: function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, {
            follow: true
        });
        var node = lookup.node;
        node.node_ops.setattr(node, {
            timestamp: Math.max(atime, mtime)
        })
    },
    open: function (path, flags, mode) {
        if (path === "") {
            throw new FS.ErrnoError(44)
        }
        flags = typeof flags === "string" ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === "undefined" ? 438 : mode;
        if (flags & 64) {
            mode = mode & 4095 | 32768
        } else {
            mode = 0
        }
        var node;
        if (typeof path === "object") {
            node = path
        } else {
            path = PATH.normalize(path);
            try {
                var lookup = FS.lookupPath(path, {
                    follow: !(flags & 131072)
                });
                node = lookup.node
            } catch (e) {}
        }
        var created = false;
        if (flags & 64) {
            if (node) {
                if (flags & 128) {
                    throw new FS.ErrnoError(20)
                }
            } else {
                node = FS.mknod(path, mode, 0);
                created = true
            }
        }
        if (!node) {
            throw new FS.ErrnoError(44)
        }
        if (FS.isChrdev(node.mode)) {
            flags &= ~512
        }
        if (flags & 65536 && !FS.isDir(node.mode)) {
            throw new FS.ErrnoError(54)
        }
        if (!created) {
            var err = FS.mayOpen(node, flags);
            if (err) {
                throw new FS.ErrnoError(err)
            }
        }
        if (flags & 512) {
            FS.truncate(node, 0)
        }
        flags &= ~(128 | 512);
        var stream = FS.createStream({
            node: node,
            path: FS.getPath(node),
            flags: flags,
            seekable: true,
            position: 0,
            stream_ops: node.stream_ops,
            ungotten: [],
            error: false
        });
        if (stream.stream_ops.open) {
            stream.stream_ops.open(stream)
        }
        if (Module["logReadFiles"] && !(flags & 1)) {
            if (!FS.readFiles) FS.readFiles = {};
            if (!(path in FS.readFiles)) {
                FS.readFiles[path] = 1;
                console.log("FS.trackingDelegate error on read file: " + path)
            }
        }
        try {
            if (FS.trackingDelegate["onOpenFile"]) {
                var trackingFlags = 0;
                if ((flags & 2097155) !== 1) {
                    trackingFlags |= FS.tracking.openFlags.READ
                }
                if ((flags & 2097155) !== 0) {
                    trackingFlags |= FS.tracking.openFlags.WRITE
                }
                FS.trackingDelegate["onOpenFile"](path, trackingFlags)
            }
        } catch (e) {
            console.log("FS.trackingDelegate['onOpenFile']('" + path + "', flags) threw an exception: " + e.message)
        }
        return stream
    },
    close: function (stream) {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8)
        }
        if (stream.getdents) stream.getdents = null;
        try {
            if (stream.stream_ops.close) {
                stream.stream_ops.close(stream)
            }
        } catch (e) {
            throw e
        } finally {
            FS.closeStream(stream.fd)
        }
        _release_fd(stream.fd);
        stream.fd = null
    },
    isClosed: function (stream) {
        return stream.fd === null
    },
    llseek: function (stream, offset, whence) {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8)
        }
        if (!stream.seekable || !stream.stream_ops.llseek) {
            throw new FS.ErrnoError(70)
        }
        if (whence != 0 && whence != 1 && whence != 2) {
            throw new FS.ErrnoError(28)
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position
    },
    read: function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
            throw new FS.ErrnoError(28)
        }
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8)
        }
        if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(8)
        }
        if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(31)
        }
        if (!stream.stream_ops.read) {
            throw new FS.ErrnoError(28)
        }
        var seeking = typeof position !== "undefined";
        if (!seeking) {
            position = stream.position
        } else if (!stream.seekable) {
            throw new FS.ErrnoError(70)
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead
    },
    write: function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
            throw new FS.ErrnoError(28)
        }
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8)
        }
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(8)
        }
        if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(31)
        }
        if (!stream.stream_ops.write) {
            throw new FS.ErrnoError(28)
        }
        if (stream.flags & 1024) {
            FS.llseek(stream, 0, 2)
        }
        var seeking = typeof position !== "undefined";
        if (!seeking) {
            position = stream.position
        } else if (!stream.seekable) {
            throw new FS.ErrnoError(70)
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        try {
            if (stream.path && FS.trackingDelegate["onWriteToFile"]) FS.trackingDelegate["onWriteToFile"](stream.path)
        } catch (e) {
            console.log("FS.trackingDelegate['onWriteToFile']('" + stream.path + "') threw an exception: " + e.message)
        }
        return bytesWritten
    },
    allocate: function (stream, offset, length) {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8)
        }
        if (offset < 0 || length <= 0) {
            throw new FS.ErrnoError(28)
        }
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(8)
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(43)
        }
        if (!stream.stream_ops.allocate) {
            throw new FS.ErrnoError(138)
        }
        stream.stream_ops.allocate(stream, offset, length)
    },
    mmap: function (stream, buffer, offset, length, position, prot, flags) {
        if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
            throw new FS.ErrnoError(2)
        }
        if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(2)
        }
        if (!stream.stream_ops.mmap) {
            throw new FS.ErrnoError(43)
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags)
    },
    msync: function (stream, buffer, offset, length, mmapFlags) {
        if (!stream || !stream.stream_ops.msync) {
            return 0
        }
        return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags)
    },
    munmap: function (stream) {
        return 0
    },
    ioctl: function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
            throw new FS.ErrnoError(59)
        }
        return stream.stream_ops.ioctl(stream, cmd, arg)
    },
    readFile: function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || "r";
        opts.encoding = opts.encoding || "binary";
        if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
            throw new Error('Invalid encoding type "' + opts.encoding + '"')
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === "utf8") {
            ret = UTF8ArrayToString(buf, 0)
        } else if (opts.encoding === "binary") {
            ret = buf
        }
        FS.close(stream);
        return ret
    },
    writeFile: function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || "w";
        var stream = FS.open(path, opts.flags, opts.mode);
        if (typeof data === "string") {
            var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
            var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
            FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn)
        } else if (ArrayBuffer.isView(data)) {
            FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn)
        } else {
            throw new Error("Unsupported data type")
        }
        FS.close(stream)
    },
    cwd: function () {
        return FS.currentPath
    },
    chdir: function (path) {
        var lookup = FS.lookupPath(path, {
            follow: true
        });
        if (lookup.node === null) {
            throw new FS.ErrnoError(44)
        }
        if (!FS.isDir(lookup.node.mode)) {
            throw new FS.ErrnoError(54)
        }
        var err = FS.nodePermissions(lookup.node, "x");
        if (err) {
            throw new FS.ErrnoError(err)
        }
        FS.currentPath = lookup.path
    },
    createDefaultDirectories: function () {
        FS.mkdir("/tmp");
        FS.mkdir("/home");
        FS.mkdir("/home/web_user")
    },
    createDefaultDevices: function () {
        FS.mkdir("/dev");
        FS.registerDevice(FS.makedev(1, 3), {
            read: function () {
                return 0
            },
            write: function (stream, buffer, offset, length, pos) {
                return length
            }
        });
        FS.mkdev("/dev/null", FS.makedev(1, 3));
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev("/dev/tty", FS.makedev(5, 0));
        FS.mkdev("/dev/tty1", FS.makedev(6, 0));
        var random_device;
        if (typeof crypto === "object" && typeof crypto["getRandomValues"] === "function") {
            var randomBuffer = new Uint8Array(1);
            random_device = function () {
                crypto.getRandomValues(randomBuffer);
                return randomBuffer[0]
            }
        } else if (ENVIRONMENT_IS_NODE) {
            try {
                var crypto_module = require("crypto");
                random_device = function () {
                    return crypto_module["randomBytes"](1)[0]
                }
            } catch (e) {}
        } else {}
        if (!random_device) {
            random_device = function () {
                abort("random_device")
            }
        }
        FS.createDevice("/dev", "random", random_device);
        FS.createDevice("/dev", "urandom", random_device);
        FS.mkdir("/dev/shm");
        FS.mkdir("/dev/shm/tmp")
    },
    createSpecialDirectories: function () {
        FS.mkdir("/proc");
        FS.mkdir("/proc/self");
        FS.mkdir("/proc/self/fd");
        FS.mount({
            mount: function () {
                var node = FS.createNode("/proc/self", "fd", 16384 | 511, 73);
                node.node_ops = {
                    lookup: function (parent, name) {
                        var fd = +name;
                        var stream = FS.getStream(fd);
                        if (!stream) throw new FS.ErrnoError(8);
                        var ret = {
                            parent: null,
                            mount: {
                                mountpoint: "fake"
                            },
                            node_ops: {
                                readlink: function () {
                                    return stream.path
                                }
                            }
                        };
                        ret.parent = ret;
                        return ret
                    }
                };
                return node
            }
        }, {}, "/proc/self/fd")
    },
    createStandardStreams: function () {
        if (Module["stdin"]) {
            FS.createDevice("/dev", "stdin", Module["stdin"])
        } else {
            FS.symlink("/dev/tty", "/dev/stdin")
        }
        if (Module["stdout"]) {
            FS.createDevice("/dev", "stdout", null, Module["stdout"])
        } else {
            FS.symlink("/dev/tty", "/dev/stdout")
        }
        if (Module["stderr"]) {
            FS.createDevice("/dev", "stderr", null, Module["stderr"])
        } else {
            FS.symlink("/dev/tty1", "/dev/stderr")
        }
        var stdin = FS.open("/dev/stdin", "r");
        var stdout = FS.open("/dev/stdout", "w");
        var stderr = FS.open("/dev/stderr", "w")
    },
    ensureErrnoError: function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno, node) {
            this.node = node;
            this.setErrno = function (errno) {
                this.errno = errno
            };
            this.setErrno(errno);
            this.message = "FS error"
        };
        FS.ErrnoError.prototype = new Error;
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        [44].forEach(function (code) {
            FS.genericErrors[code] = new FS.ErrnoError(code);
            FS.genericErrors[code].stack = "<generic error, no stack>"
        })
    },
    staticInit: function () {
        FS.ensureErrnoError();
        FS.nameTable = new Array(4096);
        FS.mount(MEMFS, {}, "/");
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
        FS.filesystems = {
            "MEMFS": MEMFS
        }
    },
    init: function (input, output, error) {
        FS.init.initialized = true;
        FS.ensureErrnoError();
        Module["stdin"] = input || Module["stdin"];
        Module["stdout"] = output || Module["stdout"];
        Module["stderr"] = error || Module["stderr"];
        FS.createStandardStreams()
    },
    quit: function () {
        FS.init.initialized = false;
        var fflush = Module["_fflush"];
        if (fflush) fflush(0);
        for (var i = 0; i < FS.streams.length; i++) {
            var stream = FS.streams[i];
            if (!stream) {
                continue
            }
            FS.close(stream)
        }
    },
    getMode: function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode
    },
    joinPath: function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == "/") path = path.substr(1);
        return path
    },
    absolutePath: function (relative, base) {
        return PATH_FS.resolve(base, relative)
    },
    standardizePath: function (path) {
        return PATH.normalize(path)
    },
    findObject: function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
            return ret.object
        } else {
            ___setErrNo(ret.error);
            return null
        }
    },
    analyzePath: function (path, dontResolveLastLink) {
        try {
            var lookup = FS.lookupPath(path, {
                follow: !dontResolveLastLink
            });
            path = lookup.path
        } catch (e) {}
        var ret = {
            isRoot: false,
            exists: false,
            error: 0,
            name: null,
            path: null,
            object: null,
            parentExists: false,
            parentPath: null,
            parentObject: null
        };
        try {
            var lookup = FS.lookupPath(path, {
                parent: true
            });
            ret.parentExists = true;
            ret.parentPath = lookup.path;
            ret.parentObject = lookup.node;
            ret.name = PATH.basename(path);
            lookup = FS.lookupPath(path, {
                follow: !dontResolveLastLink
            });
            ret.exists = true;
            ret.path = lookup.path;
            ret.object = lookup.node;
            ret.name = lookup.node.name;
            ret.isRoot = lookup.path === "/"
        } catch (e) {
            ret.error = e.errno
        }
        return ret
    },
    createFolder: function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode)
    },
    createPath: function (parent, path, canRead, canWrite) {
        parent = typeof parent === "string" ? parent : FS.getPath(parent);
        var parts = path.split("/").reverse();
        while (parts.length) {
            var part = parts.pop();
            if (!part) continue;
            var current = PATH.join2(parent, part);
            try {
                FS.mkdir(current)
            } catch (e) {}
            parent = current
        }
        return current
    },
    createFile: function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode)
    },
    createDataFile: function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
            if (typeof data === "string") {
                var arr = new Array(data.length);
                for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
                data = arr
            }
            FS.chmod(node, mode | 146);
            var stream = FS.open(node, "w");
            FS.write(stream, data, 0, data.length, 0, canOwn);
            FS.close(stream);
            FS.chmod(node, mode)
        }
        return node
    },
    createDevice: function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        FS.registerDevice(dev, {
            open: function (stream) {
                stream.seekable = false
            },
            close: function (stream) {
                if (output && output.buffer && output.buffer.length) {
                    output(10)
                }
            },
            read: function (stream, buffer, offset, length, pos) {
                var bytesRead = 0;
                for (var i = 0; i < length; i++) {
                    var result;
                    try {
                        result = input()
                    } catch (e) {
                        throw new FS.ErrnoError(29)
                    }
                    if (result === undefined && bytesRead === 0) {
                        throw new FS.ErrnoError(6)
                    }
                    if (result === null || result === undefined) break;
                    bytesRead++;
                    buffer[offset + i] = result
                }
                if (bytesRead) {
                    stream.node.timestamp = Date.now()
                }
                return bytesRead
            },
            write: function (stream, buffer, offset, length, pos) {
                for (var i = 0; i < length; i++) {
                    try {
                        output(buffer[offset + i])
                    } catch (e) {
                        throw new FS.ErrnoError(29)
                    }
                }
                if (length) {
                    stream.node.timestamp = Date.now()
                }
                return i
            }
        });
        return FS.mkdev(path, mode, dev)
    },
    createLink: function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path)
    },
    forceLoadFile: function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== "undefined") {
            throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")
        } else if (read_) {
            try {
                obj.contents = intArrayFromString(read_(obj.url), true);
                obj.usedBytes = obj.contents.length
            } catch (e) {
                success = false
            }
        } else {
            throw new Error("Cannot load without read() or XMLHttpRequest.")
        }
        if (!success) ___setErrNo(29);
        return success
    },
    createLazyFile: function (parent, name, url, canRead, canWrite) {
        function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length - 1 || idx < 0) {
                return undefined
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = idx / this.chunkSize | 0;
            return this.getter(chunkNum)[chunkOffset]
        };
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter
        };
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
            var xhr = new XMLHttpRequest;
            xhr.open("HEAD", url, false);
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            var datalength = Number(xhr.getResponseHeader("Content-length"));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
            var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
            var chunkSize = 1024 * 1024;
            if (!hasByteServing) chunkSize = datalength;
            var doXHR = function (from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
                var xhr = new XMLHttpRequest;
                xhr.open("GET", url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                if (typeof Uint8Array != "undefined") xhr.responseType = "arraybuffer";
                if (xhr.overrideMimeType) {
                    xhr.overrideMimeType("text/plain; charset=x-user-defined")
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                    return new Uint8Array(xhr.response || [])
                } else {
                    return intArrayFromString(xhr.responseText || "", true)
                }
            };
            var lazyArray = this;
            lazyArray.setDataGetter(function (chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum + 1) * chunkSize - 1;
                end = Math.min(end, datalength - 1);
                if (typeof lazyArray.chunks[chunkNum] === "undefined") {
                    lazyArray.chunks[chunkNum] = doXHR(start, end)
                }
                if (typeof lazyArray.chunks[chunkNum] === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum]
            });
            if (usesGzip || !datalength) {
                chunkSize = datalength = 1;
                datalength = this.getter(0).length;
                chunkSize = datalength;
                console.log("LazyFiles on gzip forces download of the whole file when length is accessed")
            }
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true
        };
        if (typeof XMLHttpRequest !== "undefined") {
            if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
            var lazyArray = new LazyUint8Array;
            Object.defineProperties(lazyArray, {
                length: {
                    get: function () {
                        if (!this.lengthKnown) {
                            this.cacheLength()
                        }
                        return this._length
                    }
                },
                chunkSize: {
                    get: function () {
                        if (!this.lengthKnown) {
                            this.cacheLength()
                        }
                        return this._chunkSize
                    }
                }
            });
            var properties = {
                isDevice: false,
                contents: lazyArray
            }
        } else {
            var properties = {
                isDevice: false,
                url: url
            }
        }
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        if (properties.contents) {
            node.contents = properties.contents
        } else if (properties.url) {
            node.contents = null;
            node.url = properties.url
        }
        Object.defineProperties(node, {
            usedBytes: {
                get: function () {
                    return this.contents.length
                }
            }
        });
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function (key) {
            var fn = node.stream_ops[key];
            stream_ops[key] = function forceLoadLazyFile() {
                if (!FS.forceLoadFile(node)) {
                    throw new FS.ErrnoError(29)
                }
                return fn.apply(null, arguments)
            }
        });
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
            if (!FS.forceLoadFile(node)) {
                throw new FS.ErrnoError(29)
            }
            var contents = stream.node.contents;
            if (position >= contents.length) return 0;
            var size = Math.min(contents.length - position, length);
            if (contents.slice) {
                for (var i = 0; i < size; i++) {
                    buffer[offset + i] = contents[position + i]
                }
            } else {
                for (var i = 0; i < size; i++) {
                    buffer[offset + i] = contents.get(position + i)
                }
            }
            return size
        };
        node.stream_ops = stream_ops;
        return node
    },
    createPreloadedFile: function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
        Browser.init();
        var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
        var dep = getUniqueRunDependency("cp " + fullname);

        function processData(byteArray) {
            function finish(byteArray) {
                if (preFinish) preFinish();
                if (!dontCreateFile) {
                    FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn)
                }
                if (onload) onload();
                removeRunDependency(dep)
            }
            var handled = false;
            Module["preloadPlugins"].forEach(function (plugin) {
                if (handled) return;
                if (plugin["canHandle"](fullname)) {
                    plugin["handle"](byteArray, fullname, finish, function () {
                        if (onerror) onerror();
                        removeRunDependency(dep)
                    });
                    handled = true
                }
            });
            if (!handled) finish(byteArray)
        }
        addRunDependency(dep);
        if (typeof url == "string") {
            Browser.asyncLoad(url, function (byteArray) {
                processData(byteArray)
            }, onerror)
        } else {
            processData(url)
        }
    },
    indexedDB: function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
    },
    DB_NAME: function () {
        return "EM_FS_" + window.location.pathname
    },
    DB_VERSION: 20,
    DB_STORE_NAME: "FILE_DATA",
    saveFilesToDB: function (paths, onload, onerror) {
        onload = onload || function () {};
        onerror = onerror || function () {};
        var indexedDB = FS.indexedDB();
        try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION)
        } catch (e) {
            return onerror(e)
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
            console.log("creating db");
            var db = openRequest.result;
            db.createObjectStore(FS.DB_STORE_NAME)
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
            var db = openRequest.result;
            var transaction = db.transaction([FS.DB_STORE_NAME], "readwrite");
            var files = transaction.objectStore(FS.DB_STORE_NAME);
            var ok = 0,
                fail = 0,
                total = paths.length;

            function finish() {
                if (fail == 0) onload();
                else onerror()
            }
            paths.forEach(function (path) {
                var putRequest = files.put(FS.analyzePath(path).object.contents, path);
                putRequest.onsuccess = function putRequest_onsuccess() {
                    ok++;
                    if (ok + fail == total) finish()
                };
                putRequest.onerror = function putRequest_onerror() {
                    fail++;
                    if (ok + fail == total) finish()
                }
            });
            transaction.onerror = onerror
        };
        openRequest.onerror = onerror
    },
    loadFilesFromDB: function (paths, onload, onerror) {
        onload = onload || function () {};
        onerror = onerror || function () {};
        var indexedDB = FS.indexedDB();
        try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION)
        } catch (e) {
            return onerror(e)
        }
        openRequest.onupgradeneeded = onerror;
        openRequest.onsuccess = function openRequest_onsuccess() {
            var db = openRequest.result;
            try {
                var transaction = db.transaction([FS.DB_STORE_NAME], "readonly")
            } catch (e) {
                onerror(e);
                return
            }
            var files = transaction.objectStore(FS.DB_STORE_NAME);
            var ok = 0,
                fail = 0,
                total = paths.length;

            function finish() {
                if (fail == 0) onload();
                else onerror()
            }
            paths.forEach(function (path) {
                var getRequest = files.get(path);
                getRequest.onsuccess = function getRequest_onsuccess() {
                    if (FS.analyzePath(path).exists) {
                        FS.unlink(path)
                    }
                    FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
                    ok++;
                    if (ok + fail == total) finish()
                };
                getRequest.onerror = function getRequest_onerror() {
                    fail++;
                    if (ok + fail == total) finish()
                }
            });
            transaction.onerror = onerror
        };
        openRequest.onerror = onerror
    }
};
var SOCKFS = {
    mount: function (mount) {
        return FS.createNode(null, "/", 16384 | 511, 0)
    },
    createSocket: function (family, type, protocol) {
        var streaming = type == 1;
        const familyName = SOCKFS.intToFamily(family);
        if (familyName === null || familyName === "af_unspec") {
            throw new FS.ErrnoError(5)
        }
        if (protocol && streaming && protocol != 6) {
            throw new FS.ErrnoError(5)
        }
        const SOCK_CLOEXEC = 524288;
        const SOCK_NONBLOCK = 2048;
        let option = 0;
        let socket = "socket object";
        if (type & SOCK_CLOEXEC) {
            option |= tizentvwasm.SockFlags.SOCK_CLOEXEC;
            type &= ~SOCK_CLOEXEC
        }
        if (type & SOCK_NONBLOCK) {
            option |= tizentvwasm.SockFlags.SOCK_NONBLOCK;
            type &= ~SOCK_NONBLOCK
        }
        try {
            const sockType = SOCKFS.intToSockType(type);
            if (sockType) {
                socket = tizentvwasm.SocketsManager.create(familyName, sockType, option)
            } else {
                throw new FS.ErrnoError(28)
            }
        } catch (err) {
            throw new FS.ErrnoError(28)
        }
        var sock = {
            family: family,
            type: type,
            protocol: protocol,
            sock_fd: socket,
            sock_ops: SOCKFS.webengine_sock_ops
        };
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
        var stream = FS.createStream({
            path: name,
            node: node,
            flags: FS.modeStringToFlags("r+"),
            seekable: false,
            stream_ops: SOCKFS.stream_ops
        }, true);
        sock.stream = stream;
        const id = __createSocketOnRenderThread(family, type, protocol, socket);
        FS.moveStream(sock.stream.fd, id);
        return sock
    },
    hasSocket: function (fd) {
        return _is_socket(fd) != 0
    },
    createSocketOnCurrentThread: function (family, type, protocol, socket) {
        var sock = {
            family: family,
            type: type,
            protocol: protocol,
            sock_fd: socket,
            sock_ops: SOCKFS.webengine_sock_ops
        };
        const tmp_fd = SOCKFS.createStreamOnCurrentThread();
        sock.stream = FS.getStream(tmp_fd);
        sock.stream.stream_ops = SOCKFS.stream_ops;
        sock.stream.node.sock = sock;
        return sock.stream.fd
    },
    createStreamOnCurrentThread: function () {
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        var stream = FS.createStream({
            path: name,
            node: node,
            flags: FS.modeStringToFlags("r+"),
            seekable: false,
            stream_ops: {}
        }, true);
        return stream.fd
    },
    updateStream: function (fd) {
        let stream = FS.getStream(fd);
        if (!stream) {
            if (!ENVIRONMENT_IS_PTHREAD && USE_HOST_BINDINGS) {
                const tmp_fd = SOCKFS.createStreamOnCurrentThread();
                FS.moveStream(tmp_fd, fd);
                return FS.getStream(fd)
            }
            const ptr = __cloneSocketFromRenderThread(fd);
            const family = HEAP32[ptr >> 2];
            const type = HEAP32[(ptr >> 2) + 1];
            const protocol = HEAP32[(ptr >> 2) + 2];
            const sock_fd = HEAP32[(ptr >> 2) + 3];
            const tmp_fd = SOCKFS.createSocketOnCurrentThread(family, type, protocol, sock_fd);
            FS.moveStream(tmp_fd, fd);
            _free(ptr);
            stream = FS.getStream(fd);
            if (!stream) {
                return null
            }
        }
        return stream
    },
    getSocket: function (fd) {
        if (!SOCKFS.hasSocket(fd)) {
            return null
        }
        const stream = SOCKFS.updateStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
            return null
        }
        return stream.node.sock
    },
    getStream: function (fd) {
        return SOCKFS.updateStream(fd)
    },
    getErrorCode: function (sock_fd) {
        const ErrorCodes = tizentvwasm.ErrorCodes;
        const errorCodesMap = new Map([
            [ErrorCodes.EPERM, 63],
            [ErrorCodes.ENOENT, 44],
            [ErrorCodes.ESRCH, 71],
            [ErrorCodes.EINTR, 27],
            [ErrorCodes.EIO, 29],
            [ErrorCodes.ENXIO, 60],
            [ErrorCodes.E2BIG, 1],
            [ErrorCodes.ENOEXEC, 45],
            [ErrorCodes.EBADF, 8],
            [ErrorCodes.ECHILD, 12],
            [ErrorCodes.EAGAIN, 6],
            [ErrorCodes.ENOMEM, 48],
            [ErrorCodes.EACCES, 2],
            [ErrorCodes.EFAULT, 21],
            [ErrorCodes.ENOTBLK, 105],
            [ErrorCodes.EBUSY, 10],
            [ErrorCodes.EEXIST, 20],
            [ErrorCodes.EXDEV, 75],
            [ErrorCodes.ENODEV, 43],
            [ErrorCodes.ENOTDIR, 54],
            [ErrorCodes.EISDIR, 31],
            [ErrorCodes.EINVAL, 28],
            [ErrorCodes.ENFILE, 41],
            [ErrorCodes.EMFILE, 33],
            [ErrorCodes.ENOTTY, 59],
            [ErrorCodes.ETXTBSY, 74],
            [ErrorCodes.EFBIG, 22],
            [ErrorCodes.ENOSPC, 51],
            [ErrorCodes.ESPIPE, 70],
            [ErrorCodes.EROFS, 69],
            [ErrorCodes.EMLINK, 34],
            [ErrorCodes.EPIPE, 64],
            [ErrorCodes.EDOM, 18],
            [ErrorCodes.ERANGE, 68],
            [ErrorCodes.EDEADLK, 16],
            [ErrorCodes.ENAMETOOLONG, 37],
            [ErrorCodes.ENOLCK, 46],
            [ErrorCodes.ENOSYS, 52],
            [ErrorCodes.ENOTEMPTY, 55],
            [ErrorCodes.ELOOP, 32],
            [ErrorCodes.EWOULDBLOCK, 6],
            [ErrorCodes.ENOMSG, 49],
            [ErrorCodes.EIDRM, 24],
            [ErrorCodes.ECHRNG, 106],
            [ErrorCodes.EL2NSYNC, 156],
            [ErrorCodes.EL3HLT, 107],
            [ErrorCodes.EL3RST, 108],
            [ErrorCodes.ELNRNG, 109],
            [ErrorCodes.EUNATCH, 110],
            [ErrorCodes.ENOCSI, 111],
            [ErrorCodes.EL2HLT, 112],
            [ErrorCodes.EBADE, 113],
            [ErrorCodes.EBADR, 114],
            [ErrorCodes.EXFULL, 115],
            [ErrorCodes.ENOANO, 104],
            [ErrorCodes.EBADRQC, 103],
            [ErrorCodes.EBADSLT, 102],
            [ErrorCodes.EDEADLOCK, 16],
            [ErrorCodes.EBFONT, 101],
            [ErrorCodes.ENOSTR, 100],
            [ErrorCodes.ENODATA, 116],
            [ErrorCodes.ETIME, 117],
            [ErrorCodes.ENOSR, 118],
            [ErrorCodes.ENONET, 119],
            [ErrorCodes.ENOPKG, 120],
            [ErrorCodes.EREMOTE, 121],
            [ErrorCodes.ENOLINK, 47],
            [ErrorCodes.EADV, 122],
            [ErrorCodes.ESRMNT, 123],
            [ErrorCodes.ECOMM, 124],
            [ErrorCodes.EPROTO, 65],
            [ErrorCodes.EMULTIHOP, 36],
            [ErrorCodes.EDOTDOT, 125],
            [ErrorCodes.EBADMSG, 9],
            [ErrorCodes.EOVERFLOW, 61],
            [ErrorCodes.ENOTUNIQ, 126],
            [ErrorCodes.EBADFD, 127],
            [ErrorCodes.EREMCHG, 128],
            [ErrorCodes.ELIBACC, 129],
            [ErrorCodes.ELIBBAD, 130],
            [ErrorCodes.ELIBSCN, 131],
            [ErrorCodes.ELIBMAX, 132],
            [ErrorCodes.ELIBEXEC, 133],
            [ErrorCodes.EILSEQ, 25],
            [ErrorCodes.ERESTART, 134],
            [ErrorCodes.ESTRPIPE, 135],
            [ErrorCodes.EUSERS, 136],
            [ErrorCodes.ENOTSOCK, 57],
            [ErrorCodes.EDESTADDRREQ, 17],
            [ErrorCodes.EMSGSIZE, 35],
            [ErrorCodes.EPROTOTYPE, 67],
            [ErrorCodes.ENOPROTOOPT, 50],
            [ErrorCodes.EPROTONOSUPPORT, 66],
            [ErrorCodes.ESOCKTNOSUPPORT, 137],
            [ErrorCodes.EOPNOTSUPP, 138],
            [ErrorCodes.ENOTSUP, 138],
            [ErrorCodes.EPFNOSUPPORT, 139],
            [ErrorCodes.EAFNOSUPPORT, 5],
            [ErrorCodes.EADDRINUSE, 3],
            [ErrorCodes.EADDRNOTAVAIL, 4],
            [ErrorCodes.ENETDOWN, 38],
            [ErrorCodes.ENETUNREACH, 40],
            [ErrorCodes.ENETRESET, 39],
            [ErrorCodes.ECONNABORTED, 13],
            [ErrorCodes.ECONNRESET, 15],
            [ErrorCodes.ENOBUFS, 42],
            [ErrorCodes.EISCONN, 30],
            [ErrorCodes.ENOTCONN, 53],
            [ErrorCodes.ESHUTDOWN, 140],
            [ErrorCodes.ETOOMANYREFS, 141],
            [ErrorCodes.ETIMEDOUT, 73],
            [ErrorCodes.ECONNREFUSED, 14],
            [ErrorCodes.EHOSTDOWN, 142],
            [ErrorCodes.EHOSTUNREACH, 23],
            [ErrorCodes.EALREADY, 7],
            [ErrorCodes.EINPROGRESS, 26],
            [ErrorCodes.ESTALE, 72],
            [ErrorCodes.EUCLEAN, 143],
            [ErrorCodes.ENOTNAM, 144],
            [ErrorCodes.ENAVAIL, 145],
            [ErrorCodes.EISNAM, 146],
            [ErrorCodes.EREMOTEIO, 147],
            [ErrorCodes.EDQUOT, 19],
            [ErrorCodes.ENOMEDIUM, 148],
            [ErrorCodes.EMEDIUMTYPE, 149],
            [ErrorCodes.ECANCELED, 11],
            [ErrorCodes.ENOKEY, 150],
            [ErrorCodes.EKEYEXPIRED, 151],
            [ErrorCodes.EKEYREVOKED, 152],
            [ErrorCodes.EKEYREJECTED, 153],
            [ErrorCodes.EOWNERDEAD, 62],
            [ErrorCodes.ENOTRECOVERABLE, 56],
            [ErrorCodes.ERFKILL, 154],
            [ErrorCodes.EHWPOISON, 155]
        ]);
        try {
            const error = typeof sock_fd == "undefined" ? tizentvwasm.SocketsManager.getErrorCode() : tizentvwasm.SocketsManager.getErrorCode(sock_fd);
            if (errorCodesMap.has(error)) {
                return errorCodesMap.get(error)
            } else if (error != 0) {
                return 28
            } else {
                return 0
            }
        } catch (err) {
            return 8
        }
    },
    stream_ops: {
        poll: function (stream) {
            var sock = stream.node.sock;
            return sock.sock_ops.poll(sock)
        },
        ioctl: function (stream, request, varargs) {
            console.log("SOCKFS ioctl() not implemented")
        },
        read: function (stream, buffer, offset, length, position) {
            const sock = stream.node.sock.sock_fd;
            const data = HEAPU8.subarray(offset, offset + length);
            try {
                return tizentvwasm.SocketsManager.recv(sock, data, 0)
            } catch (err) {
                throw new FS.ErrnoError(SOCKFS.getErrorCode(sock))
            }
        },
        write: function (stream, buffer, offset, length, position) {
            var sock = stream.node.sock.sock_fd;
            const data = HEAPU8.subarray(offset, offset + length);
            try {
                return tizentvwasm.SocketsManager.send(sock, data, 0)
            } catch (err) {
                throw new FS.ErrnoError(SOCKFS.getErrorCode(sock))
            }
        },
        close: function (stream) {
            const sock = stream.node.sock;
            const fd = stream.fd;
            FS.destroyNode(stream.node);
            FS.closeStream(stream);
            sock.sock_ops.close(sock);
            __closeSocketOnRenderThread(fd)
        }
    },
    nextname: function () {
        if (!SOCKFS.nextname.current) {
            SOCKFS.nextname.current = 0
        }
        return "socket[" + SOCKFS.nextname.current++ + "]"
    },
    webengine_sock_ops: {
        sizeof: {
            SOCKADDR_IN: 16,
            SOCKADDR_IN6: 28,
            HOSTENT: 20,
            FD_SET: 128,
            IPv4ADDR: 4,
            IPv6ADDR: 16
        },
        poll: function (sock) {
            if (sock.sock_fd === -1) {
                return 32
            }
            const PollFlags = tizentvwasm.PollFlags;
            const events = PollFlags.POLLIN | PollFlags.POLLRDNORM | PollFlags.POLLPRI | PollFlags.POLLOUT | PollFlags.POLLWRNORM;
            const poll_fd = new tizentvwasm.PollFd(sock.sock_fd, events);
            try {
                const result = tizentvwasm.SocketsManager.poll([poll_fd], 0)
            } catch (err) {
                throw new FS.ErrnoError(SOCKFS.getErrorCode())
            }
            return SOCKFS.pollEventsConvertFromJS(poll_fd.revents)
        },
        ioctl: function (sock, request, arg) {
            console.log("SOCKFS ioctl() not implemented")
        },
        close: function (sock) {
            try {
                tizentvwasm.SocketsManager.close(sock.sock_fd)
            } catch (err) {
                throw new FS.ErrnoError(SOCKFS.getErrorCode(sock.sock_fd))
            } finally {
                sock.sock_fd = -1
            }
            return 0
        },
        bind: function (sock, addr, addrlen) {
            if (!addr) {
                throw new FS.ErrnoError(21)
            }
            if (!addrlen) {
                throw new FS.ErrnoError(28)
            }
            const sockaddr = HEAPU8.subarray(addr, addr + addrlen);
            const netAddr = SOCKFS.createNetAddressFromBytes(sockaddr);
            try {
                tizentvwasm.SocketsManager.bind(sock.sock_fd, netAddr)
            } catch (err) {
                throw new FS.ErrnoError(SOCKFS.getErrorCode(sock.sock_fd))
            }
            return 0
        },
        connect: function (sock, addr, addrlen) {
            if (!addr) {
                throw new FS.ErrnoError(21)
            }
            if (!addrlen) {
                throw new FS.ErrnoError(28)
            }
            const sockaddr = HEAPU8.subarray(addr, addr + addrlen);
            const netAddr = SOCKFS.createNetAddressFromBytes(sockaddr);
            try {
                tizentvwasm.SocketsManager.connect(sock.sock_fd, netAddr)
            } catch (err) {
                throw new FS.ErrnoError(SOCKFS.getErrorCode(sock.sock_fd))
            }
            return 0
        },
        listen: function (sock, backlog) {
            if (sock.type !== SOCKFS.SockType.SOCK_STREAM.value) {
                throw new FS.ErrnoError(138);
                return -1
            }
            try {
                tizentvwasm.SocketsManager.listen(sock.sock_fd, backlog)
            } catch (err) {
                throw new FS.ErrnoError(SOCKFS.getErrorCode(sock.sock_fd))
            }
            return 0
        },
        accept: function (listensock, addr, addrlen) {
            try {
                const newSockSync = tizentvwasm.SocketsManager.accept4(listensock.sock_fd, 0);
                if (addr && addrlen) {
                    const peerAddr = SOCKFS.createBytesFromNetAddress(tizentvwasm.SocketsManager.getPeerName(newSockSync));
                    const len = HEAP32[addrlen >> 2];
                    HEAP8.set(peerAddr.subarray(0, len), addr);
                    HEAP32[addrlen >> 2] = peerAddr.length
                }
                var sock = {
                    family: listensock.family,
                    type: listensock.type,
                    protocol: listensock.protocol,
                    sock_fd: newSockSync,
                    sock_ops: SOCKFS.webengine_sock_ops
                };
                var name = SOCKFS.nextname();
                var node = FS.createNode(SOCKFS.root, name, 49152, 0);
                node.sock = sock;
                var stream = FS.createStream({
                    path: name,
                    node: node,
                    flags: FS.modeStringToFlags("r+"),
                    seekable: false,
                    stream_ops: SOCKFS.stream_ops
                }, true);
                sock.stream = stream;
                const id = __createSocketOnRenderThread(listensock.family, listensock.type, listensock.protocol, newSockSync);
                FS.moveStream(sock.stream.fd, id);
                let fd = sock.stream.fd;
                let st = FS.getStream(fd);
                return sock
            } catch (err) {
                throw new FS.ErrnoError(SOCKFS.getErrorCode(listensock.sock_fd))
            }
        },
        getname: function (sock, peer) {
            console.log("SOCKFS getname() not implemented")
        },
        sendto: function (sock, addr, addrlen, flags, dest, destlen) {
            const data = HEAPU8.subarray(addr, addr + addrlen);
            let netAddr = null;
            if (dest && destlen) {
                const sockaddr = HEAPU8.subarray(dest, dest + destlen);
                netAddr = SOCKFS.createNetAddressFromBytes(sockaddr);
                try {
                    return tizentvwasm.SocketsManager.sendTo(sock.sock_fd, data, SOCKFS.msgFlagsToJs(flags), netAddr)
                } catch (err) {
                    throw new FS.ErrnoError(SOCKFS.getErrorCode(sock.sock_fd))
                }
            } else {
                try {
                    return tizentvwasm.SocketsManager.send(sock.sock_fd, data, SOCKFS.msgFlagsToJs(flags))
                } catch (err) {
                    throw new FS.ErrnoError(SOCKFS.getErrorCode(sock.sock_fd))
                }
            }
        },
        sendmsg: function (sock, msgPtr, flags) {
            const name = HEAP32[msgPtr >> 2];
            const namelen = HEAP32[msgPtr + 4 >> 2];
            const iov = HEAP32[msgPtr + 8 >> 2];
            const iovlen = HEAP32[msgPtr + 12 >> 2];
            let address = null;
            if (name && namelen) {
                const sockaddr = HEAPU8.subarray(name, name + namelen);
                address = SOCKFS.createNetAddressFromBytes(sockaddr)
            }
            let msgs = [];
            for (let i = 0; i < iovlen; ++i) {
                msgs.push(new Uint8Array(buffer, HEAP32[iov + (8 * i + 0) >> 2], HEAP32[iov + (8 * i + 4) >> 2]))
            }
            try {
                return tizentvwasm.SocketsManager.sendMsg(sock.sock_fd, address, msgs, SOCKFS.msgFlagsToJs(flags))
            } catch (err) {
                throw new FS.ErrnoError(SOCKFS.getErrorCode(sock.sock_fd))
            }
        },
        recvfrom: function (sock, bufPtr, len, flags, addrPtr, addrlenPtr) {
            const data = HEAPU8.subarray(bufPtr, bufPtr + len);
            if (!addrPtr || !addrlenPtr) {
                try {
                    return tizentvwasm.SocketsManager.recv(sock.sock_fd, data, SOCKFS.msgFlagsToJs(flags))
                } catch (err) {
                    throw new FS.ErrnoError(SOCKFS.getErrorCode(sock.sock_fd))
                }
            }
            let retVal = null;
            try {
                retVal = tizentvwasm.SocketsManager.recvFrom(sock.sock_fd, data, SOCKFS.msgFlagsToJs(flags))
            } catch (err) {
                throw new FS.ErrnoError(SOCKFS.getErrorCode(sock.sock_fd))
            }
            if (addrPtr && addrlenPtr && retVal.peerAddress != null) {
                const peerAddr = SOCKFS.createBytesFromNetAddress(retVal.peerAddress);
                const addrlen = Math.min(HEAP32[addrlenPtr >> 2], peerAddr.length);
                HEAP8.set(peerAddr.subarray(0, addrlen), addrPtr);
                HEAP32[addrlenPtr >> 2] = addrlen
            }
            return retVal.bytesRead
        },
        recvmsg: function (sock, msgPtr, flags) {
            const name = HEAP32[msgPtr >> 2];
            const namelen = HEAP32[msgPtr + 4 >> 2];
            const iov = HEAP32[msgPtr + 8 >> 2];
            const iovlen = HEAP32[msgPtr + 12 >> 2];
            const msgs = [];
            for (let i = 0; i < iovlen; ++i) {
                msgs.push(new Uint8Array(buffer, HEAP32[iov + (8 * i + 0) >> 2], HEAP32[iov + (8 * i + 4) >> 2]))
            }
            let ret = null;
            try {
                ret = tizentvwasm.SocketsManager.recvMsg(sock.sock_fd, msgs, SOCKFS.msgFlagsToJs(flags))
            } catch (err) {
                throw new FS.ErrnoError(SOCKFS.getErrorCode(sock.sock_fd))
            }
            const ret_flags = SOCKFS.msgFlagsFromJs(ret.flags);
            if (name && namelen && ret.peerAddress) {
                const peerAddress = SOCKFS.createBytesFromNetAddress(ret.peerAddress);
                const addrLen = Math.min(namelen, peerAddress.length);
                HEAP8.set(peerAddress.subarray(0, addrLen), name);
                HEAP32[msgPtr + 4 >> 2] = addrLen
            }
            HEAP32[msgPtr + 24 >> 2] = ret_flags;
            return ret.bytesRead
        },
        setsockopt: function (sock, level, optname, optval, optlen) {
            if (!optval) {
                throw new FS.ErrnoError(21)
            }
            if (!optlen) {
                throw new FS.ErrnoError(28)
            }
            const args = SOCKFS.getLevelAndOptionString(level, optname);
            const _optval = HEAPU8.slice(optval, optval + optlen);
            const value = SOCKFS.decodeValue(args, _optval);
            try {
                tizentvwasm.SocketsManager.setSockOpt(sock.sock_fd, args.level, args.option, value)
            } catch (err) {
                throw new FS.ErrnoError(SOCKFS.getErrorCode(sock.sock_fd))
            }
            return 0
        },
        getsockopt: function (sock, level, optname, optval, optlen) {
            if (!optval || !optlen) {
                throw new FS.ErrnoError(21)
            }
            const _optlen = HEAP32[optlen >> 2];
            if (!_optlen) {
                throw new FS.ErrnoError(28)
            }
            let val;
            const args = SOCKFS.getLevelAndOptionString(level, optname, true);
            try {
                val = tizentvwasm.SocketsManager.getSockOpt(sock.sock_fd, args.level, args.option)
            } catch (err) {
                throw new FS.ErrnoError(SOCKFS.getErrorCode(sock.sock_fd))
            }
            const encVal = SOCKFS.encodeValue(args, val, _optlen);
            HEAPU8.set(encVal, optval);
            HEAP32[optlen >> 2] = encVal.length;
            return 0
        },
        getsockname: function (sock, addr, addrlen) {
            try {
                const sockAddress = tizentvwasm.SocketsManager.getSockName(sock.sock_fd);
                const sockAddr = SOCKFS.createBytesFromNetAddress(sockAddress);
                const len = HEAP32[addrlen >> 2];
                HEAP8.set(sockAddr.subarray(0, len), addr);
                HEAP32[addrlen >> 2] = sockAddr.length;
                return 0
            } catch (err) {
                throw new FS.ErrnoError(SOCKFS.getErrorCode(sock.sock_fd))
            }
        },
        getpeername: function (sock, addr, addrlen) {
            try {
                const peerAddress = tizentvwasm.SocketsManager.getPeerName(sock.sock_fd);
                const peerAddr = SOCKFS.createBytesFromNetAddress(peerAddress);
                const len = HEAP32[addrlen >> 2];
                HEAP8.set(peerAddr.subarray(0, len), addr);
                HEAP32[addrlen >> 2] = peerAddr.length;
                return 0
            } catch (err) {
                throw new FS.ErrnoError(SOCKFS.getErrorCode(sock.sock_fd))
            }
        },
        shutdown: function (sock, how) {
            const howFlag = SOCKFS.intToShutdownType(how);
            if (howFlag === null) {
                throw new FS.ErrnoError(28)
            }
            try {
                tizentvwasm.SocketsManager.shutdown(sock.sock_fd, howFlag);
                return 0
            } catch (err) {
                throw new FS.ErrnoError(SOCKFS.getErrorCode(sock.sock_fd))
            }
        }
    },
    sizeof: {
        SOCKADDR_IN: 16,
        SOCKADDR_IN6: 28,
        HOSTENT: 20,
        FD_SET: 128,
        IPv4ADDR: 4,
        IPv6ADDR: 16
    },
    conf: {
        HOST_BUFFER_SIZE: 1024,
        MAX_HOST_ADDRESSES: 35,
        MAX_HOST_ALIASES: 35,
        loggingEnabled: true
    },
    storage: {
        host: 647696,
        hostAliasPtrs: 647728,
        hostAddrPtrs: 647776,
        hostBuffer: 647824
    },
    levelsAndOptions: {
        sol_socket: {
            value: 1,
            options: {
                so_broadcast: {
                    value: 6,
                    encoder: function (value, len) {
                        if (len < 4) {
                            throw new FS.ErrnoError(28)
                        }
                        encodeVal = new Uint8Array(4);
                        new DataView(encodeVal.buffer).setUint32(0, value, true);
                        return encodeVal
                    },
                    decoder: function (data) {
                        return new DataView(data.buffer).getUint32(0, true)
                    }
                },
                so_debug: {
                    value: 1,
                    encoder: function (value, len) {
                        if (len < 4) {
                            throw new FS.ErrnoError(28)
                        }
                        encodeVal = new Uint8Array(4);
                        new DataView(encodeVal.buffer).setUint32(0, value, true);
                        return encodeVal
                    },
                    decoder: function (data) {
                        return new DataView(data.buffer).getUint32(0, true)
                    }
                },
                so_dontroute: {
                    value: 5,
                    encoder: function (value, len) {
                        if (len < 4) {
                            throw new FS.ErrnoError(28)
                        }
                        encodeVal = new Uint8Array(4);
                        new DataView(encodeVal.buffer).setUint32(0, value, true);
                        return encodeVal
                    },
                    decoder: function (data) {
                        return new DataView(data.buffer).getUint32(0, true)
                    }
                },
                so_error: {
                    value: 4,
                    encoder: function (value, len) {
                        if (len < 4) {
                            throw new FS.ErrnoError(28)
                        }
                        encodeVal = new Uint8Array(4);
                        new DataView(encodeVal.buffer).setUint32(0, value, true);
                        return encodeVal
                    },
                    decoder: function (data) {
                        return new DataView(data.buffer).getUint32(0, true)
                    }
                },
                so_keepalive: {
                    value: 9,
                    encoder: function (value, len) {
                        if (len < 4) {
                            throw new FS.ErrnoError(28)
                        }
                        encodeVal = new Uint8Array(4);
                        new DataView(encodeVal.buffer).setUint32(0, value, true);
                        return encodeVal
                    },
                    decoder: function (data) {
                        return new DataView(data.buffer).getUint32(0, true)
                    }
                },
                so_linger: {
                    value: 13,
                    encoder: function (value, len) {
                        if (len < 4) {
                            throw new FS.ErrnoError(28)
                        }
                        encodeVal = new Uint8Array(8);
                        new DataView(encodeVal.buffer).setUint32(0, value.onoff, true);
                        new DataView(encodeVal.buffer).setUint32(4, value.linger, true);
                        return encodeVal
                    },
                    decoder: function (data) {
                        const onoff = new DataView(data.buffer).getUint32(0, true);
                        const linger = new DataView(data.buffer).getUint32(4, true);
                        return new tizentvwasm.SockOptSoLinger(onoff, linger)
                    }
                },
                so_oobinline: {
                    value: 10,
                    encoder: function (value, len) {
                        if (len < 4) {
                            throw new FS.ErrnoError(28)
                        }
                        encodeVal = new Uint8Array(4);
                        new DataView(encodeVal.buffer).setUint32(0, value, true);
                        return encodeVal
                    },
                    decoder: function (data) {
                        return new DataView(data.buffer).getUint32(0, true)
                    }
                },
                so_rcvbuf: {
                    value: 8,
                    encoder: function (value, len) {
                        if (len < 4) {
                            throw new FS.ErrnoError(28)
                        }
                        encodeVal = new Uint8Array(4);
                        new DataView(encodeVal.buffer).setUint32(0, value, true);
                        return encodeVal
                    },
                    decoder: function (data) {
                        return new DataView(data.buffer).getUint32(0, true)
                    }
                },
                so_rcvlowat: {
                    value: 18,
                    encoder: function (value, len) {
                        if (len < 4) {
                            throw new FS.ErrnoError(28)
                        }
                        encodeVal = new Uint8Array(4);
                        new DataView(encodeVal.buffer).setUint32(0, value, true);
                        return encodeVal
                    },
                    decoder: function (data) {
                        return new DataView(data.buffer).getUint32(0, true)
                    }
                },
                so_rcvtimeo: {
                    value: 20,
                    encoder: function (value, len) {
                        if (len < 8) {
                            throw new FS.ErrnoError(28)
                        }
                        encodeVal = new Uint8Array(8);
                        new DataView(encodeVal.buffer).setUint32(0, value.seconds, true, true);
                        new DataView(encodeVal.buffer).setUint32(4, value.microseconds, true, true);
                        return encodeVal
                    },
                    decoder: function (data) {
                        const sec = new DataView(data.buffer).getUint32(0, true);
                        const usec = new DataView(data.buffer).getUint32(4, true);
                        return new tizentvwasm.SockOptTimeVal(sec, usec)
                    }
                },
                so_reuseaddr: {
                    value: 2,
                    encoder: function (value, len) {
                        if (len < 4) {
                            throw new FS.ErrnoError(28)
                        }
                        encodeVal = new Uint8Array(4);
                        new DataView(encodeVal.buffer).setUint32(0, value, true);
                        return encodeVal
                    },
                    decoder: function (data) {
                        return new DataView(data.buffer).getUint32(0, true)
                    }
                },
                so_sndbuf: {
                    value: 7,
                    encoder: function (value, len) {
                        if (len < 4) {
                            throw new FS.ErrnoError(28)
                        }
                        encodeVal = new Uint8Array(4);
                        new DataView(encodeVal.buffer).setUint32(0, value, true);
                        return encodeVal
                    },
                    decoder: function (data) {
                        return new DataView(data.buffer).getUint32(0, true)
                    }
                },
                so_sndlowat: {
                    value: 19,
                    encoder: function (value, len) {
                        if (len < 4) {
                            throw new FS.ErrnoError(28)
                        }
                        encodeVal = new Uint8Array(4);
                        new DataView(encodeVal.buffer).setUint32(0, value, true);
                        return encodeVal
                    },
                    decoder: function (data) {
                        return new DataView(data.buffer).getUint32(0, true)
                    }
                },
                so_sndtimeo: {
                    value: 21,
                    encoder: function (value, len) {
                        if (len < 8) {
                            throw new FS.ErrnoError(28)
                        }
                        encodeVal = new Uint8Array(8);
                        new DataView(encodeVal.buffer).setUint32(0, value.seconds, true, true);
                        new DataView(encodeVal.buffer).setUint32(4, value.microseconds, true, true);
                        return encodeVal
                    },
                    decoder: function (data) {
                        const sec = new DataView(data.buffer).getUint32(0, true);
                        const usec = new DataView(data.buffer).getUint32(4, true);
                        return new tizentvwasm.SockOptTimeVal(sec, usec)
                    }
                }
            }
        },
        ipproto_ip: {
            value: 0,
            options: {
                ip_add_membership: {
                    value: 35,
                    decoder: function (data) {
                        const multiaddr = new Uint8Array(SOCKFS.sizeof.IPv4ADDR);
                        const address = new Uint8Array(SOCKFS.sizeof.IPv4ADDR);
                        const dataView = new DataView(data.buffer);
                        for (let i = 0; i < SOCKFS.sizeof.IPv4ADDR; i++) {
                            multiaddr[i] = dataView.getUint8(i);
                            address[i] = dataView.getUint8(i + SOCKFS.sizeof.IPv4ADDR)
                        }
                        return new tizentvwasm.IpMreq(new tizentvwasm.InetAddress(multiaddr), new tizentvwasm.InetAddress(address))
                    }
                },
                ip_add_source_membership: {
                    value: 39,
                    decoder: function (data) {
                        const multiaddr = new Uint8Array(SOCKFS.sizeof.IPv4ADDR);
                        const local_interface = new Uint8Array(SOCKFS.sizeof.IPv4ADDR);
                        const sourceaddr = new Uint8Array(SOCKFS.sizeof.IPv4ADDR);
                        const dataView = new DataView(data.buffer);
                        for (let i = 0; i < SOCKFS.sizeof.IPv4ADDR; i++) {
                            multiaddr[i] = dataView.getUint8(i);
                            local_interface[i] = dataView.getUint8(i + SOCKFS.sizeof.IPv4ADDR);
                            sourceaddr[i] = dataView.getUint8(i + 2 * SOCKFS.sizeof.IPv4ADDR)
                        }
                        return new tizentvwasm.IpMreqSource(new tizentvwasm.InetAddress(multiaddr), new tizentvwasm.InetAddress(local_interface), new tizentvwasm.InetAddress(sourceaddr))
                    }
                },
                ip_block_source: {
                    value: 38,
                    decoder: function (data) {
                        const multiaddr = new Uint8Array(SOCKFS.sizeof.IPv4ADDR);
                        const local_interface = new Uint8Array(SOCKFS.sizeof.IPv4ADDR);
                        const sourceaddr = new Uint8Array(SOCKFS.sizeof.IPv4ADDR);
                        const dataView = new DataView(data.buffer);
                        for (let i = 0; i < SOCKFS.sizeof.IPv4ADDR; i++) {
                            multiaddr[i] = dataView.getUint8(i);
                            local_interface[i] = dataView.getUint8(i + SOCKFS.sizeof.IPv4ADDR);
                            sourceaddr[i] = dataView.getUint8(i + 2 * SOCKFS.sizeof.IPv4ADDR)
                        }
                        return new tizentvwasm.IpMreqSource(new tizentvwasm.InetAddress(multiaddr), new tizentvwasm.InetAddress(local_interface), new tizentvwasm.InetAddress(sourceaddr))
                    }
                },
                ip_drop_membership: {
                    value: 36,
                    decoder: function (data) {
                        const multiaddr = new Uint8Array(SOCKFS.sizeof.IPv4ADDR);
                        const address = new Uint8Array(SOCKFS.sizeof.IPv4ADDR);
                        const dataView = new DataView(data.buffer);
                        for (let i = 0; i < SOCKFS.sizeof.IPv4ADDR; i++) {
                            multiaddr[i] = dataView.getUint8(i);
                            address[i] = dataView.getUint8(i + SOCKFS.sizeof.IPv4ADDR)
                        }
                        return new tizentvwasm.IpMreq(new tizentvwasm.InetAddress(multiaddr), new tizentvwasm.InetAddress(address))
                    }
                },
                ip_drop_source_membership: {
                    value: 40,
                    decoder: function (data) {
                        const multiaddr = new Uint8Array(SOCKFS.sizeof.IPv4ADDR);
                        const local_interface = new Uint8Array(SOCKFS.sizeof.IPv4ADDR);
                        const sourceaddr = new Uint8Array(SOCKFS.sizeof.IPv4ADDR);
                        const dataView = new DataView(data.buffer);
                        for (let i = 0; i < SOCKFS.sizeof.IPv4ADDR; i++) {
                            multiaddr[i] = dataView.getUint8(i);
                            local_interface[i] = dataView.getUint8(i + SOCKFS.sizeof.IPv4ADDR);
                            sourceaddr[i] = dataView.getUint8(i + 2 * SOCKFS.sizeof.IPv4ADDR)
                        }
                        return new tizentvwasm.IpMreqSource(new tizentvwasm.InetAddress(multiaddr), new tizentvwasm.InetAddress(local_interface), new tizentvwasm.InetAddress(sourceaddr))
                    }
                },
                ip_multicast_loop: {
                    value: 34,
                    encoder: function (value, len) {
                        if (len < 1) {
                            throw new FS.ErrnoError(28)
                        }
                        encodeVal = new Uint8Array(1);
                        new DataView(encodeVal.buffer).setUint8(0, value);
                        return encodeVal
                    },
                    decoder: function (data) {
                        return new DataView(data.buffer).getUint8(0)
                    }
                },
                ip_multicast_ttl: {
                    value: 33,
                    encoder: function (value, len) {
                        if (len < 1) {
                            throw new FS.ErrnoError(28)
                        }
                        encodeVal = new Uint8Array(1);
                        new DataView(encodeVal.buffer).setUint8(0, value);
                        return encodeVal
                    },
                    decoder: function (data) {
                        return new DataView(data.buffer).getUint8(0)
                    }
                },
                ip_unblock_source: {
                    value: 37,
                    decoder: function (data) {
                        const multiaddr = new Uint8Array(SOCKFS.sizeof.IPv4ADDR);
                        const local_interface = new Uint8Array(SOCKFS.sizeof.IPv4ADDR);
                        const sourceaddr = new Uint8Array(SOCKFS.sizeof.IPv4ADDR);
                        const dataView = new DataView(data.buffer);
                        for (let i = 0; i < SOCKFS.sizeof.IPv4ADDR; i++) {
                            multiaddr[i] = dataView.getUint8(i);
                            local_interface[i] = dataView.getUint8(i + SOCKFS.sizeof.IPv4ADDR);
                            sourceaddr[i] = dataView.getUint8(i + 2 * SOCKFS.sizeof.IPv4ADDR)
                        }
                        return new tizentvwasm.IpMreqSource(new tizentvwasm.InetAddress(multiaddr), new tizentvwasm.InetAddress(local_interface), new tizentvwasm.InetAddress(sourceaddr))
                    }
                }
            }
        },
        ipproto_ipv6: {
            value: 41,
            options: {
                ipv6_join_group: {
                    value: 20,
                    decoder: function (data) {
                        const multiaddr = new Uint8Array(SOCKFS.sizeof.IPv6ADDR);
                        const dataView = new DataView(data.buffer);
                        for (let i = 0; i < SOCKFS.sizeof.IPv6ADDR; i++) {
                            multiaddr[i] = dataView.getUint8(i)
                        }
                        return new tizentvwasm.Ipv6Mreq(new tizentvwasm.InetAddress(multiaddr))
                    }
                },
                ipv6_leave_group: {
                    value: 21,
                    decoder: function (data) {
                        const multiaddr = new Uint8Array(SOCKFS.sizeof.IPv6ADDR);
                        const dataView = new DataView(data.buffer);
                        for (let i = 0; i < SOCKFS.sizeof.IPv6ADDR; i++) {
                            multiaddr[i] = dataView.getUint8(i)
                        }
                        return new tizentvwasm.Ipv6Mreq(new tizentvwasm.InetAddress(multiaddr))
                    }
                },
                ipv6_multicast_hops: {
                    value: 18,
                    encoder: function (value, len) {
                        if (len < 4) {
                            throw new FS.ErrnoError(28)
                        }
                        encodeVal = new Uint8Array(4);
                        new DataView(encodeVal.buffer).setUint32(0, value, true);
                        return encodeVal
                    },
                    decoder: function (data) {
                        return new DataView(data.buffer).getUint32(0, true)
                    }
                },
                ipv6_multicast_loop: {
                    value: 19,
                    encoder: function (value, len) {
                        if (len < 4) {
                            throw new FS.ErrnoError(28)
                        }
                        encodeVal = new Uint8Array(4);
                        new DataView(encodeVal.buffer).setUint32(0, value, true);
                        return encodeVal
                    },
                    decoder: function (data) {
                        return new DataView(data.buffer).getUint32(0, true)
                    }
                }
            }
        },
        ipproto_tcp: {
            value: 6,
            options: {
                tcp_nodelay: {
                    value: 1,
                    encoder: function (value, len) {
                        if (len < 4) {
                            throw new FS.ErrnoError(28)
                        }
                        encodeVal = new Uint8Array(4);
                        new DataView(encodeVal.buffer).setUint32(0, value, true);
                        return encodeVal
                    },
                    decoder: function (data) {
                        return new DataView(data.buffer).getUint32(0, true)
                    }
                }
            }
        }
    },
    findOptLevel: function (integer) {
        for (const key in SOCKFS.levelsAndOptions) {
            if (SOCKFS.levelsAndOptions[key].value == integer) {
                return key
            }
        }
        return null
    },
    findOptName: function (opts, integer) {
        for (const key in opts) {
            if (opts[key].value == integer) {
                return key
            }
        }
        return null
    },
    convertToEnum: function (object, integer) {
        for (const key in object) {
            if (object[key].value === integer) {
                return object[key].name
            }
        }
        return null
    },
    convertToInt: function (object, enumeration) {
        for (const key in object) {
            if (object[key].name === enumeration) {
                return object[key].value
            }
        }
    },
    Family: {
        AF_UNSPEC: {
            name: "af_unspec",
            value: 0
        },
        AF_INET: {
            name: "af_inet",
            value: 2
        },
        AF_INET6: {
            name: "af_inet6",
            value: 10
        }
    },
    SockType: {
        SOCK_ANY: {
            name: "sock_any",
            value: 0
        },
        SOCK_STREAM: {
            name: "sock_stream",
            value: 1
        },
        SOCK_DGRAM: {
            name: "sock_dgram",
            value: 2
        }
    },
    Protocol: {
        IPPROTO_IP: {
            name: "ipproto_ip",
            value: 0
        },
        IPPROTO_TCP: {
            name: "ipproto_tcp",
            value: 6
        },
        IPPROTO_UDP: {
            name: "ipproto_udp",
            value: 17
        }
    },
    ShutdownType: {
        SHUT_RD: {
            name: "shut_rd",
            value: 0
        },
        SHUT_WR: {
            name: "shut_wr",
            value: 1
        },
        SHUT_RDWR: {
            name: "shut_rdwr",
            value: 2
        }
    },
    intToFamily: function (family) {
        return SOCKFS.convertToEnum(SOCKFS.Family, family)
    },
    intToSockType: function (type) {
        return SOCKFS.convertToEnum(SOCKFS.SockType, type)
    },
    intToShutdownType: function (type) {
        return SOCKFS.convertToEnum(SOCKFS.ShutdownType, type)
    },
    createNetAddress__deps: ["_inet_pton6_raw"],
    createNetAddress: function (address, port) {
        let addrBytes;
        let family;
        const ipv4 = address.split(".");
        if (ipv4.length == 4) {
            addrBytes = new Uint8Array(4);
            for (i in ipv4) {
                addrBytes[i] = parseInt(ipv4[i])
            }
            family = "af_inet"
        } else {
            let addr = __inet_pton6_raw(address);
            let buffer = new ArrayBuffer(16);
            let view = new Uint16Array(buffer);
            addrBytes = new Uint8Array(buffer);
            for (let i = 0; i < 8; i++) {
                view[i] = addr[i]
            }
            family = "af_inet6"
        }
        return new tizentvwasm.NetAddress(family, addrBytes, port)
    },
    createNetAddressFromBytes: function (bytes) {
        const familyId = bytes[0];
        let family;
        let addrBytes;
        const port = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint16(2, false);
        switch (familyId) {
            case SOCKFS.Family.AF_INET.value:
                family = "af_inet";
                addrBytes = bytes.subarray(4, 4 + SOCKFS.sizeof.IPv4ADDR);
                break;
            case SOCKFS.Family.AF_INET6.value:
                family = "af_inet6";
                addrBytes = bytes.subarray(8, 8 + SOCKFS.sizeof.IPv6ADDR);
                break;
            default:
                throw new FS.ErrnoError(28)
        }
        return new tizentvwasm.NetAddress(family, addrBytes, port)
    },
    getLevelAndOptionString: function (level, option, fromGet) {
        const levelName = SOCKFS.findOptLevel(level);
        if (!levelName) {
            if (fromGet) {
                throw new FS.ErrnoError(138)
            } else {
                throw new FS.ErrnoError(50)
            }
        }
        const optionName = SOCKFS.findOptName(SOCKFS.levelsAndOptions[levelName].options, option);
        if (!optionName) {
            throw new FS.ErrnoError(50)
        }
        return {
            "level": levelName,
            "option": optionName
        }
    },
    decodeValue: function (args, data) {
        const valueMap = SOCKFS.levelsAndOptions[args.level].options[args.option];
        if (!valueMap.hasOwnProperty("decoder")) {
            return undefined
        }
        return valueMap.decoder(data)
    },
    encodeValue: function (args, value, len) {
        const valueMap = SOCKFS.levelsAndOptions[args.level].options[args.option];
        if (!valueMap.hasOwnProperty("encoder")) {
            return new Uint8Array(len)
        }
        return valueMap.encoder(value, len)
    },
    createBytesFromNetAddress: function (netAddr) {
        let bytes;
        switch (netAddr.family) {
            case "af_inet":
                bytes = new Uint8Array(SOCKFS.sizeof.SOCKADDR_IN);
                for (let i = 0; i < bytes.length; i++) {
                    bytes[i] = 0
                }
                bytes[0] = SOCKFS.Family.AF_INET.value;
                new DataView(bytes.buffer).setUint16(2, netAddr.port, false);
                bytes.set(netAddr.bytes, 4);
                break;
            case "af_inet6":
                bytes = new Uint8Array(SOCKFS.sizeof.SOCKADDR_IN6);
                for (let i = 0; i < bytes.length; i++) {
                    bytes[i] = 0
                }
                bytes[0] = SOCKFS.Family.AF_INET6.value;
                new DataView(bytes.buffer).setUint16(2, netAddr.port, false);
                bytes.set(netAddr.bytes, 8);
                break;
            default:
                throw new FS.ErrnoError(28)
        }
        return bytes
    },
    createAddrFromNetAddress: function (netAddr) {
        let addr;
        let bytes = netAddr.bytes;
        let byte2hex = function (value) {
            return ("0" + value.toString(16)).substr(-2)
        };
        switch (netAddr.family) {
            case "af_inet":
                addr = bytes[0].toString();
                for (let i = 1; i < 4; i++) {
                    addr = addr + "." + bytes[i]
                }
                break;
            case "af_inet6":
                addr = byte2hex(bytes[0]);
                addr = addr + byte2hex(bytes[1]);
                for (let i = 1; i < bytes.length / 2; i++) {
                    addr = addr + ":" + byte2hex(bytes[2 * i]) + byte2hex(bytes[2 * i + 1])
                }
                break;
            default:
                throw new FS.ErrnoError(28)
        }
        return addr
    },
    pollFlagsMap: function () {
        const PollFlags = tizentvwasm.PollFlags;
        const flagsMap = new Map([
            [PollFlags.POLLIN, 1],
            [PollFlags.POLLRDNORM, 64],
            [PollFlags.POLLRDBAND, 128],
            [PollFlags.POLLPRI, 2],
            [PollFlags.POLLOUT, 4],
            [PollFlags.POLLWRNORM, 256],
            [PollFlags.POLLWRBAND, 512],
            [PollFlags.POLLERR, 8],
            [PollFlags.POLLHUP, 16],
            [PollFlags.POLLNVAL, 32]
        ]);
        return flagsMap
    },
    pollEventsConvertFromJS: function (revents) {
        let result = 0;
        SOCKFS.pollFlagsMap().forEach((value, key) => {
            if ((revents & key) == key) {
                result |= value
            }
        });
        return result
    },
    pollEventsConvertToJS: function (events) {
        let result = 0;
        SOCKFS.pollFlagsMap().forEach((value, key) => {
            if ((events & value) == value) {
                result |= key
            }
        });
        return result
    },
    getMsgFlagsMap: function () {
        const MsgFlags = tizentvwasm.MsgFlags;
        return [
            [MsgFlags.MSG_OOB, 1],
            [MsgFlags.MSG_PEEK, 2],
            [MsgFlags.MSG_EOR, 128],
            [MsgFlags.MSG_WAITALL, 256],
            [MsgFlags.MSG_NOSIGNAL, 16384]
        ]
    },
    msgFlagsToJs: function (flags) {
        if (flags === 0) {
            return 0
        }
        let result = 0;
        SOCKFS.getMsgFlagsMap().forEach(item => {
            if ((flags & item[1]) === item[1]) {
                result |= item[0]
            }
        });
        return result
    },
    msgFlagsFromJs: function (flags) {
        if (flags === 0) {
            return 0
        }
        let result = 0;
        SOCKFS.getMsgFlagsMap().forEach(item => {
            if ((flags & item[0]) === item[0]) {
                result |= item[1]
            }
        });
        return result
    },
    getFDsUnionAtOffset: function (offset, readfds, writefds, exceptfds) {
        return (readfds ? HEAP32[readfds + offset >> 2] : 0) | (writefds ? HEAP32[writefds + offset >> 2] : 0) | (exceptfds ? HEAP32[exceptfds + offset >> 2] : 0)
    },
    countFDsInFdSets: function (nfds, readfds, writefds, exceptfds) {
        const ret = {
            total: 0,
            sockets: 0
        };
        const fdSetSize = 1024;
        if (nfds <= 0 || nfds > fdSetSize) {
            return ret
        }
        let offset = 0;
        let fds = SOCKFS.getFDsUnionAtOffset(offset, readfds, writefds, exceptfds);
        let fdShift = 0;
        for (let fd = 0; fd < nfds; fd++) {
            if ((fds & 1 << fdShift) !== 0) {
                ret.total++;
                ret.sockets += SOCKFS.hasSocket(fd) ? 1 : 0
            }++fdShift;
            if (fdShift === 32) {
                fdShift = 0;
                offset += 4;
                fds = SOCKFS.getFDsUnionAtOffset(offset, readfds, writefds, exceptfds)
            }
        }
        return ret
    },
    fdsToSequence: function (nfds, fdsSetPtr, sockFDMap) {
        if (!fdsSetPtr) {
            return []
        }
        const ret = [];
        let offset = 0;
        let fds = HEAP32[fdsSetPtr + offset >> 2];
        let fdShift = 0;
        for (let fd = 0; fd < nfds; ++fd) {
            if ((fds & 1 << fdShift) !== 0) {
                const sockFd = SOCKFS.getSocket(fd).sock_fd;
                sockFDMap[sockFd] = fd;
                ret.push(sockFd)
            }++fdShift;
            if (fdShift === 32) {
                fdShift = 0;
                offset += 4;
                fds = HEAP32[fdsSetPtr + offset >> 2]
            }
        }
        return ret
    },
    FD_ZERO: function (s) {
        for (let i = 0; i < SOCKFS.sizeof.FD_SET; ++i) {
            HEAP8[s + i] = 0
        }
    },
    FD_SET: function (d, s) {
        HEAPU32[s + d / 8 >> 2] |= 1 << d % (8 * 4)
    },
    setDescriptors: function (fdsSetPtr, resultSet, sockFDMap) {
        if (!fdsSetPtr) {
            return
        }
        SOCKFS.FD_ZERO(fdsSetPtr);
        for (const fd of resultSet) {
            SOCKFS.FD_SET(sockFDMap[fd], fdsSetPtr)
        }
    },
    timevalToUSec: function (timeoutPtr) {
        if (!timeoutPtr) {
            return -1
        }
        const timevalTVSec = HEAP32[timeoutPtr >> 2];
        const timevalTVUSec = HEAP32[timeoutPtr + 4 >> 2];
        return timevalTVSec * 1e6 + timevalTVUSec
    },
    callSelect: function (nfds, readfds, writefds, exceptfds, timeout) {
        const sockFDMap = new Map;
        const readSeq = SOCKFS.fdsToSequence(nfds, readfds, sockFDMap);
        const writeSeq = SOCKFS.fdsToSequence(nfds, writefds, sockFDMap);
        const exceptSeq = SOCKFS.fdsToSequence(nfds, exceptfds, sockFDMap);
        const timeoutUSec = SOCKFS.timevalToUSec(timeout);
        let result = null;
        try {
            result = tizentvwasm.SocketsManager.select(readSeq, writeSeq, exceptSeq, timeoutUSec)
        } catch (err) {
            return -SOCKFS.getErrorCode()
        }
        SOCKFS.setDescriptors(readfds, result.getReadFds(), sockFDMap);
        SOCKFS.setDescriptors(writefds, result.getWriteFds(), sockFDMap);
        SOCKFS.setDescriptors(exceptfds, result.getExceptFds(), sockFDMap);
        return result.getReadFds().length + result.getWriteFds().length + result.getExceptFds().length
    },
    countFDsInPollFDs: function (fds, nfds) {
        const ret = {
            total: nfds,
            sockets: 0
        };
        if (nfds <= 0) {
            return ret
        }
        for (let i = 0; i < nfds; i++) {
            const pollfd = fds + 8 * i;
            const fd = HEAP32[pollfd >> 2];
            ret.sockets += SOCKFS.hasSocket(fd) ? 1 : 0
        }
        return ret
    },
    callPoll: function (fdsPtr, nfds, timeout) {
        const pollFds = [];
        for (let i = 0; i < nfds; i++) {
            const pollfd = fdsPtr + 8 * i;
            const fd = HEAP32[pollfd >> 2];
            const events = HEAP16[pollfd + 4 >> 1];
            const sockFd = SOCKFS.getSocket(fd).sock_fd;
            const pollEvents = SOCKFS.pollEventsConvertToJS(events);
            pollFds.push(new tizentvwasm.PollFd(sockFd, pollEvents))
        }
        let result = -1;
        try {
            result = tizentvwasm.SocketsManager.poll(pollFds, timeout)
        } catch (err) {
            return -SOCKFS.getErrorCode()
        }
        for (let i = 0; i < nfds; i++) {
            const pollfd = fdsPtr + 8 * i;
            const revents = SOCKFS.pollEventsConvertFromJS(pollFds[i].revents);
            HEAP16[pollfd + 6 >> 1] = revents
        }
        return result
    }
};

function __inet_pton4_raw(str) {
    var b = str.split(".");
    for (var i = 0; i < 4; i++) {
        var tmp = Number(b[i]);
        if (isNaN(tmp)) return null;
        b[i] = tmp
    }
    return (b[0] | b[1] << 8 | b[2] << 16 | b[3] << 24) >>> 0
}

function __inet_pton6_raw(str) {
    var words;
    var w, offset, z;
    var valid6regx = /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i;
    var parts = [];
    if (!valid6regx.test(str)) {
        return null
    }
    if (str === "::") {
        return [0, 0, 0, 0, 0, 0, 0, 0]
    }
    if (str.indexOf("::") === 0) {
        str = str.replace("::", "Z:")
    } else {
        str = str.replace("::", ":Z:")
    }
    if (str.indexOf(".") > 0) {
        str = str.replace(new RegExp("[.]", "g"), ":");
        words = str.split(":");
        words[words.length - 4] = parseInt(words[words.length - 4]) + parseInt(words[words.length - 3]) * 256;
        words[words.length - 3] = parseInt(words[words.length - 2]) + parseInt(words[words.length - 1]) * 256;
        words = words.slice(0, words.length - 2)
    } else {
        words = str.split(":")
    }
    offset = 0;
    z = 0;
    for (w = 0; w < words.length; w++) {
        if (typeof words[w] === "string") {
            if (words[w] === "Z") {
                for (z = 0; z < 8 - words.length + 1; z++) {
                    parts[w + z] = 0
                }
                offset = z - 1
            } else {
                parts[w + offset] = _htons(parseInt(words[w], 16))
            }
        } else {
            parts[w + offset] = words[w]
        }
    }
    return [parts[1] << 16 | parts[0], parts[3] << 16 | parts[2], parts[5] << 16 | parts[4], parts[7] << 16 | parts[6]]
}
var DNS = {
    address_map: {
        id: 1,
        addrs: {},
        names: {}
    },
    lookup_name: function (name) {
        var res = __inet_pton4_raw(name);
        if (res !== null) {
            return name
        }
        res = __inet_pton6_raw(name);
        if (res !== null) {
            return name
        }
        var addr;
        if (DNS.address_map.addrs[name]) {
            addr = DNS.address_map.addrs[name]
        } else {
            var id = DNS.address_map.id++;
            assert(id < 65535, "exceeded max address mappings of 65535");
            addr = "172.29." + (id & 255) + "." + (id & 65280);
            DNS.address_map.names[addr] = name;
            DNS.address_map.addrs[name] = addr
        }
        return addr
    },
    lookup_addr: function (addr) {
        if (DNS.address_map.names[addr]) {
            return DNS.address_map.names[addr]
        }
        return null
    }
};

function __inet_ntop4_raw(addr) {
    return (addr & 255) + "." + (addr >> 8 & 255) + "." + (addr >> 16 & 255) + "." + (addr >> 24 & 255)
}

function __inet_ntop6_raw(ints) {
    var str = "";
    var word = 0;
    var longest = 0;
    var lastzero = 0;
    var zstart = 0;
    var len = 0;
    var i = 0;
    var parts = [ints[0] & 65535, ints[0] >> 16, ints[1] & 65535, ints[1] >> 16, ints[2] & 65535, ints[2] >> 16, ints[3] & 65535, ints[3] >> 16];
    var hasipv4 = true;
    var v4part = "";
    for (i = 0; i < 5; i++) {
        if (parts[i] !== 0) {
            hasipv4 = false;
            break
        }
    }
    if (hasipv4) {
        v4part = __inet_ntop4_raw(parts[6] | parts[7] << 16);
        if (parts[5] === -1) {
            str = "::ffff:";
            str += v4part;
            return str
        }
        if (parts[5] === 0) {
            str = "::";
            if (v4part === "0.0.0.0") v4part = "";
            if (v4part === "0.0.0.1") v4part = "1";
            str += v4part;
            return str
        }
    }
    for (word = 0; word < 8; word++) {
        if (parts[word] === 0) {
            if (word - lastzero > 1) {
                len = 0
            }
            lastzero = word;
            len++
        }
        if (len > longest) {
            longest = len;
            zstart = word - longest + 1
        }
    }
    for (word = 0; word < 8; word++) {
        if (longest > 1) {
            if (parts[word] === 0 && word >= zstart && word < zstart + longest) {
                if (word === zstart) {
                    str += ":";
                    if (zstart === 0) str += ":"
                }
                continue
            }
        }
        str += Number(_ntohs(parts[word] & 65535)).toString(16);
        str += word < 7 ? ":" : ""
    }
    return str
}

function __read_sockaddr(sa, salen) {
    var family = HEAP16[sa >> 1];
    var port = _ntohs(HEAPU16[sa + 2 >> 1]);
    var addr;
    switch (family) {
        case 2:
            if (salen < 16) {
                return {
                    errno: 28
                }
            }
            addr = HEAP32[sa + 4 >> 2];
            addr = __inet_ntop4_raw(addr);
            break;
        case 10:
            if (salen < 28) {
                return {
                    errno: 28
                }
            }
            addr = [HEAP32[sa + 8 >> 2], HEAP32[sa + 12 >> 2], HEAP32[sa + 16 >> 2], HEAP32[sa + 20 >> 2]];
            addr = __inet_ntop6_raw(addr);
            break;
        default:
            return {
                errno: 5
            }
    }
    return {
        family: family,
        addr: addr,
        port: port
    }
}

function __createSocketOnRenderThread(family, type, protocol, socket) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(17, 1, family, type, protocol, socket);
    const fd = SOCKFS.createSocketOnCurrentThread(family, type, protocol, socket);
    _set_mapped_fd(fd, fd);
    return fd
}

function __closeSocketOnRenderThread(fd) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(18, 1, fd);
    const stream = FS.getStream(fd);
    if (stream && stream.node) {
        FS.destroyNode(stream.node)
    }
    FS.closeStream(fd)
}

function __cloneSocketFromRenderThread(fd) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(19, 1, fd);
    const stream = FS.getStream(fd);
    const ptr = _malloc(16);
    HEAP32[ptr >> 2] = stream.node.sock.family;
    HEAP32[(ptr >> 2) + 1] = stream.node.sock.type;
    HEAP32[(ptr >> 2) + 2] = stream.node.sock.protocol;
    HEAP32[(ptr >> 2) + 3] = stream.node.sock.sock_fd;
    return ptr
}
var SYSCALLS = {
    DEFAULT_POLLMASK: 5,
    mappings: {},
    umask: 511,
    calculateAt: function (dirfd, path) {
        if (path[0] !== "/") {
            var dir;
            if (dirfd === -100) {
                dir = FS.cwd()
            } else {
                var dirstream = FS.getStream(dirfd);
                if (!dirstream) throw new FS.ErrnoError(8);
                dir = dirstream.path
            }
            path = PATH.join2(dir, path)
        }
        return path
    },
    doStat: function (func, path, buf) {
        try {
            var stat = func(path)
        } catch (e) {
            if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
                return -54
            }
            throw e
        }
        HEAP32[buf >> 2] = stat.dev;
        HEAP32[buf + 4 >> 2] = 0;
        HEAP32[buf + 8 >> 2] = stat.ino;
        HEAP32[buf + 12 >> 2] = stat.mode;
        HEAP32[buf + 16 >> 2] = stat.nlink;
        HEAP32[buf + 20 >> 2] = stat.uid;
        HEAP32[buf + 24 >> 2] = stat.gid;
        HEAP32[buf + 28 >> 2] = stat.rdev;
        HEAP32[buf + 32 >> 2] = 0;
        tempI64 = [stat.size >>> 0, (tempDouble = stat.size, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 40 >> 2] = tempI64[0], HEAP32[buf + 44 >> 2] = tempI64[1];
        HEAP32[buf + 48 >> 2] = 4096;
        HEAP32[buf + 52 >> 2] = stat.blocks;
        HEAP32[buf + 56 >> 2] = stat.atime.getTime() / 1e3 | 0;
        HEAP32[buf + 60 >> 2] = 0;
        HEAP32[buf + 64 >> 2] = stat.mtime.getTime() / 1e3 | 0;
        HEAP32[buf + 68 >> 2] = 0;
        HEAP32[buf + 72 >> 2] = stat.ctime.getTime() / 1e3 | 0;
        HEAP32[buf + 76 >> 2] = 0;
        tempI64 = [stat.ino >>> 0, (tempDouble = stat.ino, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 80 >> 2] = tempI64[0], HEAP32[buf + 84 >> 2] = tempI64[1];
        return 0
    },
    doMsync: function (addr, stream, len, flags) {
        var buffer = new Uint8Array(HEAPU8.subarray(addr, addr + len));
        FS.msync(stream, buffer, 0, len, flags)
    },
    doMkdir: function (path, mode) {
        path = PATH.normalize(path);
        if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
        FS.mkdir(path, mode, 0);
        return 0
    },
    doMknod: function (path, mode, dev) {
        switch (mode & 61440) {
            case 32768:
            case 8192:
            case 24576:
            case 4096:
            case 49152:
                break;
            default:
                return -28
        }
        FS.mknod(path, mode, dev);
        return 0
    },
    doReadlink: function (path, buf, bufsize) {
        if (bufsize <= 0) return -28;
        var ret = FS.readlink(path);
        var len = Math.min(bufsize, lengthBytesUTF8(ret));
        var endChar = HEAP8[buf + len];
        stringToUTF8(ret, buf, bufsize + 1);
        HEAP8[buf + len] = endChar;
        return len
    },
    doAccess: function (path, amode) {
        if (amode & ~7) {
            return -28
        }
        var node;
        var lookup = FS.lookupPath(path, {
            follow: true
        });
        node = lookup.node;
        if (!node) {
            return -44
        }
        var perms = "";
        if (amode & 4) perms += "r";
        if (amode & 2) perms += "w";
        if (amode & 1) perms += "x";
        if (perms && FS.nodePermissions(node, perms)) {
            return -2
        }
        return 0
    },
    doDup: function (path, flags, suggestFD) {
        var suggest = FS.getStream(suggestFD);
        if (suggest) FS.close(suggest);
        return FS.open(path, flags, 0, suggestFD, suggestFD).fd
    },
    doReadv: function (stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
            var ptr = HEAP32[iov + i * 8 >> 2];
            var len = HEAP32[iov + (i * 8 + 4) >> 2];
            var curr = FS.read(stream, HEAP8, ptr, len, offset);
            if (curr < 0) return -1;
            ret += curr;
            if (curr < len) break
        }
        return ret
    },
    doWritev: function (stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
            var ptr = HEAP32[iov + i * 8 >> 2];
            var len = HEAP32[iov + (i * 8 + 4) >> 2];
            var curr = FS.write(stream, HEAP8, ptr, len, offset);
            if (curr < 0) return -1;
            ret += curr
        }
        return ret
    },
    varargs: 0,
    get: function (varargs) {
        SYSCALLS.varargs += 4;
        var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
        return ret
    },
    getStr: function () {
        var ret = UTF8ToString(SYSCALLS.get());
        return ret
    },
    getStreamFromFD: function (fd) {
        if (fd === undefined) fd = SYSCALLS.get();
        if (SOCKFS.hasSocket(fd)) {
            var stream = SOCKFS.getStream(fd)
        } else {
            var stream = FS.getStream(fd)
        }
        if (!stream) throw new FS.ErrnoError(8);
        return stream
    },
    getSockStreamFromFD: function (fd) {
        const stream = SOCKFS.getStreamFromFD(fd);
        if (!stream) {
            throw new FS.ErrnoError(ERRNO_CODES.EBADF)
        }
        return stream
    },
    isSocketOnCurrentThread: function (args) {
        let arg_ptr = args[1];
        let fd = HEAP32[arg_ptr >> 2];
        return SOCKFS.hasSocket(fd)
    },
    isSocket: function (fd) {
        return SOCKFS.hasSocket(fd)
    },
    syscall142CountSocketFDs: function (args) {
        const arg_ptr = args[1];
        const nfds = HEAP32[arg_ptr >> 2];
        const readfds = HEAP32[arg_ptr + 4 >> 2];
        const writefds = HEAP32[arg_ptr + 8 >> 2];
        const exceptfds = HEAP32[arg_ptr + 12 >> 2];
        return SOCKFS.countFDsInFdSets(nfds, readfds, writefds, exceptfds)
    },
    syscall142TizenSocketOnly: function (args) {
        const arg_ptr = args[1];
        const nfds = HEAP32[arg_ptr >> 2];
        const readfds = HEAP32[arg_ptr + 4 >> 2];
        const writefds = HEAP32[arg_ptr + 8 >> 2];
        const exceptfds = HEAP32[arg_ptr + 12 >> 2];
        const timeout = HEAP32[arg_ptr + 16 >> 2];
        return SOCKFS.callSelect(nfds, readfds, writefds, exceptfds, timeout)
    },
    syscall168CountSocketFDs: function (args) {
        let arg_ptr = args[1];
        let fds = HEAP32[arg_ptr >> 2];
        let nfds = HEAP32[arg_ptr + 4 >> 2];
        return SOCKFS.countFDsInPollFDs(fds, nfds)
    },
    syscall168TizenSocketOnly: function (args) {
        let arg_ptr = args[1];
        let fds = HEAP32[arg_ptr >> 2];
        let nfds = HEAP32[arg_ptr + 4 >> 2];
        let timeout = HEAP32[arg_ptr + 8 >> 2];
        return SOCKFS.callPoll(fds, nfds, timeout)
    },
    getSocketFromFD: function () {
        var socket = SOCKFS.getSocket(SYSCALLS.get());
        if (!socket) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        return socket
    },
    getSocketAddress: function (allowNull) {
        var addrp = SYSCALLS.get(),
            addrlen = SYSCALLS.get();
        if (allowNull && addrp === 0) return null;
        if (!addrp) throw new FS.ErrnoError(21);
        if (!addrlen) throw new FS.ErrnoError(28);
        var info = __read_sockaddr(addrp, addrlen);
        if (info.errno) throw new FS.ErrnoError(info.errno);
        info.addr = DNS.lookup_addr(info.addr) || info.addr;
        return info
    },
    get64: function () {
        var low = SYSCALLS.get(),
            high = SYSCALLS.get();
        return low
    },
    getZero: function () {
        SYSCALLS.get()
    }
};

function ___syscall102(which, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var call = SYSCALLS.get(),
            socketvararg = SYSCALLS.get();
        SYSCALLS.varargs = socketvararg;
        var getSocketFromFD = function () {
            var socket = SOCKFS.getSocket(SYSCALLS.get());
            if (!socket) throw new FS.ErrnoError(8);
            return socket
        };
        switch (call) {
            case 1: {
                var domain = SYSCALLS.get(),
                    type = SYSCALLS.get(),
                    protocol = SYSCALLS.get();
                var sock = SOCKFS.createSocket(domain, type, protocol);
                return sock.stream.fd
            }
            case 2: {
                const sock = getSocketFromFD(),
                    addr = SYSCALLS.get(),
                    addrlen = SYSCALLS.get();
                sock.sock_ops.bind(sock, addr, addrlen);
                return 0
            }
            case 3: {
                const sock = getSocketFromFD(),
                    addr = SYSCALLS.get(),
                    addrlen = SYSCALLS.get();
                return sock.sock_ops.connect(sock, addr, addrlen)
            }
            case 4: {
                var sock = getSocketFromFD(),
                    backlog = SYSCALLS.get();
                sock.sock_ops.listen(sock, backlog);
                return 0
            }
            case 5: {
                var sock = SYSCALLS.getSocketFromFD(),
                    addr = SYSCALLS.get(),
                    addrlen = SYSCALLS.get();
                if (addr && !addrlen) {
                    throw new FS.ErrnoError(21)
                }
                var newsock = sock.sock_ops.accept(sock, addr, addrlen);
                return newsock.stream.fd
            }
            case 6: {
                var sock = SYSCALLS.getSocketFromFD(),
                    addr = SYSCALLS.get(),
                    addrlen = SYSCALLS.get();
                if (!addr || !addrlen) {
                    throw new FS.ErrnoError(21)
                }
                sock.sock_ops.getsockname(sock, addr, addrlen);
                return 0
            }
            case 7: {
                var sock = SYSCALLS.getSocketFromFD(),
                    addr = SYSCALLS.get(),
                    addrlen = SYSCALLS.get();
                if (!addr || !addrlen) {
                    throw new FS.ErrnoError(21)
                }
                sock.sock_ops.getpeername(sock, addr, addrlen);
                return 0
            }
            case 11: {
                var sock = getSocketFromFD(),
                    addr = SYSCALLS.get(),
                    addrlen = SYSCALLS.get(),
                    flags = SYSCALLS.get(),
                    dest = SYSCALLS.get(),
                    destlen = SYSCALLS.get();
                return sock.sock_ops.sendto(sock, addr, addrlen, flags, dest, destlen)
            }
            case 12: {
                var sock = getSocketFromFD(),
                    buf = SYSCALLS.get(),
                    len = SYSCALLS.get(),
                    flags = SYSCALLS.get(),
                    addr = SYSCALLS.get(),
                    addrlen = SYSCALLS.get();
                return sock.sock_ops.recvfrom(sock, buf, len, flags, addr, addrlen)
            }
            case 13: {
                var sock = SYSCALLS.getSocketFromFD(),
                    how = SYSCALLS.get();
                sock.sock_ops.shutdown(sock, how);
                return 0
            }
            case 14: {
                var sock = SYSCALLS.getSocketFromFD(),
                    level = SYSCALLS.get(),
                    optname = SYSCALLS.get(),
                    optval = SYSCALLS.get(),
                    optlen = SYSCALLS.get();
                return sock.sock_ops.setsockopt(sock, level, optname, optval, optlen)
            }
            case 15: {
                var sock = SYSCALLS.getSocketFromFD(),
                    level = SYSCALLS.get(),
                    optname = SYSCALLS.get(),
                    optval = SYSCALLS.get(),
                    optlen = SYSCALLS.get();
                return sock.sock_ops.getsockopt(sock, level, optname, optval, optlen)
            }
            case 16: {
                var sock = getSocketFromFD(),
                    message = SYSCALLS.get(),
                    flags = SYSCALLS.get();
                return sock.sock_ops.sendmsg(sock, message, flags)
            }
            case 17: {
                var sock = getSocketFromFD(),
                    message = SYSCALLS.get(),
                    flags = SYSCALLS.get();
                return sock.sock_ops.recvmsg(sock, message, flags)
            }
            default: {
                return -52
            }
        }
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall122(which, varargs) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(20, 1, which, varargs);
    SYSCALLS.varargs = varargs;
    try {
        var buf = SYSCALLS.get();
        if (!buf) return -21;
        var layout = {
            "sysname": 0,
            "nodename": 65,
            "domainname": 325,
            "machine": 260,
            "version": 195,
            "release": 130,
            "__size__": 390
        };
        var copyString = function (element, value) {
            var offset = layout[element];
            writeAsciiToMemory(value, buf + offset)
        };
        copyString("sysname", "Emscripten");
        copyString("nodename", "emscripten");
        copyString("release", "1.0");
        copyString("version", "#1");
        copyString("machine", "x86-JS");
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall142(which, varargs) {
    const sockFDsCount = SYSCALLS.syscall142CountSocketFDs(arguments);
    if (sockFDsCount.sockets > 0 && sockFDsCount.sockets < sockFDsCount.total) {
        console.error("Mixing Tizen Sockets and other file descriptors is not supported in select()");
        return -ERRNO_CODES.EBADF
    }
    if (sockFDsCount.sockets > 0 && sockFDsCount.sockets === sockFDsCount.total) {
        return SYSCALLS.syscall142TizenSocketOnly(arguments)
    }
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(21, 1, which, varargs);
    SYSCALLS.varargs = varargs;
    try {
        const start_time = new Date;
        var nfds = SYSCALLS.get(),
            readfds = SYSCALLS.get(),
            writefds = SYSCALLS.get(),
            exceptfds = SYSCALLS.get(),
            timeout = SYSCALLS.get();
        var total = 0;
        var srcReadLow = readfds ? HEAP32[readfds >> 2] : 0,
            srcReadHigh = readfds ? HEAP32[readfds + 4 >> 2] : 0;
        var srcWriteLow = writefds ? HEAP32[writefds >> 2] : 0,
            srcWriteHigh = writefds ? HEAP32[writefds + 4 >> 2] : 0;
        var srcExceptLow = exceptfds ? HEAP32[exceptfds >> 2] : 0,
            srcExceptHigh = exceptfds ? HEAP32[exceptfds + 4 >> 2] : 0;
        var dstReadLow = 0,
            dstReadHigh = 0;
        var dstWriteLow = 0,
            dstWriteHigh = 0;
        var dstExceptLow = 0,
            dstExceptHigh = 0;
        var allLow = (readfds ? HEAP32[readfds >> 2] : 0) | (writefds ? HEAP32[writefds >> 2] : 0) | (exceptfds ? HEAP32[exceptfds >> 2] : 0);
        var allHigh = (readfds ? HEAP32[readfds + 4 >> 2] : 0) | (writefds ? HEAP32[writefds + 4 >> 2] : 0) | (exceptfds ? HEAP32[exceptfds + 4 >> 2] : 0);
        if (timeout == 0) {
            timeout = null
        } else {
            timeout = HEAP32[timeout >> 2] * 1e3 + HEAP32[timeout + 4 >> 2] / 1e3
        }
        const quantum_msecs = this.returnEarly ? 5 : 1;
        let last_processing_time = -1;
        var check = function (fd, low, high, val) {
            return fd < 32 ? low & val : high & val
        };
        while (total === 0) {
            const loop_start_time = new Date;
            for (var fd = 0; fd < nfds; fd++) {
                var mask = 1 << fd % 32;
                if (!check(fd, allLow, allHigh, mask)) {
                    continue
                }
                var stream = FS.getStream(fd);
                if (!stream) throw new FS.ErrnoError(8);
                var flags = SYSCALLS.DEFAULT_POLLMASK;
                if (stream.stream_ops.poll) {
                    flags = stream.stream_ops.poll(stream)
                }
                if (flags & 1 && check(fd, srcReadLow, srcReadHigh, mask)) {
                    fd < 32 ? dstReadLow = dstReadLow | mask : dstReadHigh = dstReadHigh | mask;
                    total++
                }
                if (flags & 4 && check(fd, srcWriteLow, srcWriteHigh, mask)) {
                    fd < 32 ? dstWriteLow = dstWriteLow | mask : dstWriteHigh = dstWriteHigh | mask;
                    total++
                }
                if (flags & 2 && check(fd, srcExceptLow, srcExceptHigh, mask)) {
                    fd < 32 ? dstExceptLow = dstExceptLow | mask : dstExceptHigh = dstExceptHigh | mask;
                    total++
                }
            }
            const loop_end_time = new Date;
            const select_time = loop_end_time - start_time;
            const loop_time_2 = (loop_end_time - loop_start_time) / 2;
            if (timeout !== null && select_time + loop_time_2 > timeout) {
                break
            }
            if (this.returnEarly && total === 0 && loop_end_time - start_time > quantum_msecs) {
                return -6
            } else if (total === 0 && (last_processing_time === -1 || loop_end_time - last_processing_time > quantum_msecs)) {
                _emscripten_current_thread_process_queued_calls();
                last_processing_time = loop_end_time
            }
        }
        if (readfds) {
            HEAP32[readfds >> 2] = dstReadLow;
            HEAP32[readfds + 4 >> 2] = dstReadHigh
        }
        if (writefds) {
            HEAP32[writefds >> 2] = dstWriteLow;
            HEAP32[writefds + 4 >> 2] = dstWriteHigh
        }
        if (exceptfds) {
            HEAP32[exceptfds >> 2] = dstExceptLow;
            HEAP32[exceptfds + 4 >> 2] = dstExceptHigh
        }
        return total
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall168(which, varargs) {
    const sockFDsCount = SYSCALLS.syscall168CountSocketFDs(arguments);
    if (sockFDsCount.sockets > 0 && sockFDsCount.sockets < sockFDsCount.total) {
        console.error("Mixing Tizen Sockets and other file descriptors is not supported in poll()");
        return -ERRNO_CODES.EBADF
    }
    if (sockFDsCount.sockets > 0 && sockFDsCount.sockets === sockFDsCount.total) {
        return SYSCALLS.syscall168TizenSocketOnly(arguments)
    }
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(22, 1, which, varargs);
    SYSCALLS.varargs = varargs;
    try {
        const start_time = new Date;
        var fds = SYSCALLS.get(),
            nfds = SYSCALLS.get(),
            timeout = SYSCALLS.get();
        const quantum_msecs = this.returnEarly ? 5 : 1;
        let last_processing_time = -1;
        var nonzero = 0;
        while (nonzero === 0) {
            const loop_start_time = new Date;
            for (var i = 0; i < nfds; i++) {
                var pollfd = fds + 8 * i;
                var fd = HEAP32[pollfd >> 2];
                var events = HEAP16[pollfd + 4 >> 1];
                var mask = 32;
                var stream = FS.getStream(fd);
                if (stream) {
                    mask = SYSCALLS.DEFAULT_POLLMASK;
                    if (stream.stream_ops.poll) {
                        mask = stream.stream_ops.poll(stream)
                    }
                }
                mask &= events | 8 | 16 | 32;
                if (mask) nonzero++;
                HEAP16[pollfd + 6 >> 1] = mask
            }
            const loop_end_time = new Date;
            const poll_time = loop_end_time - start_time;
            const loop_time_2 = (loop_end_time - loop_start_time) / 2;
            if (timeout >= 0 && poll_time + loop_time_2 > timeout) {
                break
            }
            if (this.returnEarly && nonzero === 0 && loop_end_time - start_time > quantum_msecs) {
                return -6
            } else if (nonzero === 0 && (last_processing_time === -1 || loop_end_time - last_processing_time > quantum_msecs)) {
                _emscripten_current_thread_process_queued_calls();
                last_processing_time = loop_end_time
            }
        }
        return nonzero
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall195(which, varargs) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(23, 1, which, varargs);
    SYSCALLS.varargs = varargs;
    try {
        var path = SYSCALLS.getStr(),
            buf = SYSCALLS.get();
        return SYSCALLS.doStat(FS.stat, path, buf)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall197(which, varargs) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(24, 1, which, varargs);
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD(),
            buf = SYSCALLS.get();
        return SYSCALLS.doStat(FS.stat, stream.path, buf)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall202(which, varargs) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(25, 1, which, varargs);
    SYSCALLS.varargs = varargs;
    try {
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall199(a0, a1) {
    return ___syscall202(a0, a1)
}

function ___syscall20(which, varargs) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(26, 1, which, varargs);
    SYSCALLS.varargs = varargs;
    try {
        return PROCINFO.pid
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall200(a0, a1) {
    return ___syscall202(a0, a1)
}

function ___syscall201(a0, a1) {
    return ___syscall202(a0, a1)
}

function ___syscall220(which, varargs) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(27, 1, which, varargs);
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD(),
            dirp = SYSCALLS.get(),
            count = SYSCALLS.get();
        if (!stream.getdents) {
            stream.getdents = FS.readdir(stream.path)
        }
        var struct_size = 280;
        var pos = 0;
        var off = FS.llseek(stream, 0, 1);
        var idx = Math.floor(off / struct_size);
        while (idx < stream.getdents.length && pos + struct_size <= count) {
            var id;
            var type;
            var name = stream.getdents[idx];
            if (name[0] === ".") {
                id = 1;
                type = 4
            } else {
                var child = FS.lookupNode(stream.node, name);
                id = child.id;
                type = FS.isChrdev(child.mode) ? 2 : FS.isDir(child.mode) ? 4 : FS.isLink(child.mode) ? 10 : 8
            }
            tempI64 = [id >>> 0, (tempDouble = id, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[dirp + pos >> 2] = tempI64[0], HEAP32[dirp + pos + 4 >> 2] = tempI64[1];
            tempI64 = [(idx + 1) * struct_size >>> 0, (tempDouble = (idx + 1) * struct_size, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[dirp + pos + 8 >> 2] = tempI64[0], HEAP32[dirp + pos + 12 >> 2] = tempI64[1];
            HEAP16[dirp + pos + 16 >> 1] = 280;
            HEAP8[dirp + pos + 18 >> 0] = type;
            stringToUTF8(name, dirp + pos + 19, 256);
            pos += struct_size;
            idx += 1
        }
        FS.llseek(stream, idx * struct_size, 0);
        return pos
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall221(which, varargs) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(28, 1, which, varargs);
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD(),
            cmd = SYSCALLS.get();
        switch (cmd) {
            case 0: {
                var arg = SYSCALLS.get();
                if (arg < 0) {
                    return -28
                }
                if (SOCKFS.hasSocket(stream.fd)) {
                    abort("Duplication of socket descriptor is not supported")
                }
                var newStream;
                newStream = FS.open(stream.path, stream.flags, 0, arg);
                return newStream.fd
            }
            case 1:
            case 2:
                return 0;
            case 3:
                return stream.flags;
            case 4: {
                if (SOCKFS.hasSocket(stream.fd)) {
                    abort("Calling fcntl with F_SETFL command on socket is not supported")
                }
                var arg = SYSCALLS.get();
                stream.flags |= arg;
                return 0
            }
            case 12: {
                var arg = SYSCALLS.get();
                var offset = 0;
                HEAP16[arg + offset >> 1] = 2;
                return 0
            }
            case 13:
            case 14:
                return 0;
            case 16:
            case 8:
                return -28;
            case 9:
                ___setErrNo(28);
                return -1;
            default: {
                return -28
            }
        }
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall3(which, varargs) {
    const isSocket = SYSCALLS.isSocketOnCurrentThread(arguments);
    if (!isSocket && ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(29, 1, which, varargs);
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD(),
            buf = SYSCALLS.get(),
            count = SYSCALLS.get();
        return FS.read(stream, HEAP8, buf, count)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall33(which, varargs) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(30, 1, which, varargs);
    SYSCALLS.varargs = varargs;
    try {
        var path = SYSCALLS.getStr(),
            amode = SYSCALLS.get();
        return SYSCALLS.doAccess(path, amode)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall4(which, varargs) {
    const isSocket = SYSCALLS.isSocketOnCurrentThread(arguments);
    if (!isSocket && ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(31, 1, which, varargs);
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD(),
            buf = SYSCALLS.get(),
            count = SYSCALLS.get();
        return FS.write(stream, HEAP8, buf, count)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall5(which, varargs) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(32, 1, which, varargs);
    SYSCALLS.varargs = varargs;
    try {
        var pathname = SYSCALLS.getStr(),
            flags = SYSCALLS.get(),
            mode = SYSCALLS.get();
        var stream = FS.open(pathname, flags, mode);
        return stream.fd
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___syscall54(which, varargs) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(33, 1, which, varargs);
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD(),
            op = SYSCALLS.get();
        switch (op) {
            case 21509:
            case 21505: {
                if (!stream.tty) return -59;
                return 0
            }
            case 21510:
            case 21511:
            case 21512:
            case 21506:
            case 21507:
            case 21508: {
                if (!stream.tty) return -59;
                return 0
            }
            case 21519: {
                if (!stream.tty) return -59;
                var argp = SYSCALLS.get();
                HEAP32[argp >> 2] = 0;
                return 0
            }
            case 21520: {
                if (!stream.tty) return -59;
                return -28
            }
            case 21531: {
                var argp = SYSCALLS.get();
                return FS.ioctl(stream, op, argp)
            }
            case 21523: {
                if (!stream.tty) return -59;
                return 0
            }
            case 21524: {
                if (!stream.tty) return -59;
                return 0
            }
            default:
                abort("bad ioctl syscall " + op)
        }
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function __emscripten_syscall_munmap(addr, len) {
    if (addr === -1 || len === 0) {
        return -28
    }
    var info = SYSCALLS.mappings[addr];
    if (!info) return 0;
    if (len === info.len) {
        var stream = FS.getStream(info.fd);
        SYSCALLS.doMsync(addr, stream, len, info.flags);
        FS.munmap(stream);
        SYSCALLS.mappings[addr] = null;
        if (info.allocated) {
            _free(info.malloc)
        }
    }
    return 0
}

function ___syscall91(which, varargs) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(34, 1, which, varargs);
    SYSCALLS.varargs = varargs;
    try {
        var addr = SYSCALLS.get(),
            len = SYSCALLS.get();
        return __emscripten_syscall_munmap(addr, len)
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return -e.errno
    }
}

function ___unlock() {}

function _fd_close(fd) {
    const isSocket = SYSCALLS.isSocket(fd);
    if (!isSocket && ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(35, 1, fd);
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        FS.close(stream);
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return e.errno
    }
}

function ___wasi_fd_close() {
    return _fd_close.apply(null, arguments)
}

function _fd_fdstat_get(fd, pbuf) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(36, 1, fd, pbuf);
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var type = stream.tty ? 2 : FS.isDir(stream.mode) ? 3 : FS.isLink(stream.mode) ? 7 : 4;
        HEAP8[pbuf >> 0] = type;
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return e.errno
    }
}

function ___wasi_fd_fdstat_get() {
    return _fd_fdstat_get.apply(null, arguments)
}

function _fd_read(fd, iov, iovcnt, pnum) {
    const isSocket = SYSCALLS.isSocket(fd);
    if (!isSocket && ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(37, 1, fd, iov, iovcnt, pnum);
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = SYSCALLS.doReadv(stream, iov, iovcnt);
        HEAP32[pnum >> 2] = num;
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return e.errno
    }
}

function ___wasi_fd_read() {
    return _fd_read.apply(null, arguments)
}

function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(38, 1, fd, offset_low, offset_high, whence, newOffset);
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var HIGH_OFFSET = 4294967296;
        var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0);
        var DOUBLE_LIMIT = 9007199254740992;
        if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
            return -61
        }
        FS.llseek(stream, offset, whence);
        tempI64 = [stream.position >>> 0, (tempDouble = stream.position, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[newOffset >> 2] = tempI64[0], HEAP32[newOffset + 4 >> 2] = tempI64[1];
        if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return e.errno
    }
}

function ___wasi_fd_seek() {
    return _fd_seek.apply(null, arguments)
}

function _fd_write(fd, iov, iovcnt, pnum) {
    const isSocket = SYSCALLS.isSocket(fd);
    if (!isSocket && ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(39, 1, fd, iov, iovcnt, pnum);
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = SYSCALLS.doWritev(stream, iov, iovcnt);
        HEAP32[pnum >> 2] = num;
        return 0
    } catch (e) {
        if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
        return e.errno
    }
}

function ___wasi_fd_write() {
    return _fd_write.apply(null, arguments)
}
var structRegistrations = {};

function runDestructors(destructors) {
    while (destructors.length) {
        var ptr = destructors.pop();
        var del = destructors.pop();
        del(ptr)
    }
}

function simpleReadValueFromPointer(pointer) {
    return this["fromWireType"](HEAPU32[pointer >> 2])
}
var awaitingDependencies = {};
var registeredTypes = {};
var typeDependencies = {};
var char_0 = 48;
var char_9 = 57;

function makeLegalFunctionName(name) {
    if (undefined === name) {
        return "_unknown"
    }
    name = name.replace(/[^a-zA-Z0-9_]/g, "$");
    var f = name.charCodeAt(0);
    if (f >= char_0 && f <= char_9) {
        return "_" + name
    } else {
        return name
    }
}

function createNamedFunction(name, body) {
    name = makeLegalFunctionName(name);
    return new Function("body", "return function " + name + "() {\n" + '    "use strict";' + "    return body.apply(this, arguments);\n" + "};\n")(body)
}

function extendError(baseErrorType, errorName) {
    var errorClass = createNamedFunction(errorName, function (message) {
        this.name = errorName;
        this.message = message;
        var stack = new Error(message).stack;
        if (stack !== undefined) {
            this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "")
        }
    });
    errorClass.prototype = Object.create(baseErrorType.prototype);
    errorClass.prototype.constructor = errorClass;
    errorClass.prototype.toString = function () {
        if (this.message === undefined) {
            return this.name
        } else {
            return this.name + ": " + this.message
        }
    };
    return errorClass
}
var InternalError = undefined;

function throwInternalError(message) {
    throw new InternalError(message)
}

function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
    myTypes.forEach(function (type) {
        typeDependencies[type] = dependentTypes
    });

    function onComplete(typeConverters) {
        var myTypeConverters = getTypeConverters(typeConverters);
        if (myTypeConverters.length !== myTypes.length) {
            throwInternalError("Mismatched type converter count")
        }
        for (var i = 0; i < myTypes.length; ++i) {
            registerType(myTypes[i], myTypeConverters[i])
        }
    }
    var typeConverters = new Array(dependentTypes.length);
    var unregisteredTypes = [];
    var registered = 0;
    dependentTypes.forEach(function (dt, i) {
        if (registeredTypes.hasOwnProperty(dt)) {
            typeConverters[i] = registeredTypes[dt]
        } else {
            unregisteredTypes.push(dt);
            if (!awaitingDependencies.hasOwnProperty(dt)) {
                awaitingDependencies[dt] = []
            }
            awaitingDependencies[dt].push(function () {
                typeConverters[i] = registeredTypes[dt];
                ++registered;
                if (registered === unregisteredTypes.length) {
                    onComplete(typeConverters)
                }
            })
        }
    });
    if (0 === unregisteredTypes.length) {
        onComplete(typeConverters)
    }
}

function __embind_finalize_value_object(structType) {
    var reg = structRegistrations[structType];
    delete structRegistrations[structType];
    var rawConstructor = reg.rawConstructor;
    var rawDestructor = reg.rawDestructor;
    var fieldRecords = reg.fields;
    var fieldTypes = fieldRecords.map(function (field) {
        return field.getterReturnType
    }).concat(fieldRecords.map(function (field) {
        return field.setterArgumentType
    }));
    whenDependentTypesAreResolved([structType], fieldTypes, function (fieldTypes) {
        var fields = {};
        fieldRecords.forEach(function (field, i) {
            var fieldName = field.fieldName;
            var getterReturnType = fieldTypes[i];
            var getter = field.getter;
            var getterContext = field.getterContext;
            var setterArgumentType = fieldTypes[i + fieldRecords.length];
            var setter = field.setter;
            var setterContext = field.setterContext;
            fields[fieldName] = {
                read: function (ptr) {
                    return getterReturnType["fromWireType"](getter(getterContext, ptr))
                },
                write: function (ptr, o) {
                    var destructors = [];
                    setter(setterContext, ptr, setterArgumentType["toWireType"](destructors, o));
                    runDestructors(destructors)
                }
            }
        });
        return [{
            name: reg.name,
            "fromWireType": function (ptr) {
                var rv = {};
                for (var i in fields) {
                    rv[i] = fields[i].read(ptr)
                }
                rawDestructor(ptr);
                return rv
            },
            "toWireType": function (destructors, o) {
                for (var fieldName in fields) {
                    if (!(fieldName in o)) {
                        throw new TypeError("Missing field")
                    }
                }
                var ptr = rawConstructor();
                for (fieldName in fields) {
                    fields[fieldName].write(ptr, o[fieldName])
                }
                if (destructors !== null) {
                    destructors.push(rawDestructor, ptr)
                }
                return ptr
            },
            "argPackAdvance": 8,
            "readValueFromPointer": simpleReadValueFromPointer,
            destructorFunction: rawDestructor
        }]
    })
}

function getShiftFromSize(size) {
    switch (size) {
        case 1:
            return 0;
        case 2:
            return 1;
        case 4:
            return 2;
        case 8:
            return 3;
        default:
            throw new TypeError("Unknown type size: " + size)
    }
}

function embind_init_charCodes() {
    var codes = new Array(256);
    for (var i = 0; i < 256; ++i) {
        codes[i] = String.fromCharCode(i)
    }
    embind_charCodes = codes
}
var embind_charCodes = undefined;

function readLatin1String(ptr) {
    var ret = "";
    var c = ptr;
    while (HEAPU8[c]) {
        ret += embind_charCodes[HEAPU8[c++]]
    }
    return ret
}
var BindingError = undefined;

function throwBindingError(message) {
    throw new BindingError(message)
}

function registerType(rawType, registeredInstance, options) {
    options = options || {};
    if (!("argPackAdvance" in registeredInstance)) {
        throw new TypeError("registerType registeredInstance requires argPackAdvance")
    }
    var name = registeredInstance.name;
    if (!rawType) {
        throwBindingError('type "' + name + '" must have a positive integer typeid pointer')
    }
    if (registeredTypes.hasOwnProperty(rawType)) {
        if (options.ignoreDuplicateRegistrations) {
            return
        } else {
            throwBindingError("Cannot register type '" + name + "' twice")
        }
    }
    registeredTypes[rawType] = registeredInstance;
    delete typeDependencies[rawType];
    if (awaitingDependencies.hasOwnProperty(rawType)) {
        var callbacks = awaitingDependencies[rawType];
        delete awaitingDependencies[rawType];
        callbacks.forEach(function (cb) {
            cb()
        })
    }
}

function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
    var shift = getShiftFromSize(size);
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        "fromWireType": function (wt) {
            return !!wt
        },
        "toWireType": function (destructors, o) {
            return o ? trueValue : falseValue
        },
        "argPackAdvance": 8,
        "readValueFromPointer": function (pointer) {
            var heap;
            if (size === 1) {
                heap = HEAP8
            } else if (size === 2) {
                heap = HEAP16
            } else if (size === 4) {
                heap = HEAP32
            } else {
                throw new TypeError("Unknown boolean type size: " + name)
            }
            return this["fromWireType"](heap[pointer >> shift])
        },
        destructorFunction: null
    })
}
var emval_free_list = [];
var emval_handle_array = [{}, {
    value: undefined
}, {
    value: null
}, {
    value: true
}, {
    value: false
}];

function __emval_decref(handle) {
    if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
        emval_handle_array[handle] = undefined;
        emval_free_list.push(handle)
    }
}

function count_emval_handles() {
    var count = 0;
    for (var i = 5; i < emval_handle_array.length; ++i) {
        if (emval_handle_array[i] !== undefined) {
            ++count
        }
    }
    return count
}

function get_first_emval() {
    for (var i = 5; i < emval_handle_array.length; ++i) {
        if (emval_handle_array[i] !== undefined) {
            return emval_handle_array[i]
        }
    }
    return null
}

function init_emval() {
    Module["count_emval_handles"] = count_emval_handles;
    Module["get_first_emval"] = get_first_emval
}

function __emval_register(value) {
    switch (value) {
        case undefined: {
            return 1
        }
        case null: {
            return 2
        }
        case true: {
            return 3
        }
        case false: {
            return 4
        }
        default: {
            var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
            emval_handle_array[handle] = {
                refcount: 1,
                value: value
            };
            return handle
        }
    }
}

function __embind_register_emval(rawType, name) {
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        "fromWireType": function (handle) {
            var rv = emval_handle_array[handle].value;
            __emval_decref(handle);
            return rv
        },
        "toWireType": function (destructors, value) {
            return __emval_register(value)
        },
        "argPackAdvance": 8,
        "readValueFromPointer": simpleReadValueFromPointer,
        destructorFunction: null
    })
}

function _embind_repr(v) {
    if (v === null) {
        return "null"
    }
    var t = typeof v;
    if (t === "object" || t === "array" || t === "function") {
        return v.toString()
    } else {
        return "" + v
    }
}

function floatReadValueFromPointer(name, shift) {
    switch (shift) {
        case 2:
            return function (pointer) {
                return this["fromWireType"](HEAPF32[pointer >> 2])
            };
        case 3:
            return function (pointer) {
                return this["fromWireType"](HEAPF64[pointer >> 3])
            };
        default:
            throw new TypeError("Unknown float type: " + name)
    }
}

function __embind_register_float(rawType, name, size) {
    var shift = getShiftFromSize(size);
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        "fromWireType": function (value) {
            return value
        },
        "toWireType": function (destructors, value) {
            if (typeof value !== "number" && typeof value !== "boolean") {
                throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name)
            }
            return value
        },
        "argPackAdvance": 8,
        "readValueFromPointer": floatReadValueFromPointer(name, shift),
        destructorFunction: null
    })
}

function new_(constructor, argumentList) {
    if (!(constructor instanceof Function)) {
        throw new TypeError("new_ called with constructor type " + typeof constructor + " which is not a function")
    }
    var dummy = createNamedFunction(constructor.name || "unknownFunctionName", function () {});
    dummy.prototype = constructor.prototype;
    var obj = new dummy;
    var r = constructor.apply(obj, argumentList);
    return r instanceof Object ? r : obj
}

function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
    var argCount = argTypes.length;
    if (argCount < 2) {
        throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!")
    }
    var isClassMethodFunc = argTypes[1] !== null && classType !== null;
    var needsDestructorStack = false;
    for (var i = 1; i < argTypes.length; ++i) {
        if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
            needsDestructorStack = true;
            break
        }
    }
    var returns = argTypes[0].name !== "void";
    var argsList = "";
    var argsListWired = "";
    for (var i = 0; i < argCount - 2; ++i) {
        argsList += (i !== 0 ? ", " : "") + "arg" + i;
        argsListWired += (i !== 0 ? ", " : "") + "arg" + i + "Wired"
    }
    var invokerFnBody = "return function " + makeLegalFunctionName(humanName) + "(" + argsList + ") {\n" + "if (arguments.length !== " + (argCount - 2) + ") {\n" + "throwBindingError('function " + humanName + " called with ' + arguments.length + ' arguments, expected " + (argCount - 2) + " args!');\n" + "}\n";
    if (needsDestructorStack) {
        invokerFnBody += "var destructors = [];\n"
    }
    var dtorStack = needsDestructorStack ? "destructors" : "null";
    var args1 = ["throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam"];
    var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
    if (isClassMethodFunc) {
        invokerFnBody += "var thisWired = classParam.toWireType(" + dtorStack + ", this);\n"
    }
    for (var i = 0; i < argCount - 2; ++i) {
        invokerFnBody += "var arg" + i + "Wired = argType" + i + ".toWireType(" + dtorStack + ", arg" + i + "); // " + argTypes[i + 2].name + "\n";
        args1.push("argType" + i);
        args2.push(argTypes[i + 2])
    }
    if (isClassMethodFunc) {
        argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired
    }
    invokerFnBody += (returns ? "var rv = " : "") + "invoker(fn" + (argsListWired.length > 0 ? ", " : "") + argsListWired + ");\n";
    if (needsDestructorStack) {
        invokerFnBody += "runDestructors(destructors);\n"
    } else {
        for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
            var paramName = i === 1 ? "thisWired" : "arg" + (i - 2) + "Wired";
            if (argTypes[i].destructorFunction !== null) {
                invokerFnBody += paramName + "_dtor(" + paramName + "); // " + argTypes[i].name + "\n";
                args1.push(paramName + "_dtor");
                args2.push(argTypes[i].destructorFunction)
            }
        }
    }
    if (returns) {
        invokerFnBody += "var ret = retType.fromWireType(rv);\n" + "return ret;\n"
    } else {}
    invokerFnBody += "}\n";
    args1.push(invokerFnBody);
    var invokerFunction = new_(Function, args1).apply(null, args2);
    return invokerFunction
}

function ensureOverloadTable(proto, methodName, humanName) {
    if (undefined === proto[methodName].overloadTable) {
        var prevFunc = proto[methodName];
        proto[methodName] = function () {
            if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
                throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!")
            }
            return proto[methodName].overloadTable[arguments.length].apply(this, arguments)
        };
        proto[methodName].overloadTable = [];
        proto[methodName].overloadTable[prevFunc.argCount] = prevFunc
    }
}

function exposePublicSymbol(name, value, numArguments) {
    if (Module.hasOwnProperty(name)) {
        if (undefined === numArguments || undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments]) {
            throwBindingError("Cannot register public name '" + name + "' twice")
        }
        ensureOverloadTable(Module, name, name);
        if (Module.hasOwnProperty(numArguments)) {
            throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!")
        }
        Module[name].overloadTable[numArguments] = value
    } else {
        Module[name] = value;
        if (undefined !== numArguments) {
            Module[name].numArguments = numArguments
        }
    }
}

function heap32VectorToArray(count, firstElement) {
    var array = [];
    for (var i = 0; i < count; i++) {
        array.push(HEAP32[(firstElement >> 2) + i])
    }
    return array
}

function replacePublicSymbol(name, value, numArguments) {
    if (!Module.hasOwnProperty(name)) {
        throwInternalError("Replacing nonexistant public symbol")
    }
    if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
        Module[name].overloadTable[numArguments] = value
    } else {
        Module[name] = value;
        Module[name].argCount = numArguments
    }
}

function embind__requireFunction(signature, rawFunction) {
    signature = readLatin1String(signature);

    function makeDynCaller(dynCall) {
        var args = [];
        for (var i = 1; i < signature.length; ++i) {
            args.push("a" + i)
        }
        var name = "dynCall_" + signature + "_" + rawFunction;
        var body = "return function " + name + "(" + args.join(", ") + ") {\n";
        body += "    return dynCall(rawFunction" + (args.length ? ", " : "") + args.join(", ") + ");\n";
        body += "};\n";
        return new Function("dynCall", "rawFunction", body)(dynCall, rawFunction)
    }
    var fp;
    if (Module["FUNCTION_TABLE_" + signature] !== undefined) {
        fp = Module["FUNCTION_TABLE_" + signature][rawFunction]
    } else if (typeof FUNCTION_TABLE !== "undefined") {
        fp = FUNCTION_TABLE[rawFunction]
    } else {
        var dc = Module["dynCall_" + signature];
        if (dc === undefined) {
            dc = Module["dynCall_" + signature.replace(/f/g, "d")];
            if (dc === undefined) {
                throwBindingError("No dynCall invoker for signature: " + signature)
            }
        }
        fp = makeDynCaller(dc)
    }
    if (typeof fp !== "function") {
        throwBindingError("unknown function pointer with signature " + signature + ": " + rawFunction)
    }
    return fp
}
var UnboundTypeError = undefined;

function getTypeName(type) {
    var ptr = ___getTypeName(type);
    var rv = readLatin1String(ptr);
    _free(ptr);
    return rv
}

function throwUnboundTypeError(message, types) {
    var unboundTypes = [];
    var seen = {};

    function visit(type) {
        if (seen[type]) {
            return
        }
        if (registeredTypes[type]) {
            return
        }
        if (typeDependencies[type]) {
            typeDependencies[type].forEach(visit);
            return
        }
        unboundTypes.push(type);
        seen[type] = true
    }
    types.forEach(visit);
    throw new UnboundTypeError(message + ": " + unboundTypes.map(getTypeName).join([", "]))
}

function __embind_register_function(name, argCount, rawArgTypesAddr, signature, rawInvoker, fn) {
    var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    name = readLatin1String(name);
    rawInvoker = embind__requireFunction(signature, rawInvoker);
    exposePublicSymbol(name, function () {
        throwUnboundTypeError("Cannot call " + name + " due to unbound types", argTypes)
    }, argCount - 1);
    whenDependentTypesAreResolved([], argTypes, function (argTypes) {
        var invokerArgsArray = [argTypes[0], null].concat(argTypes.slice(1));
        replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null, rawInvoker, fn), argCount - 1);
        return []
    })
}

function integerReadValueFromPointer(name, shift, signed) {
    switch (shift) {
        case 0:
            return signed ? function readS8FromPointer(pointer) {
                return HEAP8[pointer]
            } : function readU8FromPointer(pointer) {
                return HEAPU8[pointer]
            };
        case 1:
            return signed ? function readS16FromPointer(pointer) {
                return HEAP16[pointer >> 1]
            } : function readU16FromPointer(pointer) {
                return HEAPU16[pointer >> 1]
            };
        case 2:
            return signed ? function readS32FromPointer(pointer) {
                return HEAP32[pointer >> 2]
            } : function readU32FromPointer(pointer) {
                return HEAPU32[pointer >> 2]
            };
        default:
            throw new TypeError("Unknown integer type: " + name)
    }
}

function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
    name = readLatin1String(name);
    if (maxRange === -1) {
        maxRange = 4294967295
    }
    var shift = getShiftFromSize(size);
    var fromWireType = function (value) {
        return value
    };
    if (minRange === 0) {
        var bitshift = 32 - 8 * size;
        fromWireType = function (value) {
            return value << bitshift >>> bitshift
        }
    }
    var isUnsignedType = name.indexOf("unsigned") != -1;
    registerType(primitiveType, {
        name: name,
        "fromWireType": fromWireType,
        "toWireType": function (destructors, value) {
            if (typeof value !== "number" && typeof value !== "boolean") {
                throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name)
            }
            if (value < minRange || value > maxRange) {
                throw new TypeError('Passing a number "' + _embind_repr(value) + '" from JS side to C/C++ side to an argument of type "' + name + '", which is outside the valid range [' + minRange + ", " + maxRange + "]!")
            }
            return isUnsignedType ? value >>> 0 : value | 0
        },
        "argPackAdvance": 8,
        "readValueFromPointer": integerReadValueFromPointer(name, shift, minRange !== 0),
        destructorFunction: null
    })
}

function __embind_register_memory_view(rawType, dataTypeIndex, name) {
    var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
    var TA = typeMapping[dataTypeIndex];

    function decodeMemoryView(handle) {
        handle = handle >> 2;
        var heap = HEAPU32;
        var size = heap[handle];
        var data = heap[handle + 1];
        return new TA(heap["buffer"], data, size)
    }
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        "fromWireType": decodeMemoryView,
        "argPackAdvance": 8,
        "readValueFromPointer": decodeMemoryView
    }, {
        ignoreDuplicateRegistrations: true
    })
}

function __embind_register_std_string(rawType, name) {
    name = readLatin1String(name);
    var stdStringIsUTF8 = name === "std::string";
    registerType(rawType, {
        name: name,
        "fromWireType": function (value) {
            var length = HEAPU32[value >> 2];
            var str;
            if (stdStringIsUTF8) {
                var endChar = HEAPU8[value + 4 + length];
                var endCharSwap = 0;
                if (endChar != 0) {
                    endCharSwap = endChar;
                    HEAPU8[value + 4 + length] = 0
                }
                var decodeStartPtr = value + 4;
                for (var i = 0; i <= length; ++i) {
                    var currentBytePtr = value + 4 + i;
                    if (HEAPU8[currentBytePtr] == 0) {
                        var stringSegment = UTF8ToString(decodeStartPtr);
                        if (str === undefined) str = stringSegment;
                        else {
                            str += String.fromCharCode(0);
                            str += stringSegment
                        }
                        decodeStartPtr = currentBytePtr + 1
                    }
                }
                if (endCharSwap != 0) HEAPU8[value + 4 + length] = endCharSwap
            } else {
                var a = new Array(length);
                for (var i = 0; i < length; ++i) {
                    a[i] = String.fromCharCode(HEAPU8[value + 4 + i])
                }
                str = a.join("")
            }
            _free(value);
            return str
        },
        "toWireType": function (destructors, value) {
            if (value instanceof ArrayBuffer) {
                value = new Uint8Array(value)
            }
            var getLength;
            var valueIsOfTypeString = typeof value === "string";
            if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
                throwBindingError("Cannot pass non-string to std::string")
            }
            if (stdStringIsUTF8 && valueIsOfTypeString) {
                getLength = function () {
                    return lengthBytesUTF8(value)
                }
            } else {
                getLength = function () {
                    return value.length
                }
            }
            var length = getLength();
            var ptr = _malloc(4 + length + 1);
            HEAPU32[ptr >> 2] = length;
            if (stdStringIsUTF8 && valueIsOfTypeString) {
                stringToUTF8(value, ptr + 4, length + 1)
            } else {
                if (valueIsOfTypeString) {
                    for (var i = 0; i < length; ++i) {
                        var charCode = value.charCodeAt(i);
                        if (charCode > 255) {
                            _free(ptr);
                            throwBindingError("String has UTF-16 code units that do not fit in 8 bits")
                        }
                        HEAPU8[ptr + 4 + i] = charCode
                    }
                } else {
                    for (var i = 0; i < length; ++i) {
                        HEAPU8[ptr + 4 + i] = value[i]
                    }
                }
            }
            if (destructors !== null) {
                destructors.push(_free, ptr)
            }
            return ptr
        },
        "argPackAdvance": 8,
        "readValueFromPointer": simpleReadValueFromPointer,
        destructorFunction: function (ptr) {
            _free(ptr)
        }
    })
}

function __embind_register_std_wstring(rawType, charSize, name) {
    name = readLatin1String(name);
    var getHeap, shift;
    if (charSize === 2) {
        getHeap = function () {
            return HEAPU16
        };
        shift = 1
    } else if (charSize === 4) {
        getHeap = function () {
            return HEAPU32
        };
        shift = 2
    }
    registerType(rawType, {
        name: name,
        "fromWireType": function (value) {
            var HEAP = getHeap();
            var length = HEAPU32[value >> 2];
            var a = new Array(length);
            var start = value + 4 >> shift;
            for (var i = 0; i < length; ++i) {
                a[i] = String.fromCharCode(HEAP[start + i])
            }
            _free(value);
            return a.join("")
        },
        "toWireType": function (destructors, value) {
            var length = value.length;
            var ptr = _malloc(4 + length * charSize);
            var HEAP = getHeap();
            HEAPU32[ptr >> 2] = length;
            var start = ptr + 4 >> shift;
            for (var i = 0; i < length; ++i) {
                HEAP[start + i] = value.charCodeAt(i)
            }
            if (destructors !== null) {
                destructors.push(_free, ptr)
            }
            return ptr
        },
        "argPackAdvance": 8,
        "readValueFromPointer": simpleReadValueFromPointer,
        destructorFunction: function (ptr) {
            _free(ptr)
        }
    })
}

function __embind_register_value_object(rawType, name, constructorSignature, rawConstructor, destructorSignature, rawDestructor) {
    structRegistrations[rawType] = {
        name: readLatin1String(name),
        rawConstructor: embind__requireFunction(constructorSignature, rawConstructor),
        rawDestructor: embind__requireFunction(destructorSignature, rawDestructor),
        fields: []
    }
}

function __embind_register_value_object_field(structType, fieldName, getterReturnType, getterSignature, getter, getterContext, setterArgumentType, setterSignature, setter, setterContext) {
    structRegistrations[structType].fields.push({
        fieldName: readLatin1String(fieldName),
        getterReturnType: getterReturnType,
        getter: embind__requireFunction(getterSignature, getter),
        getterContext: getterContext,
        setterArgumentType: setterArgumentType,
        setter: embind__requireFunction(setterSignature, setter),
        setterContext: setterContext
    })
}

function __embind_register_void(rawType, name) {
    name = readLatin1String(name);
    registerType(rawType, {
        isVoid: true,
        name: name,
        "argPackAdvance": 0,
        "fromWireType": function () {
            return undefined
        },
        "toWireType": function (destructors, o) {
            return undefined
        }
    })
}

function requireHandle(handle) {
    if (!handle) {
        throwBindingError("Cannot use deleted val. handle = " + handle)
    }
    return emval_handle_array[handle].value
}

function requireRegisteredType(rawType, humanName) {
    var impl = registeredTypes[rawType];
    if (undefined === impl) {
        throwBindingError(humanName + " has unknown type " + getTypeName(rawType))
    }
    return impl
}

function __emval_as(handle, returnType, destructorsRef) {
    handle = requireHandle(handle);
    returnType = requireRegisteredType(returnType, "emval::as");
    var destructors = [];
    var rd = __emval_register(destructors);
    HEAP32[destructorsRef >> 2] = rd;
    return returnType["toWireType"](destructors, handle)
}

function __emval_equals(first, second) {
    first = requireHandle(first);
    second = requireHandle(second);
    return first == second
}

function __emval_incref(handle) {
    if (handle > 4) {
        emval_handle_array[handle].refcount += 1
    }
}
var emval_symbols = {};

function getStringOrSymbol(address) {
    var symbol = emval_symbols[address];
    if (symbol === undefined) {
        return readLatin1String(address)
    } else {
        return symbol
    }
}

function __emval_new_cstring(v) {
    return __emval_register(getStringOrSymbol(v))
}

function __emval_new_object() {
    return __emval_register({})
}

function __emval_run_destructors(handle) {
    var destructors = emval_handle_array[handle].value;
    runDestructors(destructors);
    __emval_decref(handle)
}

function __emval_set_property(handle, key, value) {
    handle = requireHandle(handle);
    key = requireHandle(key);
    value = requireHandle(value);
    handle[key] = value
}

function __emval_take_value(type, argv) {
    type = requireRegisteredType(type, "_emval_take_value");
    var v = type["readValueFromPointer"](argv);
    return __emval_register(v)
}

function _abort() {
    abort()
}

function _atexit(func, arg) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(40, 1, func, arg);
    __ATEXIT__.unshift({
        func: func,
        arg: arg
    })
}
var WasmElementaryMediaTrack = {
    init: function () {
        const CloseReason = Object.freeze({
            SOURCE_CLOSED: 0,
            SOURCE_ERROR: 1,
            SOURCE_DETACHED: 2,
            SOURCE_SUSPENDED: 3,
            TRACK_DISABLED: 4,
            TRACK_ENDED: 5,
            TRACK_SEEKING: 6,
            UNKNOWN: 7
        });
        const STR_TO_CLOSE_REASON = new Map([
            ["sourceclosed", CloseReason.SOURCE_CLOSED],
            ["sourceerror", CloseReason.SOURCE_ERROR],
            ["sourcedetached", CloseReason.SOURCE_DETACHED],
            ["sourcesuspended", CloseReason.SOURCE_SUSPENDED],
            ["trackdisabled", CloseReason.TRACK_DISABLED],
            ["trackended", CloseReason.TRACK_ENDED],
            ["trackseeking", CloseReason.TRACK_SEEKING],
            ["unknown", CloseReason.UNKNOWN]
        ]);
        WasmElementaryMediaTrack = {
            handleMap: [],
            listenerMap: {},
            _callFunction: function (handle, name, ...args) {
                return EmssCommon._callFunction(WasmElementaryMediaTrack.handleMap, handle, name, ...args)
            },
            _callAsyncFunction: function (handle, onFinished, userData, name, ...args) {
                return EmssCommon._callAsyncFunction(WasmElementaryMediaTrack.handleMap, handle, EmssCommon._exceptionToErrorCode, onFinished, userData, name, ...args)
            },
            _getProperty: function (handle, property, retPtr, type) {
                return EmssCommon._getProperty(WasmElementaryMediaTrack.handleMap, handle, property, retPtr, type)
            },
            _getPropertyWithConversion: function (handle, property, conversionFunction, retPtr, type) {
                return EmssCommon._getPropertyWithConversion(WasmElementaryMediaTrack.handleMap, handle, property, conversionFunction, retPtr, type)
            },
            _setListener: function (handle, eventName, eventHandler) {
                return EmssCommon._setListener(WasmElementaryMediaTrack, handle, eventName, eventHandler)
            },
            _setProperty: function (handle, property, value) {
                return EmssCommon._setProperty(WasmElementaryMediaTrack.handleMap, handle, property, value)
            },
            _stringToCloseReason: function (input) {
                return STR_TO_CLOSE_REASON.has(input) ? STR_TO_CLOSE_REASON.get(input) : CloseReason.UNKNOWN
            }
        }
    }
};

function _elementaryMediaTrackAppendPacket(handle, packetPtr) {
    try {
        const packet = EmssCommon._makePacketFromPtr(packetPtr);
        const data = EmssCommon._makePacketDataFromPtr(packetPtr);
        tizentvwasm.SideThreadElementaryMediaTrack.appendPacketSync(handle, packet, data);
        return EmssCommon.Result.SUCCESS
    } catch (error) {
        return EmssCommon._exceptionToErrorCode(error)
    }
}

function _elementaryMediaTrackClearListeners(handle) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(41, 1, handle);
    if (!(handle in WasmElementaryMediaTrack.handleMap)) {
        return EmssCommon.Result.WRONG_HANDLE
    }
    return EmssCommon._clearListeners(WasmElementaryMediaTrack, handle)
}

function _elementaryMediaTrackRemove(handle) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(42, 1, handle);
    if (!(handle in WasmElementaryMediaTrack.handleMap)) {
        return EmssCommon.Result.WRONG_HANDLE
    }
    EmssCommon._clearListeners(WasmElementaryMediaTrack, handle);
    delete WasmElementaryMediaTrack.handleMap[handle];
    delete WasmElementaryMediaTrack.listenerMap[handle];
    return EmssCommon.Result.SUCCESS
}

function _elementaryMediaTrackSetListenersForSessionIdEmulation(handle, closedHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(43, 1, handle, closedHandler, userData);
    const onClosed = (event, runningFromDefaultHandler) => {
        if (!runningFromDefaultHandler && WasmElementaryMediaTrack.listenerMap[handle]["trackclosed"]) {
            return
        }
        dynCall_vii(closedHandler, WasmElementaryMediaTrack._stringToCloseReason(event.reason), userData)
    };
    const obj = WasmElementaryMediaTrack.handleMap[handle];
    if (obj) {
        WasmElementaryMediaTrack.listenerMap[handle]["trackclosed_sid_emulation"] = onClosed;
        obj.addEventListener("trackclosed", onClosed)
    } else {}
    return EmssCommon.Result.SUCCESS
}

function _elementaryMediaTrackSetOnAppendError(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(44, 1, handle, eventHandler, userData);
    return WasmElementaryMediaTrack._setListener(handle, "appenderror", event => {
        const appendError = event.error;
        const asyncAppendResult = EmssCommon._exceptionToErrorCode(appendError);
        dynCall_vii(eventHandler, asyncAppendResult, userData)
    })
}

function _elementaryMediaTrackSetOnSeek(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(45, 1, handle, eventHandler, userData);
    return WasmElementaryMediaTrack._setListener(handle, "seek", event => {
        dynCall_vfi(eventHandler, event.newTime, userData)
    })
}

function _elementaryMediaTrackSetOnSessionIdChanged(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(46, 1, handle, eventHandler, userData);
    return WasmElementaryMediaTrack._setListener(handle, "sessionidchanged", event => {
        dynCall_vii(eventHandler, event.sessionId, userData)
    })
}

function _elementaryMediaTrackSetOnTrackClosed(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(47, 1, handle, eventHandler, userData);
    return WasmElementaryMediaTrack._setListener(handle, "trackclosed", event => {
        const closeReason = WasmElementaryMediaTrack._stringToCloseReason(event.reason);
        dynCall_vii(eventHandler, closeReason, userData);
        const onClosedForSessionEmulation = WasmElementaryMediaTrack.listenerMap[handle]["trackclosed_sid_emulation"];
        if (onClosedForSessionEmulation) {
            onClosedForSessionEmulation(event, true)
        }
    })
}

function _elementaryMediaTrackSetOnTrackOpen(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(48, 1, handle, eventHandler, userData);
    return WasmElementaryMediaTrack._setListener(handle, "trackopen", () => dynCall("vi", eventHandler, [userData]))
}

function _elementaryMediaTrackUnsetListenersForSessionIdEmulation(handle) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(49, 1, handle);
    const obj = WasmElementaryMediaTrack.handleMap[handle];
    obj.removeEventListener("trackclosed", WasmElementaryMediaTrack.listenerMap[handle]["trackclosed_sid_emulation"]);
    WasmElementaryMediaTrack.listenerMap[handle]["trackclosed_sid_emulation"] = null;
    return EmssCommon.Result.SUCCESS
}

function _emscripten_check_blocking_allowed() {}
var JSEvents = {
    keyEvent: 0,
    mouseEvent: 0,
    wheelEvent: 0,
    uiEvent: 0,
    focusEvent: 0,
    deviceOrientationEvent: 0,
    deviceMotionEvent: 0,
    fullscreenChangeEvent: 0,
    pointerlockChangeEvent: 0,
    visibilityChangeEvent: 0,
    touchEvent: 0,
    previousFullscreenElement: null,
    previousScreenX: null,
    previousScreenY: null,
    removeEventListenersRegistered: false,
    removeAllEventListeners: function () {
        for (var i = JSEvents.eventHandlers.length - 1; i >= 0; --i) {
            JSEvents._removeHandler(i)
        }
        JSEvents.eventHandlers = [];
        JSEvents.deferredCalls = []
    },
    registerRemoveEventListeners: function () {
        if (!JSEvents.removeEventListenersRegistered) {
            __ATEXIT__.push(JSEvents.removeAllEventListeners);
            JSEvents.removeEventListenersRegistered = true
        }
    },
    deferredCalls: [],
    deferCall: function (targetFunction, precedence, argsList) {
        function arraysHaveEqualContent(arrA, arrB) {
            if (arrA.length != arrB.length) return false;
            for (var i in arrA) {
                if (arrA[i] != arrB[i]) return false
            }
            return true
        }
        for (var i in JSEvents.deferredCalls) {
            var call = JSEvents.deferredCalls[i];
            if (call.targetFunction == targetFunction && arraysHaveEqualContent(call.argsList, argsList)) {
                return
            }
        }
        JSEvents.deferredCalls.push({
            targetFunction: targetFunction,
            precedence: precedence,
            argsList: argsList
        });
        JSEvents.deferredCalls.sort(function (x, y) {
            return x.precedence < y.precedence
        })
    },
    removeDeferredCalls: function (targetFunction) {
        for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
            if (JSEvents.deferredCalls[i].targetFunction == targetFunction) {
                JSEvents.deferredCalls.splice(i, 1);
                --i
            }
        }
    },
    canPerformEventHandlerRequests: function () {
        return JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls
    },
    runDeferredCalls: function () {
        if (!JSEvents.canPerformEventHandlerRequests()) {
            return
        }
        for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
            var call = JSEvents.deferredCalls[i];
            JSEvents.deferredCalls.splice(i, 1);
            --i;
            call.targetFunction.apply(this, call.argsList)
        }
    },
    inEventHandler: 0,
    currentEventHandler: null,
    eventHandlers: [],
    removeAllHandlersOnTarget: function (target, eventTypeString) {
        for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
            if (JSEvents.eventHandlers[i].target == target && (!eventTypeString || eventTypeString == JSEvents.eventHandlers[i].eventTypeString)) {
                JSEvents._removeHandler(i--)
            }
        }
    },
    _removeHandler: function (i) {
        var h = JSEvents.eventHandlers[i];
        h.target.removeEventListener(h.eventTypeString, h.eventListenerFunc, h.useCapture);
        JSEvents.eventHandlers.splice(i, 1)
    },
    registerOrRemoveHandler: function (eventHandler) {
        var jsEventHandler = function jsEventHandler(event) {
            ++JSEvents.inEventHandler;
            JSEvents.currentEventHandler = eventHandler;
            JSEvents.runDeferredCalls();
            eventHandler.handlerFunc(event);
            JSEvents.runDeferredCalls();
            --JSEvents.inEventHandler
        };
        if (eventHandler.callbackfunc) {
            eventHandler.eventListenerFunc = jsEventHandler;
            eventHandler.target.addEventListener(eventHandler.eventTypeString, jsEventHandler, eventHandler.useCapture);
            JSEvents.eventHandlers.push(eventHandler);
            JSEvents.registerRemoveEventListeners()
        } else {
            for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
                if (JSEvents.eventHandlers[i].target == eventHandler.target && JSEvents.eventHandlers[i].eventTypeString == eventHandler.eventTypeString) {
                    JSEvents._removeHandler(i--)
                }
            }
        }
    },
    queueEventHandlerOnThread_iiii: function (targetThread, eventHandlerFunc, eventTypeId, eventData, userData) {
        var stackTop = stackSave();
        var varargs = stackAlloc(12);
        HEAP32[varargs >> 2] = eventTypeId;
        HEAP32[varargs + 4 >> 2] = eventData;
        HEAP32[varargs + 8 >> 2] = userData;
        _emscripten_async_queue_on_thread_(targetThread, 637534208, eventHandlerFunc, eventData, varargs);
        stackRestore(stackTop)
    },
    getTargetThreadForEventCallback: function (targetThread) {
        switch (targetThread) {
            case 1:
                return 0;
            case 2:
                return PThread.currentProxiedOperationCallerThread;
            default:
                return targetThread
        }
    },
    getNodeNameForTarget: function (target) {
        if (!target) return "";
        if (target == window) return "#window";
        if (target == screen) return "#screen";
        return target && target.nodeName ? target.nodeName : ""
    },
    fullscreenEnabled: function () {
        return document.fullscreenEnabled || document.webkitFullscreenEnabled
    }
};

function __requestPointerLock(target) {
    if (target.requestPointerLock) {
        target.requestPointerLock()
    } else if (target.msRequestPointerLock) {
        target.msRequestPointerLock()
    } else {
        if (document.body.requestPointerLock || document.body.msRequestPointerLock) {
            return -3
        } else {
            return -1
        }
    }
    return 0
}

function _emscripten_exit_pointerlock() {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(50, 1);
    JSEvents.removeDeferredCalls(__requestPointerLock);
    if (document.exitPointerLock) {
        document.exitPointerLock()
    } else if (document.msExitPointerLock) {
        document.msExitPointerLock()
    } else {
        return -1
    }
    return 0
}

function _emscripten_futex_wait(addr, val, timeout) {
    if (addr <= 0 || addr > HEAP8.length || addr & 3 != 0) return -28;
    if (ENVIRONMENT_IS_WORKER) {
        var ret = Atomics.wait(HEAP32, addr >> 2, val, timeout);
        if (ret === "timed-out") return -73;
        if (ret === "not-equal") return -6;
        if (ret === "ok") return 0;
        throw "Atomics.wait returned an unexpected value " + ret
    } else {
        const oldAddr = Atomics.exchange(HEAP32, __main_thread_futex_wait_address >> 2, addr);
        var loadedVal = Atomics.load(HEAP32, addr >> 2);
        if (val != loadedVal) {
            Atomics.store(HEAP32, __main_thread_futex_wait_address >> 2, oldAddr);
            return -6
        }
        var tNow = performance.now();
        var tEnd = tNow + timeout;
        var ourWaitAddress = addr;
        while (addr == ourWaitAddress) {
            tNow = performance.now();
            if (tNow > tEnd) {
                Atomics.store(HEAP32, __main_thread_futex_wait_address >> 2, oldAddr);
                return -73
            }
            _emscripten_main_thread_process_queued_calls();
            addr = Atomics.load(HEAP32, __main_thread_futex_wait_address >> 2)
        }
        return 0
    }
}

function __fillGamepadEventData(eventStruct, e) {
    HEAPF64[eventStruct >> 3] = e.timestamp;
    for (var i = 0; i < e.axes.length; ++i) {
        HEAPF64[eventStruct + i * 8 + 16 >> 3] = e.axes[i]
    }
    for (var i = 0; i < e.buttons.length; ++i) {
        if (typeof e.buttons[i] === "object") {
            HEAPF64[eventStruct + i * 8 + 528 >> 3] = e.buttons[i].value
        } else {
            HEAPF64[eventStruct + i * 8 + 528 >> 3] = e.buttons[i]
        }
    }
    for (var i = 0; i < e.buttons.length; ++i) {
        if (typeof e.buttons[i] === "object") {
            HEAP32[eventStruct + i * 4 + 1040 >> 2] = e.buttons[i].pressed
        } else {
            HEAP32[eventStruct + i * 4 + 1040 >> 2] = e.buttons[i] == 1
        }
    }
    HEAP32[eventStruct + 1296 >> 2] = e.connected;
    HEAP32[eventStruct + 1300 >> 2] = e.index;
    HEAP32[eventStruct + 8 >> 2] = e.axes.length;
    HEAP32[eventStruct + 12 >> 2] = e.buttons.length;
    stringToUTF8(e.id, eventStruct + 1304, 64);
    stringToUTF8(e.mapping, eventStruct + 1368, 64)
}

function _emscripten_get_gamepad_status(index, gamepadState) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(51, 1, index, gamepadState);
    if (index < 0 || index >= JSEvents.lastGamepadState.length) return -5;
    if (!JSEvents.lastGamepadState[index]) return -7;
    __fillGamepadEventData(gamepadState, JSEvents.lastGamepadState[index]);
    return 0
}

function _emscripten_get_heap_size() {
    return HEAP8.length
}

function _emscripten_get_num_gamepads() {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(52, 1);
    return JSEvents.lastGamepadState.length
}

function _emscripten_has_threading_support() {
    return typeof SharedArrayBuffer !== "undefined"
}

function __reallyNegative(x) {
    return x < 0 || x === 0 && 1 / x === -Infinity
}

function __formatString(format, varargs) {
    assert((varargs & 3) === 0);
    var textIndex = format;
    var argIndex = varargs;

    function prepVararg(ptr, type) {
        if (type === "double" || type === "i64") {
            if (ptr & 7) {
                assert((ptr & 7) === 4);
                ptr += 4
            }
        } else {
            assert((ptr & 3) === 0)
        }
        return ptr
    }

    function getNextArg(type) {
        var ret;
        argIndex = prepVararg(argIndex, type);
        if (type === "double") {
            ret = HEAPF64[argIndex >> 3];
            argIndex += 8
        } else if (type == "i64") {
            ret = [HEAP32[argIndex >> 2], HEAP32[argIndex + 4 >> 2]];
            argIndex += 8
        } else {
            assert((argIndex & 3) === 0);
            type = "i32";
            ret = HEAP32[argIndex >> 2];
            argIndex += 4
        }
        return ret
    }
    var ret = [];
    var curr, next, currArg;
    while (1) {
        var startTextIndex = textIndex;
        curr = HEAP8[textIndex >> 0];
        if (curr === 0) break;
        next = HEAP8[textIndex + 1 >> 0];
        if (curr == 37) {
            var flagAlwaysSigned = false;
            var flagLeftAlign = false;
            var flagAlternative = false;
            var flagZeroPad = false;
            var flagPadSign = false;
            flagsLoop: while (1) {
                switch (next) {
                    case 43:
                        flagAlwaysSigned = true;
                        break;
                    case 45:
                        flagLeftAlign = true;
                        break;
                    case 35:
                        flagAlternative = true;
                        break;
                    case 48:
                        if (flagZeroPad) {
                            break flagsLoop
                        } else {
                            flagZeroPad = true;
                            break
                        }
                        case 32:
                            flagPadSign = true;
                            break;
                        default:
                            break flagsLoop
                }
                textIndex++;
                next = HEAP8[textIndex + 1 >> 0]
            }
            var width = 0;
            if (next == 42) {
                width = getNextArg("i32");
                textIndex++;
                next = HEAP8[textIndex + 1 >> 0]
            } else {
                while (next >= 48 && next <= 57) {
                    width = width * 10 + (next - 48);
                    textIndex++;
                    next = HEAP8[textIndex + 1 >> 0]
                }
            }
            var precisionSet = false,
                precision = -1;
            if (next == 46) {
                precision = 0;
                precisionSet = true;
                textIndex++;
                next = HEAP8[textIndex + 1 >> 0];
                if (next == 42) {
                    precision = getNextArg("i32");
                    textIndex++
                } else {
                    while (1) {
                        var precisionChr = HEAP8[textIndex + 1 >> 0];
                        if (precisionChr < 48 || precisionChr > 57) break;
                        precision = precision * 10 + (precisionChr - 48);
                        textIndex++
                    }
                }
                next = HEAP8[textIndex + 1 >> 0]
            }
            if (precision < 0) {
                precision = 6;
                precisionSet = false
            }
            var argSize;
            switch (String.fromCharCode(next)) {
                case "h":
                    var nextNext = HEAP8[textIndex + 2 >> 0];
                    if (nextNext == 104) {
                        textIndex++;
                        argSize = 1
                    } else {
                        argSize = 2
                    }
                    break;
                case "l":
                    var nextNext = HEAP8[textIndex + 2 >> 0];
                    if (nextNext == 108) {
                        textIndex++;
                        argSize = 8
                    } else {
                        argSize = 4
                    }
                    break;
                case "L":
                case "q":
                case "j":
                    argSize = 8;
                    break;
                case "z":
                case "t":
                case "I":
                    argSize = 4;
                    break;
                default:
                    argSize = null
            }
            if (argSize) textIndex++;
            next = HEAP8[textIndex + 1 >> 0];
            switch (String.fromCharCode(next)) {
                case "d":
                case "i":
                case "u":
                case "o":
                case "x":
                case "X":
                case "p": {
                    var signed = next == 100 || next == 105;
                    argSize = argSize || 4;
                    currArg = getNextArg("i" + argSize * 8);
                    var argText;
                    if (argSize == 8) {
                        currArg = makeBigInt(currArg[0], currArg[1], next == 117)
                    }
                    if (argSize <= 4) {
                        var limit = Math.pow(256, argSize) - 1;
                        currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8)
                    }
                    var currAbsArg = Math.abs(currArg);
                    var prefix = "";
                    if (next == 100 || next == 105) {
                        argText = reSign(currArg, 8 * argSize, 1).toString(10)
                    } else if (next == 117) {
                        argText = unSign(currArg, 8 * argSize, 1).toString(10);
                        currArg = Math.abs(currArg)
                    } else if (next == 111) {
                        argText = (flagAlternative ? "0" : "") + currAbsArg.toString(8)
                    } else if (next == 120 || next == 88) {
                        prefix = flagAlternative && currArg != 0 ? "0x" : "";
                        if (currArg < 0) {
                            currArg = -currArg;
                            argText = (currAbsArg - 1).toString(16);
                            var buffer = [];
                            for (var i = 0; i < argText.length; i++) {
                                buffer.push((15 - parseInt(argText[i], 16)).toString(16))
                            }
                            argText = buffer.join("");
                            while (argText.length < argSize * 2) argText = "f" + argText
                        } else {
                            argText = currAbsArg.toString(16)
                        }
                        if (next == 88) {
                            prefix = prefix.toUpperCase();
                            argText = argText.toUpperCase()
                        }
                    } else if (next == 112) {
                        if (currAbsArg === 0) {
                            argText = "(nil)"
                        } else {
                            prefix = "0x";
                            argText = currAbsArg.toString(16)
                        }
                    }
                    if (precisionSet) {
                        while (argText.length < precision) {
                            argText = "0" + argText
                        }
                    }
                    if (currArg >= 0) {
                        if (flagAlwaysSigned) {
                            prefix = "+" + prefix
                        } else if (flagPadSign) {
                            prefix = " " + prefix
                        }
                    }
                    if (argText.charAt(0) == "-") {
                        prefix = "-" + prefix;
                        argText = argText.substr(1)
                    }
                    while (prefix.length + argText.length < width) {
                        if (flagLeftAlign) {
                            argText += " "
                        } else {
                            if (flagZeroPad) {
                                argText = "0" + argText
                            } else {
                                prefix = " " + prefix
                            }
                        }
                    }
                    argText = prefix + argText;
                    argText.split("").forEach(function (chr) {
                        ret.push(chr.charCodeAt(0))
                    });
                    break
                }
                case "f":
                case "F":
                case "e":
                case "E":
                case "g":
                case "G": {
                    currArg = getNextArg("double");
                    var argText;
                    if (isNaN(currArg)) {
                        argText = "nan";
                        flagZeroPad = false
                    } else if (!isFinite(currArg)) {
                        argText = (currArg < 0 ? "-" : "") + "inf";
                        flagZeroPad = false
                    } else {
                        var isGeneral = false;
                        var effectivePrecision = Math.min(precision, 20);
                        if (next == 103 || next == 71) {
                            isGeneral = true;
                            precision = precision || 1;
                            var exponent = parseInt(currArg.toExponential(effectivePrecision).split("e")[1], 10);
                            if (precision > exponent && exponent >= -4) {
                                next = (next == 103 ? "f" : "F").charCodeAt(0);
                                precision -= exponent + 1
                            } else {
                                next = (next == 103 ? "e" : "E").charCodeAt(0);
                                precision--
                            }
                            effectivePrecision = Math.min(precision, 20)
                        }
                        if (next == 101 || next == 69) {
                            argText = currArg.toExponential(effectivePrecision);
                            if (/[eE][-+]\d$/.test(argText)) {
                                argText = argText.slice(0, -1) + "0" + argText.slice(-1)
                            }
                        } else if (next == 102 || next == 70) {
                            argText = currArg.toFixed(effectivePrecision);
                            if (currArg === 0 && __reallyNegative(currArg)) {
                                argText = "-" + argText
                            }
                        }
                        var parts = argText.split("e");
                        if (isGeneral && !flagAlternative) {
                            while (parts[0].length > 1 && parts[0].indexOf(".") != -1 && (parts[0].slice(-1) == "0" || parts[0].slice(-1) == ".")) {
                                parts[0] = parts[0].slice(0, -1)
                            }
                        } else {
                            if (flagAlternative && argText.indexOf(".") == -1) parts[0] += ".";
                            while (precision > effectivePrecision++) parts[0] += "0"
                        }
                        argText = parts[0] + (parts.length > 1 ? "e" + parts[1] : "");
                        if (next == 69) argText = argText.toUpperCase();
                        if (currArg >= 0) {
                            if (flagAlwaysSigned) {
                                argText = "+" + argText
                            } else if (flagPadSign) {
                                argText = " " + argText
                            }
                        }
                    }
                    while (argText.length < width) {
                        if (flagLeftAlign) {
                            argText += " "
                        } else {
                            if (flagZeroPad && (argText[0] == "-" || argText[0] == "+")) {
                                argText = argText[0] + "0" + argText.slice(1)
                            } else {
                                argText = (flagZeroPad ? "0" : " ") + argText
                            }
                        }
                    }
                    if (next < 97) argText = argText.toUpperCase();
                    argText.split("").forEach(function (chr) {
                        ret.push(chr.charCodeAt(0))
                    });
                    break
                }
                case "s": {
                    var arg = getNextArg("i8*");
                    var argLength = arg ? _strlen(arg) : "(null)".length;
                    if (precisionSet) argLength = Math.min(argLength, precision);
                    if (!flagLeftAlign) {
                        while (argLength < width--) {
                            ret.push(32)
                        }
                    }
                    if (arg) {
                        for (var i = 0; i < argLength; i++) {
                            ret.push(HEAPU8[arg++ >> 0])
                        }
                    } else {
                        ret = ret.concat(intArrayFromString("(null)".substr(0, argLength), true))
                    }
                    if (flagLeftAlign) {
                        while (argLength < width--) {
                            ret.push(32)
                        }
                    }
                    break
                }
                case "c": {
                    if (flagLeftAlign) ret.push(getNextArg("i8"));
                    while (--width > 0) {
                        ret.push(32)
                    }
                    if (!flagLeftAlign) ret.push(getNextArg("i8"));
                    break
                }
                case "n": {
                    var ptr = getNextArg("i32*");
                    HEAP32[ptr >> 2] = ret.length;
                    break
                }
                case "%": {
                    ret.push(curr);
                    break
                }
                default: {
                    for (var i = startTextIndex; i < textIndex + 2; i++) {
                        ret.push(HEAP8[i >> 0])
                    }
                }
            }
            textIndex += 2
        } else {
            ret.push(curr);
            textIndex += 1
        }
    }
    return ret
}

function __emscripten_traverse_stack(args) {
    if (!args || !args.callee || !args.callee.name) {
        return [null, "", ""]
    }
    var funstr = args.callee.toString();
    var funcname = args.callee.name;
    var str = "(";
    var first = true;
    for (var i in args) {
        var a = args[i];
        if (!first) {
            str += ", "
        }
        first = false;
        if (typeof a === "number" || typeof a === "string") {
            str += a
        } else {
            str += "(" + typeof a + ")"
        }
    }
    str += ")";
    var caller = args.callee.caller;
    args = caller ? caller.arguments : [];
    if (first) str = "";
    return [args, funcname, str]
}

function _emscripten_get_callstack_js(flags) {
    var callstack = jsStackTrace();
    var iThisFunc = callstack.lastIndexOf("_emscripten_log");
    var iThisFunc2 = callstack.lastIndexOf("_emscripten_get_callstack");
    var iNextLine = callstack.indexOf("\n", Math.max(iThisFunc, iThisFunc2)) + 1;
    callstack = callstack.slice(iNextLine);
    if (flags & 8 && typeof emscripten_source_map === "undefined") {
        warnOnce('Source map information is not available, emscripten_log with EM_LOG_C_STACK will be ignored. Build with "--pre-js $EMSCRIPTEN/src/emscripten-source-map.min.js" linker flag to add source map loading to code.');
        flags ^= 8;
        flags |= 16
    }
    var stack_args = null;
    if (flags & 128) {
        stack_args = __emscripten_traverse_stack(arguments);
        while (stack_args[1].indexOf("_emscripten_") >= 0) stack_args = __emscripten_traverse_stack(stack_args[0])
    }
    var lines = callstack.split("\n");
    callstack = "";
    var newFirefoxRe = new RegExp("\\s*(.*?)@(.*?):([0-9]+):([0-9]+)");
    var firefoxRe = new RegExp("\\s*(.*?)@(.*):(.*)(:(.*))?");
    var chromeRe = new RegExp("\\s*at (.*?) \\((.*):(.*):(.*)\\)");
    for (var l in lines) {
        var line = lines[l];
        var jsSymbolName = "";
        var file = "";
        var lineno = 0;
        var column = 0;
        var parts = chromeRe.exec(line);
        if (parts && parts.length == 5) {
            jsSymbolName = parts[1];
            file = parts[2];
            lineno = parts[3];
            column = parts[4]
        } else {
            parts = newFirefoxRe.exec(line);
            if (!parts) parts = firefoxRe.exec(line);
            if (parts && parts.length >= 4) {
                jsSymbolName = parts[1];
                file = parts[2];
                lineno = parts[3];
                column = parts[4] | 0
            } else {
                callstack += line + "\n";
                continue
            }
        }
        var cSymbolName = flags & 32 ? demangle(jsSymbolName) : jsSymbolName;
        if (!cSymbolName) {
            cSymbolName = jsSymbolName
        }
        var haveSourceMap = false;
        if (flags & 8) {
            var orig = emscripten_source_map.originalPositionFor({
                line: lineno,
                column: column
            });
            haveSourceMap = orig && orig.source;
            if (haveSourceMap) {
                if (flags & 64) {
                    orig.source = orig.source.substring(orig.source.replace(/\\/g, "/").lastIndexOf("/") + 1)
                }
                callstack += "    at " + cSymbolName + " (" + orig.source + ":" + orig.line + ":" + orig.column + ")\n"
            }
        }
        if (flags & 16 || !haveSourceMap) {
            if (flags & 64) {
                file = file.substring(file.replace(/\\/g, "/").lastIndexOf("/") + 1)
            }
            callstack += (haveSourceMap ? "     = " + jsSymbolName : "    at " + cSymbolName) + " (" + file + ":" + lineno + ":" + column + ")\n"
        }
        if (flags & 128 && stack_args[0]) {
            if (stack_args[1] == jsSymbolName && stack_args[2].length > 0) {
                callstack = callstack.replace(/\s+$/, "");
                callstack += " with values: " + stack_args[1] + stack_args[2] + "\n"
            }
            stack_args = __emscripten_traverse_stack(stack_args[0])
        }
    }
    callstack = callstack.replace(/\s+$/, "");
    return callstack
}

function _emscripten_log_js(flags, str) {
    if (flags & 24) {
        str = str.replace(/\s+$/, "");
        str += (str.length > 0 ? "\n" : "") + _emscripten_get_callstack_js(flags)
    }
    if (flags & 1) {
        if (flags & 4) {
            console.error(str)
        } else if (flags & 2) {
            console.warn(str)
        } else {
            console.log(str)
        }
    } else if (flags & 6) {
        err(str)
    } else {
        out(str)
    }
}

function _emscripten_log(flags, varargs) {
    var format = HEAP32[varargs >> 2];
    varargs += 4;
    var str = "";
    if (format) {
        var result = __formatString(format, varargs);
        for (var i = 0; i < result.length; ++i) {
            str += String.fromCharCode(result[i])
        }
    }
    _emscripten_log_js(flags, str)
}

function _emscripten_proxy_to_main_thread_js(index, sync) {
    var numCallArgs = arguments.length - 2;
    var stack = stackSave();
    var args = stackAlloc(numCallArgs * 8);
    var b = args >> 3;
    for (var i = 0; i < numCallArgs; i++) {
        HEAPF64[b + i] = arguments[2 + i]
    }
    var ret = _emscripten_run_in_main_runtime_thread_js(index, numCallArgs, args, sync);
    stackRestore(stack);
    return ret
}
var _emscripten_receive_on_main_thread_js_callArgs = [];

function _emscripten_receive_on_main_thread_js(index, numCallArgs, args) {
    _emscripten_receive_on_main_thread_js_callArgs.length = numCallArgs;
    var b = args >> 3;
    for (var i = 0; i < numCallArgs; i++) {
        _emscripten_receive_on_main_thread_js_callArgs[i] = HEAPF64[b + i]
    }
    var isEmAsmConst = index < 0;
    var func = !isEmAsmConst ? proxiedFunctionTable[index] : ASM_CONSTS[-index - 1];
    let thisArg = null;
    if (func.name === "___syscall142" || func.name === "___syscall168") {
        thisArg = {
            returnEarly: true
        }
    }
    return func.apply(thisArg, _emscripten_receive_on_main_thread_js_callArgs)
}

function __maybeCStringToJsString(cString) {
    return cString === cString + 0 ? UTF8ToString(cString) : cString
}
var __specialEventTargets = [0, typeof document !== "undefined" ? document : 0, typeof window !== "undefined" ? window : 0];

function __findEventTarget(target) {
    var domElement = __specialEventTargets[target] || (typeof document !== "undefined" ? document.querySelector(__maybeCStringToJsString(target)) : undefined);
    return domElement
}

function _emscripten_request_pointerlock(target, deferUntilInEventHandler) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(53, 1, target, deferUntilInEventHandler);
    target = __findEventTarget(target);
    if (!target) return -4;
    if (!target.requestPointerLock && !target.msRequestPointerLock) {
        return -1
    }
    var canPerformRequests = JSEvents.canPerformEventHandlerRequests();
    if (!canPerformRequests) {
        if (deferUntilInEventHandler) {
            JSEvents.deferCall(__requestPointerLock, 2, [target]);
            return 1
        } else {
            return -2
        }
    }
    return __requestPointerLock(target)
}

function abortOnCannotGrowMemory(requestedSize) {
    abort("OOM")
}

function _emscripten_resize_heap(requestedSize) {
    abortOnCannotGrowMemory(requestedSize)
}

function _emscripten_sample_gamepad_data() {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(54, 1);
    return (JSEvents.lastGamepadState = navigator.getGamepads ? navigator.getGamepads() : navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : null) ? 0 : -1
}

function stringToNewUTF8(jsString) {
    var length = lengthBytesUTF8(jsString) + 1;
    var cString = _malloc(length);
    stringToUTF8(jsString, cString, length);
    return cString
}

function _emscripten_set_offscreencanvas_size_on_target_thread_js(targetThread, targetCanvas, width, height) {
    var stackTop = stackSave();
    var varargs = stackAlloc(12);
    var targetCanvasPtr = 0;
    if (targetCanvas) {
        targetCanvasPtr = stringToNewUTF8(targetCanvas)
    }
    HEAP32[varargs >> 2] = targetCanvasPtr;
    HEAP32[varargs + 4 >> 2] = width;
    HEAP32[varargs + 8 >> 2] = height;
    _emscripten_async_queue_on_thread_(targetThread, 657457152, 0, targetCanvasPtr, varargs);
    stackRestore(stackTop)
}

function _emscripten_set_offscreencanvas_size_on_target_thread(targetThread, targetCanvas, width, height) {
    targetCanvas = targetCanvas ? UTF8ToString(targetCanvas) : "";
    _emscripten_set_offscreencanvas_size_on_target_thread_js(targetThread, targetCanvas, width, height)
}

function __findCanvasEventTarget(target) {
    return __findEventTarget(target)
}

function _emscripten_set_canvas_element_size_calling_thread(target, width, height) {
    var canvas = __findCanvasEventTarget(target);
    if (!canvas) return -4;
    if (canvas.canvasSharedPtr) {
        HEAP32[canvas.canvasSharedPtr >> 2] = width;
        HEAP32[canvas.canvasSharedPtr + 4 >> 2] = height
    }
    if (canvas.offscreenCanvas || !canvas.controlTransferredOffscreen) {
        if (canvas.offscreenCanvas) canvas = canvas.offscreenCanvas;
        var autoResizeViewport = false;
        if (canvas.GLctxObject && canvas.GLctxObject.GLctx) {
            var prevViewport = canvas.GLctxObject.GLctx.getParameter(canvas.GLctxObject.GLctx.VIEWPORT);
            autoResizeViewport = prevViewport[0] === 0 && prevViewport[1] === 0 && prevViewport[2] === canvas.width && prevViewport[3] === canvas.height
        }
        canvas.width = width;
        canvas.height = height;
        if (autoResizeViewport) {
            canvas.GLctxObject.GLctx.viewport(0, 0, width, height)
        }
    } else if (canvas.canvasSharedPtr) {
        var targetThread = HEAP32[canvas.canvasSharedPtr + 8 >> 2];
        _emscripten_set_offscreencanvas_size_on_target_thread(targetThread, target, width, height);
        return 1
    } else {
        return -4
    }
    return 0
}

function _emscripten_set_canvas_element_size_main_thread(target, width, height) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(55, 1, target, width, height);
    return _emscripten_set_canvas_element_size_calling_thread(target, width, height)
}

function _emscripten_set_canvas_element_size(target, width, height) {
    var canvas = __findCanvasEventTarget(target);
    if (canvas) {
        return _emscripten_set_canvas_element_size_calling_thread(target, width, height)
    } else {
        return _emscripten_set_canvas_element_size_main_thread(target, width, height)
    }
}

function __registerKeyEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
    targetThread = JSEvents.getTargetThreadForEventCallback(targetThread);
    if (!JSEvents.keyEvent) JSEvents.keyEvent = _malloc(164);
    var keyEventHandlerFunc = function (ev) {
        var e = ev || event;
        var keyEventData = targetThread ? _malloc(164) : JSEvents.keyEvent;
        stringToUTF8(e.key ? e.key : "", keyEventData + 0, 32);
        stringToUTF8(e.code ? e.code : "", keyEventData + 32, 32);
        HEAP32[keyEventData + 64 >> 2] = e.location;
        HEAP32[keyEventData + 68 >> 2] = e.ctrlKey;
        HEAP32[keyEventData + 72 >> 2] = e.shiftKey;
        HEAP32[keyEventData + 76 >> 2] = e.altKey;
        HEAP32[keyEventData + 80 >> 2] = e.metaKey;
        HEAP32[keyEventData + 84 >> 2] = e.repeat;
        stringToUTF8(e.locale ? e.locale : "", keyEventData + 88, 32);
        stringToUTF8(e.char ? e.char : "", keyEventData + 120, 32);
        HEAP32[keyEventData + 152 >> 2] = e.charCode;
        HEAP32[keyEventData + 156 >> 2] = e.keyCode;
        HEAP32[keyEventData + 160 >> 2] = e.which;
        if (targetThread) JSEvents.queueEventHandlerOnThread_iiii(targetThread, callbackfunc, eventTypeId, keyEventData, userData);
        else if (dynCall_iiii(callbackfunc, eventTypeId, keyEventData, userData)) e.preventDefault()
    };
    var eventHandler = {
        target: __findEventTarget(target),
        allowsDeferredCalls: true,
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: keyEventHandlerFunc,
        useCapture: useCapture
    };
    JSEvents.registerOrRemoveHandler(eventHandler)
}

function _emscripten_set_keydown_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(56, 1, target, userData, useCapture, callbackfunc, targetThread);
    __registerKeyEventCallback(target, userData, useCapture, callbackfunc, 2, "keydown", targetThread);
    return 0
}

function _emscripten_set_keyup_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(57, 1, target, userData, useCapture, callbackfunc, targetThread);
    __registerKeyEventCallback(target, userData, useCapture, callbackfunc, 3, "keyup", targetThread);
    return 0
}

function __getBoundingClientRect(e) {
    return e.getBoundingClientRect()
}

function __fillMouseEventData(eventStruct, e, target) {
    HEAP32[eventStruct >> 2] = e.screenX;
    HEAP32[eventStruct + 4 >> 2] = e.screenY;
    HEAP32[eventStruct + 8 >> 2] = e.clientX;
    HEAP32[eventStruct + 12 >> 2] = e.clientY;
    HEAP32[eventStruct + 16 >> 2] = e.ctrlKey;
    HEAP32[eventStruct + 20 >> 2] = e.shiftKey;
    HEAP32[eventStruct + 24 >> 2] = e.altKey;
    HEAP32[eventStruct + 28 >> 2] = e.metaKey;
    HEAP16[eventStruct + 32 >> 1] = e.button;
    HEAP16[eventStruct + 34 >> 1] = e.buttons;
    var movementX = e["movementX"] || e.screenX - JSEvents.previousScreenX;
    var movementY = e["movementY"] || e.screenY - JSEvents.previousScreenY;
    HEAP32[eventStruct + 36 >> 2] = movementX;
    HEAP32[eventStruct + 40 >> 2] = movementY;
    var rect = __specialEventTargets.indexOf(target) < 0 ? __getBoundingClientRect(target) : {
        "left": 0,
        "top": 0
    };
    HEAP32[eventStruct + 44 >> 2] = e.clientX - rect.left;
    HEAP32[eventStruct + 48 >> 2] = e.clientY - rect.top;
    if (e.type !== "wheel" && e.type !== "mousewheel") {
        JSEvents.previousScreenX = e.screenX;
        JSEvents.previousScreenY = e.screenY
    }
}

function __registerMouseEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
    targetThread = JSEvents.getTargetThreadForEventCallback(targetThread);
    if (!JSEvents.mouseEvent) JSEvents.mouseEvent = _malloc(64);
    target = __findEventTarget(target);
    var mouseEventHandlerFunc = function (ev) {
        var e = ev || event;
        __fillMouseEventData(JSEvents.mouseEvent, e, target);
        if (targetThread) {
            var mouseEventData = _malloc(64);
            __fillMouseEventData(mouseEventData, e, target);
            JSEvents.queueEventHandlerOnThread_iiii(targetThread, callbackfunc, eventTypeId, mouseEventData, userData)
        } else if (dynCall_iiii(callbackfunc, eventTypeId, JSEvents.mouseEvent, userData)) e.preventDefault()
    };
    var eventHandler = {
        target: target,
        allowsDeferredCalls: eventTypeString != "mousemove" && eventTypeString != "mouseenter" && eventTypeString != "mouseleave",
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: mouseEventHandlerFunc,
        useCapture: useCapture
    };
    JSEvents.registerOrRemoveHandler(eventHandler)
}

function _emscripten_set_mousedown_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(58, 1, target, userData, useCapture, callbackfunc, targetThread);
    __registerMouseEventCallback(target, userData, useCapture, callbackfunc, 5, "mousedown", targetThread);
    return 0
}

function _emscripten_set_mousemove_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(59, 1, target, userData, useCapture, callbackfunc, targetThread);
    __registerMouseEventCallback(target, userData, useCapture, callbackfunc, 8, "mousemove", targetThread);
    return 0
}

function _emscripten_set_mouseup_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(60, 1, target, userData, useCapture, callbackfunc, targetThread);
    __registerMouseEventCallback(target, userData, useCapture, callbackfunc, 6, "mouseup", targetThread);
    return 0
}

function __fillPointerlockChangeEventData(eventStruct, e) {
    var pointerLockElement = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement;
    var isPointerlocked = !!pointerLockElement;
    HEAP32[eventStruct >> 2] = isPointerlocked;
    var nodeName = JSEvents.getNodeNameForTarget(pointerLockElement);
    var id = pointerLockElement && pointerLockElement.id ? pointerLockElement.id : "";
    stringToUTF8(nodeName, eventStruct + 4, 128);
    stringToUTF8(id, eventStruct + 132, 128)
}

function __registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
    targetThread = JSEvents.getTargetThreadForEventCallback(targetThread);
    if (!JSEvents.pointerlockChangeEvent) JSEvents.pointerlockChangeEvent = _malloc(260);
    var pointerlockChangeEventHandlerFunc = function (ev) {
        var e = ev || event;
        var pointerlockChangeEvent = targetThread ? _malloc(260) : JSEvents.pointerlockChangeEvent;
        __fillPointerlockChangeEventData(pointerlockChangeEvent, e);
        if (targetThread) JSEvents.queueEventHandlerOnThread_iiii(targetThread, callbackfunc, eventTypeId, pointerlockChangeEvent, userData);
        else if (dynCall_iiii(callbackfunc, eventTypeId, pointerlockChangeEvent, userData)) e.preventDefault()
    };
    var eventHandler = {
        target: target,
        allowsDeferredCalls: false,
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: pointerlockChangeEventHandlerFunc,
        useCapture: useCapture
    };
    JSEvents.registerOrRemoveHandler(eventHandler)
}

function _emscripten_set_pointerlockchange_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(61, 1, target, userData, useCapture, callbackfunc, targetThread);
    if (!document || !document.body || !document.body.requestPointerLock && !document.body.mozRequestPointerLock && !document.body.webkitRequestPointerLock && !document.body.msRequestPointerLock) {
        return -1
    }
    target = __findEventTarget(target);
    if (!target) return -4;
    __registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "pointerlockchange", targetThread);
    __registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "mozpointerlockchange", targetThread);
    __registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "webkitpointerlockchange", targetThread);
    __registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "mspointerlockchange", targetThread);
    return 0
}

function __registerPointerlockErrorEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString) {
    var pointerlockErrorEventHandlerFunc = function (ev) {
        var e = ev || event;
        if (targetThread) JSEvents.queueEventHandlerOnThread_iiii(targetThread, callbackfunc, eventTypeId, 0, userData);
        else if (dynCall_iiii(callbackfunc, eventTypeId, 0, userData)) e.preventDefault()
    };
    var eventHandler = {
        target: target,
        allowsDeferredCalls: false,
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: pointerlockErrorEventHandlerFunc,
        useCapture: useCapture
    };
    JSEvents.registerOrRemoveHandler(eventHandler)
}

function _emscripten_set_pointerlockerror_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(62, 1, target, userData, useCapture, callbackfunc, targetThread);
    if (!document || !document.body.requestPointerLock && !document.body.mozRequestPointerLock && !document.body.webkitRequestPointerLock && !document.body.msRequestPointerLock) {
        return -1
    }
    target = __findEventTarget(target);
    if (!target) return -4;
    __registerPointerlockErrorEventCallback(target, userData, useCapture, callbackfunc, 38, "pointerlockerror", targetThread);
    __registerPointerlockErrorEventCallback(target, userData, useCapture, callbackfunc, 38, "mozpointerlockerror", targetThread);
    __registerPointerlockErrorEventCallback(target, userData, useCapture, callbackfunc, 38, "webkitpointerlockerror", targetThread);
    __registerPointerlockErrorEventCallback(target, userData, useCapture, callbackfunc, 38, "mspointerlockerror", targetThread);
    return 0
}

function __registerWheelEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
    targetThread = JSEvents.getTargetThreadForEventCallback(targetThread);
    if (!JSEvents.wheelEvent) JSEvents.wheelEvent = _malloc(96);
    var wheelHandlerFunc = function (ev) {
        var e = ev || event;
        var wheelEvent = targetThread ? _malloc(96) : JSEvents.wheelEvent;
        __fillMouseEventData(wheelEvent, e, target);
        HEAPF64[wheelEvent + 64 >> 3] = e["deltaX"];
        HEAPF64[wheelEvent + 72 >> 3] = e["deltaY"];
        HEAPF64[wheelEvent + 80 >> 3] = e["deltaZ"];
        HEAP32[wheelEvent + 88 >> 2] = e["deltaMode"];
        if (targetThread) JSEvents.queueEventHandlerOnThread_iiii(targetThread, callbackfunc, eventTypeId, wheelEvent, userData);
        else if (dynCall_iiii(callbackfunc, eventTypeId, wheelEvent, userData)) e.preventDefault()
    };
    var mouseWheelHandlerFunc = function (ev) {
        var e = ev || event;
        __fillMouseEventData(JSEvents.wheelEvent, e, target);
        HEAPF64[JSEvents.wheelEvent + 64 >> 3] = e["wheelDeltaX"] || 0;
        var wheelDeltaY = -(e["wheelDeltaY"] || e["wheelDelta"]);
        HEAPF64[JSEvents.wheelEvent + 72 >> 3] = wheelDeltaY;
        HEAPF64[JSEvents.wheelEvent + 80 >> 3] = 0;
        HEAP32[JSEvents.wheelEvent + 88 >> 2] = 0;
        var shouldCancel = dynCall_iiii(callbackfunc, eventTypeId, JSEvents.wheelEvent, userData);
        if (shouldCancel) {
            e.preventDefault()
        }
    };
    var eventHandler = {
        target: target,
        allowsDeferredCalls: true,
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: eventTypeString == "wheel" ? wheelHandlerFunc : mouseWheelHandlerFunc,
        useCapture: useCapture
    };
    JSEvents.registerOrRemoveHandler(eventHandler)
}

function _emscripten_set_wheel_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(63, 1, target, userData, useCapture, callbackfunc, targetThread);
    target = __findEventTarget(target);
    if (typeof target.onwheel !== "undefined") {
        __registerWheelEventCallback(target, userData, useCapture, callbackfunc, 9, "wheel", targetThread);
        return 0
    } else if (typeof target.onmousewheel !== "undefined") {
        __registerWheelEventCallback(target, userData, useCapture, callbackfunc, 9, "mousewheel", targetThread);
        return 0
    } else {
        return -1
    }
}

function _emscripten_syscall(which, varargs) {
    switch (which) {
        case 102:
            return ___syscall102(which, varargs);
        case 122:
            return ___syscall122(which, varargs);
        case 142:
            return ___syscall142(which, varargs);
        case 168:
            return ___syscall168(which, varargs);
        case 195:
            return ___syscall195(which, varargs);
        case 197:
            return ___syscall197(which, varargs);
        case 199:
            return ___syscall199(which, varargs);
        case 20:
            return ___syscall20(which, varargs);
        case 200:
            return ___syscall200(which, varargs);
        case 201:
            return ___syscall201(which, varargs);
        case 202:
            return ___syscall202(which, varargs);
        case 220:
            return ___syscall220(which, varargs);
        case 221:
            return ___syscall221(which, varargs);
        case 3:
            return ___syscall3(which, varargs);
        case 33:
            return ___syscall33(which, varargs);
        case 4:
            return ___syscall4(which, varargs);
        case 5:
            return ___syscall5(which, varargs);
        case 54:
            return ___syscall54(which, varargs);
        case 91:
            return ___syscall91(which, varargs);
        default:
            throw "surprising proxied syscall: " + which
    }
}
var __emscripten_webgl_power_preferences = ["default", "low-power", "high-performance"];
var GL = {
    counter: 1,
    lastError: 0,
    buffers: [],
    mappedBuffers: {},
    programs: [],
    framebuffers: [],
    renderbuffers: [],
    textures: [],
    uniforms: [],
    shaders: [],
    vaos: [],
    contexts: {},
    currentContext: null,
    offscreenCanvases: {},
    timerQueriesEXT: [],
    programInfos: {},
    stringCache: {},
    unpackAlignment: 4,
    init: function () {
        var miniTempFloatBuffer = new Float32Array(GL.MINI_TEMP_BUFFER_SIZE);
        for (var i = 0; i < GL.MINI_TEMP_BUFFER_SIZE; i++) {
            GL.miniTempBufferFloatViews[i] = miniTempFloatBuffer.subarray(0, i + 1)
        }
        var miniTempIntBuffer = new Int32Array(GL.MINI_TEMP_BUFFER_SIZE);
        for (var i = 0; i < GL.MINI_TEMP_BUFFER_SIZE; i++) {
            GL.miniTempBufferIntViews[i] = miniTempIntBuffer.subarray(0, i + 1)
        }
    },
    recordError: function recordError(errorCode) {
        if (!GL.lastError) {
            GL.lastError = errorCode
        }
    },
    getNewId: function (table) {
        var ret = GL.counter++;
        for (var i = table.length; i < ret; i++) {
            table[i] = null
        }
        return ret
    },
    MINI_TEMP_BUFFER_SIZE: 256,
    miniTempBufferFloatViews: [0],
    miniTempBufferIntViews: [0],
    getSource: function (shader, count, string, length) {
        var source = "";
        for (var i = 0; i < count; ++i) {
            var len = length ? HEAP32[length + i * 4 >> 2] : -1;
            source += UTF8ToString(HEAP32[string + i * 4 >> 2], len < 0 ? undefined : len)
        }
        return source
    },
    createContext: function (canvas, webGLContextAttributes) {
        var ctx = canvas.getContext("webgl", webGLContextAttributes);
        if (!ctx) return 0;
        var handle = GL.registerContext(ctx, webGLContextAttributes);
        return handle
    },
    registerContext: function (ctx, webGLContextAttributes) {
        var handle = _malloc(8);
        HEAP32[handle + 4 >> 2] = _pthread_self();
        var context = {
            handle: handle,
            attributes: webGLContextAttributes,
            version: webGLContextAttributes.majorVersion,
            GLctx: ctx
        };
        if (ctx.canvas) ctx.canvas.GLctxObject = context;
        GL.contexts[handle] = context;
        if (typeof webGLContextAttributes.enableExtensionsByDefault === "undefined" || webGLContextAttributes.enableExtensionsByDefault) {
            GL.initExtensions(context)
        }
        return handle
    },
    makeContextCurrent: function (contextHandle) {
        GL.currentContext = GL.contexts[contextHandle];
        Module.ctx = GLctx = GL.currentContext && GL.currentContext.GLctx;
        return !(contextHandle && !GLctx)
    },
    getContext: function (contextHandle) {
        return GL.contexts[contextHandle]
    },
    deleteContext: function (contextHandle) {
        if (GL.currentContext === GL.contexts[contextHandle]) GL.currentContext = null;
        if (typeof JSEvents === "object" && GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx) JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
        if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx && GL.contexts[contextHandle].GLctx.canvas) GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
        _free(GL.contexts[contextHandle]);
        GL.contexts[contextHandle] = null
    },
    acquireInstancedArraysExtension: function (ctx) {
        var ext = ctx.getExtension("ANGLE_instanced_arrays");
        if (ext) {
            ctx["vertexAttribDivisor"] = function (index, divisor) {
                ext["vertexAttribDivisorANGLE"](index, divisor)
            };
            ctx["drawArraysInstanced"] = function (mode, first, count, primcount) {
                ext["drawArraysInstancedANGLE"](mode, first, count, primcount)
            };
            ctx["drawElementsInstanced"] = function (mode, count, type, indices, primcount) {
                ext["drawElementsInstancedANGLE"](mode, count, type, indices, primcount)
            }
        }
    },
    acquireVertexArrayObjectExtension: function (ctx) {
        var ext = ctx.getExtension("OES_vertex_array_object");
        if (ext) {
            ctx["createVertexArray"] = function () {
                return ext["createVertexArrayOES"]()
            };
            ctx["deleteVertexArray"] = function (vao) {
                ext["deleteVertexArrayOES"](vao)
            };
            ctx["bindVertexArray"] = function (vao) {
                ext["bindVertexArrayOES"](vao)
            };
            ctx["isVertexArray"] = function (vao) {
                return ext["isVertexArrayOES"](vao)
            }
        }
    },
    acquireDrawBuffersExtension: function (ctx) {
        var ext = ctx.getExtension("WEBGL_draw_buffers");
        if (ext) {
            ctx["drawBuffers"] = function (n, bufs) {
                ext["drawBuffersWEBGL"](n, bufs)
            }
        }
    },
    initExtensions: function (context) {
        if (!context) context = GL.currentContext;
        if (context.initExtensionsDone) return;
        context.initExtensionsDone = true;
        var GLctx = context.GLctx;
        if (context.version < 2) {
            GL.acquireInstancedArraysExtension(GLctx);
            GL.acquireVertexArrayObjectExtension(GLctx);
            GL.acquireDrawBuffersExtension(GLctx)
        }
        GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query");
        var automaticallyEnabledExtensions = ["OES_texture_float", "OES_texture_half_float", "OES_standard_derivatives", "OES_vertex_array_object", "WEBGL_compressed_texture_s3tc", "WEBGL_depth_texture", "OES_element_index_uint", "EXT_texture_filter_anisotropic", "EXT_frag_depth", "WEBGL_draw_buffers", "ANGLE_instanced_arrays", "OES_texture_float_linear", "OES_texture_half_float_linear", "EXT_blend_minmax", "EXT_shader_texture_lod", "WEBGL_compressed_texture_pvrtc", "EXT_color_buffer_half_float", "WEBGL_color_buffer_float", "EXT_sRGB", "WEBGL_compressed_texture_etc1", "EXT_disjoint_timer_query", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_astc", "EXT_color_buffer_float", "WEBGL_compressed_texture_s3tc_srgb", "EXT_disjoint_timer_query_webgl2", "WEBKIT_WEBGL_compressed_texture_pvrtc"];
        var exts = GLctx.getSupportedExtensions() || [];
        exts.forEach(function (ext) {
            if (automaticallyEnabledExtensions.indexOf(ext) != -1) {
                GLctx.getExtension(ext)
            }
        })
    },
    populateUniformTable: function (program) {
        var p = GL.programs[program];
        var ptable = GL.programInfos[program] = {
            uniforms: {},
            maxUniformLength: 0,
            maxAttributeLength: -1,
            maxUniformBlockNameLength: -1
        };
        var utable = ptable.uniforms;
        var numUniforms = GLctx.getProgramParameter(p, 35718);
        for (var i = 0; i < numUniforms; ++i) {
            var u = GLctx.getActiveUniform(p, i);
            var name = u.name;
            ptable.maxUniformLength = Math.max(ptable.maxUniformLength, name.length + 1);
            if (name.slice(-1) == "]") {
                name = name.slice(0, name.lastIndexOf("["))
            }
            var loc = GLctx.getUniformLocation(p, name);
            if (loc) {
                var id = GL.getNewId(GL.uniforms);
                utable[name] = [u.size, id];
                GL.uniforms[id] = loc;
                for (var j = 1; j < u.size; ++j) {
                    var n = name + "[" + j + "]";
                    loc = GLctx.getUniformLocation(p, n);
                    id = GL.getNewId(GL.uniforms);
                    GL.uniforms[id] = loc
                }
            }
        }
    }
};

function _emscripten_webgl_do_create_context(target, attributes) {
    var contextAttributes = {};
    var a = attributes >> 2;
    contextAttributes["alpha"] = !!HEAP32[a + (0 >> 2)];
    contextAttributes["depth"] = !!HEAP32[a + (4 >> 2)];
    contextAttributes["stencil"] = !!HEAP32[a + (8 >> 2)];
    contextAttributes["antialias"] = !!HEAP32[a + (12 >> 2)];
    contextAttributes["premultipliedAlpha"] = !!HEAP32[a + (16 >> 2)];
    contextAttributes["preserveDrawingBuffer"] = !!HEAP32[a + (20 >> 2)];
    var powerPreference = HEAP32[a + (24 >> 2)];
    contextAttributes["powerPreference"] = __emscripten_webgl_power_preferences[powerPreference];
    contextAttributes["failIfMajorPerformanceCaveat"] = !!HEAP32[a + (28 >> 2)];
    contextAttributes.majorVersion = HEAP32[a + (32 >> 2)];
    contextAttributes.minorVersion = HEAP32[a + (36 >> 2)];
    contextAttributes.enableExtensionsByDefault = HEAP32[a + (40 >> 2)];
    contextAttributes.explicitSwapControl = HEAP32[a + (44 >> 2)];
    contextAttributes.proxyContextToMainThread = HEAP32[a + (48 >> 2)];
    contextAttributes.renderViaOffscreenBackBuffer = HEAP32[a + (52 >> 2)];
    var canvas = __findCanvasEventTarget(target);
    if (!canvas) {
        return 0
    }
    if (contextAttributes.explicitSwapControl) {
        return 0
    }
    var contextHandle = GL.createContext(canvas, contextAttributes);
    return contextHandle
}

function _emscripten_webgl_create_context(a0, a1) {
    return _emscripten_webgl_do_create_context(a0, a1)
}

function __convert_to_enum(object, integer) {
    for (const key in object) {
        if (object[key].value === integer) {
            return object[key].name
        }
    }
    return null
}
var __family = {
    AF_UNSPEC: {
        name: "af_unspec",
        value: 0
    },
    AF_INET: {
        name: "af_inet",
        value: 2
    },
    AF_INET6: {
        name: "af_inet6",
        value: 10
    }
};

function __int_to_family(family) {
    return __convert_to_enum(__family, family)
}

function __convert_to_int(object, enumeration) {
    for (const key in object) {
        if (object[key].name === enumeration) {
            return object[key].value
        }
    }
}

function __family_to_int(family) {
    return __convert_to_int(__family, family)
}
var __sock_type = {
    SOCK_ANY: {
        name: "sock_any",
        value: 0
    },
    SOCK_STREAM: {
        name: "sock_stream",
        value: 1
    },
    SOCK_DGRAM: {
        name: "sock_dgram",
        value: 2
    }
};

function __int_to_sock_type(family) {
    return __convert_to_enum(__sock_type, family)
}

function __sock_type_to_int(family) {
    return __convert_to_int(__sock_type, family)
}
var __protocol = {
    IPPROTO_IP: {
        name: "ipproto_ip",
        value: 0
    },
    IPPROTO_TCP: {
        name: "ipproto_tcp",
        value: 6
    },
    IPPROTO_UDP: {
        name: "ipproto_udp",
        value: 17
    }
};

function __int_to_protocol(family) {
    return __convert_to_enum(__protocol, family)
}

function __protocol_to_int(family) {
    return __convert_to_int(__protocol, family)
}

function __freeaddrinfo(addrinfo) {
    let ptr = addrinfo;
    while (ptr !== 0) {
        const helper = ptr;
        const addr = HEAP32[ptr + 20 >> 2];
        const canonName = HEAP32[ptr + 24 >> 2];
        ptr = HEAP32[ptr + 28 >> 2];
        if (addr) {
            _free(addr)
        }
        if (canonName) {
            _free(canonName)
        }
        _free(helper)
    }
}

function _getaddrinfo(nodePtr, servicePtr, hintsPtr, resPtr) {
    const hr = new tizentvwasm.HostResolverSync;
    const strlen = function (ptr) {
        let len = 0;
        while (HEAP8[ptr + len]) {
            len++
        }
        return len
    };
    let node = nodePtr ? new TextDecoder("utf-8").decode(HEAPU8.slice(nodePtr, nodePtr + strlen(nodePtr) + 1)) : null;
    const service = servicePtr ? new TextDecoder("utf-8").decode(HEAPU8.slice(servicePtr, servicePtr + strlen(servicePtr) + 1)) : null;
    let flags = 0;
    let family = __family.AF_UNSPEC.value;
    let socktype = 0;
    let protocol = 0;
    if (hintsPtr) {
        flags = HEAP32[hintsPtr + 0 >> 2];
        family = HEAP32[hintsPtr + 4 >> 2];
        socktype = HEAP32[hintsPtr + 8 >> 2];
        protocol = HEAP32[hintsPtr + 12 >> 2]
    }
    family = __int_to_family(family);
    if (family === null) {
        return -6
    }
    socktype = __int_to_sock_type(socktype);
    if (socktype === null) {
        return -7
    }
    protocol = __int_to_protocol(protocol);
    if (node === null && (flags & 2) === 2) {
        return -1
    }
    const hasGetAddrInfo2 = !!tizentvwasm.HostResolverSync.prototype.getAddrInfo2;
    const getAddrInfoFn = hasGetAddrInfo2 ? hr.getAddrInfo2 : hr.getAddrInfo;
    const use_fake_node = !hasGetAddrInfo2 && (node === null && service !== null && (flags & 1024) === 1024);
    if (use_fake_node) {
        if (family === "af_inet6") {
            node = "::1"
        } else {
            node = "127.0.0.1"
        }
    }
    const hint = new tizentvwasm.AddressInfo(flags, family, socktype, protocol, null, null);
    try {
        const addrList = getAddrInfoFn.call(hr, node, service, hint);
        let i = 0;
        let prev;
        let head = 0;
        for (const item of addrList) {
            const ptr = _malloc(32);
            if (ptr === 0 && head !== 0) {
                __freeaddrinfo(head);
                return -10
            }
            if (i === 0) {
                head = ptr
            }
            HEAP32[ptr + 0 >> 2] = item.flags;
            HEAP32[ptr + 4 >> 2] = __family_to_int(item.family);
            HEAP32[ptr + 8 >> 2] = __sock_type_to_int(item.sockType);
            HEAP32[ptr + 12 >> 2] = __protocol_to_int(item.protocol);
            HEAP32[ptr + 16 >> 2] = item.addr.bytes.length;
            if (item.addr.bytes.length > 0) {
                const addr = _malloc(item.addr.bytes.length);
                if (addr === 0 && head !== 0) {
                    __freeaddrinfo(head);
                    return -10
                }
                HEAP8.set(item.addr.bytes, addr);
                if (use_fake_node) {
                    if (item.family === "af_inet") {
                        if (flags & 1) {
                            HEAP8.set([0, 0, 0, 0], addr + 4)
                        } else {
                            HEAP8.set([127, 0, 0, 1], addr + 4)
                        }
                    } else if (item.family === "af_inet6") {
                        if (flags & 1) {
                            HEAP8.set([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], addr + 8)
                        } else {
                            HEAP8.set([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], addr + 8)
                        }
                    }
                }
                HEAP32[ptr + 20 >> 2] = addr
            } else {
                HEAP32[ptr + 20 >> 2] = 0
            }
            if (item.canonName.length > 0) {
                const canonNamePtr = _malloc(item.canonName.length);
                if (canonNamePtr === 0 && head !== 0) {
                    __freeaddrinfo(head);
                    return -10
                }
                HEAP8.set(item.canonName, canonNamePtr);
                HEAP32[ptr + 24 >> 2] = canonNamePtr
            } else {
                HEAP32[ptr + 24 >> 2] = 0
            }
            HEAP32[ptr + 28 >> 2] = 0;
            if (i !== 0) {
                HEAP32[prev + 28 >> 2] = ptr
            }
            prev = ptr;
            i += 1
        }
        HEAP32[resPtr >> 2] = head;
        return 0
    } catch (err) {
        return hr.errorno
    }
}

function _getenv(name) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(64, 1, name);
    if (name === 0) return 0;
    name = UTF8ToString(name);
    if (!ENV.hasOwnProperty(name)) return 0;
    if (_getenv.ret) _free(_getenv.ret);
    _getenv.ret = allocateUTF8(ENV[name]);
    return _getenv.ret
}

function _getpwuid(uid) {
    return 0
}

function _gettimeofday(ptr) {
    var now = Date.now();
    HEAP32[ptr >> 2] = now / 1e3 | 0;
    HEAP32[ptr + 4 >> 2] = now % 1e3 * 1e3 | 0;
    return 0
}
var ___tm_timezone = (stringToUTF8("GMT", 646448, 4), 646448);

function _gmtime_r(time, tmPtr) {
    var date = new Date(HEAP32[time >> 2] * 1e3);
    HEAP32[tmPtr >> 2] = date.getUTCSeconds();
    HEAP32[tmPtr + 4 >> 2] = date.getUTCMinutes();
    HEAP32[tmPtr + 8 >> 2] = date.getUTCHours();
    HEAP32[tmPtr + 12 >> 2] = date.getUTCDate();
    HEAP32[tmPtr + 16 >> 2] = date.getUTCMonth();
    HEAP32[tmPtr + 20 >> 2] = date.getUTCFullYear() - 1900;
    HEAP32[tmPtr + 24 >> 2] = date.getUTCDay();
    HEAP32[tmPtr + 36 >> 2] = 0;
    HEAP32[tmPtr + 32 >> 2] = 0;
    var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
    var yday = (date.getTime() - start) / (1e3 * 60 * 60 * 24) | 0;
    HEAP32[tmPtr + 28 >> 2] = yday;
    HEAP32[tmPtr + 40 >> 2] = ___tm_timezone;
    return tmPtr
}

function _heavy_call_timeout_msecs(call_no, args) {
    let args_ptr = HEAPF64[args / 8 + 1];
    if (call_no == 142) {
        let tv = HEAP32[args_ptr + 16 >> 2];
        if (tv === 0) {
            return -1
        }
        let sec = HEAP32[tv >> 2];
        let usec = HEAP32[tv + 4 >> 2];
        return sec * 1e3 + usec / 1e3
    } else if (call_no == 168) {
        return HEAP32[args_ptr + 8 >> 2]
    }
    return 0
}

function _llvm_bswap_i64(l, h) {
    var retl = _llvm_bswap_i32(h) >>> 0;
    var reth = _llvm_bswap_i32(l) >>> 0;
    return (setTempRet0(reth), retl) | 0
}

function _llvm_stackrestore(p) {
    var self = _llvm_stacksave;
    var ret = self.LLVM_SAVEDSTACKS[p];
    self.LLVM_SAVEDSTACKS.splice(p, 1);
    stackRestore(ret)
}

function _llvm_stacksave() {
    var self = _llvm_stacksave;
    if (!self.LLVM_SAVEDSTACKS) {
        self.LLVM_SAVEDSTACKS = []
    }
    self.LLVM_SAVEDSTACKS.push(stackSave());
    return self.LLVM_SAVEDSTACKS.length - 1
}

function _longjmp(env, value) {
    _setThrew(env, value || 1);
    throw "longjmp"
}
var WasmHTMLMediaElement = {
    init: function () {
        WasmHTMLMediaElement = {
            handleMap: [],
            listenerMap: {},
            _callFunction: function (handle, name, ...args) {
                return EmssCommon._callFunction(WasmHTMLMediaElement.handleMap, handle, name, ...args)
            },
            _callAsyncFunction: function (handle, onFinished, userData, name, ...args) {
                return EmssCommon._callAsyncFunction(WasmHTMLMediaElement.handleMap, handle, EmssCommon._exceptionToErrorCode, onFinished, userData, name, ...args)
            },
            _getProperty: function (handle, property, retPtr, type) {
                return EmssCommon._getProperty(WasmHTMLMediaElement.handleMap, handle, property, retPtr, type)
            },
            _setProperty: function (handle, property, value) {
                return EmssCommon._setProperty(WasmHTMLMediaElement.handleMap, handle, property, value)
            },
            _setListener: function (handle, eventName, eventHandler) {
                return EmssCommon._setListener(WasmHTMLMediaElement, handle, eventName, eventHandler)
            }
        }
    }
};

function _mediaElementById(id) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(65, 1, id);
    const strId = UTF8ToString(id);
    const mediaElement = document.getElementById(strId);
    if (!mediaElement) {
        return -1
    }
    const handle = WasmHTMLMediaElement.handleMap.length;
    WasmHTMLMediaElement.handleMap[handle] = mediaElement;
    WasmHTMLMediaElement.listenerMap[handle] = {};
    return handle
}

function _mediaElementClearListeners(handle) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(66, 1, handle);
    if (!(handle in WasmHTMLMediaElement.handleMap)) {
        return EmssCommon.Result.WRONG_HANDLE
    }
    return EmssCommon._clearListeners(WasmHTMLMediaElement, handle)
}

function _mediaElementPlay(handle, onFinished, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(67, 1, handle, onFinished, userData);
    return WasmHTMLMediaElement._callAsyncFunction(handle, onFinished, userData, "play")
}

function _mediaElementRegisterOnErrorEMSS(handle, eventHandler, listenerPtr) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(68, 1, handle, eventHandler, listenerPtr);
    const mediaElement = WasmHTMLMediaElement.handleMap[handle];
    if (!mediaElement) {
        return EmssCommon.Result.WRONG_HANDLE
    }
    if (mediaElement.emssOnErrorListenerEmulation) {
        return EmssCommon.Result.LISTENER_ALREADY_SET
    }
    const emssOnErrorListenerEmulationCb = runningFromDefaultHandler => {
        const mediaListeners = WasmHTMLMediaElement.listenerMap[handle];
        if (!runningFromDefaultHandler && mediaListeners && mediaListeners["error"]) {
            return
        }
        const mediaError = mediaElement.error;
        const errorCode = EmssCommon.MediaPipelineError.GENERAL_ERROR;
        const errorMessage = mediaError.message;
        const length = lengthBytesUTF8(errorMessage) + 1;
        const errorMessagePtr = _malloc(length);
        try {
            stringToUTF8(errorMessage, errorMessagePtr, length);
            dynCall_viii(eventHandler, errorCode, errorMessagePtr, listenerPtr)
        } catch (error) {} finally {
            _free(errorMessagePtr)
        }
    };
    mediaElement.emssOnErrorListenerEmulation = emssOnErrorListenerEmulationCb;
    mediaElement.addEventListener("error", emssOnErrorListenerEmulationCb);
    return EmssCommon.Result.SUCCESS
}

function _mediaElementRegisterOnTimeUpdateEMSS(handle, sourceHandle, eventHandler, listener) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(69, 1, handle, sourceHandle, eventHandler, listener);
    const mediaElement = WasmHTMLMediaElement.handleMap[handle];
    if (!mediaElement) {
        return EmssCommon.Result.WRONG_HANDLE
    }
    const source = WasmElementaryMediaStreamSource.handleMap[sourceHandle];
    if (!source) {
        return EmssCommon.Result.WRONG_HANDLE
    }
    if (mediaElement.emssTimeUpdateListener) {
        return EmssCommon.Result.LISTENER_ALREADY_SET
    }
    const firePlaybackPositionChanged = () => {
        const EMULATED_LOOP_TRESHOLD = 3;
        const newTime = mediaElement.currentTime;
        if (mediaElement.loop && newTime >= mediaElement.duration - EMULATED_LOOP_TRESHOLD) {
            mediaElement.currentTime = 0;
            return
        }
        dynCall_vif(eventHandler, listener, newTime)
    };
    const timeUpdateForPositionChangeEmulationCb = event => {
        if (mediaElement.seeking) {
            return
        }
        firePlaybackPositionChanged()
    };
    const openForPositionChangeEmulationCb = (event, runningFromDefaultHandler) => {
        const sourceListeners = WasmElementaryMediaStreamSource.listenerMap[source];
        if (!runningFromDefaultHandler && sourceListeners && sourceListeners["sourceopen"]) {
            return
        }
        firePlaybackPositionChanged()
    };
    source.emssOpenForPositionChangeEmulation = openForPositionChangeEmulationCb;
    source.addEventListener("sourceopen", openForPositionChangeEmulationCb);
    mediaElement.emssTimeUpdateListener = timeUpdateForPositionChangeEmulationCb;
    mediaElement.addEventListener("timeupdate", timeUpdateForPositionChangeEmulationCb);
    return EmssCommon.Result.SUCCESS
}

function _mediaElementRemove(handle) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(70, 1, handle);
    if (!(handle in WasmHTMLMediaElement.handleMap)) {
        return EmssCommon.Result.WRONG_HANDLE
    }
    WasmHTMLMediaElement.handleMap[handle].src = null;
    EmssCommon._clearListeners(WasmHTMLMediaElement, handle);
    delete WasmHTMLMediaElement.handleMap[handle];
    delete WasmHTMLMediaElement.listenerMap[handle];
    return EmssCommon.Result.SUCCESS
}

function _mediaElementSetOnCanPlay(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(71, 1, handle, eventHandler, userData);
    return WasmHTMLMediaElement._setListener(handle, "canplay", () => dynCall("vi", eventHandler, [userData]))
}

function _mediaElementSetOnCanPlayThrough(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(72, 1, handle, eventHandler, userData);
    return WasmHTMLMediaElement._setListener(handle, "canplaythrough", () => dynCall("vi", eventHandler, [userData]))
}

function _mediaElementSetOnEnded(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(73, 1, handle, eventHandler, userData);
    return WasmHTMLMediaElement._setListener(handle, "ended", () => dynCall("vi", eventHandler, [userData]))
}

function _mediaElementSetOnError(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(74, 1, handle, eventHandler, userData);
    const mediaElement = WasmHTMLMediaElement.handleMap[handle];
    if (!mediaElement) {
        return EmssCommon.Result.WRONG_HANDLE
    }
    return WasmHTMLMediaElement._setListener(handle, "error", () => {
        const mediaError = mediaElement.error;
        const errorCode = mediaError.code;
        const errorMessage = mediaError.message;
        const length = lengthBytesUTF8(errorMessage) + 1;
        const errorMessagePtr = _malloc(length);
        try {
            stringToUTF8(errorMessage, errorMessagePtr, length);
            dynCall_viii(eventHandler, errorCode, errorMessagePtr, userData)
        } catch (error) {} finally {
            _free(errorMessagePtr)
        }
        const emssOnErrorListenerEmulation = mediaElement.emssOnErrorListenerEmulation;
        if (emssOnErrorListenerEmulation) {
            emssOnErrorListenerEmulation(true)
        }
    })
}

function _mediaElementSetOnLoadStart(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(75, 1, handle, eventHandler, userData);
    return WasmHTMLMediaElement._setListener(handle, "loadstart", () => dynCall("vi", eventHandler, [userData]))
}

function _mediaElementSetOnLoadedData(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(76, 1, handle, eventHandler, userData);
    return WasmHTMLMediaElement._setListener(handle, "loadeddata", () => dynCall("vi", eventHandler, [userData]))
}

function _mediaElementSetOnLoadedMetadata(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(77, 1, handle, eventHandler, userData);
    return WasmHTMLMediaElement._setListener(handle, "loadedmetadata", () => dynCall("vi", eventHandler, [userData]))
}

function _mediaElementSetOnPause(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(78, 1, handle, eventHandler, userData);
    return WasmHTMLMediaElement._setListener(handle, "pause", () => dynCall("vi", eventHandler, [userData]))
}

function _mediaElementSetOnPlay(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(79, 1, handle, eventHandler, userData);
    return WasmHTMLMediaElement._setListener(handle, "play", () => dynCall("vi", eventHandler, [userData]))
}

function _mediaElementSetOnPlaying(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(80, 1, handle, eventHandler, userData);
    return WasmHTMLMediaElement._setListener(handle, "playing", () => dynCall("vi", eventHandler, [userData]))
}

function _mediaElementSetOnSeeked(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(81, 1, handle, eventHandler, userData);
    return WasmHTMLMediaElement._setListener(handle, "seeked", () => dynCall("vi", eventHandler, [userData]))
}

function _mediaElementSetOnSeeking(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(82, 1, handle, eventHandler, userData);
    return WasmHTMLMediaElement._setListener(handle, "seeking", () => dynCall("vi", eventHandler, [userData]))
}

function _mediaElementSetOnTimeUpdate(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(83, 1, handle, eventHandler, userData);
    return WasmHTMLMediaElement._setListener(handle, "timeupdate", () => dynCall("vi", eventHandler, [userData]))
}

function _mediaElementSetOnWaiting(handle, eventHandler, userData) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(84, 1, handle, eventHandler, userData);
    return WasmHTMLMediaElement._setListener(handle, "waiting", () => dynCall("vi", eventHandler, [userData]))
}

function _mediaElementSetSrc(handle, newSrc) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(85, 1, handle, newSrc);
    const mediaElement = WasmHTMLMediaElement.handleMap[handle];
    if (!mediaElement) {
        return EmssCommon.Result.WRONG_HANDLE
    }
    try {
        mediaElement.src = newSrc ? UTF8ToString(newSrc) : null
    } catch (error) {
        return EmssCommon._exceptionToErrorCode(error)
    }
    return EmssCommon.Result.SUCCESS
}

function _mediaElementUnregisterOnErrorEMSS(handle) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(86, 1, handle);
    const mediaElement = WasmHTMLMediaElement.handleMap[handle];
    if (!mediaElement) {
        return EmssCommon.Result.WRONG_HANDLE
    }
    if (!mediaElement.emssOnErrorListenerEmulation) {
        return EmssCommon.Result.NO_SUCH_LISTENER
    }
    mediaElement.removeEventListener("error", mediaElement.emssOnErrorListenerEmulation);
    delete mediaElement.emssOnErrorListenerEmulation;
    return EmssCommon.Result.SUCCESS
}

function _mediaElementUnregisterOnTimeUpdateEMSS(handle, sourceHandle) {
    if (ENVIRONMENT_IS_PTHREAD) return _emscripten_proxy_to_main_thread_js(87, 1, handle, sourceHandle);
    const mediaElement = WasmHTMLMediaElement.handleMap[handle];
    if (!mediaElement) {
        return EmssCommon.Result.WRONG_HANDLE
    }
    if (!mediaElement.emssTimeUpdateListener) {
        return EmssCommon.Result.NO_SUCH_LISTENER
    }
    mediaElement.removeEventListener("timeupdate", mediaElement.emssTimeUpdateListener);
    delete mediaElement.emssTimeUpdateListener;
    const source = WasmElementaryMediaStreamSource.handleMap[sourceHandle];
    if (!source) {} else {
        mediaElement.removeEventListener("sourceopen", source.emssOpenForPositionChangeEmulation);
        delete source.emssOpenForPositionChangeEmulation
    }
    return EmssCommon.Result.SUCCESS
}

function _emscripten_memcpy_big(dest, src, num) {
    HEAPU8.set(HEAPU8.subarray(src, src + num), dest)
}

function _pthread_atfork(prepare, parent, child) {
    err("fork() is not supported: pthread_atfork is a no-op.");
    return 0
}

function _pthread_cleanup_pop(execute) {
    var routine = PThread.exitHandlers.pop();
    if (execute) routine()
}

function _pthread_cleanup_push(routine, arg) {
    if (PThread.exitHandlers === null) {
        PThread.exitHandlers = [];
        if (!ENVIRONMENT_IS_PTHREAD) {
            __ATEXIT__.push(function () {
                PThread.runExitHandlers()
            })
        }
    }
    PThread.exitHandlers.push(function () {
        dynCall_vi(routine, arg)
    })
}

function __spawn_thread(threadParams) {
    if (ENVIRONMENT_IS_PTHREAD) throw "Internal Error! _spawn_thread() can only ever be called from main application thread!";
    var worker = PThread.getNewWorker();
    if (worker.pthread !== undefined) throw "Internal error!";
    if (!threadParams.pthread_ptr) throw "Internal error, no pthread ptr!";
    PThread.runningWorkers.push(worker);
    var tlsMemory = _malloc(128 * 4);
    for (var i = 0; i < 128; ++i) {
        HEAP32[tlsMemory + i * 4 >> 2] = 0
    }
    var stackHigh = threadParams.stackBase + threadParams.stackSize;
    var pthread = PThread.pthreads[threadParams.pthread_ptr] = {
        worker: worker,
        stackBase: threadParams.stackBase,
        stackSize: threadParams.stackSize,
        allocatedOwnStack: threadParams.allocatedOwnStack,
        thread: threadParams.pthread_ptr,
        threadInfoStruct: threadParams.pthread_ptr
    };
    Atomics.store(HEAPU32, pthread.threadInfoStruct + 0 >> 2, 0);
    Atomics.store(HEAPU32, pthread.threadInfoStruct + 4 >> 2, 0);
    Atomics.store(HEAPU32, pthread.threadInfoStruct + 20 >> 2, 0);
    Atomics.store(HEAPU32, pthread.threadInfoStruct + 80 >> 2, threadParams.detached);
    Atomics.store(HEAPU32, pthread.threadInfoStruct + 116 >> 2, tlsMemory);
    Atomics.store(HEAPU32, pthread.threadInfoStruct + 60 >> 2, 0);
    Atomics.store(HEAPU32, pthread.threadInfoStruct + 52 >> 2, pthread.threadInfoStruct);
    Atomics.store(HEAPU32, pthread.threadInfoStruct + 56 >> 2, PROCINFO.pid);
    Atomics.store(HEAPU32, pthread.threadInfoStruct + 120 >> 2, threadParams.stackSize);
    Atomics.store(HEAPU32, pthread.threadInfoStruct + 96 >> 2, threadParams.stackSize);
    Atomics.store(HEAPU32, pthread.threadInfoStruct + 92 >> 2, stackHigh);
    Atomics.store(HEAPU32, pthread.threadInfoStruct + 120 + 8 >> 2, stackHigh);
    Atomics.store(HEAPU32, pthread.threadInfoStruct + 120 + 12 >> 2, threadParams.detached);
    Atomics.store(HEAPU32, pthread.threadInfoStruct + 120 + 20 >> 2, threadParams.schedPolicy);
    Atomics.store(HEAPU32, pthread.threadInfoStruct + 120 + 24 >> 2, threadParams.schedPrio);
    var global_libc = _emscripten_get_global_libc();
    var global_locale = global_libc + 40;
    Atomics.store(HEAPU32, pthread.threadInfoStruct + 188 >> 2, global_locale);
    worker.pthread = pthread;
    var msg = {
        "cmd": "run",
        "start_routine": threadParams.startRoutine,
        "arg": threadParams.arg,
        "threadInfoStruct": threadParams.pthread_ptr,
        "selfThreadId": threadParams.pthread_ptr,
        "parentThreadId": threadParams.parent_pthread_ptr,
        "stackBase": threadParams.stackBase,
        "stackSize": threadParams.stackSize
    };
    worker.runPthread = function () {
        msg.time = performance.now();
        worker.postMessage(msg, threadParams.transferList)
    };
    if (worker.loaded) {
        worker.runPthread();
        delete worker.runPthread
    }
}

function _pthread_getschedparam(thread, policy, schedparam) {
    if (!policy && !schedparam) return ERRNO_CODES.EINVAL;
    if (!thread) {
        err("pthread_getschedparam called with a null thread pointer!");
        return ERRNO_CODES.ESRCH
    }
    var self = HEAP32[thread + 24 >> 2];
    if (self !== thread) {
        err("pthread_getschedparam attempted on thread " + thread + ", which does not point to a valid thread, or does not exist anymore!");
        return ERRNO_CODES.ESRCH
    }
    var schedPolicy = Atomics.load(HEAPU32, thread + 120 + 20 >> 2);
    var schedPrio = Atomics.load(HEAPU32, thread + 120 + 24 >> 2);
    if (policy) HEAP32[policy >> 2] = schedPolicy;
    if (schedparam) HEAP32[schedparam >> 2] = schedPrio;
    return 0
}

function _pthread_create(pthread_ptr, attr, start_routine, arg) {
    if (typeof SharedArrayBuffer === "undefined") {
        err("Current environment does not support SharedArrayBuffer, pthreads are not available!");
        return 6
    }
    if (!pthread_ptr) {
        err("pthread_create called with a null thread pointer!");
        return 28
    }
    var transferList = [];
    var error = 0;
    if (ENVIRONMENT_IS_PTHREAD && (transferList.length === 0 || error)) {
        return _emscripten_sync_run_in_main_thread_4(687865856, pthread_ptr, attr, start_routine, arg)
    }
    if (error) return error;
    var stackSize = 0;
    var stackBase = 0;
    var detached = 0;
    var schedPolicy = 0;
    var schedPrio = 0;
    if (attr) {
        stackSize = HEAP32[attr >> 2];
        stackSize += 81920;
        stackBase = HEAP32[attr + 8 >> 2];
        detached = HEAP32[attr + 12 >> 2] !== 0;
        var inheritSched = HEAP32[attr + 16 >> 2] === 0;
        if (inheritSched) {
            var prevSchedPolicy = HEAP32[attr + 20 >> 2];
            var prevSchedPrio = HEAP32[attr + 24 >> 2];
            var parentThreadPtr = PThread.currentProxiedOperationCallerThread ? PThread.currentProxiedOperationCallerThread : _pthread_self();
            _pthread_getschedparam(parentThreadPtr, attr + 20, attr + 24);
            schedPolicy = HEAP32[attr + 20 >> 2];
            schedPrio = HEAP32[attr + 24 >> 2];
            HEAP32[attr + 20 >> 2] = prevSchedPolicy;
            HEAP32[attr + 24 >> 2] = prevSchedPrio
        } else {
            schedPolicy = HEAP32[attr + 20 >> 2];
            schedPrio = HEAP32[attr + 24 >> 2]
        }
    } else {
        stackSize = 2097152
    }
    var allocatedOwnStack = stackBase == 0;
    if (allocatedOwnStack) {
        stackBase = _memalign(16, stackSize)
    } else {
        stackBase -= stackSize;
        assert(stackBase > 0)
    }
    var threadInfoStruct = _malloc(244);
    for (var i = 0; i < 244 >> 2; ++i) HEAPU32[(threadInfoStruct >> 2) + i] = 0;
    HEAP32[pthread_ptr >> 2] = threadInfoStruct;
    HEAP32[threadInfoStruct + 24 >> 2] = threadInfoStruct;
    var headPtr = threadInfoStruct + 168;
    HEAP32[headPtr >> 2] = headPtr;
    var threadParams = {
        stackBase: stackBase,
        stackSize: stackSize,
        allocatedOwnStack: allocatedOwnStack,
        schedPolicy: schedPolicy,
        schedPrio: schedPrio,
        detached: detached,
        startRoutine: start_routine,
        pthread_ptr: threadInfoStruct,
        parent_pthread_ptr: _pthread_self(),
        arg: arg,
        transferList: transferList
    };
    if (ENVIRONMENT_IS_PTHREAD) {
        threadParams.cmd = "spawnThread";
        postMessage(threadParams, transferList)
    } else {
        __spawn_thread(threadParams)
    }
    return 0
}

function __pthread_testcancel_js() {
    if (!ENVIRONMENT_IS_PTHREAD) return;
    if (!threadInfoStruct) return;
    var cancelDisabled = Atomics.load(HEAPU32, threadInfoStruct + 72 >> 2);
    if (cancelDisabled) return;
    var canceled = Atomics.load(HEAPU32, threadInfoStruct + 0 >> 2);
    if (canceled == 2) throw "Canceled!"
}

function __emscripten_do_pthread_join(thread, status, block) {
    if (!thread) {
        err("pthread_join attempted on a null thread pointer!");
        return ERRNO_CODES.ESRCH
    }
    if (ENVIRONMENT_IS_PTHREAD && selfThreadId == thread) {
        err("PThread " + thread + " is attempting to join to itself!");
        return ERRNO_CODES.EDEADLK
    } else if (!ENVIRONMENT_IS_PTHREAD && PThread.mainThreadBlock == thread) {
        err("Main thread " + thread + " is attempting to join to itself!");
        return ERRNO_CODES.EDEADLK
    }
    var self = HEAP32[thread + 24 >> 2];
    if (self !== thread) {
        err("pthread_join attempted on thread " + thread + ", which does not point to a valid thread, or does not exist anymore!");
        return ERRNO_CODES.ESRCH
    }
    var detached = Atomics.load(HEAPU32, thread + 80 >> 2);
    if (detached) {
        err("Attempted to join thread " + thread + ", which was already detached!");
        return ERRNO_CODES.EINVAL
    }
    if (block && ENVIRONMENT_IS_WEB) {
        _emscripten_check_blocking_allowed()
    }
    for (;;) {
        var threadStatus = Atomics.load(HEAPU32, thread + 0 >> 2);
        if (threadStatus == 1) {
            var threadExitCode = Atomics.load(HEAPU32, thread + 4 >> 2);
            if (status) HEAP32[status >> 2] = threadExitCode;
            Atomics.store(HEAPU32, thread + 80 >> 2, 1);
            if (!ENVIRONMENT_IS_PTHREAD) __cleanup_thread(thread);
            else postMessage({
                "cmd": "cleanupThread",
                "thread": thread
            });
            return 0
        }
        if (!block) {
            return ERRNO_CODES.EBUSY
        }
        __pthread_testcancel_js();
        if (!ENVIRONMENT_IS_PTHREAD) _emscripten_main_thread_process_queued_calls();
        _emscripten_futex_wait(thread + 0, threadStatus, ENVIRONMENT_IS_PTHREAD ? 100 : 1)
    }
}

function _pthread_join(thread, status) {
    return __emscripten_do_pthread_join(thread, status, true)
}

function _sigaction(signum, act, oldact) {
    return 0
}

function _siglongjmp(a0, a1) {
    return _longjmp(a0, a1)
}
var __sigalrm_handler = 0;

function _signal(sig, func) {
    if (sig == 14) {
        __sigalrm_handler = func
    } else {}
    return 0
}

function __isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

function __arraySum(array, index) {
    var sum = 0;
    for (var i = 0; i <= index; sum += array[i++]);
    return sum
}
var __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function __addDays(date, days) {
    var newDate = new Date(date.getTime());
    while (days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
        if (days > daysInCurrentMonth - newDate.getDate()) {
            days -= daysInCurrentMonth - newDate.getDate() + 1;
            newDate.setDate(1);
            if (currentMonth < 11) {
                newDate.setMonth(currentMonth + 1)
            } else {
                newDate.setMonth(0);
                newDate.setFullYear(newDate.getFullYear() + 1)
            }
        } else {
            newDate.setDate(newDate.getDate() + days);
            return newDate
        }
    }
    return newDate
}

function _strftime(s, maxsize, format, tm) {
    var tm_zone = HEAP32[tm + 40 >> 2];
    var date = {
        tm_sec: HEAP32[tm >> 2],
        tm_min: HEAP32[tm + 4 >> 2],
        tm_hour: HEAP32[tm + 8 >> 2],
        tm_mday: HEAP32[tm + 12 >> 2],
        tm_mon: HEAP32[tm + 16 >> 2],
        tm_year: HEAP32[tm + 20 >> 2],
        tm_wday: HEAP32[tm + 24 >> 2],
        tm_yday: HEAP32[tm + 28 >> 2],
        tm_isdst: HEAP32[tm + 32 >> 2],
        tm_gmtoff: HEAP32[tm + 36 >> 2],
        tm_zone: tm_zone ? UTF8ToString(tm_zone) : ""
    };
    var pattern = UTF8ToString(format);
    var EXPANSION_RULES_1 = {
        "%c": "%a %b %d %H:%M:%S %Y",
        "%D": "%m/%d/%y",
        "%F": "%Y-%m-%d",
        "%h": "%b",
        "%r": "%I:%M:%S %p",
        "%R": "%H:%M",
        "%T": "%H:%M:%S",
        "%x": "%m/%d/%y",
        "%X": "%H:%M:%S",
        "%Ec": "%c",
        "%EC": "%C",
        "%Ex": "%m/%d/%y",
        "%EX": "%H:%M:%S",
        "%Ey": "%y",
        "%EY": "%Y",
        "%Od": "%d",
        "%Oe": "%e",
        "%OH": "%H",
        "%OI": "%I",
        "%Om": "%m",
        "%OM": "%M",
        "%OS": "%S",
        "%Ou": "%u",
        "%OU": "%U",
        "%OV": "%V",
        "%Ow": "%w",
        "%OW": "%W",
        "%Oy": "%y"
    };
    for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule])
    }
    var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    function leadingSomething(value, digits, character) {
        var str = typeof value === "number" ? value.toString() : value || "";
        while (str.length < digits) {
            str = character[0] + str
        }
        return str
    }

    function leadingNulls(value, digits) {
        return leadingSomething(value, digits, "0")
    }

    function compareByDay(date1, date2) {
        function sgn(value) {
            return value < 0 ? -1 : value > 0 ? 1 : 0
        }
        var compare;
        if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
            if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
                compare = sgn(date1.getDate() - date2.getDate())
            }
        }
        return compare
    }

    function getFirstWeekStartDate(janFourth) {
        switch (janFourth.getDay()) {
            case 0:
                return new Date(janFourth.getFullYear() - 1, 11, 29);
            case 1:
                return janFourth;
            case 2:
                return new Date(janFourth.getFullYear(), 0, 3);
            case 3:
                return new Date(janFourth.getFullYear(), 0, 2);
            case 4:
                return new Date(janFourth.getFullYear(), 0, 1);
            case 5:
                return new Date(janFourth.getFullYear() - 1, 11, 31);
            case 6:
                return new Date(janFourth.getFullYear() - 1, 11, 30)
        }
    }

    function getWeekBasedYear(date) {
        var thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
        var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
        var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
        var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
        var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
        if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
                return thisDate.getFullYear() + 1
            } else {
                return thisDate.getFullYear()
            }
        } else {
            return thisDate.getFullYear() - 1
        }
    }
    var EXPANSION_RULES_2 = {
        "%a": function (date) {
            return WEEKDAYS[date.tm_wday].substring(0, 3)
        },
        "%A": function (date) {
            return WEEKDAYS[date.tm_wday]
        },
        "%b": function (date) {
            return MONTHS[date.tm_mon].substring(0, 3)
        },
        "%B": function (date) {
            return MONTHS[date.tm_mon]
        },
        "%C": function (date) {
            var year = date.tm_year + 1900;
            return leadingNulls(year / 100 | 0, 2)
        },
        "%d": function (date) {
            return leadingNulls(date.tm_mday, 2)
        },
        "%e": function (date) {
            return leadingSomething(date.tm_mday, 2, " ")
        },
        "%g": function (date) {
            return getWeekBasedYear(date).toString().substring(2)
        },
        "%G": function (date) {
            return getWeekBasedYear(date)
        },
        "%H": function (date) {
            return leadingNulls(date.tm_hour, 2)
        },
        "%I": function (date) {
            var twelveHour = date.tm_hour;
            if (twelveHour == 0) twelveHour = 12;
            else if (twelveHour > 12) twelveHour -= 12;
            return leadingNulls(twelveHour, 2)
        },
        "%j": function (date) {
            return leadingNulls(date.tm_mday + __arraySum(__isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon - 1), 3)
        },
        "%m": function (date) {
            return leadingNulls(date.tm_mon + 1, 2)
        },
        "%M": function (date) {
            return leadingNulls(date.tm_min, 2)
        },
        "%n": function () {
            return "\n"
        },
        "%p": function (date) {
            if (date.tm_hour >= 0 && date.tm_hour < 12) {
                return "AM"
            } else {
                return "PM"
            }
        },
        "%S": function (date) {
            return leadingNulls(date.tm_sec, 2)
        },
        "%t": function () {
            return "\t"
        },
        "%u": function (date) {
            return date.tm_wday || 7
        },
        "%U": function (date) {
            var janFirst = new Date(date.tm_year + 1900, 0, 1);
            var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7 - janFirst.getDay());
            var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
            if (compareByDay(firstSunday, endDate) < 0) {
                var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
                var firstSundayUntilEndJanuary = 31 - firstSunday.getDate();
                var days = firstSundayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
                return leadingNulls(Math.ceil(days / 7), 2)
            }
            return compareByDay(firstSunday, janFirst) === 0 ? "01" : "00"
        },
        "%V": function (date) {
            var janFourthThisYear = new Date(date.tm_year + 1900, 0, 4);
            var janFourthNextYear = new Date(date.tm_year + 1901, 0, 4);
            var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
            var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
            var endDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
            if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
                return "53"
            }
            if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
                return "01"
            }
            var daysDifference;
            if (firstWeekStartThisYear.getFullYear() < date.tm_year + 1900) {
                daysDifference = date.tm_yday + 32 - firstWeekStartThisYear.getDate()
            } else {
                daysDifference = date.tm_yday + 1 - firstWeekStartThisYear.getDate()
            }
            return leadingNulls(Math.ceil(daysDifference / 7), 2)
        },
        "%w": function (date) {
            return date.tm_wday
        },
        "%W": function (date) {
            var janFirst = new Date(date.tm_year, 0, 1);
            var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7 - janFirst.getDay() + 1);
            var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
            if (compareByDay(firstMonday, endDate) < 0) {
                var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
                var firstMondayUntilEndJanuary = 31 - firstMonday.getDate();
                var days = firstMondayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
                return leadingNulls(Math.ceil(days / 7), 2)
            }
            return compareByDay(firstMonday, janFirst) === 0 ? "01" : "00"
        },
        "%y": function (date) {
            return (date.tm_year + 1900).toString().substring(2)
        },
        "%Y": function (date) {
            return date.tm_year + 1900
        },
        "%z": function (date) {
            var off = date.tm_gmtoff;
            var ahead = off >= 0;
            off = Math.abs(off) / 60;
            off = off / 60 * 100 + off % 60;
            return (ahead ? "+" : "-") + String("0000" + off).slice(-4)
        },
        "%Z": function (date) {
            return date.tm_zone
        },
        "%%": function () {
            return "%"
        }
    };
    for (var rule in EXPANSION_RULES_2) {
        if (pattern.indexOf(rule) >= 0) {
            pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date))
        }
    }
    var bytes = intArrayFromString(pattern, false);
    if (bytes.length > maxsize) {
        return 0
    }
    writeArrayToMemory(bytes, s);
    return bytes.length - 1
}

function _strftime_l(s, maxsize, format, tm) {
    return _strftime(s, maxsize, format, tm)
}

function _time(ptr) {
    var ret = Date.now() / 1e3 | 0;
    if (ptr) {
        HEAP32[ptr >> 2] = ret
    }
    return ret
}
if (!ENVIRONMENT_IS_PTHREAD) PThread.initMainThreadBlock();
else PThread.initWorker();
WasmElementaryMediaStreamSource.init();
EmssCommon.init();
if (ENVIRONMENT_IS_NODE) {
    _emscripten_get_now = function _emscripten_get_now_actual() {
        var t = process["hrtime"]();
        return t[0] * 1e3 + t[1] / 1e6
    }
} else if (ENVIRONMENT_IS_PTHREAD) {
    _emscripten_get_now = function () {
        return performance["now"]() - __performance_now_clock_drift
    }
} else if (typeof dateNow !== "undefined") {
    _emscripten_get_now = dateNow
} else _emscripten_get_now = function () {
    return performance["now"]()
};
FS.staticInit();
Module["FS_createFolder"] = FS.createFolder;
Module["FS_createPath"] = FS.createPath;
Module["FS_createDataFile"] = FS.createDataFile;
Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
Module["FS_createLazyFile"] = FS.createLazyFile;
Module["FS_createLink"] = FS.createLink;
Module["FS_createDevice"] = FS.createDevice;
Module["FS_unlink"] = FS.unlink;
InternalError = Module["InternalError"] = extendError(Error, "InternalError");
embind_init_charCodes();
BindingError = Module["BindingError"] = extendError(Error, "BindingError");
init_emval();
UnboundTypeError = Module["UnboundTypeError"] = extendError(Error, "UnboundTypeError");
WasmElementaryMediaTrack.init();
var GLctx;
GL.init();
WasmHTMLMediaElement.init();
var proxiedFunctionTable = [null, _EMSSAddAudioTrack, _EMSSAddVideoTrack, _EMSSClearListeners, _EMSSCreate, _EMSSCreateObjectURL, _EMSSOpen, _EMSSRemove, _EMSSRevokeObjectURL, _EMSSSetOnClosedCaptions, _EMSSSetOnError, _EMSSSetOnPlaybackPositionChanged, _EMSSSetOnSourceClosed, _EMSSSetOnSourceDetached, _EMSSSetOnSourceEnded, _EMSSSetOnSourceOpen, _EMSSSetOnSourceOpenPending, __createSocketOnRenderThread, __closeSocketOnRenderThread, __cloneSocketFromRenderThread, ___syscall122, ___syscall142, ___syscall168, ___syscall195, ___syscall197, ___syscall202, ___syscall20, ___syscall220, ___syscall221, ___syscall3, ___syscall33, ___syscall4, ___syscall5, ___syscall54, ___syscall91, _fd_close, _fd_fdstat_get, _fd_read, _fd_seek, _fd_write, _atexit, _elementaryMediaTrackClearListeners, _elementaryMediaTrackRemove, _elementaryMediaTrackSetListenersForSessionIdEmulation, _elementaryMediaTrackSetOnAppendError, _elementaryMediaTrackSetOnSeek, _elementaryMediaTrackSetOnSessionIdChanged, _elementaryMediaTrackSetOnTrackClosed, _elementaryMediaTrackSetOnTrackOpen, _elementaryMediaTrackUnsetListenersForSessionIdEmulation, _emscripten_exit_pointerlock, _emscripten_get_gamepad_status, _emscripten_get_num_gamepads, _emscripten_request_pointerlock, _emscripten_sample_gamepad_data, _emscripten_set_canvas_element_size_main_thread, _emscripten_set_keydown_callback_on_thread, _emscripten_set_keyup_callback_on_thread, _emscripten_set_mousedown_callback_on_thread, _emscripten_set_mousemove_callback_on_thread, _emscripten_set_mouseup_callback_on_thread, _emscripten_set_pointerlockchange_callback_on_thread, _emscripten_set_pointerlockerror_callback_on_thread, _emscripten_set_wheel_callback_on_thread, _getenv, _mediaElementById, _mediaElementClearListeners, _mediaElementPlay, _mediaElementRegisterOnErrorEMSS, _mediaElementRegisterOnTimeUpdateEMSS, _mediaElementRemove, _mediaElementSetOnCanPlay, _mediaElementSetOnCanPlayThrough, _mediaElementSetOnEnded, _mediaElementSetOnError, _mediaElementSetOnLoadStart, _mediaElementSetOnLoadedData, _mediaElementSetOnLoadedMetadata, _mediaElementSetOnPause, _mediaElementSetOnPlay, _mediaElementSetOnPlaying, _mediaElementSetOnSeeked, _mediaElementSetOnSeeking, _mediaElementSetOnTimeUpdate, _mediaElementSetOnWaiting, _mediaElementSetSrc, _mediaElementUnregisterOnErrorEMSS, _mediaElementUnregisterOnTimeUpdateEMSS];

function intArrayFromString(stringy, dontAddNull, length) {
    var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
    var u8array = new Array(len);
    var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
    if (dontAddNull) u8array.length = numBytesWritten;
    return u8array
}

function invoke_ii(index, a1) {
    var sp = stackSave();
    try {
        return dynCall_ii(index, a1)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}

function invoke_iiii(index, a1, a2, a3) {
    var sp = stackSave();
    try {
        return dynCall_iiii(index, a1, a2, a3)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}

function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
    var sp = stackSave();
    try {
        return dynCall_iiiiii(index, a1, a2, a3, a4, a5)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}

function invoke_jii(index, a1, a2) {
    var sp = stackSave();
    try {
        return dynCall_jii(index, a1, a2)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}

function invoke_vi(index, a1) {
    var sp = stackSave();
    try {
        dynCall_vi(index, a1)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}

function invoke_viii(index, a1, a2, a3) {
    var sp = stackSave();
    try {
        dynCall_viii(index, a1, a2, a3)
    } catch (e) {
        stackRestore(sp);
        if (e !== e + 0 && e !== "longjmp") throw e;
        _setThrew(1, 0)
    }
}
var asmGlobalArg = {};
var asmLibraryArg = {
    "pa": _EMSSAddAudioTrack,
    "fa": _EMSSAddVideoTrack,
    "zc": _EMSSClearListeners,
    "pc": _EMSSCreate,
    "jc": _EMSSCreateObjectURL,
    "ac": _EMSSOpen,
    "Sb": _EMSSRemove,
    "Mb": _EMSSRevokeObjectURL,
    "Db": _EMSSSetOnClosedCaptions,
    "sb": _EMSSSetOnError,
    "jb": _EMSSSetOnPlaybackPositionChanged,
    "cb": _EMSSSetOnSourceClosed,
    "bb": _EMSSSetOnSourceDetached,
    "ab": _EMSSSetOnSourceEnded,
    "$a": _EMSSSetOnSourceOpen,
    "_a": _EMSSSetOnSourceOpenPending,
    "Za": _TizenTVWasm_IsApiFeatureSupported,
    "Ya": _TizenTVWasm_IsApiSupported,
    "b": ___assert_fail,
    "Xa": ___buildEnvironment,
    "F": ___call_main,
    "A": ___cxa_allocate_exception,
    "y": ___cxa_throw,
    "T": ___lock,
    "Wa": ___map_file,
    "h": ___syscall102,
    "Va": ___syscall122,
    "Ua": ___syscall142,
    "Ta": ___syscall168,
    "S": ___syscall195,
    "Sa": ___syscall197,
    "Ra": ___syscall199,
    "Qa": ___syscall20,
    "Pa": ___syscall200,
    "Oa": ___syscall201,
    "Na": ___syscall202,
    "Ma": ___syscall220,
    "t": ___syscall221,
    "La": ___syscall3,
    "Ka": ___syscall33,
    "Ja": ___syscall4,
    "R": ___syscall5,
    "Q": ___syscall54,
    "Ha": ___syscall91,
    "x": ___unlock,
    "w": ___wasi_fd_close,
    "Ga": ___wasi_fd_fdstat_get,
    "Fa": ___wasi_fd_read,
    "eb": ___wasi_fd_seek,
    "Ea": ___wasi_fd_write,
    "Da": __closeSocketOnRenderThread,
    "Ca": __embind_finalize_value_object,
    "Ba": __embind_register_bool,
    "za": __embind_register_emval,
    "P": __embind_register_float,
    "s": __embind_register_function,
    "m": __embind_register_integer,
    "j": __embind_register_memory_view,
    "O": __embind_register_std_string,
    "ya": __embind_register_std_wstring,
    "xa": __embind_register_value_object,
    "N": __embind_register_value_object_field,
    "wa": __embind_register_void,
    "va": __emval_as,
    "L": __emval_decref,
    "ua": __emval_equals,
    "K": __emval_incref,
    "ta": __emval_new_cstring,
    "sa": __emval_new_object,
    "ra": __emval_run_destructors,
    "J": __emval_set_property,
    "I": __emval_take_value,
    "__memory_base": 1024,
    "__table_base": 0,
    "qa": "tizentvwasm.SocketsHostBindings.accept",
    "oa": "tizentvwasm.SocketsHostBindings.bind",
    "D": "tizentvwasm.SocketsHostBindings.close",
    "na": "tizentvwasm.SocketsHostBindings.connect",
    "ma": "tizentvwasm.SocketsHostBindings.getPeerName",
    "la": "tizentvwasm.SocketsHostBindings.getSockName",
    "ka": "tizentvwasm.SocketsHostBindings.getSockOpt",
    "ja": "tizentvwasm.SocketsHostBindings.listen",
    "ia": "tizentvwasm.SocketsHostBindings.poll",
    "ha": "tizentvwasm.SocketsHostBindings.recv",
    "ga": "tizentvwasm.SocketsHostBindings.recvFrom",
    "ea": "tizentvwasm.SocketsHostBindings.recvMsg",
    "da": "tizentvwasm.SocketsHostBindings.select",
    "ca": "tizentvwasm.SocketsHostBindings.send",
    "ba": "tizentvwasm.SocketsHostBindings.sendMsg",
    "aa": "tizentvwasm.SocketsHostBindings.sendTo",
    "$": "tizentvwasm.SocketsHostBindings.setSockOpt",
    "_": "tizentvwasm.SocketsHostBindings.shutdown",
    "Z": "tizentvwasm.SocketsHostBindings.create",
    "a": _abort,
    "Y": _atexit,
    "B": _clock_gettime,
    "yc": _elementaryMediaTrackAppendPacket,
    "xc": _elementaryMediaTrackClearListeners,
    "wc": _elementaryMediaTrackRemove,
    "vc": _elementaryMediaTrackSetListenersForSessionIdEmulation,
    "uc": _elementaryMediaTrackSetOnAppendError,
    "tc": _elementaryMediaTrackSetOnSeek,
    "sc": _elementaryMediaTrackSetOnSessionIdChanged,
    "rc": _elementaryMediaTrackSetOnTrackClosed,
    "qc": _elementaryMediaTrackSetOnTrackOpen,
    "oc": _elementaryMediaTrackUnsetListenersForSessionIdEmulation,
    "r": _emscripten_asm_const_i,
    "H": _emscripten_asm_const_ii,
    "nc": _emscripten_asm_const_sync_on_main_thread_ii,
    "mc": _emscripten_asm_const_sync_on_main_thread_iiii,
    "lc": _emscripten_asm_const_sync_on_main_thread_iiiii,
    "kc": _emscripten_check_blocking_allowed,
    "X": _emscripten_exit_pointerlock,
    "l": _emscripten_futex_wait,
    "f": _emscripten_futex_wake,
    "ic": _emscripten_get_gamepad_status,
    "hc": _emscripten_get_heap_size,
    "k": _emscripten_get_now,
    "gc": _emscripten_get_num_gamepads,
    "fc": _emscripten_has_threading_support,
    "ec": _emscripten_log,
    "dc": _emscripten_memcpy_big,
    "W": _emscripten_receive_on_main_thread_js,
    "cc": _emscripten_request_pointerlock,
    "bc": _emscripten_resize_heap,
    "V": _emscripten_sample_gamepad_data,
    "$b": _emscripten_set_canvas_element_size,
    "_b": _emscripten_set_keydown_callback_on_thread,
    "Zb": _emscripten_set_keyup_callback_on_thread,
    "Yb": _emscripten_set_mousedown_callback_on_thread,
    "Xb": _emscripten_set_mousemove_callback_on_thread,
    "Wb": _emscripten_set_mouseup_callback_on_thread,
    "Vb": _emscripten_set_pointerlockchange_callback_on_thread,
    "Ub": _emscripten_set_pointerlockerror_callback_on_thread,
    "Tb": _emscripten_set_wheel_callback_on_thread,
    "Rb": _emscripten_syscall,
    "Qb": _emscripten_webgl_create_context,
    "G": _getaddrinfo,
    "v": _getenv,
    "Pb": _getpwuid,
    "u": _gettimeofday,
    "U": _gmtime_r,
    "Ob": _heavy_call_timeout_msecs,
    "Nb": _initPthreadsJS,
    "db": _llvm_bswap_i64,
    "o": _llvm_stackrestore,
    "n": _llvm_stacksave,
    "i": _longjmp,
    "Lb": _mediaElementById,
    "Kb": _mediaElementClearListeners,
    "Jb": _mediaElementPlay,
    "Ib": _mediaElementRegisterOnErrorEMSS,
    "Hb": _mediaElementRegisterOnTimeUpdateEMSS,
    "Gb": _mediaElementRemove,
    "Fb": _mediaElementSetOnCanPlay,
    "Eb": _mediaElementSetOnCanPlayThrough,
    "Cb": _mediaElementSetOnEnded,
    "Bb": _mediaElementSetOnError,
    "Ab": _mediaElementSetOnLoadStart,
    "zb": _mediaElementSetOnLoadedData,
    "yb": _mediaElementSetOnLoadedMetadata,
    "xb": _mediaElementSetOnPause,
    "wb": _mediaElementSetOnPlay,
    "vb": _mediaElementSetOnPlaying,
    "ub": _mediaElementSetOnSeeked,
    "tb": _mediaElementSetOnSeeking,
    "rb": _mediaElementSetOnTimeUpdate,
    "qb": _mediaElementSetOnWaiting,
    "pb": _mediaElementSetSrc,
    "ob": _mediaElementUnregisterOnErrorEMSS,
    "nb": _mediaElementUnregisterOnTimeUpdateEMSS,
    "mb": _pthread_atfork,
    "lb": _pthread_cleanup_pop,
    "kb": _pthread_cleanup_push,
    "q": _pthread_create,
    "C": _pthread_join,
    "p": _sigaction,
    "ib": _siglongjmp,
    "hb": _signal,
    "gb": _strftime_l,
    "d": _time,
    "c": abort,
    "g": getTempRet0,
    "z": invoke_ii,
    "E": invoke_iiii,
    "Ia": invoke_iiiiii,
    "fb": invoke_jii,
    "Aa": invoke_vi,
    "M": invoke_viii,
    "memory": wasmMemory,
    "e": setTempRet0,
    "table": wasmTable
};
var asm = Module["asm"](asmGlobalArg, asmLibraryArg, buffer);
Module["asm"] = asm;
var __ZSt18uncaught_exceptionv = Module["__ZSt18uncaught_exceptionv"] = function () {
    return Module["asm"]["Ac"].apply(null, arguments)
};
var ___em_js__initPthreadsJS = Module["___em_js__initPthreadsJS"] = function () {
    return Module["asm"]["Bc"].apply(null, arguments)
};
var ___embind_register_native_and_builtin_types = Module["___embind_register_native_and_builtin_types"] = function () {
    return Module["asm"]["Cc"].apply(null, arguments)
};
var ___emscripten_pthread_data_constructor = Module["___emscripten_pthread_data_constructor"] = function () {
    return Module["asm"]["Dc"].apply(null, arguments)
};
var ___errno_location = Module["___errno_location"] = function () {
    return Module["asm"]["Ec"].apply(null, arguments)
};
var ___getTypeName = Module["___getTypeName"] = function () {
    return Module["asm"]["Fc"].apply(null, arguments)
};
var ___pthread_tsd_run_dtors = Module["___pthread_tsd_run_dtors"] = function () {
    return Module["asm"]["Gc"].apply(null, arguments)
};
var __emscripten_atomic_fetch_and_add_u64 = Module["__emscripten_atomic_fetch_and_add_u64"] = function () {
    return Module["asm"]["Hc"].apply(null, arguments)
};
var __emscripten_atomic_fetch_and_and_u64 = Module["__emscripten_atomic_fetch_and_and_u64"] = function () {
    return Module["asm"]["Ic"].apply(null, arguments)
};
var __emscripten_atomic_fetch_and_or_u64 = Module["__emscripten_atomic_fetch_and_or_u64"] = function () {
    return Module["asm"]["Jc"].apply(null, arguments)
};
var __emscripten_atomic_fetch_and_sub_u64 = Module["__emscripten_atomic_fetch_and_sub_u64"] = function () {
    return Module["asm"]["Kc"].apply(null, arguments)
};
var __emscripten_atomic_fetch_and_xor_u64 = Module["__emscripten_atomic_fetch_and_xor_u64"] = function () {
    return Module["asm"]["Lc"].apply(null, arguments)
};
var __register_pthread_ptr = Module["__register_pthread_ptr"] = function () {
    return Module["asm"]["Mc"].apply(null, arguments)
};
var _acquire_next_fd = Module["_acquire_next_fd"] = function () {
    return Module["asm"]["Nc"].apply(null, arguments)
};
var _emscripten_async_queue_call_on_thread = Module["_emscripten_async_queue_call_on_thread"] = function () {
    return Module["asm"]["Oc"].apply(null, arguments)
};
var _emscripten_async_queue_on_thread_ = Module["_emscripten_async_queue_on_thread_"] = function () {
    return Module["asm"]["Pc"].apply(null, arguments)
};
var _emscripten_async_run_in_main_thread = Module["_emscripten_async_run_in_main_thread"] = function () {
    return Module["asm"]["Qc"].apply(null, arguments)
};
var _emscripten_atomic_add_u64 = Module["_emscripten_atomic_add_u64"] = function () {
    return Module["asm"]["Rc"].apply(null, arguments)
};
var _emscripten_atomic_and_u64 = Module["_emscripten_atomic_and_u64"] = function () {
    return Module["asm"]["Sc"].apply(null, arguments)
};
var _emscripten_atomic_cas_u64 = Module["_emscripten_atomic_cas_u64"] = function () {
    return Module["asm"]["Tc"].apply(null, arguments)
};
var _emscripten_atomic_exchange_u64 = Module["_emscripten_atomic_exchange_u64"] = function () {
    return Module["asm"]["Uc"].apply(null, arguments)
};
var _emscripten_atomic_load_f32 = Module["_emscripten_atomic_load_f32"] = function () {
    return Module["asm"]["Vc"].apply(null, arguments)
};
var _emscripten_atomic_load_f64 = Module["_emscripten_atomic_load_f64"] = function () {
    return Module["asm"]["Wc"].apply(null, arguments)
};
var _emscripten_atomic_load_u64 = Module["_emscripten_atomic_load_u64"] = function () {
    return Module["asm"]["Xc"].apply(null, arguments)
};
var _emscripten_atomic_or_u64 = Module["_emscripten_atomic_or_u64"] = function () {
    return Module["asm"]["Yc"].apply(null, arguments)
};
var _emscripten_atomic_store_f32 = Module["_emscripten_atomic_store_f32"] = function () {
    return Module["asm"]["Zc"].apply(null, arguments)
};
var _emscripten_atomic_store_f64 = Module["_emscripten_atomic_store_f64"] = function () {
    return Module["asm"]["_c"].apply(null, arguments)
};
var _emscripten_atomic_store_u64 = Module["_emscripten_atomic_store_u64"] = function () {
    return Module["asm"]["$c"].apply(null, arguments)
};
var _emscripten_atomic_sub_u64 = Module["_emscripten_atomic_sub_u64"] = function () {
    return Module["asm"]["ad"].apply(null, arguments)
};
var _emscripten_atomic_xor_u64 = Module["_emscripten_atomic_xor_u64"] = function () {
    return Module["asm"]["bd"].apply(null, arguments)
};
var _emscripten_current_thread_process_queued_calls = Module["_emscripten_current_thread_process_queued_calls"] = function () {
    return Module["asm"]["cd"].apply(null, arguments)
};
var _emscripten_get_global_libc = Module["_emscripten_get_global_libc"] = function () {
    return Module["asm"]["dd"].apply(null, arguments)
};
var _emscripten_main_browser_thread_id = Module["_emscripten_main_browser_thread_id"] = function () {
    return Module["asm"]["ed"].apply(null, arguments)
};
var _emscripten_main_thread_process_queued_calls = Module["_emscripten_main_thread_process_queued_calls"] = function () {
    return Module["asm"]["fd"].apply(null, arguments)
};
var _emscripten_register_main_browser_thread_id = Module["_emscripten_register_main_browser_thread_id"] = function () {
    return Module["asm"]["gd"].apply(null, arguments)
};
var _emscripten_run_in_main_runtime_thread_js = Module["_emscripten_run_in_main_runtime_thread_js"] = function () {
    return Module["asm"]["hd"].apply(null, arguments)
};
var _emscripten_sync_run_in_main_thread = Module["_emscripten_sync_run_in_main_thread"] = function () {
    return Module["asm"]["id"].apply(null, arguments)
};
var _emscripten_sync_run_in_main_thread_0 = Module["_emscripten_sync_run_in_main_thread_0"] = function () {
    return Module["asm"]["jd"].apply(null, arguments)
};
var _emscripten_sync_run_in_main_thread_1 = Module["_emscripten_sync_run_in_main_thread_1"] = function () {
    return Module["asm"]["kd"].apply(null, arguments)
};
var _emscripten_sync_run_in_main_thread_2 = Module["_emscripten_sync_run_in_main_thread_2"] = function () {
    return Module["asm"]["ld"].apply(null, arguments)
};
var _emscripten_sync_run_in_main_thread_3 = Module["_emscripten_sync_run_in_main_thread_3"] = function () {
    return Module["asm"]["md"].apply(null, arguments)
};
var _emscripten_sync_run_in_main_thread_4 = Module["_emscripten_sync_run_in_main_thread_4"] = function () {
    return Module["asm"]["nd"].apply(null, arguments)
};
var _emscripten_sync_run_in_main_thread_5 = Module["_emscripten_sync_run_in_main_thread_5"] = function () {
    return Module["asm"]["od"].apply(null, arguments)
};
var _emscripten_sync_run_in_main_thread_6 = Module["_emscripten_sync_run_in_main_thread_6"] = function () {
    return Module["asm"]["pd"].apply(null, arguments)
};
var _emscripten_sync_run_in_main_thread_7 = Module["_emscripten_sync_run_in_main_thread_7"] = function () {
    return Module["asm"]["qd"].apply(null, arguments)
};
var _emscripten_sync_run_in_main_thread_xprintf_varargs = Module["_emscripten_sync_run_in_main_thread_xprintf_varargs"] = function () {
    return Module["asm"]["rd"].apply(null, arguments)
};
var _free = Module["_free"] = function () {
    return Module["asm"]["sd"].apply(null, arguments)
};
var _get_mapped_fd = Module["_get_mapped_fd"] = function () {
    return Module["asm"]["td"].apply(null, arguments)
};
var _htons = Module["_htons"] = function () {
    return Module["asm"]["ud"].apply(null, arguments)
};
var _is_socket = Module["_is_socket"] = function () {
    return Module["asm"]["vd"].apply(null, arguments)
};
var _llvm_bswap_i32 = Module["_llvm_bswap_i32"] = function () {
    return Module["asm"]["wd"].apply(null, arguments)
};
var _main = Module["_main"] = function () {
    return Module["asm"]["xd"].apply(null, arguments)
};
var _malloc = Module["_malloc"] = function () {
    return Module["asm"]["yd"].apply(null, arguments)
};
var _memalign = Module["_memalign"] = function () {
    return Module["asm"]["zd"].apply(null, arguments)
};
var _ntohs = Module["_ntohs"] = function () {
    return Module["asm"]["Ad"].apply(null, arguments)
};
var _proxy_main = Module["_proxy_main"] = function () {
    return Module["asm"]["Bd"].apply(null, arguments)
};
var _pthread_self = Module["_pthread_self"] = function () {
    return Module["asm"]["Cd"].apply(null, arguments)
};
var _release_fd = Module["_release_fd"] = function () {
    return Module["asm"]["Dd"].apply(null, arguments)
};
var _setThrew = Module["_setThrew"] = function () {
    return Module["asm"]["Ed"].apply(null, arguments)
};
var _set_host_bindings_impl = Module["_set_host_bindings_impl"] = function () {
    return Module["asm"]["Fd"].apply(null, arguments)
};
var _set_mapped_fd = Module["_set_mapped_fd"] = function () {
    return Module["asm"]["Gd"].apply(null, arguments)
};
var _strlen = Module["_strlen"] = function () {
    return Module["asm"]["Hd"].apply(null, arguments)
};
var establishStackSpace = Module["establishStackSpace"] = function () {
    return Module["asm"]["Be"].apply(null, arguments)
};
var globalCtors = Module["globalCtors"] = function () {
    return Module["asm"]["Ce"].apply(null, arguments)
};
var stackAlloc = Module["stackAlloc"] = function () {
    return Module["asm"]["De"].apply(null, arguments)
};
var stackRestore = Module["stackRestore"] = function () {
    return Module["asm"]["Ee"].apply(null, arguments)
};
var stackSave = Module["stackSave"] = function () {
    return Module["asm"]["Fe"].apply(null, arguments)
};
var dynCall_i = Module["dynCall_i"] = function () {
    return Module["asm"]["Id"].apply(null, arguments)
};
var dynCall_ii = Module["dynCall_ii"] = function () {
    return Module["asm"]["Jd"].apply(null, arguments)
};
var dynCall_iidddd = Module["dynCall_iidddd"] = function () {
    return Module["asm"]["Kd"].apply(null, arguments)
};
var dynCall_iidiiii = Module["dynCall_iidiiii"] = function () {
    return Module["asm"]["Ld"].apply(null, arguments)
};
var dynCall_iii = Module["dynCall_iii"] = function () {
    return Module["asm"]["Md"].apply(null, arguments)
};
var dynCall_iiid = Module["dynCall_iiid"] = function () {
    return Module["asm"]["Nd"].apply(null, arguments)
};
var dynCall_iiii = Module["dynCall_iiii"] = function () {
    return Module["asm"]["Od"].apply(null, arguments)
};
var dynCall_iiiii = Module["dynCall_iiiii"] = function () {
    return Module["asm"]["Pd"].apply(null, arguments)
};
var dynCall_iiiiid = Module["dynCall_iiiiid"] = function () {
    return Module["asm"]["Qd"].apply(null, arguments)
};
var dynCall_iiiiii = Module["dynCall_iiiiii"] = function () {
    return Module["asm"]["Rd"].apply(null, arguments)
};
var dynCall_iiiiiid = Module["dynCall_iiiiiid"] = function () {
    return Module["asm"]["Sd"].apply(null, arguments)
};
var dynCall_iiiiiii = Module["dynCall_iiiiiii"] = function () {
    return Module["asm"]["Td"].apply(null, arguments)
};
var dynCall_iiiiiiii = Module["dynCall_iiiiiiii"] = function () {
    return Module["asm"]["Ud"].apply(null, arguments)
};
var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = function () {
    return Module["asm"]["Vd"].apply(null, arguments)
};
var dynCall_iiiiiiiiii = Module["dynCall_iiiiiiiiii"] = function () {
    return Module["asm"]["Wd"].apply(null, arguments)
};
var dynCall_iiiiiiiiiiiii = Module["dynCall_iiiiiiiiiiiii"] = function () {
    return Module["asm"]["Xd"].apply(null, arguments)
};
var dynCall_iiiiij = Module["dynCall_iiiiij"] = function () {
    return Module["asm"]["Yd"].apply(null, arguments)
};
var dynCall_iiji = Module["dynCall_iiji"] = function () {
    return Module["asm"]["Zd"].apply(null, arguments)
};
var dynCall_iijjjj = Module["dynCall_iijjjj"] = function () {
    return Module["asm"]["_d"].apply(null, arguments)
};
var dynCall_ji = Module["dynCall_ji"] = function () {
    return Module["asm"]["$d"].apply(null, arguments)
};
var dynCall_jii = Module["dynCall_jii"] = function () {
    return Module["asm"]["ae"].apply(null, arguments)
};
var dynCall_jiji = Module["dynCall_jiji"] = function () {
    return Module["asm"]["be"].apply(null, arguments)
};
var dynCall_v = Module["dynCall_v"] = function () {
    return Module["asm"]["ce"].apply(null, arguments)
};
var dynCall_vf = Module["dynCall_vf"] = function () {
    return Module["asm"]["de"].apply(null, arguments)
};
var dynCall_vff = Module["dynCall_vff"] = function () {
    return Module["asm"]["ee"].apply(null, arguments)
};
var dynCall_vfff = Module["dynCall_vfff"] = function () {
    return Module["asm"]["fe"].apply(null, arguments)
};
var dynCall_vffff = Module["dynCall_vffff"] = function () {
    return Module["asm"]["ge"].apply(null, arguments)
};
var dynCall_vfi = Module["dynCall_vfi"] = function () {
    return Module["asm"]["he"].apply(null, arguments)
};
var dynCall_vi = Module["dynCall_vi"] = function () {
    return Module["asm"]["ie"].apply(null, arguments)
};
var dynCall_vif = Module["dynCall_vif"] = function () {
    return Module["asm"]["je"].apply(null, arguments)
};
var dynCall_viff = Module["dynCall_viff"] = function () {
    return Module["asm"]["ke"].apply(null, arguments)
};
var dynCall_vifff = Module["dynCall_vifff"] = function () {
    return Module["asm"]["le"].apply(null, arguments)
};
var dynCall_viffff = Module["dynCall_viffff"] = function () {
    return Module["asm"]["me"].apply(null, arguments)
};
var dynCall_vii = Module["dynCall_vii"] = function () {
    return Module["asm"]["ne"].apply(null, arguments)
};
var dynCall_viif = Module["dynCall_viif"] = function () {
    return Module["asm"]["oe"].apply(null, arguments)
};
var dynCall_viifi = Module["dynCall_viifi"] = function () {
    return Module["asm"]["pe"].apply(null, arguments)
};
var dynCall_viii = Module["dynCall_viii"] = function () {
    return Module["asm"]["qe"].apply(null, arguments)
};
var dynCall_viiii = Module["dynCall_viiii"] = function () {
    return Module["asm"]["re"].apply(null, arguments)
};
var dynCall_viiiii = Module["dynCall_viiiii"] = function () {
    return Module["asm"]["se"].apply(null, arguments)
};
var dynCall_viiiiii = Module["dynCall_viiiiii"] = function () {
    return Module["asm"]["te"].apply(null, arguments)
};
var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = function () {
    return Module["asm"]["ue"].apply(null, arguments)
};
var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = function () {
    return Module["asm"]["ve"].apply(null, arguments)
};
var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = function () {
    return Module["asm"]["we"].apply(null, arguments)
};
var dynCall_viiiiiiiiii = Module["dynCall_viiiiiiiiii"] = function () {
    return Module["asm"]["xe"].apply(null, arguments)
};
var dynCall_viiiiiiiiiii = Module["dynCall_viiiiiiiiiii"] = function () {
    return Module["asm"]["ye"].apply(null, arguments)
};
var dynCall_viiiiiiiiiiii = Module["dynCall_viiiiiiiiiiii"] = function () {
    return Module["asm"]["ze"].apply(null, arguments)
};
var dynCall_viijii = Module["dynCall_viijii"] = function () {
    return Module["asm"]["Ae"].apply(null, arguments)
};
Module["asm"] = asm;
Module["getMemory"] = getMemory;
Module["addRunDependency"] = addRunDependency;
Module["removeRunDependency"] = removeRunDependency;
Module["FS_createFolder"] = FS.createFolder;
Module["FS_createPath"] = FS.createPath;
Module["FS_createDataFile"] = FS.createDataFile;
Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
Module["FS_createLazyFile"] = FS.createLazyFile;
Module["FS_createLink"] = FS.createLink;
Module["FS_createDevice"] = FS.createDevice;
Module["FS_unlink"] = FS.unlink;
Module["establishStackSpace"] = establishStackSpace;
Module["PThread"] = PThread;
Module["ExitStatus"] = ExitStatus;
Module["tempDoublePtr"] = tempDoublePtr;
Module["_pthread_self"] = _pthread_self;
Module["_emscripten_futex_wake"] = _emscripten_futex_wake;
Module["wasmMemory"] = wasmMemory;
Module["dynCall_ii"] = dynCall_ii;
Module["calledRun"] = calledRun;
if (memoryInitializer && !ENVIRONMENT_IS_PTHREAD) {
    if (!isDataURI(memoryInitializer)) {
        memoryInitializer = locateFile(memoryInitializer)
    }
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
        var data = readBinary(memoryInitializer);
        HEAPU8.set(data, GLOBAL_BASE)
    } else {
        addRunDependency("memory initializer");
        var applyMemoryInitializer = function (data) {
            if (data.byteLength) data = new Uint8Array(data);
            HEAPU8.set(data, GLOBAL_BASE);
            if (Module["memoryInitializerRequest"]) delete Module["memoryInitializerRequest"].response;
            removeRunDependency("memory initializer")
        };
        var doBrowserLoad = function () {
            readAsync(memoryInitializer, applyMemoryInitializer, function () {
                throw "could not load memory initializer " + memoryInitializer
            })
        };
        if (Module["memoryInitializerRequest"]) {
            var useRequest = function () {
                var request = Module["memoryInitializerRequest"];
                var response = request.response;
                if (request.status !== 200 && request.status !== 0) {
                    console.warn("a problem seems to have happened with Module.memoryInitializerRequest, status: " + request.status + ", retrying " + memoryInitializer);
                    doBrowserLoad();
                    return
                }
                applyMemoryInitializer(response)
            };
            if (Module["memoryInitializerRequest"].response) {
                setTimeout(useRequest, 0)
            } else {
                Module["memoryInitializerRequest"].addEventListener("load", useRequest)
            }
        } else {
            doBrowserLoad()
        }
    }
}
var calledRun;

function ExitStatus(status) {
    this.name = "ExitStatus";
    this.message = "Program terminated with exit(" + status + ")";
    this.status = status
}
var calledMain = false;
dependenciesFulfilled = function runCaller() {
    if (!calledRun) run();
    if (!calledRun) dependenciesFulfilled = runCaller
};

function callMain(args) {
    var entryFunction = Module["_main"];
    args = args || [];
    var argc = args.length + 1;
    var argv = stackAlloc((argc + 1) * 4);
    HEAP32[argv >> 2] = allocateUTF8OnStack(thisProgram);
    for (var i = 1; i < argc; i++) {
        HEAP32[(argv >> 2) + i] = allocateUTF8OnStack(args[i - 1])
    }
    HEAP32[(argv >> 2) + argc] = 0;
    try {
        var ret = entryFunction(argc, argv);
        exit(ret, true)
    } catch (e) {
        if (e instanceof ExitStatus) {
            return
        } else if (e == "unwind") {
            noExitRuntime = true;
            return
        } else {
            var toLog = e;
            if (e && typeof e === "object" && e.stack) {
                toLog = [e, e.stack]
            }
            err("exception thrown: " + toLog);
            quit_(1, e)
        }
    } finally {
        calledMain = true
    }
}

function run(args) {
    args = args || arguments_;
    if (runDependencies > 0) {
        return
    }
    preRun();
    if (runDependencies > 0) return;

    function doRun() {
        if (calledRun) return;
        calledRun = true;
        Module["calledRun"] = true;
        if (ABORT) return;
        initRuntime();
        preMain();
        if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
        if (shouldRunNow) callMain(args);
        postRun()
    }
    if (Module["setStatus"]) {
        Module["setStatus"]("Running...");
        setTimeout(function () {
            setTimeout(function () {
                Module["setStatus"]("")
            }, 1);
            doRun()
        }, 1)
    } else {
        doRun()
    }
}
Module["run"] = run;

function exit(status, implicit) {
    if (implicit && noExitRuntime && status === 0) {
        return
    }
    if (noExitRuntime) {} else {
        PThread.terminateAllThreads();
        ABORT = true;
        EXITSTATUS = status;
        exitRuntime();
        if (Module["onExit"]) Module["onExit"](status)
    }
    quit_(status, new ExitStatus(status))
}
if (Module["preInit"]) {
    if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
    while (Module["preInit"].length > 0) {
        Module["preInit"].pop()()
    }
}
var shouldRunNow = true;
if (Module["noInitialRun"]) shouldRunNow = false;
if (!ENVIRONMENT_IS_PTHREAD) noExitRuntime = true;
if (!ENVIRONMENT_IS_PTHREAD) run();
else {
    Module["___embind_register_native_and_builtin_types"]()
}