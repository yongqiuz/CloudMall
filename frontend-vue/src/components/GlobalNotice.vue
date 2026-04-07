<template>
  <Teleport to="body">
    <Transition name="notice-fade">
      <div v-if="noticeState.visible" class="notice-backdrop" @click.self="hideNotice">
        <div class="notice-card page-card">
          <div class="notice-head">
            <strong>{{ noticeState.title }}</strong>
            <button class="notice-close" @click="hideNotice">×</button>
          </div>
          <p class="notice-body" :class="`type-${noticeState.type}`">{{ noticeState.message }}</p>
          <div class="row notice-actions">
            <button class="button" @click="hideNotice">知道了</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { hideNotice, noticeState } from "../utils/notice";
</script>
