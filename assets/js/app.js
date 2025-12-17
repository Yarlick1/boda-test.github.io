// ======================================================================
// ⚠️ CONFIGURACIÓN CLAVE - DEBES CAMBIAR ESTOS VALORES ⚠️
// ======================================================================

// 1. CLOUDINARY: Tu Cloud Name (ej: 'djdg7922d'). Obténlo al crear tu cuenta gratuita.
const CLOUDINARY_CLOUD_NAME = "daxothobr";
// 2. CLOUDINARY: El Preset de Subida. DEBE ser 'Unsigned' para seguridad.
const CLOUDINARY_UPLOAD_PRESET = "boda_preset";

// 3. GOOGLE APPS SCRIPT: La URL de tu Despliegue de la API de Google Sheets.
const SCRIPT_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbyKTqJuXFLjZSdULXDcvthHsxOaL0ojwm-j2C2_StlR48M9cawyhJ71SlKQ5qTIRVs1Uw/exec";

// ======================================================================
// Referencias a los elementos del HTML (Actualizado para el nuevo diseño)
const photoContainer = document.getElementById("photo-container");
const loadingMessage = document.getElementById("loading-message");

// Modales
const uploadModal = document.getElementById("upload-modal");
const lightboxModal = document.getElementById("lightbox-modal");
const lightboxImage = document.getElementById("lightbox-image");

// Formulario y Botones
// NOTA: Aquí estaba el error, actualizamos el ID del botón de apertura
const uploadBtn = document.getElementById("upload-trigger-btn");
const uploadForm = document.getElementById("upload-form");
const submitBtn = document.getElementById("submit-btn");
const statusMessage = document.getElementById("status-message");

let lastPhotoCount = 0;

// --- 1. LÓGICA DE LA GALERÍA (CARGA DE FOTOS) ---

async function fetchPhotos() {
  try {
    const response = await fetch(`${SCRIPT_WEB_APP_URL}?action=get`);
    if (!response.ok) throw new Error("Error de conexión");
    const data = await response.json();

    const photos = data.photos || [];

    // Si no hay fotos nuevas, no hacemos nada
    if (photos.length === lastPhotoCount && lastPhotoCount !== 0) {
      return;
    }

    // Ocultar mensaje de carga si hay fotos
    if (photos.length > 0 && loadingMessage) {
      loadingMessage.style.display = "none"; // Usamos style.display para asegurar compatibilidad
    } else if (photos.length === 0 && loadingMessage) {
      loadingMessage.textContent = "Sé el primero en subir una foto...";
    }

    // Ordenar: Las más nuevas primero
    photos.reverse();

    // Si hay cambios en la cantidad de fotos, actualizamos el grid
    if (photos.length > lastPhotoCount) {
      photoContainer.innerHTML = ""; // Limpiamos para evitar duplicados visuales

      photos.forEach((photo) => {
        const photoDiv = document.createElement("div");
        // Mantenemos las clases del CSS nuevo
        photoDiv.style.borderRadius = "4px";
        photoDiv.style.overflow = "hidden";
        photoDiv.style.cursor = "pointer";
        photoDiv.dataset.aos = "fade-up";
        photoDiv.dataset.aosDuration = "10000";

        // URLs
        const thumbnailImageUrl = photo.url.replace(
          "/upload/",
          "/upload/w_400,c_scale/"
        );
        const fullImageUrl = photo.url;

        photoDiv.innerHTML = `
                    <img src="${thumbnailImageUrl}" 
                         loading="lazy" 
                         style="width: 100%; display: block;"
                         data-full-url="${fullImageUrl}"> 
                `;

        // Click para abrir pantalla completa
        photoDiv.addEventListener("click", () => openLightbox(fullImageUrl));

        photoContainer.appendChild(photoDiv);
      });
      // Después de añadir tus fotos al contenedor:
      AOS.refresh();
    }

    lastPhotoCount = photos.length;
  } catch (error) {
    console.error("Error cargando fotos:", error);
  }
}

function initPolling() {
  fetchPhotos();
  setInterval(fetchPhotos, 5000); // Actualiza cada 5 segundos
}

// --- 2. LÓGICA DEL LIGHTBOX (PANTALLA COMPLETA) ---

function openLightbox(imageUrl) {
  if (lightboxImage && lightboxModal) {
    lightboxImage.src = imageUrl;
    lightboxModal.style.display = "flex";
  }
}

