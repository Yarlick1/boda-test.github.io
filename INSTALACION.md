# 📖 GUÍA DE INSTALACIÓN Y CONFIGURACIÓN

## Sistema de Gestión de Recetas - PACO PAN CASERO

Esta guía te llevará paso a paso para desplegar tu aplicación web de gestión de recetas.

---

## 📋 REQUISITOS PREVIOS

- Una cuenta de Google (para Google Sheets)
- Una cuenta de GitHub (para desplegar en GitHub Pages)
- Un navegador web moderno
- Editor de código (opcional, recomendado: VS Code)

---

## 🗂️ PASO 1: CONFIGURAR GOOGLE SHEETS

### 1.1 Crear el Google Sheet

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nómbrala como prefieras (ej: "Recetas PACO PAN")
4. En la primera hoja, cambia el nombre de la pestaña a **"Recetas"** (importante)

### 1.2 Configurar las columnas

En la primera fila (encabezados), escribe:

| A | B | C | D | E |
|---|---|---|---|---|
| Nombre | Categoría | Ingredientes | Instrucciones | Fecha de Creación |

### 1.3 Agregar recetas de ejemplo (opcional)

Puedes agregar algunas recetas para probar:

**Fila 2:**
- Nombre: `Bolillo Tradicional`
- Categoría: `Pan Blanco`
- Ingredientes: 
  ```
  500g Harina de trigo
  10g Sal
  300ml Agua tibia
  5g Levadura seca
  10ml Aceite
  ```
- Instrucciones:
  ```
  1. Mezclar harina y sal en un bowl grande
  2. Agregar levadura al agua tibia
  3. Incorporar líquidos a la harina
  4. Amasar durante 10 minutos
  5. Dejar reposar 1 hora
  6. Formar bolillos
  7. Hornear a 220°C por 20 minutos
  ```

---

## 🔧 PASO 2: CONFIGURAR GOOGLE APPS SCRIPT

### 2.1 Abrir el Editor de Scripts

1. En tu Google Sheet, ve a **Extensiones → Apps Script**
2. Se abrirá el editor de código

### 2.2 Copiar el código

1. Borra cualquier código que aparezca por defecto
2. Copia TODO el contenido del archivo `scripts/google-apps-script.js`
3. Pégalo en el editor

### 2.3 Verificar la configuración

Asegúrate de que la línea 15 tenga el nombre correcto de tu hoja:

```javascript
const SHEET_NAME = 'Recetas'; // Debe coincidir con el nombre de tu pestaña
```

### 2.4 Guardar el proyecto

1. Haz clic en el icono de disquete o presiona `Ctrl + S`
2. Nombra tu proyecto (ej: "Backend Recetas PACO")

### 2.5 Desplegar como Web App

1. En el editor, haz clic en **Implementar → Nueva implementación**
2. Haz clic en el icono de engranaje junto a "Selecciona el tipo"
3. Selecciona **Aplicación web**
4. Configura:
   - **Descripción:** "API de Recetas v1"
   - **Ejecutar como:** "Yo (tu correo)"
   - **Quién tiene acceso:** "Cualquier usuario"
5. Haz clic en **Implementar**
6. **IMPORTANTE:** Copia la **URL de la aplicación web** que aparece (la necesitarás en el siguiente paso)

### 2.6 Autorizar el script

1. La primera vez te pedirá permisos
2. Haz clic en **Revisar permisos**
3. Selecciona tu cuenta
4. Haz clic en **Avanzado**
5. Haz clic en **Ir a [nombre del proyecto] (no seguro)**
6. Haz clic en **Permitir**

---

## 💻 PASO 3: CONFIGURAR LA APLICACIÓN WEB

### 3.1 Estructura de archivos

Asegúrate de tener esta estructura:

```
proyecto/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md
```

### 3.2 Configurar la URL de Google Apps Script

1. Abre el archivo `public/script.js`
2. En la línea 7, reemplaza `'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI'` con la URL que copiaste en el paso 2.5:

```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/XXXXX/exec';
```

### 3.3 Probar localmente

1. Abre el archivo `public/index.html` directamente en tu navegador
2. **IMPORTANTE:** Debido a restricciones de CORS, algunas funciones pueden no trabajar localmente
3. Para pruebas completas, necesitas subir los archivos a un servidor

---

## 🚀 PASO 4: DESPLEGAR EN GITHUB PAGES

### 4.1 Crear repositorio en GitHub

