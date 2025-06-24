<template>
  <v-container dir="rtl" fluid class="py-8 bg-gradient">
    <v-row justify="center">
      <v-col cols="12" md="9">
        <!-- Main News Creation Card -->
        <v-card elevation="8" rounded="xl" class="news-card pb-4">
          <!-- Header Section -->
          <div class="accent-bar"></div>
          <v-card-title dir="rtl" class="d-flex align-center">
            <v-icon color="primary" size="34" class="ml-2">
              mdi-newspaper-variant-multiple
            </v-icon>
            إضافة خبر جديد  
          </v-card-title>
          <v-card-subtitle class="text-center text-grey-darken-1 pb-2 subtitle-text">
            شارك آخر المستجدات مع متابعيك عبر تعبئة النموذج التالي
          </v-card-subtitle>
          <v-divider />
          
          <!-- Main Form -->
          <v-card-text dir="rtl">
            <v-form @submit.prevent="handleFormSubmit" ref="formRef">
              <v-row>
                <!-- Dynamic Content Fields -->
                <v-col cols="12" md="8">
                  <DynamicContentForm 
                    :state="dynamicFormState"
                    @retry="fetchSchema"
                    @update-field="handleFieldUpdate"
                  />
                </v-col>
                
                <!-- Metadata & Settings -->
                <v-col cols="12" md="4">
                  <MetadataFields 
                    :form="metadataForm"
                    :options="dropdownOptions"
                    :loading="loadingStates"
                    @load-tags="fetchTagsIfNeeded"
                  />
                </v-col>
              </v-row>
              
              <!-- Form Actions -->
              <v-row justify="center" class="mt-6">
                <v-col class="d-flex justify-center gap-4">
                  <v-btn
                    color="grey"
                    variant="text"
                    @click="resetAllForms"
                    :disabled="isSubmitting"
                  >
                    إلغاء
                  </v-btn>
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
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { newsApi } from '@/services/api';
import { apiRequest } from '@/services/api';
import DynamicContentForm from '@/components/DynamicContentForm.vue';
import MetadataFields from '@/components/MetadataFields.vue';
import type { 
  SchemaItem, 
  TagItem, 
  ApiResponse, 
  FormSubmissionPayload 
} from '../components/types/news';

// ==========================================
// REACTIVE STATE
// ==========================================

// Form reference
const formRef = ref();

// Dynamic form state
const dynamicFormState = reactive({
  schema: [] as SchemaItem[],
  loading: true,
  error: false,
  errorMessage: '',
  data: {} as Record<string, any>
});

// Metadata form state
const metadataForm = reactive({
  title: '',
  description: '',
  content: '',
  selectedFilter: '',
  selectedTags: [] as TagItem[],
  selectedStatus: '',
  selectedDecision: [] as TagItem[]
});

// Dropdown options
const dropdownOptions = reactive({
  filterOptions: [
    { title: 'اختر نوع الخبر', value: '' },
    { title: 'المحتوى الرئيسي', value: 'isMain' },
    { title: 'المثبت', value: 'isSticky' },
    { title: 'المميز', value: 'isFeatured' }
  ],
  tags: [] as TagItem[],
  statusOptions: [] as TagItem[],
  decisions: [] as TagItem[]
});

// Loading states
const loadingStates = reactive({
  isSubmitting: false,
  isTagsLoading: false,
  isStatusLoading: false,
  isDecisionsLoading: false
});

// Data loading flags
const dataFlags = reactive({
  tagsLoaded: false,
  statusLoaded: false,
  decisionsLoaded: false
});

// ==========================================
// COMPUTED PROPERTIES
// ==========================================

const isSubmitting = computed(() => loadingStates.isSubmitting);

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(async () => {
  await initializeComponent();
});

// ==========================================
// INITIALIZATION
// ==========================================

async function initializeComponent(): Promise<void> {
  try {
    await Promise.allSettled([
      fetchTags(),
      fetchStatus(),
      fetchDecisions(),
      fetchSchema()
    ]);
  } catch (error) {
    console.error('Error initializing component:', error);
  }
}

