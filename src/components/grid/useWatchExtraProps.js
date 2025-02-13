import { watch, computed } from 'vue';
export default function useWatchExtraProps(props, watcher, callback) {
  const watcherValue = computed(() => {
    return watcher.reduce((acc, curr) => ({
      ...acc,
      [curr]: props[curr],
    }), watcher);
  });

  watch(
    () => watcherValue.value,
    () => {
      callback();
    },
  );
}
