<script setup>
import BaseButton from './components/UI/BaseButton.vue'
</script>

<template>
  <div id="app">
    <h1>Тестируем BaseButton</h1>
    <BaseButton variant="primary">Primary кнопка</BaseButton>
    <BaseButton variant="secondary">Secondary кнопка</BaseButton>
    <BaseButton variant="accent">Accent кнопка</BaseButton>
    <BaseButton :disabled="true">Disabled кнопка</BaseButton>
  </div>
</template>
