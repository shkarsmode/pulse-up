const PHONE_LINE_TYPES = {
  landline: "landline",
  mobile: "mobile",
  fixedVoip: "fixedVoip",
  nonFixedVoip: "nonFixedVoip",
  personal: "personal",
  tollFree: "tollFree",
  premium: "premium",
  sharedCost: "sharedCost",
  uan: "uan",
  voicemail: "voicemail",
  pager: "pager",
  unknown: "unknown"
};

const DEFAULT_USER_LOCATION = {
  latitude: 35.0078,
  longitude: -97.0929,
};

export class AppConstants {
  public static readonly PULSES_PER_PAGE: number = 20;
  public static readonly PHONE_LINE_TYPES = PHONE_LINE_TYPES;
  public static readonly DEFAULT_USER_LOCATION = DEFAULT_USER_LOCATION;
}

