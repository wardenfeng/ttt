
/**
     * 事件
     */
declare interface Event_2<T> {
    /**
     * 事件的类型。类型区分大小写。
     */
    type: string;
    /**
     * 事件携带的自定义数据
     */
    data: T;
    /**
     * 事件目标。
     */
    target?: any;
    /**
     * 当前正在使用某个事件监听器处理 Event 对象的对象。
     */
    currentTarget?: any;
    /**
     * 表示事件是否为冒泡事件。如果事件可以冒泡，则此值为 true；否则为 false。
     */
    bubbles: boolean;
    /**
     * 是否停止冒泡
     */
    isStopBubbles?: boolean;
    /**
     * 是否停止处理事件监听器
     */
    isStop?: boolean;
    /**
     * 事件流过的对象列表，事件路径
     */
    targets?: any[];
    /**
     * 当前事件流到targets的索引
     */
    targetsIndex?: number;
    /**
     * 当前事件冒泡流到targets的索引
     */
    targetsBubblesIndex?: number;
    /**
     * 处理列表
     */
    handles?: ListenerVO[];
}
export { Event_2 as Event }

/**
 * 事件
 */
declare const event_2: FEvent;
export { event_2 as event }

/**
 * 事件派发器
 */
export declare class EventEmitter<T = any> {
    private static targetMap;
    /**
     * 获取事件派发器
     * @param target
     */
    static getEventEmitter(target: any): EventEmitter<any>;
    /**
     * 获取事件派发器，当没有找到对应派发器时，返回新建的事件派发器。
     * @param target
     */
    static getOrCreateEventEmitter(target: any): EventEmitter<any>;
    constructor(target?: any);
    /**
     * 返回监听的事件类型列表。
     */
    eventNames<K extends keyof T & string>(): K[];
    /**
     * 返回指定事件类型的监听数量。
     *
     * @param type 事件的类型。
     */
    listenerCount<K extends keyof T & string>(type: K): number;
    /**
     * 监听一次事件后将会被移除
     * @param type						事件的类型。
     * @param listener					处理事件的侦听器函数。
     * @param thisObject                listener函数作用域
     * @param priority					事件侦听器的优先级。数字越大，优先级越高。默认优先级为 0。
     */
    once<K extends keyof T & string>(type: K, listener: (event: Event_2<T[K]>) => void, thisObject?: any, priority?: number): this;
    /**
     * 派发事件
     *
     * 当事件重复流向一个对象时将不会被处理。
     *
     * @param e   事件对象
     * @returns 返回事件是否被该对象处理
     */
    emitEvent<K extends keyof T & string>(e: Event_2<T[K]>): boolean;
    /**
     * 将事件调度到事件流中. 事件目标是对其调用 emitEvent() 方法的 Event 对象。
     * @param type                      事件的类型。类型区分大小写。
     * @param data                      事件携带的自定义数据。
     * @param bubbles                   表示事件是否为冒泡事件。如果事件可以冒泡，则此值为 true；否则为 false。
     */
    emit<K extends keyof T & string>(type: K, data?: T[K], bubbles?: boolean): boolean;
    /**
     * 检查 Event 对象是否为特定事件类型注册了任何侦听器.
     *
     * @param type		事件的类型。
     * @return 			如果指定类型的侦听器已注册，则值为 true；否则，值为 false。
     */
    has<K extends keyof T & string>(type: K): boolean;
    /**
     * 为监听对象新增指定类型的事件监听。
     *
     * @param type						事件的类型。
     * @param listener					处理事件的监听器函数。
     * @param thisObject                监听器的上下文。可选。
     * @param priority					事件监听器的优先级。数字越大，优先级越高。默认为0。
     * @param once                      值为true时在监听一次事件后该监听器将被移除。默认为false。
     */
    on<K extends keyof T & string>(type: K, listener: (event: Event_2<T[K]>) => void, thisObject?: any, priority?: number, once?: boolean): this;
    /**
     * 移除监听
     *
     * @param type						事件的类型。可选。该值为空时所有被监听对象上的监听均将被移除。
     * @param listener					要删除的监听器对象。可选。该值为空时所有指定类型的监听均将被移除。
     * @param thisObject                监听器的上下文。可选。
     */
    off<K extends keyof T & string>(type?: K, listener?: (event: Event_2<T[K]>) => void, thisObject?: any): this;
    /**
     * 移除所有监听
     *
     * @param type						事件的类型。可选。该值为空时所有被监听对象上的监听均将被移除。
     */
    offAll<K extends keyof T & string>(type?: K): this;
    /**
     * 监听对象的任意事件，该对象的任意事件都将触发该监听器的调用。
     *
     * @param listener                  处理事件的监听器函数。
     * @param thisObject                监听器的上下文。可选。
     * @param priority                  事件监听器的优先级。数字越大，优先级越高。默认为0。
     * @param once                      值为true时在监听一次事件后该监听器将被移除。默认为false。
     */
    onAny<K extends keyof T & string>(listener: (event: Event_2<T[K]>) => void, thisObject?: any, priority?: number, once?: boolean): this;
    /**
     * 移除监听对象的任意事件。
     *
     * @param listener                  处理事件的监听器函数。
     * @param thisObject                监听器的上下文。可选。
     */
    offAny<K extends keyof T & string>(listener?: (event: Event_2<T[K]>) => void, thisObject?: any): this;
    /**
     * 处理事件
     * @param e 事件
     */
    protected handleEvent<K extends keyof T & string>(e: Event_2<T[K]>): void;
    /**
     * 处理事件冒泡
     * @param e 事件
     */
    protected handelEventBubbles<K extends keyof T & string>(e: Event_2<T[K]>): void;
}

