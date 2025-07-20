<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">
      <span class="bg-blue-600 text-white px-2 py-1 rounded">PillDirect.co.uk</span>
      NHS Pharmacy Contraceptive Questionnaire
    </h1>

    <p class="mb-4">This online form will guide you through the consultation process for starting or renewing your contraceptive pill.</p>

    <h2 class="text-lg font-semibold mb-2">Disclaimer</h2>
    <p class="mb-4">
      <strong>Before We Get Started</strong> we would like to give you some information on the combined contraceptive and mini pills (progesterone-only pill) we offer.
    </p>

    <p class="mb-4">
      <strong>Combined Contraceptives</strong> are available as a pill, patch, or ring containing two hormones, oestrogen and progestogen. They can be used in different ways if you want to control your monthly bleeds, giving you the option of skipping them. Although rare, they can increase the risk of blood clots. Microgynon, Rigevidon, and Ovranette all contain the same active ingredients. They carry the lowest risk of blood clots when compared to other combined contraception. They also carry a small risk of developing breast and cervical cancer, which reduces on stopping combined contraception. They do reduce the risk of ovarian, womb, and colon cancers. Combined contraceptives need annual blood pressure and weight checks to make sure they are still safe for you.
    </p>

    <p class="mb-4">
      <strong>The Mini Pill</strong> is taken at the same time each day without a break. It may improve painful periods and premenstrual symptoms, but your periods may be lighter, more frequent, or stop altogether, and you may get spotting between periods. It is a safe alternative to combined contraception, particularly when you are not suitable for them. The mini pill is safe to use when breastfeeding and does not need annual blood pressure or weight checks.
    </p>

    <p class="mb-6">
      <strong>Effectiveness:</strong> If used perfectly, both types are 99% effective, but in reality most women do not always take it exactly as instructed, so practically, they are seen to be about 91% effective. If you want the most effective form of contraception, you can choose a long-acting reversible contraceptive (LARC) such as the implant, IUDs, or hormonal injections.
    </p>

    <div class="mt-6 flex justify-end">
      <template>
  <button
    @click="$emit('next')"
    class="bg-gradient-to-b from-gray-100 to-gray-300 border border-gray-400 rounded-lg px-6 py-3 text-gray-800 font-semibold shadow-[inset_0_1px_0_#fff,0_3px_5px_rgba(0,0,0,0.3)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] active:translate-y-[2px] transition-all duration-150 ease-in-out hover:animate-pulse-smooth"
  >
    Next
  </button>
</template>

<style scoped>
@keyframes pulse-smooth {
  0% {
    transform: scale(1);
    box-shadow: inset 0 1px 0 #fff, 0 3px 5px rgba(0, 0, 0, 0.3);
  }
  50% {
    transform: scale(1.015);
    box-shadow: inset 0 1px 0 #fff, 0 4px 7px rgba(0, 0, 0, 0.35);
  }
  100% {
    transform: scale(1);
    box-shadow: inset 0 1px 0 #fff, 0 3px 5px rgba(0, 0, 0, 0.3);
  }
}

.hover\:animate-pulse-smooth:hover {
  animation: pulse-smooth 1.8s ease-in-out infinite;
}
</style>

    </div>
  </div>
</template>
