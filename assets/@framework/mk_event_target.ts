import * as cc from "cc";

class mk_event_target<CT> extends cc.EventTarget {
	/**
	 * @param event_ 被包装的事件对象
	 * @returns
	 */
	constructor(event_?: any) {
		super();

		if (mk_event_target._override_event_map.has(event_)) {
			return event_;
		}

		this["__proto__"]["__proto__"] = event_;
	}

	/* --------------- static --------------- */
	private static _override_event_map = new Map<any, boolean>();
	/* --------------- public --------------- */
	key: { [k in keyof CT]: k } = new Proxy(Object.create(null), {
		get: (target, key) => key,
	});

	/* ------------------------------- 功能 ------------------------------- */
	// @ts-ignore
	on<T extends keyof CT, T2 extends (...event_: Parameters<CT[T]>) => void>(
		type_: T | T[],
		callback_: T2,
		this_?: any,
		once_b_?: boolean
	): typeof callback_ | null {
		if (Array.isArray(type_)) {
			type_.forEach((v) => {
				super.on(v as any, callback_ as any, this_, once_b_);
			});
			return null;
		} else {
			return super.on(type_ as any, callback_ as any, this_, once_b_);
		}
	}

	// @ts-ignore
	once<T extends keyof CT, T2 extends (...event_: Parameters<CT[T]>) => void>(type_: T | T[], callback_: T2, this_?: any): typeof callback_ | null {
		if (Array.isArray(type_)) {
			type_.forEach((v) => {
				super.once(v as any, callback_ as any, this_);
			});
			return null;
		} else {
			return super.once(type_ as any, callback_ as any, this_);
		}
	}

	// @ts-ignore
	off<T extends keyof CT, T2 extends (...event_: Parameters<CT[T]>) => void>(type_: T | T[], callback_?: T2, this_?: any): void {
		if (Array.isArray(type_)) {
			type_.forEach((v) => {
				super.off(v as any, callback_ as any, this_);
			});
		} else {
			super.off(type_ as any, callback_ as any, this_);
		}
	}

	// @ts-ignore
	emit<T extends keyof CT, T2 extends Parameters<CT[T]>>(type_: T | T[], ...args_: T2): void {
		if (Array.isArray(type_)) {
			type_.forEach((v) => {
				super.emit(v as any, ...args_);
			});
		} else {
			super.emit(type_ as any, ...args_);
		}
	}

	// @ts-ignore
	hasEventListener<T extends keyof CT, T2 extends (...event_: Parameters<CT[T]>) => void>(type_: T, callback_?: T2, target_?: any): boolean {
		return super.hasEventListener(type_ as any, callback_ as any, target_);
	}

	clear(): void {
		return super["clear"]();
	}

	/** 请求（等待返回） */
	// @ts-ignore
	request<T extends keyof CT, T2 extends Parameters<CT[T]>, T3 extends ReturnType<CT[T]>>(type_: T | T[], ...args_: T2): Promise<T3>[] {
		if (Array.isArray(type_)) {
			const result_as: Promise<any>[] = [];

			type_.forEach((v) => {
				result_as.push(...this._request_single(v, ...args_));
			});
			return result_as;
		} else {
			return this._request_single(type_, ...args_);
		}
	}

	/** 请求单个事件 */
	// @ts-ignore
	private _request_single<T extends keyof CT, T2 extends Parameters<CT[T]>, T3 extends ReturnType<CT[T]>>(type_: T, ...args_: T2): Promise<T3>[] {
		/** 返回值 */
		const result_as: Promise<any>[] = [];
		/** 回调列表 */
		const callback_as: { callback: Function; target?: any }[] = this["_callbackTable"][type_]?.callbackInfos;

		if (!callback_as) {
			return result_as;
		}
		callback_as.forEach((v) => {
			const old_callback_f = v.callback;
			const target = v.target;

			v.callback = (...args: any[]) => {
				result_as.push(old_callback_f.call(target, ...args));
				v.callback = old_callback_f;
			};
		});
		this.emit(type_, ...args_);
		return result_as;
	}
}

export default mk_event_target;
