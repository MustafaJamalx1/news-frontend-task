<template>
  <v-container dir="rtl" fluid class="py-8 bg-gradient">
    <v-row justify="center">
      <v-col cols="12" md="7" lg="6">
        <v-card elevation="8" rounded="xl" class="news-card pb-4">
          <!-- Accent Bar -->
          <div class="accent-bar"></div>
          <v-card-title dir="rtl">
            <v-icon color="primary" size="34" class="ml-2">mdi-newspaper-variant-multiple</v-icon>
            إضافة خبر جديد
          </v-card-title>
          <v-card-subtitle class="text-center text-grey-darken-1 pb-2 subtitle-text">
            شارك آخر المستجدات مع متابعيك عبر تعبئة النموذج التالي
          </v-card-subtitle>
          <v-divider />
          
          <v-card-text dir="rtl">
            <v-form @submit.prevent="postProtectedObject" ref="formRef">
              <v-row>
                <!-- First Column -->
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="title"
                    label="العنوان"
                    :rules="titleRules"
                    required
                    variant="outlined"
                    color="primary"
                    density="compact"
                    prepend-inner-icon="mdi-format-title"
                    dir="rtl"
                    class="pb-1"
                  />
                  
                  <v-textarea
                    v-model="description"
                    label="الوصف المختصر"
                    :rules="descriptionRules"
                    required
                    variant="outlined"
                    color="primary"
                    density="compact"
                    rows="2"
                    prepend-inner-icon="mdi-text-short"
                    dir="rtl"
                    class="pb-1"
                  />
                  
                  <v-textarea
                    v-model="content"
                    label="المحتوى الكامل"
                    :rules="contentRules"
                    required
                    variant="outlined"
                    color="primary"
                    density="compact"
                    rows="4"
                    prepend-inner-icon="mdi-text"
                    dir="rtl"
                    class="pb-1"
                  />
                </v-col>
                
                <!-- Second Column -->
                <v-col cols="12" md="4">
                  <v-select
                    v-model="selectedFilter"
                    :items="filterOptions"
                    item-title="title"
                    item-value="value"
                    label="نوع الخبر"
                    variant="outlined"
                    color="primary"
                    density="compact"
                    prepend-inner-icon="mdi-filter-variant"
                    dir="rtl"
                    class="pb-1"
                  />
                  
                  <v-select
                    v-model="selectedTag"
                    :items="tags"
                    label="التصنيف"
                    variant="outlined"
                    color="primary"
                    density="compact"
                    prepend-inner-icon="mdi-tag-multiple"
                    dir="rtl"
                    class="pb-1"
                    v-if="tags.length > 0"
                  />
                  
                  <v-select
                    v-model="selectedStatus"
                    :items="statusOptions"
                    item-title="title"
                    item-value="value"
                    label="حالة الخبر"
                    required
                    variant="outlined"
                    color="primary"
                    density="compact"
                    prepend-inner-icon="mdi-check-circle-outline"
                    dir="rtl"
                    class="pb-1"
                  />
                  
                  <v-select
                    v-model="selectedDesicion"
                    :items="desicions"
                    label="القرار"
                    variant="outlined"
                    color="primary"
                    density="compact"
                    prepend-inner-icon="mdi-tag-multiple"
                    dir="rtl"
                    class="pb-1"
                    v-if="desicions.length > 0"
                  />
                </v-col>
              </v-row>
              
              <v-row justify="center" class="mt-2">
                <v-btn
                  color="primary"
                  size="large"
                  type="submit"
                  :loading="isSubmitting"
                  elevation="3"
                  rounded="xl"
                  class="font-weight-bold px-10"
                  prepend-icon="mdi-content-save"
                >
                  حفظ الخبر
                </v-btn>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { apiRequest, newsApi } from '@/services/api';
import { ref, onMounted } from 'vue';

// Form data
const title = ref('');
const description = ref('');
const content = ref('');
const selectedFilter = ref('');
const isSubmitting = ref(false);
const formRef = ref();
const tags = ref<Array<{title: string, value: string}>>([]);
const statusOptions = ref<Array<{title: string, value: string}>>([]);
const selectedTag = ref('');
const selectedStatus = ref('');
const desicions = ref<Array<{title: string, value: string}>>([]);
const selectedDesicion = ref<string>();

