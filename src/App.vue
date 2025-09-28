<script setup>
import BaseTable from './components/UI/BaseTable.vue'
import BasePagination from './components/UI/BasePagination.vue'
import BaseInput from './components/UI/BaseInput.vue'
import BaseButton from './components/UI/BaseButton.vue'
import BaseSelect from './components/UI/BaseSelect.vue'
import { useSchools } from './services/schoolsApi.js'
import { getRegions } from './services/schoolsApi.js'
import { ref, onMounted, watch, computed } from 'vue'

const {
  schools,
  loading,
  error,
  totalPages,
  currentPage,
  currentRegion,
  fetchSchools,
  setRegionFilter,
  clearError,
} = useSchools()

// Добавляем поисковые данные и лог с ошибкой
const searchValue = ref('')
const errorPage = ref(1)
// Добавляем новые данные для фильтров
const regions = ref([])
const selectedRegion = ref('')
// ДОБАВЛЯЕМ РЕАКТИВНЫЕ ДАННЫЕ ДЛЯ ВЫБОРА
const selectedSchools = ref([]) // Массив UUID выбранных школ

// Добавляем данные для таблицы
const tableColumns = ref([
  { key: 'name', label: 'Название', sortable: true },
  { key: 'region', label: 'Регион', sortable: true },
  { key: 'address', label: 'Адрес', sortable: false },
  { key: 'education_level', label: 'Уровень образования', sortable: true },
])

// Watcher для отслеживания изменения региона
watch(selectedRegion, (newRegionId) => {
  // Если выбрано пустое значение (Все регионы) - сбрасываем фильтр
  if (newRegionId === '') {
    setRegionFilter(null)
  } else if (newRegionId) {
    setRegionFilter(newRegionId)
  }
})

// ВЫЧИСЛЯЕМОЕ СВОЙСТВО ДЛЯ INDETERMINATE (частичный выбор)
const isIndeterminate = computed(() => {
  if (schools.value.length === 0) return false

  const selectedOnCurrentPage = schools.value.filter((school) =>
    selectedSchools.value.includes(school.uuid),
  ).length

  // Indeterminate когда выбрано от 1 до (всего-1) школ на странице
  return selectedOnCurrentPage > 0 && selectedOnCurrentPage < schools.value.length
})

// ОБРАБОТЧИК ВЫБОРА ВСЕХ ШКОЛ НА ТЕКУЩЕЙ СТРАНИЦЕ
const handleSelectAll = (isSelected) => {
  if (isSelected) {
    // Добавляем все школы текущей страницы
    const currentPageIds = schools.value.map((school) => school.uuid)
    selectedSchools.value = [...new Set([...selectedSchools.value, ...currentPageIds])]
  } else {
    // Убираем все школы текущей страницы
    const currentPageIds = schools.value.map((school) => school.uuid)
    selectedSchools.value = selectedSchools.value.filter((id) => !currentPageIds.includes(id))
  }
}

// ОБРАБОТЧИК ВЫБОРА ОДНОЙ ШКОЛЫ
const handleSelectSchool = (schoolId, isSelected) => {
  if (isSelected) {
    // Добавляем школу в выбранные (без дубликатов)
    if (!selectedSchools.value.includes(schoolId)) {
      selectedSchools.value.push(schoolId)
    }
  } else {
    // Убираем школу из выбранных
    const index = selectedSchools.value.indexOf(schoolId)
    if (index > -1) {
      selectedSchools.value.splice(index, 1)
    }
  }
}

/**
 * Обработчик экспорта выбранных данных в CSV
 */
const handleExport = () => {
  if (selectedSchools.value.length === 0) return

  const selectedData = schools.value.filter((school) => selectedSchools.value.includes(school.uuid))

  // Создаем простой текстовый файл
  let textContent = 'Экспорт школ\n\n'
  selectedData.forEach((school) => {
    textContent += `Название: ${school.name}\n`
    textContent += `Регион: ${school.region}\n`
    textContent += `Адрес: ${school.address}\n`
    textContent += `Уровень образования: ${school.education_level}\n`
    textContent += '─'.repeat(50) + '\n'
  })

  // Скачиваем как txt
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `schools_export.txt`
  link.click()

  alert(`✅ Экспортировано ${selectedData.length} школ в TXT файл`)
}

