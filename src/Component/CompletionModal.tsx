import { Modal, Text, View, StyleSheet, Button } from "react-native";

interface ICompletionModalProps {
    visible: boolean
    onClose: () => void
    timerDetails?: any
}

const CompletionModal = ({ visible, onClose, timerDetails = "" }: ICompletionModalProps) => (
    <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => onClose()}
    >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Congratulations!</Text>
                <Text style={styles.modalMessage}>
                    You completed the timer: {timerDetails}
                </Text>
                <Button title="Close" onPress={() => onClose()} />
            </View>
        </View>
    </Modal>
);


const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        alignItems: "center",
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    modalMessage: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
    },
});

export default CompletionModal