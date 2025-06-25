<template>
    <v-container dir="rtl">
        <v-skeleton-loader v-if="loading" type="card" class="mb-4"></v-skeleton-loader>
        
        <v-alert v-else-if="error" type="error" class="mb-4">
            {{ errorMessage }}
            <v-btn variant="text" color="error" @click="fetchSchema" class="mt-2">
                إعادة المحاولة
            </v-btn>
        </v-alert>
        
        <v-card v-else class="pa-4 mb-4" elevation="3" rounded="lg">
            <v-card-title class="text-h5 font-weight-bold pb-2">
                <v-icon icon="mdi-form-select" class="me-2" color="primary" />
                نموذج المحتوى
            </v-card-title>
            <v-divider class="mb-4" />
            
            <v-form>
                <v-row>
                    <v-col cols="12" md="3">
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
                    multiple
                    clearable
                    chips
                    class="pb-1"
                    closable-chips
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
                    multiple
                    chips
                    closable-chips
                    />
                    </v-col>
                    <v-col cols="12" md="8">
                        <!-- Title and Description fields -->
                        <v-text-field
                            v-model="formData['title']"
                            label="العنوان"
                            variant="outlined"
                            color="primary"
                            density="comfortable"
                            prepend-inner-icon="mdi-format-title"
                            dir="rtl"
                            class="mb-3"
                            required
                        />
                        
                        <v-textarea
                            v-model="formData['description']"
                            label="الوصف"
                            variant="outlined"
                            color="primary"
                            density="comfortable"
                            rows="2"
                            prepend-inner-icon="mdi-text-short"
                            dir="rtl"
                            class="mb-3"
                            required
                        />
                        
                        <!-- Dynamic fields -->
                        <v-divider class="my-4" />
                        
                        <template v-for="item in schema" :key="item.id">
                            <v-col :cols="Number(item.colsNumber) || 12">
                                <FieldHeader :item="item" :getFieldColor="getFieldColor" :getFieldTypeLabel="getFieldTypeLabel" />
                                
                                <component
                                :is="getFieldComponent(item)"
                                :item="item"
                                :formData="formData"
                                @update:modelValue="updateFieldValue(item.slug, $event)"
                                />
                                
                                <div v-if="item.description?.ar" class="text-caption text-grey ps-3 mb-3">
                                    {{ item.description.ar }}
                                </div>
                                <v-divider class="mb-6" v-if="!isLastItem(item)" />
                            </v-col>
                        </template>
                    </v-col>
                </v-row>

                <v-row class="mt-6">
                    <v-col class="d-flex justify-end">
                        <v-btn color="grey" variant="text" class="me-4" @click="resetForm">إلغاء</v-btn>
                        <v-btn color="primary" prepend-icon="mdi-content-save" elevation="2" 
                               :loading="saving" @click="saveForm">حفظ النموذج</v-btn>
                    </v-col>
                </v-row>
            </v-form>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router'; 
import { apiRequest,apiAuthRequest,newsApi } from '@/services/api';
import FieldHeader from '@/components/fields/FieldHeader.vue';
import FieldText from '@/components/fields/FieldText.vue';
import FieldTextarea from '@/components/fields/FieldTextarea.vue';
import FieldEmail from '@/components/fields/FieldEmail.vue';
import FieldDate from '@/components/fields/FieldDate.vue';
import FieldUnorderedList from '@/components/fields/FieldUnorderedList.vue';
import FieldVideo from '@/components/fields/FieldVideo.vue';
import FieldEmbed from '@/components/fields/FieldEmbed.vue';
import FieldYoutubeId from '@/components/fields/FieldYoutubeId.vue';
import FieldEditor from '@/components/fields/FieldEditor.vue';
import FieldMultiEditor from '@/components/fields/FieldMultiEditor.vue';
import FieldSlider from '@/components/fields/FieldSlider.vue';
import FieldFiles from '@/components/fields/FieldFiles.vue';
import FieldTable from '@/components/fields/FieldTable.vue';
import type { Component } from 'vue';

