import { DataArray, STask } from "obsidian-dataview";
import { derived, type Readable } from "svelte/store";

import type { DayPlannerSettings } from "../../settings";

interface UseDataviewTasksProps {
  listsFromVisibleDailyNotes: Readable<DataArray<STask>>;
  tasksFromExtraSources: Readable<DataArray<STask>>;
  settingsStore: Readable<DayPlannerSettings>;
}

export function useDataviewTasks({
  listsFromVisibleDailyNotes,
  tasksFromExtraSources,
  settingsStore,
}: UseDataviewTasksProps) {
  return derived(
    [listsFromVisibleDailyNotes, tasksFromExtraSources, settingsStore],
    ([$listsFromVisibleDailyNotes, $tasksFromExtraSources, $settingsStore]) => {
      const allTasks = [
        ...$listsFromVisibleDailyNotes,
        ...$tasksFromExtraSources,
      ];

      return allTasks.filter((sTask: STask) => {
        const { showCheckedTasks, showCompletedTasks } = $settingsStore;

        if (showCheckedTasks && showCompletedTasks) {
          return true;
        } else if (showCompletedTasks) {
          return sTask.completed || !sTask.checked;
        } else if (showCheckedTasks) {
          return !sTask.completed;
        } else {
          return !sTask.checked;
        }
      });
    },
  );
}
