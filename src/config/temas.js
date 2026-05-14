import bg1 from "../assets/bg-form/fondos-claros/fondo1.png";
import bg2 from "../assets/bg-form/fondos-claros/fondo2.png";
import bg3 from "../assets/bg-form/fondos-claros/fondo3.png";
import bg4 from "../assets/bg-form/fondos-claros/fondo4.png";
import bg5 from "../assets/bg-form/fondos-claros/fondo5.png";
import bg6 from "../assets/bg-form/fondos-claros/fondo6.png";
import bgd1 from "../assets/bg-form/fondos-oscuros/fondo1.png";
import bgd2 from "../assets/bg-form/fondos-oscuros/fondo2.png";
import bgd3 from "../assets/bg-form/fondos-oscuros/fondo3.png";
import bgd4 from "../assets/bg-form/fondos-oscuros/fondo4.png";
import bgd5 from "../assets/bg-form/fondos-oscuros/fondo5.png";
import bgd6 from "../assets/bg-form/fondos-oscuros/fondo6.png";

/**
 * Temas predefinidos de la app.
 * base: "claro" | "oscuro" — variables CSS base a usar
 * categoria: "claro" | "oscuro" | "fondo" — para el filtro en el panel
 */
export const TEMAS = [
  //TEMAS PLANOS

  //CLARO====
  {
    id: "claro",
    label: "Claro",
    base: "claro",
    categoria: "claro",
    accent: "#111827",
    bg: "#efefef",
    border: "#3a2c3a",
    textDesc: "#636d82"
  },
  // OSCURO====
  {
    id: "oscuro",
    label: "Oscuro",
    base: "oscuro",
    categoria: "oscuro",
    accent: "#c9a227",
    bg: "#0c0c0c",
    border: "#b4b4b4a8",
    textDesc: "#a1a1aa"
  },


  // TEMAS CON GRADIENTES
  //CREMA====
  {
  id: "crema",
  label: "Crema",
  base: "claro",
  categoria: "claro",

  accent: "#8a6a3c",
  bg: "#f4ede3",
  border: "#b08d57",
  textDesc: "#5e5a55",

  gradient: `
  radial-gradient(circle at top left, rgb(255, 255, 255), transparent 35%),
  radial-gradient(circle at bottom right, rgb(255, 222, 172), transparent 40%),
  linear-gradient(180deg, #faf6ef 0%, #f4ede3 45%, #ece1d2 100%)
` },



  //CARBÓN====
  {
    id: "carbon",
    label: "Carbón",
    base: "oscuro",
    categoria: "oscuro",
    accent: "#f59f0bc4",
    bg: "#1a1a1a",
    border: "#2e2e2e",
    textDesc: "#a1a1aa", 
    gradient: `
  radial-gradient(circle at top left, rgba(245, 159, 11, 0.12), transparent 35%),
  radial-gradient(circle at bottom right, rgba(255, 180, 60, 0.10), transparent 40%),
  linear-gradient(180deg, #0a0a0a 0%, rgb(23, 23, 23) 45%, #111111 100%)
` },


  //COSMOS====
  {
    id: "cosmos",
    label: "Cosmos",
    base: "oscuro",
    categoria: "oscuro",
    accent: "#58a6ff",
    bg: "#0d1117",
    border: "#646565",
    textDesc: "#f4f9ff",
    gradient: "radial-gradient(circle at top left, rgba(88,166,255,.25), transparent 40%), radial-gradient(circle at bottom right, rgba(13, 139, 249, 0.18), transparent 40%), linear-gradient(180deg, #0d1117, #111827)"
  },


  //MENTA====
  {
    id: "menta",
    label: "Menta",
    base: "claro",
    categoria: "claro",
    accent: "#005f41",
    bg: "#f0fdf4",
    border: "#1c241f",
    textDesc: "#1c241f",
    gradient: `
  radial-gradient(ellipse at top, rgba(0, 95, 65, 0.37), transparent 55%),
  radial-gradient(ellipse at bottom left, rgba(52, 211, 153, 0.06), transparent 45%),
  linear-gradient(135deg, #f8fffb 0%, #e0ffe9 50%, #c3ffd8 100%)
` },

  // CIELO====
  {
    id: "cielo",
    label: "Cielo",
    base: "claro",
    categoria: "claro",
    accent: "#0284c7",
    bg: " #f0f9ff",
    border: "#002538",
    textDesc: "#1e3a8a",
    gradient: `
  radial-gradient(ellipse at top right, rgba(2, 132, 199, 0.14), transparent 55%),
  radial-gradient(ellipse at bottom left, rgba(125, 211, 252, 0.08), transparent 45%),
  linear-gradient(135deg, #fcfeff 0%, #f0f9ff 50%, #dbeafe 100%)
` },

  // ROSA====
  {
    id: "rosa",
    label: "Rosa",
    base: "claro",
    categoria: "claro",
    accent: "#db2777",
    bg: "#fdf2f8",
    border: "#7a294d",
    textDesc: "#7a294d"
  },

  // VINO====
  {
    id: "vino",
    label: "Vino",
    base: "oscuro",
    categoria: "oscuro",
    accent: "#c7b7bb",
    bg: "#1a0a0a",
    border: "#5f4b50",
    textDesc: "#a89aa0",
    gradient: `
  radial-gradient(circle at top right, rgba(199, 183, 187, 0.16), transparent 28%),
  radial-gradient(circle at bottom left, rgba(120, 30, 60, 0.20), transparent 35%),
  radial-gradient(ellipse at center, rgba(255, 120, 160, 0.06), transparent 55%),
  linear-gradient(145deg, #120707 0%, #1a0a0a 40%, #2b1018 100%)
`
  },

  // SELVA====
  {
    id: "selva",
    label: "Selva",
    base: "oscuro",
    categoria: "oscuro",
    accent: "#00a36c",
    bg: "#0a1a10",
    border: "#3f5a44",
    textDesc: "#8ba394", gradient: `
  radial-gradient(circle at top left, rgba(0, 163, 108, 0.18), transparent 30%),
  radial-gradient(circle at bottom right, rgba(120, 180, 80, 0.12), transparent 38%),
  radial-gradient(ellipse at center, rgba(20, 255, 160, 0.05), transparent 55%),
  linear-gradient(145deg, #07110b 0%, #0a1a10 40%, #13261a 100%)
`
  },
  // SELVA====
  {
    id: "grafito",
    label: "Grafito",
    base: "oscuro",
    categoria: "oscuro",
    accent: "#d6d6d6",
    bg: "#111111",
    border: "#3a3a3a",
    textDesc: "#9b9b9b",

    gradient: ` radial-gradient(circle at top left, rgba(255, 255, 255, 0.06), transparent 18%),
  radial-gradient(circle at top right, rgba(255, 255, 255, 0.05), transparent 16%),
  radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.04), transparent 18%),
  radial-gradient(circle at bottom right, rgba(255, 255, 255, 0.07), transparent 22%),
  radial-gradient(ellipse at center, rgba(255, 255, 255, 0.05), transparent 55%),
  linear-gradient(145deg, #0d0d0d 0%, #171717 45%, #101010 100%)
`
  },


  // LAVANDA ====
  {
    id: "lavanda",
    label: "Lavanda",
    base: "claro",
    categoria: "claro",
    accent: "#7c3aed",
    bg: "#f5f3ff",
    border: "#6d5c9e",
    textDesc: "#6b5f85",
    gradient: `
    radial-gradient(circle at top left, rgba(124, 58, 237, 0.14), transparent 30%),
    radial-gradient(circle at bottom right, rgba(167, 139, 250, 0.10), transparent 40%),
    linear-gradient(145deg, #fcfbff 0%, #f5f3ff 50%, #ede9fe 100%)
  `
  },




  // TEMAS CON IMAGEN DE FONDO

  //TEMAS CLAROS CON FONDO
  { id: "bg1", label: "Fondo 1", base: "claro", categoria: "fondo", accent: "#725000", bg: "rgba(255,255,255,0.75)", bgSolid: "#ffffff", border: "#00000081", textDesc: "#3f2c00", bgImage: bg1 },
  { id: "bg2", label: "Fondo 2", base: "claro", categoria: "fondo", accent: "#1e3200", bg: "rgba(255,255,255,0.75)", bgSolid: "#ffffff", border: "#00000080", textDesc: "#001c07", bgImage: bg2 },
  { id: "bg3", label: "Fondo 3", base: "claro", categoria: "fondo", accent: "#003836", bg: "rgba(255,255,255,0.75)", bgSolid: "#ffffff", border: "#00000080", textDesc: "#000b1b", bgImage: bg3 },
  { id: "bg4", label: "Fondo 4", base: "claro", categoria: "fondo", accent: "#660041", bg: "rgba(255,255,255,0.75)", bgSolid: "#ffffff", border: "#00000080", textDesc: "#1e0020", bgImage: bg4 },
  { id: "bg5", label: "Fondo 5", base: "claro", categoria: "fondo", accent: "#3b003a", bg: "rgba(255,255,255,0.75)", bgSolid: "#ffffff", border: "#00000080", textDesc: "#4f004a", bgImage: bg5 },
  { id: "bg6", label: "Fondo 6", base: "claro", categoria: "fondo", accent: "#2c2100", bg: "rgba(255,255,255,0.75)", bgSolid: "#ffffff", border: "#00000080", textDesc: "#232300", bgImage: bg6 },

  //TEMAS OSCUROS CON FONDO
  { id: "bgd1", label: "Fondo 7", base: "oscuro", categoria: "fondo", accent: "#cadbff", bg: "rgba(10,15,25,0.65)", bgSolid: "#0a0f19", border: "#ffffff30", textDesc: "#eefefd", bgImage: bgd1 },
  { id: "bgd2", label: "Fondo 8", base: "oscuro", categoria: "fondo", accent: "#ffffff", bg: "rgba(10,15,25,0.65)", bgSolid: "#0a0f19", border: "#ffffff30", textDesc: "#bbbbbb", bgImage: bgd2 },
  { id: "bgd3", label: "Fondo 9", base: "oscuro", categoria: "fondo", accent: "#e2fff0", bg: "rgba(10,15,25,0.65)", bgSolid: "#0a0f19", border: "#ffffff30", textDesc: "#f5fff3", bgImage: bgd3 },
  { id: "bgd4", label: "Fondo 10", base: "oscuro", categoria: "fondo", accent: "#ffffff", bg: "rgba(10,15,25,0.65)", bgSolid: "#0a0f19", border: "#ffffff30", textDesc: "#ffecf4", bgImage: bgd4 },
  { id: "bgd5", label: "Fondo 11", base: "oscuro", categoria: "fondo", accent: "#e8d6ff", bg: "rgba(10,15,25,0.65)", bgSolid: "#0a0f19", border: "#ffffff30", textDesc: "#feecff", bgImage: bgd5 },
  { id: "bgd6", label: "Fondo 12", base: "oscuro", categoria: "fondo", accent: "#ffffff", bg: "rgba(10,15,25,0.65)", bgSolid: "#0a0f19", border: "#ffffff30", textDesc: "#ffffff", bgImage: bgd6 },

  // PERSONALIZADO (usa el fondo claro por defecto, pero con acento y fondo personalizados)
  { id: "personalizado", label: "Custom", base: "claro", accent: null, bg: null },
];
