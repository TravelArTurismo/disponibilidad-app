const express = require("express");
const multer = require("multer");
const fs = require("fs");
const XLSX = require("xlsx");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// 📌 Conexión a la Base de Datos
const pool = new Pool({
    connectionString: "postgresql://disponibilidad_db_user:rFctmHT9gQO7LYSGd1RH2jRETydajEGs@dpg-cv26sbt2ng1s738n66ag-a.oregon-postgres.render.com/disponibilidad_db",
    ssl: { rejectUnauthorized: false }
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// Configurar Multer para subir archivos
const upload = multer({ dest: "uploads/" });

// 📌 Crear la tabla en PostgreSQL si no existe
async function createTable() {
    try {
        const client = await pool.connect();
        await client.query(`
            CREATE TABLE IF NOT EXISTS disponibilidad (
                id SERIAL PRIMARY KEY,
                datos JSONB
            )
        `);
        client.release();
    } catch (error) {
        console.error("❌ Error creando la tabla:", error);
    }
}
createTable();

// 📌 Verificar si hay datos al iniciar el servidor
async function checkInitialData() {
    try {
        const client = await pool.connect();
        const result = await client.query("SELECT COUNT(*) FROM disponibilidad");
        client.release();
        if (parseInt(result.rows[0].count) === 0) {
            console.log("⚠️ La tabla está vacía. Asegúrate de subir un archivo Excel.");
        }
    } catch (error) {
        console.error("❌ Error verificando los datos iniciales:", error);
    }
}
checkInitialData();

// 📌 Ruta para subir un archivo Excel y guardarlo en PostgreSQL
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const filePath = req.file.path;
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });

        // Validar las fechas en los datos (supongamos que la fecha está en la columna "Fecha")
        const isValid = jsonData.every(row => {
            // Aquí asumimos que las fechas están en el formato 'YYYY-MM-DD' y se validan correctamente.
            const date = row.Fecha; 
            return !isNaN(new Date(date).getTime()); // Verifica si la fecha es válida
        });

        if (!isValid) {
            res.status(400).json({ message: "❌ El archivo contiene fechas no válidas." });
            fs.unlinkSync(filePath);  // Eliminar archivo subido en caso de error
            return;
        }

        // Guardar en la base de datos
        const client = await pool.connect();
        await client.query("TRUNCATE TABLE disponibilidad RESTART IDENTITY"); // Solo vacía, sin eliminar la estructura
        await client.query("INSERT INTO disponibilidad (datos) VALUES ($1)", [JSON.stringify(jsonData)]);
        client.release();

        fs.unlinkSync(filePath);  // Eliminar archivo subido después de procesarlo
        res.json({ message: "Disponibilidad actualizada correctamente ✅" });
    } catch (error) {
        res.status(500).json({ message: "❌ Error al procesar el archivo", error });
    }
});

// 📌 Ruta para obtener los datos desde PostgreSQL
app.get("/data", async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query("SELECT datos FROM disponibilidad");
        client.release();
        res.json(result.rows.length > 0 ? result.rows[0].datos : []);
    } catch (error) {
        res.status(500).json({ message: "❌ Error al obtener los datos", error });
    }
});

// Asegurar que todas las rutas sirvan `index.html`
app.get("*", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
