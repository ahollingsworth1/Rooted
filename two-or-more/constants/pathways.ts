export interface PathwayDay {
  day: number;
  theme: string;
  verse: string;
  prompt: string;
  devotional: string;
}

export interface Pathway {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  duration: number;
  color: string;
  days: PathwayDay[];
}

// --- HUMILITY ARRAYS ---
const HUMILITY_THEMES = [
  'What Is Humility?', "Pride's Disguises", 'The Mind of Christ', 'Humility in Conflict',
  'Seeing Others Clearly', 'Rest & Reflection', 'Serving Without Recognition', 'Receiving Correction',
  'Comparison & Envy', 'Humility in Success', 'The Weight of Ego', 'Humility in Grief',
  'Rest & Reflection', 'Speaking Last', 'Humility in Prayer', 'The Strong & the Weak',
  'Gratitude as Humility', 'Humility in Leadership', 'Rest & Reflection', 'Apology & Repair',
  'Dependence on God', 'Humility in Disagreement', 'The Servant Heart', 'Lowliness & Dignity',
  'Rest & Reflection', 'Humility in Wealth', 'Asking for Help', 'Learning from Others',
  'A Humble Home', 'The Freedom of Humility',
];
const HUMILITY_VERSES = [
  'Philippians 2:3-4', 'Proverbs 16:18', 'Philippians 2:5-8', 'James 4:1-2',
  'Romans 12:3', 'Psalm 131:1-2', 'Mark 10:43-45', 'Proverbs 12:1',
  'Galatians 5:26', 'Deuteronomy 8:17-18', '1 Corinthians 4:7', 'Romans 12:15',
  'Matthew 11:29', 'James 1:19', 'Luke 18:9-14', '1 Corinthians 12:22-23',
  '1 Thessalonians 5:18', 'Matthew 20:25-28', 'Micah 6:8', 'Matthew 5:23-24',
  'John 15:5', 'Romans 14:1', 'John 13:14-15', 'Matthew 5:5',
  'Zephaniah 3:12', '1 Timothy 6:17-18', 'Proverbs 11:2', 'Proverbs 13:10',
  'Ephesians 4:2-3', 'Matthew 23:11-12',
];
const HUMILITY_PROMPTS = [
  'What is your gut reaction to the word "humility"? Does it feel like strength or weakness to you?',
  'Where does pride show up most subtly in your relationship? How does it disguise itself?',
  'Jesus emptied himself. What would it look like to empty yourself in your relationship this week?',
  'What was your last significant conflict about, at its deepest level? Was pride involved?',
  'Do you tend to over- or under-estimate yourself? How does this affect your partner?',
  'What has this first week revealed about pride and humility in your relationship?',
  'When did you last serve your partner in a way they never found out about?',
  'How do you receive correction from your partner? With defensiveness, or with openness?',
  'Is there an area where you compare yourself or your relationship to others? What drives it?',
  'How do you handle success? Do you acknowledge God and others, or take private credit?',
  'What is one thing you are holding onto that you need to release to God or your partner?',
  'When your partner is grieving, do you rush to fix it or simply be present? Which is harder?',
  'What is Jesus inviting you to learn from him this week?',
  'In your last difficult conversation, did you speak first and listen second? What would reversing that look like?',
  'Do you approach prayer with a spirit of entitlement or dependence? What is the difference in practice?',
  'Is there someone in your life — or in your relationship — whose weakness you have been impatient with?',
  'Name three things in your relationship you are genuinely grateful for but rarely say aloud.',
  'What does humble leadership look like in your home? How is it different from either passivity or control?',
  'What has the third week revealed about where humility is still needed in you?',
  'Is there a repair that needs to happen — an apology that is still owed? What has held you back?',
  "Where are you most tempted to rely on your own strength rather than God's?",
  'How do you handle disagreement with your partner when you are convinced you are right?',
  'In what area of your relationship are you most tempted to be served rather than to serve?',
  'What is the difference between humility and low self-esteem? Do you confuse them?',
  'What is God inviting you to lay down in this season?',
  'How does money or material security affect your sense of humility or pride?',
  'What is something you need help with that you have been reluctant to ask for?',
  'Who has taught you the most about humility? What did they model?',
  'What would it look like for humility to be the defining characteristic of your home?',
  'What has this journey revealed? What freedom have you found in humility?',
];

