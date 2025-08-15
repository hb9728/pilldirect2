<template>
  <div class="max-w-3xl mx-auto p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-semibold">My Account</h2>
      <div class="flex gap-2">
        <router-link to="/me/submissions" class="px-3 py-2 border rounded">My Submissions</router-link>
        <button @click="logout" class="px-3 py-2 border rounded text-red-600">Logout</button>
      </div>
    </div>

    <form @submit.prevent="save" class="bg-white rounded shadow p-4 space-y-6">
      <section>
        <h3 class="font-semibold mb-2">Contact</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input v-model="p.firstName" placeholder="First name" class="border rounded px-3 py-2" />
          <input v-model="p.lastName" placeholder="Last name" class="border rounded px-3 py-2" />
          <input v-model="p.phone" placeholder="Phone" class="border rounded px-3 py-2" />
          <input v-model="p.dob" type="date" class="border rounded px-3 py-2" />
        </div>
      </section>

      <section>
        <h3 class="font-semibold mb-2">Delivery Address</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input v-model="p.address1" placeholder="Address line 1" class="border rounded px-3 py-2" />
          <input v-model="p.address2" placeholder="Address line 2" class="border rounded px-3 py-2" />
          <input v-model="p.city" placeholder="City" class="border rounded px-3 py-2" />
          <input v-model="p.postcode" placeholder="Postcode" class="border rounded px-3 py-2" />
        </div>
      </section>

      <section>
        <h3 class="font-semibold mb-2">GP Registration Address</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input v-model="p.gp_address1" placeholder="GP Address line 1" class="border rounded px-3 py-2" />
          <input v-model="p.gp_address2" placeholder="GP Address line 2" class="border rounded px-3 py-2" />
          <input v-model="p.gp_city" placeholder="GP City" class="border rounded px-3 py-2" />
          <input v-model="p.gp_postcode" placeholder="GP Postcode" class="border rounded px-3 py-2" />
        </div>
      </section>

      <section>
        <h3 class="font-semibold mb-2">Preferences</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input v-model="prefs.pillChoiceDefault" placeholder="Preferred pill brand (optional)" class="border rounded px-3 py-2" />
          <input v-model="prefs.contactDay" placeholder="Preferred contact day (Mon–Fri)" class="border rounded px-3 py-2" />
          <input v-model="prefs.contactTime" placeholder="Preferred contact time (e.g. 14:30)" class="border rounded px-3 py-2" />
        </div>
      </section>

      <div class="flex gap-3">
        <button :disabled="saving" class="bg-blue-600 text-white px-4 py-2 rounded">
          {{ saving ? 'Saving…' : 'Save changes' }}
        </button>
        <router-link to="/request-next" class="px-4 py-2 border rounded">Request Next Pill</router-link>
      </div>

      <p v-if="msg" class="text-green-700">{{ msg }}</p>
      <p v-if="err" class="text-red-600">{{ err }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
const router = useRouter()

const p = ref({}), prefs = ref({}), saving = ref(false), msg = ref(''), err = ref('')

onMounted(load)
async function load() {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
  if (error && error.code !== 'PGRST116') throw error
  p.value = data ?? {}
  prefs.value = (data?.preferences ?? {})
}
async function save() {
  try {
    saving.value = true; err.value = ''
    p.value.preferences = prefs.value
    const { data: { user } } = await supabase.auth.getUser()
    const payload = { ...p.value, user_id: user.id, email: p.value.email || user.email }
    const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'user_id' })
    if (error) throw error
    msg.value = 'Saved.'
  } catch (e) { err.value = e.message } finally { saving.value = false }
}
async function logout() { await supabase.auth.signOut(); router.replace('/login') }
</script>
