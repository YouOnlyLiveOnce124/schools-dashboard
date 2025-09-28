import { ref } from 'vue'

const API_BASE_URL = 'https://schooldb.skillline.ru/api'

/**
 * Базовый HTTP-клиент для работы с API школ
 * Обрабатывает ошибки и преобразует ответы в единый формат
 */
async function apiRequest(endpoint, params = {}) {
  try {
    // Формируем URL с параметрами запроса
    const queryParams = new URLSearchParams(params).toString()
    const url = `${API_BASE_URL}${endpoint}${queryParams ? `?${queryParams}` : ''}`

    console.log('🔄 API Request:', url) // Логируем для отладки

    const response = await fetch(url)

    // Проверяем HTTP статус ответа
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // API возвращает {status: boolean, message: string, data: any}
    // Проверяем успешность операции на стороне сервера
    if (!data.status) {
      throw new Error(data.message || 'API returned false status')
    }

    return data.data // Возвращаем только data часть ответа
  } catch (error) {
    console.error('❌ API Request failed:', error)
    throw error // Пробрасываем ошибку выше для обработки в компонентах
  }
}

/**
 * Получает список школ с пагинацией и фильтрацией
 * @param {number} page - Номер страницы (начинается с 1)
 * @param {number} count - Количество элементов на странице
 * @param {number} regionId - ID региона для фильтрации
 * @param {string} status - Статус для фильтрации (active/inactive)
 * @returns {Promise} Данные школ с метаинформацией о пагинации
 */
export async function getSchools(page = 1, count = 10, regionId = null, status = null) {
  const params = { page, count }
  if (regionId) {
    params.region_id = regionId
  }
  if (status && status !== 'all') {
    params.status = status
  }
  return await apiRequest('/schools', params)
}

/**
 * Получает список всех регионов для фильтрации
 * @returns {Promise} Массив регионов {id, name}
 */
export async function getRegions() {
  return await apiRequest('/regions')
}

/**
 * Получает список федеральных округов
 * @returns {Promise} Массив федеральных округов
 */
export async function getFederalDistricts() {
  return await apiRequest('/federalDistricts')
}

/**
 * Composition API хук для работы со школами
 * Предоставляет реактивные данные и методы для управления состоянием
 */
export function useSchools() {
  // Реактивные состояния
  const schools = ref([]) // Список школ для текущей страницы
  const loading = ref(false) // Флаг загрузки данных
  const error = ref(null) // Текст ошибки, если есть
  const totalPages = ref(1) // Общее количество страниц
  const currentPage = ref(1) // Текущая активная страница
  const currentRegion = ref(null) // Текущий регион фильтр
  /**
   * Преобразует сложную структуру данных API в плоскую для таблицы
   * @param {Array} schoolsData - Сырые данные из API
   * @returns {Array} Упрощенная структура для отображения
   */
  const transformSchoolData = (schoolsData) => {
    return schoolsData.map((school) => ({
      uuid: school.uuid,
      name: school.edu_org?.full_name || 'Нет названия',
      region: school.edu_org?.region?.name || 'Не указан',
      address: school.edu_org?.contact_info?.post_address || 'Адрес не указан',
      education_level:
        school.supplements?.[0]?.educational_programs?.[0]?.edu_level?.name || 'Не указан',
      status: school.supplements?.[0]?.status?.name || 'Неизвестно',
    }))
  }

  /**
   * Загружает данные школ для указанной страницы
   * @param {number} page - Номер страницы для загрузки
   * @param {number} count - Количество элементов на странице
   */
  const fetchSchools = async (
    page = 1,
    count = 10,
    regionId = null,
    isAppend = false,
    status = null,
  ) => {
    // Если это НЕ догрузка И страница 1 - очищаем данные
    if (!isAppend && page === 1) {
      schools.value = []
    }
    // Для страниц 2+ при обычной навигации - тоже очищаем, но это НЕПРАВИЛЬНО!

    loading.value = true
    error.value = null
    currentRegion.value = regionId

    try {
      const safePage = Math.max(1, Math.min(page, 100))
      const response = await getSchools(safePage, count, regionId, status)

      const newSchools = transformSchoolData(response.list || [])

      if (isAppend) {
        // Догрузка - добавляем
        schools.value = [...schools.value, ...newSchools]
      } else {
        // Обычная навигация - ЗАМЕНЯЕМ данные
        schools.value = newSchools
      }

      totalPages.value = Math.min(response.pages_count || 1, 100)
      currentPage.value = safePage

      console.log(
        `✅ Страница ${safePage} загружена, школ: ${schools.value.length}, догрузка: ${isAppend}`,
      )
    } catch (err) {
      console.log(`Ошибка загрузки страницы ${page}:`, err.message)
      error.value = `Страница ${page} временно недоступна. Попробуйте другую страницу.`
      if (!isAppend && page === 1) {
        schools.value = []
      }
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }
  // Экспортируем состояния и методы для использования в компонентах
  return {
    schools, // Реактивный список школ
    loading, // Флаг загрузки
    error, // Текст ошибки
    totalPages, // Общее количество страниц
    currentPage, // Текущая страница
    currentRegion, // Текущий фильтр
    fetchSchools, // Метод для загрузки данных
    clearError, // Сброс ошибки
  }
}
