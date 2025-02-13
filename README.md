
# MiloriaJS

**MiloriaJS** es un framework moderno, **reactivo y optimizado** que encapsula en un solo archivo funcionalidades clave como **Virtual DOM**, un sistema de **reactividad avanzada**, un completo ciclo de vida de componentes, enrutamiento isomórfico, **SSR simulado** y **gestión global de estado**. Está diseñado para quienes buscan **simplicidad, rendimiento y flexibilidad** sin configuraciones complejas.

---

## 🚀 Características Clave

- **Virtual DOM Ligero** para un mínimo de re-renderizados.  
- **Reactividad avanzada** con `reactive`, `effect`, `computed`, `watch`.  
- **Ciclo de vida de componentes** completo (`onBeforeMount`, `onMount`, `onBeforeUpdate`, `onUpdate`, `onBeforeUnmount`, `onUnmount`).  
- **API de componentes estilo Vue**: `props`, `slots` y un `setup` que retorna `{ state, methods }`.  
- **Enrutamiento isomórfico** con rutas dinámicas, middleware y protección de rutas.  
- **SSR simulado** y **Hydration parcial**.  
- **Gestión global de estado** (`createStoreAdvanced`) con persistencia opcional en `localStorage`.  
- **Sistema de plugins** para extender funcionalidades.  
- **Animaciones y transiciones avanzadas**.  
- **DevTools y logging avanzado**.

---

## 📦 Instalación

MiloriaJS está concebido para funcionar en un solo archivo y sin configuraciones extras. Para usarlo en tu proyecto, basta con:

```html
<script src="miloria.js"></script>
```

O bien, puedes cargarlo desde un CDN:

```html
<script src="https://cdn.example.com/miloria.js"></script>
```

---

## 🏁 Ejemplo Básico

### Definir un componente

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

### Montar el componente

```js
Miloria.mountComponent("MiComponente", document.getElementById("app"));
```

**Resultado HTML:**

```html
<div id="app"></div>
```

---

## 🌐 Enrutamiento Isomórfico

Configurar rutas con MiloriaJS:

```js
Miloria.router.register("/", "HomeComponent");
Miloria.router.register("/perfil/:usuario", "PerfilComponent");
Miloria.router.setNotFound("NotFoundComponent");

Miloria.router.init("#app");
```

Navega usando:

```js
Miloria.router.navigate("/perfil/Mario");
```

---

## 🔒 Estado Global con Persistencia

```js
const store = Miloria.createStoreAdvanced(
  { usuario: "Anónimo" },
  { persistKey: "miAppState" }
);

store.commit(state => {
  state.usuario = "Juan";
});

console.log(store.state.usuario); // "Juan"
```

---

## 🔎 Comparativa con Otros Frameworks

| Framework   | Velocidad | Ecosistema | Reactividad | Tamaño | Usabilidad | Nota Final |
|------------|-----------|------------|-------------|--------|------------|-----------|
| **React**  | ⭐⭐⭐⭐     | ⭐⭐⭐⭐⭐      | ⭐⭐⭐⭐       | ⭐⭐    | ⭐⭐⭐⭐       | 9/10      |
| **Vue**    | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐       | ⭐⭐⭐⭐⭐      | ⭐⭐⭐   | ⭐⭐⭐⭐       | 9/10      |
| **Svelte** | ⭐⭐⭐⭐⭐    | ⭐⭐⭐        | ⭐⭐⭐⭐⭐      | ⭐⭐⭐⭐⭐ | ⭐⭐⭐        | 8.5/10    |
| **MiloriaJS** | ⭐⭐⭐  | ⭐          | ⭐⭐⭐        | ⭐⭐⭐⭐⭐ | ⭐⭐⭐        | 5/10      |

> **MiloriaJS** aún está en desarrollo y mantiene un perfil **minimalista**; su calificación actual puede mejorar con futuras actualizaciones y una comunidad más amplia.

---

## 🏆 ¿Por Qué Escoger MiloriaJS?

- **Minimalista y sin complicaciones**: un solo archivo que lo trae todo.  
- **Fácil de integrar**: sin dependencias externas.  
- **Ideal para proyectos rápidos** que requieran alto rendimiento y sencillez.  

---

## 📄 Licencia

**MiloriaJS** se distribuye bajo la [Licencia MIT](https://opensource.org/licenses/MIT). ¡Disfruta desarrollando con este framework y contribuye a su crecimiento!  
```
