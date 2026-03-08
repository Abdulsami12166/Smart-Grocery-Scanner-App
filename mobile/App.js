import { StatusBar } from 'expo-status-bar';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { apiClient } from './src/api/client';
import { SectionCard } from './src/components/SectionCard';

const initialForm = { name: '', category: '', expiryDate: '' };

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [form, setForm] = useState(initialForm);
  const [inventory, setInventory] = useState([]);
  const [alerts, setAlerts] = useState({ expiringSoon: [], lowStock: [] });
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => scannedBarcode && form.name, [scannedBarcode, form.name]);

  useEffect(() => {
    BarCodeScanner.requestPermissionsAsync().then(({ status }) => {
      setHasPermission(status === 'granted');
    });
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      const [inventoryRes, alertsRes, recipesRes] = await Promise.all([
        apiClient.get('/products'),
        apiClient.get('/products/alerts'),
        apiClient.get('/products/recipes/suggestions')
      ]);

      setInventory(inventoryRes.data);
      setAlerts(alertsRes.data);
      setRecipes(recipesRes.data);
    } catch (error) {
      Alert.alert('API Error', 'Unable to load data. Check backend URL in src/api/client.js');
    }
  };

  const handleBarCodeScanned = ({ data }) => {
    setScannedBarcode(data);
  };

  const submitScannedItem = async () => {
    if (!canSubmit) {
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/products/scan', {
        barcode: scannedBarcode,
        name: form.name,
        category: form.category,
        expiryDate: form.expiryDate || undefined,
        quantity: 1
      });
      setForm(initialForm);
      setScannedBarcode('');
      await refreshData();
      Alert.alert('Saved', 'Item scanned and added to inventory.');
    } catch (error) {
      Alert.alert('Save Failed', 'Please verify product details and backend connection.');
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.center}><Text>Requesting camera permission...</Text></View>;
  }

  if (hasPermission === false) {
    return <View style={styles.center}><Text>No access to camera</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Smart Grocery Scanner</Text>

        <SectionCard title="1) Scan barcode">
          <BarCodeScanner
            onBarCodeScanned={handleBarCodeScanned}
            style={styles.scanner}
          />
          <Text style={styles.meta}>Scanned barcode: {scannedBarcode || 'None yet'}</Text>
        </SectionCard>

        <SectionCard title="2) Add product details">
          <TextInput
            style={styles.input}
            placeholder="Product name (e.g., Milk)"
            value={form.name}
            onChangeText={(name) => setForm((prev) => ({ ...prev, name }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Category (optional)"
            value={form.category}
            onChangeText={(category) => setForm((prev) => ({ ...prev, category }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Expiry date YYYY-MM-DD (optional)"
            value={form.expiryDate}
            onChangeText={(expiryDate) => setForm((prev) => ({ ...prev, expiryDate }))}
          />
          <Button title={loading ? 'Saving...' : 'Save item'} onPress={submitScannedItem} disabled={!canSubmit || loading} />
        </SectionCard>

        <SectionCard title="Inventory">
          <FlatList
            data={inventory}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Text style={styles.listItem}>• {item.name} ({item.quantity} {item.unit})</Text>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No items yet.</Text>}
          />
        </SectionCard>

        <SectionCard title="Expiry & Low Stock Alerts">
          <Text style={styles.subHeader}>Expiring Soon</Text>
          {alerts.expiringSoon?.length ? alerts.expiringSoon.map((item) => (
            <Text style={styles.listItem} key={`exp-${item._id}`}>• {item.name} expires on {new Date(item.expiryDate).toDateString()}</Text>
          )) : <Text style={styles.empty}>No expiry alerts.</Text>}

          <Text style={styles.subHeader}>Low Stock</Text>
          {alerts.lowStock?.length ? alerts.lowStock.map((item) => (
            <Text style={styles.listItem} key={`low-${item._id}`}>• {item.name}: {item.quantity} left</Text>
          )) : <Text style={styles.empty}>No low stock alerts.</Text>}
        </SectionCard>

        <SectionCard title="Recipe Suggestions">
          {recipes.length ? recipes.map((recipe) => (
            <View key={recipe.name} style={styles.recipeBlock}>
              <Text style={styles.recipeName}>{recipe.name}</Text>
              <Text style={styles.meta}>In stock: {recipe.ingredientsInStock.join(', ') || 'None'}</Text>
              <Text style={styles.meta}>Missing: {recipe.missingIngredients.join(', ') || 'None'}</Text>
            </View>
          )) : <Text style={styles.empty}>No recipe suggestions yet.</Text>}
        </SectionCard>

        <Button title="Refresh" onPress={refreshData} />
        {loading ? <ActivityIndicator style={{ marginTop: 12 }} /> : null}
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f4f7' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  scanner: { width: '100%', height: 180, borderRadius: 12, overflow: 'hidden' },
  input: {
    borderWidth: 1,
    borderColor: '#d5dbe1',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fafafa'
  },
  meta: { color: '#5f6b7a', marginTop: 8 },
  listItem: { marginBottom: 6 },
  empty: { color: '#808b98' },
  subHeader: { marginTop: 8, fontWeight: '600' },
  recipeBlock: { marginBottom: 10 },
  recipeName: { fontWeight: '600' }
});
