<template>
    <v-container dir="rtl" fluid class="pa-4" style="height: 100vh; overflow: hidden;">
        <v-skeleton-loader v-if="loading" type="card" class="mb-4"></v-skeleton-loader>
        
        <v-alert v-else-if="error" type="error" class="mb-4">
            {{ errorMessage }}
            <v-btn variant="text" color="error" @click="fetchSchema" class="mt-2">
                إعادة المحاولة
            </v-btn>
        </v-alert>
        
        <div v-else style="height: 100%; max-height: 100vh;">
            <v-row no-gutters style="height: 100%;">
                <!-- Left Side: Fixed Static Fields -->
                <v-col cols="12" md="4" class="pl-2" style="height: 100vh;">
                    <v-card class="pa-4 h-100 d-flex flex-column" elevation="3" rounded="lg">
                        <v-card-title class="text-h5 font-weight-bold pb-2">
                            <v-icon icon="mdi-filter-variant" class="me-2" color="primary" />
                            إعدادات الخبر
                        </v-card-title>
                        <v-divider class="mb-4" />
                        
                        <v-form class="d-flex flex-column flex-grow-1">
                            <!-- News Type Selector -->
                            <div class="mb-4">
                                <v-select
                                    v-model="selectedFilter"
                                    :items="filterOptions"
                                    item-title="title"
                                    item-value="value"
                                    label="نوع الخبر"
                                    variant="outlined"
                                    color="primary"
                                    density="comfortable"
                                    prepend-inner-icon="mdi-filter-variant"
                                    dir="rtl"
                                />
                            </div>
                            
                            <!-- Tags Selector -->
                            <div class="mb-4" v-if="tags.length > 0">
                                <v-select
                                    v-model="selectedTag"
                                    :items="tags"
                                    label="التصنيف"
                                    variant="outlined"
                                    color="primary"
                                    density="comfortable"
                                    prepend-inner-icon="mdi-tag-multiple"
                                    dir="rtl"
                                    multiple
                                    clearable
                                    chips
                                    closable-chips
                                />
                            </div>
                            
                            <!-- Status Selector -->
                            <div class="mb-4">
                                <v-select
                                    v-model="selectedStatus"
                                    :items="statusOptions"
                                    item-title="title"
                                    item-value="value"
                                    label="حالة الخبر"
                                    required
                                    variant="outlined"
                                    color="primary"
                                    density="comfortable"
                                    prepend-inner-icon="mdi-check-circle-outline"
                                    dir="rtl"
                                />
                            </div>
                            
                            <!-- Decisions Selector -->
                            <div class="mb-4" v-if="desicions.length > 0">
                                <v-select
                                    v-model="selectedDesicion"
                                    :items="desicions"
                                    label="القرار"
                                    variant="outlined"
                                    color="primary"
                                    density="comfortable"
                                    prepend-inner-icon="mdi-gavel"
                                    dir="rtl"
                                    multiple
                                    chips
                                    closable-chips
                                />
                            </div>

                            <!-- Action Buttons -->
                            <v-divider class="my-4" />
                            <div class="mt-auto pt-4">
                                <v-btn 
                                    color="grey-darken-1" 
                                    variant="outlined" 
                                    class="mb-3" 
                                    @click="goBack"
                                    prepend-icon="mdi-arrow-left"
                                    block
                                >
                                    العودة للصفحة الرئيسية
                                </v-btn>
                                <v-btn 
                                    color="grey" 
                                    variant="text" 
                                    class="mb-3" 
                                    @click="resetForm"
                                    prepend-icon="mdi-refresh"
                                    block
                                >
                                    إعادة تعيين
                                </v-btn>
                                <v-btn 
                                    color="primary" 
                                    prepend-icon="mdi-content-save" 
                                    elevation="2" 
                                    :loading="saving" 
                                    @click="saveForm"
                                    size="large"
                                    block
                                >
                                    حفظ النموذج
                                </v-btn>
                            </div>
                        </v-form>
                    </v-card>
                </v-col>

                <!-- Right Side: Scrollable Content -->
                <v-col cols="12" md="8" class="pr-2" style="height: 100vh;">
                    <v-card class="pa-4 h-100 d-flex flex-column" elevation="3" rounded="lg">
                        <v-card-title class="text-h5 font-weight-bold pb-2 flex-shrink-0" style="position: sticky; top: 0; z-index: 5; background: white; border-bottom: 1px solid rgba(0,0,0,0.1); margin: -16px -16px 16px -16px; padding: 16px;">
                            <v-icon icon="mdi-form-textbox" class="me-2" color="secondary" />
                            محتوى الخبر
                            <v-spacer />
                            <v-chip color="secondary" variant="outlined" size="small">
                                {{ schema.length + 2 }} حقل
                            </v-chip>
                        </v-card-title>
                        <v-divider class="mb-4" />
                        
                        <div class="flex-grow-1 overflow-y-auto pr-2" style="height: calc(100vh - 140px);">
                            <!-- Title and Description Fields -->
                            <v-card class="pa-5 mb-6" elevation="2" rounded="lg">
                                <div class="d-flex align-center gap-3 mb-4">
                                    <v-chip color="primary" variant="tonal" size="large" prepend-icon="mdi-information">
                                        المعلومات الأساسية
                                    </v-chip>
                                </div>
                                
                                <div class="pa-2 rounded transition-all" style="border-radius: 8px;">
                                    <div class="d-flex align-center mb-2">
                                        <v-chip color="primary" variant="outlined" size="small" prepend-icon="mdi-format-title">
                                            العنوان
                                        </v-chip>
                                    </div>
                                    <v-text-field
                                        v-model="formData['title']"
                                        label="أدخل عنوان الخبر"
                                        variant="outlined"
                                        color="primary"
                                        density="comfortable"
                                        prepend-inner-icon="mdi-format-title"
                                        dir="rtl"
                                        class="mb-3"
                                        required
                                    />
                                </div>
                                
                                <v-divider class="mb-4" />
                                
                                <div class="pa-2 rounded transition-all" style="border-radius: 8px;">
                                    <div class="d-flex align-center mb-2">
                                        <v-chip color="indigo" variant="outlined" size="small" prepend-icon="mdi-text-short">
                                            الوصف
                                        </v-chip>
                                    </div>
                                    <v-textarea
                                        v-model="formData['description']"
                                        label="أدخل وصف الخبر"
                                        variant="outlined"
                                        color="primary"
                                        density="comfortable"
                                        rows="3"
                                        prepend-inner-icon="mdi-text-short"
                                        dir="rtl"
                                        class="mb-3"
                                        required
                                    />
                                </div>
                            </v-card>

                            <!-- Dynamic Fields Section -->
                            <v-card class="pa-5" elevation="2" rounded="lg" v-if="schema.length > 0">
                                <div class="d-flex align-center gap-3 mb-4">
                                    <v-chip color="secondary" variant="tonal" size="large" prepend-icon="mdi-cog">
                                        الحقول الديناميكية
                                    </v-chip>
                                </div>
                                
                                <v-row>
                                    <template v-for="item in schema" :key="item.id">
                                        <v-col :cols="Number(item.colsNumber)">
                                            <div class="pa-2 rounded transition-all field-wrapper-hover" style="border-radius: 8px;">
                                                <FieldHeader 
                                                    :item="item" 
                                                    :getFieldColor="getFieldColor" 
                                                    :getFieldTypeLabel="getFieldTypeLabel" 
                                                />
                                                
                                                <component
                                                    :is="getFieldComponent(item)"
                                                    :item="item"
                                                    :formData="formData"
                                                    @update:modelValue="updateFieldValue(item.slug, $event)"
                                                />
                                                
                                                <div v-if="item.description?.ar" class="text-caption text-grey ps-3 mb-3">
                                                    {{ item.description.ar }}
                                                </div>
                                                
                                                <v-divider class="mb-4" v-if="!isLastItem(item)" />
                                            </div>
                                        </v-col>
                                    </template>
                                </v-row>
                            </v-card>
                            
                            <!-- Empty State for Dynamic Fields -->
                            <div v-else class="text-center py-8">
                                <v-icon icon="mdi-form-textbox-outline" size="64" color="grey-lighten-1" />
                                <div class="text-h6 text-grey-lighten-1 mt-3">لا توجد حقول ديناميكية</div>
                                <div class="text-body-2 text-grey-lighten-2">لم يتم العثور على حقول للعرض</div>
                            </div>
                        </div>
                    </v-card>
                </v-col>
            </v-row>
        </div>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router'; 
