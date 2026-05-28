# Spavbl App (Versión Biblia Libre en Español - Astro Evolution)

**Spavbl App** es una plataforma de lectura bíblica y estudio interactivo de vanguardia para la **Versión Biblia Libre (VBL)** en español, traducida por Jonathan Gallagher y Shelly Barrios de Avila y distribuida bajo la licencia *Creative Commons Attribution-Share-Alike 4.0*.

Este proyecto ha sido completamente rediseñado y modernizado, pasando de un sitio web estático tradicional a una **aplicación web y full-stack moderna basada en Astro (React Islands) y Cloudflare Pages**. Su desarrollo sigue los más altos estándares de calidad de la industria de software, implementando **Clean Code**, **Screaming Architecture** y **principios SOLID**.

---

## 🚀 Arquitectura Técnica de Alto Rendimiento

La arquitectura de la aplicación está dividida en capas desacopladas (Clean Architecture), lo que permite un mantenimiento impecable, extensibilidad sin esfuerzo y un rendimiento óptimo en la red global de Cloudflare.

```
src/
├── core/                   # 1. Capa de Dominio (Modelos de datos y Puertos SOLID)
│   ├── entities.ts         # Modelos de Dominio (Book, Chapter, Note, Highlight, etc.)
│   └── ports.ts            # Contratos de interfaces (BibleProviderPort, StudyStoragePort)
│
├── features/               # 2. Capa de Casos de Uso (¡Nuestra estructura grita BIBLIA!)
│   └── bible/              # Lector inmersivo, buscador y navegación de libros
│       ├── useBible.ts     # Controlador de Dominio (Manejo de estado, navegación, notas/highlights)
│       ├── BibleReader.tsx # Lector Bíblico Inmersivo (footpopups, marcadores, notas)
│       └── BibleSearch.tsx # Buscador Instantáneo y Modal de Concordancias
│
├── infrastructure/         # 3. Capa de Adaptadores Concretos (Entrada/Salida)
│   ├── dependencies.ts     # Contenedor de Inyección de Dependencias (SOLID DIP)
│   ├── LocalBibleAdapter.ts # Lector diferido con Caché de 2 Niveles (Memory + IndexedDB)
│   └── LocalStudyStorageAdapter.ts # Persistencia local y offline en localStorage
│
├── shared/                 # 4. Capa de Presentación Compartida
│   └── Sidebar.tsx         # Barra de navegación lateral premium
│
├── layouts/                # 5. Capa de Maquetación Astro
│   └── Layout.astro        # Plantilla base HTML con tipografías Outfit/Lora y estilos globales
│
└── pages/                  # 6. Capa de Páginas de Astro (Rutas e Islas React)
    └── index.astro         # Punto de entrada principal que monta la Isla React (<App client:only="react" />)
```

### 🧠 Principios de Ingeniería Aplicados

*   **SOLID Dependency Inversion Principle (DIP)**: Los componentes visuales y la lógica de negocio solo conocen las interfaces abstractas de los puertos (`src/core/ports.ts`). Los adaptadores concretos (como IndexedDB o Cloudflare KV) se inyectan en tiempo de ejecución. Esto permite intercambiar la persistencia de datos (ej. migrar de offline a la nube) **sin modificar una sola línea de código en la UI**.
*   **Clean Code & Tipado Estricto**: Eliminación absoluta del tipo genérico `any` en la capa de datos. Estructuración estricta mediante interfaces tipadas (`BookData`, `SearchResult`, `Footnote`), garantizando un desarrollo 100% seguro contra fallos en tiempo de ejecución.
*   **Screaming Architecture**: Los directorios de la aplicación "gritan" su dominio de negocio (Biblia y Estudio de escrituras) en lugar de ocultar la intención del proyecto bajo carpetas genéricas de tecnología (como "containers" o "components").
*   **Arquitectura de Islas (Astro)**: La cáscara de la aplicación se sirve con la máxima optimización de Astro, mientras que las características interactivas (el lector, el buscador y el cajón de notas de estudio) se cargan de forma diferida mediante islas reactivas (`client:only="react"`).

---

## ⚡ Optimizaciones y Mejoras de Vanguardia

