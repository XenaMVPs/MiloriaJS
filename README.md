
# MiloriaJS ⚡️

**MiloriaJS** es un framework **rápido, reactivo y optimizado**, diseñado para encapsular en un solo archivo todas las funcionalidades clave de un framework moderno.  
Ofrece **Virtual DOM mejorado, reactividad avanzada, ciclo de vida de componentes, enrutamiento isomórfico, SSR simulado, gestión de estado global, animaciones y más**.  

MiloriaJS es ideal para quienes buscan **rendimiento, simplicidad y flexibilidad**, sin configuraciones innecesarias.

---

## 🚀 Características Clave

✅ **Virtual DOM ultra rápido** con reconcilación mejorada y minimización de re-renderizados.  
✅ **Reactividad avanzada** (`reactive`, `effect`, `computed`, `watch`) optimizada al máximo.  
✅ **Ciclo de vida de componentes** (`onBeforeMount`, `onMount`, `onBeforeUpdate`, `onUpdate`, `onBeforeUnmount`, `onUnmount`).  
✅ **Componentes modernos** con API estilo Vue (`props`, `slots`, `setup` retornando `{ state, methods }`).  
✅ **Enrutamiento isomórfico avanzado** con rutas dinámicas, middleware y protección de rutas.  
✅ **SSR Simulado** y **Partial Hydration** para optimizar rendimiento.  
✅ **Gestión global de estado** (`createStoreAdvanced`) con persistencia en `localStorage` o `sessionStorage`.  
✅ **Sistema de plugins** para extender funcionalidades.  
✅ **Animaciones y transiciones avanzadas** (`animate`, `transitionComponent`).  
✅ **DevTools y logging mejorado**.  
✅ **CLI en desarrollo** para acelerar la creación de proyectos.  

---

## 📦 Instalación

MiloriaJS está diseñado para ser **plug & play**, sin configuraciones extras. Puedes incluirlo de estas formas:

### 💾 Archivo local
```html
<script src="miloria.js"></script>
```

### 🌍 Carga desde CDN
```html
<script src="https://cdn.example.com/miloria.js"></script>
```

---

## 🏁 Ejemplo Básico

### 📌 Definir un Componente
```js
Miloria.defineComponent({
  name: "Contador",
  setup() {
    const state = Miloria.reactive({ count: 0 });
    const incrementar = () => state.count++;

    return {
      state,
      methods: { incrementar },
      render: () => Miloria.h("div", null,
        Miloria.h("p", null, `Contador: ${state.count}`),
        Miloria.h("button", { onclick: incrementar }, "Incrementar")
      )
    };
  }
});
```

### 🏗️ Montar el Componente
```js
Miloria.mountComponent("Contador", document.getElementById("app"));
```

### 🖥️ Resultado HTML:
```html
<div id="app"></div>
```

---

## 🌐 Enrutamiento Isomórfico

MiloriaJS maneja rutas dinámicas y protegidas sin esfuerzo:

```js
Miloria.router.register("/", "HomeComponent");
Miloria.router.register("/perfil/:usuario", "PerfilComponent");
Miloria.router.setNotFound("NotFoundComponent");

Miloria.router.init("#app");
```

Navegación:

```js
Miloria.router.navigate("/perfil/Mario");
```

---

## 🔒 Estado Global con Persistencia

```js
const store = Miloria.createStoreAdvanced(
  { usuario: "Anónimo" },
  { persistKey: "appUser" }
);

store.commit(state => {
  state.usuario = "Laura";
});

console.log(store.state.usuario); // "Laura"
```

---

## 🎭 Animaciones y Transiciones

```js
const miElemento = document.getElementById("box");

Miloria.animate(miElemento, { opacity: 0 }, { duration: 500, onComplete: () => console.log("Animación terminada") });
```

---

## 🔎 Comparativa con Otros Frameworks

| Framework   | Velocidad 🚀 | Ecosistema 🌍 | Reactividad ⚡ | Tamaño 📦 | Usabilidad 🔧 | Nota Final ⭐ |
|------------|-------------|--------------|--------------|----------|------------|-------------|
| **React**  | ⭐⭐⭐⭐       | ⭐⭐⭐⭐⭐       | ⭐⭐⭐⭐        | ⭐⭐      | ⭐⭐⭐⭐       | 9/10       |
| **Vue**    | ⭐⭐⭐⭐⭐      | ⭐⭐⭐⭐        | ⭐⭐⭐⭐⭐       | ⭐⭐⭐     | ⭐⭐⭐⭐       | 9/10       |
| **Svelte** | ⭐⭐⭐⭐⭐      | ⭐⭐⭐         | ⭐⭐⭐⭐⭐       | ⭐⭐⭐⭐⭐   | ⭐⭐⭐        | 8.5/10     |
| **MiloriaJS** | ⭐⭐⭐⭐    | ⭐⭐          | ⭐⭐⭐⭐        | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐       | **8/10**   |

> **MiloriaJS** ha evolucionado para ser **competitivo** con los frameworks más utilizados, ofreciendo alto rendimiento en un solo archivo.

---

## 🏆 ¿Por Qué Escoger MiloriaJS?

✔ **Minimalista y sin complicaciones**: todo en un solo archivo.  
✔ **Fácil de integrar**: sin dependencias externas.  
✔ **Rápido y reactivo**: optimización total en re-renderizados.  
✔ **Ideal para proyectos pequeños y medianos** con rendimiento top.  

---

## 📄 Licencia

**MiloriaJS** se distribuye bajo la [Licencia MIT](https://opensource.org/licenses/MIT).  
¡Disfruta desarrollando con este framework y contribuye a su crecimiento! 🚀  
```

---

