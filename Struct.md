

## Архітектурне рішення:

### Структура компонентів:

```
DataTable/
├── index.tsx                 # Головний компонент
├── hooks/
│   ├── useTableState.ts     # Управління станом (синхронізація з сервером)
│   ├── useTableFilters.ts   # Логіка фільтрування
│   ├── useTableSort.ts      # Логіка сортування
│   └── useRowDragDrop.ts    # Drag & drop для рядків
├── components/
│   ├── TableHeader.tsx      # Хедер з фільтрами
│   ├── TableBody.tsx        # Тіло таблиці з віртуалізацією
│   ├── TableRow.tsx         # Рядок (з drag handle)
│   ├── EditableCell.tsx     # Редагована клітинка
│   ├── FilterPopover.tsx    # Попап з фільтрами
│   └── GlobalSearch.tsx     # Швидкий пошук
├── cells/
│   ├── TextCell.tsx
│   ├── NumberCell.tsx
│   ├── DateCell.tsx
│   ├── DateRangeCell.tsx
│   ├── SelectCell.tsx
│   ├── CheckboxCell.tsx
│   └── CustomCell.tsx
└── types.ts
```

### Ключові моменти архітектури:

**1. Гібридний режим даних:**
- Для таблиць до 300 рядків: client-side operations з periodic sync
- Для великих таблиць: server-side pagination + filtering + sorting
- Автоматичне визначення режиму на основі кількості рядків

**2. Віртуалізація:**
- Використаю `@tanstack/react-virtual` для великих таблиць
- Динамічна висота рядків для мобільної версії

**3. Мобільна адаптація:**
- Десктоп: класична таблиця
- Мобайл: картки з можливістю розгортання

**4. Drag & Drop:**
- `@dnd-kit/core` для переміщення рядків
- Visual feedback з drop indicators

**5. Стан на сервері:**
- Debounced sync для змін
- Optimistic updates для UX
- Conflict resolution при одночасному редагуванні

Чи хочете, щоб я:
1. **Створив повну імплементацію** з усіма компонентами відразу?
2. **Покроковий підхід** - спочатку базову таблицю, потім додавати функції?

Також уточніть:
- **API формат**: REST чи GraphQL?
- **State management**: Context, Zustand, Redux чи щось інше?
- **Styling**: CSS modules, styled-components, Tailwind?
