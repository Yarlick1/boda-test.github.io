// ===================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ===================================

// IMPORTANTE: Reemplaza esta URL con la URL de tu Google Apps Script Web App
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxaCVrdmnw0Np7dpZt_6rMxIBZogXszqC5dxUhMk6xT73UlbAZiekPmqDTtI3KpdYFL-w/exec"

// Estado de la aplicación
let allRecipes = []
let filteredRecipes = []
let currentCategory = "all"
let editMode = false
let editingRecipeId = null
let currentAction = null // 'create', 'edit', 'delete'

function showSuccess(message) {
  const successMsg = document.getElementById("success-message")
  successMsg.textContent = message
  successMsg.style.display = "flex"

  setTimeout(() => {
    successMsg.style.display = "none"
  }, 3000)
}

// Función para resetear el formulario
function resetForm() {
  const recipeForm = document.getElementById("recipe-form")
  recipeForm.reset()
  editMode = false
  editingRecipeId = null
  document.getElementById("submit-btn").innerHTML = '<i class="fas fa-save"></i> Guardar Receta'
  document.getElementById("form-title").textContent = "Agregar Nueva Receta"
  document.getElementById("form-subtitle").textContent = "Completa todos los campos para registrar tu receta"
}

// Función para mostrar errores
function showError(message) {
  const errorMsg = document.getElementById("error-message")
  errorMsg.textContent = message
  errorMsg.style.display = "flex"

  setTimeout(() => {
    errorMsg.style.display = "none"
  }, 3000)
}

// ===================================
// INICIALIZACIÓN
// ===================================
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

function initializeApp() {
  setupEventListeners()
  loadRecipes()
}

// ===================================
// EVENT LISTENERS
// ===================================
function setupEventListeners() {
  // Navegación
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", handleNavigation)
  })

  // Búsqueda
  const searchInput = document.getElementById("search-input")
  const clearSearchBtn = document.getElementById("clear-search")

  searchInput.addEventListener("input", handleSearch)
  clearSearchBtn.addEventListener("click", clearSearch)

  // Filtros de categoría
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", handleCategoryFilter)
  })

  // Formulario
  const recipeForm = document.getElementById("recipe-form")
  const cancelBtn = document.getElementById("cancel-btn")

  recipeForm.addEventListener("submit", handleFormSubmit)
  cancelBtn.addEventListener("click", () => switchView("dashboard"))

  // Modal de receta
  const modal = document.getElementById("recipe-modal")
  const modalClose = modal.querySelector(".modal-close")
  const modalBackdrop = modal.querySelector(".modal-backdrop")

  modalClose.addEventListener("click", closeModal)
  modalBackdrop.addEventListener("click", closeModal)

  const authModal = document.getElementById("auth-modal")
  const authModalClose = authModal.querySelector(".modal-close")
  const authModalBackdrop = authModal.querySelector(".modal-backdrop")
  const authCancelBtn = document.getElementById("auth-cancel-btn")
  const authForm = document.getElementById("auth-form")

  authModalClose.addEventListener("click", closeAuthModal)
  authModalBackdrop.addEventListener("click", closeAuthModal)
  authCancelBtn.addEventListener("click", closeAuthModal)
  authForm.addEventListener("submit", handleAuthSubmit)
}

// ===================================
// NAVEGACIÓN
// ===================================
function handleNavigation(e) {
  const btn = e.currentTarget
  const viewName = btn.dataset.view

  // Actualizar botones activos
  document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"))
  btn.classList.add("active")

  // Cambiar vista
  switchView(viewName)
}

function switchView(viewName) {
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"))
  document.getElementById(viewName).classList.add("active")

  // Actualizar navegación
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === viewName)
  })

  // Limpiar formulario si cambiamos de vista SOLO si no estamos editando
  if (viewName === "add-recipe" && !editMode) {
    resetForm()
  }
}

