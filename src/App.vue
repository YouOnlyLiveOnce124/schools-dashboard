<script setup>
import BaseButton from './components/UI/BaseButton.vue'
import BaseInput from './components/UI/BaseInput.vue'
import { ref } from 'vue'

const searchValue = ref('')
</script>

<template>
  <div id="app">
    <h1>Тестируем UI Components</h1>

    <BaseInput
      v-model="searchValue"
      placeholder="Поиск школ..."
    />
    <p>Введенное значение: {{ searchValue }}</p>

    <BaseButton variant="primary">Primary кнопка</BaseButton>
    <BaseButton variant="secondary">Secondary кнопка</BaseButton>
  </div>
</template>
