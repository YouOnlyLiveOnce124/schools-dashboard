<script setup>
import BaseTable from './components/UI/BaseTable.vue'
import BasePagination from './components/UI/BasePagination.vue'
import BaseInput from './components/UI/BaseInput.vue'
import BaseButton from './components/UI/BaseButton.vue'
import BaseSelect from './components/UI/BaseSelect.vue'
import BaseCalendar from './components/UI/BaseCalendar.vue'
import { useSchools } from './services/schoolsApi.js'
import { getRegions } from './services/schoolsApi.js'
import { ref, onMounted, watch, computed } from 'vue'

const {
  schools,
  searchSchools, // ← МАССИВ ДЛЯ ПОИСКА
  loading,
  error,
  totalPages,
  currentPage,
  currentRegion,
  fetchSchools,
  clearError,
} = useSchools()

const searchValue = ref('')
const searchTimeout = ref(null)
const errorPage = ref(1)
const regions = ref([])
const selectedRegion = ref('')
const filteredCurrentPage = ref(1)

// ДАННЫЕ ДЛЯ ФИЛЬТРОВ
const schoolTypes = ref([
  { value: 'all', label: 'Все виды' },
  { value: 'school', label: 'Школы' },
  { value: 'college', label: 'Колледжи' },
  { value: 'university', label: 'Университеты' },
])

const statusTypes = ref([
  { value: 'all', label: 'Все статусы' },
  { value: 'active', label: 'Активные' },
  { value: 'inactive', label: 'Неактивные' },
])

const selectedType = ref('all')
const selectedStatus = ref('all')

// ПАГИНАЦИЯ
const pageSizes = ref([10, 25, 50])
const selectedPageSize = ref(10)

// ДАННЫЕ ДЛЯ КАЛЕНДАРЯ
const showCalendar = ref(false)
const selectedDateRange = ref(null)

const dateRange = computed(() => {
  if (!selectedDateRange.value || !selectedDateRange.value.start || !selectedDateRange.value.end) {
    return 'Выберите период'
  }

  // Правильное создание дат с учетом времени
  const start = new Date(selectedDateRange.value.start + 'T00:00:00')
  const end = new Date(selectedDateRange.value.end + 'T00:00:00')

  const format = (date) => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  }

  return `${format(start)} - ${format(end)}`
})

const applyDateRange = (range) => {
  showCalendar.value = false
  selectedDateRange.value = range
  console.log('Выбран диапазон:', range.start, 'до', range.end)
}
// ВЫБОР ШКОЛ
const selectedSchools = ref([])
const isIndeterminate = computed(() => {
  if (displayedSchools.value.length === 0) return false
  const selectedOnCurrentPage = displayedSchools.value.filter((school) =>
    selectedSchools.value.includes(school.uuid),
  ).length
  return selectedOnCurrentPage > 0 && selectedOnCurrentPage < displayedSchools.value.length
})

// КОЛОНКИ ТАБЛИЦЫ
const tableColumns = ref([
  { key: 'name', label: 'Название', sortable: true },
  { key: 'region', label: 'Регион', sortable: true },
  { key: 'address', label: 'Адрес', sortable: false },
  { key: 'education_level', label: 'Уровень образования', sortable: true },
])

// let isAutoLoading = false

// ФИЛЬТРАЦИЯ ДЛЯ ПОИСКА И СТАТУСОВ
const filteredSchools = computed(() => {
  // ВЫБИРАЕМ МАССИВ ДЛЯ ФИЛЬТРАЦИИ
  const sourceArray = searchValue.value.trim() !== '' ? searchSchools.value : schools.value

  let filtered = sourceArray

  // 1. ФИЛЬТРАЦИЯ ПО СТАТУСУ
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter((school) => {
      const schoolStatus = school.status || 'Нет статуса'
      if (selectedStatus.value === 'active') {
        return schoolStatus === 'Действующее'
      } else if (selectedStatus.value === 'inactive') {
        return schoolStatus === 'Недействующее'
      }
      return false
    })
  }

  // 2. ФИЛЬТРАЦИЯ ПО ПОИСКУ
  if (searchValue.value.trim() !== '') {
    const searchTerm = searchValue.value.toLowerCase().trim()
    filtered = filtered.filter((school) => {
      return school.name.toLowerCase().includes(searchTerm)
    })
    console.log('🔍 Найдено школ:', filtered.length, 'из', searchSchools.value.length)
  }

  return filtered
})

