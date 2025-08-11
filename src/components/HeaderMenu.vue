<template>
  <div class="relative" @keydown.escape="open=false">
    <button
      class="px-3 py-2 rounded border hover:bg-gray-100"
      @click="toggle"
      aria-haspopup="menu"
      :aria-expanded="open ? 'true' : 'false'"
      ref="btnRef"
    >
      ☰ Menu
    </button>

    <div
      v-if="open"
      class="absolute right-0 mt-2 w-44 bg-white border rounded shadow z-10"
      ref="menuRef"
    >
      <button
        v-for="item in items"
        :key="item.label"
        class="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
        :class="item.current ? 'font-semibold' : ''"
        @click="handleClick(item)"
      >
        {{ item.label }}
      </button>

      <div v-if="showDivider" class="h-px bg-gray-200 my-1"></div>

      <button
        v-if="showLogout"
        class="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
        @click="$emit('logout')"
      >
        Logout
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
const props = defineProps({
  items: { type: Array, required: true }, // [{ label, to, current }]
  showDivider: { type: Boolean, default: true },
  showLogout: { type: Boolean, default: true },
})
const emit = defineEmits(['navigate', 'logout'])

const open = ref(false)
const btnRef = ref(null)
const menuRef = ref(null)

function toggle() { open.value = !open.value }
function close() { open.value = false }

function handleClick(item) {
  emit('navigate', item)
  close()
}

function onClickOutside(e) {
  if (!open.value) return
  const targets = [btnRef.value, menuRef.value]
  if (!targets.some(el => el && el.contains(e.target))) close()
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>
