import { computed } from 'vue';

/**
 * Computed modelValue
 *
 * @see: https://vanoneang.github.io/article/v-model-in-vue3.html#turn-it-into-a-composable
 */
export function useLocalValue(props: any, emit: any) {
  return computed({
    get: () => {
      return props.modelValue
    },
    set: (value) => {
      emit(`update:modelValue`, value);
    },
  });
}

export function useFieldClass(props: any) {
  return computed(() =>  props.className || '');
}
