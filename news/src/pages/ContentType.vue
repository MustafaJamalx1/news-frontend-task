<template>
  <v-container dir="rtl">
    <v-card class="pa-4 mb-4" elevation="3" rounded="lg">
      <v-card-title class="text-h5 font-weight-bold pb-2">
        <v-icon icon="mdi-form-select" class="me-2" color="primary" />
        نموذج المحتوى
      </v-card-title>
      <v-divider class="mb-4" />
      
      <v-form>
        <v-row>
          <v-col 
            v-for="item in schema" 
            :key="item.id"
            :cols="Number(item.colsNumber) || 12"
          >
            <!-- Field Type Badge -->
            <div class="d-flex align-center mb-1">
              <v-chip
                size="small"
                :color="getFieldColor(item.type || item.component)"
                variant="outlined"
                class="me-2"
                prepend-icon="mdi-label-outline"
              >
                {{ getFieldTypeLabel(item.type || item.component) }} 
              </v-chip>
              <div class="text-caption text-medium-emphasis">{{ item.name?.ar }}</div>
            </div>
            
            <!-- Text/String Field -->
            <v-text-field 
              v-if="item.component === 'Field' && (item.type === 'text' || item.type === 'string')"
              :label="item.name?.ar"
              :placeholder="item.description?.ar || ''"
              :required="item.isRequired"
              variant="outlined"
              color="primary"
              density="comfortable"
              hide-details="auto"
              class="mb-3"
              bg-color="grey-lighten-5"
            />
            
            <!-- Textarea Field -->
            <v-textarea 
              v-else-if="item.component === 'Field' && item.type === 'textarea'"
              :label="item.name?.ar"
              :placeholder="item.description?.ar || ''"
              :required="item.isRequired"
              variant="outlined"
              color="primary"
              rows="4"
              auto-grow
              density="comfortable"
              hide-details="auto"
              class="mb-3"
              bg-color="grey-lighten-5"
            />
            
            <!-- Email Field -->
            <v-text-field 
              v-else-if="item.component === 'Field' && item.type === 'email'"
              :label="item.name?.ar"
              :placeholder="item.description?.ar || ''"
              :required="item.isRequired"
              variant="outlined"
              color="primary"
              density="comfortable"
              type="email"
              prepend-inner-icon="mdi-email-outline"
              hide-details="auto"
              class="mb-3"
              bg-color="grey-lighten-5"
            />

            <!-- Date Field -->
            <v-date-picker
              v-else-if="item.component === 'Field' && item.type === 'date'"
              :label="item.name?.ar"
              :title="item.name?.ar"
              color="primary"
              hide-details="auto"
              class="mb-3 rounded-lg"
            ></v-date-picker>
            
            <!-- Unordered List -->
            <div v-else-if="item.component === 'Field' && item.type === 'unordered-list'">
              <v-text-field
                :label="item.name?.ar"
                :placeholder="'أضف عنصر جديد'"
                variant="outlined"
                color="primary"
                density="comfortable"
                hide-details="auto"
                class="mb-2"
                bg-color="grey-lighten-5"
                append-inner-icon="mdi-plus"
                v-model="newListItem"
                @click:append-inner="addListItem(item.slug)"
                @keyup.enter="addListItem(item.slug)"
              />
              
              <v-list v-if="listItems[item.slug]?.length" class="bg-grey-lighten-5 rounded-lg mb-3">
                <v-list-item
                  v-for="(listItem, index) in listItems[item.slug]"
                  :key="index"
                  :title="listItem"
                  class="list-item"
                >
                  <template v-slot:prepend>
                    <v-icon icon="mdi-circle-small"></v-icon>
                  </template>
                  <template v-slot:append>
                    <v-btn
                      icon="mdi-delete-outline"
                      variant="text"
                      size="small"
                      color="red"
                      @click="removeListItem(item.slug, index)"
                    ></v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </div>

            <!-- Video Upload -->
            <div v-else-if="item.component === 'Field' && item.type === 'video'" class="mb-3">
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
              />
            </div>

            <!-- Embed Video -->
            <div v-else-if="item.component === 'Field' && item.type === 'embed'" class="mb-3">
              <v-text-field
                :label="item.name?.ar"
                :placeholder="item.description?.ar || 'أدخل رابط الفيديو'"
                :required="item.isRequired"
                variant="outlined"
                color="primary"
                density="comfortable"
                prepend-inner-icon="mdi-code-tags"
                hide-details="auto"
                bg-color="grey-lighten-5"
                v-model="embedCodes[item.slug]"
              />
              <v-alert
                v-if="embedCodes[item.slug]"
                type="info"
                color="primary"
                class="mt-2 embed-preview"
                variant="tonal"
              >
                <div class="text-caption mb-1">معاينة الفيديو المضمن:</div>
                <div class="embed-container" v-html="embedCodes[item.slug]"></div>
              </v-alert>
            </div>

            <!-- YouTube ID -->
            <div v-else-if="item.component === 'Field' && item.type === 'youtube-id'" class="mb-3">
              <v-text-field
                :label="item.name?.ar"
                :placeholder="item.description?.ar || 'أدخل معرف فيديو يوتيوب'"
                :required="item.isRequired"
                variant="outlined"
                color="primary"
                density="comfortable"
                prepend-inner-icon="mdi-youtube"
                hide-details="auto"
                bg-color="grey-lighten-5"
                v-model="youtubeIds[item.slug]"
              />
              <div v-if="youtubeIds[item.slug]" class="mt-2 youtube-preview">
                <div class="text-caption mb-1 text-primary">معاينة الفيديو:</div>
                <v-card class="pa-2">
                  <div class="youtube-container">
                    <iframe 
                      width="50%" 
                      height="250" 
                      :src="`https://www.youtube.com/embed/${youtubeIds[item.slug]}`" 
                      frameborder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowfullscreen
                    ></iframe>
                  </div>
                </v-card>
              </div>
            </div>

            <!-- Editor -->
            <div v-else-if="item.component === 'Editor'" class="mb-3">
              <v-card class="editor-container pa-2 bg-grey-lighten-5">
                <div class="d-flex align-center mb-2">
                  <v-icon icon="mdi-format-text" class="me-2" color="primary"></v-icon>
                  <div class="text-body-1">{{ item.name?.ar }}</div>
                </div>
                <v-textarea
                  :placeholder="item.description?.ar || 'أدخل المحتوى...'"
                  :required="item.isRequired"
                  variant="outlined"
                  color="primary"
                  rows="10"
                  auto-grow
                  density="comfortable"
                  hide-details="auto"
                  bg-color="white"
                  class="editor-textarea"
                  v-model="editorContents[item.slug]"
                />
                <div class="d-flex text-caption text-grey mt-1">
                  <v-icon icon="mdi-information-outline" size="small" class="me-1"></v-icon>
                  محرر النص الغني سيظهر هنا في النسخة النهائية
                </div>
              </v-card>
            </div>

            <!-- Multi Editor -->
            <div v-else-if="item.component === 'MultiEditor'" class="mb-3">
              <v-expansion-panels variant="popout">
                <v-expansion-panel
                  v-for="(content, index) in item.contents"
                  :key="index"
                  :title="content.title?.ar || 'عنوان جديد'"
                >
                  <v-expansion-panel-text>
                    <v-textarea
                      :placeholder="'أدخل المحتوى...'"
                      variant="outlined"
                      color="primary"
                      rows="6"
                      auto-grow
                      hide-details="auto"
                      bg-color="grey-lighten-5"
                      v-model="content.content.ar"
                    />
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
              <v-btn
                class="mt-2"
                prepend-icon="mdi-plus"
                variant="text"
                size="small"
                color="primary"
                @click="addEditorCard(item)"
              >
                إضافة قسم جديد
              </v-btn>
            </div>

            <!-- Slider -->
            <div v-else-if="item.component === 'Slider'" class="mb-3">
              <v-card class="pa-3 bg-grey-lighten-5">
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
                  @change="handleImageUpload($event, item.slug)"
                />
                
                <v-row v-if="sliderImages[item.slug]?.length" class="mt-3">
                  <v-col
                    v-for="(image, index) in sliderImages[item.slug]"
                    :key="index"
                    cols="4"
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
                      @click="removeSliderImage(item.slug, index)"
                    ></v-btn>
                  </v-col>
                </v-row>
              </v-card>
            </div>

            <!-- Files -->
            <div v-else-if="item.component === 'Files'" class="mb-3">
              <v-card class="pa-3 bg-grey-lighten-5">
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
                  @change="handleFileUpload($event, item.slug)"
                />
                
                <v-list v-if="uploadedFiles[item.slug]?.length" class="mt-3 bg-white rounded-lg">
                  <v-list-item
                    v-for="(file, index) in uploadedFiles[item.slug]"
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
                        @click="removeFile(item.slug, index)"
                      ></v-btn>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card>
            </div>

            <!-- Table -->
            <div v-else-if="item.component === 'Table'" class="mb-3">
              <v-card class="pa-3 bg-grey-lighten-5">
                <div class="d-flex align-center mb-2">
                  <v-icon icon="mdi-table" class="me-2" color="primary"></v-icon>
                  <div class="text-body-1">جدول</div>
                </div>
                
                <div class="table-container">
                  <v-data-table
                    :headers="getTableHeaders(item)"
                    :items="getTableRows(item)"
                    class="bg-white"
                    density="comfortable"
                  >
                    <template v-slot:bottom>
                      <div class="d-flex justify-end pa-2">
                        <v-btn
                          size="small"
                          color="primary"
                          variant="text"
                          prepend-icon="mdi-plus"
                          @click="addTableRow(item)"
                        >
                          إضافة صف
                        </v-btn>
                      </div>
                    </template>
                  </v-data-table>
                </div>
              </v-card>
            </div>
            
            <!-- Generic Field (fallback) -->
            <v-text-field 
              v-else-if="item.component === 'Field'"
              :label="item.name?.ar || ''"
              :placeholder="item.description?.ar || ''"
              :required="item.isRequired"
              variant="outlined"
              color="primary"
              density="comfortable"
              hide-details="auto"
              class="mb-3"
              bg-color="grey-lighten-5"
            />

            <!-- Optional helper text -->
            <div v-if="item.description?.ar" class="text-caption text-grey ps-3 mb-3">
              {{ item.description.ar }}
            </div>

            <!-- Spacer between fields -->
            <v-divider class="mb-6" v-if="!isLastItem(item)" />
          </v-col>
        </v-row>
        
        <v-row class="mt-6">
          <v-col class="d-flex justify-end">
            <v-btn 
              color="grey"
              variant="text"
              class="me-4"
            >
              إلغاء
            </v-btn>
            <v-btn 
              color="primary"
              prepend-icon="mdi-content-save"
              elevation="2"
            >
              حفظ النموذج
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card>
  </v-container>
