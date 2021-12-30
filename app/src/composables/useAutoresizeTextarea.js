import { watchEffect } from "vue";

/* This Composable makes the `content` Field automatically resize itself based on its Content */
/* That Way the Field contains only one Line of Text to Start with but extends as the User Types */
export const useAutoresizeTextarea = (element) => {
    const resizeTextarea = () => {
        element.value.style.height = "auto";
        element.value.style.height = element.value.scrollHeight + "px";
    }

    watchEffect(onInvalidate => {
        if (! element.value) {
            return;
        }
        resizeTextarea();
        element.value.addEventListener("input", resizeTextarea);
        onInvalidate(() => element.value?.removeEventListener("input", resizeTextarea));
    });
}
