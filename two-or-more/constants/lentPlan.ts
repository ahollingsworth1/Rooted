export interface LentDay {
  day: number;
  theme: string;
  verse: string;
  prompt: string;
}

export const LENT_PLAN: LentDay[] = [
  { day: 1, theme: "Ash Wednesday — Return to God", verse: "Joel 2:12-13", prompt: "What does it mean to return to God with your whole heart?" },
  { day: 2, theme: "Humility", verse: "Micah 6:8", prompt: "Where is God calling you to walk more humbly this season?" },
  { day: 3, theme: "Repentance", verse: "Psalm 51:1-4", prompt: "Is there something you need to bring honestly before God?" },
  { day: 4, theme: "Surrender", verse: "Romans 12:1", prompt: "What area of your life is hardest to surrender to God?" },
  { day: 5, theme: "Fasting & Focus", verse: "Matthew 6:16-18", prompt: "What distraction could you fast from to draw closer to God?" },
  { day: 6, theme: "God's Love", verse: "John 3:16-17", prompt: "How does knowing God's love change how you face this week?" },
  { day: 7, theme: "Rest — Week 1 Reflection", verse: "Psalm 23", prompt: "Which verse from this week moved you most, and why?" },
  { day: 8, theme: "The Word", verse: "Matthew 4:4", prompt: "How are you feeding yourself spiritually, not just physically?" },
  { day: 9, theme: "Prayer", verse: "Matthew 6:9-13", prompt: "What would it look like to pray this prayer with fresh eyes today?" },
  { day: 10, theme: "Forgiveness", verse: "Colossians 3:13", prompt: "Is there someone — including yourself — you need to forgive?" },
  { day: 11, theme: "Trust", verse: "Proverbs 3:5-6", prompt: "Where are you leaning on your own understanding instead of God?" },
  { day: 12, theme: "Service", verse: "Mark 10:45", prompt: "How can you serve someone this week without expecting anything back?" },
  { day: 13, theme: "Generosity", verse: "2 Corinthians 9:7", prompt: "What would joyful, not obligated, giving look like for you right now?" },
  { day: 14, theme: "Rest — Week 2 Reflection", verse: "Psalm 46:10", prompt: "Where do you need to be still and let God be God?" },
  { day: 15, theme: "Identity in Christ", verse: "Galatians 2:20", prompt: "How does living as 'crucified with Christ' change your daily choices?" },
  { day: 16, theme: "Temptation", verse: "1 Corinthians 10:13", prompt: "What temptation keeps returning, and what is God's way out for you?" },
  { day: 17, theme: "Suffering", verse: "Romans 5:3-5", prompt: "How has a past hardship grown perseverance or hope in you?" },
  { day: 18, theme: "Community", verse: "Hebrews 10:24-25", prompt: "How are you encouraging others in your faith community right now?" },
  { day: 19, theme: "Obedience", verse: "John 14:15", prompt: "What is one thing God has asked of you that you've been hesitant to do?" },
  { day: 20, theme: "Gratitude", verse: "1 Thessalonians 5:16-18", prompt: "What is something small you've been overlooking to be thankful for?" },
  { day: 21, theme: "Rest — Week 3 Reflection", verse: "Lamentations 3:22-23", prompt: "Where have you seen God's faithfulness this week, even in small ways?" },
  { day: 22, theme: "Sacrifice", verse: "Isaiah 53:4-6", prompt: "What does it mean to you personally that Jesus bore your suffering?" },
  { day: 23, theme: "Compassion", verse: "Matthew 9:36", prompt: "Who around you is hurting, and how might God be asking you to respond?" },
  { day: 24, theme: "Hope", verse: "Romans 8:18", prompt: "What present struggle feels lighter when you hold it against eternal hope?" },
  { day: 25, theme: "Contentment", verse: "Philippians 4:11-13", prompt: "In what area of life do you most struggle to be content?" },
  { day: 26, theme: "Courage", verse: "Joshua 1:9", prompt: "Where do you need courage right now, and what would it look like to act?" },
  { day: 27, theme: "Abiding", verse: "John 15:4-5", prompt: "What does it look like practically for you to 'remain' in Jesus today?" },
  { day: 28, theme: "Rest — Week 4 Reflection", verse: "Psalm 139:1-6", prompt: "How does being fully known by God make you feel? Comforted? Exposed?" },
  { day: 29, theme: "Light & Darkness", verse: "John 8:12", prompt: "Where do you need Jesus to be your light right now?" },
  { day: 30, theme: "Renewal", verse: "2 Corinthians 5:17", prompt: "What part of your 'old self' are you still holding onto?" },
  { day: 31, theme: "Steadfastness", verse: "James 1:2-4", prompt: "How has a current trial been shaping your character?" },
  { day: 32, theme: "Grace", verse: "Ephesians 2:8-9", prompt: "How does grace free you from performing for God's approval?" },
  { day: 33, theme: "Peace", verse: "Philippians 4:6-7", prompt: "What are you anxious about, and can you bring it to God in prayer together?" },
  { day: 34, theme: "Holy Week — The Triumphal Entry", verse: "Matthew 21:9", prompt: "What does it mean to truly welcome Jesus as King of your life?" },
  { day: 35, theme: "Rest — Week 5 Reflection", verse: "Psalm 22:1-5", prompt: "Have you ever felt abandoned by God? How did you hold on?" },
  { day: 36, theme: "Monday of Holy Week — Cleansing", verse: "John 2:13-17", prompt: "What 'tables' might Jesus need to overturn in your heart?" },
  { day: 37, theme: "Tuesday of Holy Week — Teaching", verse: "Mark 12:30-31", prompt: "What does loving God with everything and your neighbor as yourself look like for you as a couple?" },
  { day: 38, theme: "Wednesday of Holy Week — Silence", verse: "Psalm 62:1-2", prompt: "Can you sit in silence with God today and simply listen?" },
  { day: 39, theme: "Maundy Thursday — The Last Supper", verse: "John 13:34-35", prompt: "How are you loving each other the way Jesus has loved you?" },
  { day: 40, theme: "Good Friday — The Cross", verse: "John 19:30", prompt: "'It is finished.' What does that mean for your shame, your striving, your sin?" },
];

// Helper: get today's Lent day based on a start date
// Set LENT_START to Ash Wednesday of the current year
export const LENT_START = new Date('2026-02-18'); // Ash Wednesday 2026

export function getTodayLentDay(): LentDay | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(LENT_START);
  start.setHours(0, 0, 0, 0);
  const diffMs = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const dayNumber = diffDays + 1;
  if (dayNumber < 1 || dayNumber > 40) return null;
  return LENT_PLAN[dayNumber - 2];
}