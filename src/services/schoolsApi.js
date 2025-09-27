import { ref } from 'vue'

const API_BASE_URL = 'https://schooldb.skillline.ru/api'

async function apiRequest(endpoint, params = {}) {
  try {
    const queryParams = new URLSearchParams(params).toString()
    const url = `${API_BASE_URL}${endpoint}${queryParams ? `?${queryParams}` : ''}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.status) {
      throw new Error(data.message || 'API returned false status')
    }

    return data.data
  } catch (error) {
    console.error('API Request failed:', error)
    throw error
  }
}

export async function getSchools(page = 1, count = 10) {
  return await apiRequest('/schools', { page, count })
}

export async function getRegions() {
  return await apiRequest('/regions')
}

export async function getFederalDistricts() {
  return await apiRequest('/federalDistricts')
}

export function useSchools() {
  const schools = ref([])
  const loading = ref(false)
  const error = ref(null)
  const totalPages = ref(1)
  const currentPage = ref(1)

  const transformSchoolData = (schoolsData) => {
    return schoolsData.map((school) => ({
      uuid: school.uuid,
      name: school.edu_org?.full_name || 'Нет названия',
      region: school.edu_org?.region?.name || 'Не указан',
      address: school.edu_org?.contact_info?.post_address || 'Адрес не указан',
      education_level:
        school.supplements?.[0]?.educational_programs?.[0]?.edu_level?.name || 'Не указан',
    }))
  }

  const fetchSchools = async (page = 1, count = 10) => {
    loading.value = true
    error.value = null

    try {
      const safePage = Math.max(1, Math.min(page, 100))
      const response = await getSchools(safePage, count)

      schools.value = transformSchoolData(response.list || [])
      totalPages.value = Math.min(response.pages_count || 1, 100)
      currentPage.value = safePage
    } catch (err) {
      console.log(`Ошибка загрузки страницы ${page}:`, err.message)
      error.value = `Страница ${page} временно недоступна. Попробуйте другую страницу.`
      schools.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    schools,
    loading,
    error,
    totalPages,
    currentPage,
    fetchSchools,
  }
}