/**
 * 可针对（除undefined、null、Symbol外）的任意对象（0, 1, true, false, "1", {}）派发事件
 */
export declare class FEvent {
    /**
     * Return an array listing the events for which the emitter has registered
     * listeners.
     */
    eventNames(obj: any): string[];
    /**
     * Return the number of listeners listening to a given event.
     */
    listenerCount(obj: any, type: string): number;
    /**
     * 监听一次事件后将会被移除
     * @param type						事件的类型。
     * @param listener					处理事件的监听器函数。
     * @param thisObject                listener函数作用域
     * @param priority					事件监听器的优先级。数字越大，优先级越高。默认为0。
     */
    once(obj: Object, type: string, listener: (event: Event_2<any>) => void, thisObject?: any, priority?: number): this;
    /**
     * 派发事件
     *
     * 当事件重复流向一个对象时将不会被处理。
     *
     * @param e                 事件对象。
     * @returns                 返回事件是否被该对象处理。
     */
    emitEvent(obj: Object, e: Event_2<any>): boolean;
    /**
     * 将事件调度到事件流中. 事件目标是对其调用 emitEvent() 方法的 IEvent 对象。
     * @param type                      事件的类型。类型区分大小写。
     * @param data                      事件携带的自定义数据。
     * @param bubbles                   表示事件是否为冒泡事件。如果事件可以冒泡，则此值为 true；否则为 false。
     */
    emit(obj: Object, type: string, data?: any, bubbles?: boolean): boolean;
    /**
     * 检查 被监听对象 是否为特定事件类型注册了任何监听器.
     *
     * @param obj                       被监听对象。
     * @param type		                事件的类型。
     * @return 			                如果指定类型的监听器已注册，则值为 true；否则，值为 false。
     */
    has(obj: Object, type: string): boolean;
    /**
     * 为监听对象新增指定类型的事件监听。
     *
     * @param obj                       被监听对象。
     * @param type						事件的类型。
     * @param listener					处理事件的监听器函数。
     * @param thisObject                监听器的上下文。可选。
     * @param priority					事件监听器的优先级。数字越大，优先级越高。默认为0。
     * @param once                      值为true时在监听一次事件后该监听器将被移除。默认为false。
     */
    on(obj: Object, type: string, listener: (event: Event_2<any>) => any, thisObject?: any, priority?: number, once?: boolean): this;
    /**
     * 移除监听
     *
     * @param obj                       被监听对象。
     * @param type						事件的类型。可选。该值为空时所有被监听对象上的监听均将被移除。
     * @param listener					要删除的监听器对象。可选。该值为空时所有指定类型的监听均将被移除。
     * @param thisObject                监听器的上下文。可选。
     */
    off(obj: Object, type?: string, listener?: (event: Event_2<any>) => any, thisObject?: any): this;
    /**
     * Remove all listeners, or those of the specified event.
     */
    offAll(obj: any, type?: string): this;
    /**
     * 监听对象的任意事件，该对象的任意事件都将触发该监听器的调用。
     *
     * @param obj                       被监听对象。
     * @param listener                  处理事件的监听器函数。
     * @param thisObject                监听器的上下文。可选。
     * @param priority                  事件监听器的优先级。数字越大，优先级越高。默认为0。
     * @param once                      值为true时在监听一次事件后该监听器将被移除。默认为false。
     */
    onAny(obj: Object, listener: (event: Event_2<any>) => void, thisObject?: any, priority?: number, once?: boolean): this;
    /**
     * 移除监听对象的任意事件。
     *
     * @param obj                       被监听对象。
     * @param listener                  处理事件的监听器函数。
     * @param thisObject                监听器的上下文。可选。
     */
    offAny(obj: Object, listener?: (event: any) => void, thisObject?: any): this;
    /**
     * 初始化事件对象
     *
     * @param type                      事件的类型。类型区分大小写。
     * @param data                      事件携带的自定义数据。
     * @param bubbles                   表示事件是否为冒泡事件。如果事件可以冒泡，则此值为 true；否则为 false。
     */
    makeEvent<T>(type: string, data: T, bubbles?: boolean): Event_2<T>;
}

