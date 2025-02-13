```markdown
# MiloriaJS

MiloriaJS es un framework moderno, **reactivo y optimizado en un solo archivo**. Ofrece un **Virtual DOM ligero**, reactividad avanzada, ciclo de vida de componentes, enrutamiento isomórfico, SSR simulado y gestión global de estado, todo sin configuraciones complejas. Ideal para desarrolladores que buscan **simplicidad, rendimiento y flexibilidad**.

---

## 🚀 Características Clave

✅ **Virtual DOM Ligero** para minimizar re-renderizados.  
✅ **Reactividad avanzada** con `reactive`, `effect`, `computed` y `watch`.  
✅ **Ciclo de vida de componentes** (`onBeforeMount`, `onMount`, `onBeforeUpdate`, `onUpdate`, `onBeforeUnmount`, `onUnmount`).  
✅ **API de componentes estilo Vue** (`props`, `slots`, `setup` que retorna `{ state, methods }`).  
✅ **Enrutamiento isomórfico** con rutas dinámicas, middleware y protección de rutas.  
✅ **SSR simulado y Hydration parcial**.  
✅ **Gestión global de estado avanzada** (`createStoreAdvanced`) con persistencia opcional en `localStorage`.  
✅ **Sistema de plugins modular** para extensibilidad.  
✅ **Animaciones avanzadas y transiciones**.  
✅ **DevTools y logs avanzados**.  

---

## 📦 Instalación

MiloriaJS es un framework **sin configuraciones** y listo para usar en un solo archivo. Solo **descarga `miloria.js`** y agrégalo a tu proyecto:

```html
<script src="miloria.js"></script>
```

O bien, **cárgalo desde un CDN**:

```html
<script src="https://cdn.example.com/miloria.js"></script>
```

---

## 🛠️ Uso Básico

### 1️⃣ Definir un Componente

```js
Miloria.defineComponent({
  name: "MiComponente",
  setup() {
    const state = Miloria.reactive({ contador: 0 });
    const incrementar = () => state.contador++;
    return {
      state,
      methods: { incrementar },
      render: () => Miloria.h("div", null,
        Miloria.h("p", null, `Contador: ${state.contador}`),
        Miloria.h("button", { onclick: incrementar }, "Incrementar")
      )
    };
  }
});
```

### 2️⃣ Montar el Componente en el DOM

```js
Miloria.mountComponent("MiComponente", document.getElementById("app"));
```

**Resultado en HTML:**

```html
<div id="app"></div>
```

---

## 🌍 Enrutamiento Isomórfico

Configurar rutas en MiloriaJS es sencillo:

```js
Miloria.router.register("/", "HomeComponent");
Miloria.router.register("/perfil/:usuario", "PerfilComponent");
Miloria.router.setNotFound("NotFoundComponent");

Miloria.router.init("#app");
```

Para navegar entre rutas:

```js
Miloria.router.navigate("/perfil/Mario");
```

---

## 🔥 Estado Global con Persistencia

```js
const store = Miloria.createStoreAdvanced({ usuario: "Anónimo" }, { persistKey: "appState" });

store.commit(state => state.usuario = "Adrián");
console.log(store.state.usuario); // "Adrián"
```

---

## 🎯 Comparación con Frameworks Populares

| Framework   | Velocidad | Ecosistema | Reactividad | Tamaño | Usabilidad | Total |
|------------|-----------|------------|-------------|--------|------------|-------|
| **React**  | ⭐⭐⭐⭐     | ⭐⭐⭐⭐⭐      | ⭐⭐⭐⭐       | ⭐⭐    | ⭐⭐⭐⭐       | 9/10  |
| **Vue**    | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐       | ⭐⭐⭐⭐⭐      | ⭐⭐⭐   | ⭐⭐⭐⭐       | 9/10  |
| **Svelte** | ⭐⭐⭐⭐⭐    | ⭐⭐⭐        | ⭐⭐⭐⭐⭐      | ⭐⭐⭐⭐⭐ | ⭐⭐⭐        | 8/10  |
| **MiloriaJS** | ⭐⭐⭐  | ⭐          | ⭐⭐⭐        | ⭐⭐⭐⭐⭐ | ⭐⭐⭐        | 4.5/10 |

---

## 🏆 ¿Por qué MiloriaJS?

- **Minimalista y optimizado** para alto rendimiento.  
- **Totalmente en un solo archivo**, sin configuraciones complejas.  
- **Sin dependencias externas** ni necesidad de compiladores.  
- **Ideal para proyectos rápidos y optimizados.**  

---

## 📄 Licencia

MiloriaJS está disponible bajo la **Licencia MIT**. ¡Úsalo libremente en tus proyectos! 🚀
```
