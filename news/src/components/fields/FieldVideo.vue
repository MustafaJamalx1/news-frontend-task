<template>
  <div class="video-field-container mb-3">
    <v-file-input
      :label="item.name?.ar"
      :placeholder="item.description?.ar || 'اختر ملف فيديو'"
      :required="item.isRequired"
      variant="outlined"
      color="primary"
      density="comfortable"
      hide-details="auto"
      bg-color="grey-lighten-5"
      accept="video/*"
      prepend-icon="mdi-video-outline"
      show-size
      counter
      @update:model-value="handleFileChange"
      :error="!!errorMsg"
      :error-messages="errorMsg"
    />
    
    <div v-if="videoPreviewUrl" class="video-preview mt-3">
      <div class="text-caption mb-1 primary--text">معاينة الفيديو:</div>
      <video 
        controls 
        width="100%" 
        height="250" 
        class="rounded-lg"
        :src="videoPreviewUrl"
      ></video>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

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
const videoPreviewUrl = ref('');
const errorMsg = ref('');

function handleFileChange(file) {
  // Reset previous state
  errorMsg.value = '';
  videoPreviewUrl.value = '';
  
  if (!file) {
    emit('update:modelValue', null);
    return;
  }
  
  // Validate file type
  if (!file.type.startsWith('video/')) {
    errorMsg.value = 'يرجى تحميل ملف فيديو فقط';
    emit('update:modelValue', null);
    return;
  }
  
  // Create video preview
  videoPreviewUrl.value = URL.createObjectURL(file);
  
  // Send file to parent
  emit('update:modelValue', file);
}
</script>

<style scoped>
.video-preview {
  border: 1px solid rgba(0,0,0,0.12);
  padding: 8px;
  border-radius: 8px;
}
</style>