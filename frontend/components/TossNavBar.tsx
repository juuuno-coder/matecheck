import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, StyleSheet, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Txt, colors } from '@toss/tds-react-native';

interface ExitModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function ExitModal({ visible, onClose, onConfirm }: ExitModalProps) {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Txt typography="t4" fontWeight="bold" color={colors.grey900} style={{ marginBottom: 24, textAlign: 'center' }}>
                        룸메이트체크를 종료할까요?
                    </Txt>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Txt typography="t5" fontWeight="semibold" color={colors.grey700}>취소</Txt>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                            <Txt typography="t5" fontWeight="semibold" color={colors.white}>종료하기</Txt>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

interface TossNavBarProps {
    title?: string;
    canGoBack?: boolean;
}

export default function TossNavBar({ title, canGoBack }: TossNavBarProps) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);

    const handleExit = () => {
        setModalVisible(true);
    };

    const confirmExit = () => {
        setModalVisible(false);
        BackHandler.exitApp();
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.toolbar}>
                <View style={styles.leftContainer}>
                    {canGoBack && (
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                            <Ionicons name="chevron-back" size={24} color={colors.grey900} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.titleContainer}>
                    <Txt typography="t5" fontWeight="semibold" color={colors.grey900} style={{ textAlign: 'center' }}>
                        {title || 'RoommateCheck'}
                    </Txt>
                </View>

                <View style={styles.rightContainer}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="ellipsis-horizontal" size={24} color={colors.grey400} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleExit} style={styles.iconButton}>
                        <Ionicons name="close" size={24} color={colors.grey900} />
                    </TouchableOpacity>
                </View>
            </View>

            <ExitModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onConfirm={confirmExit}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.grey100,
    },
    toolbar: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    titleContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: -1,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 80,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: 80,
        gap: 8,
    },
    iconButton: {
        padding: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: 300,
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: colors.grey100,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmButton: {
        flex: 1,
        backgroundColor: colors.blue500,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
});


interface ExitModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function ExitModal({ visible, onClose, onConfirm }: ExitModalProps) {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>룸메이트체크를 종료할까요?</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>취소</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                            <Text style={styles.confirmButtonText}>종료하기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

interface TossNavBarProps {
    title?: string;
    canGoBack?: boolean;
}

export default function TossNavBar({ title, canGoBack }: TossNavBarProps) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);

    const handleExit = () => {
        setModalVisible(true);
    };

    const confirmExit = () => {
        setModalVisible(false);
        // On Android, this exits the app.
        // On iOS, this typically does nothing or minimizes, but apple doesn't allow programatic exit.
        // For "Apps in Toss", it's likely a WebView closure or similar.
        BackHandler.exitApp();
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.toolbar}>
                <View style={styles.leftContainer}>
                    {canGoBack && (
                        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                            <Ionicons name="chevron-back" size={24} color="#191F28" />
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={styles.title}>{title || 'RoommateCheck'}</Text>

                <View style={styles.rightContainer}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="ellipsis-horizontal" size={24} color="#B0B8C1" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleExit} style={styles.iconButton}>
                        <Ionicons name="close" size={24} color="#191F28" />
                    </TouchableOpacity>
                </View>
            </View>

            <ExitModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onConfirm={confirmExit}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F2F4F6',
    },
    toolbar: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
        color: '#191F28',
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        zIndex: -1, // Ensure buttons are clickable
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 80, // Space reservation
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: 80, // Space reservation
        gap: 8,
    },
    iconButton: {
        padding: 4,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: 300,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#191F28',
        marginBottom: 24,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#F2F4F6',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#4E5968',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButton: {
        flex: 1,
        backgroundColor: '#0064FF', // Toss Blue
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
