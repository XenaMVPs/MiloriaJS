/* =============================================================================
   MiloriaJS - Versión Avanzada y Optimizada
   =============================================================================
   Objetivo: Mejorar el rendimiento, la arquitectura y la experiencia del 
   desarrollador para acercar MiloriaJS a la calidad de frameworks como Vue,
   React y Svelte.

   Características Clave:
   1. Virtual DOM Ligero para minimizar re-renderizados.
   2. Sistema de reactividad con dependencias optimizadas (reactive, effect, computed, watch).
   3. Ciclo de vida de componentes avanzado (onBeforeMount, onMount, onBeforeUpdate, onUpdate, onBeforeUnmount, onUnmount).
   4. API de componentes estilo Vue (props, slots, setup que retorna { state, methods }).
   5. Enrutamiento isomórfico con rutas dinámicas, middleware y protección de rutas.
   6. SSR simulado y Hydration parcial.
   7. Gestión global de estado (createStoreAdvanced) con persistencia opcional en localStorage.
   8. Sistema de plugins modular.
   9. CLI y documentación sugeridas (no incluidas en este archivo).
   10. Animaciones avanzadas, transiciones, i18n, devTools y más.

   =============================================================================
   ¡IMPORTANTE!
   - Este archivo único (miloria.js) contiene todo el core de MiloriaJS.
   - Copiar tal cual en tu proyecto. 
   - No requiere explicaciones extras.
   =============================================================================
*/

