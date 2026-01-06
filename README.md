# 🍞 PACO PAN CASERO - Sistema de Gestión de Recetas

Una aplicación web moderna y responsiva para gestionar recetas de panadería, conectada con Google Sheets como base de datos.

![PACO PAN CASERO](https://img.shields.io/badge/PACO%20PAN-CASERO-B85C38?style=for-the-badge)

## 🌟 Características

- ✅ **Dashboard Interactivo** - Visualiza todas tus recetas organizadas por categorías
- 🔍 **Búsqueda Inteligente** - Busca por nombre de receta o ingredientes
- 🏷️ **Filtros por Categoría** - Pan Blanco, Pan Dulce, Pan de Muerto, Pizza, y más
- 📝 **Formulario de Carga** - Agrega nuevas recetas fácilmente
- 💾 **Almacenamiento en Google Sheets** - Base de datos gratuita y accesible
- 📱 **Diseño Responsivo** - Funciona perfectamente en móvil, tablet y escritorio
- 🎨 **Diseño Artesanal** - Paleta de colores cálidos inspirada en panadería casera

## 🛠️ Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript Vanilla (ES6+)
- **Backend:** Google Apps Script
- **Base de Datos:** Google Sheets
- **Despliegue:** GitHub Pages

## 📂 Estructura del Proyecto

```
recetas-paco-pan/
├── public/
│   ├── index.html          # Estructura principal de la aplicación
│   ├── style.css           # Estilos con paleta PACO PAN CASERO
│   └── script.js           # Lógica de la aplicación
├── scripts/
│   └── google-apps-script.js   # Backend para Google Sheets
├── INSTALACION.md          # Guía detallada de instalación
└── README.md               # Este archivo
```

## 🚀 Instalación Rápida

### 1. Configura Google Sheets

1. Crea un Google Sheet con una hoja llamada "Recetas"
2. Agrega los encabezados: `Nombre | Categoría | Ingredientes | Instrucciones | Fecha de Creación`

### 2. Configura Google Apps Script

1. En tu Google Sheet: **Extensiones → Apps Script**
2. Copia el código de `scripts/google-apps-script.js`
3. Despliega como **Aplicación web** (Cualquier usuario)
4. Copia la URL de despliegue

### 3. Configura la Aplicación

1. Abre `public/script.js`
2. Reemplaza `GOOGLE_SCRIPT_URL` con tu URL de Apps Script

### 4. Despliega en GitHub Pages

1. Sube los archivos a un repositorio de GitHub
2. Activa GitHub Pages en **Settings → Pages**
3. Accede a tu aplicación en `https://tu-usuario.github.io/recetas-paco-pan/`

Para instrucciones detalladas, consulta [INSTALACION.md](INSTALACION.md)

## 🎨 Paleta de Colores

La aplicación utiliza una paleta de colores inspirada en el logo PACO PAN CASERO:

```css
--primary-brown: #B85C38      /* Marrón terracota */
--secondary-coffee: #8B4513   /* Café suave */
--cream-bg: #FFF8F0           /* Crema suave */
--soft-pink: #F4E4D7          /* Rosado pastel */
--accent-warm: #D4A574        /* Acento cálido */
```

## 📖 Uso

### Ver Recetas

1. La vista principal muestra todas las recetas en tarjetas
2. Haz clic en cualquier tarjeta para ver los detalles completos
3. Usa el buscador para encontrar recetas específicas
4. Filtra por categoría usando los chips de filtro

### Agregar Recetas

1. Haz clic en el botón "Agregar" en el header
2. Completa el formulario:
   - Nombre de la receta
   - Categoría
   - Ingredientes (uno por línea con cantidad)
   - Instrucciones paso a paso
3. Haz clic en "Guardar Receta"
4. La receta se guardará automáticamente en Google Sheets

## 🔧 Personalización

### Agregar Nuevas Categorías

En `index.html`, agrega un nuevo botón de filtro:

```html
<button class="filter-chip" data-category="Tu Categoría">
    Tu Categoría
</button>
```

En `script.js`, actualiza los iconos:

```javascript
const icons = {
    'Tu Categoría': '🥯',
    // ... otros iconos
};
```

### Cambiar Colores

Edita las variables CSS en `style.css`:

```css
:root {
    --primary-brown: #TuColor;
    --secondary-coffee: #TuColor;
    /* ... */
}
```

## 🐛 Solución de Problemas

### Las recetas no cargan

- Verifica que la URL de Google Apps Script sea correcta
- Verifica que el nombre de la hoja sea "Recetas"
- Revisa la consola del navegador (F12) para errores

### No puedo guardar recetas

- Verifica que hayas autorizado el script en Google
- Asegúrate de que la configuración sea "Cualquier usuario"
- Verifica que todos los campos estén completos

### GitHub Pages muestra 404

- Verifica que los archivos estén en la ubicación correcta
- Espera unos minutos (puede tardar hasta 10 minutos)
- Verifica que el repositorio sea público

## 📱 Responsive Design

La aplicación está optimizada para:

- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Escritorio (1024px+)

## 🔒 Seguridad

- Los datos se almacenan en tu Google Sheet personal
- Usa Google Apps Script para evitar problemas de CORS
- No se requieren claves API expuestas en el frontend

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo licencia MIT. Siéntete libre de usarlo y modificarlo.

## 👨‍💻 Autor

Creado con ❤️ para PACO PAN CASERO

---

⭐ Si te gusta este proyecto, dale una estrella en GitHub!

🍞 ¡Feliz horneado!