const selectedFilter = ref('');
const tags = ref<Array<{title: string, value: string}>>([]);
const statusOptions = ref<Array<{title: string, value: string}>>([]);
const selectedTag = ref<string[]>([]);
const selectedStatus = ref('');
const desicions = ref<Array<{title: string, value: string}>>([]);
const selectedDesicion = ref<string[]>([]);
const filterOptions = [
  { title: 'اختر نوع الخبر', value: '' },
  { title: 'المحتوى الرئيسي', value: 'isMain' },
  { title: 'المثبت', value: 'isSticky' },
  { title: 'المميز', value: 'isFeatured' },
];


// TypeScript interfaces
interface SchemaItem {
    id: string | number;
    slug: string;
    name?: {
        ar?: string;
        en?: string;
        kr?: string;
    };
    description?: {
        ar?: string;
        en?: string;
        kr?: string;
    };
    type?: string;
    component?: string;
    colsNumber?: string | number;
    value?: any;
    isRequired?: boolean;
    groupId?: number;
    header?: {
        ar?: string;
        en?: string;
        kr?: string;
    };
    images?: any[];
    files?: any[];
    contents?: any[];
}

interface FormData {
    [key: string]: any;
}

interface ApiResponse {
    items: Array<{
        schema: string;
    }>;
}

const router = useRouter();

// Form states with proper TypeScript types
const schema = ref<SchemaItem[]>([]);
const loading = ref<boolean>(true);
const error = ref<boolean>(false);
const errorMessage = ref<string>('');
const saving = ref<boolean>(false);

// Single source of form data with proper typing
const formData = reactive<FormData>({});

// Fetch schema from API
async function fetchSchema(): Promise<void> {
    loading.value = true;
    error.value = false;
    
    try {
        const response: ApiResponse = await apiRequest('/app/content-type/by-filters?Id=21&Language=ar');

        schema.value = JSON.parse(response.items[0].schema) as SchemaItem[];
        console.log('Schema loaded:', schema.value);
        // Initialize form data for each field
        resetForm();
    } catch (e) {
        console.error('Error loading schema:', e);
        error.value = true;
        errorMessage.value = 'Failed to load form schema. Please try again.';
    } finally {
        loading.value = false;
    }
}

// Update a field value
function updateFieldValue(slug: string, value: any): void {
    formData[slug] = value;
}

// Reset the form
function resetForm(): void {
    // Initialize title and description
    formData['title'] = '';
    formData['description'] = '';
    
    // Initialize schema fields
    schema.value.forEach((item: SchemaItem) => {
        formData[item.slug] = item.value || '';
        
        // Initialize special data structures for complex fields
        if (item.type === 'unordered-list') formData[item.slug] = [];
        if (item.component === 'Slider') formData[item.slug] = item.images || [];
        if (item.component === 'Files') formData[item.slug] = item.files || [];
        if (item.component === 'Table') {
            formData[item.slug] = {
                headers: item.header?.ar?.split(',') || [],
                rows: []
            };
        }
    });
}

