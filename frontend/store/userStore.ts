import { create } from 'zustand';
import { API_URL } from '../constants/Config';
import { AVATARS } from '../constants/data';

// --- Interfaces ---

export interface User {
    id: string;
    nickname: string;
    avatarId: number;
    memberType?: 'human' | 'baby' | 'pet' | 'plant' | 'ai';
}

export interface Todo {
    id: string;
    title: string;
    isCompleted: boolean;
    assignees: User[]; // Full user objects
    completedBy?: string; // memberId
    createdAt: string;
    repeat: 'none' | 'daily' | 'weekly' | 'monthly';
    imageUrl?: string;
}

export interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    type: 'event' | 'vote';
    votes: { [date: string]: string[] }; // date -> array of userIds who voted
    creatorId: string;
    imageUrl?: string;
    endDate?: string; // Optional end date for events
    time?: string; // Optional time (e.g. "19:00")
}

export interface BudgetTransaction {
    id: string;
    title: string;
    amount: number;
    category: 'food' | 'housing' | 'living' | 'transport' | 'etc';
    date: string;
    payerId: string; // memberId
}
export interface Goal {
    id: string;
    type: 'vision' | 'year' | 'month' | 'week';
    title: string;
    current: number;
    target: number;
    unit: string;
}

interface UserState {
    // Profile
    nickname: string;
    avatarId: number;
    userEmail: string;

    // Nest
    nestName: string;
    nestTheme: number;
    nestId: string;
    inviteCode: string;
    isLoggedIn: boolean;
    hasSeenTutorial: boolean;

    // Features - Todo
    todos: Todo[];

    // Features - Calendar
    events: CalendarEvent[];

    // Features - Budget
    budgetGoal: number;
    transactions: BudgetTransaction[];

    // Features - Goals
    goals: Goal[];

    // Features - Members
    members: User[];

    // Localization
    language: 'ko' | 'en';

    // Actions
    setProfile: (nickname: string, avatarId: number) => void;
    setEmail: (email: string) => void;
    setNest: (nestName: string, nestTheme: number, inviteCode?: string, nestId?: string) => void;
    setMembers: (members: User[]) => void;
    logout: () => void;
    completeTutorial: () => void;
    addMember: (nickname: string, avatarId: number) => void;
    addManagedMember: (nickname: string, avatarId: number, memberType: string) => Promise<void>;

    // Join Requests
    pendingRequests: User[];
    fetchJoinRequests: () => Promise<void>;
    approveJoinRequest: (userId: string) => Promise<void>;
    setLanguage: (lang: 'ko' | 'en') => void;

    // Todo Actions
    addTodo: (title: string, assigneeIds?: string[], repeat?: 'none' | 'daily' | 'weekly' | 'monthly', imageUrl?: string) => void;
    toggleTodo: (id: string, memberId: string) => void;
    deleteTodo: (id: string) => void;

