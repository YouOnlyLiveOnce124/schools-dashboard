<!-- BaseSelect.vue -->

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
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

const emit = defineEmits(['update:modelValue'])

// Реактивные состояния
const isOpen = ref(false)
const dropdownRef = ref(null)

// Вычисляем отображаемый текст
const displayText = computed(() => {
  if (!props.modelValue) return props.placeholder
  const selectedOption = props.options.find((opt) => opt.value === props.modelValue)
  return selectedOption ? selectedOption.label : props.placeholder
})

// Обработчики
const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const selectOption = (option) => {
  emit('update:modelValue', option.value)
  isOpen.value = false
}

// Закрываем dropdown при клике вне компонента
const clickOutsideHandler = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

// Навешиваем обработчик при монтировании
onMounted(() => {
  document.addEventListener('click', clickOutsideHandler)
})

// Убираем обработчик при размонтировании
onUnmounted(() => {
  document.removeEventListener('click', clickOutsideHandler)
})
</script>

<template>
  <div
    class="base-select"
    ref="dropdownRef"
    :class="{ 'base-select--open': isOpen, 'base-select--disabled': disabled }"
  >
    <!-- Выбранное значение -->
    <div class="base-select__trigger" @click="toggleDropdown">
      <span class="base-select__value" :class="{ 'base-select__placeholder': !modelValue }">
        {{ displayText }}
      </span>
      <span class="base-select__arrow">▼</span>
    </div>

    <!-- Выпадающий список -->
    <transition name="dropdown">
      <div v-show="isOpen" class="base-select__dropdown">
        <div
          v-for="option in options"
          :key="option.value"
          class="base-select__option"
          :class="{
            'base-select__option--selected': option.value === modelValue,
            'base-select__option--disabled': option.disabled,
          }"
          @click="selectOption(option)"
        >
          {{ option.label }}
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
@import '@/scss/variables';

.base-select {
  position: relative;
  width: 100%;
  min-width: 200px;

  &--disabled {
    opacity: 0.6;
    pointer-events: none;
  }
}

.base-select__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1px solid $color-grey-4;
  border-radius: 8px;
  background-color: $color-white;
  cursor: pointer;
  transition: all 0.3s ease-out;

  &:hover {
    border-color: $color-black-1;
  }
}

.base-select--open .base-select__trigger {
  border-color: $color-accent-press;
  box-shadow: 0 0 0 2px rgba($color-accent-press, 0.1);
}

.base-select__value {
  color: $color-black-1;
}

.base-select__placeholder {
  color: lighten($color-grey-4, 20%);
}

.base-select__arrow {
  transition: transform 0.3s ease-out;
  color: $color-grey-4;
}

.base-select--open .base-select__arrow {
  transform: rotate(180deg);
}

.base-select__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: $color-white;
  border: 1px solid $color-grey-4;
  border-radius: 8px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.base-select__option {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease-out;
  border-bottom: 1px solid lighten($color-grey-4, 30%);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: lighten($color-accent-press, 70%);
    color: $color-accent-press;
  }

  &--selected {
    background-color: $color-accent-press;
    color: $color-white;

    &:hover {
      background-color: $color-accent-hover;
      color: $color-white;
    }
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      background-color: inherit;
      color: inherit;
    }
  }
}

// Анимации
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease-out;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
