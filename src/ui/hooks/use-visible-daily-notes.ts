import type { Moment } from "moment";
import { getAllDailyNotes, getDailyNote } from "obsidian-daily-notes-interface";
import type { Readable } from "svelte/store";
import { derived } from "svelte/store";

import type { DayPlannerSettings } from "../../settings";
import { getDayKey } from "../../util/tasks-utils";
import { withNotice } from "../../util/with-notice";

const moment = window.moment;
const getAllDailyNotesSafely = withNotice(getAllDailyNotes, {});

/**
 *
 * @param layoutReady used as a proxy that lets us know when the vault is ready to be queried for daily notes
 * @param debouncedTaskUpdateTrigger lets us know when some files changed, and we need to re-run
 * @param visibleDays
 */
export function useVisibleDailyNotes(
  layoutReady: Readable<boolean>,
  debouncedTaskUpdateTrigger: Readable<unknown>,
  visibleDays: Readable<Moment[]>,
  settings: Readable<DayPlannerSettings>,
) {
  return derived(
    [layoutReady, visibleDays, settings, debouncedTaskUpdateTrigger],
    ([$layoutReady, $visibleDays, $settings]) => {
      if (!$layoutReady) {
        return [];
      }

      const allDailyNotes = getAllDailyNotesSafely();

      if ($settings.showPastScheduledTasks) {
        const maxKey = getDayKey(moment.max($visibleDays));

        return Object.keys(allDailyNotes)
          .filter((key) => key <= maxKey)
          .map((key) => allDailyNotes[key])
          .filter(Boolean);
      }

      return $visibleDays
        .map((day) => getDailyNote(day, allDailyNotes))
        .filter(Boolean);
    },
  );
}
