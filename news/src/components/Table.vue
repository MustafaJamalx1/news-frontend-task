<template>
  <v-container dir="rtl">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="headline">News Articles</v-card-title>
          <v-data-table 
                      :loading="loading"
                      :headers="headers"
                      :items="articles.items"
                      item-value="title"
                      class="elevation-1"
                      :items-per-page="itemsPerPage"
                      :page="page"
                      @update:page="onPageChange"
                      dir="rtl"
                    >
            <template v-slot:item.images="{ item }">
              <v-img 
                :src="getImageUrl(item.images[0])" max-width="150" max-height="150" class="ma-n5" alt="something" />
           
            </template>
            <template v-slot:item.publishDate="{ item }"><span style="white-space: nowrap;">{{ item.publishDate.slice(0,10) }}</span></template>
            <template v-slot:bottom>
                <v-row class="justify-center align-center my-4">
                    <v-btn
                        icon
                        :disabled="page == 1"
                        @click="onPageChange(page - 1)"
                        class="mx-1"
                        color="primary"
                        variant="text"
                    >
                        <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                    <template v-for="p in paginationPages">
                      <v-btn
                        v-if="p == '...'"
                        class="mx-1"
                        variant="text"
                        disabled
                        min-width="36"
                      >
                        ...
                      </v-btn>
                      <v-btn
                        v-else
                        :key="p"
                        :color="p == page ? 'primary' : undefined"
                        :variant="p == page ? 'elevated' : 'text'"
                        class="mx-1"
                        @click="onPageChange(p)"
                        :disabled="loading"
                        min-width="36"
                      >
                        {{ p }}
                      </v-btn>
                    </template>
                    
                    <v-btn
                        icon
                        :disabled="page >= Math.ceil(totalCount / itemsPerPage) || loading"
                        @click="onPageChange(page + 1)"
                        class="mx-1"
                        color="primary"
                        variant="text"
                    >
                        <v-icon>mdi-chevron-left</v-icon>
                    </v-btn>
                </v-row>
            </template>
          </v-data-table>
         
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>


<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue';

interface Article {
    title: string;
    description: string;
    publishDate: string;
    images: string[];
}

const itemsPerPage = ref<number>(20);
const page = ref<number>(1);
const loading = ref<boolean>(false);
const totalCount = ref<number>(0);
const headers = [
    { title: 'العنوان', value: 'title' },
    { title: 'الوصف', value: 'description' },
    { title: 'تاريخ النشر', value: 'publishDate' },
    { title: 'الصور', value: 'images' }
];

const articles = ref<{ items: Article[]; totalCount: number }>({ items: [], totalCount: 0 });

onMounted(() => {
    fetchArticles();
});
// watch(itemsPerPage, () => {
//     page.value = 1;
//     fetchArticles();
// });

watch(page, () => {
    fetchArticles();
    console.log('Page changed to:', page.value);
});

function getImageUrl(filename: string): string {
    if (!filename) return '';
    return `https://api.theecopotamia.com/host/cms/images/md/${filename}`;
}

function onPageChange(newPage: number) {
    page.value = newPage;
}



async function fetchArticles() {
    loading.value = true;
    try {
        const response = await fetch(`https://api.theecopotamia.com/api/app/dynamic-content/publics?Language=ar&MaxResultCount=${itemsPerPage.value}&SkipCount=${(page.value - 1) * itemsPerPage.value}&Filter=News`);
        const data = await response.json();
        if (data) {
            articles.value.items = data.items;
            totalCount.value = data.totalCount;
        }
    } catch (e) {
        articles.value.items = [];
        totalCount.value = 0;
    } finally {
        loading.value = false;
    }
}

// Pagination logic for displaying page numbers
const paginationPages = computed(() => {
    const total = Math.ceil(totalCount.value / itemsPerPage.value);
    const current = page.value;
    const delta = 3;
    const pages: (number | string)[] = [];

    if (total <= 7) {
        // Show all pages if total is small
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
    } else {
        // Always show first page
        pages.push(1);

        // Show left dots if needed
        if (current - delta > 2) {
            pages.push('...');
        }

        // Show middle pages
        for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
            pages.push(i);
        }

        // Show right dots if needed
        if (current + delta < total - 1) {
            pages.push('...');
        }

        // Always show last page
        pages.push(total);
    }

    return pages;
});

</script>