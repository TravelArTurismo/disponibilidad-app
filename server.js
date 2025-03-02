const express = require("express");
const multer = require("multer");
const fs = require("fs");
const XLSX = require("xlsx");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// Configurar Multer para subir archivos
const upload = multer({ dest: "uploads/" });

// 📌 Cargar el último libro guardado al iniciar el servidor
let jsonData = [];
const dataFilePath = "data.json";


if (fs.existsSync(dataFilePath)) {
  try {
    jsonData = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
  } catch (error) {
    console.error("⚠ Error al leer data.json:", error);
    jsonData = []; // Evita que se rompa si el archivo está corrupto
  }
}

// 📌 Ruta para subir un archivo Excel
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    const filePath = req.file.path;

    // Leer el archivo Excel
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });

    // Guardar los datos en data.json
    fs.writeFileSync(dataFilePath, JSON.stringify(jsonData, null, 2));

    // Eliminar el archivo Excel subido
    fs.unlinkSync(filePath);

    res.json({ message: "📂 Archivo subido y procesado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "❌ Error al procesar el archivo", error });
  }
});

// 📌 Ruta para obtener los datos guardados
app.get("/data", (req, res) => {
  res.json(jsonData);
});

// 📌 Asegurar que todas las rutas sirvan `index.html`
app.get("*", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// 📌 Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
