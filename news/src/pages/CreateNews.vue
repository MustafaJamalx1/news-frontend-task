<template>
  <v-container dir="rtl" fluid class="py-8" style="background: linear-gradient(120deg, #e3f2fd 60%, #f5f7fa 100%); min-height: 100vh;">
    <v-row justify="center">
      <v-col cols="12" md="7" lg="6">
        <v-card
          elevation="8"
          rounded="xl"
          color="white"
          class="pb-4 "
          style="overflow: hidden;"
        >
          <!-- Accent Bar -->
          <div style="height: 9px; background: linear-gradient(90deg, #1976d2 40%, #00bcd4 100%);"></div>
          <v-card-title
            class="text-center text-primary font-weight-bold py-5"
            style="font-size: 1.7rem; letter-spacing: 1px;"
            dir="rtl"
          >
            <v-icon color="primary" size="34" class="ml-2">mdi-newspaper-variant-multiple</v-icon>
            إضافة خبر جديد  
          </v-card-title>
          <v-card-subtitle class="text-center text-grey-darken-1 pb-2" style="font-size: 1.05rem;">
            شارك آخر المستجدات مع متابعيك   عبر تعبئة النموذج التالي
          </v-card-subtitle>
          <v-divider />
          <v-card-text dir="rtl">
            <v-form @submit.prevent="postProtectedObject" ref="formRef">
              <v-row>
                <v-col cols="12" class="pb-1">
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
                  />
                </v-col>
                <v-col cols="12" class="pb-1">
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
                  />
                </v-col>
                <v-col cols="12" class="pb-1">
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
                  />
                </v-col>
                <v-col cols="12" class="pb-1">
                  <v-select
                    v-model="selectedFilter"
                    :items="filterOptions"
                    item-title="title"
                    item-value="value"
                    label="نوع الخبر"
                    required
                    variant="outlined"
                    color="primary"
                    density="compact"
                    prepend-inner-icon="mdi-filter-variant"
                    dir="rtl"
                  />
                </v-col>
                <v-col cols="12" class="pb-1">
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
                  />
                </v-col>
                <v-col cols="12" class="pb-1" v-if="catagories.length > 0">
                  <v-select
                    v-model="selectedCatagoy"
                    :items="catagories"
                    item-title="title.name"
                    item-value="value"
                    label="حالة الخبر"
                    required
                    variant="outlined"
                    color="primary"
                    density="compact"
                    prepend-inner-icon="mdi-check-circle-outline"
                    dir="rtl"
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
                  class="font-weight-bold px-10 "
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
import { ref,onMounted } from 'vue';
import type { el } from 'vuetify/locale';

const title = ref('');
const description = ref('');
const content = ref('');
const selectedFilter = ref('');
const isSubmitting = ref(false);
const formRef = ref();
const catagories = ref(['']);
const selectedCatagoy = ref<string>();

const statusOptions = ref([
  { title: 'مسودة', value: '1' },
  { title: 'معلق', value: '4' },
  { title: 'منشور', value: '7' },
    { title: 'غير منشور', value: '10' },
]);
const selectedStatus = ref<number>();
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
onMounted(() => {
  // Fetch categories if needed
  fetchCategories();
});
  
function resetForm() {
  title.value = '';
  description.value = '';
  content.value = '';
  selectedFilter.value = '';
  if (formRef.value) {
    (formRef.value as any).resetValidation();
  }
}

async function postProtectedObject() {
  if (formRef.value && !(formRef.value as any).validate()) {
    // Form is invalid, do not submit
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    alert('يجب تسجيل الدخول أولاً');
    return;
  }

  // Fill the payload with form fields and additional fields as requested
  const payload = {
    categories: [
      {
        categoryId: 7,
      }
    ],
    contentStatusId: 3,
    contentTypeId: 7,

    dynamicContentLanguages: [
      {
        language: "ar",
        title: title.value,
        description: description.value,
        // Add other language fields if needed
      }
    ],
    expiryDate: null,
    isFeature: false,
    isSticky: false,
    publishDate: new Date().toISOString(),
    slug: generateSlug(),
    title: title.value,
    description: description.value,
    content: content.value,
    filter: selectedFilter.value,
  };

  try {
    const response = await fetch('http://164.92.187.207:5005/api/app/dynamic-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      resetForm();
      throw new Error('فشل في إرسال البيانات');
    }
    const data = await response.json();
    console.log('تم الإرسال بنجاح:', data);
    resetForm();
    // Handle success (show snackbar, redirect, etc.)
  } catch (err) {
    if (err instanceof Error) {
      alert(err.message || 'حدث خطأ أثناء الإرسال');
    } else {
      alert('حدث خطأ أثناء الإرسال');
    }
  }
}
function generateSlug(): string {
    // Generates a random slug using current timestamp and a random string
    const randomStr = Math.random().toString(36).substring(2, 8);
    const timestamp = Date.now().toString(36);
    console.log(`Generated slug: news-${timestamp}-${randomStr}`);
    return `news-${timestamp}-${randomStr}`;
}
async function fetchCategories() {
 const res= await fetch('http://164.92.187.207:5005/api/app/tag?language=ar&maxResultCount=1000')
 const data= await  res.json()
catagories.value =  data.items.map((item: any) => ({
    title: item.tagLanguages[0],
    value: item.slug
  }));

  // This function can be use   d to fetch categories from the API if required
  console.log(typeof(catagories.value),catagories.value);
}

</script>

<style scoped>
.v-card-title {
  font-size: 2.2rem !important;
  letter-spacing: 1px;
}
.v-card {
  background: linear-gradient(90deg, #eceff1 60%, #e3f2fd 100%) !important;
  border-radius: 18px !important;
}
.v-text-field input,
.v-textarea textarea {
  font-size: 1.08rem !important;
  direction: rtl !important;
}
.v-select input {
  font-size: 1.08rem !important;
  direction: rtl !important;
}
</style>