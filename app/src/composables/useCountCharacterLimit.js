import { ref, watchEffect } from "vue";

/* This Composable returns a reactive Character Count-Down based on a given Text and Limit */
export const useCountCharacterLimit = (text, limit) => {
    const characterLimit = ref(0);
    watchEffect(() => characterLimit.value = limit - text.value?.length);

    return characterLimit;
}
