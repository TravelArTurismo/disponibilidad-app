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
  const filterButton = document.getElementById("filter-button");

  const ADMIN_ID = "ADMIN";
  const ADMIN_PASSWORD = "1244";

  // 📌 Cargar datos desde el servidor
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
      loadDataFromServer(); // 📌 Cargar datos después de iniciar sesión
    } else {
      showError("ID o Contraseña incorrectos");
    }
  });

  guestButton.addEventListener("click", () => {
    loginSection.classList.add("hidden");
    mainContent.classList.remove("hidden");
    adminTools.classList.add("hidden");
    loginError.textContent = "";
    loadDataFromServer(); // 📌 Cargar datos al ingresar como invitado
  });

  const showError = (message) => {
    loginError.textContent = message;
    loginError.style.display = "block";
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

      ["DESTINO", "FECHA", "DISPONIBLE", "TARIFA", "GTO ADM", "DURACION", "HOTEL", "REGIMEN", "OBSERVACIONES"].forEach((col) => {
        const cell = document.createElement("td");

        if (col === "FECHA" && row[col]) {
          const dateParts = row[col].split("/");
          if (dateParts.length === 3) {
            row[col] = `${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`;
          }
        }

        cell.textContent = row[col] || "N/A";
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

  // 📌 FILTRO DE TABLA
  filterButton.addEventListener("click", () => {
    const filterDate = filterDateInput.value;
    const filterDestination = filterDestinationInput.value.trim().toLowerCase();

    document.querySelectorAll("#availability-table tbody tr").forEach(row => {
      const dateCell = row.cells[1]?.textContent.trim();
      const destinationCell = row.cells[0]?.textContent.trim().toLowerCase();

      let showRow = (!filterDate || dateCell.split("/").reverse().join("-") === filterDate) &&
                    (!filterDestination || destinationCell.includes(filterDestination));

      row.style.display = showRow ? "" : "none";
    });
  });

  loadDataFromServer();
});
