<script setup lang="ts">
const { localePath } = useLanguagePreferences()

await navigateTo(localePath('/admin/charts'), { replace: true })
</script>
