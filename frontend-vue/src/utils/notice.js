import { reactive } from "vue";

export const noticeState = reactive({
  visible: false,
  title: "\u63d0\u793a",
  message: "",
  type: "error"
});

export function showNotice(message, type = "error", title = "\u63d0\u793a") {
  noticeState.visible = true;
  noticeState.title = title;
  noticeState.message = String(message || "");
  noticeState.type = type;
}

export function hideNotice() {
  noticeState.visible = false;
}
