
<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Welcome to PillDirect</h2>
    <p class="mb-4">This online form will guide you through the consultation process for starting or renewing your contraceptive pill.</p>
    <button @click="$emit('next')" class="btn">Start</button>
  </div>
</template>