function closeLightbox(event) {
  // Si se pasa evento, verificar click fuera. Si no, cerrar directo.
  if (
    !event ||
    event.target === lightboxModal ||
    event.target.classList.contains("close-lightbox")
  ) {
    lightboxModal.style.display = "none";
    lightboxImage.src = ""; // Limpiar src
  }
}

// Hacemos las funciones globales para que funcionen con los onclick del HTML
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;

// --- 3. LÓGICA DE SUBIDA (FORMULARIO) ---

function openModal() {
  if (uploadModal) uploadModal.style.display = "flex";
  if (statusMessage) {
    statusMessage.textContent = "";
    statusMessage.style.display = "none";
  }
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = "ENVIAR RECUERDO";
  }
}

function closeModal(event) {
  if (
    !event ||
    event.target === uploadModal ||
    event.target.getAttribute("onclick")
  ) {
    uploadModal.style.display = "none";
    uploadForm.reset();
    const fileLabel = document.getElementById("file-label");
    if (fileLabel) fileLabel.textContent = "Toca para seleccionar foto";
  }
}
window.openModal = openModal;
window.closeModal = closeModal;

async function handleUpload(event) {
  event.preventDefault();

  const fileInput = document.getElementById("photo-file");
  const file = fileInput.files[0];
  if (!file) return;

  // UI Loading
  submitBtn.disabled = true;
  submitBtn.textContent = "Subiendo...";
  statusMessage.style.display = "block";
  statusMessage.textContent = "⏳ Subiendo a la nube...";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    // 1. Subir a Cloudinary
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!cloudinaryResponse.ok) throw new Error("Falló la subida de imagen");
    const cloudinaryData = await cloudinaryResponse.json();
    const photoUrl = cloudinaryData.secure_url;

    statusMessage.textContent = "📝 Guardando en el álbum...";

    // 2. Guardar en Google Sheets
    await fetch(SCRIPT_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", url: photoUrl }),
    });

    statusMessage.textContent = "¡Listo! Foto añadida ❤️";
    statusMessage.style.color = "green";

    // Refrescar galería
    await fetchPhotos();

    setTimeout(() => {
      closeModal();
      statusMessage.textContent = "";
      statusMessage.style.color = ""; // Reset color
    }, 1500);
  } catch (error) {
    console.error(error);
    statusMessage.textContent = "Error. Intenta de nuevo.";
    statusMessage.style.color = "red";
    submitBtn.disabled = false;
    submitBtn.textContent = "REINTENTAR";
  }
}

// --- 4. INICIALIZACIÓN SEGURA ---

document.addEventListener("DOMContentLoaded", () => {
  // Solo añadimos listeners si los elementos existen para evitar errores
  if (uploadBtn) {
    uploadBtn.addEventListener("click", openModal);
  }

  if (uploadForm) {
    uploadForm.addEventListener("submit", handleUpload);
  }

  // Iniciar la galería
  initPolling();
});

/**
 * Función para mostrar la vista previa de la foto seleccionada
 * y solucionar el error de ReferenceError
 */
function previewImage(input) {
  const previewContainer = document.getElementById("preview-container");
  const previewImg = document.getElementById("image-preview");
  const instructions = document.getElementById("upload-instructions");
  const fileLabel = document.getElementById("file-label");

  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      // Mostrar la imagen
      previewImg.src = e.target.result;
      previewContainer.classList.remove("hidden");

      // Ocultar las instrucciones de "Toca aquí" para que no estorben
      instructions.classList.add("hidden");

      // Cambiar el texto por el nombre del archivo
      fileLabel.textContent = "Foto seleccionada: " + input.files[0].name;
    };

    reader.readAsDataURL(input.files[0]);
  }
}

// Vinculamos la función al objeto window para que el HTML pueda verla
window.previewImage = previewImage;

/**
 * Modificamos la función closeModal para que también limpie la vista previa
 */
const originalCloseModal = window.closeModal;
window.closeModal = function (event) {
  // Llamamos a la lógica anterior
  if (typeof originalCloseModal === "function") {
    // Si tienes la lógica vieja, la dejamos que corra
    if (
      !event ||
      event.target === uploadModal ||
      event.target.getAttribute("onclick")
    ) {
      uploadModal.style.display = "none";
    }
  }

  // Limpiamos la vista previa al cerrar
  document.getElementById("upload-form").reset();
  document.getElementById("preview-container").classList.add("hidden");
  document.getElementById("upload-instructions").classList.remove("hidden");
  document.getElementById("file-label").textContent =
    "Toca para Tomar Foto o Elegir de Galería";
};
