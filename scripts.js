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
  const destinationList = document.getElementById("destination-list");
  const filterButton = document.getElementById("filter-button");
  const clearFilterButton = document.getElementById("clear-filter-button");

  const ADMIN_ID = "ADMIN";
  const ADMIN_PASSWORD = "1244";

  const destinations = [
    "VILLA CARLOS PAZ", "VILLA DE MERLO", "MACACHIN LA PAMPA", "MENDOZA", "SAN RAFAEL",
    "AIMOGASTA", "SALTA", "CATARATAS DEL IGUAZU", "PARANA", "GUALEGUAYCHU", "COLON",
    "SAN BERNARDO", "SAN CLEMENTE", "MAR DEL PLATA", "TANDIL", "TERMAS DE TAPALQUE",
    "TERMAS DE GUAYCHU", "SAN PEDRO", "CAMPO LA HERRADURA", "CAMBORIU", "BARILOCHE",
    "CALAFATE", "USHUAIA"
  ];

  const loadDataFromServer = () => {
    fetch("/data")
      .then((response) => response.json())
      .then((data) => {
        console.log("Datos recibidos del servidor:", data);
        populateTable(data);
      })
      .catch((error) => console.error("Error al cargar datos:", error));
  };

  const populateDestinationList = () => {
    destinationList.innerHTML = "";
    destinations.forEach(dest => {
      const option = document.createElement("option");
      option.value = dest;
      destinationList.appendChild(option);
    });
  };

  filterDestinationInput.addEventListener("input", () => {
    const value = filterDestinationInput.value.toLowerCase();
    document.querySelectorAll("#destination-list option").forEach(option => {
      option.style.display = option.value.toLowerCase().includes(value) ? "block" : "none";
    });
  });

  loginButton.addEventListener("click", () => {
    const userId = document.getElementById("user-id").value.trim();
    const userPassword = document.getElementById("user-password").value.trim();

    if (!userId || !userPassword) {
      loginError.textContent = "Por favor, completa todos los campos.";
      loginError.style.display = "block";
      return;
    }

    if (userId === ADMIN_ID && userPassword === ADMIN_PASSWORD) {
      loginSection.classList.add("hidden");
      mainContent.classList.remove("hidden");
      adminTools.classList.remove("hidden");
      loginError.textContent = "";
      loadDataFromServer();
    } else {
      loginError.textContent = "ID o Contraseña incorrectos";
      loginError.style.display = "block";
    }
  });

  guestButton.addEventListener("click", () => {
    loginSection.classList.add("hidden");
    mainContent.classList.remove("hidden");
    adminTools.classList.add("hidden");
    loginError.textContent = "";
    loadDataFromServer();
  });

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
  });

  clearFilterButton.addEventListener("click", () => {
    filterDateInput.value = "";
    filterDestinationInput.value = "";
    document.querySelectorAll("#availability-table tbody tr").forEach(row => {
      row.style.display = "";
    });
  });

  populateDestinationList();
  loadDataFromServer();
});
