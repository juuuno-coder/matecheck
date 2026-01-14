export const AVATARS = [
    // Notionists Style (Defaults)
    { id: 'av_1', emoji: '🧑‍💼', label: '성인(남)', image: { uri: 'https://api.dicebear.com/9.x/notionists/png?seed=Felix' } },
    { id: 'av_2', emoji: '👩‍💼', label: '성인(여)', image: { uri: 'https://api.dicebear.com/9.x/notionists/png?seed=Aneka' } },
    { id: 'av_3', emoji: '🧒', label: '아이(남)', image: { uri: 'https://api.dicebear.com/9.x/notionists/png?seed=Mason' } },
    { id: 'av_4', emoji: '👧', label: '아이(여)', image: { uri: 'https://api.dicebear.com/9.x/notionists/png?seed=Sara' } },
    // Pets & Others
    { id: 'av_5', emoji: '🐶', label: '강아지', image: { uri: 'https://api.dicebear.com/9.x/notionists/png?seed=Puppy&backgroundColor=ffdfbf' } },
    { id: 'av_6', emoji: '🐱', label: '고양이', image: { uri: 'https://api.dicebear.com/9.x/notionists/png?seed=Kitty&backgroundColor=b6e3f4' } },
    { id: 'av_7', emoji: '🪴', label: '식물', image: { uri: 'https://api.dicebear.com/9.x/notionists/png?seed=Plant&backgroundColor=d1d4f9' } },
    { id: 'av_8', emoji: '🤖', label: '로봇/AI', image: { uri: 'https://api.dicebear.com/9.x/bottts-neutral/png?seed=MateCheck' } },
    // Expanded Notionists
    { id: 'av_9', emoji: '👱', label: '청년(남)', image: { uri: 'https://api.dicebear.com/9.x/notionists/png?seed=Jake&backgroundColor=e5e7eb' } },
    { id: 'av_10', emoji: '👱‍♀️', label: '청년(여)', image: { uri: 'https://api.dicebear.com/9.x/notionists/png?seed=Mila&backgroundColor=f3e8ff' } },
    { id: 'av_11', emoji: '🧔', label: '중년(남)', image: { uri: 'https://api.dicebear.com/9.x/notionists/png?seed=Robert&backgroundColor=dbeafe' } },
    { id: 'av_12', emoji: '👵', label: '중년(여)', image: { uri: 'https://api.dicebear.com/9.x/notionists/png?seed=Betty&backgroundColor=ffedd5' } },
    // Fun/Adventurer Style
    { id: 'av_13', emoji: '😎', label: '쿨가이', image: { uri: 'https://api.dicebear.com/9.x/adventurer/png?seed=Alex' } },
    { id: 'av_14', emoji: '🤠', label: '탐험가', image: { uri: 'https://api.dicebear.com/9.x/adventurer/png?seed=Dora' } },
    { id: 'av_15', emoji: '🤓', label: '지니어스', image: { uri: 'https://api.dicebear.com/9.x/adventurer/png?seed=Nerd' } },
    { id: 'av_16', emoji: '🦁', label: '용기', image: { uri: 'https://api.dicebear.com/9.x/adventurer/png?seed=Leo' } },
    // More Robots
    { id: 'av_17', emoji: '👾', label: '8비트', image: { uri: 'https://api.dicebear.com/9.x/bottts-neutral/png?seed=Pixel' } },
    { id: 'av_18', emoji: '👻', label: '유령', image: { uri: 'https://api.dicebear.com/9.x/bottts-neutral/png?seed=Ghost&backgroundColor=000000' } },
];

export const THEMES: Record<string, { color: string, bg: string, emoji: string }> = {
    'theme_cozy': { color: 'bg-orange-100', bg: 'bg-orange-50', emoji: '🧡' },
    'theme_cool': { color: 'bg-blue-100', bg: 'bg-blue-50', emoji: '💙' },
    'theme_nature': { color: 'bg-green-100', bg: 'bg-green-50', emoji: '💚' },
    'theme_dream': { color: 'bg-purple-100', bg: 'bg-purple-50', emoji: '💜' },
};
