<!-- BasePagination.vue -->

<script setup>
import { computed } from 'vue'
import BaseButton from './BaseButton.vue'

/**
 * Компонент пагинации с номерами страниц и кнопками вперед/назад
 * Упрощенная и исправленная версия
 */

const props = defineProps({
  currentPage: {
    type: Number,
    default: 1
  },
  totalPages: {
    type: Number,
    default: 1
  },
  maxVisiblePages: {
    type: Number,
    default: 5
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['page-change'])

// Вычисляем диапазон отображаемых страниц
const visiblePages = computed(() => {
  const half = Math.floor(props.maxVisiblePages / 2)
  let start = Math.max(1, props.currentPage - half)
  let end = Math.min(props.totalPages, start + props.maxVisiblePages - 1)

  // Корректируем start если end достиг предела
  start = Math.max(1, end - props.maxVisiblePages + 1)

  const pages = []
  for (let i = start; i <= end; i++) {
    if (i > 1 && i < props.totalPages) {
      pages.push(i)
    }
  }
  return pages
})

// Нужно ли показывать многоточие в начале
const showStartEllipsis = computed(() => {
  return props.totalPages > props.maxVisiblePages && props.currentPage > Math.floor(props.maxVisiblePages / 2) + 1
})

// Нужно ли показывать многоточие в конце
const showEndEllipsis = computed(() => {
  return props.totalPages > props.maxVisiblePages && props.currentPage < props.totalPages - Math.floor(props.maxVisiblePages / 2)
})
</script>

<template>
  <div class="base-pagination" :class="{ 'base-pagination--disabled': disabled }">
    <!-- Кнопка "Назад" -->
    <BaseButton
      variant="secondary"
      :disabled="disabled || currentPage === 1"
      @click="emit('page-change', currentPage - 1)"
      class="base-pagination__nav"
    >
      ← Назад
    </BaseButton>

    <!-- Номера страниц -->
    <div class="base-pagination__pages">
      <!-- Первая страница -->
      <BaseButton
        v-if="totalPages > 0"
        variant="secondary"
        :class="['base-pagination__page', { 'base-pagination__page--active': currentPage === 1 }]"
        @click="emit('page-change', 1)"
      >
        1
      </BaseButton>

      <!-- Многоточие после первой страницы -->
      <span
        v-if="showStartEllipsis"
        class="base-pagination__ellipsis"
      >
        ...
      </span>

      <!-- Основные страницы -->
      <BaseButton
        v-for="page in visiblePages"
        :key="page"
        variant="secondary"
        :class="['base-pagination__page', { 'base-pagination__page--active': currentPage === page }]"
        @click="emit('page-change', page)"
      >
        {{ page }}
      </BaseButton>

      <!-- Многоточие перед последней страницей -->
      <span
        v-if="showEndEllipsis"
        class="base-pagination__ellipsis"
      >
        ...
      </span>

      <!-- Последняя страница (если больше 1) -->
      <BaseButton
        v-if="totalPages > 1"
        variant="secondary"
        :class="['base-pagination__page', { 'base-pagination__page--active': currentPage === totalPages }]"
        @click="emit('page-change', totalPages)"
      >
        {{ totalPages }}
      </BaseButton>
    </div>

    <!-- Кнопка "Вперед" -->
    <BaseButton
      variant="secondary"
      :disabled="disabled || currentPage === totalPages"
      @click="emit('page-change', currentPage + 1)"
      class="base-pagination__nav"
    >
      Вперед →
    </BaseButton>
  </div>
</template>

<style scoped lang="scss">
@import '@/scss/variables';

.base-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 0;

  &--disabled {
    opacity: 0.6;
    pointer-events: none;
  }
}

.base-pagination__pages {
  display: flex;
  gap: 4px;
}

.base-pagination__page {
  min-width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;

  &--active {
    background-color: $color-accent-press;
    color: $color-white;
    font-weight: 700;
    cursor: default;
  }
}

.base-pagination__nav {
  padding: 8px 16px;
}

.base-pagination__ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  color: $color-grey-4;
}
</style>
