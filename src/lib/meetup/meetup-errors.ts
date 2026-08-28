import { getApiErrorMessage } from "@/lib/api-error";

/**
 * The meetup endpoints reject with precise English reasons ("Participant is
 * outside the selected meetup radius"). Showing those raw leaves people stuck,
 * so each known reason is matched on a stable fragment and rewritten into an
 * instruction the room can act on.
 */
const MEETUP_ERROR_RULES: ReadonlyArray<{
  match: RegExp;
  message: string;
}> = [
  {
    match: /outside the selected meetup radius/i,
    message:
      "ទីតាំងរបស់អ្នកនៅឆ្ងាយពីចំណុចណាត់ជួប។ សូមធ្វើបច្ចុប្បន្នភាពទីតាំង ឬសុំឲ្យម្ចាស់ផ្ទះពង្រីករង្វង់ស្វែងរក។",
  },
  {
    match: /location must be shared before voting/i,
    message: "សូមចែករំលែកទីតាំងរបស់អ្នកជាមុនសិន មុននឹងបោះឆ្នោត។",
  },
  {
    match: /area must be resolved before voting/i,
    message:
      "តំបន់របស់អ្នកមិនទាន់ត្រូវបានបញ្ជាក់ទេ។ សូមបំពេញតំបន់ ក្រុង និងខេត្តរបស់អ្នក។",
  },
  {
    match: /already voted for this food/i,
    message: "អ្នកបានបោះឆ្នោតឲ្យម្ហូបនេះរួចហើយ។",
  },
  {
    match: /nickname is already taken/i,
    message: "ឈ្មោះហៅក្រៅនេះមានគេប្រើរួចហើយ។ សូមជ្រើសរើសឈ្មោះផ្សេង។",
  },
  {
    /* Friends-only room and the viewer is not an accepted friend of the host. */
    match: /only accepted friends can join/i,
    message:
      "ការណាត់ជួបនេះសម្រាប់តែមិត្តភក្តិ FoodHub ប៉ុណ្ណោះ។ សូមផ្ញើ ឬទទួលយកសំណើមិត្តភក្តិជាមួយម្ចាស់ផ្ទះជាមុនសិន រួចបើកតំណនេះម្ដងទៀត។",
  },
  {
    match: /friend meetups require a foodhub account/i,
    message: "សូមចូលគណនី FoodHub របស់អ្នកជាមុនសិន ដើម្បីចូលរួមការណាត់ជួបនេះ។",
  },
  {
    match: /friend meetups require an active foodhub profile/i,
    message:
      "គណនីរបស់អ្នកមិនទាន់មានប្រវត្តិរូបសកម្មទេ។ សូមបង្កើតប្រវត្តិរូបជាមុនសិន។",
  },
  {
    match: /you can only join with your own active profile/i,
    message: "អ្នកអាចចូលរួមបានតែជាមួយប្រវត្តិរូបផ្ទាល់ខ្លួនរបស់អ្នកប៉ុណ្ណោះ។",
  },
  {
    match: /pinned meetups require the participant current location/i,
    message: "ការណាត់ជួបតាមចំណុចត្រូវការទីតាំងបច្ចុប្បន្នរបស់អ្នក។ សូមអនុញ្ញាតទីតាំង។",
  },
  {
    match: /maximum participant limit/i,
    message: "ការណាត់ជួបនេះមានអ្នកចូលរួមពេញហើយ។",
  },
  {
    match: /no longer accepting votes/i,
    message: "ការណាត់ជួបនេះមិនទទួលសំឡេងបោះឆ្នោតទៀតទេ។",
  },
  {
    match: /only active participants can vote/i,
    message: "មានតែអ្នកចូលរួមសកម្មទេដែលអាចបោះឆ្នោតបាន។",
  },
  {
    match: /does not belong to this meetup/i,
    message: "អ្នកមិនមែនជាសមាជិកនៃការណាត់ជួបនេះទេ។",
  },
  {
    match: /result is not ready yet/i,
    message: "លទ្ធផលមិនទាន់រួចរាល់។ សូមរង់ចាំម្ចាស់ផ្ទះបញ្ចប់ការបោះឆ្នោត។",
  },
  {
    match: /food not found/i,
    message: "ម្ហូបនេះលែងមានក្នុងបញ្ជីហើយ។ សូមផ្ទុកបញ្ជីម្ហូបឡើងវិញ។",
  },
  {
    match: /meetup not found/i,
    message: "រកមិនឃើញការណាត់ជួប។ តំណអាចផុតកំណត់ ឬត្រូវបានលុប។",
  },
  {
    match: /participant not found/i,
    message: "រកមិនឃើញអ្នកចូលរួម។ សូមចូលរួមការណាត់ជួបម្ដងទៀត។",
  },
  {
    match: /either meetupuuid or sharetoken/i,
    message: "តំណអញ្ជើញមិនត្រឹមត្រូវទេ។",
  },
  {
    /* The recommendation session hit a database constraint (HTTP 409). */
    match: /conflicts with existing data|data_integrity_violation/i,
    message:
      "FoodHub មិនអាចបង្កើតបញ្ជីម្ហូបបានទេ ដោយសារទិន្នន័យជាន់គ្នា។ សូមចុច ផ្ទុកឡើងវិញ។",
  },
  {
    /* A room profile the viewer neither owns nor is friends with. */
    match: /does not own this profile/i,
    message:
      "អ្នកមិនអាចប្រើប្រវត្តិរូបរបស់សមាជិកផ្សេងបានទេ។ FoodHub នឹងប្រើប្រវត្តិរូបរបស់អ្នកជំនួស។",
  },
];

/**
 * Turns a meetup API failure into a message the room can act on, falling back
 * to `fallback` when the reason is not one FoodHub recognises.
 */
export function getMeetupErrorMessage(error: unknown, fallback: string): string {
  const raw = getApiErrorMessage(error, "");

  if (!raw) {
    return fallback;
  }

  for (const rule of MEETUP_ERROR_RULES) {
    if (rule.match.test(raw)) {
      return rule.message;
    }
  }

  return fallback;
}

function readStatus(error: unknown): number | null {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  const record = error as { status?: unknown; originalStatus?: unknown };

  for (const value of [record.status, record.originalStatus]) {
    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string" && /^\d+$/.test(value)) {
      return Number(value);
    }
  }

  return null;
}

/**
 * True for an HTTP 409. Session creation can hit a write conflict when several
 * participants open the same room at once, which is worth retrying once.
 */
export function isConflictError(error: unknown): boolean {
  return readStatus(error) === 409;
}

/** True when the failure is a duplicate-vote conflict, which is recoverable. */
export function isAlreadyVotedError(error: unknown): boolean {
  return /already voted for this food/i.test(getApiErrorMessage(error, ""));
}

/** True when the result endpoint is answering "not decided yet" rather than failing. */
export function isResultNotReadyError(error: unknown): boolean {
  return /result is not ready yet/i.test(getApiErrorMessage(error, ""));
}
