<template>
HEY HEY 
</template>


<script lang="js" setup>
import { onMounted } from 'vue';
onMounted(() => {
    loadPreset();
});
async function loadPreset(){
    const res = await fetch('http://164.92.187.207:5005/api/app/content-type/by-filters?Id=7&Language=ar');
    const data = await res.json();
    // Format the schema array for easier viewing
    const schema = JSON.parse(data.items[0].schema);
    const formatted = schema.map(item=>item.type)
    console.log(formatted);
}





</script>