import { apiRequest,apiAuthRequest,newsApi, authApi } from '@/services/api';
import FieldHeader from '@/components/fields/FieldHeader.vue';
import FieldText from '@/components/fields/FieldText.vue';
import FieldTextArea from '@/components/fields/FieldTextArea.vue';
import FieldEmail from '@/components/fields/FieldEmail.vue';
import FieldDate from '@/components/fields/FieldDate.vue';
import FieldImage from '@/components/fields/FieldImage.vue';
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
        const response: ApiResponse = await apiRequest('/app/content-type/by-filters?Id=7&Language=ar');

        schema.value = JSON.parse(response.items[0].schema) as SchemaItem[];
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
        if (item.type === 'unordered-list' || item.type === 'ordered-list') formData[item.slug] = [];
        if (item.type === 'image') formData[item.slug] = [];
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

// Navigate back to the main page
function goBack(): void {
    router.push('/');
}


async function postImage(image: string): Promise<void> {
    try {
        const response = await apiAuthRequest('/app/upload/image', {
            method: 'POST',
            body: JSON.stringify({
                image: image
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Image upload response:', response);
    } catch (error) {
        console.error('Error uploading image:', error);
    }
}

// Save the form
async function saveForm(): Promise<void> {
    saving.value = true;
    try {
        // Generate a random slug
        function generateSlug(): string {
            const randomStr = Math.random().toString(36).substring(2, 15);
            return randomStr;
        }

        // Transform dynamic form data to match the exact successful payload format
        const dynamicFieldsData = schema.value.map(item => {
            const fieldValue = formData[item.slug];
            const transformedItem: any = {};

            if (item.component === 'Field') {
                // Field components - exact order from successful payload
                transformedItem.name = item.name || {};
                transformedItem.description = item.description || {};
                transformedItem.type = item.type;
                transformedItem.colsNumber = item.colsNumber;
                transformedItem.isRequired = item.isRequired || false;
                
                // Handle unordered-list and ordered-list specially
                if (item.type === 'unordered-list' || item.type === 'ordered-list') {
                    if (Array.isArray(fieldValue)) {
                        transformedItem.value = JSON.stringify(fieldValue.map(item => ({ value: item })));
                    } else {
                        transformedItem.value = "[]";
                    }
                } else if (item.type === 'image') {
                    // Handle image fields - convert to JSON string with image info
                    if (Array.isArray(fieldValue)) {
                        transformedItem.value = JSON.stringify(fieldValue.map(img => ({
                            name: img.name || '',
                            src: img.src || img.preview || '',
                            description: img.description || ''
                        })));
                    } else {
                        transformedItem.value = "[]";
                    }
                } else {
                    transformedItem.value = fieldValue || "";
                }
                
                transformedItem.slug = item.slug;
                transformedItem.id = item.id;
                transformedItem.component = item.component;
                if (item.groupId) {
                    transformedItem.groupId = item.groupId;
                }
            } else if (item.component === 'Editor') {
                // Editor components - exact order from successful payload
                transformedItem.id = item.id;
                transformedItem.component = item.component;
                transformedItem.slug = item.slug;
                if (item.groupId) {
                    transformedItem.groupId = item.groupId;
                }
                transformedItem.ar = fieldValue || "";
                transformedItem.name = item.name || { ar: "" };
                transformedItem.description = item.description || { ar: "" };
            } else if (item.component === 'MultiEditor') {
                // MultiEditor components
                transformedItem.id = item.id;
                transformedItem.component = item.component;
                transformedItem.slug = item.slug;
                transformedItem.contents = fieldValue || [{
                    id: 1,
                    component: "MultiEditorCard",
                    title: { ar: "محرر متعدد" },
                    content: { ar: "" }
                }];
                if (item.groupId) {
                    transformedItem.groupId = item.groupId;
                }
            } else if (item.component === 'Slider') {
                // Slider components
                transformedItem.id = item.id;
                transformedItem.component = item.component;
                transformedItem.slug = item.slug;
                transformedItem.name = item.name || {};
                transformedItem.images = Array.isArray(fieldValue) ? fieldValue.map(img => ({
                    id: 1,
                    order: 1,
                    component: "SliderImage",
                    slug: generateSlug().substring(0, 6),
                    src: img.name || img.src || "",
                    description: { ar: img.description || "" }
                })) : [];
                if (item.groupId) {
                    transformedItem.groupId = item.groupId;
                }
            } else if (item.component === 'Files') {
                // Files components
                transformedItem.id = item.id;
                transformedItem.component = item.component;
                transformedItem.slug = item.slug;
                transformedItem.name = item.name || {};
                transformedItem.files = Array.isArray(fieldValue) ? fieldValue.map((file, index) => ({
                    id: index + 1,
                    order: index + 1,
                    component: "FileCard",
                    slug: generateSlug().substring(0, 15),
                    src: { ar: file.name || file.src || "" },
                    desc: { ar: file.description || "" }
                })) : [];
                if (item.groupId) {
                    transformedItem.groupId = item.groupId;
                }
            } else if (item.component === 'Table') {
                // Table components
                transformedItem.id = item.id;
                transformedItem.component = item.component;
                transformedItem.slug = item.slug;
                transformedItem.header = item.header || { ar: "" };
                transformedItem.rows = { ar: fieldValue || [] };
                if (item.groupId) {
                    transformedItem.groupId = item.groupId;
                }
            } else {
                // Default fallback for any other component type
                transformedItem.id = item.id;
                transformedItem.component = item.component;
                transformedItem.slug = item.slug;
                transformedItem.value = fieldValue;
                if (item.groupId) {
                    transformedItem.groupId = item.groupId;
                }
            }

            return transformedItem;
        });

        // Create contentJSON with all dynamic field data
        const contentJSON = JSON.stringify(dynamicFieldsData);

        // Construct the main payload to match successful format exactly
        const payload = {
            slug: generateSlug(),
            categories: selectedDesicion.value.map((categoryId: string) => ({ 
                categoryId: parseInt(categoryId) 
            })),
            contentStatusId: parseInt(selectedStatus.value),
            isFeature: selectedFilter.value === 'isFeatured',
            isSticky: selectedFilter.value === 'isSticky',
            publishDate: new Date().toISOString(),
            expiryDate: null,
            contentTypeId: 7,
            dynamicContentLanguages: [
                {
                    language: "ar",
                    title: formData['title'] || '',
                    description: formData['description'] || '',
                    contentJSON: contentJSON,
                    tags: selectedTag.value.map((tagId: string) => {
                        const tag = tags.value.find(t => t.value.toString() === tagId);
                        return {
                            tagId: parseInt(tagId),
                            tag: {
                                slug: generateSlug(),
                                tagLanguages: [
                                    {
                                        name: tag?.title || '',
                                        language: "ar"
                                    }
                                ]
                            }
                        };
                    })
                }
            ]
        };
        
        // console.log('Payload being sent:', payload);
        // console.log('ContentJSON:', contentJSON);
        // console.log('Parsed ContentJSON:', JSON.parse(contentJSON));
        


        
        // Make the API call to save the news
        const response = await newsApi.createNews(payload);
        console.log('Response from API:', response);
        
        // Check if the response indicates success
        if (response) {
            // Handle image upload if present
            if (response.data?.image) {
                await postImage(response.data.image);
            }
            
            alert('تم حفظ الخبر بنجاح');
            resetForm();
            router.push('/');
        } else {
            throw new Error('فشل حفظ الخبر - لم يتم الحصول على استجابة صحيحة');
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
            case 'textarea': return FieldTextArea; // Use FieldTextArea for textarea
            case 'email': return FieldEmail;
            case 'date': return FieldDate;
            case 'number': return FieldText; // Use FieldText for number inputs
            case 'phone-number': return FieldText; // Use FieldText for phone numbers
            case 'image': return FieldImage; // Use FieldImage for image uploads
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
  } catch (error) {
    console.error("Error fetching decisions:", error);
  }
}

</script>
