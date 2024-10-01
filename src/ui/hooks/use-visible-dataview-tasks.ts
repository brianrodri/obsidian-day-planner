import { groupBy } from "lodash/fp";
import type { Moment } from "moment";
import { STask } from "obsidian-dataview";
import { derived, type Readable } from "svelte/store";

import { settings } from "../../global-store/settings";
import type { TasksForDay } from "../../task-types";
import { getScheduledDay, isCarryOver } from "../../util/dataview";
import { mapToTasksForDay } from "../../util/get-tasks-for-day";
import { getDayKey, getEmptyRecordsForDay } from "../../util/tasks-utils";

export function useVisibleDataviewTasks(
  dataviewTasks: Readable<STask[]>,
  visibleDays: Readable<Moment[]>,
) {
  return derived(
    [visibleDays, dataviewTasks, settings],
    ([$visibleDays, $dataviewTasks, $settings]) => {
      const dayToSTasks = groupBy(getScheduledDay, $dataviewTasks);

      if ($settings.showPastScheduledTasks) {
        const sortedDays = Object.keys(dayToSTasks).sort();

        for (let i = 1; i < sortedDays.length; ++i) {
          const day = sortedDays[i];
          const dayBefore = sortedDays[i - 1];

          dayToSTasks[day] = [
            ...dayToSTasks[day],
            ...dayToSTasks[dayBefore].filter((t) => isCarryOver(t, day)),
          ];
        }
      }

      return $visibleDays.reduce<Record<string, TasksForDay>>((result, day) => {
        const key = getDayKey(day);
        const sTasksForDay = dayToSTasks[key];

        if (sTasksForDay) {
          const { errors, ...tasks } = mapToTasksForDay(
            day,
            sTasksForDay,
            $settings,
          );

          errors.forEach(console.log);

          result[key] = tasks;
        } else {
          result[key] = getEmptyRecordsForDay();
        }

        return result;
      }, {});
    },
  );
}
