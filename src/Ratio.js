/**
* @project Ratio.js
* @purpose Provides a Ratio(Fraction) object for Javascript. Similar to Fraction.py for Python.
* @author Larry Battle , <http://bateru.com/news/>
* @license MIT and GPL 3.0
    MIT License <http://www.opensource.org/licenses/mit-license>
    GPL v3 <http://opensource.org/licenses/GPL-3.0>
* @info Project page: <https://github.com/LarryBattle/Ratio.js/>
* @version 0.2, 2012.06.13
 */
 
/**
* Ratio is an object that has a numerator and denominator, corresponding to a/b.<br/>
* Note: The keyword `new` is not required to create a new instance of the Ratio object, since this is done for you.<br/>
* In otherwords, `new Ratio( value )` is the same as `Ratio( value )`.
* 
* @constructor
* @param {Ratio|String|Number} a - can be a Ratio object or numeric value.
* @param {Ratio|String|Number} b - can be a Ratio object or numeric value.
* @param {String} type - can be either a "string" or "decimal". `type` forces a type on the Ratio object.
* @param {Boolean} alwaysReduce - If true, then the Ratio object and the child of it will always represent the simplified form of the rational.
* @returns {Ratio} object that has a numerator and denominator, corresponding to a/b.
* @example Ratio(2,4).toString() == Ratio("2/4").toString() == "2/4"
*/
var Ratio = function (a, b, alwaysReduce) {
    if(!(this instanceof Ratio)){
        return new Ratio(a, b, alwaysReduce);
    }
    this.divSign = "/";
    this.alwaysReduce = !!alwaysReduce;
    this.type = "";
    this.denominator = isNaN("" + b) ? 1 : Math.abs(b);
    this.numerator = isNaN("" + a) ? 0 : Ratio.getNumeratorWithSign(a,(b||1));
    if( this.denominator && this.alwaysReduce ){
		var arr = Ratio.reduce(this);
		this.numerator = arr[0];
		this.denominator = arr[1];
	}
	return this;
};
/**
* Version number of Ratio.js
*/
Ratio.VERSION = "0.2";
/**
* Checks if value is a finite number. <br/> Borrowed from jQuery 1.7.2 <br/>
*
* @param {Object} obj
* @returns {Boolean}
* @example Ratio.isNumeric("1.0e3") == true
*/
Ratio.isNumeric = function (obj) {
    return !isNaN(parseFloat(obj)) && isFinite(obj);
};
/**
* Returns the default value is the provides new value is undefined or null. Similar to `var a = (b || c)`.
*
* @param {Object} backup
* @param {Object} value
* @returns {Object}
* @example Ratio.getValueIfDefined( 4, null ) == 4
*/
Ratio.getValueIfDefined = function( backup, value ){
	return typeof value !== "undefined" && value !== null ? value : backup;
};
/**
* Find the Greatest Common Factor between two numbers using "Euler Method".
*
* @param {Number} a
* @returns {Number} b
* @example Ratio.gcd(20,12) == 4
*/
Ratio.gcd = function (a, b) {
    var c;
    b = (+b && +a) ? +b : 0;
    a = b ? a : 1;
    while (b) {
        c = a % b;
        a = b;
        b = c;
    }
    return Math.abs(a);
};
/**
* Returns the numerator with the corresponding sign of (top/bottom). <br/>
* Used to force `top` to represent the sign of the Ratio.
*
* @param {Number} top
* @param {Number} bottom
* @returns {Number}
* @example Ratio.getNumeratorWithSign(1,-2) == -1
*/
Ratio.getNumeratorWithSign = function (top, bottom) {
    var x = (+top||1), y = (+bottom||1), a = "" + x*y;
    return (/\-/.test(a.charAt(0))) ? -Math.abs(+top) : Math.abs(+top);
};
/**
* Converts a decimal value to a ratio in the form of [top, bottom], such that top/bottom is the decimal value.
*  
* @param {Number|String} obj - Numeric Object containing a decimal point.
* @returns {Array[Number, Number]}
* @example Ratio.parseDecimal( "-0.25" ) // returns [-25,100]
*/
Ratio.parseDecimal = function (obj) {
    var arr = [], parts;
    if(!Ratio.isNumeric(obj)){
        return arr;
    }
    obj = +obj;
    if (/\d+\.\d+$/.test(obj)) {
        parts = obj.toString().split(/\./);
        arr[1] = Math.pow(10, parts[1].length);
        arr[0] = Math.abs(parts[0]) * arr[1] + (+parts[1]);
        arr[0] = (/\-/.test(parts[0])) ? -arr[0] : arr[0];
    }else{
        arr = [obj, 1];
    }
    return arr;
};
/**
* Converts a scientific notated value to a ratio in the for of [top, bottom], such that top/bottom is the scientific notated value.
*  
* @param {Number|String} obj - Numeric Object containing a character `e`.
* @returns {Array[Number, Number]}
* @example Ratio.parseENotation(-2.5e23) // returns [-2.5e+24, 10]
*/
Ratio.parseENotation = function (obj) {
    var arr = [], top, parts;
    if(!Ratio.isNumeric(obj)){
        return arr;
    }
    obj = +obj;
    if( /e/i.test(obj) ){
        parts = obj.toString().split(/e/i);
        top = Ratio.parseDecimal(parts[0]);
        if (Math.abs(obj) < 1) {
            arr[0] = top[0];
            arr[1] = +(top[1] + "e" + Math.abs(+parts[1]));
        } else {
            arr[0] = +(top[0] + "e" + Math.abs(+parts[1]));
            arr[1] = top[1];
        }
    }else{
        arr = Ratio.parseDecimal( obj );
    }
    return arr;
};

