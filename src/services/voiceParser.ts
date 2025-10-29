import { format, parse, addDays, isValid } from 'date-fns';

export interface ParsedTask {
  name: string;
  description?: string;
  dueDate?: string;
  priority: 'Low' | 'Medium' | 'High';
  category?: string;
  reminderMinutes?: number;
  isComplete: boolean;
}

const priorityKeywords = {
  high: ['urgent', 'important', 'asap', 'critical', 'high priority'],
  medium: ['medium', 'moderate', 'normal'],
  low: ['low', 'minor', 'whenever'],
};

const categoryKeywords = {
  Family: ['family', 'home', 'kids', 'spouse', 'parents'],
  Personal: ['personal', 'self', 'me', 'myself'],
  Office: ['work', 'office', 'job', 'meeting', 'project', 'client'],
};

const timeKeywords: { [key: string]: number } = {
  'tomorrow': 1,
  'today': 0,
  'in 2 days': 2,
  'in 3 days': 3,
  'next week': 7,
};

const reminderKeywords: { [key: string]: number } = {
  '5 minutes': 5,
  '10 minutes': 10,
  '20 minutes': 20,
  '25 minutes': 25,
};

export const parseVoiceInput = (text: string): ParsedTask => {
  const lowerText = text.toLowerCase();

  const priority = extractPriority(lowerText);
  const category = extractCategory(lowerText);
  const { dueDate, cleanText } = extractDateTime(lowerText);
  const reminderMinutes = extractReminder(lowerText);
  const name = extractTaskName(cleanText);

  return {
    name,
    dueDate,
    priority,
    category,
    reminderMinutes,
    isComplete: hasAllRequiredFields(name, dueDate),
  };
};

const extractPriority = (text: string): 'Low' | 'Medium' | 'High' => {
  for (const [priority, keywords] of Object.entries(priorityKeywords)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return priority.charAt(0).toUpperCase() + priority.slice(1) as 'Low' | 'Medium' | 'High';
    }
  }
  return 'Medium';
};

const extractCategory = (text: string): string | undefined => {
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return category;
    }
  }
  return undefined;
};

const extractDateTime = (text: string): { dueDate?: string; cleanText: string } => {
  let cleanText = text;
  let dueDate: string | undefined;

  for (const [keyword, days] of Object.entries(timeKeywords)) {
    if (text.includes(keyword)) {
      const targetDate = addDays(new Date(), days);
      cleanText = text.replace(keyword, '').trim();

      const timeMatch = text.match(/at (\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const period = timeMatch[3]?.toLowerCase();

        if (period === 'pm' && hours < 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;

        targetDate.setHours(hours, minutes, 0, 0);
        cleanText = cleanText.replace(timeMatch[0], '').trim();
      }

      dueDate = targetDate.toISOString();
      break;
    }
  }

  const specificDateMatch = text.match(/on (\w+ \d{1,2}(?:st|nd|rd|th)?)/i);
  if (specificDateMatch && !dueDate) {
    const dateStr = specificDateMatch[1];
    try {
      const parsedDate = parse(dateStr, 'MMMM d', new Date());
      if (isValid(parsedDate)) {
        dueDate = parsedDate.toISOString();
        cleanText = text.replace(specificDateMatch[0], '').trim();
      }
    } catch (e) {
      console.log('Date parsing error:', e);
    }
  }

  return { dueDate, cleanText };
};

const extractReminder = (text: string): number | undefined => {
  for (const [keyword, minutes] of Object.entries(reminderKeywords)) {
    if (text.includes(keyword)) {
      return minutes;
    }
  }

  const reminderMatch = text.match(/remind me (\d+) minutes before/i);
  if (reminderMatch) {
    return parseInt(reminderMatch[1]);
  }

  return undefined;
};

const extractTaskName = (text: string): string => {
  let name = text
    .replace(/^(add|create|new|make)\s+(a\s+)?(task\s+)?(to\s+)?/i, '')
    .replace(/\s+(please|thanks|thank you)$/i, '')
    .trim();

  for (const keywords of Object.values(priorityKeywords)) {
    keywords.forEach((keyword) => {
      name = name.replace(new RegExp(`\\b${keyword}\\b`, 'gi'), '').trim();
    });
  }

  for (const keywords of Object.values(categoryKeywords)) {
    keywords.forEach((keyword) => {
      name = name.replace(new RegExp(`\\b${keyword}\\b`, 'gi'), '').trim();
    });
  }

  Object.keys(reminderKeywords).forEach((keyword) => {
    name = name.replace(new RegExp(`remind me ${keyword} before`, 'gi'), '').trim();
  });

  name = name.replace(/\s{2,}/g, ' ').trim();

  if (!name) {
    return 'New Task';
  }

  return name.charAt(0).toUpperCase() + name.slice(1);
};

const hasAllRequiredFields = (name: string, dueDate?: string): boolean => {
  return name !== 'New Task' && name.length > 0;
};

export const parseSmartQuery = (text: string): {
  type: 'filter' | 'time-based' | 'unknown';
  filter?: { priority?: string; category?: string; date?: string };
  timeAvailable?: number;
} => {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('today') || lowerText.includes("today's")) {
    const priority = extractPriority(lowerText);
    return {
      type: 'filter',
      filter: {
        date: format(new Date(), 'yyyy-MM-dd'),
        priority: priority !== 'Medium' ? priority : undefined,
      },
    };
  }

  const timeMatch = lowerText.match(/(\d+)\s*minutes?/);
  if (timeMatch && (lowerText.includes('have') || lowerText.includes('finish'))) {
    return {
      type: 'time-based',
      timeAvailable: parseInt(timeMatch[1]),
    };
  }

  const priority = extractPriority(lowerText);
  const category = extractCategory(lowerText);

  if (priority !== 'Medium' || category) {
    return {
      type: 'filter',
      filter: {
        priority: priority !== 'Medium' ? priority : undefined,
        category,
      },
    };
  }

  return { type: 'unknown' };
};