// УМНЫЙ handlePageChange: если страница недоступна - пробуем соседнюю
const handlePageChange = async (page) => {
  errorPage.value = page
  clearError()

  try {
    await fetchSchools(page, 10, currentRegion.value)
  } catch (err) {
    console.log(err.value)
    // Если выбранная страница недоступна - пробуем следующую доступную
    console.log(`Страница ${page} недоступна, ищем ближайшую доступную...`)

    // Пробуем следующую страницу
    if (page < totalPages.value) {
      await handlePageChange(page + 1)
    }
    // Если нет следующей - пробуем предыдущую
    else if (page > 1) {
      await handlePageChange(page - 1)
    }
    // Если вообще нет страниц - показываем ошибку (крайний случай)
    else {
      error.value = `Все страницы временно недоступны. Попробуйте позже.`
    }
  }
}

// УМНЫЙ handleFirstPage: пробуем страницу 1, если не получается - следующую
const handleFirstPage = async () => {
  clearError()
  try {
    await fetchSchools(1, 10, currentRegion.value)
  } catch (err) {
    console.log(err.value)
    // Если первая страница недоступна (крайний случай) - пробуем вторую
    console.log('Страница 1 недоступна, пробуем страницу 2...')
    await fetchSchools(2, 10, currentRegion.value)
  }
}
const handleSearch = () => {
  currentPage.value = 1
  fetchSchools(1, 10, currentRegion.value)
}

// УМНЫЙ handleRetry: пробуем текущую страницу, если не получается - предыдущую
const handleRetry = async () => {
  clearError()
  try {
    await fetchSchools(currentPage.value, 10, currentRegion.value)
  } catch (err) {
    console.log(err.value)
    // Если текущая страница все еще недоступна - пробуем предыдущую
    if (currentPage.value > 1) {
      console.log(`Страница ${currentPage.value} недоступна, пробуем предыдущую...`)
      await fetchSchools(currentPage.value - 1, 10, currentRegion.value)
    } else {
      // Если это первая страница недоступна (маловероятно) - пробуем следующую
      await fetchSchools(2, 10, currentRegion.value)
    }
  }
}

// Выносим загрузку регионов в отдельную функцию
const loadRegions = async () => {
  try {
    regions.value = await getRegions()
    console.log('✅ Регионы загружены:', regions.value.length, 'шт.')
  } catch (error) {
    console.error('❌ Ошибка загрузки регионов:', error)
  }
}

// Обновленный onMounted
onMounted(async () => {
  // Параллельно загружаем школы и регионы
  await Promise.all([fetchSchools(1, 10), loadRegions()])
})
</script>

<template>
  <div id="app">
    <h1>Таблица учреждений</h1>
    <!-- ДОБАВЛЯЕМ КНОПКУ СКАЧИВАНИЯ -->
    <div class="header-actions">
      <BaseButton
        :disabled="selectedSchools.length === 0"
        @click="handleExport"
        variant="accent"
        class="download-btn"
      >
        📥 СКАЧАТЬ ({{ selectedSchools.length }})
      </BaseButton>
    </div>
    <!-- Добавляем фильтры -->
    <div class="filters-section">
      <div class="filter-group">
        <label class="filter-label">Регион:</label>
        <BaseSelect
          v-model="selectedRegion"
          :options="[
            { value: '', label: 'Все регионы' }, // ← ДОБАВИЛИ ОПЦИЮ СБРОСА
            ...regions.map((r) => ({ value: r.id, label: r.name })),
          ]"
          placeholder="Выберите регион"
        />
      </div>
    </div>

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
        <!-- ИСПРАВЛЯЕМ: сохраняем регион при повторе -->
        <BaseButton @click="handleRetry" variant="primary">Повторить попытку</BaseButton>
        <!-- ИСПРАВЛЯЕМ: сохраняем регион при переходе на первую страницу -->
        <BaseButton @click="handleFirstPage" variant="secondary">На первую страницу</BaseButton>
      </div>
    </div>

    <div v-else>
      <BaseTable
        :columns="tableColumns"
        :data="schools"
        :loading="loading"
        :selected-items="selectedSchools"
        :is-indeterminate="isIndeterminate"
        @select-all="handleSelectAll"
        @select-item="handleSelectSchool"
      />

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

.filters-section {
  display: flex;
  gap: 24px;
  margin-bottom: 30px;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 250px;
}

.filter-label {
  font-weight: 700;
  font-size: 14px;
  color: v-bind('$color-black-1');
}

.header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.download-btn {
  min-width: 180px;
}
</style>
