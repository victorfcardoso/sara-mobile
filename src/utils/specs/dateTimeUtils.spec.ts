import {
  formatTimeToShortForm,
  formatRelativeTime,
  formatDate,
  unixTimestampToReadableTime,
  messageStamp,
} from '@/utils/dateTimeUtils';

// Mock i18n
jest.mock('@/i18n', () => ({
  __esModule: true,
  default: {
    t: (key: string) => {
      const translations: Record<string, string> = {
        'CONVERSATION.TODAY': 'Today',
        'CONVERSATION.YESTERDAY': 'Yesterday',
      };
      return translations[key] || key;
    },
  },
}));

describe('#dynamicTime (formatRelativeTime)', () => {
  it('returns correct value for a date about 2 years ago', () => {
    Date.now = jest.fn(() => new Date(Date.UTC(2023, 1, 14)).valueOf());
    expect(formatRelativeTime(1612971343)).toEqual('about 2 years ago');
  });

  it('returns correct relative time for recent timestamps', () => {
    // Mock current date to 2023-02-14
    const mockNow = new Date(Date.UTC(2023, 1, 14, 12, 0, 0)).valueOf();
    Date.now = jest.fn(() => mockNow);

    // Unix timestamp for ~1 hour ago
    const oneHourAgo = Math.floor(mockNow / 1000) - 3600;
    expect(formatRelativeTime(oneHourAgo)).toEqual('about 1 hour ago');
  });
});

describe('formatDate', () => {
  let RealDate: typeof Date;

  beforeEach(() => {
    RealDate = global.Date;
  });

  afterEach(() => {
    global.Date = RealDate;
  });

  it('should return "Today" for today\'s date', () => {
    // Create a fixed "now" date and mock Date to return it for new Date()
    const mockDate = new RealDate(2023, 1, 14, 12, 0, 0); // Local time

    // Mock the Date constructor
    const MockDate = class extends RealDate {
      constructor(...args: Parameters<typeof RealDate>) {
        if (args.length === 0) {
          super(mockDate.getTime());
        } else {
          // @ts-expect-error - spreading args to constructor
          super(...args);
        }
      }
    } as unknown as typeof Date;
    MockDate.now = () => mockDate.getTime();
    global.Date = MockDate;

    // Unix timestamp for today in local time
    const todayTimestamp = Math.floor(new RealDate(2023, 1, 14, 10, 0, 0).valueOf() / 1000);
    expect(formatDate(todayTimestamp)).toEqual('Today');
  });

  it('should return "Yesterday" for yesterday\'s date', () => {
    const mockDate = new RealDate(2023, 1, 14, 12, 0, 0);

    const MockDate = class extends RealDate {
      constructor(...args: Parameters<typeof RealDate>) {
        if (args.length === 0) {
          super(mockDate.getTime());
        } else {
          // @ts-expect-error - spreading args to constructor
          super(...args);
        }
      }
    } as unknown as typeof Date;
    MockDate.now = () => mockDate.getTime();
    global.Date = MockDate;

    // Unix timestamp for yesterday in local time
    const yesterdayTimestamp = Math.floor(new RealDate(2023, 1, 13, 10, 0, 0).valueOf() / 1000);
    expect(formatDate(yesterdayTimestamp)).toEqual('Yesterday');
  });

  it('should return formatted date for older dates', () => {
    const mockDate = new RealDate(2023, 1, 14, 12, 0, 0);

    const MockDate = class extends RealDate {
      constructor(...args: Parameters<typeof RealDate>) {
        if (args.length === 0) {
          super(mockDate.getTime());
        } else {
          // @ts-expect-error - spreading args to constructor
          super(...args);
        }
      }
    } as unknown as typeof Date;
    MockDate.now = () => mockDate.getTime();
    global.Date = MockDate;

    // Unix timestamp for 2023-01-01
    const oldTimestamp = Math.floor(new RealDate(2023, 0, 1, 10, 0, 0).valueOf() / 1000);
    expect(formatDate(oldTimestamp)).toEqual('Jan 01, 2023');
  });

  it('should use custom date format when provided', () => {
    const mockDate = new RealDate(2023, 1, 14, 12, 0, 0);

    const MockDate = class extends RealDate {
      constructor(...args: Parameters<typeof RealDate>) {
        if (args.length === 0) {
          super(mockDate.getTime());
        } else {
          // @ts-expect-error - spreading args to constructor
          super(...args);
        }
      }
    } as unknown as typeof Date;
    MockDate.now = () => mockDate.getTime();
    global.Date = MockDate;

    const oldTimestamp = Math.floor(new RealDate(2023, 0, 15, 10, 0, 0).valueOf() / 1000);
    expect(formatDate(oldTimestamp, 'yyyy-MM-dd')).toEqual('2023-01-15');
  });
});