// --- GROWING TOGETHER ARRAYS ---
const GROWING_THEMES = [
  'Where Are We?', 'Two Becoming One', 'Individual & Together', 'Shared Rhythms', 'Honest Inventory',
  'Rest & Reflection', 'How We Communicate', 'Listening Well', 'What We Avoid', 'Speaking the Hard Thing',
  'Words That Build', 'Rest & Reflection', 'Conflict as Opportunity', 'The Anatomy of a Fight',
  'Repair & Reconnection', 'Forgiveness That Frees', 'After the Storm', 'Rest & Reflection',
  'Spiritual Growth Together', 'Prayer as Intimacy', 'The Word in Your Home', 'Worship Together',
  'Accountability in Love', 'Rest & Reflection', 'Rest & Delight', 'Play & Laughter',
  'What We Dream Of', 'Building Our Culture', 'Hospitality & Mission', 'Rest & Reflection',
  'Seasons of Marriage', 'When Growth Is Painful', 'The Long View', 'Perseverance',
  'Community & Support', 'Rest & Reflection', 'Gratitude', 'What Is Good Between Us',
  'Naming What Needs Work', 'The Gift of Honesty', 'Choosing Each Other Again', 'Rest & Reflection',
  'Who We Are Becoming', 'The Covenant Renewed', 'Rooted & Growing',
];
const GROWING_VERSES = [
  'Song of Solomon 2:16', 'Genesis 2:24', 'Galatians 6:4-5', 'Ecclesiastes 4:9', 'Lamentations 3:40',
  'Psalm 139:23-24', 'Ephesians 4:15', 'James 1:19', 'Proverbs 28:13', 'Proverbs 27:6',
  'Ephesians 4:29', 'Proverbs 15:1', 'Romans 5:3-5', 'Ephesians 4:26-27', 'Matthew 5:23-24',
  'Colossians 3:13', '1 Peter 4:8', 'Micah 7:18-19', 'Hebrews 10:24-25', 'Matthew 18:20',
  'Deuteronomy 6:6-7', 'Psalm 150:6', 'Proverbs 27:17', 'Psalm 90:12', 'Psalm 46:10',
  'Proverbs 17:22', 'Jeremiah 29:11', 'Ruth 1:16-17', 'Romans 12:13', '1 Corinthians 13:7',
  'Ecclesiastes 3:1', 'James 1:2-4', 'Philippians 3:13-14', 'Galatians 6:9', 'Proverbs 11:14',
  'Psalm 103:2', 'Philippians 4:8', 'Song of Solomon 4:7', 'Proverbs 14:12', 'Proverbs 27:5',
  'Lamentations 3:22-23', 'Ruth 1:16', 'Philippians 1:6', 'Ezekiel 36:26', 'Colossians 2:6-7',
];
const GROWING_PROMPTS = [
  'Where are you as a couple right now — thriving, surviving, or somewhere in between?',
  'What does "becoming one" mean practically in your daily life?',
  'How do you maintain your individual identity while growing together?',
  'What shared rhythms give your relationship the most life?',
  'If you could honestly assess your relationship right now, what would you say?',
  'What has this first week revealed about where you are and where you want to go?',
  'What is one communication pattern you would like to change?',
  'When your partner is speaking, what percentage of your attention are they actually getting?',
  'What topic do you most consistently avoid? Why?',
  'Think of something you have been afraid to say. What would happen if you said it today?',
  'What words do you use most often with your partner? Are they words that build or erode?',
  'Where has God shown up in your communication this week?',
  'What if conflict was a sign of growth rather than failure? How would that change how you approach it?',
  'Walk through your last argument. At what point could a different choice have changed the outcome?',
  'What does repair look like in your relationship? How do you know you have reconnected?',
  'Is there something that still needs to be forgiven between you? Name it gently.',
  'How do you treat each other in the days after a hard conflict?',
  "What has this week's honesty about conflict cost you? What has it given you?",
  'What spiritual practices sustain you individually? Which ones could you share?',
  'Pray together for five minutes right now. Just talk to God as if He is in the room — because He is.',
  'When did you last read Scripture together? What made it meaningful or difficult?',
  'What does worship look like in your daily life, not just on Sundays?',
  'Is there an area of your life where you need your partner to hold you accountable? Have you told them?',
  'Number your days — what do you want to have done with this season of your life?',
  'When did you last play together? What did it feel like?',
  'What makes your relationship laugh? Protect that.',
  'What is one dream you have never fully said aloud to your partner?',
  'What makes your relationship distinctly yours? What is your culture?',
  'Who outside your relationship benefits from your love for each other?',
  'What would you tell a younger couple about what it takes to grow together?',
  'Which season of your relationship has been the hardest? What did it produce?',
  'Is there growth happening in your relationship right now that is painful but good?',
  'Where do you want to be in ten years? How does today contribute to that?',
  'When you want to quit, what keeps you going?',
  'Who are the people who support your marriage? Do they know how much you need them?',
  'What are you most grateful for about this season of your relationship?',
  'What is genuinely good between you right now that you have not named recently?',
  'What is one thing about your relationship that needs attention — said with love, not accusation?',
  'Has honesty ever saved your relationship? What happened?',
  'What does it mean to choose each other not just at the altar but again and again, daily?',
  'What would you tell your younger self about this relationship?',
  'What is God making you into — individually and together?',
  'Renew your commitment today. What do you want to say to each other?',
  'You are rooted. You are growing. What does that feel like?',
];

// --- PRAYER ARRAYS ---
const PRAYER_THEMES = [
  "Why We Don't Pray", 'An Audience of One', "The Lord's Prayer", 'Honest Prayer',
  'Praying for Each Other', 'Rest & Reflection', 'Petition', 'Thanksgiving',
  'Confession Together', 'Listening in Prayer', 'Praying Through Conflict', 'Rest & Reflection',
  'Intercession', 'Praying Scripture', 'Silence & Solitude', 'Lament',
  'Faith & Doubt in Prayer', 'Rest & Reflection', 'Prayer & Action', 'Fasting & Prayer',
  'The Persistent Prayer', 'Praying for Others', 'Prayer in Crisis', 'Rest & Reflection',
  'The Prayers We Fear', 'Gratitude as Prayer', 'Night Prayer', 'Morning Prayer',
  'A Household of Prayer', 'The Life of Prayer',
];
const PRAYER_VERSES = [
  'Matthew 6:5-6', 'Hebrews 4:16', 'Matthew 6:9-13', 'Psalm 62:8',
  'Ephesians 6:18', 'Matthew 26:41', 'Philippians 4:6', '1 Thessalonians 5:18',
  'James 5:16', '1 Kings 19:12', 'Psalm 55:17', 'Psalm 42:1-2',
  '1 Timothy 2:1', 'Psalm 119:105', 'Psalm 46:10', 'Psalm 22:1-2',
  'Mark 9:24', 'Luke 1:38', 'James 2:26', 'Matthew 6:16-18',
  'Luke 18:1-8', 'Colossians 4:2-4', 'Psalm 121:1-2', 'Psalm 34:4',
  'Matthew 26:39', 'Psalm 100:4-5', 'Psalm 63:6', 'Psalm 5:3',
  'Joshua 24:15', 'Luke 18:1',
];
const PRAYER_PROMPTS = [
  'What makes praying together feel awkward or difficult? Be honest.',
  "Imagine God's full attention is on you right now. How does that change how you approach this moment?",
  "Pray the Lord's Prayer together slowly, pausing at each line. What lands differently when you say it together?",
  'What is something you have never prayed out loud with your partner? Try today.',
  'Pray specifically for your partner — their fears, their hopes, what you know they are carrying.',
  'How has prayer shaped this first week together? What surprised you?',
  'What do you need from God right now? Ask for it together, specifically.',
  'Name five things you are grateful for — out loud, to God, together.',
  'Is there something between you that needs to be confessed and forgiven? Do it in prayer.',
  'Spend five minutes in silence together. What did you hear?',
  'The next time you feel conflict rising, pause and pray before responding. Try it today.',
  'What has prayer revealed this week that you could not see before?',
  'Who in your lives needs prayer right now? Pray for them together by name.',
  'Choose a verse that has meant something to you this week and pray it back to God.',
  'Sit in silence before God for ten minutes. No agenda. Just be present.',
  'What loss or grief are you carrying? Bring it to God in lament — honestly and without pretending.',
  'Do you have doubts about prayer? Tell God — and tell your partner.',
  'What is God asking you to do in response to your prayers this week?',
  'Consider fasting from something today as an act of prayer. What would it be?',
  'What have you been praying about for a long time without an answer? Keep praying.',
  "Pray for three people outside your relationship who need God's intervention.",
  'Has prayer ever changed a situation for you? Share that story with your partner.',
  'What are you most afraid of right now? Bring that fear to God together.',
  'What have you asked God for this week that you have not yet thanked Him for?',
  'Is there a prayer you are afraid to pray because you are not sure you want the answer? Say it anyway.',
  'End today with simple thanksgiving — nothing else, just gratitude.',
  'Pray tonight as you fall asleep — out loud, together, for each other.',
  'Pray first thing tomorrow morning, before anything else. Just five minutes.',
  'What would it mean for your home to be known as a house of prayer?',
  'You have spent thirty days learning to pray together. What has changed?',
];

