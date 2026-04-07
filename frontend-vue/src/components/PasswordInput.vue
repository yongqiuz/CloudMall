<template>
  <label class="field password-field">
    <span>{{ label }}</span>
    <div class="password-wrap">
      <input
        :value="modelValue"
        :type="visible ? 'text' : 'password'"
        class="input password-input"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        @input="onInput"
      />
      <button class="password-toggle" type="button" @click="visible = !visible" :aria-label="visible ? '隐藏密码' : '显示密码'">
        <svg v-if="visible" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="4" />
        </svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Zm10 4a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          <path d="M4 4l16 16" />
        </svg>
      </button>
    </div>
    <div v-if="showStrength" class="password-strength">
      <div class="password-bars">
        <span v-for="n in 4" :key="n" :class="{ active: strength.score >= n }"></span>
      </div>
      <span class="password-strength-text">{{ strengthLabel }}</span>
    </div>
  </label>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { passwordStrength } from "../utils/password";

const props = defineProps({
  modelValue: { type: String, default: "" },
  label: { type: String, default: "" },
  placeholder: { type: String, default: "" },
  autocomplete: { type: String, default: "current-password" },
  showStrength: { type: Boolean, default: false }
});

const emit = defineEmits(["update:modelValue"]);
const visible = ref(false);

const strength = computed(() => passwordStrength(props.modelValue));
const strengthLabel = computed(() => {
  if (!props.modelValue) return "\u8bf7\u8f93\u5165\u5bc6\u7801";
  if (strength.value.score < 4) return `\u5bc6\u7801\u5b89\u5168\u6027\uff1a${strength.value.label}`;
  return "\u5bc6\u7801\u5b89\u5168\u6027\uff1a\u5f3a";
});

function onInput(event) {
  emit("update:modelValue", event.target.value);
}

watch(
  () => props.modelValue,
  () => {
    if (!props.modelValue) visible.value = false;
  }
);
</script>
