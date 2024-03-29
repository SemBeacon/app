import { DirectiveBinding } from 'vue';

export default {
    async mounted(el: HTMLIonInputElement, binding: DirectiveBinding) {
        const input = await el.getInputElement();
        if (input) {
            input.setAttribute('list', binding.value);
        }
    },
};
