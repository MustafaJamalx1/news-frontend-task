<template>
  <v-card class="pa-3 bg-grey-lighten-5 mb-3">
    <div class="d-flex align-center mb-2">
      <v-icon icon="mdi-image" class="me-2" color="primary"></v-icon>
      <div class="text-body-1">{{ item.name?.ar }}</div>
      <v-chip v-if="item.isRequired" color="error" size="x-small" class="ms-2">مطلوب</v-chip>
    </div>
    
    <!-- File Input -->
    <v-file-input
      label="إضافة صورة جديدة"
      placeholder="اختر صورة..."
      variant="outlined"
      color="primary"
      density="comfortable"
      hide-details="auto"
      bg-color="white"
      prepend-icon="mdi-image-plus"
      accept="image/*"
      show-size
      @update:model-value="handleImageUpload"
      class="mb-3"
    />
    
    <!-- Image Preview Grid -->
    <div v-if="images.length" class="image-grid mt-3">
      <v-card
        v-for="(image, index) in images"
        :key="index"
        class="image-card"
        elevation="2"
      >
        <div class="image-container">
          <v-img
            :src="image.preview || image.src"
            :alt="image.name"
            aspect-ratio="1"
            cover
            class="image-preview"
            @click="viewImage(image)"
          >
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </div>
            </template>
          </v-img>
          
          <!-- Remove Icon -->
          <v-btn
            icon="mdi-close"
            size="small"
            color="red"
            variant="tonal"
            class="remove-btn"
            @click.stop="removeImage(index)"
          ></v-btn>
        </div>
        
        <!-- Image Info -->
        <v-card-text class="pa-2">
          <div class="text-caption text-truncate" :title="image.name">
            {{ image.name }}
          </div>
          <div class="text-caption text-grey">
            {{ formatFileSize(image.size) }}
          </div>
        </v-card-text>
      </v-card>
    </div>
    
    <!-- Empty State -->
    <div v-else class="text-center py-6">
      <v-icon icon="mdi-image-outline" size="48" color="grey-lighten-1"></v-icon>
      <div class="text-body-2 text-grey-lighten-1 mt-2">لم يتم رفع أي صور بعد</div>
    </div>
    
    <!-- Image Preview Dialog -->
    <v-dialog v-model="previewDialog" max-width="800">
      <v-card v-if="selectedImage">
        <v-toolbar color="primary" dark>
          <v-toolbar-title>{{ selectedImage.name }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="previewDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-img
          :src="selectedImage.preview || selectedImage.src"
          :alt="selectedImage.name"
          contain
          max-height="500"
        ></v-img>
        <v-card-text>
          <div class="text-body-2">
            <strong>اسم الملف:</strong> {{ selectedImage.name }}<br>
            <strong>الحجم:</strong> {{ formatFileSize(selectedImage.size) }}
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

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

// Reactive data
const previewDialog = ref(false);
const selectedImage = ref(null);

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
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('يرجى اختيار ملف صورة صالح');
    return;
  }
  
  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    alert('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت');
    return;
  }
  
  const newImages = [...images.value];
  
  // Create preview URL
  const imageObject = {
    name: file.name,
    size: file.size,
    file: file,
    preview: URL.createObjectURL(file)
  };
  
  newImages.push(imageObject);
  images.value = newImages;
}

function removeImage(index) {
  const newImages = [...images.value];
  
  // Revoke object URL to prevent memory leaks
  if (newImages[index].preview && newImages[index].preview.startsWith('blob:')) {
    URL.revokeObjectURL(newImages[index].preview);
  }
  
  newImages.splice(index, 1);
  images.value = newImages;
}

function viewImage(image) {
  selectedImage.value = image;
  previewDialog.value = true;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Cleanup object URLs when component is unmounted
import { onUnmounted } from 'vue';

onUnmounted(() => {
  images.value.forEach(image => {
    if (image.preview && image.preview.startsWith('blob:')) {
      URL.revokeObjectURL(image.preview);
    }
  });
});
</script>

<style scoped>
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.image-card {
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.image-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.image-container {
  position: relative;
}

.image-preview {
  width: 100%;
  height: 150px;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* RTL Support */
[dir="rtl"] .image-grid {
  direction: ltr;
}

[dir="rtl"] .image-card {
  direction: rtl;
}

[dir="rtl"] .remove-btn {
  right: auto;
  left: 8px;
}
</style>