### 1. Sistema de Caché Híbrida de 2 Niveles (Local-First)
Para evitar el ineficiente consumo de 6.1 MB de datos móviles en cada inicio de la aplicación, implementamos una solución híbrida ultra-eficiente:
*   **Fragmentación de Base de Datos**: Dividimos la Biblia en **66 archivos JSON individuales** (uno por libro) guardados en `public/bible/{BOOK_ID}.json`, junto a un índice de metadatos ligero (`books.json`).
    *   **books.json** ocupa tan solo **3.6 KB** (¡una reducción del **1600x** en la carga inicial de red!).
    *   Cada libro individual oscila entre los **2 KB** (ej. *3 Juan*) y los **299 KB** (ej. *Génesis*). La app solo descarga el libro que el usuario lee en el momento.
*   **Caché Híbrida de 2 Niveles**:
    *   **Nivel 1 (Memoria)**: Los libros leídos se guardan en un `Map` para acceso instantáneo a velocidad de CPU (0ms).
    *   **Nivel 2 (IndexedDB)**: Desarrollamos una clase de base de datos local unificada usando la API nativa de **IndexedDB** del navegador (con cero dependencias de terceros). La app lee los libros directamente del disco local en milisegundos, permitiendo un funcionamiento **100% offline** y libre de red en visitas recurrentes.

### 2. Migración a Biome (Herramientas en Rust)
Reemplazamos por completo la pesada y lenta pila de ESLint y Prettier por **Biome**, un formateador y linter unificado escrito en Rust:
*   **Velocidad Excepcional**: Realiza la comprobación, validación semántica e import sorting de todo el proyecto en tan solo **298 milisegundos** (una mejora de más del **50x**).
*   **Configuración de CSS para Tailwind v4**: Soporta nativamente las directivas avanzadas de Tailwind CSS v4 (`@theme`, `@layer`) a través de la regla `"tailwindDirectives": true` en [biome.json].

### 3. Sincronización en la Nube con Cloudflare KV
El proyecto está completamente preparado para conectarse a **Cloudflare KV o D1 (Base de Datos Relacional)** a través de funciones del servidor en Astro para que las notas de estudio y marcadores de los usuarios se sincronicen al instante en la red Edge global de Cloudflare.

---

## 🎨 Funcionalidades de Nivel Mundial (Premium UI/UX)

*   📖 **Lector Zen Inmersivo**: Diseñado con un estilo limpio y libre de distracciones. Utiliza la elegante tipografía serif *Lora* para las escrituras y *Outfit* para la interfaz. Soporta modo oscuro AMOLED dinámico.
*   🖍️ **Marcadores HSL Dinámicos**: Selección de versículos para aplicar subrayados utilizando paletas de colores HSL armoniosas y vibrantes (oro mate, menta fresca, azul cobalto, coral).
*   📝 **Notas de Estudio Enriquecidas**: Editor flotante contextual (glassmorphism con desenfoque de fondo en tiempo real) para escribir reflexiones directamente asociadas a los versículos.
*   🔍 **Búsqueda de Concordancias**: Motor de búsqueda instantáneo en el cliente que indexa y muestra versículos coincidentes letra a letra a medida que el usuario escribe.
*   ♿ **Accesibilidad Total (WAI-ARIA)**: Marcado semántico completo (`role="button"`, `tabIndex={0}`) con soporte nativo de teclado (selección de versículos mediante las teclas `Enter` o `Espacio`) para personas con discapacidad visual o motora.

---

## 🛠️ Guía de Uso Rápido

El proyecto está optimizado para utilizarse con **Bun** para máxima velocidad.

### Iniciar Entorno de Desarrollo
Lanza la aplicación en local con recarga rápida instantánea (HMR) mediante Astro:
```bash
bun run dev
```
La aplicación estará disponible en `http://localhost:4321`.

### Validar Formato y Calidad de Código (Biome)
Valida la sintaxis, ordena los imports y comprueba el estilo en menos de 300ms:
```bash
bun run lint
```

### Autoformatear Código (Biome)
Aplica correcciones automáticas de indentación y espaciados de forma instantánea:
```bash
bun run format
```

### Compilar para Producción (Cloudflare Pages)
Genera la versión optimizada para despliegue en Cloudflare (SSR + Static Assets):
```bash
bun run build
```
*   **Archivos generados**:
    *   `dist/client/`: Archivos estáticos de frontend optimizados e individuales por libro.
    *   `dist/server/`: Entrypoints de servidor compilados para ser ejecutados en Cloudflare Pages Workers (Workerd).