</template>

<script lang="js" setup>
import { ref, onMounted, reactive } from 'vue';
import { apiRequest } from '@/services/api';

// State management
const schema = ref([]);
const newListItem = ref('');
const listItems = reactive({});
const embedCodes = reactive({});
const youtubeIds = reactive({});
const editorContents = reactive({});
const sliderImages = reactive({});
const uploadedFiles = reactive({});
const tableData = reactive({});

async function loadPreset(){
  try {
    const data = await apiRequest('/app/content-type/by-filters?Id=21&Language=ar');
    // Parse schema from API response
    schema.value = JSON.parse(data.items[0].schema);
    console.log(schema.value);
  } catch (error) {
    console.error('Error loading schema:', error);
  }
}


// Load schema on mount
onMounted(() => {
    loadPreset()
    
  // Use the schema from the template variable for now
  
  // Initialize data structures for each component type
  schema.value.forEach(item => {
    if (item.type === 'unordered-list') {
      listItems[item.slug] = [];
    }
    if (item.type === 'embed') {
      embedCodes[item.slug] = '';
    }
    if (item.type === 'youtube-id') {
      youtubeIds[item.slug] = '';
    }
    if (item.component === 'Editor') {
      editorContents[item.slug] = '';
    }
    if (item.component === 'Slider') {
      sliderImages[item.slug] = item.images || [];
    }
    if (item.component === 'Files') {
      uploadedFiles[item.slug] = item.files || [];
    }
    if (item.component === 'Table') {
      tableData[item.slug] = {
        headers: item.header?.ar?.split(',') || [],
        rows: []
      };
    }
  });
});

