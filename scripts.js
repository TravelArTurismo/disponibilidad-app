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
  filterDateInput.addEventListener("input", () => {
    applyFilters();
  });
  filterDestinationInput.addEventListener("input", () => {
    applyFilters();
  });
  const filterButton = document.getElementById("filter-button");
  const clearFilterButton = document.getElementById("clear-filter-button");


  const hashPassword = (password) => {
    return btoa(password);
  };

  const ADMIN_ID = "ADMIN";
  const ADMIN_PASSWORD_HASH = "MTI0NA==";

  // 📌 Función para aplicar filtros
  const applyFilters = () => {
    const filterDate = filterDateInput.value;
    const filterDestination = filterDestinationInput.value.trim().toLowerCase();

    document.querySelectorAll("#availability-table tbody tr").forEach(row => {
      const dateCell = row.cells[1]?.textContent.trim();
      const destinationCell = row.cells[0]?.textContent.trim().toLowerCase();

      let rowDateFormatted = "";
      if (dateCell) {
        const [day, month, year] = dateCell.split("/");
        rowDateFormatted = `${year}-${month}-${day}`;
      }

      let showRow = (!filterDate || rowDateFormatted === filterDate) &&
                    (!filterDestination || destinationCell.includes(filterDestination));

      row.style.display = showRow ? "" : "none";
    });
  };

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

    const userPasswordHash = hashPassword(userPassword);


    if (userId === ADMIN_ID && userPasswordHash === ADMIN_PASSWORD_HASH) {
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

            // Formatear fecha (sin cambios)
            if (col === "FECHA" && row[col]) {
                cell.textContent = formatDateString(row[col]);
            } 
            // Nueva lógica para la columna DISPONIBLE
            else if (col === "DISPONIBLE") {
                const disponibilidad = parseInt(row[col]) || 0; // Convertir a número
                let texto = "";
                let color = "";

                if (disponibilidad >= 35 && disponibilidad <= 57) {
                    texto = "DISPONIBLE";
                    color = "#4CAF50"; // Verde
                } else if (disponibilidad >= 5 && disponibilidad < 35) {
                    texto = "POCA DISPONIBILIDAD";
                    color = "#FFC107"; // Amarillo
                } else if (disponibilidad >= 0 && disponibilidad < 5) {
                    texto = "AGOTADO";
                    color = "#F44336"; // Rojo
                } else {
                    texto = "N/A"; // Valor por defecto
                    color = "#E0E0E0"; // Gris
                }

                cell.textContent = texto;
                cell.style.backgroundColor = color;
                cell.style.color = "white";
                cell.style.fontWeight = "bold";
                cell.style.textAlign = "center";
            } 
            // Para otras columnas (sin cambios)
            else {
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
      })
      .catch((error) => {
        alert("Error al subir el archivo.");
        console.error("Error:", error);
      });
  });

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
  filterDateInput.type = "text"; // Asegura que vuelva a ser tipo text
  filterDateInput.placeholder = "Seleccione una fecha 📅"; // Restablece el placeholder
  filterDestinationInput.value = ""; // Limpia el campo de destino
  applyFilters(); // Aplica los filtros (que ahora no filtrarán nada)
});
});