/* =============================================================
   UTILIDADES
   ============================================================= */

   function isObject(val) {
    return val !== null && typeof val === 'object';
  }
  
  function deepClone(obj) {
    if (!isObject(obj)) return obj;
    return JSON.parse(JSON.stringify(obj));
  }
  
  function deepMerge(target, source) {
    for (let key in source) {
      if (isObject(source[key])) {
        if (!target[key]) target[key] = {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }
  
  let uniqueIdCounter = 0;
  function uniqueId(prefix = 'id') {
    uniqueIdCounter++;
    return prefix + uniqueIdCounter;
  }
  
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  
  function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function(...args) {
      if (!lastRan) {
        func.apply(this, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(() => {
          if ((Date.now() - lastRan) >= limit) {
            func.apply(this, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  }
  
  // Event Bus interno (para uso del core)
  const coreEventBus = {
    events: {},
    on(event, listener) {
      if (!this.events[event]) this.events[event] = [];
      this.events[event].push(listener);
    },
    off(event, listener) {
      if (!this.events[event]) return;
      this.events[event] = this.events[event].filter(l => l !== listener);
    },
    emit(event, data) {
      if (!this.events[event]) return;
      this.events[event].forEach(listener => listener(data));
    }
  };
  
  
  /* =============================================================
     SISTEMA DE REACTIVIDAD
     ============================================================= */
  
  const targetMap = new WeakMap();
  const effectStack = [];
  
  function track(target, prop) {
    const effectFn = effectStack[effectStack.length - 1];
    if (effectFn) {
      let depsMap = targetMap.get(target);
      if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
      }
      let dep = depsMap.get(prop);
      if (!dep) {
        dep = new Set();
        depsMap.set(prop, dep);
      }
      dep.add(effectFn);
    }
  }
  
  function trigger(target, prop, newVal, oldVal) {
    const depsMap = targetMap.get(target);
    if (!depsMap) return;
    const effects = depsMap.get(prop);
    if (effects) {
      effects.forEach(effectFn => effectFn());
    }
  }
  
  function reactive(target) {
    if (!isObject(target)) return target;
    return new Proxy(target, {
      get(obj, prop, receiver) {
        track(obj, prop);
        return Reflect.get(obj, prop, receiver);
      },
      set(obj, prop, value, receiver) {
        const oldVal = obj[prop];
        const result = Reflect.set(obj, prop, value, receiver);
        if (oldVal !== value) {
          trigger(obj, prop, value, oldVal);
        }
        return result;
      }
    });
  }
  
  function effect(fn) {
    const effectFn = () => {
      try {
        effectStack.push(effectFn);
        return fn();
      } finally {
        effectStack.pop();
      }
    };
    effectFn();
    return effectFn;
  }
  
  function computed(getter) {
    let cached;
    let dirty = true;
    const runner = effect(() => {
      cached = getter();
      dirty = false;
    });
    return {
      get value() {
        if (dirty) {
          runner();
        }
        return cached;
      }
    };
  }
  
  function watch(getter, callback) {
    let oldVal = getter();
    effect(() => {
      const newVal = getter();
      if (newVal !== oldVal) {
        callback(newVal, oldVal);
        oldVal = newVal;
      }
    });
  }
  
  
  /* =============================================================
     VIRTUAL DOM LIGERO
     ============================================================= */
  // Representación mínima de un Virtual DOM con diffing sencillo.
  function h(type, props, ...children) {
    return { type, props: props || {}, children };
  }
  
  function createRealNode(vnode) {
    if (typeof vnode === "string" || typeof vnode === "number") {
      return document.createTextNode(String(vnode));
    }
    const el = document.createElement(vnode.type);
    for (let prop in vnode.props) {
      el.setAttribute(prop, vnode.props[prop]);
    }
    vnode.children.forEach(child => {
      el.appendChild(createRealNode(child));
    });
    return el;
  }
  
  function patch(parent, oldVNode, newVNode, index = 0) {
    if (!oldVNode) {
      parent.appendChild(createRealNode(newVNode));
    } else if (!newVNode) {
      parent.removeChild(parent.childNodes[index]);
    } else if (changed(oldVNode, newVNode)) {
      parent.replaceChild(createRealNode(newVNode), parent.childNodes[index]);
    } else if (newVNode.type) {
      const node = parent.childNodes[index];
      const oldChildren = oldVNode.children || [];
      const newChildren = newVNode.children || [];
      const length = Math.max(oldChildren.length, newChildren.length);
      for (let i = 0; i < length; i++) {
        patch(node, oldChildren[i], newChildren[i], i);
      }
    }
  }
  
  function changed(a, b) {
    return typeof a !== typeof b ||
           (typeof a === "string" && a !== b) ||
           a.type !== b.type;
  }
  
  
  /* =============================================================
     SISTEMA DE COMPONENTES CON HOOKS COMPLETOS
     ============================================================= */
  
  const componentRegistry = {};
  let currentInstance = null;
  
  function defineComponent({ name, props = [], setup, slots = [] }) {
    componentRegistry[name] = { props, setup, slots };
    return name;
  }
  
  function createComponentInstance(name, container, userProps) {
    return {
      name,
      container,
      userProps,
      beforeMount: [],
      mount: [],
      beforeUpdate: [],
      update: [],
      beforeUnmount: [],
      unmount: [],
      isMounted: false,
      vdom: null,
      nextVDOM: null,
      id: uniqueId("comp_")
    };
  }
  
  function mountComponent(name, container, userProps = {}) {
    if (!componentRegistry[name]) {
      container.innerHTML = `<p style="color:red;">Componente no encontrado: ${name}</p>`;
      return;
    }
    const componentDef = componentRegistry[name];
    const instance = createComponentInstance(name, container, userProps);
    currentInstance = instance;
  
    // onBeforeMount
    instance.beforeMount.forEach(fn => fn());
  
    const { state, methods, render } = normalizeSetup(componentDef, instance);
  
    instance.vdom = render();
    container.innerHTML = "";
    patch(container, null, instance.vdom);
  
    // onMount
    instance.mount.forEach(fn => fn());
  
    instance.isMounted = true;
    container.__miloria_component__ = instance;
    currentInstance = null;
  }
  
  function updateComponent(container) {
    const instance = container.__miloria_component__;
    if (!instance) return;
  
    currentInstance = instance;
  
    // onBeforeUpdate
    instance.beforeUpdate.forEach(fn => fn());
  
    const { render } = normalizeSetup(componentRegistry[instance.name], instance);
    const newVDOM = render();
    patch(instance.container, instance.vdom, newVDOM);
    instance.vdom = newVDOM;
  
    // onUpdate
    instance.update.forEach(fn => fn());
  
    currentInstance = null;
  }
  
  function normalizeSetup(componentDef, instance) {
    const returned = componentDef.setup(instance.userProps);
    if (typeof returned === 'function') {
      return {
        state: {},
        methods: {},
        render: returned
      };
    } else {
      // Esperamos { state, methods, render } o algo similar
      const { state = {}, methods = {}, render } = returned;
      return {
        state,
        methods,
        render: render || (() => h('div', null, 'Sin render'))
      };
    }
  }
  
  // Hooks
  function onBeforeMount(fn) {
    if (currentInstance) {
      currentInstance.beforeMount.push(fn);
    }
  }
  function onMount(fn) {
    if (currentInstance) {
      currentInstance.mount.push(fn);
    }
  }
  function onBeforeUpdate(fn) {
    if (currentInstance) {
      currentInstance.beforeUpdate.push(fn);
    }
  }
  function onUpdate(fn) {
    if (currentInstance) {
      currentInstance.update.push(fn);
    }
  }
  function onBeforeUnmount(fn) {
    if (currentInstance) {
      currentInstance.beforeUnmount.push(fn);
    }
  }
  function onUnmount(fn) {
    if (currentInstance) {
      currentInstance.unmount.push(fn);
    }
  }
  
  
  /* =============================================================
     MOTOR DE PLANTILLAS AVANZADO (Opcional, si no usas VDOM)
     ============================================================= */
  
  function compileTemplate(templateStr, context) {
    // if...else
    templateStr = templateStr.replace(
      /\{\{if\s+(.+?)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, condition, content) => {
        try {
          with (context) {
            return eval(condition) ? content : "";
          }
        } catch (e) {
          console.error("Error en condicional:", e);
          return "";
        }
      }
    );
  
    // foreach
    templateStr = templateStr.replace(
      /\{\{foreach\s+(\w+)\s+in\s+(\w+)\}\}([\s\S]*?)\{\{\/foreach\}\}/g,
      (match, item, arr, content) => {
        let result = "";
        try {
          with (context) {
            if (Array.isArray(eval(arr))) {
              eval(arr).forEach(function(val) {
                let localContext = Object.assign({}, context);
                localContext[item] = val;
                result += compileTemplate(content, localContext);
              });
            }
          }
        } catch (e) {
          console.error("Error en bucle foreach:", e);
        }
        return result;
      }
    );
  
    // Interpolación ${}
    return templateStr.replace(/\$\{([^}]+)\}/g, (match, code) => {
      try {
        with (context) {
          return eval(code);
        }
      } catch (e) {
        console.error("Error en la interpolación:", e);
        return "";
      }
    });
  }
  
  
  /* =============================================================
     ENRUTAMIENTO ISOMÓRFICO CON RUTAS DINÁMICAS
     ============================================================= */
  
  function createRouter() {
    const routes = [];
    let container = null;
    let notFoundComponent = null;
    const middlewares = [];
  
    function register(path, componentName, opts = {}) {
      routes.push({ path, componentName, opts });
    }
  
    function setNotFound(componentName) {
      notFoundComponent = componentName;
    }
  
    function useMiddleware(fn) {
      middlewares.push(fn);
    }
  
    function navigate(path) {
      window.history.pushState({}, "", path);
      loadRoute(path);
    }
  
    function loadRoute(forcedPath) {
      const path = forcedPath || window.location.pathname;
      let matchedRoute = null;
      let params = {};
  
      for (let r of routes) {
        const regexPath = r.path.replace(/:([^/]+)/g, "([^/]+)");
        const regex = new RegExp(`^${regexPath}$`);
        const match = path.match(regex);
        if (match) {
          matchedRoute = r;
          const keys = (r.path.match(/:([^/]+)/g) || []).map(k => k.slice(1));
          keys.forEach((key, i) => {
            params[key] = match[i + 1];
          });
          break;
        }
      }
  
      if (!matchedRoute && notFoundComponent) {
        mountComponent(notFoundComponent, container);
        return;
      }
      if (!matchedRoute) return;
  
      // Ejecutar middlewares
      let allow = true;
      for (let mw of middlewares) {
        if (mw(matchedRoute, params) === false) {
          allow = false;
          break;
        }
      }
      if (!allow) return;
  
      mountComponent(matchedRoute.componentName, container, { params });
    }
  
    function init(selector) {
      container = document.querySelector(selector);
      window.addEventListener("popstate", () => loadRoute());
      loadRoute();
    }
  
    return {
      register,
      setNotFound,
      useMiddleware,
      navigate,
      init
    };
  }
  
  const router = createRouter();
  
  
  /* =============================================================
     SSR SIMULADO & FUNCIONES DE SERVIDOR
     ============================================================= */
  
  function ssr(config) {
    console.log("SSR configurado con:", config);
    return function renderToString(componentName, props = {}) {
      const fakeContainer = document.createElement("div");
      mountComponent(componentName, fakeContainer, props);
      return fakeContainer.innerHTML;
    };
  }
  
  const serverFunctions = {};
  function serverFunction(fn) {
    const id = uniqueId("srvFn_");
    serverFunctions[id] = fn;
    return function (...args) {
      console.log(`Ejecutando función del servidor: ${id}`);
      return fn(...args);
    };
  }
  
  
  /* =============================================================
     PARTIAL HYDRATION
     ============================================================= */
  
  function hydrateOnly(selector) {
    const el = document.querySelector(selector);
    if (el && el.__miloria_component__) {
      updateComponent(el);
    }
  }
  
  function deferHydration() {
    console.log("Hidratación diferida activada.");
  }
  
  
  /* =============================================================
     SISTEMA DE PLUGINS
     ============================================================= */
  
  const plugins = [];
  function registerPlugin(plugin) {
    if (plugin && typeof plugin.install === 'function') {
      plugins.push(plugin);
      plugin.install(Miloria);
      console.log("Plugin registrado:", plugin.name || "plugin anónimo");
    }
  }
  
  function usePlugins() {
    plugins.forEach(plugin => {
      if (typeof plugin.init === 'function') {
        plugin.init();
      }
    });
  }
  
  
  /* =============================================================
     DEV TOOLS & LOGGING
     ============================================================= */
  
  const devTools = {
    log(message, data) {
      console.log(`[Miloria LOG]: ${message}`, data || "");
    },
    warn(message, data) {
      console.warn(`[Miloria WARN]: ${message}`, data || "");
    },
    error(message, data) {
      console.error(`[Miloria ERROR]: ${message}`, data || "");
    }
  };
  
  
  /* =============================================================
     STORE PARA GESTIÓN GLOBAL DEL ESTADO (BÁSICO)
     ============================================================= */
  
  function createStore(initialState = {}) {
    const state = reactive(initialState);
    return {
      state,
      commit(mutation, payload) {
        if (typeof mutation === "function") {
          mutation(state, payload);
        }
      },
      subscribe(prop, callback) {
        watch(() => state[prop], callback);
      }
    };
  }
  
  
  /* =============================================================
     EVENT BUS PERSONALIZADO
     ============================================================= */
  
  function createEventBus() {
    const events = {};
    return {
      on(event, callback) {
        if (!events[event]) events[event] = [];
        events[event].push(callback);
      },
      off(event, callback) {
        if (!events[event]) return;
        events[event] = events[event].filter(fn => fn !== callback);
      },
      emit(event, payload) {
        if (events[event]) {
          events[event].forEach(fn => fn(payload));
        }
      }
    };
  }
  const MiloriaEventBus = createEventBus();
  
  
  /* =============================================================
     REACTIVIDAD AVANZADA: advancedComputed
     ============================================================= */
  
  function advancedComputed(getter) {
    let cachedValue;
    let dirty = true;
    const runner = effect(() => {
      cachedValue = getter();
      dirty = false;
    });
    return {
      get value() {
        if (dirty) {
          runner();
        }
        return cachedValue;
      },
      markDirty() {
        dirty = true;
      }
    };
  }
  
  
  /* =============================================================
     HOOKS PERSONALIZADOS (globales, si se requieren)
     ============================================================= */
  
  const hooks = {
    beforeRender: [],
    afterRender: []
  };
  
  function registerHook(hookName, callback) {
    if (hooks[hookName]) {
      hooks[hookName].push(callback);
    } else {
      devTools.warn(`Hook ${hookName} no existe.`);
    }
  }
  
  function runHooks(hookName, context) {
    if (hooks[hookName]) {
      hooks[hookName].forEach(fn => fn(context));
    }
  }
  
  
  /* =============================================================
     ERROR BOUNDARY
     ============================================================= */
  
  function errorBoundary(fn, fallback) {
    try {
      return fn();
    } catch (e) {
      devTools.error("Error capturado por boundary:", e);
      return typeof fallback === 'function' ? fallback(e) : fallback;
    }
  }
  
  
  /* =============================================================
     ANIMACIONES BÁSICAS
     ============================================================= */
  
  function animate(element, properties, duration = 500, easing = t => t) {
    const startStyles = {};
    const endStyles = properties;
    const startTime = performance.now();
  
    for (let prop in endStyles) {
      startStyles[prop] = parseFloat(window.getComputedStyle(element)[prop]) || 0;
    }
  
    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      for (let prop in endStyles) {
        const startVal = startStyles[prop];
        const endVal = endStyles[prop];
        const currentVal = startVal + (endVal - startVal) * easing(progress);
        element.style[prop] = currentVal + (prop === "opacity" ? "" : "px");
      }
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }
  
  
  /* =============================================================
     SISTEMA DE MÓDULOS INTERNOS (Simulación de Imports)
     ============================================================= */
  
  const MiloriaModules = {};
  
  function defineModule(name, moduleFn) {
    MiloriaModules[name] = moduleFn();
  }
  
  function requireModule(name) {
    return MiloriaModules[name];
  }
  
  
  /* =============================================================
     MÓDULO EJEMPLO: dateUtils
     ============================================================= */
  
  defineModule("dateUtils", function() {
    return {
      formatDate(date, locale = 'es-ES') {
        return new Date(date).toLocaleDateString(locale);
      },
      timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " años";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " meses";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " días";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " horas";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutos";
        return Math.floor(seconds) + " segundos";
      }
    };
  });
  
  
  /* =============================================================
     i18n
     ============================================================= */
  
  const i18n = {
    locale: "es",
    messages: {},
    setLocale(newLocale) {
      this.locale = newLocale;
    },
    addMessages(locale, msgs) {
      this.messages[locale] = Object.assign({}, this.messages[locale] || {}, msgs);
    },
    translate(key) {
      return (this.messages[this.locale] && this.messages[this.locale][key]) || key;
    }
  };
  
  
  /* =============================================================
     CONFIGURACIÓN GLOBAL
     ============================================================= */
  
  const MiloriaConfig = {
    debug: false,
    locale: "es",
    set(config) {
      deepMerge(this, config);
    }
  };
  
  const MiloriaDevTools = {
    log: (msg, data) => { if (MiloriaConfig.debug) console.log("[Miloria]", msg, data || ""); },
    warn: (msg, data) => { if (MiloriaConfig.debug) console.warn("[Miloria WARN]", msg, data || ""); },
    error: (msg, data) => { if (MiloriaConfig.debug) console.error("[Miloria ERROR]", msg, data || ""); }
  };
  
  
  /* =============================================================
     STORE AVANZADO CON PERSISTENCIA OPCIONAL
     ============================================================= */
  
  function createStoreAdvanced(initialState = {}, options = {}) {
    const { persistKey = null } = options;
    let storedState = null;
    if (persistKey && typeof localStorage !== "undefined") {
      const saved = localStorage.getItem(persistKey);
      if (saved) {
        storedState = JSON.parse(saved);
      }
    }
    const state = reactive(storedState || initialState);
    const subscribers = [];
  
    function subscribe(callback) {
      subscribers.push(callback);
    }
  
    function commit(mutation, payload) {
      if (typeof mutation === "function") {
        mutation(state, payload);
        subscribers.forEach(cb => cb(state));
        if (persistKey && typeof localStorage !== "undefined") {
          localStorage.setItem(persistKey, JSON.stringify(state));
        }
      }
    }
  
    return { state, subscribe, commit };
  }
  
  
  /* =============================================================
     ANIMACIONES AVANZADAS
     ============================================================= */
  
  function animateAdvanced(element, properties, options = {}) {
    const {
      duration = 500,
      easing = t => t,
      delay = 0,
      onComplete = () => {}
    } = options;
  
    const startStyles = {};
    const endStyles = properties;
    const startTime = performance.now() + delay;
  
    for (let prop in endStyles) {
      startStyles[prop] = parseFloat(window.getComputedStyle(element)[prop]) || 0;
    }
  
    function step(currentTime) {
      if (currentTime < startTime) {
        requestAnimationFrame(step);
        return;
      }
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      for (let prop in endStyles) {
        const startVal = startStyles[prop];
        const endVal = endStyles[prop];
        const currentVal = startVal + (endVal - startVal) * easing(progress);
        element.style[prop] = currentVal + (prop === "opacity" ? "" : "px");
      }
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        onComplete();
      }
    }
    requestAnimationFrame(step);
  }
  
  
  /* =============================================================
     DEEP WATCH
     ============================================================= */
  
  function deepWatch(obj, callback) {
    function traverse(current) {
      if (isObject(current)) {
        for (let key in current) {
          effect(() => {
            current[key];
            callback(current, key);
          });
          traverse(current[key]);
        }
      }
    }
    traverse(obj);
  }
  
  
  /* =============================================================
     LOGGER AVANZADO
     ============================================================= */
  
  const Logger = {
    levels: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 },
    currentLevel: 0,
    setLevel(level) {
      this.currentLevel = this.levels[level] || 0;
    },
    debug(msg, data) {
      if (this.currentLevel <= this.levels.DEBUG) console.debug("[DEBUG]", msg, data || "");
    },
    info(msg, data) {
      if (this.currentLevel <= this.levels.INFO) console.info("[INFO]", msg, data || "");
    },
    warn(msg, data) {
      if (this.currentLevel <= this.levels.WARN) console.warn("[WARN]", msg, data || "");
    },
    error(msg, data) {
      if (this.currentLevel <= this.levels.ERROR) console.error("[ERROR]", msg, data || "");
    }
  };
  
  
  /* =============================================================
     VALIDACIÓN DE DATOS
     ============================================================= */
  
  function validateData(schema, data) {
    for (let key in schema) {
      if (!schema[key](data[key])) {
        throw new Error(`Validación fallida para la propiedad ${key}`);
      }
    }
    return true;
  }
  
  
  /* =============================================================
     TRANSICIONES DE COMPONENTES
     ============================================================= */
  
  function transitionComponent(element, enterProps, exitProps, options = {}) {
    animateAdvanced(element, enterProps, options);
    setTimeout(() => {
      animateAdvanced(element, exitProps, options);
    }, options.duration + (options.delay || 0) + 100);
  }
  
  
  /* =============================================================
     PLUGIN DE EJEMPLO
     ============================================================= */
  
  const samplePlugin = {
    name: "SamplePlugin",
    install(Miloria) {
      Miloria.sampleMethod = function() {
        console.log("SamplePlugin: Método ejecutado.");
      };
    },
    init() {
      console.log("SamplePlugin inicializado.");
    }
  };
  
  
  /* =============================================================
     USO DE CONFIGURACIÓN GLOBAL Y PLUGINS
     ============================================================= */
  
  usePlugins();
  
  
  /* =============================================================
     EXPORTACIÓN GLOBAL
     ============================================================= */
  
  const Miloria = {
    // Virtual DOM
    h, patch, changed,
  
    // Utilidades
    isObject,
    deepClone,
    deepMerge,
    uniqueId,
    debounce,
    throttle,
    coreEventBus,
  
    // Reactividad
    reactive,
    effect,
    watch,
    computed,
    advancedComputed,
    deepWatch,
  
    // Componentes y Ciclo de Vida
    defineComponent,
    mountComponent,
    updateComponent,
    onBeforeMount,
    onMount,
    onBeforeUpdate,
    onUpdate,
    onBeforeUnmount,
    onUnmount,
  
    // Plantillas
    compileTemplate,
  
    // Enrutamiento
    router,
  
    // SSR y Server Functions
    ssr,
    serverFunction,
  
    // Partial Hydration
    hydrateOnly,
    deferHydration,
  
    // Plugins
    registerPlugin,
    usePlugins,
  
    // DevTools
    devTools,
    Logger,
  
    // Store
    createStore,
    createStoreAdvanced,
  
    // Event Bus
    eventBus: MiloriaEventBus,
  
    // Módulos Internos
    defineModule,
    requireModule,
    MiloriaModules,
  
    // i18n
    i18n,
  
    // Config
    config: MiloriaConfig,
    dev: MiloriaDevTools,
  
    // Validación
    validateData,
  
    // Transiciones / Animaciones
    transitionComponent,
    animate,
    animateAdvanced
  };
  
  window.Miloria = Miloria;
  
  
  /* =============================================================
     FIN DEL ARCHIVO
     ============================================================= */
  
  /* =============================================================
     Comparación con Frameworks Populares (solo referencia)
     =============================================================
     Framework     Velocidad   Ecosistema   Reactividad   Tamaño   Usabilidad   Total
     ------------------------------------------------------------------------------
     React (18.x)  ⭐⭐⭐⭐       ⭐⭐⭐⭐⭐       ⭐⭐⭐⭐         ⭐⭐      ⭐⭐⭐⭐       9/10
     Vue (3.x)     ⭐⭐⭐⭐⭐      ⭐⭐⭐⭐        ⭐⭐⭐⭐⭐        ⭐⭐⭐     ⭐⭐⭐⭐       9/10
     Svelte (4.x)  ⭐⭐⭐⭐⭐      ⭐⭐⭐         ⭐⭐⭐⭐⭐        ⭐⭐⭐⭐⭐   ⭐⭐⭐        8/10
     MiloriaJS     ⭐⭐⭐        ⭐           ⭐⭐⭐          ⭐⭐⭐⭐⭐   ⭐⭐⭐        4.5/10
  */ 
  