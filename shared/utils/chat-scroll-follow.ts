export const CHAT_SCROLL_BOTTOM_THRESHOLD_PX = 48

export function chatScrollDistanceFromBottom(metrics: {
  scrollHeight: number
  scrollTop: number
  clientHeight: number
}) {
  return Math.max(0, metrics.scrollHeight - metrics.scrollTop - metrics.clientHeight)
}

export function shouldFollowChatAfterUserScroll(metrics: {
  scrollHeight: number
  scrollTop: number
  clientHeight: number
}) {
  return chatScrollDistanceFromBottom(metrics) <= CHAT_SCROLL_BOTTOM_THRESHOLD_PX
}

export function shouldFollowChatAfterLearnerMessage() {
  return true
}