// --- LENT ARRAYS ---
const LENT_THEMES = [
  'Return', 'Humility', 'Repentance', 'Surrender', 'Fasting',
  'Love', 'Rest', 'The Word', 'Prayer', 'Forgiveness',
  'Trust', 'Service', 'Generosity', 'Stillness', 'Identity',
  'Temptation', 'Suffering', 'Community', 'Obedience', 'Gratitude',
  'Rest', 'The Cross Approaches', 'Compassion', 'Hope', 'Contentment',
  'Courage', 'Abiding', 'Being Known', 'Light', 'New Creation',
  'Endurance', 'Grace', 'Peace', 'Palm Sunday', 'Holy Monday',
  'Holy Tuesday', 'Holy Wednesday', 'Maundy Thursday', 'Good Friday', 'Holy Saturday',
];
const LENT_VERSES = [
  'Joel 2:12', 'Micah 6:8', 'Psalm 51:1-2', 'Romans 12:1', 'Matthew 6:16-18',
  'John 3:16', 'Psalm 23:1-3', 'Matthew 4:4', 'Matthew 6:9-13', 'Colossians 3:13',
  'Proverbs 3:5-6', 'Mark 10:45', '2 Corinthians 9:7', 'Psalm 46:10', 'Galatians 2:20',
  '1 Corinthians 10:13', 'Romans 8:18', 'Hebrews 10:24-25', 'John 14:15', '1 Thessalonians 5:18',
  'Lamentations 3:22-23', 'Isaiah 53:5', 'Matthew 9:36', 'Romans 8:18', 'Philippians 4:11-12',
  'Joshua 1:9', 'John 15:4-5', 'Psalm 139:1', 'John 8:12', '2 Corinthians 5:17',
  'James 1:3-4', 'Ephesians 2:8-9', 'Philippians 4:7', 'Matthew 21:9', 'Mark 11:15-17',
  'Mark 12:28-31', 'Mark 14:3-9', 'John 13:34-35', 'John 19:30', 'Romans 6:5',
];
const LENT_PROMPTS = [
  'What would it mean to return to God with your whole heart this Lent?',
  'Where is God calling you to walk more humbly?',
  'What do you need to repent of — together and individually?',
  'What are you holding onto that God is asking you to surrender?',
  'What might you fast from this Lent to create space for God?',
  'How has the love of God surprised you recently?',
  'What did this first week of Lent surface in each of you?',
  'How are you feeding your soul this Lent?',
  'What is your prayer life like right now? What does it need?',
  'Is there forgiveness that needs to happen between you?',
  'Where are you struggling to trust God right now?',
  'How are you serving someone outside your relationship this Lent?',
  'How is God calling you to greater generosity this season?',
  'When did you last experience genuine stillness before God?',
  'Who are you in Christ — and how does that identity show up in your relationship?',
  'What temptation is most persistent for you right now?',
  'What suffering are you carrying into Lent?',
  'Who in your community needs you most right now?',
  "Is there an area where you are resisting God's clear direction?",
  'What are you grateful for that you have not said recently?',
  'What has Lent revealed in these three weeks?',
  'What does it mean to you that Jesus was pierced for your transgressions?',
  'Who is God calling you to show compassion toward this week?',
  'What hope are you holding onto this Lent?',
  'Where is God asking you to find contentment right now?',
  'What are you afraid of? Bring it to God together.',
  'What does it look like to abide in Christ in your daily life?',
  'Do you feel truly known — by God, by your partner? What gets in the way?',
  'Where do you need the light of Christ to shine this week?',
  'What old thing does God want to make new in you?',
  'What trial are you persevering through right now?',
  'Where do you most need grace — from God, from your partner, for yourself?',
  'What would it mean to experience the peace that passes understanding in your relationship?',
  'Jesus enters Jerusalem as a humble king. What does His humility challenge in you?',
  'What tables need to be overturned in your heart?',
  'What is the greatest commandment doing in your relationship?',
  'Is there an extravagant act of love you can offer this week?',
  'What does "love one another as I have loved you" look like today, specifically?',
  'Sit with the cross today. What does it mean for you, personally, that it is finished?',
  'What needs to die in you so that new life can rise?',
];

