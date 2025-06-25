<template>
  <v-container>
    <div class="content-type-container">
      <h2>Content Type Schema</h2>
      
      <!-- Display parsed data -->
     
      
      <!-- Raw data display -->
      
            <pre>{{ JSON.stringify(parsedData, null, 2) }}</pre>
     
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

// Define the interface for better type safety
interface SchemaItem {
  id: number;
  component?: string;
  slug: string;
  name?: {
    ar?: string;
    kr?: string;
    en?: string;
  };
  description?: {
    ar?: string;
    kr?: string;
    en?: string;
  };
  type?: string;
  colsNumber?: string;
  isRequired?: boolean;
  value?: any;
  images?: any[];
  files?: any[];
  contents?: any[];
  header?: {
    ar?: string;
    kr?: string;
    en?: string;
  };
  rows?: {
    ar?: string;
    kr?: string;
    en?: string;
  };
}

const parsedData = ref<SchemaItem[]>([]);
const rawJsonString = ref('');

function parsePresets() {
  try {
    // The original JSON string (cleaned up for readability)
    const jsonString = `[
      {
        "name": {"ar": "نص", "kr": "نص", "en": "Text"},
        "description": {"ar": "تفاصيل", "kr": "تفاصيل", "en": "تفاصيل"},
        "type": "string",
        "colsNumber": "6",
        "isRequired": false,
        "value": "",
        "slug": "tcQ6ywM$sEnRg6Y",
        "id": 2,
        "component": "Field"
      },
      {
        "name": {"ar": "تاريخ", "kr": "تاريخ", "en": "Date"},
        "description": {},
        "type": "date",
        "colsNumber": "6",
        "isRequired": false,
        "value": "",
        "slug": "a6xa4U43cn2NmvI",
        "id": 3,
        "component": "Field"
      },
      {
        "name": {"ar": "قائمة", "kr": "قائمة", "en": "List"},
        "description": {},
        "type": "unordered-list",
        "colsNumber": "12",
        "isRequired": false,
        "value": "",
        "slug": "abttBXJC651rX8J",
        "id": 4,
        "component": "Field"
      },
      {
        "name": {"ar": "رفع فديو", "kr": "فديو", "en": "upload video"},
        "description": {},
        "type": "video",
        "colsNumber": "12",
        "isRequired": false,
        "value": "",
        "slug": "Ssd0$J-njnkD8ej",
        "id": 5,
        "component": "Field"
      },
      {
        "name": {"ar": "تضمين فديو", "kr": "تضمين فديو", "en": "imp video"},
        "description": {"ar": "تضمين فديو", "kr": "تضمين فديو", "en": "imp video"},
        "type": "embed",
        "colsNumber": "12",
        "isRequired": false,
        "value": "",
        "slug": "TmBkBlyKezkvll1",
        "id": 6,
        "component": "Field"
      },
      {
        "name": {"ar": "معرف يوتيوب", "kr": "معرف يوتيوب", "en": "Youtube id"},
        "description": {"ar": "معرف يوتيوب", "kr": "معرف يوتيوب", "en": "Youtube id"},
        "type": "youtube-id",
        "colsNumber": "12",
        "isRequired": false,
        "value": "",
        "slug": "t!qOzEfr86_I63c",
        "id": 7,
        "component": "Field"
      },
      {
        "id": 8,
        "component": "Editor",
        "slug": "LclzU_0p9gqZT_j",
        "ar": "",
        "kr": "",
        "en": "",
        "name": {"ar": "محرر نص", "kr": "محرر نص", "en": "Editor"},
        "description": {"ar": "محرر نص", "kr": "محرر نص", "en": "Editor"}
      },
      {
        "id": 9,
        "component": "MultiEditor",
        "slug": "GrYSmKm!Ao4jPdb",
        "contents": [
          {
            "id": 1,
            "component": "MultiEditorCard",
            "title": {"ar": "محرر متعدد", "kr": "محرر متعدد", "en": "Multi editor"},
            "content": {"ar": "", "kr": "", "en": ""}
          }
        ]
      },
      {
        "id": 10,
        "component": "Slider",
        "slug": "rEy1qn",
        "name": {"ar": "سلايدر", "kr": "سلايدر", "en": "sldier"},
        "images": []
      },
      {
        "id": 11,
        "component": "Files",
        "slug": "Q8B9dFyL67MxPl2",
        "name": {"ar": "رفع فايلات", "kr": "رفع فايلات", "en": "رفع فايلات"},
        "files": []
      },
      {
        "id": 12,
        "component": "Table",
        "slug": "hFotUAri@0bwVP8",
        "header": {"ar": "العمود الاول,العمود الثاني,العمود الثالث", "kr": "العمود الاول,العمود الثاني", "en": "first col,2 col,col3"},
        "rows": {"ar": "", "kr": "", "en": ""}
      }
    ]`;

    // Parse the JSON
    parsedData.value = JSON.parse(jsonString);
    rawJsonString.value = jsonString;
    
    console.log('Parsed data:', parsedData.value);
    
  } catch (error) {
    console.error('Error parsing JSON:', error);
    parsedData.value = [];
  }
}

