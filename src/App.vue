<script setup>
import BaseTable from './components/UI/BaseTable.vue'
import BasePagination from './components/UI/BasePagination.vue'
import BaseInput from './components/UI/BaseInput.vue'
import BaseButton from './components/UI/BaseButton.vue'
import { useSchools } from './services/schoolsApi.js'
import { onMounted, ref } from 'vue'

const { schools, loading, error, totalPages, currentPage, fetchSchools } = useSchools()
const searchValue = ref('')
const errorPage = ref(1)

const tableColumns = ref([
  { key: 'name', label: 'Название', sortable: true },
  { key: 'region', label: 'Регион', sortable: true },
  { key: 'address', label: 'Адрес', sortable: false },
  { key: 'education_level', label: 'Уровень образования', sortable: true },
])

onMounted(() => {
  fetchSchools(1, 10)
})

const handlePageChange = async (page) => {
  errorPage.value = page
  await fetchSchools(page, 10)
}

const handleSearch = () => {
  currentPage.value = 1
  fetchSchools(1, 10)
}

const handleRetry = () => {
  fetchSchools(currentPage.value, 10)
}
</script>

<template>
  <div id="app">
    <h1>Таблица учреждений</h1>

    <div class="search-section">
      <BaseInput v-model="searchValue" placeholder="Поиск школ..." @input="handleSearch" />
    </div>

    <div v-if="loading" class="status-message">
      <div class="loading-spinner">Загрузка данных...</div>
    </div>

    <div v-else-if="error" class="status-message error">
      <div class="error-icon">⚠️</div>
      <h3>Временная проблема</h3>
      <p>Страница {{ errorPage }} временно недоступна</p>
      <p class="error-detail">Попробуйте выбрать другую страницу</p>

      <div class="button-group">
        <BaseButton @click="handleRetry" variant="primary">Повторить попытку</BaseButton>
        <BaseButton @click="fetchSchools(1, 10)" variant="secondary">На первую страницу</BaseButton>
      </div>
    </div>

    <div v-else>
      <BaseTable :columns="tableColumns" :data="schools" :loading="loading" />

      <BasePagination
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.status-message {
  padding: 40px 30px;
  text-align: center;
  border-radius: 12px;
  margin: 20px 0;
}

.status-message.error {
  background: linear-gradient(135deg, #fff3f3 0%, #ffeaea 100%);
  border: 1px solid #ffcdd2;
  border-left: 4px solid #ff5252;
  color: #d32f2f;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.status-message.error h3 {
  margin: 10px 0;
  font-size: 20px;
}

.status-message.error p {
  margin: 8px 0;
  font-size: 16px;
}

.error-detail {
  font-size: 14px;
  color: #666;
}

.button-group {
  margin-top: 25px;
}

.button-group button {
  margin: 0 10px;
}

.loading-spinner {
  font-size: 18px;
  color: #1976d2;
}

.search-section {
  margin-bottom: 30px;
  max-width: 400px;
}
</style>