// ОТОБРАЖАЕМЫЕ ДАННЫЕ
const displayedSchools = computed(() => {
  if (searchValue.value.trim() !== '' || selectedStatus.value !== 'all') {
    const startIndex = (filteredCurrentPage.value - 1) * selectedPageSize.value
    const endIndex = startIndex + selectedPageSize.value
    return filteredSchools.value.slice(startIndex, endIndex)
  } else {
    return schools.value
  }
})

// КОЛИЧЕСТВО СТРАНИЦ
const filteredTotalPages = computed(() => {
  if (searchValue.value.trim() !== '' || selectedStatus.value !== 'all') {
    return Math.ceil(filteredSchools.value.length / selectedPageSize.value)
  } else {
    return totalPages.value
  }
})

// ТЕКУЩАЯ СТРАНИЦА
const currentDisplayPage = computed(() => {
  if (searchValue.value.trim() !== '' || selectedStatus.value !== 'all') {
    return filteredCurrentPage.value
  } else {
    return currentPage.value
  }
})

// WATCHERS
watch(selectedRegion, (newRegionId) => {
  currentPage.value = 1
  filteredCurrentPage.value = 1
  searchValue.value = '' // ← СБРАСЫВАЕМ ПОИСК ПРИ СМЕНЕ РЕГИОНА
  const finalRegionId = newRegionId === '' ? null : newRegionId
  fetchSchools(1, selectedPageSize.value, finalRegionId, false)
})

watch(selectedStatus, (newStatus, oldStatus) => {
  filteredCurrentPage.value = 1

  if (newStatus === 'all' && oldStatus !== 'all') {
    console.log('🔄 Возврат к "Все статусы"')
    currentPage.value = 1
    fetchSchools(1, selectedPageSize.value, currentRegion.value, false)
  }
})

watch(selectedType, (newType) => {
  if (newType !== 'all') {
    alert('Фильтрация по видам учреждений временно недоступна. API не поддерживает этот параметр.')
    selectedType.value = 'all'
  }
})

// ОБРАБОТЧИКИ
const handlePageSizeChange = (newSize) => {
  selectedPageSize.value = newSize
  currentPage.value = 1
  fetchSchools(1, newSize, currentRegion.value, false)
}

const handleSelectAll = (isSelected) => {
  if (isSelected) {
    const currentPageIds = displayedSchools.value.map((school) => school.uuid)
    selectedSchools.value = [...new Set([...selectedSchools.value, ...currentPageIds])]
  } else {
    const currentPageIds = displayedSchools.value.map((school) => school.uuid)
    selectedSchools.value = selectedSchools.value.filter((id) => !currentPageIds.includes(id))
  }
}

const handleSelectSchool = (schoolId, isSelected) => {
  if (isSelected) {
    if (!selectedSchools.value.includes(schoolId)) {
      selectedSchools.value.push(schoolId)
    }
  } else {
    const index = selectedSchools.value.indexOf(schoolId)
    if (index > -1) {
      selectedSchools.value.splice(index, 1)
    }
  }
}

const handleExport = () => {
  if (selectedSchools.value.length === 0) return

  const selectedData = schools.value.filter((school) => selectedSchools.value.includes(school.uuid))

  let textContent = 'Экспорт школ\n\n'
  selectedData.forEach((school) => {
    textContent += `Название: ${school.name}\n`
    textContent += `Регион: ${school.region}\n`
    textContent += `Адрес: ${school.address}\n`
    textContent += `Уровень образования: ${school.education_level}\n`
    textContent += '─'.repeat(50) + '\n'
  })

  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `schools_export.txt`
  link.click()

  alert(`✅ Экспортировано ${selectedData.length} школ в TXT файл`)
}

const handlePageChange = async (page) => {
  errorPage.value = page
  clearError()

  if (searchValue.value.trim() !== '' || selectedStatus.value !== 'all') {
    filteredCurrentPage.value = page
  } else {
    await fetchSchools(page, selectedPageSize.value, currentRegion.value, false)
  }
}

const handleFirstPage = async () => {
  clearError()
  await fetchSchools(1, selectedPageSize.value, currentRegion.value, false)
}

// ФУНКЦИЯ ПОИСКА
const handleSearch = () => {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    filteredCurrentPage.value = 1
    console.log('🔍 Поиск:', searchValue.value)
  }, 300)
}

const handleRetry = async () => {
  clearError()
  await fetchSchools(currentPage.value, selectedPageSize.value, currentRegion.value, false)
}

// ФУНКЦИЯ СБРОСА ПОИСКА
const clearSearch = () => {
  searchValue.value = ''
}

// ЗАГРУЗКА РЕГИОНОВ
const loadRegions = async () => {
  try {
    regions.value = await getRegions()
    console.log('✅ Регионы загружены:', regions.value.length, 'шт.')
  } catch (error) {
    console.error('❌ Ошибка загрузки регионов:', error)
  }
}

