<script setup>
import { ref, computed } from 'vue'

const today = new Date()
const currentMonthIndex = ref(today.getMonth())
const currentYear = ref(today.getFullYear())

const selectedRange = ref({
  start: null,
  end: null,
})
const formatDateToLocal = (year, month, day) => {
  const date = new Date(year, month, day)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
// Переключение месяцев
const prevMonth = () => {
  if (currentMonthIndex.value === 0) {
    currentMonthIndex.value = 11
    currentYear.value--
  } else {
    currentMonthIndex.value--
  }
}

const nextMonth = () => {
  if (currentMonthIndex.value === 11) {
    currentMonthIndex.value = 0
    currentYear.value++
  } else {
    currentMonthIndex.value++
  }
}
// Название месяца
const currentMonthName = computed(() => {
  const months = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ]
  return `${months[currentMonthIndex.value]} ${currentYear.value}`
})

// Генерация дней календаря
const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonthIndex.value, 1)
  const lastDay = new Date(currentYear.value, currentMonthIndex.value + 1, 0)

  // Дни предыдущего месяца
  const prevMonthLastDay = new Date(currentYear.value, currentMonthIndex.value, 0).getDate()
  const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNumber = prevMonthLastDay - i
    days.push({
      day: dayNumber,
      date: formatDateToLocal(currentYear.value, currentMonthIndex.value - 1, dayNumber),
      isCurrentMonth: false,
    })
  }

  // Дни текущего месяца
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({
      day: i,
      date: formatDateToLocal(currentYear.value, currentMonthIndex.value, i),
      isCurrentMonth: true,
    })
  }

  // Дни следующего месяца
  const totalCells = 42
  const nextMonthDays = totalCells - days.length
  for (let i = 1; i <= nextMonthDays; i++) {
    days.push({
      day: i,
      date: formatDateToLocal(currentYear.value, currentMonthIndex.value + 1, i),
      isCurrentMonth: false,
    })
  }

  return days
})

const isSelected = (date) => {
  return date === selectedRange.value.start || date === selectedRange.value.end
}

const isInRange = (date) => {
  if (!selectedRange.value.start || !selectedRange.value.end) return false
  return date >= selectedRange.value.start && date <= selectedRange.value.end
}

const selectDate = (date) => {
  if (!selectedRange.value.start || (selectedRange.value.start && selectedRange.value.end)) {
    // Выбор начала диапазона
    selectedRange.value = { start: date, end: null }
  } else {
    // Выбор конца диапазона
    if (date >= selectedRange.value.start) {
      selectedRange.value.end = date
    } else {
      selectedRange.value = { start: date, end: selectedRange.value.start }
    }
  }
}
</script>

<template>
  <div class="calendar">
    <div class="calendar-header">
      <h3>Выбрать период</h3>
      <div class="calendar-nav">
        <button @click="prevMonth" class="nav-button">‹</button>
        <div class="calendar-month">{{ currentMonthName }}</div>
        <button @click="nextMonth" class="nav-button">›</button>
      </div>
    </div>

    <div class="calendar-grid">
      <div class="calendar-weekdays">
        <div v-for="day in ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']" :key="day" class="weekday">
          {{ day }}
        </div>
      </div>

      <div class="calendar-days">
        <div
          v-for="day in calendarDays"
          :key="day.date"
          :class="[
            'calendar-day',
            {
              selected: isSelected(day.date),
              'in-range': isInRange(day.date),
              'other-month': !day.isCurrentMonth,
            },
          ]"
          @click="selectDate(day.date)"
        >
          {{ day.day }}
        </div>
      </div>
    </div>

    <div class="calendar-actions">
      <button class="btn-cancel" @click="$emit('cancel')">Отмена</button>
      <button class="btn-save" @click="$emit('save', selectedRange)">Сохранить</button>
    </div>
  </div>
</template>
<style scoped>
.calendar {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 300px;
}

.calendar-header {
  text-align: center;
  margin-bottom: 16px;
}

.calendar-month {
  font-weight: bold;
  margin-top: 8px;
  font-size: 16px;
}

.calendar-grid {
  display: grid;
  gap: 4px;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 12px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar-day {
  padding: 8px 4px;
  text-align: center;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.calendar-day:hover {
  background: #f0f0f0;
}

.calendar-day.selected {
  background: #1976d2;
  color: white;
}

.calendar-day.in-range {
  background: #e3f2fd;
}

.calendar-day.other-month {
  color: #ccc;
}

.calendar-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}

.btn-cancel,
.btn-save {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-save {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
}

.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
}

.nav-button {
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 16px;
}

.nav-button:hover {
  background: #f0f0f0;
}
</style>
