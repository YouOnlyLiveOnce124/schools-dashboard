<!-- BaseTable.vue -->

<script setup>
/**
 * Базовый компонент таблицы с поддержкой сортировки и состояний загрузки
 * Соответствует дизайн-системе из Figma
 */

defineProps({
  /**
   * Заголовки колонок таблицы
   * Формат: [{ key: 'name', label: 'Название', sortable: true }]
   */
  columns: {
    type: Array,
    required: true
  },
  /**
   * Данные для отображения в таблице
   */
  data: {
    type: Array,
    default: () => []
  },
  /**
   * Состояние загрузки (показываем скелетон)
   */
  loading: {
    type: Boolean,
    default: false
  },
  /**
   * Состояние ошибки
   */
  error: {
    type: Boolean,
    default: false
  }
})

// Emits для сортировки
defineEmits(['sort'])
</script>

<template>
  <div class="base-table">
    <!-- Заголовок таблицы -->
    <div class="base-table__header">
      <div
        v-for="column in columns"
        :key="column.key"
        :class="['base-table__header-cell', { 'base-table__header-cell--sortable': column.sortable }]"
        @click="column.sortable && $emit('sort', column.key)"
      >
        <span>{{ column.label }}</span>
        <!-- Иконка сортировки (добавим позже) -->
      </div>
    </div>

    <!-- Тело таблицы -->
    <div class="base-table__body">
      <!-- Состояние загрузки -->
      <div v-if="loading" class="base-table__loading">
        <div v-for="n in 5" :key="n" class="base-table__skeleton-row">
          <div v-for="column in columns" :key="column.key" class="base-table__skeleton-cell">
            <div class="skeleton"></div>
          </div>
        </div>
      </div>

      <!-- Состояние ошибки -->
      <div v-else-if="error" class="base-table__error">
        <p>Произошла ошибка при загрузке данных</p>
        <BaseButton variant="primary" @click="$emit('retry')">Повторить попытку</BaseButton>
      </div>

      <!-- Пустое состояние -->
      <div v-else-if="data.length === 0" class="base-table__empty">
        <p>Данные не найдены</p>
      </div>

      <!-- Данные -->
      <div v-else class="base-table__rows">
        <div
          v-for="(row, index) in data"
          :key="index"
          class="base-table__row"
        >
          <div
            v-for="column in columns"
            :key="column.key"
            class="base-table__cell"
          >
            {{ row[column.key] }}
          </div>
        </div>
      </div>
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  background-color: $color-black-2;
  color: $color-white;
  font-weight: 700;
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
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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

// Стили для состояний
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