// Save the form
async function saveForm(): Promise<void> {
    saving.value = true;
    try {
        // Transform dynamic form data to match the expected schema format
        const transformedDynamicData = schema.value.map(item => {
            const fieldValue = formData[item.slug];
            
            // Start with basic structure matching successful payload order
            const transformedItem: any = {};

            if (item.component === 'Field') {
                // Field component structure - match successful payload order
                transformedItem.name = item.name || {};
                transformedItem.description = item.description || {};
                transformedItem.type = item.type;
                transformedItem.colsNumber = item.colsNumber;
                transformedItem.isRequired = item.isRequired || false;
                transformedItem.value = fieldValue || '';
                transformedItem.slug = item.slug;
                transformedItem.id = item.id;
                transformedItem.component = item.component;
                
                // Add groupId at the end
                if (item.groupId) {
                    transformedItem.groupId = item.groupId;
                }
            } else if (item.component === 'Editor') {
                // Editor component structure
                transformedItem.id = item.id;
                transformedItem.component = item.component;
                transformedItem.slug = item.slug;
                
                // Add groupId before ar content
                if (item.groupId) {
                    transformedItem.groupId = item.groupId;
                }
                
                transformedItem.ar = fieldValue || '';
                transformedItem.name = item.name || { ar: '' };
                transformedItem.description = item.description || { ar: '' };
            } else if (item.component === 'Slider') {
                // Slider component structure
                transformedItem.id = item.id;
                transformedItem.component = item.component;
                transformedItem.slug = item.slug;
                transformedItem.images = fieldValue || item.images || [];
                
                // Add groupId at the end
                if (item.groupId) {
                    transformedItem.groupId = item.groupId;
                }
            } else if (item.component === 'Files') {
                // Files component structure
                transformedItem.id = item.id;
                transformedItem.component = item.component;
                transformedItem.slug = item.slug;
                transformedItem.files = fieldValue || item.files || [];
                
                // Add groupId at the end
                if (item.groupId) {
                    transformedItem.groupId = item.groupId;
                }
            } else if (item.component === 'MultiEditor') {
                // MultiEditor component structure
                transformedItem.id = item.id;
                transformedItem.component = item.component;
                transformedItem.slug = item.slug;
                transformedItem.contents = fieldValue || item.contents || [];
                
                // Add groupId at the end
                if (item.groupId) {
                    transformedItem.groupId = item.groupId;
                }
            } else if (item.component === 'Table') {
                // Table component structure
                transformedItem.id = item.id;
                transformedItem.component = item.component;
                transformedItem.slug = item.slug;
                transformedItem.header = item.header;
                transformedItem.rows = fieldValue?.rows || { ar: [] };
                
                // Add groupId at the end
                if (item.groupId) {
                    transformedItem.groupId = item.groupId;
                }
            } else {
                // Fallback for unknown components
                transformedItem.id = item.id;
                transformedItem.component = item.component;
                transformedItem.slug = item.slug;
                transformedItem.name = item.name || {};
                transformedItem.description = item.description || {};
                
                if (item.groupId) {
                    transformedItem.groupId = item.groupId;
                }
            }

            return transformedItem;
        });

        // Generate a random slug
        function generateSlug(): string {
            const randomStr = Math.random().toString(36).substring(2, 15);
            return randomStr;
        }

        // Serialize the transformed data
        const contentJSON = JSON.stringify(transformedDynamicData);

        // Construct the payload according to the required format
        const payload = {
            slug: generateSlug(),
            categories: selectedDesicion.value.map((categoryId: string) => ({ categoryId: parseInt(categoryId) })),
            contentStatusId: parseInt(selectedStatus.value),
            isFeature: selectedFilter.value === 'isFeatured',
            isSticky: selectedFilter.value === 'isSticky',
            publishDate: new Date().toISOString(),
            expiryDate: null,
            contentTypeId: 7, // Changed to match successful payload
            dynamicContentLanguages: [
                {
                    language: "ar",
                    title: formData['title'] || '',
                    description: formData['description'] || '',
                    contentJSON: contentJSON,
                    tags: selectedTag.value.map((tagId: string) => ({
                        tagId: parseInt(tagId) || null,
                        tag: {
                            slug: `tag-${tagId}`, // You might need to get this from the tags data
                            tagLanguages: [
                                {
                                    name: tags.value.find(tag => tag.value.toString() === tagId)?.title || '',
                                    language: "ar"
                                }
                            ]
                        }
                    }))
                }
            ]
        };
        
        console.log('Payload being sent:', payload);
        console.log('ContentJSON:', contentJSON);
        
        // Make the API call to save the news
        const response = await newsApi.createNews(payload);
        
        if (response.ok) {
            alert('تم حفظ النموذج بنجاح!');
            resetForm();
        } else {
            console.log('response: ',response)
            throw new Error('فشل في حفظ النموذج');
        }
        
    } catch (e) {
        console.error('Error saving form:', e);
        alert(e instanceof Error ? e.message : 'حدث خطأ أثناء الحفظ');
    } finally {
        saving.value = false;
    }
}

