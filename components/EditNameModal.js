import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';

export default function EditNameModal({ visible, initialName = '', onCancel, onSave }) {
  const [value, setValue] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const MAX = 40;

  useEffect(() => { if (visible) setValue(initialName); }, [visible, initialName]);

  const handleSave = async () => {
    const v = value.trim();
    if (!v || v.length > MAX) return;
    try {
      setSaving(true);
      await onSave(v);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Edit name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={value}
            onChangeText={setValue}
            maxLength={MAX}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
          <View style={styles.row}>
            <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={onCancel} disabled={saving}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.save, (!value.trim() || saving) && styles.disabled]}
              onPress={handleSave}
              disabled={!value.trim() || saving}
            >
              {saving ? <ActivityIndicator /> : <Text style={styles.saveText}>Save</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  sheet: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1.5, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 14, gap: 10 },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  cancel: { backgroundColor: '#eee' },
  save: { backgroundColor: '#DE1E26' },
  cancelText: { fontSize: 16 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.6 },
});
