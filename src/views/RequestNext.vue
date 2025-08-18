<template>
  <div class="max-w-2xl mx-auto p-6">
    <h2 class="text-2xl font-semibold mb-2">Request Next Pill</h2>
    <p class="text-gray-600 mb-4">
      We’ll prefill your consultation. Please review and submit.
    </p>

    <div class="bg-white rounded shadow p-4">
      <button
        @click="createDraft"
        :disabled="loading"
        class="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {{ loading ? "Preparing…" : "Create Draft" }}
      </button>
      <p v-if="msg" class="text-green-700 mt-3">{{ msg }}</p>
      <p v-if="err" class="text-red-600 mt-3">{{ err }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { supabase } from "../supabase";

const loading = ref(false),
  msg = ref(""),
  err = ref("");

async function createDraft() {
  try {
    loading.value = true;
    err.value = "";

    // Call your RPC
    const { data, error } = await supabase.rpc("create_draft_from_profile");
    if (error) throw error;

    // Get the draft responseId
    const rid = Array.isArray(data)
      ? data[0]?.responseid || data[0]?.responseId
      : data?.responseid || data?.responseId;

    msg.value = `Draft created: ${rid}`;

    // Get the current auth session
    const { data: sess } = await supabase.auth.getSession();
    const at = sess?.session?.access_token;
    const rt = sess?.session?.refresh_token;

    // Redirect to form.pilldirect with the draft id and tokens
    window.location.href = `https://form.pilldirect.co.uk/?draft=${encodeURIComponent(
      rid
    )}#access_token=${encodeURIComponent(at || "")}&refresh_token=${encodeURIComponent(
      rt || ""
    )}`;
  } catch (e) {
    err.value = e.message;
  } finally {
    loading.value = false;
  }
}
</script>
