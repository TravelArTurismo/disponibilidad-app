const express = require("express");
const multer = require("multer");
const fs = require("fs");
const ExcelJS = require("exceljs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname)); // Sirve index.html automáticamente

// Configurar Multer para subir archivos
const upload = multer({ dest: "uploads/" });

// 📌 Ruta para el archivo data.json (guardado en /tmp para persistencia en Render)
const dataFilePath = path.join("/tmp", "data.json");

// 📌 Cargar el último libro guardado al iniciar el servidor
let jsonData = [];
if (fs.existsSync(dataFilePath)) {
  try {
    jsonData = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
  } catch (error) {
    console.error("⚠ Error al leer data.json:", error);
    jsonData = []; // Evita que se rompa si el archivo está corrupto
  }
}

// 📌 Ruta para subir un archivo Excel
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.worksheets[0]; // Primera hoja
    const data = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Omitir encabezados si es necesario
      const rowData = row.values.slice(1); // Eliminar índice vacío
      data.push(rowData);
    });

    jsonData = data;

    // Guardar los datos en data.json (en /tmp para persistencia)
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
