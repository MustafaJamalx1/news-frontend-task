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
import { apiRequest } from '@/services/api';
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
        // Construct payload
        const payload = {
            contentData: formData,
            schema: schema.value
        };
        
        // Example API call - replace with your actual endpoint
        const response = await apiRequest('/your-save-endpoint');
        
        console.log('Form saved successfully:', response);
        
    } catch (e) {
        console.error('Error saving form:', e);
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
            case 'unordered-list': return FieldUnorderedList;
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
        'date': 'تاريخ',
        'select': 'قائمة منسدلة',
        'unordered-list': 'قائمة',
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
        'date': 'purple',
        'select': 'teal',
        'unordered-list': 'deep-purple',
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
onMounted(fetchSchema);
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
