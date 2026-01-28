# Gestor de Tráfico - Ruta Bus

Este proyecto es una aplicación web para la gestión operativa y financiera de servicios de transporte de buses, orientada a empresas que requieren controlar reservas, programaciones, tráfico, cuentas, tarifas y reportes de manera centralizada y visual.

## Características principales

- **Panel de control** con navegación lateral para acceder a módulos clave: Reservas, Programados, Gestor de Tráfico, Cuentas, Administración, Seguridad y Configuración.
- **Búsqueda avanzada** de servicios por origen, destino y fecha.
- **Visualización de métricas**: recaudación, pasajeros por servicio, promedio por servicio, cantidad de servicios y valor por kilómetro.
- **Gráficos interactivos** para el análisis del factor de ocupación.
- **Gestión y resumen de tarifas** por categorías y asientos.
- **Modales y tablas** para visualizar y editar detalles de servicios, incluyendo resúmenes financieros.
- **Interfaz responsiva** y moderna, basada en Bootstrap 5 y Select2.

## Estructura del proyecto

```
Planillon/
  ├── assets/
  │   ├── css/           # Hojas de estilo personalizadas
  │   └── js/            # Lógica principal y componentes JS
  ├── index.html         # Página principal de la aplicación
  └── README.md          # Documentación del proyecto
```

## Instalación y uso

1. **Clona el repositorio:**
   ```
   git clone <url-del-repo>
   ```
2. **Abre el archivo `index.html`** en tu navegador web preferido. No se requieren dependencias de backend para la visualización básica.
3. **(Opcional) Configura un servidor local** si necesitas rutas relativas o pruebas avanzadas:
   ```
   # Usando Python 3
   python -m http.server 8000
   # O usando Node.js
   npx serve
   ```

## Dependencias principales
- [Bootstrap 5](https://getbootstrap.com/)
- [Font Awesome](https://fontawesome.com/)
- [Select2](https://select2.org/)

## Personalización
- Puedes modificar los archivos en `assets/css/` para adaptar los estilos a tu marca.
- La lógica de negocio y componentes están en `assets/js/` y pueden ser extendidos según tus necesidades.

## Contribuciones
¡Las contribuciones son bienvenidas! Por favor, abre un issue o pull request para sugerencias o mejoras.

## Licencia
Este proyecto es de uso interno. Si deseas reutilizarlo, consulta primero con el autor.
