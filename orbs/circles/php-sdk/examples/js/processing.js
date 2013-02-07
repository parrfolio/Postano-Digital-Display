/***

    P R O C E S S I N G . J S - 1.2.3
    a port of the Processing visualization language

    Processing.js is licensed under the MIT License, see LICENSE.
    For a list of copyright holders, please refer to AUTHORS.

    http://processingjs.org

***/

(function(window, document, Math, undef) {

  var nop = function(){};

  var debug = (function() {
    if ("console" in window) {
      return function(msg) {
        window.console.log('Processing.js: ' + msg);
      };
    } else {
      return nop();
    }
  }());

  var ajax = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    if (xhr.overrideMimeType) {
      xhr.overrideMimeType("text/plain");
    }
    xhr.setRequestHeader("If-Modified-Since", "Fri, 01 Jan 1960 00:00:00 GMT");
    xhr.send(null);
    // failed request?
    if (xhr.status !== 200 && xhr.status !== 0) { throw ("XMLHttpRequest failed, status code " + xhr.status); }
    return xhr.responseText;
  };

  var isDOMPresent = ("document" in this) && !("fake" in this.document);

  // Typed Arrays: fallback to WebGL arrays or Native JS arrays if unavailable
  function setupTypedArray(name, fallback) {
    // Check if TypedArray exists, and use if so.
    if (name in window) {
      return window[name];
    }

    // Check if WebGLArray exists
    if (typeof window[fallback] === "function") {
      return window[fallback];
    } else {
      // Use Native JS array
      return function(obj) {
        if (obj instanceof Array) {
          return obj;
        } else if (typeof obj === "number") {
          var arr = [];
          arr.length = obj;
          return arr;
        }
      };
    }
  }

  var Float32Array = setupTypedArray("Float32Array", "WebGLFloatArray"),
      Int32Array   = setupTypedArray("Int32Array",   "WebGLIntArray"),
      Uint16Array  = setupTypedArray("Uint16Array",  "WebGLUnsignedShortArray"),
      Uint8Array   = setupTypedArray("Uint8Array",   "WebGLUnsignedByteArray");

  /* Browsers fixes end */

  var PConstants = {
    X: 0,
    Y: 1,
    Z: 2,

    R: 3,
    G: 4,
    B: 5,
    A: 6,

    U: 7,
    V: 8,

    NX: 9,
    NY: 10,
    NZ: 11,

    EDGE: 12,

    // Stroke
    SR: 13,
    SG: 14,
    SB: 15,
    SA: 16,

    SW: 17,

    // Transformations (2D and 3D)
    TX: 18,
    TY: 19,
    TZ: 20,

    VX: 21,
    VY: 22,
    VZ: 23,
    VW: 24,

    // Material properties
    AR: 25,
    AG: 26,
    AB: 27,

    DR: 3,
    DG: 4,
    DB: 5,
    DA: 6,

    SPR: 28,
    SPG: 29,
    SPB: 30,

    SHINE: 31,

    ER: 32,
    EG: 33,
    EB: 34,

    BEEN_LIT: 35,

    VERTEX_FIELD_COUNT: 36,

    // Renderers
    P2D:    1,
    JAVA2D: 1,
    WEBGL:  2,
    P3D:    2,
    OPENGL: 2,
    PDF:    0,
    DXF:    0,

    // Platform IDs
    OTHER:   0,
    WINDOWS: 1,
    MAXOSX:  2,
    LINUX:   3,

    EPSILON: 0.0001,

    MAX_FLOAT:  3.4028235e+38,
    MIN_FLOAT: -3.4028235e+38,
    MAX_INT:    2147483647,
    MIN_INT:   -2147483648,

    PI:         Math.PI,
    TWO_PI:     2 * Math.PI,
    HALF_PI:    Math.PI / 2,
    THIRD_PI:   Math.PI / 3,
    QUARTER_PI: Math.PI / 4,

    DEG_TO_RAD: Math.PI / 180,
    RAD_TO_DEG: 180 / Math.PI,

    WHITESPACE: " \t\n\r\f\u00A0",

    // Color modes
    RGB:   1,
    ARGB:  2,
    HSB:   3,
    ALPHA: 4,
    CMYK:  5,

    // Image file types
    TIFF:  0,
    TARGA: 1,
    JPEG:  2,
    GIF:   3,

    // Filter/convert types
    BLUR:      11,
    GRAY:      12,
    INVERT:    13,
    OPAQUE:    14,
    POSTERIZE: 15,
    THRESHOLD: 16,
    ERODE:     17,
    DILATE:    18,

    // Blend modes
    REPLACE:    0,
    BLEND:      1 << 0,
    ADD:        1 << 1,
    SUBTRACT:   1 << 2,
    LIGHTEST:   1 << 3,
    DARKEST:    1 << 4,
    DIFFERENCE: 1 << 5,
    EXCLUSION:  1 << 6,
    MULTIPLY:   1 << 7,
    SCREEN:     1 << 8,
    OVERLAY:    1 << 9,
    HARD_LIGHT: 1 << 10,
    SOFT_LIGHT: 1 << 11,
    DODGE:      1 << 12,
    BURN:       1 << 13,

    // Color component bit masks
    ALPHA_MASK: 0xff000000,
    RED_MASK:   0x00ff0000,
    GREEN_MASK: 0x0000ff00,
    BLUE_MASK:  0x000000ff,

    // Projection matrices
    CUSTOM:       0,
    ORTHOGRAPHIC: 2,
    PERSPECTIVE:  3,

    // Shapes
    POINT:          2,
    POINTS:         2,
    LINE:           4,
    LINES:          4,
    TRIANGLE:       8,
    TRIANGLES:      9,
    TRIANGLE_STRIP: 10,
    TRIANGLE_FAN:   11,
    QUAD:           16,
    QUADS:          16,
    QUAD_STRIP:     17,
    POLYGON:        20,
    PATH:           21,
    RECT:           30,
    ELLIPSE:        31,
    ARC:            32,
    SPHERE:         40,
    BOX:            41,

    GROUP:          0,
    PRIMITIVE:      1,
    //PATH:         21, // shared with Shape PATH
    GEOMETRY:       3,

    // Shape Vertex
    VERTEX:        0,
    BEZIER_VERTEX: 1,
    CURVE_VERTEX:  2,
    BREAK:         3,
    CLOSESHAPE:    4,

    // Shape closing modes
    OPEN:  1,
    CLOSE: 2,

    // Shape drawing modes
    CORNER:          0, // Draw mode convention to use (x, y) to (width, height)
    CORNERS:         1, // Draw mode convention to use (x1, y1) to (x2, y2) coordinates
    RADIUS:          2, // Draw mode from the center, and using the radius
    CENTER_RADIUS:   2, // Deprecated! Use RADIUS instead
    CENTER:          3, // Draw from the center, using second pair of values as the diameter
    DIAMETER:        3, // Synonym for the CENTER constant. Draw from the center
    CENTER_DIAMETER: 3, // Deprecated! Use DIAMETER instead

    // Text vertical alignment modes
    BASELINE: 0,   // Default vertical alignment for text placement
    TOP:      101, // Align text to the top
    BOTTOM:   102, // Align text from the bottom, using the baseline

    // UV Texture coordinate modes
    NORMAL:     1,
    NORMALIZED: 1,
    IMAGE:      2,

    // Text placement modes
    MODEL: 4,
    SHAPE: 5,

    // Stroke modes
    SQUARE:  'butt',
    ROUND:   'round',
    PROJECT: 'square',
    MITER:   'miter',
    BEVEL:   'bevel',

    // Lighting modes
    AMBIENT:     0,
    DIRECTIONAL: 1,
    //POINT:     2, Shared with Shape constant
    SPOT:        3,

    // Key constants

    // Both key and keyCode will be equal to these values
    BACKSPACE: 8,
    TAB:       9,
    ENTER:     10,
    RETURN:    13,
    ESC:       27,
    DELETE:    127,
    CODED:     0xffff,

    // p.key will be CODED and p.keyCode will be this value
    SHIFT:     16,
    CONTROL:   17,
    ALT:       18,
    CAPSLK:    20,
    PGUP:      33,
    PGDN:      34,
    END:       35,
    HOME:      36,
    LEFT:      37,
    UP:        38,
    RIGHT:     39,
    DOWN:      40,
    F1:        112,
    F2:        113,
    F3:        114,
    F4:        115,
    F5:        116,
    F6:        117,
    F7:        118,
    F8:        119,
    F9:        120,
    F10:       121,
    F11:       122,
    F12:       123,
    NUMLK:     144,
    META:      157,
    INSERT:    155,

    // Cursor types
    ARROW:    'default',
    CROSS:    'crosshair',
    HAND:     'pointer',
    MOVE:     'move',
    TEXT:     'text',
    WAIT:     'wait',
    NOCURSOR: "url('data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='), auto",

    // Hints
    DISABLE_OPENGL_2X_SMOOTH:     1,
    ENABLE_OPENGL_2X_SMOOTH:     -1,
    ENABLE_OPENGL_4X_SMOOTH:      2,
    ENABLE_NATIVE_FONTS:          3,
    DISABLE_DEPTH_TEST:           4,
    ENABLE_DEPTH_TEST:           -4,
    ENABLE_DEPTH_SORT:            5,
    DISABLE_DEPTH_SORT:          -5,
    DISABLE_OPENGL_ERROR_REPORT:  6,
    ENABLE_OPENGL_ERROR_REPORT:  -6,
    ENABLE_ACCURATE_TEXTURES:     7,
    DISABLE_ACCURATE_TEXTURES:   -7,
    HINT_COUNT:                  10,

    // PJS defined constants
    SINCOS_LENGTH:      parseInt(360 / 0.5, 10),
    PRECISIONB:         15, // fixed point precision is limited to 15 bits!!
    PRECISIONF:         1 << 15,
    PREC_MAXVAL:        (1 << 15) - 1,
    PREC_ALPHA_SHIFT:   24 - 15,
    PREC_RED_SHIFT:     16 - 15,
    NORMAL_MODE_AUTO:   0,
    NORMAL_MODE_SHAPE:  1,
    NORMAL_MODE_VERTEX: 2,
    MAX_LIGHTS:         8
  };

  /**
   * Returns Java hashCode() result for the object. If the object has the "hashCode" function,
   * it preforms the call of this function. Otherwise it uses/creates the "$id" property,
   * which is used as the hashCode.
   *
   * @param {Object} obj          The object.
   * @returns {int}               The object's hash code.
   */
  function virtHashCode(obj) {
    if (obj.constructor === String) {
      var hash = 0;
      for (var i = 0; i < obj.length; ++i) {
        hash = (hash * 31 + obj.charCodeAt(i)) & 0xFFFFFFFF;
      }
      return hash;
    } else if (typeof(obj) !== "object") {
      return obj & 0xFFFFFFFF;
    } else if (obj.hashCode instanceof Function) {
      return obj.hashCode();
    } else {
      if (obj.$id === undef) {
        obj.$id = ((Math.floor(Math.random() * 0x10000) - 0x8000) << 16) | Math.floor(Math.random() * 0x10000);
      }
      return obj.$id;
    }
  }

  /**
   * Returns Java equals() result for two objects. If the first object
   * has the "equals" function, it preforms the call of this function.
   * Otherwise the method uses the JavaScript === operator.
   *
   * @param {Object} obj          The first object.
   * @param {Object} other        The second object.
   *
   * @returns {boolean}           true if the objects are equal.
   */
  function virtEquals(obj, other) {
    if (obj === null || other === null) {
      return (obj === null) && (other === null);
    } else if (obj.constructor === String) {
      return obj === other;
    } else if (typeof(obj) !== "object") {
      return obj === other;
    } else if (obj.equals instanceof Function) {
      return obj.equals(other);
    } else {
      return obj === other;
    }
  }

  /**
  * A ObjectIterator is an iterator wrapper for objects. If passed object contains
  * the iterator method, the object instance will be replaced by the result returned by
  * this method call. If passed object is an array, the ObjectIterator instance iterates
  * through its items.
  *
  * @param {Object} obj          The object to be iterated.
  */
  var ObjectIterator = function(obj) {
    if (obj.iterator instanceof Function) {
      return obj.iterator();
    } else if (obj instanceof Array) {
      // iterate through array items
      var index = -1;
      this.hasNext = function() {
        return ++index < obj.length;
      };
      this.next = function() {
        return obj[index];
      };
    } else {
      throw "Unable to iterate: " + obj;
    }
  };

  /**
   * An ArrayList stores a variable number of objects.
   *
   * @param {int} initialCapacity optional defines the initial capacity of the list, it's empty by default
   *
   * @returns {ArrayList} new ArrayList object
   */
  var ArrayList = (function() {
    function Iterator(array) {
      var index = 0;
      this.hasNext = function() {
        return index < array.length;
      };

      this.next = function() {
        return array[index++];
      };

      this.remove = function() {
        array.splice(index, 1);
      };
    }

    function ArrayList() {
      var array;
      if (arguments.length === 0) {
        array = [];
      } else if (arguments.length > 0 && typeof arguments[0] !== 'number') {
        array = arguments[0].toArray();
      } else {
        array = [];
        array.length = 0 | arguments[0];
      }

      /**
       * @member ArrayList
       * ArrayList.get() Returns the element at the specified position in this list.
       *
       * @param {int} i index of element to return
       *
       * @returns {Object} the element at the specified position in this list.
       */
      this.get = function(i) {
        return array[i];
      };
      /**
       * @member ArrayList
       * ArrayList.contains() Returns true if this list contains the specified element.
       *
       * @param {Object} item element whose presence in this List is to be tested.
       *
       * @returns {boolean} true if the specified element is present; false otherwise.
       */
      this.contains = function(item) {
        return this.indexOf(item)>-1;
      };
       /**
       * @member ArrayList
       * ArrayList.indexOf() Returns the position this element takes in the list, or -1 if the element is not found.
       *
       * @param {Object} item element whose position in this List is to be tested.
       *
       * @returns {int} the list position that the first match for this element holds in the list, or -1 if it is not in the list.
       */
      this.indexOf = function(item) {
        for (var i = 0, len = array.length; i < len; ++i) {
          if (virtEquals(item, array[i])) {
            return i;
          }
        }
        return -1;
      };
     /**
       * @member ArrayList
       * ArrayList.add() Adds the specified element to this list.
       *
       * @param {int}    index  optional index at which the specified element is to be inserted
       * @param {Object} object element to be added to the list
       */
      this.add = function() {
        if (arguments.length === 1) {
          array.push(arguments[0]); // for add(Object)
        } else if (arguments.length === 2) {
          var arg0 = arguments[0];
          if (typeof arg0 === 'number') {
            if (arg0 >= 0 && arg0 <= array.length) {
              array.splice(arg0, 0, arguments[1]); // for add(i, Object)
            } else {
              throw(arg0 + " is not a valid index");
            }
          } else {
            throw(typeof arg0 + " is not a number");
          }
        } else {
          throw("Please use the proper number of parameters.");
        }
      };
      /**
       * @member ArrayList
       * ArrayList.addAll(collection) appends all of the elements in the specified
       * Collection to the end of this list, in the order that they are returned by
       * the specified Collection's Iterator.
       *
       * When called as addAll(index, collection) the elements are inserted into
       * this list at the position indicated by index.
       *
       * @param {index} Optional; specifies the position the colletion should be inserted at
       * @param {collection} Any iterable object (ArrayList, HashMap.keySet(), etc.)
       * @throws out of bounds error for negative index, or index greater than list size.
       */
      this.addAll = function(arg1, arg2) {
        // addAll(int, Collection)
        var it;
        if (typeof arg1 === "number") {
          if (arg1 < 0 || arg1 > array.length) {
            throw("Index out of bounds for addAll: " + arg1 + " greater or equal than " + array.length);
          }
          it = new ObjectIterator(arg2);
          while (it.hasNext()) {
            array.splice(arg1++, 0, it.next());
          }
        }
        // addAll(Collection)
        else {
          it = new ObjectIterator(arg1);
          while (it.hasNext()) {
            array.push(it.next());
          }
        }
      };
      /**
       * @member ArrayList
       * ArrayList.set() Replaces the element at the specified position in this list with the specified element.
       *
       * @param {int}    index  index of element to replace
       * @param {Object} object element to be stored at the specified position
       */
      this.set = function() {
        if (arguments.length === 2) {
          var arg0 = arguments[0];
          if (typeof arg0 === 'number') {
            if (arg0 >= 0 && arg0 < array.length) {
              array.splice(arg0, 1, arguments[1]);
            } else {
              throw(arg0 + " is not a valid index.");
            }
          } else {
            throw(typeof arg0 + " is not a number");
          }
        } else {
          throw("Please use the proper number of parameters.");
        }
      };

      /**
       * @member ArrayList
       * ArrayList.size() Returns the number of elements in this list.
       *
       * @returns {int} the number of elements in this list
       */
      this.size = function() {
        return array.length;
      };

      /**
       * @member ArrayList
       * ArrayList.clear() Removes all of the elements from this list. The list will be empty after this call returns.
       */
      this.clear = function() {
        array.length = 0;
      };

      /**
       * @member ArrayList
       * ArrayList.remove() Removes an element either based on index, if the argument is a number, or
       * by equality check, if the argument is an object.
       *
       * @param {int|Object} item either the index of the element to be removed, or the element itself.
       *
       * @returns {Object|boolean} If removal is by index, the element that was removed, or null if nothing was removed. If removal is by object, true if removal occurred, otherwise false.
       */
      this.remove = function(item) {
        if (typeof item === 'number') {
          return array.splice(item, 1)[0];
        } else {
          item = this.indexOf(item);
          if (item > -1) {
            array.splice(item, 1);
            return true;
          }
          return false;
        }
      };

      /**
       * @member ArrayList
       * ArrayList.isEmpty() Tests if this list has no elements.
       *
       * @returns {boolean} true if this list has no elements; false otherwise
       */
      this.isEmpty = function() {
         return !array.length;
      };

      /**
       * @member ArrayList
       * ArrayList.clone() Returns a shallow copy of this ArrayList instance. (The elements themselves are not copied.)
       *
       * @returns {ArrayList} a clone of this ArrayList instance
       */
      this.clone = function() {
        return new ArrayList(this);
      };

      /**
       * @member ArrayList
       * ArrayList.toArray() Returns an array containing all of the elements in this list in the correct order.
       *
       * @returns {Object[]} Returns an array containing all of the elements in this list in the correct order
       */
      this.toArray = function() {
        return array.slice(0);
      };

      this.iterator = function() {
        return new Iterator(array);
      };
    }

    return ArrayList;
  }());

  /**
  * A HashMap stores a collection of objects, each referenced by a key. This is similar to an Array, only
  * instead of accessing elements with a numeric index, a String  is used. (If you are familiar with
  * associative arrays from other languages, this is the same idea.)
  *
  * @param {int} initialCapacity          defines the initial capacity of the map, it's 16 by default
  * @param {float} loadFactor             the load factor for the map, the default is 0.75
  * @param {Map} m                        gives the new HashMap the same mappings as this Map
  */
  var HashMap = (function() {
    /**
    * @member HashMap
    * A HashMap stores a collection of objects, each referenced by a key. This is similar to an Array, only
    * instead of accessing elements with a numeric index, a String  is used. (If you are familiar with
    * associative arrays from other languages, this is the same idea.)
    *
    * @param {int} initialCapacity          defines the initial capacity of the map, it's 16 by default
    * @param {float} loadFactor             the load factor for the map, the default is 0.75
    * @param {Map} m                        gives the new HashMap the same mappings as this Map
    */
    function HashMap() {
      if (arguments.length === 1 && arguments[0].constructor === HashMap) {
        return arguments[0].clone();
      }

      var initialCapacity = arguments.length > 0 ? arguments[0] : 16;
      var loadFactor = arguments.length > 1 ? arguments[1] : 0.75;
      var buckets = [];
      buckets.length = initialCapacity;
      var count = 0;
      var hashMap = this;

      function getBucketIndex(key) {
        var index = virtHashCode(key) % buckets.length;
        return index < 0 ? buckets.length + index : index;
      }
      function ensureLoad() {
        if (count <= loadFactor * buckets.length) {
          return;
        }
        var allEntries = [];
        for (var i = 0; i < buckets.length; ++i) {
          if (buckets[i] !== undef) {
            allEntries = allEntries.concat(buckets[i]);
          }
        }
        var newBucketsLength = buckets.length * 2;
        buckets = [];
        buckets.length = newBucketsLength;
        for (var j = 0; j < allEntries.length; ++j) {
          var index = getBucketIndex(allEntries[j].key);
          var bucket = buckets[index];
          if (bucket === undef) {
            buckets[index] = bucket = [];
          }
          bucket.push(allEntries[j]);
        }
      }

      function Iterator(conversion, removeItem) {
        var bucketIndex = 0;
        var itemIndex = -1;
        var endOfBuckets = false;

        function findNext() {
          while (!endOfBuckets) {
            ++itemIndex;
            if (bucketIndex >= buckets.length) {
              endOfBuckets = true;
            } else if (buckets[bucketIndex] === undef || itemIndex >= buckets[bucketIndex].length) {
              itemIndex = -1;
              ++bucketIndex;
            } else {
              return;
            }
          }
        }

        /*
        * @member Iterator
        * Checks if the Iterator has more items
        */
        this.hasNext = function() {
          return !endOfBuckets;
        };

        /*
        * @member Iterator
        * Return the next Item
        */
        this.next = function() {
          var result = conversion(buckets[bucketIndex][itemIndex]);
          findNext();
          return result;
        };

        /*
        * @member Iterator
        * Remove the current item
        */
        this.remove = function() {
          removeItem(this.next());
          --itemIndex;
        };

        findNext();
      }

      function Set(conversion, isIn, removeItem) {
        this.clear = function() {
          hashMap.clear();
        };

        this.contains = function(o) {
          return isIn(o);
        };

        this.containsAll = function(o) {
          var it = o.iterator();
          while (it.hasNext()) {
            if (!this.contains(it.next())) {
              return false;
            }
          }
          return true;
        };

        this.isEmpty = function() {
          return hashMap.isEmpty();
        };

        this.iterator = function() {
          return new Iterator(conversion, removeItem);
        };

        this.remove = function(o) {
          if (this.contains(o)) {
            removeItem(o);
            return true;
          }
          return false;
        };

        this.removeAll = function(c) {
          var it = c.iterator();
          var changed = false;
          while (it.hasNext()) {
            var item = it.next();
            if (this.contains(item)) {
              removeItem(item);
              changed = true;
            }
          }
          return true;
        };

        this.retainAll = function(c) {
          var it = this.iterator();
          var toRemove = [];
          while (it.hasNext()) {
            var entry = it.next();
            if (!c.contains(entry)) {
              toRemove.push(entry);
            }
          }
          for (var i = 0; i < toRemove.length; ++i) {
            removeItem(toRemove[i]);
          }
          return toRemove.length > 0;
        };

        this.size = function() {
          return hashMap.size();
        };

        this.toArray = function() {
          var result = [];
          var it = this.iterator();
          while (it.hasNext()) {
            result.push(it.next());
          }
          return result;
        };
      }

      function Entry(pair) {
        this._isIn = function(map) {
          return map === hashMap && (pair.removed === undef);
        };

        this.equals = function(o) {
          return virtEquals(pair.key, o.getKey());
        };

        this.getKey = function() {
          return pair.key;
        };

        this.getValue = function() {
          return pair.value;
        };

        this.hashCode = function(o) {
          return virtHashCode(pair.key);
        };

        this.setValue = function(value) {
          var old = pair.value;
          pair.value = value;
          return old;
        };
      }

      this.clear = function() {
        count = 0;
        buckets = [];
        buckets.length = initialCapacity;
      };

      this.clone = function() {
        var map = new HashMap();
        map.putAll(this);
        return map;
      };

      this.containsKey = function(key) {
        var index = getBucketIndex(key);
        var bucket = buckets[index];
        if (bucket === undef) {
          return false;
        }
        for (var i = 0; i < bucket.length; ++i) {
          if (virtEquals(bucket[i].key, key)) {
            return true;
          }
        }
        return false;
      };

      this.containsValue = function(value) {
        for (var i = 0; i < buckets.length; ++i) {
          var bucket = buckets[i];
          if (bucket === undef) {
            continue;
          }
          for (var j = 0; j < bucket.length; ++j) {
            if (virtEquals(bucket[j].value, value)) {
              return true;
            }
          }
        }
        return false;
      };

      this.entrySet = function() {
        return new Set(

        function(pair) {
          return new Entry(pair);
        },

        function(pair) {
          return pair.constructor === Entry && pair._isIn(hashMap);
        },

        function(pair) {
          return hashMap.remove(pair.getKey());
        });
      };

      this.get = function(key) {
        var index = getBucketIndex(key);
        var bucket = buckets[index];
        if (bucket === undef) {
          return null;
        }
        for (var i = 0; i < bucket.length; ++i) {
          if (virtEquals(bucket[i].key, key)) {
            return bucket[i].value;
          }
        }
        return null;
      };

      this.isEmpty = function() {
        return count === 0;
      };

      this.keySet = function() {
        return new Set(

        function(pair) {
          return pair.key;
        },

        function(key) {
          return hashMap.containsKey(key);
        },

        function(key) {
          return hashMap.remove(key);
        });
      };

      this.put = function(key, value) {
        var index = getBucketIndex(key);
        var bucket = buckets[index];
        if (bucket === undef) {
          ++count;
          buckets[index] = [{
            key: key,
            value: value
          }];
          ensureLoad();
          return null;
        }
        for (var i = 0; i < bucket.length; ++i) {
          if (virtEquals(bucket[i].key, key)) {
            var previous = bucket[i].value;
            bucket[i].value = value;
            return previous;
          }
        }
        ++count;
        bucket.push({
          key: key,
          value: value
        });
        ensureLoad();
        return null;
      };

      this.putAll = function(m) {
        var it = m.entrySet().iterator();
        while (it.hasNext()) {
          var entry = it.next();
          this.put(entry.getKey(), entry.getValue());
        }
      };

      this.remove = function(key) {
        var index = getBucketIndex(key);
        var bucket = buckets[index];
        if (bucket === undef) {
          return null;
        }
        for (var i = 0; i < bucket.length; ++i) {
          if (virtEquals(bucket[i].key, key)) {
            --count;
            var previous = bucket[i].value;
            bucket[i].removed = true;
            if (bucket.length > 1) {
              bucket.splice(i, 1);
            } else {
              buckets[index] = undef;
            }
            return previous;
          }
        }
        return null;
      };

      this.size = function() {
        return count;
      };

      this.values = function() {
        var result = [];
        var it = this.entrySet().iterator();
        while (it.hasNext()) {
          var entry = it.next();
          result.push(entry.getValue());
        }
        return result;
      };
    }

    return HashMap;
  }());

  var PVector = (function() {
    function PVector(x, y, z) {
      this.x = x || 0;
      this.y = y || 0;
      this.z = z || 0;
    }

    function createPVectorMethod(method) {
      return function(v1, v2) {
        var v = v1.get();
        v[method](v2);
        return v;
      };
    }

    function createSimplePVectorMethod(method) {
      return function(v1, v2) {
        return v1[method](v2);
      };
    }

    var simplePVMethods = "dist dot cross".split(" ");
    var method = simplePVMethods.length;

    PVector.angleBetween = function(v1, v2) {
      return Math.acos(v1.dot(v2) / (v1.mag() * v2.mag()));
    };

    // Common vector operations for PVector
    PVector.prototype = {
      set: function(v, y, z) {
        if (arguments.length === 1) {
          this.set(v.x || v[0] || 0, v.y || v[1] || 0, v.z || v[2] || 0);
        } else {
          this.x = v;
          this.y = y;
          this.z = z;
        }
      },
      get: function() {
        return new PVector(this.x, this.y, this.z);
      },
      mag: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
      },
      add: function(v, y, z) {
        if (arguments.length === 3) {
          this.x += v;
          this.y += y;
          this.z += z;
        } else if (arguments.length === 1) {
          this.x += v.x;
          this.y += v.y;
          this.z += v.z;
        }
      },
      sub: function(v, y, z) {
        if (arguments.length === 3) {
          this.x -= v;
          this.y -= y;
          this.z -= z;
        } else if (arguments.length === 1) {
          this.x -= v.x;
          this.y -= v.y;
          this.z -= v.z;
        }
      },
      mult: function(v) {
        if (typeof v === 'number') {
          this.x *= v;
          this.y *= v;
          this.z *= v;
        } else if (typeof v === 'object') {
          this.x *= v.x;
          this.y *= v.y;
          this.z *= v.z;
        }
      },
      div: function(v) {
        if (typeof v === 'number') {
          this.x /= v;
          this.y /= v;
          this.z /= v;
        } else if (typeof v === 'object') {
          this.x /= v.x;
          this.y /= v.y;
          this.z /= v.z;
        }
      },
      dist: function(v) {
        var dx = this.x - v.x,
            dy = this.y - v.y,
            dz = this.z - v.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
      },
      dot: function(v, y, z) {
        if (arguments.length === 3) {
          return (this.x * v + this.y * y + this.z * z);
        } else if (arguments.length === 1) {
          return (this.x * v.x + this.y * v.y + this.z * v.z);
        }
      },
      cross: function(v) {
        return new PVector(this.y * v.z - v.y * this.z,
                           this.z * v.x - v.z * this.x,
                           this.x * v.y - v.x * this.y);
      },
      normalize: function() {
        var m = this.mag();
        if (m > 0) {
          this.div(m);
        }
      },
      limit: function(high) {
        if (this.mag() > high) {
          this.normalize();
          this.mult(high);
        }
      },
      heading2D: function() {
        return (-Math.atan2(-this.y, this.x));
      },
      toString: function() {
        return "[" + this.x + ", " + this.y + ", " + this.z + "]";
      },
      array: function() {
        return [this.x, this.y, this.z];
      }
    };

    while (method--) {
      PVector[simplePVMethods[method]] = createSimplePVectorMethod(simplePVMethods[method]);
    }

    for (method in PVector.prototype) {
      if (PVector.prototype.hasOwnProperty(method) && !PVector.hasOwnProperty(method)) {
        PVector[method] = createPVectorMethod(method);
      }
    }

    return PVector;
  }());

  // Building defaultScope. Changing of the prototype protects
  // internal Processing code from the changes in defaultScope
  function DefaultScope() {}
  DefaultScope.prototype = PConstants;

  var defaultScope = new DefaultScope();
  defaultScope.ArrayList   = ArrayList;
  defaultScope.HashMap     = HashMap;
  defaultScope.PVector     = PVector;
  defaultScope.ObjectIterator = ObjectIterator;
  //defaultScope.PImage    = PImage;     // TODO
  //defaultScope.PShape    = PShape;     // TODO
  //defaultScope.PShapeSVG = PShapeSVG;  // TODO

  ////////////////////////////////////////////////////////////////////////////
  // Class inheritance helper methods
  ////////////////////////////////////////////////////////////////////////////

  defaultScope.defineProperty = function(obj, name, desc) {
    if("defineProperty" in Object) {
      Object.defineProperty(obj, name, desc);
    } else {
      if (desc.hasOwnProperty("get")) {
        obj.__defineGetter__(name, desc.get);
      }
      if (desc.hasOwnProperty("set")) {
        obj.__defineSetter__(name, desc.set);
      }
    }
  };

  function extendClass(subClass, baseClass) {
    function extendGetterSetter(propertyName) {
      defaultScope.defineProperty(subClass, propertyName, {
        get: function() {
          return baseClass[propertyName];
        },
        set: function(v) {
          baseClass[propertyName]=v;
        },
        enumerable: true
      });
    }

    var properties = [];
    for (var propertyName in baseClass) {
      if (typeof baseClass[propertyName] === 'function') {
        // Overriding all non-overriden functions
        if (!subClass.hasOwnProperty(propertyName)) {
          subClass[propertyName] = baseClass[propertyName];
        }
      } else if(propertyName.charAt(0) !== "$" && !(propertyName in subClass)) {
        // Delaying the properties extension due to the IE9 bug (see #918).
        properties.push(propertyName);
      }
    }
    while (properties.length > 0) {
      extendGetterSetter(properties.shift());
    }
  }

  defaultScope.extendClassChain = function(base) {
    var path = [base];
    for (var self = base.$upcast; self; self = self.$upcast) {
      extendClass(self, base);
      path.push(self);
      base = self;
    }
    while (path.length > 0) {
      path.pop().$self=base;
    }
  };

  defaultScope.extendStaticMembers = function(derived, base) {
    extendClass(derived, base);
  };

  defaultScope.extendInterfaceMembers = function(derived, base) {
    extendClass(derived, base);
  };

  defaultScope.addMethod = function(object, name, fn, superAccessor) {
    if (object[name]) {
      var args = fn.length,
        oldfn = object[name];

      object[name] = function() {
        if (arguments.length === args) {
          return fn.apply(this, arguments);
        } else {
          return oldfn.apply(this, arguments);
        }
      };
    } else {
      object[name] = fn;
    }
  };

  defaultScope.createJavaArray = function(type, bounds) {
    var result = null;
    if (typeof bounds[0] === 'number') {
      var itemsCount = 0 | bounds[0];
      if (bounds.length <= 1) {
        result = [];
        result.length = itemsCount;
        for (var i = 0; i < itemsCount; ++i) {
          result[i] = 0;
        }
      } else {
        result = [];
        var newBounds = bounds.slice(1);
        for (var j = 0; j < itemsCount; ++j) {
          result.push(defaultScope.createJavaArray(type, newBounds));
        }
      }
    }
    return result;
  };

  var colors = {
    aliceblue:            "#f0f8ff",
    antiquewhite:         "#faebd7",
    aqua:                 "#00ffff",
    aquamarine:           "#7fffd4",
    azure:                "#f0ffff",
    beige:                "#f5f5dc",
    bisque:               "#ffe4c4",
    black:                "#000000",
    blanchedalmond:       "#ffebcd",
    blue:                 "#0000ff",
    blueviolet:           "#8a2be2",
    brown:                "#a52a2a",
    burlywood:            "#deb887",
    cadetblue:            "#5f9ea0",
    chartreuse:           "#7fff00",
    chocolate:            "#d2691e",
    coral:                "#ff7f50",
    cornflowerblue:       "#6495ed",
    cornsilk:             "#fff8dc",
    crimson:              "#dc143c",
    cyan:                 "#00ffff",
    darkblue:             "#00008b",
    darkcyan:             "#008b8b",
    darkgoldenrod:        "#b8860b",
    darkgray:             "#a9a9a9",
    darkgreen:            "#006400",
    darkkhaki:            "#bdb76b",
    darkmagenta:          "#8b008b",
    darkolivegreen:       "#556b2f",
    darkorange:           "#ff8c00",
    darkorchid:           "#9932cc",
    darkred:              "#8b0000",
    darksalmon:           "#e9967a",
    darkseagreen:         "#8fbc8f",
    darkslateblue:        "#483d8b",
    darkslategray:        "#2f4f4f",
    darkturquoise:        "#00ced1",
    darkviolet:           "#9400d3",
    deeppink:             "#ff1493",
    deepskyblue:          "#00bfff",
    dimgray:              "#696969",
    dodgerblue:           "#1e90ff",
    firebrick:            "#b22222",
    floralwhite:          "#fffaf0",
    forestgreen:          "#228b22",
    fuchsia:              "#ff00ff",
    gainsboro:            "#dcdcdc",
    ghostwhite:           "#f8f8ff",
    gold:                 "#ffd700",
    goldenrod:            "#daa520",
    gray:                 "#808080",
    green:                "#008000",
    greenyellow:          "#adff2f",
    honeydew:             "#f0fff0",
    hotpink:              "#ff69b4",
    indianred:            "#cd5c5c",
    indigo:               "#4b0082",
    ivory:                "#fffff0",
    khaki:                "#f0e68c",
    lavender:             "#e6e6fa",
    lavenderblush:        "#fff0f5",
    lawngreen:            "#7cfc00",
    lemonchiffon:         "#fffacd",
    lightblue:            "#add8e6",
    lightcoral:           "#f08080",
    lightcyan:            "#e0ffff",
    lightgoldenrodyellow: "#fafad2",
    lightgrey:            "#d3d3d3",
    lightgreen:           "#90ee90",
    lightpink:            "#ffb6c1",
    lightsalmon:          "#ffa07a",
    lightseagreen:        "#20b2aa",
    lightskyblue:         "#87cefa",
    lightslategray:       "#778899",
    lightsteelblue:       "#b0c4de",
    lightyellow:          "#ffffe0",
    lime:                 "#00ff00",
    limegreen:            "#32cd32",
    linen:                "#faf0e6",
    magenta:              "#ff00ff",
    maroon:               "#800000",
    mediumaquamarine:     "#66cdaa",
    mediumblue:           "#0000cd",
    mediumorchid:         "#ba55d3",
    mediumpurple:         "#9370d8",
    mediumseagreen:       "#3cb371",
    mediumslateblue:      "#7b68ee",
    mediumspringgreen:    "#00fa9a",
    mediumturquoise:      "#48d1cc",
    mediumvioletred:      "#c71585",
    midnightblue:         "#191970",
    mintcream:            "#f5fffa",
    mistyrose:            "#ffe4e1",
    moccasin:             "#ffe4b5",
    navajowhite:          "#ffdead",
    navy:                 "#000080",
    oldlace:              "#fdf5e6",
    olive:                "#808000",
    olivedrab:            "#6b8e23",
    orange:               "#ffa500",
    orangered:            "#ff4500",
    orchid:               "#da70d6",
    palegoldenrod:        "#eee8aa",
    palegreen:            "#98fb98",
    paleturquoise:        "#afeeee",
    palevioletred:        "#d87093",
    papayawhip:           "#ffefd5",
    peachpuff:            "#ffdab9",
    peru:                 "#cd853f",
    pink:                 "#ffc0cb",
    plum:                 "#dda0dd",
    powderblue:           "#b0e0e6",
    purple:               "#800080",
    red:                  "#ff0000",
    rosybrown:            "#bc8f8f",
    royalblue:            "#4169e1",
    saddlebrown:          "#8b4513",
    salmon:               "#fa8072",
    sandybrown:           "#f4a460",
    seagreen:             "#2e8b57",
    seashell:             "#fff5ee",
    sienna:               "#a0522d",
    silver:               "#c0c0c0",
    skyblue:              "#87ceeb",
    slateblue:            "#6a5acd",
    slategray:            "#708090",
    snow:                 "#fffafa",
    springgreen:          "#00ff7f",
    steelblue:            "#4682b4",
    tan:                  "#d2b48c",
    teal:                 "#008080",
    thistle:              "#d8bfd8",
    tomato:               "#ff6347",
    turquoise:            "#40e0d0",
    violet:               "#ee82ee",
    wheat:                "#f5deb3",
    white:                "#ffffff",
    whitesmoke:           "#f5f5f5",
    yellow:               "#ffff00",
    yellowgreen:          "#9acd32"
  };

  // Manage multiple Processing instances
  var processingInstances = [];
  var processingInstanceIds = {};

  var removeInstance = function(id) {
    processingInstances.splice(processingInstanceIds[id], 1);
    delete processingInstanceIds[id];
  };

  var addInstance = function(processing) {
    if (processing.externals.canvas.id === undef || !processing.externals.canvas.id.length) {
      processing.externals.canvas.id = "__processing" + processingInstances.length;
    }
    processingInstanceIds[processing.externals.canvas.id] = processingInstances.length;
    processingInstances.push(processing);
  };


  var Processing = this.Processing = function(curElement, aCode) {
    // Previously we allowed calling Processing as a func instead of ctor, but no longer.
    if (!(this instanceof Processing)) {
      throw("called Processing constructor as if it were a function: missing 'new'.");
    }

    function unimplemented(s) {
      Processing.debug('Unimplemented - ' + s);
    }

    // When something new is added to "p." it must also be added to the "names" array.
    // The names array contains the names of everything that is inside "p."
    var p = this;

    var pgraphicsMode = (arguments.length === 0);
    if (pgraphicsMode) {
      curElement = document.createElement("canvas");
    }

    // PJS specific (non-p5) methods and properties to externalize
    p.externals = {
      canvas:  curElement,
      context: undef,
      sketch:  undef
    };

    p.name            = 'Processing.js Instance'; // Set Processing defaults / environment variables
    p.use3DContext    = false; // default '2d' canvas context

    /**
     * Confirms if a Processing program is "focused", meaning that it is
     * active and will accept input from mouse or keyboard. This variable
     * is "true" if it is focused and "false" if not. This variable is
     * often used when you want to warn people they need to click on the
     * browser before it will work.
    */
    p.focused         = false;
    p.breakShape      = false;

    // Glyph path storage for textFonts
    p.glyphTable      = {};

    // Global vars for tracking mouse position
    p.pmouseX         = 0;
    p.pmouseY         = 0;
    p.mouseX          = 0;
    p.mouseY          = 0;
    p.mouseButton     = 0;
    p.mouseScroll     = 0;

    // Undefined event handlers to be replaced by user when needed
    p.mouseClicked    = undef;
    p.mouseDragged    = undef;
    p.mouseMoved      = undef;
    p.mousePressed    = undef;
    p.mouseReleased   = undef;
    p.mouseScrolled   = undef;
    p.mouseOver       = undef;
    p.mouseOut        = undef;
    p.touchStart      = undef;
    p.touchEnd        = undef;
    p.touchMove       = undef;
    p.touchCancel     = undef;
    p.key             = undef;
    p.keyCode         = undef;
    p.keyPressed      = function(){};  // needed to remove function checks
    p.keyReleased     = function(){};
    p.keyTyped        = function(){};
    p.draw            = undef;
    p.setup           = undef;

    // Remapped vars
    p.__mousePressed  = false;
    p.__keyPressed    = false;
    p.__frameRate     = 60;

    // The current animation frame
    p.frameCount      = 0;

    // The height/width of the canvas
    p.width           = 100;
    p.height          = 100;

    // "Private" variables used to maintain state
    var curContext,
        curSketch,
        drawing, // hold a Drawing2D or Drawing3D object
        online = true,
        doFill = true,
        fillStyle = [1.0, 1.0, 1.0, 1.0],
        currentFillColor = 0xFFFFFFFF,
        isFillDirty = true,
        doStroke = true,
        strokeStyle = [0.8, 0.8, 0.8, 1.0],
        currentStrokeColor = 0xFFFDFDFD,
        isStrokeDirty = true,
        lineWidth = 1,
        loopStarted = false,
        doLoop = true,
        looping = 0,
        curRectMode = PConstants.CORNER,
        curEllipseMode = PConstants.CENTER,
        normalX = 0,
        normalY = 0,
        normalZ = 0,
        normalMode = PConstants.NORMAL_MODE_AUTO,
        inDraw = false,
        curFrameRate = 60,
        curMsPerFrame = 1000/curFrameRate,
        curCursor = PConstants.ARROW,
        oldCursor = curElement.style.cursor,
        curShape = PConstants.POLYGON,
        curShapeCount = 0,
        curvePoints = [],
        curTightness = 0,
        curveDet = 20,
        curveInited = false,
        backgroundObj = -3355444, // rgb(204, 204, 204) is the default gray background colour
        bezDetail = 20,
        colorModeA = 255,
        colorModeX = 255,
        colorModeY = 255,
        colorModeZ = 255,
        pathOpen = false,
        mouseDragging = false,
        curColorMode = PConstants.RGB,
        curTint = null,
        curTextSize = 12,
        curTextFont = {name: "\"Arial\", sans-serif", origName: "Arial"},
        curTextLeading = 14,
        getLoaded = false,
        start = new Date().getTime(),
        timeSinceLastFPS = start,
        framesSinceLastFPS = 0,
        textcanvas,
        curveBasisMatrix,
        curveToBezierMatrix,
        curveDrawMatrix,
        bezierDrawMatrix,
        bezierBasisInverse,
        bezierBasisMatrix,
        // Keys and Keystrokes
        firstCodedDown = true,    // first coded key stroke
        firstEDGKeyDown = true,   // first Enter - Delete Google key stroke
        firstEDMKeyDown = true,   // first Enter - Delete Mozilla key stroke
        firstMKeyDown = true,     // first Mozilla key stroke
        firstGKeyDown = true,     // first Google key stroke
        gRefire = false,          // Google refire
        curContextCache = { attributes: {}, locations: {} },
        // Shaders
        programObject3D,
        programObject2D,
        programObjectUnlitShape,
        boxBuffer,
        boxNormBuffer,
        boxOutlineBuffer,
        rectBuffer,
        rectNormBuffer,
        sphereBuffer,
        lineBuffer,
        fillBuffer,
        fillColorBuffer,
        strokeColorBuffer,
        pointBuffer,
        shapeTexVBO,
        canTex,   // texture for createGraphics
        textTex,   // texture for 3d tex
        curTexture = {width:0,height:0},
        curTextureMode = PConstants.IMAGE,
        usingTexture = false,
        textBuffer,
        textureBuffer,
        indexBuffer,
        // Text alignment
        horizontalTextAlignment = PConstants.LEFT,
        verticalTextAlignment = PConstants.BASELINE,
        baselineOffset = 0.2, // percent
        tMode = PConstants.MODEL,
        // Pixels cache
        originalContext,
        proxyContext = null,
        isContextReplaced = false,
        setPixelsCached,
        maxPixelsCached = 1000,
        pressedKeysMap = [],
        lastPressedKeyCode = null,
        codedKeys = [ PConstants.SHIFT, PConstants.CONTROL, PConstants.ALT, PConstants.CAPSLK, PConstants.PGUP, PConstants.PGDN,
                      PConstants.END, PConstants.HOME, PConstants.LEFT, PConstants.UP, PConstants.RIGHT, PConstants.DOWN, PConstants.NUMLK,
                      PConstants.INSERT, PConstants.F1, PConstants.F2, PConstants.F3, PConstants.F4, PConstants.F5, PConstants.F6, PConstants.F7,
                      PConstants.F8, PConstants.F9, PConstants.F10, PConstants.F11, PConstants.F12, PConstants.META ];

    // Get padding and border style widths for mouse offsets
    var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;

    if (document.defaultView && document.defaultView.getComputedStyle) {
      stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(curElement, null)['paddingLeft'], 10)      || 0;
      stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(curElement, null)['paddingTop'], 10)       || 0;
      styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(curElement, null)['borderLeftWidth'], 10)  || 0;
      styleBorderTop   = parseInt(document.defaultView.getComputedStyle(curElement, null)['borderTopWidth'], 10)   || 0;
    }

    // User can only have MAX_LIGHTS lights
    var lightCount = 0;

    //sphere stuff
    var sphereDetailV = 0,
        sphereDetailU = 0,
        sphereX = [],
        sphereY = [],
        sphereZ = [],
        sinLUT = new Float32Array(PConstants.SINCOS_LENGTH),
        cosLUT = new Float32Array(PConstants.SINCOS_LENGTH),
        sphereVerts,
        sphereNorms;

    // Camera defaults and settings
    var cam,
        cameraInv,
        forwardTransform,
        reverseTransform,
        modelView,
        modelViewInv,
        userMatrixStack,
        userReverseMatrixStack,
        inverseCopy,
        projection,
        manipulatingCamera = false,
        frustumMode = false,
        cameraFOV = 60 * (Math.PI / 180),
        cameraX = p.width / 2,
        cameraY = p.height / 2,
        cameraZ = cameraY / Math.tan(cameraFOV / 2),
        cameraNear = cameraZ / 10,
        cameraFar = cameraZ * 10,
        cameraAspect = p.width / p.height;

    var vertArray = [],
        curveVertArray = [],
        curveVertCount = 0,
        isCurve = false,
        isBezier = false,
        firstVert = true;

    //PShape stuff
    var curShapeMode = PConstants.CORNER;

    // Stores states for pushStyle() and popStyle().
    var styleArray = [];

    // Vertices are specified in a counter-clockwise order
    // triangles are in this order: back, front, right, bottom, left, top
    var boxVerts = new Float32Array([
       0.5,  0.5, -0.5,  0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5,  0.5, -0.5,  0.5,  0.5, -0.5,
       0.5,  0.5,  0.5, -0.5,  0.5,  0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5,  0.5, -0.5,  0.5,  0.5,  0.5,  0.5,
       0.5,  0.5, -0.5,  0.5,  0.5,  0.5,  0.5, -0.5,  0.5,  0.5, -0.5,  0.5,  0.5, -0.5, -0.5,  0.5,  0.5, -0.5,
       0.5, -0.5, -0.5,  0.5, -0.5,  0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5, -0.5, -0.5, -0.5,  0.5, -0.5, -0.5,
      -0.5, -0.5, -0.5, -0.5, -0.5,  0.5, -0.5,  0.5,  0.5, -0.5,  0.5,  0.5, -0.5,  0.5, -0.5, -0.5, -0.5, -0.5,
       0.5,  0.5,  0.5,  0.5,  0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5,  0.5,  0.5,  0.5,  0.5]);

    var boxOutlineVerts = new Float32Array([
       0.5,  0.5,  0.5,  0.5, -0.5,  0.5,  0.5,  0.5, -0.5,  0.5, -0.5, -0.5,
      -0.5,  0.5, -0.5, -0.5, -0.5, -0.5, -0.5,  0.5,  0.5, -0.5, -0.5,  0.5,
       0.5,  0.5,  0.5,  0.5,  0.5, -0.5,  0.5,  0.5, -0.5, -0.5,  0.5, -0.5,
      -0.5,  0.5, -0.5, -0.5,  0.5,  0.5, -0.5,  0.5,  0.5,  0.5,  0.5,  0.5,
       0.5, -0.5,  0.5,  0.5, -0.5, -0.5,  0.5, -0.5, -0.5, -0.5, -0.5, -0.5,
      -0.5, -0.5, -0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5,  0.5, -0.5,  0.5]);

    var boxNorms = new Float32Array([
       0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,
       0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,
       1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,
       0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,
      -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0,
       0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0]);

    // These verts are used for the fill and stroke using TRIANGLE_FAN and LINE_LOOP
    var rectVerts = new Float32Array([0,0,0, 0,1,0, 1,1,0, 1,0,0]);

    var rectNorms = new Float32Array([0,0,1, 0,0,1, 0,0,1, 0,0,1]);


    // Shader for points and lines in begin/endShape
    var vShaderSrcUnlitShape =
      "varying vec4 frontColor;" +

      "attribute vec3 aVertex;" +
      "attribute vec4 aColor;" +

      "uniform mat4 uView;" +
      "uniform mat4 uProjection;" +
      "uniform float pointSize;" +

      "void main(void) {" +
      "  frontColor = aColor;" +
      "  gl_PointSize = pointSize;" +
      "  gl_Position = uProjection * uView * vec4(aVertex, 1.0);" +
      "}";

    var fShaderSrcUnlitShape =
      "#ifdef GL_ES\n" +
      "precision highp float;\n" +
      "#endif\n" +

      "varying vec4 frontColor;" +

      "void main(void){" +
      "  gl_FragColor = frontColor;" +
      "}";

    // Shader for rect, text, box outlines, sphere outlines, point() and line()
    var vertexShaderSource2D =
      "varying vec4 frontColor;" +

      "attribute vec3 Vertex;" +
      "attribute vec2 aTextureCoord;" +
      "uniform vec4 color;" +

      "uniform mat4 model;" +
      "uniform mat4 view;" +
      "uniform mat4 projection;" +
      "uniform float pointSize;" +
      "varying vec2 vTextureCoord;"+

      "void main(void) {" +
      "  gl_PointSize = pointSize;" +
      "  frontColor = color;" +
      "  gl_Position = projection * view * model * vec4(Vertex, 1.0);" +
      "  vTextureCoord = aTextureCoord;" +
      "}";

    var fragmentShaderSource2D =
      "#ifdef GL_ES\n" +
      "precision highp float;\n" +
      "#endif\n" +

      "varying vec4 frontColor;" +
      "varying vec2 vTextureCoord;"+

      "uniform sampler2D uSampler;"+
      "uniform int picktype;"+

      "void main(void){" +
      "  if(picktype == 0){"+
      "    gl_FragColor = frontColor;" +
      "  }" +
      "  else if(picktype == 1){"+
      "    float alpha = texture2D(uSampler, vTextureCoord).a;"+
      "    gl_FragColor = vec4(frontColor.rgb*alpha, alpha);\n"+
      "  }"+
      "}";

    var webglMaxTempsWorkaround = /Windows/.test(navigator.userAgent);

    // Vertex shader for boxes and spheres
    var vertexShaderSource3D =
      "varying vec4 frontColor;" +

      "attribute vec3 Vertex;" +
      "attribute vec3 Normal;" +
      "attribute vec4 aColor;" +
      "attribute vec2 aTexture;" +
      "varying   vec2 vTexture;" +

      "uniform vec4 color;" +

      "uniform bool usingMat;" +
      "uniform vec3 specular;" +
      "uniform vec3 mat_emissive;" +
      "uniform vec3 mat_ambient;" +
      "uniform vec3 mat_specular;" +
      "uniform float shininess;" +

      "uniform mat4 model;" +
      "uniform mat4 view;" +
      "uniform mat4 projection;" +
      "uniform mat4 normalTransform;" +

      "uniform int lightCount;" +
      "uniform vec3 falloff;" +

      // careful changing the order of these fields. Some cards
      // have issues with memory alignment
      "struct Light {" +
      "  int type;" +
      "  vec3 color;" +
      "  vec3 position;" +
      "  vec3 direction;" +
      "  float angle;" +
      "  vec3 halfVector;" +
      "  float concentration;" +
      "};" +

      // nVidia cards have issues with arrays of structures
      // so instead we create 8 instances of Light
      "uniform Light lights0;" +
      "uniform Light lights1;" +
      "uniform Light lights2;" +
      "uniform Light lights3;" +
      "uniform Light lights4;" +
      "uniform Light lights5;" +
      "uniform Light lights6;" +
      "uniform Light lights7;" +

     // GLSL does not support switch
      "Light getLight(int index){" +
      "  if(index == 0) return lights0;" +
      "  if(index == 1) return lights1;" +
      "  if(index == 2) return lights2;" +
      "  if(index == 3) return lights3;" +
      "  if(index == 4) return lights4;" +
      "  if(index == 5) return lights5;" +
      "  if(index == 6) return lights6;" +
      // Do not use a conditional for the last return statement
      // because some video cards will fail and complain that
      // "not all paths return"
      "  return lights7;" +
      "}" +

      "void AmbientLight( inout vec3 totalAmbient, in vec3 ecPos, in Light light ) {" +
      // Get the vector from the light to the vertex
      // Get the distance from the current vector to the light position
      "  float d = length( light.position - ecPos );" +
      "  float attenuation = 1.0 / ( falloff[0] + ( falloff[1] * d ) + ( falloff[2] * d * d ));" +
      "  totalAmbient += light.color * attenuation;" +
      "}" +

      "void DirectionalLight( inout vec3 col, inout vec3 spec, in vec3 vertNormal, in vec3 ecPos, in Light light ) {" +
      "  float powerfactor = 0.0;" +
      "  float nDotVP = max(0.0, dot( vertNormal, normalize(-light.position) ));" +
      "  float nDotVH = max(0.0, dot( vertNormal, normalize(-light.position-normalize(ecPos) )));" +

      "  if( nDotVP != 0.0 ){" +
      "    powerfactor = pow( nDotVH, shininess );" +
      "  }" +

      "  col += light.color * nDotVP;" +
      "  spec += specular * powerfactor;" +
      "}" +

      "void PointLight( inout vec3 col, inout vec3 spec, in vec3 vertNormal, in vec3 ecPos, in Light light ) {" +
      "  float powerfactor;" +

      // Get the vector from the light to the vertex
      "   vec3 VP = light.position - ecPos;" +

      // Get the distance from the current vector to the light position
      "  float d = length( VP ); " +

      // Normalize the light ray so it can be used in the dot product operation.
      "  VP = normalize( VP );" +

      "  float attenuation = 1.0 / ( falloff[0] + ( falloff[1] * d ) + ( falloff[2] * d * d ));" +

      "  float nDotVP = max( 0.0, dot( vertNormal, VP ));" +
      "  vec3 halfVector = normalize( VP - normalize(ecPos) );" +
      "  float nDotHV = max( 0.0, dot( vertNormal, halfVector ));" +

      "  if( nDotVP == 0.0) {" +
      "    powerfactor = 0.0;" +
      "  }" +
      "  else{" +
      "    powerfactor = pow( nDotHV, shininess );" +
      "  }" +

      "  spec += specular * powerfactor * attenuation;" +
      "  col += light.color * nDotVP * attenuation;" +
      "}" +

      /*
      */
      "void SpotLight( inout vec3 col, inout vec3 spec, in vec3 vertNormal, in vec3 ecPos, in Light light ) {" +
      "  float spotAttenuation;" +
      "  float powerfactor;" +

      // calculate the vector from the current vertex to the light.
      "  vec3 VP = light.position - ecPos; " +
      "  vec3 ldir = normalize( -light.direction );" +

      // get the distance from the spotlight and the vertex
      "  float d = length( VP );" +
      "  VP = normalize( VP );" +

      "  float attenuation = 1.0 / ( falloff[0] + ( falloff[1] * d ) + ( falloff[2] * d * d ) );" +

      // dot product of the vector from vertex to light and light direction.
      "  float spotDot = dot( VP, ldir );" +

      // if the vertex falls inside the cone
      (webglMaxTempsWorkaround ? // Windows reports max temps error if light.angle is used
      "  spotAttenuation = 1.0; " :
      "  if( spotDot > cos( light.angle ) ) {" +
      "    spotAttenuation = pow( spotDot, light.concentration );" +
      "  }" +
      "  else{" +
      "    spotAttenuation = 0.0;" +
      "  }" +
      "  attenuation *= spotAttenuation;" +
      "") +

      "  float nDotVP = max( 0.0, dot( vertNormal, VP ));" +
      "  vec3 halfVector = normalize( VP - normalize(ecPos) );" +
      "  float nDotHV = max( 0.0, dot( vertNormal, halfVector ));" +

      "  if( nDotVP == 0.0 ) {" +
      "    powerfactor = 0.0;" +
      "  }" +
      "  else {" +
      "    powerfactor = pow( nDotHV, shininess );" +
      "  }" +

      "  spec += specular * powerfactor * attenuation;" +
      "  col += light.color * nDotVP * attenuation;" +
      "}" +

      "void main(void) {" +
      "  vec3 finalAmbient = vec3( 0.0, 0.0, 0.0 );" +
      "  vec3 finalDiffuse = vec3( 0.0, 0.0, 0.0 );" +
      "  vec3 finalSpecular = vec3( 0.0, 0.0, 0.0 );" +

      "  vec4 col = color;" +

      "  if(color[0] == -1.0){" +
      "    col = aColor;" +
      "  }" +

      // We use the sphere vertices as the normals when we create the sphere buffer.
      // But this only works if the sphere vertices are unit length, so we
      // have to normalize the normals here. Since this is only required for spheres
      // we could consider placing this in a conditional later on.
      "  vec3 norm = normalize(vec3( normalTransform * vec4( Normal, 0.0 ) ));" +

      "  vec4 ecPos4 = view * model * vec4(Vertex,1.0);" +
      "  vec3 ecPos = (vec3(ecPos4))/ecPos4.w;" +

      // If there were no lights this draw call, just use the
      // assigned fill color of the shape and the specular value
      "  if( lightCount == 0 ) {" +
      "    frontColor = col + vec4(mat_specular,1.0);" +
      "  }" +
      "  else {" +
           // WebGL forces us to iterate over a constant value
           // so we can't iterate using lightCount
      "    for( int i = 0; i < 8; i++ ) {" +
      "      Light l = getLight(i);" +

      // We can stop iterating if we know we have gone past
      // the number of lights which are on
      "      if( i >= lightCount ){" +
      "        break;" +
      "      }" +

      "      if( l.type == 0 ) {" +
      "        AmbientLight( finalAmbient, ecPos, l );" +
      "      }" +
      "      else if( l.type == 1 ) {" +
      "        DirectionalLight( finalDiffuse, finalSpecular, norm, ecPos, l );" +
      "      }" +
      "      else if( l.type == 2 ) {" +
      "        PointLight( finalDiffuse, finalSpecular, norm, ecPos, l );" +
      "      }" +
      "      else {" +
      "        SpotLight( finalDiffuse, finalSpecular, norm, ecPos, l );" +
      "      }" +
      "    }" +

      "   if( usingMat == false ) {" +
      "     frontColor = vec4(" +
      "       vec3(col) * finalAmbient +" +
      "       vec3(col) * finalDiffuse +" +
      "       vec3(col) * finalSpecular," +
      "       col[3] );" +
      "   }" +
      "   else{" +
      "     frontColor = vec4( " +
      "       mat_emissive + " +
      "       (vec3(col) * mat_ambient * finalAmbient) + " +
      "       (vec3(col) * finalDiffuse) + " +
      "       (mat_specular * finalSpecular), " +
      "       col[3] );" +
      "    }" +
      "  }" +

      "  vTexture.xy = aTexture.xy;" +
      "  gl_Position = projection * view * model * vec4( Vertex, 1.0 );" +
      "}";

    var fragmentShaderSource3D =
      "#ifdef GL_ES\n" +
      "precision highp float;\n" +
      "#endif\n" +

      "varying vec4 frontColor;" +

      "uniform sampler2D sampler;" +
      "uniform bool usingTexture;" +
      "varying vec2 vTexture;" +

      // In Processing, when a texture is used, the fill color is ignored
      "void main(void){" +
      "  if(usingTexture){" +
      "    gl_FragColor =  vec4(texture2D(sampler, vTexture.xy));" +
      "  }"+
      "  else{" +
      "    gl_FragColor = frontColor;" +
      "  }" +
      "}";

    ////////////////////////////////////////////////////////////////////////////
    // 3D Functions
    ////////////////////////////////////////////////////////////////////////////

    /*
     * Sets a uniform variable in a program object to a particular
     * value. Before calling this function, ensure the correct
     * program object has been installed as part of the current
     * rendering state by calling useProgram.
     *
     * On some systems, if the variable exists in the shader but isn't used,
     * the compiler will optimize it out and this function will fail.
     *
     * @param {WebGLProgram} programObj program object returned from
     * createProgramObject
     * @param {String} varName the name of the variable in the shader
     * @param {float | Array} varValue either a scalar value or an Array
     *
     * @returns none
     *
     * @see uniformi
     * @see uniformMatrix
    */
    function uniformf(cacheId, programObj, varName, varValue) {
      var varLocation = curContextCache.locations[cacheId];
      if(varLocation === undef) {
        varLocation = curContext.getUniformLocation(programObj, varName);
        curContextCache.locations[cacheId] = varLocation;
      }
      // the variable won't be found if it was optimized out.
      if (varLocation !== -1) {
        if (varValue.length === 4) {
          curContext.uniform4fv(varLocation, varValue);
        } else if (varValue.length === 3) {
          curContext.uniform3fv(varLocation, varValue);
        } else if (varValue.length === 2) {
          curContext.uniform2fv(varLocation, varValue);
        } else {
          curContext.uniform1f(varLocation, varValue);
        }
      }
    }

    /**
     * Sets a uniform int or int array in a program object to a particular
     * value. Before calling this function, ensure the correct
     * program object has been installed as part of the current
     * rendering state.
     *
     * On some systems, if the variable exists in the shader but isn't used,
     * the compiler will optimize it out and this function will fail.
     *
     * @param {WebGLProgram} programObj program object returned from
     * createProgramObject
     * @param {String} varName the name of the variable in the shader
     * @param {int | Array} varValue either a scalar value or an Array
     *
     * @returns none
     *
     * @see uniformf
     * @see uniformMatrix
    */
    function uniformi(cacheId, programObj, varName, varValue) {
      var varLocation = curContextCache.locations[cacheId];
      if(varLocation === undef) {
        varLocation = curContext.getUniformLocation(programObj, varName);
        curContextCache.locations[cacheId] = varLocation;
      }
      // the variable won't be found if it was optimized out.
      if (varLocation !== -1) {
        if (varValue.length === 4) {
          curContext.uniform4iv(varLocation, varValue);
        } else if (varValue.length === 3) {
          curContext.uniform3iv(varLocation, varValue);
        } else if (varValue.length === 2) {
          curContext.uniform2iv(varLocation, varValue);
        } else {
          curContext.uniform1i(varLocation, varValue);
        }
      }
    }

    /**
     * Binds the VBO, sets the vertex attribute data for the program
     * object and enables the attribute.
     *
     * On some systems, if the attribute exists in the shader but
     * isn't used, the compiler will optimize it out and this
     * function will fail.
     *
     * @param {WebGLProgram} programObj program object returned from
     * createProgramObject
     * @param {String} varName the name of the variable in the shader
     * @param {int} size the number of components per vertex attribute
     * @param {WebGLBuffer} VBO Vertex Buffer Object
     *
     * @returns none
     *
     * @see disableVertexAttribPointer
    */
    function vertexAttribPointer(cacheId, programObj, varName, size, VBO) {
      var varLocation = curContextCache.attributes[cacheId];
      if(varLocation === undef) {
        varLocation = curContext.getAttribLocation(programObj, varName);
        curContextCache.attributes[cacheId] = varLocation;
      }
      if (varLocation !== -1) {
        curContext.bindBuffer(curContext.ARRAY_BUFFER, VBO);
        curContext.vertexAttribPointer(varLocation, size, curContext.FLOAT, false, 0, 0);
        curContext.enableVertexAttribArray(varLocation);
      }
    }

    /**
     * Disables a program object attribute from being sent to WebGL.
     *
     * @param {WebGLProgram} programObj program object returned from
     * createProgramObject
     * @param {String} varName name of the attribute
     *
     * @returns none
     *
     * @see vertexAttribPointer
    */
    function disableVertexAttribPointer(cacheId, programObj, varName){
      var varLocation = curContextCache.attributes[cacheId];
      if(varLocation === undef) {
        varLocation = curContext.getAttribLocation(programObj, varName);
        curContextCache.attributes[cacheId] = varLocation;
      }
      if (varLocation !== -1) {
        curContext.disableVertexAttribArray(varLocation);
      }
    }

    /**
     * Sets the value of a uniform matrix variable in a program
     * object. Before calling this function, ensure the correct
     * program object has been installed as part of the current
     * rendering state.
     *
     * On some systems, if the variable exists in the shader but
     * isn't used, the compiler will optimize it out and this
     * function will fail.
     *
     * @param {WebGLProgram} programObj program object returned from
     * createProgramObject
     * @param {String} varName the name of the variable in the shader
     * @param {boolean} transpose must be false
     * @param {Array} matrix an array of 4, 9 or 16 values
     *
     * @returns none
     *
     * @see uniformi
     * @see uniformf
    */
    function uniformMatrix(cacheId, programObj, varName, transpose, matrix) {
      var varLocation = curContextCache.locations[cacheId];
      if(varLocation === undef) {
        varLocation = curContext.getUniformLocation(programObj, varName);
        curContextCache.locations[cacheId] = varLocation;
      }
      // the variable won't be found if it was optimized out.
      if (varLocation !== -1) {
        if (matrix.length === 16) {
          curContext.uniformMatrix4fv(varLocation, transpose, matrix);
        } else if (matrix.length === 9) {
          curContext.uniformMatrix3fv(varLocation, transpose, matrix);
        } else {
          curContext.uniformMatrix2fv(varLocation, transpose, matrix);
        }
      }
    }

    var imageModeCorner = function(x, y, w, h, whAreSizes) {
      return {
        x: x,
        y: y,
        w: w,
        h: h
      };
    };
    var imageModeConvert = imageModeCorner;

    var imageModeCorners = function(x, y, w, h, whAreSizes) {
      return {
        x: x,
        y: y,
        w: whAreSizes ? w : w - x,
        h: whAreSizes ? h : h - y
      };
    };

    var imageModeCenter = function(x, y, w, h, whAreSizes) {
      return {
        x: x - w / 2,
        y: y - h / 2,
        w: w,
        h: h
      };
    };

    /**
     * Creates a WebGL program object.
     *
     * @param {String} vetexShaderSource
     * @param {String} fragmentShaderSource
     *
     * @returns {WebGLProgram} A program object
    */
    var createProgramObject = function(curContext, vetexShaderSource, fragmentShaderSource) {
      var vertexShaderObject = curContext.createShader(curContext.VERTEX_SHADER);
      curContext.shaderSource(vertexShaderObject, vetexShaderSource);
      curContext.compileShader(vertexShaderObject);
      if (!curContext.getShaderParameter(vertexShaderObject, curContext.COMPILE_STATUS)) {
        throw curContext.getShaderInfoLog(vertexShaderObject);
      }

      var fragmentShaderObject = curContext.createShader(curContext.FRAGMENT_SHADER);
      curContext.shaderSource(fragmentShaderObject, fragmentShaderSource);
      curContext.compileShader(fragmentShaderObject);
      if (!curContext.getShaderParameter(fragmentShaderObject, curContext.COMPILE_STATUS)) {
        throw curContext.getShaderInfoLog(fragmentShaderObject);
      }

      var programObject = curContext.createProgram();
      curContext.attachShader(programObject, vertexShaderObject);
      curContext.attachShader(programObject, fragmentShaderObject);
      curContext.linkProgram(programObject);
      if (!curContext.getProgramParameter(programObject, curContext.LINK_STATUS)) {
        throw "Error linking shaders.";
      }

      return programObject;
    };

    ////////////////////////////////////////////////////////////////////////////
    // 2D/3D drawing handling
    ////////////////////////////////////////////////////////////////////////////
    // Objects for shared, 2D and 3D contexts
    var DrawingShared = function() {};
    var Drawing2D = function() {};
    var Drawing3D = function() {};
    var DrawingPre = function() {};

    // Setup the prototype chain
    Drawing2D.prototype = new DrawingShared();
    Drawing2D.prototype.constructor = Drawing2D;
    Drawing3D.prototype = new DrawingShared();
    Drawing3D.prototype.constructor = Drawing3D;
    DrawingPre.prototype = new DrawingShared();
    DrawingPre.prototype.constructor = DrawingPre;

    // A no-op function for when the user calls 3D functions from a 2D sketch
    // We can change this to a throw or console.error() later if we want
    DrawingShared.prototype.a3DOnlyFunction = function(){};

    ////////////////////////////////////////////////////////////////////////////
    // Char handling
    ////////////////////////////////////////////////////////////////////////////
    var charMap = {};

    var Char = p.Character = function(chr) {
      if (typeof chr === 'string' && chr.length === 1) {
        this.code = chr.charCodeAt(0);
      } else if (typeof chr === 'number') {
        this.code = chr;
      } else if (chr instanceof Char) {
        this.code = chr;
      } else {
        this.code = NaN;
      }

      return (charMap[this.code] === undef) ? charMap[this.code] = this : charMap[this.code];
    };

    Char.prototype.toString = function() {
      return String.fromCharCode(this.code);
    };

    Char.prototype.valueOf = function() {
      return this.code;
    };

    /**
     * Datatype for storing shapes. Processing can currently load and display SVG (Scalable Vector Graphics) shapes.
     * Before a shape is used, it must be loaded with the <b>loadShape()</b> function. The <b>shape()</b> function is used to draw the shape to the display window.
     * The <b>PShape</b> object contain a group of methods, linked below, that can operate on the shape data.
     * <br><br>The <b>loadShape()</b> method supports SVG files created with Inkscape and Adobe Illustrator.
     * It is not a full SVG implementation, but offers some straightforward support for handling vector data.
     *
     * @param {int} family the shape type, one of GROUP, PRIMITIVE, PATH, or GEOMETRY
     *
     * @see #shape()
     * @see #loadShape()
     * @see #shapeMode()
     */
    var PShape = p.PShape = function(family) {
      this.family    = family || PConstants.GROUP;
      this.visible   = true;
      this.style     = true;
      this.children  = [];
      this.nameTable = [];
      this.params    = [];
      this.name      = "";
      this.image     = null;  //type PImage
      this.matrix    = null;
      this.kind      = null;
      this.close     = null;
      this.width     = null;
      this.height    = null;
      this.parent    = null;
    };
    /**
      * PShape methods
      * missing: findChild(), apply(), contains(), findChild(), getPrimitive(), getParams(), getVertex() , getVertexCount(),
      * getVertexCode() , getVertexCodes() , getVertexCodeCount(), getVertexX(), getVertexY(), getVertexZ()
      */
    PShape.prototype = {
      /**
       * @member PShape
       * The isVisible() function returns a boolean value "true" if the image is set to be visible, "false" if not. This is modified with the <b>setVisible()</b> parameter.
       * <br><br>The visibility of a shape is usually controlled by whatever program created the SVG file.
       * For instance, this parameter is controlled by showing or hiding the shape in the layers palette in Adobe Illustrator.
       *
       * @return {boolean}  returns "true" if the image is set to be visible, "false" if not
       */
      isVisible: function(){
        return this.visible;
      },
      /**
       * @member PShape
       * The setVisible() function sets the shape to be visible or invisible. This is determined by the value of the <b>visible</b> parameter.
       * <br><br>The visibility of a shape is usually controlled by whatever program created the SVG file.
       * For instance, this parameter is controlled by showing or hiding the shape in the layers palette in Adobe Illustrator.
       *
       * @param {boolean} visible "false" makes the shape invisible and "true" makes it visible
       */
      setVisible: function (visible){
        this.visible = visible;
      },
      /**
       * @member PShape
       * The disableStyle() function disables the shape's style data and uses Processing's current styles. Styles include attributes such as colors, stroke weight, and stroke joints.
       * Overrides this shape's style information and uses PGraphics styles and colors. Identical to ignoreStyles(true). Also disables styles for all child shapes.
       */
      disableStyle: function(){
        this.style = false;
        for(var i = 0, j=this.children.length; i<j; i++) {
          this.children[i].disableStyle();
        }
      },
      /**
       * @member PShape
       * The enableStyle() function enables the shape's style data and ignores Processing's current styles. Styles include attributes such as colors, stroke weight, and stroke joints.
       */
      enableStyle: function(){
        this.style = true;
        for(var i = 0, j=this.children.length; i<j; i++) {
          this.children[i].enableStyle();
        }
      },
      /**
       * @member PShape
       * The getFamily function returns the shape type
       *
       * @return {int} the shape type, one of GROUP, PRIMITIVE, PATH, or GEOMETRY
       */
      getFamily: function(){
        return this.family;
      },
      /**
       * @member PShape
       * The getWidth() function gets the width of the drawing area (not necessarily the shape boundary).
       */
      getWidth: function(){
        return this.width;
      },
      /**
       * @member PShape
       * The getHeight() function gets the height of the drawing area (not necessarily the shape boundary).
       */
      getHeight: function(){
        return this.height;
      },
      /**
       * @member PShape
       * The setName() function sets the name of the shape
       *
       * @param {String} name the name of the shape
       */
      setName: function(name){
        this.name = name;
      },
      /**
       * @member PShape
       * The getName() function returns the name of the shape
       *
       * @return {String} the name of the shape
       */
      getName: function(){
        return this.name;
      },
      /**
       * @member PShape
       * Called by the following (the shape() command adds the g)
       * PShape s = loadShapes("blah.svg");
       * shape(s);
       */
      draw: function(){
        if (this.visible) {
          this.pre();
          this.drawImpl();
          this.post();
        }
      },
      /**
       * @member PShape
       * the drawImpl() function draws the SVG document.
       */
      drawImpl: function(){
        if (this.family === PConstants.GROUP) {
          this.drawGroup();
        } else if (this.family === PConstants.PRIMITIVE) {
          this.drawPrimitive();
        } else if (this.family === PConstants.GEOMETRY) {
          this.drawGeometry();
        } else if (this.family === PConstants.PATH) {
          this.drawPath();
        }
      },
      /**
       * @member PShape
       * The drawPath() function draws the <path> part of the SVG document.
       */
      drawPath: function(){
        var i, j;
        if (this.vertices.length === 0) { return; }
        p.beginShape();
        if (this.vertexCodes.length === 0) {  // each point is a simple vertex
          if (this.vertices[0].length === 2) {  // drawing 2D vertices
            for (i = 0, j = this.vertices.length; i < j; i++) {
              p.vertex(this.vertices[i][0], this.vertices[i][1]);
            }
          } else {  // drawing 3D vertices
            for (i = 0, j = this.vertices.length; i < j; i++) {
              p.vertex(this.vertices[i][0],
                       this.vertices[i][1],
                       this.vertices[i][2]);
            }
          }
        } else {  // coded set of vertices
          var index = 0;
          if (this.vertices[0].length === 2) {  // drawing a 2D path
            for (i = 0, j = this.vertexCodes.length; i < j; i++) {
              if (this.vertexCodes[i] === PConstants.VERTEX) {
                p.vertex(this.vertices[index][0], this.vertices[index][1]);
                if ( this.vertices[index]["moveTo"] === true) {
                  vertArray[vertArray.length-1]["moveTo"] = true;
                } else if ( this.vertices[index]["moveTo"] === false) {
                  vertArray[vertArray.length-1]["moveTo"] = false;
                }
                p.breakShape = false;
                index++;
              } else if (this.vertexCodes[i] === PConstants.BEZIER_VERTEX) {
                p.bezierVertex(this.vertices[index+0][0],
                               this.vertices[index+0][1],
                               this.vertices[index+1][0],
                               this.vertices[index+1][1],
                               this.vertices[index+2][0],
                               this.vertices[index+2][1]);
                index += 3;
              } else if (this.vertexCodes[i] === PConstants.CURVE_VERTEX) {
                p.curveVertex(this.vertices[index][0],
                              this.vertices[index][1]);
                index++;
              } else if (this.vertexCodes[i] ===  PConstants.BREAK) {
                p.breakShape = true;
              }
            }
          } else {  // drawing a 3D path
            for (i = 0, j = this.vertexCodes.length; i < j; i++) {
              if (this.vertexCodes[i] === PConstants.VERTEX) {
                p.vertex(this.vertices[index][0],
                         this.vertices[index][1],
                         this.vertices[index][2]);
                if (this.vertices[index]["moveTo"] === true) {
                  vertArray[vertArray.length-1]["moveTo"] = true;
                } else if (this.vertices[index]["moveTo"] === false) {
                  vertArray[vertArray.length-1]["moveTo"] = false;
                }
                p.breakShape = false;
              } else if (this.vertexCodes[i] ===  PConstants.BEZIER_VERTEX) {
                p.bezierVertex(this.vertices[index+0][0],
                               this.vertices[index+0][1],
                               this.vertices[index+0][2],
                               this.vertices[index+1][0],
                               this.vertices[index+1][1],
                               this.vertices[index+1][2],
                               this.vertices[index+2][0],
                               this.vertices[index+2][1],
                               this.vertices[index+2][2]);
                index += 3;
              } else if (this.vertexCodes[i] === PConstants.CURVE_VERTEX) {
                p.curveVertex(this.vertices[index][0],
                              this.vertices[index][1],
                              this.vertices[index][2]);
                index++;
              } else if (this.vertexCodes[i] === PConstants.BREAK) {
                p.breakShape = true;
              }
            }
          }
        }
        p.endShape(this.close ? PConstants.CLOSE : PConstants.OPEN);
      },
      /**
       * @member PShape
       * The drawGeometry() function draws the geometry part of the SVG document.
       */
      drawGeometry: function() {
        var i, j;
        p.beginShape(this.kind);
        if (this.style) {
          for (i = 0, j = this.vertices.length; i < j; i++) {
            p.vertex(this.vertices[i]);
          }
        } else {
          for (i = 0, j = this.vertices.length; i < j; i++) {
            var vert = this.vertices[i];
            if (vert[2] === 0) {
              p.vertex(vert[0], vert[1]);
            } else {
              p.vertex(vert[0], vert[1], vert[2]);
            }
          }
        }
        p.endShape();
      },
      /**
       * @member PShape
       * The drawGroup() function draws the <g> part of the SVG document.
       */
      drawGroup: function() {
        for (var i = 0, j = this.children.length; i < j; i++) {
          this.children[i].draw();
        }
      },
      /**
       * @member PShape
       * The drawPrimitive() function draws SVG document shape elements. These can be point, line, triangle, quad, rect, ellipse, arc, box, or sphere.
       */
      drawPrimitive: function() {
        if (this.kind === PConstants.POINT) {
          p.point(this.params[0], this.params[1]);
        } else if (this.kind === PConstants.LINE) {
          if (this.params.length === 4) {  // 2D
            p.line(this.params[0], this.params[1],
                   this.params[2], this.params[3]);
          } else {  // 3D
            p.line(this.params[0], this.params[1], this.params[2],
                   this.params[3], this.params[4], this.params[5]);
          }
        } else if (this.kind === PConstants.TRIANGLE) {
          p.triangle(this.params[0], this.params[1],
                     this.params[2], this.params[3],
                     this.params[4], this.params[5]);
        } else if (this.kind === PConstants.QUAD) {
          p.quad(this.params[0], this.params[1],
                 this.params[2], this.params[3],
                 this.params[4], this.params[5],
                 this.params[6], this.params[7]);
        } else if (this.kind === PConstants.RECT) {
          if (this.image !== null) {
            p.imageMode(PConstants.CORNER);
            p.image(this.image,
                    this.params[0],
                    this.params[1],
                    this.params[2],
                    this.params[3]);
          } else {
            p.rectMode(PConstants.CORNER);
            p.rect(this.params[0],
                   this.params[1],
                   this.params[2],
                   this.params[3]);
          }
        } else if (this.kind === PConstants.ELLIPSE) {
          p.ellipseMode(PConstants.CORNER);
          p.ellipse(this.params[0],
                    this.params[1],
                    this.params[2],
                    this.params[3]);
        } else if (this.kind === PConstants.ARC) {
          p.ellipseMode(PConstants.CORNER);
          p.arc(this.params[0],
                this.params[1],
                this.params[2],
                this.params[3],
                this.params[4],
                this.params[5]);
        } else if (this.kind === PConstants.BOX) {
          if (this.params.length === 1) {
            p.box(this.params[0]);
          } else {
            p.box(this.params[0], this.params[1], this.params[2]);
          }
        } else if (this.kind === PConstants.SPHERE) {
          p.sphere(this.params[0]);
        }
      },
      /**
       * @member PShape
       * The pre() function performs the preparations before the SVG is drawn. This includes doing transformations and storing previous styles.
       */
      pre: function() {
        if (this.matrix) {
          p.pushMatrix();
          curContext.transform(this.matrix.elements[0],
                               this.matrix.elements[3],
                               this.matrix.elements[1],
                               this.matrix.elements[4],
                               this.matrix.elements[2],
                               this.matrix.elements[5]);
          //p.applyMatrix(this.matrix.elements[0],this.matrix.elements[0]);
        }
        if (this.style) {
          p.pushStyle();
          this.styles();
        }
      },
      /**
       * @member PShape
       * The post() function performs the necessary actions after the SVG is drawn. This includes removing transformations and removing added styles.
       */
      post: function() {
        if (this.matrix) {
          p.popMatrix();
        }
        if (this.style) {
          p.popStyle();
        }
      },
      /**
       * @member PShape
       * The styles() function changes the Processing's current styles
       */
      styles: function() {
        if (this.stroke) {
          p.stroke(this.strokeColor);
          p.strokeWeight(this.strokeWeight);
          p.strokeCap(this.strokeCap);
          p.strokeJoin(this.strokeJoin);
        } else {
          p.noStroke();
        }

        if (this.fill) {
          p.fill(this.fillColor);

        } else {
          p.noFill();
        }
      },
      /**
       * @member PShape
       * The getChild() function extracts a child shape from a parent shape. Specify the name of the shape with the <b>target</b> parameter or the
       * layer position of the shape to get with the <b>index</b> parameter.
       * The shape is returned as a <b>PShape</b> object, or <b>null</b> is returned if there is an error.
       *
       * @param {String} target   the name of the shape to get
       * @param {int} index   the layer position of the shape to get
       *
       * @return {PShape} returns a child element of a shape as a PShape object or null if there is an error
       */
      getChild: function(child) {
        var i, j;
        if (typeof child === 'number') {
          return this.children[child];
        } else {
          var found;
          if(child === "" || this.name === child){
            return this;
          } else {
            if(this.nameTable.length > 0) {
              for(i = 0, j = this.nameTable.length; i < j || found; i++) {
                if(this.nameTable[i].getName === child) {
                  found = this.nameTable[i];
                }
              }
              if (found) { return found; }
            }
            for(i = 0, j = this.children.length; i < j; i++) {
              found = this.children[i].getChild(child);
              if(found) { return found; }
            }
          }
          return null;
        }
      },
      /**
       * @member PShape
       * The getChildCount() returns the number of children
       *
       * @return {int} returns a count of children
       */
      getChildCount: function () {
        return this.children.length;
      },
      /**
       * @member PShape
       * The addChild() adds a child to the PShape.
       *
       * @param {PShape} child the child to add
       */
      addChild: function( child ) {
        this.children.push(child);
        child.parent = this;
        if (child.getName() !== null) {
          this.addName(child.getName(), child);
        }
      },
      /**
       * @member PShape
       * The addName() functions adds a shape to the name lookup table.
       *
       * @param {String} name   the name to be added
       * @param {PShape} shape  the shape
       */
      addName: function(name,  shape) {
        if (this.parent !== null) {
          this.parent.addName( name, shape );
        } else {
          this.nameTable.push( [name, shape] );
        }
      },
      /**
       * @member PShape
       * The translate() function specifies an amount to displace the shape. The <b>x</b> parameter specifies left/right translation, the <b>y</b> parameter specifies up/down translation, and the <b>z</b> parameter specifies translations toward/away from the screen.
       * Subsequent calls to the method accumulates the effect. For example, calling <b>translate(50, 0)</b> and then <b>translate(20, 0)</b> is the same as <b>translate(70, 0)</b>.
       * This transformation is applied directly to the shape, it's not refreshed each time <b>draw()</b> is run.
       * <br><br>Using this method with the <b>z</b> parameter requires using the P3D or OPENGL parameter in combination with size.
       *
       * @param {int|float} x left/right translation
       * @param {int|float} y up/down translation
       * @param {int|float} z forward/back translation
       *
       * @see PMatrix2D#translate
       * @see PMatrix3D#translate
       */
      translate: function() {
        if(arguments.length === 2)
        {
          this.checkMatrix(2);
          this.matrix.translate(arguments[0], arguments[1]);
        } else {
          this.checkMatrix(3);
          this.matrix.translate(arguments[0], arguments[1], 0);
        }
      },
      /**
       * @member PShape
       * The checkMatrix() function makes sure that the shape's matrix is 1) not null, and 2) has a matrix
       * that can handle <em>at least</em> the specified number of dimensions.
       *
       * @param {int} dimensions the specified number of dimensions
       */
      checkMatrix: function(dimensions) {
        if(this.matrix === null) {
          if(dimensions === 2) {
            this.matrix = new p.PMatrix2D();
          } else {
            this.matrix = new p.PMatrix3D();
          }
        }else if(dimensions === 3 && this.matrix instanceof p.PMatrix2D) {
          this.matrix = new p.PMatrix3D();
        }
      },
      /**
       * @member PShape
       * The rotateX() function rotates a shape around the x-axis the amount specified by the <b>angle</b> parameter. Angles should be specified in radians (values from 0 to TWO_PI) or converted to radians with the <b>radians()</b> method.
       * <br><br>Shapes are always rotated around the upper-left corner of their bounding box. Positive numbers rotate objects in a clockwise direction.
       * Subsequent calls to the method accumulates the effect. For example, calling <b>rotateX(HALF_PI)</b> and then <b>rotateX(HALF_PI)</b> is the same as <b>rotateX(PI)</b>.
       * This transformation is applied directly to the shape, it's not refreshed each time <b>draw()</b> is run.
       * <br><br>This method requires a 3D renderer. You need to pass P3D or OPENGL as a third parameter into the <b>size()</b> method as shown in the example above.
       *
       * @param {float}angle angle of rotation specified in radians
       *
       * @see PMatrix3D#rotateX
       */
      rotateX: function(angle) {
        this.rotate(angle, 1, 0, 0);
      },
      /**
       * @member PShape
       * The rotateY() function rotates a shape around the y-axis the amount specified by the <b>angle</b> parameter. Angles should be specified in radians (values from 0 to TWO_PI) or converted to radians with the <b>radians()</b> method.
       * <br><br>Shapes are always rotated around the upper-left corner of their bounding box. Positive numbers rotate objects in a clockwise direction.
       * Subsequent calls to the method accumulates the effect. For example, calling <b>rotateY(HALF_PI)</b> and then <b>rotateY(HALF_PI)</b> is the same as <b>rotateY(PI)</b>.
       * This transformation is applied directly to the shape, it's not refreshed each time <b>draw()</b> is run.
       * <br><br>This method requires a 3D renderer. You need to pass P3D or OPENGL as a third parameter into the <b>size()</b> method as shown in the example above.
       *
       * @param {float}angle angle of rotation specified in radians
       *
       * @see PMatrix3D#rotateY
       */
      rotateY: function(angle) {
        this.rotate(angle, 0, 1, 0);
      },
      /**
       * @member PShape
       * The rotateZ() function rotates a shape around the z-axis the amount specified by the <b>angle</b> parameter. Angles should be specified in radians (values from 0 to TWO_PI) or converted to radians with the <b>radians()</b> method.
       * <br><br>Shapes are always rotated around the upper-left corner of their bounding box. Positive numbers rotate objects in a clockwise direction.
       * Subsequent calls to the method accumulates the effect. For example, calling <b>rotateZ(HALF_PI)</b> and then <b>rotateZ(HALF_PI)</b> is the same as <b>rotateZ(PI)</b>.
       * This transformation is applied directly to the shape, it's not refreshed each time <b>draw()</b> is run.
       * <br><br>This method requires a 3D renderer. You need to pass P3D or OPENGL as a third parameter into the <b>size()</b> method as shown in the example above.
       *
       * @param {float}angle angle of rotation specified in radians
       *
       * @see PMatrix3D#rotateZ
       */
      rotateZ: function(angle) {
        this.rotate(angle, 0, 0, 1);
      },
      /**
       * @member PShape
       * The rotate() function rotates a shape the amount specified by the <b>angle</b> parameter. Angles should be specified in radians (values from 0 to TWO_PI) or converted to radians with the <b>radians()</b> method.
       * <br><br>Shapes are always rotated around the upper-left corner of their bounding box. Positive numbers rotate objects in a clockwise direction.
       * Transformations apply to everything that happens after and subsequent calls to the method accumulates the effect.
       * For example, calling <b>rotate(HALF_PI)</b> and then <b>rotate(HALF_PI)</b> is the same as <b>rotate(PI)</b>.
       * This transformation is applied directly to the shape, it's not refreshed each time <b>draw()</b> is run.
       * If optional parameters x,y,z are supplied, the rotate is about the point (x, y, z).
       *
       * @param {float}angle  angle of rotation specified in radians
       * @param {float}x      x-coordinate of the point
       * @param {float}y      y-coordinate of the point
       * @param {float}z      z-coordinate of the point
       * @see PMatrix2D#rotate
       * @see PMatrix3D#rotate
       */
      rotate: function() {
        if(arguments.length === 1){
          this.checkMatrix(2);
          this.matrix.rotate(arguments[0]);
        } else {
          this.checkMatrix(3);
          this.matrix.rotate(arguments[0],
                             arguments[1],
                             arguments[2],
                             arguments[3]);
        }
      },
      /**
       * @member PShape
       * The scale() function increases or decreases the size of a shape by expanding and contracting vertices. Shapes always scale from the relative origin of their bounding box.
       * Scale values are specified as decimal percentages. For example, the method call <b>scale(2.0)</b> increases the dimension of a shape by 200%.
       * Subsequent calls to the method multiply the effect. For example, calling <b>scale(2.0)</b> and then <b>scale(1.5)</b> is the same as <b>scale(3.0)</b>.
       * This transformation is applied directly to the shape, it's not refreshed each time <b>draw()</b> is run.
       * <br><br>Using this fuction with the <b>z</b> parameter requires passing P3D or OPENGL into the size() parameter.
       *
       * @param {float}s      percentage to scale the object
       * @param {float}x      percentage to scale the object in the x-axis
       * @param {float}y      percentage to scale the object in the y-axis
       * @param {float}z      percentage to scale the object in the z-axis
       *
       * @see PMatrix2D#scale
       * @see PMatrix3D#scale
       */
      scale: function() {
        if(arguments.length === 2) {
          this.checkMatrix(2);
          this.matrix.scale(arguments[0], arguments[1]);
        } else if (arguments.length === 3) {
          this.checkMatrix(2);
          this.matrix.scale(arguments[0], arguments[1], arguments[2]);
        } else {
          this.checkMatrix(2);
          this.matrix.scale(arguments[0]);
        }
      },
      /**
       * @member PShape
       * The resetMatrix() function resets the matrix
       *
       * @see PMatrix2D#reset
       * @see PMatrix3D#reset
       */
      resetMatrix: function() {
        this.checkMatrix(2);
        this.matrix.reset();
      },
      /**
       * @member PShape
       * The applyMatrix() function multiplies this matrix by another matrix of type PMatrix3D or PMatrix2D.
       * Individual elements can also be provided
       *
       * @param {PMatrix3D|PMatrix2D} matrix   the matrix to multiply by
       *
       * @see PMatrix2D#apply
       * @see PMatrix3D#apply
       */
      applyMatrix: function(matrix) {
        if (arguments.length === 1) {
          this.applyMatrix(matrix.elements[0],
                           matrix.elements[1], 0,
                           matrix.elements[2],
                           matrix.elements[3],
                           matrix.elements[4], 0,
                           matrix.elements[5],
                           0, 0, 1, 0,
                           0, 0, 0, 1);
        } else if (arguments.length === 6) {
          this.checkMatrix(2);
          this.matrix.apply(arguments[0], arguments[1], arguments[2], 0,
                            arguments[3], arguments[4], arguments[5], 0,
                            0,   0,   1,   0,
                            0,   0,   0,   1);

        } else if (arguments.length === 16) {
          this.checkMatrix(3);
          this.matrix.apply(arguments[0],
                            arguments[1],
                            arguments[2],
                            arguments[3],
                            arguments[4],
                            arguments[5],
                            arguments[6],
                            arguments[7],
                            arguments[8],
                            arguments[9],
                            arguments[10],
                            arguments[11],
                            arguments[12],
                            arguments[13],
                            arguments[14],
                            arguments[15]);
        }
      }
    };

    /**
     * SVG stands for Scalable Vector Graphics, a portable graphics format. It is
     * a vector format so it allows for infinite resolution and relatively small
     * file sizes. Most modern media software can view SVG files, including Adobe
     * products, Firefox, etc. Illustrator and Inkscape can edit SVG files.
     *
     * @param {PApplet} parent     typically use "this"
     * @param {String} filename    name of the SVG file to load
     * @param {XMLElement} xml     an XMLElement element
     * @param {PShapeSVG} parent   the parent PShapeSVG
     *
     * @see PShape
     */
    var PShapeSVG = p.PShapeSVG = function() {
      p.PShape.call( this ); // PShape is the base class.
      if (arguments.length === 1) { //xml element coming in
        this.element  = arguments[0] ;//new p.XMLElement(null, arguments[0]);
        // set values to their defaults according to the SVG spec
        this.vertexCodes         = [];
        this.vertices            = [];
        this.opacity             = 1;

        this.stroke              = false;
        this.strokeColor         = PConstants.ALPHA_MASK;
        this.strokeWeight        = 1;
        this.strokeCap           = PConstants.SQUARE;  // BUTT in svg spec
        this.strokeJoin          = PConstants.MITER;
        this.strokeGradient      = null;
        this.strokeGradientPaint = null;
        this.strokeName          = null;
        this.strokeOpacity       = 1;

        this.fill                = true;
        this.fillColor           = PConstants.ALPHA_MASK;
        this.fillGradient        = null;
        this.fillGradientPaint   = null;
        this.fillName            = null;
        this.fillOpacity         = 1;

        if (this.element.getName() !== "svg") {
          throw("root is not <svg>, it's <" + this.element.getName() + ">");
        }
      }
      else if (arguments.length === 2) {
        if (typeof arguments[1] === 'string') {
          if (arguments[1].indexOf(".svg") > -1) { //its a filename
            this.element = new p.XMLElement(null, arguments[1]);
            // set values to their defaults according to the SVG spec
            this.vertexCodes         = [];
            this.vertices            = [];
            this.opacity             = 1;

            this.stroke              = false;
            this.strokeColor         = PConstants.ALPHA_MASK;
            this.strokeWeight        = 1;
            this.strokeCap           = PConstants.SQUARE;  // BUTT in svg spec
            this.strokeJoin          = PConstants.MITER;
            this.strokeGradient      = "";
            this.strokeGradientPaint = "";
            this.strokeName          = "";
            this.strokeOpacity       = 1;

            this.fill                = true;
            this.fillColor           = PConstants.ALPHA_MASK;
            this.fillGradient        = null;
            this.fillGradientPaint   = null;
            this.fillOpacity         = 1;

          }
        } else { // XMLElement
          if (arguments[0]) { // PShapeSVG
            this.element             = arguments[1];
            this.vertexCodes         = arguments[0].vertexCodes.slice();
            this.vertices            = arguments[0].vertices.slice();

            this.stroke              = arguments[0].stroke;
            this.strokeColor         = arguments[0].strokeColor;
            this.strokeWeight        = arguments[0].strokeWeight;
            this.strokeCap           = arguments[0].strokeCap;
            this.strokeJoin          = arguments[0].strokeJoin;
            this.strokeGradient      = arguments[0].strokeGradient;
            this.strokeGradientPaint = arguments[0].strokeGradientPaint;
            this.strokeName          = arguments[0].strokeName;

            this.fill                = arguments[0].fill;
            this.fillColor           = arguments[0].fillColor;
            this.fillGradient        = arguments[0].fillGradient;
            this.fillGradientPaint   = arguments[0].fillGradientPaint;
            this.fillName            = arguments[0].fillName;
            this.strokeOpacity       = arguments[0].strokeOpacity;
            this.fillOpacity         = arguments[0].fillOpacity;
            this.opacity             = arguments[0].opacity;
          }
        }
      }

      this.name      = this.element.getStringAttribute("id");
      var displayStr = this.element.getStringAttribute("display", "inline");
      this.visible   = displayStr !== "none";
      var str = this.element.getAttribute("transform");
      if (str) {
        this.matrix = this.parseMatrix(str);
      }
      // not proper parsing of the viewBox, but will cover us for cases where
      // the width and height of the object is not specified
      var viewBoxStr = this.element.getStringAttribute("viewBox");
      if ( viewBoxStr !== null ) {
        var viewBox = viewBoxStr.split(" ");
        this.width  = viewBox[2];
        this.height = viewBox[3];
      }

      // TODO if viewbox is not same as width/height, then use it to scale
      // the original objects. for now, viewbox only used when width/height
      // are empty values (which by the spec means w/h of "100%"
      var unitWidth  = this.element.getStringAttribute("width");
      var unitHeight = this.element.getStringAttribute("height");
      if (unitWidth !== null) {
        this.width  = this.parseUnitSize(unitWidth);
        this.height = this.parseUnitSize(unitHeight);
      } else {
        if ((this.width === 0) || (this.height === 0)) {
          // For the spec, the default is 100% and 100%. For purposes
          // here, insert a dummy value because this is prolly just a
          // font or something for which the w/h doesn't matter.
          this.width  = 1;
          this.height = 1;

          //show warning
          throw("The width and/or height is not " +
                "readable in the <svg> tag of this file.");
        }
      }
      this.parseColors(this.element);
      this.parseChildren(this.element);

    };
    /**
     * PShapeSVG methods
     * missing: getChild(), print(), parseStyleAttributes(), styles() - deals with strokeGradient and fillGradient
     */
    PShapeSVG.prototype = new PShape();
    /**
     * @member PShapeSVG
     * The parseMatrix() function parses the specified SVG matrix into a PMatrix2D. Note that PMatrix2D
     * is rotated relative to the SVG definition, so parameters are rearranged
     * here. More about the transformation matrices in
     * <a href="http://www.w3.org/TR/SVG/coords.html#TransformAttribute">this section</a>
     * of the SVG documentation.
     *
     * @param {String} str text of the matrix param.
     *
     * @return {PMatrix2D} a PMatrix2D
     */
    PShapeSVG.prototype.parseMatrix = (function() {
      function getCoords(s) {
        var m = [];
        s.replace(/\((.*?)\)/, (function() {
          return function(all, params) {
            // get the coordinates that can be separated by spaces or a comma
            m = params.replace(/,+/g, " ").split(/\s+/);
          };
        }()));
        return m;
      }

      return function(str) {
        this.checkMatrix(2);
        var pieces = [];
        str.replace(/\s*(\w+)\((.*?)\)/g, function(all) {
          // get a list of transform definitions
          pieces.push(p.trim(all));
        });
        if (pieces.length === 0) {
          return null;
        }

        for (var i = 0, j = pieces.length; i < j; i++) {
          var m = getCoords(pieces[i]);

          if (pieces[i].indexOf("matrix") !== -1) {
            this.matrix.set(m[0], m[2], m[4], m[1], m[3], m[5]);
          } else if (pieces[i].indexOf("translate") !== -1) {
            var tx = m[0];
            var ty = (m.length === 2) ? m[1] : 0;
            this.matrix.translate(tx,ty);
          } else if (pieces[i].indexOf("scale") !== -1) {
            var sx = m[0];
            var sy = (m.length === 2) ? m[1] : m[0];
            this.matrix.scale(sx,sy);
          } else if (pieces[i].indexOf("rotate") !== -1) {
            var angle = m[0];
            if (m.length === 1) {
              this.matrix.rotate(p.radians(angle));
            } else if (m.length === 3) {
              this.matrix.translate(m[1], m[2]);
              this.matrix.rotate(p.radians(m[0]));
              this.matrix.translate(-m[1], -m[2]);
            }
          } else if (pieces[i].indexOf("skewX") !== -1) {
            this.matrix.skewX(parseFloat(m[0]));
          } else if (pieces[i].indexOf("skewY") !== -1) {
            this.matrix.skewY(m[0]);
          }
        }
        return this.matrix;
      };
    }());

    /**
     * @member PShapeSVG
     * The parseChildren() function parses the specified XMLElement
     *
     * @param {XMLElement}element the XMLElement to parse
     */
    PShapeSVG.prototype.parseChildren = function(element) {
      var newelement = element.getChildren();
      var children   = new p.PShape();
      for (var i = 0, j = newelement.length; i < j; i++) {
        var kid = this.parseChild(newelement[i]);
        if (kid) {
          children.addChild(kid);
        }
      }
      this.children.push(children);
    };
    /**
     * @member PShapeSVG
     * The getName() function returns the name
     *
     * @return {String} the name
     */
    PShapeSVG.prototype.getName = function() {
      return this.name;
    };
    /**
     * @member PShapeSVG
     * The parseChild() function parses a child XML element.
     *
     * @param {XMLElement} elem the element to parse
     *
     * @return {PShape} the newly created PShape
     */
    PShapeSVG.prototype.parseChild = function( elem ) {
      var name = elem.getName();
      var shape;
      if (name === "g") {
        shape = new PShapeSVG(this, elem);
      } else if (name === "defs") {
        // generally this will contain gradient info, so may
        // as well just throw it into a group element for parsing
        shape = new PShapeSVG(this, elem);
      } else if (name === "line") {
        shape = new PShapeSVG(this, elem);
        shape.parseLine();
      } else if (name === "circle") {
        shape = new PShapeSVG(this, elem);
        shape.parseEllipse(true);
      } else if (name === "ellipse") {
        shape = new PShapeSVG(this, elem);
        shape.parseEllipse(false);
      } else if (name === "rect") {
        shape = new PShapeSVG(this, elem);
        shape.parseRect();
      } else if (name === "polygon") {
        shape = new PShapeSVG(this, elem);
        shape.parsePoly(true);
      } else if (name === "polyline") {
        shape = new PShapeSVG(this, elem);
        shape.parsePoly(false);
      } else if (name === "path") {
        shape = new PShapeSVG(this, elem);
        shape.parsePath();
      } else if (name === "radialGradient") {
        //return new RadialGradient(this, elem);
        unimplemented('PShapeSVG.prototype.parseChild, name = radialGradient');
      } else if (name === "linearGradient") {
        //return new LinearGradient(this, elem);
        unimplemented('PShapeSVG.prototype.parseChild, name = linearGradient');
      } else if (name === "text") {
        unimplemented('PShapeSVG.prototype.parseChild, name = text');
      } else if (name === "filter") {
        unimplemented('PShapeSVG.prototype.parseChild, name = filter');
      } else if (name === "mask") {
        unimplemented('PShapeSVG.prototype.parseChild, name = mask');
      } else {
        // ignoring
        nop();
      }
      return shape;
    };
    /**
     * @member PShapeSVG
     * The parsePath() function parses the <path> element of the svg file
     * A path is defined by including a path element which contains a d="(path data)" attribute, where the d attribute contains
     * the moveto, line, curve (both cubic and quadratic Beziers), arc and closepath instructions.
     **/
    PShapeSVG.prototype.parsePath = function() {
      this.family = PConstants.PATH;
      this.kind = 0;
      var pathDataChars = [];
      var c;
      //change multiple spaces and commas to single space
      var pathData = p.trim(this.element.getStringAttribute("d")
                            .replace(/[\s,]+/g,' '));
      if (pathData === null) {
        return;
      }
      pathData = p.__toCharArray(pathData);
      var cx     = 0,
          cy     = 0,
          ctrlX  = 0,
          ctrlY  = 0,
          ctrlX1 = 0,
          ctrlX2 = 0,
          ctrlY1 = 0,
          ctrlY2 = 0,
          endX   = 0,
          endY   = 0,
          ppx    = 0,
          ppy    = 0,
          px     = 0,
          py     = 0,
          i      = 0,
          valOf  = 0;
      var str = "";
      var tmpArray =[];
      var flag = false;
      var lastInstruction;
      var command;
      var j, k;
      while (i< pathData.length) {
        valOf = pathData[i].valueOf();
        if ((valOf >= 65 && valOf <= 90) || (valOf >= 97 && valOf <= 122)) {
          // if it's a letter
          // populate the tmpArray with coordinates
          j = i;
          i++;
          if (i < pathData.length) { // don't go over boundary of array
            tmpArray = [];
            valOf = pathData[i].valueOf();
            while (!((valOf >= 65 && valOf <= 90) ||
                     (valOf >= 97 && valOf <= 100) ||
                     (valOf >= 102 && valOf <= 122))
                     && flag === false) { // if its NOT a letter
              if (valOf === 32) { //if its a space and the str isn't empty
                // sometimes you get a space after the letter
                if (str !== "") {
                  tmpArray.push(parseFloat(str));
                  str = "";
                }
                i++;
              } else if (valOf === 45) { //if it's a -
                // allow for 'e' notation in numbers, e.g. 2.10e-9
                if (pathData[i-1].valueOf() === 101) {
                  str += pathData[i].toString();
                  i++;
                } else {
                  // sometimes no space separator after (ex: 104.535-16.322)
                  if (str !== "") {
                    tmpArray.push(parseFloat(str));
                  }
                  str = pathData[i].toString();
                  i++;
                }
              } else {
                str += pathData[i].toString();
                i++;
              }
              if (i === pathData.length) { // don't go over boundary of array
                flag = true;
              } else {
                valOf = pathData[i].valueOf();
              }
            }
          }
          if (str !== "") {
            tmpArray.push(parseFloat(str));
            str = "";
          }
          command = pathData[j];
          valOf = command.valueOf();
          if (valOf === 77) {  // M - move to (absolute)
            if (tmpArray.length >= 2 && tmpArray.length % 2 ===0) {
              // need one+ pairs of co-ordinates
              cx = tmpArray[0];
              cy = tmpArray[1];
              this.parsePathMoveto(cx, cy);
              if (tmpArray.length > 2) {
                for (j = 2, k = tmpArray.length; j < k; j+=2) {
                  // absolute line to
                  cx = tmpArray[j];
                  cy = tmpArray[j+1];
                  this.parsePathLineto(cx,cy);
                }
              }
            }
          } else if (valOf === 109) {  // m - move to (relative)
            if (tmpArray.length >= 2 && tmpArray.length % 2 === 0) {
              // need one+ pairs of co-ordinates
              cx += tmpArray[0];
              cy += tmpArray[1];
              this.parsePathMoveto(cx,cy);
              if (tmpArray.length > 2) {
                for (j = 2, k = tmpArray.length; j < k; j+=2) {
                  // relative line to
                  cx += tmpArray[j];
                  cy += tmpArray[j + 1];
                  this.parsePathLineto(cx,cy);
                }
              }
            }
          } else if (valOf === 76) { // L - lineto (absolute)
            if (tmpArray.length >= 2 && tmpArray.length % 2 === 0) {
              // need one+ pairs of co-ordinates
              for (j = 0, k = tmpArray.length; j < k; j+=2) {
                cx = tmpArray[j];
                cy = tmpArray[j + 1];
                this.parsePathLineto(cx,cy);
              }
            }
          } else if (valOf === 108) { // l - lineto (relative)
            if (tmpArray.length >= 2 && tmpArray.length % 2 === 0) {
              // need one+ pairs of co-ordinates
              for (j = 0, k = tmpArray.length; j < k; j+=2) {
                cx += tmpArray[j];
                cy += tmpArray[j+1];
                this.parsePathLineto(cx,cy);
              }
            }
          } else if (valOf === 72) { // H - horizontal lineto (absolute)
            for (j = 0, k = tmpArray.length; j < k; j++) {
              // multiple x co-ordinates can be provided
              cx = tmpArray[j];
              this.parsePathLineto(cx, cy);
            }
          } else if (valOf === 104) { // h - horizontal lineto (relative)
            for (j = 0, k = tmpArray.length; j < k; j++) {
              // multiple x co-ordinates can be provided
              cx += tmpArray[j];
              this.parsePathLineto(cx, cy);
            }
          } else if (valOf === 86) { // V - vertical lineto (absolute)
            for (j = 0, k = tmpArray.length; j < k; j++) {
              // multiple y co-ordinates can be provided
              cy = tmpArray[j];
              this.parsePathLineto(cx, cy);
            }
          } else if (valOf === 118) { // v - vertical lineto (relative)
            for (j = 0, k = tmpArray.length; j < k; j++) {
              // multiple y co-ordinates can be provided
              cy += tmpArray[j];
              this.parsePathLineto(cx, cy);
            }
          } else if (valOf === 67) { // C - curve to (absolute)
            if (tmpArray.length >= 6 && tmpArray.length % 6 === 0) {
              // need one+ multiples of 6 co-ordinates
              for (j = 0, k = tmpArray.length; j < k; j+=6) {
                ctrlX1 = tmpArray[j];
                ctrlY1 = tmpArray[j + 1];
                ctrlX2 = tmpArray[j + 2];
                ctrlY2 = tmpArray[j + 3];
                endX   = tmpArray[j + 4];
                endY   = tmpArray[j + 5];
                this.parsePathCurveto(ctrlX1,
                                      ctrlY1,
                                      ctrlX2,
                                      ctrlY2,
                                      endX,
                                      endY);
                cx = endX;
                cy = endY;
              }
            }
          } else if (valOf === 99) { // c - curve to (relative)
            if (tmpArray.length >= 6 && tmpArray.length % 6 === 0) {
              // need one+ multiples of 6 co-ordinates
              for (j = 0, k = tmpArray.length; j < k; j+=6) {
                ctrlX1 = cx + tmpArray[j];
                ctrlY1 = cy + tmpArray[j + 1];
                ctrlX2 = cx + tmpArray[j + 2];
                ctrlY2 = cy + tmpArray[j + 3];
                endX   = cx + tmpArray[j + 4];
                endY   = cy + tmpArray[j + 5];
                this.parsePathCurveto(ctrlX1,
                                      ctrlY1,
                                      ctrlX2,
                                      ctrlY2,
                                      endX,
                                      endY);
                cx = endX;
                cy = endY;
              }
            }
          } else if (valOf === 83) { // S - curve to shorthand (absolute)
            if (tmpArray.length >= 4 && tmpArray.length % 4 === 0) {
              // need one+ multiples of 4 co-ordinates
              for (j = 0, k = tmpArray.length; j < k; j+=4) {
                if (lastInstruction.toLowerCase() ===  "c" ||
                    lastInstruction.toLowerCase() ===  "s") {
                  ppx    = this.vertices[ this.vertices.length-2 ][0];
                  ppy    = this.vertices[ this.vertices.length-2 ][1];
                  px     = this.vertices[ this.vertices.length-1 ][0];
                  py     = this.vertices[ this.vertices.length-1 ][1];
                  ctrlX1 = px + (px - ppx);
                  ctrlY1 = py + (py - ppy);
                } else {
                  //If there is no previous curve,
                  //the current point will be used as the first control point.
                  ctrlX1 = this.vertices[this.vertices.length-1][0];
                  ctrlY1 = this.vertices[this.vertices.length-1][1];
                }
                ctrlX2 = tmpArray[j];
                ctrlY2 = tmpArray[j + 1];
                endX   = tmpArray[j + 2];
                endY   = tmpArray[j + 3];
                this.parsePathCurveto(ctrlX1,
                                      ctrlY1,
                                      ctrlX2,
                                      ctrlY2,
                                      endX,
                                      endY);
                cx = endX;
                cy = endY;
              }
            }
          } else if (valOf === 115) { // s - curve to shorthand (relative)
            if (tmpArray.length >= 4 && tmpArray.length % 4 === 0) {
              // need one+ multiples of 4 co-ordinates
              for (j = 0, k = tmpArray.length; j < k; j+=4) {
                if (lastInstruction.toLowerCase() ===  "c" ||
                    lastInstruction.toLowerCase() ===  "s") {
                  ppx    = this.vertices[this.vertices.length-2][0];
                  ppy    = this.vertices[this.vertices.length-2][1];
                  px     = this.vertices[this.vertices.length-1][0];
                  py     = this.vertices[this.vertices.length-1][1];
                  ctrlX1 = px + (px - ppx);
                  ctrlY1 = py + (py - ppy);
                } else {
                  //If there is no previous curve,
                  //the current point will be used as the first control point.
                  ctrlX1 = this.vertices[this.vertices.length-1][0];
                  ctrlY1 = this.vertices[this.vertices.length-1][1];
                }
                ctrlX2 = cx + tmpArray[j];
                ctrlY2 = cy + tmpArray[j + 1];
                endX   = cx + tmpArray[j + 2];
                endY   = cy + tmpArray[j + 3];
                this.parsePathCurveto(ctrlX1,
                                      ctrlY1,
                                      ctrlX2,
                                      ctrlY2,
                                      endX,
                                      endY);
                cx = endX;
                cy = endY;
              }
            }
          } else if (valOf === 81) { // Q - quadratic curve to (absolute)
            if (tmpArray.length >= 4 && tmpArray.length % 4 === 0) {
              // need one+ multiples of 4 co-ordinates
              for (j = 0, k = tmpArray.length; j < k; j+=4) {
                ctrlX = tmpArray[j];
                ctrlY = tmpArray[j + 1];
                endX  = tmpArray[j + 2];
                endY  = tmpArray[j + 3];
                this.parsePathQuadto(cx, cy, ctrlX, ctrlY, endX, endY);
                cx = endX;
                cy = endY;
              }
            }
          } else if (valOf === 113) { // q - quadratic curve to (relative)
            if (tmpArray.length >= 4 && tmpArray.length % 4 === 0) {
              // need one+ multiples of 4 co-ordinates
              for (j = 0, k = tmpArray.length; j < k; j+=4) {
                ctrlX = cx + tmpArray[j];
                ctrlY = cy + tmpArray[j + 1];
                endX  = cx + tmpArray[j + 2];
                endY  = cy + tmpArray[j + 3];
                this.parsePathQuadto(cx, cy, ctrlX, ctrlY, endX, endY);
                cx = endX;
                cy = endY;
              }
            }
          } else if (valOf === 84) {
            // T - quadratic curve to shorthand (absolute)
            if (tmpArray.length >= 2 && tmpArray.length % 2 === 0) {
              // need one+ pairs of co-ordinates
              for (j = 0, k = tmpArray.length; j < k; j+=2) {
                if (lastInstruction.toLowerCase() ===  "q" ||
                    lastInstruction.toLowerCase() ===  "t") {
                  ppx   = this.vertices[this.vertices.length-2][0];
                  ppy   = this.vertices[this.vertices.length-2][1];
                  px    = this.vertices[this.vertices.length-1][0];
                  py    = this.vertices[this.vertices.length-1][1];
                  ctrlX = px + (px - ppx);
                  ctrlY = py + (py - ppy);
                } else {
                  // If there is no previous command or if the previous command
                  // was not a Q, q, T or t, assume the control point is
                  // coincident with the current point.
                  ctrlX = cx;
                  ctrlY = cy;
                }
                endX  = tmpArray[j];
                endY  = tmpArray[j + 1];
                this.parsePathQuadto(cx, cy, ctrlX, ctrlY, endX, endY);
                cx = endX;
                cy = endY;
              }
            }
          } else if (valOf === 116) {
            // t - quadratic curve to shorthand (relative)
            if (tmpArray.length >= 2 && tmpArray.length % 2 === 0) {
              // need one+ pairs of co-ordinates
              for (j = 0, k = tmpArray.length; j < k; j+=2) {
                if (lastInstruction.toLowerCase() ===  "q" ||
                    lastInstruction.toLowerCase() ===  "t") {
                  ppx   = this.vertices[this.vertices.length-2][0];
                  ppy   = this.vertices[this.vertices.length-2][1];
                  px    = this.vertices[this.vertices.length-1][0];
                  py    = this.vertices[this.vertices.length-1][1];
                  ctrlX = px + (px - ppx);
                  ctrlY = py + (py - ppy);
                } else {
                  // If there is no previous command or if the previous command
                  // was not a Q, q, T or t, assume the control point is
                  // coincident with the current point.
                  ctrlX = cx;
                  ctrlY = cy;
                }
                endX  = cx + tmpArray[j];
                endY  = cy + tmpArray[j + 1];
                this.parsePathQuadto(cx, cy, ctrlX, ctrlY, endX, endY);
                cx = endX;
                cy = endY;
              }
            }
          } else if (valOf === 90) {
            //Z
            nop();
          } else if (valOf === 122) { //z
            this.close = true;
          }
          lastInstruction = command.toString();
        } else { i++;}
      }
    };
    /**
     * @member PShapeSVG
     * PShapeSVG.parsePath() helper function
     *
     * @see PShapeSVG#parsePath
     */
    PShapeSVG.prototype.parsePathQuadto = function(x1, y1, cx, cy, x2, y2) {
      if (this.vertices.length > 0) {
        this.parsePathCode(PConstants.BEZIER_VERTEX);
        // x1/y1 already covered by last moveto, lineto, or curveto
        this.parsePathVertex(x1 + ((cx-x1)*2/3), y1 + ((cy-y1)*2/3));
        this.parsePathVertex(x2 + ((cx-x2)*2/3), y2 + ((cy-y2)*2/3));
        this.parsePathVertex(x2, y2);
      } else {
        throw ("Path must start with M/m");
      }
    };
    /**
     * @member PShapeSVG
     * PShapeSVG.parsePath() helper function
     *
     * @see PShapeSVG#parsePath
     */
    PShapeSVG.prototype.parsePathCurveto = function(x1,  y1, x2, y2, x3, y3) {
      if (this.vertices.length > 0) {
        this.parsePathCode(PConstants.BEZIER_VERTEX );
        this.parsePathVertex(x1, y1);
        this.parsePathVertex(x2, y2);
        this.parsePathVertex(x3, y3);
      } else {
        throw ("Path must start with M/m");
      }
    };
    /**
     * @member PShapeSVG
     * PShapeSVG.parsePath() helper function
     *
     * @see PShapeSVG#parsePath
     */
    PShapeSVG.prototype.parsePathLineto = function(px, py) {
      if (this.vertices.length > 0) {
        this.parsePathCode(PConstants.VERTEX);
        this.parsePathVertex(px, py);
        // add property to distinguish between curContext.moveTo
        // or curContext.lineTo
        this.vertices[this.vertices.length-1]["moveTo"] = false;
      } else {
        throw ("Path must start with M/m");
      }
    };

    PShapeSVG.prototype.parsePathMoveto = function(px, py) {
      if (this.vertices.length > 0) {
        this.parsePathCode(PConstants.BREAK);
      }
      this.parsePathCode(PConstants.VERTEX);
      this.parsePathVertex(px, py);
      // add property to distinguish between curContext.moveTo
      // or curContext.lineTo
      this.vertices[this.vertices.length-1]["moveTo"] = true;
    };
    /**
     * @member PShapeSVG
     * PShapeSVG.parsePath() helper function
     *
     * @see PShapeSVG#parsePath
     */
    PShapeSVG.prototype.parsePathVertex = function(x,  y) {
      var verts = [];
      verts[0]  = x;
      verts[1]  = y;
      this.vertices.push(verts);
    };
    /**
     * @member PShapeSVG
     * PShapeSVG.parsePath() helper function
     *
     * @see PShapeSVG#parsePath
     */
    PShapeSVG.prototype.parsePathCode = function(what) {
      this.vertexCodes.push(what);
    };
    /**
     * @member PShapeSVG
     * The parsePoly() function parses a polyline or polygon from an SVG file.
     *
     * @param {boolean}val true if shape is closed (polygon), false if not (polyline)
     */
    PShapeSVG.prototype.parsePoly = function(val) {
      this.family    = PConstants.PATH;
      this.close     = val;
      var pointsAttr = p.trim(this.element.getStringAttribute("points")
                              .replace(/[,\s]+/g,' '));
      if (pointsAttr !== null) {
        //split into array
        var pointsBuffer = pointsAttr.split(" ");
        if (pointsBuffer.length % 2 === 0) {
          for (var i = 0, j = pointsBuffer.length; i < j; i++) {
            var verts = [];
            verts[0]  = pointsBuffer[i];
            verts[1]  = pointsBuffer[++i];
            this.vertices.push(verts);
          }
        } else {
          throw("Error parsing polygon points: odd number of coordinates provided");
        }
      }
    };
    /**
     * @member PShapeSVG
     * The parseRect() function parses a rect from an SVG file.
     */
    PShapeSVG.prototype.parseRect = function() {
      this.kind      = PConstants.RECT;
      this.family    = PConstants.PRIMITIVE;
      this.params    = [];
      this.params[0] = this.element.getFloatAttribute("x");
      this.params[1] = this.element.getFloatAttribute("y");
      this.params[2] = this.element.getFloatAttribute("width");
      this.params[3] = this.element.getFloatAttribute("height");
      if (this.params[2] < 0 || this.params[3] < 0) {
        throw("svg error: negative width or height found while parsing <rect>");
      }
    };
    /**
     * @member PShapeSVG
     * The parseEllipse() function handles parsing ellipse and circle tags.
     *
     * @param {boolean}val true if this is a circle and not an ellipse
     */
    PShapeSVG.prototype.parseEllipse = function(val) {
      this.kind   = PConstants.ELLIPSE;
      this.family = PConstants.PRIMITIVE;
      this.params = [];

      this.params[0] = this.element.getFloatAttribute("cx") | 0 ;
      this.params[1] = this.element.getFloatAttribute("cy") | 0;

      var rx, ry;
      if (val) {
        rx = ry = this.element.getFloatAttribute("r");
        if (rx < 0) {
          throw("svg error: negative radius found while parsing <circle>");
        }
      } else {
        rx = this.element.getFloatAttribute("rx");
        ry = this.element.getFloatAttribute("ry");
        if (rx < 0 || ry < 0) {
          throw("svg error: negative x-axis radius or y-axis radius found while parsing <ellipse>");
        }
      }
      this.params[0] -= rx;
      this.params[1] -= ry;

      this.params[2] = rx*2;
      this.params[3] = ry*2;
    };
    /**
     * @member PShapeSVG
     * The parseLine() function handles parsing line tags.
     *
     * @param {boolean}val true if this is a circle and not an ellipse
     */
    PShapeSVG.prototype.parseLine = function() {
      this.kind = PConstants.LINE;
      this.family = PConstants.PRIMITIVE;
      this.params = [];
      this.params[0] = this.element.getFloatAttribute("x1");
      this.params[1] = this.element.getFloatAttribute("y1");
      this.params[2] = this.element.getFloatAttribute("x2");
      this.params[3] = this.element.getFloatAttribute("y2");
    };
    /**
     * @member PShapeSVG
     * The parseColors() function handles parsing the opacity, strijem stroke-width, stroke-linejoin,stroke-linecap, fill, and style attributes
     *
     * @param {XMLElement}element the element of which attributes to parse
     */
    PShapeSVG.prototype.parseColors = function(element) {
      if (element.hasAttribute("opacity")) {
        this.setOpacity(element.getAttribute("opacity"));
      }
      if (element.hasAttribute("stroke")) {
        this.setStroke(element.getAttribute("stroke"));
      }
      if (element.hasAttribute("stroke-width")) {
        // if NaN (i.e. if it's 'inherit') then default
        // back to the inherit setting
        this.setStrokeWeight(element.getAttribute("stroke-width"));
      }
      if (element.hasAttribute("stroke-linejoin") ) {
        this.setStrokeJoin(element.getAttribute("stroke-linejoin"));
      }
      if (element.hasAttribute("stroke-linecap")) {
        this.setStrokeCap(element.getStringAttribute("stroke-linecap"));
      }
      // fill defaults to black (though stroke defaults to "none")
      // http://www.w3.org/TR/SVG/painting.html#FillProperties
      if (element.hasAttribute("fill")) {
        this.setFill(element.getStringAttribute("fill"));
      }
      if (element.hasAttribute("style")) {
        var styleText   = element.getStringAttribute("style");
        var styleTokens = styleText.toString().split( ";" );

        for (var i = 0, j = styleTokens.length; i < j; i++) {
          var tokens = p.trim(styleTokens[i].split( ":" ));
          if (tokens[0] === "fill") {
              this.setFill(tokens[1]);
          } else if (tokens[0] === "fill-opacity") {
              this.setFillOpacity(tokens[1]);
          } else if (tokens[0] === "stroke") {
              this.setStroke(tokens[1]);
          } else if (tokens[0] === "stroke-width") {
              this.setStrokeWeight(tokens[1]);
          } else if (tokens[0] === "stroke-linecap") {
              this.setStrokeCap(tokens[1]);
          } else if (tokens[0] === "stroke-linejoin") {
              this.setStrokeJoin(tokens[1]);
          } else if (tokens[0] === "stroke-opacity") {
              this.setStrokeOpacity(tokens[1]);
          } else if (tokens[0] === "opacity") {
              this.setOpacity(tokens[1]);
          } // Other attributes are not yet implemented
        }
      }
    };
    /**
     * @member PShapeSVG
     * PShapeSVG.parseColors() helper function
     *
     * @param {String} opacityText the value of fillOpacity
     *
     * @see PShapeSVG#parseColors
     */
    PShapeSVG.prototype.setFillOpacity = function(opacityText) {
      this.fillOpacity = parseFloat(opacityText);
      this.fillColor   = this.fillOpacity * 255  << 24 |
                         this.fillColor & 0xFFFFFF;
    };
    /**
     * @member PShapeSVG
     * PShapeSVG.parseColors() helper function
     *
     * @param {String} fillText the value of fill
     *
     * @see PShapeSVG#parseColors
     */
    PShapeSVG.prototype.setFill = function (fillText) {
      var opacityMask = this.fillColor & 0xFF000000;
      if (fillText === "none") {
        this.fill = false;
      } else if (fillText.indexOf("#") === 0) {
        this.fill      = true;
        if (fillText.length === 4) {
          // convert #00F to #0000FF
          fillText = fillText.replace(/#(.)(.)(.)/,"#$1$1$2$2$3$3");
        }
        this.fillColor = opacityMask |
                         (parseInt(fillText.substring(1), 16 )) &
                         0xFFFFFF;
      } else if (fillText.indexOf("rgb") === 0) {
        this.fill      = true;
        this.fillColor = opacityMask | this.parseRGB(fillText);
      } else if (fillText.indexOf("url(#") === 0) {
        this.fillName = fillText.substring(5, fillText.length - 1 );
      } else if (colors[fillText]) {
        this.fill      = true;
        this.fillColor = opacityMask |
                         (parseInt(colors[fillText].substring(1), 16)) &
                         0xFFFFFF;
      }
    };
    /**
     * @member PShapeSVG
     * PShapeSVG.parseColors() helper function
     *
     * @param {String} opacity the value of opacity
     *
     * @see PShapeSVG#parseColors
     */
    PShapeSVG.prototype.setOpacity = function(opacity) {
      this.strokeColor = parseFloat(opacity) * 255 << 24 |
                         this.strokeColor & 0xFFFFFF;
      this.fillColor   = parseFloat(opacity) * 255 << 24 |
                         this.fillColor & 0xFFFFFF;
    };
    /**
     * @member PShapeSVG
     * PShapeSVG.parseColors() helper function
     *
     * @param {String} strokeText the value to set stroke to
     *
     * @see PShapeSVG#parseColors
     */
    PShapeSVG.prototype.setStroke = function(strokeText) {
      var opacityMask = this.strokeColor & 0xFF000000;
      if (strokeText === "none") {
        this.stroke = false;
      } else if (strokeText.charAt( 0 ) === "#") {
        this.stroke      = true;
        if (strokeText.length === 4) {
          // convert #00F to #0000FF
          strokeText = strokeText.replace(/#(.)(.)(.)/,"#$1$1$2$2$3$3");
        }
        this.strokeColor = opacityMask |
                           (parseInt( strokeText.substring( 1 ), 16 )) &
                           0xFFFFFF;
      } else if (strokeText.indexOf( "rgb" ) === 0 ) {
        this.stroke = true;
        this.strokeColor = opacityMask | this.parseRGB(strokeText);
      } else if (strokeText.indexOf( "url(#" ) === 0) {
        this.strokeName = strokeText.substring(5, strokeText.length - 1);
      } else if (colors[strokeText]) {
        this.stroke      = true;
        this.strokeColor = opacityMask |
                           (parseInt(colors[strokeText].substring(1), 16)) &
                           0xFFFFFF;
      }
    };
    /**
     * @member PShapeSVG
     * PShapeSVG.parseColors() helper function
     *
     * @param {String} weight the value to set strokeWeight to
     *
     * @see PShapeSVG#parseColors
     */
    PShapeSVG.prototype.setStrokeWeight = function(weight) {
      this.strokeWeight = this.parseUnitSize(weight);
    };
    /**
     * @member PShapeSVG
     * PShapeSVG.parseColors() helper function
     *
     * @param {String} linejoin the value to set strokeJoin to
     *
     * @see PShapeSVG#parseColors
     */
    PShapeSVG.prototype.setStrokeJoin = function(linejoin) {
      if (linejoin === "miter") {
        this.strokeJoin = PConstants.MITER;

      } else if (linejoin === "round") {
        this.strokeJoin = PConstants.ROUND;

      } else if (linejoin === "bevel") {
        this.strokeJoin = PConstants.BEVEL;
      }
    };
    /**
     * @member PShapeSVG
     * PShapeSVG.parseColors() helper function
     *
     * @param {String} linecap the value to set strokeCap to
     *
     * @see PShapeSVG#parseColors
     */
    PShapeSVG.prototype.setStrokeCap = function (linecap) {
      if (linecap === "butt") {
        this.strokeCap = PConstants.SQUARE;

      } else if (linecap === "round") {
        this.strokeCap = PConstants.ROUND;

      } else if (linecap === "square") {
        this.strokeCap = PConstants.PROJECT;
      }
    };
    /**
     * @member PShapeSVG
     * PShapeSVG.parseColors() helper function
     *
     * @param {String} opacityText the value to set stroke opacity to
     *
     * @see PShapeSVG#parseColors
     */
    PShapeSVG.prototype.setStrokeOpacity =  function (opacityText) {
      this.strokeOpacity = parseFloat(opacityText);
      this.strokeColor   = this.strokeOpacity * 255 << 24 |
                           this.strokeColor &
                           0xFFFFFF;
    };
    /**
     * @member PShapeSVG
     * The parseRGB() function parses an rbg() color string and returns a color int
     *
     * @param {String} color the color to parse in rbg() format
     *
     * @return {int} the equivalent color int
     */
    PShapeSVG.prototype.parseRGB = function(color) {
      var sub    = color.substring(color.indexOf('(') + 1, color.indexOf(')'));
      var values = sub.split(", ");
      return (values[0] << 16) | (values[1] << 8) | (values[2]);
    };
    /**
     * @member PShapeSVG
     * The parseUnitSize() function parse a size that may have a suffix for its units.
     * Ignoring cases where this could also be a percentage.
     * The <A HREF="http://www.w3.org/TR/SVG/coords.html#Units">units</A> spec:
     * <UL>
     * <LI>"1pt" equals "1.25px" (and therefore 1.25 user units)
     * <LI>"1pc" equals "15px" (and therefore 15 user units)
     * <LI>"1mm" would be "3.543307px" (3.543307 user units)
     * <LI>"1cm" equals "35.43307px" (and therefore 35.43307 user units)
     * <LI>"1in" equals "90px" (and therefore 90 user units)
     * </UL>
     */
    PShapeSVG.prototype.parseUnitSize = function (text) {
      var len = text.length - 2;
      if (len < 0) { return text; }
      if (text.indexOf("pt") === len) {
        return parseFloat(text.substring(0, len)) * 1.25;
      } else if (text.indexOf("pc") === len) {
        return parseFloat( text.substring( 0, len)) * 15;
      } else if (text.indexOf("mm") === len) {
        return parseFloat( text.substring(0, len)) * 3.543307;
      } else if (text.indexOf("cm") === len) {
        return parseFloat(text.substring(0, len)) * 35.43307;
      } else if (text.indexOf("in") === len) {
        return parseFloat(text.substring(0, len)) * 90;
      } else if (text.indexOf("px") === len) {
        return parseFloat(text.substring(0, len));
      } else {
        return parseFloat(text);
      }
    };
    /**
     * The shape() function displays shapes to the screen.
     * Processing currently works with SVG shapes only.
     * The <b>shape</b> parameter specifies the shape to display and the <b>x</b>
     * and <b>y</b> parameters define the location of the shape from its
     * upper-left corner.
     * The shape is displayed at its original size unless the <b>width</b>
     * and <b>height</b> parameters specify a different size.
     * The <b>shapeMode()</b> function changes the way the parameters work.
     * A call to <b>shapeMode(CORNERS)</b>, for example, will change the width
     * and height parameters to define the x and y values of the opposite corner
     * of the shape.
     * <br><br>
     * Note complex shapes may draw awkwardly with P2D, P3D, and OPENGL. Those
     * renderers do not yet support shapes that have holes or complicated breaks.
     *
     * @param {PShape} shape       the shape to display
     * @param {int|float} x        x-coordinate of the shape
     * @param {int|float} y        y-coordinate of the shape
     * @param {int|float} width    width to display the shape
     * @param {int|float} height   height to display the shape
     *
     * @see PShape
     * @see loadShape()
     * @see shapeMode()
     */
    p.shape = function(shape, x, y, width, height) {
      if (arguments.length >= 1 && arguments[0] !== null) {
        if (shape.isVisible()) {
          p.pushMatrix();
          if (curShapeMode === PConstants.CENTER) {
            if (arguments.length === 5) {
              p.translate(x - width/2, y - height/2);
              p.scale(width / shape.getWidth(), height / shape.getHeight());
            } else if (arguments.length === 3) {
              p.translate(x - shape.getWidth()/2, - shape.getHeight()/2);
            } else {
              p.translate(-shape.getWidth()/2, -shape.getHeight()/2);
            }
          } else if (curShapeMode === PConstants.CORNER) {
            if (arguments.length === 5) {
              p.translate(x, y);
              p.scale(width / shape.getWidth(), height / shape.getHeight());
            } else if (arguments.length === 3) {
              p.translate(x, y);
            }
          } else if (curShapeMode === PConstants.CORNERS) {
            if (arguments.length === 5) {
              width  -= x;
              height -= y;
              p.translate(x, y);
              p.scale(width / shape.getWidth(), height / shape.getHeight());
            } else if (arguments.length === 3) {
              p.translate(x, y);
            }
          }
          shape.draw();
          if ((arguments.length === 1 && curShapeMode === PConstants.CENTER ) || arguments.length > 1) {
            p.popMatrix();
          }
        }
      }
    };

    /**
     * The shapeMode() function modifies the location from which shapes draw.
     * The default mode is <b>shapeMode(CORNER)</b>, which specifies the
     * location to be the upper left corner of the shape and uses the third
     * and fourth parameters of <b>shape()</b> to specify the width and height.
     * The syntax <b>shapeMode(CORNERS)</b> uses the first and second parameters
     * of <b>shape()</b> to set the location of one corner and uses the third
     * and fourth parameters to set the opposite corner.
     * The syntax <b>shapeMode(CENTER)</b> draws the shape from its center point
     * and uses the third and forth parameters of <b>shape()</b> to specify the
     * width and height.
     * The parameter must be written in "ALL CAPS" because Processing syntax
     * is case sensitive.
     *
     * @param {int} mode One of CORNER, CORNERS, CENTER
     *
     * @see shape()
     * @see rectMode()
     */
    p.shapeMode = function (mode) {
      curShapeMode = mode;
    };

    /**
     * The loadShape() function loads vector shapes into a variable of type PShape. Currently, only SVG files may be loaded.
     * In most cases, <b>loadShape()</b> should be used inside <b>setup()</b> because loading shapes inside <b>draw()</b> will reduce the speed of a sketch.
     *
     * @param {String} filename     an SVG file
     *
     * @return {PShape} a object of type PShape or null
     * @see PShape
     * @see PApplet#shape()
     * @see PApplet#shapeMode()
     */
    p.loadShape = function (filename) {
      if (arguments.length === 1) {
        if (filename.indexOf(".svg") > -1) {
          return new PShapeSVG(null, filename);
        }
      }
      return null;
    };

    /**
     * XMLAttribute is an attribute of a XML element. This is an internal class
     *
     * @param {String} fname     the full name of the attribute
     * @param {String} n         the short name of the attribute
     * @param {String} namespace the namespace URI of the attribute
     * @param {String} v         the value of the attribute
     * @param {String }t         the type of the attribute
     *
     * @see XMLElement
     */
    var XMLAttribute = function(fname, n, nameSpace, v, t){
      this.fullName = fname || "";
      this.name = n || "";
      this.namespace = nameSpace || "";
      this.value = v;
      this.type = t;
    };
    /**
     * XMLAttribute methods
     */
    XMLAttribute.prototype = {
      /**
       * @member XMLAttribute
       * The getName() function returns the short name of the attribute
       *
       * @return {String} the short name of the attribute
       */
      getName: function() {
        return this.name;
      },
      /**
       * @member XMLAttribute
       * The getFullName() function returns the full name of the attribute
       *
       * @return {String} the full name of the attribute
       */
      getFullName: function() {
        return this.fullName;
      },
      /**
       * @member XMLAttribute
       * The getNamespace() function returns the namespace of the attribute
       *
       * @return {String} the namespace of the attribute
       */
      getNamespace: function() {
        return this.namespace;
      },
      /**
       * @member XMLAttribute
       * The getValue() function returns the value of the attribute
       *
       * @return {String} the value of the attribute
       */
      getValue: function() {
        return this.value;
      },
      /**
       * @member XMLAttribute
       * The getValue() function returns the type of the attribute
       *
       * @return {String} the type of the attribute
       */
      getType: function() {
        return this.type;
      },
      /**
       * @member XMLAttribute
       * The setValue() function sets the value of the attribute
       *
       * @param {String} newval the new value
       */
      setValue: function(newval) {
        this.value = newval;
      }
    };

    /**
     * XMLElement is a representation of an XML object. The object is able to parse XML code
     *
     * @param {PApplet} parent   typically use "this"
     * @param {String} filename  name of the XML/SVG file to load
     * @param {String} xml       the xml/svg string
     * @param {String} fullname  the full name of the element
     * @param {String} namespace the namespace  of the URI
     * @param {String} systemID  the system ID of the XML data where the element starts
     * @param {Integer }lineNr   the line in the XML data where the element starts
     */
    var XMLElement = p.XMLElement = function() {
      this.attributes = [];
      this.children   = [];
      this.fullName   = null;
      this.name       = null;
      this.namespace  = "";
      this.content = null;
      this.parent    = null;
      this.lineNr     = "";
      this.systemID   = "";
      this.type = "ELEMENT";

      if (arguments.length === 4) {
        this.fullName   = arguments[0] || "";
        if (arguments[1]) {
          this.name = arguments[1];
        } else {
          var index = this.fullName.indexOf(':');
          if (index >= 0) {
            this.name = this.fullName.substring(index + 1);
          } else {
            this.name = this.fullName;
          }
        }
        this.namespace = arguments[1];
        this.lineNr    = arguments[3];
        this.systemID  = arguments[2];
      }
      else if ((arguments.length === 2 && arguments[1].indexOf(".") > -1) ) {
        // filename or svg xml element
        this.parse(arguments[arguments.length -1]);
      } else if (arguments.length === 1 && typeof arguments[0] === "string"){
        this.parse(arguments[0]);
      }
    };
    /**
     * XMLElement methods
     * missing: enumerateAttributeNames(), enumerateChildren(),
     * NOTE: parse does not work when a url is passed in
     */
    XMLElement.prototype = {
      /**
       * @member XMLElement
       * The parse() function retrieves the file via ajax() and uses DOMParser()
       * parseFromString method to make an XML document
       * @addon
       *
       * @param {String} filename name of the XML/SVG file to load
       *
       * @throws ExceptionType Error loading document
       *
       * @see XMLElement#parseChildrenRecursive
       */
      parse: function(filename) {
        var xmlDoc;
        try {
          if (filename.indexOf(".xml") > -1 || filename.indexOf(".svg") > -1) {
            filename = ajax(filename);
          }
          xmlDoc = new DOMParser().parseFromString(filename, "text/xml");
          var elements = xmlDoc.documentElement;
          if (elements) {
            this.parseChildrenRecursive(null, elements);
          } else {
            throw ("Error loading document");
          }
          return this;
        } catch(e) {
          throw(e);
        }
      },
      /**
       * @member XMLElement
       * Internal helper function for parse().
       * Loops through the
       * @addon
       *
       * @param {XMLElement} parent                      the parent node
       * @param {XML document childNodes} elementpath    the remaining nodes that need parsing
       *
       * @return {XMLElement} the new element and its children elements
       */
      parseChildrenRecursive: function (parent , elementpath){
        var xmlelement,
          xmlattribute,
          tmpattrib,
          l, m,
          child;
        if (!parent) { // this element is the root element
          this.fullName = elementpath.localName;
          this.name     = elementpath.nodeName;
          xmlelement    = this;
        } else { // this element has a parent
          xmlelement         = new XMLElement(elementpath.localName, elementpath.nodeName, "", "");
          xmlelement.parent  = parent;
        }

        // if this is a text node, return a PCData element, instead of an XML element.
        if(elementpath.nodeType === 3 && elementpath.textContent !== "") {
          return this.createPCDataElement(elementpath.textContent);
        }

        // bind all attributes
        for (l = 0, m = elementpath.attributes.length; l < m; l++) {
          tmpattrib    = elementpath.attributes[l];
          xmlattribute = new XMLAttribute(tmpattrib.getname,
                                          tmpattrib.nodeName,
                                          tmpattrib.namespaceURI,
                                          tmpattrib.nodeValue,
                                          tmpattrib.nodeType);
          xmlelement.attributes.push(xmlattribute);
        }

        // bind all children
        for (l = 0, m = elementpath.childNodes.length; l < m; l++) {
          var node = elementpath.childNodes[l];
          if (node.nodeType === 1 || node.nodeType === 3) { // ELEMENT_NODE or TEXT_NODE
            child = xmlelement.parseChildrenRecursive(xmlelement, node);
            if (child !== null) {
              xmlelement.children.push(child);
            }
          }
        }

        return xmlelement;
      },
      /**
       * @member XMLElement
       * The createElement() function Creates an empty element
       *
       * @param {String} fullName   the full name of the element
       * @param {String} namespace  the namespace URI
       * @param {String} systemID   the system ID of the XML data where the element starts
       * @param {int} lineNr    the line in the XML data where the element starts
       */
      createElement: function () {
        if (arguments.length === 2) {
          return new XMLElement(arguments[0], arguments[1], null, null);
        } else {
          return new XMLElement(arguments[0], arguments[1], arguments[2], arguments[3]);
        }
      },
      /**
       * @member XMLElement
       * The createPCDataElement() function creates an element to be used for #PCDATA content.
       * Because Processing discards whitespace TEXT nodes, this method will not build an element
       * if the passed content is empty after trimming for whitespace.
       *
       * @return {XMLElement} new "test" XMLElement, or null if content consists only of whitespace
       */
      createPCDataElement: function (content) {
        if(content.replace(/^\s+$/g,"") === "") {
          return null;
        }
        var pcdata = new XMLElement();
        pcdata.content = content;
        pcdata.type = "TEXT";
        return pcdata;
      },
      /**
       * @member XMLElement
       * The hasAttribute() function returns whether an attribute exists
       *
       * @param {String} name      name of the attribute
       * @param {String} namespace the namespace URI of the attribute
       *
       * @return {boolean} true if the attribute exists
       */
      hasAttribute: function () {
        if (arguments.length === 1) {
          return this.getAttribute(arguments[0]) !== null;
        } else if (arguments.length === 2) {
          return this.getAttribute(arguments[0],arguments[1]) !== null;
        }
      },
      /**
       * @member XMLElement
       * The equals() function checks to see if the XMLElement being passed in equals another XMLElement
       *
       * @param {XMLElement} rawElement the element to compare to
       *
       * @return {boolean} true if the element equals another element
       */
      equals: function(other) {
        if (!(other instanceof XMLElement)) {
          return false;
        }
        var i, j;
        if (this.name !== other.getLocalName()) { return false; }
        if (this.attributes.length !== other.getAttributeCount()) { return false; }
        // attributes may be ordered differently
        if (this.attributes.length !== other.attributes.length) { return false; }
        var attr_name, attr_ns, attr_value, attr_type, attr_other;
        for (i = 0, j = this.attributes.length; i < j; i++) {
          attr_name = this.attributes[i].getName();
          attr_ns = this.attributes[i].getNamespace();
          attr_other = other.findAttribute(attr_name, attr_ns);
          if (attr_other === null) { return false; }
          if (this.attributes[i].getValue() !== attr_other.getValue()) { return false; }
          if (this.attributes[i].getType() !== attr_other.getType()) { return false; }
        }
        // children must be ordered identically
        if (this.children.length !== other.getChildCount()) { return false; }
        if (this.children.length>0) {
          var child1, child2;
          for (i = 0, j = this.children.length; i < j; i++) {
            child1 = this.getChild(i);
            child2 = other.getChild(i);
            if (!child1.equals(child2)) { return false; }
          }
          return true;
        } else {
          return (this.content === other.content);
        }
      },
      /**
       * @member XMLElement
       * The getContent() function returns the content of an element. If there is no such content, null is returned
       *
       * @return {String} the (possibly null) content
       */
      getContent: function(){
        if (this.type === "TEXT") {
          return this.content; }
        else if (this.children.length === 1 && this.children[0].type === "TEXT") {
          return this.children[0].content;
        }
        return null;
      },
      /**
       * @member XMLElement
       * The getAttribute() function returns the value of an attribute
       *
       * @param {String} name         the non-null full name of the attribute
       * @param {String} namespace    the namespace URI, which may be null
       * @param {String} defaultValue the default value of the attribute
       *
       * @return {String} the value, or defaultValue if the attribute does not exist
       */
      getAttribute: function (){
        var attribute;
        if( arguments.length === 2 ){
          attribute = this.findAttribute(arguments[0]);
          if (attribute) {
            return attribute.getValue();
          } else {
            return arguments[1];
          }
        } else if (arguments.length === 1) {
          attribute = this.findAttribute(arguments[0]);
          if (attribute) {
            return attribute.getValue();
          } else {
            return null;
          }
        } else if (arguments.length === 3) {
          attribute = this.findAttribute(arguments[0],arguments[1]);
          if (attribute) {
            return attribute.getValue();
          } else {
            return arguments[2];
          }
        }
      },
      /**
       * @member XMLElement
       * The getStringAttribute() function returns the string attribute of the element
       * If the <b>defaultValue</b> parameter is used and the attribute doesn't exist, the <b>defaultValue</b> value is returned.
       * When calling the function without the <b>defaultValue</b> parameter, if the attribute doesn't exist, the value 0 is returned.
       *
       * @param name         the name of the attribute
       * @param defaultValue value returned if the attribute is not found
       *
       * @return {String} the value, or defaultValue if the attribute does not exist
       */
      getStringAttribute: function() {
        if (arguments.length === 1) {
          return this.getAttribute(arguments[0]);
        } else if (arguments.length === 2){
          return this.getAttribute(arguments[0], arguments[1]);
        } else {
          return this.getAttribute(arguments[0], arguments[1],arguments[2]);
        }
      },
      /**
       * Processing 1.5 XML API wrapper for the generic String
       * attribute getter. This may only take one argument.
       */
      getString: function(attributeName) {
        return this.getStringAttribute(attributeName);
      },
      /**
       * @member XMLElement
       * The getFloatAttribute() function returns the float attribute of the element.
       * If the <b>defaultValue</b> parameter is used and the attribute doesn't exist, the <b>defaultValue</b> value is returned.
       * When calling the function without the <b>defaultValue</b> parameter, if the attribute doesn't exist, the value 0 is returned.
       *
       * @param name         the name of the attribute
       * @param defaultValue value returned if the attribute is not found
       *
       * @return {float} the value, or defaultValue if the attribute does not exist
       */
      getFloatAttribute: function() {
        if (arguments.length === 1 ) {
          return parseFloat(this.getAttribute(arguments[0], 0));
        } else if (arguments.length === 2 ){
          return this.getAttribute(arguments[0], arguments[1]);
        } else {
          return this.getAttribute(arguments[0], arguments[1],arguments[2]);
        }
      },
      /**
       * Processing 1.5 XML API wrapper for the generic float
       * attribute getter. This may only take one argument.
       */
      getFloat: function(attributeName) {
        return this.getFloatAttribute(attributeName);
      },
      /**
       * @member XMLElement
       * The getIntAttribute() function returns the integer attribute of the element.
       * If the <b>defaultValue</b> parameter is used and the attribute doesn't exist, the <b>defaultValue</b> value is returned.
       * When calling the function without the <b>defaultValue</b> parameter, if the attribute doesn't exist, the value 0 is returned.
       *
       * @param name         the name of the attribute
       * @param defaultValue value returned if the attribute is not found
       *
       * @return {int} the value, or defaultValue if the attribute does not exist
       */
      getIntAttribute: function () {
        if (arguments.length === 1) {
          return this.getAttribute( arguments[0], 0 );
        } else if (arguments.length === 2) {
          return this.getAttribute(arguments[0], arguments[1]);
        } else {
          return this.getAttribute(arguments[0], arguments[1],arguments[2]);
        }
      },
      /**
       * Processing 1.5 XML API wrapper for the generic int
       * attribute getter. This may only take one argument.
       */
      getInt: function(attributeName) {
        return this.getIntAttribute(attributeName);
      },
      /**
       * @member XMLElement
       * The hasChildren() function returns whether the element has children.
       *
       * @return {boolean} true if the element has children.
       */
      hasChildren: function () {
        return this.children.length > 0 ;
      },
      /**
       * @member XMLElement
       * The addChild() function adds a child element
       *
       * @param {XMLElement} child the non-null child to add.
       */
      addChild: function (child) {
        if (child !== null) {
          child.parent = this;
          this.children.push(child);
        }
      },
      /**
       * @member XMLElement
       * The insertChild() function inserts a child element at the index provided
       *
       * @param {XMLElement} child  the non-null child to add.
       * @param {int} index     where to put the child.
       */
      insertChild: function (child, index) {
        if (child) {
          if ((child.getLocalName() === null) && (! this.hasChildren())) {
            var lastChild = this.children[this.children.length -1];
            if (lastChild.getLocalName() === null) {
                lastChild.setContent(lastChild.getContent() + child.getContent());
                return;
            }
          }
          child.parent = this;
          this.children.splice(index,0,child);
        }
      },
      /**
       * @member XMLElement
       * The getChild() returns the child XMLElement as specified by the <b>index</b> parameter.
       * The value of the <b>index</b> parameter must be less than the total number of children to avoid going out of the array storing the child elements.
       * When the <b>path</b> parameter is specified, then it will return all children that match that path. The path is a series of elements and sub-elements, separated by slashes.
       *
       * @param {int} index     where to put the child.
       * @param {String} path       path to a particular element
       *
       * @return {XMLElement} the element
       */
      getChild: function (){
        if (typeof arguments[0]  === "number") {
          return this.children[arguments[0]];
        }
        else if (arguments[0].indexOf('/') !== -1) { // path was given
          this.getChildRecursive(arguments[0].split("/"), 0);
        } else {
          var kid, kidName;
          for (var i = 0, j = this.getChildCount(); i < j; i++) {
            kid = this.getChild(i);
            kidName = kid.getName();
            if (kidName !== null && kidName === arguments[0]) {
                return kid;
            }
          }
          return null;
        }
      },
      /**
       * @member XMLElement
       * The getChildren() returns all of the children as an XMLElement array.
       * When the <b>path</b> parameter is specified, then it will return all children that match that path.
       * The path is a series of elements and sub-elements, separated by slashes.
       *
       * @param {String} path       element name or path/to/element
       *
       * @return {XMLElement} array of child elements that match
       *
       * @see XMLElement#getChildCount()
       * @see XMLElement#getChild()
       */
      getChildren: function(){
        if (arguments.length === 1) {
          if (typeof arguments[0]  === "number") {
            return this.getChild( arguments[0]);
          } else if (arguments[0].indexOf('/') !== -1) { // path was given
            return this.getChildrenRecursive( arguments[0].split("/"), 0);
          } else {
            var matches = [];
            var kid, kidName;
            for (var i = 0, j = this.getChildCount(); i < j; i++) {
              kid = this.getChild(i);
              kidName = kid.getName();
              if (kidName !== null && kidName === arguments[0]) {
                matches.push(kid);
              }
            }
            return matches;
          }
        }else {
          return this.children;
        }
      },
      /**
       * @member XMLElement
       * The getChildCount() returns the number of children for the element.
       *
       * @return {int} the count
       *
       * @see XMLElement#getChild()
       * @see XMLElement#getChildren()
       */
      getChildCount: function(){
        return this.children.length;
      },
      /**
       * @member XMLElement
       * Internal helper function for getChild().
       *
       * @param {String[]} items   result of splitting the query on slashes
       * @param {int} offset   where in the items[] array we're currently looking
       *
       * @return {XMLElement} matching element or null if no match
       */
      getChildRecursive: function (items, offset) {
        var kid, kidName;
        for(var i = 0, j = this.getChildCount(); i < j; i++) {
            kid = this.getChild(i);
            kidName = kid.getName();
            if (kidName !== null && kidName === items[offset]) {
              if (offset === items.length-1) {
                return kid;
              } else {
                offset += 1;
                return kid.getChildRecursive(items, offset);
              }
            }
        }
        return null;
      },
      /**
       * @member XMLElement
       * Internal helper function for getChildren().
       *
       * @param {String[]} items   result of splitting the query on slashes
       * @param {int} offset   where in the items[] array we're currently looking
       *
       * @return {XMLElement[]} matching elements or empty array if no match
       */
      getChildrenRecursive: function (items, offset) {
        if (offset === items.length-1) {
          return this.getChildren(items[offset]);
        }
        var matches = this.getChildren(items[offset]);
        var kidMatches = [];
        for (var i = 0; i < matches.length; i++) {
          kidMatches = kidMatches.concat(matches[i].getChildrenRecursive(items, offset+1));
        }
        return kidMatches;
      },
      /**
       * @member XMLElement
       * The isLeaf() function returns whether the element is a leaf element.
       *
       * @return {boolean} true if the element has no children.
       */
      isLeaf: function(){
        return !this.hasChildren();
      },
      /**
       * @member XMLElement
       * The listChildren() function put the names of all children into an array. Same as looping through
       * each child and calling getName() on each XMLElement.
       *
       * @return {String[]} a list of element names.
       */
      listChildren: function() {
        var arr = [];
        for (var i = 0, j = this.children.length; i < j; i++) {
          arr.push( this.getChild(i).getName());
        }
        return arr;
      },
      /**
       * @member XMLElement
       * The removeAttribute() function removes an attribute
       *
       * @param {String} name        the non-null name of the attribute.
       * @param {String} namespace   the namespace URI of the attribute, which may be null.
       */
      removeAttribute: function (name , namespace) {
        this.namespace = namespace || "";
        for (var i = 0, j = this.attributes.length; i < j; i++) {
          if (this.attributes[i].getName() === name && this.attributes[i].getNamespace() === this.namespace) {
            this.attributes.splice(i, 1);
            break;
          }
        }
      },
      /**
       * @member XMLElement
       * The removeChild() removes a child element.
       *
       * @param {XMLElement} child      the the non-null child to be renoved
       */
      removeChild: function(child) {
        if (child) {
          for (var i = 0, j = this.children.length; i < j; i++) {
            if (this.children[i].equals(child)) {
              this.children.splice(i, 1);
              break;
            }
          }
        }
      },
      /**
       * @member XMLElement
       * The removeChildAtIndex() removes the child located at a certain index
       *
       * @param {int} index      the index of the child, where the first child has index 0
       */
      removeChildAtIndex: function(index) {
        if (this.children.length > index) { //make sure its not outofbounds
          this.children.splice(index, 1);
        }
      },
      /**
       * @member XMLElement
       * The findAttribute() function searches an attribute
       *
       * @param {String} name        fullName the non-null full name of the attribute
       * @param {String} namespace   the name space, which may be null
       *
       * @return {XMLAttribute} the attribute, or null if the attribute does not exist.
       */
      findAttribute: function (name, namespace) {
        this.namespace = namespace || "";
        for (var i = 0, j = this.attributes.length; i < j; i++) {
          if (this.attributes[i].getName() === name && this.attributes[i].getNamespace() === this.namespace) {
             return this.attributes[i];
          }
        }
        return null;
      },
      /**
       * @member XMLElement
       * The setAttribute() function sets an attribute.
       *
       * @param {String} name        the non-null full name of the attribute
       * @param {String} namespace   the non-null value of the attribute
       */
      setAttribute: function() {
        var attr;
        if (arguments.length === 3) {
          var index = arguments[0].indexOf(':');
          var name  = arguments[0].substring(index + 1);
          attr      = this.findAttribute(name, arguments[1]);
          if (attr) {
            attr.setValue(arguments[2]);
          } else {
            attr = new XMLAttribute(arguments[0], name, arguments[1], arguments[2], "CDATA");
            this.attributes.push(attr);
          }
        } else {
          attr = this.findAttribute(arguments[0]);
          if (attr) {
            attr.setValue(arguments[1]);
          } else {
            attr = new XMLAttribute(arguments[0], arguments[0], null, arguments[1], "CDATA");
            this.attributes.push(attr);
          }
        }
      },
      /**
       * Processing 1.5 XML API wrapper for the generic String
       * attribute setter. This must take two arguments.
       */
      setString: function(attribute, value) {
        this.setAttribute(attribute, value);
      },
      /**
       * Processing 1.5 XML API wrapper for the generic int
       * attribute setter. This must take two arguments.
       */
      setInt: function(attribute, value) {
        this.setAttribute(attribute, value);
      },
      /**
       * Processing 1.5 XML API wrapper for the generic float
       * attribute setter. This must take two arguments.
       */
      setFloat: function(attribute, value) {
        this.setAttribute(attribute, value);
      },
      /**
       * @member XMLElement
       * The setContent() function sets the #PCDATA content. It is an error to call this method with a
       * non-null value if there are child objects.
       *
       * @param {String} content     the (possibly null) content
       */
      setContent: function(content) {
        if (this.children.length>0) {
          Processing.debug("Tried to set content for XMLElement with children"); }
        this.content = content;
      },
      /**
       * @member XMLElement
       * The setName() function sets the full name. This method also sets the short name and clears the
       * namespace URI.
       *
       * @param {String} name        the non-null name
       * @param {String} namespace   the namespace URI, which may be null.
       */
      setName: function() {
        if (arguments.length === 1) {
          this.name      = arguments[0];
          this.fullName  = arguments[0];
          this.namespace = null;
        } else {
          var index = arguments[0].indexOf(':');
          if ((arguments[1] === null) || (index < 0)) {
              this.name = arguments[0];
          } else {
              this.name = arguments[0].substring(index + 1);
          }
          this.fullName  = arguments[0];
          this.namespace = arguments[1];
        }
      },
      /**
       * @member XMLElement
       * The getName() function returns the full name (i.e. the name including an eventual namespace
       * prefix) of the element.
       *
       * @return {String} the name, or null if the element only contains #PCDATA.
       */
      getName: function() {
        return this.fullName;
      },
      /**
       * @member XMLElement
       * The getLocalName() function returns the local name (i.e. the name excluding an eventual namespace
       * prefix) of the element.
       *
       * @return {String} the name, or null if the element only contains #PCDATA.
       */
      getLocalName: function() {
        return this.name;
      },
      /**
       * @member XMLElement
       * The getAttributeCount() function returns the number of attributes for the node
       * that this XMLElement represents.
       *
       * @return {int} the number of attributes in this XMLelement
       */
      getAttributeCount: function() {
        return this.attributes.length;
      },
      /**
       * @member XMLElement
       * The toString() function returns the XML definition of an XMLElement.
       *
       * @return {String} the XML definition of this XMLElement
       */
      toString: function() {
        // shortcut for text nodes
        if(this.type==="TEXT") { return this.content; }

        // real XMLElements
        var tagstring = (this.namespace !== "" && this.namespace !== this.name ? this.namespace + ":" : "") + this.name;
        var xmlstring =  "<" + tagstring;
        var a,c;

        // serialize the attributes to XML string
        for (a = 0; a<this.attributes.length; a++) {
          var attr = this.attributes[a];
          xmlstring += " "  + attr.getName() + "=" + '"' + attr.getValue() + '"';
        }

        // serialize all children to XML string
        if (this.children.length === 0) {
          if (this.content==="") {
            xmlstring += "/>";
          } else {
            xmlstring += ">" + this.content + "</"+tagstring+">";
          }
        } else {
          xmlstring += ">";
          for (c = 0; c<this.children.length; c++) {
            xmlstring += this.children[c].toString();
          }
          xmlstring += "</" + tagstring + ">";
        }
        return xmlstring;
       }
    };

    /**
     * static Processing 1.5 XML API wrapper for the
     * parse method. This may only take one argument.
     */
    XMLElement.parse = function(xmlstring) {
      var element = new XMLElement();
      element.parse(xmlstring);
      return element;
    };

    ////////////////////////////////////////////////////////////////////////////
    // 2D Matrix
    ////////////////////////////////////////////////////////////////////////////
    /**
     * Helper function for printMatrix(). Finds the largest scalar
     * in the matrix, then number of digits left of the decimal.
     * Call from PMatrix2D and PMatrix3D's print() function.
     */
    var printMatrixHelper = function(elements) {
      var big = 0;
      for (var i = 0; i < elements.length; i++) {
        if (i !== 0) {
          big = Math.max(big, Math.abs(elements[i]));
        } else {
          big = Math.abs(elements[i]);
        }
      }

      var digits = (big + "").indexOf(".");
      if (digits === 0) {
        digits = 1;
      } else if (digits === -1) {
        digits = (big + "").length;
      }

      return digits;
    };
    /**
     * PMatrix2D is a 3x2 affine matrix implementation. The constructor accepts another PMatrix2D or a list of six float elements.
     * If no parameters are provided the matrix is set to the identity matrix.
     *
     * @param {PMatrix2D} matrix  the initial matrix to set to
     * @param {float} m00         the first element of the matrix
     * @param {float} m01         the second element of the matrix
     * @param {float} m02         the third element of the matrix
     * @param {float} m10         the fourth element of the matrix
     * @param {float} m11         the fifth element of the matrix
     * @param {float} m12         the sixth element of the matrix
     */
    var PMatrix2D = p.PMatrix2D = function() {
      if (arguments.length === 0) {
        this.reset();
      } else if (arguments.length === 1 && arguments[0] instanceof PMatrix2D) {
        this.set(arguments[0].array());
      } else if (arguments.length === 6) {
        this.set(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
      }
    };
    /**
     * PMatrix2D methods
     */
    PMatrix2D.prototype = {
      /**
       * @member PMatrix2D
       * The set() function sets the matrix elements. The function accepts either another PMatrix2D, an array of elements, or a list of six floats.
       *
       * @param {PMatrix2D} matrix    the matrix to set this matrix to
       * @param {float[]} elements    an array of elements to set this matrix to
       * @param {float} m00           the first element of the matrix
       * @param {float} m01           the third element of the matrix
       * @param {float} m10           the fourth element of the matrix
       * @param {float} m11           the fith element of the matrix
       * @param {float} m12           the sixth element of the matrix
       */
      set: function() {
        if (arguments.length === 6) {
          var a = arguments;
          this.set([a[0], a[1], a[2],
                    a[3], a[4], a[5]]);
        } else if (arguments.length === 1 && arguments[0] instanceof PMatrix2D) {
          this.elements = arguments[0].array();
        } else if (arguments.length === 1 && arguments[0] instanceof Array) {
          this.elements = arguments[0].slice();
        }
      },
      /**
       * @member PMatrix2D
       * The get() function returns a copy of this PMatrix2D.
       *
       * @return {PMatrix2D} a copy of this PMatrix2D
       */
      get: function() {
        var outgoing = new PMatrix2D();
        outgoing.set(this.elements);
        return outgoing;
      },
      /**
       * @member PMatrix2D
       * The reset() function sets this PMatrix2D to the identity matrix.
       */
      reset: function() {
        this.set([1, 0, 0, 0, 1, 0]);
      },
      /**
       * @member PMatrix2D
       * The array() function returns a copy of the element values.
       * @addon
       *
       * @return {float[]} returns a copy of the element values
       */
      array: function array() {
        return this.elements.slice();
      },
      /**
       * @member PMatrix2D
       * The translate() function translates this matrix by moving the current coordinates to the location specified by tx and ty.
       *
       * @param {float} tx  the x-axis coordinate to move to
       * @param {float} ty  the y-axis coordinate to move to
       */
      translate: function(tx, ty) {
        this.elements[2] = tx * this.elements[0] + ty * this.elements[1] + this.elements[2];
        this.elements[5] = tx * this.elements[3] + ty * this.elements[4] + this.elements[5];
      },
      /**
       * @member PMatrix2D
       * The invTranslate() function translates this matrix by moving the current coordinates to the negative location specified by tx and ty.
       *
       * @param {float} tx  the x-axis coordinate to move to
       * @param {float} ty  the y-axis coordinate to move to
       */
      invTranslate: function(tx, ty) {
        this.translate(-tx, -ty);
      },
       /**
       * @member PMatrix2D
       * The transpose() function is not used in processingjs.
       */
      transpose: function() {
        // Does nothing in Processing.
      },
      /**
       * @member PMatrix2D
       * The mult() function multiplied this matrix.
       * If two array elements are passed in the function will multiply a two element vector against this matrix.
       * If target is null or not length four, a new float array will be returned.
       * The values for vec and target can be the same (though that's less efficient).
       * If two PVectors are passed in the function multiply the x and y coordinates of a PVector against this matrix.
       *
       * @param {PVector} source, target  the PVectors used to multiply this matrix
       * @param {float[]} source, target  the arrays used to multiply this matrix
       *
       * @return {PVector|float[]} returns a PVector or an array representing the new matrix
       */
      mult: function(source, target) {
        var x, y;
        if (source instanceof PVector) {
          x = source.x;
          y = source.y;
          if (!target) {
            target = new PVector();
          }
        } else if (source instanceof Array) {
          x = source[0];
          y = source[1];
          if (!target) {
            target = [];
          }
        }
        if (target instanceof Array) {
          target[0] = this.elements[0] * x + this.elements[1] * y + this.elements[2];
          target[1] = this.elements[3] * x + this.elements[4] * y + this.elements[5];
        } else if (target instanceof PVector) {
          target.x = this.elements[0] * x + this.elements[1] * y + this.elements[2];
          target.y = this.elements[3] * x + this.elements[4] * y + this.elements[5];
          target.z = 0;
        }
        return target;
      },
      /**
       * @member PMatrix2D
       * The multX() function calculates the x component of a vector from a transformation.
       *
       * @param {float} x the x component of the vector being transformed
       * @param {float} y the y component of the vector being transformed
       *
       * @return {float} returnes the result of the calculation
       */
      multX: function(x, y) {
        return (x * this.elements[0] + y * this.elements[1] + this.elements[2]);
      },
      /**
       * @member PMatrix2D
       * The multY() function calculates the y component of a vector from a transformation.
       *
       * @param {float} x the x component of the vector being transformed
       * @param {float} y the y component of the vector being transformed
       *
       * @return {float} returnes the result of the calculation
       */
      multY: function(x, y) {
        return (x * this.elements[3] + y * this.elements[4] + this.elements[5]);
      },
      /**
       * @member PMatrix2D
       * The skewX() function skews the matrix along the x-axis the amount specified by the angle parameter.
       * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
       *
       * @param {float} angle  angle of skew specified in radians
       */
      skewX: function(angle) {
        this.apply(1, 0, 1, angle, 0, 0);
      },
      /**
       * @member PMatrix2D
       * The skewY() function skews the matrix along the y-axis the amount specified by the angle parameter.
       * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
       *
       * @param {float} angle  angle of skew specified in radians
       */
      skewY: function(angle) {
        this.apply(1, 0, 1,  0, angle, 0);
      },
      /**
       * @member PMatrix2D
       * The determinant() function calvculates the determinant of this matrix.
       *
       * @return {float} the determinant of the matrix
       */
      determinant: function() {
        return (this.elements[0] * this.elements[4] - this.elements[1] * this.elements[3]);
      },
      /**
       * @member PMatrix2D
       * The invert() function inverts this matrix
       *
       * @return {boolean} true if successful
       */
      invert: function() {
        var d = this.determinant();
        if (Math.abs( d ) > PConstants.MIN_INT) {
          var old00 = this.elements[0];
          var old01 = this.elements[1];
          var old02 = this.elements[2];
          var old10 = this.elements[3];
          var old11 = this.elements[4];
          var old12 = this.elements[5];
          this.elements[0] =  old11 / d;
          this.elements[3] = -old10 / d;
          this.elements[1] = -old01 / d;
          this.elements[4] =  old00 / d;
          this.elements[2] = (old01 * old12 - old11 * old02) / d;
          this.elements[5] = (old10 * old02 - old00 * old12) / d;
          return true;
        }
        return false;
      },
      /**
       * @member PMatrix2D
       * The scale() function increases or decreases the size of a shape by expanding and contracting vertices. When only one parameter is specified scale will occur in all dimensions.
       * This is equivalent to a two parameter call.
       *
       * @param {float} sx  the amount to scale on the x-axis
       * @param {float} sy  the amount to scale on the y-axis
       */
      scale: function(sx, sy) {
        if (sx && !sy) {
          sy = sx;
        }
        if (sx && sy) {
          this.elements[0] *= sx;
          this.elements[1] *= sy;
          this.elements[3] *= sx;
          this.elements[4] *= sy;
        }
      },
       /**
        * @member PMatrix2D
        * The invScale() function decreases or increases the size of a shape by contracting and expanding vertices. When only one parameter is specified scale will occur in all dimensions.
        * This is equivalent to a two parameter call.
        *
        * @param {float} sx  the amount to scale on the x-axis
        * @param {float} sy  the amount to scale on the y-axis
        */
      invScale: function(sx, sy) {
        if (sx && !sy) {
          sy = sx;
        }
        this.scale(1 / sx, 1 / sy);
      },
      /**
       * @member PMatrix2D
       * The apply() function multiplies the current matrix by the one specified through the parameters. Note that either a PMatrix2D or a list of floats can be passed in.
       *
       * @param {PMatrix2D} matrix    the matrix to apply this matrix to
       * @param {float} m00           the first element of the matrix
       * @param {float} m01           the third element of the matrix
       * @param {float} m10           the fourth element of the matrix
       * @param {float} m11           the fith element of the matrix
       * @param {float} m12           the sixth element of the matrix
       */
      apply: function() {
        var source;
        if (arguments.length === 1 && arguments[0] instanceof PMatrix2D) {
          source = arguments[0].array();
        } else if (arguments.length === 6) {
          source = Array.prototype.slice.call(arguments);
        } else if (arguments.length === 1 && arguments[0] instanceof Array) {
          source = arguments[0];
        }

        var result = [0, 0, this.elements[2],
                      0, 0, this.elements[5]];
        var e = 0;
        for (var row = 0; row < 2; row++) {
          for (var col = 0; col < 3; col++, e++) {
            result[e] += this.elements[row * 3 + 0] * source[col + 0] +
                         this.elements[row * 3 + 1] * source[col + 3];
          }
        }
        this.elements = result.slice();
      },
      /**
       * @member PMatrix2D
       * The preApply() function applies another matrix to the left of this one. Note that either a PMatrix2D or elements of a matrix can be passed in.
       *
       * @param {PMatrix2D} matrix    the matrix to apply this matrix to
       * @param {float} m00           the first element of the matrix
       * @param {float} m01           the third element of the matrix
       * @param {float} m10           the fourth element of the matrix
       * @param {float} m11           the fith element of the matrix
       * @param {float} m12           the sixth element of the matrix
       */
      preApply: function() {
        var source;
        if (arguments.length === 1 && arguments[0] instanceof PMatrix2D) {
          source = arguments[0].array();
        } else if (arguments.length === 6) {
          source = Array.prototype.slice.call(arguments);
        } else if (arguments.length === 1 && arguments[0] instanceof Array) {
          source = arguments[0];
        }
        var result = [0, 0, source[2],
                      0, 0, source[5]];
        result[2] = source[2] + this.elements[2] * source[0] + this.elements[5] * source[1];
        result[5] = source[5] + this.elements[2] * source[3] + this.elements[5] * source[4];
        result[0] = this.elements[0] * source[0] + this.elements[3] * source[1];
        result[3] = this.elements[0] * source[3] + this.elements[3] * source[4];
        result[1] = this.elements[1] * source[0] + this.elements[4] * source[1];
        result[4] = this.elements[1] * source[3] + this.elements[4] * source[4];
        this.elements = result.slice();
      },
      /**
       * @member PMatrix2D
       * The rotate() function rotates the matrix.
       *
       * @param {float} angle         the angle of rotation in radiants
       */
      rotate: function(angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var temp1 = this.elements[0];
        var temp2 = this.elements[1];
        this.elements[0] =  c * temp1 + s * temp2;
        this.elements[1] = -s * temp1 + c * temp2;
        temp1 = this.elements[3];
        temp2 = this.elements[4];
        this.elements[3] =  c * temp1 + s * temp2;
        this.elements[4] = -s * temp1 + c * temp2;
      },
      /**
       * @member PMatrix2D
       * The rotateZ() function rotates the matrix.
       *
       * @param {float} angle         the angle of rotation in radiants
       */
      rotateZ: function(angle) {
        this.rotate(angle);
      },
      /**
       * @member PMatrix2D
       * The invRotateZ() function rotates the matrix in opposite direction.
       *
       * @param {float} angle         the angle of rotation in radiants
       */
      invRotateZ: function(angle) {
        this.rotateZ(angle - Math.PI);
      },
      /**
       * @member PMatrix2D
       * The print() function prints out the elements of this matrix
       */
      print: function() {
        var digits = printMatrixHelper(this.elements);
        var output = "" + p.nfs(this.elements[0], digits, 4) + " " +
                     p.nfs(this.elements[1], digits, 4) + " " +
                     p.nfs(this.elements[2], digits, 4) + "\n" +
                     p.nfs(this.elements[3], digits, 4) + " " +
                     p.nfs(this.elements[4], digits, 4) + " " +
                     p.nfs(this.elements[5], digits, 4) + "\n\n";
        p.println(output);
      }
    };

    /**
     * PMatrix3D is a 4x4  matrix implementation. The constructor accepts another PMatrix3D or a list of six or sixteen float elements.
     * If no parameters are provided the matrix is set to the identity matrix.
     */
    var PMatrix3D = p.PMatrix3D = function() {
      // When a matrix is created, it is set to an identity matrix
      this.reset();
    };
    /**
     * PMatrix3D methods
     */
    PMatrix3D.prototype = {
      /**
       * @member PMatrix2D
       * The set() function sets the matrix elements. The function accepts either another PMatrix3D, an array of elements, or a list of six or sixteen floats.
       *
       * @param {PMatrix3D} matrix    the initial matrix to set to
       * @param {float[]} elements    an array of elements to set this matrix to
       * @param {float} m00           the first element of the matrix
       * @param {float} m01           the second element of the matrix
       * @param {float} m02           the third element of the matrix
       * @param {float} m03           the fourth element of the matrix
       * @param {float} m10           the fifth element of the matrix
       * @param {float} m11           the sixth element of the matrix
       * @param {float} m12           the seventh element of the matrix
       * @param {float} m13           the eight element of the matrix
       * @param {float} m20           the nineth element of the matrix
       * @param {float} m21           the tenth element of the matrix
       * @param {float} m22           the eleventh element of the matrix
       * @param {float} m23           the twelveth element of the matrix
       * @param {float} m30           the thirteenth element of the matrix
       * @param {float} m31           the fourtheenth element of the matrix
       * @param {float} m32           the fivetheenth element of the matrix
       * @param {float} m33           the sixteenth element of the matrix
       */
      set: function() {
        if (arguments.length === 16) {
          this.elements = Array.prototype.slice.call(arguments);
        } else if (arguments.length === 1 && arguments[0] instanceof PMatrix3D) {
          this.elements = arguments[0].array();
        } else if (arguments.length === 1 && arguments[0] instanceof Array) {
          this.elements = arguments[0].slice();
        }
      },
      /**
       * @member PMatrix3D
       * The get() function returns a copy of this PMatrix3D.
       *
       * @return {PMatrix3D} a copy of this PMatrix3D
       */
      get: function() {
        var outgoing = new PMatrix3D();
        outgoing.set(this.elements);
        return outgoing;
      },
      /**
       * @member PMatrix3D
       * The reset() function sets this PMatrix3D to the identity matrix.
       */
      reset: function() {
        this.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      },
      /**
       * @member PMatrix3D
       * The array() function returns a copy of the element values.
       * @addon
       *
       * @return {float[]} returns a copy of the element values
       */
      array: function array() {
        return this.elements.slice();
      },
      /**
       * @member PMatrix3D
       * The translate() function translates this matrix by moving the current coordinates to the location specified by tx, ty, and tz.
       *
       * @param {float} tx  the x-axis coordinate to move to
       * @param {float} ty  the y-axis coordinate to move to
       * @param {float} tz  the z-axis coordinate to move to
       */
      translate: function(tx, ty, tz) {
        if (tz === undef) {
          tz = 0;
        }

        this.elements[3]  += tx * this.elements[0]  + ty * this.elements[1]  + tz * this.elements[2];
        this.elements[7]  += tx * this.elements[4]  + ty * this.elements[5]  + tz * this.elements[6];
        this.elements[11] += tx * this.elements[8]  + ty * this.elements[9]  + tz * this.elements[10];
        this.elements[15] += tx * this.elements[12] + ty * this.elements[13] + tz * this.elements[14];
      },
      /**
       * @member PMatrix3D
       * The transpose() function transpose this matrix.
       */
      transpose: function() {
        var temp = this.elements.slice();
        this.elements[0]  = temp[0];
        this.elements[1]  = temp[4];
        this.elements[2]  = temp[8];
        this.elements[3]  = temp[12];
        this.elements[4]  = temp[1];
        this.elements[5]  = temp[5];
        this.elements[6]  = temp[9];
        this.elements[7]  = temp[13];
        this.elements[8]  = temp[2];
        this.elements[9]  = temp[6];
        this.elements[10] = temp[10];
        this.elements[11] = temp[14];
        this.elements[12] = temp[3];
        this.elements[13] = temp[7];
        this.elements[14] = temp[11];
        this.elements[15] = temp[15];
      },
      /**
       * @member PMatrix3D
       * The mult() function multiplied this matrix.
       * If two array elements are passed in the function will multiply a two element vector against this matrix.
       * If target is null or not length four, a new float array will be returned.
       * The values for vec and target can be the same (though that's less efficient).
       * If two PVectors are passed in the function multiply the x and y coordinates of a PVector against this matrix.
       *
       * @param {PVector} source, target  the PVectors used to multiply this matrix
       * @param {float[]} source, target  the arrays used to multiply this matrix
       *
       * @return {PVector|float[]} returns a PVector or an array representing the new matrix
       */
      mult: function(source, target) {
        var x, y, z, w;
        if (source instanceof PVector) {
          x = source.x;
          y = source.y;
          z = source.z;
          w = 1;
          if (!target) {
            target = new PVector();
          }
        } else if (source instanceof Array) {
          x = source[0];
          y = source[1];
          z = source[2];
          w = source[3] || 1;

          if ( !target || (target.length !== 3 && target.length !== 4) ) {
            target = [0, 0, 0];
          }
        }

        if (target instanceof Array) {
          if (target.length === 3) {
            target[0] = this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3];
            target[1] = this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7];
            target[2] = this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11];
          } else if (target.length === 4) {
            target[0] = this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3] * w;
            target[1] = this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7] * w;
            target[2] = this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11] * w;
            target[3] = this.elements[12] * x + this.elements[13] * y + this.elements[14] * z + this.elements[15] * w;
          }
        }
        if (target instanceof PVector) {
          target.x = this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3];
          target.y = this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7];
          target.z = this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11];
        }
        return target;
      },
      /**
       * @member PMatrix3D
       * The preApply() function applies another matrix to the left of this one. Note that either a PMatrix3D or elements of a matrix can be passed in.
       *
       * @param {PMatrix3D} matrix    the matrix to apply this matrix to
       * @param {float} m00           the first element of the matrix
       * @param {float} m01           the second element of the matrix
       * @param {float} m02           the third element of the matrix
       * @param {float} m03           the fourth element of the matrix
       * @param {float} m10           the fifth element of the matrix
       * @param {float} m11           the sixth element of the matrix
       * @param {float} m12           the seventh element of the matrix
       * @param {float} m13           the eight element of the matrix
       * @param {float} m20           the nineth element of the matrix
       * @param {float} m21           the tenth element of the matrix
       * @param {float} m22           the eleventh element of the matrix
       * @param {float} m23           the twelveth element of the matrix
       * @param {float} m30           the thirteenth element of the matrix
       * @param {float} m31           the fourtheenth element of the matrix
       * @param {float} m32           the fivetheenth element of the matrix
       * @param {float} m33           the sixteenth element of the matrix
       */
      preApply: function() {
        var source;
        if (arguments.length === 1 && arguments[0] instanceof PMatrix3D) {
          source = arguments[0].array();
        } else if (arguments.length === 16) {
          source = Array.prototype.slice.call(arguments);
        } else if (arguments.length === 1 && arguments[0] instanceof Array) {
          source = arguments[0];
        }

        var result = [0, 0, 0, 0,
                      0, 0, 0, 0,
                      0, 0, 0, 0,
                      0, 0, 0, 0];
        var e = 0;
        for (var row = 0; row < 4; row++) {
          for (var col = 0; col < 4; col++, e++) {
            result[e] += this.elements[col + 0] * source[row * 4 + 0] + this.elements[col + 4] *
                         source[row * 4 + 1] + this.elements[col + 8] * source[row * 4 + 2] +
                         this.elements[col + 12] * source[row * 4 + 3];
          }
        }
        this.elements = result.slice();
      },
      /**
       * @member PMatrix3D
       * The apply() function multiplies the current matrix by the one specified through the parameters. Note that either a PMatrix3D or a list of floats can be passed in.
       *
       * @param {PMatrix3D} matrix    the matrix to apply this matrix to
       * @param {float} m00           the first element of the matrix
       * @param {float} m01           the second element of the matrix
       * @param {float} m02           the third element of the matrix
       * @param {float} m03           the fourth element of the matrix
       * @param {float} m10           the fifth element of the matrix
       * @param {float} m11           the sixth element of the matrix
       * @param {float} m12           the seventh element of the matrix
       * @param {float} m13           the eight element of the matrix
       * @param {float} m20           the nineth element of the matrix
       * @param {float} m21           the tenth element of the matrix
       * @param {float} m22           the eleventh element of the matrix
       * @param {float} m23           the twelveth element of the matrix
       * @param {float} m30           the thirteenth element of the matrix
       * @param {float} m31           the fourtheenth element of the matrix
       * @param {float} m32           the fivetheenth element of the matrix
       * @param {float} m33           the sixteenth element of the matrix
       */
      apply: function() {
        var source;
        if (arguments.length === 1 && arguments[0] instanceof PMatrix3D) {
          source = arguments[0].array();
        } else if (arguments.length === 16) {
          source = Array.prototype.slice.call(arguments);
        } else if (arguments.length === 1 && arguments[0] instanceof Array) {
          source = arguments[0];
        }

        var result = [0, 0, 0, 0,
                      0, 0, 0, 0,
                      0, 0, 0, 0,
                      0, 0, 0, 0];
        var e = 0;
        for (var row = 0; row < 4; row++) {
          for (var col = 0; col < 4; col++, e++) {
            result[e] += this.elements[row * 4 + 0] * source[col + 0] + this.elements[row * 4 + 1] *
                         source[col + 4] + this.elements[row * 4 + 2] * source[col + 8] +
                         this.elements[row * 4 + 3] * source[col + 12];
          }
        }
        this.elements = result.slice();
      },
      /**
       * @member PMatrix3D
       * The rotate() function rotates the matrix.
       *
       * @param {float} angle         the angle of rotation in radiants
       */
      rotate: function(angle, v0, v1, v2) {
        if (!v1) {
          this.rotateZ(angle);
        } else {
          // TODO should make sure this vector is normalized
          var c = p.cos(angle);
          var s = p.sin(angle);
          var t = 1.0 - c;

          this.apply((t * v0 * v0) + c,
                     (t * v0 * v1) - (s * v2),
                     (t * v0 * v2) + (s * v1),
                     0,
                     (t * v0 * v1) + (s * v2),
                     (t * v1 * v1) + c,
                     (t * v1 * v2) - (s * v0),
                     0,
                     (t * v0 * v2) - (s * v1),
                     (t * v1 * v2) + (s * v0),
                     (t * v2 * v2) + c,
                     0, 0, 0, 0, 1);
        }
      },
      /**
       * @member PMatrix3D
       * The invApply() function applies the inverted matrix to this matrix.
       *
       * @param {float} m00           the first element of the matrix
       * @param {float} m01           the second element of the matrix
       * @param {float} m02           the third element of the matrix
       * @param {float} m03           the fourth element of the matrix
       * @param {float} m10           the fifth element of the matrix
       * @param {float} m11           the sixth element of the matrix
       * @param {float} m12           the seventh element of the matrix
       * @param {float} m13           the eight element of the matrix
       * @param {float} m20           the nineth element of the matrix
       * @param {float} m21           the tenth element of the matrix
       * @param {float} m22           the eleventh element of the matrix
       * @param {float} m23           the twelveth element of the matrix
       * @param {float} m30           the thirteenth element of the matrix
       * @param {float} m31           the fourtheenth element of the matrix
       * @param {float} m32           the fivetheenth element of the matrix
       * @param {float} m33           the sixteenth element of the matrix
       *
       * @return {boolean} returns true if the operation was successful.
       */
      invApply: function() {
        if (inverseCopy === undef) {
          inverseCopy = new PMatrix3D();
        }
        var a = arguments;
        inverseCopy.set(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8],
                        a[9], a[10], a[11], a[12], a[13], a[14], a[15]);

        if (!inverseCopy.invert()) {
          return false;
        }
        this.preApply(inverseCopy);
        return true;
      },
      /**
       * @member PMatrix3D
       * The rotateZ() function rotates the matrix.
       *
       * @param {float} angle         the angle of rotation in radiants
       */
      rotateX: function(angle) {
        var c = p.cos(angle);
        var s = p.sin(angle);
        this.apply([1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1]);
      },
      /**
       * @member PMatrix3D
       * The rotateY() function rotates the matrix.
       *
       * @param {float} angle         the angle of rotation in radiants
       */
      rotateY: function(angle) {
        var c = p.cos(angle);
        var s = p.sin(angle);
        this.apply([c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1]);
      },
      /**
       * @member PMatrix3D
       * The rotateZ() function rotates the matrix.
       *
       * @param {float} angle         the angle of rotation in radiants
       */
      rotateZ: function(angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        this.apply([c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      },
      /**
       * @member PMatrix3D
       * The scale() function increases or decreases the size of a matrix by expanding and contracting vertices. When only one parameter is specified scale will occur in all dimensions.
       * This is equivalent to a three parameter call.
       *
       * @param {float} sx  the amount to scale on the x-axis
       * @param {float} sy  the amount to scale on the y-axis
       * @param {float} sz  the amount to scale on the z-axis
       */
      scale: function(sx, sy, sz) {
        if (sx && !sy && !sz) {
          sy = sz = sx;
        } else if (sx && sy && !sz) {
          sz = 1;
        }

        if (sx && sy && sz) {
          this.elements[0]  *= sx;
          this.elements[1]  *= sy;
          this.elements[2]  *= sz;
          this.elements[4]  *= sx;
          this.elements[5]  *= sy;
          this.elements[6]  *= sz;
          this.elements[8]  *= sx;
          this.elements[9]  *= sy;
          this.elements[10] *= sz;
          this.elements[12] *= sx;
          this.elements[13] *= sy;
          this.elements[14] *= sz;
        }
      },
      /**
       * @member PMatrix3D
       * The skewX() function skews the matrix along the x-axis the amount specified by the angle parameter.
       * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
       *
       * @param {float} angle  angle of skew specified in radians
       */
      skewX: function(angle) {
        var t = Math.tan(angle);
        this.apply(1, t, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      },
      /**
       * @member PMatrix3D
       * The skewY() function skews the matrix along the y-axis the amount specified by the angle parameter.
       * Angles should be specified in radians (values from 0 to PI*2) or converted to radians with the <b>radians()</b> function.
       *
       * @param {float} angle  angle of skew specified in radians
       */
      skewY: function(angle) {
        var t = Math.tan(angle);
        this.apply(1, 0, 0, 0, t, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      },
      multX: function(x, y, z, w) {
        if (!z) {
          return this.elements[0] * x + this.elements[1] * y + this.elements[3];
        } else if (!w) {
          return this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3];
        } else {
          return this.elements[0] * x + this.elements[1] * y + this.elements[2] * z + this.elements[3] * w;
        }
      },
      multY: function(x, y, z, w) {
        if (!z) {
          return this.elements[4] * x + this.elements[5] * y + this.elements[7];
        } else if (!w) {
          return this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7];
        } else {
          return this.elements[4] * x + this.elements[5] * y + this.elements[6] * z + this.elements[7] * w;
        }
      },
      multZ: function(x, y, z, w) {
        if (!w) {
          return this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11];
        } else {
          return this.elements[8] * x + this.elements[9] * y + this.elements[10] * z + this.elements[11] * w;
        }
      },
      multW: function(x, y, z, w) {
        if (!w) {
          return this.elements[12] * x + this.elements[13] * y + this.elements[14] * z + this.elements[15];
        } else {
          return this.elements[12] * x + this.elements[13] * y + this.elements[14] * z + this.elements[15] * w;
        }
      },
      /**
       * @member PMatrix3D
       * The invert() function inverts this matrix
       *
       * @return {boolean} true if successful
       */
      invert: function() {
        var fA0 = this.elements[0] * this.elements[5] - this.elements[1] * this.elements[4];
        var fA1 = this.elements[0] * this.elements[6] - this.elements[2] * this.elements[4];
        var fA2 = this.elements[0] * this.elements[7] - this.elements[3] * this.elements[4];
        var fA3 = this.elements[1] * this.elements[6] - this.elements[2] * this.elements[5];
        var fA4 = this.elements[1] * this.elements[7] - this.elements[3] * this.elements[5];
        var fA5 = this.elements[2] * this.elements[7] - this.elements[3] * this.elements[6];
        var fB0 = this.elements[8] * this.elements[13] - this.elements[9] * this.elements[12];
        var fB1 = this.elements[8] * this.elements[14] - this.elements[10] * this.elements[12];
        var fB2 = this.elements[8] * this.elements[15] - this.elements[11] * this.elements[12];
        var fB3 = this.elements[9] * this.elements[14] - this.elements[10] * this.elements[13];
        var fB4 = this.elements[9] * this.elements[15] - this.elements[11] * this.elements[13];
        var fB5 = this.elements[10] * this.elements[15] - this.elements[11] * this.elements[14];

        // Determinant
        var fDet = fA0 * fB5 - fA1 * fB4 + fA2 * fB3 + fA3 * fB2 - fA4 * fB1 + fA5 * fB0;

        // Account for a very small value
        // return false if not successful.
        if (Math.abs(fDet) <= 1e-9) {
          return false;
        }

        var kInv = [];
        kInv[0]  = +this.elements[5] * fB5 - this.elements[6] * fB4 + this.elements[7] * fB3;
        kInv[4]  = -this.elements[4] * fB5 + this.elements[6] * fB2 - this.elements[7] * fB1;
        kInv[8]  = +this.elements[4] * fB4 - this.elements[5] * fB2 + this.elements[7] * fB0;
        kInv[12] = -this.elements[4] * fB3 + this.elements[5] * fB1 - this.elements[6] * fB0;
        kInv[1]  = -this.elements[1] * fB5 + this.elements[2] * fB4 - this.elements[3] * fB3;
        kInv[5]  = +this.elements[0] * fB5 - this.elements[2] * fB2 + this.elements[3] * fB1;
        kInv[9]  = -this.elements[0] * fB4 + this.elements[1] * fB2 - this.elements[3] * fB0;
        kInv[13] = +this.elements[0] * fB3 - this.elements[1] * fB1 + this.elements[2] * fB0;
        kInv[2]  = +this.elements[13] * fA5 - this.elements[14] * fA4 + this.elements[15] * fA3;
        kInv[6]  = -this.elements[12] * fA5 + this.elements[14] * fA2 - this.elements[15] * fA1;
        kInv[10] = +this.elements[12] * fA4 - this.elements[13] * fA2 + this.elements[15] * fA0;
        kInv[14] = -this.elements[12] * fA3 + this.elements[13] * fA1 - this.elements[14] * fA0;
        kInv[3]  = -this.elements[9] * fA5 + this.elements[10] * fA4 - this.elements[11] * fA3;
        kInv[7]  = +this.elements[8] * fA5 - this.elements[10] * fA2 + this.elements[11] * fA1;
        kInv[11] = -this.elements[8] * fA4 + this.elements[9] * fA2 - this.elements[11] * fA0;
        kInv[15] = +this.elements[8] * fA3 - this.elements[9] * fA1 + this.elements[10] * fA0;

        // Inverse using Determinant
        var fInvDet = 1.0 / fDet;
        kInv[0]  *= fInvDet;
        kInv[1]  *= fInvDet;
        kInv[2]  *= fInvDet;
        kInv[3]  *= fInvDet;
        kInv[4]  *= fInvDet;
        kInv[5]  *= fInvDet;
        kInv[6]  *= fInvDet;
        kInv[7]  *= fInvDet;
        kInv[8]  *= fInvDet;
        kInv[9]  *= fInvDet;
        kInv[10] *= fInvDet;
        kInv[11] *= fInvDet;
        kInv[12] *= fInvDet;
        kInv[13] *= fInvDet;
        kInv[14] *= fInvDet;
        kInv[15] *= fInvDet;

        this.elements = kInv.slice();
        return true;
      },
      toString: function() {
        var str = "";
        for (var i = 0; i < 15; i++) {
          str += this.elements[i] + ", ";
        }
        str += this.elements[15];
        return str;
      },
      /**
       * @member PMatrix3D
       * The print() function prints out the elements of this matrix
       */
      print: function() {
        var digits = printMatrixHelper(this.elements);

        var output = "" + p.nfs(this.elements[0], digits, 4) + " " + p.nfs(this.elements[1], digits, 4) +
                     " " + p.nfs(this.elements[2], digits, 4) + " " + p.nfs(this.elements[3], digits, 4) +
                     "\n" + p.nfs(this.elements[4], digits, 4) + " " + p.nfs(this.elements[5], digits, 4) +
                     " " + p.nfs(this.elements[6], digits, 4) + " " + p.nfs(this.elements[7], digits, 4) +
                     "\n" + p.nfs(this.elements[8], digits, 4) + " " + p.nfs(this.elements[9], digits, 4) +
                     " " + p.nfs(this.elements[10], digits, 4) + " " + p.nfs(this.elements[11], digits, 4) +
                     "\n" + p.nfs(this.elements[12], digits, 4) + " " + p.nfs(this.elements[13], digits, 4) +
                     " " + p.nfs(this.elements[14], digits, 4) + " " + p.nfs(this.elements[15], digits, 4) + "\n\n";
        p.println(output);
      },
      invTranslate: function(tx, ty, tz) {
        this.preApply(1, 0, 0, -tx, 0, 1, 0, -ty, 0, 0, 1, -tz, 0, 0, 0, 1);
      },
      invRotateX: function(angle) {
        var c = Math.cos(-angle);
        var s = Math.sin(-angle);
        this.preApply([1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1]);
      },
      invRotateY: function(angle) {
        var c = Math.cos(-angle);
        var s = Math.sin(-angle);
        this.preApply([c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1]);
      },
      invRotateZ: function(angle) {
        var c = Math.cos(-angle);
        var s = Math.sin(-angle);
        this.preApply([c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      },
      invScale: function(x, y, z) {
        this.preApply([1 / x, 0, 0, 0, 0, 1 / y, 0, 0, 0, 0, 1 / z, 0, 0, 0, 0, 1]);
      }
    };

    /**
     * @private
     * The matrix stack stores the transformations and translations that occur within the space.
     */
    var PMatrixStack = p.PMatrixStack = function() {
      this.matrixStack = [];
    };

    /**
     * @member PMatrixStack
     * load pushes the matrix given in the function into the stack
     *
     * @param {Object | Array} matrix the matrix to be pushed into the stack
     */
    PMatrixStack.prototype.load = function() {
      var tmpMatrix = drawing.$newPMatrix();

      if (arguments.length === 1) {
        tmpMatrix.set(arguments[0]);
      } else {
        tmpMatrix.set(arguments);
      }
      this.matrixStack.push(tmpMatrix);
    };

    Drawing2D.prototype.$newPMatrix = function() {
      return new PMatrix2D();
    };

    Drawing3D.prototype.$newPMatrix = function() {
      return new PMatrix3D();
    };

    /**
     * @member PMatrixStack
     * push adds a duplicate of the top of the stack onto the stack - uses the peek function
     */
    PMatrixStack.prototype.push = function() {
      this.matrixStack.push(this.peek());
    };

    /**
     * @member PMatrixStack
     * pop removes returns the matrix at the top of the stack
     *
     * @returns {Object} the matrix at the top of the stack
     */
    PMatrixStack.prototype.pop = function() {
      return this.matrixStack.pop();
    };

    /**
     * @member PMatrixStack
     * peek returns but doesn't remove the matrix at the top of the stack
     *
     * @returns {Object} the matrix at the top of the stack
     */
    PMatrixStack.prototype.peek = function() {
      var tmpMatrix = drawing.$newPMatrix();

      tmpMatrix.set(this.matrixStack[this.matrixStack.length - 1]);
      return tmpMatrix;
    };

    /**
     * @member PMatrixStack
     * this function multiplies the matrix at the top of the stack with the matrix given as a parameter
     *
     * @param {Object | Array} matrix the matrix to be multiplied into the stack
     */
    PMatrixStack.prototype.mult = function(matrix) {
      this.matrixStack[this.matrixStack.length - 1].apply(matrix);
    };

    ////////////////////////////////////////////////////////////////////////////
    // Array handling
    ////////////////////////////////////////////////////////////////////////////

    /**
    * The split() function breaks a string into pieces using a character or string
    * as the divider. The delim  parameter specifies the character or characters that
    * mark the boundaries between each piece. A String[] array is returned that contains
    * each of the pieces.
    * If the result is a set of numbers, you can convert the String[] array to to a float[]
    * or int[] array using the datatype conversion functions int() and float() (see example above).
    * The splitTokens() function works in a similar fashion, except that it splits using a range
    * of characters instead of a specific character or sequence.
    *
    * @param {String} str       the String to be split
    * @param {String} delim     the character or String used to separate the data
    *
    * @returns {string[]} The new string array
    *
    * @see splitTokens
    * @see join
    * @see trim
    */
    p.split = function(str, delim) {
      return str.split(delim);
    };

    /**
    * The splitTokens() function splits a String at one or many character "tokens." The tokens
    * parameter specifies the character or characters to be used as a boundary.
    * If no tokens character is specified, any whitespace character is used to split.
    * Whitespace characters include tab (\t), line feed (\n), carriage return (\r), form
    * feed (\f), and space. To convert a String to an array of integers or floats, use the
    * datatype conversion functions int() and float() to convert the array of Strings.
    *
    * @param {String} str       the String to be split
    * @param {Char[]} tokens    list of individual characters that will be used as separators
    *
    * @returns {string[]} The new string array
    *
    * @see split
    * @see join
    * @see trim
    */
    p.splitTokens = function(str, tokens) {
      if (arguments.length === 1) {
        tokens = "\n\t\r\f ";
      }

      tokens = "[" + tokens + "]";

      var ary = [];
      var index = 0;
      var pos = str.search(tokens);

      while (pos >= 0) {
        if (pos === 0) {
          str = str.substring(1);
        } else {
          ary[index] = str.substring(0, pos);
          index++;
          str = str.substring(pos);
        }
        pos = str.search(tokens);
      }

      if (str.length > 0) {
        ary[index] = str;
      }

      if (ary.length === 0) {
        ary = undef;
      }

      return ary;
    };

    /**
    * Expands an array by one element and adds data to the new position. The datatype of
    * the element parameter must be the same as the datatype of the array.
    * When using an array of objects, the data returned from the function must be cast to
    * the object array's data type. For example: SomeClass[] items = (SomeClass[])
    * append(originalArray, element).
    *
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} array boolean[],
    * byte[], char[], int[], float[], or String[], or an array of objects
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} element new data for the array
    *
    * @returns Array (the same datatype as the input)
    *
    * @see shorten
    * @see expand
    */
    p.append = function(array, element) {
      array[array.length] = element;
      return array;
    };

    /**
    * Concatenates two arrays. For example, concatenating the array { 1, 2, 3 } and the
    * array { 4, 5, 6 } yields { 1, 2, 3, 4, 5, 6 }. Both parameters must be arrays of the
    * same datatype.
    * When using an array of objects, the data returned from the function must be cast to the
    * object array's data type. For example: SomeClass[] items = (SomeClass[]) concat(array1, array2).
    *
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} array1 boolean[],
    * byte[], char[], int[], float[], String[], or an array of objects
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} array2 boolean[],
    * byte[], char[], int[], float[], String[], or an array of objects
    *
    * @returns Array (the same datatype as the input)
    *
    * @see splice
    */
    p.concat = function(array1, array2) {
      return array1.concat(array2);
    };

    /**
     * Sorts an array of numbers from smallest to largest and puts an array of
     * words in alphabetical order. The original array is not modified, a
     * re-ordered array is returned. The count parameter states the number of
     * elements to sort. For example if there are 12 elements in an array and
     * if count is the value 5, only the first five elements on the array will
     * be sorted. Alphabetical ordering is case insensitive.
     *
     * @param {String[] | int[] | float[]}  array Array of elements to sort
     * @param {int}                         numElem Number of elements to sort
     *
     * @returns {String[] | int[] | float[]} Array (same datatype as the input)
     *
     * @see reverse
    */
    p.sort = function(array, numElem) {
      var ret = [];

      // depending on the type used (int, float) or string
      // we'll need to use a different compare function
      if (array.length > 0) {
        // copy since we need to return another array
        var elemsToCopy = numElem > 0 ? numElem : array.length;
        for (var i = 0; i < elemsToCopy; i++) {
          ret.push(array[i]);
        }
        if (typeof array[0] === "string") {
          ret.sort();
        }
        // int or float
        else {
          ret.sort(function(a, b) {
            return a - b;
          });
        }

        // copy on the rest of the elements that were not sorted in case the user
        // only wanted a subset of an array to be sorted.
        if (numElem > 0) {
          for (var j = ret.length; j < array.length; j++) {
            ret.push(array[j]);
          }
        }
      }
      return ret;
    };

    /**
    * Inserts a value or array of values into an existing array. The first two parameters must
    * be of the same datatype. The array parameter defines the array which will be modified
    * and the second parameter defines the data which will be inserted. When using an array
    * of objects, the data returned from the function must be cast to the object array's data
    * type. For example: SomeClass[] items = (SomeClass[]) splice(array1, array2, index).
    *
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} array boolean[],
    * byte[], char[], int[], float[], String[], or an array of objects
    * @param {boolean|byte|char|int|float|String|boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects}
    * value boolean, byte, char, int, float, String, boolean[], byte[], char[], int[],
    * float[], String[], or other Object: value or an array of objects to be spliced in
    * @param {int} index                position in the array from which to insert data
    *
    * @returns Array (the same datatype as the input)
    *
    * @see contract
    * @see subset
    */
    p.splice = function(array, value, index) {

      // Trying to splice an empty array into "array" in P5 won't do
      // anything, just return the original.
      if(value.length === 0)
      {
        return array;
      }

      // If the second argument was an array, we'll need to iterate over all
      // the "value" elements and add one by one because
      // array.splice(index, 0, value);
      // would create a multi-dimensional array which isn't what we want.
      if(value instanceof Array) {
        for(var i = 0, j = index; i < value.length; j++,i++) {
          array.splice(j, 0, value[i]);
        }
      } else {
        array.splice(index, 0, value);
      }

      return array;
    };

    /**
    * Extracts an array of elements from an existing array. The array parameter defines the
    * array from which the elements will be copied and the offset and length parameters determine
    * which elements to extract. If no length is given, elements will be extracted from the offset
    * to the end of the array. When specifying the offset remember the first array element is 0.
    * This function does not change the source array.
    * When using an array of objects, the data returned from the function must be cast to the
    * object array's data type.
    *
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} array boolean[],
    * byte[], char[], int[], float[], String[], or an array of objects
    * @param {int} offset         position to begin
    * @param {int} length         number of values to extract
    *
    * @returns Array (the same datatype as the input)
    *
    * @see splice
    */
    p.subset = function(array, offset, length) {
      if (arguments.length === 2) {
        return array.slice(offset, array.length);
      } else if (arguments.length === 3) {
        return array.slice(offset, offset + length);
      }
    };

    /**
    * Combines an array of Strings into one String, each separated by the character(s) used for
    * the separator parameter. To join arrays of ints or floats, it's necessary to first convert
    * them to strings using nf() or nfs().
    *
    * @param {Array} array              array of Strings
    * @param {char|String} separator    char or String to be placed between each item
    *
    * @returns {String} The combined string
    *
    * @see split
    * @see trim
    * @see nf
    * @see nfs
    */
    p.join = function(array, seperator) {
      return array.join(seperator);
    };

    /**
    * Decreases an array by one element and returns the shortened array. When using an
    * array of objects, the data returned from the function must be cast to the object array's
    * data type. For example: SomeClass[] items = (SomeClass[]) shorten(originalArray).
    *
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} array
    * boolean[], byte[], char[], int[], float[], or String[], or an array of objects
    *
    * @returns Array (the same datatype as the input)
    *
    * @see append
    * @see expand
    */
    p.shorten = function(ary) {
      var newary = [];

      // copy array into new array
      var len = ary.length;
      for (var i = 0; i < len; i++) {
        newary[i] = ary[i];
      }
      newary.pop();

      return newary;
    };

    /**
    * Increases the size of an array. By default, this function doubles the size of the array,
    * but the optional newSize parameter provides precise control over the increase in size.
    * When using an array of objects, the data returned from the function must be cast to the
    * object array's data type. For example: SomeClass[] items = (SomeClass[]) expand(originalArray).
    *
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]|array of objects} ary
    * boolean[], byte[], char[], int[], float[], String[], or an array of objects
    * @param {int} newSize              positive int: new size for the array
    *
    * @returns Array (the same datatype as the input)
    *
    * @see contract
    */
    p.expand = function(ary, newSize) {
      var temp = ary.slice(0);
      if (arguments.length === 1) {
        // double size of array
        temp.length = ary.length * 2;
        return temp;
      } else if (arguments.length === 2) {
        // size is newSize
        temp.length = newSize;
        return temp;
      }
    };

    /**
    * Copies an array (or part of an array) to another array. The src array is copied to the
    * dst array, beginning at the position specified by srcPos and into the position specified
    * by dstPos. The number of elements to copy is determined by length. The simplified version
    * with two arguments copies an entire array to another of the same size. It is equivalent
    * to "arrayCopy(src, 0, dst, 0, src.length)". This function is far more efficient for copying
    * array data than iterating through a for and copying each element.
    *
    * @param {Array} src an array of any data type: the source array
    * @param {Array} dest an array of any data type (as long as it's the same as src): the destination array
    * @param {int} srcPos     starting position in the source array
    * @param {int} destPos    starting position in the destination array
    * @param {int} length     number of array elements to be copied
    *
    * @returns none
    */
    p.arrayCopy = function() { // src, srcPos, dest, destPos, length) {
      var src, srcPos = 0, dest, destPos = 0, length;

      if (arguments.length === 2) {
        // recall itself and copy src to dest from start index 0 to 0 of src.length
        src = arguments[0];
        dest = arguments[1];
        length = src.length;
      } else if (arguments.length === 3) {
        // recall itself and copy src to dest from start index 0 to 0 of length
        src = arguments[0];
        dest = arguments[1];
        length = arguments[2];
      } else if (arguments.length === 5) {
        src = arguments[0];
        srcPos = arguments[1];
        dest = arguments[2];
        destPos = arguments[3];
        length = arguments[4];
      }

      // copy src to dest from index srcPos to index destPos of length recursivly on objects
      for (var i = srcPos, j = destPos; i < length + srcPos; i++, j++) {
        if (dest[j] !== undef) {
          dest[j] = src[i];
        } else {
          throw "array index out of bounds exception";
        }
      }
    };

    /**
    * Reverses the order of an array.
    *
    * @param {boolean[]|byte[]|char[]|int[]|float[]|String[]} array
    * boolean[], byte[], char[], int[], float[], or String[]
    *
    * @returns Array (the same datatype as the input)
    *
    * @see sort
    */
    p.reverse = function(array) {
      return array.reverse();
    };


    ////////////////////////////////////////////////////////////////////////////
    // Color functions
    ////////////////////////////////////////////////////////////////////////////

    // helper functions for internal blending modes
    p.mix = function(a, b, f) {
      return a + (((b - a) * f) >> 8);
    };

    p.peg = function(n) {
      return (n < 0) ? 0 : ((n > 255) ? 255 : n);
    };

    // blending modes
    /**
    * These are internal blending modes used for BlendColor()
    *
    * @param {Color} c1       First Color to blend
    * @param {Color} c2       Second Color to blend
    *
    * @returns {Color}        The blended Color
    *
    * @see BlendColor
    * @see Blend
    */
    p.modes = {
      replace: function(c1, c2) {
        return c2;
      },
      blend: function(c1, c2) {
        var f = (c2 & PConstants.ALPHA_MASK) >>> 24;
        return (Math.min(((c1 & PConstants.ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                p.mix(c1 & PConstants.RED_MASK, c2 & PConstants.RED_MASK, f) & PConstants.RED_MASK |
                p.mix(c1 & PConstants.GREEN_MASK, c2 & PConstants.GREEN_MASK, f) & PConstants.GREEN_MASK |
                p.mix(c1 & PConstants.BLUE_MASK, c2 & PConstants.BLUE_MASK, f));
      },
      add: function(c1, c2) {
        var f = (c2 & PConstants.ALPHA_MASK) >>> 24;
        return (Math.min(((c1 & PConstants.ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                Math.min(((c1 & PConstants.RED_MASK) + ((c2 & PConstants.RED_MASK) >> 8) * f), PConstants.RED_MASK) & PConstants.RED_MASK |
                Math.min(((c1 & PConstants.GREEN_MASK) + ((c2 & PConstants.GREEN_MASK) >> 8) * f), PConstants.GREEN_MASK) & PConstants.GREEN_MASK |
                Math.min((c1 & PConstants.BLUE_MASK) + (((c2 & PConstants.BLUE_MASK) * f) >> 8), PConstants.BLUE_MASK));
      },
      subtract: function(c1, c2) {
        var f = (c2 & PConstants.ALPHA_MASK) >>> 24;
        return (Math.min(((c1 & PConstants.ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                Math.max(((c1 & PConstants.RED_MASK) - ((c2 & PConstants.RED_MASK) >> 8) * f), PConstants.GREEN_MASK) & PConstants.RED_MASK |
                Math.max(((c1 & PConstants.GREEN_MASK) - ((c2 & PConstants.GREEN_MASK) >> 8) * f), PConstants.BLUE_MASK) & PConstants.GREEN_MASK |
                Math.max((c1 & PConstants.BLUE_MASK) - (((c2 & PConstants.BLUE_MASK) * f) >> 8), 0));
      },
      lightest: function(c1, c2) {
        var f = (c2 & PConstants.ALPHA_MASK) >>> 24;
        return (Math.min(((c1 & PConstants.ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                Math.max(c1 & PConstants.RED_MASK, ((c2 & PConstants.RED_MASK) >> 8) * f) & PConstants.RED_MASK |
                Math.max(c1 & PConstants.GREEN_MASK, ((c2 & PConstants.GREEN_MASK) >> 8) * f) & PConstants.GREEN_MASK |
                Math.max(c1 & PConstants.BLUE_MASK, ((c2 & PConstants.BLUE_MASK) * f) >> 8));
      },
      darkest: function(c1, c2) {
        var f = (c2 & PConstants.ALPHA_MASK) >>> 24;
        return (Math.min(((c1 & PConstants.ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                p.mix(c1 & PConstants.RED_MASK, Math.min(c1 & PConstants.RED_MASK, ((c2 & PConstants.RED_MASK) >> 8) * f), f) & PConstants.RED_MASK |
                p.mix(c1 & PConstants.GREEN_MASK, Math.min(c1 & PConstants.GREEN_MASK, ((c2 & PConstants.GREEN_MASK) >> 8) * f), f) & PConstants.GREEN_MASK |
                p.mix(c1 & PConstants.BLUE_MASK, Math.min(c1 & PConstants.BLUE_MASK, ((c2 & PConstants.BLUE_MASK) * f) >> 8), f));
      },
      difference: function(c1, c2) {
        var f  = (c2 & PConstants.ALPHA_MASK) >>> 24;
        var ar = (c1 & PConstants.RED_MASK) >> 16;
        var ag = (c1 & PConstants.GREEN_MASK) >> 8;
        var ab = (c1 & PConstants.BLUE_MASK);
        var br = (c2 & PConstants.RED_MASK) >> 16;
        var bg = (c2 & PConstants.GREEN_MASK) >> 8;
        var bb = (c2 & PConstants.BLUE_MASK);
        // formula:
        var cr = (ar > br) ? (ar - br) : (br - ar);
        var cg = (ag > bg) ? (ag - bg) : (bg - ag);
        var cb = (ab > bb) ? (ab - bb) : (bb - ab);
        // alpha blend (this portion will always be the same)
        return (Math.min(((c1 & PConstants.ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                (p.peg(ar + (((cr - ar) * f) >> 8)) << 16) |
                (p.peg(ag + (((cg - ag) * f) >> 8)) << 8) |
                (p.peg(ab + (((cb - ab) * f) >> 8))));
      },
      exclusion: function(c1, c2) {
        var f  = (c2 & PConstants.ALPHA_MASK) >>> 24;
        var ar = (c1 & PConstants.RED_MASK) >> 16;
        var ag = (c1 & PConstants.GREEN_MASK) >> 8;
        var ab = (c1 & PConstants.BLUE_MASK);
        var br = (c2 & PConstants.RED_MASK) >> 16;
        var bg = (c2 & PConstants.GREEN_MASK) >> 8;
        var bb = (c2 & PConstants.BLUE_MASK);
        // formula:
        var cr = ar + br - ((ar * br) >> 7);
        var cg = ag + bg - ((ag * bg) >> 7);
        var cb = ab + bb - ((ab * bb) >> 7);
        // alpha blend (this portion will always be the same)
        return (Math.min(((c1 & PConstants.ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                (p.peg(ar + (((cr - ar) * f) >> 8)) << 16) |
                (p.peg(ag + (((cg - ag) * f) >> 8)) << 8) |
                (p.peg(ab + (((cb - ab) * f) >> 8))));
      },
      multiply: function(c1, c2) {
        var f  = (c2 & PConstants.ALPHA_MASK) >>> 24;
        var ar = (c1 & PConstants.RED_MASK) >> 16;
        var ag = (c1 & PConstants.GREEN_MASK) >> 8;
        var ab = (c1 & PConstants.BLUE_MASK);
        var br = (c2 & PConstants.RED_MASK) >> 16;
        var bg = (c2 & PConstants.GREEN_MASK) >> 8;
        var bb = (c2 & PConstants.BLUE_MASK);
        // formula:
        var cr = (ar * br) >> 8;
        var cg = (ag * bg) >> 8;
        var cb = (ab * bb) >> 8;
        // alpha blend (this portion will always be the same)
        return (Math.min(((c1 & PConstants.ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                (p.peg(ar + (((cr - ar) * f) >> 8)) << 16) |
                (p.peg(ag + (((cg - ag) * f) >> 8)) << 8) |
                (p.peg(ab + (((cb - ab) * f) >> 8))));
      },
      screen: function(c1, c2) {
        var f  = (c2 & PConstants.ALPHA_MASK) >>> 24;
        var ar = (c1 & PConstants.RED_MASK) >> 16;
        var ag = (c1 & PConstants.GREEN_MASK) >> 8;
        var ab = (c1 & PConstants.BLUE_MASK);
        var br = (c2 & PConstants.RED_MASK) >> 16;
        var bg = (c2 & PConstants.GREEN_MASK) >> 8;
        var bb = (c2 & PConstants.BLUE_MASK);
        // formula:
        var cr = 255 - (((255 - ar) * (255 - br)) >> 8);
        var cg = 255 - (((255 - ag) * (255 - bg)) >> 8);
        var cb = 255 - (((255 - ab) * (255 - bb)) >> 8);
        // alpha blend (this portion will always be the same)
        return (Math.min(((c1 & PConstants.ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                (p.peg(ar + (((cr - ar) * f) >> 8)) << 16) |
                (p.peg(ag + (((cg - ag) * f) >> 8)) << 8) |
                (p.peg(ab + (((cb - ab) * f) >> 8))));
      },
      hard_light: function(c1, c2) {
        var f  = (c2 & PConstants.ALPHA_MASK) >>> 24;
        var ar = (c1 & PConstants.RED_MASK) >> 16;
        var ag = (c1 & PConstants.GREEN_MASK) >> 8;
        var ab = (c1 & PConstants.BLUE_MASK);
        var br = (c2 & PConstants.RED_MASK) >> 16;
        var bg = (c2 & PConstants.GREEN_MASK) >> 8;
        var bb = (c2 & PConstants.BLUE_MASK);
        // formula:
        var cr = (br < 128) ? ((ar * br) >> 7) : (255 - (((255 - ar) * (255 - br)) >> 7));
        var cg = (bg < 128) ? ((ag * bg) >> 7) : (255 - (((255 - ag) * (255 - bg)) >> 7));
        var cb = (bb < 128) ? ((ab * bb) >> 7) : (255 - (((255 - ab) * (255 - bb)) >> 7));
        // alpha blend (this portion will always be the same)
        return (Math.min(((c1 & PConstants.ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                (p.peg(ar + (((cr - ar) * f) >> 8)) << 16) |
                (p.peg(ag + (((cg - ag) * f) >> 8)) << 8) |
                (p.peg(ab + (((cb - ab) * f) >> 8))));
      },
      soft_light: function(c1, c2) {
        var f  = (c2 & PConstants.ALPHA_MASK) >>> 24;
        var ar = (c1 & PConstants.RED_MASK) >> 16;
        var ag = (c1 & PConstants.GREEN_MASK) >> 8;
        var ab = (c1 & PConstants.BLUE_MASK);
        var br = (c2 & PConstants.RED_MASK) >> 16;
        var bg = (c2 & PConstants.GREEN_MASK) >> 8;
        var bb = (c2 & PConstants.BLUE_MASK);
        // formula:
        var cr = ((ar * br) >> 7) + ((ar * ar) >> 8) - ((ar * ar * br) >> 15);
        var cg = ((ag * bg) >> 7) + ((ag * ag) >> 8) - ((ag * ag * bg) >> 15);
        var cb = ((ab * bb) >> 7) + ((ab * ab) >> 8) - ((ab * ab * bb) >> 15);
        // alpha blend (this portion will always be the same)
        return (Math.min(((c1 & PConstants.ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                (p.peg(ar + (((cr - ar) * f) >> 8)) << 16) |
                (p.peg(ag + (((cg - ag) * f) >> 8)) << 8) |
                (p.peg(ab + (((cb - ab) * f) >> 8))));
      },
      overlay: function(c1, c2) {
        var f  = (c2 & PConstants.ALPHA_MASK) >>> 24;
        var ar = (c1 & PConstants.RED_MASK) >> 16;
        var ag = (c1 & PConstants.GREEN_MASK) >> 8;
        var ab = (c1 & PConstants.BLUE_MASK);
        var br = (c2 & PConstants.RED_MASK) >> 16;
        var bg = (c2 & PConstants.GREEN_MASK) >> 8;
        var bb = (c2 & PConstants.BLUE_MASK);
        // formula:
        var cr = (ar < 128) ? ((ar * br) >> 7) : (255 - (((255 - ar) * (255 - br)) >> 7));
        var cg = (ag < 128) ? ((ag * bg) >> 7) : (255 - (((255 - ag) * (255 - bg)) >> 7));
        var cb = (ab < 128) ? ((ab * bb) >> 7) : (255 - (((255 - ab) * (255 - bb)) >> 7));
        // alpha blend (this portion will always be the same)
        return (Math.min(((c1 & PConstants.ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                (p.peg(ar + (((cr - ar) * f) >> 8)) << 16) |
                (p.peg(ag + (((cg - ag) * f) >> 8)) << 8) |
                (p.peg(ab + (((cb - ab) * f) >> 8))));
      },
      dodge: function(c1, c2) {
        var f  = (c2 & PConstants.ALPHA_MASK) >>> 24;
        var ar = (c1 & PConstants.RED_MASK) >> 16;
        var ag = (c1 & PConstants.GREEN_MASK) >> 8;
        var ab = (c1 & PConstants.BLUE_MASK);
        var br = (c2 & PConstants.RED_MASK) >> 16;
        var bg = (c2 & PConstants.GREEN_MASK) >> 8;
        var bb = (c2 & PConstants.BLUE_MASK);
        // formula:
        var cr = (br === 255) ? 255 : p.peg((ar << 8) / (255 - br)); // division requires pre-peg()-ing
        var cg = (bg === 255) ? 255 : p.peg((ag << 8) / (255 - bg)); // "
        var cb = (bb === 255) ? 255 : p.peg((ab << 8) / (255 - bb)); // "
        // alpha blend (this portion will always be the same)
        return (Math.min(((c1 & PConstants.ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                (p.peg(ar + (((cr - ar) * f) >> 8)) << 16) |
                (p.peg(ag + (((cg - ag) * f) >> 8)) << 8) |
                (p.peg(ab + (((cb - ab) * f) >> 8))));
      },
      burn: function(c1, c2) {
        var f  = (c2 & PConstants.ALPHA_MASK) >>> 24;
        var ar = (c1 & PConstants.RED_MASK) >> 16;
        var ag = (c1 & PConstants.GREEN_MASK) >> 8;
        var ab = (c1 & PConstants.BLUE_MASK);
        var br = (c2 & PConstants.RED_MASK) >> 16;
        var bg = (c2 & PConstants.GREEN_MASK) >> 8;
        var bb = (c2 & PConstants.BLUE_MASK);
        // formula:
        var cr = (br === 0) ? 0 : 255 - p.peg(((255 - ar) << 8) / br); // division requires pre-peg()-ing
        var cg = (bg === 0) ? 0 : 255 - p.peg(((255 - ag) << 8) / bg); // "
        var cb = (bb === 0) ? 0 : 255 - p.peg(((255 - ab) << 8) / bb); // "
        // alpha blend (this portion will always be the same)
        return (Math.min(((c1 & PConstants.ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                (p.peg(ar + (((cr - ar) * f) >> 8)) << 16) |
                (p.peg(ag + (((cg - ag) * f) >> 8)) << 8) |
                (p.peg(ab + (((cb - ab) * f) >> 8))));
      }
    };

    function color$4(aValue1, aValue2, aValue3, aValue4) {
      var r, g, b, a;

      if (curColorMode === PConstants.HSB) {
        var rgb = p.color.toRGB(aValue1, aValue2, aValue3);
        r = rgb[0];
        g = rgb[1];
        b = rgb[2];
      } else {
        r = Math.round(255 * (aValue1 / colorModeX));
        g = Math.round(255 * (aValue2 / colorModeY));
        b = Math.round(255 * (aValue3 / colorModeZ));
      }

      a = Math.round(255 * (aValue4 / colorModeA));

      // Limit values greater than 255
      r = (r > 255) ? 255 : r;
      g = (g > 255) ? 255 : g;
      b = (b > 255) ? 255 : b;
      a = (a > 255) ? 255 : a;

      // Create color int
      return (a << 24) & PConstants.ALPHA_MASK | (r << 16) & PConstants.RED_MASK | (g << 8) & PConstants.GREEN_MASK | b & PConstants.BLUE_MASK;
    }

    function color$2(aValue1, aValue2) {
      var a;

      // Color int and alpha
      if (aValue1 & PConstants.ALPHA_MASK) {
        a = Math.round(255 * (aValue2 / colorModeA));
        a = (a > 255) ? 255 : a;

        return aValue1 - (aValue1 & PConstants.ALPHA_MASK) + ((a << 24) & PConstants.ALPHA_MASK);
      }
      // Grayscale and alpha
      else {
        if (curColorMode === PConstants.RGB) {
          return color$4(aValue1, aValue1, aValue1, aValue2);
        } else if (curColorMode === PConstants.HSB) {
          return color$4(0, 0, (aValue1 / colorModeX) * colorModeZ, aValue2);
        }
      }
    }

    function color$1(aValue1) {
      // Grayscale
      if (aValue1 <= colorModeX && aValue1 >= 0) {
          if (curColorMode === PConstants.RGB) {
            return color$4(aValue1, aValue1, aValue1, colorModeA);
          } else if (curColorMode === PConstants.HSB) {
            return color$4(0, 0, (aValue1 / colorModeX) * colorModeZ, colorModeA);
          }
      }
      // Color int
      else if (aValue1) {
        return aValue1;
      }
    }

    /**
    * Creates colors for storing in variables of the color datatype. The parameters are
    * interpreted as RGB or HSB values depending on the current colorMode(). The default
    * mode is RGB values from 0 to 255 and therefore, the function call color(255, 204, 0)
    * will return a bright yellow color. More about how colors are stored can be found in
    * the reference for the color datatype.
    *
    * @param {int|float} aValue1        red or hue or grey values relative to the current color range.
    * Also can be color value in hexadecimal notation (i.e. #FFCC00 or 0xFFFFCC00)
    * @param {int|float} aValue2        green or saturation values relative to the current color range
    * @param {int|float} aValue3        blue or brightness values relative to the current color range
    * @param {int|float} aValue4        relative to current color range. Represents alpha
    *
    * @returns {color} the color
    *
    * @see colorMode
    */
    p.color = function(aValue1, aValue2, aValue3, aValue4) {

      // 4 arguments: (R, G, B, A) or (H, S, B, A)
      if (aValue1 !== undef && aValue2 !== undef && aValue3 !== undef && aValue4 !== undef) {
        return color$4(aValue1, aValue2, aValue3, aValue4);
      }

      // 3 arguments: (R, G, B) or (H, S, B)
      if (aValue1 !== undef && aValue2 !== undef && aValue3 !== undef) {
        return color$4(aValue1, aValue2, aValue3, colorModeA);
      }

      // 2 arguments: (Color, A) or (Grayscale, A)
      if (aValue1 !== undef && aValue2 !== undef) {
        return color$2(aValue1, aValue2);
      }

      // 1 argument: (Grayscale) or (Color)
      if (typeof aValue1 === "number") {
       