/**
 * 全局事件
 */
export declare const globalEmitter: EventEmitter<GlobalEvents>;

/**
 * 事件列表
 */
export declare interface GlobalEvents {
    /**
     * shader资源发生变化
     */
    'asset.shaderChanged': any;
    /**
     * 脚本发生变化
     */
    'asset.scriptChanged': any;
    /**
     * 图片资源发生变化
     */
    'asset.imageAssetChanged': {
        url: string;
    };
    /**
     * 解析出资源
     */
    'asset.parsed': any;
    /**
     * 删除文件
     */
    'fs.delete': string;
    /**
     * 写文件
     */
    'fs.write': string;
}

/**
 * 监听数据
 */
declare interface ListenerVO {
    /**
     * 监听函数
     */
    listener: (event: Event_2<any>) => void;
    /**
     * 监听函数作用域
     */
    thisObject: any;
    /**
     * 优先级
     */
    priority: number;
    /**
     * 是否只监听一次
     */
    once: boolean;
}

/**
 * 只针对Object的事件
 */
export declare const objectevent: ObjectEventDispatcher<Object, ObjectEventType>;

/**
 * 用于适配不同对象对于的事件
 */
declare interface ObjectEventDispatcher<O, T> {
    once<K extends keyof T>(target: O, type: K, listener: (event: Event_2<T[K]>) => void, thisObject?: any, priority?: number): this;
    emit<K extends keyof T>(target: O, type: K, data?: T[K], bubbles?: boolean): boolean;
    has<K extends keyof T>(target: O, type: K): boolean;
    on<K extends keyof T>(target: O, type: K, listener: (event: Event_2<T[K]>) => void, thisObject?: any, priority?: number, once?: boolean): this;
    off<K extends keyof T>(target: O, type?: K, listener?: (event: Event_2<T[K]>) => void, thisObject?: any): this;
}

/**
 * Object 事件类型
 */
export declare interface ObjectEventType {
    /**
     * 属性值变化
     */
    propertyValueChanged: {
        property: string;
        oldValue: any;
        newValue: any;
    };
}

export { }