describe('unixTimestampToReadableTime', () => {
  it('should convert morning timestamp to 12-hour format', () => {
    // Use local time (not UTC) since the function converts to local time
    const timestamp = Math.floor(new Date(2023, 1, 14, 9, 30, 0).valueOf() / 1000);
    expect(unixTimestampToReadableTime(timestamp)).toEqual('09:30 AM');
  });

  it('should convert afternoon timestamp to 12-hour format', () => {
    const timestamp = Math.floor(new Date(2023, 1, 14, 14, 45, 0).valueOf() / 1000);
    expect(unixTimestampToReadableTime(timestamp)).toEqual('02:45 PM');
  });

  it('should handle midnight correctly', () => {
    const timestamp = Math.floor(new Date(2023, 1, 14, 0, 0, 0).valueOf() / 1000);
    expect(unixTimestampToReadableTime(timestamp)).toEqual('12:00 AM');
  });

  it('should handle noon correctly', () => {
    const timestamp = Math.floor(new Date(2023, 1, 14, 12, 0, 0).valueOf() / 1000);
    expect(unixTimestampToReadableTime(timestamp)).toEqual('12:00 PM');
  });

  it('should pad single digit minutes with zero', () => {
    const timestamp = Math.floor(new Date(2023, 1, 14, 10, 5, 0).valueOf() / 1000);
    expect(unixTimestampToReadableTime(timestamp)).toEqual('10:05 AM');
  });
});

describe('messageStamp', () => {
  it('should format timestamp with default format', () => {
    // Use local time since messageStamp converts to local time
    const timestamp = Math.floor(new Date(2023, 1, 14, 14, 30, 0).valueOf() / 1000);
    expect(messageStamp({ time: timestamp })).toEqual('2:30 PM');
  });

  it('should use custom date format when provided', () => {
    const timestamp = Math.floor(new Date(2023, 1, 14, 14, 30, 0).valueOf() / 1000);
    expect(messageStamp({ time: timestamp, dateFormat: 'HH:mm' })).toEqual('14:30');
  });

  it('should format morning time correctly', () => {
    const timestamp = Math.floor(new Date(2023, 1, 14, 9, 15, 0).valueOf() / 1000);
    expect(messageStamp({ time: timestamp })).toEqual('9:15 AM');
  });
});

describe('formatTimeToShortForm', () => {
  it('should handle special cases', () => {
    expect(formatTimeToShortForm('less than a minute ago')).toBe('now');
    expect(formatTimeToShortForm('a minute ago')).toBe('1m');
    expect(formatTimeToShortForm('an hour ago')).toBe('1h');
    expect(formatTimeToShortForm('a day ago')).toBe('1d');
    expect(formatTimeToShortForm('a month ago')).toBe('1mo');
    expect(formatTimeToShortForm('a year ago')).toBe('1y');
  });

  it('should handle special cases with "ago" suffix', () => {
    expect(formatTimeToShortForm('less than a minute ago', true)).toBe('now');
    expect(formatTimeToShortForm('a minute ago', true)).toBe('1m ago');
    expect(formatTimeToShortForm('an hour ago', true)).toBe('1h ago');
    expect(formatTimeToShortForm('a day ago', true)).toBe('1d ago');
    expect(formatTimeToShortForm('a month ago', true)).toBe('1mo ago');
    expect(formatTimeToShortForm('a year ago', true)).toBe('1y ago');
  });

  it('should handle regular time formats', () => {
    expect(formatTimeToShortForm('2 minutes ago')).toBe('2m');
    expect(formatTimeToShortForm('5 hours ago')).toBe('5h');
    expect(formatTimeToShortForm('3 days ago')).toBe('3d');
    expect(formatTimeToShortForm('6 months ago')).toBe('6mo');
    expect(formatTimeToShortForm('2 years ago')).toBe('2y');
  });

  it('should handle regular time formats with "ago" suffix', () => {
    expect(formatTimeToShortForm('2 minutes ago', true)).toBe('2m ago');
    expect(formatTimeToShortForm('5 hours ago', true)).toBe('5h ago');
    expect(formatTimeToShortForm('3 days ago', true)).toBe('3d ago');
    expect(formatTimeToShortForm('6 months ago', true)).toBe('6mo ago');
    expect(formatTimeToShortForm('2 years ago', true)).toBe('2y ago');
  });

  it('should handle time strings with "about/over/almost"', () => {
    expect(formatTimeToShortForm('about 2 minutes ago')).toBe(' 2m');
    expect(formatTimeToShortForm('over 5 hours ago')).toBe(' 5h');
    expect(formatTimeToShortForm('almost 3 days ago')).toBe(' 3d');
  });
});
