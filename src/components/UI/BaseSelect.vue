<!-- BaseSelect.vue -->

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'Выберите вариант',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <select
    :value="modelValue"
    @change="$emit('update:modelValue', $event.target.value)"
    :disabled="disabled"
    class="base-select"
  >
    <option value="" disabled>{{ placeholder }}</option>
    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>

<style scoped lang="scss">
@import '@/scss/variables';

.base-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid $color-grey-4;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  background-color: $color-white;
  color: $color-black-1;
  cursor: pointer;
  transition: all 0.3s ease-out;

  &:hover:not(:disabled) {
    border-color: $color-black-1;
  }

  &:focus {
    outline: none;
    border-color: $color-accent-press;
    box-shadow: 0 0 0 2px rgba($color-accent-press, 0.1);
  }

  &:disabled {
    background-color: lighten($color-grey-4, 40%);
    cursor: not-allowed;
    opacity: 0.6;
  }
}
</style>
