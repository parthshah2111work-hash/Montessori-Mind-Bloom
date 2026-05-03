import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  TextInput, Modal, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

type HealthTab = 'vaccinations' | 'prescriptions' | 'medicines' | 'growth';

export default function HealthScreen() {
  const colors = useColors();
  const {
    vaccinations, addVaccination, deleteVaccination, updateVaccination,
    prescriptions, addPrescription, deletePrescription,
    medicines, addMedicine, deleteMedicine,
    growthHistory, addGrowthRecord, deleteGrowthRecord,
    profile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<HealthTab>('vaccinations');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<HealthTab | null>(null);

  const [vaxName, setVaxName] = useState('');
  const [vaxDesc, setVaxDesc] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const handleSave = () => {
    if (modalType === 'vaccinations') {
      if (!vaxName || !dosage) return Alert.alert('Required', 'Name and Date are required.');
      if (isEditing && editId) {
        updateVaccination(editId, { name: vaxName, description: vaxDesc, dueDate: new Date(dosage).toISOString() });
      } else {
        addVaccination({ name: vaxName, description: vaxDesc, dueDate: new Date(dosage).toISOString(), isCompleted: false });
      }
    } else if (modalType === 'prescriptions') {
      if (!photoUri) return Alert.alert('Photo Required', 'Please add a photo of the prescription.');
      addPrescription({ date: new Date().toISOString(), doctorName: doctorName || 'Unknown Doctor', notes, photoUri });
    } else if (modalType === 'medicines') {
      if (!medName) return Alert.alert('Required', 'Medicine name is required.');
      addMedicine({ name: medName, dosage, frequency, startDate: new Date().toISOString(), reminders: [] });
    } else if (modalType === 'growth') {
      if (!weight || !height) return Alert.alert('Required', 'Both weight and height are required.');
      addGrowthRecord({ date: new Date().toISOString(), weight: parseFloat(weight), height: parseFloat(height) });
    }
    resetForm();
    setModalVisible(false);
  };

  const resetForm = () => {
    setVaxName(''); setVaxDesc(''); setDoctorName(''); setNotes('');
    setPhotoUri(null); setMedName(''); setDosage(''); setFrequency('');
    setWeight(''); setHeight(''); setIsEditing(false); setEditId(null);
  };

  const confirmDelete = (id: string, type: HealthTab) => {
    Alert.alert('Delete Entry', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        if (type === 'vaccinations') deleteVaccination(id);
        else if (type === 'prescriptions') deletePrescription(id);
        else if (type === 'medicines') deleteMedicine(id);
        else if (type === 'growth') deleteGrowthRecord(id);
      }},
    ]);
  };

  const renderTab = (tab: HealthTab, label: string, icon: keyof typeof Ionicons.glyphMap) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tabButton, activeTab === tab && { backgroundColor: colors.primary + '18' }]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons name={icon} size={20} color={activeTab === tab ? colors.primary : colors.mutedForeground} />
      <Text style={[styles.tabLabel, { color: activeTab === tab ? colors.primary : colors.mutedForeground }]}>{label}</Text>
    </TouchableOpacity>
  );

  const fmtDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return 'Invalid date'; }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient colors={[colors.muted, colors.background]} style={styles.headerGradient}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Health Library</Text>
            <Text style={[styles.subTitle, { color: colors.mutedForeground }]}>
              Central repository for {profile?.name ?? 'Child'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => { resetForm(); setModalType(activeTab); setModalVisible(true); }}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.tabContainer}>
          {renderTab('vaccinations', 'Vaccines', 'shield-checkmark')}
          {renderTab('prescriptions', 'Records', 'document-text')}
          {renderTab('medicines', 'Meds', 'medical')}
          {renderTab('growth', 'Growth', 'stats-chart')}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {activeTab === 'vaccinations' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Vaccination Schedule</Text>
              <Text style={[styles.countBadge, { backgroundColor: colors.primary + '15', color: colors.primary }]}>
                {vaccinations.filter(v => v.isCompleted).length}/{vaccinations.length}
              </Text>
            </View>
            {vaccinations.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="shield-outline" size={64} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No vaccinations recorded yet.</Text>
              </View>
            ) : vaccinations.map(v => (
              <TouchableOpacity
                key={v.id}
                style={[styles.itemCard, { backgroundColor: colors.card, borderColor: v.isCompleted ? '#10b98130' : colors.border }]}
                onPress={() => {
                  setModalType('vaccinations'); setModalVisible(true);
                  setIsEditing(true); setEditId(v.id);
                  setVaxName(v.name); setVaxDesc(v.description);
                  try { setDosage(new Date(v.dueDate).toISOString().split('T')[0]); } catch { setDosage(''); }
                }}
                onLongPress={() => confirmDelete(v.id, 'vaccinations')}
              >
                <View style={styles.itemHeader}>
                  <View style={styles.itemTitleRow}>
                    <View style={[styles.iconDot, { backgroundColor: v.isCompleted ? '#10b981' : colors.primary }]} />
                    <Text style={[styles.itemName, { color: colors.foreground }]}>{v.name}</Text>
                  </View>
                  <TouchableOpacity onPress={() => updateVaccination(v.id, { isCompleted: !v.isCompleted })}>
                    <Ionicons
                      name={v.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                      size={26}
                      color={v.isCompleted ? '#10b981' : colors.mutedForeground}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.itemSub, { color: colors.mutedForeground }]}>Due: {fmtDate(v.dueDate)}</Text>
                <Text style={[styles.itemDesc, { color: colors.mutedForeground }]} numberOfLines={2}>{v.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'prescriptions' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Doctor Visits & Prescriptions</Text>
            <View style={styles.grid}>
              {prescriptions.length === 0 && (
                <View style={[styles.emptyState, { width: '100%' }]}>
                  <Ionicons name="document-text-outline" size={64} color={colors.mutedForeground} />
                  <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No prescriptions saved yet.</Text>
                </View>
              )}
              {prescriptions.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.gridItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onLongPress={() => confirmDelete(p.id, 'prescriptions')}
                >
                  <Image source={{ uri: p.photoUri }} style={styles.gridImage} />
                  <View style={styles.gridInfo}>
                    <Text style={[styles.gridDate, { color: colors.foreground }]}>{fmtDate(p.date)}</Text>
                    <Text style={[styles.gridDoc, { color: colors.mutedForeground }]}>{p.doctorName}</Text>
                    {p.notes ? <Text style={[styles.gridNotes, { color: colors.mutedForeground }]} numberOfLines={1}>{p.notes}</Text> : null}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'medicines' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Active Medicines</Text>
            {medicines.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="bandage-outline" size={64} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No active medicines added.</Text>
              </View>
            )}
            {medicines.map(m => (
              <View key={m.id} style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemTitleRow}>
                    <Ionicons name="medical" size={18} color={colors.primary} />
                    <Text style={[styles.itemName, { color: colors.foreground, marginLeft: 8 }]}>{m.name}</Text>
                  </View>
                  <TouchableOpacity onPress={() => confirmDelete(m.id, 'medicines')}>
                    <Ionicons name="trash-outline" size={20} color={colors.destructive} />
                  </TouchableOpacity>
                </View>
                <View style={styles.medicineDetails}>
                  <Text style={[styles.itemSub, { color: colors.mutedForeground }]}>Dosage: {m.dosage}</Text>
                  <Text style={[styles.itemSub, { color: colors.mutedForeground }]}>Frequency: {m.frequency}</Text>
                </View>
                <View style={[styles.reminderBadge, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="notifications" size={14} color={colors.primary} />
                  <Text style={[styles.reminderText, { color: colors.primary }]}>Reminder Active</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'growth' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Growth Tracking (WHO Standards)</Text>
            <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.statsCardHeader}>
                <Text style={[styles.statsTitle, { color: colors.foreground }]}>Latest Measurements</Text>
                <Ionicons name="trending-up" size={20} color={colors.primary} />
              </View>
              {growthHistory.length > 0 ? (
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>{growthHistory[growthHistory.length - 1].weight}</Text>
                    <Text style={[styles.statUnit, { color: colors.primary }]}>kg</Text>
                    <Text style={[styles.statLabel2, { color: colors.mutedForeground }]}>Weight</Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>{growthHistory[growthHistory.length - 1].height}</Text>
                    <Text style={[styles.statUnit, { color: colors.primary }]}>cm</Text>
                    <Text style={[styles.statLabel2, { color: colors.mutedForeground }]}>Height</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyStats}>
                  <Text style={{ color: colors.mutedForeground, textAlign: 'center' }}>
                    No growth data yet. Add your first measurement.
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.sectionSubTitle, { color: colors.foreground }]}>Past Logs</Text>
            {growthHistory.length === 0 ? (
              <Text style={{ color: colors.mutedForeground, fontStyle: 'italic', fontFamily: 'Inter_400Regular' }}>Empty history</Text>
            ) : growthHistory.slice().reverse().map(r => (
              <TouchableOpacity
                key={r.id}
                style={[styles.historyItem, { borderBottomColor: colors.border }]}
                onLongPress={() => confirmDelete(r.id, 'growth')}
              >
                <Text style={[styles.historyDate, { color: colors.foreground }]}>{fmtDate(r.date)}</Text>
                <View style={styles.historyValues}>
                  <Text style={[styles.historyVal, { color: colors.foreground }]}>{r.weight}kg</Text>
                  <Text style={{ color: colors.mutedForeground }}>•</Text>
                  <Text style={[styles.historyVal, { color: colors.foreground }]}>{r.height}cm</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.modalContent, { backgroundColor: colors.card }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                {isEditing ? 'Edit' : 'Add'}{' '}
                {modalType === 'vaccinations' ? 'Vaccine' : modalType === 'prescriptions' ? 'Record' : modalType === 'medicines' ? 'Medicine' : 'Growth Entry'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {modalType === 'vaccinations' && (
                <>
                  <TextInput style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="Vaccine Name (e.g. Hepatitis B)" placeholderTextColor={colors.mutedForeground} value={vaxName} onChangeText={setVaxName} />
                  <TextInput style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="Due Date (YYYY-MM-DD)" placeholderTextColor={colors.mutedForeground} value={dosage} onChangeText={setDosage} />
                  <TextInput style={[styles.input, styles.textArea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="Description / Side Effects" placeholderTextColor={colors.mutedForeground} multiline value={vaxDesc} onChangeText={setVaxDesc} />
                </>
              )}
              {modalType === 'prescriptions' && (
                <>
                  <TouchableOpacity style={[styles.photoPicker, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={pickImage}>
                    {photoUri ? (
                      <Image source={{ uri: photoUri }} style={styles.pickedPhoto} />
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <Ionicons name="camera" size={40} color={colors.primary} />
                        <Text style={{ color: colors.mutedForeground, marginTop: 8, fontFamily: 'Inter_400Regular' }}>Capture Prescription</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TextInput style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="Doctor/Clinic Name" placeholderTextColor={colors.mutedForeground} value={doctorName} onChangeText={setDoctorName} />
                  <TextInput style={[styles.input, styles.textArea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="Diagnosis / Special Notes" placeholderTextColor={colors.mutedForeground} multiline value={notes} onChangeText={setNotes} />
                </>
              )}
              {modalType === 'medicines' && (
                <>
                  <TextInput style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="Medicine Name" placeholderTextColor={colors.mutedForeground} value={medName} onChangeText={setMedName} />
                  <TextInput style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="Dosage (e.g. 5ml, 1 tab)" placeholderTextColor={colors.mutedForeground} value={dosage} onChangeText={setDosage} />
                  <TextInput style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="Frequency (e.g. Twice Daily)" placeholderTextColor={colors.mutedForeground} value={frequency} onChangeText={setFrequency} />
                </>
              )}
              {modalType === 'growth' && (
                <View style={styles.growthInputs}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Weight (kg)</Text>
                    <TextInput style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="e.g. 8.5" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" value={weight} onChangeText={setWeight} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Height (cm)</Text>
                    <TextInput style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]} placeholder="e.g. 72" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" value={height} onChangeText={setHeight} />
                  </View>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>{isEditing ? 'Update Record' : 'Create Entry'}</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: { paddingTop: 20, paddingBottom: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  title: { fontSize: 30, fontFamily: 'Inter_700Bold', lineHeight: 34 },
  subTitle: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  addButton: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 15, gap: 6 },
  tabButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  content: { flex: 1, padding: 20 },
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, fontSize: 12, fontFamily: 'Inter_700Bold' },
  sectionSubTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', marginBottom: 10, marginTop: 20 },
  itemCard: { padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  itemTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  itemName: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  itemSub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 4 },
  itemDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  emptyState: { alignItems: 'center', marginVertical: 50, opacity: 0.6 },
  emptyText: { marginTop: 14, fontSize: 15, textAlign: 'center', fontFamily: 'Inter_400Regular' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '47.5%', borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  gridImage: { width: '100%', height: 130, resizeMode: 'cover' },
  gridInfo: { padding: 10 },
  gridDate: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  gridDoc: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  gridNotes: { fontSize: 11, fontStyle: 'italic', marginTop: 4 },
  medicineDetails: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  reminderBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, gap: 6 },
  reminderText: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  statsCard: { padding: 22, borderRadius: 22, borderWidth: 1, marginBottom: 8 },
  statsCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  statsTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 30, fontFamily: 'Inter_700Bold' },
  statUnit: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: -2 },
  statLabel2: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginTop: 8, fontFamily: 'Inter_400Regular' },
  statDivider: { width: 1, height: 40, opacity: 0.5 },
  emptyStats: { padding: 16 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  historyDate: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  historyValues: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  historyVal: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  modalTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.06)', justifyContent: 'center', alignItems: 'center' },
  photoPicker: { height: 180, borderRadius: 20, borderStyle: 'dashed', borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginBottom: 18, overflow: 'hidden' },
  pickedPhoto: { width: '100%', height: '100%' },
  photoPlaceholder: { alignItems: 'center' },
  input: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 15, marginBottom: 14, fontFamily: 'Inter_400Regular' },
  textArea: { height: 90, textAlignVertical: 'top' },
  inputLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold', marginBottom: 6, marginLeft: 2 },
  growthInputs: { flexDirection: 'row', gap: 14 },
  saveButton: { padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  saveButtonText: { color: 'white', fontSize: 16, fontFamily: 'Inter_700Bold' },
});