// ===================================
// CARGAR RECETAS DESDE GOOGLE SHEETS
// ===================================
async function loadRecipes() {
  const container = document.getElementById("recipes-container")
  const emptyState = document.getElementById("empty-state")

  try {
    // Mostrar estado de carga
    container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Cargando recetas...</p>
            </div>
        `

    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getRecipes`)

    const data = await response.json()

    if (data.status === "success") {
      allRecipes = data.recipes
      filteredRecipes = [...allRecipes]
      renderRecipes()
    } else {
      throw new Error(data.message || "Error desconocido")
    }
  } catch (error) {
    console.error("Error:", error)
    container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar recetas</h3>
                <p>${error.message}</p>
                <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-light);">
                    <strong>Pasos para solucionar:</strong><br>
                    1. Verifica que la URL del script sea correcta<br>
                    2. Asegúrate de que el despliegue esté configurado como "Anyone" o "Anyone, even anonymous"<br>
                    3. Verifica que la hoja se llame "Recetas"
                </p>
            </div>
        `
  }
}

// ===================================
// RENDERIZAR RECETAS
// ===================================
function renderRecipes() {
  const container = document.getElementById("recipes-container")
  const emptyState = document.getElementById("empty-state")

  container.innerHTML = ""

  if (filteredRecipes.length === 0) {
    emptyState.style.display = "block"
    return
  }

  emptyState.style.display = "none"

  filteredRecipes.forEach((recipe) => {
    const card = createRecipeCard(recipe)
    container.appendChild(card)
  })
}

function createRecipeCard(recipe) {
  const card = document.createElement("div")
  card.className = "recipe-card"

  // Icono según categoría
  const icon = getCategoryIcon(recipe.category)

  // Previsualización de ingredientes (primeros 3)
  const ingredientsList = recipe.ingredients.split("\n").filter((i) => i.trim())
  const preview = ingredientsList.slice(0, 3).join(", ")
  const moreCount = ingredientsList.length > 3 ? ` (+${ingredientsList.length - 3} más)` : ""

  card.innerHTML = `
        <div class="recipe-icon">${icon}</div>
        <span class="category-badge">${recipe.category}</span>
        <h3>${recipe.name}</h3>
        <p class="recipe-preview">${preview}${moreCount}</p>
    `

  card.addEventListener("click", () => openRecipeModal(recipe))

  return card
}

function getCategoryIcon(category) {
  const icons = {
    "Pan Blanco": "🥖",
    "Pan Dulce": "🥐",
    "Pan de Muerto": "💀",
    Pizza: "🍕",
    Otros: "🍞",
  }
  return icons[category] || "🍞"
}

// ===================================
// BÚSQUEDA Y FILTROS
// ===================================
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase().trim()
  const clearBtn = document.getElementById("clear-search")

  // Mostrar/ocultar botón de limpiar
  clearBtn.classList.toggle("active", searchTerm.length > 0)

  // Filtrar recetas
  filterRecipes(searchTerm, currentCategory)
}

function clearSearch() {
  const searchInput = document.getElementById("search-input")
  const clearBtn = document.getElementById("clear-search")

  searchInput.value = ""
  clearBtn.classList.remove("active")

  filterRecipes("", currentCategory)
}

function handleCategoryFilter(e) {
  const chip = e.currentTarget
  const category = chip.dataset.category

  // Actualizar chips activos
  document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"))
  chip.classList.add("active")

  currentCategory = category

  // Obtener término de búsqueda actual
  const searchTerm = document.getElementById("search-input").value.toLowerCase().trim()

  filterRecipes(searchTerm, category)
}

function filterRecipes(searchTerm, category) {
  filteredRecipes = allRecipes.filter((recipe) => {
    // Filtro de categoría
    const categoryMatch = category === "all" || recipe.category === category

    // Filtro de búsqueda (nombre o ingredientes)
    const searchMatch =
      searchTerm === "" ||
      recipe.name.toLowerCase().includes(searchTerm) ||
      recipe.ingredients.toLowerCase().includes(searchTerm)

    return categoryMatch && searchMatch
  })

  renderRecipes()
}

// ===================================
// MODAL DE DETALLE
// ===================================
function openRecipeModal(recipe) {
  const modal = document.getElementById("recipe-modal")

  // Llenar datos del modal
  document.getElementById("modal-recipe-name").textContent = recipe.name
  document.getElementById("modal-recipe-category").textContent = recipe.category

  // Ingredientes
  const ingredientsList = document.getElementById("modal-ingredients-list")
  ingredientsList.innerHTML = ""

  recipe.ingredients.split("\n").forEach((ingredient) => {
    if (ingredient.trim()) {
      const li = document.createElement("li")
      li.textContent = ingredient.trim()
      ingredientsList.appendChild(li)
    }
  })

  // Instrucciones
  document.getElementById("modal-instructions-content").textContent = recipe.instructions

  const editBtn = document.getElementById("modal-edit-btn")
  const deleteBtn = document.getElementById("modal-delete-btn")

  editBtn.onclick = () => {
    closeModal()
    openAuthModal("edit", recipe)
  }

  deleteBtn.onclick = () => {
    closeModal()
    openAuthModal("delete", recipe)
  }

  // Mostrar modal
  modal.classList.add("active")
  document.body.style.overflow = "hidden"
}

function closeModal() {
  const modal = document.getElementById("recipe-modal")
  modal.classList.remove("active")
  document.body.style.overflow = ""
}

// ===================================
// MODAL DE AUTENTICACIÓN
// ===================================
function openAuthModal(action, recipe = null) {
  const authModal = document.getElementById("auth-modal")
  const authTitle = document.getElementById("auth-modal-title")
  const authMessage = document.getElementById("auth-modal-message")

  currentAction = action

  // Guardar datos de la receta si es edición o eliminación
  if (action === "edit" || action === "delete") {
    if (recipe && recipe.id) {
      editingRecipeId = recipe.id
    }
  }

  // Personalizar mensaje según la acción
  const messages = {
    create: {
      title: "Crear Nueva Receta",
      message: "Ingresa la contraseña para crear una nueva receta",
    },
    edit: {
      title: "Editar Receta",
      message: recipe ? `Ingresa la contraseña para editar "${recipe.name}"` : "Ingresa la contraseña para editar la receta",
    },
    delete: {
      title: "Eliminar Receta",
      message: recipe ? `Ingresa la contraseña para eliminar "${recipe.name}"` : "Ingresa la contraseña para eliminar la receta",
    },
  }

  authTitle.textContent = messages[action].title
  authMessage.textContent = messages[action].message

  // Limpiar campo de contraseña
  document.getElementById("auth-password").value = ""
  document.getElementById("auth-error").style.display = "none"

  // Mostrar modal
  authModal.classList.add("active")
  document.body.style.overflow = "hidden"

  // Focus en el campo de contraseña
  setTimeout(() => {
    document.getElementById("auth-password").focus()
  }, 100)
}

function closeAuthModal() {
  const authModal = document.getElementById("auth-modal")
  authModal.classList.remove("active")
  document.body.style.overflow = ""

  // Limpiar estado
  currentAction = null
  editingRecipeId = null
}

async function handleAuthSubmit(e) {
  e.preventDefault()

  const password = document.getElementById("auth-password").value
  const authError = document.getElementById("auth-error")
  const authSubmitBtn = document.getElementById("auth-submit-btn")

  authError.style.display = "none"
  authSubmitBtn.disabled = true
  authSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validando...'

  try {
    // Validar contraseña con el servidor
    const response = await fetch(
      `${GOOGLE_SCRIPT_URL}?action=validatePassword&password=${encodeURIComponent(password)}`,
    )
    const data = await response.json()

    if (data.status === "success" && data.valid) {
      // Contraseña correcta
      const action = currentAction
      const recipeId = editingRecipeId

      console.log("Contraseña válida para acción:", action)

      closeAuthModal()

      // Ejecutar la acción correspondiente
      if (action === "create") {
        // Guardar la receta nueva
        console.log("Procediendo a guardar receta nueva")
        guardarReceta()
      } else if (action === "edit") {
        // Cargar datos de la receta en el formulario para editar
        console.log("Cargando receta para editar con ID:", recipeId)
        const recipe = allRecipes.find((r) => r.id === recipeId)
        if (recipe) {
          loadRecipeForEdit(recipe)
        } else {
          showError("No se encontró la receta")
        }
      } else if (action === "delete") {
        // Eliminar la receta
        console.log("Procediendo a eliminar receta con ID:", recipeId)
        await deleteRecipe(recipeId)
      }
    } else {
      // Contraseña incorrecta
      authError.textContent = "Contraseña incorrecta"
      authError.style.display = "block"
    }
  } catch (error) {
    console.error("Error al validar:", error)
    authError.textContent = "Error al validar contraseña"
    authError.style.display = "block"
  } finally {
    authSubmitBtn.disabled = false
    authSubmitBtn.innerHTML = '<i class="fas fa-check"></i> Validar'
  }
}

// ===================================
// EDITAR RECETA
// ===================================
function loadRecipeForEdit(recipe) {
  if (!recipe) {
    showError("No se pudo cargar la receta")
    return
  }

  console.log("loadRecipeForEdit: Cargando receta con ID:", recipe.id)

  // Establecer modo de edición ANTES de cambiar la vista
  editMode = true
  editingRecipeId = recipe.id

  console.log("editMode establecido a:", editMode, "editingRecipeId:", editingRecipeId)

  // Cambiar a la vista del formulario PRIMERO
  switchView("add-recipe")

  // Esperar a que la vista esté visible antes de llenar los campos
  setTimeout(() => {
    // Llenar el formulario con los datos de la receta
    document.getElementById("recipe-name").value = recipe.name || ""
    document.getElementById("recipe-category").value = recipe.category || ""
    document.getElementById("recipe-ingredients").value = recipe.ingredients || ""
    document.getElementById("recipe-instructions").value = recipe.instructions || ""

    // Cambiar título y subtítulo del formulario
    document.getElementById("form-title").textContent = "Editar Receta"
    document.getElementById("form-subtitle").textContent = `Editando: ${recipe.name}`

    // Cambiar texto del botón
    document.getElementById("submit-btn").innerHTML = '<i class="fas fa-edit"></i> Actualizar Receta'

    console.log("Formulario cargado. editMode actual:", editMode)
    showSuccess("Receta cargada para edición")
  }, 50)
}

// ===================================
// ELIMINAR RECETA
// ===================================
async function deleteRecipe(recipeId) {
  const loadingMsg = showSuccess("Eliminando receta...")

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify({
        action: "deleteRecipe",
        id: recipeId,
      }),
    })

    showSuccess("Receta eliminada exitosamente")

    setTimeout(() => {
      loadRecipes()
    }, 1000)
  } catch (error) {
    console.error("Error:", error)
    showError("Error al eliminar la receta")
  }
}

// ===================================
// FORMULARIO DE NUEVA RECETA
// ===================================
async function handleFormSubmit(e) {
  e.preventDefault()

  console.log("handleFormSubmit ejecutado. editMode:", editMode, "editingRecipeId:", editingRecipeId)

  // Si no estamos en modo edición, pedir autenticación primero
  if (!editMode) {
    console.log("No estamos en modo edición, pidiendo contraseña para crear")
    currentAction = "create"
    openAuthModal("create")
    return
  }

  // Si estamos editando, proceder directamente a guardar sin pedir contraseña
  console.log("Estamos en modo edición, guardando directamente")
  guardarReceta()
}

async function guardarReceta() {
  // Capturar el estado ACTUAL de editMode y editingRecipeId
  const isEditMode = editMode
  const currentRecipeId = editingRecipeId

  console.log("guardarReceta: isEditMode:", isEditMode, "currentRecipeId:", currentRecipeId)

  const submitBtn = document.getElementById("submit-btn")
  const successMsg = document.getElementById("success-message")
  const errorMsg = document.getElementById("error-message")

  successMsg.style.display = "none"
  errorMsg.style.display = "none"

  const formData = {
    action: isEditMode ? "editRecipe" : "createRecipe",
    name: document.getElementById("recipe-name").value.trim(),
    category: document.getElementById("recipe-category").value,
    ingredients: document.getElementById("recipe-ingredients").value.trim(),
    instructions: document.getElementById("recipe-instructions").value.trim(),
  }

  if (isEditMode) {
    formData.id = currentRecipeId
    console.log("Actualizando receta con ID:", currentRecipeId, "Datos:", formData)
  } else {
    console.log("Creando nueva receta. Datos:", formData)
  }

  if (!formData.name || !formData.category || !formData.ingredients || !formData.instructions) {
    showError("Por favor completa todos los campos")
    return
  }

  submitBtn.disabled = true
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...'

  try {
    // Usar no-cors mode para evitar preflight requests
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(formData),
    })

    console.log("Petición enviada exitosamente al servidor")

    successMsg.textContent = isEditMode ? "Receta actualizada exitosamente" : "Receta guardada exitosamente"
    successMsg.style.display = "flex"
    
    setTimeout(() => {
      resetForm()
      loadRecipes()
      switchView("dashboard")
    }, 1500)
  } catch (error) {
    console.error("Error al guardar:", error)
    showError("Error al conectar con el servidor.")
  } finally {
    submitBtn.disabled = false
    submitBtn.innerHTML = isEditMode
      ? '<i class="fas fa-edit"></i> Actualizar Receta'
      : '<i class="fas fa-save"></i> Guardar Receta'
  }
}

// ===================================
// UTILIDADES
// ===================================

// Cerrar modal con tecla ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal()
    closeAuthModal()
  }
})

// Prevenir scroll del body cuando el modal está abierto
window.addEventListener("resize", () => {
  const modal = document.getElementById("recipe-modal")
  const authModal = document.getElementById("auth-modal")
  if (modal.classList.contains("active") || authModal.classList.contains("active")) {
    document.body.style.overflow = "hidden"
  }
})