// ==========================================
// DYNAMIC FORM MANAGEMENT
// ==========================================

async function fetchSchema(): Promise<void> {
  dynamicFormState.loading = true;
  dynamicFormState.error = false;
  
  try {
    const response: ApiResponse = await apiRequest(
      '/app/content-type/by-filters?Id=21&Language=ar'
    );
    
    dynamicFormState.schema = JSON.parse(response.items[0].schema) as SchemaItem[];
    initializeDynamicFormData();
    
  } catch (error) {
    console.error('Error loading schema:', error);
    dynamicFormState.error = true;
    dynamicFormState.errorMessage = 'فشل تحميل نموذج المحتوى. يرجى المحاولة مرة أخرى.';
  } finally {
    dynamicFormState.loading = false;
  }
}

function initializeDynamicFormData(): void {
  dynamicFormState.schema.forEach((item: SchemaItem) => {
    dynamicFormState.data[item.slug] = getInitialFieldValue(item);
  });
}

function getInitialFieldValue(item: SchemaItem): any {
  if (item.type === 'unordered-list') return [];
  if (item.component === 'Slider') return item.images || [];
  if (item.component === 'Files') return item.files || [];
  if (item.component === 'Table') {
    return {
      headers: item.header?.ar?.split(',') || [],
      rows: []
    };
  }
  return item.value || '';
}

function handleFieldUpdate(slug: string, value: any): void {
  dynamicFormState.data[slug] = value;
  console.log('Dynamic form data updated:', { slug, value });
}

// ==========================================
// DROPDOWN DATA MANAGEMENT
// ==========================================

async function fetchTags(): Promise<void> {
  if (dataFlags.tagsLoaded || loadingStates.isTagsLoading) return;
  
  loadingStates.isTagsLoading = true;
  try {
    const data = await newsApi.getTags();
    dropdownOptions.tags = mapTagsData(data.items || []);
    dataFlags.tagsLoaded = true;
  } catch (error) {
    console.error("Error fetching tags:", error);
  } finally {
    loadingStates.isTagsLoading = false;
  }
}

async function fetchStatus(): Promise<void> {
  if (dataFlags.statusLoaded || loadingStates.isStatusLoading) return;
  
  loadingStates.isStatusLoading = true;
  try {
    const data = await newsApi.getContentStatus();
    dropdownOptions.statusOptions = mapStatusData(data.items || []);
    dataFlags.statusLoaded = true;
  } catch (error) {
    console.error("Error fetching status:", error);
  } finally {
    loadingStates.isStatusLoading = false;
  }
}

async function fetchDecisions(): Promise<void> {
  if (dataFlags.decisionsLoaded || loadingStates.isDecisionsLoading) return;
  
  loadingStates.isDecisionsLoading = true;
  try {
    const data = await newsApi.getDecisions();
    dropdownOptions.decisions = mapDecisionsData(data.items || []);
    dataFlags.decisionsLoaded = true;
  } catch (error) {
    console.error("Error fetching decisions:", error);
  } finally {
    loadingStates.isDecisionsLoading = false;
  }
}

async function fetchTagsIfNeeded(): Promise<void> {
  if (!dataFlags.tagsLoaded && !loadingStates.isTagsLoading) {
    await fetchTags();
  }
}

// ==========================================
// DATA MAPPING UTILITIES
// ==========================================

function mapTagsData(items: any[]): TagItem[] {
  return items
    .filter((item: any) => item.tagLanguages?.length)
    .map((item: any) => ({
      title: item.tagLanguages[0].name,
      value: item.tagLanguages[0].tagId
    }));
}

function mapStatusData(items: any[]): TagItem[] {
  return items.map((item: any) => ({
    title: item.slug,
    value: item.id
  }));
}

function mapDecisionsData(items: any[]): TagItem[] {
  return items
    .filter((item: any) => item.categoryLanguages?.length)
    .map((item: any) => ({
      title: item.categoryLanguages[0].name,
      value: item.categoryLanguages[0].categoryId
    }));
}

