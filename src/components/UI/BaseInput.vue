<!-- BaseInput.vue -->

<script setup>
/**
 * Компонент input field с поддержкой различных состояний
 * Соответствует дизайн-системе из Figma
 */

defineProps({
  /**
   * Тип input field (text, email, password etc.)
   */
  type: {
    type: String,
    default: 'text'
  },
  /**
   * Placeholder текст
   */
  placeholder: {
    type: String,
    default: ''
  },
  /**
   * Значение input (v-model support)
   */
  modelValue: {
    type: String,
    default: ''
  },
  /**
   * Неактивное состояние
   */
  disabled: {
    type: Boolean,
    default: false
  },
  /**
   * Состояние ошибки валидации
   * Добавлено как улучшение UX (не было в оригинальном макете)
   */
  error: {
    type: Boolean,
    default: false
  }
})

// Emits для v-model поддержки
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="base-input-wrapper">
    <input
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      :disabled="disabled"
      :class="['base-input', { 'base-input--error': error, 'base-input--disabled': disabled }]"
      @input="$emit('update:modelValue', $event.target.value)"
    >
  </div>
</template>

<style scoped lang="scss">
@import '@/scss/variables';

.base-input-wrapper {
  display: inline-block;
  width: 100%;
}

.base-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid $color-grey-4;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  background-color: $color-white;
  color: $color-black-1;
  transition: all 0.3s ease-out;

  // Placeholder стилизация
  &::placeholder {
    color: lighten($color-grey-4, 20%);
  }

  // Hover состояние
  &:hover:not(.base-input--disabled) {
    border-color: $color-black-1;
  }

  // Focus состояние
  &:focus {
    outline: none;
    border-color: $color-accent-press;
    box-shadow: 0 0 0 2px rgba($color-accent-press, 0.1);
  }

  // Error состояние
  &--error {
    border-color: #dc3545;

    &:focus {
      border-color: #dc3545;
      box-shadow: 0 0 0 2px rgba(#dc3545, 0.1);
    }
  }

  // Disabled состояние
  &--disabled {
    background-color: lighten($color-grey-4, 40%);
    cursor: not-allowed;
    opacity: 0.6;
  }
}
</style>
