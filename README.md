<p align="center">
  <img src="https://webjesusdev.netlify.app/assets/logo-jesus-ENL3l8nb.png" width="120" />
  
</p>

<h1 align="center">TurnoYa</h1>

<p align="center">
  Sistema de reservas configurable para negocios reales
</p>


Sistema de reservas configurable orientado a negocios reales.

TurnoYa permite crear formularios de reserva personalizados con branding dinámico, panel de configuración, gestión de reservas y soporte multi-negocio usando rutas por slug.

---

# Stack

- React + Vite
- Supabase
- Edge Functions
- CSS puro (sin frameworks UI)
- Mobile-first
- Netlify

---

# Concepto del proyecto

La idea principal de TurnoYa es ofrecer un sistema de reservas flexible y visualmente configurable para pequeños negocios.

Cada negocio puede:

- personalizar colores y apariencia
- usar temas claros u oscuros
- añadir fondos artísticos
- cambiar branding/logo
- configurar horarios
- crear servicios
- añadir preguntas extra
- recibir reservas por WhatsApp o email
- gestionar reservas desde un panel propio

Todo usando el mismo motor interno.

---

# Arquitectura general

La app está dividida en 3 sistemas principales:

## 1. Formulario público

`ReservaWhatsApp.jsx`

Sistema principal de reservas.

### Características

- formulario dinámico
- validaciones
- slots automáticos
- horarios configurables
- preguntas extra
- servicios
- soporte WhatsApp/email
- generación de mensajes
- descarga ICS
- branding dinámico
- temas visuales
- fondos artísticos
- responsive mobile-first

---

## 2. Panel de configuración

`ConfigPanel.jsx`

Panel donde el dueño del negocio puede:

- editar branding
- cambiar temas
- configurar horarios
- bloquear fechas
- crear servicios
- configurar preguntas extra
- personalizar textos
- activar/desactivar campos
- cambiar modo WhatsApp/email
- exportar widget

### UX/UI

- sticky header compacto
- previews reales del formulario
- tabs responsive
- sistema visual de temas
- fondos artísticos
- categorías claras/oscuras
- UX optimizada para móvil

---

## 3. Panel de reservas

`ReservasPanel.jsx`

Gestión operativa de reservas.

### Características

- reservas en vivo
- polling automático
- confirmación/cancelación
- estados
- filtros
- búsqueda
- visualización detallada
- sincronización con Supabase

### Flujo completo

cliente → reserva → panel → confirmar/cancelar → email automático

---

# Sistema multi-negocio

La app soporta múltiples negocios usando slugs.

## Ejemplos

- `/vanessa`
- `/estrella`
- `/restaurante-pepe`

Cada slug tiene:

- configuración independiente
- reservas independientes
- branding independiente
- temas independientes
- panel independiente

Todo usando la misma app.

---

# Sistema de configuración

## Prioridad de config

1. `window.__TURNO_YA_CONFIG__`
2. `localStorage`
3. `NEGOCIO_DEFAULT`

La config siempre hace merge con defaults para evitar campos undefined en configuraciones antiguas.

---

# Sistema de temas

TurnoYa incluye:

- temas claros
- temas oscuros
- gradients dinámicos
- fondos artísticos
- overlays inline
- previews reales

## Organización

- Claros
- Oscuros

Cada categoría separa:

- colores sólidos
- fondos artísticos

---

# Fondos dinámicos

Los fondos funcionan mediante capas múltiples:

```js
backgroundImage = `
  linear-gradient(rgba(0,0,0,0.10), rgba(0,0,0,0.10)),
  url(...)
`
```

Y:

```js
backgroundSize = "100% 100%"
backgroundRepeat = "no-repeat"
backgroundPosition = "center top"
```

para mantener fondos completos responsive sin mosaicos ni cortes visibles.

`

Y:

```js
backgroundSize = "100% 100%"
backgroundRepeat = "no-repeat"
backgroundPosition = "center top"
```

para mantener fondos completos responsive sin mosaicos ni cortes visibles.

---

# useAdminConfig

Hook principal del panel admin.

## Gestiona

- draft editable
- autenticación por PIN
- horarios
- servicios
- preguntas extra
- guardado
- sincronización
- exportación widget
- previews en vivo

## Transformación de horarios

### Draft UI

```js
{
  0: {
    abierto: true,
    turnos: [{ start, end }]
  }
}
```

### Config final

```js
{
  0: [{ start, end }]
}
```

---

# useReservaForm

Hook principal del formulario.

## Gestiona

- validaciones
- touched states
- slots dinámicos
- servicios
- preguntas extra
- submit
- aforo
- integración Supabase
- generación de mensajes

Incluye validación derivada:

```js
const canSend = ...
```

---

# Sistema de slots

`utils/slots.js`

## Pipeline

```txt
fecha → horarios → generarSlots() → slots
```

## Soporta

- antelación mínima
- aforo máximo
- cierre temporal
- horarios especiales
- servicios con horarios propios
- rangos medianoche

---

# Supabase

## Tablas principales

### config

```txt
id
slug
datos(jsonb)
```

### reservas

```txt
id
slug
dia
hora
nombre
telefono
email
personas
servicio
estado
created_at
```

---

# Edge Functions

## guardar-config

- verifica PIN
- actualiza config
- sincroniza datos

## enviar-reserva

- crea reserva
- guarda datos
- envía email

## confirmar-reserva

- confirma reservas
- cancela reservas
- actualiza estado

---

# Widget embebido

Sistema pensado para incrustar TurnoYa en webs externas.

## Características

- configuración dinámica
- estilos aislados
- applyTema independiente
- soporte branding
- preview funcional

---

# Responsive

Arquitectura completamente mobile-first.

## Archivos

- `Responsive.css`
- `ResponsivePanel.css`

El formulario y panel funcionan tanto en móvil como desktop.

---

# Estado actual del proyecto

Actualmente TurnoYa ya incluye:

- sistema de reservas funcional
- confirmación/cancelación real
- panel de configuración completo
- panel de reservas operativo
- temas dinámicos
- fondos artísticos
- branding dinámico
- multi-negocio
- previews reales
- UX/UI avanzada
- responsive completo

El proyecto ya funciona como producto real y no como simple prototipo visual.
