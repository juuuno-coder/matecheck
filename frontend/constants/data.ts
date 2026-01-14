export const AVATARS = [
    { id: 'av_1', emoji: '🧑‍💼', label: '성인(남)', image: { uri: 'https://api.dicebear.com/9.x/notionists/png?seed=Felix' } },
    { id: 'av_2', emoji: '👩‍💼', label: '성인(여)', image: { uri: 'https://api.dicebear.com/9.x/notionists/png?seed=Aneka' } },
    { id: 'av_3', emoji: '🧒', label: '아이(남)', image: { uri: 'https://api.dicebear.com/9.x/notionists/png?seed=Mason' } },
    { id: 'av_4', emoji: '👧', label: '아이(여)', image: { uri: 'https://api.dicebear.com/9.x/notionists/png?seed=Sara' } },
    { id: 'av_5', emoji: '🐶', label: '강아지', image: { uri: 'https://api.dicebear.com/9.x/notionists/png?seed=Puppy&backgroundColor=ffdfbf' } },
    { id: 'av_6', emoji: '🐱', label: '고양이', image: { uri: 'https://api.dicebear.com/9.x/notionists/png?seed=Kitty&backgroundColor=b6e3f4' } },
    { id: 'av_7', emoji: '🪴', label: '식물', image: { uri: 'https://api.dicebear.com/9.x/notionists/png?seed=Plant&backgroundColor=d1d4f9' } },
    { id: 'av_8', emoji: '🤖', label: '로봇/AI', image: { uri: 'https://api.dicebear.com/9.x/bottts-neutral/png?seed=MateCheck' } },
];

export const THEMES: Record<string, { color: string, bg: string, emoji: string }> = {
    'theme_cozy': { color: 'bg-orange-100', bg: 'bg-orange-50', emoji: '🧡' },
    'theme_cool': { color: 'bg-blue-100', bg: 'bg-blue-50', emoji: '💙' },
    'theme_nature': { color: 'bg-green-100', bg: 'bg-green-50', emoji: '💚' },
    'theme_dream': { color: 'bg-purple-100', bg: 'bg-purple-50', emoji: '💜' },
};
