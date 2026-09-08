import {
  S as e,
  _ as t,
  a as n,
  b as r,
  c as i,
  d as a,
  f as o,
  g as s,
  h as c,
  i as l,
  l as u,
  m as d,
  n as f,
  o as p,
  p as m,
  r as h,
  s as g,
  t as _,
  u as v,
  v as y,
  x as b,
} from "./index-DWOhH6yC.js";
var x = class extends y {
  constructor(e, t) {
    (super(),
      (this.options = t),
      (this.#e = e),
      (this.#s = null),
      (this.#o = n()),
      this.bindMethods(),
      this.setOptions(t));
  }
  #e;
  #t = void 0;
  #n = void 0;
  #r = void 0;
  #i;
  #a;
  #o;
  #s;
  #c;
  #l;
  #u;
  #d;
  #f;
  #p;
  #m = new Set();
  bindMethods() {
    this.refetch = this.refetch.bind(this);
  }
  onSubscribe() {
    this.listeners.size === 1 &&
      (this.#t.addObserver(this),
      C(this.#t, this.options) ? this.#h() : this.updateResult(),
      this.#y());
  }
  onUnsubscribe() {
    this.hasListeners() || this.destroy();
  }
  shouldFetchOnReconnect() {
    return w(this.#t, this.options, this.options.refetchOnReconnect);
  }
  shouldFetchOnWindowFocus() {
    return w(this.#t, this.options, this.options.refetchOnWindowFocus);
  }
  destroy() {
    ((this.listeners = new Set()), this.#b(), this.#x(), this.#t.removeObserver(this));
  }
  setOptions(e) {
    let t = this.options,
      n = this.#t;
    if (
      ((this.options = this.#e.defaultQueryOptions(e)),
      this.options.enabled !== void 0 &&
        typeof this.options.enabled != `boolean` &&
        typeof this.options.enabled != `function` &&
        typeof a(this.options.enabled, this.#t) != `boolean`)
    )
      throw Error(`Expected enabled to be a boolean or a callback that returns a boolean`);
    (this.#S(),
      this.#t.setOptions(this.options),
      t._defaulted &&
        !m(this.options, t) &&
        this.#e
          .getQueryCache()
          .notify({ type: `observerOptionsUpdated`, query: this.#t, observer: this }));
    let r = this.hasListeners();
    (r && T(this.#t, n, this.options, t) && this.#h(),
      this.updateResult(),
      r &&
        (this.#t !== n ||
          a(this.options.enabled, this.#t) !== a(t.enabled, this.#t) ||
          o(this.options.staleTime, this.#t) !== o(t.staleTime, this.#t)) &&
        this.#g());
    let i = this.#_();
    r &&
      (this.#t !== n ||
        a(this.options.enabled, this.#t) !== a(t.enabled, this.#t) ||
        i !== this.#p) &&
      this.#v(i);
  }
  getOptimisticResult(e) {
    let t = this.#e.getQueryCache().build(this.#e, e),
      n = this.createResult(t, e);
    return (D(this, n) && ((this.#r = n), (this.#a = this.options), (this.#i = this.#t.state)), n);
  }
  getCurrentResult() {
    return this.#r;
  }
  trackResult(e, t) {
    return new Proxy(e, {
      get: (e, n) => (
        this.trackProp(n),
        t?.(n),
        n === `promise` &&
          (this.trackProp(`data`),
          !this.options.experimental_prefetchInRender &&
            this.#o.status === `pending` &&
            this.#o.reject(Error(`experimental_prefetchInRender feature flag is not enabled`))),
        Reflect.get(e, n)
      ),
    });
  }
  trackProp(e) {
    this.#m.add(e);
  }
  getCurrentQuery() {
    return this.#t;
  }
  refetch({ ...e } = {}) {
    return this.fetch({ ...e });
  }
  fetchOptimistic(e) {
    let t = this.#e.defaultQueryOptions(e),
      n = this.#e.getQueryCache().build(this.#e, t);
    return n.fetch().then(() => this.createResult(n, t));
  }
  fetch(e) {
    return this.#h({ ...e, cancelRefetch: e.cancelRefetch ?? !0 }).then(
      () => (this.updateResult(), this.#r),
    );
  }
  #h(e) {
    this.#S();
    let t = this.#t.fetch(this.options, e);
    return (e?.throwOnError || (t = t.catch(u)), t);
  }
  #g() {
    this.#b();
    let e = o(this.options.staleTime, this.#t);
    if (p.isServer() || this.#r.isStale || !i(e)) return;
    let t = c(this.#r.dataUpdatedAt, e) + 1;
    this.#d = s.setTimeout(() => {
      this.#r.isStale || this.updateResult();
    }, t);
  }
  #_() {
    return (
      (typeof this.options.refetchInterval == `function`
        ? this.options.refetchInterval(this.#t)
        : this.options.refetchInterval) ?? !1
    );
  }
  #v(e) {
    (this.#x(),
      (this.#p = e),
      !(p.isServer() || a(this.options.enabled, this.#t) === !1 || !i(this.#p) || this.#p === 0) &&
        (this.#f = s.setInterval(() => {
          (this.options.refetchIntervalInBackground || t.isFocused()) && this.#h();
        }, this.#p)));
  }
  #y() {
    (this.#g(), this.#v(this.#_()));
  }
  #b() {
    this.#d !== void 0 && (s.clearTimeout(this.#d), (this.#d = void 0));
  }
  #x() {
    this.#f !== void 0 && (s.clearInterval(this.#f), (this.#f = void 0));
  }
  createResult(e, t) {
    let r = this.#t,
      i = this.options,
      o = this.#r,
      s = this.#i,
      c = this.#a,
      l = e === r ? this.#n : e.state,
      { state: u } = e,
      d = { ...u },
      f = !1,
      p;
    if (t._optimisticResults) {
      let n = this.hasListeners(),
        a = !n && C(e, t),
        o = n && T(e, r, t, i);
      ((a || o) && (d = { ...d, ...h(u.data, e.options) }),
        t._optimisticResults === `isRestoring` && (d.fetchStatus = `idle`));
    }
    let { error: m, errorUpdatedAt: g, status: _ } = d;
    p = d.data;
    let y = !1;
    if (t.placeholderData !== void 0 && p === void 0 && _ === `pending`) {
      let e;
      (o?.isPlaceholderData && t.placeholderData === c?.placeholderData
        ? ((e = o.data), (y = !0))
        : (e =
            typeof t.placeholderData == `function`
              ? t.placeholderData(this.#u?.state.data, this.#u)
              : t.placeholderData),
        e !== void 0 && ((_ = `success`), (p = v(o?.data, e, t)), (f = !0)));
    }
    if (t.select && p !== void 0 && !y)
      if (o && p === s?.data && t.select === this.#c) p = this.#l;
      else
        try {
          ((this.#c = t.select),
            (p = t.select(p)),
            (p = v(o?.data, p, t)),
            (this.#l = p),
            (this.#s = null));
        } catch (e) {
          this.#s = e;
        }
    this.#s && ((m = this.#s), (p = this.#l), (g = Date.now()), (_ = `error`));
    let b = d.fetchStatus === `fetching`,
      x = _ === `pending`,
      S = _ === `error`,
      w = x && b,
      D = p !== void 0,
      O = {
        status: _,
        fetchStatus: d.fetchStatus,
        isPending: x,
        isSuccess: _ === `success`,
        isError: S,
        isInitialLoading: w,
        isLoading: w,
        data: p,
        dataUpdatedAt: d.dataUpdatedAt,
        error: m,
        errorUpdatedAt: g,
        failureCount: d.fetchFailureCount,
        failureReason: d.fetchFailureReason,
        errorUpdateCount: d.errorUpdateCount,
        isFetched: e.isFetched(),
        isFetchedAfterMount:
          d.dataUpdateCount > l.dataUpdateCount || d.errorUpdateCount > l.errorUpdateCount,
        isFetching: b,
        isRefetching: b && !x,
        isLoadingError: S && !D,
        isPaused: d.fetchStatus === `paused`,
        isPlaceholderData: f,
        isRefetchError: S && D,
        isStale: E(e, t),
        refetch: this.refetch,
        promise: this.#o,
        isEnabled: a(t.enabled, e) !== !1,
      };
    if (this.options.experimental_prefetchInRender) {
      let t = O.data !== void 0,
        i = O.status === `error` && !t,
        a = (e) => {
          i ? e.reject(O.error) : t && e.resolve(O.data);
        },
        o = () => {
          let e = (this.#o = O.promise = n());
          a(e);
        },
        s = this.#o;
      switch (s.status) {
        case `pending`:
          e.queryHash === r.queryHash && a(s);
          break;
        case `fulfilled`:
          (i || O.data !== s.value) && o();
          break;
        case `rejected`:
          (!i || O.error !== s.reason) && o();
          break;
      }
    }
    return O;
  }
  updateResult() {
    let e = this.#r,
      t = this.createResult(this.#t, this.options);
    ((this.#i = this.#t.state),
      (this.#a = this.options),
      this.#i.data !== void 0 && (this.#u = this.#t),
      !m(t, e) &&
        ((this.#r = t),
        this.#C({
          listeners: (() => {
            if (!e) return !0;
            let { notifyOnChangeProps: t } = this.options,
              n = typeof t == `function` ? t() : t;
            if (n === `all` || (!n && !this.#m.size)) return !0;
            let r = new Set(n ?? this.#m);
            return (
              this.options.throwOnError && r.add(`error`),
              Object.keys(this.#r).some((t) => {
                let n = t;
                return this.#r[n] !== e[n] && r.has(n);
              })
            );
          })(),
        })));
  }
  #S() {
    let e = this.#e.getQueryCache().build(this.#e, this.options);
    if (e === this.#t) return;
    let t = this.#t;
    ((this.#t = e),
      (this.#n = e.state),
      this.hasListeners() && (t?.removeObserver(this), e.addObserver(this)));
  }
  onQueryUpdate() {
    (this.updateResult(), this.hasListeners() && this.#y());
  }
  #C(e) {
    l.batch(() => {
      (e.listeners &&
        this.listeners.forEach((e) => {
          e(this.#r);
        }),
        this.#e.getQueryCache().notify({ query: this.#t, type: `observerResultsUpdated` }));
    });
  }
};
function S(e, t) {
  return (
    a(t.enabled, e) !== !1 &&
    e.state.data === void 0 &&
    (e.state.status !== `error` || a(t.retryOnMount, e) !== !1)
  );
}
function C(e, t) {
  return S(e, t) || (e.state.data !== void 0 && w(e, t, t.refetchOnMount));
}
function w(e, t, n) {
  if (a(t.enabled, e) !== !1 && o(t.staleTime, e) !== `static`) {
    let r = typeof n == `function` ? n(e) : n;
    return r === `always` || (r !== !1 && E(e, t));
  }
  return !1;
}
function T(e, t, n, r) {
  return (
    (e !== t || a(r.enabled, e) === !1) && (!n.suspense || e.state.status !== `error`) && E(e, n)
  );
}
function E(e, t) {
  return a(t.enabled, e) !== !1 && e.isStaleByTime(o(t.staleTime, e));
}
function D(e, t) {
  return !m(e.getCurrentResult(), t);
}
var O = class extends y {
  #e;
  #t = void 0;
  #n;
  #r;
  constructor(e, t) {
    (super(), (this.#e = e), this.setOptions(t), this.bindMethods(), this.#i());
  }
  bindMethods() {
    ((this.mutate = this.mutate.bind(this)), (this.reset = this.reset.bind(this)));
  }
  setOptions(e) {
    let t = this.options;
    ((this.options = this.#e.defaultMutationOptions(e)),
      m(this.options, t) ||
        this.#e
          .getMutationCache()
          .notify({ type: `observerOptionsUpdated`, mutation: this.#n, observer: this }),
      t?.mutationKey && this.options.mutationKey && g(t.mutationKey) !== g(this.options.mutationKey)
        ? this.reset()
        : this.#n?.state.status === `pending` && this.#n.setOptions(this.options));
  }
  onUnsubscribe() {
    this.hasListeners() || this.#n?.removeObserver(this);
  }
  onMutationUpdate(e) {
    (this.#i(), this.#a(e));
  }
  getCurrentResult() {
    return this.#t;
  }
  reset() {
    (this.#n?.removeObserver(this), (this.#n = void 0), this.#i(), this.#a());
  }
  mutate(e, t) {
    return (
      (this.#r = t),
      this.#n?.removeObserver(this),
      (this.#n = this.#e.getMutationCache().build(this.#e, this.options)),
      this.#n.addObserver(this),
      this.#n.execute(e)
    );
  }
  #i() {
    let e = this.#n?.state ?? f();
    this.#t = {
      ...e,
      isPending: e.status === `pending`,
      isSuccess: e.status === `success`,
      isError: e.status === `error`,
      isIdle: e.status === `idle`,
      mutate: this.mutate,
      reset: this.reset,
    };
  }
  #a(e) {
    l.batch(() => {
      if (this.#r && this.hasListeners()) {
        let t = this.#t.variables,
          n = this.#t.context,
          r = { client: this.#e, meta: this.options.meta, mutationKey: this.options.mutationKey };
        if (e?.type === `success`) {
          try {
            this.#r.onSuccess?.(e.data, t, n, r);
          } catch (e) {
            Promise.reject(e);
          }
          try {
            this.#r.onSettled?.(e.data, null, t, n, r);
          } catch (e) {
            Promise.reject(e);
          }
        } else if (e?.type === `error`) {
          try {
            this.#r.onError?.(e.error, t, n, r);
          } catch (e) {
            Promise.reject(e);
          }
          try {
            this.#r.onSettled?.(void 0, e.error, t, n, r);
          } catch (e) {
            Promise.reject(e);
          }
        }
      }
      this.listeners.forEach((e) => {
        e(this.#t);
      });
    });
  }
};
r();
var k = e(b(), 1),
  A = k.createContext(!1),
  j = () => k.useContext(A);
A.Provider;
function M() {
  let e = !1;
  return {
    clearReset: () => {
      e = !1;
    },
    reset: () => {
      e = !0;
    },
    isReset: () => e,
  };
}
var N = k.createContext(M()),
  P = () => k.useContext(N),
  F = (e, t, n) => {
    let r =
      n?.state.error && typeof e.throwOnError == `function`
        ? d(e.throwOnError, [n.state.error, n])
        : e.throwOnError;
    (e.suspense || e.experimental_prefetchInRender || r) && (t.isReset() || (e.retryOnMount = !1));
  },
  I = (e) => {
    k.useEffect(() => {
      e.clearReset();
    }, [e]);
  },
  L = ({ result: e, errorResetBoundary: t, throwOnError: n, query: r, suspense: i }) =>
    e.isError &&
    !t.isReset() &&
    !e.isFetching &&
    r &&
    ((i && e.data === void 0) || d(n, [e.error, r])),
  R = (e) => {
    if (e.suspense) {
      let t = 1e3,
        n = (e) => (e === `static` ? e : Math.max(e ?? t, t)),
        r = e.staleTime;
      ((e.staleTime = typeof r == `function` ? (...e) => n(r(...e)) : n(r)),
        typeof e.gcTime == `number` && (e.gcTime = Math.max(e.gcTime, t)));
    }
  },
  z = (e, t) => e.isLoading && e.isFetching && !t,
  B = (e, t) => e?.suspense && t.isPending,
  V = (e, t, n) =>
    t.fetchOptimistic(e).catch(() => {
      n.clearReset();
    });
function H(e, t, n) {
  let r = j(),
    i = P(),
    a = _(n),
    o = a.defaultQueryOptions(e);
  a.getDefaultOptions().queries?._experimental_beforeQuery?.(o);
  let s = a.getQueryCache().get(o.queryHash),
    c = e.subscribed !== !1;
  ((o._optimisticResults = r ? `isRestoring` : c ? `optimistic` : void 0), R(o), F(o, i, s), I(i));
  let d = !a.getQueryCache().get(o.queryHash),
    [f] = k.useState(() => new t(a, o)),
    m = f.getOptimisticResult(o),
    h = !r && c;
  if (
    (k.useSyncExternalStore(
      k.useCallback(
        (e) => {
          let t = h ? f.subscribe(l.batchCalls(e)) : u;
          return (f.updateResult(), t);
        },
        [f, h],
      ),
      () => f.getCurrentResult(),
      () => f.getCurrentResult(),
    ),
    k.useEffect(() => {
      f.setOptions(o);
    }, [o, f]),
    B(o, m))
  )
    throw V(o, f, i);
  if (
    L({
      result: m,
      errorResetBoundary: i,
      throwOnError: o.throwOnError,
      query: s,
      suspense: o.suspense,
    })
  )
    throw m.error;
  return (
    a.getDefaultOptions().queries?._experimental_afterQuery?.(o, m),
    o.experimental_prefetchInRender &&
      !p.isServer() &&
      z(m, r) &&
      (d ? V(o, f, i) : s?.promise)?.catch(u).finally(() => {
        f.updateResult();
      }),
    o.notifyOnChangeProps ? m : f.trackResult(m)
  );
}
function U(e, t) {
  return H(e, x, t);
}
function W(e, t) {
  let n = _(t),
    [r] = k.useState(() => new O(n, e));
  k.useEffect(() => {
    r.setOptions(e);
  }, [r, e]);
  let i = k.useSyncExternalStore(
      k.useCallback((e) => r.subscribe(l.batchCalls(e)), [r]),
      () => r.getCurrentResult(),
      () => r.getCurrentResult(),
    ),
    a = k.useCallback(
      (e, t) => {
        r.mutate(e, t).catch(u);
      },
      [r],
    );
  if (i.error && d(r.options.throwOnError, [i.error])) throw i.error;
  return { ...i, mutate: a, mutateAsync: i.mutate };
}
async function G(e, t) {
  let n = await fetch(e, {
      method: t === void 0 ? `GET` : `POST`,
      ...(t === void 0
        ? {}
        : { headers: { "content-type": `application/json` }, body: JSON.stringify(t) }),
    }),
    r = await n.json();
  if (!n.ok) throw Error(r.detail ?? r.error ?? `HTTP ${n.status}`);
  return r;
}
function K(e = 2e3) {
  return U({ queryKey: [`painel`], queryFn: () => G(`/api/painel`), refetchInterval: e });
}
function q() {
  let e = _();
  return W({
    mutationFn: (e) => G(`/api/alunos`, e),
    onSuccess: () => e.invalidateQueries({ queryKey: [`painel`] }),
  });
}
function J() {
  let e = _();
  return W({
    mutationFn: (e) => G(`/api/comandos`, e),
    onSuccess: () => e.invalidateQueries({ queryKey: [`painel`] }),
  });
}
export { q as n, K as r, J as t };
