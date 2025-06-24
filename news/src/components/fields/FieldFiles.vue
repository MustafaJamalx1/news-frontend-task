<template>
  <v-card class="pa-3 bg-grey-lighten-5 mb-3">
    <div class="d-flex align-center mb-2">
      <v-icon icon="mdi-file-multiple" class="me-2" color="primary"></v-icon>
      <div class="text-body-1">{{ item.name?.ar }}</div>
    </div>
    
    <v-file-input
      label="إضافة ملف جديد"
      placeholder="اختر ملفًا..."
      variant="outlined"
      color="primary"
      density="comfortable"
      hide-details="auto"
      bg-color="white"
      prepend-icon="mdi-file-plus"
      show-size
      counter
      @update:model-value="handleFileUpload"
    />
    
    <v-list v-if="files.length" class="mt-3 bg-white rounded-lg">
      <v-list-item
        v-for="(file, index) in files"
        :key="index"
        :title="file.name"
        :subtitle="`${formatFileSize(file.size)}`"
        class="file-item"
      >
        <template v-slot:prepend>
          <v-icon icon="mdi-file-document-outline"></v-icon>
        </template>
        <template v-slot:append>
          <v-btn
            icon="mdi-delete"
            variant="text"
            size="small"
            color="red"
            @click="removeFile(index)"
          ></v-btn>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup>
import { computed, watch } from 'vue';

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

// Get files from form data or initialize empty array
const files = computed({
  get: () => props.formData[props.item.slug] || [],
  set: (value) => emit('update:modelValue', value)
});

// Initialize if needed
watch(() => props.item, () => {
  if (!props.formData[props.item.slug]) {
    emit('update:modelValue', []);
  }
}, { immediate: true });

// Methods
function handleFileUpload(file) {
  if (!file) return;
  
  const newFiles = [...files.value];
  newFiles.push({
    file: file,
    name: file.name,
    size: file.size,
    type: file.type
  });
  emit('update:modelValue', newFiles);
}

function removeFile(index) {
  const newFiles = [...files.value];
  newFiles.splice(index, 1);
  emit('update:modelValue', newFiles);
}

// Format file size nicely
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
</script>

<style scoped>
.file-item {
  transition: background-color 0.2s ease;
}
.file-item:hover {
  background-color: #f5f5f5;
}
</style>