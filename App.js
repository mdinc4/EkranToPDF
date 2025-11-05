import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  Image,
  Platform 
} from 'react-native';
import { Button, Card, TextInput, Switch, ActivityIndicator } from 'react-native-paper';
import { captureScreen } from 'react-native-view-shot';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function App() {
  const [screenshotUri, setScreenshotUri] = useState(null);
  const [includeImage, setIncludeImage] = useState(true);
  const [pdfName, setPdfName] = useState('ekran_goruntusu');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');

  // İzinleri kontrol et
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin gerekli', 'Galeriye erişim için izin gerekiyor!');
        return false;
      }
    }
    return true;
  };

  // 1. EKRAN GÖRÜNTÜSÜ AL
  const takeScreenshot = async () => {
    try {
      setIsProcessing(true);
      
      // Ekran görüntüsü al
      const uri = await captureScreen({
        format: 'png',
        quality: 0.8,
      });
      
      setScreenshotUri(uri);
      Alert.alert('Başarılı!', 'Ekran görüntüsü alındı 📸');
      
    } catch (error) {
      Alert.alert('Hata', 'Ekran görüntüsü alınamadı: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. GALERİDEN RESİM SEÇ
  const pickImageFromGallery = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setScreenshotUri(result.assets[0].uri);
        Alert.alert('Başarılı!', 'Resim galeriden seçildi 🖼️');
      }
    } catch (error) {
      Alert.alert('Hata', 'Resim seçilemedi: ' + error.message);
    }
  };

  // 3. KAMERA İLE FOTOĞRAF ÇEK
  const takePhotoWithCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin gerekli', 'Kamera kullanımı için izin gerekiyor!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setScreenshotUri(result.assets[0].uri);
        Alert.alert('Başarılı!', 'Fotoğraf çekildi 📷');
      }
    } catch (error) {
      Alert.alert('Hata', 'Kamera açılamadı: ' + error.message);
    }
  };

  // 4. METİN ÇIKAR (OCR Simülasyonu)
  const extractTextFromImage = async () => {
    if (!screenshotUri) {
      Alert.alert('Uyarı', 'Önce bir görsel seçin!');
      return;
    }

    setIsProcessing(true);
    
    // Gerçek OCR yerine simülasyon
    setTimeout(() => {
      const sampleText = `
ÇIKARILAN METİNLER:

• Tarih: ${new Date().toLocaleDateString('tr-TR')}
• Saat: ${new Date().toLocaleTimeString('tr-TR')}

ÖRNEK METİN:
Bu bir demo uygulamasıdır.
Gerçek OCR özelliği için:
- Tesseract.js entegrasyonu
- Türkçe dil paketi
gerekli olacaktır.

Uygulama özellikleri:
✓ Ekran görüntüsü alma
✓ Galeriden resim seçme
✓ Kamera ile fotoğraf çekme
✓ PDF oluşturma
      `;
      
      setExtractedText(sampleText);
      Alert.alert('Başarılı!', 'Metinler çıkarıldı 🔍');
      setIsProcessing(false);
    }, 2000);
  };

  // 5. PDF OLUŞTUR
  const createPDF = async () => {
    if (!screenshotUri && includeImage) {
      Alert.alert('Uyarı', 'PDF oluşturmak için önce bir görsel ekleyin!');
      return;
    }

    setIsProcessing(true);

    try {
      // PDF oluşturma simülasyonu
      setTimeout(() => {
        Alert.alert(
          'PDF Hazır! 🎉', 
          `"${pdfName}.pdf" başarıyla oluşturuldu!\n\nGerçek uygulamada:\n• HTML-to-PDF kütüphanesi\n• Cloud storage\n• Paylaşım özelliği\nentegre edilecektir.`,
          [
            {
              text: 'Tamam',
              style: 'default'
            }
          ]
        );
        setIsProcessing(false);
      }, 2000);

    } catch (error) {
      Alert.alert('Hata', 'PDF oluşturulamadı: ' + error.message);
      setIsProcessing(false);
    }
  };

  // 6. RESMİ SİL
  const clearImage = () => {
    setScreenshotUri(null);
    setExtractedText('');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* BAŞLIK */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>📱 EKRAN GÖRÜNTÜSÜ → PDF</Text>
            <Text style={styles.subtitle}>Ekran görüntüsü al • Resim ekle • PDF oluştur</Text>
          </Card.Content>
        </Card>

        {/* GÖRSEL BÖLÜMÜ */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>🖼️ Görsel</Text>
            
            {screenshotUri ? (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: screenshotUri }} 
                  style={styles.image}
                  resizeMode="contain"
                />
                <Button 
                  mode="outlined" 
                  onPress={clearImage}
                  style={styles.clearButton}
                  icon="delete"
                >
                  Resmi Sil
                </Button>
              </View>
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>Henüz görsel yok</Text>
                <Text style={styles.placeholderSubtext}>
                  Ekran görüntüsü alın veya galeriden resim seçin
                </Text>
              </View>
            )}
            
            {/* RESİM SEÇME BUTONLARI */}
            <View style={styles.buttonRow}>
              <Button 
                mode="contained" 
                onPress={takeScreenshot}
                loading={isProcessing}
                disabled={isProcessing}
                style={[styles.button, styles.primaryButton]}
                icon="monitor-screenshot"
              >
                Ekran Görüntüsü
              </Button>
              
              <Button 
                mode="outlined" 
                onPress={pickImageFromGallery}
                disabled={isProcessing}
                style={styles.button}
                icon="image"
              >
                Galeri
              </Button>
            </View>

            <Button 
              mode="outlined" 
              onPress={takePhotoWithCamera}
              disabled={isProcessing}
              style={styles.button}
              icon="camera"
            >
              Kamera ile Çek
            </Button>
          </Card.Content>
        </Card>

        {/* ÇIKARILAN METİNLER */}
        {extractedText ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>📝 Çıkarılan Metinler</Text>
              <ScrollView style={styles.textContainer}>
                <Text style={styles.extractedText}>{extractedText}</Text>
              </ScrollView>
              <Button 
                mode="outlined" 
                onPress={() => setExtractedText('')}
                style={styles.button}
                icon="text-short"
              >
                Metinleri Temizle
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>🔍 Metin Çıkarma</Text>
              <Button 
                mode="outlined" 
                onPress={extractTextFromImage}
                loading={isProcessing}
                disabled={isProcessing || !screenshotUri}
                style={styles.button}
                icon="ocr"
              >
                Metinleri Çıkar (OCR)
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* AYARLAR */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>⚙️ PDF Ayarları</Text>
            
            <TextInput
              label="PDF Dosya Adı"
              value={pdfName}
              onChangeText={setPdfName}
              mode="outlined"
              style={styles.input}
            />
            
            <View style={styles.switchRow}>
              <Text>Görseli PDF'e Ekle</Text>
              <Switch 
                value={includeImage} 
                onValueChange={setIncludeImage} 
                color="#2196F3"
              />
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
              disabled={isProcessing}
              style={[styles.button, styles.pdfButton]}
              icon="file-pdf-box"
            >
              📄 PDF Oluştur
            </Button>
          </Card.Content>
        </Card>

      </ScrollView>

      {/* LOADING INDICATOR */}
      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>İşlem yapılıyor...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
    marginTop: 4,
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  clearButton: {
    marginTop: 4,
  },
  placeholder: {
    height: 120,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    padding: 16,
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  placeholderSubtext: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  button: {
    marginTop: 6,
  },
  primaryButton: {
    flex: 0.48,
  },
  input: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  pdfButton: {
    backgroundColor: '#FF5722',
  },
  textContainer: {
    maxHeight: 150,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  extractedText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#333',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
});