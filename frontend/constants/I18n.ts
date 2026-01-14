export type Language = 'ko' | 'en';

export const translations = {
    ko: {
        onboarding: {
            step1: "1단계 / 3단계",
            step2: "2단계 / 3단계",
            step3: "3단계 / 3단계",
            profile_title: "보금자리에서 사용할\n닉네임을 알려주세요.",
            nickname_label: "나의 호칭",
            nickname_placeholder: "예: 든든한 메이트, 귀요미 막내",
            next_button: "반가워요, 다음으로!",
            avatar_hint: "아이콘을 누르면 캐릭터가 바뀌어요",
            choice_title: "새로운 보금자리를 만들까요,\n아니면 초대를 받으셨나요?",
            create_nest_btn: "새로운 보금자리 만들기",
            create_nest_desc: "메이트들과 함께 공유할\n새로운 공간을 직접 만듭니다.",
            join_nest_btn: "초대 수락하기 (링크/코드)",
            join_nest_desc: "이미 만들어진 보금자리가 있다면\n초대 정보를 확인하고 한 배를 탑니다.",
            create_title: "우리들만의 멋진\n보금자리 이름을 정해주세요.",
            nest_name_label: "보금자리 이름",
            nest_name_placeholder: "예: 우리집, 꿀잼 보드게임팀",
            start_btn: "보금자리 시작하기",
            join_title: "초대 받은 코드를\n여기에 입력해주세요.",
            invite_code_label: "초대 코드",
            invite_code_placeholder: "예: ABC-123",
            invite_hint: "* 초대 링크를 누르면 코드가 자동으로 입력됩니다.",
            join_request_btn: "보금자리 입장 요청하기",
            waiting_title: "입장 요청을 보냈어요!",
            waiting_desc: "기존 메이트가 수락하면\n이 보금자리의 모든 정보를 볼 수 있습니다.\n조금만 기다려주세요.",
            back_to_main: "메인으로 돌아가기"
        },
        tabs: {
            home: "홈",
            mission: "미션",
            calendar: "일정",
            goal: "목표",
            settings: "설정"
        },
        home: {
            greeting_morning: "좋은 아침이에요! ☀️",
            greeting_afternoon: "활기찬 오후예요! ☕️",
            greeting_evening: "수고했어요, 오늘 하루! 🌙",
            mate_count: "보금자리 메이트 {count}명",
            briefing_title: "오늘의 체크리스트",
            upcoming_events: "돌아오는 일정 📅",
            no_events: "예정된 일정이 없어요.",
            view_all: "전체 일정 보기"
        },
        settings: {
            title: "설정",
            account_section: "계정 설정",
            profile_edit: "프로필 수정",
            notifications: "알림 설정",
            nest_section: "보금자리 관리",
            nest_info: "보금자리 정보",
            member_mgmt: "멤버 관리",
            invite_code: "초대 코드",
            join_requests: "가입 요청",
            logout: "로그아웃",
            confirm_logout: "정말 로그아웃 하시겠습니까?",
            cancel: "취소"
        }
    },
    en: {
        onboarding: {
            step1: "Step 1 / 3",
            step2: "Step 2 / 3",
            step3: "Step 3 / 3",
            profile_title: "What nickname will you\nuse in your MateHome?",
            nickname_label: "My Nickname",
            nickname_placeholder: "e.g. Bestie, Super Mate",
            next_button: "Nice to meet you!",
            avatar_hint: "Tap the icon to change your character",
            choice_title: "Create a new MateHome\nor join an existing one?",
            create_nest_btn: "Create New MateHome",
            create_nest_desc: "Set up a new shared space\nfor you and your mates.",
            join_nest_btn: "Join via Link/Code",
            join_nest_desc: "If a MateHome already exists,\nenter the code to join your mates.",
            create_title: "Give your MateHome\na cool name.",
            nest_name_label: "MateHome Name",
            nest_name_placeholder: "e.g. Dream House, Fun Team",
            start_btn: "Start MateHome",
            join_title: "Please enter the\ninvitation code.",
            invite_code_label: "Invitation Code",
            invite_code_placeholder: "e.g. ABC-123",
            invite_hint: "* The code is automatically entered if you use a link.",
            join_request_btn: "Request to Join",
            waiting_title: "Request Sent!",
            waiting_desc: "You can view the MateHome\nafter a current mate approves you.\nPlease wait a moment.",
            back_to_main: "Back to Main"
        },
        tabs: {
            home: "Home",
            mission: "Mission",
            calendar: "Calendar",
            goal: "Goal",
            settings: "Settings"
        },
        home: {
            greeting_morning: "Good morning! ☀️",
            greeting_afternoon: "Good afternoon! ☕️",
            greeting_evening: "Good night! 🌙",
            mate_count: "{count} Mates in MateHome",
            briefing_title: "Today's Checklist",
            upcoming_events: "Upcoming Events 📅",
            no_events: "No upcoming events.",
            view_all: "View All"
        },
        settings: {
            title: "Settings",
            account_section: "Account",
            profile_edit: "Edit Profile",
            notifications: "Notifications",
            nest_section: "MateHome Management",
            nest_info: "MateHome Info",
            member_mgmt: "Members",
            invite_code: "Invite Code",
            join_requests: "Join Requests",
            logout: "Logout",
            confirm_logout: "Are you sure you want to logout?",
            cancel: "Cancel"
        }
    }
};
