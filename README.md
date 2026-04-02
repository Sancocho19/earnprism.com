# IngresoLab

Proyecto estático listo para subir a Vercel.  
Objetivo: captar tráfico SEO de intención clara con calculadoras sobre dinero, trabajo e ingresos, y empujar al usuario a una segunda página para aumentar tiempo en sitio.

## Qué incluye

- Home con propuesta clara y enlaces internos.
- 6 calculadoras interactivas.
- 3 guías SEO para reforzar contexto temático.
- Páginas legales base.
- `robots.txt`, `sitemap.xml` y `vercel.json`.
- Diseño responsive sin dependencias ni build step.

## Por qué está hecho así

En vez de arrancar con una web gigante o un blog genérico, esta versión parte de herramientas con intención de búsqueda más clara:

- sueldo por hora a mes
- cuánto cobrar freelance
- ingresos para creadores
- aumento salarial real
- presupuesto 50/30/20
- meta de ahorro

Cada página tiene:
- título y descripción propios
- canonical
- bloques de texto útiles
- preguntas frecuentes
- enlaces internos
- zonas listas para anuncios o afiliados
- resultados que se pueden copiar y compartir

## Estructura

```text
/
  index.html
  sobre.html
  privacidad.html
  terminos.html
  404.html
  robots.txt
  sitemap.xml
  vercel.json
  /calculadoras
  /guias
  /assets
    /css
    /js
    /img
  /docs
```

## Cómo subirlo a Vercel

### Opción fácil
1. Descomprime el proyecto.
2. Súbelo a un repositorio de GitHub.
3. Entra a Vercel.
4. Importa el repositorio.
5. Despliega.  
   Como es un sitio estático, no necesita configuración compleja.

### Opción arrastrar y soltar
También puedes crear un proyecto nuevo en Vercel y subir esta carpeta si usas un flujo de despliegue manual.

## Antes de publicar

Haz estas 6 cosas:

1. Cambia el dominio base `https://www.ingresolab.app` por tu dominio real en:
   - `sitemap.xml`
   - `robots.txt`
   - canónicas en HTML si quieres dejarlo perfecto
2. Cambia los textos legales por tus datos reales.
3. Agrega tu correo en privacidad y términos.
4. Crea una cuenta de Search Console y sube el sitemap.
5. Instala analítica simple.
6. Publica al menos 10 páginas nuevas siguiendo la misma estructura.

## Qué publicar después

Prioridad alta:
- calculadora de sueldo por día a mes
- calculadora de tarifa por proyecto
- calculadora de side hustle
- calculadora de fondo de emergencia
- calculadora de cuánto ahorrar para X compra
- páginas por país: Colombia, México, España, EE. UU.
- páginas por profesión: diseñador, editor de video, community manager, setter, closer, copywriter

## Monetización sugerida

Base:
- anuncios display
- newsletter
- afiliados de bancos, herramientas de trabajo, software para freelancers o creadores
- plantillas premium
- patrocinio de herramientas fintech o SaaS

## Nota

Este proyecto está armado para ser fácil de desplegar y fácil de clonar.  
La mejor jugada no es dejarlo quieto: es usar esta base y sacar más páginas con la misma lógica.
