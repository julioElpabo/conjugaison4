<script setup lang="ts">
const route = useRoute()
const { localePath } = useLanguagePreferences()
const query = { ...route.query }
if (query.character && !query.caractere) query.caractere = query.character
delete query.character
await navigateTo({ path: localePath('/admin/caracteres'), query }, { redirectCode: 301, replace: true })
</script>
