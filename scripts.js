document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("login-section");
  const mainContent = document.getElementById("main-content");
  const adminTools = document.getElementById("admin-tools");
  const loginButton = document.getElementById("login-button");
  const guestButton = document.getElementById("guest-button");
  const uploadButton = document.getElementById("upload-button");
  const excelInput = document.getElementById("excel-input");
  const logoutButton = document.getElementById("logout-button");
  const loginError = document.getElementById("login-error");

  const filterDateInput = document.getElementById("filter-date");
  const filterDestinationInput = document.getElementById("filter-destination");
  filterDestinationInput.addEventListener("input", () => {
  applyFilters();
});
  const filterButton = document.getElementById("filter-button");
  const clearFilterButton = document.getElementById("clear-filter-button");
  
  // 📌 Función para aplicar filtros
const applyFilters = () => {
  const filterDate = filterDateInput.value; // Fecha del input en formato YYYY-MM-DD
  const filterDestination = filterDestinationInput.value.trim().toLowerCase();

  document.querySelectorAll("#availability-table tbody tr").forEach(row => {
    const dateCell = row.cells[1]?.textContent.trim(); // Fecha en formato DD/MM/YYYY
    const destinationCell = row.cells[0]?.textContent.trim().toLowerCase();

    let rowDateFormatted = "";
    if (dateCell) {
      const [day, month, year] = dateCell.split("/");
      rowDateFormatted = `${year}-${month}-${day}`; // Convertir a YYYY-MM-DD
    }

    let showRow = (!filterDate || rowDateFormatted === filterDate) &&
                  (!filterDestination || destinationCell.includes(filterDestination));

    row.style.display = showRow ? "" : "none";
  });
};

  const ADMIN_ID = "ADMIN";
  const ADMIN_PASSWORD = "1244";



  const loadDataFromServer = () => {
    fetch("/data")
      .then((response) => response.json())
      .then((data) => {
        console.log("Datos recibidos del servidor:", data);
        populateTable(data);
      })
      .catch((error) => console.error("Error al cargar datos:", error));
  };

  loginButton.addEventListener("click", () => {
    const userId = document.getElementById("user-id").value.trim();
    const userPassword = document.getElementById("user-password").value.trim();

    if (!userId || !userPassword) {
      showError("Por favor, completa todos los campos.");
      return;
    }

    if (userId === ADMIN_ID && userPassword === ADMIN_PASSWORD) {
      loginSection.classList.add("hidden");
      mainContent.classList.remove("hidden");
      adminTools.classList.remove("hidden");
      loginError.textContent = "";
      loadDataFromServer();
    } else {
      showError("ID o Contraseña incorrectos");
    }
  });

  guestButton.addEventListener("click", () => {
    loginSection.classList.add("hidden");
    mainContent.classList.remove("hidden");
    adminTools.classList.add("hidden");
    loginError.textContent = "";
    loadDataFromServer();
  });

  const showError = (message) => {
    loginError.textContent = message;
    loginError.style.display = "block";
  };

  const formatDateString = (dateString) => {
    if (!dateString) return "N/A";

    const parts = dateString.split("/");
    if (parts.length === 3) {
      let [day, month, year] = parts.map(part => part.padStart(2, "0")); // Asegurar formato de 2 dígitos
      year = year.length === 2 ? `20${year}` : year; // Convertir año corto a largo
      return `${day}/${month}/${year}`;
    }
    return dateString;
  };

  const populateTable = (data) => {
    const tableBody = document.querySelector("#availability-table tbody");
    tableBody.innerHTML = "";

    if (data.length === 0) {
      const emptyRow = document.createElement("tr");
      const emptyCell = document.createElement("td");
      emptyCell.textContent = "No hay datos disponibles";
      emptyCell.setAttribute("colspan", "9");
      emptyCell.style.textAlign = "center";
      emptyRow.appendChild(emptyCell);
      tableBody.appendChild(emptyRow);
      return;
    }

    data.forEach((row) => {
      const tableRow = document.createElement("tr");

      ["DESTINO", "FECHA", "DISPONIBLE", "TARIFA", "GTO ADM", "DURACION", "HOTEL", "REGIMEN", "OBSERVACIONES"].forEach((col, index) => {
        const cell = document.createElement("td");

        if (col === "FECHA" && row[col]) {
          cell.textContent = formatDateString(row[col]); // ✅ Mostrar fecha en formato DD/MM/YYYY
        } else {
          cell.textContent = row[col] ? row[col] : "";
        }

        tableRow.appendChild(cell);
      });

      tableBody.appendChild(tableRow);
    });
  };

  uploadButton.addEventListener("click", () => {
  const file = excelInput.files[0];
  if (!file) {
    alert("Por favor, selecciona un archivo Excel.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      loadDataFromServer();
      updateLastUpdateTime(); // 🔥 Actualizar la fecha y hora después de la carga
    })
    .catch((error) => {
      alert("Error al subir el archivo.");
      console.error("Error:", error);
    });
});

// Función para actualizar la fecha y hora en el cartel
const updateLastUpdateTime = () => {
  const now = new Date();
  const formattedDate = now.toLocaleDateString("es-ES"); // Fecha en formato DD/MM/YYYY
  const formattedTime = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }); // Hora en formato HH:MM

  const lastUpdateElement = document.getElementById("last-update");
  lastUpdateElement.textContent = `Última actualización: ${formattedDate} - ${formattedTime}`;
};

  logoutButton.addEventListener("click", () => {
    mainContent.classList.add("hidden");
    adminTools.classList.add("hidden");
    loginSection.classList.remove("hidden");
    document.getElementById("user-id").value = "";
    document.getElementById("user-password").value = "";
    loginError.textContent = "";
  });

  filterButton.addEventListener("click", () => {
  applyFilters();
});

clearFilterButton.addEventListener("click", () => {
  filterDateInput.value = ""; // Limpia el campo de fecha
  filterDestinationInput.value = ""; // Limpia el campo de destino
  applyFilters(); // Aplica los filtros (que ahora no filtrarán nada)
});
   });