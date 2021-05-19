var feng3d;
(function (feng3d) {
    /**
     * 任务
     *
     * 处理 异步任务(函数)串联并联执行功能
     */
    var Task = /** @class */ (function () {
        function Task() {
        }
        /**
         * 并联多个异步函数为一个函数
         *
         * 这些异步函数同时执行
         *
         * @param fns 一组异步函数
         */
        Task.prototype.parallel = function (fns) {
            var result = function (callback) {
                if (fns.length == 0) {
                    callback();
                    return;
                }
                var index = 0;
                fns.forEach(function (fn) {
                    var callbackNum = 0;
                    fn(function () {
                        callbackNum++;
                        if (callbackNum == 1) {
                            index++;
                            if (index == fns.length) {
                                callback();
                            }
                        }
                        else {
                            console.warn((fn.name ? "函数" + fn.name : "匿名函数") + " \u591A\u6B21\u8C03\u7528\u56DE\u8C03\u51FD\u6570\uFF0C\u5F53\u524D\u6B21\u6570 " + callbackNum);
                        }
                    });
                });
            };
            return result;
        };
        /**
         * 串联多个异步函数为一个函数
         *
         * 这些异步函数按顺序依次执行，等待前一个异步函数执行完调用回调后才执行下一个异步函数。
         *
         * @param fns 一组异步函数
         */
        Task.prototype.series = function (fns) {
            var result = function (callback) {
                if (fns.length == 0) {
                    callback();
                    return;
                }
                var index = 0;
                var next = function () {
                    var fn = fns[index];
                    var callbackNum = 0;
                    fn(function () {
                        callbackNum++;
                        if (callbackNum == 1) {
                            index++;
                            if (index < fns.length) {
                                next();
                            }
                            else {
                                callback && callback();
                            }
                        }
                        else {
                            console.warn((fn.name ? "函数" + fn.name : "匿名函数") + " \u591A\u6B21\u8C03\u7528\u56DE\u8C03\u51FD\u6570\uFF0C\u5F53\u524D\u6B21\u6570 " + callbackNum);
                        }
                    });
                };
                next();
            };
            return result;
        };
        /**
         * 创建一组并行同类任务，例如同时加载一组资源，并在回调中返回结果数组
         *
         * @param ps 一组参数
         * @param fn 单一任务函数
         * @param done 完成回调
         */
        Task.prototype.parallelResults = function (ps, fn, done) {
            var map = new Map();
            // 包装函数
            var fns = ps.map(function (p) { return function (callback) {
                fn(p, function (r) {
                    map.set(p, r);
                    callback();
                });
            }; });
            this.parallel(fns)(function () {
                var results = ps.map(function (p) {
                    return map.get(p);
                });
                map.clear();
                done(results);
            });
        };
        /**
         * 创建一组串联同类任务，例如排序加载一组资源
         *
         * @param ps 一组参数
         * @param fn 单一任务函数
         * @param done 完成回调
         */
        Task.prototype.seriesResults = function (ps, fn, done) {
            var map = new Map();
            // 包装函数
            var fns = ps.map(function (p) { return function (callback) {
                fn(p, function (r) {
                    map.set(p, r);
                    callback();
                });
            }; });
            this.series(fns)(function () {
                var results = ps.map(function (p) {
                    return map.get(p);
                });
                map.clear();
                done(results);
            });
        };
        return Task;
    }());
    feng3d.task = new Task();
})(feng3d || (feng3d = {}));
//# sourceMappingURL=index.js.map