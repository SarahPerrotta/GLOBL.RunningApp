import React from 'react';
import { View, Text, Switch } from 'react-native';
import { useIncognito } from './IncognitoContext';

export default function IncognitoToggle({ label = 'Incognito mode' }) {
  const { incognito, setIncognito } = useIncognito();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={{ fontWeight: '700' }}>{label}</Text>
      <Switch value={incognito} onValueChange={setIncognito} />
    </View>
  );
}