/**
* Bridge for Ratio.parseENotation and Ratio.parseDecimal.
*  
* @param {Number|String} obj - Numeric Object containing a character `e` or `.`.
* @returns {Array[Number, Number]}
* @example Ratio.parseNumber( NaN ) // returns [];
*/
Ratio.parseNumber = function (obj) {
    if (!Ratio.isNumeric(obj)) {
        return [];
    }
    return (/e/i.test(obj)) ? Ratio.parseENotation(obj) : Ratio.parseDecimal(obj);
};
/**
* Converts a numeric value to a Ratio in the form of [top, bottom], such that top/bottom.
*  
* @param {Number|String} obj - Numeric Object.
* @returns {Array[Number, Number]}
* @example Ratio.parseToArray( 0.125 ) // returns [125, 1000]
*/
Ratio.parseToArray = function (obj) {
    var arr = [], parts, re = /\//;
    if (typeof obj == "undefined" || obj === null) {
        return arr;
    }
    if (obj instanceof Ratio) {
        arr[0] = Ratio.getNumeratorWithSign(obj.numerator, obj.denominator);
        arr[1] = Math.abs(obj.denominator);
    } else {
        if ( re.test(obj)) {
            parts = obj.split( re );
            arr[0] = Ratio.getNumeratorWithSign(parts[0], parts[1]);
            arr[1] = Math.abs(+parts[1]);
        } else {
            arr = Ratio.parseNumber(obj);
        }
    }
    return arr;
};
/**
* Converts a numeric value to a Ratio object.
* 
* @param {Ratio|Number|String} obj
* @param {Ratio|Number|String} obj
* @returns {Ratio}
* @example 
    // Example 1:
    var a = Ratio.parse(3,4);
    var b = Ratio(3,4);
    a.equals( b ) === true;
    
    // Example 2:
    Ratio.parse( "3/4" ).numerator == "3"
*/
Ratio.parse = function (obj, obj2) {
    var arr = Ratio.parseToArray(obj), arr2;
    if ( arr.length && typeof obj2 != "undefined" && obj2 !== null) {
        arr2 = Ratio.parseToArray(obj2);
        arr[0] *= arr2[1];
        arr[1] *= arr2[0];
    }
    return new Ratio(arr[0], arr[1]);
};
/**
* Given a numerator and denominator in the form of [a,b], returns as an array of numbers.
* 
* @param {Ratio|Number|String} obj
* @param {Ratio|Number|String} obj
* @returns {Array[ Number, Number ]}
* @example 
    // Example 1:
    Ratio.reduce( Ratio(36,-36) ) // returns [-1,1]
    
    // Example 2:
    Ratio.reduce( "9/12" ) // returns [3,4]
    
    // Example 3:
    Ratio.reduce( "10/4" ).toString() // returns [5,2]
*/
Ratio.reduce = function (obj,obj2) {
	obj = Ratio.parse( obj, obj2 );
	var top = obj.numerator, bottom = obj.denominator, arr = Ratio.getRepeatProps(top/bottom);
    if ( arr.length ) {
        top = +(arr.join('')) - +(arr[0]+""+arr[1]);
        bottom = Math.pow(10, arr[1].length ) * ( Math.pow(10, arr[2].length ) - 1);
    }
    var factor = Ratio.gcd(top, bottom);
    return [ top / factor, bottom / factor ];
};
/**
* This function divides a repeating decimal into 3 parts. If the value passed is not a repeating decimal then an empty array is returned.<br/>
* For repeating decimals, the return value is an array which contains the numeric value split into 3 parts like, <br/>
* [ "numbers before decimal", "numbers before repeating pattern", "repeating pattern." ].<br/>
* Here's another explanation. <br/>
* The return value is [i, x, r] for the repeating decimal value.<br/>
* where i are the values to the left of the decimal point. <br/>
* x are the decimals to the right of the decimal point and to the left of the repeating pattern.<br/>
* r is the unique repeating patterns for the repeating decimal.<br/>
* Example. 22/7 = 3.142857142857143 = 3.14-285714-285714-3, i = 3, x = 14, r = 285714<br/>
* It should be noted that the last digit might be removed to avoid rounding errors.
* 
* @param {Number} val 
* @returns {Array[Number, Number, Number]}
* @example Ratio.getRepeatProps( 22/7 ) // returns ["3", "14", "285714"]
*/
Ratio.getRepeatProps = function( val ){
    val = ""+(val || "");
    var RE1_getRepeatDecimals = /(?:[^\.]+\.\d*)(\d{2,})+(?:\1)$/,
        arr = [], 
        match = RE1_getRepeatDecimals.exec( val ), 
        RE2_RE1AtEnd,
        RE3_RepeatingNums = /^(\d+)(?:\1)$/;
    if( !match ){
        val = val.replace( /\d$/, "" );
        match = RE1_getRepeatDecimals.exec( val );
    }
    if( match && 1 < match.length && /\.\d{10}/.test(match[0]) ){
        match[1] = RE3_RepeatingNums.test(match[1]) ? RE3_RepeatingNums.exec(match[1])[1] : match[1];
        RE2_RE1AtEnd = new RegExp( "("+ match[1] +")+$" );
        arr = val.split( /\./ ).concat( match[1] );
		arr[1] = arr[1].replace( RE2_RE1AtEnd, "" );
    }
    return arr;
};
/**
* Returns an array of the prime factors of a number. <br/> 
* More info <http://bateru.com/news/2012/05/code-of-the-day-javascript-prime-factors-of-a-number/>
* 
* @param {Number} num 
* @returns {Array[Number, Number, ... ]}
* @example Ratio.getPrimeFactors(20) // returns [2,2,5]
*/
Ratio.getPrimeFactors = function (num) {
    num = Math.floor(num);
    var root, factors = [], x, sqrt = Math.sqrt, doLoop = 1 < num && isFinite(num);
    while (doLoop) {
        root = sqrt(num);
        x = 2;
        if (num % x) {
            x = 3;
            while ((num % x) && ((x += 2) < root));

        }
        x = (x > root) ? num : x;
        factors.push(x);
        doLoop = (x != num);
        num /= x;
    }
    return factors;
};
/**
* Rounds up a scientific notated number with 8+ trailing 0s or 9s.
* Note: Returns number as string to preserve value.
*
* @param {Number} num
* @returns {String}
* @example 
	// Example 1
	Ratio.getCleanENotation( "1.1000000000000003e-30" ) === "1.1e-30";
	
	// Example 2
	Ratio.getCleanENotation( "9.999999999999999e+22" ) === "1e+23";
*/
Ratio.getCleanENotation = function(num){
	num = (+num||0).toString();
	if( /\.\d+(0|9){8,}\d?e/.test( num ) ){
		var i = num.match( /(?:\d+\.)(\d+)(?:e.*)/ )[1].replace(/(0|9)+\d$/, '').length + 1;
		num = (+num).toPrecision( i ).toString();
	}
	return num;
};
/**
* From the Ratio instance, returns the raw values of the numerator and denominator in the form [numerator, denominator].
* 
* @returns {Array[Number, Number]}
* @example Ratio(1,2).toArray() // returns [1,2]
*/
Ratio.prototype.toArray = function () {
    return [this.numerator, this.denominator];
};
/**
* From the Ratio instance, returns the computed value of numerator / denominator.
* 
* @param {Boolean} showValue - Is one of the factors that determine if the return value is the computed value of the Ratio or the toString() value.
* @returns {Number|String}
* @example 
    // Example 1:
    Ratio(1,2).valueOf() == 0.5;
    
    // Example 2:
    Ratio(1,2).valueOf(true) == "1/2"
*/
Ratio.prototype.valueOf = function (showValue) {
    return (!showValue && this.type == "string") ? this.toLocaleString() : (this.numerator / this.denominator);
};
/**
* From the Ratio instance, returns a string of the Ratio in fraction form if the numerator and denominator are Rational numbers.
* Note: If the computed value of (numerator / denominator) is a whole number, then the whole number is returned.
* Note: If the computed value of (numerator / denominator) is not a number, the result is returned.    
* 
* @returns {String}
* @example 
    // Example 1:
    Ratio(1,10).toLocaleString() == "1/10"
    
    // Example 2:
    Ratio(0,0).toLocaleString() == "NaN"
*/
Ratio.prototype.toLocaleString = function () {
    var str = "" + this.numerator, val = this.valueOf(true);
    if ( +(this.numerator) && this.denominator != 1) {
        str += this.divSign + Math.abs(this.denominator);
    }
    if ( +this.denominator === 0 || (this.numerator % this.denominator) === 0 ) {
        str = val;
    }
    return (isNaN(val) || this.type == "decimal") ? val.toString() : str;
};
/**
* From the Ratio instance, returns the raw values of the numerator and denominator in the form "a/b".<br/>
* Note: The division symbol can be change by the use of `divSign` property.
* 
* @returns {String}
* @example 
    // Example 1:
    Ratio(8,2).toString() == "8/2";
    
    // Example 2:
    var a = Ratio(8,2);
    a.divSign = ":";
    a.toString() == "8:2";
*/
Ratio.prototype.toString = function(){
    return "" + this.numerator + this.divSign + this.denominator;
};
/**
* Returns a new instance of the current Ratio. 
* The clone propery value can be changed if the appropriate argument value is supplied.
*
* @param {Number} top
* @param {Number} bottom
* @param {String} type
* @param {Boolean} alwaysReduce
* @returns {Ratio}
* @example 
    var a = Ratio(2,4);
    var b = a.clone();
    a.equals(b) === true;
*/
Ratio.prototype.clone = function (top, bottom, type, alwaysReduce ) {
	var func = Ratio.getValueIfDefined;
	top = func( this.numerator, top);
	bottom = func( this.denominator, bottom );
	alwaysReduce = func( this.alwaysReduce, alwaysReduce );
	var obj = new Ratio( top, bottom, alwaysReduce );
	obj.type = func( this.type, type );
	return obj;
};
/**
* From the Ratio instance, returns a new instacne with a reduced ratio by factoring out the greatest common multiple.
* 
* @returns {Ratio}
* @example Ratio(10,2).reduce().toString() == "5/1"
*/
Ratio.prototype.reduce = function () {
    var arr = Ratio.reduce( this.numerator, this.denominator );
    return this.clone( arr[0], arr[1] );
};
/**
* Adds the current Ratio by another Ratio.
* 
* @param {Ratio|Number|String} obj 
* @param {Ratio|Number|String} [optional] obj2 
* @returns {Ratio}
* @example Ratio( 1, 3 ).add( 1,2 ).toString() == "5/6"
*/
Ratio.prototype.add = function (obj,obj2) {
    if (!(obj instanceof Ratio) || typeof obj2 !== "undefined") {
        obj = Ratio.parse(obj,obj2);
    }
    var x, top, bottom;
    if (this.denominator == obj.denominator) {
        top = this.numerator + obj.numerator;
        bottom = this.denominator;
    } else {
        x = Ratio.gcd(this.denominator, obj.denominator),
        top = ((this.numerator * obj.denominator) + ( this.denominator *obj.numerator)) / x,
        bottom = (this.denominator * obj.denominator) / x;
    }
    return this.clone(top, bottom);
};
/**
* Divides the current Ratio by another Ratio. 
* 
* @param {Ratio|Number|String} obj 
* @param {Ratio|Number|String} [optional] obj2 
* @returns {Ratio}
* @example Ratio( 1,2 ).divide( 3,4 ).toString() == "2/3"
*/
Ratio.prototype.divide = function (obj, obj2) {
    if (!(obj instanceof Ratio) || typeof obj2 !== "undefined") {
        obj = Ratio.parse(obj,obj2);
    }
    return this.clone(this.numerator * obj.denominator, this.denominator * obj.numerator);
};
/**
* Compares if the current Ratio and another object have the same value.
* 
* @param {Object} obj 
* @returns {Ratio}
* @example Ratio(1,2).equals( 1/2 ) === true
*/
Ratio.prototype.equals = function (obj) {
    return (this.numerator / this.denominator) == obj.valueOf();
};
/**
* Multiply the current Ratio by another Ratio. 
* 
* @param {Ratio|Number|String} obj 
* @param {Ratio|Number|String} [optional] obj2 
* @returns {Ratio}
* @example Ratio(2,5).multiply( 1, 2 ).toString() == "2/10"
*/
Ratio.prototype.multiply = function (obj, obj2) {
    if (!(obj instanceof Ratio) || typeof obj2 !== "undefined") {
        obj = Ratio.parse(obj, obj2);
    }
    return this.clone(this.numerator * obj.numerator, this.denominator * obj.denominator);
};
/**
* Subtracts the current Ratio by another Ratio.
* 
* @param {Ratio|Number|String} obj 
* @param {Ratio|Number|String} [optional] obj2 
* @returns {Ratio}
* @example Ratio(2,3).subtract(1,7).toString() === "-1/3"
*/
Ratio.prototype.subtract = function (obj, obj2) {
    if (!(obj instanceof Ratio) || typeof obj2 !== "undefined") {
        obj = Ratio.parse(obj, obj2);
    }
    obj.numerator = -obj.numerator;
    return this.add(obj);
};
/**
* From the Ratio instance, returns an new Ratio scaled down by a factor. 
* 
* @param {Number} factor 
* @returns {Ratio}
* @example Ratio(10,4).descale( 2 ).toString() === "5/2"
*/
Ratio.prototype.descale = function (factor) {
    return this.clone(this.numerator / factor, this.denominator / factor);
};
/**
* From the Ratio instance, returns an new Ratio raised to a power. 
* 
* @param {Number} power 
* @returns {Ratio}
* @example Ratio(2,4).pow(4).toString() === "16/256"
*/
Ratio.prototype.pow = function (power) {
    return this.clone(Math.pow(this.numerator, +power), Math.pow(this.denominator, +power));
};
/**
* From the Ratio instance, returns a new Ratio scaled up by a factor.
* 
* @param {Number} factor
* @returns {Ratio}
* @example Ratio(1,10).scale(10).toString() === "10/100"
*/
Ratio.prototype.scale = function (factor) {
    return this.clone(this.numerator * +factor, this.denominator * +factor);
};
/**
* From the Ratio instance, returns a new Ratio by parsing the numerator and denominator.<br/>
* This is useful if want to ensure that the Ratio contains only whole numbers in the numerator and denominator after a caclulation.
* 
* @returns {Ratio}
* @example 
    var a = Ratio(20,30).descale(3);
    a.toString() == "6.666666666666667/10";
    a.cleanFormat().toString() == "6666666666666667/10000000000000000"
*/
Ratio.prototype.cleanFormat = function () {
	var re = /^\d+\.\d+$/;
	if( re.test( this.numerator ) || re.test( this.denominator ) ){
		return Ratio.parse( this.numerator, this.denominator );
	}
	var obj = this.clone();
	obj.numerator = Ratio.getCleanENotation( obj.numerator );
	obj.denominator = Ratio.getCleanENotation( obj.denominator );
	return obj;
};
/**
* Returns a new instances that is the absolute value of the current Ratio.
* 
* @returns {Ratio}
* @example Ratio(-3,2).abs().toString() == "3/2"
*/
Ratio.prototype.abs = function () {
    return this.clone(Math.abs(this.numerator));
};
/**
* From the Ratio instance, returns a new Ratio in the form of (numerator mod denominator)/1.<br/>
* Which is the same as Ratio( (numerator % denominator), 1 ).
* 
* @returns {Ratio}
* @example Ratio(3,10).mod().toString() == "3"
*/
Ratio.prototype.mod = function () {
    return this.clone(this.numerator % this.denominator, 1);
};
/**
* Returns a new instance of the Ratio with the sign toggled.
* 
* @returns {Ratio}
* @example Ratio(1,2).negate().toString() == "-1/2"
*/
Ratio.prototype.negate = function () {
    return this.clone( -this.numerator);
};
/**
* Determines if the current Ratio is a proper fraction.
* 
* @returns {Boolean}
* @example Ratio(12,3).isProper() == false;
*/
Ratio.prototype.isProper = function () {
    return Math.abs(this.numerator) < this.denominator;
};
/**
* Adds npm support
*/
if (typeof exports !== 'undefined') {
	if (typeof module !== 'undefined' && module.exports) {
		exports = module.exports;
	}
	exports.Ratio = Ratio;
}