// ===================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ===================================

// IMPORTANTE: Reemplaza esta URL con la URL de tu Google Apps Script Web App
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz_TahRWO7jAsNJDvE_N6eHpPHyAcA_DGe7nkqJBr6ENTKPfgp1SBSYx-2SZYjyMGyi4A/exec"

// Estado de la aplicación
let allRecipes = []
let filteredRecipes = []
let currentCategory = "all"

// Función para resetear el formulario
function resetForm() {
  const recipeForm = document.getElementById("recipe-form")
  recipeForm.reset()
}

// Función para mostrar errores
function showError(message) {
  const errorMsg = document.getElementById("error-message")
  errorMsg.textContent = message
  errorMsg.style.display = "flex"
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

  // Modal
  const modal = document.getElementById("recipe-modal")
  const modalClose = modal.querySelector(".modal-close")
  const modalBackdrop = modal.querySelector(".modal-backdrop")

  modalClose.addEventListener("click", closeModal)
  modalBackdrop.addEventListener("click", closeModal)
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

  // Limpiar formulario si cambiamos de vista
  if (viewName === "add-recipe") {
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

    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getRecipes`, {
      method: "GET",
      redirect: "follow",
    })

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("La respuesta no es JSON. Verifica que el Google Apps Script esté desplegado correctamente.")
    }

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
// FORMULARIO DE NUEVA RECETA
// ===================================
async function handleFormSubmit(e) {
  e.preventDefault()

  const submitBtn = document.getElementById("submit-btn")
  const successMsg = document.getElementById("success-message")
  const errorMsg = document.getElementById("error-message")

  // Ocultar mensajes previos
  successMsg.style.display = "none"
  errorMsg.style.display = "none"

  // Obtener datos del formulario
  const formData = {
    name: document.getElementById("recipe-name").value.trim(),
    category: document.getElementById("recipe-category").value,
    ingredients: document.getElementById("recipe-ingredients").value.trim(),
    instructions: document.getElementById("recipe-instructions").value.trim(),
  }

  // Validación
  if (!formData.name || !formData.category || !formData.ingredients || !formData.instructions) {
    showError("Por favor completa todos los campos")
    return
  }

  // Deshabilitar botón mientras se envía
  submitBtn.disabled = true
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...'

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    const result = await response.json()

    if (result.status === "success") {
      // Mostrar mensaje de éxito
      successMsg.style.display = "flex"

      // Limpiar formulario
      resetForm()

      // Recargar recetas después de 1 segundo
      setTimeout(() => {
        loadRecipes()
        switchView("dashboard")
      }, 1500)
    } else {
      throw new Error(result.message || "Error al guardar la receta")
    }
  } catch (error) {
    console.error("Error:", error)
    showError("Error al guardar la receta. Verifica tu conexión e intenta nuevamente.")
  } finally {
    submitBtn.disabled = false
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Receta'
  }
}

// ===================================
// UTILIDADES
// ===================================

// Cerrar modal con tecla ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal()
  }
})

// Prevenir scroll del body cuando el modal está abierto
window.addEventListener("resize", () => {
  const modal = document.getElementById("recipe-modal")
  if (modal.classList.contains("active")) {
    document.body.style.overflow = "hidden"
  }
})