// Helper: Component mapping
function getFieldComponent(item: SchemaItem): Component {
    if (item.component === 'Field') {
        switch (item.type) {
            case 'text':
            case 'string': return FieldText;
            case 'textarea': return FieldTextarea;
            case 'email': return FieldEmail;
            case 'date': return FieldDate;
            case 'number': return FieldText; // Use FieldText for number inputs
            case 'phone-number': return FieldText; // Use FieldText for phone numbers
            case 'image': return FieldText; // Use FieldText for image inputs (or create specific component)
            case 'unordered-list':
            case 'ordered-list': return FieldUnorderedList; // Handle both list types
            case 'video': return FieldVideo;
            case 'embed': return FieldEmbed;
            case 'youtube-id': return FieldYoutubeId;
            default: return FieldText;
        }
    }
    
    switch (item.component) {
        case 'Editor': return FieldEditor;
        case 'MultiEditor': return FieldMultiEditor;
        case 'Slider': return FieldSlider;
        case 'Files': return FieldFiles;
        case 'Table': return FieldTable;
        default: return FieldText;
    }
}

// Helper: Is this the last item?
function isLastItem(item: SchemaItem): boolean {
    if (!schema.value.length) return true;
    return schema.value[schema.value.length - 1].id === item.id;
}

// Helper: Field type labels
function getFieldTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        'text': 'نص',
        'string': 'نص',
        'textarea': 'نص متعدد الأسطر',
        'email': 'بريد إلكتروني',
        'number': 'رقم',
        'phone-number': 'رقم هاتف',
        'image': 'صورة',
        'date': 'تاريخ',
        'select': 'قائمة منسدلة',
        'unordered-list': 'قائمة غير مرقمة',
        'ordered-list': 'قائمة مرقمة',
        'video': 'رفع فيديو',
        'embed': 'تضمين فيديو',
        'youtube-id': 'معرف يوتيوب',
        'Editor': 'محرر نص',
        'MultiEditor': 'محرر متعدد',
        'Slider': 'معرض صور',
        'Files': 'ملفات',
        'Table': 'جدول'
    };
    return labels[type] || 'حقل';
}

// Helper: Field colors
function getFieldColor(type: string): string {
    const colors: Record<string, string> = {
        'text': 'blue',
        'string': 'blue',
        'textarea': 'indigo',
        'email': 'green',
        'number': 'orange',
        'phone-number': 'cyan',
        'image': 'pink',
        'date': 'purple',
        'select': 'teal',
        'unordered-list': 'deep-purple',
        'ordered-list': 'deep-purple',
        'video': 'red',
        'embed': 'pink',
        'youtube-id': 'red-darken-2',
        'Editor': 'blue-grey',
        'MultiEditor': 'indigo-darken-2',
        'Slider': 'deep-orange',
        'Files': 'amber',
        'Table': 'light-blue'
    };
    return colors[type] || 'grey';
}

// Load schema on component mount
onMounted(()=>{
      fetchTags();
  fetchStatus();
  fetchDesicions();
    fetchSchema();
});

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

</script>

<style scoped>
.v-text-field, .v-textarea, .v-chip { 
    transition: all 0.2s ease-in-out; 
}
.v-card { 
    border-radius: 12px; 
    overflow: hidden; 
}
.v-divider { 
    opacity: 0.6; 
}
.embed-container, .youtube-container {
    position: relative; 
    padding-bottom: 56.25%; 
    height: 0; 
    overflow: hidden; 
    max-width: 100%;
}
.embed-container iframe, .youtube-container iframe {
    position: absolute; 
    top: 0; 
    left: 0; 
    width: 100%; 
    height: 100%;
}
.embed-preview { 
    max-height: 300px; 
    overflow: auto; 
}
.editor-container { 
    border: 1px solid rgba(0,0,0,0.12); 
    border-radius: 8px; 
}
.editor-textarea { 
    font-family: 'Roboto Mono', monospace; 
}
.list-item:hover { 
    background-color: #f5f5f5; 
}
.table-container { 
    border-radius: 8px; 
    overflow: hidden; 
    border: 1px solid rgba(0,0,0,0.12); 
}
</style>
