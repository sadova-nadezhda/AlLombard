# Layout starter

```bash
npm i
npm run dev     # dev-сервер http://localhost:3000 + автообновление
npm run build   # чистая сборка в dist (минификация, без sourcemaps)
```

## Структура

```
src/
  pages/          страницы → dist/*.html
  partials/       head, header, footer, scripts
    sections/     глобальные секции (feedback и т.п.)
  scss/           style.scss — точка входа → dist/css/style.css
  js/             main.js — точка входа → dist/js/main.js
    modules/      модули для import
    vendor/       библиотеки как есть → dist/js/vendor
  img/            jpg/png → webp, остальное копируется
  fonts/          → dist/fonts
  static/         → корень dist (favicon, robots.txt)
```

## Подключение партиалов

```html
@@include('header.html', { "page": "about" })
@@include('sections/feedback.html', { "title": "Остались вопросы?" })
```

Внутри партиала: `@@title`, условия: `@@if (page === 'about') {is-active}`.

## Картинки

В исходниках пишите `img/photo.jpg` — при сборке файл станет `photo.webp`,
а ссылки в HTML/CSS заменятся автоматически. Ширина > 2560px уменьшается.
Настройки — `config` в gulpfile.js.

## SCSS

`s(20)` → `calc(var(--width-multiplier) * 20)`.
Миксины: `mobile`, `tablet`, `desktop`, `desktop-landscape`, `wide`.
