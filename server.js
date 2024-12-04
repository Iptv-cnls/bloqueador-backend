const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

app.get("/filter", async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).send("URL no proporcionada.");
    }

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Configurar bloqueador de anuncios básico
        await page.setRequestInterception(true);
        page.on("request", (request) => {
            const blockTypes = ["image", "stylesheet", "font", "media", "popup"];
            if (blockTypes.includes(request.resourceType())) {
                request.abort();
            } else {
                request.continue();
            }
        });

        await page.goto(url);
        const content = await page.content();

        await browser.close();
        res.send(content);
    } catch (error) {
        console.error("Error procesando URL:", error);
        res.status(500).send("Error procesando la URL.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});