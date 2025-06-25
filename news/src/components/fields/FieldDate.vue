<template>
  <div class="mb-4">
    <v-text-field
      :model-value="formattedDate"
      :label="item.name?.ar"
      variant="outlined"
      color="primary"
      density="comfortable"
      prepend-inner-icon="mdi-calendar"
      readonly
      @click="showDatePicker = true"
      :placeholder="'اختر التاريخ...'"
      dir="rtl"
      class="cursor-pointer"
    />

    <v-dialog v-model="showDatePicker" max-width="400px">
      <v-card>
        <v-card-title class="text-h6 pa-4">
          {{ item.name?.ar }}
        </v-card-title>
        <v-card-text class="pa-0">
          <v-date-picker
            :model-value="selectedDate"
            @update:model-value="updateDate"
            color="primary"
            locale="ar"
            show-adjacent-months
            width="100%"
          />
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="showDatePicker = false"
          >
            إلغاء
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="confirmDate"
          >
            تأكيد
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  formData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

// Local state
const showDatePicker = ref(false);
const selectedDate = ref(props.formData[props.item.slug] || null);

// Computed property to format the date for display
const formattedDate = computed(() => {
  if (!selectedDate.value) return '';
  
  const date = new Date(selectedDate.value);
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Update date when picker changes
function updateDate(newDate) {
  selectedDate.value = newDate;
}

// Confirm and emit the selected date
function confirmDate() {
  emit('update:modelValue', selectedDate.value);
  showDatePicker.value = false;
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.v-text-field :deep(.v-field__input) {
  cursor: pointer;
}

.v-text-field :deep(.v-field__prepend-inner) {
  cursor: pointer;
}
</style>