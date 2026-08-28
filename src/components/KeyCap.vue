<script setup lang="ts">
defineProps<{
  keys?: string[]
  k?: string
  size?: 'sm' | 'md'
}>()
</script>

<template>
  <span class="keycap" :class="{ 'keycap-sm': size === 'sm' }">
    <template v-if="k">
      <kbd>{{ k }}</kbd>
    </template>
    <template v-else-if="keys && keys.length">
      <kbd v-for="key in keys" :key="key">{{ key }}</kbd>
    </template>
    <slot v-else />
  </span>
</template>

<style scoped>
.keycap {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  vertical-align: middle;
}

kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.4rem;
  height: 1.4rem;
  padding: 0 0.35rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 500;
  line-height: 1;
  color: var(--text-muted);
  background-color: var(--bg-surface-2);
  border: 1px solid var(--border-color);
  border-bottom-width: 2px;
  border-radius: 4px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
  user-select: none;
  white-space: nowrap;
}

.keycap-sm kbd {
  min-width: 1.15rem;
  height: 1.15rem;
  padding: 0 0.25rem;
  font-size: 0.65rem;
  border-bottom-width: 1.5px;
}
</style>