// ==========================================
// FORM SUBMISSION
// ==========================================

async function handleFormSubmit(): Promise<void> {
  if (!validateForm()) return;

  loadingStates.isSubmitting = true;
  
  try {
    const payload = buildSubmissionPayload();
    await newsApi.createNews(payload);
    
    // Success handling
    resetAllForms();
    showSuccessMessage();
    
  } catch (error) {
    handleSubmissionError(error);
  } finally {
    loadingStates.isSubmitting = false;
  }
}

function validateForm(): boolean {
  return formRef.value?.validate() ?? false;
}

function buildSubmissionPayload(): FormSubmissionPayload {
  return {
    categories: metadataForm.selectedDecision.map((decision:any) => ({ 
      categoryId: decision.value 
    })),
    contentStatusId: metadataForm.selectedStatus,
    contentTypeId: 21,
    dynamicContentLanguages: [{
      language: "ar",
      title: metadataForm.title,
      description: metadataForm.description,
      content: metadataForm.content,
      tags: metadataForm.selectedTags.map((tag:any) => ({ tagId: tag.value })),
      formData: { ...dynamicFormState.data }
    }],
    expiryDate: null,
    isFeature: metadataForm.selectedFilter === 'isFeatured',
    isSticky: metadataForm.selectedFilter === 'isSticky',
    publishDate: new Date().toISOString(),
    slug: generateSlug()
  };
}

function generateSlug(): string {
  const randomStr = Math.random().toString(36).substring(2, 8);
  const timestamp = Date.now().toString(36);
  return `news-${timestamp}-${randomStr}`;
}

// ==========================================
// FORM RESET & UTILITIES
// ==========================================

function resetAllForms(): void {
  resetMetadataForm();
  resetDynamicForm();
  resetValidation();
}

function resetMetadataForm(): void {
  Object.assign(metadataForm, {
    title: '',
    description: '',
    content: '',
    selectedFilter: '',
    selectedTags: [],
    selectedStatus: '',
    selectedDecision: []
  });
}

function resetDynamicForm(): void {
  initializeDynamicFormData();
}

function resetValidation(): void {
  if (formRef.value) {
    formRef.value.resetValidation();
  }
}

// ==========================================
// USER FEEDBACK
// ==========================================

function showSuccessMessage(): void {
  // You can replace this with a proper notification system
  alert('تم حفظ الخبر بنجاح!');
}

function handleSubmissionError(error: any): void {
  const errorMessage = error instanceof Error 
    ? error.message 
    : 'حدث خطأ أثناء الإرسال';
  alert(errorMessage);
  console.error('Submission error:', error);
}
</script>

<style scoped>
/* ===== LAYOUT STYLES ===== */
.bg-gradient {
  background: linear-gradient(120deg, #e3f2fd 60%, #f5f7fa 100%);
  min-height: 100vh;
}

/* ===== CARD STYLING ===== */
.accent-bar {
  height: 9px;
  background: linear-gradient(90deg, #1976d2 40%, #00bcd4 100%);
}

.news-card {
  background: linear-gradient(90deg, #eceff1 60%, #e3f2fd 100%) !important;
  border-radius: 18px !important;
  overflow: hidden;
}

/* ===== TYPOGRAPHY ===== */
.subtitle-text {
  font-size: 1.05rem;
}

.v-card-title {
  font-size: 1.7rem !important;
  letter-spacing: 1px;
}

/* ===== FORM CONTROLS ===== */
.v-text-field input,
.v-textarea textarea,
.v-select input {
  font-size: 1.08rem !important;
  direction: rtl !important;
}

/* ===== UTILITY CLASSES ===== */
.gap-4 {
  gap: 1rem;
}

/* ===== DYNAMIC FORM STYLES ===== */
.v-skeleton-loader, .v-alert {
  margin-bottom: 1.5rem;
}

.field-container {
  margin-bottom: 1rem;
}

.field-header {
  margin-bottom: 0.5rem;
}

.field-description {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  opacity: 0.7;
}
</style>
