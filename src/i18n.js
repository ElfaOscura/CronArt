import { state } from './store.js';

const D = {
  es: {
    // Navegación y vistas
    add: 'Agregar dibujo por hacer',
    filters: 'Filtros',
    search: 'Buscar dibujos',
    calendar: 'Calendario',
    kanban: 'Tablero',
    list: 'Listado',
    settings: 'Ajustes',
    profile: 'Perfil de artista',
    theme: 'Cambiar tema',
    lang: 'Idioma',
    social: 'Redes',
    export: 'Respaldo JSON (exportar)',
    import: 'Restaurar respaldo',
    install: 'Instalar app',
    pending: 'Pendientes',
    featured: 'Destacados',
    noFeatured: 'Marca una nota con la estrella para verla aquí.',
    noPending: 'Sin comisiones ni collabs pendientes.',
    prev: 'Mes anterior',
    next: 'Mes siguiente',
    todayB: 'Hoy',
    wd: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    all: 'Todos',
    status: 'Estado',
    type: 'Tipo',
    empty: 'Nada aquí todavía',
    badFile: 'Archivo no válido',

    // Tipos de dibujo
    type_eph: 'Efeméride',
    type_free: 'Dibujo libre',
    type_commission: 'Comisión',
    type_collab: 'Collab',

    // Estados
    st_todo: 'Sin empezar',
    st_sketch: 'Boceto',
    st_wip: 'En proceso',
    st_done: 'Realizado',
    st_waiting: 'En espera de otros',
    st_delivered: 'Entregado',
    st_published: 'Publicado',

    // Formulario y modales
    newItem: 'Nuevo dibujo',
    title: 'Título',
    date: 'Fecha',
    ephCheck: 'Basar en una efeméride',
    ephPick: 'Elige una efeméride',
    star: 'Destacado',
    starLimit: 'Ya hay 5 notas destacadas. Quita la estrella de una para destacar esta:',
    owner: '¿Eres dueño del collab?',
    oc: 'Incluye OC (personaje original)',
    refs: 'Referencias (hasta 3 enlaces)',
    upload: 'O sube una imagen local',
    caption: 'Caption / notas',
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    del: 'Eliminar',
    delTitle: '¿Eliminar este dibujo?',
    delTxt: 'Esta acción no se puede deshacer.',

    // Selección y borrado por lote
    selectAll: 'Seleccionar todo',
    deselectAll: 'Deseleccionar',
    deleteBatch: 'Borrar',

    // Perfil inicial
    welcome: 'Bienvenida a CronArt',
    onboard: 'Cuéntanos quién eres para personalizar tu espacio.',
    artist: 'Nombre artístico',
    start: 'Guardar perfil',
  },

  en: {
    // Navigation & views
    add: 'Add drawing to do',
    filters: 'Filters',
    search: 'Search drawings',
    calendar: 'Calendar',
    kanban: 'Board',
    list: 'List',
    settings: 'Settings',
    profile: 'Artist profile',
    theme: 'Switch theme',
    lang: 'Language',
    social: 'Social',
    export: 'JSON backup (export)',
    import: 'Restore backup',
    install: 'Install app',
    pending: 'Pending',
    featured: 'Featured',
    noFeatured: 'Star a note to see it here.',
    noPending: 'No pending commissions or collabs.',
    prev: 'Previous month',
    next: 'Next month',
    todayB: 'Today',
    wd: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    all: 'All',
    status: 'Status',
    type: 'Type',
    empty: 'Nothing here yet',
    badFile: 'Invalid file',

    // Drawing types
    type_eph: 'Observance',
    type_free: 'Free drawing',
    type_commission: 'Commission',
    type_collab: 'Collab',

    // Statuses
    st_todo: 'Not started',
    st_sketch: 'Sketch',
    st_wip: 'In progress',
    st_done: 'Done',
    st_waiting: 'Waiting for others',
    st_delivered: 'Delivered',
    st_published: 'Published',

    // Form & modals
    newItem: 'New drawing',
    title: 'Title',
    date: 'Date',
    ephCheck: 'Base it on an observance',
    ephPick: 'Pick an observance',
    star: 'Featured',
    starLimit: 'You already have 5 featured notes. Unstar one to feature this:',
    owner: 'Are you the collab owner?',
    oc: 'Includes OC (original character)',
    refs: 'References (up to 3 links)',
    upload: 'Or upload a local image',
    caption: 'Caption / notes',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    del: 'Delete',
    delTitle: 'Delete this drawing?',
    delTxt: 'This cannot be undone.',

    // Batch selection & delete
    selectAll: 'Select all',
    deselectAll: 'Deselect',
    deleteBatch: 'Delete',

    // Onboarding
    welcome: 'Welcome to CronArt',
    onboard: 'Tell us who you are to set up your space.',
    artist: 'Artist name',
    start: 'Save profile',
  },
};

export const t = (k) => D[state.lang]?.[k] ?? D.es[k] ?? k;

export function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach((e) => {
    e.textContent = t(e.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((e) => {
    const label = t(e.dataset.i18nAria);
    e.setAttribute('aria-label', label);
    e.title = label;
  });
}