onMounted(() => {
  fetchTags();
  fetchStatus();
  fetchDesicions();
});

// Options for select inputs
const filterOptions = [
  { title: 'اختر نوع الخبر', value: '' },
  { title: 'المحتوى الرئيسي', value: 'isMain' },
  { title: 'المثبت', value: 'isSticky' },
  { title: 'المميز', value: 'isFeatured' },
];

// Validation rules
const titleRules = [
  (v: string) => !!v || 'العنوان مطلوب',
  (v: string) => (v && v.length >= 4) || 'العنوان يجب أن يكون 4 أحرف على الأقل',
];

const descriptionRules = [
  (v: string) => !!v || 'الوصف مطلوب',
  (v: string) => (v && v.length >= 8) || 'الوصف يجب أن يكون 8 أحرف على الأقل',
];

const contentRules = [
  (v: string) => !!v || 'المحتوى مطلوب',
  (v: string) => (v && v.length >= 12) || 'المحتوى يجب أن يكون 12 حرفًا على الأقل',
];

function resetForm() {
  title.value = '';
  description.value = '';
  content.value = '';
  selectedFilter.value = '';
  selectedStatus.value = '';
  selectedTag.value = '';
  if (formRef.value) {
    formRef.value.resetValidation();
  }
}

function generateSlug(): string {
  const randomStr = Math.random().toString(36).substring(2, 8);
  const timestamp = Date.now().toString(36);
  return `news-${timestamp}-${randomStr}`;
}

async function fetchTags() {
  try {
    const data = await newsApi.getTags();
    
    tags.value = data.items
      .filter((item: any) => item.tagLanguages && item.tagLanguages.length > 0)
      .map((item: any) => ({
        title: item.tagLanguages[0].name,
        value: item.tagLanguages[0].tagId
      }));
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

async function fetchStatus() {
  try {
    const data = await newsApi.getContentStatus();
    statusOptions.value = data.items.map((item: any) => ({
      title: item.slug,
      value: item.id
    }));
  } catch (error) {
    console.error("Error fetching status:", error);
  }
}

async function fetchDesicions() {
  try {
    const data = await newsApi.getDecisions();
    desicions.value = data.items.map((el: any) => ({
      title: el.categoryLanguages[0].name,
      value: el.categoryLanguages[0].categoryId
    }));
    console.log('desicions:', desicions.value);
  } catch (error) {
    console.error("Error fetching decisions:", error);
  }
}

async function postProtectedObject() {
  if (formRef.value && !formRef.value.validate()) {
    return;
  }
  
  console.log('selectedCategory:', selectedTag.value);
  isSubmitting.value = true;
  
  const payload = {
    categories: [
      { categoryId: selectedDesicion }
    ],
    contentStatusId: selectedStatus.value,
    contentTypeId: 7,
    dynamicContentLanguages: [
      {
        language: "ar",
        title: title.value,
        description: description.value,
        content: content.value,
        tags: [{ tagId: selectedTag.value }]
      }
    ],
    expiryDate: null,
    isFeature: selectedFilter.value === 'isFeatured',
    isSticky: selectedFilter.value === 'isSticky',
    isMain: selectedFilter.value === 'isMain',
    publishDate: new Date().toISOString(),
    slug: generateSlug()
  };
  
  try {
    const response = await newsApi.createNews(payload);
    if (!response.ok) {
      throw new Error('فشل في إرسال البيانات');
    }
    
    await response.json();
    resetForm();
    alert('تم حفظ الخبر بنجاح!');
  } catch (err) {
    alert(err instanceof Error ? err.message : 'حدث خطأ أثناء الإرسال');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(120deg, #e3f2fd 60%, #f5f7fa 100%);
  min-height: 100vh;
}

.accent-bar {
  height: 9px;
  background: linear-gradient(90deg, #1976d2 40%, #00bcd4 100%);
}

.news-card {
  background: linear-gradient(90deg, #eceff1 60%, #e3f2fd 100%) !important;
  border-radius: 18px !important;
  overflow: hidden;
}

.subtitle-text {
  font-size: 1.05rem;
}

.v-card-title {
  font-size: 1.7rem !important;
  letter-spacing: 1px;
}

.v-text-field input,
.v-textarea textarea,
.v-select input {
  font-size: 1.08rem !important;
  direction: rtl !important;
}
</style>