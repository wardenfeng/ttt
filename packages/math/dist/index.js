var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var feng3d;
(function (feng3d) {
    /**
     * 方程求解
     *
     * 求解方程 f(x) == 0 在[a, b]上的解
     *
     * 参考：高等数学 第七版上册 第三章第八节 方程的近似解
     * 当f(x)在区间 [a, b] 上连续，且f(a) * f(b) <= 0 时，f(x)在区间 [a, b] 上至少存在一个解使得 f(x) == 0
     *
     * 当f(x)在区间 [a, b] 上连续，且 (f(a) - y) * (f(b) - y) < 0 时，f(x)在区间 [a, b] 上至少存在一个解使得 f(x) == y
     *
     * @author feng / http://feng3d.com 05/06/2018
     */
    var EquationSolving = /** @class */ (function () {
        function EquationSolving() {
        }
        /**
         * 获取数字的(正负)符号
         * @param n 数字
         */
        EquationSolving.prototype.getSign = function (n) {
            return n > 0 ? "+" : "-";
        };
        /**
         * 比较 a 与 b 是否相等
         * @param a 值a
         * @param b 值b
         * @param precision 比较精度
         */
        EquationSolving.prototype.equalNumber = function (a, b, precision) {
            if (precision === void 0) { precision = 0.0000001; }
            return Math.abs(a - b) < precision;
        };
        /**
         * 获取近似导函数 f'(x)
         *
         * 导函数定义
         * f'(x) = (f(x + Δx) - f(x)) / Δx , Δx → 0
         *
         * 注：通过测试Δx不能太小，由于方程内存在x的n次方问题（比如0.000000000000001的10次方为0），过小会导致计算机计算进度不够反而导致求导不准确！
         *
         * 另外一种办法是还原一元多次函数，然后求出导函数。
         *
         * @param f 函数
         * @param delta Δx，进过测试该值太小或者过大都会导致求导准确率降低（个人猜测是计算机计算精度问题导致）
         */
        EquationSolving.prototype.getDerivative = function (f, delta) {
            if (delta === void 0) { delta = 0.000000001; }
            return function (x) {
                var d = (f(x + delta) - f(x)) / delta;
                return d;
            };
        };
        /**
         * 函数是否连续
         * @param f 函数
         */
        EquationSolving.prototype.isContinuous = function (f) {
            return true;
        };
        /**
         * 方程 f(x) == 0 在 [a, b] 区间内是否有解
         *
         * 当f(x)在区间 [a, b] 上连续，且f(a) * f(b) <= 0 时，f(x)在区间 [a, b] 上至少存在一个解使得 f(x) == 0
         *
         * @param f 函数f(x)
         * @param a 区间起点
         * @param b 区间终点
         * @param errorcallback  错误回调函数
         *
         * @returns 是否有解
         */
        EquationSolving.prototype.hasSolution = function (f, a, b, errorcallback) {
            if (!this.isContinuous(f)) {
                errorcallback && errorcallback(new Error("\u51FD\u6570 " + f + " \u5728 [" + a + " ," + b + "] \u533A\u95F4\u5185\u4E0D\u8FDE\u7EED\uFF0C\u65E0\u6CD5\u4E3A\u5176\u6C42\u89E3\uFF01"));
                return false;
            }
            var fa = f(a);
            var fb = f(b);
            if (fa * fb > 0) {
                errorcallback && errorcallback(new Error("f(a) * f(b) \u503C\u4E3A " + fa * fb + "\uFF0C\u4E0D\u6EE1\u8DB3 f(a) * f(b) <= 0\uFF0C\u65E0\u6CD5\u4E3A\u5176\u6C42\u89E3\uFF01"));
                return false;
            }
            return true;
        };
        /**
         * 二分法 求解 f(x) == 0
         *
         * 通过区间中点作为边界来逐步缩小求解区间，最终获得解
         *
         * @param f 函数f(x)
         * @param a 区间起点
         * @param b 区间终点
         * @param precision 求解精度
         * @param errorcallback  错误回调函数
         *
         * @returns 不存在解时返回 undefined ，存在时返回 解
         */
        EquationSolving.prototype.binary = function (f, a, b, precision, errorcallback) {
            if (precision === void 0) { precision = 0.0000001; }
            if (!this.hasSolution(f, a, b, errorcallback))
                return undefined;
            var fa = f(a);
            var fb = f(b);
            if (this.equalNumber(fa, 0, precision)) {
                return a;
            }
            if (this.equalNumber(fb, 0, precision)) {
                return b;
            }
            do {
                var x = (a + b) / 2;
                var fr = f(x);
                if (fa * fr < 0) {
                    b = x;
                    fb = fr;
                }
                else {
                    a = x;
                    fa = fr;
                }
            } while (!this.equalNumber(fr, 0, precision));
            return x;
        };
        /**
         * 连线法 求解 f(x) == 0
         *
         * 连线法是我自己想的方法，自己取的名字，目前没有找到相应的资料（这方法大家都能够想得到。）
         *
         * 用曲线弧两端的连线来代替曲线弧与X轴交点作为边界来逐步缩小求解区间，最终获得解
         *
         * 通过 A，B两点连线与x轴交点来缩小求解区间最终获得解
         *
         * A，B两点直线方程 f(x) = f(a) + (f(b) - f(a)) / (b - a) * (x-a) ,求 f(x) == 0 解得 x = a - fa * (b - a)/ (fb - fa)
         *
         * @param f 函数f(x)
         * @param a 区间起点
         * @param b 区间终点
         * @param precision 求解精度
         * @param errorcallback  错误回调函数
         *
         * @returns 不存在解时返回 undefined ，存在时返回 解
         */
        EquationSolving.prototype.line = function (f, a, b, precision, errorcallback) {
            if (precision === void 0) { precision = 0.0000001; }
            if (!this.hasSolution(f, a, b, errorcallback))
                return undefined;
            var fa = f(a);
            var fb = f(b);
            if (this.equalNumber(fa, 0, precision)) {
                return a;
            }
            if (this.equalNumber(fb, 0, precision)) {
                return b;
            }
            do {
                // 
                var x = a - fa * (b - a) / (fb - fa);
                var fr = f(x);
                if (fa * fr < 0) {
                    b = x;
                    fb = fr;
                }
                else {
                    a = x;
                    fa = fr;
                }
            } while (!this.equalNumber(fr, 0, precision));
            return x;
        };
        /**
         * 切线法 求解 f(x) == 0
         *
         * 用曲线弧一端的切线来代替曲线弧，从而求出方程实根的近似解。
         *
         * 迭代公式： Xn+1 = Xn - f(Xn) / f'(Xn)
         *
         * #### 额外需求
         * 1. f(x)在[a, b]上具有一阶导数 f'(x)
         * 1. f'(x)在[a, b]上保持定号；意味着f(x)在[a, b]上单调
         * 1. f''(x)在[a, b]上保持定号；意味着f'(x)在[a, b]上单调
         *
         * 切记，当无法满足这些额外要求时，该函数将找不到[a, b]上的解！！！！！！！！！！！
         *
         * @param f 函数f(x)
         * @param f1 一阶导函数 f'(x)
         * @param f2 二阶导函数 f''(x)
         * @param a 区间起点
         * @param b 区间终点
         * @param precision 求解精度
         * @param errorcallback  错误回调函数
         *
         * @returns 不存在解与无法使用该函数求解时返回 undefined ，否则返回 解
         */
        EquationSolving.prototype.tangent = function (f, f1, f2, a, b, precision, errorcallback) {
            if (precision === void 0) { precision = 0.0000001; }
            if (!this.hasSolution(f, a, b, errorcallback))
                return undefined;
            var fa = f(a);
            var fb = f(b);
            if (this.equalNumber(fa, 0, precision)) {
                return a;
            }
            if (this.equalNumber(fb, 0, precision)) {
                return b;
            }
            var f1Sign = fb - fa; // f'(x)在[a, b]上保持的定号
            var f1a = f1(a);
            var f1b = f1(b);
            // f'(x)在[a, b]上保持定号
            if (f1a * f1Sign <= 0) {
                errorcallback && errorcallback(new Error("[" + a + ", " + b + "] \u4E0A\u5B58\u5728\u89E3\uFF0C\u7531\u4E8Ef'(" + a + ") = " + f1a + " \u5728[a, b]\u4E0A\u6CA1\u6709\u4FDD\u6301\u5B9A\u53F7 " + this.getSign(f1Sign) + " \uFF0C\u65E0\u6CD5\u4F7F\u7528\u5207\u7EBF\u6CD5\u6C42\u89E3"));
                return undefined;
            }
            if (f1b * f1Sign <= 0) {
                errorcallback && errorcallback(new Error("[" + a + ", " + b + "] \u4E0A\u5B58\u5728\u89E3\uFF0C\u7531\u4E8Ef'(" + b + ") = " + f1b + " \u5728[a, b]\u4E0A\u6CA1\u6709\u4FDD\u6301\u5B9A\u53F7 " + this.getSign(f1Sign) + " \uFF0C\u65E0\u6CD5\u4F7F\u7528\u5207\u7EBF\u6CD5\u6C42\u89E3"));
                return undefined;
            }
            var f2Sign = fb - fa; // f''(x)在[a, b]上保持的定号
            var f2a = f2(a);
            var f2b = f2(b);
            // f''(x)在[a, b]上保持定号
            if (f2a * f2Sign <= 0) {
                errorcallback && errorcallback(new Error("[" + a + ", " + b + "] \u4E0A\u5B58\u5728\u89E3\uFF0C\u7531\u4E8Ef''(" + a + ") = " + f2a + " \u5728[a, b]\u4E0A\u6CA1\u6709\u4FDD\u6301\u5B9A\u53F7 " + this.getSign(f2Sign) + " \uFF0C\u65E0\u6CD5\u4F7F\u7528\u5207\u7EBF\u6CD5\u6C42\u89E3"));
                return undefined;
            }
            if (f2b * f2Sign <= 0) {
                errorcallback && errorcallback(new Error("[" + a + ", " + b + "] \u4E0A\u5B58\u5728\u89E3\uFF0C\u7531\u4E8Ef''(" + b + ") = " + f2b + " \u5728[a, b]\u4E0A\u6CA1\u6709\u4FDD\u6301\u5B9A\u53F7 " + this.getSign(f2Sign) + " \uFF0C\u65E0\u6CD5\u4F7F\u7528\u5207\u7EBF\u6CD5\u6C42\u89E3"));
                return undefined;
            }
            var x;
            if (f1Sign > 0) {
                if (f2Sign > 0)
                    x = b;
                else
                    x = a;
            }
            else {
                if (f2Sign > 0)
                    x = a;
                else
                    x = b;
            }
            do {
                var fx = f(x);
                var f1x = f1(x);
                var f2x = f2(x);
                // f'(x)在[a, b]上保持定号
                if (f1x * f1Sign <= 0) {
                    errorcallback && errorcallback(new Error("[" + a + ", " + b + "] \u4E0A\u5B58\u5728\u89E3\uFF0C\u7531\u4E8Ef'(" + x + ") = " + f1x + " \u5728[a, b]\u4E0A\u6CA1\u6709\u4FDD\u6301\u5B9A\u53F7 " + this.getSign(f1Sign) + " \uFF0C\u65E0\u6CD5\u4F7F\u7528\u5207\u7EBF\u6CD5\u6C42\u89E3"));
                    return undefined;
                }
                // f''(x)在[a, b]上保持定号
                if (f2x * f2Sign <= 0) {
                    errorcallback && errorcallback(new Error("[" + a + ", " + b + "] \u4E0A\u5B58\u5728\u89E3\uFF0C\u7531\u4E8Ef''(" + x + ") = " + f2x + " \u5728[a, b]\u4E0A\u6CA1\u6709\u4FDD\u6301\u5B9A\u53F7 " + this.getSign(f2Sign) + " \uFF0C\u65E0\u6CD5\u4F7F\u7528\u5207\u7EBF\u6CD5\u6C42\u89E3"));
                    return undefined;
                }
                // 迭代 Xn+1 = Xn - f(Xn) / f'(Xn)
                x = x - fx / f1x;
            } while (!this.equalNumber(fx, 0, precision));
            return x;
        };
        /**
         * 割线法（弦截法） 求解 f(x) == 0
         *
         * 使用 (f(Xn) - f(Xn-1)) / (Xn - Xn-1) 代替切线法迭代公式 Xn+1 = Xn - f(Xn) / f'(Xn) 中的 f'(x)
         *
         * 迭代公式：Xn+1 = Xn - f(Xn) * (Xn - Xn-1) / (f(Xn) - f(Xn-1));
         *
         * 用过点(Xn-1,f(Xn-1))和点(Xn,f(Xn))的割线来近似代替(Xn,f(Xn))处的切线，将这条割线与X轴交点的横坐标作为新的近似解。
         *
         * #### 额外需求
         * 1. f(x)在[a, b]上具有一阶导数 f'(x)
         * 1. f'(x)在[a, b]上保持定号；意味着f(x)在[a, b]上单调
         * 1. f''(x)在[a, b]上保持定号；意味着f'(x)在[a, b]上单调
         *
         * 切记，当无法满足这些额外要求时，该函数将找不到[a, b]上的解！！！！！！！！！！！
         *
         * @param f 函数f(x)
         * @param a 区间起点
         * @param b 区间终点
         * @param precision 求解精度
         * @param errorcallback  错误回调函数
         *
         * @returns 不存在解与无法使用该函数求解时返回 undefined ，否则返回 解
         */
        EquationSolving.prototype.secant = function (f, a, b, precision, errorcallback) {
            if (precision === void 0) { precision = 0.0000001; }
            if (!this.hasSolution(f, a, b, errorcallback))
                return undefined;
            var fa = f(a);
            var fb = f(b);
            if (this.equalNumber(fa, 0, precision)) {
                return a;
            }
            if (this.equalNumber(fb, 0, precision)) {
                return b;
            }
            // 此处创建近似导函数以及二次导函数，其实割线法使用在计算f'(x)困难时的，但是 getDerivative 方法解决了这个困难。。。。
            var f1 = this.getDerivative(f, precision);
            var f2 = this.getDerivative(f1, precision);
            var f1Sign = fb - fa; // f'(x)在[a, b]上保持的定号
            // 
            var f1a = f1(a);
            var f1b = f1(b);
            // f'(x)在[a, b]上保持定号
            if (f1a * f1Sign <= 0) {
                errorcallback && errorcallback(new Error("[" + a + ", " + b + "] \u4E0A\u5B58\u5728\u89E3\uFF0C\u7531\u4E8Ef'(" + a + ") = " + f1a + " \u5728[a, b]\u4E0A\u6CA1\u6709\u4FDD\u6301\u5B9A\u53F7 " + this.getSign(f1Sign) + " \uFF0C\u65E0\u6CD5\u4F7F\u7528\u5207\u7EBF\u6CD5\u6C42\u89E3"));
                return undefined;
            }
            if (f1b * f1Sign <= 0) {
                errorcallback && errorcallback(new Error("[" + a + ", " + b + "] \u4E0A\u5B58\u5728\u89E3\uFF0C\u7531\u4E8Ef'(" + b + ") = " + f1b + " \u5728[a, b]\u4E0A\u6CA1\u6709\u4FDD\u6301\u5B9A\u53F7 " + this.getSign(f1Sign) + " \uFF0C\u65E0\u6CD5\u4F7F\u7528\u5207\u7EBF\u6CD5\u6C42\u89E3"));
                return undefined;
            }
            var f2Sign = fb - fa; // f''(x)在[a, b]上保持的定号
            var f2a = f2(a);
            var f2b = f2(b);
            // f''(x)在[a, b]上保持定号
            if (f2a * f2Sign <= 0) {
                errorcallback && errorcallback(new Error("[" + a + ", " + b + "] \u4E0A\u5B58\u5728\u89E3\uFF0C\u7531\u4E8Ef''(" + a + ") = " + f2a + " \u5728[a, b]\u4E0A\u6CA1\u6709\u4FDD\u6301\u5B9A\u53F7 " + this.getSign(f2Sign) + " \uFF0C\u65E0\u6CD5\u4F7F\u7528\u5207\u7EBF\u6CD5\u6C42\u89E3"));
                return undefined;
            }
            if (f2b * f2Sign <= 0) {
                errorcallback && errorcallback(new Error("[" + a + ", " + b + "] \u4E0A\u5B58\u5728\u89E3\uFF0C\u7531\u4E8Ef''(" + b + ") = " + f2b + " \u5728[a, b]\u4E0A\u6CA1\u6709\u4FDD\u6301\u5B9A\u53F7 " + this.getSign(f2Sign) + " \uFF0C\u65E0\u6CD5\u4F7F\u7528\u5207\u7EBF\u6CD5\u6C42\u89E3"));
                return undefined;
            }
            var x;
            if (f1Sign > 0) {
                if (f2Sign > 0)
                    x = b;
                else
                    x = a;
            }
            else {
                if (f2Sign > 0)
                    x = a;
                else
                    x = b;
            }
            // Xn-1
            var xn_1 = x;
            var fxn_1 = f(xn_1);
            // Xn
            var xn = xn_1 - precision * f2Sign / Math.abs(f2Sign);
            var fxn = f(xn);
            // 
            if (fxn * fxn_1 < 0) {
                return xn;
            }
            // Xn+1
            var xn$1;
            do {
                var f1xn = f1(xn);
                // f'(x)在[a, b]上保持定号
                if (f1xn * f1Sign <= 0) {
                    errorcallback && errorcallback(new Error("[" + a + ", " + b + "] \u4E0A\u5B58\u5728\u89E3\uFF0C\u7531\u4E8Ef'(" + xn + ") = " + f1xn + " \u5728[a, b]\u4E0A\u6CA1\u6709\u4FDD\u6301\u5B9A\u53F7 " + this.getSign(f1Sign) + " \uFF0C\u65E0\u6CD5\u4F7F\u7528\u5207\u7EBF\u6CD5\u6C42\u89E3"));
                    return undefined;
                }
                var f2xn = f2(xn);
                // f''(x)在[a, b]上保持定号
                if (f2xn * f2Sign <= 0) {
                    errorcallback && errorcallback(new Error("[" + a + ", " + b + "] \u4E0A\u5B58\u5728\u89E3\uFF0C\u7531\u4E8Ef''(" + xn + ") = " + f2xn + " \u5728[a, b]\u4E0A\u6CA1\u6709\u4FDD\u6301\u5B9A\u53F7 " + this.getSign(f2Sign) + " \uFF0C\u65E0\u6CD5\u4F7F\u7528\u5207\u7EBF\u6CD5\u6C42\u89E3"));
                    return undefined;
                }
                // 迭代 Xn+1 = Xn - f(Xn) * (Xn - Xn-1) / (f(Xn) - f(Xn-1));
                xn$1 = xn - fxn * (xn - xn_1) / (fxn - fxn_1);
                //
                xn_1 = xn;
                fxn_1 = fxn;
                xn = xn$1;
                fxn = f(xn);
            } while (!this.equalNumber(fxn, 0, precision));
            return xn;
        };
        return EquationSolving;
    }());
    feng3d.EquationSolving = EquationSolving;
    feng3d.equationSolving = new EquationSolving();
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 高次函数
     *
     * 处理N次函数定义，求值，方程求解问题
     *
     * n次函数定义
     * f(x) = a0 * pow(x, n) + a1 * pow(x, n - 1) +.....+ an_1 * pow(x, 1) + an
     *
     * 0次 f(x) = a0;
     * 1次 f(x) = a0 * x + a1;
     * 2次 f(x) = a0 * x * x + a1 * x + a2;
     * ......
     *
     */
    var HighFunction = /** @class */ (function () {
        /**
         * 构建函数
         * @param as 函数系数 a0-an 数组
         */
        function HighFunction(as) {
            this.as = as;
        }
        /**
         * 获取函数 f(x) 的值
         * @param x x坐标
         */
        HighFunction.prototype.getValue = function (x) {
            var v = 0;
            var as = this.as;
            for (var i = 0, n = as.length; i < n; i++) {
                v = v * x + as[i];
            }
            return v;
        };
        return HighFunction;
    }());
    feng3d.HighFunction = HighFunction;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 坐标系统类型
     */
    var CoordinateSystem;
    (function (CoordinateSystem) {
        /**
         * 默认坐标系统，左手坐标系统
         */
        CoordinateSystem[CoordinateSystem["LEFT_HANDED"] = 0] = "LEFT_HANDED";
        /**
         * 右手坐标系统
         */
        CoordinateSystem[CoordinateSystem["RIGHT_HANDED"] = 1] = "RIGHT_HANDED";
    })(CoordinateSystem = feng3d.CoordinateSystem || (feng3d.CoordinateSystem = {}));
    /**
     * 引擎中使用的坐标系统，默认左手坐标系统。
     *
     * three.js 右手坐标系统。
     * playcanvas 右手坐标系统。
     * unity    左手坐标系统。
     */
    feng3d.coordinateSystem = CoordinateSystem.LEFT_HANDED;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 用于表示欧拉角的旋转顺序
     *
     * 如果顺序为XYZ，则依次按 ZYZ 轴旋转。为什么循序与定义相反？因为three.js中都这么定义，他们为什么这么定义就不清楚了。
     */
    var RotationOrder;
    (function (RotationOrder) {
        /**
         * 依次按 ZYX 轴旋转。
         *
         * three.js默认旋转顺序。
         */
        RotationOrder[RotationOrder["XYZ"] = 0] = "XYZ";
        /**
         * 依次按 YXZ 轴旋转。
         */
        RotationOrder[RotationOrder["ZXY"] = 1] = "ZXY";
        /**
         * 依次按 XYZ 轴旋转。
         *
         * playcanvas默认旋转顺序。
         */
        RotationOrder[RotationOrder["ZYX"] = 2] = "ZYX";
        /**
         * 依次按 ZXY 轴旋转。
         *
         * unity默认旋转顺序。
         */
        RotationOrder[RotationOrder["YXZ"] = 3] = "YXZ";
        /**
         * 依次按 XZY 轴旋转。
         */
        RotationOrder[RotationOrder["YZX"] = 4] = "YZX";
        /**
         * 依次按 YZX 轴旋转。
         */
        RotationOrder[RotationOrder["XZY"] = 5] = "XZY";
    })(RotationOrder = feng3d.RotationOrder || (feng3d.RotationOrder = {}));
    /**
     * 引擎中使用的旋转顺序。
     *
     * unity YXZ
     * playcanvas ZYX
     * three.js XYZ
     */
    feng3d.defaultRotationOrder = RotationOrder.YXZ;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 点与面的相对位置
     */
    var PlaneClassification;
    (function (PlaneClassification) {
        /**
         * 在平面后面
         */
        PlaneClassification[PlaneClassification["BACK"] = 0] = "BACK";
        /**
         * 在平面前面
         */
        PlaneClassification[PlaneClassification["FRONT"] = 1] = "FRONT";
        /**
         * 与平面相交
         */
        PlaneClassification[PlaneClassification["INTERSECT"] = 2] = "INTERSECT";
    })(PlaneClassification = feng3d.PlaneClassification || (feng3d.PlaneClassification = {}));
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 颜色
     */
    var Color3 = /** @class */ (function () {
        /**
         * 构建颜色
         * @param r     红[0,1]
         * @param g     绿[0,1]
         * @param b     蓝[0,1]
         */
        function Color3(r, g, b) {
            if (r === void 0) { r = 1; }
            if (g === void 0) { g = 1; }
            if (b === void 0) { b = 1; }
            /**
             * 红[0,1]
             */
            this.r = 1;
            /**
             * 绿[0,1]
             */
            this.g = 1;
            /**
             * 蓝[0,1]
             */
            this.b = 1;
            this.r = r;
            this.g = g;
            this.b = b;
        }
        Color3.fromUnit = function (color) {
            return new Color3().fromUnit(color);
        };
        Color3.fromColor4 = function (color4) {
            return new Color3(color4.r, color4.g, color4.b);
        };
        Color3.prototype.setTo = function (r, g, b) {
            this.r = r;
            this.g = g;
            this.b = b;
            return this;
        };
        /**
         * 通过
         * @param color
         */
        Color3.prototype.fromUnit = function (color) {
            this.r = ((color >> 16) & 0xff) / 0xff;
            this.g = ((color >> 8) & 0xff) / 0xff;
            this.b = (color & 0xff) / 0xff;
            return this;
        };
        Color3.prototype.toInt = function () {
            var value = ((this.r * 0xff) << 16) + ((this.g * 0xff) << 8) + (this.b * 0xff);
            return value;
        };
        /**
         * 输出16进制字符串
         */
        Color3.prototype.toHexString = function () {
            var intR = (this.r * 0xff) | 0;
            var intG = (this.g * 0xff) | 0;
            var intB = (this.b * 0xff) | 0;
            return "#" + Color3.ToHex(intR) + Color3.ToHex(intG) + Color3.ToHex(intB);
        };
        /**
         * 混合颜色
         * @param color 混入的颜色
         * @param rate  混入比例
         */
        Color3.prototype.mix = function (color, rate) {
            this.r = this.r * (1 - rate) + color.r * rate;
            this.g = this.g * (1 - rate) + color.g * rate;
            this.b = this.b * (1 - rate) + color.b * rate;
            return this;
        };
        /**
         * 混合颜色
         * @param color 混入的颜色
         * @param rate  混入比例
         */
        Color3.prototype.mixTo = function (color, rate, vout) {
            if (vout === void 0) { vout = new Color3(); }
            return vout.copy(this).mix(color, rate);
        };
        /**
         * 按标量（大小）缩放当前的 Color3 对象。
         */
        Color3.prototype.scale = function (s) {
            this.r *= s;
            this.g *= s;
            this.b *= s;
            return this;
        };
        /**
         * 按标量（大小）缩放当前的 Color3 对象。
         */
        Color3.prototype.scaleTo = function (s, vout) {
            if (vout === void 0) { vout = new Color3(); }
            return vout.copy(this).scale(s);
        };
        /**
         * 通过将当前 Color3 对象的 r、g 和 b 元素与指定的 Color3 对象的 r、g 和 b 元素进行比较，确定这两个对象是否相等。
         */
        Color3.prototype.equals = function (object, precision) {
            if (precision === void 0) { precision = Math.PRECISION; }
            if (!Math.equals(this.r - object.r, 0, precision))
                return false;
            if (!Math.equals(this.g - object.g, 0, precision))
                return false;
            if (!Math.equals(this.b - object.b, 0, precision))
                return false;
            return true;
        };
        /**
         * 拷贝
         */
        Color3.prototype.copy = function (color) {
            this.r = color.r;
            this.g = color.g;
            this.b = color.b;
            return this;
        };
        Color3.prototype.clone = function () {
            return new Color3(this.r, this.g, this.b);
        };
        Color3.prototype.toVector3 = function (vector3) {
            if (vector3 === void 0) { vector3 = new feng3d.Vector3(); }
            vector3.x = this.r;
            vector3.y = this.g;
            vector3.z = this.b;
            return vector3;
        };
        Color3.prototype.toColor4 = function (color4) {
            if (color4 === void 0) { color4 = new feng3d.Color4(); }
            color4.r = this.r;
            color4.g = this.g;
            color4.b = this.b;
            return color4;
        };
        /**
         * 输出字符串
         */
        Color3.prototype.toString = function () {
            return "{R: " + this.r + " G:" + this.g + " B:" + this.b + "}";
        };
        /**
         * 转换为数组
         * @param array 数组
         * @param offset 偏移
         */
        Color3.prototype.toArray = function (array, offset) {
            if (array === void 0) { array = []; }
            if (offset === void 0) { offset = 0; }
            array[offset] = this.r;
            array[offset + 1] = this.g;
            array[offset + 2] = this.b;
            return array;
        };
        /**
         * [0,15]数值转为16进制字符串
         * param i  [0,15]数值
         */
        Color3.ToHex = function (i) {
            var str = i.toString(16);
            if (i <= 0xf) {
                return ("0" + str).toUpperCase();
            }
            return str.toUpperCase();
        };
        Color3.WHITE = new Color3();
        Color3.BLACK = new Color3(0, 0, 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize
        ], Color3.prototype, "r", void 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize
        ], Color3.prototype, "g", void 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize
        ], Color3.prototype, "b", void 0);
        return Color3;
    }());
    feng3d.Color3 = Color3;
    feng3d.ColorKeywords = {
        'aliceblue': 0xF0F8FF, 'antiquewhite': 0xFAEBD7, 'aqua': 0x00FFFF, 'aquamarine': 0x7FFFD4, 'azure': 0xF0FFFF,
        'beige': 0xF5F5DC, 'bisque': 0xFFE4C4, 'black': 0x000000, 'blanchedalmond': 0xFFEBCD, 'blue': 0x0000FF, 'blueviolet': 0x8A2BE2,
        'brown': 0xA52A2A, 'burlywood': 0xDEB887, 'cadetblue': 0x5F9EA0, 'chartreuse': 0x7FFF00, 'chocolate': 0xD2691E, 'coral': 0xFF7F50,
        'cornflowerblue': 0x6495ED, 'cornsilk': 0xFFF8DC, 'crimson': 0xDC143C, 'cyan': 0x00FFFF, 'darkblue': 0x00008B, 'darkcyan': 0x008B8B,
        'darkgoldenrod': 0xB8860B, 'darkgray': 0xA9A9A9, 'darkgreen': 0x006400, 'darkgrey': 0xA9A9A9, 'darkkhaki': 0xBDB76B, 'darkmagenta': 0x8B008B,
        'darkolivegreen': 0x556B2F, 'darkorange': 0xFF8C00, 'darkorchid': 0x9932CC, 'darkred': 0x8B0000, 'darksalmon': 0xE9967A, 'darkseagreen': 0x8FBC8F,
        'darkslateblue': 0x483D8B, 'darkslategray': 0x2F4F4F, 'darkslategrey': 0x2F4F4F, 'darkturquoise': 0x00CED1, 'darkviolet': 0x9400D3,
        'deeppink': 0xFF1493, 'deepskyblue': 0x00BFFF, 'dimgray': 0x696969, 'dimgrey': 0x696969, 'dodgerblue': 0x1E90FF, 'firebrick': 0xB22222,
        'floralwhite': 0xFFFAF0, 'forestgreen': 0x228B22, 'fuchsia': 0xFF00FF, 'gainsboro': 0xDCDCDC, 'ghostwhite': 0xF8F8FF, 'gold': 0xFFD700,
        'goldenrod': 0xDAA520, 'gray': 0x808080, 'green': 0x008000, 'greenyellow': 0xADFF2F, 'grey': 0x808080, 'honeydew': 0xF0FFF0, 'hotpink': 0xFF69B4,
        'indianred': 0xCD5C5C, 'indigo': 0x4B0082, 'ivory': 0xFFFFF0, 'khaki': 0xF0E68C, 'lavender': 0xE6E6FA, 'lavenderblush': 0xFFF0F5, 'lawngreen': 0x7CFC00,
        'lemonchiffon': 0xFFFACD, 'lightblue': 0xADD8E6, 'lightcoral': 0xF08080, 'lightcyan': 0xE0FFFF, 'lightgoldenrodyellow': 0xFAFAD2, 'lightgray': 0xD3D3D3,
        'lightgreen': 0x90EE90, 'lightgrey': 0xD3D3D3, 'lightpink': 0xFFB6C1, 'lightsalmon': 0xFFA07A, 'lightseagreen': 0x20B2AA, 'lightskyblue': 0x87CEFA,
        'lightslategray': 0x778899, 'lightslategrey': 0x778899, 'lightsteelblue': 0xB0C4DE, 'lightyellow': 0xFFFFE0, 'lime': 0x00FF00, 'limegreen': 0x32CD32,
        'linen': 0xFAF0E6, 'magenta': 0xFF00FF, 'maroon': 0x800000, 'mediumaquamarine': 0x66CDAA, 'mediumblue': 0x0000CD, 'mediumorchid': 0xBA55D3,
        'mediumpurple': 0x9370DB, 'mediumseagreen': 0x3CB371, 'mediumslateblue': 0x7B68EE, 'mediumspringgreen': 0x00FA9A, 'mediumturquoise': 0x48D1CC,
        'mediumvioletred': 0xC71585, 'midnightblue': 0x191970, 'mintcream': 0xF5FFFA, 'mistyrose': 0xFFE4E1, 'moccasin': 0xFFE4B5, 'navajowhite': 0xFFDEAD,
        'navy': 0x000080, 'oldlace': 0xFDF5E6, 'olive': 0x808000, 'olivedrab': 0x6B8E23, 'orange': 0xFFA500, 'orangered': 0xFF4500, 'orchid': 0xDA70D6,
        'palegoldenrod': 0xEEE8AA, 'palegreen': 0x98FB98, 'paleturquoise': 0xAFEEEE, 'palevioletred': 0xDB7093, 'papayawhip': 0xFFEFD5, 'peachpuff': 0xFFDAB9,
        'peru': 0xCD853F, 'pink': 0xFFC0CB, 'plum': 0xDDA0DD, 'powderblue': 0xB0E0E6, 'purple': 0x800080, 'rebeccapurple': 0x663399, 'red': 0xFF0000, 'rosybrown': 0xBC8F8F,
        'royalblue': 0x4169E1, 'saddlebrown': 0x8B4513, 'salmon': 0xFA8072, 'sandybrown': 0xF4A460, 'seagreen': 0x2E8B57, 'seashell': 0xFFF5EE,
        'sienna': 0xA0522D, 'silver': 0xC0C0C0, 'skyblue': 0x87CEEB, 'slateblue': 0x6A5ACD, 'slategray': 0x708090, 'slategrey': 0x708090, 'snow': 0xFFFAFA,
        'springgreen': 0x00FF7F, 'steelblue': 0x4682B4, 'tan': 0xD2B48C, 'teal': 0x008080, 'thistle': 0xD8BFD8, 'tomato': 0xFF6347, 'turquoise': 0x40E0D0,
        'violet': 0xEE82EE, 'wheat': 0xF5DEB3, 'white': 0xFFFFFF, 'whitesmoke': 0xF5F5F5, 'yellow': 0xFFFF00, 'yellowgreen': 0x9ACD32
    };
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 颜色（包含透明度）
     */
    var Color4 = /** @class */ (function () {
        /**
         * 构建颜色
         * @param r     红[0,1]
         * @param g     绿[0,1]
         * @param b     蓝[0,1]
         * @param a     透明度[0,1]
         */
        function Color4(r, g, b, a) {
            if (r === void 0) { r = 1; }
            if (g === void 0) { g = 1; }
            if (b === void 0) { b = 1; }
            if (a === void 0) { a = 1; }
            /**
             * 红[0,1]
             */
            this.r = 1;
            /**
             * 绿[0,1]
             */
            this.g = 1;
            /**
             * 蓝[0,1]
             */
            this.b = 1;
            /**
             * 透明度[0,1]
             */
            this.a = 1;
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
        Color4.fromUnit = function (color) {
            return new Color4().fromUnit(color);
        };
        Color4.fromUnit24 = function (color, a) {
            if (a === void 0) { a = 1; }
            return Color4.fromColor3(feng3d.Color3.fromUnit(color), a);
        };
        Color4.fromColor3 = function (color3, a) {
            if (a === void 0) { a = 1; }
            return new Color4(color3.r, color3.g, color3.b, a);
        };
        Color4.prototype.setTo = function (r, g, b, a) {
            if (a === void 0) { a = 1; }
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
            return this;
        };
        /**
         * 通过
         * @param color
         */
        Color4.prototype.fromUnit = function (color) {
            this.a = ((color >> 24) & 0xff) / 0xff;
            this.r = ((color >> 16) & 0xff) / 0xff;
            this.g = ((color >> 8) & 0xff) / 0xff;
            this.b = (color & 0xff) / 0xff;
            return this;
        };
        Color4.prototype.toInt = function () {
            var value = ((this.a * 0xff) << 24) + ((this.r * 0xff) << 16) + ((this.g * 0xff) << 8) + (this.b * 0xff);
            return value;
        };
        /**
         * 输出16进制字符串
         */
        Color4.prototype.toHexString = function () {
            var intR = (this.r * 0xff) | 0;
            var intG = (this.g * 0xff) | 0;
            var intB = (this.b * 0xff) | 0;
            var intA = (this.a * 0xff) | 0;
            return "#" + feng3d.Color3.ToHex(intA) + feng3d.Color3.ToHex(intR) + feng3d.Color3.ToHex(intG) + feng3d.Color3.ToHex(intB);
        };
        /**
         * 输出 RGBA 颜色值，例如 rgba(255,255,255,1)
         */
        Color4.prototype.toRGBA = function () {
            return "rgba(" + this.r * 255 + "," + this.g * 255 + "," + this.b * 255 + "," + this.a + ")";
        };
        /**
         * 混合颜色
         * @param color 混入的颜色
         * @param rate  混入比例
         */
        Color4.prototype.mix = function (color, rate) {
            if (rate === void 0) { rate = 0.5; }
            this.r = this.r * (1 - rate) + color.r * rate;
            this.g = this.g * (1 - rate) + color.g * rate;
            this.b = this.b * (1 - rate) + color.b * rate;
            this.a = this.a * (1 - rate) + color.a * rate;
            return this;
        };
        /**
         * 混合颜色
         * @param color 混入的颜色
         * @param rate  混入比例
         */
        Color4.prototype.mixTo = function (color, rate, vout) {
            if (vout === void 0) { vout = new Color4(); }
            return vout.copy(this).mix(color, rate);
        };
        /**
         * 乘以指定颜色
         * @param c 乘以的颜色
         * @return 返回自身
         */
        Color4.prototype.multiply = function (c) {
            this.r *= c.r;
            this.g *= c.g;
            this.b *= c.b;
            this.a *= c.a;
            return this;
        };
        /**
         * 乘以指定颜色
         * @param v 乘以的颜色
         * @return 返回新颜色
         */
        Color4.prototype.multiplyTo = function (v, vout) {
            if (vout === void 0) { vout = new Color4(); }
            return vout.copy(this).multiply(v);
        };
        /**
         * 乘以指定常量
         *
         * @param scale 缩放常量
         * @return 返回自身
         */
        Color4.prototype.multiplyNumber = function (scale) {
            this.r *= scale;
            this.g *= scale;
            this.b *= scale;
            this.a *= scale;
            return this;
        };
        /**
         * 通过将当前 Color3 对象的 r、g 和 b 元素与指定的 Color3 对象的 r、g 和 b 元素进行比较，确定这两个对象是否相等。
         */
        Color4.prototype.equals = function (object, precision) {
            if (precision === void 0) { precision = Math.PRECISION; }
            if (!Math.equals(this.r - object.r, 0, precision))
                return false;
            if (!Math.equals(this.g - object.g, 0, precision))
                return false;
            if (!Math.equals(this.b - object.b, 0, precision))
                return false;
            if (!Math.equals(this.a - object.a, 0, precision))
                return false;
            return true;
        };
        /**
         * 拷贝
         */
        Color4.prototype.copy = function (color) {
            this.r = color.r;
            this.g = color.g;
            this.b = color.b;
            this.a = color.a;
            return this;
        };
        /**
         * 输出字符串
         */
        Color4.prototype.toString = function () {
            return "{R: " + this.r + " G:" + this.g + " B:" + this.b + " A:" + this.a + "}";
        };
        Color4.prototype.toColor3 = function (color) {
            if (color === void 0) { color = new feng3d.Color3(); }
            color.r = this.r;
            color.g = this.g;
            color.b = this.b;
            return color;
        };
        Color4.prototype.toVector4 = function (vector4) {
            if (vector4 === void 0) { vector4 = new feng3d.Vector4(); }
            vector4.x = this.r;
            vector4.y = this.g;
            vector4.z = this.b;
            vector4.w = this.a;
            return vector4;
        };
        /**
         * 转换为数组
         * @param array 数组
         * @param offset 偏移
         */
        Color4.prototype.toArray = function (array, offset) {
            if (array === void 0) { array = []; }
            if (offset === void 0) { offset = 0; }
            array[offset] = this.r;
            array[offset + 1] = this.g;
            array[offset + 2] = this.b;
            array[offset + 3] = this.a;
            return array;
        };
        /**
         * 克隆
         */
        Color4.prototype.clone = function () {
            return new Color4(this.r, this.g, this.b, this.a);
        };
        Color4.WHITE = Object.freeze(new Color4(1, 1, 1, 1));
        Color4.BLACK = Object.freeze(new Color4(0, 0, 0, 1));
        __decorate([
            feng3d.oav(),
            feng3d.serialize
        ], Color4.prototype, "r", void 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize
        ], Color4.prototype, "g", void 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize
        ], Color4.prototype, "b", void 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize
        ], Color4.prototype, "a", void 0);
        return Color4;
    }());
    feng3d.Color4 = Color4;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var DEG_TO_RAD = Math.PI / 180;
    /**
     * Vector2 对象表示二维坐标系统中的某个位置，其中 x 表示水平轴，y 表示垂直轴。
     */
    var Vector2 = /** @class */ (function () {
        /**
         * 创建一个 Vector2 对象.若不传入任何参数，将会创建一个位于（0，0）位置的点。
         *
         * @param x 该对象的x属性值，默认为0
         * @param y 该对象的y属性值，默认为0
         */
        function Vector2(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.x = x;
            this.y = y;
        }
        /**
         * 将一对极坐标转换为笛卡尔点坐标。
         * @param len 极坐标对的长度。
         * @param angle 极坐标对的角度（以弧度表示）。
         */
        Vector2.polar = function (len, angle) {
            return new Vector2(len * Math.cos(angle / DEG_TO_RAD), len * Math.sin(angle / DEG_TO_RAD));
        };
        Object.defineProperty(Vector2.prototype, "length", {
            /**
             * 从 (0,0) 到此点的线段长度。
             */
            get: function () {
                return Math.sqrt(this.x * this.x + this.y * this.y);
            },
            enumerable: false,
            configurable: true
        });
        /**
         * 将 Vector2 的成员设置为指定值
         * @param x 该对象的x属性值
         * @param y 该对象的y属性值
         */
        Vector2.prototype.set = function (x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = x; }
            this.x = x;
            this.y = y;
            return this;
        };
        /**
         * 克隆点对象
         */
        Vector2.prototype.clone = function () {
            return new Vector2(this.x, this.y);
        };
        /**
         * 返回 pt1 和 pt2 之间的距离。
         * @param p1 第一个点
         * @param p2 第二个点
         * @returns 第一个点和第二个点之间的距离。
         */
        Vector2.distance = function (p1, p2) {
            return p1.distance(p2);
        };
        /**
         * 将另一个点的坐标添加到此点的坐标。
         * @param v 要添加的点。
         */
        Vector2.prototype.add = function (v) {
            this.x += v.x;
            this.y += v.y;
            return this;
        };
        /**
         * 将另一个点的坐标添加到此点的坐标以创建一个新点。
         * @param v 要添加的点。
         * @returns 新点。
         */
        Vector2.prototype.addTo = function (v, vout) {
            if (vout === void 0) { vout = new Vector2(); }
            vout.x = this.x + v.x;
            vout.y = this.y + v.y;
            return vout;
        };
        /**
         * 从此点的坐标中减去另一个点的坐标以创建一个新点。
         * @param v 要减去的点。
         * @returns 新点。
         */
        Vector2.prototype.sub = function (v) {
            this.x -= v.x;
            this.y -= v.y;
            return this;
        };
        /**
         * 减去向量返回新向量
         * @param v 减去的向量
         * @return 返回的新向量
         */
        Vector2.prototype.subTo = function (v, vout) {
            if (vout === void 0) { vout = new Vector2(); }
            vout.x = this.x - v.x;
            vout.y = this.y - v.y;
            return vout;
        };
        /**
         * 乘以向量
         * @param v 向量
         */
        Vector2.prototype.multiply = function (v) {
            this.x *= v.x;
            this.y *= v.y;
            return this;
        };
        /**
         * 乘以向量
         * @param v 向量
         * @param vout 输出向量
         */
        Vector2.prototype.multiplyTo = function (v, vout) {
            if (vout === void 0) { vout = new Vector2(); }
            vout.x = this.x * v.x;
            vout.y = this.y * v.y;
            return vout;
        };
        /**
         * 除以向量
         * @param v 向量
         */
        Vector2.prototype.divide = function (v) {
            this.x /= v.x;
            this.y /= v.y;
            return this;
        };
        /**
         * 除以向量
         * @param v 向量
         * @param vout 输出向量
         */
        Vector2.prototype.divideTo = function (v, vout) {
            if (vout === void 0) { vout = new Vector2(); }
            vout.x = this.x / v.x;
            vout.y = this.y / v.y;
            return vout;
        };
        /**
         * 确定两个点是否相同。如果两个点具有相同的 x 和 y 值，则它们是相同的点。
         * @param toCompare 要比较的向量。
         * @returns 如果该对象与此 向量 对象相同，则为 true 值，如果不相同，则为 false。
         */
        Vector2.prototype.equals = function (v, precision) {
            if (precision === void 0) { precision = Math.PRECISION; }
            if (!Math.equals(this.x - v.x, 0, precision))
                return false;
            if (!Math.equals(this.y - v.y, 0, precision))
                return false;
            return true;
        };
        /**
         * 将源 Vector2 对象中的所有点数据复制到调用方 Vector2 对象中。
         * @param source 要从中复制数据的 Vector2 对象。
         */
        Vector2.prototype.copy = function (source) {
            this.x = source.x;
            this.y = source.y;
            return this;
        };
        /**
         * 返回与目标点之间的距离。
         * @param p 目标点
         * @returns 与目标点之间的距离。
         */
        Vector2.prototype.distance = function (p) {
            var dx = this.x - p.x, dy = this.y - p.y;
            return Math.sqrt(dx * dx + dy * dy);
        };
        /**
         * 与目标点之间的距离平方
         * @param p 目标点
         */
        Vector2.prototype.distanceSquared = function (p) {
            var dx = this.x - p.x, dy = this.y - p.y;
            return dx * dx + dy * dy;
        };
        /**
         * 将 (0,0) 和当前点之间的线段缩放为设定的长度。
         * @param thickness 缩放值。例如，如果当前点为 (0,5) 并且您将它规范化为 1，则返回的点位于 (0,1) 处。
         */
        Vector2.prototype.normalize = function (thickness) {
            if (thickness === void 0) { thickness = 1; }
            if (this.x != 0 || this.y != 0) {
                var relativeThickness = thickness / this.length;
                this.x *= relativeThickness;
                this.y *= relativeThickness;
            }
            return this;
        };
        /**
         * 负向量
         */
        Vector2.prototype.negate = function () {
            this.x *= -1;
            this.y *= -1;
            return this;
        };
        /**
         * 倒数向量。
         * (x,y) -> (1/x,1/y)
         */
        Vector2.prototype.reciprocal = function () {
            this.x = 1 / this.x;
            this.y = 1 / this.y;
            return this;
        };
        /**
         * 倒数向量。
         * (x,y) -> (1/x,1/y)
         */
        Vector2.prototype.reciprocalTo = function (out) {
            if (out === void 0) { out = new Vector2(); }
            out.copy(this).reciprocal();
            return out;
        };
        /**
         * 按标量（大小）缩放当前的 Vector3 对象。
         */
        Vector2.prototype.scaleNumber = function (s) {
            this.x *= s;
            this.y *= s;
            return this;
        };
        /**
         * 按标量（大小）缩放当前的 Vector2 对象。
         */
        Vector2.prototype.scaleNumberTo = function (s, vout) {
            if (vout === void 0) { vout = new Vector2(); }
            return vout.copy(this).scaleNumber(s);
        };
        /**
         * 缩放
         * @param s 缩放量
         */
        Vector2.prototype.scale = function (s) {
            this.x *= s.x;
            this.y *= s.y;
            return this;
        };
        /**
         * 缩放
         * @param s 缩放量
         */
        Vector2.prototype.scaleTo = function (s, vout) {
            if (vout === void 0) { vout = new Vector2(); }
            if (s == vout)
                s = s.clone();
            return vout.copy(this).scale(s);
        };
        /**
         * 按指定量偏移 Vector2 对象。dx 的值将添加到 x 的原始值中以创建新的 x 值。dy 的值将添加到 y 的原始值中以创建新的 y 值。
         * @param dx 水平坐标 x 的偏移量。
         * @param dy 水平坐标 y 的偏移量。
         */
        Vector2.prototype.offset = function (dx, dy) {
            this.x += dx;
            this.y += dy;
            return this;
        };
        /**
         * 插值到指定向量
         * @param v 目标向量
         * @param alpha 插值系数
         * @return 返回自身
         */
        Vector2.prototype.lerp = function (p, alpha) {
            this.x += (p.x - this.x) * alpha.x;
            this.y += (p.y - this.y) * alpha.y;
            return this;
        };
        /**
         * 插值到指定向量
         * @param v 目标向量
         * @param alpha 插值系数
         * @return 返回新向量
         */
        Vector2.prototype.lerpTo = function (v, alpha, vout) {
            if (vout === void 0) { vout = new Vector2(); }
            return vout.copy(this).lerp(v, alpha);
        };
        /**
         * 插值到指定向量
         * @param v 目标向量
         * @param alpha 插值系数
         * @return 返回自身
         */
        Vector2.prototype.lerpNumber = function (v, alpha) {
            this.x += (v.x - this.x) * alpha;
            this.y += (v.y - this.y) * alpha;
            return this;
        };
        /**
         * 插值到指定向量
         * @param v 目标向量
         * @param alpha 插值系数
         * @return 返回自身
         */
        Vector2.prototype.lerpNumberTo = function (v, alpha, vout) {
            if (vout === void 0) { vout = new Vector2(); }
            return vout.copy(this).lerpNumber(v, alpha);
        };
        /**
         * 夹紧？
         * @param min 最小值
         * @param max 最大值
         */
        Vector2.prototype.clamp = function (min, max) {
            this.x = Math.clamp(this.x, min.x, max.x);
            this.y = Math.clamp(this.y, min.y, max.y);
            return this;
        };
        /**
         * 夹紧？
         * @param min 最小值
         * @param max 最大值
         */
        Vector2.prototype.clampTo = function (min, max, vout) {
            if (vout === void 0) { vout = new Vector2(); }
            return vout.copy(this).clamp(min, max);
        };
        /**
         * 取最小元素
         * @param v 向量
         */
        Vector2.prototype.min = function (v) {
            this.x = Math.min(this.x, v.x);
            this.y = Math.min(this.y, v.y);
            return this;
        };
        /**
         * 取最大元素
         * @param v 向量
         */
        Vector2.prototype.max = function (v) {
            this.x = Math.max(this.x, v.x);
            this.y = Math.max(this.y, v.y);
            return this;
        };
        /**
         * 各分量均取最近的整数
         */
        Vector2.prototype.round = function () {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
            return this;
        };
        /**
         * 返回包含 x 和 y 坐标的值的字符串。该字符串的格式为 "(x=x, y=y)"，因此为点 23,17 调用 toString() 方法将返回 "(x=23, y=17)"。
         * @returns 坐标的字符串表示形式。
         */
        Vector2.prototype.toString = function () {
            return "(x=" + this.x + ", y=" + this.y + ")";
        };
        /**
         * 转换为数组
         * @param array 数组
         * @param offset 偏移
         * @return 返回数组
         */
        Vector2.prototype.toArray = function (array, offset) {
            if (array === void 0) { array = []; }
            if (offset === void 0) { offset = 0; }
            array[offset] = this.x;
            array[offset + 1] = this.y;
            return array;
        };
        /**
         * 原点
         */
        Vector2.ZERO = Object.freeze(new Vector2());
        __decorate([
            feng3d.oav(),
            feng3d.serialize
        ], Vector2.prototype, "x", void 0);
        __decorate([
            feng3d.oav(),
            feng3d.serialize
        ], Vector2.prototype, "y", void 0);
        return Vector2;
    }());
    feng3d.Vector2 = Vector2;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * Vector3 类使用笛卡尔坐标 x、y 和 z 表示三维空间中的点或位置
     */
    var Vector3 = /** @class */ (function () {
        /**
         * 创建 Vector3 对象的实例。如果未指定构造函数的参数，则将使用元素 (0,0,0,0) 创建 Vector3 对象。
         * @param x 第一个元素，例如 x 坐标。
         * @param y 第二个元素，例如 y 坐标。
         * @param z 第三个元素，例如 z 坐标。
         */
        function Vector3(x, y, z) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (z === void 0) { z = 0; }
            /**
            * Vector3 对象中的第一个元素，例如，三维空间中某个点的 x 坐标。默认值为 0
            */
            this.x = 0;
            /**
             * Vector3 对象中的第二个元素，例如，三维空间中某个点的 y 坐标。默认值为 0
             */
            this.y = 0;
            /**
             * Vector3 对象中的第三个元素，例如，三维空间中某个点的 z 坐标。默认值为 0
             */
            this.z = 0;
            this.x = x;
            this.y = y;
            this.z = z;
        }
        /**
         * 从数组中初始化向量
         * @param array 数组
         * @param offset 偏移
         * @return 返回新向量
         */
        Vector3.fromArray = function (array, offset) {
            if (offset === void 0) { offset = 0; }
            return new Vector3().fromArray(array, offset);
        };
        /**
         * 随机三维向量
         *
         * @param size 尺寸
         * @param double 如果值为false，随机范围在[0,size],否则[-size,size]。默认为false。
         */
        Vector3.random = function (size, double) {
            if (size === void 0) { size = 1; }
            if (double === void 0) { double = false; }
            var v = new Vector3(Math.random(), Math.random(), Math.random());
            if (double)
                v.scaleNumber(2).subNumber(1);
            v.scaleNumber(size);
            return v;
        };
        /**
         * 从Vector2初始化
         */
        Vector3.fromVector2 = function (vector, z) {
            if (z === void 0) { z = 0; }
            return new Vector3().fromVector2(vector, z);
        };
        Object.defineProperty(Vector3.prototype, "length", {
            /**
            * 当前 Vector3 对象的长度（大小），即从原点 (0,0,0) 到该对象的 x、y 和 z 坐标的距离。w 属性将被忽略。单位矢量具有的长度或大小为一。
            */
            get: function () {
                return Math.sqrt(this.lengthSquared);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Vector3.prototype, "lengthSquared", {
            /**
            * 当前 Vector3 对象长度的平方，它是使用 x、y 和 z 属性计算出来的。w 属性将被忽略。尽可能使用 lengthSquared() 方法，而不要使用 Vector3.length() 方法的 Math.sqrt() 方法调用，后者速度较慢。
            */
            get: function () {
                return this.x * this.x + this.y * this.y + this.z * this.z;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * 将 Vector3 的成员设置为指定值
         */
        Vector3.prototype.set = function (x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        };
        /**
         * 把所有分量都设为零
         */
        Vector3.prototype.setZero = function () {
            this.x = this.y = this.z = 0;
        };
        /**
         * 从Vector2初始化
         */
        Vector3.prototype.fromVector2 = function (vector, z) {
            if (z === void 0) { z = 0; }
            this.x = vector.x;
            this.y = vector.y;
            this.z = z;
            return this;
        };
        Vector3.prototype.fromArray = function (array, offset) {
            if (offset === void 0) { offset = 0; }
            this.x = array[offset];
            this.y = array[offset + 1];
            this.z = array[offset + 2];
            return this;
        };
        /**
         * 转换为Vector2
         */
        Vector3.prototype.toVector2 = function (vector) {
            if (vector === void 0) { vector = new feng3d.Vector2(); }
            return vector.set(this.x, this.y);
        };
        /**
         * 转换为Vector4
         */
        Vector3.prototype.toVector4 = function (vector4) {
            if (vector4 === void 0) { vector4 = new feng3d.Vector4(); }
            vector4.x = this.x;
            vector4.y = this.y;
            vector4.z = this.z;
            return vector4;
        };
        /**
         * 加上指定向量
         * @param v 加向量
         */
        Vector3.prototype.add = function (v) {
            this.x += v.x;
            this.y += v.y;
            this.z += v.z;
            return this;
        };
        /**
         * 加上指定向量得到新向量
         * @param v 加向量
         * @return 返回新向量
         */
        Vector3.prototype.addTo = function (v, vout) {
            if (vout === void 0) { vout = new Vector3(); }
            vout.x = this.x + v.x;
            vout.y = this.y + v.y;
            vout.z = this.z + v.z;
            return vout;
        };
        /**
         * 减去向量
         * @param a 减去的向量
         * @return 返回新向量
         */
        Vector3.prototype.sub = function (a) {
            this.x -= a.x;
            this.y -= a.y;
            this.z -= a.z;
            return this;
        };
        /**
         * 减去向量返回新向量
         * @param v 减去的向量
         * @return 返回的新向量
         */
        Vector3.prototype.subTo = function (v, vout) {
            if (vout === void 0) { vout = new Vector3(); }
            vout.x = this.x - v.x;
            vout.y = this.y - v.y;
            vout.z = this.z - v.z;
            return vout;
        };
        /**
         * 乘以向量
         * @param v 向量
         */
        Vector3.prototype.multiply = function (v) {
            this.x *= v.x;
            this.y *= v.y;
            this.z *= v.z;
            return this;
        };
        /**
         * 乘以向量
         * @param v 向量
         * @param vout 输出向量
         */
        Vector3.prototype.multiplyTo = function (v, vout) {
            if (vout === void 0) { vout = new Vector3(); }
            vout.x = this.x * v.x;
            vout.y = this.y * v.y;
            vout.z = this.z * v.z;
            return vout;
        };
        /**
         * 除以向量
         * @param a 向量
         */
        Vector3.prototype.divide = function (a) {
            this.x /= a.x;
            this.y /= a.y;
            this.z /= a.z;
            return this;
        };
        /**
         * 除以向量
         * @param a 向量
         * @param vout 输出向量
         */
        Vector3.prototype.divideTo = function (a, vout) {
            if (vout === void 0) { vout = new Vector3(); }
            vout.x = this.x / a.x;
            vout.y = this.y / a.y;
            vout.z = this.z / a.z;
            return vout;
        };
        /**
         * 通过将当前 Vector3 对象的 x、y 和 z 元素与指定的 Vector3 对象的 x、y 和 z 元素进行比较，确定这两个对象是否相等。
         */
        Vector3.prototype.equals = function (v, precision) {
            if (precision === void 0) { precision = Math.PRECISION; }
            if (!Math.equals(this.x - v.x, 0, precision))
                return false;
            if (!Math.equals(this.y - v.y, 0, precision))
                return false;
            if (!Math.equals(this.z - v.z, 0, precision))
                return false;
            return true;
        };
        /**
         * 将源 Vector3 对象中的所有矢量数据复制到调用方 Vector3 对象中。
         * @return 要从中复制数据的 Vector3 对象。
         */
        Vector3.prototype.copy = function (v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            return this;
        };
        /**
         * 与目标点之间的距离
         * @param p 目标点
         */
        Vector3.prototype.distance = function (p) {
            var dx = this.x - p.x, dy = this.y - p.y, dz = this.z - p.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        };
        /**
         * 与目标点之间的距离平方
         * @param p 目标点
         */
        Vector3.prototype.distanceSquared = function (p) {
            var dx = this.x - p.x, dy = this.y - p.y, dz = this.z - p.z;
            return dx * dx + dy * dy + dz * dz;
        };
        /**
         * 通过将最前面的三个元素（x、y、z）除以矢量的长度可将 Vector3 对象转换为单位矢量。
         */
        Vector3.prototype.normalize = function (thickness) {
            if (thickness === void 0) { thickness = 1; }
            var length = this.lengthSquared;
            if (length > 0) {
                length = Math.sqrt(length);
                var invLength = thickness / length;
                this.x *= invLength;
                this.y *= invLength;
                this.z *= invLength;
            }
            else {
                // Make something up
                this.x = 0;
                this.y = 0;
                this.z = 0;
            }
            return this;
        };
        /**
         * Scale a vector and add it to this vector. Save the result in "this". (this = this + vector * scalar)
         * @param scalar
         * @param vector
         * @param  target The vector to save the result in.
         */
        Vector3.prototype.addScaledVector = function (scalar, vector) {
            this.x = this.x + scalar * vector.x;
            this.y = this.y + scalar * vector.y;
            this.z = this.z + scalar * vector.z;
            return this;
        };
        /**
         * Scale a vector and add it to this vector. Save the result in "target". (target = this + vector * scalar)
         * @param scalar
         * @param vector
         * @param  target The vector to save the result in.
         */
        Vector3.prototype.addScaledVectorTo = function (scalar, vector, target) {
            if (target === void 0) { target = new Vector3(); }
            target.x = this.x + scalar * vector.x;
            target.y = this.y + scalar * vector.y;
            target.z = this.z + scalar * vector.z;
            return target;
        };
        /**
         * 叉乘向量
         * @param a 向量
         */
        Vector3.prototype.cross = function (a) {
            return this.set(this.y * a.z - this.z * a.y, this.z * a.x - this.x * a.z, this.x * a.y - this.y * a.x);
        };
        /**
         * 叉乘向量
         * @param a 向量
         * @param vout 输出向量
         */
        Vector3.prototype.crossTo = function (a, vout) {
            if (vout === void 0) { vout = new Vector3(); }
            vout.set(this.y * a.z - this.z * a.y, this.z * a.x - this.x * a.z, this.x * a.y - this.y * a.x);
            return vout;
        };
        /**
         * 如果当前 Vector3 对象和作为参数指定的 Vector3 对象均为单位顶点，此方法将返回这两个顶点之间所成角的余弦值。
         */
        Vector3.prototype.dot = function (a) {
            return this.x * a.x + this.y * a.y + this.z * a.z;
        };
        /**
         * 是否为零向量
         */
        Vector3.prototype.isZero = function () {
            return this.x === 0 && this.y === 0 && this.z === 0;
        };
        Vector3.prototype.tangents = function (t1, t2) {
            var norm = this.length;
            if (norm > 0.0) {
                var n = new Vector3();
                var inorm = 1 / norm;
                n.set(this.x * inorm, this.y * inorm, this.z * inorm);
                var randVec = new Vector3();
                if (Math.abs(n.x) < 0.9) {
                    randVec.set(1, 0, 0);
                    n.crossTo(randVec, t1);
                }
                else {
                    randVec.set(0, 1, 0);
                    n.crossTo(randVec, t1);
                }
                n.crossTo(t1, t2);
            }
            else {
                // The normal length is zero, make something up
                t1.set(1, 0, 0);
                t2.set(0, 1, 0);
            }
        };
        /**
         * 检查一个向量是否接近零
         *
         * @param precision
         */
        Vector3.prototype.almostZero = function (precision) {
            if (precision === void 0) { precision = Math.PRECISION; }
            if (Math.abs(this.x) > precision ||
                Math.abs(this.y) > precision ||
                Math.abs(this.z) > precision) {
                return false;
            }
            return true;
        };
        /**
         * 检查这个向量是否与另一个向量反平行。
         *
         * @param  v
         * @param  precision 设置为零以进行精确比较
         */
        Vector3.prototype.isAntiparallelTo = function (v, precision) {
            if (precision === void 0) { precision = Math.PRECISION; }
            var t = new Vector3();
            this.negateTo(t);
            return t.equals(v, precision);
        };
        /**
         * 加上标量
         * @param n 标量
         */
        Vector3.prototype.addNumber = function (n) {
            this.x += n;
            this.y += n;
            this.z += n;
            return this;
        };
        /**
         * 增加标量
         * @param n 标量
         */
        Vector3.prototype.addNumberTo = function (n, vout) {
            if (vout === void 0) { vout = new Vector3(); }
            vout.x = this.x + n;
            vout.y = this.y + n;
            vout.z = this.z + n;
            return vout;
        };
        /**
         * 减去标量
         * @param n 标量
         */
        Vector3.prototype.subNumber = function (n) {
            this.x -= n;
            this.y -= n;
            this.z -= n;
            return this;
        };
        /**
         * 减去标量
         * @param n 标量
         */
        Vector3.prototype.subNumberTo = function (n, vout) {
            if (vout === void 0) { vout = new Vector3(); }
            vout.x = this.x - n;
            vout.y = this.y - n;
            vout.z = this.z - n;
            return vout;
        };
        /**
         * 乘以标量
         * @param n 标量
         */
        Vector3.prototype.multiplyNumber = function (n) {
            this.x *= n;
            this.y *= n;
            this.z *= n;
            return this;
        };
        /**
         * 乘以标量
         * @param n 标量
         * @param vout 输出向量
         */
        Vector3.prototype.multiplyNumberTo = function (n, vout) {
            if (vout === void 0) { vout = new Vector3(); }
            vout.x = this.x * n;
            vout.y = this.y * n;
            vout.z = this.z * n;
            return vout;
        };
        /**
         * 除以标量
         * @param n 标量
         */
        Vector3.prototype.divideNumber = function (n) {
            this.x /= n;
            this.y /= n;
            this.z /= n;
            return this;
        };
        /**
         * 除以标量
         * @param n 标量
         * @param vout 输出向量
         */
        Vector3.prototype.divideNumberTo = function (n, vout) {
            if (vout === void 0) { vout = new Vector3(); }
            vout.x = this.x / n;
            vout.y = this.y / n;
            vout.z = this.z / n;
            return vout;
        };
        /**
         * 返回一个新 Vector3 对象，它是与当前 Vector3 对象完全相同的副本。
         * @return 一个新 Vector3 对象，它是当前 Vector3 对象的副本。
         */
        Vector3.prototype.clone = function () {
            return new Vector3(this.x, this.y, this.z);
        };
        /**
         * 负向量
         * (a,b,c)->(-a,-b,-c)
         */
        Vector3.prototype.negate = function () {
            this.x = -this.x;
            this.y = -this.y;
            this.z = -this.z;
            return this;
        };
        /**
         * 负向量
         * (a,b,c)->(-a,-b,-c)
         */
        Vector3.prototype.negateTo = function (vout) {
            if (vout === void 0) { vout = new Vector3(); }
            vout.x = -this.x;
            vout.y = -this.y;
            vout.z = -this.z;
            return vout;
        };
        /**
         * 倒向量
         * (a,b,c)->(1/a,1/b,1/c)
         */
        Vector3.prototype.inverse = function () {
            this.x = 1 / this.x;
            this.y = 1 / this.y;
            this.z = 1 / this.z;
            return this;
        };
        /**
         * 倒向量
         * (a,b,c)->(1/a,1/b,1/c)
         */
        Vector3.prototype.inverseTo = function (vout) {
            if (vout === void 0) { vout = new Vector3(); }
            vout.x = 1 / this.x;
            vout.y = 1 / this.y;
            vout.z = 1 / this.z;
            return vout;
        };
        /**
         * 得到这个向量长度为1
         */
        Vector3.prototype.unit = function (target) {
            if (target === void 0) { target = new Vector3(); }
            var x = this.x, y = this.y, z = this.z;
            var ninv = x * x + y * y + z * z;
            if (ninv > 0.0) {
                var ninv = Math.sqrt(ninv);
                ninv = 1.0 / ninv;
                target.x = x * ninv;
                target.y = y * ninv;
                target.z = z * ninv;
            }
            else {
                target.x = 1;
                target.y = 0;
                target.z = 0;
            }
            return target;
        };
        /**
         * 按标量（大小）缩放当前的 Vector3 对象。
         */
        Vector3.prototype.scaleNumber = function (s) {
            this.x *= s;
            this.y *= s;
            this.z *= s;
            return this;
        };
        /**
         * 按标量（大小）缩放当前的 Vector3 对象。
         */
        Vector3.prototype.scaleNumberTo = function (s, vout) {
            if (vout === void 0) { vout = new Vector3(); }
            vout.x = this.x * s;
            vout.y = this.y * s;
            vout.z = this.z * s;
            return vout;
        };
        /**
         * 缩放
         * @param s 缩放量
         */
        Vector3.prototype.scale = function (s) {
            this.x *= s.x;
            this.y *= s.y;
            this.z *= s.z;
            return this;
        };
        /**
         * 缩放
         * @param s 缩放量
         */
        Vector3.prototype.scaleTo = function (s, vout) {
            if (vout === void 0) { vout = new Vector3(); }
            vout.x = this.x * s.x;
            vout.y = this.y * s.y;
            vout.z = this.z * s.z;
            return vout;
        };
        /**
         * 插值到指定向量
         * @param v 目标向量
         * @param alpha 插值系数
         * @return 返回自身
         */
        Vector3.prototype.lerp = function (v, alpha) {
            this.x += (v.x - this.x) * alpha.x;
            this.y += (v.y - this.y) * alpha.y;
            this.z += (v.z - this.z) * alpha.z;
            return this;
        };
        /**
         * 插值到指定向量
         * @param v 目标向量
         * @param alpha 插值系数
         * @return 返回自身
         */
        Vector3.prototype.lerpTo = function (v, alpha, vout) {
            if (vout === void 0) { vout = new Vector3(); }
            vout.x = this.x + (v.x - this.x) * alpha.x;
            vout.y = this.y + (v.y - this.y) * alpha.y;
            vout.z = this.z + (v.z - this.z) * alpha.z;
            return vout;
        };
        /**
         * 插值到指定向量
         * @param v 目标向量
         * @param alpha 插值系数
         * @return 返回自身
         */
        Vector3.prototype.lerpNumber = function (v, alpha) {
            this.x += (v.x - this.x) * alpha;
            this.y += (v.y - this.y) * alpha;
            this.z += (v.z - this.z) * alpha;
            return this;
        };
        /**
         * 插值到指定向量
         * @param v 目标向量
         * @param alpha 插值系数
         * @return 返回自身
         */
        Vector3.prototype.lerpNumberTo = function (v, alpha, vout) {
            if (vout === void 0) { vout = new Vector3(); }
            vout.x = this.x + (v.x - this.x) * alpha;
            vout.y = this.y + (v.y - this.y) * alpha;
            vout.z = this.z + (v.z - this.z) * alpha;
            return vout;
        };
        /**
         * 小于指定点
         * @param p 点
         */
        Vector3.prototype.less = function (p) {
            return this.x < p.x && this.y < p.y && this.z < p.z;
        };
        /**
         * 小于等于指定点
         * @param p 点
         */
        Vector3.prototype.lessequal = function (p) {
            return this.x <= p.x && this.y <= p.y && this.z <= p.z;
        };
        /**
         * 大于指定点
         * @param p 点
         */
        Vector3.prototype.greater = function (p) {
            return this.x > p.x && this.y > p.y && this.z > p.z;
        };
        /**
         * 大于等于指定点
         * @param p 点
         */
        Vector3.prototype.greaterequal = function (p) {
            return this.x >= p.x && this.y >= p.y && this.z >= p.z;
        };
        /**
         * 夹紧？
         * @param min 最小值
         * @param max 最大值
         */
        Vector3.prototype.clamp = function (min, max) {
            this.x = Math.clamp(this.x, min.x, max.x);
            this.y = Math.clamp(this.y, min.y, max.y);
            this.z = Math.clamp(this.z, min.z, max.z);
            return this;
        };
        /**
         * 夹紧？
         * @param min 最小值
         * @param max 最大值
         */
        Vector3.prototype.clampTo = function (min, max, vout) {
            if (vout === void 0) { vout = new Vector3(); }
            return vout.copy(this).clamp(min, max);
        };
        /**
         * 取最小元素
         * @param v 向量
         */
        Vector3.prototype.min = function (v) {
            this.x = Math.min(this.x, v.x);
            this.y = Math.min(this.y, v.y);
            this.z = Math.min(this.z, v.z);
            return this;
        };
        /**
         * 取最大元素
         * @param v 向量
         */
        Vector3.prototype.max = function (v) {
            this.x = Math.max(this.x, v.x);
            this.y = Math.max(this.y, v.y);
            this.z = Math.max(this.z, v.z);
            return this;
        };
        /**
         * 应用矩阵
         * @param mat 矩阵
         */
        Vector3.prototype.applyMatrix4x4 = function (mat) {
            mat.transformPoint3(this, this);
            return this;
        };
        /**
         * 应用四元素
         * @param q 四元素
         */
        Vector3.prototype.applyQuaternion = function (q) {
            var x = this.x, y = this.y, z = this.z;
            var qx = q.x, qy = q.y, qz = q.z, qw = q.w;
            // calculate quat * vector
            var ix = qw * x + qy * z - qz * y;
            var iy = qw * y + qz * x - qx * z;
            var iz = qw * z + qx * y - qy * x;
            var iw = -qx * x - qy * y - qz * z;
            // calculate result * inverse quat
            this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
            this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
            this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
            return this;
        };
        /**
         * 反射
         * @param normal
         */
        Vector3.prototype.reflect = function (normal) {
            return this.sub(normal.multiplyNumberTo(2 * this.dot(normal)));
        };
        /**
         * 向下取整
         */
        Vector3.prototype.floor = function () {
            this.x = Math.floor(this.x);
            this.y = Math.floor(this.y);
            this.z = Math.floor(this.z);
            return this;
        };
        /**
         * 向上取整
         */
        Vector3.prototype.ceil = function () {
            this.x = Math.ceil(this.x);
            this.y = Math.ceil(this.y);
            this.z = Math.ceil(this.z);
            return this;
        };
        /**
         * 四舍五入
         */
        Vector3.prototype.round = function () {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
            this.z = Math.round(this.z);
            return this;
        };
        /**
         * 向0取整
         */
        Vector3.prototype.roundToZero = function () {
            this.x = (this.x < 0) ? Math.ceil(this.x) : Math.floor(this.x);
            this.y = (this.y < 0) ? Math.ceil(this.y) : Math.floor(this.y);
            this.z = (this.z < 0) ? Math.ceil(this.z) : Math.floor(this.z);
            return this;
        };
        /**
         * 与指定向量是否平行
         * @param v 向量
         */
        Vector3.prototype.isParallel = function (v, precision) {
            if (precision === void 0) { precision = Math.PRECISION; }
            return Math.equals(this.crossTo(v).lengthSquared, 0, precision);
        };
        /**
         * 从向量中得到叉乘矩阵a_cross，使得a x b = a_cross * b = c
         * @see http://www8.cs.umu.se/kurser/TDBD24/VT06/lectures/Lecture6.pdf
         */
        Vector3.prototype.crossmat = function () {
            return new feng3d.Matrix3x3([0, -this.z, this.y,
                this.z, 0, -this.x,
                -this.y, this.x, 0]);
        };
        /**
         * 返回当前 Vector3 对象的字符串表示形式。
         */
        Vector3.prototype.toString = function () {
            return "<" + this.x + ", " + this.y + ", " + this.z + ">";
        };
        /**
         * 转换为数组
         * @param array 数组
         * @param offset 偏移
         * @return 返回数组
         */
        Vector3.prototype.toArray = function (array, offset) {
            if (array === void 0) { array = []; }
            if (offset === void 0) { offset = 0; }
            array[offset] = this.x;
            array[offset + 1] = this.y;
            array[offset + 2] = this.z;
            return array;
        };
        /**
        * 定义为 Vector3 对象的 x 轴，坐标为 (1,0,0)。
        */
        Vector3.X_AXIS = Object.freeze(new Vector3(1, 0, 0));
        /**
        * 定义为 Vector3 对象的 y 轴，坐标为 (0,1,0)
        */
        Vector3.Y_AXIS = Object.freeze(new Vector3(0, 1, 0));
        /**
        * 定义为 Vector3 对象的 z 轴，坐标为 (0,0,1)
        */
        Vector3.Z_AXIS = Object.freeze(new Vector3(0, 0, 1));
        /**
         * 原点 Vector3(0,0,0)
         */
        Vector3.ZERO = Object.freeze(new Vector3());
        /**
         * Vector3(1, 1, 1)
         */
        Vector3.ONE = Object.freeze(new Vector3(1, 1, 1));
        __decorate([
            feng3d.serialize,
            feng3d.oav()
        ], Vector3.prototype, "x", void 0);
        __decorate([
            feng3d.serialize,
            feng3d.oav()
        ], Vector3.prototype, "y", void 0);
        __decorate([
            feng3d.serialize,
            feng3d.oav()
        ], Vector3.prototype, "z", void 0);
        return Vector3;
    }());
    feng3d.Vector3 = Vector3;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 四维向量
     */
    var Vector4 = /** @class */ (function () {
        /**
         * 创建 Vector4 对象的实例。如果未指定构造函数的参数，则将使用元素 (0,0,0,0) 创建 Vector4 对象。
         * @param x 第一个元素
         * @param y 第二个元素
         * @param z 第三个元素
         * @param w 第四个元素
         */
        function Vector4(x, y, z, w) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (z === void 0) { z = 0; }
            if (w === void 0) { w = 0; }
            /**
            * Vector4 对象中的第一个元素。默认值为 0
            */
            this.x = 0;
            /**
             * Vector4 对象中的第二个元素。默认值为 0
             */
            this.y = 0;
            /**
             * Vector4 对象中的第三个元素。默认值为 0
             */
            this.z = 0;
            /**
             * Vector4 对象的第四个元素。默认值为 0
             */
            this.w = 0;
            this.init(x, y, z, w);
        }
        Vector4.fromArray = function (array, offset) {
            if (offset === void 0) { offset = 0; }
            return new Vector4().fromArray(array, offset);
        };
        Vector4.fromVector3 = function (vector3, w) {
            if (w === void 0) { w = 0; }
            return new Vector4().fromVector3(vector3, w);
        };
        Vector4.random = function () {
            return new Vector4(Math.random(), Math.random(), Math.random(), Math.random());
        };
        /**
         * 初始化向量
         * @param x 第一个元素
         * @param y 第二个元素
         * @param z 第三个元素
         * @param w 第四个元素
         * @return 返回自身
         */
        Vector4.prototype.init = function (x, y, z, w) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
            return this;
        };
        /**
         * 从数组初始化
         * @param array 提供数据的数组
         * @param offset 数组中起始位置
         * @return 返回自身
         */
        Vector4.prototype.fromArray = function (array, offset) {
            if (offset === void 0) { offset = 0; }
            this.x = array[offset];
            this.y = array[offset + 1];
            this.z = array[offset + 2];
            this.w = array[offset + 3];
            return this;
        };
        /**
         * 从三维向量初始化
         * @param vector3 三维向量
         * @param w 向量第四个值
         * @return 返回自身
         */
        Vector4.prototype.fromVector3 = function (vector3, w) {
            if (w === void 0) { w = 0; }
            this.x = vector3.x;
            this.y = vector3.y;
            this.z = vector3.z;
            this.w = w;
            return this;
        };
        /**
         * 转换为三维向量
         * @param v3 三维向量
         */
        Vector4.prototype.toVector3 = function (v3) {
            if (v3 === void 0) { v3 = new feng3d.Vector3(); }
            v3.set(this.x, this.y, this.z);
            return v3;
        };
        /**
         * 转换为数组
         * @param array 数组
         * @param offset 偏移
         */
        Vector4.prototype.toArray = function (array, offset) {
            if (array === void 0) { array = []; }
            if (offset === void 0) { offset = 0; }
            array[offset] = this.x;
            array[offset + 1] = this.y;
            array[offset + 2] = this.z;
            array[offset + 3] = this.w;
            return array;
        };
        /**
         * 加上指定向量得到新向量
         * @param v 加向量
         * @return 返回新向量
         */
        Vector4.prototype.add = function (v) {
            this.x += v.x;
            this.y += v.y;
            this.z += v.z;
            this.w += v.w;
            return this;
        };
        /**
         * 加上指定向量得到新向量
         * @param v 加向量
         * @return 返回新向量
         */
        Vector4.prototype.addTo = function (v, vout) {
            if (vout === void 0) { vout = new Vector4(); }
            return vout.copy(this).add(v);
        };
        /**
         * 克隆一个向量
         * @return 返回一个拷贝向量
         */
        Vector4.prototype.clone = function () {
            return new Vector4(this.x, this.y, this.z, this.w);
        };
        /**
         * 从指定向量拷贝数据
         * @param v 被拷贝向量
         * @return 返回自身
         */
        Vector4.prototype.copy = function (v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            this.w = v.w;
            return this;
        };
        /**
         * 减去指定向量
         * @param v 减去的向量
         * @return 返回自身
         */
        Vector4.prototype.sub = function (v) {
            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;
            this.w -= v.w;
            return this;
        };
        /**
         * 减去指定向量
         * @param v 减去的向量
         * @return 返回新向量
         */
        Vector4.prototype.subTo = function (v, vout) {
            if (vout === void 0) { vout = new Vector4(); }
            return vout.copy(this).sub(v);
        };
        /**
         * 乘以指定向量
         * @param v 乘以的向量
         * @return 返回自身
         */
        Vector4.prototype.multiply = function (v) {
            this.x *= v.x;
            this.y *= v.y;
            this.z *= v.z;
            this.w *= v.w;
            return this;
        };
        /**
         * 乘以指定向量
         * @param v 乘以的向量
         * @return 返回新向量
         */
        Vector4.prototype.multiplyTo = function (v, vout) {
            if (vout === void 0) { vout = new Vector4(); }
            return vout.copy(this).multiply(v);
        };
        /**
         * 除以指定向量
         * @param v 除以的向量
         * @return 返回自身
         */
        Vector4.prototype.div = function (v) {
            this.x /= v.x;
            this.y /= v.y;
            this.z /= v.z;
            this.w /= v.w;
            return this;
        };
        /**
         * 除以指定向量
         * @param v 除以的向量
         * @return 返回新向量
         */
        Vector4.prototype.divTo = function (v, vout) {
            if (vout === void 0) { vout = new Vector4(); }
            return vout.copy(this).div(v);
        };
        /**
         * 与指定向量比较是否相等
         * @param v 比较的向量
         * @param precision 允许误差
         * @return 相等返回true，否则false
         */
        Vector4.prototype.equals = function (v, precision) {
            if (precision === void 0) { precision = Math.PRECISION; }
            if (!Math.equals(this.x - v.x, 0, precision))
                return false;
            if (!Math.equals(this.y - v.y, 0, precision))
                return false;
            if (!Math.equals(this.z - v.z, 0, precision))
                return false;
            if (!Math.equals(this.w - v.w, 0, precision))
                return false;
            return true;
        };
        /**
         * 负向量
         * @return 返回自身
         */
        Vector4.prototype.negate = function () {
            this.x = -this.x;
            this.y = -this.y;
            this.z = -this.z;
            this.w = -this.w;
            return this;
        };
        /**
         * 负向量
         * @return 返回新向量
         */
        Vector4.prototype.negateTo = function (vout) {
            if (vout === void 0) { vout = new Vector4(); }
            return vout.copy(this).negate();
        };
        /**
         * 缩放指定系数
         * @param s 缩放系数
         * @return 返回自身
         */
        Vector4.prototype.scale = function (s) {
            this.x *= s;
            this.y *= s;
            this.z *= s;
            this.w *= s;
            return this;
        };
        /**
         * 缩放指定系数
         * @param s 缩放系数
         * @return 返回新向量
         */
        Vector4.prototype.scaleTo = function (s) {
            return this.clone().scale(s);
        };
        /**
         * 如果当前 Vector4 对象和作为参数指定的 Vector4 对象均为单位顶点，此方法将返回这两个顶点之间所成角的余弦值。
         */
        Vector4.prototype.dot = function (a) {
            return this.x * a.x + this.y * a.y + this.z * a.z + this.w * a.w;
        };
        /**
         * 获取到指定向量的插值
         * @param v 终点插值向量
         * @param alpha 插值系数
         * @return 返回自身
         */
        Vector4.prototype.lerp = function (v, alpha) {
            this.x += (v.x - this.x) * alpha;
            this.y += (v.y - this.y) * alpha;
            this.z += (v.z - this.z) * alpha;
            this.w += (v.w - this.w) * alpha;
            return this;
        };
        /**
         * 获取到指定向量的插值
         * @param v 终点插值向量
         * @param alpha 插值系数
         * @return 返回新向量
         */
        Vector4.prototype.lerpTo = function (v, alpha, vout) {
            if (vout === void 0) { vout = new Vector4(); }
            return vout.copy(this).lerp(v, alpha);
        };
        /**
         * 应用矩阵
         * @param mat 矩阵
         */
        Vector4.prototype.applyMatrix4x4 = function (mat) {
            mat.transformVector4(this, this);
            return this;
        };
        /**
         * 返回当前 Vector4 对象的字符串表示形式。
         */
        Vector4.prototype.toString = function () {
            return "<" + this.x + ", " + this.y + ", " + this.z + ", " + this.w + ">";
        };
        __decorate([
            feng3d.serialize,
            feng3d.oav()
        ], Vector4.prototype, "x", void 0);
        __decorate([
            feng3d.serialize,
            feng3d.oav()
        ], Vector4.prototype, "y", void 0);
        __decorate([
            feng3d.serialize,
            feng3d.oav()
        ], Vector4.prototype, "z", void 0);
        __decorate([
            feng3d.serialize,
            feng3d.oav()
        ], Vector4.prototype, "w", void 0);
        return Vector4;
    }());
    feng3d.Vector4 = Vector4;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 矩形
     *
     * Rectangle 对象是按其位置（由它左上角的点 (x, y) 确定）以及宽度和高度定义的区域。<br/>
     * Rectangle 类的 x、y、width 和 height 属性相互独立；更改一个属性的值不会影响其他属性。
     * 但是，right 和 bottom 属性与这四个属性是整体相关的。例如，如果更改 right 属性的值，则 width
     * 属性的值将发生变化；如果更改 bottom 属性，则 height 属性的值将发生变化。
     */
    var Rectangle = /** @class */ (function () {
        /**
         * 创建一个新 Rectangle 对象，其左上角由 x 和 y 参数指定，并具有指定的 width 和 height 参数。
         * @param x 矩形左上角的 x 坐标。
         * @param y 矩形左上角的 y 坐标。
         * @param width 矩形的宽度（以像素为单位）。
         * @param height 矩形的高度（以像素为单位）。
         */
        function Rectangle(x, y, width, height) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (width === void 0) { width = 0; }
            if (height === void 0) { height = 0; }
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        Object.defineProperty(Rectangle.prototype, "right", {
            /**
             * x 和 width 属性的和。
             */
            get: function () {
                return this.x + this.width;
            },
            set: function (value) {
                this.width = value - this.x;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "bottom", {
            /**
             * y 和 height 属性的和。
             */
            get: function () {
                return this.y + this.height;
            },
            set: function (value) {
                this.height = value - this.y;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "left", {
            /**
             * 矩形左上角的 x 坐标。更改 Rectangle 对象的 left 属性对 y 和 height 属性没有影响。但是，它会影响 width 属性，而更改 x 值不会影响 width 属性。
             * left 属性的值等于 x 属性的值。
             */
            get: function () {
                return this.x;
            },
            set: function (value) {
                this.width += this.x - value;
                this.x = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "top", {
            /**
             * 矩形左上角的 y 坐标。更改 Rectangle 对象的 top 属性对 x 和 width 属性没有影响。但是，它会影响 height 属性，而更改 y 值不会影响 height 属性。<br/>
             * top 属性的值等于 y 属性的值。
             */
            get: function () {
                return this.y;
            },
            set: function (value) {
                this.height += this.y - value;
                this.y = value;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "topLeft", {
            /**
             * 由该点的 x 和 y 坐标确定的 Rectangle 对象左上角的位置。
             */
            get: function () {
                return new feng3d.Vector2(this.left, this.top);
            },
            set: function (value) {
                this.top = value.y;
                this.left = value.x;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "bottomRight", {
            /**
             * 由 right 和 bottom 属性的值确定的 Rectangle 对象的右下角的位置。
             */
            get: function () {
                return new feng3d.Vector2(this.right, this.bottom);
            },
            set: function (value) {
                this.bottom = value.y;
                this.right = value.x;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Rectangle.prototype, "center", {
            /**
             * 中心点
             */
            get: function () {
                return new feng3d.Vector2(this.x + this.width / 2, this.y + this.height / 2);
            },
            enumerable: false,
            configurable: true
        });
        /**
         * 将源 Rectangle 对象中的所有矩形数据复制到调用方 Rectangle 对象中。
         * @param sourceRect 要从中复制数据的 Rectangle 对象。
         */
        Rectangle.prototype.copyFrom = function (sourceRect) {
            this.x = sourceRect.x;
            this.y = sourceRect.y;
            this.width = sourceRect.width;
            this.height = sourceRect.height;
            return this;
        };
        /**
         * 将 Rectangle 的成员设置为指定值
         * @param x 矩形左上角的 x 坐标。
         * @param y 矩形左上角的 y 坐标。
         * @param width 矩形的宽度（以像素为单位）。
         * @param height 矩形的高度（以像素为单位）。
         */
        Rectangle.prototype.init = function (x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            return this;
        };
        /**
         * 确定由此 Rectangle 对象定义的矩形区域内是否包含指定的点。
         * @param x 检测点的x轴
         * @param y 检测点的y轴
         * @returns 如果检测点位于矩形内，返回true，否则，返回false
         */
        Rectangle.prototype.contains = function (x, y) {
            return this.x <= x &&
                this.x + this.width >= x &&
                this.y <= y &&
                this.y + this.height >= y;
        };
        /**
         * 如果在 toIntersect 参数中指定的 Rectangle 对象与此 Rectangle 对象相交，则返回交集区域作为 Rectangle 对象。如果矩形不相交，
         * 则此方法返回一个空的 Rectangle 对象，其属性设置为 0。
         * @param toIntersect 要对照比较以查看其是否与此 Rectangle 对象相交的 Rectangle 对象。
         * @returns 等于交集区域的 Rectangle 对象。如果该矩形不相交，则此方法返回一个空的 Rectangle 对象；即，其 x、y、width 和
         * height 属性均设置为 0 的矩形。
         */
        Rectangle.prototype.intersection = function (toIntersect) {
            if (!this.intersects(toIntersect))
                return new Rectangle();
            var i = new Rectangle();
            if (this.x > toIntersect.x) {
                i.x = this.x;
                i.width = toIntersect.x - this.x + toIntersect.width;
                if (i.width > this.width)
                    i.width = this.width;
            }
            else {
                i.x = toIntersect.x;
                i.width = this.x - toIntersect.x + this.width;
                if (i.width > toIntersect.width)
                    i.width = toIntersect.width;
            }
            if (this.y > toIntersect.y) {
                i.y = this.y;
                i.height = toIntersect.y - this.y + toIntersect.height;
                if (i.height > this.height)
                    i.height = this.height;
            }
            else {
                i.y = toIntersect.y;
                i.height = this.y - toIntersect.y + this.height;
                if (i.height > toIntersect.height)
                    i.height = toIntersect.height;
            }
            return i;
        };
        /**
         * 按指定量增加 Rectangle 对象的大小（以像素为单位）
         * 保持 Rectangle 对象的中心点不变，使用 dx 值横向增加它的大小，使用 dy 值纵向增加它的大小。
         * @param dx Rectangle 对象横向增加的值。
         * @param dy Rectangle 对象纵向增加的值。
         */
        Rectangle.prototype.inflate = function (dx, dy) {
            this.x -= dx;
            this.width += 2 * dx;
            this.y -= dy;
            this.height += 2 * dy;
        };
        /**
         * 确定在 toIntersect 参数中指定的对象是否与此 Rectangle 对象相交。此方法检查指定的 Rectangle
         * 对象的 x、y、width 和 height 属性，以查看它是否与此 Rectangle 对象相交。
         * @param toIntersect 要与此 Rectangle 对象比较的 Rectangle 对象。
         * @returns 如果两个矩形相交，返回true，否则返回false
         */
        Rectangle.prototype.intersects = function (toIntersect) {
            return Math.max(this.x, toIntersect.x) <= Math.min(this.right, toIntersect.right)
                && Math.max(this.y, toIntersect.y) <= Math.min(this.bottom, toIntersect.bottom);
        };
        /**
         * 确定此 Rectangle 对象是否为空。
         * @returns 如果 Rectangle 对象的宽度或高度小于等于 0，则返回 true 值，否则返回 false。
         */
        Rectangle.prototype.isEmpty = function () {
            return this.width <= 0 || this.height <= 0;
        };
        /**
         * 将 Rectangle 对象的所有属性设置为 0。
         */
        Rectangle.prototype.setEmpty = function () {
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
        };
        /**
         * 返回一个新的 Rectangle 对象，其 x、y、width 和 height 属性的值与原始 Rectangle 对象的对应值相同。
         * @returns 新的 Rectangle 对象，其 x、y、width 和 height 属性的值与原始 Rectangle 对象的对应值相同。
         */
        Rectangle.prototype.clone = function () {
            return new Rectangle(this.x, this.y, this.width, this.height);
        };
        /**
         * 确定由此 Rectangle 对象定义的矩形区域内是否包含指定的点。
         * 此方法与 Rectangle.contains() 方法类似，只不过它采用 Point 对象作为参数。
         * @param point 包含点对象
         * @returns 如果包含，返回true，否则返回false
         */
        Rectangle.prototype.containsPoint = function (point) {
            if (this.x < point.x
                && this.x + this.width > point.x
                && this.y < point.y
                && this.y + this.height > point.y) {
                return true;
            }
            return false;
        };
        /**
         * 确定此 Rectangle 对象内是否包含由 rect 参数指定的 Rectangle 对象。
         * 如果一个 Rectangle 对象完全在另一个 Rectangle 的边界内，我们说第二个 Rectangle 包含第一个 Rectangle。
         * @param rect 所检查的 Rectangle 对象
         * @returns 如果此 Rectangle 对象包含您指定的 Rectangle 对象，则返回 true 值，否则返回 false。
         */
        Rectangle.prototype.containsRect = function (rect) {
            var r1 = rect.x + rect.width;
            var b1 = rect.y + rect.height;
            var r2 = this.x + this.width;
            var b2 = this.y + this.height;
            return (rect.x >= this.x) && (rect.x < r2) && (rect.y >= this.y) && (rect.y < b2) && (r1 > this.x) && (r1 <= r2) && (b1 > this.y) && (b1 <= b2);
        };
        /**
         * 确定在 toCompare 参数中指定的对象是否等于此 Rectangle 对象。
         * 此方法将某个对象的 x、y、width 和 height 属性与此 Rectangle 对象所对应的相同属性进行比较。
         * @param toCompare 要与此 Rectangle 对象进行比较的矩形。
         * @returns 如果对象具有与此 Rectangle 对象完全相同的 x、y、width 和 height 属性值，则返回 true 值，否则返回 false。
         */
        Rectangle.prototype.equals = function (toCompare) {
            if (this === toCompare) {
                return true;
            }
            return this.x === toCompare.x && this.y === toCompare.y
                && this.width === toCompare.width && this.height === toCompare.height;
        };
        /**
         * 增加 Rectangle 对象的大小。此方法与 Rectangle.inflate() 方法类似，只不过它采用 Point 对象作为参数。
         */
        Rectangle.prototype.inflatePoint = function (point) {
            this.inflate(point.x, point.y);
        };
        /**
         * 按指定量调整 Rectangle 对象的位置（由其左上角确定）。
         * @param dx 将 Rectangle 对象的 x 值移动此数量。
         * @param dy 将 Rectangle 对象的 t 值移动此数量。
         */
        Rectangle.prototype.offset = function (dx, dy) {
            this.x += dx;
            this.y += dy;
        };
        /**
         * 将 Point 对象用作参数来调整 Rectangle 对象的位置。此方法与 Rectangle.offset() 方法类似，只不过它采用 Point 对象作为参数。
         * @param point 要用于偏移此 Rectangle 对象的 Point 对象。
         */
        Rectangle.prototype.offsetPoint = function (point) {
            this.offset(point.x, point.y);
        };
        /**
         * 生成并返回一个字符串，该字符串列出 Rectangle 对象的水平位置和垂直位置以及高度和宽度。
         * @returns 一个字符串，它列出了 Rectangle 对象的下列各个属性的值：x、y、width 和 height。
         */
        Rectangle.prototype.toString = function () {
            return "(x=" + this.x + ", y=" + this.y + ", width=" + this.width + ", height=" + this.height + ")";
        };
        /**
         * 通过填充两个矩形之间的水平和垂直空间，将这两个矩形组合在一起以创建一个新的 Rectangle 对象。
         * @param toUnion 要添加到此 Rectangle 对象的 Rectangle 对象。
         * @returns 充当两个矩形的联合的新 Rectangle 对象。
         */
        Rectangle.prototype.union = function (toUnion) {
            var result = this.clone();
            if (toUnion.isEmpty()) {
                return result;
            }
            if (result.isEmpty()) {
                result.copyFrom(toUnion);
                return result;
            }
            var l = Math.min(result.x, toUnion.x);
            var t = Math.min(result.y, toUnion.y);
            result.init(l, t, Math.max(result.right, toUnion.right) - l, Math.max(result.bottom, toUnion.bottom) - t);
            return result;
        };
        /**
         *
         * @param point 点
         * @param pout 输出点
         */
        Rectangle.prototype.clampPoint = function (point, pout) {
            if (pout === void 0) { pout = new feng3d.Vector2(); }
            return pout.copy(point).clamp(this.topLeft, this.bottomRight);
        };
        Object.defineProperty(Rectangle.prototype, "size", {
            /**
             * The size of the Rectangle object, expressed as a Point object with the
             * values of the <code>width</code> and <code>height</code> properties.
             */
            get: function () {
                return new feng3d.Vector2(this.width, this.height);
            },
            enumerable: false,
            configurable: true
        });
        return Rectangle;
    }());
    feng3d.Rectangle = Rectangle;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * Matrix3x3 类表示一个转换矩阵，该矩阵确定二维 (2D) 显示对象的位置和方向。
     * 该矩阵可以执行转换功能，包括平移（沿 x 和 y 轴重新定位）、旋转和缩放（调整大小）。
     * ```
     *  ---                                   ---
     *  |   scaleX      0         0    |   x轴
     *  |     0       scaleY      0    |   y轴
     *  |     tx        ty        1    |   平移
     *  ---                                   ---
     *
     *  ---                                   ---
     *  |     0         1         2    |   x轴
     *  |     3         4         5    |   y轴
     *  |     6         7         8    |   平移
     *  ---                                   ---
     * ```
     */
    var Matrix3x3 = /** @class */ (function () {
        /**
         * 构建3x3矩阵
         *
         * @param elements 九个元素的数组
         */
        function Matrix3x3(elements) {
            if (elements === void 0) { elements = [
                1, 0, 0,
                0, 1, 0,
                0, 0, 1
            ]; }
            this.elements = elements;
        }
        /**
         * 设置矩阵为单位矩阵
         */
        Matrix3x3.prototype.identity = function () {
            var e = this.elements;
            e[0] = 1;
            e[1] = 0;
            e[2] = 0;
            e[3] = 0;
            e[4] = 1;
            e[5] = 0;
            e[6] = 0;
            e[7] = 0;
            e[8] = 1;
            return this;
        };
        /**
         * 将所有元素设置为0
         */
        Matrix3x3.prototype.setZero = function () {
            var e = this.elements;
            e[0] = 0;
            e[1] = 0;
            e[2] = 0;
            e[3] = 0;
            e[4] = 0;
            e[5] = 0;
            e[6] = 0;
            e[7] = 0;
            e[8] = 0;
            return this;
        };
        /**
         * 根据一个 Vector3 设置矩阵对角元素
         *
         * @param vec3
         */
        Matrix3x3.prototype.setTrace = function (vec3) {
            var e = this.elements;
            e[0] = vec3.x;
            e[4] = vec3.y;
            e[8] = vec3.z;
            return this;
        };
        /**
         * 获取矩阵对角元素
         */
        Matrix3x3.prototype.getTrace = function (target) {
            if (target === void 0) { target = new feng3d.Vector3(); }
            var e = this.elements;
            target.x = e[0];
            target.y = e[4];
            target.z = e[8];
            return target;
        };
        /**
         * 矩阵向量乘法
         *
         * @param v 要乘以的向量
         * @param target 目标保存结果
         */
        Matrix3x3.prototype.vmult = function (v, target) {
            if (target === void 0) { target = new feng3d.Vector3(); }
            var e = this.elements, x = v.x, y = v.y, z = v.z;
            target.x = e[0] * x + e[1] * y + e[2] * z;
            target.y = e[3] * x + e[4] * y + e[5] * z;
            target.z = e[6] * x + e[7] * y + e[8] * z;
            return target;
        };
        /**
         * 矩阵标量乘法
         * @param s
         */
        Matrix3x3.prototype.smult = function (s) {
            for (var i = 0; i < this.elements.length; i++) {
                this.elements[i] *= s;
            }
        };
        /**
         * 矩阵乘法
         * @param  m 要从左边乘的矩阵。
         */
        Matrix3x3.prototype.mmult = function (m, target) {
            if (target === void 0) { target = new Matrix3x3(); }
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 3; j++) {
                    var sum = 0.0;
                    for (var k = 0; k < 3; k++) {
                        sum += m.elements[i + k * 3] * this.elements[k + j * 3];
                    }
                    target.elements[i + j * 3] = sum;
                }
            }
            return target;
        };
        /**
         * 缩放矩阵的每一列
         *
         * @param v
         */
        Matrix3x3.prototype.scale = function (v, target) {
            if (target === void 0) { target = new Matrix3x3(); }
            var e = this.elements, t = target.elements;
            for (var i = 0; i !== 3; i++) {
                t[3 * i + 0] = v.x * e[3 * i + 0];
                t[3 * i + 1] = v.y * e[3 * i + 1];
                t[3 * i + 2] = v.z * e[3 * i + 2];
            }
            return target;
        };
        /**
         * 解决Ax = b
         *
         * @param b 右手边
         * @param target 结果
         */
        Matrix3x3.prototype.solve = function (b, target) {
            if (target === void 0) { target = new feng3d.Vector3(); }
            // Construct equations
            var nr = 3; // num rows
            var nc = 4; // num cols
            var eqns = [];
            for (var i = 0; i < nr * nc; i++) {
                eqns.push(0);
            }
            var i, j;
            for (i = 0; i < 3; i++) {
                for (j = 0; j < 3; j++) {
                    eqns[i + nc * j] = this.elements[i + 3 * j];
                }
            }
            eqns[3 + 4 * 0] = b.x;
            eqns[3 + 4 * 1] = b.y;
            eqns[3 + 4 * 2] = b.z;
            // 计算矩阵的右上三角型——高斯消去法
            var n = 3, k = n, np;
            var kp = 4; // num rows
            var p;
            do {
                i = k - n;
                if (eqns[i + nc * i] === 0) {
                    // the pivot is null, swap lines
                    for (j = i + 1; j < k; j++) {
                        if (eqns[i + nc * j] !== 0) {
                            np = kp;
                            do { // do ligne( i ) = ligne( i ) + ligne( k )
                                p = kp - np;
                                eqns[p + nc * i] += eqns[p + nc * j];
                            } while (--np);
                            break;
                        }
                    }
                }
                if (eqns[i + nc * i] !== 0) {
                    for (j = i + 1; j < k; j++) {
                        var multiplier = eqns[i + nc * j] / eqns[i + nc * i];
                        np = kp;
                        do { // do ligne( k ) = ligne( k ) - multiplier * ligne( i )
                            p = kp - np;
                            eqns[p + nc * j] = p <= i ? 0 : eqns[p + nc * j] - eqns[p + nc * i] * multiplier;
                        } while (--np);
                    }
                }
            } while (--n);
            // Get the solution
            target.z = eqns[2 * nc + 3] / eqns[2 * nc + 2];
            target.y = (eqns[1 * nc + 3] - eqns[1 * nc + 2] * target.z) / eqns[1 * nc + 1];
            target.x = (eqns[0 * nc + 3] - eqns[0 * nc + 2] * target.z - eqns[0 * nc + 1] * target.y) / eqns[0 * nc + 0];
            if (isNaN(target.x) || isNaN(target.y) || isNaN(target.z) || target.x === Infinity || target.y === Infinity || target.z === Infinity) {
                throw "Could not solve equation! Got x=[" + target.toString() + "], b=[" + b.toString() + "], A=[" + this.toString() + "]";
            }
            return target;
        };
        /**
         * 获取指定行列元素值
         *
         * @param row
         * @param column
         */
        Matrix3x3.prototype.getElement = function (row, column) {
            return this.elements[column + 3 * row];
        };
        /**
         * 设置指定行列元素值
         *
         * @param row
         * @param column
         * @param value
         */
        Matrix3x3.prototype.setElement = function (row, column, value) {
            this.elements[column + 3 * row] = value;
        };
        /**
         * 将另一个矩阵复制到这个矩阵对象中
         *
         * @param source
         */
        Matrix3x3.prototype.copy = function (source) {
            for (var i = 0; i < source.elements.length; i++) {
                this.elements[i] = source.elements[i];
            }
            return this;
        };
        /**
         * 返回矩阵的字符串表示形式
         */
        Matrix3x3.prototype.toString = function () {
            var r = "";
            var sep = ",";
            for (var i = 0; i < 9; i++) {
                r += this.elements[i] + sep;
            }
            return r;
        };
        /**
         * 逆矩阵
         */
        Matrix3x3.prototype.reverse = function () {
            // Construct equations
            var nr = 3; // num rows
            var nc = 6; // num cols
            var eqns = [];
            for (var i = 0; i < nr * nc; i++) {
                eqns.push(0);
            }
            var i, j;
            for (i = 0; i < 3; i++) {
                for (j = 0; j < 3; j++) {
                    eqns[i + nc * j] = this.elements[i + 3 * j];
                }
            }
            eqns[3 + 6 * 0] = 1;
            eqns[3 + 6 * 1] = 0;
            eqns[3 + 6 * 2] = 0;
            eqns[4 + 6 * 0] = 0;
            eqns[4 + 6 * 1] = 1;
            eqns[4 + 6 * 2] = 0;
            eqns[5 + 6 * 0] = 0;
            eqns[5 + 6 * 1] = 0;
            eqns[5 + 6 * 2] = 1;
            // Compute right upper triangular version of the matrix - Gauss elimination
            var n = 3, k = n, np;
            var kp = nc; // num rows
            var p;
            do {
                i = k - n;
                if (eqns[i + nc * i] === 0) {
                    // the pivot is null, swap lines
                    for (j = i + 1; j < k; j++) {
                        if (eqns[i + nc * j] !== 0) {
                            np = kp;
                            do { // do line( i ) = line( i ) + line( k )
                                p = kp - np;
                                eqns[p + nc * i] += eqns[p + nc * j];
                            } while (--np);
                            break;
                        }
                    }
                }
                if (eqns[i + nc * i] !== 0) {
                    for (j = i + 1; j < k; j++) {
                        var multiplier = eqns[i + nc * j] / eqns[i + nc * i];
                        np = kp;
                        do { // do line( k ) = line( k ) - multiplier * line( i )
                            p = kp - np;
                            eqns[p + nc * j] = p <= i ? 0 : eqns[p + nc * j] - eqns[p + nc * i] * multiplier;
                        } while (--np);
                    }
                }
            } while (--n);
            // eliminate the upper left triangle of the matrix
            i = 2;
            do {
                j = i - 1;
                do {
                    var multiplier = eqns[i + nc * j] / eqns[i + nc * i];
                    np = nc;
                    do {
                        p = nc - np;
                        eqns[p + nc * j] = eqns[p + nc * j] - eqns[p + nc * i] * multiplier;
                    } while (--np);
                } while (j--);
            } while (--i);
            // operations on the diagonal
            i = 2;
            do {
                var multiplier = 1 / eqns[i + nc * i];
                np = nc;
                do {
                    p = nc - np;
                    eqns[p + nc * i] = eqns[p + nc * i] * multiplier;
                } while (--np);
            } while (i--);
            i = 2;
            do {
                j = 2;
                do {
                    p = eqns[nr + j + nc * i];
                    if (isNaN(p) || p === Infinity) {
                        throw "Could not reverse! A=[" + this.toString() + "]";
                    }
                    this.setElement(i, j, p);
                } while (j--);
            } while (i--);
            return this;
        };
        /**
         * 逆矩阵
         */
        Matrix3x3.prototype.reverseTo = function (target) {
            if (target === void 0) { target = new Matrix3x3(); }
            return target.copy(this).reverse();
        };
        /**
         * 从四元数设置矩阵
         *
         * @param q
         */
        Matrix3x3.prototype.setRotationFromQuaternion = function (q) {
            var x = q.x, y = q.y, z = q.z, w = q.w, x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2, e = this.elements;
            e[3 * 0 + 0] = 1 - (yy + zz);
            e[3 * 0 + 1] = xy - wz;
            e[3 * 0 + 2] = xz + wy;
            e[3 * 1 + 0] = xy + wz;
            e[3 * 1 + 1] = 1 - (xx + zz);
            e[3 * 1 + 2] = yz - wx;
            e[3 * 2 + 0] = xz - wy;
            e[3 * 2 + 1] = yz + wx;
            e[3 * 2 + 2] = 1 - (xx + yy);
            return this;
        };
        /**
         * 转置矩阵
         */
        Matrix3x3.prototype.transpose = function () {
            var Mt = this.elements, M = this.elements.concat();
            for (var i = 0; i !== 3; i++) {
                for (var j = 0; j !== 3; j++) {
                    Mt[3 * i + j] = M[3 * j + i];
                }
            }
            return this;
        };
        /**
         * 转置矩阵
         */
        Matrix3x3.prototype.transposeTo = function (target) {
            if (target === void 0) { target = new Matrix3x3(); }
            return target.copy(this).transpose();
        };
        Matrix3x3.prototype.formMatrix4x4 = function (matrix4x4) {
            var m4 = matrix4x4.elements;
            var m3 = this.elements;
            m3[0] = m4[0];
            m3[1] = m4[1];
            m3[2] = m4[2];
            m3[3] = m4[4];
            m3[4] = m4[5];
            m3[5] = m4[6];
            m3[6] = m4[8];
            m3[7] = m4[9];
            m3[8] = m4[10];
            return this;
        };
        /**
         * 转换为数组
         * @param array 数组
         * @param offset 偏移
         */
        Matrix3x3.prototype.toArray = function (array, offset) {
            if (array === void 0) { array = []; }
            if (offset === void 0) { offset = 0; }
            this.elements.forEach(function (v, i) {
                array[offset + i] = v;
            });
            return array;
        };
        /**
         * 转换为4x4矩阵
         *
         * @param out 4x4矩阵
         */
        Matrix3x3.prototype.toMatrix4x4 = function (out) {
            if (out === void 0) { out = new feng3d.Matrix4x4(); }
            var outdata = out.elements;
            var indata = this.elements;
            outdata[0] = indata[0];
            outdata[1] = indata[1];
            outdata[2] = 0;
            outdata[3] = 0;
            outdata[4] = indata[3];
            outdata[5] = indata[4];
            outdata[6] = 0;
            outdata[7] = 0;
            outdata[8] = 0;
            outdata[9] = 0;
            outdata[10] = 1;
            outdata[11] = 0;
            outdata[12] = indata[6];
            outdata[13] = indata[7];
            outdata[14] = 0;
            outdata[15] = 1;
            return out;
        };
        return Matrix3x3;
    }());
    feng3d.Matrix3x3 = Matrix3x3;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * Matrix4x4 类表示一个转换矩阵，该矩阵确定三维 (3D) 显示对象的位置和方向。
     * 该矩阵可以执行转换功能，包括平移（沿 x、y 和 z 轴重新定位）、旋转和缩放（调整大小）。
     * Matrix4x4 类还可以执行透视投影，这会将 3D 坐标空间中的点映射到二维 (2D) 视图。
     * ```
     *  ---                                   ---
     *  |   scaleX      0         0       0     |   x轴
     *  |     0       scaleY      0       0     |   y轴
     *  |     0         0       scaleZ    0     |   z轴
     *  |     tx        ty        tz      1     |   平移
     *  ---                                   ---
     *
     *  ---                                   ---
     *  |     0         1         2        3    |   x轴
     *  |     4         5         6        7    |   y轴
     *  |     8         9         10       11   |   z轴
     *  |     12        13        14       15   |   平移
     *  ---                                   ---
     * ```
     *
     * @see https://help.adobe.com/zh_CN/FlashPlatform/reference/actionscript/3/flash/geom/Matrix3D.html
     * @see https://github.com/mrdoob/three.js/blob/dev/src/math/Matrix4.js
     * @see https://docs.unity3d.com/ScriptReference/Matrix4x4.html
     */
    var Matrix4x4 = /** @class */ (function () {
        /**
         * 创建 Matrix4x4 对象。
         * @param   rawData    一个由 16 个数字组成的矢量，其中，每四个元素可以是 4x4 矩阵的一列。
         */
        function Matrix4x4(rawData) {
            if (rawData === void 0) { rawData = [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1,
            ]; }
            this.elements = rawData;
        }
        /**
         * 通过位移旋转缩放重组矩阵
         *
         * @param position 位移
         * @param rotation 旋转角度，按照指定旋转顺序旋转角度。
         * @param scale 缩放。
         * @param order 旋转顺序。
         */
        Matrix4x4.fromTRS = function (position, rotation, scale, order) {
            if (order === void 0) { order = feng3d.defaultRotationOrder; }
            return new Matrix4x4().fromTRS(position, rotation, scale, order);
        };
        /**
         * 从轴与旋转角度创建矩阵
         *
         * @param   axis            旋转轴
         * @param   degrees         角度
         */
        Matrix4x4.fromAxisRotate = function (axis, degrees) {
            return new Matrix4x4().fromAxisRotate(axis, degrees);
        };
        /**
         * 从欧拉角旋转角度初始化矩阵。
         *
         * @param   rx      用于沿 x 轴旋转对象的角度。
         * @param   ry      用于沿 y 轴旋转对象的角度。
         * @param   rz      用于沿 z 轴旋转对象的角度。
         * @param   order   绕轴旋转的顺序。
         */
        Matrix4x4.fromRotation = function (rx, ry, rz, order) {
            if (order === void 0) { order = feng3d.defaultRotationOrder; }
            return new Matrix4x4().fromRotation(rx, ry, rz, order);
        };
        /**
         * 从四元素初始化矩阵。
         *
         * @param q 四元素
         */
        Matrix4x4.fromQuaternion = function (q) {
            return new Matrix4x4().fromQuaternion(q);
        };
        /**
         * 创建缩放矩阵
         * @param   sx      用于沿 x 轴缩放对象的乘数。
         * @param   sy      用于沿 y 轴缩放对象的乘数。
         * @param   sz      用于沿 z 轴缩放对象的乘数。
         */
        Matrix4x4.fromScale = function (sx, sy, sz) {
            var rotationMat = new Matrix4x4([
                sx, 0., 0., 0,
                0., sy, 0., 0,
                0., 0., sz, 0,
                0., 0., 0., 1 //
            ]);
            return rotationMat;
        };
        /**
         * 创建位移矩阵
         * @param   x   沿 x 轴的增量平移。
         * @param   y   沿 y 轴的增量平移。
         * @param   z   沿 z 轴的增量平移。
         */
        Matrix4x4.fromPosition = function (x, y, z) {
            var rotationMat = new Matrix4x4([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                x, y, z, 1 //
            ]);
            return rotationMat;
        };
        /**
         * 获取位移
         *
         * @param value 用于存储位移信息的向量
         */
        Matrix4x4.prototype.getPosition = function (value) {
            if (value === void 0) { value = new feng3d.Vector3(); }
            value.x = this.elements[12];
            value.y = this.elements[13];
            value.z = this.elements[14];
            return value;
        };
        /**
         * 设置位移
         *
         * @param value 位移
         */
        Matrix4x4.prototype.setPosition = function (value) {
            this.elements[12] = value.x;
            this.elements[13] = value.y;
            this.elements[14] = value.z;
            return this;
        };
        /**
         * 获取欧拉旋转角度。
         *
         * @param rotation 欧拉旋转角度。
         * @param order   绕轴旋转的顺序。
         */
        Matrix4x4.prototype.getRotation = function (rotation, order) {
            if (rotation === void 0) { rotation = new feng3d.Vector3(); }
            if (order === void 0) { order = feng3d.defaultRotationOrder; }
            this.toTRS(new feng3d.Vector3(), rotation, new feng3d.Vector3(), order);
            return rotation;
        };
        /**
         * 设置欧拉旋转角度。
         *
         * @param rotation 欧拉旋转角度。
         * @param order 绕轴旋转的顺序。
         */
        Matrix4x4.prototype.setRotation = function (rotation, order) {
            if (order === void 0) { order = feng3d.defaultRotationOrder; }
            var p = new feng3d.Vector3();
            var r = new feng3d.Vector3();
            var s = new feng3d.Vector3();
            this.toTRS(p, r, s, order);
            r.copy(rotation);
            this.fromTRS(p, r, s);
            return this;
        };
        /**
         * 获取缩放值。
         *
         * @param scale 用于存储缩放值的向量。
         */
        Matrix4x4.prototype.getScale = function (scale) {
            if (scale === void 0) { scale = new feng3d.Vector3; }
            var rawData = this.elements;
            var v = new feng3d.Vector3();
            scale.x = v.set(rawData[0], rawData[1], rawData[2]).length;
            scale.y = v.set(rawData[4], rawData[5], rawData[6]).length;
            scale.z = v.set(rawData[8], rawData[9], rawData[10]).length;
            return scale;
        };
        /**
         * 获取缩放值。
         *
         * @param scale 缩放值。
         */
        Matrix4x4.prototype.setScale = function (scale) {
            var oldS = this.getScale();
            var te = this.elements;
            var sx = scale.x / oldS.x;
            var sy = scale.y / oldS.y;
            var sz = scale.z / oldS.z;
            te[0] *= sx;
            te[1] *= sx;
            te[2] *= sx;
            te[4] *= sy;
            te[5] *= sy;
            te[6] *= sy;
            te[8] *= sz;
            te[9] *= sz;
            te[10] *= sz;
            return this;
        };
        Object.defineProperty(Matrix4x4.prototype, "determinant", {
            /**
             * 一个用于确定矩阵是否可逆的数字。如果值为0则不可逆。
             */
            get: function () {
                return ( //
                (this.elements[0] * this.elements[5] - this.elements[4] * this.elements[1]) * (this.elements[10] * this.elements[15] - this.elements[14] * this.elements[11]) //
                    - (this.elements[0] * this.elements[9] - this.elements[8] * this.elements[1]) * (this.elements[6] * this.elements[15] - this.elements[14] * this.elements[7]) //
                    + (this.elements[0] * this.elements[13] - this.elements[12] * this.elements[1]) * (this.elements[6] * this.elements[11] - this.elements[10] * this.elements[7]) //
                    + (this.elements[4] * this.elements[9] - this.elements[8] * this.elements[5]) * (this.elements[2] * this.elements[15] - this.elements[14] * this.elements[3]) //
                    - (this.elements[4] * this.elements[13] - this.elements[12] * this.elements[5]) * (this.elements[2] * this.elements[11] - this.elements[10] * this.elements[3]) //
                    + (this.elements[8] * this.elements[13] - this.elements[12] * this.elements[9]) * (this.elements[2] * this.elements[7] - this.elements[6] * this.elements[3]) //
                );
            },
            enumerable: false,
            configurable: true
        });
        /**
         * 获取X轴向量
         *
         * @param out 保存X轴向量
         */
        Matrix4x4.prototype.getAxisX = function (out) {
            if (out === void 0) { out = new feng3d.Vector3(); }
            return out.set(this.elements[0], this.elements[1], this.elements[2]);
        };
        /**
         * 设置X轴向量
         *
         * @param vector X轴向量
         */
        Matrix4x4.prototype.setAxisX = function (vector) {
            if (vector === void 0) { vector = new feng3d.Vector3(); }
            this.elements[0] = vector.x;
            this.elements[1] = vector.y;
            this.elements[2] = vector.z;
            return this;
        };
        /**
         * 获取Y轴向量
         *
         * @param out 保存Y轴向量
         */
        Matrix4x4.prototype.getAxisY = function (out) {
            if (out === void 0) { out = new feng3d.Vector3(); }
            return out.set(this.elements[4], this.elements[5], this.elements[6]);
        };
        /**
         * 设置Y轴向量
         *
         * @param vector X轴向量
         */
        Matrix4x4.prototype.setAxisY = function (vector) {
            if (vector === void 0) { vector = new feng3d.Vector3(); }
            this.elements[4] = vector.x;
            this.elements[5] = vector.y;
            this.elements[6] = vector.z;
            return this;
        };
        /**
         * 获取Z轴向量
         *
         * @param out 保存Z轴向量
         */
        Matrix4x4.prototype.getAxisZ = function (out) {
            if (out === void 0) { out = new feng3d.Vector3(); }
            return out.set(this.elements[8], this.elements[9], this.elements[10]);
        };
        /**
         * 从欧拉角旋转角度初始化矩阵。
         *
         * @param   rx      用于沿 x 轴旋转对象的角度。
         * @param   ry      用于沿 y 轴旋转对象的角度。
         * @param   rz      用于沿 z 轴旋转对象的角度。
         * @param   order   绕轴旋转的顺序。
         */
        Matrix4x4.prototype.fromRotation = function (rx, ry, rz, order) {
            if (order === void 0) { order = feng3d.defaultRotationOrder; }
            this.fromTRS(new feng3d.Vector3(), new feng3d.Vector3(rx, ry, rz), new feng3d.Vector3(1, 1, 1), order);
            return this;
        };
        /**
         * 从四元素初始化矩阵。
         *
         * @param q 四元素
         */
        Matrix4x4.prototype.fromQuaternion = function (q) {
            q.toMatrix(this);
            return this;
        };
        /**
         * 从轴与旋转角度创建矩阵
         *
         * @param   axis            旋转轴
         * @param   degrees         角度
         */
        Matrix4x4.prototype.fromAxisRotate = function (axis, degrees) {
            var _this = this;
            var n = axis.clone();
            n.normalize();
            var q = degrees * Math.PI / 180;
            var sinq = Math.sin(q);
            var cosq = Math.cos(q);
            var lcosq = 1 - cosq;
            var arr = [
                n.x * n.x * lcosq + cosq, n.x * n.y * lcosq + n.z * sinq, n.x * n.z * lcosq - n.y * sinq, 0,
                n.x * n.y * lcosq - n.z * sinq, n.y * n.y * lcosq + cosq, n.y * n.z * lcosq + n.x * sinq, 0,
                n.x * n.z * lcosq + n.y * sinq, n.y * n.z * lcosq - n.x * sinq, n.z * n.z * lcosq + cosq, 0,
                0, 0, 0, 1 //
            ];
            arr.forEach(function (v, i) {
                _this.elements[i] = v;
            });
            return this;
        };
        /**
         * 通过将另一个 Matrix4x4 对象与当前 Matrix4x4 对象相乘来后置一个矩阵。
         */
        Matrix4x4.prototype.append = function (lhs) {
            var //
            m111 = this.elements[0], m121 = this.elements[4], m131 = this.elements[8], m141 = this.elements[12], //
            m112 = this.elements[1], m122 = this.elements[5], m132 = this.elements[9], m142 = this.elements[13], //
            m113 = this.elements[2], m123 = this.elements[6], m133 = this.elements[10], m143 = this.elements[14], //
            m114 = this.elements[3], m124 = this.elements[7], m134 = this.elements[11], m144 = this.elements[15], //
            m211 = lhs.elements[0], m221 = lhs.elements[4], m231 = lhs.elements[8], m241 = lhs.elements[12], //
            m212 = lhs.elements[1], m222 = lhs.elements[5], m232 = lhs.elements[9], m242 = lhs.elements[13], //
            m213 = lhs.elements[2], m223 = lhs.elements[6], m233 = lhs.elements[10], m243 = lhs.elements[14], //
            m214 = lhs.elements[3], m224 = lhs.elements[7], m234 = lhs.elements[11], m244 = lhs.elements[15];
            this.elements[0] = m111 * m211 + m112 * m221 + m113 * m231 + m114 * m241;
            this.elements[1] = m111 * m212 + m112 * m222 + m113 * m232 + m114 * m242;
            this.elements[2] = m111 * m213 + m112 * m223 + m113 * m233 + m114 * m243;
            this.elements[3] = m111 * m214 + m112 * m224 + m113 * m234 + m114 * m244;
            this.elements[4] = m121 * m211 + m122 * m221 + m123 * m231 + m124 * m241;
            this.elements[5] = m121 * m212 + m122 * m222 + m123 * m232 + m124 * m242;
            this.elements[6] = m121 * m213 + m122 * m223 + m123 * m233 + m124 * m243;
            this.elements[7] = m121 * m214 + m122 * m224 + m123 * m234 + m124 * m244;
            this.elements[8] = m131 * m211 + m132 * m221 + m133 * m231 + m134 * m241;
            this.elements[9] = m131 * m212 + m132 * m222 + m133 * m232 + m134 * m242;
            this.elements[10] = m131 * m213 + m132 * m223 + m133 * m233 + m134 * m243;
            this.elements[11] = m131 * m214 + m132 * m224 + m133 * m234 + m134 * m244;
            this.elements[12] = m141 * m211 + m142 * m221 + m143 * m231 + m144 * m241;
            this.elements[13] = m141 * m212 + m142 * m222 + m143 * m232 + m144 * m242;
            this.elements[14] = m141 * m213 + m142 * m223 + m143 * m233 + m144 * m243;
            this.elements[15] = m141 * m214 + m142 * m224 + m143 * m234 + m144 * m244;
            console.assert(this.elements[0] !== NaN && this.elements[4] !== NaN && this.elements[8] !== NaN && this.elements[12] !== NaN);
            return this;
        };
        /**
         * 在 Matrix4x4 对象上后置一个增量旋转。
         * @param   axis            旋转轴
         * @param   degrees         角度
         * @param   pivotPoint      旋转中心点
         */
        Matrix4x4.prototype.appendRotation = function (axis, degrees, pivotPoint) {
            var rotationMat = Matrix4x4.fromAxisRotate(axis, degrees);
            if (pivotPoint != null) {
                this.appendTranslation(-pivotPoint.x, -pivotPoint.y, -pivotPoint.z);
            }
            this.append(rotationMat);
            if (pivotPoint != null) {
                this.appendTranslation(pivotPoint.x, pivotPoint.y, pivotPoint.z);
            }
            return this;
        };
        /**
         * 在 Matrix4x4 对象上后置一个增量缩放，沿 x、y 和 z 轴改变位置。
         * @param   sx      用于沿 x 轴缩放对象的乘数。
         * @param   sy      用于沿 y 轴缩放对象的乘数。
         * @param   sz      用于沿 z 轴缩放对象的乘数。
         */
        Matrix4x4.prototype.appendScale = function (sx, sy, sz) {
            var scaleMat = Matrix4x4.fromScale(sx, sy, sz);
            this.append(scaleMat);
            return this;
        };
        /**
         * 在 Matrix4x4 对象上后置一个增量平移，沿 x、y 和 z 轴重新定位。
         * @param   x   沿 x 轴的增量平移。
         * @param   y   沿 y 轴的增量平移。
         * @param   z   沿 z 轴的增量平移。
         */
        Matrix4x4.prototype.appendTranslation = function (x, y, z) {
            var m = this.elements;
            m[0] += x * m[3];
            m[4] += x * m[7];
            m[8] += x * m[11];
            m[12] += x * m[15];
            m[1] += y * m[3];
            m[5] += y * m[7];
            m[9] += y * m[11];
            m[13] += y * m[15];
            m[2] += z * m[3];
            m[6] += z * m[7];
            m[10] += z * m[11];
            m[14] += z * m[15];
            return this;
        };
        /**
         * 返回一个新 Matrix4x4 对象，它是与当前 Matrix4x4 对象完全相同的副本。
         */
        Matrix4x4.prototype.clone = function () {
            var matrix = new Matrix4x4();
            matrix.copy(this);
            return matrix;
        };
        /**
         * 将源 Matrix4x4 对象中的所有矩阵数据复制到调用方 Matrix4x4 对象中。
         * @param   source      要从中复制数据的 Matrix4x4 对象。
         */
        Matrix4x4.prototype.copy = function (source) {
            for (var i = 0; i < 16; i++) {
                this.elements[i] = source.elements[i];
            }
            return this;
        };
        /**
         * 从数组中初始化
         *
         * @param   array       包含矩阵数据的数组
         * @param   index       数组中的起始位置
         * @param   transpose   是否转置
         */
        Matrix4x4.prototype.fromArray = function (array, index, transpose) {
            if (index === void 0) { index = 0; }
            if (transpose === void 0) { transpose = false; }
            if (array.length - index < 16) {
                throw new Error("vector参数数据长度不够！");
            }
            for (var i = 0; i < 16; i++) {
                this.elements[i] = array[index + i];
            }
            if (transpose) {
                this.transpose();
            }
            return this;
        };
        /**
         * 将矩阵数据转换为数组
         *
         * @param   array       保存矩阵数据的数组
         * @param   index       数组中的起始位置
         * @param   transpose   是否转置
         */
        Matrix4x4.prototype.toArray = function (array, index, transpose) {
            if (array === void 0) { array = []; }
            if (index === void 0) { index = 0; }
            if (transpose === void 0) { transpose = false; }
            if (transpose) {
                this.transpose();
            }
            for (var i = 0; i < 16; i++) {
                array[i + index] = this.elements[i];
            }
            if (transpose) {
                this.transpose();
            }
            return array;
        };
        /**
         * 通过位移旋转缩放重组矩阵
         *
         * @param position 位移
         * @param rotation 旋转角度，按照指定旋转顺序旋转角度。
         * @param scale 缩放。
         * @param order 旋转顺序。
         */
        Matrix4x4.prototype.fromTRS = function (position, rotation, scale, order) {
            if (order === void 0) { order = feng3d.defaultRotationOrder; }
            var m = this.elements;
            //
            m[11] = 0;
            m[15] = 1;
            //
            rotation = rotation.scaleNumberTo(Math.DEG2RAD);
            var px = position.x;
            var py = position.y;
            var pz = position.z;
            var rx = rotation.x;
            var ry = rotation.y;
            var rz = rotation.z;
            var sx = scale.x;
            var sy = scale.y;
            var sz = scale.z;
            //
            m[12] = px;
            m[13] = py;
            m[14] = pz;
            //
            var cosX = Math.cos(rx), sinX = Math.sin(rx);
            var cosY = Math.cos(ry), sinY = Math.sin(ry);
            var cosZ = Math.cos(rz), sinZ = Math.sin(rz);
            if (order === feng3d.RotationOrder.XYZ) {
                var ae = cosX * cosZ, af = cosX * sinZ, be = sinX * cosZ, bf = sinX * sinZ;
                m[0] = cosY * cosZ;
                m[4] = -cosY * sinZ;
                m[8] = sinY;
                m[1] = af + be * sinY;
                m[5] = ae - bf * sinY;
                m[9] = -sinX * cosY;
                m[2] = bf - ae * sinY;
                m[6] = be + af * sinY;
                m[10] = cosX * cosY;
            }
            else if (order === feng3d.RotationOrder.YXZ) {
                var ce = cosY * cosZ, cf = cosY * sinZ, de = sinY * cosZ, df = sinY * sinZ;
                m[0] = ce + df * sinX;
                m[4] = de * sinX - cf;
                m[8] = cosX * sinY;
                m[1] = cosX * sinZ;
                m[5] = cosX * cosZ;
                m[9] = -sinX;
                m[2] = cf * sinX - de;
                m[6] = df + ce * sinX;
                m[10] = cosX * cosY;
            }
            else if (order === feng3d.RotationOrder.ZXY) {
                var ce = cosY * cosZ, cf = cosY * sinZ, de = sinY * cosZ, df = sinY * sinZ;
                m[0] = ce - df * sinX;
                m[4] = -cosX * sinZ;
                m[8] = de + cf * sinX;
                m[1] = cf + de * sinX;
                m[5] = cosX * cosZ;
                m[9] = df - ce * sinX;
                m[2] = -cosX * sinY;
                m[6] = sinX;
                m[10] = cosX * cosY;
            }
            else if (order === feng3d.RotationOrder.ZYX) {
                var ae = cosX * cosZ, af = cosX * sinZ, be = sinX * cosZ, bf = sinX * sinZ;
                m[0] = cosY * cosZ;
                m[4] = be * sinY - af;
                m[8] = ae * sinY + bf;
                m[1] = cosY * sinZ;
                m[5] = bf * sinY + ae;
                m[9] = af * sinY - be;
                m[2] = -sinY;
                m[6] = sinX * cosY;
                m[10] = cosX * cosY;
            }
            else if (order === feng3d.RotationOrder.YZX) {
                var ac = cosX * cosY, ad = cosX * sinY, bc = sinX * cosY, bd = sinX * sinY;
                m[0] = cosY * cosZ;
                m[4] = bd - ac * sinZ;
                m[8] = bc * sinZ + ad;
                m[1] = sinZ;
                m[5] = cosX * cosZ;
                m[9] = -sinX * cosZ;
                m[2] = -sinY * cosZ;
                m[6] = ad * sinZ + bc;
                m[10] = ac - bd * sinZ;
            }
            else if (order === feng3d.RotationOrder.XZY) {
                var ac = cosX * cosY, ad = cosX * sinY, bc = sinX * cosY, bd = sinX * sinY;
                m[0] = cosY * cosZ;
                m[4] = -sinZ;
                m[8] = sinY * cosZ;
                m[1] = ac * sinZ + bd;
                m[5] = cosX * cosZ;
                m[9] = ad * sinZ - bc;
                m[2] = bc * sinZ - ad;
                m[6] = sinX * cosZ;
                m[10] = bd * sinZ + ac;
            }
            else {
                console.error("\u521D\u59CB\u5316\u77E9\u9635\u65F6\u9519\u8BEF\u65CB\u8F6C\u987A\u5E8F " + order);
            }
            //
            m[0] *= sx;
            m[1] *= sx;
            m[2] *= sx;
            m[4] *= sy;
            m[5] *= sy;
            m[6] *= sy;
            m[8] *= sz;
            m[9] *= sz;
            m[10] *= sz;
            return this;
        };
        /**
         * 把矩阵分解为位移旋转缩放。
         *
         * @param position 位移
         * @param rotation 旋转角度，按照指定旋转顺序旋转。
         * @param scale 缩放。
         * @param order 旋转顺序。
         */
        Matrix4x4.prototype.toTRS = function (position, rotation, scale, order) {
            if (position === void 0) { position = new feng3d.Vector3(); }
            if (rotation === void 0) { rotation = new feng3d.Vector3(); }
            if (scale === void 0) { scale = new feng3d.Vector3(); }
            if (order === void 0) { order = feng3d.defaultRotationOrder; }
            var clamp = Math.clamp;
            //
            var m = this.elements;
            var m11 = m[0], m12 = m[4], m13 = m[8];
            var m21 = m[1], m22 = m[5], m23 = m[9];
            var m31 = m[2], m32 = m[6], m33 = m[10];
            //
            position.x = m[12];
            position.y = m[13];
            position.z = m[14];
            //
            scale.x = Math.sqrt(m11 * m11 + m21 * m21 + m31 * m31);
            m11 /= scale.x;
            m21 /= scale.x;
            m31 /= scale.x;
            scale.y = Math.sqrt(m12 * m12 + m22 * m22 + m32 * m32);
            m12 /= scale.y;
            m22 /= scale.y;
            m32 /= scale.y;
            scale.z = Math.sqrt(m13 * m13 + m23 * m23 + m33 * m33);
            m13 /= scale.z;
            m23 /= scale.z;
            m33 /= scale.z;
            //
            if (order === feng3d.RotationOrder.XYZ) {
                rotation.y = Math.asin(clamp(m13, -1, 1));
                if (Math.abs(m13) < 0.9999999) {
                    rotation.x = Math.atan2(-m23, m33);
                    rotation.z = Math.atan2(-m12, m11);
                }
                else {
                    rotation.x = Math.atan2(m32, m22);
                    rotation.z = 0;
                }
            }
            else if (order === feng3d.RotationOrder.YXZ) {
                rotation.x = Math.asin(-clamp(m23, -1, 1));
                if (Math.abs(m23) < 0.9999999) {
                    rotation.y = Math.atan2(m13, m33);
                    rotation.z = Math.atan2(m21, m22);
                }
                else {
                    rotation.y = Math.atan2(-m31, m11);
                    rotation.z = 0;
                }
            }
            else if (order === feng3d.RotationOrder.ZXY) {
                rotation.x = Math.asin(clamp(m32, -1, 1));
                if (Math.abs(m32) < 0.9999999) {
                    rotation.y = Math.atan2(-m31, m33);
                    rotation.z = Math.atan2(-m12, m22);
                }
                else {
                    rotation.y = 0;
                    rotation.z = Math.atan2(m21, m11);
                }
            }
            else if (order === feng3d.RotationOrder.ZYX) {
                rotation.y = Math.asin(-clamp(m31, -1, 1));
                if (Math.abs(m31) < 0.9999999) {
                    rotation.x = Math.atan2(m32, m33);
                    rotation.z = Math.atan2(m21, m11);
                }
                else {
                    rotation.x = 0;
                    rotation.z = Math.atan2(-m12, m22);
                }
            }
            else if (order === feng3d.RotationOrder.YZX) {
                rotation.z = Math.asin(clamp(m21, -1, 1));
                if (Math.abs(m21) < 0.9999999) {
                    rotation.x = Math.atan2(-m23, m22);
                    rotation.y = Math.atan2(-m31, m11);
                }
                else {
                    rotation.x = 0;
                    rotation.y = Math.atan2(m13, m33);
                }
            }
            else if (order === feng3d.RotationOrder.XZY) {
                rotation.z = Math.asin(-clamp(m12, -1, 1));
                if (Math.abs(m12) < 0.9999999) {
                    rotation.x = Math.atan2(m32, m22);
                    rotation.y = Math.atan2(m13, m11);
                }
                else {
                    rotation.x = Math.atan2(-m23, m33);
                    rotation.y = 0;
                }
            }
            else {
                console.error("\u521D\u59CB\u5316\u77E9\u9635\u65F6\u9519\u8BEF\u65CB\u8F6C\u987A\u5E8F " + order);
            }
            rotation.scaleNumber(Math.RAD2DEG);
            return [position, rotation, scale];
        };
        /**
         * 将当前矩阵转换为恒等或单位矩阵。
         */
        Matrix4x4.prototype.identity = function () {
            var m = this.elements;
            m[0] = 1;
            m[1] = 0;
            m[2] = 0;
            m[3] = 0;
            m[4] = 0;
            m[5] = 1;
            m[6] = 0;
            m[7] = 0;
            m[8] = 0;
            m[9] = 0;
            m[10] = 1;
            m[11] = 0;
            m[12] = 0;
            m[13] = 0;
            m[14] = 0;
            m[15] = 1;
            return this;
        };
        /**
         * 反转当前矩阵。逆矩阵
         * @return      如果成功反转矩阵，则返回 该矩阵。
         */
        Matrix4x4.prototype.invert = function () {
            var d = this.determinant;
            if (d == 0) {
                console.error("无法获取逆矩阵");
                return this;
            }
            d = 1 / d;
            var m = this.elements;
            var m11 = m[0];
            var m21 = m[4];
            var m31 = m[8];
            var m41 = m[12];
            var m12 = m[1];
            var m22 = m[5];
            var m32 = m[9];
            var m42 = m[13];
            var m13 = m[2];
            var m23 = m[6];
            var m33 = m[10];
            var m43 = m[14];
            var m14 = m[3];
            var m24 = m[7];
            var m34 = m[11];
            var m44 = m[15];
            m[0] = d * (m22 * (m33 * m44 - m43 * m34) - m32 * (m23 * m44 - m43 * m24) + m42 * (m23 * m34 - m33 * m24));
            m[1] = -d * (m12 * (m33 * m44 - m43 * m34) - m32 * (m13 * m44 - m43 * m14) + m42 * (m13 * m34 - m33 * m14));
            m[2] = d * (m12 * (m23 * m44 - m43 * m24) - m22 * (m13 * m44 - m43 * m14) + m42 * (m13 * m24 - m23 * m14));
            m[3] = -d * (m12 * (m23 * m34 - m33 * m24) - m22 * (m13 * m34 - m33 * m14) + m32 * (m13 * m24 - m23 * m14));
            m[4] = -d * (m21 * (m33 * m44 - m43 * m34) - m31 * (m23 * m44 - m43 * m24) + m41 * (m23 * m34 - m33 * m24));
            m[5] = d * (m11 * (m33 * m44 - m43 * m34) - m31 * (m13 * m44 - m43 * m14) + m41 * (m13 * m34 - m33 * m14));
            m[6] = -d * (m11 * (m23 * m44 - m43 * m24) - m21 * (m13 * m44 - m43 * m14) + m41 * (m13 * m24 - m23 * m14));
            m[7] = d * (m11 * (m23 * m34 - m33 * m24) - m21 * (m13 * m34 - m33 * m14) + m31 * (m13 * m24 - m23 * m14));
            m[8] = d * (m21 * (m32 * m44 - m42 * m34) - m31 * (m22 * m44 - m42 * m24) + m41 * (m22 * m34 - m32 * m24));
            m[9] = -d * (m11 * (m32 * m44 - m42 * m34) - m31 * (m12 * m44 - m42 * m14) + m41 * (m12 * m34 - m32 * m14));
            m[10] = d * (m11 * (m22 * m44 - m42 * m24) - m21 * (m12 * m44 - m42 * m14) + m41 * (m12 * m24 - m22 * m14));
            m[11] = -d * (m11 * (m22 * m34 - m32 * m24) - m21 * (m12 * m34 - m32 * m14) + m31 * (m12 * m24 - m22 * m14));
            m[12] = -d * (m21 * (m32 * m43 - m42 * m33) - m31 * (m22 * m43 - m42 * m23) + m41 * (m22 * m33 - m32 * m23));
            m[13] = d * (m11 * (m32 * m43 - m42 * m33) - m31 * (m12 * m43 - m42 * m13) + m41 * (m12 * m33 - m32 * m13));
            m[14] = -d * (m11 * (m22 * m43 - m42 * m23) - m21 * (m12 * m43 - m42 * m13) + m41 * (m12 * m23 - m22 * m13));
            m[15] = d * (m11 * (m22 * m33 - m32 * m23) - m21 * (m12 * m33 - m32 * m13) + m31 * (m12 * m23 - m22 * m13));
            return this;
        };
        /**
         * 通过将当前 Matrix4x4 对象与另一个 Matrix4x4 对象相乘来前置一个矩阵。得到的结果将合并两个矩阵转换。
         * @param   rhs     个右侧矩阵，它与当前 Matrix4x4 对象相乘。
         */
        Matrix4x4.prototype.prepend = function (rhs) {
            var mat = this.clone();
            this.copy(rhs);
            this.append(mat);
            return this;
        };
        /**
         * 在 Matrix4x4 对象上前置一个增量旋转。在将 Matrix4x4 对象应用于显示对象时，矩阵会在 Matrix4x4 对象中先执行旋转，然后再执行其他转换。
         * @param   axis        旋转的轴或方向。常见的轴为 X_AXIS (Vector3(1,0,0))、Y_AXIS (Vector3(0,1,0)) 和 Z_AXIS (Vector3(0,0,1))。此矢量的长度应为 1。
         * @param   degrees     旋转的角度。
         * @param   pivotPoint  一个用于确定旋转中心的点。对象的默认轴点为该对象的注册点。
         */
        Matrix4x4.prototype.prependRotation = function (axis, degrees, pivotPoint) {
            if (pivotPoint === void 0) { pivotPoint = new feng3d.Vector3(); }
            var rotationMat = Matrix4x4.fromAxisRotate(axis, degrees);
            this.prepend(rotationMat);
            return this;
        };
        /**
         * 在 Matrix4x4 对象上前置一个增量缩放，沿 x、y 和 z 轴改变位置。在将 Matrix4x4 对象应用于显示对象时，矩阵会在 Matrix4x4 对象中先执行缩放更改，然后再执行其他转换。
         * @param   xScale      用于沿 x 轴缩放对象的乘数。
         * @param   yScale      用于沿 y 轴缩放对象的乘数。
         * @param   zScale      用于沿 z 轴缩放对象的乘数。
         */
        Matrix4x4.prototype.prependScale = function (xScale, yScale, zScale) {
            var scaleMat = Matrix4x4.fromScale(xScale, yScale, zScale);
            this.prepend(scaleMat);
            return this;
        };
        Matrix4x4.prototype.prependScale1 = function (xScale, yScale, zScale) {
            var m = this.elements;
            m[0] *= xScale;
            m[1] *= xScale;
            m[2] *= xScale;
            m[4] *= yScale;
            m[5] *= yScale;
            m[6] *= yScale;
            m[8] *= zScale;
            m[9] *= zScale;
            m[10] *= zScale;
            return this;
        };
        /**
         * 在 Matrix4x4 对象上前置一个增量平移，沿 x、y 和 z 轴重新定位。在将 Matrix4x4 对象应用于显示对象时，矩阵会在 Matrix4x4 对象中先执行平移更改，然后再执行其他转换。
         * @param   x   沿 x 轴的增量平移。
         * @param   y   沿 y 轴的增量平移。
         * @param   z   沿 z 轴的增量平移。
         */
        Matrix4x4.prototype.prependTranslation = function (x, y, z) {
            var translationMat = Matrix4x4.fromPosition(x, y, z);
            this.prepend(translationMat);
            return this;
        };
        /**
         * X轴方向移动
         * @param distance  移动距离
         */
        Matrix4x4.prototype.moveRight = function (distance) {
            var direction = this.getAxisX();
            direction.normalize(distance);
            this.setPosition(this.getPosition().addTo(direction));
            return this;
        };
        /**
         * Y轴方向移动
         * @param distance  移动距离
         */
        Matrix4x4.prototype.moveUp = function (distance) {
            var direction = this.getAxisY();
            direction.scaleNumber(distance);
            this.setPosition(this.getPosition().addTo(direction));
            return this;
        };
        /**
         * Z轴方向移动
         * @param distance  移动距离
         */
        Matrix4x4.prototype.moveForward = function (distance) {
            var direction = this.getAxisZ();
            direction.scaleNumber(distance);
            this.setPosition(this.getPosition().addTo(direction));
            return this;
        };
        /**
         * 使用转换矩阵将 Vector3 对象从一个空间坐标转换到另一个空间坐标。
         * @param   vin   一个容纳要转换的坐标的 Vector3 对象。
         * @return  一个包含转换后的坐标的 Vector3 对象。
         */
        Matrix4x4.prototype.transformPoint3 = function (vin, vout) {
            if (vout === void 0) { vout = new feng3d.Vector3(); }
            var m = this.elements;
            var m0 = m[0], m1 = m[1], m2 = m[2];
            var m4 = m[4], m5 = m[5], m6 = m[6];
            var m8 = m[8], m9 = m[9], m10 = m[10];
            var m12 = m[12], m13 = m[13], m14 = m[14];
            var x = vin.x;
            var y = vin.y;
            var z = vin.z;
            vout.x = x * m0 + y * m4 + z * m8 + m12;
            vout.y = x * m1 + y * m5 + z * m9 + m13;
            vout.z = x * m2 + y * m6 + z * m10 + m14;
            return vout;
        };
        /**
         * 变换Vector3向量
         *
         * 与变换点不同，并不会受到矩阵平移分量的影响。
         *
         * @param vin   被变换的向量
         * @param vout  变换后的向量
         */
        Matrix4x4.prototype.transformVector3 = function (vin, vout) {
            if (vout === void 0) { vout = new feng3d.Vector3(); }
            var m = this.elements;
            var m0 = m[0], m1 = m[1], m2 = m[2];
            var m4 = m[4], m5 = m[5], m6 = m[6];
            var m8 = m[8], m9 = m[9], m10 = m[10];
            var x = vin.x;
            var y = vin.y;
            var z = vin.z;
            vout.x = x * m0 + y * m4 + z * m8;
            vout.y = x * m1 + y * m5 + z * m9;
            vout.z = x * m2 + y * m6 + z * m10;
            return vout;
        };
        /**
         * 变换Vector4向量
         *
         * @param vin   被变换的向量
         * @param vout  变换后的向量
         */
        Matrix4x4.prototype.transformVector4 = function (vin, vout) {
            if (vout === void 0) { vout = new feng3d.Vector4(); }
            var m = this.elements;
            var m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3];
            var m4 = m[4], m5 = m[5], m6 = m[6], m7 = m[7];
            var m8 = m[8], m9 = m[9], m10 = m[10], m11 = m[11];
            var m12 = m[12], m13 = m[13], m14 = m[14], m15 = m[15];
            var x = vin.x;
            var y = vin.y;
            var z = vin.z;
            var w = vin.w;
            vout.x = x * m0 + y * m4 + z * m8 + w * m12;
            vout.y = x * m1 + y * m5 + z * m9 + w * m13;
            vout.z = x * m2 + y * m6 + z * m10 + w * m14;
            vout.w = x * m3 + y * m7 + z * m11 + w * m15;
            return vout;
        };
        /**
         * 变换坐标数组数据
         *
         * @param   vin     被变换坐标数组数据
         * @param   vout    变换后的坐标数组数据
         */
        Matrix4x4.prototype.transformPoints = function (vin, vout) {
            if (vout === void 0) { vout = []; }
            var m = this.elements;
            var m0 = m[0], m1 = m[1], m2 = m[2];
            var m4 = m[4], m5 = m[5], m6 = m[6];
            var m8 = m[8], m9 = m[9], m10 = m[10];
            var m12 = m[12], m13 = m[13], m14 = m[14];
            for (var i = 0; i < vin.length; i += 3) {
                var x = vin[i];
                var y = vin[i + 1];
                var z = vin[i + 2];
                vout[i] = x * m0 + y * m4 + z * m8 + m12;
                vout[i + 1] = x * m1 + y * m5 + z * m9 + m13;
                vout[i + 2] = x * m2 + y * m6 + z * m10 + m14;
            }
            return vout;
        };
        /**
         * 变换旋转角度
         *
         * @param vin   被变换的旋转角度
         * @param vout  变换后的旋转角度
         */
        Matrix4x4.prototype.transformRotation = function (vin, vout) {
            if (vout === void 0) { vout = new feng3d.Vector3(); }
            //转换旋转
            var rotationMatrix = Matrix4x4.fromRotation(vin.x, vin.y, vin.z);
            rotationMatrix.append(this);
            var newrotation = rotationMatrix.toTRS()[1];
            var rx = newrotation.x, ry = newrotation.y, rz = newrotation.z;
            var v = Math.round((rx - vin.x) / 180);
            if (v % 2 != 0) {
                rx += 180;
                ry = 180 - ry;
                rz += 180;
            }
            //
            var toRound = function (a, b, c) {
                if (c === void 0) { c = 360; }
                return Math.round((b - a) / c) * c + a;
            };
            rx = toRound(rx, vin.x);
            ry = toRound(ry, vin.y);
            rz = toRound(rz, vin.z);
            //
            vout.x = rx;
            vout.y = ry;
            vout.z = rz;
            return vout;
        };
        /**
         * 使用转换矩阵将 Ray3 对象从一个空间坐标转换到另一个空间坐标。
         *
         * @param inRay 被转换的Ray3。
         * @param outRay 转换后的Ray3。
         * @returns 转换后的Ray3。
         */
        Matrix4x4.prototype.transformRay = function (inRay, outRay) {
            if (outRay === void 0) { outRay = new feng3d.Ray3(); }
            this.transformPoint3(inRay.origin, outRay.origin);
            this.transformVector3(inRay.direction, outRay.direction);
            return outRay;
        };
        /**
         * 将当前 Matrix4x4 对象转换为一个矩阵，并将互换其中的行和列。
         */
        Matrix4x4.prototype.transpose = function () {
            var m = this.elements;
            var tmp;
            tmp = m[1];
            m[1] = m[4];
            m[4] = tmp;
            tmp = m[2];
            m[2] = m[8];
            m[8] = tmp;
            tmp = m[6];
            m[6] = m[9];
            m[9] = tmp;
            tmp = m[3];
            m[3] = m[12];
            m[12] = tmp;
            tmp = m[7];
            m[7] = m[13];
            m[13] = tmp;
            tmp = m[11];
            m[11] = m[14];
            m[14] = tmp;
            return this;
        };
        /**
         * 比较矩阵是否相等
         */
        Matrix4x4.prototype.equals = function (matrix, precision) {
            if (precision === void 0) { precision = Math.PRECISION; }
            var r2 = matrix.elements;
            for (var i = 0; i < 16; ++i) {
                if (!Math.equals(this.elements[i] - r2[i], 0, precision))
                    return false;
            }
            return true;
        };
        /**
         * 看向目标位置
         * @param target    目标位置
         * @param upAxis    向上朝向
         */
        Matrix4x4.prototype.lookAt = function (target, upAxis) {
            //获取位移，缩放，在变换过程位移与缩放不变
            var vec = this.toTRS();
            var position = vec[0];
            var scale = vec[2];
            //
            var xAxis = new feng3d.Vector3();
            var yAxis = new feng3d.Vector3();
            var zAxis = new feng3d.Vector3();
            upAxis = upAxis || feng3d.Vector3.Y_AXIS;
            zAxis.x = target.x - position.x;
            zAxis.y = target.y - position.y;
            zAxis.z = target.z - position.z;
            zAxis.normalize();
            xAxis.x = upAxis.y * zAxis.z - upAxis.z * zAxis.y;
            xAxis.y = upAxis.z * zAxis.x - upAxis.x * zAxis.z;
            xAxis.z = upAxis.x * zAxis.y - upAxis.y * zAxis.x;
            xAxis.normalize();
            if (xAxis.lengthSquared < .005) {
                xAxis.x = upAxis.y;
                xAxis.y = upAxis.x;
                xAxis.z = 0;
                xAxis.normalize();
            }
            yAxis.x = zAxis.y * xAxis.z - zAxis.z * xAxis.y;
            yAxis.y = zAxis.z * xAxis.x - zAxis.x * xAxis.z;
            yAxis.z = zAxis.x * xAxis.y - zAxis.y * xAxis.x;
            this.elements[0] = scale.x * xAxis.x;
            this.elements[1] = scale.x * xAxis.y;
            this.elements[2] = scale.x * xAxis.z;
            this.elements[3] = 0;
            this.elements[4] = scale.y * yAxis.x;
            this.elements[5] = scale.y * yAxis.y;
            this.elements[6] = scale.y * yAxis.z;
            this.elements[7] = 0;
            this.elements[8] = scale.z * zAxis.x;
            this.elements[9] = scale.z * zAxis.y;
            this.elements[10] = scale.z * zAxis.z;
            this.elements[11] = 0;
            this.elements[12] = position.x;
            this.elements[13] = position.y;
            this.elements[14] = position.z;
            this.elements[15] = 1;
            return this;
        };
        /**
         * 获取XYZ轴中最大缩放值
         */
        Matrix4x4.prototype.getMaxScaleOnAxis = function () {
            var m = this.elements;
            var scaleXSq = m[0] * m[0] + m[1] * m[1] + m[2] * m[2];
            var scaleYSq = m[4] * m[4] + m[5] * m[5] + m[6] * m[6];
            var scaleZSq = m[8] * m[8] + m[9] * m[9] + m[10] * m[10];
            return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
        };
        /**
         * 初始化正射投影矩阵
         * @param left 可视空间左边界
         * @param right 可视空间右边界
         * @param top 可视空间上边界
         * @param bottom 可视空间下边界
         * @param near 可视空间近边界
         * @param far 可视空间远边界
         *
         * 可视空间的八个顶点分别被投影到立方体 [(-1, -1, -1), (1, 1, 1)] 八个顶点上
         *
         * 将长方体 [(left, bottom, near), (right, top, far)] 投影至立方体 [(-1, -1, -1), (1, 1, 1)] 中
         */
        Matrix4x4.prototype.setOrtho = function (left, right, top, bottom, near, far) {
            var m = this.elements;
            m[0] = 2 / (right - left);
            m[4] = 0; /**/
            m[8] = 0; /**/
            m[12] = -(right + left) / (right - left); // 
            m[1] = 0; /**/
            m[5] = 2 / (top - bottom);
            m[9] = 0; /**/
            m[13] = -(top + bottom) / (top - bottom); // 
            m[2] = 0; /**/
            m[6] = 0; /**/
            m[10] = 2 / (far - near);
            m[14] = -(far + near) / (far - near); //
            m[3] = 0; /**/
            m[7] = 0; /**/
            m[11] = 0; /**/
            m[15] = 1; //
            return this;
        };
        /**
         * 初始化透视投影矩阵
         * @param fov 垂直视角，视锥体顶面和底面间的夹角，必须大于0 （角度）
         * @param aspect 近裁剪面的宽高比
         * @param near 视锥体近边界
         * @param far 视锥体远边界
         *
         * 视锥体的八个顶点分别被投影到立方体 [(-1, -1, -1), (1, 1, 1)] 八个顶点上
         */
        Matrix4x4.prototype.setPerspectiveFromFOV = function (fov, aspect, near, far) {
            var m = this.elements;
            var tanfov2 = Math.tan(fov * Math.PI / 360);
            m[0] = 1 / (aspect * tanfov2);
            m[4] = 0; /**/
            m[8] = 0; /**/
            m[12] = 0; // 
            m[1] = 0; /**/
            m[5] = 1 / tanfov2;
            m[9] = 0; /**/
            m[13] = 0; // 
            m[2] = 0; /**/
            m[6] = 0; /**/
            m[10] = (far + near) / (far - near);
            m[14] = -2 * (far * near) / (far - near); //
            m[3] = 0; /**/
            m[7] = 0; /**/
            m[11] = 1; /**/
            m[15] = 0; //
            return this;
        };
        /**
         * 初始化透视投影矩阵
         * @param left 可视空间左边界
         * @param right 可视空间右边界
         * @param top 可视空间上边界
         * @param bottom 可视空间下边界
         * @param near 可视空间近边界
         * @param far 可视空间远边界
         *
         * 可视空间的八个顶点分别被投影到立方体 [(-1, -1, -1), (1, 1, 1)] 八个顶点上
         *
         * 将长方体 [(left, bottom, near), (right, top, far)] 投影至立方体 [(-1, -1, -1), (1, 1, 1)] 中
         */
        Matrix4x4.prototype.setPerspective = function (left, right, top, bottom, near, far) {
            var m = this.elements;
            m[0] = 2 * near / (right - left);
            m[4] = 0; /**/
            m[8] = 0; /**/
            m[12] = 0; // 
            m[1] = 0; /**/
            m[5] = 2 * near / (top - bottom);
            m[9] = 0; /**/
            m[13] = 0; // 
            m[2] = 0; /**/
            m[6] = 0; /**/
            m[10] = (far + near) / (far - near);
            m[14] = -2 * (far * near) / (far - near); //
            m[3] = 0; /**/
            m[7] = 0; /**/
            m[11] = 1; /**/
            m[15] = 0; //
            return this;
        };
        /**
         * 转换为3x3矩阵
         *
         * @param out 3x3矩阵
         */
        Matrix4x4.prototype.toMatrix3x3 = function (out) {
            if (out === void 0) { out = new feng3d.Matrix3x3(); }
            var outdata = out.elements;
            var indata = this.elements;
            outdata[0] = indata[0];
            outdata[1] = indata[1];
            outdata[2] = 0;
            outdata[3] = indata[4];
            outdata[4] = indata[5];
            outdata[5] = 0;
            outdata[6] = indata[12];
            outdata[7] = indata[13];
            outdata[8] = 1;
            return out;
        };
        /**
         * 以字符串返回矩阵的值
         */
        Matrix4x4.prototype.toString = function () {
            return "Matrix4x4 [" + this.elements.toString() + "]";
        };
        __decorate([
            feng3d.serialize
        ], Matrix4x4.prototype, "elements", void 0);
        return Matrix4x4;
    }());
    feng3d.Matrix4x4 = Matrix4x4;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 可用于表示旋转的四元数对象
     */
    var Quaternion = /** @class */ (function () {
        /**
         * 四元数描述三维空间中的旋转。四元数的数学定义为Q = x*i + y*j + z*k + w，其中(i,j,k)为虚基向量。(x,y,z)可以看作是一个与旋转轴相关的向量，而实际的乘法器w与旋转量相关。
         *
         * @param x 虚基向量i的乘子
         * @param y 虚基向量j的乘子
         * @param z 虚基向量k的乘子
         * @param w 实部的乘数
         */
        function Quaternion(x, y, z, w) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (z === void 0) { z = 0; }
            if (w === void 0) { w = 1; }
            /**
             * 虚基向量i的乘子
             */
            this.x = 0;
            /**
             * 虚基向量j的乘子
             */
            this.y = 0;
            /**
             * 虚基向量k的乘子
             */
            this.z = 0;
            /**
             * 实部的乘数
             */
            this.w = 1;
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }
        Quaternion.fromArray = function (array, offset) {
            if (offset === void 0) { offset = 0; }
            return new Quaternion().fromArray(array, offset);
        };
        /**
         * 随机四元数
         */
        Quaternion.random = function () {
            return new Quaternion().fromEulerAngles(Math.PI * 2 * Math.random(), Math.PI * 2 * Math.random(), Math.PI * 2 * Math.random());
        };
        Object.defineProperty(Quaternion.prototype, "magnitude", {
            /**
             * 返回四元数对象的大小
             */
            get: function () {
                return Math.sqrt(this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z);
            },
            enumerable: false,
            configurable: true
        });
        /**
         * 设置四元数的值。
         *
         * @param x 虚基向量i的乘子
         * @param y 虚基向量j的乘子
         * @param z 虚基向量k的乘子
         * @param w 实部的乘数
         */
        Quaternion.prototype.set = function (x, y, z, w) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (z === void 0) { z = 0; }
            if (w === void 0) { w = 1; }
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
            return this;
        };
        Quaternion.prototype.fromArray = function (array, offset) {
            if (offset === void 0) { offset = 0; }
            this.x = array[offset];
            this.y = array[offset + 1];
            this.z = array[offset + 2];
            this.w = array[offset + 3];
            return this;
        };
        /**
         * 转换为数组
         *
         * @param array
         * @param offset
         */
        Quaternion.prototype.toArray = function (array, offset) {
            if (offset === void 0) { offset = 0; }
            array = array || [];
            array[offset] = this.x;
            array[offset + 1] = this.y;
            array[offset + 2] = this.z;
            array[offset + 3] = this.w;
            return array;
        };
        /**
         * 四元数乘法
         *
         * @param q
         * @param this
         */
        Quaternion.prototype.mult = function (q) {
            var ax = this.x, ay = this.y, az = this.z, aw = this.w, bx = q.x, by = q.y, bz = q.z, bw = q.w;
            this.x = ax * bw + aw * bx + ay * bz - az * by;
            this.y = ay * bw + aw * by + az * bx - ax * bz;
            this.z = az * bw + aw * bz + ax * by - ay * bx;
            this.w = aw * bw - ax * bx - ay * by - az * bz;
            return this;
        };
        /**
         * 四元数乘法
         *
         * @param q
         * @param target
         */
        Quaternion.prototype.multTo = function (q, target) {
            if (target === void 0) { target = new Quaternion(); }
            return target.copy(this).mult(q);
        };
        /**
         * 获取逆四元数（共轭四元数）
         */
        Quaternion.prototype.inverse = function () {
            this.x = -this.x;
            this.y = -this.y;
            this.z = -this.z;
            return this;
        };
        /**
         * 获取逆四元数（共轭四元数）
         *
         * @param target
         */
        Quaternion.prototype.inverseTo = function (target) {
            if (target === void 0) { target = new Quaternion(); }
            return target.copy(this).inverse();
        };
        Quaternion.prototype.multiplyVector = function (vector, target) {
            if (target === void 0) { target = new Quaternion(); }
            var x2 = vector.x;
            var y2 = vector.y;
            var z2 = vector.z;
            target.w = -this.x * x2 - this.y * y2 - this.z * z2;
            target.x = this.w * x2 + this.y * z2 - this.z * y2;
            target.y = this.w * y2 - this.x * z2 + this.z * x2;
            target.z = this.w * z2 + this.x * y2 - this.y * x2;
            return target;
        };
        /**
         * 用表示给定绕向量旋转的值填充四元数对象。
         *
         * @param axis 要绕其旋转的轴
         * @param angle 以弧度为单位的旋转角度。
         */
        Quaternion.prototype.fromAxisAngle = function (axis, angle) {
            var sin_a = Math.sin(angle / 2);
            var cos_a = Math.cos(angle / 2);
            this.x = axis.x * sin_a;
            this.y = axis.y * sin_a;
            this.z = axis.z * sin_a;
            this.w = cos_a;
            this.normalize();
            return this;
        };
        /**
         * 将四元数转换为轴/角表示形式
         *
         * @param targetAxis 要重用的向量对象，用于存储轴
         * @return 一个数组，第一个元素是轴，第二个元素是弧度
         */
        Quaternion.prototype.toAxisAngle = function (targetAxis) {
            if (targetAxis === void 0) { targetAxis = new feng3d.Vector3(); }
            this.normalize(); // 如果w>1 acos和sqrt会产生错误，那么如果四元数被标准化，就不会发生这种情况
            var angle = 2 * Math.acos(this.w);
            var s = Math.sqrt(1 - this.w * this.w); // 假设四元数归一化了，那么w小于1，所以项总是正的。
            if (s < 0.001) { // 为了避免除以零，s总是正的，因为是根号
                // 如果s接近于零，那么轴的方向就不重要了
                targetAxis.x = this.x; // 如果轴归一化很重要，则用x=1替换;y = z = 0;
                targetAxis.y = this.y;
                targetAxis.z = this.z;
            }
            else {
                targetAxis.x = this.x / s; // 法线轴
                targetAxis.y = this.y / s;
                targetAxis.z = this.z / s;
            }
            return [targetAxis, angle];
        };
        /**
         * 给定两个向量，设置四元数值。得到的旋转将是将u旋转到v所需要的旋转。
         *
         * @param u
         * @param v
         */
        Quaternion.prototype.setFromVectors = function (u, v) {
            if (u.isAntiparallelTo(v)) {
                var t1 = new feng3d.Vector3();
                var t2 = new feng3d.Vector3();
                u.tangents(t1, t2);
                this.fromAxisAngle(t1, Math.PI);
            }
            else {
                var a = u.crossTo(v);
                this.x = a.x;
                this.y = a.y;
                this.z = a.z;
                this.w = Math.sqrt(Math.pow(u.length, 2) * Math.pow(v.length, 2)) + u.dot(v);
                this.normalize();
            }
            return this;
        };
        /**
         * 与目标四元数之间进行球面内插，提供了具有恒定角度变化率的旋转之间的内插。
         * @param qb 目标四元素
         * @param t 插值权值，一个介于0和1之间的值。
         */
        Quaternion.prototype.slerp = function (qb, t) {
            if (t === 0)
                return this;
            if (t === 1)
                return this.copy(qb);
            var x = this.x, y = this.y, z = this.z, w = this.w;
            // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/
            var cosHalfTheta = w * qb.w + x * qb.x + y * qb.y + z * qb.z;
            if (cosHalfTheta < 0) {
                this.w = -qb.w;
                this.x = -qb.x;
                this.y = -qb.y;
                this.z = -qb.z;
                cosHalfTheta = -cosHalfTheta;
            }
            else {
                this.copy(qb);
            }
            if (cosHalfTheta >= 1.0) {
                this.w = w;
                this.x = x;
                this.y = y;
                this.z = z;
                return this;
            }
            var sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;
            if (sqrSinHalfTheta <= Number.EPSILON) {
                var s = 1 - t;
                this.w = s * w + t * this.w;
                this.x = s * x + t * this.x;
                this.y = s * y + t * this.y;
                this.z = s * z + t * this.z;
                this.normalize();
                return this;
            }
            var sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
            var halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
            var ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta, ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
            this.w = (w * ratioA + this.w * ratioB);
            this.x = (x * ratioA + this.x * ratioB);
            this.y = (y * ratioA + this.y * ratioB);
            this.z = (z * ratioA + this.z * ratioB);
            return this;
        };
        /**
         * 与目标四元数之间进行球面内插，提供了具有恒定角度变化率的旋转之间的内插。
         * @param qb 目标四元素
         * @param t 插值权值，一个介于0和1之间的值。
         * @param out 保存插值结果
         */
        Quaternion.prototype.slerpTo = function (qb, t, out) {
            if (out === void 0) { out = new Quaternion(); }
            if (qb == out)
                qb = qb.clone();
            return out.copy(this).slerp(qb, t);
        };
        /**
         * 线性求插值
         * @param qa 第一个四元素
         * @param qb 第二个四元素
         * @param t 权重
         */
        Quaternion.prototype.lerp = function (qa, qb, t) {
            var w1 = qa.w, x1 = qa.x, y1 = qa.y, z1 = qa.z;
            var w2 = qb.w, x2 = qb.x, y2 = qb.y, z2 = qb.z;
            var len;
            // shortest direction
            if (w1 * w2 + x1 * x2 + y1 * y2 + z1 * z2 < 0) {
                w2 = -w2;
                x2 = -x2;
                y2 = -y2;
                z2 = -z2;
            }
            this.w = w1 + t * (w2 - w1);
            this.x = x1 + t * (x2 - x1);
            this.y = y1 + t * (y2 - y1);
            this.z = z1 + t * (z2 - z1);
            len = 1.0 / Math.sqrt(this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z);
            this.w *= len;
            this.x *= len;
            this.y *= len;
            this.z *= len;
        };
        /**
         * Fills the quaternion object with values representing the given euler rotation.
         *
         * @param    ax        The angle in radians of the rotation around the ax axis.
         * @param    ay        The angle in radians of the rotation around the ay axis.
         * @param    az        The angle in radians of the rotation around the az axis.
         */
        Quaternion.prototype.fromEulerAngles = function (ax, ay, az) {
            var halfX = ax * .5, halfY = ay * .5, halfZ = az * .5;
            var cosX = Math.cos(halfX), sinX = Math.sin(halfX);
            var cosY = Math.cos(halfY), sinY = Math.sin(halfY);
            var cosZ = Math.cos(halfZ), sinZ = Math.sin(halfZ);
            this.w = cosX * cosY * cosZ + sinX * sinY * sinZ;
            this.x = sinX * cosY * cosZ - cosX * sinY * sinZ;
            this.y = cosX * sinY * cosZ + sinX * cosY * sinZ;
            this.z = cosX * cosY * sinZ - sinX * sinY * cosZ;
            return this;
        };
        /**
         * Fills a target Vector3 object with the Euler angles that form the rotation represented by this quaternion.
         * @param target An optional Vector3 object to contain the Euler angles. If not provided, a new object is created.
         * @return The Vector3 containing the Euler angles.
         */
        Quaternion.prototype.toEulerAngles = function (target) {
            target = target || new feng3d.Vector3();
            target.x = Math.atan2(2 * (this.w * this.x + this.y * this.z), 1 - 2 * (this.x * this.x + this.y * this.y));
            var asinvalue = 2 * (this.w * this.y - this.z * this.x);
            //防止超出范围，获取NaN值
            asinvalue = Math.max(-1, Math.min(asinvalue, 1));
            target.y = Math.asin(asinvalue);
            target.z = Math.atan2(2 * (this.w * this.z + this.x * this.y), 1 - 2 * (this.y * this.y + this.z * this.z));
            return target;
        };
        /**
         * 四元数归一化
         */
        Quaternion.prototype.normalize = function (val) {
            if (val === void 0) { val = 1; }
            var l = this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
            if (l === 0) {
                this.x = 0;
                this.y = 0;
                this.z = 0;
                this.w = 1;
            }
            else {
                l = Math.sqrt(l);
                l = 1 / l;
                this.x *= l;
                this.y *= l;
                this.z *= l;
                this.w *= l;
            }
            return this;
        };
        /**
         * 四元数归一化的近似。当quat已经几乎标准化时，效果最好。
         *
         * @see http://jsperf.com/fast-quaternion-normalization
         * @author unphased, https://github.com/unphased
         */
        Quaternion.prototype.normalizeFast = function () {
            var f = (3.0 - (this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)) / 2.0;
            if (f === 0) {
                this.x = 0;
                this.y = 0;
                this.z = 0;
                this.w = 0;
            }
            else {
                this.x *= f;
                this.y *= f;
                this.z *= f;
                this.w *= f;
            }
            return this;
        };
        /**
         * 转换为可读格式
         */
        Quaternion.prototype.toString = function () {
            return "{this.x:" + this.x + " this.y:" + this.y + " this.z:" + this.z + " this.w:" + this.w + "}";
        };
        /**
         * 转换为矩阵
         *
         * @param target
         */
        Quaternion.prototype.toMatrix = function (target) {
            if (target === void 0) { target = new feng3d.Matrix4x4(); }
            var elements = target.elements;
            var xy2 = 2.0 * this.x * this.y, xz2 = 2.0 * this.x * this.z, xw2 = 2.0 * this.x * this.w;
            var yz2 = 2.0 * this.y * this.z, yw2 = 2.0 * this.y * this.w, zw2 = 2.0 * this.z * this.w;
            var xx = this.x * this.x, yy = this.y * this.y, zz = this.z * this.z, ww = this.w * this.w;
            elements[0] = xx - yy - zz + ww;
            elements[4] = xy2 - zw2;
            elements[8] = xz2 + yw2;
            elements[12] = 0;
            elements[1] = xy2 + zw2;
            elements[5] = -xx + yy - zz + ww;
            elements[9] = yz2 - xw2;
            elements[13] = 0;
            elements[2] = xz2 - yw2;
            elements[6] = yz2 + xw2;
            elements[10] = -xx - yy + zz + ww;
            elements[14] = 0;
            elements[3] = 0.0;
            elements[7] = 0.0;
            elements[11] = 0;
            elements[15] = 1;
            return target;
        };
        /**
         * 从矩阵初始化四元素
         *
         * @param matrix 矩阵
         */
        Quaternion.prototype.fromMatrix = function (matrix) {
            var v = matrix.toTRS()[1];
            v.scaleNumber(Math.RAD2DEG);
            this.fromEulerAngles(v.x, v.y, v.z);
            return this;
        };
        /**
         * 克隆
         */
        Quaternion.prototype.clone = function () {
            return new Quaternion(this.x, this.y, this.z, this.w);
        };
        /**
         * 旋转一个顶点
         *
         * @param point 被旋转的顶点
         * @param target 旋转结果
         */
        Quaternion.prototype.rotatePoint = function (point, target) {
            if (target === void 0) { target = new feng3d.Vector3(); }
            var x2 = point.x, y2 = point.y, z2 = point.z;
            // p*q'
            var w1 = -this.x * x2 - this.y * y2 - this.z * z2;
            var x1 = this.w * x2 + this.y * z2 - this.z * y2;
            var y1 = this.w * y2 - this.x * z2 + this.z * x2;
            var z1 = this.w * z2 + this.x * y2 - this.y * x2;
            target.x = -w1 * this.x + x1 * this.w - y1 * this.z + z1 * this.y;
            target.y = -w1 * this.y + x1 * this.z + y1 * this.w - z1 * this.x;
            target.z = -w1 * this.z - x1 * this.y + y1 * this.x + z1 * this.w;
            return target;
        };
        /**
         * 旋转一个绝对方向四元数给定一个角速度和一个时间步长
         *
         * @param angularVelocity
         * @param dt
         * @param angularFactor
         */
        Quaternion.prototype.integrate = function (angularVelocity, dt, angularFactor) {
            var ax = angularVelocity.x * angularFactor.x, ay = angularVelocity.y * angularFactor.y, az = angularVelocity.z * angularFactor.z, bx = this.x, by = this.y, bz = this.z, bw = this.w;
            var half_dt = dt * 0.5;
            this.x += half_dt * (ax * bw + ay * bz - az * by);
            this.y += half_dt * (ay * bw + az * bx - ax * bz);
            this.z += half_dt * (az * bw + ax * by - ay * bx);
            this.w += half_dt * (-ax * bx - ay * by - az * bz);
            return this;
        };
        /**
         * 旋转一个绝对方向四元数给定一个角速度和一个时间步长
         *
         * @param angularVelocity
         * @param dt
         * @param angularFactor
         * @param  target
         */
        Quaternion.prototype.integrateTo = function (angularVelocity, dt, angularFactor, target) {
            if (target === void 0) { target = new Quaternion(); }
            return target.copy(this).integrate(angularVelocity, dt, angularFactor);
        };
        /**
         * 将源的值复制到此四元数
         *
         * @param q 要复制的四元数
         */
        Quaternion.prototype.copy = function (q) {
            this.x = q.x;
            this.y = q.y;
            this.z = q.z;
            this.w = q.w;
            return this;
        };
        /**
         * Multiply the quaternion by a vector
         * @param v
         * @param target Optional
         */
        Quaternion.prototype.vmult = function (v, target) {
            if (target === void 0) { target = new feng3d.Vector3(); }
            var x = v.x, y = v.y, z = v.z;
            var qx = this.x, qy = this.y, qz = this.z, qw = this.w;
            // q*v
            var ix = qw * x + qy * z - qz * y, iy = qw * y + qz * x - qx * z, iz = qw * z + qx * y - qy * x, iw = -qx * x - qy * y - qz * z;
            target.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
            target.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
            target.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
            return target;
        };
        /**
         * Convert the quaternion to euler angle representation. Order: YZX, as this page describes: http://www.euclideanspace.com/maths/standards/index.htm
         * @param target
         * @param order Three-character string e.g. "YZX", which also is default.
         */
        Quaternion.prototype.toEuler = function (target, order) {
            if (order === void 0) { order = "YZX"; }
            var heading, attitude, bank;
            var x = this.x, y = this.y, z = this.z, w = this.w;
            switch (order) {
                case "YZX":
                    var test = x * y + z * w;
                    if (test > 0.499) { // singularity at north pole
                        heading = 2 * Math.atan2(x, w);
                        attitude = Math.PI / 2;
                        bank = 0;
                    }
                    if (test < -0.499) { // singularity at south pole
                        heading = -2 * Math.atan2(x, w);
                        attitude = -Math.PI / 2;
                        bank = 0;
                    }
                    if (isNaN(heading)) {
                        var sqx = x * x;
                        var sqy = y * y;
                        var sqz = z * z;
                        heading = Math.atan2(2 * y * w - 2 * x * z, 1 - 2 * sqy - 2 * sqz); // Heading
                        attitude = Math.asin(2 * test); // attitude
                        bank = Math.atan2(2 * x * w - 2 * y * z, 1 - 2 * sqx - 2 * sqz); // bank
                    }
                    break;
                default:
                    throw new Error("Euler order " + order + " not supported yet.");
            }
            target.y = heading;
            target.z = attitude;
            target.x = bank;
        };
        /**
         * See http://www.mathworks.com/matlabcentral/fileexchange/20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/content/SpinCalc.m
         * @param x
         * @param y
         * @param z
         * @param order The order to apply angles: 'XYZ' or 'YXZ' or any other combination
         */
        Quaternion.prototype.setFromEuler = function (x, y, z, order) {
            if (order === void 0) { order = "XYZ"; }
            var c1 = Math.cos(x / 2);
            var c2 = Math.cos(y / 2);
            var c3 = Math.cos(z / 2);
            var s1 = Math.sin(x / 2);
            var s2 = Math.sin(y / 2);
            var s3 = Math.sin(z / 2);
            if (order === 'XYZ') {
                this.x = s1 * c2 * c3 + c1 * s2 * s3;
                this.y = c1 * s2 * c3 - s1 * c2 * s3;
                this.z = c1 * c2 * s3 + s1 * s2 * c3;
                this.w = c1 * c2 * c3 - s1 * s2 * s3;
            }
            else if (order === 'YXZ') {
                this.x = s1 * c2 * c3 + c1 * s2 * s3;
                this.y = c1 * s2 * c3 - s1 * c2 * s3;
                this.z = c1 * c2 * s3 - s1 * s2 * c3;
                this.w = c1 * c2 * c3 + s1 * s2 * s3;
            }
            else if (order === 'ZXY') {
                this.x = s1 * c2 * c3 - c1 * s2 * s3;
                this.y = c1 * s2 * c3 + s1 * c2 * s3;
                this.z = c1 * c2 * s3 + s1 * s2 * c3;
                this.w = c1 * c2 * c3 - s1 * s2 * s3;
            }
            else if (order === 'ZYX') {
                this.x = s1 * c2 * c3 - c1 * s2 * s3;
                this.y = c1 * s2 * c3 + s1 * c2 * s3;
                this.z = c1 * c2 * s3 - s1 * s2 * c3;
                this.w = c1 * c2 * c3 + s1 * s2 * s3;
            }
            else if (order === 'YZX') {
                this.x = s1 * c2 * c3 + c1 * s2 * s3;
                this.y = c1 * s2 * c3 + s1 * c2 * s3;
                this.z = c1 * c2 * s3 - s1 * s2 * c3;
                this.w = c1 * c2 * c3 - s1 * s2 * s3;
            }
            else if (order === 'XZY') {
                this.x = s1 * c2 * c3 - c1 * s2 * s3;
                this.y = c1 * s2 * c3 - s1 * c2 * s3;
                this.z = c1 * c2 * s3 + s1 * s2 * c3;
                this.w = c1 * c2 * c3 + s1 * s2 * s3;
            }
            return this;
        };
        __decorate([
            feng3d.serialize
        ], Quaternion.prototype, "x", void 0);
        __decorate([
            feng3d.serialize
        ], Quaternion.prototype, "y", void 0);
        __decorate([
            feng3d.serialize
        ], Quaternion.prototype, "z", void 0);
        __decorate([
            feng3d.serialize
        ], Quaternion.prototype, "w", void 0);
        return Quaternion;
    }());
    feng3d.Quaternion = Quaternion;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 3d直线
     */
    var Line3 = /** @class */ (function () {
        /**
         * 根据直线某点与方向创建直线
         * @param origin 直线上某点
         * @param direction 直线的方向
         */
        function Line3(origin, direction) {
            this.origin = origin ? origin : new feng3d.Vector3();
            this.direction = (direction ? direction : new feng3d.Vector3(0, 0, 1)).normalize();
        }
        /**
         * 根据直线上两点初始化直线
         * @param p0 Vector3
         * @param p1 Vector3
         */
        Line3.fromPoints = function (p0, p1) {
            return new Line3().fromPoints(p0, p1);
        };
        /**
         * 根据直线某点与方向初始化直线
         * @param position 直线上某点
         * @param direction 直线的方向
         */
        Line3.fromPosAndDir = function (position, direction) {
            return new Line3().fromPosAndDir(position, direction);
        };
        /**
         * 随机直线，比如用于单元测试
         */
        Line3.random = function () {
            return new Line3(feng3d.Vector3.random(), feng3d.Vector3.random());
        };
        /**
         * 根据直线上两点初始化直线
         * @param p0 Vector3
         * @param p1 Vector3
         */
        Line3.prototype.fromPoints = function (p0, p1) {
            this.origin = p0;
            this.direction = p1.subTo(p0).normalize();
            return this;
        };
        /**
         * 根据直线某点与方向初始化直线
         * @param position 直线上某点
         * @param direction 直线的方向
         */
        Line3.prototype.fromPosAndDir = function (position, direction) {
            this.origin = position;
            this.direction = direction.normalize();
            return this;
        };
        /**
         * 获取经过该直线的平面
         */
        Line3.prototype.getPlane = function (plane) {
            if (plane === void 0) { plane = new feng3d.Plane(); }
            return plane.fromNormalAndPoint(feng3d.Vector3.random().cross(this.direction), this.origin);
        };
        /**
         * 获取直线上的一个点
         * @param length 与原点距离
         */
        Line3.prototype.getPoint = function (length, vout) {
            if (length === void 0) { length = 0; }
            if (vout === void 0) { vout = new feng3d.Vector3(); }
            return vout.copy(this.direction).scaleNumber(length).add(this.origin);
        };
        /**
         * 获取指定z值的点
         * @param z z值
         * @param vout 目标点（输出）
         * @returns 目标点
         */
        Line3.prototype.getPointWithZ = function (z, vout) {
            if (vout === void 0) { vout = new feng3d.Vector3(); }
            return this.getPoint((z - this.origin.z) / this.direction.z, vout);
        };
        /**
         * 指定点到该直线距离
         * @param point 指定点
         */
        Line3.prototype.distanceWithPoint = function (point) {
            return this.closestPointWithPoint(point).sub(point).length;
        };
        /**
         * 与指定点最近点的系数
         * @param point 点
         */
        Line3.prototype.closestPointParameterWithPoint = function (point) {
            return point.subTo(this.origin).dot(this.direction);
        };
        /**
         * 与指定点最近的点
         * @param point 点
         * @param vout 输出点
         */
        Line3.prototype.closestPointWithPoint = function (point, vout) {
            if (vout === void 0) { vout = new feng3d.Vector3(); }
            var t = this.closestPointParameterWithPoint(point);
            return this.getPoint(t, vout);
        };
        /**
         * 判定点是否在直线上
         * @param point 点
         * @param precision 精度
         */
        Line3.prototype.onWithPoint = function (point, precision) {
            if (precision === void 0) { precision = Math.PRECISION; }
            if (Math.equals(this.distanceWithPoint(point), 0, precision))
                return true;
            return false;
        };
        /**
         * 与直线相交
         * @param line3D 直线
         */
        Line3.prototype.intersectWithLine3D = function (line3D) {
            // 处理相等
            if (this.equals(line3D))
                return this.clone();
            // 处理平行
            if (this.direction.isParallel(line3D.direction))
                return null;
            var plane = this.getPlane();
            var point = plane.intersectWithLine3(line3D);
            if (this.onWithPoint(point))
                return point;
            return null;
        };
        /**
         * 应用矩阵
         * @param mat 矩阵
         */
        Line3.prototype.applyMatri4x4 = function (mat) {
            mat.transformPoint3(this.origin, this.origin);
            mat.transformVector3(this.direction, this.direction);
            return this;
        };
        /**
         * 与指定向量比较是否相等
         * @param v 比较的向量
         * @param precision 允许误差
         * @return 相等返回true，否则false
         */
        Line3.prototype.equals = function (line, precision) {
            if (precision === void 0) { precision = Math.PRECISION; }
            if (!this.onWithPoint(line.origin))
                return false;
            if (!this.onWithPoint(line.origin.addTo(line.direction)))
                return false;
            return true;
        };
        /**
         * 拷贝
         * @param line 直线
         */
        Line3.prototype.copy = function (line) {
            this.origin.copy(line.origin);
            this.direction.copy(line.direction);
            return this;
        };
        /**
         * 克隆
         */
        Line3.prototype.clone = function () {
            return new Line3().copy(this);
        };
        return Line3;
    }());
    feng3d.Line3 = Line3;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 3D线段
     */
    var Segment3 = /** @class */ (function () {
        function Segment3(p0, p1) {
            if (p0 === void 0) { p0 = new feng3d.Vector3(); }
            if (p1 === void 0) { p1 = new feng3d.Vector3(); }
            this.p0 = p0;
            this.p1 = p1;
        }
        /**
         * 初始化线段
         * @param p0
         * @param p1
         */
        Segment3.fromPoints = function (p0, p1) {
            return new Segment3(p0, p1);
        };
        /**
         * 随机线段
         */
        Segment3.random = function () {
            return new Segment3(feng3d.Vector3.random(), feng3d.Vector3.random());
        };
        /**
         * 线段长度
         */
        Segment3.prototype.getLength = function () {
            return Math.sqrt(this.getLengthSquared());
        };
        /**
         * 线段长度的平方
         */
        Segment3.prototype.getLengthSquared = function () {
            return this.p0.distanceSquared(this.p1);
        };
        /**
         * 获取线段所在直线
         */
        Segment3.prototype.getLine = function (line) {
            if (line === void 0) { line = new feng3d.Line3(); }
            return line.fromPoints(this.p0.clone(), this.p1.clone());
        };
        /**
         * 获取指定位置上的点，当position=0时返回p0，当position=1时返回p1
         * @param position 线段上的位置
         */
        Segment3.prototype.getPoint = function (position, pout) {
            if (pout === void 0) { pout = new feng3d.Vector3(); }
            var newPoint = pout.copy(this.p0).add(this.p1.subTo(this.p0).scaleNumber(position));
            return newPoint;
        };
        /**
         * 判定点是否在线段上
         * @param point
         */
        Segment3.prototype.onWithPoint = function (point, precision) {
            if (precision === void 0) { precision = Math.PRECISION; }
            return Math.equals(this.getPointDistance(point), 0, precision);
        };
        /**
         * 判定点是否投影在线段上
         * @param point
         */
        Segment3.prototype.projectOnWithPoint = function (point) {
            var position = this.getPositionByPoint(point);
            position = Number(position.toFixed(6));
            return 0 <= position && position <= 1;
        };
        /**
         * 获取点在线段上的位置，当点投影在线段上p0位置时返回0，当点投影在线段p1上时返回1
         * @param point 点
         */
        Segment3.prototype.getPositionByPoint = function (point) {
            var vec = this.p1.subTo(this.p0);
            var position = point.subTo(this.p0).dot(vec) / vec.lengthSquared;
            return position;
        };
        /**
         * 获取直线到点的法线（线段到点垂直方向）
         * @param point 点
         */
        Segment3.prototype.getNormalWithPoint = function (point) {
            var direction = this.p1.subTo(this.p0);
            var l1 = point.subTo(this.p0);
            var n = direction.crossTo(l1).crossTo(direction).normalize();
            return n;
        };
        /**
         * 指定点到该线段距离，如果投影点不在线段上时，该距离为指定点到最近的线段端点的距离
         * @param point 指定点
         */
        Segment3.prototype.getPointDistanceSquare = function (point) {
            var position = this.getPositionByPoint(point);
            if (position <= 0) {
                lengthSquared = point.subTo(this.p0).lengthSquared;
            }
            else if (position >= 1) {
                lengthSquared = point.subTo(this.p1).lengthSquared;
            }
            else {
                var s0 = point.subTo(this.p0).lengthSquared;
                var s1 = position * position * this.p1.subTo(this.p0).lengthSquared;
                var lengthSquared = Math.abs(s0 - s1);
            }
            return lengthSquared;
        };
        /**
         * 指定点到该线段距离，如果投影点不在线段上时，该距离为指定点到最近的线段端点的距离
         * @param point 指定点
         */
        Segment3.prototype.getPointDistance = function (point) {
            var v = this.getPointDistanceSquare(point);
            v = Math.sqrt(v);
            return v;
        };
        /**
         * 与直线相交
         * @param line 直线
         */
        Segment3.prototype.intersectionWithLine = function (line) {
            var l = this.getLine();
            var r = l.intersectWithLine3D(line);
            if (!r)
                return null;
            if (r instanceof feng3d.Line3)
                return this.clone();
            if (this.onWithPoint(r))
                return r;
            return null;
        };
        /**
         * 与线段相交
         * @param segment 直线
         */
        Segment3.prototype.intersectionWithSegment = function (segment) {
            var r = this.intersectionWithLine(segment.getLine());
            if (!r)
                return null;
            if (r instanceof Segment3) {
                var ps = [this.p0, this.p1].map(function (p) {
                    return segment.clampPoint(p);
                });
                if (this.onWithPoint(ps[0]))
                    return Segment3.fromPoints(ps[0], ps[1]);
                return null;
            }
            if (this.onWithPoint(r))
                return r;
            return null;
        };
        /**
         * 与指定点最近的点
         * @param point 点
         * @param vout 输出点
         */
        Segment3.prototype.closestPointWithPoint = function (point, vout) {
            if (vout === void 0) { vout = new feng3d.Vector3(); }
            this.getLine().closestPointWithPoint(point, vout);
            if (this.onWithPoint(vout))
                return vout;
            if (point.distanceSquared(this.p0) < point.distanceSquared(this.p1))
                return vout.copy(this.p0);
            return vout.copy(this.p1);
        };
        /**
         * 把点压缩到线段内
         */
        Segment3.prototype.clampPoint = function (point, pout) {
            if (pout === void 0) { pout = new feng3d.Vector3(); }
            return this.getPoint(Math.clamp(this.getPositionByPoint(point), 0, 1), pout);
        };
        /**
         * 判定线段是否相等
         */
        Segment3.prototype.equals = function (segment) {
            return (this.p0.equals(segment.p0) && this.p1.equals(segment.p1)) || (this.p0.equals(segment.p1) && this.p1.equals(segment.p0));
        };
        /**
         * 复制
         */
        Segment3.prototype.copy = function (segment) {
            this.p0.copy(segment.p0);
            this.p1.copy(segment.p1);
            return this;
        };
        /**
         * 克隆
         */
        Segment3.prototype.clone = function () {
            return new Segment3().copy(this);
        };
        return Segment3;
    }());
    feng3d.Segment3 = Segment3;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 3D射线
     */
    var Ray3 = /** @class */ (function (_super) {
        __extends(Ray3, _super);
        function Ray3(origin, direction) {
            return _super.call(this, origin, direction) || this;
        }
        return Ray3;
    }(feng3d.Line3));
    feng3d.Ray3 = Ray3;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 三角形
     */
    var Triangle3 = /** @class */ (function () {
        /**
         * 构造三角形
         *
         * @param p0 三角形0号点
         * @param p1 三角形1号点
         * @param p2 三角形2号点
         */
        function Triangle3(p0, p1, p2) {
            if (p0 === void 0) { p0 = new feng3d.Vector3(); }
            if (p1 === void 0) { p1 = new feng3d.Vector3(); }
            if (p2 === void 0) { p2 = new feng3d.Vector3(); }
            this.p0 = p0;
            this.p1 = p1;
            this.p2 = p2;
        }
        /**
         * 通过3顶点定义一个三角形
         * @param p0		点0
         * @param p1		点1
         * @param p2		点2
         */
        Triangle3.fromPoints = function (p0, p1, p2) {
            return new Triangle3().fromPoints(p0, p1, p2);
        };
        /**
         * 从顶点数据初始化三角形
         * @param positions 顶点数据
         */
        Triangle3.fromPositions = function (positions) {
            return new Triangle3().fromPositions(positions);
        };
        /**
         * 随机三角形
         * @param size 尺寸
         */
        Triangle3.random = function (size) {
            if (size === void 0) { size = 1; }
            return new Triangle3(feng3d.Vector3.random(size), feng3d.Vector3.random(size), feng3d.Vector3.random(size));
        };
        /**
         * 三角形三个点
         */
        Triangle3.prototype.getPoints = function () {
            return [this.p0, this.p1, this.p2];
        };
        /**
         * 三边
         */
        Triangle3.prototype.getSegments = function () {
            return [feng3d.Segment3.fromPoints(this.p0, this.p1), feng3d.Segment3.fromPoints(this.p1, this.p2), feng3d.Segment3.fromPoints(this.p2, this.p0)];
        };
        /**
         * 三角形所在平面
         */
        Triangle3.prototype.getPlane3d = function (pout) {
            if (pout === void 0) { pout = new feng3d.Plane(); }
            return pout.fromPoints(this.p0, this.p1, this.p2);
        };
        /**
         * 获取法线
         */
        Triangle3.prototype.getNormal = function (vout) {
            if (vout === void 0) { vout = new feng3d.Vector3(); }
            return vout.copy(this.p1).sub(this.p0).cross(this.p2.subTo(this.p1)).normalize();
        };
        /**
         * 重心,三条中线相交的点叫做重心。
         */
        Triangle3.prototype.getBarycenter = function (pout) {
            if (pout === void 0) { pout = new feng3d.Vector3(); }
            return pout.copy(this.p0).add(this.p1).add(this.p2).scaleNumber(1 / 3);
        };
        /**
         * 外心，外切圆心,三角形三边的垂直平分线的交点，称为三角形外心。
         * @see https://baike.baidu.com/item/%E4%B8%89%E8%A7%92%E5%BD%A2%E4%BA%94%E5%BF%83/218867
         */
        Triangle3.prototype.getCircumcenter = function (pout) {
            if (pout === void 0) { pout = new feng3d.Vector3(); }
            var a = this.p2.subTo(this.p1);
            var b = this.p0.subTo(this.p2);
            var c = this.p1.subTo(this.p0);
            var d = 2 * c.crossTo(a).lengthSquared;
            var a0 = -a.dot(a) * c.dot(b) / d;
            var b0 = -b.dot(b) * c.dot(a) / d;
            var c0 = -c.dot(c) * b.dot(a) / d;
            return pout.copy(this.p0).scaleNumber(a0).add(this.p1.scaleNumberTo(b0)).add(this.p2.scaleNumberTo(c0));
        };
        /**
         * 内心，内切圆心,三角形内心为三角形三条内角平分线的交点。
         * @see https://baike.baidu.com/item/%E4%B8%89%E8%A7%92%E5%BD%A2%E4%BA%94%E5%BF%83/218867
         */
        Triangle3.prototype.getInnercenter = function (pout) {
            if (pout === void 0) { pout = new feng3d.Vector3(); }
            var a = this.p2.subTo(this.p1).length;
            var b = this.p0.subTo(this.p2).length;
            var c = this.p1.subTo(this.p0).length;
            return pout.copy(this.p0).scaleNumber(a).add(this.p1.scaleNumberTo(b)).add(this.p2.scaleNumberTo(c)).scaleNumber(1 / (a + b + c));
        };
        /**
         * 垂心，三角形三边上的三条高或其延长线交于一点，称为三角形垂心。
         * @see https://baike.baidu.com/item/%E4%B8%89%E8%A7%92%E5%BD%A2%E4%BA%94%E5%BF%83/218867
         */
        Triangle3.prototype.getOrthocenter = function (pout) {
            if (pout === void 0) { pout = new feng3d.Vector3(); }
            var a = this.p2.subTo(this.p1);
            var b = this.p0.subTo(this.p2);
            var c = this.p1.subTo(this.p0);
            var a0 = a.dot(b) * a.dot(c);
            var b0 = b.dot(c) * b.dot(a);
            var c0 = c.dot(a) * c.dot(b);
            return pout.copy(this.p0).scaleNumber(a0).add(this.p1.scaleNumberTo(b0)).add(this.p2.scaleNumberTo(c0)).scaleNumber(1 / (a0 + b0 + c0));
        };
        /**
         * 通过3顶点定义一个三角形
         * @param p0		点0
         * @param p1		点1
         * @param p2		点2
         */
        Triangle3.prototype.fromPoints = function (p0, p1, p2) {
            this.p0 = p0;
            this.p1 = p1;
            this.p2 = p2;
            return this;
        };
        /**
         * 从顶点数据初始化三角形
         * @param positions 顶点数据
         */
        Triangle3.prototype.fromPositions = function (positions) {
            this.p0.set(positions[0], positions[1], positions[2]);
            this.p1.set(positions[3], positions[4], positions[5]);
            this.p2.set(positions[6], positions[7], positions[8]);
            return this;
        };
        /**
         * 获取三角形内的点
         * @param p 三点的权重（重心坐标系坐标）
         * @param pout 输出点
         */
        Triangle3.prototype.getPoint = function (p, pout) {
            if (pout === void 0) { pout = new feng3d.Vector3(); }
            return pout.copy(this.p0).scaleNumber(p.x).add(this.p1.scaleNumberTo(p.y)).add(this.p2.scaleNumberTo(p.z));
        };
        /**
         * 获取三角形内随机点
         * @param pout 输出点
         */
        Triangle3.prototype.randomPoint = function (pout) {
            if (pout === void 0) { pout = new feng3d.Vector3(); }
            var a = Math.random();
            var b = Math.random() * (1 - a);
            var c = 1 - a - b;
            return this.getPoint(new feng3d.Vector3(a, b, c), pout);
        };
        /**
         * 获取与直线相交，当直线与三角形不相交时返回null
         */
        Triangle3.prototype.intersectionWithLine = function (line) {
            var plane3d = this.getPlane3d();
            var cross = plane3d.intersectWithLine3(line);
            if (!cross)
                return null;
            if (cross instanceof feng3d.Vector3) {
                if (this.onWithPoint(cross))
                    return cross;
                return null;
            }
            // 直线分别于三边相交
            var crossSegment = null;
            var ps = this.getSegments().reduce(function (v, segment) {
                var r = segment.intersectionWithLine(line);
                if (!r)
                    return v;
                if (r instanceof feng3d.Segment3) {
                    crossSegment = r;
                    return v;
                }
                v.push(r);
                return v;
            }, []);
            if (crossSegment)
                return crossSegment;
            if (ps.length == 0)
                return null;
            if (ps.length == 1)
                return ps[0];
            if (ps[0].equals(ps[1])) {
                return ps[0];
            }
            return feng3d.Segment3.fromPoints(ps[0], ps[1]);
        };
        /**
         * 获取与线段相交
         */
        Triangle3.prototype.intersectionWithSegment = function (segment) {
            var r = this.intersectionWithLine(segment.getLine());
            if (!r)
                return null;
            if (r instanceof feng3d.Vector3) {
                if (segment.onWithPoint(r))
                    return r;
                return null;
            }
            var p0 = segment.clampPoint(r.p0);
            var p1 = segment.clampPoint(r.p1);
            if (!r.onWithPoint(p0))
                return null;
            if (p0.equals(p1))
                return p0;
            return feng3d.Segment3.fromPoints(p0, p1);
        };
        /**
         * 判定点是否在三角形上
         * @param p 点
         * @param precision 精度，如果距离小于精度则判定为在三角形上
         */
        Triangle3.prototype.onWithPoint = function (p, precision) {
            if (precision === void 0) { precision = Math.PRECISION; }
            var p0 = this.p0;
            var p1 = this.p1;
            var p2 = this.p2;
            // 判断点是否在平面上
            var dot = p0.subTo(p1).cross(p1.subTo(p2)).dot(p.subTo(p0));
            if (!Math.equals(dot, 0, precision))
                return false;
            // 求点的重心坐标系坐标
            var bp = this.getBarycentricCoordinates(p);
            // 当重心坐标系坐标任意分量小于0表示点在三角形外
            precision = -precision;
            if (bp.x < precision || bp.y < precision || bp.z < precision)
                return false;
            return true;
        };
        /**
         * 求给出点的重心坐标系坐标
         *
         * @param p 点
         * @param bp 用于接收重心坐标系坐标
         *
         * @returns 重心坐标系坐标
         *
         * @see 3D数学基础：图形与游戏开发 P252 P249
         */
        Triangle3.prototype.getBarycentricCoordinates = function (p, bp) {
            if (bp === void 0) { bp = new feng3d.Vector3(); }
            var p0x = this.p0.x;
            var p0y = this.p0.y;
            var p0z = this.p0.z;
            var p1x = this.p1.x;
            var p1y = this.p1.y;
            var p1z = this.p1.z;
            var p2x = this.p2.x;
            var p2y = this.p2.y;
            var p2z = this.p2.z;
            var d1x = p1x - p0x;
            var d1y = p1y - p0y;
            var d1z = p1z - p0z;
            var d2x = p2x - p1x;
            var d2y = p2y - p1y;
            var d2z = p2z - p1z;
            var nx = d1y * d2z - d1z * d2y;
            var ny = d1z * d2x - d1x * d2z;
            var nz = d1x * d2y - d1y * d2x;
            var u1, u2, u3, u4;
            var v1, v2, v3, v4;
            if ((Math.abs(nx) >= Math.abs(ny)) && (Math.abs(nx) >= Math.abs(nz))) {
                u1 = p0y - p2y;
                u2 = p1y - p2y;
                u3 = p.y - p0y;
                u4 = p.y - p2y;
                v1 = p0z - p2z;
                v2 = p1z - p2z;
                v3 = p.z - p0z;
                v4 = p.z - p2z;
            }
            else if (Math.abs(ny) >= Math.abs(nz)) {
                u1 = p0z - p2z;
                u2 = p1z - p2z;
                u3 = p.z - p0z;
                u4 = p.z - p2z;
                v1 = p0x - p2x;
                v2 = p1x - p2x;
                v3 = p.x - p0x;
                v4 = p.x - p2x;
            }
            else {
                u1 = p0x - p2x;
                u2 = p1x - p2x;
                u3 = p.x - p0x;
                u4 = p.x - p2x;
                v1 = p0y - p2y;
                v2 = p1y - p2y;
                v3 = p.y - p0y;
                v4 = p.y - p2y;
            }
            var denom = v1 * u2 - v2 * u1;
            // if (Math.equals(denom, 0))
            // {
            //     return null;
            // }
            var oneOverDenom = 1 / denom;
            bp.x = (v4 * u2 - v2 * u4) * oneOverDenom;
            bp.y = (v1 * u3 - v3 * u1) * oneOverDenom;
            bp.z = 1 - bp.x - bp.y;
            return bp;
        };
        /**
         * 获取指定点分别占三个点的混合值
         */
        Triangle3.prototype.blendWithPoint = function (p) {
            var n = this.p1.subTo(this.p0).crossTo(this.p2.subTo(this.p1));
            var area = n.length;
            n.normalize();
            //
            var n0 = this.p1.subTo(p).crossTo(this.p2.subTo(this.p1));
            var area0 = n0.length;
            n0.normalize();
            var b0 = area0 / area * n.dot(n0);
            //
            var n1 = this.p2.subTo(p).crossTo(this.p0.subTo(this.p2));
            var area1 = n1.length;
            n1.normalize();
            var b1 = area1 / area * n.dot(n1);
            //
            var n2 = this.p0.subTo(p).crossTo(this.p1.subTo(this.p0));
            var area2 = n2.length;
            n2.normalize();
            var b2 = area2 / area * n.dot(n2);
            return new feng3d.Vector3(b0, b1, b2);
        };
        /**
         * 是否与盒子相交
         */
        Triangle3.prototype.intersectsBox = function (box) {
            return box.intersectsTriangle(this);
        };
        /**
         * 与指定点最近的点
         * @param point 点
         * @param vout 输出点
         */
        Triangle3.prototype.closestPointWithPoint = function (point, vout) {
            if (vout === void 0) { vout = new feng3d.Vector3(); }
            this.getPlane3d().closestPointWithPoint(point, vout);
            if (this.onWithPoint(vout))
                return vout;
            var p = this.getSegments().map(function (s) { var p = s.closestPointWithPoint(point); return { point: p, d: point.distanceSquared(p) }; }).sort(function (a, b) { return a.d - b.d; })[0].point;
            return vout.copy(p);
        };
        /**
         * 与点最近距离
         * @param point 点
         */
        Triangle3.prototype.distanceWithPoint = function (point) {
            return this.closestPointWithPoint(point).distance(point);
        };
        /**
         * 与点最近距离平方
         * @param point 点
         */
        Triangle3.prototype.distanceSquaredWithPoint = function (point) {
            return this.closestPointWithPoint(point).distanceSquared(point);
        };
        /**
         * 用点分解（切割）三角形
         */
        Triangle3.prototype.decomposeWithPoint = function (p) {
            if (!this.onWithPoint(p))
                return [this];
            if (this.p0.equals(p) || this.p1.equals(p) || this.p2.equals(p))
                return [this];
            if (feng3d.Segment3.fromPoints(this.p0, this.p1).onWithPoint(p))
                return [Triangle3.fromPoints(this.p0, p, this.p2), Triangle3.fromPoints(p, this.p1, this.p2)];
            if (feng3d.Segment3.fromPoints(this.p1, this.p2).onWithPoint(p))
                return [Triangle3.fromPoints(this.p1, p, this.p0), Triangle3.fromPoints(p, this.p2, this.p0)];
            if (feng3d.Segment3.fromPoints(this.p2, this.p0).onWithPoint(p))
                return [Triangle3.fromPoints(this.p2, p, this.p1), Triangle3.fromPoints(p, this.p0, this.p1)];
            return [Triangle3.fromPoints(p, this.p0, this.p1), Triangle3.fromPoints(p, this.p1, this.p2), Triangle3.fromPoints(p, this.p2, this.p0)];
        };
        /**
         * 用点分解（切割）三角形
         */
        Triangle3.prototype.decomposeWithPoints = function (ps) {
            // 遍历顶点分割三角形
            var ts = ps.reduce(function (v, p) {
                // 使用点分割所有三角形
                v = v.reduce(function (v0, t) {
                    return v0.concat(t.decomposeWithPoint(p));
                }, []);
                return v;
            }, [this]);
            return ts;
        };
        /**
         * 用线段分解（切割）三角形
         * @param segment 线段
         */
        Triangle3.prototype.decomposeWithSegment = function (segment) {
            var r = this.intersectionWithSegment(segment);
            if (!r)
                return [this];
            if (r instanceof feng3d.Vector3) {
                return this.decomposeWithPoint(r);
            }
            var ts = this.decomposeWithPoints([r.p0, r.p1]);
            return ts;
        };
        /**
         * 用直线分解（切割）三角形
         * @param line 直线
         */
        Triangle3.prototype.decomposeWithLine = function (line) {
            var r = this.intersectionWithLine(line);
            if (!r)
                return [this];
            if (r instanceof feng3d.Vector3) {
                return this.decomposeWithPoint(r);
            }
            var ts = this.decomposeWithPoints([r.p0, r.p1]);
            return ts;
        };
        /**
         * 面积
         */
        Triangle3.prototype.area = function () {
            return this.p1.subTo(this.p0).crossTo(this.p2.subTo(this.p1)).length * 0.5;
        };
        /**
         * 栅格化，点阵化为XYZ轴间距为1的点阵
         */
        Triangle3.prototype.rasterize = function () {
            var aabb = feng3d.Box3.fromPoints([this.p0, this.p1, this.p2]);
            aabb.min.round();
            aabb.max.round();
            var point = new feng3d.Vector3();
            var result = [];
            for (var x = aabb.min.x; x <= aabb.max.x; x++) {
                for (var y = aabb.min.y; y <= aabb.max.y; y++) {
                    for (var z = aabb.min.z; z <= aabb.max.z; z++) {
                        // 判定是否在三角形上
                        var onTri = this.onWithPoint(point.set(x, y, z), 0.5);
                        if (onTri) {
                            result.push(x, y, z);
                        }
                    }
                }
            }
            return result;
        };
        /**
         * 平移
         * @param v 向量
         */
        Triangle3.prototype.translateVector3 = function (v) {
            this.p0.add(v);
            this.p1.add(v);
            this.p2.add(v);
            return this;
        };
        /**
         * 缩放
         * @param v 缩放量
         */
        Triangle3.prototype.scaleVector3 = function (v) {
            this.p0.scale(v);
            this.p1.scale(v);
            this.p2.scale(v);
            return this;
        };
        /**
         * 自定义栅格化为点阵
         * @param voxelSize 体素尺寸，点阵XYZ轴间距
         * @param origin 原点，点阵中的某点正处于原点上，因此可以用作体素范围内的偏移
         */
        Triangle3.prototype.rasterizeCustom = function (voxelSize, origin) {
            if (voxelSize === void 0) { voxelSize = new feng3d.Vector3(1, 1, 1); }
            if (origin === void 0) { origin = new feng3d.Vector3(); }
            var tri = this.clone().translateVector3(origin.negateTo()).scaleVector3(voxelSize.inverseTo());
            var ps = tri.rasterize();
            var vec = new feng3d.Vector3();
            var result = [];
            ps.forEach(function (v, i) {
                if (i % 3 == 0) {
                    vec.set(ps[i], ps[i + 1], ps[i + 2]).scale(voxelSize).add(origin);
                    result.push({ xi: ps[i], yi: ps[i + 1], zi: ps[i + 2], xv: vec.x, yv: vec.y, zv: vec.z });
                }
            });
            return result;
        };
        /**
         * 复制
         * @param triangle 三角形
         */
        Triangle3.prototype.copy = function (triangle) {
            this.p0.copy(triangle.p0);
            this.p1.copy(triangle.p1);
            this.p2.copy(triangle.p2);
            return this;
        };
        /**
         * 克隆
         */
        Triangle3.prototype.clone = function () {
            return new Triangle3().copy(this);
        };
        /**
         * 判断指定点是否在三角形内
         *
         * @param p0 三角形0号点
         * @param p1 三角形1号点
         * @param p2 三角形2号点
         * @param p 指定点
         */
        Triangle3.containsPoint = function (p0, p1, p2, p) {
            return new Triangle3(p0, p1, p2).onWithPoint(p);
        };
        return Triangle3;
    }());
    feng3d.Triangle3 = Triangle3;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 轴向对称包围盒
     */
    var Box3 = /** @class */ (function () {
        /**
         * 创建包围盒
         * @param min 最小点
         * @param max 最大点
         */
        function Box3(min, max) {
            if (min === void 0) { min = new feng3d.Vector3(+Infinity, +Infinity, +Infinity); }
            if (max === void 0) { max = new feng3d.Vector3(-Infinity, -Infinity, -Infinity); }
            this.min = min;
            this.max = max;
        }
        /**
         * 从一组顶点初始化包围盒
         * @param positions 坐标数据列表
         */
        Box3.formPositions = function (positions) {
            return new Box3().formPositions(positions);
        };
        /**
         * 从一组点初始化包围盒
         * @param ps 点列表
         */
        Box3.fromPoints = function (ps) {
            return new Box3().fromPoints(ps);
        };
        /**
         * 随机包围盒
         */
        Box3.random = function () {
            var min = feng3d.Vector3.random();
            var max = feng3d.Vector3.random().add(min);
            return new Box3(min, max);
        };
        /**
         * 获取中心点
         * @param vout 输出向量
         */
        Box3.prototype.getCenter = function (vout) {
            if (vout === void 0) { vout = new feng3d.Vector3(); }
            if (this.isEmpty) {
                return null;
            }
            return vout.copy(this.min).add(this.max).scaleNumber(0.5);
        };
        /**
         * 尺寸
         */
        Box3.prototype.getSize = function (vout) {
            if (vout === void 0) { vout = new feng3d.Vector3(); }
            return this.isEmpty() ? vout.set(0, 0, 0) : this.max.subTo(this.min, vout);
        };
        /**
         * 初始化包围盒
         * @param min 最小值
         * @param max 最大值
         */
        Box3.prototype.init = function (min, max) {
            this.min = min;
            this.max = max;
            return this;
        };
        /**
         * 缩放包围盒
         *
         * @param s 缩放系数
         */
        Box3.prototype.scale = function (s) {
            this.min.scale(s);
            this.max.scale(s);
            return this;
        };
        /**
         * 转换为包围盒八个角所在点列表
         */
        Box3.prototype.toPoints = function (points) {
            if (!points) {
                points = [
                    new feng3d.Vector3(),
                    new feng3d.Vector3(),
                    new feng3d.Vector3(),
                    new feng3d.Vector3(),
                    new feng3d.Vector3(),
                    new feng3d.Vector3(),
                    new feng3d.Vector3(),
                    new feng3d.Vector3(),
                ];
            }
            var min = this.min;
            var max = this.max;
            points[0].set(min.x, min.y, min.z);
            points[1].set(max.x, min.y, min.z);
            points[2].set(min.x, max.y, min.z);
            points[3].set(min.x, min.y, max.z);
            points[4].set(min.x, max.y, max.z);
            points[5].set(max.x, min.y, max.z);
            points[6].set(max.x, max.y, min.z);
            points[7].set(max.x, max.y, max.z);
            return points;
        };
        /**
         * 从一组顶点初始化包围盒
         * @param positions 坐标数据列表
         */
        Box3.prototype.formPositions = function (positions) {
            var minX = +Infinity;
            var minY = +Infinity;
            var minZ = +Infinity;
            var maxX = -Infinity;
            var maxY = -Infinity;
            var maxZ = -Infinity;
            for (var i = 0, l = positions.length; i < l; i += 3) {
                var x = positions[i];
                var y = positions[i + 1];
                var z = positions[i + 2];
                if (x < minX)
                    minX = x;
                if (y < minY)
                    minY = y;
                if (z < minZ)
                    minZ = z;
                if (x > maxX)
                    maxX = x;
                if (y > maxY)
                    maxY = y;
                if (z > maxZ)
                    maxZ = z;
            }
            this.min.set(minX, minY, minZ);
            this.max.set(maxX, maxY, maxZ);
            return this;
        };
        /**
         * 从一组点初始化包围盒
         * @param ps 点列表
         */
        Box3.prototype.fromPoints = function (ps) {
            var _this = this;
            this.empty();
            ps.forEach(function (element) {
                _this.expandByPoint(element);
            });
            return this;
        };
        /**
         * 包围盒内随机点
         */
        Box3.prototype.randomPoint = function (pout) {
            if (pout === void 0) { pout = new feng3d.Vector3(); }
            return pout.copy(this.min).lerp(this.max, feng3d.Vector3.random());
        };
        /**
         * 使用点扩张包围盒
         * @param point 点
         */
        Box3.prototype.expandByPoint = function (point) {
            this.min.min(point);
            this.max.max(point);
            return this;
        };
        /**
         * 应用矩阵
         * @param mat 矩阵
         *
         * @todo 优化
         * @see 3D数学基础：图形与游戏开发 P288 AABB::setToTransformedBox
         */
        Box3.prototype.applyMatrix = function (mat) {
            if (this.isEmpty())
                return this;
            this.fromPoints(this.toPoints().map(function (v) {
                return v.applyMatrix4x4(mat);
            }));
            return this;
        };
        /**
         * 应用矩阵
         * @param mat 矩阵
         */
        Box3.prototype.applyMatrixTo = function (mat, out) {
            if (out === void 0) { out = new Box3(); }
            return out.copy(this).applyMatrix(mat);
        };
        /**
         *
         */
        Box3.prototype.clone = function () {
            return new Box3(this.min.clone(), this.max.clone());
        };
        /**
         * 是否包含指定点
         * @param p 点
         */
        Box3.prototype.containsPoint = function (p) {
            return this.min.lessequal(p) && this.max.greaterequal(p);
        };
        /**
         * 是否包含包围盒
         * @param aabb 包围盒
         */
        Box3.prototype.contains = function (aabb) {
            return this.min.lessequal(aabb.min) && this.max.greaterequal(aabb.max);
        };
        /**
         * 拷贝
         * @param aabb 包围盒
         */
        Box3.prototype.copy = function (aabb) {
            this.min.copy(aabb.min);
            this.max.copy(aabb.max);
            return this;
        };
        /**
         * 比较包围盒是否相等
         * @param aabb 包围盒
         */
        Box3.prototype.equals = function (aabb) {
            return this.min.equals(aabb.min) && this.max.equals(aabb.max);
        };
        /**
         * 平移
         *
         * @param offset 偏移量
         */
        Box3.prototype.translate = function (offset) {
            this.min.add(offset);
            this.max.add(offset);
            return this;
        };
        /**
         * 膨胀包围盒
         * @param dx x方向膨胀量
         * @param dy y方向膨胀量
         * @param dz z方向膨胀量
         */
        Box3.prototype.inflate = function (dx, dy, dz) {
            this.min.x -= dx / 2;
            this.min.y -= dy / 2;
            this.min.z -= dz / 2;
            this.max.x += dx / 2;
            this.max.y += dy / 2;
            this.max.z += dz / 2;
        };
        /**
         * 膨胀包围盒
         * @param delta 膨胀量
         */
        Box3.prototype.inflatePoint = function (delta) {
            delta = delta.scaleNumberTo(0.5);
            this.min.sub(delta);
            this.max.add(delta);
        };
        /**
         * 与包围盒相交
         * @param aabb 包围盒
         */
        Box3.prototype.intersection = function (aabb) {
            var min = this.min.clampTo(aabb.min, aabb.max);
            var max = this.max.clampTo(aabb.min, aabb.max);
            if (this.containsPoint(min)) {
                this.min.copy(min);
                this.max.copy(max);
                return this;
            }
            return null;
        };
        /**
         * 与包围盒相交
         * @param aabb 包围盒
         */
        Box3.prototype.intersectionTo = function (aabb, out) {
            if (out === void 0) { out = new Box3(); }
            return out.copy(this).intersection(aabb);
        };
        /**
         * 包围盒是否相交
         * @param aabb 包围盒
         */
        Box3.prototype.intersects = function (aabb) {
            var b = this.intersectionTo(aabb);
            var c = b.getCenter();
            return this.containsPoint(c) && aabb.containsPoint(c);
        };
        /**
         * 与射线相交
         * @param position 射线起点
         * @param direction 射线方向
         * @param outTargetNormal 相交处法线
         * @return 起点到包围盒距离
         *
         * @todo 可用以下方法优化？
         * @see 3D数学基础：图形与游戏开发 P290
         */
        Box3.prototype.rayIntersection = function (position, direction, outTargetNormal) {
            if (this.isEmpty())
                return Number.MAX_VALUE;
            if (this.containsPoint(position))
                return 0;
            var halfExtentsX = (this.max.x - this.min.x) / 2;
            var halfExtentsY = (this.max.y - this.min.y) / 2;
            var halfExtentsZ = (this.max.z - this.min.z) / 2;
            var centerX = this.min.x + halfExtentsX;
            var centerY = this.min.y + halfExtentsY;
            var centerZ = this.min.z + halfExtentsZ;
            var px = position.x - centerX;
            var py = position.y - centerY;
            var pz = position.z - centerZ;
            var vx = direction.x;
            var vy = direction.y;
            var vz = direction.z;
            var ix;
            var iy;
            var iz;
            var rayEntryDistance = Number.MAX_VALUE;
            // 射线与平面相交测试
            var intersects = false;
            if (vx < 0) {
                rayEntryDistance = (halfExtentsX - px) / vx;
                if (rayEntryDistance > 0) {
                    iy = py + rayEntryDistance * vy;
                    iz = pz + rayEntryDistance * vz;
                    if (iy > -halfExtentsY && iy < halfExtentsY && iz > -halfExtentsZ && iz < halfExtentsZ) {
                        if (outTargetNormal) {
                            outTargetNormal.x = 1;
                            outTargetNormal.y = 0;
                            outTargetNormal.z = 0;
                        }
                        intersects = true;
                    }
                }
            }
            if (!intersects && vx > 0) {
                rayEntryDistance = (-halfExtentsX - px) / vx;
                if (rayEntryDistance > 0) {
                    iy = py + rayEntryDistance * vy;
                    iz = pz + rayEntryDistance * vz;
                    if (iy > -halfExtentsY && iy < halfExtentsY && iz > -halfExtentsZ && iz < halfExtentsZ) {
                        if (outTargetNormal) {
                            outTargetNormal.x = -1;
                            outTargetNormal.y = 0;
                            outTargetNormal.z = 0;
                        }
                        intersects = true;
                    }
                }
            }
            if (!intersects && vy < 0) {
                rayEntryDistance = (halfExtentsY - py) / vy;
                if (rayEntryDistance > 0) {
                    ix = px + rayEntryDistance * vx;
                    iz = pz + rayEntryDistance * vz;
                    if (ix > -halfExtentsX && ix < halfExtentsX && iz > -halfExtentsZ && iz < halfExtentsZ) {
                        if (outTargetNormal) {
                            outTargetNormal.x = 0;
                            outTargetNormal.y = 1;
                            outTargetNormal.z = 0;
                        }
                        intersects = true;
                    }
                }
            }
            if (!intersects && vy > 0) {
                rayEntryDistance = (-halfExtentsY - py) / vy;
                if (rayEntryDistance > 0) {
                    ix = px + rayEntryDistance * vx;
                    iz = pz + rayEntryDistance * vz;
                    if (ix > -halfExtentsX && ix < halfExtentsX && iz > -halfExtentsZ && iz < halfExtentsZ) {
                        if (outTargetNormal) {
                            outTargetNormal.x = 0;
                            outTargetNormal.y = -1;
                            outTargetNormal.z = 0;
                        }
                        intersects = true;
                    }
                }
            }
            if (!intersects && vz < 0) {
                rayEntryDistance = (halfExtentsZ - pz) / vz;
                if (rayEntryDistance > 0) {
                    ix = px + rayEntryDistance * vx;
                    iy = py + rayEntryDistance * vy;
                    if (iy > -halfExtentsY && iy < halfExtentsY && ix > -halfExtentsX && ix < halfExtentsX) {
                        if (outTargetNormal) {
                            outTargetNormal.x = 0;
                            outTargetNormal.y = 0;
                            outTargetNormal.z = 1;
                        }
                        intersects = true;
                    }
                }
            }
            if (!intersects && vz > 0) {
                rayEntryDistance = (-halfExtentsZ - pz) / vz;
                if (rayEntryDistance > 0) {
                    ix = px + rayEntryDistance * vx;
                    iy = py + rayEntryDistance * vy;
                    if (iy > -halfExtentsY && iy < halfExtentsY && ix > -halfExtentsX && ix < halfExtentsX) {
                        if (outTargetNormal) {
                            outTargetNormal.x = 0;
                            outTargetNormal.y = 0;
                            outTargetNormal.z = -1;
                        }
                        intersects = true;
                    }
                }
            }
            return intersects ? rayEntryDistance : Number.MAX_VALUE;
        };
        /**
         * 获取包围盒上距离指定点最近的点
         *
         * @param point 指定点
         * @param target 存储最近的点
         */
        Box3.prototype.closestPointToPoint = function (point, target) {
            if (target === void 0) { target = new feng3d.Vector3(); }
            return this.clampPoint(point, target);
        };
        /**
         * 清空包围盒
         */
        Box3.prototype.empty = function () {
            this.min.x = this.min.y = this.min.z = +Infinity;
            this.max.x = this.max.y = this.max.z = -Infinity;
            return this;
        };
        /**
         * 是否为空
         * 当体积为0时为空
         */
        Box3.prototype.isEmpty = function () {
            return (this.max.x < this.min.x) || (this.max.y < this.min.y) || (this.max.z < this.min.z);
        };
        /**
         * 偏移
         * @param dx x轴偏移
         * @param dy y轴偏移
         * @param dz z轴偏移
         */
        Box3.prototype.offset = function (dx, dy, dz) {
            return this.offsetPosition(new feng3d.Vector3(dx, dy, dz));
        };
        /**
         * 偏移
         * @param position 偏移量
         */
        Box3.prototype.offsetPosition = function (position) {
            this.min.add(position);
            this.max.add(position);
            return this;
        };
        Box3.prototype.toString = function () {
            return "[AABB] (min=" + this.min.toString() + ", max=" + this.max.toString() + ")";
        };
        /**
         * 联合包围盒
         * @param aabb 包围盒
         */
        Box3.prototype.union = function (aabb) {
            this.min.min(aabb.min);
            this.max.max(aabb.max);
            return this;
        };
        /**
         * 是否与球相交
         * @param sphere 球
         */
        Box3.prototype.intersectsSphere = function (sphere) {
            var closestPoint = new feng3d.Vector3();
            this.clampPoint(sphere.center, closestPoint);
            return closestPoint.distanceSquared(sphere.center) <= (sphere.radius * sphere.radius);
        };
        /**
         * 夹紧？
         *
         * @param point 点
         * @param out 输出点
         */
        Box3.prototype.clampPoint = function (point, out) {
            if (out === void 0) { out = new feng3d.Vector3(); }
            return out.copy(point).clamp(this.min, this.max);
        };
        /**
         * 是否与平面相交
         * @param plane 平面
         */
        Box3.prototype.intersectsPlane = function (plane) {
            var min = Infinity;
            var max = -Infinity;
            this.toPoints().forEach(function (p) {
                var d = plane.distanceWithPoint(p);
                min = d < min ? d : min;
                max = d > min ? d : min;
            });
            return min < 0 && max > 0;
        };
        /**
         * 是否与三角形相交
         * @param triangle 三角形
         */
        Box3.prototype.intersectsTriangle = function (triangle) {
            if (this.isEmpty()) {
                return false;
            }
            // 计算包围盒中心和区段
            var center = this.getCenter();
            var extents = this.max.subTo(center);
            // 把三角形顶点转换包围盒空间
            var v0 = triangle.p0.subTo(center);
            var v1 = triangle.p1.subTo(center);
            var v2 = triangle.p2.subTo(center);
            // 计算三边向量
            var f0 = v1.subTo(v0);
            var f1 = v2.subTo(v1);
            var f2 = v0.subTo(v2);
            // 测试三边向量分别所在三个轴面上的法线
            var axes = [
                0, -f0.z, f0.y, 0, -f1.z, f1.y, 0, -f2.z, f2.y,
                f0.z, 0, -f0.x, f1.z, 0, -f1.x, f2.z, 0, -f2.x,
                -f0.y, f0.x, 0, -f1.y, f1.x, 0, -f2.y, f2.x, 0
            ];
            if (!satForAxes(axes, v0, v1, v2, extents)) {
                return false;
            }
            // 测试三个面法线
            axes = [1, 0, 0, 0, 1, 0, 0, 0, 1];
            if (!satForAxes(axes, v0, v1, v2, extents)) {
                return false;
            }
            // 检测三角形面法线
            var triangleNormal = f0.crossTo(f1);
            axes = [triangleNormal.x, triangleNormal.y, triangleNormal.z];
            return satForAxes(axes, v0, v1, v2, extents);
        };
        /**
        * 是否与指定长方体相交
        *
        * @param box3 长方体
        */
        Box3.prototype.overlaps = function (box3) {
            var l1 = this.min, u1 = this.max, l2 = box3.min, u2 = box3.max;
            //      l2        u2
            //      |---------|
            // |--------|
            // l1       u1
            var overlapsX = ((l2.x <= u1.x && u1.x <= u2.x) || (l1.x <= u2.x && u2.x <= u1.x));
            var overlapsY = ((l2.y <= u1.y && u1.y <= u2.y) || (l1.y <= u2.y && u2.y <= u1.y));
            var overlapsZ = ((l2.z <= u1.z && u1.z <= u2.z) || (l1.z <= u2.z && u2.z <= u1.z));
            return overlapsX && overlapsY && overlapsZ;
        };
        /**
         * 转换为三角形列表
         */
        Box3.prototype.toTriangles = function (triangles) {
            if (triangles === void 0) { triangles = []; }
            var min = this.min;
            var max = this.max;
            triangles.push(
            // 前
            feng3d.Triangle3.fromPoints(new feng3d.Vector3(min.x, min.y, min.z), new feng3d.Vector3(min.x, max.y, min.z), new feng3d.Vector3(max.x, max.y, min.z)), feng3d.Triangle3.fromPoints(new feng3d.Vector3(min.x, min.y, min.z), new feng3d.Vector3(max.x, max.y, min.z), new feng3d.Vector3(max.x, min.y, min.z)), 
            // 后
            feng3d.Triangle3.fromPoints(new feng3d.Vector3(min.x, min.y, max.z), new feng3d.Vector3(max.x, min.y, max.z), new feng3d.Vector3(min.x, max.y, max.z)), feng3d.Triangle3.fromPoints(new feng3d.Vector3(max.x, min.y, max.z), new feng3d.Vector3(max.x, max.y, max.z), new feng3d.Vector3(min.x, max.y, max.z)), 
            // 右
            feng3d.Triangle3.fromPoints(new feng3d.Vector3(max.x, min.y, min.z), new feng3d.Vector3(max.x, max.y, min.z), new feng3d.Vector3(max.x, max.y, max.z)), feng3d.Triangle3.fromPoints(new feng3d.Vector3(max.x, min.y, min.z), new feng3d.Vector3(max.x, max.y, max.z), new feng3d.Vector3(max.x, min.y, max.z)), 
            // 左
            feng3d.Triangle3.fromPoints(new feng3d.Vector3(min.x, min.y, max.z), new feng3d.Vector3(min.x, max.y, min.z), new feng3d.Vector3(min.x, min.y, min.z)), feng3d.Triangle3.fromPoints(new feng3d.Vector3(min.x, min.y, max.z), new feng3d.Vector3(min.x, max.y, max.z), new feng3d.Vector3(min.x, max.y, min.z)), 
            // 上
            feng3d.Triangle3.fromPoints(new feng3d.Vector3(min.x, max.y, min.z), new feng3d.Vector3(max.x, max.y, max.z), new feng3d.Vector3(max.x, max.y, min.z)), feng3d.Triangle3.fromPoints(new feng3d.Vector3(min.x, max.y, min.z), new feng3d.Vector3(min.x, max.y, max.z), new feng3d.Vector3(max.x, max.y, max.z)), 
            // 下
            feng3d.Triangle3.fromPoints(new feng3d.Vector3(min.x, min.y, min.z), new feng3d.Vector3(max.x, min.y, min.z), new feng3d.Vector3(min.x, min.y, max.z)), feng3d.Triangle3.fromPoints(new feng3d.Vector3(max.x, min.y, min.z), new feng3d.Vector3(max.x, min.y, max.z), new feng3d.Vector3(min.x, min.y, max.z)));
            return triangles;
        };
        return Box3;
    }());
    feng3d.Box3 = Box3;
    /**
     * 判断三角形三个点是否可能与包围盒在指定轴（列表）上投影相交
     *
     * @param axes
     * @param v0
     * @param v1
     * @param v2
     * @param extents
     */
    function satForAxes(axes, v0, v1, v2, extents) {
        for (var i = 0, j = axes.length - 3; i <= j; i += 3) {
            var testAxis = feng3d.Vector3.fromArray(axes, i);
            // 投影包围盒到指定轴的长度
            var r = extents.x * Math.abs(testAxis.x) + extents.y * Math.abs(testAxis.y) + extents.z * Math.abs(testAxis.z);
            // 投影三角形的三个点到指定轴
            var p0 = v0.dot(testAxis);
            var p1 = v1.dot(testAxis);
            var p2 = v2.dot(testAxis);
            // 三个点在包围盒投影外同侧
            if (Math.min(p0, p1, p2) > r || Math.max(p0, p1, p2) < -r) {
                return false;
            }
        }
        return true;
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 球
     */
    var Sphere = /** @class */ (function () {
        /**
         * Create a Sphere with ABCD coefficients
         */
        function Sphere(center, radius) {
            if (center === void 0) { center = new feng3d.Vector3(); }
            if (radius === void 0) { radius = 0; }
            this.center = center;
            this.radius = radius;
        }
        /**
         * 从一组点初始化球
         * @param points 点列表
         */
        Sphere.fromPoints = function (points) {
            return new Sphere().fromPoints(points);
        };
        /**
         * 从一组顶点初始化球
         * @param positions 坐标数据列表
         */
        Sphere.fromPositions = function (positions) {
            return new Sphere().fromPositions(positions);
        };
        /**
         * 与射线相交
         * @param position 射线起点
         * @param direction 射线方向
         * @param targetNormal 目标法线
         * @return 射线起点到交点的距离
         */
        Sphere.prototype.rayIntersection = function (position, direction, targetNormal) {
            if (this.containsPoint(position))
                return 0;
            var px = position.x - this.center.x, py = position.y - this.center.y, pz = position.z - this.center.z;
            var vx = direction.x, vy = direction.y, vz = direction.z;
            var rayEntryDistance;
            var a = vx * vx + vy * vy + vz * vz;
            var b = 2 * (px * vx + py * vy + pz * vz);
            var c = px * px + py * py + pz * pz - this.radius * this.radius;
            var det = b * b - 4 * a * c;
            if (det >= 0) { // ray goes through sphere
                var sqrtDet = Math.sqrt(det);
                rayEntryDistance = (-b - sqrtDet) / (2 * a);
                if (rayEntryDistance >= 0) {
                    targetNormal.x = px + rayEntryDistance * vx;
                    targetNormal.y = py + rayEntryDistance * vy;
                    targetNormal.z = pz + rayEntryDistance * vz;
                    targetNormal.normalize();
                    return rayEntryDistance;
                }
            }
            // ray misses sphere
            return -1;
        };
        /**
         * 是否包含指定点
         * @param position 点
         */
        Sphere.prototype.containsPoint = function (position) {
            return position.subTo(this.center).lengthSquared <= this.radius * this.radius;
        };
        /**
         * 从一组点初始化球
         * @param points 点列表
         */
        Sphere.prototype.fromPoints = function (points) {
            var box = new feng3d.Box3();
            var center = this.center;
            box.fromPoints(points).getCenter(center);
            var maxRadiusSq = 0;
            for (var i = 0, n = points.length; i < n; i++) {
                maxRadiusSq = Math.max(maxRadiusSq, center.distanceSquared(points[i]));
            }
            this.radius = Math.sqrt(maxRadiusSq);
            return this;
        };
        /**
         * 从一组顶点初始化球
         * @param positions 坐标数据列表
         */
        Sphere.prototype.fromPositions = function (positions) {
            var box = new feng3d.Box3();
            var v = new feng3d.Vector3();
            var center = this.center;
            box.formPositions(positions).getCenter(center);
            var maxRadiusSq = 0;
            for (var i = 0, n = positions.length; i < n; i += 3) {
                maxRadiusSq = Math.max(maxRadiusSq, center.distanceSquared(v.set(positions[i], positions[i + 1], positions[i + 2])));
            }
            this.radius = Math.sqrt(maxRadiusSq);
            return this;
        };
        /**
         * 拷贝
         */
        Sphere.prototype.copy = function (sphere) {
            this.center.copy(sphere.center);
            this.radius = sphere.radius;
            return this;
        };
        /**
         * 克隆
         */
        Sphere.prototype.clone = function () {
            return new Sphere().copy(this);
        };
        /**
         * 是否为空
         */
        Sphere.prototype.isEmpty = function () {
            return this.radius <= 0;
        };
        /**
         * 点到球的距离
         * @param point 点
         */
        Sphere.prototype.distanceToPoint = function (point) {
            return point.distance(this.center) - this.radius;
        };
        /**
         * 与指定球是否相交
         */
        Sphere.prototype.intersectsSphere = function (sphere) {
            var radiusSum = this.radius + sphere.radius;
            return sphere.center.distanceSquared(this.center) <= radiusSum * radiusSum;
        };
        /**
         * 是否与盒子相交
         * @param box 盒子
         */
        Sphere.prototype.intersectsBox = function (box) {
            return box.intersectsSphere(this);
        };
        /**
         * 是否与平面相交
         * @param plane 平面
         */
        Sphere.prototype.intersectsPlane = function (plane) {
            return Math.abs(plane.distanceWithPoint(this.center)) <= this.radius;
        };
        /**
         *
         * @param point 点
         * @param pout 输出点
         */
        Sphere.prototype.clampPoint = function (point, pout) {
            if (pout === void 0) { pout = new feng3d.Vector3(); }
            var deltaLengthSq = this.center.distanceSquared(point);
            pout.copy(point);
            if (deltaLengthSq > (this.radius * this.radius)) {
                pout.sub(this.center).normalize();
                pout.scaleNumber(this.radius).add(this.center);
            }
            return pout;
        };
        /**
         * 获取包围盒
         */
        Sphere.prototype.getBoundingBox = function (box) {
            if (box === void 0) { box = new feng3d.Box3(); }
            box.init(this.center.subNumberTo(this.radius), this.center.addNumberTo(this.radius));
            return box;
        };
        /**
         * 应用矩阵
         * @param matrix 矩阵
         */
        Sphere.prototype.applyMatrix4 = function (matrix) {
            this.center.applyMatrix4x4(matrix);
            this.radius = this.radius * matrix.getMaxScaleOnAxis();
            return this;
        };
        /**
         * 平移
         * @param offset 偏移量
         */
        Sphere.prototype.translate = function (offset) {
            this.center.add(offset);
            return this;
        };
        /**
         * 是否相等
         * @param sphere 球
         */
        Sphere.prototype.equals = function (sphere) {
            return sphere.center.equals(this.center) && (sphere.radius === this.radius);
        };
        Sphere.prototype.toString = function () {
            return "Sphere [center:" + this.center.toString() + ", radius:" + this.radius + "]";
        };
        return Sphere;
    }());
    feng3d.Sphere = Sphere;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 平面
     *
     * ax+by+cz+d=0
     */
    var Plane = /** @class */ (function () {
        /**
         * 创建一个平面
         * @param a		A系数
         * @param b		B系数
         * @param c		C系数
         * @param d		D系数
         */
        function Plane(a, b, c, d) {
            if (a === void 0) { a = 0; }
            if (b === void 0) { b = 1; }
            if (c === void 0) { c = 0; }
            if (d === void 0) { d = 0; }
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
        }
        /**
         * 通过3顶点定义一个平面
         * @param p0		点0
         * @param p1		点1
         * @param p2		点2
         */
        Plane.fromPoints = function (p0, p1, p2) {
            return new Plane().fromPoints(p0, p1, p2);
        };
        /**
         * 根据法线与点定义平面
         * @param normal		平面法线
         * @param point			平面上任意一点
         */
        Plane.fromNormalAndPoint = function (normal, point) {
            return new Plane().fromNormalAndPoint(normal, point);
        };
        /**
         * 随机平面
         */
        Plane.random = function () {
            var normal = feng3d.Vector3.random().normalize();
            return new Plane(normal.x, normal.y, normal.z, Math.random());
        };
        /**
         * 设置
         *
         * @param a		A系数
         * @param b		B系数
         * @param c		C系数
         * @param d		D系数
         */
        Plane.prototype.set = function (a, b, c, d) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            return this;
        };
        /**
         * 原点在平面上的投影
         * @param vout 输出点
         */
        Plane.prototype.getOrigin = function (vout) {
            if (vout === void 0) { vout = new feng3d.Vector3(); }
            return this.projectPoint(new feng3d.Vector3(), vout);
        };
        /**
         * 平面上随机点
         * @param vout 输出点
         */
        Plane.prototype.randomPoint = function (vout) {
            if (vout === void 0) { vout = new feng3d.Vector3(); }
            return this.getOrigin(vout).add(this.getNormal().cross(feng3d.Vector3.random()));
        };
        /**
         * 法线
         */
        Plane.prototype.getNormal = function (vout) {
            if (vout === void 0) { vout = new feng3d.Vector3(); }
            return vout.set(this.a, this.b, this.c);
        };
        /**
         * 通过3顶点定义一个平面
         * @param p0		点0
         * @param p1		点1
         * @param p2		点2
         */
        Plane.prototype.fromPoints = function (p0, p1, p2) {
            // p1.subTo(p0, v0);
            // p2.subTo(p1, v1);
            // var normal = v0.crossTo(v1).normalize();
            var normal = p1.subTo(p0).crossTo(p2.subTo(p1)).normalize();
            this.a = normal.x;
            this.b = normal.y;
            this.c = normal.z;
            this.d = -normal.dot(p0);
            return this;
        };
        /**
         * 根据法线与点定义平面
         * @param normal		平面法线
         * @param point			平面上任意一点
         */
        Plane.prototype.fromNormalAndPoint = function (normal, point) {
            normal = normal.clone().normalize();
            this.a = normal.x;
            this.b = normal.y;
            this.c = normal.z;
            this.d = -normal.dot(point);
            return this;
        };
        /**
         * 计算点与平面的距离
         * @param p		点
         * @returns		距离
         */
        Plane.prototype.distanceWithPoint = function (p) {
            return this.a * p.x + this.b * p.y + this.c * p.z + this.d;
        };
        /**
         * 点是否在平面上
         * @param p 点
         */
        Plane.prototype.onWithPoint = function (p, precision) {
            if (precision === void 0) { precision = Math.PRECISION; }
            return Math.equals(this.distanceWithPoint(p), 0, precision);
        };
        /**
         * 顶点分类
         * <p>把顶点分为后面、前面、相交三类</p>
         * @param p			顶点
         * @return			顶点类型 PlaneClassification.BACK,PlaneClassification.FRONT,PlaneClassification.INTERSECT
         */
        Plane.prototype.classifyPoint = function (p, precision) {
            if (precision === void 0) { precision = Math.PRECISION; }
            var len = this.distanceWithPoint(p);
            if (Math.equals(len, 0, precision))
                return feng3d.PlaneClassification.INTERSECT;
            if (len < 0)
                return feng3d.PlaneClassification.BACK;
            return feng3d.PlaneClassification.FRONT;
        };
        /**
         * 判定与直线是否平行
         * @param line3D
         */
        Plane.prototype.parallelWithLine3D = function (line3D, precision) {
            if (precision === void 0) { precision = Math.PRECISION; }
            if (Math.equals(line3D.direction.dot(this.getNormal()), 0, precision))
                return true;
            return false;
        };
        /**
         * 判定与平面是否平行
         * @param plane3D
         */
        Plane.prototype.parallelWithPlane3D = function (plane3D, precision) {
            if (precision === void 0) { precision = Math.PRECISION; }
            if (plane3D.getNormal().isParallel(this.getNormal(), precision))
                return true;
            return false;
        };
        /**
         * 获取与直线交点
         *
         * @see 3D数学基础：图形与游戏开发 P269
         */
        Plane.prototype.intersectWithLine3 = function (line) {
            var n = this.getNormal();
            var d = line.direction;
            var dn = d.dot(n);
            if (Math.equals(dn, 0)) {
                // 处理直线在平面内
                if (this.onWithPoint(line.origin))
                    return line.clone();
                return null;
            }
            var t = (-this.d - line.origin.dot(n)) / dn;
            var cp = line.getPoint(t);
            return cp;
        };
        /**
         * 获取与平面相交直线
         * @param plane3D
         */
        Plane.prototype.intersectWithPlane3D = function (plane3D) {
            if (this.parallelWithPlane3D(plane3D))
                return null;
            var direction = this.getNormal().crossTo(plane3D.getNormal());
            var a0 = this.a, b0 = this.b, c0 = this.c, d0 = this.d, a1 = plane3D.a, b1 = plane3D.b, c1 = plane3D.c, d1 = plane3D.d;
            var x, y, z;
            // 解 方程组 a0*x+b0*y+c0*z+d0=0;a1*x+b1*y+c1*z+d1=0;
            if (b1 * c0 - b0 * c1 != 0) {
                x = 0;
                y = (-c0 * d1 + c1 * d0 + (a0 * c1 - a1 * c0) * x) / (b1 * c0 - b0 * c1);
                z = (-b1 * d0 + b0 * d1 + (a1 * b0 - a0 * b1) * x) / (b1 * c0 - b0 * c1);
            }
            else if (a0 * c1 - a1 * c0 != 0) {
                y = 0;
                x = (-c1 * d0 + c0 * d1 + (b1 * c0 - b0 * c1) * y) / (a0 * c1 - a1 * c0);
                z = (-a0 * d1 + a1 * d0 + (a1 * b0 - a0 * b1) * y) / (a0 * c1 - a1 * c0);
            }
            else if (a1 * b0 - a0 * b1 != 0) {
                z = 0;
                x = (-b0 * d1 + b1 * d0 + (b1 * c0 - b0 * c1) * z) / (a1 * b0 - a0 * b1);
                y = (-a1 * d0 + a0 * d1 + (a0 * c1 - a1 * c0) * z) / (a1 * b0 - a0 * b1);
            }
            else {
                throw "无法计算平面相交结果";
            }
            return new feng3d.Line3(new feng3d.Vector3(x, y, z), direction);
        };
        /**
         * 标准化
         */
        Plane.prototype.normalize = function () {
            var a = this.a, b = this.b, c = this.c, d = this.d;
            var s = a * a + b * b + c * c;
            if (s > 0) {
                var invLen = 1 / Math.sqrt(s);
                this.a = a * invLen;
                this.b = b * invLen;
                this.c = c * invLen;
                this.d = d * invLen;
            }
            else {
                console.warn("\u65E0\u6548\u5E73\u9762 " + this);
            }
            return this;
        };
        /**
         * 翻转平面
         */
        Plane.prototype.negate = function () {
            this.a = -this.a;
            this.b = -this.b;
            this.c = -this.c;
            this.d = -this.d;
            return this;
        };
        /**
         * 点到平面的投影
         * @param point
         */
        Plane.prototype.projectPoint = function (point, vout) {
            if (vout === void 0) { vout = new feng3d.Vector3(); }
            return this.getNormal(vout).scaleNumber(-this.distanceWithPoint(point)).add(point);
        };
        /**
         * 与指定点最近的点
         * @param point 点
         * @param vout 输出点
         */
        Plane.prototype.closestPointWithPoint = function (point, vout) {
            if (vout === void 0) { vout = new feng3d.Vector3(); }
            return this.projectPoint(point, vout);
        };
        /**
         * 与其他两平面相交于一点
         *
         * @param plane0
         * @param plane1
         *
         * @see 3D数学基础：图形与游戏开发 P271
         */
        Plane.prototype.intersectWithTwoPlane3D = function (plane0, plane1) {
            var n1 = plane0.getNormal();
            var n2 = plane1.getNormal();
            var n3 = this.getNormal();
            var d1 = -plane0.d;
            var d2 = -plane1.d;
            var d3 = -this.d;
            var n1xn2 = n1.crossTo(n2);
            var n2xn3 = n2.crossTo(n3);
            var n3xn1 = n3.crossTo(n1);
            var m = n1xn2.dot(n3);
            if (Math.equals(m, 0)) {
                // 不存在交点或者不存在唯一的交点
                return null;
            }
            m = 1 / m;
            var p = n2xn3.scaleNumberTo(d1).add(n3xn1.scaleNumber(d2)).add(n1xn2.scaleNumber(d3)).scaleNumber(m);
            return p;
        };
        /**
         * 与指定平面是否相等
         *
         * @param plane
         * @param precision
         */
        Plane.prototype.equals = function (plane, precision) {
            if (precision === void 0) { precision = Math.PRECISION; }
            if (!Math.equals(this.a - plane.a, 0, precision))
                return false;
            if (!Math.equals(this.b - plane.b, 0, precision))
                return false;
            if (!Math.equals(this.c - plane.c, 0, precision))
                return false;
            if (!Math.equals(this.d - plane.d, 0, precision))
                return false;
            return true;
        };
        /**
         * 复制
         */
        Plane.prototype.copy = function (plane) {
            this.a = plane.a;
            this.b = plane.b;
            this.c = plane.c;
            this.d = plane.d;
            return this;
        };
        /**
         * 克隆
         */
        Plane.prototype.clone = function () {
            return new Plane().copy(this);
        };
        /**
         * 输出字符串
         */
        Plane.prototype.toString = function () {
            return "Plane3D [this.a:" + this.a + ", this.b:" + this.b + ", this.c:" + this.c + ", this.d:" + this.d + "]";
        };
        return Plane;
    }());
    feng3d.Plane = Plane;
    // var v0 = new Vector3();
    // var v1 = new Vector3();
    // var v2 = new Vector3();
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 截头锥体
     *
     * Frustums are used to determine what is inside the camera's field of view. They help speed up the rendering process.
     *
     * Frustums用于确定摄像机的视场范围。它们有助于加速渲染过程。
     *
     * @author mrdoob / http://mrdoob.com/
     * @author alteredq / http://alteredqualia.com/
     * @author bhouston / http://clara.io
     */
    var Frustum = /** @class */ (function () {
        /**
         * 初始化截头锥体
         *
         * @param p0
         * @param p1
         * @param p2
         * @param p3
         * @param p4
         * @param p5
         */
        function Frustum(p0, p1, p2, p3, p4, p5) {
            if (p0 === void 0) { p0 = new feng3d.Plane(); }
            if (p1 === void 0) { p1 = new feng3d.Plane(); }
            if (p2 === void 0) { p2 = new feng3d.Plane(); }
            if (p3 === void 0) { p3 = new feng3d.Plane(); }
            if (p4 === void 0) { p4 = new feng3d.Plane(); }
            if (p5 === void 0) { p5 = new feng3d.Plane(); }
            this.planes = [
                p0, p1, p2, p3, p4, p5
            ];
        }
        Frustum.prototype.set = function (p0, p1, p2, p3, p4, p5) {
            var planes = this.planes;
            planes[0].copy(p0);
            planes[1].copy(p1);
            planes[2].copy(p2);
            planes[3].copy(p3);
            planes[4].copy(p4);
            planes[5].copy(p5);
            return this;
        };
        Frustum.prototype.clone = function () {
            return new Frustum().copy(this);
        };
        Frustum.prototype.copy = function (frustum) {
            var planes = this.planes;
            for (var i = 0; i < 6; i++) {
                planes[i].copy(frustum.planes[i]);
            }
            return this;
        };
        /**
         * 从矩阵初始化
         *
         * @param matrix4x4 矩阵
         */
        Frustum.prototype.fromMatrix = function (matrix4x4) {
            var planes = this.planes;
            var me = matrix4x4.elements;
            var me0 = me[0], me1 = me[1], me2 = me[2], me3 = me[3];
            var me4 = me[4], me5 = me[5], me6 = me[6], me7 = me[7];
            var me8 = me[8], me9 = me[9], me10 = me[10], me11 = me[11];
            var me12 = me[12], me13 = me[13], me14 = me[14], me15 = me[15];
            planes[0].set(me3 - me0, me7 - me4, me11 - me8, me15 - me12).normalize();
            planes[1].set(me3 + me0, me7 + me4, me11 + me8, me15 + me12).normalize();
            planes[2].set(me3 + me1, me7 + me5, me11 + me9, me15 + me13).normalize();
            planes[3].set(me3 - me1, me7 - me5, me11 - me9, me15 - me13).normalize();
            planes[4].set(me3 - me2, me7 - me6, me11 - me10, me15 - me14).normalize();
            planes[5].set(me3 + me2, me7 + me6, me11 + me10, me15 + me14).normalize();
            return this;
        };
        /**
         * 是否与球体相交
         *
         * @param sphere 球体
         */
        Frustum.prototype.intersectsSphere = function (sphere) {
            var planes = this.planes;
            var center = sphere.center;
            var negRadius = -sphere.radius;
            for (var i = 0; i < 6; i++) {
                var distance = planes[i].distanceWithPoint(center);
                if (distance < negRadius) {
                    return false;
                }
            }
            return true;
        };
        /**
         * 是否与长方体相交
         *
         * @param box 长方体
         */
        Frustum.prototype.intersectsBox = function (box) {
            var planes = this.planes;
            var temp = new feng3d.Vector3();
            for (var i = 0; i < 6; i++) {
                var plane = planes[i];
                // corner at max distance
                var normal = plane.getNormal();
                temp.x = normal.x > 0 ? box.max.x : box.min.x;
                temp.y = normal.y > 0 ? box.max.y : box.min.y;
                temp.z = normal.z > 0 ? box.max.z : box.min.z;
                if (plane.distanceWithPoint(temp) < 0) {
                    return false;
                }
            }
            return true;
        };
        /**
         * 与点是否相交
         *
         * @param point
         */
        Frustum.prototype.containsPoint = function (point, precision) {
            if (precision === void 0) { precision = Math.PRECISION; }
            var planes = this.planes;
            for (var i = 0; i < 6; i++) {
                if (planes[i].distanceWithPoint(point) < -precision) {
                    return false;
                }
            }
            return true;
        };
        return Frustum;
    }());
    feng3d.Frustum = Frustum;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 由三角形构成的几何体
     * ### 限定：
     *  * 只包含三角形，不存在四边形等其他多边形
     *  *
     */
    var TriangleGeometry = /** @class */ (function () {
        function TriangleGeometry(triangles) {
            if (triangles === void 0) { triangles = []; }
            this.triangles = triangles;
        }
        /**
         * 从盒子初始化
         * @param box 盒子
         */
        TriangleGeometry.fromBox = function (box) {
            return new TriangleGeometry().fromBox(box);
        };
        /**
         * 从盒子初始化
         * @param box 盒子
         */
        TriangleGeometry.prototype.fromBox = function (box) {
            this.triangles.length = 0;
            box.toTriangles(this.triangles);
            return this;
        };
        /**
         * 获取所有顶点，去除重复顶点
         */
        TriangleGeometry.prototype.getPoints = function () {
            var ps = this.triangles.reduce(function (v, t) { return v.concat(t.getPoints()); }, []);
            Array.unique(ps, function (a, b) { return a.equals(b); });
            return ps;
        };
        /**
         * 是否闭合
         * 方案：获取所有三角形的线段，当每条线段（a,b）都存在且仅有一条与之相对于的线段（b，a）时几何体闭合
         */
        TriangleGeometry.prototype.isClosed = function () {
            // 获取所有线段
            var ss = this.triangles.reduce(function (ss, t) { return ss.concat(t.getSegments()); }, []);
            // 当每条线段（a,b）都存在与之相对于的线段（b，a）时几何体闭合
            var r = ss.every(function (s) { return ss.filter(function (s0) { return s.p0.equals(s0.p1) && s.p1.equals(s0.p0); }).length == 1; });
            return r;
        };
        /**
         * 包围盒
         */
        TriangleGeometry.prototype.getBox = function (box) {
            if (box === void 0) { box = new feng3d.Box3(); }
            return box.fromPoints(this.getPoints());
        };
        /**
         * 与指定点最近的点
         * @param point 点
         * @param vout 输出点
         */
        TriangleGeometry.prototype.closestPointWithPoint = function (point, vout) {
            if (vout === void 0) { vout = new feng3d.Vector3(); }
            // 计算指定点到所有平面的距离，并按距离排序
            var r = this.triangles.map(function (t) { var p = t.closestPointWithPoint(point); return { p: p, d: point.distanceSquared(p) }; }).sort(function (a, b) { return a.d - b.d; });
            return vout.copy(r[0].p);
        };
        /**
         * 给指定点分类
         * @param p 点
         * @return 点相对于几何体位置；0:在几何体表面上，1：在几何体外，-1：在几何体内
         * 方案：当指定点不在几何体上时，在几何体上找到距离指定点最近点，最近点到给定点形成的向量与最近点所在面（当最近点在多个面上时取点乘摸最大的面）法线点乘大于0时给定点在几何体内，否则在几何体外。
         */
        TriangleGeometry.prototype.classifyPoint = function (p) {
            if (!this.isClosed())
                return 1;
            // 是否在表面
            var onface = this.triangles.reduce(function (v, t) {
                return v || t.onWithPoint(p);
            }, false);
            if (onface)
                return 0;
            // 最近点
            var cp = this.closestPointWithPoint(p);
            // 到最近点的向量
            var cpv = cp.subTo(p);
            // 最近点所在平面
            var cts = this.triangles.filter(function (t) { return t.onWithPoint(cp); });
            // 最近点向量与所在平面方向相同则点在几何体内
            var v = cts.map(function (t) { return t.getNormal().dot(cpv); }).sort(function (a, b) { return Math.abs(b) - Math.abs(a); })[0];
            if (v > 0)
                return -1;
            return 1;
        };
        /**
         * 是否包含指定点
         * @param p 点
         */
        TriangleGeometry.prototype.containsPoint = function (p) {
            return this.classifyPoint(p) <= 0;
        };
        /**
         * 给指定线段分类
         * @param segment 线段
         * @return 线段相对于几何体位置；0:在几何体表面上，1：在几何体外，-1：在几何体内，2：横跨几何体
         */
        TriangleGeometry.prototype.classifySegment = function (segment) {
            var _this = this;
            // 线段与几何体不相交时
            var r = this.intersectionWithSegment(segment);
            if (!r) {
                if (this.classifyPoint(segment.p0) > 0)
                    return 1;
                return -1;
            }
            // 相交多条线段时 横跨
            if (r.segments.length > 1)
                return 2;
            if (r.segments.length == 1) {
                // 相交线段相对 几何体的位置
                var pc = [r.segments[0].p0, r.segments[0].p1].map(function (p) { return _this.classifyPoint(p); });
                if (pc[0] * pc[1] < 0)
                    return 2;
                if (pc[0] + pc[1] == 0)
                    return 0;
                if (pc[0] + pc[1] < 0)
                    return -1;
                return 1;
            }
            // 相交于点
            if (r.points.length) {
            }
        };
        /**
         * 给指定三角形分类
         * @param triangle 三角形
         * @return 三角形相对于几何体位置；0:在几何体表面上，1：在几何体外，-1：在几何体内
         */
        TriangleGeometry.prototype.classifyTriangle = function (triangle) {
        };
        /**
         * 与直线碰撞
         * @param line3d 直线
         */
        TriangleGeometry.prototype.intersectionWithLine = function (line3d) {
            // 线段与三角形碰撞
            var ss = [];
            var ps = [];
            this.triangles.forEach(function (t) {
                var r = t.intersectionWithLine(line3d);
                if (!r)
                    return;
                if (r instanceof feng3d.Segment3) {
                    ss.push(r);
                    return;
                }
                ps.push(r);
            });
            // 清除相同的线段
            Array.unique(ss, function (a, b) { return a.equals(b); });
            // 删除在相交线段上的交点
            ps = ps.filter(function (p) { return ss.every(function (s) { return !s.onWithPoint(p); }); });
            // 清除相同点
            Array.unique(ps, function (a, b) { return a.equals(b); });
            if (ss.length + ps.length == 0)
                return null;
            return { segments: ss, points: ps };
        };
        /**
         * 与线段相交
         * @param segment 线段
         * @return 不相交时返回null，相交时返回 碰撞线段列表与碰撞点列表
         */
        TriangleGeometry.prototype.intersectionWithSegment = function (segment) {
            var line = segment.getLine();
            var r = this.intersectionWithLine(line);
            if (!r)
                return null;
            var ps = r.points = r.points.filter(function (p) { return segment.onWithPoint(p); });
            r.segments = r.segments.reduce(function (v, s) {
                var p0 = segment.clampPoint(s.p0);
                var p1 = segment.clampPoint(s.p1);
                if (!s.onWithPoint(p0))
                    return v;
                if (p0.equals(p1)) {
                    ps.push(p0);
                    return v;
                }
                v.push(feng3d.Segment3.fromPoints(p0, p1));
                return v;
            }, []);
            if (r.segments.length + r.points.length == 0)
                return null;
            return r;
        };
        /**
         * 分解三角形
         * @param triangle 三角形
         */
        TriangleGeometry.prototype.decomposeTriangle = function (triangle) {
        };
        /**
         * 拷贝
         */
        TriangleGeometry.prototype.copy = function (triangleGeometry) {
            this.triangles = triangleGeometry.triangles.map(function (t) { return t.clone(); });
            return this;
        };
        /**
         * 克隆
         */
        TriangleGeometry.prototype.clone = function () {
            return new TriangleGeometry().copy(this);
        };
        return TriangleGeometry;
    }());
    feng3d.TriangleGeometry = TriangleGeometry;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 渐变模式
     */
    var GradientMode;
    (function (GradientMode) {
        /**
         * 混合
         */
        GradientMode[GradientMode["Blend"] = 0] = "Blend";
        /**
         * 阶梯
         */
        GradientMode[GradientMode["Fixed"] = 1] = "Fixed";
    })(GradientMode = feng3d.GradientMode || (feng3d.GradientMode = {}));
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 颜色渐变
     */
    var Gradient = /** @class */ (function () {
        function Gradient() {
            /**
             * 渐变模式
             */
            this.mode = feng3d.GradientMode.Blend;
            /**
             * 在渐变中定义的所有alpha键。
             *
             * 注： 该值已对时间排序，否则赋值前请使用 sort((a, b) => a.time - b.time) 进行排序
             */
            this.alphaKeys = [{ alpha: 1, time: 0 }, { alpha: 1, time: 1 }];
            /**
             * 在渐变中定义的所有color键。
             *
             * 注： 该值已对时间排序，否则赋值前请使用 sort((a, b) => a.time - b.time) 进行排序
             */
            this.colorKeys = [{ color: new feng3d.Color3(1, 1, 1), time: 0 }, { color: new feng3d.Color3(1, 1, 1), time: 1 }];
        }
        /**
         * 从颜色列表初始化
         * @param colors 颜色列表
         * @param times
         */
        Gradient.prototype.fromColors = function (colors, times) {
            if (!times) {
                times = [];
                for (var i = 0; i < colors.length; i++) {
                    times[i] = i / (colors.length - 1);
                }
            }
            var colors1 = colors.map(function (v) { return new feng3d.Color3().fromUnit(v); });
            for (var i = 0; i < colors1.length; i++) {
                this.colorKeys[i] = { color: colors1[i], time: times[i] };
            }
            return this;
        };
        /**
         * 获取值
         * @param time 时间
         */
        Gradient.prototype.getValue = function (time) {
            var alpha = this.getAlpha(time);
            var color = this.getColor(time);
            return new feng3d.Color4(color.r, color.g, color.b, alpha);
        };
        /**
         * 获取透明度
         * @param time 时间
         */
        Gradient.prototype.getAlpha = function (time) {
            var alphaKeys = this.alphaKeys;
            if (alphaKeys.length == 1)
                return alphaKeys[0].alpha;
            if (time <= alphaKeys[0].time)
                return alphaKeys[0].alpha;
            if (time >= alphaKeys[alphaKeys.length - 1].time)
                return alphaKeys[alphaKeys.length - 1].alpha;
            for (var i = 0, n = alphaKeys.length - 1; i < n; i++) {
                var t = alphaKeys[i].time, v = alphaKeys[i].alpha, nt = alphaKeys[i + 1].time, nv = alphaKeys[i + 1].alpha;
                if (time == t)
                    return v;
                if (time == nt)
                    return nv;
                if (t < time && time < nt) {
                    if (this.mode == feng3d.GradientMode.Fixed)
                        return nv;
                    return Math.mapLinear(time, t, nt, v, nv);
                }
            }
            return 1;
        };
        /**
         * 获取透明度
         * @param time 时间
         */
        Gradient.prototype.getColor = function (time) {
            var colorKeys = this.colorKeys;
            if (colorKeys.length == 1)
                return colorKeys[0].color;
            if (time <= colorKeys[0].time)
                return colorKeys[0].color;
            if (time >= colorKeys[colorKeys.length - 1].time)
                return colorKeys[colorKeys.length - 1].color;
            for (var i = 0, n = colorKeys.length - 1; i < n; i++) {
                var t = colorKeys[i].time, v = colorKeys[i].color, nt = colorKeys[i + 1].time, nv = colorKeys[i + 1].color;
                if (time == t)
                    return v;
                if (time == nt)
                    return nv;
                if (t < time && time < nt) {
                    if (this.mode == feng3d.GradientMode.Fixed)
                        return nv;
                    return v.mixTo(nv, (time - t) / (nt - t));
                }
            }
            return new feng3d.Color3();
        };
        __decorate([
            feng3d.serialize
        ], Gradient.prototype, "mode", void 0);
        __decorate([
            feng3d.serialize
        ], Gradient.prototype, "alphaKeys", void 0);
        __decorate([
            feng3d.serialize
        ], Gradient.prototype, "colorKeys", void 0);
        return Gradient;
    }());
    feng3d.Gradient = Gradient;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 最大最小颜色渐变模式
     */
    var MinMaxGradientMode;
    (function (MinMaxGradientMode) {
        /**
         * Use a single color for the MinMaxGradient.
         *
         * 使用单一颜色的。
         */
        MinMaxGradientMode[MinMaxGradientMode["Color"] = 0] = "Color";
        /**
         * Use a single color gradient for the MinMaxGradient.
         *
         * 使用单一颜色渐变。
         */
        MinMaxGradientMode[MinMaxGradientMode["Gradient"] = 1] = "Gradient";
        /**
         * Use a random value between 2 colors for the MinMaxGradient.
         *
         * 在两种颜色之间使用一个随机值。
         */
        MinMaxGradientMode[MinMaxGradientMode["TwoColors"] = 2] = "TwoColors";
        /**
         * Use a random value between 2 color gradients for the MinMaxGradient.
         *
         * 在两个颜色梯度之间使用一个随机值。
         */
        MinMaxGradientMode[MinMaxGradientMode["TwoGradients"] = 3] = "TwoGradients";
        /**
         * Define a list of colors in the MinMaxGradient, to be chosen from at random.
         *
         * 在一个颜色列表中随机选择。
         */
        MinMaxGradientMode[MinMaxGradientMode["RandomColor"] = 4] = "RandomColor";
    })(MinMaxGradientMode = feng3d.MinMaxGradientMode || (feng3d.MinMaxGradientMode = {}));
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 最大最小颜色渐变
     */
    var MinMaxGradient = /** @class */ (function () {
        function MinMaxGradient() {
            /**
             * Set the mode that the min-max gradient will use to evaluate colors.
             *
             * 设置最小-最大梯度将用于评估颜色的模式。
             */
            this.mode = feng3d.MinMaxGradientMode.Color;
            /**
             * Set a constant color.
             *
             * 常量颜色值
             */
            this.color = new feng3d.Color4();
            /**
             * Set a constant color for the lower bound.
             *
             * 为下界设置一个常量颜色。
             */
            this.colorMin = new feng3d.Color4();
            /**
             * Set a constant color for the upper bound.
             *
             * 为上界设置一个常量颜色。
             */
            this.colorMax = new feng3d.Color4();
            /**
             * Set the gradient.
             *
             * 设置渐变。
             */
            this.gradient = new feng3d.Gradient();
            /**
             * Set a gradient for the lower bound.
             *
             * 为下界设置一个渐变。
             */
            this.gradientMin = new feng3d.Gradient();
            /**
             * Set a gradient for the upper bound.
             *
             * 为上界设置一个渐变。
             */
            this.gradientMax = new feng3d.Gradient();
        }
        /**
         * 获取值
         * @param time 时间
         */
        MinMaxGradient.prototype.getValue = function (time, randomBetween) {
            if (randomBetween === void 0) { randomBetween = Math.random(); }
            switch (this.mode) {
                case feng3d.MinMaxGradientMode.Color:
                    return this.color;
                case feng3d.MinMaxGradientMode.Gradient:
                    return this.gradient.getValue(time);
                case feng3d.MinMaxGradientMode.TwoColors:
                    return this.colorMin.mixTo(this.colorMax, randomBetween);
                case feng3d.MinMaxGradientMode.TwoGradients:
                    var min = this.gradientMin.getValue(time);
                    var max = this.gradientMax.getValue(time);
                    var v = min.mixTo(max, randomBetween);
                    return v;
                case feng3d.MinMaxGradientMode.RandomColor:
                    var v = this.gradient.getValue(randomBetween);
                    return v;
            }
            return this.color;
        };
        __decorate([
            feng3d.serialize
        ], MinMaxGradient.prototype, "mode", void 0);
        __decorate([
            feng3d.serialize
        ], MinMaxGradient.prototype, "color", void 0);
        __decorate([
            feng3d.serialize
        ], MinMaxGradient.prototype, "colorMin", void 0);
        __decorate([
            feng3d.serialize
        ], MinMaxGradient.prototype, "colorMax", void 0);
        __decorate([
            feng3d.serialize
        ], MinMaxGradient.prototype, "gradient", void 0);
        __decorate([
            feng3d.serialize
        ], MinMaxGradient.prototype, "gradientMin", void 0);
        __decorate([
            feng3d.serialize
        ], MinMaxGradient.prototype, "gradientMax", void 0);
        return MinMaxGradient;
    }());
    feng3d.MinMaxGradient = MinMaxGradient;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * Bézier曲线
     * @see https://en.wikipedia.org/wiki/B%C3%A9zier_curve
     * @author feng / http://feng3d.com 03/06/2018
     */
    var BezierCurve = /** @class */ (function () {
        function BezierCurve() {
        }
        /**
         * 线性Bézier曲线
         * 给定不同的点P0和P1，线性Bézier曲线就是这两个点之间的直线。曲线由下式给出
         * ```
         * B(t) = p0 + t * (p1 - p0) = (1 - t) * p0 + t * p1 , 0 <= t && t <= 1
         * ```
         * 相当于线性插值
         *
         * @param t 插值度
         * @param p0 点0
         * @param p1 点1
         */
        BezierCurve.prototype.linear = function (t, p0, p1) {
            return p0 + t * (p1 - p0);
            // return (1 - t) * p0 + t * p1;
        };
        /**
         * 线性Bézier曲线关于t的导数
         * @param t 插值度
         * @param p0 点0
         * @param p1 点1
         */
        BezierCurve.prototype.linearDerivative = function (t, p0, p1) {
            return p1 - p0;
        };
        /**
         * 线性Bézier曲线关于t的二阶导数
         * @param t 插值度
         * @param p0 点0
         * @param p1 点1
         */
        BezierCurve.prototype.linearSecondDerivative = function (t, p0, p1) {
            return 0;
        };
        /**
         * 二次Bézier曲线
         *
         * 二次Bézier曲线是由函数B（t）跟踪的路径，给定点P0，P1和P2，
         * ```
         * B(t) = (1 - t) * ((1 - t) * p0 + t * p1) + t * ((1 - t) * p1 + t * p2) , 0 <= t && t <= 1
         * ```
         * 这可以解释为分别从P0到P1和从P1到P2的线性Bézier曲线上相应点的线性插值。重新排列前面的等式得出：
         * ```
         * B(t) = (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2 , 0 <= t && t <= 1
         * ```
         * Bézier曲线关于t的导数是
         * ```
         * B'(t) = 2 * (1 - t) * (p1 - p0) + 2 * t * (p2 - p1)
         * ```
         * 从中可以得出结论：在P0和P2处曲线的切线在P 1处相交。随着t从0增加到1，曲线沿P1的方向从P0偏离，然后从P1的方向弯曲到P2。
         *
         * Bézier曲线关于t的二阶导数是
         * ```
         * B''(t) = 2 * (p2 - 2 * p1 + p0)
         * ```
         *
         * @param t 插值度
         * @param p0 点0
         * @param p1 点1
         * @param p2 点2
         */
        BezierCurve.prototype.quadratic = function (t, p0, p1, p2) {
            // return this.linear(t, this.linear(t, p0, p1), this.linear(t, p1, p2));
            // return (1 - t) * ((1 - t) * p0 + t * p1) + t * ((1 - t) * p1 + t * p2);
            return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
        };
        /**
         * 二次Bézier曲线关于t的导数
         * @param t 插值度
         * @param p0 点0
         * @param p1 点1
         * @param p2 点2
         */
        BezierCurve.prototype.quadraticDerivative = function (t, p0, p1, p2) {
            // return 2 * this.linear(t, this.linearDerivative(t, p0, p1), this.linearDerivative(t, p1, p2));
            return 2 * (1 - t) * (p1 - p0) + 2 * t * (p2 - p1);
        };
        /**
         * 二次Bézier曲线关于t的二阶导数
         * @param t 插值度
         * @param p0 点0
         * @param p1 点1
         * @param p2 点2
         */
        BezierCurve.prototype.quadraticSecondDerivative = function (t, p0, p1, p2) {
            // return 1 * 2 * this.linearDerivative(t, p1 - p0, p2 - p1)
            // return 1 * 2 * ((p2 - p1) - (p1 - p0));
            return 2 * (p2 - 2 * p1 + p0);
        };
        /**
         * 立方Bézier曲线
         *
         * 平面中或高维空间中（其实一维也是成立的，这里就是使用一维计算）的四个点P0，P1，P2和P3定义了三次Bézier曲线。
         * 曲线开始于P0朝向P1并且从P2的方向到达P3。通常不会通过P1或P2; 这些点只是为了提供方向信息。
         * P1和P2之间的距离在转向P2之前确定曲线向P1移动的“多远”和“多快” 。
         *
         * 对于由点Pi，Pj和Pk定义的二次Bézier曲线，可以将Bpipjpk(t)写成三次Bézier曲线，它可以定义为两条二次Bézier曲线的仿射组合：
         * ```
         * B(t) = (1 - t) * Bp0p1p2(t) + t * Bp1p2p3(t) , 0 <= t && t <= 1
         * ```
         * 曲线的显式形式是：
         * ```
         * B(t) = (1 - t) * (1 - t) * (1 - t) * p0 + 3 * (1 - t) * (1 - t) * t * p1 + 3 * (1 - t) * t * t * p2 + t * t * t * p3 , 0 <= t && t <= 1
         * ```
         * 对于P1和P2的一些选择，曲线可以相交，或者包含尖点。
         *
         * 三次Bézier曲线相对于t的导数是
         * ```
         * B'(t) = 3 * (1 - t) * (1 - t) * (p1 - p0) + 6 * (1 - t) * t * (p2 - p1) + 3 * t * t * (p3 - p2);
         * ```
         * 三次Bézier曲线关于t的二阶导数是
         * ```
         * 6 * (1 - t) * (p2 - 2 * p1 + p0) + 6 * t * (p3 - 2 * p2 + p1);
         * ```
         *
         * @param t 插值度
         * @param p0 点0
         * @param p1 点1
         * @param p2 点2
         * @param p3 点3
         */
        BezierCurve.prototype.cubic = function (t, p0, p1, p2, p3) {
            // return this.linear(t, this.quadratic(t, p0, p1, p2), this.quadratic(t, p1, p2, p3));
            return (1 - t) * (1 - t) * (1 - t) * p0 + 3 * (1 - t) * (1 - t) * t * p1 + 3 * (1 - t) * t * t * p2 + t * t * t * p3;
        };
        /**
         * 三次Bézier曲线关于t的导数
         * @param t 插值度
         * @param p0 点0
         * @param p1 点1
         * @param p2 点2
         * @param p3 点3
         */
        BezierCurve.prototype.cubicDerivative = function (t, p0, p1, p2, p3) {
            // return 3 * this.linear(t, this.quadraticDerivative(t, p0, p1, p2), this.quadraticDerivative(t, p1, p2, p3));
            return 3 * (1 - t) * (1 - t) * (p1 - p0) + 6 * (1 - t) * t * (p2 - p1) + 3 * t * t * (p3 - p2);
        };
        /**
         * 三次Bézier曲线关于t的二阶导数
         * @param t 插值度
         * @param p0 点0
         * @param p1 点1
         * @param p2 点2
         */
        BezierCurve.prototype.cubicSecondDerivative = function (t, p0, p1, p2, p3) {
            // return 3 * this.linear(t, this.quadraticSecondDerivative(t, p0, p1, p2), this.quadraticSecondDerivative(t, p1, p2, p3));
            return 6 * (1 - t) * (p2 - 2 * p1 + p0) + 6 * t * (p3 - 2 * p2 + p1);
        };
        /**
         * n次Bézier曲线
         *
         * 一般定义
         *
         * Bézier曲线可以定义为任意度n。
         *
         * @param t 插值度
         * @param ps 点列表 ps.length == n+1
         * @param processs 收集中间过程数据，可用作Bézier曲线动画数据
         */
        BezierCurve.prototype.bn = function (t, ps, processs) {
            if (processs === void 0) { processs = null; }
            ps = ps.concat();
            if (processs)
                processs.push(ps.concat());
            // n次Bézier递推
            for (var i = ps.length - 1; i > 0; i--) {
                for (var j = 0; j < i; j++) {
                    ps[j] = (1 - t) * ps[j] + t * ps[j + 1];
                }
                if (processs) {
                    ps.length = ps.length - 1;
                    processs.push(ps.concat());
                }
            }
            return ps[0];
        };
        /**
         * n次Bézier曲线关于t的导数
         *
         * 一般定义
         *
         * Bézier曲线可以定义为任意度n。
         *
         * @param t 插值度
         * @param ps 点列表 ps.length == n+1
         */
        BezierCurve.prototype.bnDerivative = function (t, ps) {
            if (ps.length < 2)
                return 0;
            ps = ps.concat();
            // 进行
            for (var i = 0, n = ps.length - 1; i < n; i++) {
                ps[i] = ps[i + 1] - ps[i];
            }
            //
            ps.length = ps.length - 1;
            var v = ps.length * this.bn(t, ps);
            return v;
        };
        /**
         * n次Bézier曲线关于t的二阶导数
         *
         * 一般定义
         *
         * Bézier曲线可以定义为任意度n。
         *
         * @param t 插值度
         * @param ps 点列表 ps.length == n+1
         */
        BezierCurve.prototype.bnSecondDerivative = function (t, ps) {
            if (ps.length < 3)
                return 0;
            ps = ps.concat();
            // 进行
            for (var i = 0, n = ps.length - 1; i < n; i++) {
                ps[i] = ps[i + 1] - ps[i];
            }
            //
            ps.length = ps.length - 1;
            var v = ps.length * this.bnDerivative(t, ps);
            return v;
        };
        /**
         * n次Bézier曲线关于t的dn阶导数
         *
         * Bézier曲线可以定义为任意度n。
         *
         * @param t 插值度
         * @param dn 求导次数
         * @param ps 点列表     ps.length == n+1
         */
        BezierCurve.prototype.bnND = function (t, dn, ps) {
            if (ps.length < dn + 1)
                return 0;
            var factorial = 1;
            ps = ps.concat();
            for (var j = 0; j < dn; j++) {
                // 进行
                for (var i = 0, n = ps.length - 1; i < n; i++) {
                    ps[i] = ps[i + 1] - ps[i];
                }
                //
                ps.length = ps.length - 1;
                factorial *= ps.length;
            }
            var v = factorial * this.bn(t, ps);
            return v;
        };
        /**
         * 获取曲线在指定插值度上的值
         * @param t 插值度
         * @param ps 点列表
         */
        BezierCurve.prototype.getValue = function (t, ps) {
            if (ps.length == 2) {
                return this.linear(t, ps[0], ps[1]);
            }
            if (ps.length == 3) {
                return this.quadratic(t, ps[0], ps[1], ps[2]);
            }
            if (ps.length == 4) {
                return this.cubic(t, ps[0], ps[1], ps[2], ps[3]);
            }
            return this.bn(t, ps);
            // var t1 = 1 - t;
            // return t1 * t1 * t1 * ps[0] + 3 * t1 * t1 * t * ps[1] + 3 * t1 * t * t * ps[2] + t * t * t * ps[3];
        };
        /**
         * 获取曲线在指定插值度上的导数(斜率)
         * @param t 插值度
         * @param ps 点列表
         */
        BezierCurve.prototype.getDerivative = function (t, ps) {
            if (ps.length == 2) {
                return this.linearDerivative(t, ps[0], ps[1]);
            }
            if (ps.length == 3) {
                return this.quadraticDerivative(t, ps[0], ps[1], ps[2]);
            }
            if (ps.length == 4) {
                return this.cubicDerivative(t, ps[0], ps[1], ps[2], ps[3]);
            }
            return this.bnDerivative(t, ps);
            // return 3 * (1 - t) * (1 - t) * (ps[1] - ps[0]) + 6 * (1 - t) * t * (ps[2] - ps[1]) + 3 * t * t * (ps[3] - ps[2]);
        };
        /**
         * 获取曲线在指定插值度上的二阶导数
         * @param t 插值度
         * @param ps 点列表
         */
        BezierCurve.prototype.getSecondDerivative = function (t, ps) {
            if (ps.length == 2) {
                return this.linearSecondDerivative(t, ps[0], ps[1]);
            }
            if (ps.length == 3) {
                return this.quadraticSecondDerivative(t, ps[0], ps[1], ps[2]);
            }
            if (ps.length == 4) {
                return this.cubicSecondDerivative(t, ps[0], ps[1], ps[2], ps[3]);
            }
            return this.bnSecondDerivative(t, ps);
            // return 3 * (1 - t) * (1 - t) * (ps[1] - ps[0]) + 6 * (1 - t) * t * (ps[2] - ps[1]) + 3 * t * t * (ps[3] - ps[2]);
        };
        /**
         * 查找区间内极值列表
         *
         * @param ps 点列表
         * @param numSamples 采样次数，用于分段查找极值
         * @param precision  查找精度
         *
         * @returns 极值列表 {} {ts: 极值插值度列表,vs: 极值值列表}
         */
        BezierCurve.prototype.getExtremums = function (ps, numSamples, precision) {
            var _this = this;
            if (numSamples === void 0) { numSamples = 10; }
            if (precision === void 0) { precision = 0.0000001; }
            var samples = [];
            for (var i = 0; i <= numSamples; i++) {
                samples.push(this.getDerivative(i / numSamples, ps));
            }
            // 查找存在解的分段
            //
            var resultTs = [];
            var resultVs = [];
            for (var i = 0, n = numSamples; i < n; i++) {
                if (samples[i] * samples[i + 1] < 0) {
                    var guessT = feng3d.equationSolving.line(function (x) { return _this.getDerivative(x, ps); }, i / numSamples, (i + 1) / numSamples, precision);
                    resultTs.push(guessT);
                    resultVs.push(this.getValue(guessT, ps));
                }
            }
            return { ts: resultTs, vs: resultVs };
        };
        /**
         * 获取单调区间列表
         *
         * @param ps
         * @param numSamples
         * @param precision
         * @returns ts: 区间结点插值度列表,vs: 区间结点值列表
         */
        BezierCurve.prototype.getMonotoneIntervals = function (ps, numSamples, precision) {
            if (numSamples === void 0) { numSamples = 10; }
            if (precision === void 0) { precision = 0.0000001; }
            // 区间内的单调区间
            var monotoneIntervalTs = [0, 1];
            var monotoneIntervalVs = [ps[0], ps[ps.length - 1]];
            // 预先计算好极值
            var extremums = this.getExtremums(ps, numSamples, precision);
            for (var i = 0; i < extremums.ts.length; i++) {
                // 增加单调区间
                monotoneIntervalTs.splice(i + 1, 0, extremums.ts[i]);
                monotoneIntervalVs.splice(i + 1, 0, extremums.vs[i]);
            }
            return { ts: monotoneIntervalTs, vs: monotoneIntervalVs };
        };
        /**
         * 获取目标值所在的插值度T
         *
         * @param targetV 目标值
         * @param ps 点列表
         * @param numSamples 分段数量，用于分段查找，用于解决寻找多个解、是否无解等问题；过少的分段可能会造成找不到存在的解决，过多的分段将会造成性能很差。
         * @param precision  查找精度
         *
         * @returns 返回解数组
         */
        BezierCurve.prototype.getTFromValue = function (targetV, ps, numSamples, precision) {
            var _this = this;
            if (numSamples === void 0) { numSamples = 10; }
            if (precision === void 0) { precision = 0.0000001; }
            // 获取单调区间
            var monotoneIntervals = this.getMonotoneIntervals(ps, numSamples, precision);
            var monotoneIntervalTs = monotoneIntervals.ts;
            var monotoneIntervalVs = monotoneIntervals.vs;
            // 存在解的单调区间
            var results = [];
            // 遍历单调区间
            for (var i = 0, n = monotoneIntervalVs.length - 1; i < n; i++) {
                if ((monotoneIntervalVs[i] - targetV) * (monotoneIntervalVs[i + 1] - targetV) <= 0) {
                    var fx = function (x) { return _this.getValue(x, ps) - targetV; };
                    // 连线法
                    var result = feng3d.equationSolving.line(fx, monotoneIntervalTs[i], monotoneIntervalTs[i + 1], precision);
                    results.push(result);
                }
            }
            return results;
        };
        /**
         * 分割曲线
         *
         * 在曲线插值度t位置分割为两条连接起来与原曲线完全重合的曲线
         *
         * @param t 分割位置（插值度）
         * @param ps 被分割曲线点列表
         * @returns 返回两条曲线组成的数组
         */
        BezierCurve.prototype.split = function (t, ps) {
            // 获取曲线的动画过程
            var processs = [];
            feng3d.bezierCurve.bn(t, ps, processs);
            // 第一条曲线
            var fps = [];
            // 第二条曲线
            var sps = [];
            // 使用当前t值进行分割曲线
            for (var i = processs.length - 1; i >= 0; i--) {
                if (i == processs.length - 1) {
                    // 添加关键点
                    fps.push(processs[i][0]);
                    fps.push(processs[i][0]);
                }
                else {
                    // 添加左右控制点
                    fps.unshift(processs[i][0]);
                    sps.push(processs[i].pop());
                }
            }
            return [fps, sps];
        };
        /**
         * 合并曲线
         *
         * 合并两条连接的曲线为一条曲线并且可以还原为分割前的曲线
         *
         * @param fps 第一条曲线点列表
         * @param sps 第二条曲线点列表
         * @param mergeType 合并方式。mergeType = 0时进行还原合并，还原拆分之前的曲线；mergeType = 1时进行拟合合并，合并后的曲线会经过两条曲线的连接点；
         */
        BezierCurve.prototype.merge = function (fps, sps, mergeType) {
            if (mergeType === void 0) { mergeType = 0; }
            fps = fps.concat();
            sps = sps.concat();
            var processs = [];
            var t;
            // 上条曲线
            var pps;
            // 当前曲线
            var ps;
            for (var i = 0, n = fps.length; i < n; i++) {
                ps = processs[i] = [];
                if (i == 0) {
                    processs[i][0] = fps.pop();
                    sps.shift();
                }
                else if (i == 1) {
                    // 计算t值
                    processs[i][0] = fps.pop();
                    processs[i][1] = sps.shift();
                    t = (processs[i - 1][0] - processs[i][0]) / (processs[i][1] - processs[i][0]);
                }
                else {
                    pps = processs[i - 1];
                    // 前面增加点
                    var nfp = fps.pop();
                    // 后面增加点
                    var nsp = sps.shift();
                    // 从前往后计算
                    var ps0 = [];
                    ps0[0] = nfp;
                    for (var j = 0, n_1 = pps.length; j < n_1; j++) {
                        ps0[j + 1] = ps0[j] + (pps[j] - ps0[j]) / t;
                    }
                    // 从后往前计算
                    var ps1 = [];
                    ps1[pps.length] = nsp;
                    for (var j = pps.length - 1; j >= 0; j--) {
                        ps1[j] = ps1[j + 1] - (ps1[j + 1] - pps[j]) / (1 - t);
                    }
                    // 拟合合并,合并前后两个方向的计算
                    if (mergeType == 1) {
                        for (var j = 0, n_2 = ps0.length - 1; j <= n_2; j++) {
                            ps[j] = (ps0[j] * (n_2 - j) + ps1[j] * j) / n_2;
                        }
                    }
                    else if (mergeType == 0) {
                        // 还原合并，前半段使用从前往后计算，后半段使用从后往前计算
                        for (var j = 0, n_3 = ps0.length - 1; j <= n_3; j++) {
                            if (j < n_3 / 2) {
                                ps[j] = ps0[j];
                            }
                            else if (j > n_3 / 2) {
                                ps[j] = ps1[j];
                            }
                            else {
                                ps[j] = (ps0[j] + ps1[j]) / 2;
                            }
                        }
                    }
                    else {
                        console.error("\u5408\u5E76\u7C7B\u578B mergeType " + mergeType + " \u9519\u8BEF!");
                    }
                }
            }
            return processs.pop();
        };
        /**
         * 获取曲线样本数据
         *
         * 这些点可用于连线来拟合曲线。
         *
         * @param ps 点列表
         * @param num 采样次数 ，采样点分别为[0,1/num,2/num,....,(num-1)/num,1]
         */
        BezierCurve.prototype.getSamples = function (ps, num) {
            if (num === void 0) { num = 100; }
            var results = [];
            for (var i = 0; i <= num; i++) {
                var t = i / num;
                var p = this.getValue(t, ps);
                results.push({ t: t, v: p });
            }
            return results;
        };
        return BezierCurve;
    }());
    feng3d.BezierCurve = BezierCurve;
    feng3d.bezierCurve = new BezierCurve();
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 动画曲线Wrap模式，处理超出范围情况
     */
    var WrapMode;
    (function (WrapMode) {
        /**
         * 夹紧; 0>-<1
         */
        WrapMode[WrapMode["Clamp"] = 1] = "Clamp";
        /**
         * 循环; 0->1,0->1
         */
        WrapMode[WrapMode["Loop"] = 2] = "Loop";
        /**
         * 来回循环; 0->1,1->0
         */
        WrapMode[WrapMode["PingPong"] = 4] = "PingPong";
        /**
         * When time reaches the end of the animation clip, the clip will automatically stop playing and time will be reset to beginning of the clip.
         */
        WrapMode[WrapMode["Once"] = 5] = "Once";
        /**
         * Reads the default repeat mode set higher up.
         */
        WrapMode[WrapMode["Default"] = 6] = "Default";
    })(WrapMode = feng3d.WrapMode || (feng3d.WrapMode = {}));
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 动画曲线
     *
     * 基于时间轴的连续三阶Bézier曲线
     */
    var AnimationCurve = /** @class */ (function () {
        function AnimationCurve() {
            /**
             * 最大tan值，超出该值后将会变成分段
             */
            this.maxtan = 1000;
            /**
             * The behaviour of the animation before the first keyframe.
             *
             * 在第一个关键帧之前的动画行为。
             */
            this.preWrapMode = feng3d.WrapMode.Clamp;
            /**
             * The behaviour of the animation after the last keyframe.
             *
             * 动画在最后一个关键帧之后的行为。
             */
            this.postWrapMode = feng3d.WrapMode.Clamp;
            /**
             * All keys defined in the animation curve.
             *
             * 动画曲线上所有关键字定义。
             *
             * 注： 该值已对时间排序，否则赋值前请使用 sort((a, b) => a.time - b.time) 进行排序
             */
            this.keys = [{ time: 0, value: 1, inTangent: 0, outTangent: 0 }];
        }
        Object.defineProperty(AnimationCurve.prototype, "numKeys", {
            /**
             * 关键点数量
             */
            get: function () {
                return this.keys.length;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * 添加关键点
         *
         * 添加关键点后将会执行按t进行排序
         *
         * @param key 关键点
         */
        AnimationCurve.prototype.addKey = function (key) {
            this.keys.push(key);
            this.sort();
        };
        /**
         * 关键点排序
         *
         * 当移动关键点或者新增关键点时需要再次排序
         */
        AnimationCurve.prototype.sort = function () {
            this.keys.sort(function (a, b) { return a.time - b.time; });
        };
        /**
         * 删除关键点
         * @param key 关键点
         */
        AnimationCurve.prototype.deleteKey = function (key) {
            var index = this.keys.indexOf(key);
            if (index != -1)
                this.keys.splice(index, 1);
        };
        /**
         * 获取关键点
         * @param index 索引
         */
        AnimationCurve.prototype.getKey = function (index) {
            return this.keys[index];
        };
        /**
         * 获取关键点索引
         * @param key 关键点
         */
        AnimationCurve.prototype.indexOfKeys = function (key) {
            return this.keys.indexOf(key);
        };
        /**
         * 获取曲线上点信息
         * @param t 时间轴的位置 [0,1]
         */
        AnimationCurve.prototype.getPoint = function (t) {
            var wrapMode = feng3d.WrapMode.Clamp;
            var min = 0;
            var max = 1;
            if (this.keys.length > 0) {
                min = this.keys[0].time;
            }
            if (this.keys.length > 1) {
                max = this.keys[this.keys.length - 1].time;
            }
            var cycle = max - min;
            var dcycle = 2 * cycle;
            if (t < min)
                wrapMode = this.preWrapMode;
            else if (t > max)
                wrapMode = this.postWrapMode;
            switch (wrapMode) {
                case feng3d.WrapMode.Clamp:
                    t = Math.clamp(t, min, max);
                    break;
                case feng3d.WrapMode.Loop:
                    t = ((t - min) % cycle + cycle) % cycle + min;
                    break;
                case feng3d.WrapMode.PingPong:
                    t = ((t - min) % dcycle + dcycle) % dcycle + min;
                    if (t > max) {
                        t = max - (t - max);
                    }
                    break;
            }
            var keys = this.keys;
            var maxtan = this.maxtan;
            var value = 0, tangent = 0, isfind = false;
            ;
            for (var i = 0, n = keys.length; i < n; i++) {
                // 使用 bezierCurve 进行采样曲线点
                var key = keys[i];
                var prekey = keys[i - 1];
                if (i > 0 && prekey.time <= t && t <= key.time) {
                    var xstart = prekey.time;
                    var ystart = prekey.value;
                    var tanstart = prekey.outTangent;
                    var xend = key.time;
                    var yend = key.value;
                    var tanend = key.inTangent;
                    if (maxtan > Math.abs(tanstart) && maxtan > Math.abs(tanend)) {
                        var ct = (t - prekey.time) / (key.time - prekey.time);
                        var sys = [ystart, ystart + tanstart * (xend - xstart) / 3, yend - tanend * (xend - xstart) / 3, yend];
                        var fy = feng3d.bezierCurve.getValue(ct, sys);
                        isfind = true;
                        value = fy;
                        tangent = feng3d.bezierCurve.getDerivative(ct, sys) / (xend - xstart);
                        break;
                    }
                    else {
                        isfind = true;
                        value = prekey.value;
                        tangent = 0;
                        break;
                    }
                }
                if (i == 0 && t <= key.time) {
                    isfind = true;
                    value = key.value;
                    tangent = 0;
                    break;
                }
                if (i == n - 1 && t >= key.time) {
                    isfind = true;
                    value = key.value;
                    tangent = 0;
                    break;
                }
            }
            if (keys.length == 0)
                return { time: t, value: 0, inTangent: 0, outTangent: 0 };
            console.assert(isfind);
            return { time: t, value: value, inTangent: tangent, outTangent: tangent };
        };
        /**
         * 获取值
         * @param t 时间轴的位置 [0,1]
         */
        AnimationCurve.prototype.getValue = function (t) {
            var point = this.getPoint(t);
            if (!point)
                return 0;
            return point.value;
        };
        /**
         * 查找关键点
         * @param t 时间轴的位置 [0,1]
         * @param y 值
         * @param precision 查找精度
         */
        AnimationCurve.prototype.findKey = function (t, y, precision) {
            var keys = this.keys;
            for (var i = 0; i < keys.length; i++) {
                if (Math.abs(keys[i].time - t) < precision && Math.abs(keys[i].value - y) < precision) {
                    return keys[i];
                }
            }
            return null;
        };
        /**
         * 添加曲线上的关键点
         *
         * 如果该点在曲线上，则添加关键点
         *
         * @param time 时间轴的位置 [0,1]
         * @param value 值
         * @param precision 查找精度
         */
        AnimationCurve.prototype.addKeyAtCurve = function (time, value, precision) {
            var point = this.getPoint(time);
            if (Math.abs(value - point.value) < precision) {
                this.keys.push(point);
                this.keys.sort(function (a, b) { return a.time - b.time; });
                return point;
            }
            return null;
        };
        /**
         * 获取曲线样本数据
         *
         * 这些点可用于连线来拟合曲线。
         *
         * @param num 采样次数 ，采样点分别为[0,1/num,2/num,....,(num-1)/num,1]
         */
        AnimationCurve.prototype.getSamples = function (num) {
            if (num === void 0) { num = 100; }
            var results = [];
            for (var i = 0; i <= num; i++) {
                var p = this.getPoint(i / num);
                results.push(p);
            }
            return results;
        };
        __decorate([
            feng3d.serialize
        ], AnimationCurve.prototype, "preWrapMode", void 0);
        __decorate([
            feng3d.serialize
        ], AnimationCurve.prototype, "postWrapMode", void 0);
        __decorate([
            feng3d.serialize
        ], AnimationCurve.prototype, "keys", void 0);
        return AnimationCurve;
    }());
    feng3d.AnimationCurve = AnimationCurve;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 曲线模式
     */
    var MinMaxCurveMode;
    (function (MinMaxCurveMode) {
        /**
         * Use a single constant for the MinMaxCurve.
         *
         * 使用单个常数。
         */
        MinMaxCurveMode[MinMaxCurveMode["Constant"] = 0] = "Constant";
        /**
         * Use a single curve for the MinMaxCurve.
         *
         * 使用一条曲线
         */
        MinMaxCurveMode[MinMaxCurveMode["Curve"] = 1] = "Curve";
        /**
         * Use a random value between 2 constants for the MinMaxCurve.
         *
         * 在两个常量之间使用一个随机值
         */
        MinMaxCurveMode[MinMaxCurveMode["TwoConstants"] = 3] = "TwoConstants";
        /**
         * Use a random value between 2 curves for the MinMaxCurve.
         *
         * 在两条曲线之间使用一个随机值。
         */
        MinMaxCurveMode[MinMaxCurveMode["TwoCurves"] = 2] = "TwoCurves";
    })(MinMaxCurveMode = feng3d.MinMaxCurveMode || (feng3d.MinMaxCurveMode = {}));
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 最大最小曲线
     */
    var MinMaxCurve = /** @class */ (function () {
        function MinMaxCurve() {
            /**
             * 模式
             */
            this.mode = feng3d.MinMaxCurveMode.Constant;
            /**
             * Set the constant value.
             *
             * 设置常数值。
             */
            this.constant = 0;
            /**
             * Set a constant for the lower bound.
             *
             * 为下界设置一个常数。
             */
            this.constantMin = 0;
            /**
             * Set a constant for the upper bound.
             *
             * 为上界设置一个常数。
             */
            this.constantMax = 0;
            /**
             * Set the curve.
             *
             * 设置曲线。
             */
            this.curve = new feng3d.AnimationCurve();
            /**
             * Set a curve for the lower bound.
             *
             * 为下界设置一条曲线。
             */
            this.curveMin = new feng3d.AnimationCurve();
            /**
             * Set a curve for the upper bound.
             *
             * 为上界设置一条曲线。
             */
            this.curveMax = new feng3d.AnimationCurve();
            /**
             * Set a multiplier to be applied to the curves.
             *
             * 设置一个乘数应用于曲线。
             */
            this.curveMultiplier = 1;
            /**
             * 是否在编辑器中只显示Y轴 0-1 区域，例如 lifetime 为非负，需要设置为true
             */
            this.between0And1 = false;
        }
        /**
         * 获取值
         * @param time 时间
         */
        MinMaxCurve.prototype.getValue = function (time, randomBetween) {
            if (randomBetween === void 0) { randomBetween = Math.random(); }
            switch (this.mode) {
                case feng3d.MinMaxCurveMode.Constant:
                    return this.constant;
                case feng3d.MinMaxCurveMode.Curve:
                    return this.curve.getValue(time) * this.curveMultiplier;
                case feng3d.MinMaxCurveMode.TwoConstants:
                    return Math.lerp(this.constantMin, this.constantMax, randomBetween);
                case feng3d.MinMaxCurveMode.TwoCurves:
                    return Math.lerp(this.curveMin.getValue(time), this.curveMax.getValue(time), randomBetween) * this.curveMultiplier;
            }
            return this.constant;
        };
        __decorate([
            feng3d.serialize
        ], MinMaxCurve.prototype, "mode", void 0);
        __decorate([
            feng3d.serialize
        ], MinMaxCurve.prototype, "constant", void 0);
        __decorate([
            feng3d.serialize
        ], MinMaxCurve.prototype, "constantMin", void 0);
        __decorate([
            feng3d.serialize
        ], MinMaxCurve.prototype, "constantMax", void 0);
        __decorate([
            feng3d.serialize
        ], MinMaxCurve.prototype, "curve", void 0);
        __decorate([
            feng3d.serialize
        ], MinMaxCurve.prototype, "curveMin", void 0);
        __decorate([
            feng3d.serialize
        ], MinMaxCurve.prototype, "curveMax", void 0);
        __decorate([
            feng3d.serialize
        ], MinMaxCurve.prototype, "curveMultiplier", void 0);
        __decorate([
            feng3d.serialize
        ], MinMaxCurve.prototype, "between0And1", void 0);
        return MinMaxCurve;
    }());
    feng3d.MinMaxCurve = MinMaxCurve;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var MinMaxCurveVector3 = /** @class */ (function () {
        function MinMaxCurveVector3() {
            /**
             * x 曲线
             */
            this.xCurve = new feng3d.MinMaxCurve();
            /**
             * y 曲线
             */
            this.yCurve = new feng3d.MinMaxCurve();
            /**
             * z 曲线
             */
            this.zCurve = new feng3d.MinMaxCurve();
        }
        /**
         * 获取值
         * @param time 时间
         */
        MinMaxCurveVector3.prototype.getValue = function (time, randomBetween) {
            if (randomBetween === void 0) { randomBetween = Math.random(); }
            return new feng3d.Vector3(this.xCurve.getValue(time, randomBetween), this.yCurve.getValue(time, randomBetween), this.zCurve.getValue(time, randomBetween));
        };
        __decorate([
            feng3d.serialize
        ], MinMaxCurveVector3.prototype, "xCurve", void 0);
        __decorate([
            feng3d.serialize
        ], MinMaxCurveVector3.prototype, "yCurve", void 0);
        __decorate([
            feng3d.serialize
        ], MinMaxCurveVector3.prototype, "zCurve", void 0);
        return MinMaxCurveVector3;
    }());
    feng3d.MinMaxCurveVector3 = MinMaxCurveVector3;
})(feng3d || (feng3d = {}));
/**
 * Port from https://github.com/mapbox/earcut (v2.2.2)
 */
var feng3d;
(function (feng3d) {
    var Earcut = /** @class */ (function () {
        function Earcut() {
        }
        /**
         * 三角化形状
         *
         * @param data 形状顶点数据
         * @param holeIndices 空洞的起始顶点索引列表
         * @param dim 相邻顶点数据之间的步长
         */
        Earcut.triangulate = function (data, holeIndices, dim) {
            if (dim === void 0) { dim = 2; }
            // 判断是否有孔洞
            var hasHoles = holeIndices && holeIndices.length;
            // 获取形状轮廓顶点数量
            var outerLen = hasHoles ? holeIndices[0] * dim : data.length;
            // 初始化形状轮廓顶点链表
            var outerNode = linkedList(data, 0, outerLen, dim, true);
            // 三角索引
            var triangles = [];
            // 没有节点、只有一个或者两个节点不构成三角形时直接返回
            if (!outerNode || outerNode.next === outerNode.prev)
                return triangles;
            var minX, minY, maxX, maxY, x, y, invSize;
            // 消除孔洞
            if (hasHoles)
                outerNode = eliminateHoles(data, holeIndices, outerNode, dim);
            // if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
            // 如果形状比较复杂，将使用z顺序曲线哈希;计算多边形bbox
            if (data.length > 80 * dim) {
                minX = maxX = data[0];
                minY = maxY = data[1];
                // 统计最大最小X轴与Y轴坐标
                for (var i = dim; i < outerLen; i += dim) {
                    x = data[i];
                    y = data[i + 1];
                    if (x < minX)
                        minX = x;
                    if (y < minY)
                        minY = y;
                    if (x > maxX)
                        maxX = x;
                    if (y > maxY)
                        maxY = y;
                }
                // minX, minY and invSize are later used to node3d coords into integers for z-order calculation
                // 计算尺寸的倒数，用于后面运算
                invSize = Math.max(maxX - minX, maxY - minY);
                invSize = invSize !== 0 ? 1 / invSize : 0;
            }
            earcutLinked(outerNode, triangles, dim, minX, minY, invSize);
            return triangles;
        };
        return Earcut;
    }());
    feng3d.Earcut = Earcut;
    /**
     * create a circular doubly linked list from polygon points in the specified winding order
     *
     * 以指定的绕线顺序从多边形点创建一个循环的双重链表
     *
     * @param data 多边形顶点数据
     * @param start 起始顶点索引
     * @param end 终止顶点索引
     * @param dim 相邻顶点数据之间的步长
     * @param clockwise 是否顺时针方向
     */
    function linkedList(data, start, end, dim, clockwise) {
        var i, last;
        // 按照指定时钟方向建立链表
        if (clockwise === (signedArea(data, start, end, dim) > 0)) {
            for (i = start; i < end; i += dim)
                last = insertNode(i, data[i], data[i + 1], last);
        }
        else {
            for (i = end - dim; i >= start; i -= dim)
                last = insertNode(i, data[i], data[i + 1], last);
        }
        // 去除头尾相同节点
        if (last && equals(last, last.next)) {
            removeNode(last);
            last = last.next;
        }
        return last;
    }
    /**
     * 消除共线与重复节点
     *
     * @param start 遍历检测起始节点
     * @param end 遍历检测终止节点
     */
    function filterPoints(start, end) {
        if (!start)
            return start;
        if (!end)
            end = start;
        var p = start, again;
        do {
            again = false;
            // 判断重复节点与共线节点
            if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
                removeNode(p);
                p = end = p.prev;
                if (p === p.next)
                    break;
                again = true;
            }
            else {
                p = p.next;
            }
        } while (again || p !== end);
        return end;
    }
    /**
     * main ear slicing loop which triangulates a polygon (given as a linked list)
     *
     * 主耳切割循环三角化多边形（由链表表示）
     *
     * @param ear 被三角化的多边形链表
     * @param triangles 三角化后的顶点索引数组
     * @param dim 相邻顶点数据之间的步长
     * @param minX 包围盒X轴最小值
     * @param minY 包围盒Y轴最小值
     * @param invSize 包围盒尺寸倒数
     * @param pass
     */
    function earcutLinked(ear, triangles, dim, minX, minY, invSize, pass) {
        if (!ear)
            return;
        // interlink polygon nodes in z-order
        // 使用z-order连接多边形结点
        if (!pass && invSize)
            indexCurve(ear, minX, minY, invSize);
        var stop = ear, prev, next;
        // iterate through ears, slicing them one by one
        while (ear.prev !== ear.next) {
            prev = ear.prev;
            next = ear.next;
            if (invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear)) {
                // cut off the triangle
                triangles.push(prev.i / dim);
                triangles.push(ear.i / dim);
                triangles.push(next.i / dim);
                removeNode(ear);
                // skipping the next vertex leads to less sliver triangles
                ear = next.next;
                stop = next.next;
                continue;
            }
            ear = next;
            // if we looped through the whole remaining polygon and can't find any more ears
            if (ear === stop) {
                // try filtering points and slicing again
                if (!pass) {
                    earcutLinked(filterPoints(ear), triangles, dim, minX, minY, invSize, 1);
                    // if this didn't work, try curing all small self-intersections locally
                }
                else if (pass === 1) {
                    ear = cureLocalIntersections(filterPoints(ear), triangles, dim);
                    earcutLinked(ear, triangles, dim, minX, minY, invSize, 2);
                    // as a last resort, try splitting the remaining polygon into two
                }
                else if (pass === 2) {
                    splitEarcut(ear, triangles, dim, minX, minY, invSize);
                }
                break;
            }
        }
    }
    // check whether a polygon node forms a valid ear with adjacent nodes
    function isEar(ear) {
        var a = ear.prev, b = ear, c = ear.next;
        if (area(a, b, c) >= 0)
            return false; // reflex, can't be an ear
        // now make sure we don't have other points inside the potential ear
        var p = ear.next.next;
        while (p !== ear.prev) {
            if (pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
                area(p.prev, p, p.next) >= 0)
                return false;
            p = p.next;
        }
        return true;
    }
    function isEarHashed(ear, minX, minY, invSize) {
        var a = ear.prev, b = ear, c = ear.next;
        if (area(a, b, c) >= 0)
            return false; // reflex, can't be an ear
        // triangle bbox; min & max are calculated like this for speed
        var minTX = a.x < b.x ? (a.x < c.x ? a.x : c.x) : (b.x < c.x ? b.x : c.x), minTY = a.y < b.y ? (a.y < c.y ? a.y : c.y) : (b.y < c.y ? b.y : c.y), maxTX = a.x > b.x ? (a.x > c.x ? a.x : c.x) : (b.x > c.x ? b.x : c.x), maxTY = a.y > b.y ? (a.y > c.y ? a.y : c.y) : (b.y > c.y ? b.y : c.y);
        // z-order range for the current triangle bbox;
        var minZ = zOrder(minTX, minTY, minX, minY, invSize), maxZ = zOrder(maxTX, maxTY, minX, minY, invSize);
        var p = ear.prevZ, n = ear.nextZ;
        // look for points inside the triangle in both directions
        while (p && p.z >= minZ && n && n.z <= maxZ) {
            if (p !== ear.prev && p !== ear.next &&
                pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
                area(p.prev, p, p.next) >= 0)
                return false;
            p = p.prevZ;
            if (n !== ear.prev && n !== ear.next &&
                pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) &&
                area(n.prev, n, n.next) >= 0)
                return false;
            n = n.nextZ;
        }
        // look for remaining points in decreasing z-order
        while (p && p.z >= minZ) {
            if (p !== ear.prev && p !== ear.next &&
                pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
                area(p.prev, p, p.next) >= 0)
                return false;
            p = p.prevZ;
        }
        // look for remaining points in increasing z-order
        while (n && n.z <= maxZ) {
            if (n !== ear.prev && n !== ear.next &&
                pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) &&
                area(n.prev, n, n.next) >= 0)
                return false;
            n = n.nextZ;
        }
        return true;
    }
    // go through all polygon nodes and cure small local self-intersections
    function cureLocalIntersections(start, triangles, dim) {
        var p = start;
        do {
            var a = p.prev, b = p.next.next;
            if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {
                triangles.push(a.i / dim);
                triangles.push(p.i / dim);
                triangles.push(b.i / dim);
                // remove two nodes involved
                // 移除两个有问题的节点
                removeNode(p);
                removeNode(p.next);
                p = start = b;
            }
            p = p.next;
        } while (p !== start);
        return filterPoints(p);
    }
    // try splitting polygon into two and triangulate them independently
    function splitEarcut(start, triangles, dim, minX, minY, invSize) {
        // look for a valid diagonal that divides the polygon into two
        var a = start;
        do {
            var b = a.next.next;
            while (b !== a.prev) {
                if (a.i !== b.i && isValidDiagonal(a, b)) {
                    // split the polygon in two by the diagonal
                    var c = splitPolygon(a, b);
                    // filter colinear points around the cuts
                    a = filterPoints(a, a.next);
                    c = filterPoints(c, c.next);
                    // run earcut on each half
                    earcutLinked(a, triangles, dim, minX, minY, invSize);
                    earcutLinked(c, triangles, dim, minX, minY, invSize);
                    return;
                }
                b = b.next;
            }
            a = a.next;
        } while (a !== start);
    }
    /**
     * link every hole into the outer loop, producing a single-ring polygon without holes
     *
     * 将每个孔连接到外环，产生一个没有孔的单环多边形
     *
     * @param data 形状顶点数据
     * @param holeIndices 空洞的起始顶点索引列表
     * @param outerNode 形状轮廓链表
     * @param dim 相邻顶点数据之间的步长
     */
    function eliminateHoles(data, holeIndices, outerNode, dim) {
        // 孔洞链表数组
        var queue = [];
        var i, len, start, end, list;
        // 遍历构建孔洞链表数组
        for (i = 0, len = holeIndices.length; i < len; i++) {
            // 获取当前孔洞起始与结束索引
            start = holeIndices[i] * dim;
            end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
            // 构建孔洞链表
            list = linkedList(data, start, end, dim, false);
            if (list === list.next)
                list.steiner = true;
            // 把孔洞链表中最左边（X值最小）的节点存放到数组中
            queue.push(getLeftmost(list));
        }
        // 从左到右排序孔洞链表数组
        queue.sort(compareX);
        // process holes from left to right
        // 从左到右消除孔洞链表
        for (i = 0; i < queue.length; i++) {
            // 消除孔洞列表
            eliminateHole(queue[i], outerNode);
            // 处理连接外轮廓与孔洞后出现的重复点与共线
            outerNode = filterPoints(outerNode, outerNode.next);
        }
        return outerNode;
    }
    function compareX(a, b) {
        return a.x - b.x;
    }
    /**
     * find a bridge between vertices that connects hole with an outer ring and and link it
     * 找到一个桥梁连接外轮廓与孔洞
     *
     * @param hole 孔洞链表
     * @param outerNode 外轮廓链表
     */
    function eliminateHole(hole, outerNode) {
        // 查找与hole节点构成桥梁的外轮廓节点
        outerNode = findHoleBridge(hole, outerNode);
        if (outerNode) {
            // 构建外轮廓与孔洞桥梁
            var b = splitPolygon(outerNode, hole);
            // filter collinear points around the cuts
            filterPoints(outerNode, outerNode.next);
            filterPoints(b, b.next);
        }
    }
    /**
     * David Eberly's algorithm for finding a bridge between hole and outer polygon
     *
     * 使用David Eberly算法找到孔洞与外轮廓之间的桥梁
     *
     * @param hole 孔洞链表
     * @param outerNode 外轮廓链表
     */
    function findHoleBridge(hole, outerNode) {
        var p = outerNode;
        var hx = hole.x;
        var hy = hole.y;
        var qx = -Infinity, m;
        // find a segment intersected by a ray from the hole's leftmost point to the left;
        // segment's endpoint with lesser x will be potential connection point
        do {
            if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
                var x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
                if (x <= hx && x > qx) {
                    qx = x;
                    if (x === hx) {
                        if (hy === p.y)
                            return p;
                        if (hy === p.next.y)
                            return p.next;
                    }
                    m = p.x < p.next.x ? p : p.next;
                }
            }
            p = p.next;
        } while (p !== outerNode);
        if (!m)
            return null;
        if (hx === qx)
            return m; // hole touches outer segment; pick leftmost endpoint
        // look for points inside the triangle of hole point, segment intersection and endpoint;
        // if there are no points found, we have a valid connection;
        // otherwise choose the point of the minimum angle with the ray as connection point
        var stop = m, mx = m.x, my = m.y;
        var tanMin = Infinity, tan;
        p = m;
        do {
            if (hx >= p.x && p.x >= mx && hx !== p.x &&
                pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {
                tan = Math.abs(hy - p.y) / (hx - p.x); // tangential
                if (locallyInside(p, hole) && (tan < tanMin || (tan === tanMin && (p.x > m.x || (p.x === m.x && sectorContainsSector(m, p)))))) {
                    m = p;
                    tanMin = tan;
                }
            }
            p = p.next;
        } while (p !== stop);
        return m;
    }
    /**
     * whether sector in vertex m contains sector in vertex p in the same coordinates
     *
     * 判断在相同坐标系下第一个节点的扇形区域是否包含第二个节点的扇形区域。
     *
     * @param m 第一个节点
     * @param p 第二个节点
     *
     * @todo 没懂
     */
    function sectorContainsSector(m, p) {
        return area(m.prev, m, p.prev) < 0 && area(p.next, m, m.next) < 0;
    }
    /**
     * interlink polygon nodes in z-order
     *
     * 以z顺序连接多边形节点
     *
     * @param start 起始节点
     * @param minX 包围盒X轴最小值
     * @param minY 包围盒Y轴最小值
     * @param invSize 包围盒尺寸的倒数
     */
    function indexCurve(start, minX, minY, invSize) {
        var p = start;
        do {
            if (p.z === null)
                p.z = zOrder(p.x, p.y, minX, minY, invSize);
            p.prevZ = p.prev;
            p.nextZ = p.next;
            p = p.next;
        } while (p !== start);
        p.prevZ.nextZ = null;
        p.prevZ = null;
        // 根据z的大小对链表进行排序
        sortLinked(p);
    }
    /**
     * Simon Tatham's linked list merge sort algorithm
     *
     * 链表归并排序算法
     *
     * @see http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
     *
     * @param list 链表
     */
    function sortLinked(list) {
        var i, p, q, e, tail, numMerges, pSize, qSize, inSize = 1;
        do {
            p = list;
            list = null;
            tail = null;
            numMerges = 0;
            while (p) {
                numMerges++;
                q = p;
                pSize = 0;
                for (i = 0; i < inSize; i++) {
                    pSize++;
                    q = q.nextZ;
                    if (!q)
                        break;
                }
                qSize = inSize;
                while (pSize > 0 || (qSize > 0 && q)) {
                    if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
                        e = p;
                        p = p.nextZ;
                        pSize--;
                    }
                    else {
                        e = q;
                        q = q.nextZ;
                        qSize--;
                    }
                    if (tail)
                        tail.nextZ = e;
                    else
                        list = e;
                    e.prevZ = tail;
                    tail = e;
                }
                p = q;
            }
            tail.nextZ = null;
            inSize *= 2;
        } while (numMerges > 1);
        return list;
    }
    /**
     * z-order of a point given coords and inverse of the longer side of data bbox
     *
     * 把x与y分别映射到包围盒中位置(0,1)再映射到(0,(1<<15)-1)，最后把x与y的值进行相互穿插组成32位数字
     *
     * @todo 为什么使用这种运算？不明觉厉！
     *
     * @param x X轴坐标
     * @param y Y轴坐标
     * @param minX 包围盒X轴最小值
     * @param minY 包围盒Y轴最小值
     * @param invSize 包围盒尺寸倒数
     *
     * @see https://en.wikipedia.org/wiki/Z-order_curve
     */
    function zOrder(x, y, minX, minY, invSize) {
        // coords are transformed into non-negative 15-bit integer range
        // 坐标被转换为非负的15位整数范围
        // 把x与y约束在(0,1)范围后在映射到(0,32767)
        x = 32767 * (x - minX) * invSize;
        y = 32767 * (y - minY) * invSize;
        // 把16位中每一位前面插入一个0转换为32位，例如 0111111111111111（0xffff） -> 00010101010101010101010101010101（0x55555555）
        x = (x | (x << 8)) & 0x00FF00FF;
        x = (x | (x << 4)) & 0x0F0F0F0F;
        x = (x | (x << 2)) & 0x33333333;
        x = (x | (x << 1)) & 0x55555555;
        y = (y | (y << 8)) & 0x00FF00FF;
        y = (y | (y << 4)) & 0x0F0F0F0F;
        y = (y | (y << 2)) & 0x33333333;
        y = (y | (y << 1)) & 0x55555555;
        // 
        return x | (y << 1);
    }
    /**
     * find the leftmost node of a polygon ring
     *
     * 查找一个X值最小的节点
     *
     * @param start 查找起始节点
     */
    function getLeftmost(start) {
        var p = start, leftmost = start;
        do {
            if (p.x < leftmost.x || (p.x === leftmost.x && p.y < leftmost.y))
                leftmost = p;
            p = p.next;
        } while (p !== start);
        return leftmost;
    }
    /**
     * check if a point lies within a convex triangle
     *
     * 检查一个点是否位于一个正向三角形内
     *
     * @param ax 三角形第一个点的X轴坐标
     * @param ay 三角形第一个点的Y轴坐标
     * @param bx 三角形第二个点的X轴坐标
     * @param by 三角形第二个点的Y轴坐标
     * @param cx 三角形第三个点的X轴坐标
     * @param cy 三角形第三个点的Y轴坐标
     * @param px 被检查点的X轴坐标
     * @param py 被检查点的Y轴坐标
     */
    function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
        return (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 &&
            (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 &&
            (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0;
    }
    /**
     * check if a diagonal between two polygon nodes is valid (lies in polygon interior)
     *
     * 检查两个多边形节点之间的对角线是否有效(位于多边形内部)
     *
     * @param a 多边形顶点a
     * @param b 多边形顶点b
     */
    function isValidDiagonal(a, b) {
        return a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) && // dones't intersect other edges
            (locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b) && // locally visible
                (area(a.prev, a, b.prev) || area(a, b.prev, b)) || // does not create opposite-facing sectors
                equals(a, b) && area(a.prev, a, a.next) > 0 && area(b.prev, b, b.next) > 0); // special zero-length case
    }
    /**
     * signed area of a triangle
     *
     * 计算三角形的带符号面积
     *
     * @param p 三角形第一个点
     * @param q 三角形第二个点
     * @param r 三角形第三个点
     */
    function area(p, q, r) {
        return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    }
    /**
     * check if two points are equal
     *
     * 判断两个点是否相等
     *
     * @param p1 第一个点
     * @param p2 第二个点
     */
    function equals(p1, p2) {
        return p1.x === p2.x && p1.y === p2.y;
    }
    /**
     * check if two segments intersect
     *
     * 检查两条线段是否相交
     *
     * @param p1 第一条线段起点
     * @param q1 第一条线段终点
     * @param p2 第二条线段起点
     * @param q2 第二条线段终点
     */
    function intersects(p1, q1, p2, q2) {
        var o1 = sign(area(p1, q1, p2));
        var o2 = sign(area(p1, q1, q2));
        var o3 = sign(area(p2, q2, p1));
        var o4 = sign(area(p2, q2, q1));
        // 正常相交情况
        if (o1 !== o2 && o3 !== o4)
            return true; // general case
        // 处理4种3点共线情况
        if (o1 === 0 && onSegment(p1, p2, q1))
            return true; // p1, q1 and p2 are collinear and p2 lies on p1q1
        if (o2 === 0 && onSegment(p1, q2, q1))
            return true; // p1, q1 and q2 are collinear and q2 lies on p1q1
        if (o3 === 0 && onSegment(p2, p1, q2))
            return true; // p2, q2 and p1 are collinear and p1 lies on p2q2
        if (o4 === 0 && onSegment(p2, q1, q2))
            return true; // p2, q2 and q1 are collinear and q1 lies on p2q2
        return false;
    }
    /**
     * for collinear points p, q, r, check if point q lies on segment pr
     *
     * 对于共线点p, q, r，检查点q是否在线段pr上
     *
     * @param p 线段起点
     * @param q 被检测的点
     * @param r 线段中点
     */
    function onSegment(p, q, r) {
        return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
    }
    /**
     * 取数字符号
     *
     * @param num 数字
     */
    function sign(num) {
        return num > 0 ? 1 : num < 0 ? -1 : 0;
    }
    /**
     * check if a polygon diagonal intersects any polygon segments
     *
     * 检查一个多边形的对角线是否与任何多边形线段相交
     *
     * @param a 第一个节点
     * @param b 第二个节点
     */
    function intersectsPolygon(a, b) {
        var p = a;
        do {
            // 排除与对角线ab连接的边进行相交测试
            if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i &&
                intersects(p, p.next, a, b))
                return true;
            p = p.next;
        } while (p !== a);
        return false;
    }
    /**
     * check if a polygon diagonal is locally inside the polygon
     *
     * 检查多边形的对角线是否局部位于多边形内部
     *
     * 判断出ab对角线是否从a点进入多边形内部，从而判断出对角线ab是否局部位于多边形内部。
     *
     * @param a 第一个节点
     * @param b 第二个节点
     *
     * @todo locallyOutside?
     */
    function locallyInside(a, b) {
        return area(a.prev, a, a.next) < 0 ? // 判断a为多边形凸点或者凹点
            area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 : // 判断a为凸点情况
            area(a, b, a.prev) < 0 || area(a, a.next, b) < 0; // 判断a为凹点情况
    }
    /**
     * check if the middle point of a polygon diagonal is inside the polygon
     *
     * 检查两个节点的对角线中点是否在多边形内部
     *
     * @param a 第一个节点
     * @param b 第二个节点
     */
    function middleInside(a, b) {
        var p = a, inside = false;
        var px = (a.x + b.x) / 2, py = (a.y + b.y) / 2;
        do {
            // 以该点为起点作一条朝向正X轴方向的射线，计算与多边形的边相交的次数，奇数次表示在多边形内部，否则在外部。
            if (((p.y > py) !== (p.next.y > py)) && p.next.y !== p.y &&
                (px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x))
                inside = !inside;
            p = p.next;
        } while (p !== a);
        return inside;
    }
    /**
     * link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
     * if one belongs to the outer ring and another to a hole, it merges it into a single ring
     *
     * 用桥连接两个多边形顶点; 如果顶点属于同一个环，它将多边形一分为二;
     * 如果一个属于外环，另一个属于洞，它合并成一个环。
     *
     * @param a 外环节点
     * @param b 内环节点
     */
    function splitPolygon(a, b) {
        var a2 = new Node(a.i, a.x, a.y), b2 = new Node(b.i, b.x, b.y), an = a.next, bp = b.prev;
        a.next = b;
        b.prev = a;
        a2.next = an;
        an.prev = a2;
        b2.next = a2;
        a2.prev = b2;
        bp.next = b2;
        b2.prev = bp;
        return b2;
    }
    /**
     * create a node and optionally link it with previous one (in a circular doubly linked list)
     *
     * 创建一个节点，并可选地与上一个节点链接(在双向循环链表中)
     *
     * @param i 在顶点数组中的索引
     * @param x 节点所在X轴坐标
     * @param y 节点所在Y轴坐标
     * @param last 双向循环链表中最后一个节点
     */
    function insertNode(i, x, y, last) {
        var p = new Node(i, x, y);
        if (!last) {
            p.prev = p;
            p.next = p;
        }
        else {
            p.next = last.next;
            p.prev = last;
            last.next.prev = p;
            last.next = p;
        }
        return p;
    }
    /**
     * 移除节点
     *
     * @param p 被移除的节点
     */
    function removeNode(p) {
        p.next.prev = p.prev;
        p.prev.next = p.next;
        if (p.prevZ)
            p.prevZ.nextZ = p.nextZ;
        if (p.nextZ)
            p.nextZ.prevZ = p.prevZ;
    }
    var Node = /** @class */ (function () {
        function Node(i, x, y) {
            /**
             * z-order curve value
             */
            this.z = null;
            /**
             * previous node in z-order
             */
            this.prevZ = null;
            /**
             * next node in z-order
             */
            this.nextZ = null;
            /**
             * 多边形环中的前一个顶点节点
             */
            this.prev = null;
            /**
             * 多边形环中的下一个顶点节点
             */
            this.next = null;
            /**
             * 否为 Steiner Point?
             *
             * @todo 没理解
             * @see https://en.wikipedia.org/wiki/Steiner_point_(triangle)
             */
            this.steiner = false;
            this.i = i;
            this.x = x;
            this.y = y;
        }
        return Node;
    }());
    /**
     * 求有符号的多边形面积总和。正面时面积为正值，否则为负值。
     *
     * @param data 多边形顶点数据
     * @param start 顶点起始索引
     * @param end 顶点终止索引
     * @param dim 是否顺时针方向
     */
    function signedArea(data, start, end, dim) {
        var sum = 0;
        for (var i = start, j = end - dim; i < end; i += dim) {
            sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
            j = i;
        }
        return sum;
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var ShapeUtils = /** @class */ (function () {
        function ShapeUtils() {
        }
        /**
         * 计算多边形面积
         * @param contour 多边形轮廓，使用顶点数组表示。
         */
        ShapeUtils.area = function (contour) {
            var n = contour.length;
            var a = 0.0;
            for (var p = n - 1, q = 0; q < n; p = q++) {
                a += contour[p].x * contour[q].y - contour[q].x * contour[p].y;
            }
            return a * 0.5;
        };
        /**
         * 判断多边形是否为顺时针方向
         *
         * @param contour 多边形轮廓，使用顶点数组表示。
         */
        ShapeUtils.isClockWise = function (contour) {
            return ShapeUtils.area(contour) < 0;
        };
        /**
         * 三角化多边形
         *
         * @param contour 多边形轮廓，使用顶点数组表示。
         * @param holes 孔洞多边形数组，每个孔洞多边形使用顶点数组表示。
         */
        ShapeUtils.triangulateShape = function (contour, holes) {
            var vertices = []; // flat array of vertices like [ x0,y0, x1,y1, x2,y2, ... ]
            var holeIndices = []; // array of hole indices
            var faces = []; // final array of vertex indices like [ [ a,b,d ], [ b,c,d ] ]
            removeDupEndPts(contour);
            addContour(vertices, contour);
            //
            var holeIndex = contour.length;
            holes.forEach(removeDupEndPts);
            for (var i = 0; i < holes.length; i++) {
                holeIndices.push(holeIndex);
                holeIndex += holes[i].length;
                addContour(vertices, holes[i]);
            }
            //
            var triangles = feng3d.Earcut.triangulate(vertices, holeIndices);
            //
            for (var i = 0; i < triangles.length; i += 3) {
                faces.push(triangles.slice(i, i + 3));
            }
            return faces;
        };
        return ShapeUtils;
    }());
    feng3d.ShapeUtils = ShapeUtils;
    ;
    function removeDupEndPts(points) {
        var l = points.length;
        if (l > 2 && points[l - 1].equals(points[0])) {
            points.pop();
        }
    }
    function addContour(vertices, contour) {
        for (var i = 0; i < contour.length; i++) {
            vertices.push(contour[i].x);
            vertices.push(contour[i].y);
        }
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * Bezier Curves formulas obtained from
     * http://en.wikipedia.org/wiki/Bézier_curve
     */
    var Interpolations = /** @class */ (function () {
        function Interpolations() {
        }
        Interpolations.CatmullRom = function (t, p0, p1, p2, p3) {
            var v0 = (p2 - p0) * 0.5;
            var v1 = (p3 - p1) * 0.5;
            var t2 = t * t;
            var t3 = t * t2;
            return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
        };
        Interpolations.QuadraticBezier = function (t, p0, p1, p2) {
            return QuadraticBezierP0(t, p0) + QuadraticBezierP1(t, p1) +
                QuadraticBezierP2(t, p2);
        };
        Interpolations.CubicBezier = function (t, p0, p1, p2, p3) {
            return CubicBezierP0(t, p0) + CubicBezierP1(t, p1) + CubicBezierP2(t, p2) +
                CubicBezierP3(t, p3);
        };
        return Interpolations;
    }());
    feng3d.Interpolations = Interpolations;
})(feng3d || (feng3d = {}));
function QuadraticBezierP0(t, p) {
    var k = 1 - t;
    return k * k * p;
}
function QuadraticBezierP1(t, p) {
    return 2 * (1 - t) * t * p;
}
function QuadraticBezierP2(t, p) {
    return t * t * p;
}
function CubicBezierP0(t, p) {
    var k = 1 - t;
    return k * k * k * p;
}
function CubicBezierP1(t, p) {
    var k = 1 - t;
    return 3 * k * k * t * p;
}
function CubicBezierP2(t, p) {
    return 3 * (1 - t) * t * t * p;
}
function CubicBezierP3(t, p) {
    return t * t * t * p;
}
var feng3d;
(function (feng3d) {
    /**
     * An extensible curve object which contains methods for interpolation
     */
    var Curve = /** @class */ (function () {
        function Curve() {
            /**
             * This value determines the amount of divisions when calculating the cumulative segment lengths of a curve via .getLengths.
             * To ensure precision when using methods like .getSpacedPoints, it is recommended to increase .arcLengthDivisions if the curve is very large.
             */
            this.arcLengthDivisions = 200;
            this.needsUpdate = false;
        }
        Curve.prototype.getResolution = function (divisions) {
            return divisions;
        };
        /**
         * Virtual base class method to overwrite and implement in subclasses
         *
         * - t [0 .. 1]
         * Returns a vector for point t of the curve where t is between 0 and 1
         */
        Curve.prototype.getPoint = function (t, optionalTarget) {
            console.warn('THREE.Curve: .getPoint() not implemented.');
            return null;
        };
        /**
         * Get point at relative position in curve according to arc length
         * Returns a vector for point at relative position in curve according to arc length
         *
         * @param u [0 .. 1]
         * @param optionalTarget
         */
        Curve.prototype.getPointAt = function (u, optionalTarget) {
            var t = this.getUtoTmapping(u);
            return this.getPoint(t, optionalTarget);
        };
        /**
         * Get sequence of points using getPoint( t )
         */
        Curve.prototype.getPoints = function (divisions) {
            if (divisions === void 0) { divisions = 5; }
            var points = [];
            for (var d = 0; d <= divisions; d++) {
                points.push(this.getPoint(d / divisions));
            }
            return points;
        };
        /**
         * Get sequence of equi-spaced points using getPointAt( u )
         */
        Curve.prototype.getSpacedPoints = function (divisions) {
            if (divisions === undefined)
                divisions = 5;
            var points = [];
            for (var d = 0; d <= divisions; d++) {
                points.push(this.getPointAt(d / divisions));
            }
            return points;
        };
        /**
         * Get total curve arc length
         */
        Curve.prototype.getLength = function () {
            var lengths = this.getLengths();
            return lengths[lengths.length - 1];
        };
        /**
         * Get list of cumulative segment lengths
         */
        Curve.prototype.getLengths = function (divisions) {
            if (divisions === undefined)
                divisions = this.arcLengthDivisions;
            if (this.cacheArcLengths && (this.cacheArcLengths.length === divisions + 1) && !this.needsUpdate) {
                return this.cacheArcLengths;
            }
            this.needsUpdate = false;
            var cache = [];
            var current, last = this.getPoint(0);
            var sum = 0;
            cache.push(0);
            for (var p = 1; p <= divisions; p++) {
                current = this.getPoint(p / divisions);
                sum += current.distance(last);
                cache.push(sum);
                last = current;
            }
            this.cacheArcLengths = cache;
            return cache;
        };
        /**
         * Update the cumlative segment distance cache
         */
        Curve.prototype.updateArcLengths = function () {
            this.needsUpdate = true;
            this.getLengths();
        };
        /**
         * Given u ( 0 .. 1 ), get a t to find p. This gives you points which are equi distance
         */
        Curve.prototype.getUtoTmapping = function (u, distance) {
            var arcLengths = this.getLengths();
            var i = 0;
            var il = arcLengths.length;
            var targetArcLength; // The targeted u distance value to get
            if (distance) {
                targetArcLength = distance;
            }
            else {
                targetArcLength = u * arcLengths[il - 1];
            }
            // binary search for the index with largest value smaller than target u distance
            var low = 0, high = il - 1, comparison;
            while (low <= high) {
                i = Math.floor(low + (high - low) / 2); // less likely to overflow, though probably not issue here, JS doesn't really have integers, all numbers are floats
                comparison = arcLengths[i] - targetArcLength;
                if (comparison < 0) {
                    low = i + 1;
                }
                else if (comparison > 0) {
                    high = i - 1;
                }
                else {
                    high = i;
                    break;
                }
            }
            i = high;
            if (arcLengths[i] === targetArcLength) {
                return i / (il - 1);
            }
            // we could get finer grain at lengths, or use simple interpolation between two points
            var lengthBefore = arcLengths[i];
            var lengthAfter = arcLengths[i + 1];
            var segmentLength = lengthAfter - lengthBefore;
            // determine where we are between the 'before' and 'after' points
            var segmentFraction = (targetArcLength - lengthBefore) / segmentLength;
            // add that fractional amount to t
            var t = (i + segmentFraction) / (il - 1);
            return t;
        };
        /**
         * Returns a unit vector tangent at t. If the subclassed curve do not implement its tangent derivation, 2 points a small delta apart will be used to find its gradient which seems to give a reasonable approximation
         * getTangent(t: number, optionalTarget?: T): T;
         */
        Curve.prototype.getTangent = function (t, optionalTarget) {
            var delta = 0.0001;
            var t1 = t - delta;
            var t2 = t + delta;
            // Capping in case of danger
            if (t1 < 0)
                t1 = 0;
            if (t2 > 1)
                t2 = 1;
            var pt1 = this.getPoint(t1);
            var pt2 = this.getPoint(t2);
            var tangent = optionalTarget;
            tangent.copy(pt2).sub(pt1).normalize();
            return tangent;
        };
        /**
         * Returns tangent at equidistance point u on the curve
         * getTangentAt(u: number, optionalTarget?: T): T;
         */
        Curve.prototype.getTangentAt = function (u, optionalTarget) {
            var t = this.getUtoTmapping(u);
            return this.getTangent(t, optionalTarget);
        };
        Curve.prototype.computeFrenetFrames = function (segments, closed) {
            // see http://www.cs.indiana.edu/pub/techreports/TR425.pdf
            var normal = new feng3d.Vector3();
            var tangents = [];
            var normals = [];
            var binormals = [];
            var vec = new feng3d.Vector3();
            var mat = new feng3d.Matrix4x4();
            // compute the tangent vectors for each segment on the curve
            var curve3 = this;
            for (var i = 0; i <= segments; i++) {
                var u = i / segments;
                tangents[i] = curve3.getTangentAt(u, new feng3d.Vector3());
                tangents[i].normalize();
            }
            // select an initial normal vector perpendicular to the first tangent vector,
            // and in the direction of the minimum tangent xyz component
            normals[0] = new feng3d.Vector3();
            binormals[0] = new feng3d.Vector3();
            var min = Number.MAX_VALUE;
            var tx = Math.abs(tangents[0].x);
            var ty = Math.abs(tangents[0].y);
            var tz = Math.abs(tangents[0].z);
            if (tx <= min) {
                min = tx;
                normal.set(1, 0, 0);
            }
            if (ty <= min) {
                min = ty;
                normal.set(0, 1, 0);
            }
            if (tz <= min) {
                normal.set(0, 0, 1);
            }
            tangents[0].crossTo(normal, vec).normalize();
            tangents[0].crossTo(vec, normals[0]);
            tangents[0].crossTo(normals[0], binormals[0]);
            // compute the slowly-varying normal and binormal vectors for each segment on the curve
            for (var i = 1; i <= segments; i++) {
                normals[i] = normals[i - 1].clone();
                binormals[i] = binormals[i - 1].clone();
                tangents[i - 1].crossTo(tangents[i], vec);
                if (vec.length > Number.EPSILON) {
                    vec.normalize();
                    var theta = Math.acos(Math.clamp(tangents[i - 1].dot(tangents[i]), -1, 1)); // clamp for floating pt errors
                    mat.fromAxisRotate(vec, theta * Math.RAD2DEG);
                    mat.transformPoint3(normals[i], normals[i]);
                }
                tangents[i].crossTo(normals[i], binormals[i]);
            }
            // if the curve is closed, postprocess the vectors so the first and last normal vectors are the same
            if (closed === true) {
                var theta = Math.acos(Math.clamp(normals[0].dot(normals[segments]), -1, 1));
                theta /= segments;
                if (tangents[0].dot(normals[0].crossTo(normals[segments], vec)) > 0) {
                    theta = -theta;
                }
                for (var i = 1; i <= segments; i++) {
                    // twist a little...
                    mat.fromAxisRotate(tangents[i], theta * i * Math.RAD2DEG).transformPoint3(normals[i], normals[i]);
                    tangents[i].crossTo(normals[i], binormals[i]);
                }
            }
            return {
                tangents: tangents,
                normals: normals,
                binormals: binormals
            };
        };
        return Curve;
    }());
    feng3d.Curve = Curve;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * Curved Path - a curve path is simply a array of connected
     * curves, but retains the api of a curve
     */
    var CurvePath = /** @class */ (function (_super) {
        __extends(CurvePath, _super);
        function CurvePath() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.curves = [];
            _this.autoClose = false; // Automatically closes the path
            return _this;
        }
        CurvePath.prototype.add = function (curve) {
            this.curves.push(curve);
        };
        CurvePath.prototype.closePath = function () {
            // Add a line curve if start and end of lines are not connected
            var startPoint = this.curves[0].getPoint(0);
            var endPoint = this.curves[this.curves.length - 1].getPoint(1);
            if (!startPoint.equals(endPoint)) {
                this.curves.push(new feng3d.LineCurve2(endPoint, startPoint));
            }
        };
        // To get accurate point with reference to
        // entire path distance at time t,
        // following has to be done:
        // 1. Length of each sub path have to be known
        // 2. Locate and identify type of curve
        // 3. Get t for the curve
        // 4. Return curve.getPointAt(t')
        CurvePath.prototype.getPoint = function (t) {
            var d = t * this.getLength();
            var curveLengths = this.getCurveLengths();
            var i = 0;
            // To think about boundaries points.
            while (i < curveLengths.length) {
                if (curveLengths[i] >= d) {
                    var diff = curveLengths[i] - d;
                    var curve = this.curves[i];
                    var segmentLength = curve.getLength();
                    var u = segmentLength === 0 ? 0 : 1 - diff / segmentLength;
                    return curve.getPointAt(u);
                }
                i++;
            }
            return null; // loop where sum != 0, sum > d , sum+1 <d
        };
        // We cannot use the default THREE.Curve getPoint() with getLength() because in
        // THREE.Curve, getLength() depends on getPoint() but in THREE.CurvePath
        // getPoint() depends on getLength
        CurvePath.prototype.getLength = function () {
            var lens = this.getCurveLengths();
            return lens[lens.length - 1];
        };
        // cacheLengths must be recalculated.
        CurvePath.prototype.updateArcLengths = function () {
            this.needsUpdate = true;
            this.cacheLengths = null;
            this.getCurveLengths();
        };
        // Compute lengths and cache them
        // We cannot overwrite getLengths() because UtoT mapping uses it.
        CurvePath.prototype.getCurveLengths = function () {
            // We use cache values if curves and cache array are same length
            if (this.cacheLengths && this.cacheLengths.length === this.curves.length) {
                return this.cacheLengths;
            }
            // Get length of sub-curve
            // Push sums into cached array
            var lengths = [];
            var sums = 0;
            for (var i = 0, l = this.curves.length; i < l; i++) {
                sums += this.curves[i].getLength();
                lengths.push(sums);
            }
            this.cacheLengths = lengths;
            return lengths;
        };
        CurvePath.prototype.getSpacedPoints = function (divisions) {
            if (divisions === void 0) { divisions = 40; }
            var points = [];
            for (var i = 0; i <= divisions; i++) {
                points.push(this.getPoint(i / divisions));
            }
            if (this.autoClose) {
                points.push(points[0]);
            }
            return points;
        };
        CurvePath.prototype.getPoints = function (divisions) {
            if (divisions === void 0) { divisions = 12; }
            var points = [];
            var last;
            for (var i = 0, curves = this.curves; i < curves.length; i++) {
                var curve = curves[i];
                var resolution = curve.getResolution(divisions);
                var pts = curve.getPoints(resolution);
                for (var j = 0; j < pts.length; j++) {
                    var point = pts[j];
                    if (last && last.equals(point))
                        continue; // ensures no consecutive points are duplicates
                    points.push(point);
                    last = point;
                }
            }
            if (this.autoClose && points.length > 1 && !points[points.length - 1].equals(points[0])) {
                points.push(points[0]);
            }
            return points;
        };
        return CurvePath;
    }(feng3d.Curve));
    feng3d.CurvePath = CurvePath;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var Path2 = /** @class */ (function (_super) {
        __extends(Path2, _super);
        function Path2(points) {
            var _this = _super.call(this) || this;
            _this.currentPoint = new feng3d.Vector2();
            if (points) {
                _this.setFromPoints(points);
            }
            return _this;
        }
        Path2.prototype.setFromPoints = function (points) {
            this.moveTo(points[0].x, points[0].y);
            for (var i = 1, l = points.length; i < l; i++) {
                this.lineTo(points[i].x, points[i].y);
            }
            return this;
        };
        Path2.prototype.moveTo = function (x, y) {
            this.currentPoint.set(x, y); // TODO consider referencing vectors instead of copying?
            return this;
        };
        Path2.prototype.lineTo = function (x, y) {
            var curve = new feng3d.LineCurve2(this.currentPoint.clone(), new feng3d.Vector2(x, y));
            this.curves.push(curve);
            this.currentPoint.set(x, y);
            return this;
        };
        Path2.prototype.quadraticCurveTo = function (aCPx, aCPy, aX, aY) {
            var curve = new feng3d.QuadraticBezierCurve2(this.currentPoint.clone(), new feng3d.Vector2(aCPx, aCPy), new feng3d.Vector2(aX, aY));
            this.curves.push(curve);
            this.currentPoint.set(aX, aY);
            return this;
        };
        Path2.prototype.bezierCurveTo = function (aCP1x, aCP1y, aCP2x, aCP2y, aX, aY) {
            var curve = new feng3d.CubicBezierCurve2(this.currentPoint.clone(), new feng3d.Vector2(aCP1x, aCP1y), new feng3d.Vector2(aCP2x, aCP2y), new feng3d.Vector2(aX, aY));
            this.curves.push(curve);
            this.currentPoint.set(aX, aY);
            return this;
        };
        Path2.prototype.splineThru = function (pts) {
            var npts = [this.currentPoint.clone()].concat(pts);
            var curve = new feng3d.SplineCurve2(npts);
            this.curves.push(curve);
            this.currentPoint.copy(pts[pts.length - 1]);
            return this;
        };
        Path2.prototype.arc = function (aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise) {
            if (aX === void 0) { aX = 0; }
            if (aY === void 0) { aY = 0; }
            if (aRadius === void 0) { aRadius = 1; }
            if (aStartAngle === void 0) { aStartAngle = 0; }
            if (aEndAngle === void 0) { aEndAngle = 2 * Math.PI; }
            if (aClockwise === void 0) { aClockwise = false; }
            var x0 = this.currentPoint.x;
            var y0 = this.currentPoint.y;
            this.absarc(aX + x0, aY + y0, aRadius, aStartAngle, aEndAngle, aClockwise);
            return this;
        };
        Path2.prototype.absarc = function (aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise) {
            if (aX === void 0) { aX = 0; }
            if (aY === void 0) { aY = 0; }
            if (aRadius === void 0) { aRadius = 1; }
            if (aStartAngle === void 0) { aStartAngle = 0; }
            if (aEndAngle === void 0) { aEndAngle = 2 * Math.PI; }
            if (aClockwise === void 0) { aClockwise = false; }
            this.absellipse(aX, aY, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise);
            return this;
        };
        Path2.prototype.ellipse = function (aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation) {
            if (aX === void 0) { aX = 0; }
            if (aY === void 0) { aY = 0; }
            if (xRadius === void 0) { xRadius = 1; }
            if (yRadius === void 0) { yRadius = 1; }
            if (aStartAngle === void 0) { aStartAngle = 0; }
            if (aEndAngle === void 0) { aEndAngle = 2 * Math.PI; }
            if (aClockwise === void 0) { aClockwise = false; }
            if (aRotation === void 0) { aRotation = 0; }
            var x0 = this.currentPoint.x;
            var y0 = this.currentPoint.y;
            this.absellipse(aX + x0, aY + y0, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation);
            return this;
        };
        Path2.prototype.absellipse = function (aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation) {
            if (aX === void 0) { aX = 0; }
            if (aY === void 0) { aY = 0; }
            if (xRadius === void 0) { xRadius = 1; }
            if (yRadius === void 0) { yRadius = 1; }
            if (aStartAngle === void 0) { aStartAngle = 0; }
            if (aEndAngle === void 0) { aEndAngle = 2 * Math.PI; }
            if (aClockwise === void 0) { aClockwise = false; }
            if (aRotation === void 0) { aRotation = 0; }
            var curve = new feng3d.EllipseCurve2(aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation);
            if (this.curves.length > 0) {
                // if a previous curve is present, attempt to join
                var firstPoint = curve.getPoint(0);
                if (!firstPoint.equals(this.currentPoint)) {
                    this.lineTo(firstPoint.x, firstPoint.y);
                }
            }
            this.curves.push(curve);
            var lastPoint = curve.getPoint(1);
            this.currentPoint.copy(lastPoint);
            return this;
        };
        return Path2;
    }(feng3d.CurvePath));
    feng3d.Path2 = Path2;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var Shape2 = /** @class */ (function (_super) {
        __extends(Shape2, _super);
        function Shape2(points) {
            var _this = _super.call(this, points) || this;
            _this.holes = [];
            return _this;
        }
        Shape2.prototype.getPointsHoles = function (divisions) {
            var holesPts = [];
            for (var i = 0, l = this.holes.length; i < l; i++) {
                holesPts[i] = this.holes[i].getPoints(divisions);
            }
            return holesPts;
        };
        // get points of shape and holes (keypoints based on segments parameter)
        Shape2.prototype.extractPoints = function (divisions) {
            return {
                shape: this.getPoints(divisions),
                holes: this.getPointsHoles(divisions)
            };
        };
        Shape2.prototype.extractArray = function (divisions) {
            var result = this.extractPoints(divisions);
            // 
            var points = result.shape.reduce(function (pv, cv) { pv.push(cv.x, cv.y); return pv; }, []);
            var holes = result.holes.reduce(function (pv, cv) {
                var arr = cv.reduce(function (pv1, cv1) {
                    pv1.push(cv1.x, cv1.y);
                    return pv1;
                }, []);
                pv.push(arr);
                return pv;
            }, []);
            return { points: points, holes: holes };
        };
        Shape2.prototype.triangulate = function (geometry) {
            if (geometry === void 0) { geometry = { points: [], indices: [] }; }
            var result = this.extractArray();
            //
            Shape2.triangulate(result.points, result.holes, geometry);
            return geometry;
        };
        Shape2.triangulate = function (points, holes, geometry) {
            if (holes === void 0) { holes = []; }
            if (geometry === void 0) { geometry = { points: [], indices: [] }; }
            var verts = geometry.points;
            var indices = geometry.indices;
            if (points.length >= 6) {
                var holeArray = [];
                // Process holes..
                for (var i = 0; i < holes.length; i++) {
                    var hole = holes[i];
                    holeArray.push(points.length / 2);
                    points = points.concat(hole);
                }
                // sort color
                var triangles = feng3d.Earcut.triangulate(points, holeArray, 2);
                if (!triangles) {
                    return;
                }
                var vertPos = verts.length / 2;
                for (var i = 0; i < triangles.length; i += 3) {
                    indices.push(triangles[i] + vertPos);
                    indices.push(triangles[i + 1] + vertPos);
                    indices.push(triangles[i + 2] + vertPos);
                }
                for (var i = 0; i < points.length; i++) {
                    verts.push(points[i]);
                }
            }
            return geometry;
        };
        return Shape2;
    }(feng3d.Path2));
    feng3d.Shape2 = Shape2;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var ShapePath2 = /** @class */ (function () {
        function ShapePath2() {
            this.color = new feng3d.Color4();
            this.subPaths = [];
            this.subPaths = [];
            this.currentPath = null;
        }
        ShapePath2.prototype.moveTo = function (x, y) {
            this.currentPath = new feng3d.Path2();
            this.subPaths.push(this.currentPath);
            this.currentPath.moveTo(x, y);
            return this;
        };
        ShapePath2.prototype.lineTo = function (x, y) {
            this.currentPath.lineTo(x, y);
            return this;
        };
        ShapePath2.prototype.quadraticCurveTo = function (aCPx, aCPy, aX, aY) {
            this.currentPath.quadraticCurveTo(aCPx, aCPy, aX, aY);
            return this;
        };
        ShapePath2.prototype.bezierCurveTo = function (aCP1x, aCP1y, aCP2x, aCP2y, aX, aY) {
            this.currentPath.bezierCurveTo(aCP1x, aCP1y, aCP2x, aCP2y, aX, aY);
            return this;
        };
        ShapePath2.prototype.splineThru = function (pts) {
            this.currentPath.splineThru(pts);
            return this;
        };
        ShapePath2.prototype.closePath = function () {
            this.currentPath.closePath();
        };
        ShapePath2.prototype.toShapes = function (isCCW, noHoles) {
            if (isCCW === void 0) { isCCW = false; }
            if (noHoles === void 0) { noHoles = false; }
            /**
             * 转换没有孔的路径为形状
             *
             * @param inSubpaths
             */
            function toShapesNoHoles(inSubpaths) {
                var shapes = [];
                for (var i = 0, l = inSubpaths.length; i < l; i++) {
                    var tmpPath_1 = inSubpaths[i];
                    var tmpShape_1 = new feng3d.Shape2();
                    tmpShape_1.curves = tmpPath_1.curves;
                    shapes.push(tmpShape_1);
                }
                return shapes;
            }
            /**
             * 判断点是否在多边形内
             * @param inPt
             * @param inPolygon
             */
            function isPointInsidePolygon(inPt, inPolygon) {
                var polyLen = inPolygon.length;
                // inPt on polygon contour => immediate success    or
                // toggling of inside/outside at every single! intersection point of an edge
                //  with the horizontal line through inPt, left of inPt
                //  not counting lowerY endpoints of edges and whole edges on that line
                var inside = false;
                for (var p = polyLen - 1, q = 0; q < polyLen; p = q++) {
                    var edgeLowPt = inPolygon[p];
                    var edgeHighPt = inPolygon[q];
                    var edgeDx = edgeHighPt.x - edgeLowPt.x;
                    var edgeDy = edgeHighPt.y - edgeLowPt.y;
                    if (Math.abs(edgeDy) > Number.EPSILON) {
                        // not parallel
                        if (edgeDy < 0) {
                            edgeLowPt = inPolygon[q];
                            edgeDx = -edgeDx;
                            edgeHighPt = inPolygon[p];
                            edgeDy = -edgeDy;
                        }
                        if ((inPt.y < edgeLowPt.y) || (inPt.y > edgeHighPt.y))
                            continue;
                        if (inPt.y === edgeLowPt.y) {
                            if (inPt.x === edgeLowPt.x)
                                return true; // inPt is on contour ?
                            // continue;				// no intersection or edgeLowPt => doesn't count !!!
                        }
                        else {
                            var perpEdge = edgeDy * (inPt.x - edgeLowPt.x) - edgeDx * (inPt.y - edgeLowPt.y);
                            if (perpEdge === 0)
                                return true; // inPt is on contour ?
                            if (perpEdge < 0)
                                continue;
                            inside = !inside; // true intersection left of inPt
                        }
                    }
                    else {
                        // parallel or collinear
                        if (inPt.y !== edgeLowPt.y)
                            continue; // parallel
                        // edge lies on the same horizontal line as inPt
                        if (((edgeHighPt.x <= inPt.x) && (inPt.x <= edgeLowPt.x)) ||
                            ((edgeLowPt.x <= inPt.x) && (inPt.x <= edgeHighPt.x)))
                            return true; // inPt: Point on contour !
                        // continue;
                    }
                }
                return inside;
            }
            var subPaths = this.subPaths;
            if (subPaths.length === 0)
                return [];
            // 处理无孔形状
            if (noHoles === true)
                return toShapesNoHoles(subPaths);
            var solid, tmpPath, tmpShape;
            var shapes = [];
            if (subPaths.length === 1) {
                tmpPath = subPaths[0];
                tmpShape = new feng3d.Shape2();
                tmpShape.curves = tmpPath.curves;
                shapes.push(tmpShape);
                return shapes;
            }
            // 第一个是否为空
            var holesFirst = !feng3d.ShapeUtils.isClockWise(subPaths[0].getPoints());
            if (isCCW) // 判断是否为孔
             {
                holesFirst = !holesFirst;
            }
            // console.log("Holes first", holesFirst);
            var betterShapeHoles = [];
            var newShapes = [];
            var newShapeHoles = [];
            var mainIdx = 0;
            var tmpPoints;
            newShapes[mainIdx] = undefined;
            newShapeHoles[mainIdx] = [];
            for (var i = 0, l = subPaths.length; i < l; i++) {
                tmpPath = subPaths[i];
                tmpPoints = tmpPath.getPoints();
                solid = feng3d.ShapeUtils.isClockWise(tmpPoints);
                if (isCCW) // 判断是否为实线
                 {
                    solid = !solid;
                }
                if (solid) {
                    if ((!holesFirst) && (newShapes[mainIdx]))
                        mainIdx++;
                    newShapes[mainIdx] = { s: new feng3d.Shape2(), p: tmpPoints };
                    newShapes[mainIdx].s.curves = tmpPath.curves;
                    if (holesFirst)
                        mainIdx++;
                    newShapeHoles[mainIdx] = [];
                    //console.log('cw', i);
                }
                else {
                    newShapeHoles[mainIdx].push({ h: tmpPath, p: tmpPoints[0] });
                    //console.log('ccw', i);
                }
            }
            // only Holes? -> probably all Shapes with wrong orientation
            if (!newShapes[0])
                return toShapesNoHoles(subPaths);
            if (newShapes.length > 1) {
                var ambiguous = false;
                var toChange = [];
                for (var sIdx = 0, sLen = newShapes.length; sIdx < sLen; sIdx++) {
                    betterShapeHoles[sIdx] = [];
                }
                for (var sIdx = 0, sLen = newShapes.length; sIdx < sLen; sIdx++) {
                    var sho = newShapeHoles[sIdx];
                    for (var hIdx = 0; hIdx < sho.length; hIdx++) {
                        var ho = sho[hIdx];
                        var hole_unassigned = true;
                        for (var s2Idx = 0; s2Idx < newShapes.length; s2Idx++) {
                            if (isPointInsidePolygon(ho.p, newShapes[s2Idx].p)) {
                                if (sIdx !== s2Idx)
                                    toChange.push({ froms: sIdx, tos: s2Idx, hole: hIdx });
                                if (hole_unassigned) {
                                    hole_unassigned = false;
                                    betterShapeHoles[s2Idx].push(ho);
                                }
                                else {
                                    ambiguous = true;
                                }
                            }
                        }
                        if (hole_unassigned) {
                            betterShapeHoles[sIdx].push(ho);
                        }
                    }
                }
                // console.log("ambiguous: ", ambiguous);
                if (toChange.length > 0) {
                    // console.log("to change: ", toChange);
                    if (!ambiguous)
                        newShapeHoles = betterShapeHoles;
                }
            }
            var tmpHoles;
            for (var i = 0, il = newShapes.length; i < il; i++) {
                tmpShape = newShapes[i].s;
                shapes.push(tmpShape);
                tmpHoles = newShapeHoles[i];
                for (var j = 0, jl = tmpHoles.length; j < jl; j++) {
                    tmpShape.holes.push(tmpHoles[j].h);
                }
            }
            //console.log("shape", shapes);
            return shapes;
        };
        return ShapePath2;
    }());
    feng3d.ShapePath2 = ShapePath2;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var Font = /** @class */ (function () {
        function Font(data) {
            this.isCCW = false;
            this.charGeometryCache = {};
            this.data = data;
        }
        Font.prototype.generateShapes = function (text, size, lineHeight, align) {
            if (align === void 0) { align = 'left'; }
            if (size === undefined) {
                size = 100;
            }
            if (lineHeight === undefined) {
                lineHeight = size * 1.25;
            }
            var shapes = [];
            var paths = createPaths(text, size, lineHeight, this.data, align);
            for (var p = 0, pl = paths.length; p < pl; p++) {
                var path_shapes = paths[p].toShapes(this.isCCW);
                for (var i = 0, il = path_shapes.length; i < il; i++) {
                    shapes.push(path_shapes[i]);
                }
            }
            return shapes;
        };
        Font.prototype.generateCharGeometry = function (char, geometry) {
            if (geometry === void 0) { geometry = { points: [], indices: [] }; }
            if (this.charGeometryCache[char]) {
                return this.charGeometryCache[char];
            }
            var _a = createPath(char, 1, 0, 0, this.data), path = _a.path, offsetX = _a.offsetX;
            var shapes = path.toShapes(this.isCCW);
            for (var i = 0, n = shapes.length; i < n; i++) {
                shapes[i].triangulate(geometry);
            }
            return this.charGeometryCache[char] = { geometry: geometry, width: offsetX };
        };
        Font.prototype.calculateGeometry = function (text, fontSize, lineHeight, align, textBaseline, tabCharWidth) {
            if (align === void 0) { align = 'left'; }
            if (textBaseline === void 0) { textBaseline = 'alphabetic'; }
            if (tabCharWidth === void 0) { tabCharWidth = 128; }
            if (lineHeight === undefined) {
                lineHeight = fontSize * 1.25;
            }
            lineHeight = lineHeight / fontSize * this.data.unitsPerEm;
            var textInfo = calculateTextInfo(this, text, tabCharWidth);
            var _a = calculateTextStyle(textInfo, fontSize, lineHeight, align, textBaseline), vertices = _a.vertices, indices = _a.indices;
            var _b = calculateNormalUV(vertices), normals = _b.normals, uvs = _b.uvs;
            return { vertices: vertices, normals: normals, uvs: uvs, indices: indices };
        };
        return Font;
    }());
    feng3d.Font = Font;
    function createPaths(text, size, lineHeight, data, align) {
        if (align === void 0) { align = 'left'; }
        var scale = size / data.unitsPerEm;
        var line_height = lineHeight;
        var paths = [];
        var offsetX = 0;
        var offsetY = 0;
        var lines = text.split('\n');
        var lineWidths = [];
        var maxLineWidth = 0;
        for (var i = 0, ni = lines.length; i < ni; i++) {
            var lineStr = lines[i];
            if (i > 0) {
                offsetX = 0;
            }
            var chars = Array.from ? Array.from(lineStr) : String(lineStr).split(''); // see #13988
            for (var j = 0, nj = chars.length; j < nj; j++) {
                var char = chars[j];
                if (char.charCodeAt(0) === 9) {
                    offsetX += 20;
                }
                else {
                    var glyph = data.glyphs[char] || data.glyphs['?'];
                    if (glyph) {
                        offsetX += glyph.ha * scale;
                    }
                }
            }
            lineWidths[i] = offsetX;
            maxLineWidth = Math.max(maxLineWidth, offsetX);
        }
        for (var i = 0, ni = lines.length; i < ni; i++) {
            var lineStr = lines[i];
            offsetX = 0;
            offsetY = -line_height * i;
            if (align === 'center') {
                offsetX = (maxLineWidth - lineWidths[i]) / 2;
            }
            else if (align === 'right') {
                offsetX = maxLineWidth - lineWidths[i];
            }
            var chars = Array.from ? Array.from(lineStr) : String(lineStr).split(''); // see #13988
            for (var j = 0, nj = chars.length; j < nj; j++) {
                var char = chars[j];
                if (char.charCodeAt(0) === 9) {
                    offsetX += 20;
                }
                else {
                    var ret = createPath(char, scale, offsetX, offsetY, data);
                    offsetX += ret.offsetX;
                    paths.push(ret.path);
                }
            }
        }
        return paths;
    }
    function createPath(char, scale, offsetX, offsetY, data) {
        var glyph = data.glyphs[char] || data.glyphs['?'];
        if (!glyph) {
            console.error('THREE.Font: character "' + char + '" does not exists in font family ' + data.familyName + '.');
            return;
        }
        var path = new feng3d.ShapePath2();
        var x, y, cpx, cpy, cpx1, cpy1, cpx2, cpy2;
        if (glyph.o) {
            var outline = glyph._cachedOutline || (glyph._cachedOutline = glyph.o.split(' '));
            for (var i = 0, l = outline.length; i < l;) {
                var action = outline[i++];
                switch (action) {
                    case 'm': // moveTo
                        x = outline[i++] * scale + offsetX;
                        y = outline[i++] * scale + offsetY;
                        path.moveTo(x, y);
                        break;
                    case 'l': // lineTo
                        x = outline[i++] * scale + offsetX;
                        y = outline[i++] * scale + offsetY;
                        path.lineTo(x, y);
                        break;
                    case 'q': // quadraticCurveTo
                        cpx = outline[i++] * scale + offsetX;
                        cpy = outline[i++] * scale + offsetY;
                        cpx1 = outline[i++] * scale + offsetX;
                        cpy1 = outline[i++] * scale + offsetY;
                        path.quadraticCurveTo(cpx1, cpy1, cpx, cpy);
                        break;
                    case 'b': // bezierCurveTo
                        cpx = outline[i++] * scale + offsetX;
                        cpy = outline[i++] * scale + offsetY;
                        cpx1 = outline[i++] * scale + offsetX;
                        cpy1 = outline[i++] * scale + offsetY;
                        cpx2 = outline[i++] * scale + offsetX;
                        cpy2 = outline[i++] * scale + offsetY;
                        path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, cpx, cpy);
                        break;
                    case 'z':
                        path.closePath();
                        break;
                    default:
                        console.assert(action.trim() == '');
                        break;
                }
            }
        }
        return { offsetX: glyph.ha * scale, path: path };
    }
    function calculateTextInfo(font, text, tabCharWidth) {
        var textInfo = { text: text, font: font, width: 0, numVertices: 0, numIndices: 0, lines: [] };
        //
        var lines = text.split('\n');
        for (var i = 0, ni = lines.length; i < ni; i++) {
            textInfo.lines[i] = { text: lines[i], width: 0, numVertices: 0, numIndices: 0, chars: [] };
            var lineItem = textInfo.lines[i];
            if (i > 0) {
                lineItem.width = 0;
            }
            var chars = Array.from ? Array.from(lineItem.text) : String(lineItem.text).split(''); // see #13988
            for (var j = 0, nj = chars.length; j < nj; j++) {
                var char = chars[j];
                if (char === '\t') {
                    lineItem.width += tabCharWidth;
                }
                else {
                    var charVertices = font.generateCharGeometry(char);
                    var charItem = lineItem.chars[j] = {
                        text: char,
                        width: charVertices.width,
                        offsetX: lineItem.width,
                        offsetVertices: textInfo.numVertices,
                        offsetIndices: textInfo.numIndices,
                        numVertices: charVertices.geometry.points.length,
                        numIndices: charVertices.geometry.indices.length,
                        geometry: charVertices.geometry,
                    };
                    lineItem.width += charItem.width;
                    lineItem.numVertices += charItem.numVertices;
                    lineItem.numIndices += charItem.numIndices;
                    textInfo.numVertices += charItem.numVertices;
                    textInfo.numIndices += charItem.numIndices;
                }
            }
            textInfo.width = Math.max(textInfo.width, lineItem.width);
        }
        return textInfo;
    }
    function calculateTextStyle(textInfo, fontSize, lineHeight, align, textBaseline) {
        var _a = textInfo.font.data, unitsPerEm = _a.unitsPerEm, ascender = _a.ascender, descender = _a.descender;
        var scale = fontSize / unitsPerEm;
        var vertices = new Float32Array(textInfo.numVertices / 2 * 3);
        var indices = new Uint32Array(textInfo.numIndices);
        var baselineOffsetY = 0;
        if (textBaseline === 'top') {
            baselineOffsetY = ascender;
        }
        else if (textBaseline === 'bottom') {
            baselineOffsetY = descender;
        }
        else if (textBaseline === 'middle') {
            baselineOffsetY = (ascender + descender) / 2;
        }
        else if (textBaseline === 'alphabetic') {
            baselineOffsetY = 0;
        }
        //
        var lines = textInfo.lines, maxLineWidth = textInfo.width;
        for (var i = 0, ni = lines.length; i < ni; i++) {
            var _b = lines[i], lineWidth = _b.width, chars = _b.chars;
            var alignOffsetX = 0;
            var offsetY = -lineHeight * i;
            if (align === 'center') {
                alignOffsetX = (maxLineWidth - lineWidth) / 2;
            }
            else if (align === 'right') {
                alignOffsetX = maxLineWidth - lineWidth;
            }
            for (var j = 0, nj = chars.length; j < nj; j++) {
                var charItem = chars[j];
                if (!charItem) {
                    continue;
                }
                var charOffsetX = charItem.offsetX, offsetVertices = charItem.offsetVertices, offsetIndices = charItem.offsetIndices, geometry = charItem.geometry;
                updateCharGeometry({
                    offsetX: alignOffsetX + charOffsetX, offsetY: offsetY - baselineOffsetY,
                    scale: scale,
                    targetVertices: vertices, targetIndices: indices,
                    offsetVertices: offsetVertices, offsetIndices: offsetIndices,
                    sourceVertices: geometry.points, sourceIndices: geometry.indices
                });
            }
        }
        return { vertices: vertices, indices: indices };
        function updateCharGeometry(_a) {
            var offsetX = _a.offsetX, offsetY = _a.offsetY, scale = _a.scale, targetVertices = _a.targetVertices, targetIndices = _a.targetIndices, offsetVertices = _a.offsetVertices, offsetIndices = _a.offsetIndices, sourceVertices = _a.sourceVertices, sourceIndices = _a.sourceIndices;
            var offsetVertices3 = offsetVertices / 2 * 3;
            var offsetVertices2 = 0;
            for (var i = 0, n = sourceVertices.length / 2; i < n; i++) {
                targetVertices[offsetVertices3++] = (sourceVertices[offsetVertices2++] + offsetX) * scale;
                targetVertices[offsetVertices3++] = -(sourceVertices[offsetVertices2++] + offsetY) * scale;
                targetVertices[offsetVertices3++] = 0;
            }
            var offsetVerticesIndex = offsetVertices / 2;
            for (var i = 0, n = sourceIndices.length; i < n; i++) {
                targetIndices[offsetIndices + i] = sourceIndices[i] + offsetVerticesIndex;
            }
        }
    }
    function calculateNormalUV(vertices) {
        var normals = new Float32Array(vertices.length);
        var uvs = new Float32Array(vertices.length / 3 * 2);
        var verticesIndex = 0;
        var normalsIndex = 0;
        var uvsIndex = 0;
        for (var i = 0, n = vertices.length / 3; i < n; i++) {
            uvs[uvsIndex++] = vertices[verticesIndex++];
            uvs[uvsIndex++] = vertices[verticesIndex++];
            verticesIndex++;
            //
            normals[normalsIndex++] = 0;
            normals[normalsIndex++] = 0;
            normals[normalsIndex++] = 1;
        }
        return { normals: normals, uvs: uvs };
    }
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var LineCurve2 = /** @class */ (function (_super) {
        __extends(LineCurve2, _super);
        function LineCurve2(v1, v2) {
            if (v1 === void 0) { v1 = new feng3d.Vector2(); }
            if (v2 === void 0) { v2 = new feng3d.Vector2(); }
            var _this = _super.call(this) || this;
            _this.v1 = v1;
            _this.v2 = v2;
            return _this;
        }
        LineCurve2.prototype.getResolution = function (divisions) {
            return 1;
        };
        LineCurve2.prototype.getPoint = function (t, optionalTarget) {
            var point = optionalTarget || new feng3d.Vector2();
            if (t === 1) {
                point.copy(this.v2);
            }
            else {
                point.copy(this.v2).sub(this.v1);
                point.scaleNumber(t).add(this.v1);
            }
            return point;
        };
        // Line curve is linear, so we can overwrite default getPointAt
        LineCurve2.prototype.getPointAt = function (u, optionalTarget) {
            return this.getPoint(u, optionalTarget);
        };
        LineCurve2.prototype.getTangent = function (t, optionalTarget) {
            if (optionalTarget === void 0) { optionalTarget = new feng3d.Vector2(); }
            var tangent = optionalTarget;
            tangent.copy(this.v2).sub(this.v1).normalize();
            return tangent;
        };
        return LineCurve2;
    }(feng3d.Curve));
    feng3d.LineCurve2 = LineCurve2;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var LineCurve3 = /** @class */ (function (_super) {
        __extends(LineCurve3, _super);
        function LineCurve3(v1, v2) {
            if (v1 === void 0) { v1 = new feng3d.Vector3(); }
            if (v2 === void 0) { v2 = new feng3d.Vector3(); }
            var _this = _super.call(this) || this;
            _this.v1 = v1;
            _this.v2 = v2;
            return _this;
        }
        LineCurve3.prototype.getResolution = function (divisions) {
            return 1;
        };
        LineCurve3.prototype.getPoint = function (t, optionalTarget) {
            if (optionalTarget === void 0) { optionalTarget = new feng3d.Vector3(); }
            var point = optionalTarget;
            if (t === 1) {
                point.copy(this.v2);
            }
            else {
                point.copy(this.v2).sub(this.v1);
                point.multiplyNumber(t).add(this.v1);
            }
            return point;
        };
        // Line curve is linear, so we can overwrite default getPointAt
        LineCurve3.prototype.getPointAt = function (u, optionalTarget) {
            if (optionalTarget === void 0) { optionalTarget = new feng3d.Vector3(); }
            return this.getPoint(u, optionalTarget);
        };
        return LineCurve3;
    }(feng3d.Curve));
    feng3d.LineCurve3 = LineCurve3;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var SplineCurve2 = /** @class */ (function (_super) {
        __extends(SplineCurve2, _super);
        function SplineCurve2(points) {
            if (points === void 0) { points = []; }
            var _this = _super.call(this) || this;
            _this.points = points;
            return _this;
        }
        SplineCurve2.prototype.getResolution = function (divisions) {
            return divisions * this.points.length;
        };
        SplineCurve2.prototype.getPoint = function (t, optionalTarget) {
            var point = optionalTarget || new feng3d.Vector2();
            var points = this.points;
            var p = (points.length - 1) * t;
            var intPoint = Math.floor(p);
            var weight = p - intPoint;
            var p0 = points[intPoint === 0 ? intPoint : intPoint - 1];
            var p1 = points[intPoint];
            var p2 = points[intPoint > points.length - 2 ? points.length - 1 : intPoint + 1];
            var p3 = points[intPoint > points.length - 3 ? points.length - 1 : intPoint + 2];
            point.set(feng3d.Interpolations.CatmullRom(weight, p0.x, p1.x, p2.x, p3.x), feng3d.Interpolations.CatmullRom(weight, p0.y, p1.y, p2.y, p3.y));
            return point;
        };
        return SplineCurve2;
    }(feng3d.Curve));
    feng3d.SplineCurve2 = SplineCurve2;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var EllipseCurve2 = /** @class */ (function (_super) {
        __extends(EllipseCurve2, _super);
        function EllipseCurve2(aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation) {
            if (aX === void 0) { aX = 0; }
            if (aY === void 0) { aY = 0; }
            if (xRadius === void 0) { xRadius = 1; }
            if (yRadius === void 0) { yRadius = 1; }
            if (aStartAngle === void 0) { aStartAngle = 0; }
            if (aEndAngle === void 0) { aEndAngle = 2 * Math.PI; }
            if (aClockwise === void 0) { aClockwise = false; }
            if (aRotation === void 0) { aRotation = 0; }
            var _this = _super.call(this) || this;
            _this.aX = aX;
            _this.aY = aY;
            _this.xRadius = xRadius;
            _this.yRadius = yRadius;
            _this.aStartAngle = aStartAngle;
            _this.aEndAngle = aEndAngle;
            _this.aClockwise = aClockwise;
            _this.aRotation = aRotation;
            return _this;
        }
        EllipseCurve2.prototype.getResolution = function (divisions) {
            return divisions * 2;
        };
        EllipseCurve2.prototype.getPoint = function (t, optionalTarget) {
            if (optionalTarget === void 0) { optionalTarget = new feng3d.Vector2(); }
            var point = optionalTarget;
            var twoPi = Math.PI * 2;
            var deltaAngle = this.aEndAngle - this.aStartAngle;
            var samePoints = Math.abs(deltaAngle) < Number.EPSILON;
            // ensures that deltaAngle is 0 .. 2 PI
            while (deltaAngle < 0)
                deltaAngle += twoPi;
            while (deltaAngle > twoPi)
                deltaAngle -= twoPi;
            if (deltaAngle < Number.EPSILON) {
                if (samePoints) {
                    deltaAngle = 0;
                }
                else {
                    deltaAngle = twoPi;
                }
            }
            if (this.aClockwise === true && !samePoints) {
                if (deltaAngle === twoPi) {
                    deltaAngle = -twoPi;
                }
                else {
                    deltaAngle = deltaAngle - twoPi;
                }
            }
            var angle = this.aStartAngle + t * deltaAngle;
            var x = this.aX + this.xRadius * Math.cos(angle);
            var y = this.aY + this.yRadius * Math.sin(angle);
            if (this.aRotation !== 0) {
                var cos = Math.cos(this.aRotation);
                var sin = Math.sin(this.aRotation);
                var tx = x - this.aX;
                var ty = y - this.aY;
                // Rotate the point about the center of the ellipse.
                x = tx * cos - ty * sin + this.aX;
                y = tx * sin + ty * cos + this.aY;
            }
            return point.set(x, y);
        };
        return EllipseCurve2;
    }(feng3d.Curve));
    feng3d.EllipseCurve2 = EllipseCurve2;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var ArcCurve2 = /** @class */ (function (_super) {
        __extends(ArcCurve2, _super);
        function ArcCurve2(aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise) {
            if (aX === void 0) { aX = 0; }
            if (aY === void 0) { aY = 0; }
            if (aRadius === void 0) { aRadius = 1; }
            if (aStartAngle === void 0) { aStartAngle = 0; }
            if (aEndAngle === void 0) { aEndAngle = 2 * Math.PI; }
            if (aClockwise === void 0) { aClockwise = false; }
            return _super.call(this, aX, aY, aRadius, aRadius, aStartAngle, aEndAngle, aClockwise) || this;
        }
        return ArcCurve2;
    }(feng3d.EllipseCurve2));
    feng3d.ArcCurve2 = ArcCurve2;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * Centripetal CatmullRom Curve - which is useful for avoiding
     * cusps and self-intersections in non-uniform catmull rom curves.
     * http://www.cemyuksel.com/research/catmullrom_param/catmullrom.pdf
     *
     * curve.type accepts centripetal(default), chordal and catmullrom
     * curve.tension is used for catmullrom which defaults to 0.5
     */
    var CatmullRomCurve3 = /** @class */ (function (_super) {
        __extends(CatmullRomCurve3, _super);
        function CatmullRomCurve3(points, closed, curveType, tension) {
            if (points === void 0) { points = []; }
            if (closed === void 0) { closed = false; }
            if (curveType === void 0) { curveType = 'centripetal'; }
            if (tension === void 0) { tension = 0.5; }
            var _this = _super.call(this) || this;
            _this.isCatmullRomCurve3 = true;
            _this.points = points;
            _this.closed = closed;
            _this.curveType = curveType;
            _this.tension = tension;
            return _this;
        }
        CatmullRomCurve3.prototype.getPoint = function (t, optionalTarget) {
            if (optionalTarget === void 0) { optionalTarget = new feng3d.Vector3(); }
            var point = optionalTarget;
            var points = this.points;
            var l = points.length;
            var p = (l - (this.closed ? 0 : 1)) * t;
            var intPoint = Math.floor(p);
            var weight = p - intPoint;
            if (this.closed) {
                intPoint += intPoint > 0 ? 0 : (Math.floor(Math.abs(intPoint) / l) + 1) * l;
            }
            else if (weight === 0 && intPoint === l - 1) {
                intPoint = l - 2;
                weight = 1;
            }
            var p0, p3; // 4 points (p1 & p2 defined below)
            if (this.closed || intPoint > 0) {
                p0 = points[(intPoint - 1) % l];
            }
            else {
                // extrapolate first point
                tmp.copy(points[0]).sub(points[1]).add(points[0]);
                p0 = tmp;
            }
            var p1 = points[intPoint % l];
            var p2 = points[(intPoint + 1) % l];
            if (this.closed || intPoint + 2 < l) {
                p3 = points[(intPoint + 2) % l];
            }
            else {
                // extrapolate last point
                tmp.copy(points[l - 1]).sub(points[l - 2]).add(points[l - 1]);
                p3 = tmp;
            }
            if (this.curveType === 'centripetal' || this.curveType === 'chordal') {
                // init Centripetal / Chordal Catmull-Rom
                var pow = this.curveType === 'chordal' ? 0.5 : 0.25;
                var dt0 = Math.pow(p0.distanceSquared(p1), pow);
                var dt1 = Math.pow(p1.distanceSquared(p2), pow);
                var dt2 = Math.pow(p2.distanceSquared(p3), pow);
                // safety check for repeated points
                if (dt1 < 1e-4)
                    dt1 = 1.0;
                if (dt0 < 1e-4)
                    dt0 = dt1;
                if (dt2 < 1e-4)
                    dt2 = dt1;
                px.initNonuniformCatmullRom(p0.x, p1.x, p2.x, p3.x, dt0, dt1, dt2);
                py.initNonuniformCatmullRom(p0.y, p1.y, p2.y, p3.y, dt0, dt1, dt2);
                pz.initNonuniformCatmullRom(p0.z, p1.z, p2.z, p3.z, dt0, dt1, dt2);
            }
            else if (this.curveType === 'catmullrom') {
                px.initCatmullRom(p0.x, p1.x, p2.x, p3.x, this.tension);
                py.initCatmullRom(p0.y, p1.y, p2.y, p3.y, this.tension);
                pz.initCatmullRom(p0.z, p1.z, p2.z, p3.z, this.tension);
            }
            point.set(px.calc(weight), py.calc(weight), pz.calc(weight));
            return point;
        };
        return CatmullRomCurve3;
    }(feng3d.Curve));
    feng3d.CatmullRomCurve3 = CatmullRomCurve3;
    /*
    Based on an optimized c++ solution in
     - http://stackoverflow.com/questions/9489736/catmull-rom-curve-with-no-cusps-and-no-self-intersections/
     - http://ideone.com/NoEbVM
    
    This CubicPoly class could be used for reusing some variables and calculations,
    but for three.js curve use, it could be possible inlined and flatten into a single function call
    which can be placed in CurveUtils.
    */
    var CubicPoly = /** @class */ (function () {
        function CubicPoly() {
            this.c0 = 0;
            this.c1 = 0;
            this.c2 = 0;
            this.c3 = 0;
        }
        /*
         * Compute coefficients for a cubic polynomial
         *   p(s) = c0 + c1*s + c2*s^2 + c3*s^3
         * such that
         *   p(0) = x0, p(1) = x1
         *  and
         *   p'(0) = t0, p'(1) = t1.
         */
        CubicPoly.prototype.init = function (x0, x1, t0, t1) {
            this.c0 = x0;
            this.c1 = t0;
            this.c2 = -3 * x0 + 3 * x1 - 2 * t0 - t1;
            this.c3 = 2 * x0 - 2 * x1 + t0 + t1;
        };
        CubicPoly.prototype.initCatmullRom = function (x0, x1, x2, x3, tension) {
            this.init(x1, x2, tension * (x2 - x0), tension * (x3 - x1));
        };
        CubicPoly.prototype.initNonuniformCatmullRom = function (x0, x1, x2, x3, dt0, dt1, dt2) {
            // compute tangents when parameterized in [t1,t2]
            var t1 = (x1 - x0) / dt0 - (x2 - x0) / (dt0 + dt1) + (x2 - x1) / dt1;
            var t2 = (x2 - x1) / dt1 - (x3 - x1) / (dt1 + dt2) + (x3 - x2) / dt2;
            // rescale tangents for parametrization in [0,1]
            t1 *= dt1;
            t2 *= dt1;
            this.init(x1, x2, t1, t2);
        };
        CubicPoly.prototype.calc = function (t) {
            var t2 = t * t;
            var t3 = t2 * t;
            return this.c0 + this.c1 * t + this.c2 * t2 + this.c3 * t3;
        };
        return CubicPoly;
    }());
    //
    var tmp = new feng3d.Vector3();
    var px = new CubicPoly(), py = new CubicPoly(), pz = new CubicPoly();
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var CubicBezierCurve2 = /** @class */ (function (_super) {
        __extends(CubicBezierCurve2, _super);
        function CubicBezierCurve2(v0, v1, v2, v3) {
            if (v0 === void 0) { v0 = new feng3d.Vector2(); }
            if (v1 === void 0) { v1 = new feng3d.Vector2(); }
            if (v2 === void 0) { v2 = new feng3d.Vector2(); }
            if (v3 === void 0) { v3 = new feng3d.Vector2(); }
            var _this = _super.call(this) || this;
            _this.v0 = v0;
            _this.v1 = v1;
            _this.v2 = v2;
            _this.v3 = v3;
            return _this;
        }
        CubicBezierCurve2.prototype.getPoint = function (t, optionalTarget) {
            if (optionalTarget === void 0) { optionalTarget = new feng3d.Vector2(); }
            var point = optionalTarget;
            var v0 = this.v0, v1 = this.v1, v2 = this.v2, v3 = this.v3;
            point.set(feng3d.Interpolations.CubicBezier(t, v0.x, v1.x, v2.x, v3.x), feng3d.Interpolations.CubicBezier(t, v0.y, v1.y, v2.y, v3.y));
            return point;
        };
        return CubicBezierCurve2;
    }(feng3d.Curve));
    feng3d.CubicBezierCurve2 = CubicBezierCurve2;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var CubicBezierCurve3 = /** @class */ (function (_super) {
        __extends(CubicBezierCurve3, _super);
        function CubicBezierCurve3(v0, v1, v2, v3) {
            if (v0 === void 0) { v0 = new feng3d.Vector3(); }
            if (v1 === void 0) { v1 = new feng3d.Vector3(); }
            if (v2 === void 0) { v2 = new feng3d.Vector3(); }
            if (v3 === void 0) { v3 = new feng3d.Vector3(); }
            var _this = _super.call(this) || this;
            _this.v0 = v0;
            _this.v1 = v1;
            _this.v2 = v2;
            _this.v3 = v3;
            return _this;
        }
        CubicBezierCurve3.prototype.getPoint = function (t, optionalTarget) {
            if (optionalTarget === void 0) { optionalTarget = new feng3d.Vector3(); }
            var point = optionalTarget;
            var v0 = this.v0, v1 = this.v1, v2 = this.v2, v3 = this.v3;
            point.set(feng3d.Interpolations.CubicBezier(t, v0.x, v1.x, v2.x, v3.x), feng3d.Interpolations.CubicBezier(t, v0.y, v1.y, v2.y, v3.y), feng3d.Interpolations.CubicBezier(t, v0.z, v1.z, v2.z, v3.z));
            return point;
        };
        return CubicBezierCurve3;
    }(feng3d.Curve));
    feng3d.CubicBezierCurve3 = CubicBezierCurve3;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var QuadraticBezierCurve2 = /** @class */ (function (_super) {
        __extends(QuadraticBezierCurve2, _super);
        function QuadraticBezierCurve2(v0, v1, v2) {
            if (v0 === void 0) { v0 = new feng3d.Vector2(); }
            if (v1 === void 0) { v1 = new feng3d.Vector2(); }
            if (v2 === void 0) { v2 = new feng3d.Vector2(); }
            var _this = _super.call(this) || this;
            _this.v0 = v0;
            _this.v1 = v1;
            _this.v2 = v2;
            return _this;
        }
        QuadraticBezierCurve2.prototype.getPoint = function (t, optionalTarget) {
            if (optionalTarget === void 0) { optionalTarget = new feng3d.Vector2(); }
            var point = optionalTarget;
            var v0 = this.v0, v1 = this.v1, v2 = this.v2;
            point.set(feng3d.Interpolations.QuadraticBezier(t, v0.x, v1.x, v2.x), feng3d.Interpolations.QuadraticBezier(t, v0.y, v1.y, v2.y));
            return point;
        };
        return QuadraticBezierCurve2;
    }(feng3d.Curve));
    feng3d.QuadraticBezierCurve2 = QuadraticBezierCurve2;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    var QuadraticBezierCurve3 = /** @class */ (function (_super) {
        __extends(QuadraticBezierCurve3, _super);
        function QuadraticBezierCurve3(v0, v1, v2) {
            if (v0 === void 0) { v0 = new feng3d.Vector3(); }
            if (v1 === void 0) { v1 = new feng3d.Vector3(); }
            if (v2 === void 0) { v2 = new feng3d.Vector3(); }
            var _this = _super.call(this) || this;
            _this.v0 = v0;
            _this.v1 = v1;
            _this.v2 = v2;
            return _this;
        }
        QuadraticBezierCurve3.prototype.getPoint = function (t, optionalTarget) {
            if (optionalTarget === void 0) { optionalTarget = new feng3d.Vector3(); }
            var point = optionalTarget;
            var v0 = this.v0, v1 = this.v1, v2 = this.v2;
            point.set(feng3d.Interpolations.QuadraticBezier(t, v0.x, v1.x, v2.x), feng3d.Interpolations.QuadraticBezier(t, v0.y, v1.y, v2.y), feng3d.Interpolations.QuadraticBezier(t, v0.z, v1.z, v2.z));
            return point;
        };
        return QuadraticBezierCurve3;
    }(feng3d.Curve));
    feng3d.QuadraticBezierCurve3 = QuadraticBezierCurve3;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * 柏林噪音
     *
     * 用于生产随机的噪音贴图
     *
     * @see http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
     * @see https://mrl.nyu.edu/~perlin/noise/
     * @see https://gitee.com/feng3d_admin/noise
     */
    var Noise = /** @class */ (function () {
        /**
         * 构建柏林噪音
         *
         * @param seed 随机种子
         */
        function Noise(seed) {
            if (seed === void 0) { seed = 0; }
            this._seed = 0;
            this._p = [];
            this.seed = seed;
        }
        /**
         * 1D 经典噪音
         *
         * @param x X轴数值
         */
        Noise.prototype.perlin1 = function (x) {
            var perm = this._p;
            // Find unit grid cell containing point
            var X = Math.floor(x);
            // Get relative xyz coordinates of point within that cell
            x = x - X;
            // Wrap the integer cells at 255 (smaller integer period can be introduced here)
            X = X & 255;
            // Calculate a set of eight hashed gradient indices
            var gi00 = perm[X] % 2;
            var gi10 = perm[X + 1] % 2;
            // Calculate noise contributions from each of the eight corners
            var n00 = dot1(grad1[gi00], x);
            var n10 = dot1(grad1[gi10], x - 1);
            // Compute the fade curve value for each of x, y
            var u = fade(x);
            // Interpolate along x the contributions from each of the corners
            var nx0 = mix(n00, n10, u);
            return nx0;
        };
        /**
         * 2D 经典噪音
         *
         * @param x X轴数值
         * @param y Y轴数值
         */
        Noise.prototype.perlin2 = function (x, y) {
            var perm = this._p;
            // Find unit grid cell containing point
            var X = Math.floor(x);
            var Y = Math.floor(y);
            // Get relative xyz coordinates of point within that cell
            x = x - X;
            y = y - Y;
            // Wrap the integer cells at 255 (smaller integer period can be introduced here)
            X = X & 255;
            Y = Y & 255;
            // Calculate a set of eight hashed gradient indices
            var gi00 = perm[X + perm[Y]] % 4;
            var gi10 = perm[X + 1 + perm[Y]] % 4;
            var gi01 = perm[X + perm[Y + 1]] % 4;
            var gi11 = perm[X + 1 + perm[Y + 1]] % 4;
            // Calculate noise contributions from each of the eight corners
            var n00 = dot2(grad2[gi00], x, y);
            var n10 = dot2(grad2[gi10], x - 1, y);
            var n01 = dot2(grad2[gi01], x, y - 1);
            var n11 = dot2(grad2[gi11], x - 1, y - 1);
            // Compute the fade curve value for each of x, y
            var u = fade(x);
            var v = fade(y);
            // Interpolate along x the contributions from each of the corners
            var nx0 = mix(n00, n10, u);
            var nx1 = mix(n01, n11, u);
            // Interpolate the four results along y
            var nxy = mix(nx0, nx1, v);
            return nxy;
        };
        /**
         * 3D 经典噪音
         *
         * @param x X轴数值
         * @param y Y轴数值
         * @param z Z轴数值
         */
        Noise.prototype.perlin3 = function (x, y, z) {
            var perm = this._p;
            // Find unit grid cell containing point
            var X = Math.floor(x);
            var Y = Math.floor(y);
            var Z = Math.floor(z);
            // Get relative xyz coordinates of point within that cell
            x = x - X;
            y = y - Y;
            z = z - Z;
            // Wrap the integer cells at 255 (smaller integer period can be introduced here)
            X = X & 255;
            Y = Y & 255;
            Z = Z & 255;
            // Calculate a set of eight hashed gradient indices
            var gi000 = perm[X + perm[Y + perm[Z]]] % 12;
            var gi100 = perm[X + 1 + perm[Y + perm[Z]]] % 12;
            var gi010 = perm[X + perm[Y + 1 + perm[Z]]] % 12;
            var gi110 = perm[X + 1 + perm[Y + 1 + perm[Z]]] % 12;
            var gi001 = perm[X + perm[Y + perm[Z + 1]]] % 12;
            var gi101 = perm[X + 1 + perm[Y + perm[Z + 1]]] % 12;
            var gi011 = perm[X + perm[Y + 1 + perm[Z + 1]]] % 12;
            var gi111 = perm[X + 1 + perm[Y + 1 + perm[Z + 1]]] % 12;
            // Calculate noise contributions from each of the eight corners
            var n000 = dot(grad3[gi000], x, y, z);
            var n100 = dot(grad3[gi100], x - 1, y, z);
            var n010 = dot(grad3[gi010], x, y - 1, z);
            var n110 = dot(grad3[gi110], x - 1, y - 1, z);
            var n001 = dot(grad3[gi001], x, y, z - 1);
            var n101 = dot(grad3[gi101], x - 1, y, z - 1);
            var n011 = dot(grad3[gi011], x, y - 1, z - 1);
            var n111 = dot(grad3[gi111], x - 1, y - 1, z - 1);
            // Compute the fade curve value for each of x, y, z
            var u = fade(x);
            var v = fade(y);
            var w = fade(z);
            // Interpolate along x the contributions from each of the corners
            var nx00 = mix(n000, n100, u);
            var nx01 = mix(n001, n101, u);
            var nx10 = mix(n010, n110, u);
            var nx11 = mix(n011, n111, u);
            // Interpolate the four results along y
            var nxy0 = mix(nx00, nx10, v);
            var nxy1 = mix(nx01, nx11, v);
            // Interpolate the two last results along z
            var nxyz = mix(nxy0, nxy1, w);
            return nxyz;
        };
        /**
         * N阶经典噪音
         *
         * 如果是1D，2D，3D噪音，最好选用对于函数，perlinN中存在for循环因此效率比perlin3等性能差3到5（8）倍！
         *
         * 满足以下运算
         * perlinN(x) == perlin1(x)
         * perlinN(x,y) == perlin2(x,y)
         * perlinN(x,y,z) == perlin3(x,y,z)
         *
         * @param ps 每个轴的数值
         */
        Noise.prototype.perlinN = function () {
            var ps = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                ps[_i] = arguments[_i];
            }
            var perm = this._p;
            var n = ps.length;
            // 在格子内对应每个轴的位置
            var pp = [];
            // 所属格子对应每个轴的索引
            var PS = [];
            // 在格子内对应每个轴的混合权重
            var PF = [];
            for (var i = 0; i < n; i++) {
                var p = ps[i];
                // 找到所属单元格
                var P = Math.floor(p);
                // 获取所在单元格内的位置
                p = p - P;
                // 单元格以255为周期
                P = P & 255;
                //
                pp[i] = p;
                PS[i] = P;
                // 分别计算每个轴的混合度
                PF[i] = fade(p);
            }
            //
            var gradN = createGrad(n);
            // 边的数量
            var numEdge = gradN.length;
            // if (n > 1)
            // {
            //     console.assert(numEdge == Math.pow(2, n - 1) * n, `边的数量不对！`)
            // }
            //
            var bits = getBits(n);
            var dns = [];
            //
            for (var i = 0, len = bits.length; i < len; i++) {
                var bit = bits[i];
                var bitn = bit.length;
                // 计算索引
                var gi = 0;
                while (bitn > 0) {
                    bitn--;
                    gi = perm[PS[bitn] + bit[bitn] + gi];
                    // if (isNaN(gi))
                    //     debugger;
                }
                // 获取 grad
                var grad = gradN[gi % numEdge];
                bitn = bit.length;
                // 计算点乘 dot运算
                var dn = 0;
                while (bitn > 0) {
                    bitn--;
                    dn += grad[bitn] * (pp[bitn] - bit[bitn]);
                }
                dns[i] = dn;
            }
            // 进行插值
            for (var i = 0; i < n; i++) {
                // 每次前后两个插值
                for (var j = 0, len = dns.length; j < len; j += 2) {
                    dns[j / 2] = mix(dns[j], dns[j + 1], PF[i]);
                }
                // 每波插值后 长度减半
                dns.length = dns.length >> 1;
            }
            // console.assert(dns.length == 1, `结果长度不对！`)
            return dns[0];
        };
        Object.defineProperty(Noise.prototype, "seed", {
            /**
             * This isn't a very good seeding function, but it works ok. It supports 2^16
             * different seed values. Write something better if you need more seeds.
             */
            get: function () {
                return this._seed;
            },
            set: function (v) {
                this._seed = v;
                var p = this._p;
                if (v > 0 && v < 1) {
                    // Scale the seed out
                    v *= 65536;
                }
                v = Math.floor(v);
                if (v < 256) {
                    v |= v << 8;
                }
                for (var i = 0; i < 256; i++) {
                    var v0;
                    if (i & 1) {
                        v0 = permutation[i] ^ (v & 255);
                    }
                    else {
                        v0 = permutation[i] ^ ((v >> 8) & 255);
                    }
                    p[i] = p[i + 256] = v0;
                }
            },
            enumerable: false,
            configurable: true
        });
        return Noise;
    }());
    feng3d.Noise = Noise;
    /**
     *
     * @param n
     *
     * len = 2^(n-1) * n
     */
    function createGrad(n) {
        if (createGradCache[n])
            return createGradCache[n];
        var gradBase = createGradBase(n - 1);
        var grad = [];
        if (n > 1) {
            for (var i = n - 1; i >= 0; i--) {
                for (var j = 0; j < gradBase.length; j++) {
                    var item = gradBase[j].concat();
                    item.splice(i, 0, 0);
                    grad.push(item);
                }
            }
        }
        else {
            grad = gradBase;
        }
        createGradCache[n] = grad;
        return grad;
    }
    feng3d.createGrad = createGrad;
    var createGradCache = {};
    function createGradBase(n) {
        if (n < 2)
            return [
                [1], [-1],
            ];
        var grad = createGradBase(n - 1);
        for (var i = 0, len = grad.length; i < len; i++) {
            var item = grad[i];
            grad[i] = item.concat(1);
            grad[i + len] = item.concat(-1);
        }
        return grad;
    }
    function getBits(n) {
        if (getBitsChace[n])
            return getBitsChace[n];
        if (n < 2)
            return [
                [0], [1],
            ];
        var grad = getBits(n - 1);
        for (var i = 0, len = grad.length; i < len; i++) {
            var item = grad[i];
            grad[i] = item.concat(0);
            grad[i + len] = item.concat(1);
        }
        getBitsChace[n] = grad;
        return grad;
    }
    feng3d.getBits = getBits;
    var getBitsChace = {};
    var grad1 = [
        [1], [-1],
    ];
    var grad2 = [
        [1, 0], [-1, 0],
        [0, 1], [0, -1],
    ];
    var grad3 = [
        [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
        [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
        [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
    ];
    var permutation = [
        151, 160, 137, 91, 90, 15,
        131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
        190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
        88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
        77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
        102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
        135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
        5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
        223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
        129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
        251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
        49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
        138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
    ];
    function dot(g, x, y, z) {
        return g[0] * x + g[1] * y + g[2] * z;
    }
    function dot2(g, x, y) {
        return g[0] * x + g[1] * y;
    }
    function dot1(g, x) {
        return g[0] * x;
    }
    function mix(a, b, t) {
        return (1 - t) * a + t * b;
    }
    function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    feng3d.noise = new Noise();
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * The PixiJS Matrix as a class makes it a lot faster.
     *
     * Here is a representation of it:
     * ```js
     * | a | c | tx|
     * | b | d | ty|
     * | 0 | 0 | 1 |
     * ```
     */
    var Matrix = /** @class */ (function () {
        /**
         * @param {number} [a=1] - x scale
         * @param {number} [b=0] - y skew
         * @param {number} [c=0] - x skew
         * @param {number} [d=1] - y scale
         * @param {number} [tx=0] - x translation
         * @param {number} [ty=0] - y translation
         */
        function Matrix(a, b, c, d, tx, ty) {
            if (a === void 0) { a = 1; }
            if (b === void 0) { b = 0; }
            if (c === void 0) { c = 0; }
            if (d === void 0) { d = 1; }
            if (tx === void 0) { tx = 0; }
            if (ty === void 0) { ty = 0; }
            this.array = null;
            /**
             * @member {number}
             * @default 1
             */
            this.a = a;
            /**
             * @member {number}
             * @default 0
             */
            this.b = b;
            /**
             * @member {number}
             * @default 0
             */
            this.c = c;
            /**
             * @member {number}
             * @default 1
             */
            this.d = d;
            /**
             * @member {number}
             * @default 0
             */
            this.tx = tx;
            /**
             * @member {number}
             * @default 0
             */
            this.ty = ty;
        }
        /**
         * Creates a Matrix object based on the given array. The Element to Matrix mapping order is as follows:
         *
         * a = array[0]
         * b = array[1]
         * c = array[3]
         * d = array[4]
         * tx = array[2]
         * ty = array[5]
         *
         * @param {number[]} array - The array that the matrix will be populated from.
         */
        Matrix.prototype.fromArray = function (array) {
            this.a = array[0];
            this.b = array[1];
            this.c = array[3];
            this.d = array[4];
            this.tx = array[2];
            this.ty = array[5];
        };
        /**
         * sets the matrix properties
         *
         * @param {number} a - Matrix component
         * @param {number} b - Matrix component
         * @param {number} c - Matrix component
         * @param {number} d - Matrix component
         * @param {number} tx - Matrix component
         * @param {number} ty - Matrix component
         *
         * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
         */
        Matrix.prototype.set = function (a, b, c, d, tx, ty) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;
            return this;
        };
        /**
         * Creates an array from the current Matrix object.
         *
         * @param {boolean} transpose - Whether we need to transpose the matrix or not
         * @param {Float32Array} [out=new Float32Array(9)] - If provided the array will be assigned to out
         * @return {number[]} the newly created array which contains the matrix
         */
        Matrix.prototype.toArray = function (transpose, out) {
            if (!this.array) {
                this.array = new Float32Array(9);
            }
            var array = out || this.array;
            if (transpose) {
                array[0] = this.a;
                array[1] = this.b;
                array[2] = 0;
                array[3] = this.c;
                array[4] = this.d;
                array[5] = 0;
                array[6] = this.tx;
                array[7] = this.ty;
                array[8] = 1;
            }
            else {
                array[0] = this.a;
                array[1] = this.c;
                array[2] = this.tx;
                array[3] = this.b;
                array[4] = this.d;
                array[5] = this.ty;
                array[6] = 0;
                array[7] = 0;
                array[8] = 1;
            }
            return array;
        };
        /**
         * Get a new position with the current transformation applied.
         * Can be used to go from a child's coordinate space to the world coordinate space. (e.g. rendering)
         *
         * @param {PIXI.IPointData} pos - The origin
         * @param {PIXI.Point} [newPos] - The point that the new position is assigned to (allowed to be same as input)
         * @return {PIXI.Point} The new point, transformed through this matrix
         */
        Matrix.prototype.apply = function (pos, newPos) {
            newPos = newPos || new feng3d.Vector2();
            var x = pos.x;
            var y = pos.y;
            newPos.x = (this.a * x) + (this.c * y) + this.tx;
            newPos.y = (this.b * x) + (this.d * y) + this.ty;
            return newPos;
        };
        /**
         * Get a new position with the inverse of the current transformation applied.
         * Can be used to go from the world coordinate space to a child's coordinate space. (e.g. input)
         *
         * @param {PIXI.IPointData} pos - The origin
         * @param {PIXI.Point} [newPos] - The point that the new position is assigned to (allowed to be same as input)
         * @return {PIXI.Point} The new point, inverse-transformed through this matrix
         */
        Matrix.prototype.applyInverse = function (pos, newPos) {
            newPos = newPos || new feng3d.Vector2();
            var id = 1 / ((this.a * this.d) + (this.c * -this.b));
            var x = pos.x;
            var y = pos.y;
            newPos.x = (this.d * id * x) + (-this.c * id * y) + (((this.ty * this.c) - (this.tx * this.d)) * id);
            newPos.y = (this.a * id * y) + (-this.b * id * x) + (((-this.ty * this.a) + (this.tx * this.b)) * id);
            return newPos;
        };
        /**
         * Translates the matrix on the x and y.
         *
         * @param {number} x - How much to translate x by
         * @param {number} y - How much to translate y by
         * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
         */
        Matrix.prototype.translate = function (x, y) {
            this.tx += x;
            this.ty += y;
            return this;
        };
        /**
         * Applies a scale transformation to the matrix.
         *
         * @param {number} x - The amount to scale horizontally
         * @param {number} y - The amount to scale vertically
         * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
         */
        Matrix.prototype.scale = function (x, y) {
            this.a *= x;
            this.d *= y;
            this.c *= x;
            this.b *= y;
            this.tx *= x;
            this.ty *= y;
            return this;
        };
        /**
         * Applies a rotation transformation to the matrix.
         *
         * @param {number} angle - The angle in radians.
         * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
         */
        Matrix.prototype.rotate = function (angle) {
            var cos = Math.cos(angle);
            var sin = Math.sin(angle);
            var a1 = this.a;
            var c1 = this.c;
            var tx1 = this.tx;
            this.a = (a1 * cos) - (this.b * sin);
            this.b = (a1 * sin) + (this.b * cos);
            this.c = (c1 * cos) - (this.d * sin);
            this.d = (c1 * sin) + (this.d * cos);
            this.tx = (tx1 * cos) - (this.ty * sin);
            this.ty = (tx1 * sin) + (this.ty * cos);
            return this;
        };
        /**
         * Appends the given Matrix to this Matrix.
         *
         * @param {PIXI.Matrix} matrix - The matrix to append.
         * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
         */
        Matrix.prototype.append = function (matrix) {
            var a1 = this.a;
            var b1 = this.b;
            var c1 = this.c;
            var d1 = this.d;
            this.a = (matrix.a * a1) + (matrix.b * c1);
            this.b = (matrix.a * b1) + (matrix.b * d1);
            this.c = (matrix.c * a1) + (matrix.d * c1);
            this.d = (matrix.c * b1) + (matrix.d * d1);
            this.tx = (matrix.tx * a1) + (matrix.ty * c1) + this.tx;
            this.ty = (matrix.tx * b1) + (matrix.ty * d1) + this.ty;
            return this;
        };
        /**
         * Sets the matrix based on all the available properties
         *
         * @param {number} x - Position on the x axis
         * @param {number} y - Position on the y axis
         * @param {number} pivotX - Pivot on the x axis
         * @param {number} pivotY - Pivot on the y axis
         * @param {number} scaleX - Scale on the x axis
         * @param {number} scaleY - Scale on the y axis
         * @param {number} rotation - Rotation in radians
         * @param {number} skewX - Skew on the x axis
         * @param {number} skewY - Skew on the y axis
         * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
         */
        Matrix.prototype.setTransform = function (x, y, pivotX, pivotY, scaleX, scaleY, rotation, skewX, skewY) {
            this.a = Math.cos(rotation + skewY) * scaleX;
            this.b = Math.sin(rotation + skewY) * scaleX;
            this.c = -Math.sin(rotation - skewX) * scaleY;
            this.d = Math.cos(rotation - skewX) * scaleY;
            this.tx = x - ((pivotX * this.a) + (pivotY * this.c));
            this.ty = y - ((pivotX * this.b) + (pivotY * this.d));
            return this;
        };
        /**
         * Prepends the given Matrix to this Matrix.
         *
         * @param {PIXI.Matrix} matrix - The matrix to prepend
         * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
         */
        Matrix.prototype.prepend = function (matrix) {
            var tx1 = this.tx;
            if (matrix.a !== 1 || matrix.b !== 0 || matrix.c !== 0 || matrix.d !== 1) {
                var a1 = this.a;
                var c1 = this.c;
                this.a = (a1 * matrix.a) + (this.b * matrix.c);
                this.b = (a1 * matrix.b) + (this.b * matrix.d);
                this.c = (c1 * matrix.a) + (this.d * matrix.c);
                this.d = (c1 * matrix.b) + (this.d * matrix.d);
            }
            this.tx = (tx1 * matrix.a) + (this.ty * matrix.c) + matrix.tx;
            this.ty = (tx1 * matrix.b) + (this.ty * matrix.d) + matrix.ty;
            return this;
        };
        /**
         * Decomposes the matrix (x, y, scaleX, scaleY, and rotation) and sets the properties on to a transform.
         *
         * @param {PIXI.Transform} transform - The transform to apply the properties to.
         * @return {PIXI.Transform} The transform with the newly applied properties
         */
        Matrix.prototype.decompose = function (transform) {
            // sort out rotation / skew..
            var a = this.a;
            var b = this.b;
            var c = this.c;
            var d = this.d;
            var pivotX = transform.pivotX;
            var pivotY = transform.pivotY;
            var skewX = -Math.atan2(-c, d);
            var skewY = Math.atan2(b, a);
            var delta = Math.abs(skewX + skewY);
            if (delta < 0.00001 || Math.abs(Math.PI * 2 - delta) < 0.00001) {
                transform.rotation = skewY;
                transform.skewX = transform.skewY = 0;
            }
            else {
                transform.rotation = 0;
                transform.skewX = skewX;
                transform.skewY = skewY;
            }
            // next set scale
            transform.scaleX = Math.sqrt((a * a) + (b * b));
            transform.scaleY = Math.sqrt((c * c) + (d * d));
            // next set position
            transform.x = this.tx + ((pivotX * a) + (pivotY * c));
            transform.y = this.ty + ((pivotX * b) + (pivotY * d));
            return transform;
        };
        /**
         * Inverts this matrix
         *
         * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
         */
        Matrix.prototype.invert = function () {
            var a1 = this.a;
            var b1 = this.b;
            var c1 = this.c;
            var d1 = this.d;
            var tx1 = this.tx;
            var n = (a1 * d1) - (b1 * c1);
            this.a = d1 / n;
            this.b = -b1 / n;
            this.c = -c1 / n;
            this.d = a1 / n;
            this.tx = ((c1 * this.ty) - (d1 * tx1)) / n;
            this.ty = -((a1 * this.ty) - (b1 * tx1)) / n;
            return this;
        };
        /**
         * Resets this Matrix to an identity (default) matrix.
         *
         * @return {PIXI.Matrix} This matrix. Good for chaining method calls.
         */
        Matrix.prototype.identity = function () {
            this.a = 1;
            this.b = 0;
            this.c = 0;
            this.d = 1;
            this.tx = 0;
            this.ty = 0;
            return this;
        };
        /**
         * Creates a new Matrix object with the same values as this one.
         *
         * @return {PIXI.Matrix} A copy of this matrix. Good for chaining method calls.
         */
        Matrix.prototype.clone = function () {
            var matrix = new Matrix();
            matrix.a = this.a;
            matrix.b = this.b;
            matrix.c = this.c;
            matrix.d = this.d;
            matrix.tx = this.tx;
            matrix.ty = this.ty;
            return matrix;
        };
        /**
         * Changes the values of the given matrix to be the same as the ones in this matrix
         *
         * @param {PIXI.Matrix} matrix - The matrix to copy to.
         * @return {PIXI.Matrix} The matrix given in parameter with its values updated.
         */
        Matrix.prototype.copyTo = function (matrix) {
            matrix.a = this.a;
            matrix.b = this.b;
            matrix.c = this.c;
            matrix.d = this.d;
            matrix.tx = this.tx;
            matrix.ty = this.ty;
            return matrix;
        };
        /**
         * Changes the values of the matrix to be the same as the ones in given matrix
         *
         * @param {PIXI.Matrix} matrix - The matrix to copy from.
         * @return {PIXI.Matrix} this
         */
        Matrix.prototype.copyFrom = function (matrix) {
            this.a = matrix.a;
            this.b = matrix.b;
            this.c = matrix.c;
            this.d = matrix.d;
            this.tx = matrix.tx;
            this.ty = matrix.ty;
            return this;
        };
        // #if _DEBUG
        Matrix.prototype.toString = function () {
            return "[@pixi/math:Matrix a=" + this.a + " b=" + this.b + " c=" + this.c + " d=" + this.d + " tx=" + this.tx + " ty=" + this.ty + "]";
        };
        Object.defineProperty(Matrix, "IDENTITY", {
            // #endif
            /**
             * A default (identity) matrix
             *
             * @static
             * @const
             * @member {PIXI.Matrix}
             */
            get: function () {
                return new Matrix();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Matrix, "TEMP_MATRIX", {
            /**
             * A temp matrix
             *
             * @static
             * @const
             * @member {PIXI.Matrix}
             */
            get: function () {
                return new Matrix();
            },
            enumerable: false,
            configurable: true
        });
        return Matrix;
    }());
    feng3d.Matrix = Matrix;
})(feng3d || (feng3d = {}));
var feng3d;
(function (feng3d) {
    /**
     * Transform that takes care about its versions
     *
     */
    var Transform = /** @class */ (function () {
        function Transform() {
            this._x = 0;
            this._y = 0;
            this._scaleX = 1;
            this._scaleY = 1;
            this._pivotX = 0;
            this._pivotY = 0;
            this._skewX = 0;
            this._skewY = 0;
            /**
             * The world transformation matrix.
             *
             * @member {PIXI.Matrix}
             */
            this.worldTransform = new feng3d.Matrix();
            /**
             * The local transformation matrix.
             *
             * @member {PIXI.Matrix}
             */
            this.localTransform = new feng3d.Matrix();
            /**
             * The rotation amount.
             *
             * @protected
             * @member {number}
             */
            this._rotation = 0;
            /**
             * The X-coordinate value of the normalized local X axis,
             * the first column of the local transformation matrix without a scale.
             *
             * @protected
             * @member {number}
             */
            this._cx = 1;
            /**
             * The Y-coordinate value of the normalized local X axis,
             * the first column of the local transformation matrix without a scale.
             *
             * @protected
             * @member {number}
             */
            this._sx = 0;
            /**
             * The X-coordinate value of the normalized local Y axis,
             * the second column of the local transformation matrix without a scale.
             *
             * @protected
             * @member {number}
             */
            this._cy = 0;
            /**
             * The Y-coordinate value of the normalized local Y axis,
             * the second column of the local transformation matrix without a scale.
             *
             * @protected
             * @member {number}
             */
            this._sy = 1;
            /**
             * The locally unique ID of the local transform.
             *
             * @protected
             * @member {number}
             */
            this._localID = 0;
            /**
             * The locally unique ID of the local transform
             * used to calculate the current local transformation matrix.
             *
             * @protected
             * @member {number}
             */
            this._currentLocalID = 0;
            /**
             * The locally unique ID of the world transform.
             *
             * @protected
             * @member {number}
             */
            this._worldID = 0;
            /**
             * The locally unique ID of the parent's world transform
             * used to calculate the current world transformation matrix.
             *
             * @protected
             * @member {number}
             */
            this._parentID = 0;
        }
        Object.defineProperty(Transform.prototype, "x", {
            /**
             * The coordinate of the object relative to the local coordinates of the parent.
             */
            get: function () {
                return this._x;
            },
            set: function (v) {
                if (this._x === v)
                    return;
                this._x = v;
                this.onChange();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (v) {
                if (this._y === v)
                    return;
                this._y = v;
                this.onChange();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "scaleX", {
            /**
             * The scale factor of the object.
             */
            get: function () {
                return this._scaleX;
            },
            set: function (v) {
                if (this._scaleX === v)
                    return;
                this._scaleX = v;
                this.onChange();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "scaleY", {
            get: function () {
                return this._scaleY;
            },
            set: function (v) {
                if (this._scaleY === v)
                    return;
                this._scaleY = v;
                this.onChange();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "pivotX", {
            /**
             * The pivot point of the displayObject that it rotates around.
             */
            get: function () {
                return this._pivotX;
            },
            set: function (v) {
                if (this._pivotX === v)
                    return;
                this._pivotX = v;
                this.onChange();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "pivotY", {
            get: function () {
                return this._pivotY;
            },
            set: function (v) {
                if (this._pivotY === v)
                    return;
                this._pivotY = v;
                this.onChange();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "skewX", {
            /**
             * The skew amount, on the x and y axis.
             */
            get: function () {
                return this._skewX;
            },
            set: function (v) {
                if (this._skewX === v)
                    return;
                this._skewX = v;
                this.updateSkew();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Transform.prototype, "skewY", {
            get: function () {
                return this._skewY;
            },
            set: function (v) {
                if (this._skewY === v)
                    return;
                this._skewY = v;
                this.updateSkew();
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Called when a value changes.
         *
         * @protected
         */
        Transform.prototype.onChange = function () {
            this._localID++;
        };
        /**
         * Called when the skew or the rotation changes.
         *
         * @protected
         */
        Transform.prototype.updateSkew = function () {
            this._cx = Math.cos(this._rotation + this._skewY);
            this._sx = Math.sin(this._rotation + this._skewY);
            this._cy = -Math.sin(this._rotation - this._skewX); // cos, added PI/2
            this._sy = Math.cos(this._rotation - this._skewX); // sin, added PI/2
            this._localID++;
        };
        // #if _DEBUG
        Transform.prototype.toString = function () {
            return "[@pixi/math:Transform "
                + ("position=(" + this.x + ", " + this.y + ") ")
                + ("rotation=" + this.rotation + " ")
                + ("scale=(" + this._scaleX + ", " + this._scaleY + ") ")
                + ("skew=(" + this._skewX + ", " + this._skewY + ") ")
                + "]";
        };
        // #endif
        /**
         * Updates the local transformation matrix.
         */
        Transform.prototype.updateLocalTransform = function () {
            var lt = this.localTransform;
            if (this._localID !== this._currentLocalID) {
                // get the matrix values of the displayobject based on its transform properties..
                lt.a = this._cx * this._scaleX;
                lt.b = this._sx * this._scaleX;
                lt.c = this._cy * this._scaleY;
                lt.d = this._sy * this._scaleY;
                lt.tx = this.x - ((this._pivotX * lt.a) + (this._pivotY * lt.c));
                lt.ty = this.y - ((this._pivotX * lt.b) + (this._pivotY * lt.d));
                this._currentLocalID = this._localID;
                // force an update..
                this._parentID = -1;
            }
        };
        /**
         * Updates the local and the world transformation matrices.
         *
         * @param {PIXI.Transform} parentTransform - The parent transform
         */
        Transform.prototype.updateTransform = function (parentTransform) {
            var lt = this.localTransform;
            if (this._localID !== this._currentLocalID) {
                // get the matrix values of the displayobject based on its transform properties..
                lt.a = this._cx * this._scaleX;
                lt.b = this._sx * this._scaleX;
                lt.c = this._cy * this._scaleY;
                lt.d = this._sy * this._scaleY;
                lt.tx = this.x - ((this._pivotX * lt.a) + (this._pivotY * lt.c));
                lt.ty = this.y - ((this._pivotX * lt.b) + (this._pivotY * lt.d));
                this._currentLocalID = this._localID;
                // force an update..
                this._parentID = -1;
            }
            if (this._parentID !== parentTransform._worldID) {
                // concat the parent matrix with the objects transform.
                var pt = parentTransform.worldTransform;
                var wt = this.worldTransform;
                wt.a = (lt.a * pt.a) + (lt.b * pt.c);
                wt.b = (lt.a * pt.b) + (lt.b * pt.d);
                wt.c = (lt.c * pt.a) + (lt.d * pt.c);
                wt.d = (lt.c * pt.b) + (lt.d * pt.d);
                wt.tx = (lt.tx * pt.a) + (lt.ty * pt.c) + pt.tx;
                wt.ty = (lt.tx * pt.b) + (lt.ty * pt.d) + pt.ty;
                this._parentID = parentTransform._worldID;
                // update the id of the transform..
                this._worldID++;
            }
        };
        /**
         * Decomposes a matrix and sets the transforms properties based on it.
         *
         * @param {PIXI.Matrix} matrix - The matrix to decompose
         */
        Transform.prototype.setFromMatrix = function (matrix) {
            matrix.decompose(this);
            this._localID++;
        };
        Object.defineProperty(Transform.prototype, "rotation", {
            /**
             * The rotation of the object in radians.
             *
             * @member {number}
             */
            get: function () {
                return this._rotation;
            },
            set: function (value) {
                if (this._rotation !== value) {
                    this._rotation = value;
                    this.updateSkew();
                }
            },
            enumerable: false,
            configurable: true
        });
        /**
         * A default (identity) transform
         *
         * @static
         * @constant
         * @member {PIXI.Transform}
         */
        Transform.IDENTITY = new Transform();
        return Transform;
    }());
    feng3d.Transform = Transform;
})(feng3d || (feng3d = {}));
//# sourceMappingURL=index.js.map