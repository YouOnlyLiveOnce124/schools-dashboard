<!-- BaseButton.vue -->

<script setup>
// Props definition with Composition API
defineProps({
  /**
   * Вариант кнопки: primary, secondary, accent
   * Соответствует дизайн-системе из Figma
   */
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'accent'].includes(value)
  },
  /**
   * Неактивное состояние кнопки
   * Добавлено как улучшение UX (не было в оригинальном макете)
   */
  disabled: {
    type: Boolean,
    default: false
  }
})

// Emits definition
defineEmits(['click'])
</script>

<template>
  <button
    :class="['base-button', `base-button--${variant}`, { 'base-button--disabled': disabled }]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot></slot>
  </button>
</template>

<style scoped lang="scss">

@import '@/scss/variables';

.base-button {
  padding: 9px 11px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-weight: 700;
  transition: all 0.3s ease-out;

  &:hover:not(.base-button--disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.base-button--primary {
  background-color: $color-accent-press;
  color: $color-white;

  &:hover:not(.base-button--disabled) {
    background-color: $color-accent-hover;
  }
}

.base-button--secondary {
  background-color: transparent;
  border: 1px solid $color-grey-4;
  color: $color-black-1;

  &:hover:not(.base-button--disabled) {
    border-color: $color-black-1;
  }
}

.base-button--accent {
  background-color: $color-black-2;
  color: $color-white;

  &:hover:not(.base-button--disabled) {
    background-color: lighten($color-black-2, 10%);
  }
}

</style>
