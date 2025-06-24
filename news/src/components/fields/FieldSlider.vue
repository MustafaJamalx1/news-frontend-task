<template>
  <v-card class="pa-3 bg-grey-lighten-5 mb-3">
    <div class="d-flex align-center mb-2">
      <v-icon icon="mdi-image-multiple" class="me-2" color="primary"></v-icon>
      <div class="text-body-1">{{ item.name?.ar }}</div>
    </div>
    
    <v-file-input
      label="إضافة صورة جديدة"
      placeholder="اختر صورة..."
      variant="outlined"
      color="primary"
      density="comfortable"
      hide-details="auto"
      bg-color="white"
      accept="image/*"
      prepend-icon="mdi-image"
      show-size
      counter
      @update:model-value="handleImageUpload"
    />
    
    <v-row v-if="images.length" class="mt-3">
      <v-col
        v-for="(image, index) in images"
        :key="index"
        cols="4"
        sm="3"
        class="d-flex flex-column align-center"
      >
        <v-img
          :src="image.preview"
          height="120"
          width="100%"
          cover
          class="rounded-lg"
        />
        <v-btn
          icon="mdi-delete"
          variant="text"
          size="small"
          color="red"
          class="mt-1"
          @click="removeImage(index)"
        ></v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

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

// Get images from form data or initialize empty array
const images = computed({
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
function handleImageUpload(file) {
  if (!file) return;
  
  // Create a URL for the image preview
  const reader = new FileReader();
  reader.onload = (e) => {
    const newImages = [...images.value];
    newImages.push({
      file: file,
      preview: e.target.result,
      name: file.name,
      size: file.size
    });
    emit('update:modelValue', newImages);
  };
  reader.readAsDataURL(file);
}

function removeImage(index) {
  const newImages = [...images.value];
  newImages.splice(index, 1);
  emit('update:modelValue', newImages);
}
</script>