const express = require("express");
const multer = require("multer");
const fs = require("fs");
const XLSX = require("xlsx");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = "data.json";  // 📌 Archivo donde se guardan los datos

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname)); // 📌 Sirve index.html automáticamente

// 📌 Configurar Multer para subir archivos
const upload = multer({ dest: "uploads/" });

// 📌 Ruta para subir un archivo Excel
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    const filePath = req.file.path;

    // 📌 Leer el archivo Excel
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });

    // 📌 Guardar los datos en data.json (sobreescribiendo con el último archivo subido)
    fs.writeFileSync(DATA_FILE, JSON.stringify(jsonData, null, 2));

    // 📌 Eliminar el archivo Excel subido (para que no se acumulen archivos)
    fs.unlinkSync(filePath);

    res.json({ message: "Archivo subido y procesado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al procesar el archivo", error });
  }
});

// 📌 Ruta para obtener los datos guardados
app.get("/data", (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf8");
      res.json(JSON.parse(data));
    } else {
      res.json([]);  // 📌 Si no hay archivo, devolver un array vacío
    }
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los datos", error });
  }
});

// 📌 Asegurar que todas las rutas sirvan `index.html`
app.get("*", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// 📌 Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