export const PATHWAYS: Pathway[] = [
  {
    id: 'premarital',
    title: 'Before the Altar',
    subtitle: 'A Premarital Journey',
    description: 'Prepare your hearts and your relationship for a lifelong covenant. Over 40 days, explore the foundations of Christian marriage — communication, conflict, faith, family, and what it means to love sacrificially.',
    icon: '',
    duration: 40,
    color: '#8B6347',
    days: [
      { day: 1, theme: 'Why Marriage?', verse: 'Genesis 2:24', prompt: 'What does "leaving and cleaving" mean for your specific family situations? What will need to change?', devotional: 'Marriage is not a human invention. It is a divine one. Before the fall, before sin entered the world, before any of the complications that make relationships hard — God looked at the man He had made and said that it was not good for him to be alone. He then fashioned a helper suitable for him, and the first marriage was performed not in a church or a courthouse but in a garden, with God Himself presiding.\n\nThe language of Genesis 2:24 is remarkable in its decisiveness. A man shall "leave" his father and mother — a word that implies a complete and deliberate detachment, not a gradual drifting. He shall "hold fast" to his wife — a word used elsewhere in Scripture for clinging to God in covenant loyalty. These are not passive processes. They are chosen, active, sometimes costly.\n\nFor many couples, the leaving is harder than it looks. We carry our families of origin with us — their patterns, their expectations, their wounds, their wisdom. Marriage does not erase these, but it does require that they be reordered. Your primary human loyalty now belongs to one another. Everything else comes after.\n\nAs you begin this journey together, name honestly what leaving will require of each of you. What family patterns do you want to carry forward? Which ones do you want to leave behind? And what does holding fast look like in the specific texture of your life together? These are questions worth returning to again and again.' },
      { day: 2, theme: 'Two Becoming One', verse: '1 Corinthians 13:4-7', prompt: 'Which quality of love in this passage comes most naturally to you? Which is hardest? Be honest with each other.', devotional: 'First Corinthians 13 is read at so many weddings that it risks losing its force — becoming beautiful wallpaper rather than a searching examination of what love actually demands. But Paul did not write these words for weddings. He wrote them to a church in conflict, as a rebuke to people who had mistaken spiritual gifts for spiritual maturity. Love, he insists, is the more excellent way.\n\nLove is patient. This is listed first, perhaps because it is most fundamental and most difficult. Patience is not passive resignation. It is the active choice to bear with another person\'s limitations, their slow growth, their repeated failures — without withdrawing, without punishing, without keeping a running tally.\n\nLove does not insist on its own way. This may be the most countercultural statement in the passage. We live in an age that prizes self-expression and personal fulfillment above almost everything else. Against this current, Paul insists that love is characterized by the regular, willing surrender of one\'s own preferences for the sake of another.\n\nThe list is long and the standard is high. No human being loves this way perfectly or consistently. The good news is that this passage is ultimately a portrait of Jesus — and as you are conformed to His image together, these qualities grow. Marriage is one of God\'s primary instruments for that conforming. It will show you where you fall short. It will also show you the grace that covers the falling short.' },
      { day: 3, theme: 'Communication', verse: 'Ephesians 4:15', prompt: 'Describe a time you struggled to speak the truth in love with each other. What made it hard?', devotional: '"Speaking the truth in love" is one of those phrases that has been softened by overuse into something far less demanding than Paul intended. We use it to mean "be nice when you say hard things." But the phrase in context is about something deeper — the kind of honest, loving communication that actually builds up the body rather than tearing it down.\n\nTruth without love becomes brutality. There are people who pride themselves on their honesty but use it as a weapon — saying hard things not because they care about the person but because they enjoy the power of the wound. This is not what Paul has in mind. The truth he describes is always in service of the other person\'s growth, always delivered with genuine care for how it lands.\n\nLove without truth becomes enabling. There are also people who prize harmony so highly that they never say what needs to be said — who smile and agree and quietly accumulate resentment because they cannot bear the discomfort of honest conversation. This is not love either. It is conflict avoidance dressed in love\'s clothing.\n\nIn marriage, you will need to develop the skill of speaking the truth in love — regularly, in small things and large ones. This requires knowing yourself well enough to name what you actually think and feel. It requires knowing your partner well enough to consider how they will receive it. And it requires trusting the relationship enough to believe it can hold an honest conversation. That trust is built in moments like this one.' },
      { day: 4, theme: 'Conflict', verse: 'Ephesians 4:26-27', prompt: 'What is your conflict style — do you pursue or withdraw? How do your styles interact?', devotional: '"Be angry and do not sin." This is one of the most honest and practical instructions in the New Testament. It does not say "do not be angry" — as though the goal of Christian marriage is the elimination of conflict. It acknowledges that anger will come, that it is sometimes appropriate, and that the issue is what you do with it.\n\nThe instruction that follows — "do not let the sun go down on your anger" — is not a rigid rule that every argument must be resolved before midnight. It is a principle about not allowing unresolved conflict to fester. Unaddressed anger gives the devil a foothold, Paul says. Left unattended, yesterday\'s hurt becomes next week\'s resentment, which becomes next year\'s bitterness, which becomes a slow-spreading poison in the relationship.\n\nEvery couple develops patterns for handling conflict. Some pursue — they need to resolve things immediately and cannot rest until the issue is addressed. Some withdraw — they need space and time before they can engage productively. Neither pattern is inherently wrong, but the mismatch between styles causes enormous strain when the pursuer pushes and the withdrawer retreats.\n\nLearning to fight well is one of the most important skills in marriage. It means learning to stay in the conversation when every instinct says to flee. It means learning to slow down when every instinct says to press harder. It means remembering, in the heat of the argument, that you are not opponents. You are teammates trying to solve a problem together.' },
      { day: 5, theme: 'Forgiveness', verse: 'Colossians 3:13', prompt: 'Is there anything between you right now that needs to be forgiven? Take a moment to clear the air.', devotional: '"As the Lord has forgiven you, so you also must forgive." The standard Paul sets is not the forgiveness of someone who has been slightly inconvenienced and magnanimously let it go. It is the forgiveness of God — the forgiveness of someone who was deeply wronged at incalculable cost and chose to absorb the debt rather than demand its payment.\n\nForgiveness in marriage is not optional. Not because the offenses are small — they often are not — but because the alternative is the slow calcification of the relationship into something neither of you chose and neither of you wants. Unforgiveness does not protect you from hurt. It simply ensures that old hurts continue to wound you long after they have ended.\n\nIt is worth being clear about what forgiveness is not. It is not the pretense that wrong was not done. It is not the immediate restoration of trust, which must be rebuilt over time through consistent behavior. It is not the guarantee that consequences will not follow. Forgiveness is the release of the debt — the decision not to hold the wrong against the person, not to weaponize it in future arguments, not to let it define how you see them.\n\nBefore you marry, it is worth asking: Can I forgive this person when they fail me — not once, but repeatedly, across a lifetime? The answer depends not on how good your partner is but on how deeply you have received God\'s forgiveness for yourself. Those who have been forgiven much, forgive much.' },
      { day: 6, theme: 'Finances', verse: 'Luke 16:10-11', prompt: 'Have you had an honest conversation about debt, spending habits, and financial goals? If not, start today.', devotional: 'Jesus talked about money more than almost any other subject — more than heaven, more than prayer, more than most of the topics we consider "spiritual." He understood that money is not merely a practical matter but a deeply revealing one. "Where your treasure is," He said, "there your heart will be also." Our finances are a map of our values.\n\nFor couples, financial compatibility is not primarily about income levels or financial sophistication. It is about values alignment. Two people with very different financial backgrounds can build a healthy financial life together if they share a common vision and a common commitment to honesty. Two people with identical incomes can tear each other apart if their values and habits are fundamentally misaligned.\n\nFaithfulness in small things precedes faithfulness in large ones — this is the principle of Luke 16:10. How you handle money in small daily decisions reveals the character you will bring to large financial decisions. Are you honest about what you spend? Do you keep your financial commitments? Do you live within your means or consistently beyond them?\n\nBefore marriage, full financial disclosure is an act of love and respect. It means sharing not only your assets but your debts, your credit history, your spending patterns, your relationship with money growing up. These conversations are uncomfortable but essential. Financial stress is one of the leading causes of marital breakdown. The couple who can talk honestly about money before marriage is building on solid ground.' },
      { day: 7, theme: 'Rest & Reflection', verse: 'Psalm 46:10', prompt: 'What has surprised you most about each other this week? What are you most grateful for?', devotional: 'The first week of your premarital journey has covered a great deal of ground — the foundations of marriage, the nature of love, communication, conflict, forgiveness, and finances. These are not small topics. Each one deserves far more than a single day\'s reflection, and you will return to all of them across your life together.\n\nToday is an invitation to stop and simply be together — not to cover more material or resolve more questions, but to rest in the relationship itself. There is a particular gift in being known — in having someone see you clearly, including the parts you are not proud of, and choose you anyway. That is what you are choosing in each other.\n\nBe still together today. Resist the pressure to be productive or to fill the silence. Let there be room for gratitude — for the specific, concrete things you appreciate about this person, for the journey you are on together, for the God who brought you to this point.\n\nMarriage is not primarily a problem to be solved or a project to be completed. It is a covenant to be lived — slowly, faithfully, through ordinary days as well as extraordinary ones. The practices you establish now — of reflection, of gratitude, of honest conversation, of shared prayer — will sustain you through everything that lies ahead. Return to them whenever you feel lost.' },
      { day: 8, theme: 'Faith Foundations', verse: 'Deuteronomy 6:5-7', prompt: 'How do you envision faith functioning in your home? Who leads spiritually, and how?', devotional: 'The Shema — "Hear, O Israel: The Lord our God, the Lord is one. You shall love the Lord your God with all your heart and with all your soul and with all your might" — is the central confession of Jewish faith. What follows it in Deuteronomy 6 is equally significant: these words, Moses says, are to be on your heart, and you shall teach them diligently to your children, speaking of them when you sit in your house and when you walk by the way.\n\nFaith was never meant to be a private, individual affair. It was designed to be transmitted — through the rhythms of daily life, through the conversations of ordinary days, through the practices of a household ordered around the love of God. The home is the primary place where faith is formed.\n\nFor a couple preparing for marriage, this raises important questions about how faith will function in your shared life. Will you pray together regularly? Will you attend church together? How will you handle differences in practice or theological conviction? Who will lead spiritually, and what does that leadership look like in practice?\n\nThese conversations are best had before marriage rather than after, when the patterns of your shared life are still being formed. A home where both partners are committed to pursuing God together — not perfectly, but genuinely — is a home built on the most solid foundation available. Let that commitment be explicit between you.' },
      { day: 9, theme: 'Family of Origin', verse: 'Genesis 2:24', prompt: 'What patterns from your family of origin do you want to replicate? Which do you want to leave behind?', devotional: 'We do not come to marriage as blank slates. We come as people shaped by decades of family experience — the families we grew up in, with their particular ways of handling conflict, expressing affection, celebrating holidays, managing money, talking about faith. These patterns are so deeply ingrained that we often do not see them as patterns at all. They simply feel like "how things are."\n\nMarriage is the collision of two family systems. Two sets of unspoken rules, two sets of assumptions about what is normal, two sets of wounds and gifts and habits meet in the shared space of a home. The adjustment required is substantial, and it takes years rather than months. Couples who expect to be perfectly synchronized by the end of the honeymoon are setting themselves up for unnecessary disappointment.\n\nThe instruction to leave father and mother is not a rejection of family. It is a recognition that a new family is being formed — one that will develop its own patterns, its own rhythms, its own culture. The best of what each partner brings from their family of origin becomes part of that new culture. The patterns that were harmful are consciously interrupted.\n\nThis requires self-awareness — the willingness to examine what you carry and evaluate it honestly. It helps to have conversations with your partner about your families — not to criticize, but to understand. The person who grew up in a family that never expressed emotions verbally is not broken; they simply need to learn a new language. Compassion and patience are the tools for that learning.' },
      { day: 10, theme: 'Roles & Expectations', verse: 'Ephesians 5:21', prompt: 'What are your expectations about roles in marriage — household responsibilities, decision-making, career? Have you said these out loud?', devotional: 'Ephesians 5 is one of the most discussed and debated passages in the New Testament, and it is easy to become so focused on the debates that we miss the verse that grounds the entire section: "submitting to one another out of reverence for Christ." The posture Paul describes is mutual — a shared orientation toward the other\'s wellbeing that flows from a shared reverence for God.\n\nExpectations about roles in marriage are among the most powerful sources of conflict, precisely because they are often unexamined and unstated. We absorb them from our families, from culture, from our own personalities, and we carry them into marriage assuming our partner shares them — only to discover, sometimes years in, that they do not.\n\nThe husband who assumes his wife will handle all domestic responsibilities because that is how his family functioned, married to the wife who assumed they would split everything equally because that is what she witnessed — this couple is not experiencing a failure of love. They are experiencing a failure of expectation alignment. The fix is honest conversation, not more effort.\n\nBefore marriage, make your expectations explicit. Not as demands, but as conversations. What do you each assume about who will cook, clean, manage finances, lead spiritually, make major decisions? Where do your assumptions align? Where do they diverge? The couple who can have these conversations before the wedding is far better prepared than the couple who discovers the divergences after it.' },
      ...Array.from({ length: 30 }, (_, j) => {
        const i = j + 10;
        const themes = ['Intimacy','Children & Parenting','Service & Mission','Rest & Reflection','Prayer Together','Extended Family','Friendship','Vocation','Community & Church','Gratitude','Rest & Reflection','Jealousy & Trust','Grief & Loss','Joy & Celebration','Weakness & Vulnerability','Ambition & Contentment','Hospitality','Rest & Reflection','Spiritual Warfare','Legacy','Disappointment','Patience','Money & Generosity','Sabbath','Rest & Reflection','Forgiveness (Revisited)','Dreams','Covenant','The Wedding','Ready'];
        const verses = ['Song of Solomon 8:6-7','Psalm 127:3','Matthew 20:26-28','Ruth 1:16-17','Matthew 18:20','Exodus 20:12','Proverbs 17:17','Colossians 3:23-24','Hebrews 10:24-25','1 Thessalonians 5:18','Song of Solomon 2:16','Proverbs 31:11','John 11:35','Nehemiah 8:10','2 Corinthians 12:9','Philippians 4:11-12','Romans 12:13','Genesis 1:31','Ephesians 6:12','Psalm 78:4-7','Lamentations 3:22-23','Romans 5:3-5','2 Corinthians 9:7','Exodus 20:8-10','Ephesians 3:17-19','Matthew 18:21-22','Proverbs 16:9','Malachi 2:14','John 2:1-2','Ecclesiastes 4:9-12'];
        const prompts = ['How do you both approach physical and emotional intimacy? What boundaries and expectations need to be discussed?','Do you want children? How many? What does parenting mean to each of you, and how were you parented?','How do you envision your marriage serving others? What is the mission of your household?','Ruth\'s commitment to Naomi is one of Scripture\'s most beautiful pictures of covenant love. How does it speak to your commitment to each other?','Do you pray together regularly? What makes it easy or hard? Commit to a simple daily prayer practice.','How will you honor both sets of parents while establishing your own household? Where might tension arise?','Are you genuinely friends? What do you enjoy doing together? What does your friendship need to thrive?','How will you support each other\'s work and callings? What happens if careers conflict or one of you needs to sacrifice for the other?','Which church will you attend together? How will you be involved, not just attendees?','Name five specific things you are grateful for about your partner. Say them out loud to each other.','\"I am my beloved\'s and my beloved is mine.\" Sit with the beauty of belonging to each other. What does it mean to truly belong to another person?','Are there areas where trust needs to be built or repaired? What does trust look like in practice for each of you?','How do you each handle grief? Have you talked about how to support each other through loss?','What brings each of you joy? How will you protect time for celebration and delight in your marriage?','What are your greatest weaknesses? Can you be honest with each other about the places where you struggle most?','What are your ambitions for your life together? Where might ambition become destructive, and how will you guard against it?','What does a hospitable home look like to each of you? Who will you welcome, and how?','God looked at what He had made and called it very good. Look at your relationship together today and name what is very good about it.','Do you think of your marriage as having a spiritual enemy? How do you pray for protection over your relationship?','What legacy do you want your marriage to leave? What do you hope your children and grandchildren will say about you?','Have you disappointed each other? How did you handle it? How do you want to handle it in the future?','Where are you being asked to be patient with each other right now? What would it mean to embrace that patience as formation?','Have you established a practice of giving together? What does generosity look like in your financial life?','Do you practice Sabbath? What would it look like to protect one day a week for rest and worship together?','Pray Paul\'s prayer over your relationship today — that you would be rooted and grounded in love, and know the love of Christ that surpasses knowledge.','Peter asks how many times he must forgive. Jesus says seventy-seven times — meaning always. Is there anything that has accumulated between you that needs fresh forgiveness?','What are your biggest dreams for your life together? Have you shared them fully? What would it take to pursue them?','Marriage is described as a covenant. What does it mean to you that your vows are covenant words — binding before God and your community?','Jesus\' first miracle was at a wedding. What does it mean that He chose to begin His public ministry at a celebration of marriage?','You have reached the end of this journey. What has God prepared in your hearts? What are you most ready for?'];
        const devotionals = ['The Song of Solomon is one of the most surprising books in the Bible — an extended celebration of romantic and physical love that pulls no punches in its descriptions of longing and desire. Its presence in the canon is a theological statement: the physical love between a husband and wife is not merely tolerated by God. It is celebrated by Him.\n\nIntimacy in marriage encompasses far more than the physical, though the physical is a real and important part of it. Emotional intimacy — the willingness to be known, to be vulnerable, to share the interior life — is the soil in which physical intimacy grows.\n\nFor couples preparing for marriage, honest conversations about intimacy are important and often neglected. What are your expectations? What has shaped your understanding of sexuality? Are there wounds from the past that will affect your experience of intimacy?\n\nThese conversations may feel awkward. Have them anyway. The couple who can speak openly about intimacy before marriage is building the communication skills that will sustain it after.','Children are described in Psalm 127 as a heritage from the Lord — but also as arrows in a warrior\'s quiver, implying purpose and the kind of intentional shaping that arrows require. Parenting is not simply the biological production of children. It is the deliberate, costly, joyful work of forming human beings.\n\nFor couples preparing for marriage, conversations about children are essential. The couple where one person deeply wants children and the other does not is facing a fundamental incompatibility that no amount of love can fully resolve.\n\nBeyond whether to have children, there are questions about how to parent them. What values do you want to transmit? How will faith be taught? How will you protect your marriage in the midst of the all-consuming demands of raising children?\n\nThere are no perfect parents, and there are no perfect answers in advance. But couples who have talked honestly about parenting before marriage enter it with a shared framework.','Jesus overturns the world\'s definition of greatness: "Whoever would be great among you must be your servant." He models it — washing feet, touching lepers, dying for those who rejected Him.\n\nA Christian marriage is not merely a private arrangement between two people. It is a witness — a small community ordered around the values of the kingdom, open to the world around it.\n\nBefore marriage, ask: What is the mission of our household? Beyond building a comfortable life together, what are we for? Who will be welcome in our home?\n\nCouples who share a sense of outward purpose — who understand their marriage as existing not just for themselves but for the world — tend to build something more resilient and more joyful.','Today is a rest day. Ruth\'s words — "Where you go, I will go" — capture what marriage asks of us: commitment made before the outcome is known.\n\nPause today and simply be in the covenant you are choosing. You cannot see the future. You do not know what hardships lie ahead. The vow you are preparing to make is not a prediction. It is a declaration about how you intend to face the future — together, with God as your witness.\n\nBe still. Be grateful. Be present to each other today without agenda or pressure. Let the relationship itself be the thing you are tending.','Couples who pray together regularly build something very difficult to build any other way. Prayer requires vulnerability — you cannot pray dishonestly for long, and genuine prayer reveals the interior life in ways ordinary conversation does not.\n\nMany couples find shared prayer difficult at first. It can feel awkward or exposing. These feelings are worth pushing through. The awkwardness diminishes with practice, and what remains is one of the most intimate experiences available in marriage.\n\nCommit today to a simple, sustainable shared prayer practice. Five minutes in the morning. A brief prayer before bed. Start small and build from there. The practice will shape your marriage in ways you cannot currently anticipate.','Honor your father and your mother — the only commandment with a promise. But marriage complicates this, because the instruction to leave father and mother exists in tension with the instruction to honor them.\n\nFor many couples, extended family is one of the most persistent sources of tension in marriage. Holidays, child-rearing decisions, financial assistance, emotional enmeshment — these are the places where the leaving required by Genesis 2:24 is tested most severely.\n\nThis does not require confrontation or distance. It requires clarity — between you as a couple about what your boundaries are. You are not rejecting your families by establishing your own household. You are doing exactly what God designed you to do.','The friendship at the heart of a good marriage is one of its most precious and often most neglected dimensions. There is a quality of ease in genuine friendship distinct from romantic passion — the ability to simply be together without performance or agenda.\n\nCouples who lose their friendship — who become co-managers of a household but no longer enjoy each other\'s company — have lost something essential. The friendship must be tended. It requires time together that is not about logistics or problem-solving.\n\nAsk yourself today: Are we friends? Do I genuinely enjoy spending time with this person? What do we like doing together? These questions are worth returning to throughout your marriage.','Whatever you do, work heartily, as for the Lord. Paul\'s instruction is a theology of work in miniature — work done faithfully, with integrity, for the good of others, is an act of worship.\n\nFor couples, two people with two sets of gifts and callings must build a life that honors both. In some seasons, one partner\'s vocation will take precedence. In others, it will be reversed. The couple who approaches this with mutual support will navigate it far better than the one who does not.\n\nHow will you support each other\'s callings across a lifetime? What sacrifices are you each willing to make for the other\'s flourishing?','A couple who attempts to live their faith in isolation from a community of believers is attempting something the New Testament never envisages. The Christian life was designed for community — for the accountability, encouragement, shared worship, and mutual service that happen when believers gather regularly.\n\nFor couples, the choice of church community is significant. It is not primarily about preference. It is a question of where you will be known, where you will serve, where your children will be formed.\n\nBeyond attendance, consider involvement. What gifts do you bring? How will you use them together in service of your church community?','Give thanks in all circumstances. Paul\'s instruction is radical in scope — not in some circumstances, not in the good ones only, but in all of them.\n\nOne of the subtlest erosions of long-term relationship is the disappearance of expressed gratitude. The things that once delighted us become so familiar that we stop noticing them. And what we do not notice, we do not appreciate.\n\nMake a practice of expressing gratitude to your partner — specifically and regularly. Not just "I\'m grateful for you" in the abstract, but specific observations. Specific gratitude is a form of paying attention, and paying attention is a form of love.','Three weeks into this journey, you have covered a great deal of ground. Today is a day to rest in the simplest and most profound reality: you belong to each other.\n\nSet aside the work of preparation and simply enjoy each other. Cook a meal together. Sit in silence. Remember why you are doing all of this — not to complete a devotional or check a box, but because this person beside you is someone you want to spend your life with.\n\nThe preparation you are doing matters. But beneath it is a simpler truth: you love each other, and you are choosing to love each other faithfully for the rest of your lives.','Trust in marriage is built through consistent behavior over time — through honesty in small things and large ones, through following through on commitments, through transparency.\n\nJealousy is trust\'s shadow. A certain kind of jealousy is appropriate — the sense that this relationship is precious and worth protecting. But jealousy that becomes controlling is a sign that trust has broken down.\n\nBefore marriage, ask honestly: Are there areas where trust has been compromised? The couple who addresses these honestly, however painfully, is building something that can last.','Jesus wept. In the face of death and grief, the Son of God who could raise the dead first stopped and wept. He did not bypass the grief. He entered it.\n\nMarriage will take you into grief. The losses that come across a lifetime — the deaths of parents and friends, the miscarriages, the failed dreams — are not exceptions to marriage. They are part of it.\n\nAsk each other today: How do you grieve? What do you need from a partner in seasons of loss? Understanding each other\'s grief patterns now will make you better equipped when the inevitable losses come.','The joy of the Lord is your strength. Joy is not the same as happiness, which depends on circumstances. Joy is the deep gladness that exists alongside grief, alongside difficulty, alongside ordinary tedium. It can be cultivated.\n\nIn marriage, joy requires intentional protection. The demands of life are not malicious, but they are persistent. Without deliberate effort, the celebration and delight of early relationship get crowded out by the necessary and urgent.\n\nProtect joy in your marriage. Celebrate anniversaries extravagantly. Make room for laughter and play and adventure. The couple who has learned to celebrate together has a resource that will carry them through the seasons when celebration does not come naturally.','My grace is sufficient for you, for my power is made perfect in weakness. In marriage, the exposure of weakness is inevitable. You cannot share a life with someone without eventually showing them your limitations, your struggles, your failures.\n\nVulnerability is one of the great gifts of marriage. To be known — fully, including the parts you are not proud of — and to be loved anyway is one of the most healing experiences available to a human being.\n\nAsk each other today: Do I feel safe being weak with you? Is this a relationship where I can admit failure and find grace?','I have learned to be content. Contentment is not a disposition you are born with. It is a discipline, acquired through practice — choosing gratitude over complaint, the present moment over the imagined future.\n\nAmbition is not inherently wrong. The problem comes when it becomes the organizing principle of life, when it produces a restlessness that makes the present always insufficient.\n\nFor couples, ambition requires navigation. Two people with two sets of ambitions must find a way to honor both. It requires the wisdom to know when enough is enough.','Show hospitality — a word that literally means "love of strangers." The home you are building is not only for you. It is a resource. The warmth, the food, the space, the stability you create can be extended to others.\n\nFor couples, hospitality requires negotiation. Different people have different capacities for social engagement. A sustainable practice of hospitality is one that both partners can embrace without resentment.\n\nDecide together what hospitality will look like in your home — not the maximum you could theoretically manage, but a realistic practice that fits your personalities and your season of life.','God saw everything He had made and called it very good. On this fourth rest day, the invitation is to look at what is being built between you and to see it as God sees it — with delight.\n\nWhat is very good about your relationship? Not theoretically, but actually — the specific, particular goodness of this person and this partnership. Name these things today, to each other and to God.\n\nGratitude is not passive. It is a practice that shapes how we see. The couple who regularly names what is good is choosing to let the good be as real as the difficult.','We do not wrestle against flesh and blood, but against the cosmic powers over this present darkness. There is an enemy who opposes what God is building, and he is not indifferent to a couple committed to loving each other and God well.\n\nPraying together for your marriage is an act of spiritual warfare. So is confessing sin to one another. So is filling your home with worship and Scripture.\n\nDo you pray specifically for the protection and blessing of this covenant? The couple who takes the spiritual dimension of their marriage seriously is the couple who fights for it on the right level.','We will tell to the coming generation the glorious deeds of the Lord. A marriage is one of the primary links in that chain of transmission.\n\nThe legacy of a marriage is not primarily its accomplishments. It is the quality of love that was lived within it, the faith that was practiced, the way the couple handled hardship and forgave each other and served others.\n\nName your legacy today, to each other and to God. Couples who have articulated what they are building tend to build it more intentionally.','The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning. Jeremiah writes these words sitting in the rubble of a destroyed city — choosing, with extraordinary effort, to orient himself toward the faithfulness of God.\n\nDisappointment is one of the most spiritually significant experiences in marriage. Your partner will disappoint you — not because they are especially bad but because they are human.\n\nThe alternative to cynicism is the path of Jeremiah — acknowledging disappointment honestly, grieving it genuinely, and then returning to the mercies that are new every morning.','Suffering produces endurance, and endurance produces character, and character produces hope. The virtues that matter most are not produced by easy circumstances. They are produced by circumstances that require something of us.\n\nPatience is one of the fruits of the Spirit that most obviously requires adversity to grow. You cannot become patient in conditions that never test your patience.\n\nAsk each other today where patience is being required. And then ask: What would it mean to embrace this season of patience not as something to endure, but as the very instrument God is using to form us?','God loves a cheerful giver. For couples, generosity is both a financial practice and a spiritual discipline. It reveals what you believe about ownership, about security, about the sufficiency of God\'s provision.\n\nEstablishing a practice of giving together early in marriage is one of the most formative things a couple can do. It ensures that giving is a first fruit, not an afterthought.\n\nDiscuss generosity today. What does it mean for your household to be a generous household? Who will you give to? How much? And what is the spirit in which you will give it?','Remember the Sabbath day, to keep it holy. The fourth commandment commands not action but cessation — not something to do but something to stop doing.\n\nFor couples, shared Sabbath is one of the most countercultural and life-giving practices available. The couple who guards one day a week for worship and rest is building a rhythm that will sustain them across decades.\n\nWhat would Sabbath look like for you? The question is whether you are building into your shared life the weekly rhythm of rest that God designed you for.','On this fifth rest day, the invitation is simply to pray — not with a list of things to accomplish, but with the desire to know more of the love Paul describes: love that has breadth and length and height and depth, that surpasses knowledge.\n\nPray for each other today. Pray that each of you would know, at the deepest level, that you are loved by God. And pray that your love for each other would be an overflow of that deeper love — rooted and grounded in the One who loved you first.','Not seven times, but seventy-seven times. We revisit forgiveness near the end of this journey because forgiveness is not a topic you address once and leave behind. It is the ongoing practice that makes long-term love possible.\n\nThe practice of regular, ongoing forgiveness — clearing the smaller accumulations before they become significant — is one of the most important hygiene practices available to a marriage.\n\nIs there anything between you right now that needs to be freshly forgiven? Bring it into the open today, gently and without accusation, and let it be released.','The heart of man plans his way, but the Lord establishes his steps. Dreaming together is one of the great pleasures of early partnership. Do not rush past this stage or treat it as impractical. The dreams you share now will shape the decisions you make across decades.\n\nAt the same time, dreams require discernment. Not every dream is compatible with every other dream. The wisdom is in the conversation — naming the dreams honestly, holding them before God, and discerning together what to pursue.\n\nShare your biggest dreams today. Let the conversation be as open and unhurried as the future currently is.','The Lord was witness between you and the wife of your youth. The word "covenant" is the same used throughout the Old Testament for God\'s binding commitments to His people. It is not a contract. It is a promise whose binding force depends on the character of the one who made it.\n\nThis is terrifying. It is also liberating. The marriage built on covenant does not need to earn its security every day. The security is already established by the promise that was made.\n\nSit with the weight of what you are about to do. You are about to make a covenant. Let that weight be real — not as a burden, but as the solid ground on which love can safely be built.','Jesus\' first miracle was performed at a wedding in Cana. When the wine ran out, He transformed water into wine of surpassing quality. It is a strange and beautiful way to begin a ministry.\n\nThe choice is not accidental. Jesus, who would describe Himself as the Bridegroom, begins His public work by blessing a marriage. He provides abundance where there was lack. He is present at a celebration whose participants do not even know He is there.\n\nAs your wedding approaches, invite Jesus into it. Ask Him to do for your marriage what He did at Cana — to provide what you lack, to transform the ordinary into something extraordinary.','Two are better than one — but three is better still. The third strand is God Himself, woven into the covenant from the beginning.\n\nYou have spent forty days preparing your hearts for marriage. You have explored its foundations and its demands, its joys and its costs. You are not finished — no couple is ever finished — but you have begun well.\n\nWhat are you ready for? The answer is: more than you know. You are ready for the joy that exceeds what you can currently imagine, the growth that comes only through challenge, the depth of love that takes decades to develop. Go. Begin. The adventure of covenant love awaits you.'];
        return {
          day: i + 1,
          theme: themes[j],
          verse: verses[j],
          prompt: prompts[j],
          devotional: devotionals[j],
        };
      }),
    ],
  },
  {
    id: 'humility',
    title: 'The Posture of Grace',
    subtitle: 'A Journey into Humility',
    description: 'Pride quietly erodes the closest relationships. Over 30 days, explore what genuine humility looks like in daily life — in conflict, in service, in how you see yourself and each other.',
    icon: '',
    duration: 30,
    color: '#5C7A5C',
    days: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      theme: HUMILITY_THEMES[i],
      verse: HUMILITY_VERSES[i],
      prompt: HUMILITY_PROMPTS[i],
      devotional: `Day ${i + 1} of the humility journey. In Philippians 2, Paul calls us to "do nothing from selfish ambition or conceit, but in humility count others more significant than yourselves." This is not a call to self-erasure but to a reordering — a deliberate choice to place the other before the self, not because the self does not matter, but because love moves in that direction.\n\nHumility is the virtue that makes all other virtues sustainable. Without it, patience becomes condescension, generosity becomes performance, and love becomes a transaction. With it, even the smallest acts of kindness become genuine gifts, offered without expectation of return.\n\nIn the context of your relationship, today's theme — ${HUMILITY_THEMES[i]} — invites you to examine where pride operates quietly, shaping your responses before you are even aware of it. This is the work of formation: slow, patient, and ultimately transforming.\n\nAsk God today to show you one specific place where humility is needed, and to give you the grace to offer it.`,
    })),
  },
  {
    id: 'growing-together',
    title: 'Growing Together',
    subtitle: 'A Journey of Shared Formation',
    description: 'Every couple grows — the question is whether you grow apart or together. Over 45 days, cultivate the spiritual practices, honest conversations, and shared rhythms that help two people become more fully themselves and more deeply one.',
    icon: '',
    duration: 45,
    color: '#4A7C6B',
    days: Array.from({ length: 45 }, (_, i) => ({
      day: i + 1,
      theme: GROWING_THEMES[i],
      verse: GROWING_VERSES[i],
      prompt: GROWING_PROMPTS[i],
      devotional: `This is day ${i + 1} of Growing Together. The journey of two people becoming more fully themselves while growing more deeply connected is one of the most demanding and most rewarding works available to human beings.\n\nToday's theme — ${GROWING_THEMES[i]} — points to something essential in the journey of shared formation. Growth is rarely comfortable. It requires the willingness to be honest about where you are, patient with how slow the process is, and trusting enough to stay in it even when the progress is invisible.\n\nThe God who began a good work in you will bring it to completion. That promise extends to the work He is doing in your relationship. You are not finished. You are becoming. And the becoming is in good hands.\n\nAsk God today to show you one small step toward the growth He is inviting you into — and to give you the courage and grace to take it together.`,
    })),
  },
  {
    id: 'prayer',
    title: 'A House of Prayer',
    subtitle: 'Learning to Pray Together',
    description: 'Prayer together is one of the most intimate and most neglected practices in Christian relationships. Over 30 days, move from awkward to honest, from performative to genuine, building a shared prayer life that sustains your relationship.',
    icon: '',
    duration: 30,
    color: '#6B5B8A',
    days: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      theme: PRAYER_THEMES[i],
      verse: PRAYER_VERSES[i],
      prompt: PRAYER_PROMPTS[i],
      devotional: `Day ${i + 1} of A House of Prayer. There is no more intimate act available to a couple than praying together — and no act more commonly avoided. The reasons are many: it feels performative, it requires vulnerability, it exposes the gap between who we are and who we want to appear to be.\n\nBut prayer, at its heart, is simply honest conversation with God. The couple who can speak honestly to God together is the couple who has found a depth of intimacy that very few relationships ever reach. Not because prayer is magic, but because the God who hears is real, and His presence in the conversation changes everything.\n\nToday's theme — ${PRAYER_THEMES[i]} — invites you into a particular dimension of the life of prayer. Take it at whatever pace you can manage. Five minutes of honest prayer together is worth more than an hour of performance.\n\nGod meets you where you are. Start there.`,
    })),
  },
  {
    id: 'lent',
    title: 'Lent Together',
    subtitle: '40 Days Toward Easter',
    description: 'Walk the 40-day Lenten journey together as a couple — from Ash Wednesday to Easter. Daily devotionals, reflections, and shared prayer to prepare your hearts for the resurrection.',
    icon: '',
    duration: 40,
    color: '#A0522D',
    days: Array.from({ length: 40 }, (_, i) => ({
      day: i + 1,
      theme: LENT_THEMES[i],
      verse: LENT_VERSES[i],
      prompt: LENT_PROMPTS[i],
      devotional: `Day ${i + 1} of Lent. The forty days between Ash Wednesday and Easter have been observed by Christians for nearly two thousand years as a season of preparation — of fasting, prayer, repentance, and renewal — in anticipation of the celebration of Christ\'s resurrection.\n\nToday\'s theme — ${LENT_THEMES[i]} — is an invitation to enter more deeply into the Lenten journey together. Not as a performance of piety, but as a genuine reckoning with what it means to follow a crucified and risen Lord.\n\nThe cross changes everything. It changes how we see ourselves — as people loved at incalculable cost. It changes how we see each other — as those for whom Christ also died. And it changes how we love — from the overflow of having been loved first.\n\nBring whatever you are carrying into this day and lay it at the foot of the cross. You will find it is held there, and you will find that you are, too.`,
    })),
  },
];

export const getPathwayById = (id: string): Pathway | undefined => {
  return PATHWAYS.find(p => p.id === id);
};