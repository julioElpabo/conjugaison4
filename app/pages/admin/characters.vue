<script setup lang="ts">
const route = useRoute()
const query = { ...route.query }
if (query.character && !query.caractere) query.caractere = query.character
delete query.character
await navigateTo({ path: '/admin/caracteres', query }, { redirectCode: 301, replace: true })
</script>