    // Account Actions
    updatePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean, error?: string }>;
    deleteAccount: (password: string) => Promise<{ success: boolean, error?: string }>;

    // Calendar Actions
    addEvent: (title: string, date: string, imageUrl?: string, endDate?: string, time?: string) => void;
    voteEvent: (eventId: string, date: string, userId: string) => void;
    deleteEvent: (id: string) => void;

    // Budget Actions
    addTransaction: (title: string, amount: number, category: BudgetTransaction['category']) => void;

    // Goal Actions
    addGoal: (type: Goal['type'], title: string, target: number, unit: string) => void;
    incrementGoalProgress: (id: string) => void;
    decrementGoalProgress: (id: string) => void;
    deleteGoal: (id: string) => void;

    // Sync Actions
    syncMissions: () => Promise<void>;
    syncEvents: () => Promise<void>;
    syncGoals: () => Promise<void>;
    syncTransactions: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
    // Initial State
    nickname: '',
    avatarId: 0,
    userEmail: '',
    nestName: '',
    nestTheme: 0,
    nestId: '',
    inviteCode: '',
    isLoggedIn: false,
    hasSeenTutorial: false,

    members: [],
    todos: [],
    events: [],
    budgetGoal: 0,
    transactions: [],
    goals: [],

    pendingRequests: [],
    language: 'ko',

    // Actions
    setProfile: (nickname, avatarId) => set({ nickname, avatarId }),
    setEmail: (userEmail) => set({ userEmail }),
    setNest: (nestName, nestTheme, inviteCode = '', nestId = '') => set({ nestName, nestTheme, inviteCode, nestId, isLoggedIn: true }),
    setMembers: (members) => set({ members }),
    completeTutorial: () => set({ hasSeenTutorial: true }),

    fetchJoinRequests: async () => {
        const { nestId } = useUserStore.getState();
        if (!nestId) return;
        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/requests`);
            if (response.ok) {
                const data = await response.json();
                set({
                    pendingRequests: data.map((u: any) => ({
                        id: String(u.id),
                        nickname: u.nickname,
                        avatarId: u.avatar_id
                    }))
                });
            }
        } catch (error) { console.error(error); }
    },

    approveJoinRequest: async (userId) => {
        const { nestId } = useUserStore.getState();
        if (!nestId) return;
        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/approve/${userId}`, {
                method: 'PATCH'
            });
            if (response.ok) {
                const data = await response.json();
                set((state: UserState) => ({
                    pendingRequests: state.pendingRequests.filter(u => u.id !== userId),
                    members: data.members.map((m: any) => ({
                        id: String(m.id),
                        nickname: m.nickname,
                        avatarId: m.avatar_id
                    }))
                }));
            }
        } catch (error) { console.error(error); }
    },

    setLanguage: (lang) => set({ language: lang }),

    logout: () => set({
        nickname: '', avatarId: 0, userEmail: '', nestName: '', nestTheme: 0, nestId: '', inviteCode: '', isLoggedIn: false,
        todos: [],
        events: [],
        transactions: [],
        goals: [],
        goals: [],
        pendingRequests: [],
        language: 'ko',
        hasSeenTutorial: false // Reset tutorial on logout? Maybe yes for demo purposes.
    }),
    addMember: (nickname, avatarId) => set((state: UserState) => ({
        members: [...state.members, { id: Math.random().toString(36).substr(2, 9), nickname, avatarId }]
    })),

    updatePassword: async (currentPassword, newPassword, confirmPassword) => {
        const { userEmail } = useUserStore.getState();
        try {
            const response = await fetch(`${API_URL}/users/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userEmail,
                    current_password: currentPassword,
                    new_password: newPassword,
                    new_password_confirmation: confirmPassword
                })
            });
            const data = await response.json();
            if (response.ok) return { success: true };
            return { success: false, error: data.errors ? data.errors.join(", ") : data.error };
        } catch (error) { return { success: false, error: "Network error" }; }
    },

    deleteAccount: async (password) => {
        const { userEmail } = useUserStore.getState();
        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, password })
            });
            if (response.ok) {
                useUserStore.getState().logout();
                return { success: true };
            }
            const data = await response.json();
            return { success: false, error: data.error };
        } catch (error) { return { success: false, error: "Network error" }; }
    },

    addManagedMember: async (nickname, avatarId, memberType) => {
        const { nestId } = useUserStore.getState();
        if (!nestId) return;
        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname, avatar_id: avatarId, member_type: memberType })
            });
            if (response.ok) {
                const data = await response.json();
                set({
                    members: data.members.map((m: any) => ({
                        id: String(m.id),
                        nickname: m.nickname,
                        avatarId: m.avatar_id,
                        memberType: m.member_type
                    }))
                });
            }
        } catch (error) { console.error(error); }
    },

    // Type-safe Todo Actions
    addTodo: async (title: string, assigneeIds: string[] = ['0'], repeat: 'none' | 'daily' | 'weekly' | 'monthly' = 'none', imageUrl?: string) => {
        const { nestId, members } = useUserStore.getState();
        if (nestId) {
            try {
                const response = await fetch(`${API_URL}/nests/${nestId}/missions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        mission: {
                            title,
                            assigned_to: null, // Deprecated in backend for assignee_ids, but keeping for compatibility if needed? No, backend ignores it or we send both.
                            // Backend expects assignee_ids
                            assignee_ids: assigneeIds,
                            repeat,
                            image_url: imageUrl,
                            is_completed: false
                        }
                    })
                });
                const data = await response.json();
                if (response.ok) {
                    set((state: UserState) => ({
                        todos: [
                            {
                                id: String(data.id),
                                title: data.title,
                                isCompleted: data.is_completed,
                                assignees: data.assignees ? data.assignees.map((a: any) => ({
                                    id: String(a.id), nickname: a.nickname, avatarId: a.avatar_id, memberType: a.member_type
                                })) : [],
                                createdAt: data.created_at,
                                repeat: data.repeat,
                                imageUrl: data.image_url
                            },
                            ...state.todos
                        ]
                    }));
                }
            } catch (error) { console.error(error); }
        } else {
            // Fallback to local
            const selectedMembers = members.filter(m => assigneeIds.includes(m.id));
            set((state: UserState) => ({
                todos: [
                    {
                        id: Math.random().toString(36).substr(2, 9),
                        title,
                        isCompleted: false,
                        assignees: selectedMembers,
                        createdAt: new Date().toISOString(),
                        repeat,
                        imageUrl
                    },
                    ...state.todos
                ]
            }));
        }
    },

    toggleTodo: async (id, memberId) => {
        const { nestId, todos } = useUserStore.getState();
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        const nextStatus = !todo.isCompleted;

        if (nestId) {
            try {
                const response = await fetch(`${API_URL}/nests/${nestId}/missions/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        mission: { is_completed: nextStatus }
                    })
                });
                if (response.ok) {
                    set((state: UserState) => ({
                        todos: state.todos.map((t) =>
                            t.id === id
                                ? { ...t, isCompleted: nextStatus, completedBy: nextStatus ? memberId : undefined }
                                : t
                        ).sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted))
                    }));
                }
            } catch (error) { console.error(error); }
        } else {
            set((state: UserState) => ({
                todos: state.todos.map((t) =>
                    t.id === id
                        ? { ...t, isCompleted: nextStatus, completedBy: nextStatus ? memberId : undefined }
                        : t
                ).sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted))
            }));
        }
    },

    deleteTodo: async (id) => {
        const { nestId } = useUserStore.getState();
        if (nestId) {
            try {
                const response = await fetch(`${API_URL}/nests/${nestId}/missions/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    set((state: UserState) => ({ todos: state.todos.filter(todo => todo.id !== id) }));
                }
            } catch (error) { console.error(error); }
        } else {
            set((state: UserState) => ({ todos: state.todos.filter(todo => todo.id !== id) }));
        }
    },

    // Calendar Actions
    addEvent: async (title: string, date: string, imageUrl?: string, endDate?: string, time?: string) => {
        const { nestId, avatarId } = useUserStore.getState();
        if (nestId) {
            try {
                const response = await fetch(`${API_URL}/nests/${nestId}/calendar_events`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        calendar_event: {
                            title, date, end_date: endDate,
                            creator_id: avatarId, image_url: imageUrl,
                            event_type: 'event',
                            time // Added time
                        }
                    })
                });
                const data = await response.json();
                if (response.ok) {
                    set((state: UserState) => ({
                        events: [...state.events, {
                            id: String(data.id),
                            title: data.title,
                            date: data.date,
                            endDate: data.end_date,
                            type: data.event_type || 'event',
                            votes: {},
                            creatorId: String(data.creator_id),
                            imageUrl: data.image_url,
                            time: data.time
                        }]
                    }));
                }
            } catch (error) { console.error(error); }
        } else {
            set((state: UserState) => ({
                events: [...state.events, {
                    id: Math.random().toString(36).substr(2, 9),
                    title, date, endDate, type: 'vote',
                    votes: { [date]: [String(state.avatarId)] },
                    creatorId: String(state.avatarId),
                    imageUrl,
                    time
                }]
            }));
        }
    },

    voteEvent: (eventId, date, userId) => set((state: UserState) => ({
        events: state.events.map(evt => {
            if (evt.id !== eventId) return evt;
            const currentVotes = evt.votes[date] || [];
            const hasVoted = currentVotes.includes(userId);

            return {
                ...evt,
                votes: {
                    ...evt.votes,
                    [date]: hasVoted
                        ? currentVotes.filter(id => id !== userId) // Toggle off
                        : [...currentVotes, userId] // Toggle on
                }
            };
        })
    })),

    deleteEvent: async (id) => {
        const { nestId } = useUserStore.getState();
        if (nestId) {
            try {
                const response = await fetch(`${API_URL}/nests/${nestId}/calendar_events/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    set((state: UserState) => ({ events: state.events.filter(e => e.id !== id) }));
                }
            } catch (error) { console.error(error); }
        } else {
            set((state: UserState) => ({ events: state.events.filter(e => e.id !== id) }));
        }
    },

    // Budget Actions
    addTransaction: async (title, amount, category) => {
        const { nestId, avatarId } = useUserStore.getState();
        if (nestId) {
            try {
                const response = await fetch(`${API_URL}/nests/${nestId}/transactions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        transaction: {
                            title, amount, category,
                            date: new Date().toISOString().split('T')[0],
                            payer_id: avatarId
                        }
                    })
                });
                const data = await response.json();
                if (response.ok) {
                    set((state: UserState) => ({
                        transactions: [
                            {
                                id: String(data.id),
                                title: data.title,
                                amount: Number(data.amount),
                                category: data.category,
                                date: data.date,
                                payerId: String(data.payer_id)
                            },
                            ...state.transactions
                        ]
                    }));
                }
            } catch (error) { console.error(error); }
        } else {
            set((state: UserState) => ({
                transactions: [
                    {
                        id: Math.random().toString(36).substr(2, 9),
                        title, amount, category,
                        date: new Date().toISOString().split('T')[0],
                        payerId: String(state.avatarId)
                    },
                    ...state.transactions
                ]
            }));
        }
    },

    // Goal Actions
    addGoal: async (type, title, target, unit) => {
        const { nestId } = useUserStore.getState();
        if (nestId) {
            try {
                const response = await fetch(`${API_URL}/nests/${nestId}/goals`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        goal: { goal_type: type, title, target, unit, current: 0 }
                    })
                });
                const data = await response.json();
                if (response.ok) {
                    set((state: UserState) => ({
                        goals: [
                            ...state.goals,
                            {
                                id: String(data.id),
                                type: data.goal_type,
                                title: data.title,
                                current: data.current,
                                target: data.target,
                                unit: data.unit
                            }
                        ]
                    }));
                }
            } catch (error) { console.error(error); }
        } else {
            set((state: UserState) => ({
                goals: [
                    ...state.goals,
                    {
                        id: Math.random().toString(36).substr(2, 9),
                        type, title, current: 0, target, unit
                    }
                ]
            }));
        }
    },

    incrementGoalProgress: async (id) => {
        const { nestId, goals } = useUserStore.getState();
        const goal = goals.find(g => g.id === id);
        if (!goal || goal.current >= goal.target) return;

        const nextVal = goal.current + 1;

        if (nestId) {
            try {
                const response = await fetch(`${API_URL}/nests/${nestId}/goals/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ goal: { current: nextVal } })
                });
                if (response.ok) {
                    set((state: UserState) => ({
                        goals: state.goals.map(g => g.id === id ? { ...g, current: nextVal } : g)
                    }));
                }
            } catch (error) { console.error(error); }
        } else {
            set((state: UserState) => ({
                goals: state.goals.map(g => g.id === id ? { ...g, current: nextVal } : g)
            }));
        }
    },

    decrementGoalProgress: async (id) => {
        const { nestId, goals } = useUserStore.getState();
        const goal = goals.find(g => g.id === id);
        if (!goal || goal.current <= 0) return;

        const nextVal = goal.current - 1;

        if (nestId) {
            try {
                const response = await fetch(`${API_URL}/nests/${nestId}/goals/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ goal: { current: nextVal } })
                });
                if (response.ok) {
                    set((state: UserState) => ({
                        goals: state.goals.map(g => g.id === id ? { ...g, current: nextVal } : g)
                    }));
                }
            } catch (error) { console.error(error); }
        } else {
            set((state: UserState) => ({
                goals: state.goals.map(g => g.id === id ? { ...g, current: nextVal } : g)
            }));
        }
    },

    deleteGoal: async (id) => {
        const { nestId } = useUserStore.getState();
        if (nestId) {
            try {
                const response = await fetch(`${API_URL}/nests/${nestId}/goals/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    set((state: UserState) => ({ goals: state.goals.filter(g => g.id !== id) }));
                }
            } catch (error) { console.error(error); }
        } else {
            set((state: UserState) => ({ goals: state.goals.filter(g => g.id !== id) }));
        }
    },

    // Sync Implementations
    syncMissions: async () => {
        const { nestId } = useUserStore.getState();
        if (!nestId) return;
        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/missions`);
            const data = await response.json();
            if (response.ok) {
                // Map backend to frontend keys if necessary
                const mapped = data.map((m: any) => ({
                    id: String(m.id),
                    title: m.title,
                    isCompleted: m.is_completed,
                    assignees: m.assignees ? m.assignees.map((a: any) => ({
                        id: String(a.id), nickname: a.nickname, avatarId: a.avatar_id, memberType: a.member_type
                    })) : [],
                    repeat: m.repeat || 'none',
                    imageUrl: m.image_url,
                    createdAt: m.created_at
                }));
                set({ todos: mapped });
            }
        } catch (error) { console.error(error); }
    },

    syncEvents: async () => {
        const { nestId } = useUserStore.getState();
        if (!nestId) return;
        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/calendar_events`);
            const data = await response.json();
            if (response.ok) {
                const mapped = data.map((e: any) => ({
                    id: String(e.id),
                    title: e.title,
                    date: e.date,
                    endDate: e.end_date,
                    time: e.time,
                    type: e.event_type || 'event',
                    creatorId: String(e.creator_id),
                    imageUrl: e.image_url,
                    votes: {} // Voting logic needs dedicated table later
                }));
                set({ events: mapped });
            }
        } catch (error) { console.error(error); }
    },

    syncGoals: async () => {
        const { nestId } = useUserStore.getState();
        if (!nestId) return;
        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/goals`);
            const data = await response.json();
            if (response.ok) {
                const mapped = data.map((g: any) => ({
                    id: String(g.id),
                    type: g.goal_type,
                    title: g.title,
                    current: g.current,
                    target: g.target,
                    unit: g.unit
                }));
                set({ goals: mapped });
            }
        } catch (error) { console.error(error); }
    },

    syncTransactions: async () => {
        const { nestId } = useUserStore.getState();
        if (!nestId) return;
        try {
            const response = await fetch(`${API_URL}/nests/${nestId}/transactions`);
            const data = await response.json();
            if (response.ok) {
                const mapped = data.map((t: any) => ({
                    id: String(t.id),
                    title: t.title,
                    amount: Number(t.amount),
                    category: t.category,
                    date: t.date,
                    payerId: String(t.payer_id)
                }));
                set({ transactions: mapped });
            }
        } catch (error) { console.error(error); }
    },
}));
