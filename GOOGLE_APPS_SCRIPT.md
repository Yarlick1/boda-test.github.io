# Google Apps Script - Código de Backend

Este archivo contiene el código que debes copiar y pegar en Google Apps Script para conectar tu aplicación con Google Sheets.

## Instrucciones de Configuración

1. Abre tu Google Sheet con las recetas
2. Ve a **Extensiones > Apps Script**
3. Copia y pega el código que está abajo
4. Configura el nombre de tu hoja en la variable `SHEET_NAME` (línea 8)
5. Guarda el proyecto (Ctrl+S o Cmd+S)
6. Haz clic en **Deploy > New deployment**
7. Selecciona el tipo: **Web app**
8. Configura:
   - **Execute as**: "Me"
   - **Who has access**: "Anyone" o "Anyone, even anonymous"
9. Haz clic en **Deploy**
10. Copia la URL generada (Web app URL)
11. Pega esa URL en el archivo `public/script.js` en la línea 7 (reemplaza `TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI`)

## Código para Google Apps Script

```javascript
// ===================================
// CONFIGURACIÓN
// ===================================
const SHEET_NAME = "Recetas" // Nombre de tu hoja de Google Sheets

// ===================================
// FUNCIÓN PRINCIPAL - GET
// ===================================
function doGet(e) {
  try {
    const action = e.parameter.action

    if (action === "getRecipes") {
      return getRecipes()
    }

    return createResponse({
      status: "error",
      message: "Acción no válida",
    })
  } catch (error) {
    return createResponse({
      status: "error",
      message: error.toString(),
    })
  }
}

// ===================================
// FUNCIÓN PRINCIPAL - POST
// ===================================
function doPost(e) {
  try {
    if (!e || !e.postData) {
      return createResponse({
        status: "error",
        message: "No se recibieron datos",
      })
    }

    // Parsear datos recibidos
    const data = JSON.parse(e.postData.contents)

    // Validar datos
    if (!data.name || !data.category || !data.ingredients || !data.instructions) {
      throw new Error("Faltan campos obligatorios")
    }

    // Guardar en Google Sheets
    const result = addRecipe(data)

    return createResponse({
      status: "success",
      message: "Receta guardada correctamente",
      data: result,
    })
  } catch (error) {
    return createResponse({
      status: "error",
      message: error.toString(),
    })
  }
}

// ===================================
// CREAR RESPUESTA CON HEADERS CORS
// ===================================
function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}

// ===================================
// OBTENER TODAS LAS RECETAS
// ===================================
function getRecipes() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)

    if (!sheet) {
      throw new Error(`No se encontró la hoja "${SHEET_NAME}"`)
    }

    const data = sheet.getDataRange().getValues()

    // Si no hay datos o solo está el encabezado
    if (data.length <= 1) {
      return createResponse({
        status: "success",
        recipes: [],
      })
    }

    // Convertir datos a objetos (asumiendo que la primera fila es el encabezado)
    const recipes = []

    for (let i = 1; i < data.length; i++) {
      const row = data[i]

      // Solo agregar filas que tengan datos
      if (row[0]) {
        recipes.push({
          id: i,
          name: row[0] || "",
          category: row[1] || "Otros",
          ingredients: row[2] || "",
          instructions: row[3] || "",
          timestamp: row[4] || "",
        })
      }
    }

    return createResponse({
      status: "success",
      recipes: recipes,
    })
  } catch (error) {
    return createResponse({
      status: "error",
      message: error.toString(),
    })
  }
}

// ===================================
// AGREGAR NUEVA RECETA
// ===================================
function addRecipe(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)

  if (!sheet) {
    throw new Error(`No se encontró la hoja "${SHEET_NAME}"`)
  }

  // Si la hoja está vacía, agregar encabezados
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Nombre", "Categoría", "Ingredientes", "Instrucciones", "Fecha de Creación"])
  }

  // Agregar nueva fila con los datos
  const timestamp = new Date().toLocaleString("es-MX")
  sheet.appendRow([data.name, data.category, data.ingredients, data.instructions, timestamp])

  return {
    name: data.name,
    category: data.category,
    timestamp: timestamp,
  }
}

// ===================================
// FUNCIÓN DE PRUEBA (Opcional)
// ===================================
function testGetRecipes() {
  const result = getRecipes()
  Logger.log(result.getContent())
}

function testAddRecipe() {
  const testData = {
    name: "Bolillo de Prueba",
    category: "Pan Blanco",
    ingredients: "500g Harina\n10g Sal\n300ml Agua\n5g Levadura",
    instructions: "1. Mezclar ingredientes\n2. Amasar\n3. Dejar reposar\n4. Hornear",
  }

  const result = addRecipe(testData)
  Logger.log(result)
}
```

## Estructura de la Hoja de Google Sheets

Tu hoja "Recetas" debe tener las siguientes columnas (se crean automáticamente):

| Nombre | Categoría | Ingredientes | Instrucciones | Fecha de Creación |
|--------|-----------|--------------|---------------|-------------------|
| Bolillo | Pan Blanco | 500g Harina... | 1. Mezclar... | 01/01/2024 10:00 |

## Solución de Problemas

### Error de CORS
Si recibes errores de CORS, asegúrate de que:
- El despliegue esté configurado con "Who has access" como "Anyone" o "Anyone, even anonymous"
- Hayas copiado la URL correcta (debe terminar en `/exec`)
- Hayas creado un **nuevo despliegue** después de hacer cambios al código

### Error "No se encontró la hoja"
- Verifica que el nombre de la hoja en Google Sheets sea exactamente "Recetas" (con mayúscula)
- O cambia la variable `SHEET_NAME` en el código para que coincida con tu hoja

### **IMPORTANTE: Después de pegar el nuevo código**
1. Ve a **Deploy > Manage deployments**
2. Haz clic en el icono de **editar** (lápiz)
3. Selecciona **New version** en el dropdown
4. Haz clic en **Deploy**
5. La URL no cambiará, pero el código se actualizará
