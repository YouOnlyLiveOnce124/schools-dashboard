<!-- BaseTable.vue -->

<script setup>
/**
 * Базовый компонент таблицы с поддержкой сортировки, выбора строк и состояний загрузки
 * Соответствует дизайн-системе из Figma
 */

defineProps({
  /**
   * Заголовки колонок таблицы
   * Формат: [{ key: 'name', label: 'Название', sortable: true }]
   */
  columns: {
    type: Array,
    required: true,
  },
  /**
   * Данные для отображения в таблице
   */
  data: {
    type: Array,
    default: () => [],
  },
  /**
   * Состояние загрузки (показываем скелетон)
   */
  loading: {
    type: Boolean,
    default: false,
  },
  /**
   * Состояние ошибки
   */
  error: {
    type: Boolean,
    default: false,
  },
  /**
   * Массив выбранных элементов (по uuid)
   * Используется для отслеживания выбранных строк
   */
  selectedItems: {
    type: Array,
    default: () => [],
  },
  /**
   * Состояние "частичного выбора" для Select All
   * Показывает промежуточное состояние чекбокса
   */
  isIndeterminate: {
    type: Boolean,
    default: false,
  },
})

// Emits для сортировки и выбора элементов
defineEmits(['sort', 'retry', 'select-item', 'select-all'])
</script>

<template>
  <!-- Обертка таблицы с семантическим тегом -->
  <div class="base-table" role="table" aria-label="Таблица учреждений">
    <!-- Заголовок таблицы с чекбоксом Select All -->
    <div class="base-table__header" role="rowgroup">
      <div class="base-table__header-row" role="row">
        <!-- Чекбокс для выбора всех строк -->
        <div class="base-table__header-cell base-table__checkbox-cell" role="columnheader">
          <input
            type="checkbox"
            :indeterminate="isIndeterminate"
            @change="$emit('select-all', $event.target.checked)"
            aria-label="Выбрать все строки"
          />
        </div>

        <!-- Заголовки колонок -->
        <div
          v-for="column in columns"
          :key="column.key"
          :class="[
            'base-table__header-cell',
            { 'base-table__header-cell--sortable': column.sortable },
          ]"
          @click="column.sortable && $emit('sort', column.key)"
          role="columnheader"
          :aria-sort="column.sortable ? 'none' : undefined"
        >
          <span>{{ column.label }}</span>
        </div>
      </div>
    </div>

    <!-- Тело таблицы -->
    <div class="base-table__body" role="rowgroup">
      <!-- Состояние загрузки -->
      <div v-if="loading" class="base-table__loading" role="row">
        <div v-for="n in 5" :key="n" class="base-table__skeleton-row" role="row">
          <div
            v-for="column in columns"
            :key="column.key"
            class="base-table__skeleton-cell"
            role="cell"
          >
            <div class="skeleton"></div>
          </div>
        </div>
      </div>

      <!-- Состояние ошибки -->
      <div v-else-if="error" class="base-table__error" role="row">
        <p>Произошла ошибка при загрузке данных</p>
        <BaseButton variant="primary" @click="$emit('retry')">Повторить попытку</BaseButton>
      </div>

      <!-- Пустое состояние -->
      <div v-else-if="data.length === 0" class="base-table__empty" role="row">
        <p>Данные не найдены</p>
      </div>

      <!-- Данные с чекбоксами в строках -->
      <template v-else>
        <div
          v-for="(row, index) in data"
          :key="row.uuid || index"
          class="base-table__row"
          role="row"
        >
          <!-- Чекбокс для выбора строки -->
          <div class="base-table__cell base-table__checkbox-cell" role="cell">
            <input
              type="checkbox"
              :checked="selectedItems.includes(row.uuid)"
              @change="$emit('select-item', row.uuid, $event.target.checked)"
              :aria-label="`Выбрать школу ${row.name}`"
            />
          </div>

          <!-- Ячейки с данными -->
          <div v-for="column in columns" :key="column.key" class="base-table__cell" role="cell">
            {{ row[column.key] }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/scss/variables';

.base-table {
  border: 1px solid $color-grey-4;
  border-radius: 8px;
  overflow: hidden;
}

.base-table__header {
  background-color: $color-black-2;
  color: $color-white;
  font-weight: 700;
}

.base-table__header-row {
  display: grid;
  grid-template-columns: 40px repeat(auto-fit, minmax(150px, 1fr));
}

.base-table__header-cell {
  padding: 16px;
  text-align: left;

  &--sortable {
    cursor: pointer;

    &:hover {
      background-color: lighten($color-black-2, 10%);
    }
  }
}

.base-table__body {
  background-color: $color-white;
}

.base-table__row {
  display: grid;
  grid-template-columns: 40px repeat(auto-fit, minmax(150px, 1fr));
  border-bottom: 1px solid lighten($color-grey-4, 30%);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: lighten($color-grey-4, 40%);
  }
}

.base-table__cell {
  padding: 12px 16px;
}

/* Стили для чекбоксов */
.base-table__checkbox-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
}

.base-table__header-cell.base-table__checkbox-cell {
  background-color: $color-black-2; // Соответствует заголовку
}

/* Стили для состояний остаются без изменений */
.base-table__loading,
.base-table__error,
.base-table__empty {
  padding: 40px;
  text-align: center;
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  height: 16px;
  border-radius: 4px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