// Alternative method if you need to work with the original escaped string
function parseOriginalString() {
  try {
    const originalString = `"[{\"name\":{\"ar\":\"نص\",\"kr\":\"نص\",\"en\":\"Text\"},\"description\":{\"ar\":\"تفاصيل\",\"kr\":\"تفاصيل\",\"en\":\"تفاصيل\"},\"type\":\"string\",\"colsNumber\":\"6\",\"isRequired\":false,\"value\":\"\",\"slug\":\"tcQ6ywM$sEnRg6Y\",\"id\":2,\"component\":\"Field\"},{\"name\":{\"ar\":\"تاريخ\",\"kr\":\"تاريخ\",\"en\":\"Date\"},\"description\":{},\"type\":\"date\",\"colsNumber\":\"6\",\"isRequired\":false,\"value\":\"\",\"slug\":\"a6xa4U43cn2NmvI\",\"id\":3,\"component\":\"Field\"},{\"name\":{\"ar\":\"قائمة\",\"kr\":\"قائمة\",\"en\":\"List\"},\"description\":{},\"type\":\"unordered-list\",\"colsNumber\":\"12\",\"isRequired\":false,\"value\":\"\",\"slug\":\"abttBXJC651rX8J\",\"id\":4,\"component\":\"Field\"},{\"name\":{\"ar\":\"رفع فديو\",\"kr\":\"فديو\",\"en\":\"upload video\"},\"description\":{},\"type\":\"video\",\"colsNumber\":\"12\",\"isRequired\":false,\"value\":\"\",\"slug\":\"Ssd0$J-njnkD8ej\",\"id\":5,\"component\":\"Field\"},{\"name\":{\"ar\":\"تضمين فديو\",\"kr\":\"تضمين فديو\",\"en\":\"imp video\"},\"description\":{\"ar\":\"تضمين فديو\",\"kr\":\"تضمين فديو\",\"en\":\"imp video\"},\"type\":\"embed\",\"colsNumber\":\"12\",\"isRequired\":false,\"value\":\"\",\"slug\":\"TmBkBlyKezkvll1\",\"id\":6,\"component\":\"Field\"},{\"name\":{\"ar\":\"معرف يوتيوب\",\"kr\":\"معرف يوتيوب\",\"en\":\"Youtube id\"},\"description\":{\"ar\":\"معرف يوتيوب\",\"kr\":\"معرف يوتيوب\",\"en\":\"Youtube id\"},\"type\":\"youtube-id\",\"colsNumber\":\"12\",\"isRequired\":false,\"value\":\"\",\"slug\":\"t!qOzEfr86_I63c\",\"id\":7,\"component\":\"Field\"},{\"id\":8,\"component\":\"Editor\",\"slug\":\"LclzU_0p9gqZT_j\",\"ar\":\"\",\"kr\":\"\",\"en\":\"\",\"name\":{\"ar\":\"محرر نص\",\"kr\":\"محرر نص\",\"en\":\"Editor\"},\"description\":{\"ar\":\"محرر نص\",\"kr\":\"محرر نص\",\"en\":\"Editor\"}},{\"id\":9,\"component\":\"MultiEditor\",\"slug\":\"GrYSmKm!Ao4jPdb\",\"contents\":[{\"id\":1,\"component\":\"MultiEditorCard\",\"title\":{\"ar\":\"محرر متعدد\",\"kr\":\"محرر متعدد\",\"en\":\"Multi editor\"},\"content\":{\"ar\":\"\",\"kr\":\"\",\"en\":\"\"}}]},{\"id\":10,\"component\":\"Slider\",\"slug\":\"rEy1qn\",\"name\":{\"ar\":\"سلايدر\",\"kr\":\"سلايدر\",\"en\":\"sldier\"},\"images\":[]},{\"id\":11,\"component\":\"Files\",\"slug\":\"Q8B9dFyL67MxPl2\",\"name\":{\"ar\":\"رفع فايلات\",\"kr\":\"رفع فايلات\",\"en\":\"رفع فايلات\"},\"files\":[]},{\"id\":12,\"component\":\"Table\",\"slug\":\"hFotUAri@0bwVP8\",\"header\":{\"ar\":\"العمود الاول,العمود الثاني,العمود الثالث\",\"kr\":\"العمود الاول,العمود الثاني\",\"en\":\"first col,2 col,col3\"},\"rows\":{\"ar\":\"\",\"kr\":\"\",\"en\":\"\"}}]"`;
    
    // First parse removes the outer quotes and unescapes
    const unescapedString = JSON.parse(originalString);
    
    // Second parse converts the JSON string to object
    parsedData.value = JSON.parse(unescapedString);
    
    console.log('Parsed data from original string:', parsedData.value);
    
  } catch (error) {
    console.error('Error parsing original JSON:', error);
    parsedData.value = [];
  }
}

onMounted(() => {
  parsePresets();
  // or use parseOriginalString() if you need to work with the escaped version
});
</script>

<style scoped>
.content-type-container {
  padding: 1rem;
}

pre {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
</style>