// List operations
function addListItem(slug) {
  if (newListItem.value.trim()) {
    if (!listItems[slug]) {
      listItems[slug] = [];
    }
    listItems[slug].push(newListItem.value.trim());
    newListItem.value = '';
  }
}

function removeListItem(slug, index) {
  if (listItems[slug]) {
    listItems[slug].splice(index, 1);
  }
}

// Multi-editor operations
function addEditorCard(item) {
  if (!item.contents) {
    item.contents = [];
  }
  
  item.contents.push({
    id: item.contents.length + 1,
    component: "MultiEditorCard",
    title: {
      ar: "عنوان جديد",
      kr: "عنوان جديد",
      en: "New Title"
    },
    content: {
      ar: "",
      kr: "",
      en: ""
    }
  });
}

// Image slider operations
function handleImageUpload(event, slug) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Create a URL for the image preview
  const reader = new FileReader();
  reader.onload = (e) => {
    if (!sliderImages[slug]) {
      sliderImages[slug] = [];
    }
    sliderImages[slug].push({
      file: file,
      preview: e.target.result,
      name: file.name,
      size: file.size
    });
  };
  reader.readAsDataURL(file);
}

function removeSliderImage(slug, index) {
  if (sliderImages[slug]) {
    sliderImages[slug].splice(index, 1);
  }
}

