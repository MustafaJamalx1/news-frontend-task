<template>
<v-container>
    <v-row>
        <v-col cols="12">
        <v-card>
            <v-card-title class="headline">News Articles</v-card-title>
            
          <v-data-table
            :headers="headers"
            :items="articles.items"
            item-value="title"
            class="elevation-1">
        </v-data-table>
        </v-card>
        </v-col>
    </v-row>
</v-container>

</template>


<script lang="ts" setup>
import { ref,onMounted } from 'vue';
const headers = [
    { text: 'Title', value: 'title' }
];
onMounted(() => {
    fetchArticles();
});

const articles = ref({ items: [] });
async function fetchArticles() {
    const response = await fetch('https://api.theecopotamia.com/api/app/dynamic-content/publics?Language=ar');
    const data = await response.json();
    articles.value.items = data.items;
    console.log(articles.value.items);
}
</script>