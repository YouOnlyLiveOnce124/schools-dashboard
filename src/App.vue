<script setup>
import BaseButton from './components/UI/BaseButton.vue'
import BaseInput from './components/UI/BaseInput.vue'
import BaseTable from './components/UI/BaseTable.vue'
import { ref } from 'vue'

const searchValue = ref('')

// Тестовые данные для таблицы
const tableColumns = ref([
  { key: 'name', label: 'Название', sortable: true },
  { key: 'region', label: 'Регион', sortable: true },
  { key: 'address', label: 'Адрес' }
])

const tableData = ref([
  { name: 'Школа №1', region: 'Московская область', address: 'ул. Ленина, 1' },
  { name: 'Школа №2', region: 'Ленинградская область', address: 'ул. Пушкина, 2' }
])
</script>

<template>
  <div id="app">
    <h1>Тестируем UI Components</h1>

    <BaseInput
      v-model="searchValue"
      placeholder="Поиск школ..."
    />

    <BaseTable
      :columns="tableColumns"
      :data="tableData"
    />
  </div>
</template>