// File upload operations
function handleFileUpload(event, slug) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!uploadedFiles[slug]) {
    uploadedFiles[slug] = [];
  }
  
  uploadedFiles[slug].push({
    file: file,
    name: file.name,
    size: file.size,
    type: file.type
  });
}

function removeFile(slug, index) {
  if (uploadedFiles[slug]) {
    uploadedFiles[slug].splice(index, 1);
  }
}

// Format file size nicely
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Table operations
function getTableHeaders(item) {
  if (!item.header?.ar) return [];
  
  const headerNames = item.header.ar.split(',');
  return headerNames.map((header, index) => ({
    title: header.trim(),
    key: `col${index}`,
    sortable: true
  }));
}

function getTableRows(item) {
  if (!tableData[item.slug]) {
    tableData[item.slug] = {
      headers: getTableHeaders(item).map(h => h.key),
      rows: []
    };
  }
  
  return tableData[item.slug].rows;
}

function addTableRow(item) {
  const headers = getTableHeaders(item).map(h => h.key);
  const newRow = {};
  
  headers.forEach(key => {
    newRow[key] = '';
  });
  
  if (!tableData[item.slug]) {
    tableData[item.slug] = {
      headers: headers,
      rows: []
    };
  }
  
  tableData[item.slug].rows.push(newRow);
}

// Helper to determine if this is the last item in the schema
function isLastItem(item) {
  if (!schema.value.length) return true;
  return schema.value[schema.value.length - 1].id === item.id;
}

// Map field types to human-readable Arabic labels
function getFieldTypeLabel(type) {
  switch (type) {
    case 'text':
    case 'string': return 'نص';
    case 'textarea': return 'نص متعدد الأسطر';
    case 'email': return 'بريد إلكتروني';
    case 'number': return 'رقم';
    case 'date': return 'تاريخ';
    case 'select': return 'قائمة منسدلة';
    case 'unordered-list': return 'قائمة';
    case 'video': return 'رفع فيديو';
    case 'embed': return 'تضمين فيديو';
    case 'youtube-id': return 'معرف يوتيوب';
    case 'Editor': return 'محرر نص';
    case 'MultiEditor': return 'محرر متعدد';
    case 'Slider': return 'معرض صور';
    case 'Files': return 'ملفات';
    case 'Table': return 'جدول';
    default: return 'حقل';
  }
}

// Map field types to colors for the chips
function getFieldColor(type) {
  switch (type) {
    case 'text':
    case 'string': return 'blue';
    case 'textarea': return 'indigo';
    case 'email': return 'green';
    case 'number': return 'orange';
    case 'date': return 'purple';
    case 'select': return 'teal';
    case 'unordered-list': return 'deep-purple';
    case 'video': return 'red';
    case 'embed': return 'pink';
    case 'youtube-id': return 'red-darken-2';
    case 'Editor': return 'blue-grey';
    case 'MultiEditor': return 'indigo-darken-2';
    case 'Slider': return 'deep-orange';
    case 'Files': return 'amber';
    case 'Table': return 'light-blue';
    default: return 'grey';
  }
}
</script>

<style scoped>
/* Base styles */
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

/* Embed and YouTube container styles */
.embed-container, .youtube-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
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

/* Editor styles */
.editor-container {
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 8px;
}

.editor-textarea {
  font-family: 'Roboto Mono', monospace;
}

/* List item styles */
.list-item:hover {
  background-color: #f5f5f5;
}

/* Table styles */
.table-container {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.12);
}
</style>