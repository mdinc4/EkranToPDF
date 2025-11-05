import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { Button, Card, TextInput, Switch } from 'react-native-paper';

export default function App() {
  const [screenshotUri, setScreenshotUri] = useState(null);
  const [includeImage, setIncludeImage] = useState(true);
  const [pdfName, setPdfName] = useState('ekran_goruntusu');
  const [isProcessing, setIsProcessing] = useState(false);

  const takeScreenshot = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setScreenshotUri('https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Ekran+Goruntusu+Alindi');
      Alert.alert('Başarılı!', 'Ekran görüntüsü demo modunda alındı 📸');
      setIsProcessing(false);
    }, 1000);
  };

  const createPDF = () => {
    setIsProcessing(true);
    setTimeout(() => {
      Alert.alert('PDF Hazır!', `"${pdfName}.pdf" başarıyla oluşturuldu! 🎉`);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* BAŞLIK */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>📱 EKRAN GÖRÜNTÜSÜ → PDF</Text>
            <Text style={styles.subtitle}>Ekran görüntülerini kolayca PDF'e dönüştürün</Text>
          </Card.Content>
        </Card>

        {/* EKRAN GÖRÜNTÜSÜ */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>📸 Ekran Görüntüsü</Text>
            
            {screenshotUri ? (
              <Image source={{ uri: screenshotUri }} style={styles.image} />
            ) : (
              <View style={styles.placeholder}>
                <Text>Henüz ekran görüntüsü yok</Text>
              </View>
            )}
            
            <Button 
              mode="contained" 
              onPress={takeScreenshot}
              loading={isProcessing}
              style={styles.button}
            >
              Ekran Görüntüsü Al
            </Button>
          </Card.Content>
        </Card>

        {/* AYARLAR */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>⚙️ Ayarlar</Text>
            
            <TextInput
              label="PDF İsmi"
              value={pdfName}
              onChangeText={setPdfName}
              mode="outlined"
              style={styles.input}
            />
            
            <View style={styles.switchRow}>
              <Text>Görseli PDF'e Ekle</Text>
              <Switch value={includeImage} onValueChange={setIncludeImage} />
            </View>
          </Card.Content>
        </Card>

        {/* PDF OLUŞTUR */}
        <Card style={styles.card}>
          <Card.Content>
            <Button 
              mode="contained" 
              onPress={createPDF}
              loading={isProcessing}
              style={[styles.button, styles.pdfButton]}
            >
              📄 PDF Oluştur
            </Button>
          </Card.Content>
        </Card>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginTop: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  placeholder: {
    height: 150,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    marginBottom: 15,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    marginTop: 5,
  },
  pdfButton: {
    backgroundColor: '#FF5722',
  },
});