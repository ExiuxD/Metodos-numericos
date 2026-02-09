# Kimi Agent + JupyterLite (GitHub Pages)

Este repo publica dos cosas en el mismo GitHub Pages:

- **JupyterLite** (en `/`)
- Tu **app web** (en `/app/`)

## Cómo correr local

### App
```bash
cd app
npm install
npm run dev
```

### Build completo (como lo hace GitHub Actions)
```bash
cd app
npm ci
npm run build
cd ..
pip install jupyterlite
jupyter lite build --output-dir _output --contents content
mkdir -p _output/app
cp -r app/dist/* _output/app/
```
