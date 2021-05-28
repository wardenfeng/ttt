/*!
 * @feng3d/shortcut - v0.3.3
 *
 * @feng3d/shortcut is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
this.feng3d = this.feng3d || {};
var feng3d = (function (exports, event) {
    'use strict';

    /**
     * 代理 EventTarget, 处理js事件中this关键字问题
     */
    var EventProxy = /*@__PURE__*/(function (EventEmitter) {
        function EventProxy(target) {
            var this$1 = this;

            EventEmitter.call(this);
            this.pageX = 0;
            this.pageY = 0;
            this.clientX = 0;
            this.clientY = 0;
            /**
             * 是否右击
             */
            this.rightmouse = false;
            this.key = "";
            this.keyCode = 0;
            this.deltaY = 0;
            this.listentypes = [];
            /**
             * 处理鼠标按下时同时出发 "mousemove" 事件bug
             */
            this.handleMouseMoveBug = true;
            /**
             * 键盘按下事件
             */
            this.onMouseKey = function (event) {
                // this.clear();
                if (event["clientX"] != undefined) {
                    event = event;
                    this$1.clientX = event.clientX;
                    this$1.clientY = event.clientY;
                    this$1.pageX = event.pageX;
                    this$1.pageY = event.pageY;
                }
                if (event instanceof MouseEvent) {
                    this$1.rightmouse = event.button == 2;
                    // 处理鼠标按下时同时出发 "mousemove" 事件bug
                    if (this$1.handleMouseMoveBug) {
                        if (event.type == "mousedown") {
                            this$1.mousedownposition = { x: event.clientX, y: event.clientY };
                        }
                        if (event.type == "mousemove") {
                            if (this$1.mousedownposition) {
                                if (this$1.mousedownposition.x == event.clientX && this$1.mousedownposition.y == event.clientY) {
                                    // console.log(`由于系统原因，触发mousedown同时触发了mousemove，此处屏蔽mousemove事件派发！`);
                                    return;
                                }
                            }
                        }
                        if (event.type == "mouseup") {
                            this$1.mousedownposition = null;
                        }
                    }
                }
                if (event instanceof KeyboardEvent) {
                    this$1.keyCode = event.keyCode;
                    this$1.key = event.key;
                }
                if (event instanceof WheelEvent) {
                    this$1.deltaY = event.deltaY;
                }
                // 赋值上次鼠标事件值
                // event.clientX = this.clientX;
                // event.clientY = this.clientY;
                // event.pageX = this.pageX;
                // event.pageY = this.pageY;
                this$1.emit(event.type, event);
            };
            this.target = target;
        }

        if ( EventEmitter ) EventProxy.__proto__ = EventEmitter;
        EventProxy.prototype = Object.create( EventEmitter && EventEmitter.prototype );
        EventProxy.prototype.constructor = EventProxy;

        var prototypeAccessors = { target: { configurable: true } };
        prototypeAccessors.target.get = function () {
            return this._target;
        };
        prototypeAccessors.target.set = function (v) {
            var this$1 = this;

            if (this._target == v)
                { return; }
            if (this._target) {
                this.listentypes.forEach(function (element) {
                    this$1._target.removeEventListener(element, this$1.onMouseKey);
                });
            }
            this._target = v;
            if (this._target) {
                this.listentypes.forEach(function (element) {
                    this$1._target.addEventListener(element, this$1.onMouseKey);
                });
            }
        };
        /**
         * 监听一次事件后将会被移除
         * @param type						事件的类型。
         * @param listener					处理事件的侦听器函数。
         * @param thisObject                listener函数作用域
         * @param priority					事件侦听器的优先级。数字越大，优先级越高。默认优先级为 0。
         */
        EventProxy.prototype.once = function once (type, listener, thisObject, priority) {
            this.on(type, listener, thisObject, priority, true);
            return this;
        };
        /**
         * 添加监听
         * @param type						事件的类型。
         * @param listener					处理事件的侦听器函数。
         * @param priority					事件侦听器的优先级。数字越大，优先级越高。默认优先级为 0。
         */
        EventProxy.prototype.on = function on (type, listener, thisObject, priority, once) {
            if ( priority === void 0 ) priority = 0;
            if ( once === void 0 ) once = false;

            EventEmitter.prototype.on.call(this, type, listener, thisObject, priority, once);
            if (this.listentypes.indexOf(type) == -1) {
                this.listentypes.push(type);
                this._target.addEventListener(type, this.onMouseKey);
            }
            return this;
        };
        /**
         * 移除监听
         * @param dispatcher 派发器
         * @param type						事件的类型。
         * @param listener					要删除的侦听器对象。
         */
        EventProxy.prototype.off = function off (type, listener, thisObject) {
            var this$1 = this;

            EventEmitter.prototype.off.call(this, type, listener, thisObject);
            if (!type) {
                this.listentypes.forEach(function (element) {
                    this$1._target.removeEventListener(element, this$1.onMouseKey);
                });
                this.listentypes.length = 0;
            }
            else if (!this.has(type)) {
                this._target.removeEventListener(type, this.onMouseKey);
                this.listentypes.splice(this.listentypes.indexOf(type), 1);
            }
            return this;
        };
        /**
         * 清理数据
         */
        EventProxy.prototype.clear = function clear () {
            this.clientX = 0;
            this.clientY = 0;
            this.rightmouse = false;
            this.key = "";
            this.keyCode = 0;
            this.deltaY = 0;
        };

        Object.defineProperties( EventProxy.prototype, prototypeAccessors );

        return EventProxy;
    }(event.EventEmitter));

    /**
     * 按键状态

     */
    var KeyState = /*@__PURE__*/(function (EventEmitter) {
        function KeyState() {
            EventEmitter.call(this);
            this._keyStateDic = {};
        }

        if ( EventEmitter ) KeyState.__proto__ = EventEmitter;
        KeyState.prototype = Object.create( EventEmitter && EventEmitter.prototype );
        KeyState.prototype.constructor = KeyState;
        /**
         * 按下键
         * @param key 	键名称
         * @param data	携带数据
         */
        KeyState.prototype.pressKey = function pressKey (key, data) {
            // 处理鼠标中键与右键
            if (data instanceof MouseEvent) {
                if (["click", "mousedown", "mouseup"].indexOf(data.type) != -1) {
                    key = ["", "middle", "right"][data.button] + data.type;
                }
            }
            this._keyStateDic[key] = true;
            this.emit(key, data);
        };
        /**
         * 释放键
         * @param key	键名称
         * @param data	携带数据
         */
        KeyState.prototype.releaseKey = function releaseKey (key, data) {
            // 处理鼠标中键与右键
            if (data instanceof MouseEvent) {
                if (["click", "mousedown", "mouseup"].indexOf(data.type) != -1) {
                    key = ["", "middle", "right"][data.button] + data.type;
                }
            }
            this._keyStateDic[key] = false;
            this.emit(key, data);
        };
        /**
         * 获取按键状态
         * @param key 按键名称
         */
        KeyState.prototype.getKeyState = function getKeyState (key) {
            return !!this._keyStateDic[key];
        };

        return KeyState;
    }(event.EventEmitter));

    /**
     * 快捷键捕获
     */
    var ShortCutCapture = function ShortCutCapture(shortCut, key, command, stateCommand, when) {
        this._shortCut = shortCut;
        this._keyState = shortCut.keyState;
        this._key = key;
        this._command = command;
        this._stateCommand = stateCommand;
        this._when = when;
        this._keys = this.getKeys(key);
        this._states = this.getStates(when);
        this._commands = this.getCommands(command);
        this._stateCommands = this.getStateCommand(stateCommand);
        this.init();
    };
    /**
     * 初始化
     */
    ShortCutCapture.prototype.init = function init () {
        for (var i = 0; i < this._keys.length; i++) {
            this._keyState.on(this._keys[i].key, this.onCapture, this);
        }
    };
    /**
     * 处理捕获事件
     */
    ShortCutCapture.prototype.onCapture = function onCapture (event) {
        var inWhen = this.checkActivityStates(this._states);
        var pressKeys = this.checkActivityKeys(this._keys);
        if (pressKeys && inWhen) {
            this.dispatchCommands(this._commands, event);
            this.executeStateCommands(this._stateCommands);
        }
    };
    /**
     * 派发命令
     */
    ShortCutCapture.prototype.dispatchCommands = function dispatchCommands (commands, data) {
        for (var i = 0; i < commands.length; i++) {
            this._shortCut.emit(commands[i], data);
        }
    };
    /**
     * 执行状态命令
     */
    ShortCutCapture.prototype.executeStateCommands = function executeStateCommands (stateCommands) {
        for (var i = 0; i < stateCommands.length; i++) {
            var stateCommand = stateCommands[i];
            if (stateCommand.not)
                { this._shortCut.deactivityState(stateCommand.state); }
            else
                { this._shortCut.activityState(stateCommand.state); }
        }
    };
    /**
     * 检测快捷键是否处于活跃状态
     */
    ShortCutCapture.prototype.checkActivityStates = function checkActivityStates (states) {
        for (var i = 0; i < states.length; i++) {
            if (!this.getState(states[i]))
                { return false; }
        }
        return true;
    };
    /**
     * 获取是否处于指定状态中（支持一个！取反）
     * @param state 状态名称
     */
    ShortCutCapture.prototype.getState = function getState (state) {
        var result = this._shortCut.getState(state.state);
        if (state.not) {
            result = !result;
        }
        return result;
    };
    /**
     * 检测是否按下给出的键
     * @param keys 按键数组
     */
    ShortCutCapture.prototype.checkActivityKeys = function checkActivityKeys (keys) {
        for (var i = 0; i < keys.length; i++) {
            if (!this.getKeyValue(keys[i]))
                { return false; }
        }
        return true;
    };
    /**
     * 获取按键状态（true：按下状态，false：弹起状态）
     */
    ShortCutCapture.prototype.getKeyValue = function getKeyValue (key) {
        var value = this._keyState.getKeyState(key.key);
        if (key.not) {
            value = !value;
        }
        return value;
    };
    /**
     * 获取状态列表
     * @param when		状态字符串
     */
    ShortCutCapture.prototype.getStates = function getStates (when) {
        var states = [];
        if (!when)
            { return states; }
        var state = when.trim();
        if (state.length == 0) {
            return states;
        }
        var stateStrs = state.split("+");
        for (var i = 0; i < stateStrs.length; i++) {
            states.push(new State(stateStrs[i]));
        }
        return states;
    };
    /**
     * 获取键列表
     * @param key		快捷键
     */
    ShortCutCapture.prototype.getKeys = function getKeys (key) {
        var keyStrs = key.split("+");
        var keys = [];
        for (var i = 0; i < keyStrs.length; i++) {
            keys.push(new Key(keyStrs[i]));
        }
        return keys;
    };
    /**
     * 获取命令列表
     * @param command	命令
     */
    ShortCutCapture.prototype.getCommands = function getCommands (command) {
        var commands = [];
        if (!command)
            { return commands; }
        command = command.trim();
        var commandStrs = command.split(",");
        for (var i = 0; i < commandStrs.length; i++) {
            var commandStr = commandStrs[i].trim();
            if (commandStr.length > 0) {
                commands.push(commandStr);
            }
        }
        return commands;
    };
    /**
     * 获取状态命令列表
     * @param stateCommand	状态命令
     */
    ShortCutCapture.prototype.getStateCommand = function getStateCommand (stateCommand) {
        var stateCommands = [];
        if (!stateCommand)
            { return stateCommands; }
        stateCommand = stateCommand.trim();
        var stateCommandStrs = stateCommand.split(",");
        for (var i = 0; i < stateCommandStrs.length; i++) {
            var commandStr = stateCommandStrs[i].trim();
            if (commandStr.length > 0) {
                stateCommands.push(new StateCommand(commandStr));
            }
        }
        return stateCommands;
    };
    /**
     * 销毁
     */
    ShortCutCapture.prototype.destroy = function destroy () {
        for (var i = 0; i < this._keys.length; i++) {
            this._keyState.off(this._keys[i].key, this.onCapture, this);
        }
        this._shortCut = null;
        this._keys = null;
        this._states = null;
    };
    /**
     * 按键
     */
    var Key = function Key(key) {
        key = key.trim();
        if (key.charAt(0) == "!") {
            this.not = true;
            key = key.substr(1).trim();
        }
        this.key = key;
    };
    /**
     * 状态
     */
    var State = function State(state) {
        state = state.trim();
        if (state.charAt(0) == "!") {
            this.not = true;
            state = state.substr(1).trim();
        }
        this.state = state;
    };
    /**
     * 状态命令
     */
    var StateCommand = function StateCommand(state) {
        state = state.trim();
        if (state.charAt(0) == "!") {
            this.not = true;
            state = state.substr(1).trim();
        }
        this.state = state;
    };

    /**
     * 键盘按键字典 （补充常量，a-z以及鼠标按键不必再次列出）
     * 例如 boardKeyDic[17] = "ctrl";
     */
    var boardKeyDic = {
        17: "ctrl",
        16: "shift",
        32: "escape",
        18: "alt",
        46: "del",
    };
    var KeyBoard = function KeyBoard () {};

    KeyBoard.getKey = function getKey (code) {
        var key = boardKeyDic[code];
        if (key == null && 65 <= code && code <= 90) {
            key = String.fromCharCode(code).toLocaleLowerCase();
        }
        return key;
    };
    /**
     * 获取按键值
     * @param key 按键
     */
    KeyBoard.getCode = function getCode (key) {
        key = key.toLocaleLowerCase();
        var code = key.charCodeAt(0);
        if (key.length == 1 && 65 <= code && code <= 90) {
            return code;
        }
        for (var code$1 in boardKeyDic) {
            if (boardKeyDic.hasOwnProperty(code$1)) {
                if (boardKeyDic[code$1] == key)
                    { return Number(code$1); }
            }
        }
        console.error(("无法获取按键 " + key + " 的值！"));
        return code;
    };

    /**
     * 键盘鼠标输入
     */
    var windowEventProxy = new EventProxy(self);

    /**
     * 按键捕获

     */
    var KeyCapture = function KeyCapture(shortcut) {
        /**
         * 捕获的按键字典
         */
        this._mouseKeyDic = {};
        this.shortcut = shortcut;
        this._keyState = shortcut.keyState;
        //
        if (!windowEventProxy) {
            return;
        }
        windowEventProxy.on("keydown", this.onKeydown, this);
        windowEventProxy.on("keyup", this.onKeyup, this);
        //监听鼠标事件
        var mouseEvents = [
            "dblclick",
            "click",
            "mousedown",
            "mouseup",
            "mousemove",
            "mouseover",
            "mouseout" ];
        for (var i = 0; i < mouseEvents.length; i++) {
            windowEventProxy.on(mouseEvents[i], this.onMouseOnce, this);
        }
        windowEventProxy.on("wheel", this.onMousewheel, this);
    };
    /**
     * 鼠标事件
     */
    KeyCapture.prototype.onMouseOnce = function onMouseOnce (event) {
        if (!this.shortcut.enable)
            { return; }
        var mouseKey = event.type;
        this._keyState.pressKey(mouseKey, event.data);
        this._keyState.releaseKey(mouseKey, event.data);
    };
    /**
     * 鼠标事件
     */
    KeyCapture.prototype.onMousewheel = function onMousewheel (event) {
        if (!this.shortcut.enable)
            { return; }
        var mouseKey = event.type;
        this._keyState.pressKey(mouseKey, event.data);
        this._keyState.releaseKey(mouseKey, event.data);
    };
    /**
     * 键盘按下事件
     */
    KeyCapture.prototype.onKeydown = function onKeydown (event) {
        if (!this.shortcut.enable)
            { return; }
        var boardKey = KeyBoard.getKey(event.data.keyCode);
        boardKey = boardKey || event.data.key;
        if (boardKey) {
            boardKey = boardKey.toLocaleLowerCase();
            this._keyState.pressKey(boardKey, event.data);
        }
        else {
            console.error(("无法识别按钮 " + (event.data.key)));
        }
    };
    /**
     * 键盘弹起事件
     */
    KeyCapture.prototype.onKeyup = function onKeyup (event) {
        if (!this.shortcut.enable)
            { return; }
        var boardKey = KeyBoard.getKey(event.data.keyCode);
        boardKey = boardKey || event.data.key;
        if (boardKey) {
            boardKey = boardKey.toLocaleLowerCase();
            this._keyState.releaseKey(boardKey, event.data);
        }
        else {
            console.error(("无法识别按钮 " + (event.data.key)));
        }
    };

    /**
     * 初始化快捷键模块
     *
     * <pre>
    var shortcuts:Array = [ //
    //在按下key1时触发命令command1
    {key: "key1", command: "command1", when: ""}, //
     //在按下key1时触发状态命令改变stateCommand1为激活状态
    {key: "key1", stateCommand: "stateCommand1", when: "state1"}, //
     //处于state1状态时按下key1触发命令command1
    {key: "key1", command: "command1", when: "state1"}, //
    //处于state1状态不处于state2时按下key1与没按下key2触发command1与command2，改变stateCommand1为激活状态，stateCommand2为非激活状态
    {key: "key1+ ! key2", command: "command1,command2", stateCommand: "stateCommand1,!stateCommand2", when: "state1+!state2"}, //
    ];
    //添加快捷键
    shortCut.addShortCuts(shortcuts);
    //监听命令
    Event.on(shortCut,<any>"run", function(e:Event):void
    {
    trace("接受到命令：" + e.type);
    });
     * </pre>
     */
    var ShortCut = /*@__PURE__*/(function (EventEmitter) {
        function ShortCut() {
            EventEmitter.call(this);
            /**
             * 启动
             */
            this.enable = true;
            this.keyState = new KeyState();
            this.keyCapture = new KeyCapture(this);
            this.captureDic = {};
            this.stateDic = {};
        }

        if ( EventEmitter ) ShortCut.__proto__ = EventEmitter;
        ShortCut.prototype = Object.create( EventEmitter && EventEmitter.prototype );
        ShortCut.prototype.constructor = ShortCut;
        /**
         * 添加快捷键
         * @param shortcuts		快捷键列表
         */
        ShortCut.prototype.addShortCuts = function addShortCuts (shortcuts) {
            for (var i = 0; i < shortcuts.length; i++) {
                var shortcut = shortcuts[i];
                var shortcutUniqueKey = this.getShortcutUniqueKey(shortcut);
                this.captureDic[shortcutUniqueKey] = this.captureDic[shortcutUniqueKey] || new ShortCutCapture(this, shortcut.key, shortcut.command, shortcut.stateCommand, shortcut.when);
            }
        };
        /**
         * 删除快捷键
         * @param shortcuts		快捷键列表
         */
        ShortCut.prototype.removeShortCuts = function removeShortCuts (shortcuts) {
            for (var i = 0; i < shortcuts.length; i++) {
                var shortcutUniqueKey = this.getShortcutUniqueKey(shortcuts[i]);
                var shortCutCapture = this.captureDic[shortcutUniqueKey];
                if (ShortCutCapture != null) {
                    shortCutCapture.destroy();
                }
                delete this.captureDic[shortcutUniqueKey];
            }
        };
        /**
         * 移除所有快捷键
         */
        ShortCut.prototype.removeAllShortCuts = function removeAllShortCuts () {
            var this$1 = this;

            var keys = [];
            var key;
            for (key in this.captureDic) {
                keys.push(key);
            }
            keys.forEach(function (key) {
                var shortCutCapture = this$1.captureDic[key];
                shortCutCapture.destroy();
                delete this$1.captureDic[key];
            });
        };
        /**
         * 激活状态
         * @param state 状态名称
         */
        ShortCut.prototype.activityState = function activityState (state) {
            this.stateDic[state] = true;
        };
        /**
         * 取消激活状态
         * @param state 状态名称
         */
        ShortCut.prototype.deactivityState = function deactivityState (state) {
            delete this.stateDic[state];
        };
        /**
         * 获取状态
         * @param state 状态名称
         */
        ShortCut.prototype.getState = function getState (state) {
            return !!this.stateDic[state];
        };
        /**
         * 获取快捷键唯一字符串
         */
        ShortCut.prototype.getShortcutUniqueKey = function getShortcutUniqueKey (shortcut) {
            return shortcut.key + "," + shortcut.command + "," + shortcut.stateCommand + "," + shortcut.when;
        };

        return ShortCut;
    }(event.EventEmitter));
    /**
     * 快捷键
     */
    var shortcut = new ShortCut();

    exports.EventProxy = EventProxy;
    exports.KeyBoard = KeyBoard;
    exports.KeyState = KeyState;
    exports.ShortCut = ShortCut;
    exports.ShortCutCapture = ShortCutCapture;
    exports.windowEventProxy = windowEventProxy;

    return exports;

}({}, feng3d));
Object.assign(this.feng3d, _feng_d_shortcut);
//# sourceMappingURL=index.js.map