// ИНИЦИАЛИЗАЦИЯ
onMounted(async () => {
  await Promise.all([fetchSchools(1, selectedPageSize.value, null, false), loadRegions()])
})
</script>

<template>
  <div id="app">
    <h1>Таблица учреждений</h1>

    <!-- ВЕРХНЯЯ СТРОКА ФИЛЬТРОВ -->
    <div class="top-filters">
      <div class="calendar-placeholder" @click="showCalendar = true">📅 {{ dateRange }}</div>

      <div class="filter-group">
        <BaseSelect v-model="selectedType" :options="schoolTypes" placeholder="Все виды" />
      </div>

      <div class="filter-group">
        <BaseSelect v-model="selectedStatus" :options="statusTypes" placeholder="Все статусы" />
      </div>
    </div>
    <div v-if="showCalendar" class="calendar-overlay" @click="showCalendar = false">
      <div class="calendar-container" @click.stop>
        <BaseCalendar @save="applyDateRange" @cancel="showCalendar = false" />
      </div>
    </div>
    <!-- ДЕЙСТВИЯ С ТАБЛИЦЕЙ -->
    <div class="table-actions">
      <BaseButton
        :disabled="selectedSchools.length === 0"
        @click="handleExport"
        variant="accent"
        class="download-btn"
      >
        📥 СКАЧАТЬ ({{ selectedSchools.length }})
      </BaseButton>

      <div class="records-info">
        <span class="records-text">Показывать по:</span>
        <BaseSelect
          v-model="selectedPageSize"
          :options="pageSizes.map((size) => ({ value: size, label: String(size) }))"
          @update:modelValue="handlePageSizeChange"
          class="page-size-select"
        />
      </div>
    </div>

    <!-- ФИЛЬТРЫ ПО РЕГИОНАМ -->
    <div class="filters-section">
      <div class="filter-group">
        <label class="filter-label">Регион:</label>
        <BaseSelect
          v-model="selectedRegion"
          :options="[
            { value: '', label: 'Все регионы' },
            ...regions.map((r) => ({ value: r.id, label: r.name })),
          ]"
          placeholder="Выберите регион"
        />
      </div>
    </div>

    <!-- ПОИСК -->
    <div class="search-section">
      <div class="search-with-clear">
        <BaseInput
          v-model="searchValue"
          placeholder="Поиск по названию школы..."
          @input="handleSearch"
        />
        <BaseButton
          v-if="searchValue"
          @click="clearSearch"
          variant="secondary"
          class="clear-search-btn"
        >
          ×
        </BaseButton>
      </div>
      <div v-if="searchValue.trim() !== ''" class="search-results-info">
        🔍 Найдено: <strong>{{ filteredSchools.length }}</strong> школ по запросу "{{
          searchValue
        }}"
      </div>
    </div>
    <!-- СОДЕРЖИМОЕ -->
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
        <BaseButton @click="handleFirstPage" variant="secondary">На первую страницу</BaseButton>
      </div>
    </div>

    <div v-else>
      <BaseTable
        :columns="tableColumns"
        :data="displayedSchools"
        :loading="loading"
        :selected-items="selectedSchools"
        :is-indeterminate="isIndeterminate"
        @select-all="handleSelectAll"
        @select-item="handleSelectSchool"
      />

      <BasePagination
        v-if="filteredTotalPages > 1"
        :current-page="currentDisplayPage"
        :total-pages="filteredTotalPages"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
/* СТИЛИ ОСТАЮТСЯ ТАКИМИ ЖЕ */
.top-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.calendar-placeholder {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  min-width: 250px;
}

.filter-group {
  min-width: 150px;
}

.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.records-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.records-text {
  font-size: 14px;
  color: #666;
}

.page-size-select {
  min-width: 80px;
}

.header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.download-btn {
  min-width: 180px;
}

.filters-section {
  display: flex;
  gap: 24px;
  margin-bottom: 30px;
  align-items: end;
  flex-wrap: wrap;
}

.filter-label {
  font-weight: 700;
  font-size: 14px;
  color: v-bind('$color-black-1');
}

.search-section {
  margin-bottom: 30px;
  max-width: 400px;
}

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

.search-with-clear {
  display: flex;
  gap: 8px;
  align-items: center;
  max-width: 400px;
}

.clear-search-btn {
  min-width: 40px;
  padding: 8px;
}

.search-results-info {
  margin-top: 8px;
  padding: 8px 12px;
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 4px;
  font-size: 14px;
}
.calendar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.calendar-container {
  background: white;
  border-radius: 8px;
}
</style>