1. Ve a [GitHub](https://github.com) e inicia sesión
2. Haz clic en el botón **"+"** → **New repository**
3. Configura:
   - **Repository name:** `recetas-paco-pan` (o el que prefieras)
   - **Public** (para usar GitHub Pages gratis)
   - ✅ **Add a README file**
4. Haz clic en **Create repository**

### 4.2 Subir archivos

**Opción A: Usar la interfaz web de GitHub**

1. En tu repositorio, haz clic en **Add file → Upload files**
2. Arrastra los archivos de la carpeta `public/` (index.html, style.css, script.js)
3. Escribe un mensaje de commit: "Subir aplicación inicial"
4. Haz clic en **Commit changes**

**Opción B: Usar Git (recomendado)**

```bash
# Navega a tu carpeta del proyecto
cd tu-carpeta-proyecto

# Inicializar Git
git init

# Agregar archivos
git add .

# Hacer commit
git commit -m "Primera versión de la aplicación"

# Conectar con GitHub
git remote add origin https://github.com/TU-USUARIO/recetas-paco-pan.git

# Subir archivos
git branch -M main
git push -u origin main
```

### 4.3 Activar GitHub Pages

1. En tu repositorio de GitHub, ve a **Settings** (Configuración)
2. En el menú lateral, haz clic en **Pages**
3. En **Branch**, selecciona:
   - Branch: **main**
   - Folder: **/ (root)** o **/public** según tu estructura
4. Haz clic en **Save**
5. Espera unos minutos

### 4.4 Acceder a tu sitio

Después de unos minutos, tu sitio estará disponible en:

```
https://TU-USUARIO.github.io/recetas-paco-pan/
```

Si tus archivos están en la carpeta `public/`, añade al final:

```
https://TU-USUARIO.github.io/recetas-paco-pan/public/
```

---

## ✅ PASO 5: VERIFICAR EL FUNCIONAMIENTO

### 5.1 Probar la carga de recetas

1. Abre tu sitio web
2. Deberías ver las recetas que agregaste en Google Sheets
3. Prueba el buscador escribiendo el nombre de una receta
4. Prueba los filtros de categoría

### 5.2 Probar el formulario

1. Haz clic en el botón "Agregar" en el header
2. Completa todos los campos del formulario
3. Haz clic en "Guardar Receta"
4. Verifica en Google Sheets que se haya agregado la nueva fila
5. Recarga la página principal para ver la nueva receta

### 5.3 Solución de problemas comunes

**Problema: Las recetas no se cargan**

- Verifica que la URL de Google Apps Script sea correcta en `script.js`
- Verifica que el nombre de la hoja sea "Recetas" en Google Sheets
- Revisa la consola del navegador (F12) para ver errores

**Problema: No puedo guardar recetas**

- Verifica que hayas autorizado el script en Google
- Verifica que la configuración de despliegue sea "Cualquier usuario"
- Asegúrate de que todos los campos del formulario estén llenos

**Problema: GitHub Pages muestra 404**

- Verifica que los archivos estén en la carpeta correcta
- Espera unos minutos más (puede tardar hasta 10 minutos)
- Verifica que el repositorio sea público

---

## 🎨 PASO 6: PERSONALIZACIÓN (OPCIONAL)

### 6.1 Cambiar colores

Edita las variables CSS en `style.css` (líneas 7-16):

```css
:root {
    --primary-brown: #B85C38;
    --secondary-coffee: #8B4513;
    --cream-bg: #FFF8F0;
    /* ... más colores ... */
}
```

### 6.2 Agregar más categorías

1. En `index.html`, añade botones de filtro (líneas 56-74)
2. En `script.js`, actualiza los iconos de categoría (líneas 225-232)

### 6.3 Modificar campos del formulario

Edita la sección del formulario en `index.html` (líneas 94-175)

---

## 📱 PASO 7: COMPARTIR TU APLICACIÓN

### 7.1 URL para compartir

Tu aplicación estará en:
```
https://TU-USUARIO.github.io/recetas-paco-pan/
```

### 7.2 Crear un acceso directo en móvil

**En Android/iPhone:**
1. Abre el sitio en el navegador
2. Toca el menú (⋮ o el icono de compartir)
3. Selecciona "Agregar a pantalla de inicio"
4. Ponle un nombre: "PACO PAN"

---

## 🔄 ACTUALIZAR LA APLICACIÓN

Cuando quieras hacer cambios:

1. Edita los archivos localmente
2. Sube los cambios a GitHub:
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   git push
   ```
3. GitHub Pages se actualizará automáticamente en unos minutos

---

## 📞 SOPORTE

Si encuentras problemas:

1. Revisa la consola del navegador (F12 → Console)
2. Verifica los permisos de Google Apps Script
3. Asegúrate de que todos los nombres coincidan exactamente

---

## ✨ ¡LISTO!

Tu aplicación de gestión de recetas está lista. Disfruta organizando tus recetas de panadería de manera profesional y accesible.

**¡Buen provecho y feliz horneado! 🍞**
